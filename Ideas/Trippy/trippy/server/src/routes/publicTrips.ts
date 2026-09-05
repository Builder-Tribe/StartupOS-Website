import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { db, uid } from '../db.js'
import { JWT_SECRET as SECRET } from '../lib/auth.js'
import { publicTripCard, partnerTripShape, isHttpsUrl } from '../lib/trips.js'
import { findOrCreateHub } from '../lib/hubs.js'
import { availabilityOf, processWaitlist } from '../lib/bookings.js'

// Coordinates for every seeded destination. Expand when new destinations are added.
const DEST_COORDS: Record<string, [number, number]> = {
  'manali':      [32.2396,  77.1887],
  'kasol':       [32.0112,  77.3149],
  'spiti-valley':[32.2461,  78.0339],
  'udaipur':     [24.5854,  73.7125],
  'gokarna':     [14.5479,  74.3188],
  'rishikesh':   [30.0869,  78.2676],
}

// WMO weather codes → simple label + emoji
function wmoLabel(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: 'Clear', emoji: '☀️' }
  if (code <= 3) return { label: 'Partly cloudy', emoji: '⛅' }
  if (code <= 48) return { label: 'Foggy', emoji: '🌫️' }
  if (code <= 67) return { label: 'Rainy', emoji: '🌧️' }
  if (code <= 77) return { label: 'Snowy', emoji: '❄️' }
  if (code <= 82) return { label: 'Showers', emoji: '🌦️' }
  if (code <= 86) return { label: 'Snow showers', emoji: '🌨️' }
  return { label: 'Thunderstorm', emoji: '⛈️' }
}

// Simple in-memory cache: slug → { data, expiresAt }
const weatherCache = new Map<string, { data: any; expiresAt: number }>()

// Consumer-facing discovery of PUBLISHED partner trips. No auth required
// (public), but if a consumer token is present we attribute the click to them.
export const publicTripsRouter = Router()
const todayStr = () => new Date().toISOString().slice(0, 10)

function optionalUserId(req: any): string | null {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null
  try {
    const payload = jwt.verify(token, SECRET) as { sub: string; kind?: string }
    if (payload.kind === 'partner') return null
    return db.prepare('SELECT 1 FROM users WHERE id = ?').get(payload.sub) ? payload.sub : null
  } catch {
    return null
  }
}

// List published trips with optional filters. Drafts are never returned.
publicTripsRouter.get('/discover/trips', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase()
  const destinationSlug = String(req.query.destinationSlug || '')
  const category = String(req.query.category || '')
  const includePast = req.query.includePast === '1'
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null
  const from = /^\d{4}-\d{2}-\d{2}$/.test(String(req.query.from || '')) ? String(req.query.from) : ''
  const to = /^\d{4}-\d{2}-\d{2}$/.test(String(req.query.to || '')) ? String(req.query.to) : ''

  const where = ["status = 'published'"]
  const args: any[] = []
  if (destinationSlug) { where.push('destination_slug = ?'); args.push(destinationSlug) }
  if (category) { where.push('category = ?'); args.push(category) }
  // Date window: departures within [from − 3d, to + 3d] (PRD ±3-day tolerance).
  // Trips without a start date are flexible and always match.
  if (from) { where.push("(start_date IS NULL OR start_date >= date(?, '-3 days'))"); args.push(from) }
  if (to) { where.push("(start_date IS NULL OR start_date <= date(?, '+3 days'))"); args.push(to) }
  if (minPrice != null) { where.push('price >= ?'); args.push(minPrice) }
  if (maxPrice != null) { where.push('price <= ?'); args.push(maxPrice) }
  if (!includePast) { where.push('(end_date IS NULL OR end_date >= ?)'); args.push(todayStr()) }

  let rows = db.prepare(`SELECT * FROM partner_trips WHERE ${where.join(' AND ')} ORDER BY start_date IS NULL, start_date ASC, published_at DESC`).all(...args) as any[]
  if (q) rows = rows.filter(t => `${t.name} ${t.destination} ${t.short_desc}`.toLowerCase().includes(q))
  res.json(rows.map(t => ({ ...publicTripCard(t), availability: availabilityOf(t) })))
})

// Detail by slug or id — published only.
publicTripsRouter.get('/discover/trips/:slugOrId', (req, res) => {
  const key = req.params.slugOrId
  const t = db.prepare("SELECT * FROM partner_trips WHERE (slug = ? OR id = ?) AND status = 'published'").get(key, key) as any
  if (!t) return res.status(404).json({ error: 'Trip not found or not published' })
  const shaped = partnerTripShape(t)
  // Strip owner-only field from the public payload; expose bookable flag instead.
  const { paymentUrl, rawStatus, ...pub } = shaped as any
  const me = optionalUserId(req)
  const myBooking = me ? (db.prepare('SELECT status FROM bookings WHERE trip_id = ? AND user_id = ?').get(t.id, me) as any) : null
  const onWaitlist = me ? !!db.prepare('SELECT 1 FROM waitlist WHERE trip_id = ? AND user_id = ?').get(t.id, me) : false
  res.json({
    ...pub,
    bookable: isHttpsUrl(paymentUrl),
    availability: availabilityOf(t),
    myBookingStatus: myBooking && myBooking.status !== 'cancelled' ? myBooking.status : null,
    onWaitlist,
  })
})

// Traveller confirms they completed payment on the host's page (PRD 2.14).
// Creates a 'claimed' booking that holds a seat until the partner confirms or
// rejects it in the CRM, and drops the traveller into the trip's hub.
publicTripsRouter.post('/discover/trips/:slugOrId/claim-booking', (req, res) => {
  const me = optionalUserId(req)
  if (!me) return res.status(401).json({ error: 'Sign in to confirm your booking' })
  const key = req.params.slugOrId
  const t = db.prepare("SELECT * FROM partner_trips WHERE (slug = ? OR id = ?) AND status = 'published'").get(key, key) as any
  if (!t) return res.status(404).json({ error: 'Trip not found or not published' })
  const existing = db.prepare('SELECT * FROM bookings WHERE trip_id = ? AND user_id = ?').get(t.id, me) as any
  if (existing && existing.status !== 'cancelled' && existing.status !== 'rejected') {
    return res.status(400).json({ error: 'You already have a booking on this trip' })
  }
  if (availabilityOf(t).full) return res.status(400).json({ error: 'This trip is full — join the waitlist instead' })
  db.exec('BEGIN')
  try {
    if (existing) db.prepare("UPDATE bookings SET status = 'claimed', created_at = datetime('now'), decided_at = NULL, decided_by = NULL WHERE id = ?").run(existing.id)
    else db.prepare('INSERT INTO bookings (id, trip_id, user_id) VALUES (?, ?, ?)').run(uid(), t.id, me)
    db.prepare('DELETE FROM waitlist WHERE trip_id = ? AND user_id = ?').run(t.id, me)
    db.exec('COMMIT')
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
  const g = findOrCreateHub({ type: 'partner', id: t.id, name: t.name || 'Trip', destination: t.destination || '', startDate: t.start_date || null, endDate: t.end_date || null }, me)
  res.json({ status: 'claimed', groupId: g.id })
})

// Traveller cancels their claim/booking — frees the seat, wakes the waitlist.
publicTripsRouter.post('/discover/trips/:slugOrId/cancel-booking', (req, res) => {
  const me = optionalUserId(req)
  if (!me) return res.status(401).json({ error: 'Not signed in' })
  const key = req.params.slugOrId
  const t = db.prepare('SELECT * FROM partner_trips WHERE (slug = ? OR id = ?)').get(key, key) as any
  if (!t) return res.status(404).json({ error: 'Trip not found' })
  const b = db.prepare("SELECT * FROM bookings WHERE trip_id = ? AND user_id = ? AND status IN ('claimed','confirmed')").get(t.id, me) as any
  if (!b) return res.status(404).json({ error: 'No active booking to cancel' })
  db.prepare("UPDATE bookings SET status = 'cancelled', decided_at = datetime('now') WHERE id = ?").run(b.id)
  processWaitlist(t.id)
  res.json({ ok: true })
})

// Full trip → waitlist (PRD 2.13). First in line gets notified when a seat frees.
publicTripsRouter.post('/discover/trips/:slugOrId/waitlist', (req, res) => {
  const me = optionalUserId(req)
  if (!me) return res.status(401).json({ error: 'Sign in to join the waitlist' })
  const key = req.params.slugOrId
  const t = db.prepare("SELECT * FROM partner_trips WHERE (slug = ? OR id = ?) AND status = 'published'").get(key, key) as any
  if (!t) return res.status(404).json({ error: 'Trip not found or not published' })
  if (!availabilityOf(t).full) return res.status(400).json({ error: 'Seats are available — book directly' })
  db.prepare('INSERT OR IGNORE INTO waitlist (id, trip_id, user_id) VALUES (?, ?, ?)').run(uid(), t.id, me)
  res.json({ ok: true, onWaitlist: true })
})

// Join a hosted trip's travellers' hub (PRD 2.12/3.1). Requires a consumer
// account — unlike the rest of this router, anonymous users get a 401.
publicTripsRouter.post('/discover/trips/:slugOrId/join', (req, res) => {
  const me = optionalUserId(req)
  if (!me) return res.status(401).json({ error: 'Sign in to join this trip' })
  const key = req.params.slugOrId
  const t = db.prepare("SELECT * FROM partner_trips WHERE (slug = ? OR id = ?) AND status = 'published'").get(key, key) as any
  if (!t) return res.status(404).json({ error: 'Trip not found or not published' })
  const g = findOrCreateHub({ type: 'partner', id: t.id, name: t.name || 'Trip', destination: t.destination || '', startDate: t.start_date || null, endDate: t.end_date || null }, me)
  res.json({ groupId: g.id, chatId: g.chat_id })
})

// Record outbound booking intent, then hand back the validated payment URL.
// The client performs the navigation (no server 302), and we only ever return
// an https URL stored against a published trip — closing the open-redirect hole.
publicTripsRouter.post('/discover/trips/:slugOrId/track-click', (req, res) => {
  const key = req.params.slugOrId
  const t = db.prepare("SELECT * FROM partner_trips WHERE (slug = ? OR id = ?) AND status = 'published'").get(key, key) as any
  if (!t) return res.status(404).json({ error: 'Trip not found or not published' })
  if (!isHttpsUrl(t.payment_url)) return res.status(409).json({ error: 'This trip is not bookable right now' })

  db.prepare(`INSERT INTO trip_outbound_clicks (id, trip_id, org_id, user_id, anon_session_id, source_page, cta)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(uid(), t.id, t.org_id, optionalUserId(req),
      String(req.body?.anonSessionId || '').slice(0, 80) || null,
      String(req.body?.sourcePage || '').slice(0, 120),
      String(req.body?.cta || 'book_now').slice(0, 40))
  res.json({ paymentUrl: t.payment_url })
})

// Trending destinations: aggregate story + review + booking activity per
// destination slug from the last 30 days, then join against the destinations
// table so we always return a name + emoji. Top 6 by combined score.
publicTripsRouter.get('/destinations/trending', (_req, res) => {
  const rows = db.prepare(`
    WITH activity AS (
      SELECT destination_slug AS slug, COUNT(*) AS stories, 0 AS reviews, 0 AS bookings
      FROM trip_stories
      WHERE destination_slug IS NOT NULL AND destination_slug != ''
        AND created_at >= datetime('now', '-30 days')
      GROUP BY destination_slug

      UNION ALL

      SELECT pt.destination_slug AS slug, 0, COUNT(*) AS reviews, 0
      FROM trip_reviews r
      JOIN partner_trips pt ON pt.id = r.target_id AND r.target_type = 'partner_trip'
      WHERE pt.destination_slug IS NOT NULL
        AND r.created_at >= datetime('now', '-30 days')
      GROUP BY pt.destination_slug

      UNION ALL

      SELECT pt.destination_slug AS slug, 0, 0, COUNT(*) AS bookings
      FROM bookings b
      JOIN partner_trips pt ON pt.id = b.trip_id
      WHERE pt.destination_slug IS NOT NULL
        AND b.created_at >= datetime('now', '-30 days')
        AND b.status IN ('confirmed', 'claimed')
      GROUP BY pt.destination_slug
    ),
    totals AS (
      SELECT slug,
             SUM(stories)  AS storyCount,
             SUM(reviews)  AS reviewCount,
             SUM(bookings) AS bookingCount,
             SUM(stories * 2 + reviews * 3 + bookings * 4) AS score
      FROM activity
      GROUP BY slug
    )
    SELECT d.slug, d.name, d.state, d.emoji, d.tagline AS description,
           COALESCE(t.storyCount, 0)  AS storyCount,
           COALESCE(t.reviewCount, 0) AS reviewCount,
           COALESCE(t.bookingCount, 0) AS bookingCount,
           COALESCE(t.score, 0)        AS score
    FROM destinations d
    LEFT JOIN totals t ON t.slug = d.slug
    WHERE COALESCE(t.score, 0) > 0
    ORDER BY score DESC
    LIMIT 6
  `).all() as any[]

  res.json(rows.map(r => ({
    slug: r.slug, name: r.name, state: r.state, emoji: r.emoji,
    description: r.description,
    storyCount: r.storyCount, reviewCount: r.reviewCount, bookingCount: r.bookingCount,
  })))
})

// Weather widget (PRD 3.5): current conditions + 4-day forecast via Open-Meteo
// (free, no API key, CORS-enabled). Proxied here for a 30-min server-side cache.
publicTripsRouter.get('/destinations/:slug/weather', async (req, res) => {
  const slug = req.params.slug
  const coords = DEST_COORDS[slug]
  if (!coords) return res.status(404).json({ error: 'No weather data for this destination' })
  const [lat, lon] = coords

  const cached = weatherCache.get(slug)
  if (cached && cached.expiresAt > Date.now()) return res.json(cached.data)

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weathercode,wind_speed_10m,relative_humidity_2m` +
      `&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum` +
      `&forecast_days=4&timezone=auto`
    const resp = await fetch(url)
    if (!resp.ok) throw new Error('Open-Meteo error')
    const raw = await resp.json() as any
    const c = raw.current
    const d = raw.daily
    const data = {
      current: {
        temp: Math.round(c.temperature_2m),
        humidity: c.relative_humidity_2m,
        windSpeed: Math.round(c.wind_speed_10m),
        ...wmoLabel(c.weathercode),
      },
      daily: (d.time as string[]).map((date: string, i: number) => ({
        date,
        max: Math.round(d.temperature_2m_max[i]),
        min: Math.round(d.temperature_2m_min[i]),
        precipitation: Math.round(d.precipitation_sum[i] || 0),
        ...wmoLabel(d.weathercode[i]),
      })),
    }
    weatherCache.set(slug, { data, expiresAt: Date.now() + 30 * 60 * 1000 })
    res.json(data)
  } catch {
    res.status(502).json({ error: 'Weather data temporarily unavailable' })
  }
})
