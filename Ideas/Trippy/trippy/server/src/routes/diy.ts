import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { db, uid, pj, today } from '../db.js'
import { requireAuth, type AuthedRequest } from '../lib/auth.js'
import { publicUser } from '../lib/shape.js'
import { findOrCreateHub, ensureInviteCode, pollShape } from '../lib/hubs.js'

export const diyRouter = Router()

const r = (req: any) => req as AuthedRequest

function destShape(d: any) {
  return {
    slug: d.slug,
    name: d.name,
    state: d.state || 'India',
    emoji: d.emoji || '🎒',
    tagline: d.tagline || '',
    bestMonths: d.best_months || '',
    tags: typeof d.tags === 'string' ? pj<string[]>(d.tags, []) : (d.tags || []),
    activities: typeof d.activities === 'string' ? pj<any[]>(d.activities, []) : (d.activities || []),
    extras: typeof d.extras === 'string' ? pj<string[]>(d.extras, []) : (d.extras || []),
    activeTripCount: Number(d.active_trip_count || 0),
  }
}

diyRouter.get('/destinations', (_req, res) => {
  const t = today()
  const catalogDests = db.prepare(`
    SELECT d.*,
      (
        SELECT COUNT(*) FROM partner_trips pt
        WHERE (pt.destination_slug = d.slug OR LOWER(pt.destination) = LOWER(d.name))
          AND pt.status = 'published'
          AND (pt.end_date IS NULL OR pt.end_date >= ?)
      ) + (
        SELECT COUNT(*) FROM group_trips gt
        WHERE (gt.destination = d.slug OR LOWER(gt.destination) = LOWER(d.name))
          AND (gt.start_date IS NULL OR gt.start_date >= ?)
      ) AS active_trip_count
    FROM destinations d
  `).all(t, t) as any[]

  // Also catch distinct active destinations from partner_trips that aren't in the destinations catalog yet
  const extraPartnerDests = db.prepare(`
    SELECT DISTINCT pt.destination, pt.destination_slug
    FROM partner_trips pt
    WHERE pt.status = 'published'
      AND (pt.end_date IS NULL OR pt.end_date >= ?)
      AND pt.destination IS NOT NULL AND pt.destination != ''
  `).all(t) as any[]

  const existingSlugs = new Set(catalogDests.map(d => (d.slug || '').toLowerCase()))
  const existingNames = new Set(catalogDests.map(d => (d.name || '').toLowerCase()))

  const extraDests: any[] = []
  for (const p of extraPartnerDests) {
    const name = String(p.destination).trim()
    const slug = (p.destination_slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).toLowerCase()
    if (!existingSlugs.has(slug) && !existingNames.has(name.toLowerCase())) {
      const activeCount = (db.prepare(`
        SELECT COUNT(*) AS c FROM partner_trips 
        WHERE (destination_slug = ? OR LOWER(destination) = LOWER(?)) 
          AND status = 'published' AND (end_date IS NULL OR end_date >= ?)
      `).get(slug, name, t) as any).c

      extraDests.push({
        slug,
        name,
        state: 'India',
        emoji: '🏞️',
        tagline: `Explore ${name} with live community trips`,
        best_months: 'Year round',
        tags: '["adventure","trips"]',
        activities: '[]',
        extras: '[]',
        active_trip_count: activeCount,
      })
      existingSlugs.add(slug)
      existingNames.add(name.toLowerCase())
    }
  }

  const combined = [...catalogDests, ...extraDests]
  combined.sort((a, b) => (b.active_trip_count || 0) - (a.active_trip_count || 0) || a.name.localeCompare(b.name))

  res.json(combined.map(destShape))
})

function tripShape(t: any) {
  return { id: t.id, destination: t.destination, operator: t.operator, title: t.title, price: t.price,
    durationDays: t.duration_days, startCity: t.start_city, startDate: t.start_date,
    inclusions: pj<string[]>(t.inclusions, []), activityTags: pj<string[]>(t.activity_tags, []),
    difficulty: t.difficulty, rating: t.rating, reviewCount: t.review_count,
    groupSizeMax: t.group_size_max, groupSizeCurrent: t.group_size_current,
    genderRatio: t.gender_ratio ? pj(t.gender_ratio, null) : null, availability: t.availability }
}

diyRouter.get('/grouptrips', (req, res) => {
  const dest = String(req.query.destination || '')
  // Never return trips that have already departed — start_date in the past is stale inventory.
  const rows = (dest
    ? db.prepare('SELECT * FROM group_trips WHERE destination = ? AND (start_date IS NULL OR start_date >= ?) ORDER BY rating DESC').all(dest, today())
    : db.prepare('SELECT * FROM group_trips WHERE (start_date IS NULL OR start_date >= ?) ORDER BY rating DESC').all(today())) as any[]
  res.json(rows.map(tripShape))
})

// ---- DIY vs Group comparison (PRD 1.6) ----
// Rule-based estimate for the MVP; the same inputs/outputs are what a Claude
// API call would produce, so this endpoint upgrades in place later.
diyRouter.get('/compare', (req, res) => {
  const rawDest = String(req.query.destination || '').trim()
  const slugified = rawDest.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const days = Math.max(2, Math.min(14, parseInt(String(req.query.days || '4')) || 4))

  let d = db.prepare('SELECT * FROM destinations WHERE LOWER(slug) = LOWER(?) OR LOWER(name) = LOWER(?) OR LOWER(slug) = LOWER(?)').get(rawDest, rawDest, slugified) as any

  if (!d) {
    // Generate synthetic destination so DIY planning works seamlessly for ANY city in the world
    const cleanName = rawDest
      ? rawDest.split(/[- ]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      : 'Custom Destination'

    const tNow = today()
    const activeCount = (db.prepare(`
      SELECT (
        SELECT COUNT(*) FROM partner_trips WHERE (LOWER(destination_slug) = LOWER(?) OR LOWER(destination) = LOWER(?)) AND status = 'published' AND (end_date IS NULL OR end_date >= ?)
      ) + (
        SELECT COUNT(*) FROM group_trips WHERE (LOWER(destination) = LOWER(?) OR LOWER(destination) = LOWER(?)) AND (start_date IS NULL OR start_date >= ?)
      ) AS c
    `).get(slugified, cleanName, tNow, slugified, cleanName, tNow) as any)?.c || 0

    d = {
      slug: slugified || 'custom-destination',
      name: cleanName,
      state: 'India',
      emoji: '🎒',
      tagline: `Explore ${cleanName} on your own terms`,
      hostel_night: 600,
      food_day: 500,
      transport_day: 300,
      intercity: 2500,
      activities: JSON.stringify([
        { name: `${cleanName} city exploration & sights`, cost: 500 },
        { name: `Local market & street food tour`, cost: 300 },
        { name: `Scenic view points & trails`, cost: 200 },
      ]),
      extras: JSON.stringify([
        `Check local weather in ${cleanName} before packing`,
        `Book hostels and transport early for weekends`,
      ]),
      best_months: 'Year round',
      tags: JSON.stringify(['diy', 'explore']),
      active_trip_count: activeCount,
    }
  }

  const activities = pj<{ name: string; cost: number }[]>(d.activities, [])
  const pickedActivities = activities.slice(0, Math.min(activities.length, Math.max(2, Math.floor(days / 1.5))))
  const activityCost = pickedActivities.reduce((s, a) => s + a.cost, 0)
  const nights = days - 1
  const breakdown = {
    stay: (d.hostel_night || 600) * nights,
    food: (d.food_day || 500) * days,
    localTransport: (d.transport_day || 300) * days,
    activities: activityCost,
    intercityTransport: d.intercity || 2500,
  }
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0)

  const steps = [
    `Book return transport to ${d.name} (~₹${(d.intercity || 2500).toLocaleString('en-IN')})`,
    `Pick a hostel (~₹${d.hostel_night || 600}/night) — check which Trippy members are staying`,
    'Match with travelers on the same dates and form your group',
    `Plan ${days} days: ${pickedActivities.length ? pickedActivities.map(a => a.name).join(', ') : 'Explore local spots'}`,
    ...pj<string[]>(d.extras, []),
  ]
  const effort = steps.length >= 7 || d.slug === 'spiti-valley' ? 'high' : days >= 5 ? 'medium' : 'low'

  const groupTrips = (db.prepare('SELECT * FROM group_trips WHERE (LOWER(destination) = LOWER(?) OR LOWER(destination) = LOWER(?)) AND (start_date IS NULL OR start_date >= ?) ORDER BY rating DESC').all(rawDest, d.name, today()) as any[]).map(tripShape)
  const cheapestGroup = groupTrips.length ? Math.min(...groupTrips.map(t => t.price)) : null

  const summary = groupTrips.length
    ? `Doing ${d.name} yourself for ${days} days costs about ₹${total.toLocaleString('en-IN')} and needs ${steps.length} things planned — you keep full control of pace and company. Group trips start at ₹${cheapestGroup!.toLocaleString('en-IN')} with transport, stay and a ready-made group handled for you, but on a fixed itinerary. If budget and flexibility matter most, go DIY and use Trippy to find your crew; if you'd rather just show up, join a group departure.`
    : `Doing ${d.name} yourself for ${days} days costs about ₹${total.toLocaleString('en-IN')}. No organized group departures are listed for these dates yet — the DIY path is your best bet, and Trippy can still match you with travelers on the same dates.`

  res.json({
    destination: destShape(d),
    days,
    diy: { breakdown, total, perDay: Math.round(total / days), steps, effort, activities: pickedActivities },
    groupTrips,
    summary,
  })
})

// Everything above (destinations, operator trips, DIY compare) is public
// read-only discovery — guests can browse. Everything below touches user data
// and is authed PER ROUTE (a router-wide use() would 401 guest requests that
// pass through this router on the shared /api mount).

// ---- Self-organized groups, trip hubs & shared itinerary (PRD 1.5, 3.1) ----
function groupShape(g: any, me: string) {
  const members = (db.prepare('SELECT u.*, gm.role FROM group_members gm JOIN users u ON u.id = gm.user_id WHERE gm.group_id = ?').all(g.id) as any[])
    .map(row => ({ ...publicUser(row), role: row.role }))
  const itinerary = db.prepare('SELECT * FROM itinerary_items WHERE group_id = ? ORDER BY day, time, created_at').all(g.id) as any[]
  const polls = (db.prepare('SELECT * FROM polls WHERE group_id = ? ORDER BY created_at DESC').all(g.id) as any[]).map(p => pollShape(p, me))
  const announcements = db.prepare(
    "SELECT m.id, m.content, m.created_at, u.name AS sender_name FROM messages m LEFT JOIN users u ON u.id = m.sender_id WHERE m.chat_id = ? AND m.type = 'announcement' ORDER BY m.created_at DESC LIMIT 5"
  ).all(g.chat_id) as any[]
  return { id: g.id, name: g.name, destination: g.destination, startDate: g.start_date, endDate: g.end_date,
    creatorId: g.creator_id, chatId: g.chat_id, members, itinerary, polls,
    announcements: announcements.map(a => ({ id: a.id, content: a.content, senderName: a.sender_name || 'Trip leader', createdAt: a.created_at })),
    sourceType: g.source_type || null, sourceId: g.source_id || null,
    isLeader: members.some(m => m!.id === me && (m as any).role === 'leader') }
}

function isGroupMember(groupId: string, userId: string) {
  return !!db.prepare('SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?').get(groupId, userId)
}

diyRouter.get('/groups', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT g.* FROM groups g JOIN group_members gm ON gm.group_id = g.id WHERE gm.user_id = ? ORDER BY g.created_at DESC').all(r(req).userId) as any[]
  res.json(rows.map(g => groupShape(g, r(req).userId)))
})

// ---- My Trips (PRD 2.12): every hub/group the traveller belongs to ----
diyRouter.get('/mytrips', requireAuth, (req, res) => {
  const me = r(req).userId
  const rows = db.prepare(`
    SELECT g.*, gm.role, (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS member_count
    FROM groups g JOIN group_members gm ON gm.group_id = g.id
    WHERE gm.user_id = ?
    ORDER BY g.start_date IS NULL, g.start_date ASC`).all(me) as any[]
  const today = new Date().toISOString().slice(0, 10)
  res.json(rows.map(g => {
    // Hub cards carry a source label so My Trips can show where the trip came from.
    let sourceLabel: string | null = null
    if (g.source_type === 'partner') {
      const t = db.prepare('SELECT p.name AS org FROM partner_trips pt JOIN partner_orgs p ON p.id = pt.org_id WHERE pt.id = ?').get(g.source_id) as any
      sourceLabel = t ? `Hosted by ${t.org}` : 'Hosted on Trippy'
    } else if (g.source_type === 'operator') {
      const t = db.prepare('SELECT operator FROM group_trips WHERE id = ?').get(g.source_id) as any
      sourceLabel = t ? `Operated by ${t.operator}` : 'Operator trip'
    }
    // Booking state rides along on hosted-trip hubs so My Trips can show "Booked ✓" etc.
    const booking = g.source_type === 'partner'
      ? (db.prepare("SELECT status FROM bookings WHERE trip_id = ? AND user_id = ? AND status IN ('claimed','confirmed')").get(g.source_id, me) as any)
      : null
    return {
      id: g.id, name: g.name, destination: g.destination, startDate: g.start_date, endDate: g.end_date,
      chatId: g.chat_id, role: g.role, memberCount: g.member_count,
      sourceType: g.source_type || 'diy', sourceLabel: sourceLabel || 'Built with your tribe',
      past: !!g.end_date && g.end_date < today,
      bookingStatus: booking?.status || null,
    }
  }))
})

// ---- Book an operator group trip (payment confirmation step) ----
// Records the booking without joining the hub — hub join is a separate explicit
// step so users understand they're buying a packaged trip, not just joining a chat.
diyRouter.post('/grouptrips/:id/book', requireAuth, (req, res) => {
  const me = r(req).userId
  const t = db.prepare('SELECT * FROM group_trips WHERE id = ?').get(req.params.id) as any
  if (!t) return res.status(404).json({ error: 'Trip not found' })
  if (t.start_date && t.start_date < today()) return res.status(400).json({ error: 'This trip has already departed' })
  const id = uid()
  db.prepare('INSERT OR IGNORE INTO operator_bookings (id, trip_id, user_id) VALUES (?, ?, ?)').run(id, t.id, me)
  const booking = db.prepare('SELECT id, booked_at FROM operator_bookings WHERE trip_id = ? AND user_id = ?').get(t.id, me) as any
  res.json({ bookingId: booking.id, bookedAt: booking.booked_at, trip: tripShape(t) })
})

// ---- Join an operator group trip → its travellers' hub (PRD 2.12/3.1) ----
diyRouter.post('/grouptrips/:id/join', requireAuth, (req, res) => {
  const me = r(req).userId
  const t = db.prepare('SELECT * FROM group_trips WHERE id = ?').get(req.params.id) as any
  if (!t) return res.status(404).json({ error: 'Trip not found' })
  const durationEnd = t.start_date && t.duration_days
    ? new Date(new Date(t.start_date + 'T12:00:00').getTime() + (t.duration_days - 1) * 86400000).toISOString().slice(0, 10)
    : null
  const g = findOrCreateHub({ type: 'operator', id: t.id, name: t.title, destination: t.destination, startDate: t.start_date || null, endDate: durationEnd }, me)
  res.json(groupShape(g, me))
})

diyRouter.post('/groups', requireAuth, (req, res) => {
  const me = r(req).userId
  const { name, destination, startDate, endDate, memberIds } = req.body || {}
  if (!name || !destination) return res.status(400).json({ error: 'Group name and destination are required' })

  // Only mutually connected travelers can be added to a group
  const invitees: string[] = (Array.isArray(memberIds) ? memberIds : []).filter((id: string) =>
    db.prepare("SELECT 1 FROM connections WHERE status = 'accepted' AND ((from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?))").get(me, id, id, me))

  const groupId = uid()
  const chatId = uid()
  db.prepare("INSERT INTO chats (id, type, name, group_id) VALUES (?, 'group', ?, ?)").run(chatId, name, groupId)
  db.prepare('INSERT INTO groups (id, name, destination, start_date, end_date, creator_id, chat_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(groupId, name, destination, startDate || null, endDate || null, me, chatId)
  const insMember = db.prepare('INSERT OR IGNORE INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)')
  const insChatMember = db.prepare('INSERT OR IGNORE INTO chat_members (chat_id, user_id) VALUES (?, ?)')
  insMember.run(groupId, me, 'leader')
  insChatMember.run(chatId, me)
  for (const id of invitees) { insMember.run(groupId, id, 'member'); insChatMember.run(chatId, id) }
  db.prepare("INSERT INTO messages (id, chat_id, sender_id, type, content) VALUES (?, ?, NULL, 'system', ?)")
    .run(uid(), chatId, `Trip group "${name}" created. Build your shared itinerary from the group page!`)
  res.json(groupShape(db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId), me))
})

diyRouter.get('/groups/:id', requireAuth, (req, res) => {
  const me = r(req).userId
  if (!isGroupMember(req.params.id, me)) return res.status(403).json({ error: 'Not a member of this group' })
  const g = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id)
  if (!g) return res.status(404).json({ error: 'Group not found' })
  res.json(groupShape(g, me))
})

diyRouter.post('/groups/:id/members', requireAuth, (req, res) => {
  const me = r(req).userId
  if (!isGroupMember(req.params.id, me)) return res.status(403).json({ error: 'Not a member of this group' })
  const userId = req.body?.userId
  const connected = db.prepare("SELECT 1 FROM connections WHERE status = 'accepted' AND ((from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?))").get(me, userId, userId, me)
  if (!connected) return res.status(400).json({ error: 'You can only add travelers you are connected with' })
  const g = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id) as any
  db.prepare("INSERT OR IGNORE INTO group_members (group_id, user_id, role) VALUES (?, ?, 'member')").run(g.id, userId)
  db.prepare('INSERT OR IGNORE INTO chat_members (chat_id, user_id) VALUES (?, ?)').run(g.chat_id, userId)
  res.json(groupShape(g, me))
})

// ---- Announcements (PRD 3.3): leader-only, land in the hub chat pinned ----
diyRouter.post('/groups/:id/announce', requireAuth, (req, res) => {
  const me = r(req).userId
  const g = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id) as any
  if (!g) return res.status(404).json({ error: 'Group not found' })
  const isLeader = db.prepare("SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'leader'").get(g.id, me)
  if (!isLeader) return res.status(403).json({ error: 'Only the trip leader can post announcements' })
  const content = String(req.body?.content || '').trim()
  if (!content) return res.status(400).json({ error: 'Announcement text is required' })
  db.prepare("INSERT INTO messages (id, chat_id, sender_id, type, content, pinned) VALUES (?, ?, ?, 'announcement', ?, 1)")
    .run(uid(), g.chat_id, me, content)
  res.json(groupShape(g, me))
})

// ---- Polls (PRD 3.6): any member creates; one changeable vote each ----
diyRouter.post('/groups/:id/polls', requireAuth, (req, res) => {
  const me = r(req).userId
  if (!isGroupMember(req.params.id, me)) return res.status(403).json({ error: 'Not a member of this group' })
  const question = String(req.body?.question || '').trim()
  const options = (Array.isArray(req.body?.options) ? req.body.options : []).map((o: any) => String(o).trim()).filter(Boolean)
  if (!question || options.length < 2) return res.status(400).json({ error: 'A question and at least 2 options are required' })
  const pollId = uid()
  db.prepare('INSERT INTO polls (id, group_id, question, options, created_by) VALUES (?, ?, ?, ?, ?)')
    .run(pollId, req.params.id, question, JSON.stringify(options.slice(0, 6)), me)
  // Polls surface inline in the group chat too (PRD 1.4.5) — the message carries the poll id.
  const g = db.prepare('SELECT chat_id FROM groups WHERE id = ?').get(req.params.id) as any
  if (g?.chat_id) db.prepare("INSERT INTO messages (id, chat_id, sender_id, type, content) VALUES (?, ?, ?, 'poll', ?)").run(uid(), g.chat_id, me, pollId)
  res.json(groupShape(db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id), me))
})

diyRouter.post('/groups/:id/polls/:pollId/vote', requireAuth, (req, res) => {
  const me = r(req).userId
  if (!isGroupMember(req.params.id, me)) return res.status(403).json({ error: 'Not a member of this group' })
  const p = db.prepare('SELECT * FROM polls WHERE id = ? AND group_id = ?').get(req.params.pollId, req.params.id) as any
  if (!p) return res.status(404).json({ error: 'Poll not found' })
  if (p.closed) return res.status(400).json({ error: 'This poll is closed' })
  const idx = Number(req.body?.option)
  const count = pj<string[]>(p.options, []).length
  if (!Number.isInteger(idx) || idx < 0 || idx >= count) return res.status(400).json({ error: 'Invalid option' })
  db.prepare('INSERT INTO poll_votes (poll_id, user_id, option_idx) VALUES (?, ?, ?) ON CONFLICT(poll_id, user_id) DO UPDATE SET option_idx = excluded.option_idx')
    .run(p.id, me, idx)
  res.json(groupShape(db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id), me))
})

diyRouter.post('/groups/:id/polls/:pollId/close', requireAuth, (req, res) => {
  const me = r(req).userId
  const p = db.prepare('SELECT * FROM polls WHERE id = ? AND group_id = ?').get(req.params.pollId, req.params.id) as any
  if (!p) return res.status(404).json({ error: 'Poll not found' })
  const isLeader = db.prepare("SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'leader'").get(req.params.id, me)
  if (p.created_by !== me && !isLeader) return res.status(403).json({ error: 'Only the poll creator or trip leader can close a poll' })
  db.prepare('UPDATE polls SET closed = 1 WHERE id = ?').run(p.id)
  res.json(groupShape(db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id), me))
})

// ---- Invite links (PRD 3.7): shareable code, bypasses the connection gate ----
diyRouter.get('/groups/:id/invite', requireAuth, (req, res) => {
  const me = r(req).userId
  if (!isGroupMember(req.params.id, me)) return res.status(403).json({ error: 'Not a member of this group' })
  res.json({ code: ensureInviteCode(req.params.id) })
})

diyRouter.get('/invites/:code', requireAuth, (req, res) => {
  const g = db.prepare('SELECT * FROM groups WHERE invite_code = ?').get(req.params.code) as any
  if (!g) return res.status(404).json({ error: 'Invite not found or expired' })
  const memberCount = (db.prepare('SELECT COUNT(*) c FROM group_members WHERE group_id = ?').get(g.id) as any).c
  res.json({ name: g.name, destination: g.destination, startDate: g.start_date, endDate: g.end_date,
    memberCount, alreadyMember: isGroupMember(g.id, r(req).userId) })
})

diyRouter.post('/invites/:code/join', requireAuth, (req, res) => {
  const me = r(req).userId
  const g = db.prepare('SELECT * FROM groups WHERE invite_code = ?').get(req.params.code) as any
  if (!g) return res.status(404).json({ error: 'Invite not found or expired' })
  db.prepare("INSERT OR IGNORE INTO group_members (group_id, user_id, role) VALUES (?, ?, 'member')").run(g.id, me)
  db.prepare('INSERT OR IGNORE INTO chat_members (chat_id, user_id) VALUES (?, ?)').run(g.chat_id, me)
  res.json(groupShape(g, me))
})

// Shared itinerary — any member can add/edit (self-organized groups, PRD 1.5)
diyRouter.post('/groups/:id/itinerary', requireAuth, (req, res) => {
  const me = r(req).userId
  if (!isGroupMember(req.params.id, me)) return res.status(403).json({ error: 'Not a member of this group' })
  const { day, time, title, notes, cost } = req.body || {}
  if (!title || !day) return res.status(400).json({ error: 'Day and title are required' })
  const id = uid()
  db.prepare('INSERT INTO itinerary_items (id, group_id, day, time, title, notes, cost, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, req.params.id, Number(day), time || '', title, notes || '', Number(cost) || 0, me)
  res.json(db.prepare('SELECT * FROM itinerary_items WHERE id = ?').get(id))
})

// Edit an existing itinerary item — any member (PRD 1.5.4: shared AND editable).
diyRouter.put('/groups/:id/itinerary/:itemId', requireAuth, (req, res) => {
  const me = r(req).userId
  if (!isGroupMember(req.params.id, me)) return res.status(403).json({ error: 'Not a member of this group' })
  const it = db.prepare('SELECT * FROM itinerary_items WHERE id = ? AND group_id = ?').get(req.params.itemId, req.params.id) as any
  if (!it) return res.status(404).json({ error: 'Itinerary item not found' })
  const b = req.body || {}
  const title = b.title !== undefined ? String(b.title).trim() : it.title
  if (!title) return res.status(400).json({ error: 'Title is required' })
  db.prepare('UPDATE itinerary_items SET day = ?, time = ?, title = ?, notes = ?, cost = ? WHERE id = ?')
    .run(b.day !== undefined ? Number(b.day) || it.day : it.day, b.time !== undefined ? String(b.time) : it.time,
      title, b.notes !== undefined ? String(b.notes) : it.notes, b.cost !== undefined ? Number(b.cost) || 0 : it.cost, it.id)
  res.json(db.prepare('SELECT * FROM itinerary_items WHERE id = ?').get(it.id))
})

diyRouter.delete('/groups/:id/itinerary/:itemId', requireAuth, (req, res) => {
  const me = r(req).userId
  if (!isGroupMember(req.params.id, me)) return res.status(403).json({ error: 'Not a member of this group' })
  db.prepare('DELETE FROM itinerary_items WHERE id = ? AND group_id = ?').run(req.params.itemId, req.params.id)
  res.json({ ok: true })
})

// AI itinerary suggestions (PRD 1.5: "available but never forced").
// Rule-based day plan from the destination's activity catalog for the MVP.
// Dedupes against what the group already planned, spreads activities evenly
// across the trip, and leads with free/cheap picks for budget-majority groups.
diyRouter.post('/groups/:id/suggest-itinerary', requireAuth, (req, res) => {
  const me = r(req).userId
  if (!isGroupMember(req.params.id, me)) return res.status(403).json({ error: 'Not a member of this group' })
  const g = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id) as any
  const d = db.prepare('SELECT * FROM destinations WHERE slug = ?').get(g.destination) as any
  if (!d) return res.status(400).json({ error: 'No suggestions available for this destination yet' })
  const days = g.start_date && g.end_date
    ? Math.max(2, Math.round((Date.parse(g.end_date) - Date.parse(g.start_date)) / 86400000) + 1)
    : 4

  // Never re-suggest what's already on the shared plan (or already offered names).
  const planned = new Set((db.prepare('SELECT title FROM itinerary_items WHERE group_id = ?').all(g.id) as any[])
    .map(row => String(row.title).trim().toLowerCase()))
  const has = (title: string) => planned.has(title.trim().toLowerCase())

  // Group budget: majority member preference decides whether cheap/free leads.
  const budgets = (db.prepare('SELECT u.budget FROM group_members gm JOIN users u ON u.id = gm.user_id WHERE gm.group_id = ?').all(g.id) as any[])
    .map(row => row.budget).filter(Boolean)
  const budgetFirst = budgets.filter(b => b === 'budget').length >= Math.ceil(budgets.length / 2) && budgets.length > 0

  let activities = pj<{ name: string; cost: number }[]>(d.activities, []).filter(a => !has(a.name))
  if (budgetFirst) activities = [...activities].sort((a, b) => a.cost - b.cost)

  const suggestions: any[] = []
  if (planned.size === 0) {
    suggestions.push({ day: 1, time: '14:00', title: 'Check in & explore around the hostel', notes: `Settle in, meet the group, walk around ${d.name}`, cost: 0 })
  }
  // Spread evenly across days 2..N (or day 1 onward when the plan already has a start).
  const firstDay = planned.size === 0 ? 2 : 1
  const span = Math.max(1, days - firstDay + 1)
  activities.forEach((a, i) => {
    const day = Math.min(days, firstDay + Math.floor(i * span / Math.max(1, activities.length)))
    suggestions.push({ day, time: i % 2 === 0 ? '09:00' : '16:00', title: a.name, notes: '', cost: a.cost })
  })
  if (!has('Group dinner & photo swap')) {
    suggestions.push({ day: days, time: '18:00', title: 'Group dinner & photo swap', notes: 'Settle expenses, share pictures, plan the next one', cost: 400 })
  }
  res.json({
    suggestions,
    note: d.best_months ? `Best time for ${d.name}: ${d.best_months}` : undefined,
    budgetAware: budgetFirst || undefined,
  })
})

// ---- Document vault (PRD 3.4): per-hub storage of links, e-tickets, permits ----
const DOC_TYPES = ['e-ticket', 'hotel booking', 'permit', 'flight', 'bus', 'train', 'visa', 'insurance', 'other']

diyRouter.get('/groups/:id/documents', requireAuth, (req, res) => {
  const me = r(req).userId
  if (!isGroupMember(req.params.id, me)) return res.status(403).json({ error: 'Not a member' })
  const docs = db.prepare(`
    SELECT d.*, u.name AS added_by_name, u.avatar_emoji, u.avatar_color
    FROM trip_documents d LEFT JOIN users u ON u.id = d.added_by
    WHERE d.group_id = ? ORDER BY d.created_at DESC
  `).all(req.params.id) as any[]
  res.json(docs.map(d => ({
    id: d.id, docType: d.doc_type, name: d.name, refNumber: d.ref_number,
    date: d.date, url: d.url, notes: d.notes, createdAt: d.created_at,
    addedBy: { id: d.added_by, name: d.added_by_name, avatarEmoji: d.avatar_emoji, avatarColor: d.avatar_color },
    canDelete: d.added_by === me,
  })))
})

diyRouter.post('/groups/:id/documents', requireAuth, (req, res) => {
  const me = r(req).userId
  const g = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id) as any
  if (!g || !isGroupMember(req.params.id, me)) return res.status(403).json({ error: 'Not a member' })
  const name = String(req.body?.name || '').trim()
  if (!name) return res.status(400).json({ error: 'Document name is required' })
  const docType = DOC_TYPES.includes(req.body?.docType) ? req.body.docType : 'other'
  const url = req.body?.url ? String(req.body.url).trim() : null
  if (url && !url.startsWith('http')) return res.status(400).json({ error: 'URL must start with http' })
  const id = uid()
  db.prepare(`INSERT INTO trip_documents (id, group_id, added_by, doc_type, name, ref_number, date, url, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, g.id, me, docType, name, req.body?.refNumber || null, req.body?.date || null, url, req.body?.notes || null)
  res.json(db.prepare('SELECT * FROM trip_documents WHERE id = ?').get(id))
})

diyRouter.delete('/groups/:id/documents/:docId', requireAuth, (req, res) => {
  const me = r(req).userId
  const g = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id) as any
  if (!g || !isGroupMember(req.params.id, me)) return res.status(403).json({ error: 'Not a member' })
  const doc = db.prepare('SELECT * FROM trip_documents WHERE id = ? AND group_id = ?').get(req.params.docId, g.id) as any
  if (!doc) return res.status(404).json({ error: 'Document not found' })
  const isLeader = db.prepare("SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'leader'").get(g.id, me)
  if (doc.added_by !== me && !isLeader) return res.status(403).json({ error: 'You can only delete your own documents' })
  db.prepare('DELETE FROM trip_documents WHERE id = ?').run(doc.id)
  res.json({ ok: true })
})

// ---- Trip photo gallery (PRD 3.11): shared URL-based album per hub ----
diyRouter.get('/groups/:id/photos', requireAuth, (req, res) => {
  const me = r(req).userId
  if (!isGroupMember(req.params.id, me)) return res.status(403).json({ error: 'Not a member' })
  const photos = db.prepare(`
    SELECT p.*, u.name AS added_by_name, u.avatar_emoji, u.avatar_color
    FROM trip_photos p LEFT JOIN users u ON u.id = p.added_by
    WHERE p.group_id = ? ORDER BY p.taken_at DESC, p.created_at DESC
  `).all(req.params.id) as any[]
  res.json(photos.map(p => ({
    id: p.id, url: p.url, caption: p.caption, takenAt: p.taken_at, createdAt: p.created_at,
    addedBy: { id: p.added_by, name: p.added_by_name, avatarEmoji: p.avatar_emoji, avatarColor: p.avatar_color },
    canDelete: p.added_by === me,
  })))
})

diyRouter.post('/groups/:id/photos', requireAuth, (req, res) => {
  const me = r(req).userId
  const g = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id) as any
  if (!g || !isGroupMember(req.params.id, me)) return res.status(403).json({ error: 'Not a member' })
  const url = String(req.body?.url || '').trim()
  if (!url.startsWith('http')) return res.status(400).json({ error: 'Photo URL must start with http' })
  const id = uid()
  db.prepare('INSERT INTO trip_photos (id, group_id, added_by, url, caption, taken_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, g.id, me, url, req.body?.caption || null, req.body?.takenAt || null)
  res.json({ id, url, caption: req.body?.caption || null })
})

diyRouter.delete('/groups/:id/photos/:photoId', requireAuth, (req, res) => {
  const me = r(req).userId
  const g = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id) as any
  if (!g || !isGroupMember(req.params.id, me)) return res.status(403).json({ error: 'Not a member' })
  const photo = db.prepare('SELECT * FROM trip_photos WHERE id = ? AND group_id = ?').get(req.params.photoId, g.id) as any
  if (!photo) return res.status(404).json({ error: 'Photo not found' })
  const isLeader = db.prepare("SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'leader'").get(g.id, me)
  if (photo.added_by !== me && !isLeader) return res.status(403).json({ error: 'You can only delete your own photos' })
  db.prepare('DELETE FROM trip_photos WHERE id = ?').run(photo.id)
  res.json({ ok: true })
})

// ---- AI Highlights Reel (PRD 3.12): Claude generates trip story + IG caption ----
diyRouter.post('/groups/:id/highlights', requireAuth, async (req, res) => {
  const me = r(req).userId
  const g = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id) as any
  if (!g || !isGroupMember(req.params.id, me)) return res.status(403).json({ error: 'Not a member' })

  const members = db.prepare('SELECT u.name FROM group_members gm JOIN users u ON u.id = gm.user_id WHERE gm.group_id = ?').all(g.id) as any[]
  const photos = db.prepare('SELECT url, caption FROM trip_photos WHERE group_id = ? ORDER BY created_at DESC LIMIT 20').all(g.id) as any[]
  const itinerary = db.prepare('SELECT day, time, title, notes FROM itinerary_items WHERE group_id = ? ORDER BY day, time').all(g.id) as any[]
  const announcements = db.prepare("SELECT content FROM messages WHERE chat_id = ? AND type = 'announcement' ORDER BY created_at DESC LIMIT 5").all(g.chat_id) as any[]
  const expenses = db.prepare('SELECT SUM(amount) total FROM trip_expenses WHERE group_id = ?').get(g.id) as any

  const ctx = [
    `Trip: "${g.name}" to ${g.destination.replace(/-/g, ' ')}`,
    g.start_date ? `Dates: ${g.start_date} – ${g.end_date}` : '',
    `${members.length} travellers: ${members.map((m: any) => m.name).join(', ')}`,
    photos.length ? `Photos (${photos.length}): ${photos.filter((p: any) => p.caption).map((p: any) => p.caption).join(' | ')}` : '',
    itinerary.length ? `Itinerary: ${itinerary.map((i: any) => `Day ${i.day} ${i.time || ''} – ${i.title}`).join('; ')}` : '',
    announcements.length ? `Announcements: ${announcements.map((a: any) => a.content).join(' | ')}` : '',
    expenses?.total ? `Total group spend: ₹${Math.round(expenses.total).toLocaleString('en-IN')}` : '',
  ].filter(Boolean).join('\n')

  const prompt = `You are writing a warm, vivid trip recap for a group of friends who just returned from a trip together.

Trip context:
${ctx}

Write a trip highlights reel with exactly this JSON structure (no markdown, pure JSON):
{
  "story": "3-4 sentence narrative capturing the spirit of the trip — vivid, personal, no corporate language",
  "moments": ["3-5 short memorable highlight bullet points from the trip"],
  "caption": "One punchy Instagram caption with 3-5 relevant hashtags, max 150 characters"
}

Keep it warm, specific, and fun. Reference real details from the context above.`

  let reel: any = null

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic()
      const stream = client.messages.stream({
        model: 'claude-opus-5',
        max_tokens: 800,
        thinking: { type: 'adaptive' },
        messages: [{ role: 'user', content: prompt }],
      })
      const msg = await stream.finalMessage()
      const text = msg.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('').trim()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) reel = JSON.parse(jsonMatch[0])
    } catch (err: any) {
      console.error('[highlights] Claude error:', err?.message || err)
    }
  }

  // Rule-based fallback when Claude is unavailable
  if (!reel) {
    const dest = g.destination.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    const mNames = members.slice(0, 3).map((m: any) => m.name.split(' ')[0]).join(', ')
    reel = {
      story: `${mNames} and the crew wrapped up an incredible ${g.name} adventure. ${itinerary.length} stops, ${photos.length} memories, and stories worth retelling. ${dest} delivered exactly what the group came for — and then some.`,
      moments: [
        ...(itinerary.slice(0, 3).map((i: any) => i.title)),
        expenses?.total ? `₹${Math.round(expenses.total).toLocaleString('en-IN')} well spent` : 'Every penny worth it',
      ].filter(Boolean),
      caption: `${dest} with the crew 🏔️ Unforgettable. #TripWithTrippy #${dest.replace(/\s/g, '')} #SoloTravel`,
    }
  }

  db.prepare("UPDATE groups SET highlights_reel = ?, highlights_at = datetime('now') WHERE id = ?")
    .run(JSON.stringify(reel), g.id)
  res.json({ ...reel, aiPowered: !!process.env.ANTHROPIC_API_KEY })
})

// GET stored highlights (no regeneration, just read)
diyRouter.get('/groups/:id/highlights', requireAuth, (req, res) => {
  const me = r(req).userId
  if (!isGroupMember(req.params.id, me)) return res.status(403).json({ error: 'Not a member' })
  const g = db.prepare('SELECT highlights_reel, highlights_at FROM groups WHERE id = ?').get(req.params.id) as any
  if (!g?.highlights_reel) return res.json(null)
  try { res.json({ ...JSON.parse(g.highlights_reel), generatedAt: g.highlights_at }) }
  catch { res.json(null) }
})
