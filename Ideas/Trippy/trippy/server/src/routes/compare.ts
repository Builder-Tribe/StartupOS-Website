import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { db, pj } from '../db.js'
import { availabilityOf } from '../lib/bookings.js'
import { itineraryFor, tagsFor } from '../lib/trips.js'

export const compareRouter = Router()

interface NormalizedTrip {
  id: string
  kind: 'hosted' | 'operator'
  name: string
  operator: string
  destination: string
  price: number | null
  durationDays: number | null
  startDate: string | null
  startCity: string | null
  difficulty: string
  category: string
  inclusions: string[]
  exclusions: string[]
  groupSizeMax: number | null
  groupSizeCurrent: number | null
  genderRatio: string | null
  rating: number | null
  reviewCount: number
  cancellationPolicy: string
  shortDesc: string
  itinerary: { day: number; title: string; description: string; location: string; activities: string[]; accommodation: string; meals: string[] }[]
  availability: { full: boolean; fillingFast?: boolean; seatsLeft?: number | null; label?: string }
  tags: string[]
}

function fetchPartnerTrip(id: string): NormalizedTrip | null {
  const t = db.prepare("SELECT * FROM partner_trips WHERE id = ? AND status = 'published'").get(id) as any
  if (!t) return null
  const org = db.prepare('SELECT name FROM partner_orgs WHERE id = ?').get(t.org_id) as any
  const itinerary = itineraryFor(id).map(d => ({
    day: d.dayNumber, title: d.title || '', description: d.description || '',
    location: d.location || '', activities: d.activities,
    accommodation: d.accommodation || '', meals: d.meals,
  }))
  return {
    id: t.id, kind: 'hosted',
    name: t.name || 'Untitled',
    operator: org?.name || 'Travel community',
    destination: t.destination || '',
    price: t.price, durationDays: t.duration_days,
    startDate: t.start_date, startCity: t.start_city || '',
    difficulty: t.difficulty || '', category: t.category || '',
    inclusions: pj<string[]>(t.inclusions, []),
    exclusions: pj<string[]>(t.exclusions, []),
    groupSizeMax: t.max_group_size, groupSizeCurrent: null,
    genderRatio: null, rating: null, reviewCount: 0,
    cancellationPolicy: t.pricing_notes || '',
    shortDesc: t.short_desc || '',
    itinerary, availability: availabilityOf(t), tags: tagsFor(id),
  }
}

function fetchGroupTrip(id: string): NormalizedTrip | null {
  const t = db.prepare('SELECT * FROM group_trips WHERE id = ?').get(id) as any
  if (!t) return null
  const gr = pj<{ male?: number; female?: number } | null>(t.gender_ratio, null)
  return {
    id: t.id, kind: 'operator',
    name: t.title || 'Untitled', operator: t.operator || '',
    destination: t.destination || '', price: t.price,
    durationDays: t.duration_days, startDate: t.start_date,
    startCity: t.start_city || '', difficulty: t.difficulty || '',
    category: (pj<string[]>(t.activity_tags, []))[0] || '',
    inclusions: pj<string[]>(t.inclusions, []), exclusions: [],
    groupSizeMax: t.group_size_max, groupSizeCurrent: t.group_size_current,
    genderRatio: gr ? `${gr.male ?? '?'}M / ${gr.female ?? '?'}F` : t.gender_ratio || null,
    rating: t.rating, reviewCount: t.review_count || 0,
    cancellationPolicy: '', shortDesc: '',
    itinerary: [],
    availability: { full: t.availability === 'full', label: t.availability },
    tags: pj<string[]>(t.activity_tags, []),
  }
}

function ruleBasedNarrative(trips: NormalizedTrip[]): string {
  const sorted = [...trips].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
  const cheapest = sorted[0]
  const longest = [...trips].sort((a, b) => (b.durationDays ?? 0) - (a.durationDays ?? 0))[0]
  const topRated = trips.filter(t => t.rating).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0]
  const lines: string[] = []
  if (trips.length === 1) {
    lines.push(`**${trips[0].name}** — ${trips[0].durationDays ?? '?'} days to ${trips[0].destination}${trips[0].price ? ` at ₹${trips[0].price.toLocaleString('en-IN')}` : ''}.`)
    lines.push('Add 1-2 more trips to get a full AI comparison.')
  } else {
    lines.push(`**Best value:** ${cheapest.name}${cheapest.price ? ` (₹${cheapest.price.toLocaleString('en-IN')})` : ''}.`)
    if (longest.id !== cheapest.id) lines.push(`**Longest trip:** ${longest.name} (${longest.durationDays ?? '?'} days).`)
    if (topRated) lines.push(`**Top rated:** ${topRated.name} (${topRated.rating}★ · ${topRated.reviewCount} reviews).`)
    lines.push('\n*Set ANTHROPIC_API_KEY to enable Claude AI comparison narratives.*')
  }
  return lines.join(' ')
}

function buildPrompt(trips: NormalizedTrip[]): string {
  const blocks = trips.map(t => {
    const itinSummary = t.itinerary.length
      ? t.itinerary.map(d =>
          `  Day ${d.day}: ${d.title}${d.location ? ` (${d.location})` : ''}` +
          `${d.description ? ' — ' + d.description.slice(0, 150) : ''}` +
          `${d.activities.length ? ` | Activities: ${d.activities.join(', ')}` : ''}` +
          `${d.accommodation ? ` | Stay: ${d.accommodation}` : ''}`
        ).join('\n')
      : '  (No day-by-day itinerary available)'

    return `### ${t.name}
- Kind: ${t.kind === 'hosted' ? `Hosted trip by ${t.operator}` : `Operator package by ${t.operator}`}
- Destination: ${t.destination}
- Price: ${t.price ? `₹${t.price.toLocaleString('en-IN')} /person` : 'TBD'}
- Duration: ${t.durationDays ?? '?'} days
- Departs: ${t.startDate ?? 'Flexible'} from ${t.startCity || 'unspecified city'}
- Difficulty: ${t.difficulty || 'Not specified'}
- Category: ${t.category || t.tags.join(', ') || 'General'}
- Group size: ${t.groupSizeMax ? `max ${t.groupSizeMax}${t.groupSizeCurrent != null ? ` (${t.groupSizeCurrent} joined)` : ''}` : 'Not specified'}
- Gender mix: ${t.genderRatio || 'Not specified'}
- Rating: ${t.rating ? `${t.rating}/5 (${t.reviewCount} reviews)` : 'No ratings yet'}
- Availability: ${t.availability.full ? '🔴 Full — waitlist only' : t.availability.fillingFast ? `🟡 Filling fast (${t.availability.seatsLeft} seats left)` : '🟢 Open'}
- Inclusions: ${t.inclusions.length ? t.inclusions.join(', ') : 'Not listed'}
- Exclusions: ${t.exclusions.length ? t.exclusions.join(', ') : 'Not listed'}
- Cancellation/notes: ${t.cancellationPolicy || 'Not specified'}

**Itinerary:**
${itinSummary}`
  }).join('\n\n---\n\n')

  return `You are a sharp, opinionated travel advisor helping a solo Indian traveller choose between ${trips.length} trips. Give them an honest, specific comparison — not marketing fluff.

${blocks}

---

Write a structured comparison covering:

**Quick verdict** (2–3 sentences: which trip fits which kind of traveller, and why)

**Dimension breakdown:**
- 💰 **Price & Value** — Cost per day, what's included/excluded, hidden costs
- 🗺️ **Itinerary & Pacing** — Day-by-day quality, variety, free time vs structured
- 👥 **Group & Social Vibe** — Size, gender mix, solo-friendliness
- 🏔️ **Difficulty & Fitness** — Physical demand, who should skip this
- ⭐ **Operator Trust** — Ratings, reputation, what to expect
- ⚠️ **Watch-outs** — Missing info, red flags, or gotchas per trip

**Best pick for solo travellers:** (Name one trip and explain in 2–3 sentences)

Use the actual data. Be direct. If info is missing, say so — don't invent.`
}

compareRouter.post('/discover/compare', async (req, res) => {
  const { tripIds } = req.body as { tripIds: unknown }
  if (!Array.isArray(tripIds) || tripIds.length < 1 || tripIds.length > 3) {
    return res.status(400).json({ error: 'tripIds must be an array of 1–3 IDs' })
  }
  const ids = (tripIds as unknown[]).filter(id => typeof id === 'string').slice(0, 3) as string[]
  if (!ids.length) return res.status(400).json({ error: 'No valid trip IDs provided' })

  const trips = ids.map(id => fetchPartnerTrip(id) || fetchGroupTrip(id)).filter(Boolean) as NormalizedTrip[]
  if (!trips.length) return res.status(404).json({ error: 'No matching published trips found' })

  let aiNarrative: string | null = null
  if (process.env.ANTHROPIC_API_KEY && trips.length > 1) {
    try {
      const client = new Anthropic()
      const stream = client.messages.stream({
        model: 'claude-opus-5',
        max_tokens: 2000,
        thinking: { type: 'adaptive' },
        messages: [{ role: 'user', content: buildPrompt(trips) }],
      })
      const msg = await stream.finalMessage()
      if (msg.stop_reason !== 'refusal') {
        const text = msg.content.filter(b => b.type === 'text').map(b => (b as any).text).join('').trim()
        if (text) aiNarrative = text
      }
    } catch (err: any) {
      console.error('[compare] Claude API error:', err?.message || err)
    }
  }

  res.json({ trips, aiNarrative: aiNarrative || ruleBasedNarrative(trips), aiPowered: !!aiNarrative })
})
