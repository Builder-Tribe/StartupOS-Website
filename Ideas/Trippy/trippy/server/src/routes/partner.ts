import { Router } from 'express'
import { db, uid, j, pj, nowIso, slugify } from '../db.js'
import { hashPassword, verifyPassword, signPartnerToken, requirePartner, type PartnerRequest } from '../lib/partnerAuth.js'
import { isEmail, passwordProblem } from '../lib/password.js'
import { partnerTripShape, orgShape, validateForPublish, isHttpsUrl, effectiveStatus } from '../lib/trips.js'
import { availabilityOf, notify, processWaitlist } from '../lib/bookings.js'

export const partnerRouter = Router()
const p = (req: any) => req as PartnerRequest

// ---------------------------------------------------------------- Auth
// Self-serve signup: creates a new Partner Organization + its first admin.
partnerRouter.post('/auth/signup', (req, res) => {
  const orgName = String(req.body?.orgName || '').trim()
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const name = req.body?.name ? String(req.body.name).trim() : null
  if (!orgName) return res.status(400).json({ error: 'Community / organization name is required' })
  if (!isEmail(email)) return res.status(400).json({ error: 'Enter a valid email address' })
  const pwErr = passwordProblem(password)
  if (pwErr) return res.status(400).json({ error: pwErr })
  if (db.prepare('SELECT 1 FROM partner_admins WHERE email = ?').get(email)) {
    return res.status(409).json({ error: 'An account with this email already exists — try signing in' })
  }
  // Unique org slug.
  const base = slugify(orgName)
  let slug = base, n = 1
  while (db.prepare('SELECT 1 FROM partner_orgs WHERE slug = ?').get(slug)) slug = `${base}-${++n}`

  const orgId = uid(), adminId = uid()
  db.prepare('INSERT INTO partner_orgs (id, name, slug) VALUES (?, ?, ?)').run(orgId, orgName, slug)
  const { hash, salt } = hashPassword(password)
  db.prepare('INSERT INTO partner_admins (id, org_id, email, password_hash, password_salt, name) VALUES (?, ?, ?, ?, ?, ?)')
    .run(adminId, orgId, email, hash, salt, name)
  const org = db.prepare('SELECT * FROM partner_orgs WHERE id = ?').get(orgId)
  res.json({
    token: signPartnerToken(adminId, orgId),
    admin: { id: adminId, email, name, role: 'admin' },
    org: orgShape(org),
  })
})

partnerRouter.post('/auth/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
  const admin = db.prepare('SELECT * FROM partner_admins WHERE email = ?').get(email) as any
  if (!admin || !verifyPassword(password, admin.password_hash, admin.password_salt)) {
    return res.status(401).json({ error: 'Incorrect email or password' })
  }
  db.prepare('UPDATE partner_admins SET last_login_at = ? WHERE id = ?').run(nowIso(), admin.id)
  const org = db.prepare('SELECT * FROM partner_orgs WHERE id = ?').get(admin.org_id)
  res.json({
    token: signPartnerToken(admin.id, admin.org_id),
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    org: orgShape(org),
  })
})

// Stateless JWT — logout is a client-side token drop; endpoint provided for symmetry.
partnerRouter.post('/auth/logout', (_req, res) => res.json({ ok: true }))

partnerRouter.use(requirePartner)

partnerRouter.get('/me', (req, res) => {
  const a = p(req).admin
  res.json({ id: a.id, email: a.email, name: a.name, role: a.role, orgId: a.org_id })
})

partnerRouter.get('/org', (req, res) => {
  res.json(orgShape(db.prepare('SELECT * FROM partner_orgs WHERE id = ?').get(p(req).orgId)))
})

// ---------------------------------------------------------------- Trips list + dashboard summary
partnerRouter.get('/trips', (req, res) => {
  const rows = db.prepare('SELECT * FROM partner_trips WHERE org_id = ? ORDER BY updated_at DESC').all(p(req).orgId) as any[]
  const trips = rows.map(t => ({
    id: t.id, slug: t.slug, name: t.name || 'Untitled trip', destination: t.destination,
    startDate: t.start_date, endDate: t.end_date, price: t.price, currency: t.currency,
    status: effectiveStatus(t), createdAt: t.created_at, updatedAt: t.updated_at,
    hasPayment: !!t.payment_url,
    availability: availabilityOf(t),
    pendingBookings: (db.prepare("SELECT COUNT(*) c FROM bookings WHERE trip_id = ? AND status = 'claimed'").get(t.id) as any).c,
    avgRating: (db.prepare("SELECT ROUND(AVG(rating),1) v FROM trip_reviews WHERE target_type='partner_trip' AND target_id=?").get(t.id) as any).v ?? null,
    reviewCount: (db.prepare("SELECT COUNT(*) c FROM trip_reviews WHERE target_type='partner_trip' AND target_id=?").get(t.id) as any).c,
  }))
  const summary = { total: trips.length, draft: 0, published: 0, completed: 0, upcoming: 0, archived: 0 }
  const todayStr = new Date().toISOString().slice(0, 10)
  for (const t of trips) {
    summary[t.status as 'draft' | 'published' | 'completed' | 'archived'] += 1
    if (t.status === 'published' && (!t.startDate || t.startDate >= todayStr)) summary.upcoming += 1
  }
  res.json({ trips, summary })
})

// ---------------------------------------------------------------- Create
partnerRouter.post('/trips', (req, res) => {
  const id = uid()
  const b = req.body || {}
  db.prepare(`INSERT INTO partner_trips (id, org_id, name, short_desc, destination, currency, status)
    VALUES (?, ?, ?, ?, ?, 'INR', 'draft')`)
    .run(id, p(req).orgId, String(b.name || '').slice(0, 140), String(b.shortDesc || ''), String(b.destination || ''))
  res.json(loadOwned(id, p(req).orgId, res))
})

// Fetch a trip only if it belongs to the caller's org (tenant guard).
function ownedRow(id: string, orgId: string): any {
  return db.prepare('SELECT * FROM partner_trips WHERE id = ? AND org_id = ?').get(id, orgId)
}
function loadOwned(id: string, orgId: string, res: any) {
  const t = ownedRow(id, orgId)
  if (!t) { res.status(404).json({ error: 'Trip not found' }); return null }
  return partnerTripShape(t)
}

partnerRouter.get('/trips/:id', (req, res) => {
  const shaped = loadOwned(req.params.id, p(req).orgId, res)
  if (shaped) res.json(shaped)
})

// Preview = same owner shape; the consumer UI renders it read-only.
partnerRouter.get('/trips/:id/preview', (req, res) => {
  const shaped = loadOwned(req.params.id, p(req).orgId, res)
  if (shaped) res.json(shaped)
})

// ---------------------------------------------------------------- Update (whitelist → columns)
const TEXT_FIELDS: Record<string, string> = {
  name: 'name', shortDesc: 'short_desc', longDesc: 'long_desc', destination: 'destination',
  destinationSlug: 'destination_slug', startCity: 'start_city', startDate: 'start_date', endDate: 'end_date',
  category: 'category', tripType: 'trip_type', difficulty: 'difficulty', currency: 'currency',
  pricingNotes: 'pricing_notes', coverImage: 'cover_image', paymentUrl: 'payment_url',
}
const NUM_FIELDS: Record<string, string> = {
  durationDays: 'duration_days', minAge: 'min_age', maxGroupSize: 'max_group_size',
  price: 'price', originalPrice: 'original_price',
}

partnerRouter.put('/trips/:id', (req, res) => {
  const orgId = p(req).orgId
  const t = ownedRow(req.params.id, orgId)
  if (!t) return res.status(404).json({ error: 'Trip not found' })
  const b = req.body || {}

  // Reject an invalid payment URL up front (also re-checked at publish).
  if (b.paymentUrl != null && String(b.paymentUrl).trim() !== '' && !isHttpsUrl(b.paymentUrl)) {
    return res.status(400).json({ error: 'Payment link must be a valid https:// URL' })
  }

  const sets: string[] = []
  const vals: any[] = []
  for (const [key, col] of Object.entries(TEXT_FIELDS)) {
    if (b[key] !== undefined) { sets.push(`${col} = ?`); vals.push(b[key] == null ? null : String(b[key])) }
  }
  for (const [key, col] of Object.entries(NUM_FIELDS)) {
    if (b[key] !== undefined) { sets.push(`${col} = ?`); vals.push(b[key] === '' || b[key] == null ? null : Number(b[key])) }
  }
  if (b.inclusions !== undefined) { sets.push('inclusions = ?'); vals.push(j(Array.isArray(b.inclusions) ? b.inclusions : [])) }
  if (b.exclusions !== undefined) { sets.push('exclusions = ?'); vals.push(j(Array.isArray(b.exclusions) ? b.exclusions : [])) }
  sets.push('updated_at = ?'); vals.push(nowIso())
  db.prepare(`UPDATE partner_trips SET ${sets.join(', ')} WHERE id = ? AND org_id = ?`).run(...vals, t.id, orgId)

  // Reconcile tags + gallery media if provided (full-replace semantics).
  if (Array.isArray(b.tags)) {
    db.prepare('DELETE FROM trip_tags WHERE trip_id = ?').run(t.id)
    const ins = db.prepare('INSERT OR IGNORE INTO trip_tags (trip_id, tag) VALUES (?, ?)')
    for (const tag of b.tags) if (String(tag).trim()) ins.run(t.id, String(tag).trim().toLowerCase())
  }
  if (Array.isArray(b.media)) {
    db.prepare('DELETE FROM trip_media WHERE trip_id = ?').run(t.id)
    const ins = db.prepare('INSERT INTO trip_media (id, trip_id, url, kind, sort_order) VALUES (?, ?, ?, ?, ?)')
    b.media.filter((u: any) => isHttpsUrl(u)).forEach((u: string, i: number) => ins.run(uid(), t.id, u, 'image', i))
  }
  res.json(partnerTripShape(ownedRow(t.id, orgId)))
})

partnerRouter.delete('/trips/:id', (req, res) => {
  const t = ownedRow(req.params.id, p(req).orgId)
  if (!t) return res.status(404).json({ error: 'Trip not found' })
  if (t.status !== 'draft') return res.status(400).json({ error: 'Only draft trips can be deleted' })
  db.prepare('DELETE FROM trip_itinerary_days WHERE trip_id = ?').run(t.id)
  db.prepare('DELETE FROM trip_media WHERE trip_id = ?').run(t.id)
  db.prepare('DELETE FROM trip_tags WHERE trip_id = ?').run(t.id)
  // Clear any outbound-click rows too (a trip may have been published before) to
  // avoid a foreign-key violation; analytics for a deleted draft is not retained.
  db.prepare('DELETE FROM trip_outbound_clicks WHERE trip_id = ?').run(t.id)
  db.prepare('DELETE FROM partner_trips WHERE id = ? AND org_id = ?').run(t.id, p(req).orgId)
  res.json({ ok: true })
})

// ---------------------------------------------------------------- Itinerary days
function guardTrip(req: any, res: any): any {
  const t = ownedRow(req.params.id, p(req).orgId)
  if (!t) { res.status(404).json({ error: 'Trip not found' }); return null }
  return t
}

partnerRouter.post('/trips/:id/itinerary', (req, res) => {
  const t = guardTrip(req, res); if (!t) return
  const b = req.body || {}
  const maxSort = (db.prepare('SELECT COALESCE(MAX(sort_order), 0) AS m FROM trip_itinerary_days WHERE trip_id = ?').get(t.id) as any).m
  const count = (db.prepare('SELECT COUNT(*) AS c FROM trip_itinerary_days WHERE trip_id = ?').get(t.id) as any).c
  const id = uid()
  db.prepare(`INSERT INTO trip_itinerary_days (id, trip_id, day_number, title, description, location, activities, accommodation, meals, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, t.id, Number(b.dayNumber) || count + 1, String(b.title || ''), String(b.description || ''),
      String(b.location || ''), j(Array.isArray(b.activities) ? b.activities : []), String(b.accommodation || ''),
      j(Array.isArray(b.meals) ? b.meals : []), maxSort + 1)
  db.prepare('UPDATE partner_trips SET updated_at = ? WHERE id = ?').run(nowIso(), t.id)
  res.json(partnerTripShape(ownedRow(t.id, p(req).orgId)))
})

partnerRouter.put('/trips/:id/itinerary/:dayId', (req, res) => {
  const t = guardTrip(req, res); if (!t) return
  const day = db.prepare('SELECT * FROM trip_itinerary_days WHERE id = ? AND trip_id = ?').get(req.params.dayId, t.id) as any
  if (!day) return res.status(404).json({ error: 'Itinerary day not found' })
  const b = req.body || {}
  db.prepare(`UPDATE trip_itinerary_days SET day_number = ?, title = ?, description = ?, location = ?, activities = ?, accommodation = ?, meals = ? WHERE id = ?`)
    .run(b.dayNumber != null ? Number(b.dayNumber) : day.day_number,
      b.title != null ? String(b.title) : day.title,
      b.description != null ? String(b.description) : day.description,
      b.location != null ? String(b.location) : day.location,
      b.activities != null ? j(Array.isArray(b.activities) ? b.activities : []) : day.activities,
      b.accommodation != null ? String(b.accommodation) : day.accommodation,
      b.meals != null ? j(Array.isArray(b.meals) ? b.meals : []) : day.meals,
      day.id)
  db.prepare('UPDATE partner_trips SET updated_at = ? WHERE id = ?').run(nowIso(), t.id)
  res.json(partnerTripShape(ownedRow(t.id, p(req).orgId)))
})

partnerRouter.delete('/trips/:id/itinerary/:dayId', (req, res) => {
  const t = guardTrip(req, res); if (!t) return
  db.prepare('DELETE FROM trip_itinerary_days WHERE id = ? AND trip_id = ?').run(req.params.dayId, t.id)
  db.prepare('UPDATE partner_trips SET updated_at = ? WHERE id = ?').run(nowIso(), t.id)
  res.json(partnerTripShape(ownedRow(t.id, p(req).orgId)))
})

// Reorder: body { order: [dayId, dayId, ...] } → rewrites sort_order + day_number.
partnerRouter.put('/trips/:id/itinerary-reorder', (req, res) => {
  const t = guardTrip(req, res); if (!t) return
  const order: string[] = Array.isArray(req.body?.order) ? req.body.order : []
  const upd = db.prepare('UPDATE trip_itinerary_days SET sort_order = ?, day_number = ? WHERE id = ? AND trip_id = ?')
  order.forEach((dayId, i) => upd.run(i, i + 1, dayId, t.id))
  db.prepare('UPDATE partner_trips SET updated_at = ? WHERE id = ?').run(nowIso(), t.id)
  res.json(partnerTripShape(ownedRow(t.id, p(req).orgId)))
})

// ---------------------------------------------------------------- Publish / Unpublish
// ---------------------------------------------------------------- Bookings (PRD 2.14: partner verifies traveller claims)
partnerRouter.get('/trips/:id/bookings', (req, res) => {
  const t = db.prepare('SELECT * FROM partner_trips WHERE id = ? AND org_id = ?').get(req.params.id, p(req).orgId) as any
  if (!t) return res.status(404).json({ error: 'Trip not found' })
  const rows = db.prepare(`
    SELECT b.*, u.name, u.email, u.avatar_emoji, u.avatar_color FROM bookings b JOIN users u ON u.id = b.user_id
    WHERE b.trip_id = ? ORDER BY CASE b.status WHEN 'claimed' THEN 0 ELSE 1 END, b.created_at DESC`).all(t.id) as any[]
  res.json({
    availability: availabilityOf(t),
    bookings: rows.map(b => ({ id: b.id, status: b.status, createdAt: b.created_at, decidedAt: b.decided_at,
      traveller: { name: b.name, email: b.email, avatarEmoji: b.avatar_emoji, avatarColor: b.avatar_color } })),
    waitlistCount: (db.prepare('SELECT COUNT(*) c FROM waitlist WHERE trip_id = ?').get(t.id) as any).c,
  })
})

partnerRouter.post('/trips/:id/bookings/:bookingId/decide', (req, res) => {
  const t = db.prepare('SELECT * FROM partner_trips WHERE id = ? AND org_id = ?').get(req.params.id, p(req).orgId) as any
  if (!t) return res.status(404).json({ error: 'Trip not found' })
  const b = db.prepare('SELECT * FROM bookings WHERE id = ? AND trip_id = ?').get(req.params.bookingId, t.id) as any
  if (!b) return res.status(404).json({ error: 'Booking not found' })
  if (b.status !== 'claimed') return res.status(400).json({ error: 'This booking was already decided' })
  const action = String(req.body?.action)
  if (!['confirm', 'reject'].includes(action)) return res.status(400).json({ error: 'Invalid action' })
  const status = action === 'confirm' ? 'confirmed' : 'rejected'
  db.prepare("UPDATE bookings SET status = ?, decided_at = datetime('now'), decided_by = ? WHERE id = ?").run(status, p(req).adminId, b.id)
  notify(b.user_id, action === 'confirm'
    ? { type: 'booking_confirmed', title: `Booking confirmed for "${t.name}" ✅`, body: 'The host verified your payment — you\'re going!', link: `/trip/${t.slug}` }
    : { type: 'booking_rejected', title: `Booking not verified for "${t.name}"`, body: 'The host couldn\'t match your payment. If you did pay, contact them directly.', link: `/trip/${t.slug}` })
  if (action === 'reject') processWaitlist(t.id)
  res.json({ ok: true, status })
})

partnerRouter.post('/trips/:id/publish', (req, res) => {
  const orgId = p(req).orgId
  const t = ownedRow(req.params.id, orgId)
  if (!t) return res.status(404).json({ error: 'Trip not found' })
  const errors = validateForPublish(t)
  if (errors.length) return res.status(422).json({ error: 'Trip is missing required information', errors })

  let slug = t.slug
  if (!slug) {
    const base = slugify(t.name)
    slug = base
    let n = 1
    while (db.prepare('SELECT 1 FROM partner_trips WHERE slug = ? AND id != ?').get(slug, t.id)) slug = `${base}-${++n}`
  }
  db.prepare("UPDATE partner_trips SET status = 'published', slug = ?, published_at = ?, updated_at = ? WHERE id = ? AND org_id = ?")
    .run(slug, nowIso(), nowIso(), t.id, orgId)
  res.json(partnerTripShape(ownedRow(t.id, orgId)))
})

partnerRouter.post('/trips/:id/unpublish', (req, res) => {
  const orgId = p(req).orgId
  const t = ownedRow(req.params.id, orgId)
  if (!t) return res.status(404).json({ error: 'Trip not found' })
  db.prepare("UPDATE partner_trips SET status = 'draft', published_at = NULL, updated_at = ? WHERE id = ? AND org_id = ?")
    .run(nowIso(), t.id, orgId)
  res.json(partnerTripShape(ownedRow(t.id, orgId)))
})

// ---- Trip Hub (PRD 3.8): operator view of the travellers' hub ----
partnerRouter.get('/trips/:id/hub', requirePartner, (req, res) => {
  const t = db.prepare('SELECT * FROM partner_trips WHERE id = ? AND org_id = ?').get(req.params.id, p(req).orgId) as any
  if (!t) return res.status(404).json({ error: 'Trip not found' })
  const org = db.prepare('SELECT name FROM partner_orgs WHERE id = ?').get(p(req).orgId) as any
  const g = db.prepare("SELECT * FROM groups WHERE source_type = 'partner' AND source_id = ?").get(t.id) as any
  if (!g) return res.json({ hubCreated: false, memberCount: 0, members: [], announcements: [], groupId: null })

  const members = db.prepare(`
    SELECT u.id, u.name, u.avatar_emoji, u.avatar_color, u.email, b.status AS bookingStatus
    FROM group_members gm
    JOIN users u ON u.id = gm.user_id
    LEFT JOIN bookings b ON b.trip_id = ? AND b.user_id = gm.user_id
      AND b.status IN ('claimed','confirmed')
    WHERE gm.group_id = ?
    ORDER BY CASE b.status WHEN 'confirmed' THEN 0 WHEN 'claimed' THEN 1 ELSE 2 END, u.name
  `).all(t.id, g.id) as any[]

  const announcements = db.prepare(`
    SELECT m.content, m.created_at, u.name AS senderName
    FROM messages m LEFT JOIN users u ON u.id = m.sender_id
    WHERE m.chat_id = ? AND m.type = 'announcement'
    ORDER BY m.created_at DESC LIMIT 10
  `).all(g.chat_id) as any[]

  res.json({
    hubCreated: true, groupId: g.id, chatId: g.chat_id,
    orgName: org?.name || 'Operator',
    memberCount: members.length,
    confirmedCount: members.filter((m: any) => m.bookingStatus === 'confirmed').length,
    claimedCount: members.filter((m: any) => m.bookingStatus === 'claimed').length,
    members: members.map((m: any) => ({
      id: m.id, name: m.name, avatarEmoji: m.avatar_emoji, avatarColor: m.avatar_color,
      email: m.email, bookingStatus: m.bookingStatus || 'joined',
    })),
    announcements: announcements.map((a: any) => ({
      content: a.content, createdAt: a.created_at, senderName: a.senderName || 'Trip leader',
    })),
  })
})

// POST an announcement from the operator into the trip hub
partnerRouter.post('/trips/:id/hub/announce', requirePartner, (req, res) => {
  const t = db.prepare('SELECT * FROM partner_trips WHERE id = ? AND org_id = ?').get(req.params.id, p(req).orgId) as any
  if (!t) return res.status(404).json({ error: 'Trip not found' })
  const content = String(req.body?.content || '').trim()
  if (!content) return res.status(400).json({ error: 'Announcement text is required' })
  const g = db.prepare("SELECT * FROM groups WHERE source_type = 'partner' AND source_id = ?").get(t.id) as any
  if (!g) return res.status(404).json({ error: 'No hub exists yet — travellers create it when they claim bookings' })
  const org = db.prepare('SELECT name FROM partner_orgs WHERE id = ?').get(p(req).orgId) as any
  const msgId = uid()
  db.prepare("INSERT INTO messages (id, chat_id, sender_id, type, content, pinned) VALUES (?, ?, NULL, 'announcement', ?, 1)")
    .run(msgId, g.chat_id, `[${org?.name || 'Operator'}] ${content}`)
  // notify all hub members
  const memberIds = (db.prepare('SELECT user_id FROM group_members WHERE group_id = ?').all(g.id) as any[]).map((r: any) => r.user_id)
  for (const userId of memberIds) {
    notify(userId, { type: 'hub_announcement', title: `📣 ${t.name}`, body: content, link: `/groups/${g.id}` })
  }
  res.json({ ok: true })
})
