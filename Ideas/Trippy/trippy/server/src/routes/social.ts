import { Router } from 'express'
import { db, uid, j, pj, today } from '../db.js'
import { requireAuth, type AuthedRequest } from '../lib/auth.js'
import { compatibility, datesOverlap, personalityFor, DESTINATION_INTERESTS } from '../lib/matching.js'
import { publicUser, ownUser } from '../lib/shape.js'

export const socialRouter = Router()
socialRouter.use(requireAuth)

const r = (req: any) => req as AuthedRequest

function blockedIds(userId: string): Set<string> {
  const rows = db.prepare('SELECT blocker_id, blocked_id FROM blocks WHERE blocker_id = ? OR blocked_id = ?').all(userId, userId) as any[]
  const set = new Set<string>()
  for (const row of rows) set.add(row.blocker_id === userId ? row.blocked_id : row.blocker_id)
  return set
}

// ---- Me / profile ----
// Latest ID-verification request, so the profile can show pending/rejected state.
function idVerificationOf(userId: string) {
  const v = db.prepare('SELECT doc_type, status, reason, created_at FROM id_verifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId) as any
  return v ? { docType: v.doc_type, status: v.status, reason: v.reason, createdAt: v.created_at } : null
}

socialRouter.get('/me', (req, res) => res.json({ ...ownUser(r(req).user), idVerification: idVerificationOf(r(req).userId) }))

// Past trips: bounded self-reported history — destination + year (+ optional note).
function cleanPastTrips(input: any): string | null {
  if (!Array.isArray(input)) return null
  const thisYear = new Date().getFullYear()
  const rows = input.slice(0, 20).map((t: any) => ({
    destination: String(t?.destination || '').trim().slice(0, 60),
    year: Number(t?.year) || null,
    note: String(t?.note || '').trim().slice(0, 140),
  })).filter(t => t.destination && t.year && t.year >= 1990 && t.year <= thisYear)
  return j(rows)
}

// Socials: handles only (no URLs) so profiles can't smuggle arbitrary links.
const SOCIAL_KEYS = ['instagram', 'linkedin', 'youtube'] as const
function cleanSocials(input: any): string | null {
  if (!input || typeof input !== 'object') return null
  const out: Record<string, string> = {}
  for (const k of SOCIAL_KEYS) {
    const v = String(input[k] || '').trim().replace(/^@/, '').replace(/^https?:\/\/[^/]+\//i, '')
    if (v && /^[\w.\-]{2,60}$/.test(v)) out[k] = v
  }
  return j(out)
}

socialRouter.put('/me', (req, res) => {
  const b = req.body || {}
  if (b.age !== undefined && (typeof b.age !== 'number' || b.age < 13 || b.age > 120))
    return res.status(400).json({ error: 'Age must be between 13 and 120' })
  const u = r(req).user
  const fields = {
    name: b.name ?? u.name,
    age: b.age ?? u.age,
    gender: b.gender ?? u.gender,
    city: b.city ?? u.city,
    avatar_color: b.avatarColor ?? u.avatar_color,
    avatar_emoji: b.avatarEmoji ?? u.avatar_emoji,
    travel_style: b.travelStyle ?? u.travel_style,
    interests: b.interests ? j(b.interests) : u.interests,
    budget: b.budget ?? u.budget,
    languages: b.languages ? j(b.languages) : u.languages,
    bio: b.bio ?? u.bio,
    emergency_name: b.emergencyName ?? u.emergency_name,
    emergency_phone: b.emergencyPhone ?? u.emergency_phone,
    past_trips: cleanPastTrips(b.pastTrips) ?? u.past_trips,
    socials: cleanSocials(b.socials) ?? u.socials,
  }
  const personality = personalityFor({ travel_style: fields.travel_style, interests: fields.interests })
  const onboarded = fields.name && fields.age && fields.travel_style && fields.budget ? 1 : 0
  db.prepare(`UPDATE users SET name=?, age=?, gender=?, city=?, avatar_color=?, avatar_emoji=?, travel_style=?, interests=?, budget=?, languages=?, bio=?, emergency_name=?, emergency_phone=?, past_trips=?, socials=?, personality=?, onboarded=? WHERE id=?`)
    .run(fields.name, fields.age, fields.gender, fields.city, fields.avatar_color, fields.avatar_emoji, fields.travel_style, fields.interests, fields.budget, fields.languages, fields.bio, fields.emergency_name, fields.emergency_phone, fields.past_trips, fields.socials, personality, onboarded, u.id)
  res.json({ ...ownUser(db.prepare('SELECT * FROM users WHERE id = ?').get(u.id)), idVerification: idVerificationOf(u.id) })
})

// Government-ID verification (PRD 1.1.3): traveller submits doc type + last 4
// digits; the Trippy team approves/rejects in the Admin Console (audited).
// No document image is stored — real KYC upload waits for file storage.
const DOC_TYPES = ['aadhaar', 'passport', 'driving_licence', 'voter_id']
socialRouter.post('/me/verify-id', (req, res) => {
  const u = r(req).user
  if (u.id_verified) return res.status(400).json({ error: 'Your ID is already verified' })
  const docType = String(req.body?.docType || '')
  const docLast4 = String(req.body?.docLast4 || '').trim()
  if (!DOC_TYPES.includes(docType)) return res.status(400).json({ error: 'Choose a valid document type' })
  if (!/^\d{4}$/.test(docLast4)) return res.status(400).json({ error: 'Enter the last 4 digits of the document' })
  const existing = idVerificationOf(u.id)
  if (existing?.status === 'pending') return res.status(400).json({ error: 'A verification request is already under review' })
  db.prepare('INSERT INTO id_verifications (id, user_id, doc_type, doc_last4) VALUES (?, ?, ?, ?)').run(uid(), u.id, docType, docLast4)
  res.json({ idVerification: idVerificationOf(u.id) })
})

// ---- Community vouches (PRD 1.2.10): only travel companions can vouch ----
// Eligibility = you shared a trip hub / group. Trust score is recomputed from
// real vouches the moment the first one lands (replacing any seeded value).
socialRouter.post('/users/:id/vouch', (req, res) => {
  const me = r(req).userId
  const them = req.params.id
  if (me === them) return res.status(400).json({ error: "You can't vouch for yourself" })
  if (!db.prepare('SELECT 1 FROM users WHERE id = ?').get(them)) return res.status(404).json({ error: 'User not found' })
  const shared = db.prepare('SELECT a.group_id FROM group_members a JOIN group_members b ON b.group_id = a.group_id AND b.user_id = ? WHERE a.user_id = ? LIMIT 1').get(them, me) as any
  if (!shared) return res.status(403).json({ error: 'You can only vouch for travellers you shared a trip with' })
  const rating = Number(req.body?.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1–5' })
  const text = String(req.body?.text || '').trim().slice(0, 280)
  db.prepare('INSERT INTO vouches (id, from_user, to_user, group_id, rating, text) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(from_user, to_user) DO UPDATE SET rating = excluded.rating, text = excluded.text, group_id = excluded.group_id')
    .run(uid(), me, them, shared.group_id, rating, text)
  const agg = db.prepare('SELECT ROUND(AVG(rating), 1) score, COUNT(*) n FROM vouches WHERE to_user = ?').get(them) as any
  db.prepare('UPDATE users SET trust_score = ?, trust_reviews = ? WHERE id = ?').run(agg.score, agg.n, them)
  res.json({ ok: true, trustScore: agg.score, trustReviews: agg.n })
})

// ---- In-app notifications (bookings backbone; future home for push 1.4.7) ----
socialRouter.get('/notifications', (req, res) => {
  const rows = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30').all(r(req).userId) as any[]
  res.json({
    notifications: rows.map(n => ({ id: n.id, type: n.type, title: n.title, body: n.body, link: n.link, read: !!n.read, createdAt: n.created_at })),
    unread: (db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND read = 0').get(r(req).userId) as any).c,
  })
})

socialRouter.post('/notifications/read-all', (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(r(req).userId)
  res.json({ ok: true })
})

// Interest suggestions for a destination (PRD 1.1 AI role)
socialRouter.get('/suggest-interests', (req, res) => {
  const dest = String(req.query.destination || '')
  res.json({ interests: DESTINATION_INTERESTS[dest] || [] })
})

// ---- Trips (upcoming travel plans) ----
socialRouter.get('/trips', (req, res) => {
  const rows = db.prepare('SELECT * FROM trips WHERE user_id = ? ORDER BY start_date').all(r(req).userId)
  res.json(rows)
})

socialRouter.post('/trips', (req, res) => {
  const { destination, startDate, endDate, flexible } = req.body || {}
  if (!destination || !startDate || !endDate) return res.status(400).json({ error: 'Destination and dates are required' })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate))
    return res.status(400).json({ error: 'Dates must be in YYYY-MM-DD format' })
  if (endDate < startDate) return res.status(400).json({ error: 'End date must be after start date' })
  const id = uid()
  db.prepare('INSERT INTO trips (id, user_id, destination, start_date, end_date, flexible) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, r(req).userId, destination, startDate, endDate, flexible ? 1 : 0)
  res.json(db.prepare('SELECT * FROM trips WHERE id = ?').get(id))
})

socialRouter.delete('/trips/:id', (req, res) => {
  db.prepare('DELETE FROM trips WHERE id = ? AND user_id = ?').run(req.params.id, r(req).userId)
  res.json({ ok: true })
})

// ---- Matching engine (PRD 1.2) ----
socialRouter.get('/matches', (req, res) => {
  const me = r(req).user
  const tripId = req.query.tripId as string | undefined
  const myTrip = (tripId
    ? db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(tripId, me.id)
    : db.prepare('SELECT * FROM trips WHERE user_id = ? AND end_date >= ? ORDER BY start_date LIMIT 1').get(me.id, today())) as any
  if (!myTrip) return res.json({ trip: null, matches: [] })
  if (!me.name) return res.json({ trip: myTrip, matches: [], error: 'complete_profile' })

  // Secondary filters (PRD 1.2.7) — applied to the matched traveller, not the trip.
  const fGender = ['female', 'male', 'other'].includes(String(req.query.gender)) ? String(req.query.gender) : ''
  const fBudget = ['budget', 'mid-range', 'premium'].includes(String(req.query.budget)) ? String(req.query.budget) : ''
  const fAgeMin = Number(req.query.ageMin) || 0
  const fAgeMax = Number(req.query.ageMax) || 200
  const fVerified = req.query.verifiedOnly === '1'

  const blocked = blockedIds(me.id)
  const destSlug = (myTrip.destination || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const candidates = db.prepare(`
    SELECT t.*, u.id AS u_id FROM trips t JOIN users u ON u.id = t.user_id
    WHERE (LOWER(t.destination) = LOWER(?) OR LOWER(t.destination) = LOWER(?)) AND t.user_id != ? AND u.onboarded = 1
  `).all(myTrip.destination, destSlug, me.id) as any[]

  const connRows = db.prepare('SELECT * FROM connections WHERE from_user = ? OR to_user = ?').all(me.id, me.id) as any[]
  const connByOther: Record<string, any> = {}
  for (const c of connRows) connByOther[c.from_user === me.id ? c.to_user : c.from_user] = c

  const seen = new Set<string>()
  const filtered = candidates
    .filter(t => datesOverlap(myTrip.start_date, myTrip.end_date, t.start_date, t.end_date, 3))
    .filter(t => !blocked.has(t.user_id))
    .filter(t => (seen.has(t.user_id) ? false : (seen.add(t.user_id), true)))
  const usersById: Record<string, any> = {}
  if (filtered.length > 0) {
    const placeholders = filtered.map(() => '?').join(',')
    const userIds = filtered.map(t => t.user_id)
    ;(db.prepare(`SELECT * FROM users WHERE id IN (${placeholders})`).all(...userIds) as any[]).forEach(u => { usersById[u.id] = u })
  }
  const matches = filtered
    .map(t => {
      const other = usersById[t.user_id]
      if (!other) return null
      const { score, reasons } = compatibility(me, other)
      const conn = connByOther[t.user_id]
      return {
        user: publicUser(other)!,
        trip: { destination: t.destination, startDate: t.start_date, endDate: t.end_date, flexible: !!t.flexible },
        score, reasons,
        connection: conn ? { id: conn.id, status: conn.status, direction: conn.from_user === me.id ? 'outgoing' : 'incoming', chatId: conn.chat_id } : null,
      }
    })
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .filter(m => {
      const u = m.user
      if (fGender && u.gender !== fGender) return false
      if (fBudget && u.budget !== fBudget) return false
      if ((u.age || 0) < fAgeMin || (u.age || 0) > fAgeMax) return false
      if (fVerified && !u.idVerified) return false
      return true
    })
    // Verified profiles are prioritized; unverified are labeled client-side (PRD 1.2)
    .sort((a, b) => (Number(b.user.idVerified) - Number(a.user.idVerified)) || b.score - a.score)

  res.json({ trip: myTrip, matches })
})

// ---- Connections (travel requests) ----
socialRouter.post('/connections', (req, res) => {
  const me = r(req).userId
  const { toUserId, message } = req.body || {}
  if (!toUserId || toUserId === me) return res.status(400).json({ error: 'Invalid user' })
  if (!db.prepare('SELECT 1 FROM users WHERE id = ?').get(toUserId)) return res.status(404).json({ error: 'User not found' })
  if (blockedIds(me).has(toUserId)) return res.status(400).json({ error: 'You cannot connect with this user' })
  const existing = db.prepare('SELECT * FROM connections WHERE (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?)')
    .get(me, toUserId, toUserId, me) as any
  if (existing) {
    // If they already requested us, treat sending a request back as acceptance
    if (existing.status === 'pending' && existing.from_user === toUserId) return acceptConnection(existing, res)
    return res.status(400).json({ error: 'Request already exists' })
  }
  const id = uid()
  db.prepare('INSERT INTO connections (id, from_user, to_user, message) VALUES (?, ?, ?, ?)').run(id, me, toUserId, message || '')
  const conn = db.prepare('SELECT * FROM connections WHERE id = ?').get(id) as any
  // Demo-mode nicety: seeded travelers accept incoming requests instantly so the
  // connect → group → trip flow is testable without a second real user online.
  const target = db.prepare('SELECT is_demo FROM users WHERE id = ?').get(toUserId) as any
  if (target?.is_demo) return acceptConnection(conn, res)
  res.json(conn)
})

function acceptConnection(conn: any, res: any) {
  const chatId = uid()
  db.prepare("INSERT INTO chats (id, type) VALUES (?, 'dm')").run(chatId)
  db.prepare('INSERT INTO chat_members (chat_id, user_id) VALUES (?, ?), (?, ?)').run(chatId, conn.from_user, chatId, conn.to_user)
  db.prepare("INSERT INTO messages (id, chat_id, sender_id, type, content) VALUES (?, ?, NULL, 'system', ?)")
    .run(uid(), chatId, 'You are now connected! Say hi and start planning. Keep personal contact details private until you both agree.')
  db.prepare("UPDATE connections SET status = 'accepted', chat_id = ? WHERE id = ?").run(chatId, conn.id)
  res.json({ ...conn, status: 'accepted', chat_id: chatId })
}

socialRouter.get('/connections', (req, res) => {
  const me = r(req).userId
  const blocked = blockedIds(me)
  const rows = db.prepare('SELECT * FROM connections WHERE from_user = ? OR to_user = ? ORDER BY created_at DESC').all(me, me) as any[]
  const enrich = (c: any) => {
    const otherId = c.from_user === me ? c.to_user : c.from_user
    return { id: c.id, status: c.status, message: c.message, chatId: c.chat_id, createdAt: c.created_at,
      direction: c.from_user === me ? 'outgoing' : 'incoming',
      user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(otherId)) }
  }
  const visible = rows.filter(c => !blocked.has(c.from_user === me ? c.to_user : c.from_user))
  res.json({
    incoming: visible.filter(c => c.status === 'pending' && c.to_user === me).map(enrich),
    outgoing: visible.filter(c => c.status === 'pending' && c.from_user === me).map(enrich),
    accepted: visible.filter(c => c.status === 'accepted').map(enrich),
  })
})

socialRouter.post('/connections/:id/respond', (req, res) => {
  const me = r(req).userId
  const conn = db.prepare('SELECT * FROM connections WHERE id = ? AND to_user = ? AND status = ?').get(req.params.id, me, 'pending') as any
  if (!conn) return res.status(404).json({ error: 'Request not found' })
  if (req.body?.accept) return acceptConnection(conn, res)
  db.prepare("UPDATE connections SET status = 'declined' WHERE id = ?").run(conn.id)
  res.json({ ...conn, status: 'declined' })
})

// Withdraw an outgoing pending request (only the sender, only while pending)
socialRouter.delete('/connections/:id', requireAuth, (req, res) => {
  const me = r(req).userId
  const conn = db.prepare('SELECT * FROM connections WHERE id = ? AND from_user = ? AND status = ?')
    .get(req.params.id, me, 'pending') as any
  if (!conn) return res.status(404).json({ error: 'Request not found or already responded to' })
  db.prepare('DELETE FROM connections WHERE id = ?').run(conn.id)
  res.json({ ok: true })
})

// Travelers to the same destination on any upcoming dates — shown when the
// date-exact match list is empty so the user can see who else is going and
// optionally adjust their dates or connect anyway.
socialRouter.get('/matches/nearby', (req, res) => {
  const me = r(req).user
  const destination = req.query.destination as string
  if (!destination) return res.status(400).json({ error: 'destination required' })
  const horizon = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10)
  const blocked = blockedIds(me.id)
  const connRows = db.prepare('SELECT * FROM connections WHERE from_user = ? OR to_user = ?').all(me.id, me.id) as any[]
  const connByOther: Record<string, any> = {}
  for (const c of connRows) connByOther[c.from_user === me.id ? c.to_user : c.from_user] = c

  const seen = new Set<string>()
  const rows = db.prepare(`
    SELECT t.start_date, t.end_date, t.user_id AS u_id FROM trips t
    JOIN users u ON u.id = t.user_id
    WHERE t.destination = ? AND t.user_id != ? AND u.onboarded = 1
      AND t.end_date >= ? AND t.start_date <= ?
    ORDER BY t.start_date
  `).all(destination, me.id, today(), horizon) as any[]

  const nearbyFiltered = rows
    .filter(t => !blocked.has(t.u_id))
    .filter(t => (seen.has(t.u_id) ? false : (seen.add(t.u_id), true)))
    .slice(0, 8)
  const nearbyUsersById: Record<string, any> = {}
  if (nearbyFiltered.length > 0) {
    const ph = nearbyFiltered.map(() => '?').join(',')
    ;(db.prepare(`SELECT * FROM users WHERE id IN (${ph})`).all(...nearbyFiltered.map(t => t.u_id)) as any[]).forEach(u => { nearbyUsersById[u.id] = u })
  }
  const travelers = nearbyFiltered.map(t => {
      const u = nearbyUsersById[t.u_id]
      const conn = connByOther[t.u_id]
      return {
        ...publicUser(u),
        trip: { startDate: t.start_date, endDate: t.end_date },
        connection: conn ? { id: conn.id, status: conn.status, direction: conn.from_user === me.id ? 'outgoing' : 'incoming' } : null,
      }
    })
  res.json(travelers)
})

// ---- Public profiles, report & block ----
socialRouter.get('/users/:id', (req, res) => {
  const me = r(req).userId
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!u) return res.status(404).json({ error: 'User not found' })
  const vouches = (db.prepare('SELECT v.rating, v.text, v.created_at, u.id vid, u.name, u.avatar_emoji, u.avatar_color FROM vouches v JOIN users u ON u.id = v.from_user WHERE v.to_user = ? ORDER BY v.created_at DESC LIMIT 10').all(req.params.id) as any[])
    .map(v => ({ rating: v.rating, text: v.text, createdAt: v.created_at, from: { id: v.vid, name: v.name, avatarEmoji: v.avatar_emoji, avatarColor: v.avatar_color } }))
  const sharedTrip = me !== req.params.id && !!db.prepare('SELECT 1 FROM group_members a JOIN group_members b ON b.group_id = a.group_id AND b.user_id = ? WHERE a.user_id = ? LIMIT 1').get(req.params.id, me)
  const myVouch = db.prepare('SELECT rating FROM vouches WHERE from_user = ? AND to_user = ?').get(me, req.params.id) as any
  const followerCount = (db.prepare('SELECT COUNT(*) c FROM follows WHERE following_id = ?').get(req.params.id) as any).c
  const followingCount = (db.prepare('SELECT COUNT(*) c FROM follows WHERE follower_id = ?').get(req.params.id) as any).c
  const isFollowing = me !== req.params.id && !!db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(me, req.params.id)
  res.json({ ...publicUser(u), vouches, canVouch: sharedTrip && !myVouch, hasVouched: !!myVouch, followerCount, followingCount, isFollowing })
})

socialRouter.post('/users/:id/report', (req, res) => {
  const reason = String(req.body?.reason || '').trim()
  if (!reason) return res.status(400).json({ error: 'Please describe the issue' })
  db.prepare('INSERT INTO reports (id, reporter_id, reported_id, reason) VALUES (?, ?, ?, ?)')
    .run(uid(), r(req).userId, req.params.id, reason)
  res.json({ ok: true })
})

socialRouter.post('/users/:id/block', (req, res) => {
  db.prepare('INSERT OR IGNORE INTO blocks (blocker_id, blocked_id) VALUES (?, ?)').run(r(req).userId, req.params.id)
  res.json({ ok: true })
})

// ---- Home dashboard ----
socialRouter.get('/home', (req, res) => {
  const me = r(req).user
  const nextTrip = db.prepare('SELECT * FROM trips WHERE user_id = ? AND end_date >= ? ORDER BY start_date LIMIT 1').get(me.id, today()) as any
  const pendingIncoming = (db.prepare("SELECT COUNT(*) AS c FROM connections WHERE to_user = ? AND status = 'pending'").get(me.id) as any).c
  const chatCount = (db.prepare('SELECT COUNT(*) AS c FROM chat_members WHERE user_id = ?').get(me.id) as any).c
  let matchCount = 0
  if (nextTrip && me.name) {
    const blocked = blockedIds(me.id)
    const candidates = db.prepare(`SELECT t.* FROM trips t JOIN users u ON u.id = t.user_id WHERE t.destination = ? AND t.user_id != ? AND u.onboarded = 1`).all(nextTrip.destination, me.id) as any[]
    const seen = new Set<string>()
    matchCount = candidates.filter(t =>
      datesOverlap(nextTrip.start_date, nextTrip.end_date, t.start_date, t.end_date, 3) &&
      !blocked.has(t.user_id) && (seen.has(t.user_id) ? false : (seen.add(t.user_id), true))
    ).length
  }
  const destination = nextTrip ? db.prepare('SELECT * FROM destinations WHERE slug = ?').get(nextTrip.destination) : null
  res.json({ user: ownUser(me), nextTrip, matchCount, pendingIncoming, chatCount,
    destination: destination ? { ...destination, activities: pj((destination as any).activities, []), tags: pj((destination as any).tags, []) } : null })
})
