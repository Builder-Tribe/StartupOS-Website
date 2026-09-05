import { db, pj } from '../db.js'
import { availabilityOf } from './bookings.js'
import { publicTripCard } from './trips.js'

// ---------------------------------------------------------------------------
// AI Trip Discovery (PRD 2.1): natural language → structured intent → ranked
// results → conversational reply. Rule-based for the MVP with Claude-shaped
// seams: parseTravelQuery() and composeReply() take/return exactly what a
// Claude call would, so each swaps to the API independently later.
// ---------------------------------------------------------------------------

export interface TravelIntent {
  destination: string | null       // slug or free text
  maxBudget: number | null
  month: number | null             // 1-12
  maxDurationDays: number | null
  category: string | null
  startCity: string | null
  cheapFirst: boolean
}

export interface AiTripOption {
  rank: number
  destination: string
  tagline: string
  whyItFits: string[]
  quickPlan: { duration: string; highlights: string[] }
  budgetBreakdown: { travel: string; stay: string; food: string; activities: string; total: string }
  travelEffort: { distanceOrTime: string; ease: 'easy' | 'moderate' | 'tiring' }
  matchedTrip?: any
}

export interface AiTripReply {
  summary: string
  assumptions: string[]
  options: AiTripOption[]
  smartInsight: string
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const CATEGORY_WORDS: [RegExp, string][] = [
  [/\btrek|hik(e|ing)|pass\b|summit/i, 'trekking'],
  [/\bbeach(es)?|coast|sea|surf/i, 'beach'],
  [/\byoga|spiritual|meditat|ashram|retreat/i, 'spiritual'],
  [/\braft(ing)?|kayak|rapids|water sports?/i, 'adventure'],
  [/\bbik(e|ing)|motorcycle|royal enfield|road trip/i, 'road-trip'],
  [/\bbackpack/i, 'backpacking'],
  [/\bcamp(ing)?|stargaz/i, 'adventure'],
  [/\bculture|heritage|history|palace|fort/i, 'cultural'],
  [/\bparty|nightlife/i, 'party'],
]

export function parseTravelQuery(query: string, context?: Partial<TravelIntent>): TravelIntent {
  const q = query.toLowerCase()
  const intent: TravelIntent = {
    destination: context?.destination ?? null,
    maxBudget: context?.maxBudget ?? null,
    month: context?.month ?? null,
    maxDurationDays: context?.maxDurationDays ?? null,
    category: context?.category ?? null,
    startCity: context?.startCity ?? null,
    cheapFirst: context?.cheapFirst ?? false,
  }

  // Budget: "under ₹10k", "below 8000", "within 12,000", bare "10k budget"
  const budget = q.match(/(?:under|below|less than|within|max|upto|up to|around)\s*₹?\s*([\d,]+)\s*(k)?/)
    || q.match(/₹\s*([\d,]+)\s*(k)?/)
  if (budget) {
    const n = Number(budget[1].replace(/,/g, ''))
    intent.maxBudget = budget[2] ? n * 1000 : n
  }
  if (/\bcheap(est)?|budget[- ]friendly|affordable|low budget\b/.test(q)) intent.cheapFirst = true

  // Month ("in august", "this december") and duration ("weekend", "4 days", "a week")
  for (let i = 0; i < 12; i++) if (new RegExp(`\\b${MONTHS[i]}|\\b${MONTHS[i].slice(0, 3)}\\b`).test(q)) intent.month = i + 1
  const days = q.match(/(\d+)\s*(?:-?\s*day|d\b)/)
  if (days) intent.maxDurationDays = Number(days[1])
  else if (/\bweekend\b/.test(q)) intent.maxDurationDays = 3
  else if (/\ba week\b|\bweek[- ]long\b/.test(q)) intent.maxDurationDays = 7

  // Departure city
  const from = q.match(/\bfrom\s+([a-z]+)/)
  if (from && !MONTHS.some(m => m.startsWith(from[1]))) intent.startCity = from[1]

  // Category keywords
  for (const [re, cat] of CATEGORY_WORDS) if (re.test(query)) { intent.category = cat; break }

  // Destination: match known destination names/slugs and hosted-trip destinations
  const known: { key: string; value: string }[] = []
  for (const d of db.prepare('SELECT slug, name FROM destinations').all() as any[]) {
    known.push({ key: d.name.toLowerCase(), value: d.slug }, { key: d.slug.replace(/-/g, ' '), value: d.slug })
  }
  for (const t of db.prepare("SELECT DISTINCT destination, destination_slug FROM partner_trips WHERE status = 'published'").all() as any[]) {
    if (t.destination) known.push({ key: String(t.destination).toLowerCase().split(',')[0].trim(), value: t.destination_slug || String(t.destination).toLowerCase().split(',')[0].trim() })
  }
  // Longest match wins ("spiti valley" over "spiti")
  known.sort((a, b) => b.key.length - a.key.length)
  for (const k of known) {
    if (k.key.length >= 4 && q.includes(k.key)) { intent.destination = k.value; break }
  }
  if (/\banywhere|any ?place|somewhere\b/.test(q)) intent.destination = null

  return intent
}

function monthWindow(month: number): [string, string] {
  const now = new Date()
  const year = month < now.getMonth() + 1 ? now.getFullYear() + 1 : now.getFullYear()
  const last = new Date(year, month, 0).getDate()
  return [`${year}-${String(month).padStart(2, '0')}-01`, `${year}-${String(month).padStart(2, '0')}-${last}`]
}

export function rankTrips(intent: TravelIntent) {
  const today = new Date().toISOString().slice(0, 10)
  const window = intent.month ? monthWindow(intent.month) : null

  const score = (t: {
    kind: 'hosted' | 'operator'; destText: string; destSlug: string | null; price: number | null
    startDate: string | null; durationDays: number | null; category: string; tags: string[]
    startCity: string | null; rating: number | null; full: boolean; seatsLeft: number | null
  }) => {
    let s = 0
    const reasons: string[] = []
    if (intent.destination) {
      const hit = t.destSlug === intent.destination || t.destText.toLowerCase().includes(intent.destination.replace(/-/g, ' '))
      if (!hit) return null // destination is a hard filter when stated
      s += 40; reasons.push(`In ${t.destText.split(',')[0]}`)
    }
    if (intent.maxBudget != null) {
      if (t.price != null && t.price > intent.maxBudget) return null // hard budget cap
      if (t.price != null) { s += 15; reasons.push(`₹${t.price.toLocaleString('en-IN')} fits your budget`) }
    }
    if (window && t.startDate) {
      if (t.startDate >= window[0] && t.startDate <= window[1]) { s += 15; reasons.push(`Departs in ${MONTHS[intent.month! - 1][0].toUpperCase()}${MONTHS[intent.month! - 1].slice(1)}`) }
      else s -= 10
    }
    if (intent.maxDurationDays && t.durationDays) {
      if (t.durationDays <= intent.maxDurationDays) { s += 10; reasons.push(`${t.durationDays} days — fits your time`) }
      else s -= 8
    }
    if (intent.category) {
      const catHit = t.category === intent.category || t.tags.some(x => x.includes(intent.category!)) || intent.category === 'trekking' && /trek/i.test(t.destText)
      if (catHit) { s += 20; reasons.push(`Matches ${intent.category}`) }
    }
    if (intent.startCity && t.startCity && t.startCity.toLowerCase().includes(intent.startCity)) { s += 8; reasons.push(`Starts from ${t.startCity}`) }
    if (t.full) { s -= 30; reasons.push('Currently sold out — waitlist open') }
    else if (t.seatsLeft != null && t.seatsLeft <= 3) { s += 4; reasons.push(`Only ${t.seatsLeft} seats left`) }
    if (t.rating) s += Math.min(5, t.rating)
    if (t.startDate && t.startDate < today) s -= 25
    return { score: s, reasons }
  }

  const results: any[] = []
  for (const t of db.prepare("SELECT * FROM partner_trips WHERE status = 'published'").all() as any[]) {
    const a = availabilityOf(t)
    const r = score({ kind: 'hosted', destText: t.destination || '', destSlug: t.destination_slug, price: t.price, startDate: t.start_date, durationDays: t.duration_days, category: t.category || '', tags: [], startCity: t.start_city, rating: null, full: a.full, seatsLeft: a.seatsLeft })
    if (r) results.push({ kind: 'hosted', score: r.score, reasons: r.reasons, trip: { ...publicTripCard(t), availability: a } })
  }
  for (const t of db.prepare('SELECT * FROM group_trips').all() as any[]) {
    const tags = pj<string[]>(t.activity_tags, [])
    const r = score({ kind: 'operator', destText: t.destination.replace(/-/g, ' '), destSlug: t.destination, price: t.price, startDate: t.start_date, durationDays: t.duration_days, category: '', tags, startCity: t.start_city, rating: t.rating, full: t.availability === 'full', seatsLeft: t.group_size_max ? t.group_size_max - (t.group_size_current || 0) : null })
    if (r) results.push({ kind: 'operator', score: r.score, reasons: r.reasons, trip: { id: t.id, title: t.title, operator: t.operator, destination: t.destination, price: t.price, startDate: t.start_date, durationDays: t.duration_days, startCity: t.start_city, rating: t.rating, availabilityLabel: t.availability } })
  }
  results.sort((a, b) => (intent.cheapFirst ? (a.trip.price || 9e9) - (b.trip.price || 9e9) : 0) || b.score - a.score)
  return results.slice(0, 8)
}

export function composeReply(intent: TravelIntent, results: any[]): string {
  const bits: string[] = []
  if (intent.category) bits.push(intent.category.replace('-', ' ') + ' trips')
  else bits.push('trips')
  if (intent.destination) bits.push(`to ${intent.destination.replace(/-/g, ' ')}`)
  if (intent.maxBudget) bits.push(`under ₹${intent.maxBudget.toLocaleString('en-IN')}`)
  if (intent.month) bits.push(`in ${MONTHS[intent.month - 1][0].toUpperCase()}${MONTHS[intent.month - 1].slice(1)}`)
  if (intent.maxDurationDays) bits.push(`within ${intent.maxDurationDays} days`)
  if (intent.startCity) bits.push(`from ${intent.startCity[0].toUpperCase()}${intent.startCity.slice(1)}`)
  const ask = bits.join(' ')

  if (results.length === 0) {
    return `I couldn't find ${ask} right now. Try widening the budget or dates — or pick a destination and build your own trip: Trippy will match you with travellers going the same way.`
  }
  const top = results[0].trip
  const name = top.name || top.title
  const openSeats = results.filter(r => !r.trip.availability?.full).length
  const pieces = [`Found ${results.length} ${ask}.`]
  pieces.push(`Top pick: "${name}"${top.price ? ` at ₹${top.price.toLocaleString('en-IN')}` : ''}${results[0].reasons.length ? ` — ${results[0].reasons.slice(0, 2).join(', ').toLowerCase()}` : ''}.`)
  if (openSeats < results.length) pieces.push(`${results.length - openSeats} of these are sold out but have open waitlists.`)
  return pieces.join(' ')
}

// ---------------------------------------------------------------------------
// Enhanced AI reply — structured 3-option format (fallback when Claude unavailable)
// ---------------------------------------------------------------------------

type DestTemplate = {
  dest: string
  tagline: string
  effort: { distanceOrTime: string; ease: 'easy' | 'moderate' | 'tiring' }
  highlights: string[]
  budgetRatios: { travel: number; stay: number; food: number; activities: number }
  smartInsights?: string[]
}

const DEST_TEMPLATES: Record<string, DestTemplate[]> = {
  trekking: [
    { dest: 'Spiti Valley', tagline: 'Remote Himalayan moonscape for true adventurers', effort: { distanceOrTime: '~14h from Delhi by bus', ease: 'tiring' }, highlights: ['Chandratal Lake at sunrise', 'Key Monastery & Kibber village', 'Star-gazing camp at 4,200m'], budgetRatios: { travel: 0.35, stay: 0.28, food: 0.20, activities: 0.17 }, smartInsights: ['Most people go Manali in peak season, but Spiti in Sept has empty trails and 3× cleaner air'] },
    { dest: 'Kedarkantha', tagline: 'Beginner-friendly summit with jaw-dropping snow views', effort: { distanceOrTime: '~9h from Delhi to Sankri', ease: 'moderate' }, highlights: ['Snow-covered forest trails', 'Summit at 3,800m — 360° Himalayan panorama', 'Cozy bonfire camps at Juda Ka Talab'], budgetRatios: { travel: 0.28, stay: 0.35, food: 0.17, activities: 0.20 }, smartInsights: ['Kedarkantha gives you a summit certificate and snow — at 1/3rd the crowd of Triund'] },
    { dest: 'Chopta & Tungnath', tagline: 'Short trek, massive views — Uttarakhand\'s hidden gem', effort: { distanceOrTime: '~8h from Delhi', ease: 'easy' }, highlights: ['Tungnath temple at 3,680m', 'Chandrashila summit at 4,000m', 'Rhododendron meadows in full bloom'], budgetRatios: { travel: 0.28, stay: 0.35, food: 0.20, activities: 0.17 }, smartInsights: ['Chopta is called the "Switzerland of Uttarakhand" — almost nobody outside Delhi knows it'] },
  ],
  beach: [
    { dest: 'Gokarna', tagline: 'Laid-back beaches, no Goa crowds, half the price', effort: { distanceOrTime: '~10h from Bangalore (overnight bus)', ease: 'easy' }, highlights: ['Om Beach sunset walk', 'Secret Half Moon Beach hike', 'Beach shack dinners under the stars'], budgetRatios: { travel: 0.22, stay: 0.33, food: 0.28, activities: 0.17 }, smartInsights: ['Gokarna delivers 90% of Goa\'s vibe at 40% of the cost — and the beaches are actually cleaner'] },
    { dest: 'Varkala, Kerala', tagline: 'Clifftop cafés, Ayurvedic vibes, and red-sand beaches', effort: { distanceOrTime: '~1.5h from Thiruvananthapuram airport', ease: 'easy' }, highlights: ['Clifftop promenade cafés and sunset views', 'Papanasam beach dip — said to wash sins away', 'Ayurvedic spa afternoon'], budgetRatios: { travel: 0.28, stay: 0.37, food: 0.22, activities: 0.13 }, smartInsights: ['Varkala has the vibe of Bali but at Indian prices — the cliff café strip is genuinely special'] },
    { dest: 'Pondicherry', tagline: 'French quarter, beach promenade, and great food on any budget', effort: { distanceOrTime: '~3h from Chennai by bus', ease: 'easy' }, highlights: ['Promenade beach morning walk', 'Auroville exploration and meditation', 'French Quarter cafés and alleys'], budgetRatios: { travel: 0.20, stay: 0.42, food: 0.25, activities: 0.13 }, smartInsights: ['Pondi works for any group type — solo, couple, or friends — unlike most beach destinations that skew one way'] },
  ],
  adventure: [
    { dest: 'Rishikesh', tagline: 'Rafting, bungee, and river-side campfires all in one place', effort: { distanceOrTime: '~6h from Delhi', ease: 'easy' }, highlights: ['White-water rafting on the Ganges (Grade III–IV)', 'Bungee jumping at Mohan Chatti (83m)', 'Neer Garh waterfall hike'], budgetRatios: { travel: 0.18, stay: 0.27, food: 0.22, activities: 0.33 }, smartInsights: ['Book rafting in advance — operators fill up by 8am in season. Pre-booking saves ₹500/person too'] },
    { dest: 'Coorg, Karnataka', tagline: 'Coffee trails, waterfalls, and misty jungle stays', effort: { distanceOrTime: '~5h from Bangalore', ease: 'easy' }, highlights: ['Coffee plantation walk and tasting session', 'Abbey Falls trek through the forest', 'River rafting at Barapole'], budgetRatios: { travel: 0.22, stay: 0.43, food: 0.20, activities: 0.15 }, smartInsights: ['Coorg homestays cost ₹1,500–₹2,500 and include breakfast — skip hotels entirely'] },
    { dest: 'Kasol & Kheerganga', tagline: 'Hippie hamlet + natural hot spring trek combo', effort: { distanceOrTime: '~10h from Delhi (overnight bus)', ease: 'moderate' }, highlights: ['Kheerganga hot spring soak post-trek', 'Parvati Valley river walk', 'Israeli café culture in Kasol'], budgetRatios: { travel: 0.28, stay: 0.27, food: 0.28, activities: 0.17 }, smartInsights: ['Do the Kheerganga trek on Day 1 (arrive early) — the hot spring after 12km of trail is one of those moments'] },
  ],
  cultural: [
    { dest: 'Varanasi', tagline: 'The most intense, ancient, alive city in India', effort: { distanceOrTime: '~12h from Delhi by overnight train', ease: 'easy' }, highlights: ['Ganga Aarti at Dashashwamedh Ghat (unmissable)', 'Dawn boat ride on the Ganges', 'Old city lanes, street food, and silk weaving'], budgetRatios: { travel: 0.27, stay: 0.30, food: 0.28, activities: 0.15 }, smartInsights: ['Wake up at 5am for the boat ride — Varanasi at dawn is a different world from the afternoon chaos'] },
    { dest: 'Hampi', tagline: 'Ruins, boulders, and traveller culture unlike anywhere else', effort: { distanceOrTime: '~9h from Bangalore (overnight bus)', ease: 'easy' }, highlights: ['Virupaksha Temple at sunrise', 'Bicycle ride through 500-year-old ruins', 'Tungabhadra riverside sunset'], budgetRatios: { travel: 0.22, stay: 0.27, food: 0.28, activities: 0.23 }, smartInsights: ['Cross the coracle to Virupapur Gadde — the "other side" of Hampi has chill guesthouses at ₹500/night and almost no tourists'] },
    { dest: 'Jaipur & Pushkar', tagline: 'Palaces, desert colours, and rooftop sunsets in Rajasthan', effort: { distanceOrTime: '~5h from Delhi by bus', ease: 'easy' }, highlights: ['Amber Fort with light-and-sound show', 'Pushkar Lake and Brahma Temple', 'Camel safari and desert camp bonfire'], budgetRatios: { travel: 0.18, stay: 0.37, food: 0.25, activities: 0.20 }, smartInsights: ['Split your stay — 1 night Jaipur, 2 nights Pushkar. Pushkar\'s rooftop lakeside guesthouses are ₹600–₹900 and magical'] },
  ],
  spiritual: [
    { dest: 'Rishikesh', tagline: 'Yoga, meditation, and ashram stays on the Ganges', effort: { distanceOrTime: '~6h from Delhi', ease: 'easy' }, highlights: ['Sunrise yoga on the ghats', 'Meditation session at Parmarth Niketan', 'Evening Ganga Aarti ceremony'], budgetRatios: { travel: 0.18, stay: 0.37, food: 0.27, activities: 0.18 }, smartInsights: ['Free yoga classes happen at Parmarth Niketan every morning at 6am — no registration needed'] },
    { dest: 'Mysuru', tagline: 'Palace city with yoga tradition and Navaratri magic', effort: { distanceOrTime: '~3h from Bangalore', ease: 'easy' }, highlights: ['Mysore Palace with evening light show', 'Ashtanga yoga classes at the institute', 'Chamundi Hills dawn climb'], budgetRatios: { travel: 0.17, stay: 0.42, food: 0.25, activities: 0.16 } },
    { dest: 'Spiti Valley', tagline: 'Buddhist monasteries in a high-altitude Himalayan desert', effort: { distanceOrTime: '~14h from Delhi', ease: 'tiring' }, highlights: ['Key Monastery morning prayer ceremony', 'Tabo cave monastery meditation', 'Sunrise at Pin Valley National Park'], budgetRatios: { travel: 0.35, stay: 0.28, food: 0.20, activities: 0.17 } },
  ],
  'road-trip': [
    { dest: 'Leh–Ladakh', tagline: 'The ultimate Indian road trip — empty roads at 5,000m', effort: { distanceOrTime: '~21h from Delhi via Manali–Leh highway', ease: 'tiring' }, highlights: ['Khardung La pass — one of world\'s highest motorable roads', 'Pangong Lake\'s surreal blue-green water', 'Magnetic Hill and Nubra Valley dunes'], budgetRatios: { travel: 0.40, stay: 0.28, food: 0.18, activities: 0.14 }, smartInsights: ['Rent a Royal Enfield in Manali, not Leh — saves ₹2,000 and you get the iconic highway experience both ways'] },
    { dest: 'Coastal Karnataka', tagline: 'Beaches, ghats, and coffee country in one loop', effort: { distanceOrTime: '~8h circuit from Bangalore', ease: 'easy' }, highlights: ['Murudeshwar temple on the sea cliff', 'Gokarna beaches stop', 'Coorg coffee plantation detour'], budgetRatios: { travel: 0.33, stay: 0.30, food: 0.22, activities: 0.15 } },
    { dest: 'Meghalaya', tagline: 'Living root bridges and the world\'s wettest landscapes', effort: { distanceOrTime: '~2h from Guwahati airport', ease: 'moderate' }, highlights: ['Double Decker Living Root Bridge trek', 'Dawki crystal-clear river boat ride', 'Mawlynnong — Asia\'s cleanest village'], budgetRatios: { travel: 0.33, stay: 0.28, food: 0.22, activities: 0.17 }, smartInsights: ['October–November is the sweet spot — post-monsoon greenery, no rain, and off-peak prices'] },
  ],
  backpacking: [
    { dest: 'Kasol', tagline: 'Backpacker central — cheap, scenic, full of like-minded travellers', effort: { distanceOrTime: '~10h from Delhi (overnight Volvo)', ease: 'easy' }, highlights: ['Kheerganga hot spring trek', 'Café culture and Parvati river hangs', 'Tosh or Malana village detour'], budgetRatios: { travel: 0.27, stay: 0.23, food: 0.32, activities: 0.18 } },
    { dest: 'Hampi', tagline: 'Budget nirvana — ₹500 hostels and free 500-year-old ruins', effort: { distanceOrTime: '~9h from Bangalore', ease: 'easy' }, highlights: ['Sunrise at Matanga Hill (free, no crowds)', 'Bicycle hire and ruins exploration all day', 'Tungabhadra riverside hang at sunset'], budgetRatios: { travel: 0.22, stay: 0.25, food: 0.30, activities: 0.23 }, smartInsights: ['Hampi is probably the best value destination in all of India — ₹8,000 for 4 days including everything'] },
    { dest: 'Pushkar', tagline: 'Cheap rooftops, Rajasthani sunsets, and camel country', effort: { distanceOrTime: '~7h from Delhi', ease: 'easy' }, highlights: ['Brahma Temple and Pushkar Lake', 'Sunset from the ghats', 'Desert camping and bonfire night'], budgetRatios: { travel: 0.23, stay: 0.25, food: 0.30, activities: 0.22 } },
  ],
  party: [
    { dest: 'North Goa', tagline: 'Techno beaches, neon nights, and Sunday markets', effort: { distanceOrTime: '~1h flight from major cities', ease: 'easy' }, highlights: ['Vagator and Anjuna beach party scene', 'Saturday Night Market at Arpora', 'Sunset at Curlies or Shiva Valley'], budgetRatios: { travel: 0.30, stay: 0.35, food: 0.18, activities: 0.17 } },
    { dest: 'Kasol', tagline: 'Mountains + music — psytrance culture in the Parvati Valley', effort: { distanceOrTime: '~10h from Delhi (overnight bus)', ease: 'easy' }, highlights: ['Riverside café nights in Kasol', 'Chalal village trance gatherings', 'Kheerganga post-party nature detox'], budgetRatios: { travel: 0.27, stay: 0.23, food: 0.27, activities: 0.23 } },
    { dest: 'Pondicherry', tagline: 'Chill rooftop bars, good music, and great food', effort: { distanceOrTime: '~3h from Chennai by bus', ease: 'easy' }, highlights: ['Promenade beach night scene', 'Rooftop bars in White Town', 'Auroville day-trip for contrast'], budgetRatios: { travel: 0.20, stay: 0.42, food: 0.20, activities: 0.18 } },
  ],
}

const DEFAULT_TEMPLATES: DestTemplate[] = [
  { dest: 'Rishikesh', tagline: 'Adventure, yoga, and river vibes — suits almost any traveller', effort: { distanceOrTime: '~6h from Delhi', ease: 'easy' }, highlights: ['White-water rafting on the Ganges', 'Sunset yoga session by the river', 'Bungee jumping (83m) for the bold'], budgetRatios: { travel: 0.18, stay: 0.30, food: 0.25, activities: 0.27 } },
  { dest: 'Gokarna', tagline: 'Off-beat beaches and laid-back coastal vibes', effort: { distanceOrTime: '~10h from Bangalore (overnight bus)', ease: 'easy' }, highlights: ['Om Beach sunset walk', 'Secret beach hike to Half Moon Beach', 'Beach shack dinners under the stars'], budgetRatios: { travel: 0.22, stay: 0.35, food: 0.27, activities: 0.16 } },
  { dest: 'Hampi', tagline: 'Ancient ruins, giant boulders, and zero tourist crowds mid-week', effort: { distanceOrTime: '~9h from Bangalore (overnight bus)', ease: 'easy' }, highlights: ['Virupaksha Temple at sunrise', 'Full-day bicycle ride through ruins', 'Tungabhadra riverside sunset spot'], budgetRatios: { travel: 0.23, stay: 0.27, food: 0.27, activities: 0.23 } },
]

const SMART_INSIGHTS: Record<string, string[]> = {
  trekking: [
    'Most people chase Triund or Kasol — both are overcrowded. The less-known treks give you the same views with 10× the solitude.',
    'Avoid trekking solo in Spiti without acclimatising for a day in Manali first — altitude sickness ruins more Himalayan trips than bad weather.',
  ],
  beach: [
    'Most people pick Goa by default. For a similar vibe at 40% less cost, the Karnataka/Kerala coast consistently outperforms.',
    'Book accommodation 48h before arrival (not earlier) for off-season beach trips — last-minute deals on hostels are real.',
  ],
  adventure: [
    'Activity operators in Rishikesh have dynamic pricing. Book 2–3 days ahead (not same-day) for the sweet spot of availability + price.',
  ],
  cultural: [
    'The best cultural experiences in India are free — dawn at the ghats, evening aarti, fort sunrises. Budget 60% for accommodation, save activities budget for food.',
  ],
  party: [
    'North Goa in shoulder season (Oct, Feb–Mar) costs 30% less and has smaller, better quality parties than peak Christmas week.',
  ],
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

function generateWhyItFits(intent: TravelIntent, tmpl: DestTemplate, dbReasons: string[] = []): string[] {
  const reasons: string[] = [...dbReasons.slice(0, 2)]
  if (intent.maxBudget && reasons.length < 3) reasons.push(`Fits a ₹${intent.maxBudget.toLocaleString('en-IN')} budget comfortably`)
  if (intent.maxDurationDays && reasons.length < 3) reasons.push(`Doable in ${intent.maxDurationDays} days`)
  if (intent.startCity && reasons.length < 3) reasons.push(`Easy reach from ${cap(intent.startCity)}`)
  if (intent.category && reasons.length < 3) reasons.push(`Matches your ${intent.category.replace('-', ' ')} vibe`)
  if (reasons.length < 2) reasons.push('Great value for solo travellers', 'Vibrant traveller community')
  return reasons.slice(0, 3)
}

export function buildEnhancedReply(intent: TravelIntent, results: any[]): AiTripReply {
  const category = intent.category
  const templates = (category && DEST_TEMPLATES[category]) || DEFAULT_TEMPLATES
  const budget = intent.maxBudget || 12000
  const duration = intent.maxDurationDays || 4

  // Assumptions
  const assumptions: string[] = []
  if (!intent.startCity) assumptions.push('Starting from Delhi or Bangalore')
  if (!intent.maxBudget) assumptions.push('Budget ~₹10,000–₹15,000 per person')
  if (!intent.maxDurationDays) assumptions.push('3–5 day window')
  if (!intent.month) assumptions.push(`Travelling this or next month`)

  const fmt = (ratio: number) => `₹${Math.round(budget * ratio).toLocaleString('en-IN')}`

  const options: AiTripOption[] = []
  const usedTemplates = new Set<number>()

  for (let rank = 1; rank <= 3; rank++) {
    const dbResult = results[rank - 1] ?? null

    if (dbResult) {
      const trip = dbResult.trip
      const destRaw = (trip.destination || trip.name || trip.title || '').replace(/-/g, ' ')
      const destDisplay = destRaw.split(' ').map(cap).join(' ')
      const price = trip.price || budget

      // Try to match a template for extra metadata
      const tmpl = templates.find(t =>
        destDisplay.toLowerCase().includes(t.dest.toLowerCase().split(' ')[0].toLowerCase()) ||
        t.dest.toLowerCase().includes(destDisplay.toLowerCase().split(' ')[0].toLowerCase())
      )
      const ratios = tmpl?.budgetRatios || { travel: 0.30, stay: 0.35, food: 0.20, activities: 0.15 }
      const fmtP = (r: number) => `₹${Math.round(price * r).toLocaleString('en-IN')}`

      options.push({
        rank,
        destination: trip.name || trip.title || destDisplay,
        tagline: tmpl?.tagline || `${category ? cap(category) : 'Great'} trip — matched from our platform`,
        whyItFits: generateWhyItFits(intent, tmpl || templates[0], dbResult.reasons),
        quickPlan: {
          duration: trip.durationDays ? `${trip.durationDays} days` : `${duration} days`,
          highlights: tmpl?.highlights || ['Explore the destination', 'Local cultural experiences', 'Memorable return journey'],
        },
        budgetBreakdown: {
          travel: fmtP(ratios.travel),
          stay: fmtP(ratios.stay),
          food: fmtP(ratios.food),
          activities: fmtP(ratios.activities),
          total: `₹${price.toLocaleString('en-IN')}`,
        },
        travelEffort: tmpl?.effort || { distanceOrTime: 'Varies by route', ease: 'moderate' },
        matchedTrip: dbResult,
      })
    } else {
      // Fill from templates
      let ti = 0
      while (usedTemplates.has(ti) && ti < templates.length - 1) ti++
      usedTemplates.add(ti)
      const tmpl = templates[ti]

      options.push({
        rank,
        destination: tmpl.dest,
        tagline: tmpl.tagline,
        whyItFits: generateWhyItFits(intent, tmpl),
        quickPlan: {
          duration: `${duration} days`,
          highlights: tmpl.highlights,
        },
        budgetBreakdown: {
          travel: fmt(tmpl.budgetRatios.travel),
          stay: fmt(tmpl.budgetRatios.stay),
          food: fmt(tmpl.budgetRatios.food),
          activities: fmt(tmpl.budgetRatios.activities),
          total: `₹${budget.toLocaleString('en-IN')}`,
        },
        travelEffort: tmpl.effort,
        matchedTrip: undefined,
      })
    }
  }

  // Smart insight
  const catInsights = (category && SMART_INSIGHTS[category]) || []
  const topOpt = options[0]
  const tmpl0 = templates[0]
  const templateInsight = tmpl0?.smartInsights?.[0]
  const smartInsight = templateInsight || catInsights[0] ||
    `Most travellers default to the obvious choice, but "${topOpt.destination}" is genuinely better for your profile — ${topOpt.whyItFits[0]?.toLowerCase() || 'it matches what you described'}.`

  // Summary
  const catLabel = category ? category.replace('-', ' ') : 'trip'
  const extra = [
    intent.maxBudget ? `under ₹${intent.maxBudget.toLocaleString('en-IN')}` : '',
    intent.month ? `in ${MONTHS[intent.month - 1]}` : '',
    intent.startCity ? `from ${cap(intent.startCity)}` : '',
  ].filter(Boolean).join(' · ')
  const summary = `Here are 3 ${catLabel} options${extra ? ' — ' + extra : ''} — each picked for your vibe and constraints.`

  return { summary, assumptions, options, smartInsight }
}

// ---------------------------------------------------------------------------
// Claude prompt builder for structured chatbot responses
// ---------------------------------------------------------------------------
export function buildChatbotPrompt(query: string, intent: TravelIntent, results: any[]): string {
  const topTrips = results.slice(0, 5).map((r, i) => {
    const t = r.trip
    return `Trip ${i + 1}: ${t.name || t.title} | Dest: ${t.destination || ''} | Price: ₹${t.price || 'TBD'} | Duration: ${t.durationDays || '?'}d | Start: ${t.startDate || 'flexible'} | Reasons matched: ${r.reasons.join(', ')}`
  }).join('\n')

  return `You are Trippy's AI Travel Planner — a sharp, slightly opinionated travel advisor for Indian solo travellers.

User query: "${query}"

Extracted context:
- Budget: ${intent.maxBudget ? `₹${intent.maxBudget.toLocaleString('en-IN')}` : 'not specified'}
- Duration: ${intent.maxDurationDays ? `${intent.maxDurationDays} days` : 'not specified'}
- Start city: ${intent.startCity ? intent.startCity : 'not specified'}
- Month: ${intent.month ? MONTHS[intent.month - 1] : 'not specified'}
- Travel style: ${intent.category || 'not specified'}
- Specific destination: ${intent.destination || 'open'}

Platform trips found (use these as Option 1/2 when they fit — they're bookable on Trippy):
${topTrips || 'No platform trips matched — recommend from general knowledge'}

Respond ONLY with valid JSON (no markdown, no extra text) matching this exact schema:
{
  "summary": "2 sentences: acknowledge what you understood about their query and what you're recommending",
  "assumptions": ["assumption 1 if any info was missing", "assumption 2"],
  "options": [
    {
      "rank": 1,
      "destination": "Full destination name",
      "tagline": "One punchy line — the vibe in 8–12 words",
      "whyItFits": ["budget fit reason", "vibe/style reason", "timing or logistics reason"],
      "quickPlan": {
        "duration": "X days",
        "highlights": ["Experience 1", "Experience 2", "Experience 3", "Experience 4"]
      },
      "budgetBreakdown": {
        "travel": "₹X,XXX",
        "stay": "₹X,XXX",
        "food": "₹X,XXX",
        "activities": "₹X,XXX",
        "total": "₹X,XXX"
      },
      "travelEffort": {
        "distanceOrTime": "~Xh from [city] by [mode]",
        "ease": "easy"
      },
      "matchedTripIndex": null
    }
  ],
  "smartInsight": "The single most valuable, non-obvious insight for this traveller — something they'd only know if they'd been there"
}

Rules:
- Return EXACTLY 3 options, ranked best to 3rd-best for THIS user
- ease must be one of: "easy", "moderate", "tiring"
- Budget breakdown numbers must sum to total
- If a platform trip matches an option, set matchedTripIndex to its 0-based index from the list above (0–4), else null
- Be specific and opinionated. "Most people pick X, but Y is better for you because…" is better than generic lists
- Use ₹ prices sized appropriately for the user's budget
- assumptions array can be empty [] if all info was provided
- smartInsight must be genuinely non-obvious — not "book early" or "carry sunscreen"`
}
