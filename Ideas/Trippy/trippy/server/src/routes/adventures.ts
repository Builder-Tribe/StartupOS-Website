import { Router } from 'express'
import { db, uid, j, pj, nowIso } from '../db.js'
import { requireAuth, type AuthedRequest } from '../lib/auth.js'
import { publicUser } from '../lib/shape.js'
import { compatibility } from '../lib/matching.js'
import { findOrCreateHub } from '../lib/hubs.js'

export const adventuresRouter = Router()
adventuresRouter.use(requireAuth)

const r = (req: any) => req as AuthedRequest

// ─────────────────────────────────────────────
// Shape helpers
// ─────────────────────────────────────────────
function bikeProfileShape(p: any) {
  if (!p) return null
  return {
    id: p.id, userId: p.user_id, vehicleType: p.vehicle_type,
    engineCc: p.engine_cc, experienceLevel: p.experience_level,
    ridingSince: p.riding_since, bio: p.bio,
    createdAt: p.created_at, updatedAt: p.updated_at,
  }
}

function carProfileShape(p: any) {
  if (!p) return null
  return {
    id: p.id, userId: p.user_id, vehicleType: p.vehicle_type,
    seatingCapacity: p.seating_capacity, ac: !!p.ac,
    routeBio: p.route_bio,
    createdAt: p.created_at, updatedAt: p.updated_at,
  }
}

function routeShape(rt: any) {
  return {
    id: rt.id, userId: rt.user_id, mode: rt.mode,
    title: rt.title, fromCity: rt.from_city, toCity: rt.to_city,
    waypoints: pj<any[]>(rt.waypoints, []),
    startDate: rt.start_date, endDate: rt.end_date,
    distanceKm: rt.distance_km, status: rt.status,
    seatCapacity: rt.seat_capacity, seatCost: rt.seat_cost,
    notes: rt.notes, companionMatching: !!rt.companion_matching,
    groupId: rt.group_id,
    createdAt: rt.created_at, updatedAt: rt.updated_at,
  }
}

// ─────────────────────────────────────────────
// Bike profile
// ─────────────────────────────────────────────
adventuresRouter.get('/adventures/bike/profile', (req, res) => {
  const requestedId = (req.query.userId as string) || r(req).userId
  const p = db.prepare('SELECT * FROM bike_profiles WHERE user_id = ?').get(requestedId) as any
  res.json(bikeProfileShape(p))
})

adventuresRouter.put('/adventures/bike/profile', (req, res) => {
  const userId = r(req).userId
  const b = req.body || {}
  const existing = db.prepare('SELECT id FROM bike_profiles WHERE user_id = ?').get(userId) as any

  const vehicleType = String(b.vehicleType || 'motorcycle').slice(0, 60)
  const engineCc = b.engineCc ? Number(b.engineCc) : null
  const experienceLevel = ['beginner', 'intermediate', 'expert'].includes(b.experienceLevel)
    ? b.experienceLevel : 'intermediate'
  const ridingSince = b.ridingSince ? Number(b.ridingSince) : null
  const bio = String(b.bio || '').slice(0, 280)

  if (existing) {
    db.prepare(`UPDATE bike_profiles SET vehicle_type=?, engine_cc=?, experience_level=?, riding_since=?, bio=?, updated_at=? WHERE user_id=?`)
      .run(vehicleType, engineCc, experienceLevel, ridingSince, bio, nowIso(), userId)
  } else {
    db.prepare(`INSERT INTO bike_profiles (id, user_id, vehicle_type, engine_cc, experience_level, riding_since, bio) VALUES (?,?,?,?,?,?,?)`)
      .run(uid(), userId, vehicleType, engineCc, experienceLevel, ridingSince, bio)
  }
  const p = db.prepare('SELECT * FROM bike_profiles WHERE user_id = ?').get(userId) as any
  res.json(bikeProfileShape(p))
})

// ─────────────────────────────────────────────
// Car profile
// ─────────────────────────────────────────────
adventuresRouter.get('/adventures/car/profile', (req, res) => {
  const requestedId = (req.query.userId as string) || r(req).userId
  const p = db.prepare('SELECT * FROM car_profiles WHERE user_id = ?').get(requestedId) as any
  res.json(carProfileShape(p))
})

adventuresRouter.put('/adventures/car/profile', (req, res) => {
  const userId = r(req).userId
  const b = req.body || {}
  const existing = db.prepare('SELECT id FROM car_profiles WHERE user_id = ?').get(userId) as any

  const vehicleType = String(b.vehicleType || 'hatchback').slice(0, 60)
  const seatingCapacity = Math.max(2, Math.min(9, Number(b.seatingCapacity) || 4))
  const ac = b.ac !== false ? 1 : 0
  const routeBio = String(b.routeBio || '').slice(0, 280)

  if (existing) {
    db.prepare(`UPDATE car_profiles SET vehicle_type=?, seating_capacity=?, ac=?, route_bio=?, updated_at=? WHERE user_id=?`)
      .run(vehicleType, seatingCapacity, ac, routeBio, nowIso(), userId)
  } else {
    db.prepare(`INSERT INTO car_profiles (id, user_id, vehicle_type, seating_capacity, ac, route_bio) VALUES (?,?,?,?,?,?)`)
      .run(uid(), userId, vehicleType, seatingCapacity, ac, routeBio)
  }
  const p = db.prepare('SELECT * FROM car_profiles WHERE user_id = ?').get(userId) as any
  res.json(carProfileShape(p))
})

// ─────────────────────────────────────────────
// Routes (bike & road) — CRUD
// ─────────────────────────────────────────────
adventuresRouter.get('/adventures/routes', (req, res) => {
  const userId = r(req).userId
  const mode = req.query.mode as string | undefined

  // Carpool search: any user searching for available road-trip seats
  if (req.query.from || req.query.to) {
    const from = String(req.query.from || '').toLowerCase()
    const to = String(req.query.to || '').toLowerCase()
    const date = String(req.query.date || '')
    let rows = (db.prepare(`SELECT ar.*, u.name AS owner_name, u.avatar_color, u.avatar_emoji
      FROM adventure_routes ar JOIN users u ON u.id = ar.user_id
      WHERE ar.mode = 'road' AND ar.companion_matching = 1 AND ar.seat_capacity > 1
        AND ar.status IN ('planning','active')
        AND ar.user_id != ?`)
      .all(userId) as any[]).filter(rt => {
        const fromMatch = !from || rt.from_city.toLowerCase().includes(from)
        const toMatch = !to || rt.to_city.toLowerCase().includes(to)
        const dateMatch = !date || (rt.start_date && rt.start_date <= date && (!rt.end_date || rt.end_date >= date))
        return fromMatch && toMatch && dateMatch
      })

    // Attach accepted seat counts
    return res.json(rows.map(rt => {
      const acceptedSeats = (db.prepare("SELECT COUNT(*) AS c FROM carpool_requests WHERE route_id=? AND status='accepted'").get(rt.id) as any).c
      return { ...routeShape(rt), ownerName: rt.owner_name, ownerAvatarColor: rt.avatar_color, ownerAvatarEmoji: rt.avatar_emoji, acceptedSeats }
    }))
  }

  const rows = mode
    ? db.prepare('SELECT * FROM adventure_routes WHERE user_id = ? AND mode = ? ORDER BY created_at DESC').all(userId, mode) as any[]
    : db.prepare('SELECT * FROM adventure_routes WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[]
  res.json(rows.map(routeShape))
})

adventuresRouter.post('/adventures/routes', (req, res) => {
  const userId = r(req).userId
  const b = req.body || {}

  const mode = b.mode === 'road' ? 'road' : 'bike'
  const title = String(b.title || '').trim().slice(0, 100)
  if (!title) return res.status(400).json({ error: 'title is required' })
  const fromCity = String(b.fromCity || '').trim().slice(0, 80)
  const toCity = String(b.toCity || '').trim().slice(0, 80)
  if (!fromCity || !toCity) return res.status(400).json({ error: 'fromCity and toCity are required' })

  const waypoints = Array.isArray(b.waypoints) ? b.waypoints.slice(0, 20) : []
  const startDate = b.startDate || null
  const endDate = b.endDate || null
  const distanceKm = b.distanceKm ? Number(b.distanceKm) : null
  const seatCapacity = mode === 'road' ? Math.max(1, Math.min(9, Number(b.seatCapacity) || 1)) : 1
  const seatCost = mode === 'road' ? Math.max(0, Number(b.seatCost) || 0) : 0
  const notes = String(b.notes || '').slice(0, 500)
  const companionMatching = b.companionMatching !== false ? 1 : 0

  const id = uid()
  db.prepare(`INSERT INTO adventure_routes
    (id, user_id, mode, title, from_city, to_city, waypoints, start_date, end_date, distance_km, seat_capacity, seat_cost, notes, companion_matching)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, userId, mode, title, fromCity, toCity, j(waypoints), startDate, endDate, distanceKm, seatCapacity, seatCost, notes, companionMatching)

  const rt = db.prepare('SELECT * FROM adventure_routes WHERE id = ?').get(id) as any
  res.status(201).json(routeShape(rt))
})

adventuresRouter.get('/adventures/routes/:id', (req, res) => {
  const userId = r(req).userId
  const rt = db.prepare('SELECT * FROM adventure_routes WHERE id = ?').get(req.params.id) as any
  if (!rt) return res.status(404).json({ error: 'Route not found' })

  // Check if viewer is member (owner or in linked hub)
  const isMember = rt.user_id === userId ||
    (rt.group_id && db.prepare('SELECT 1 FROM group_members WHERE group_id=? AND user_id=?').get(rt.group_id, userId))
  if (!isMember) return res.status(403).json({ error: 'Not a member of this route' })

  // Fetch hub members if hub exists
  const members = rt.group_id
    ? (db.prepare('SELECT u.* FROM users u JOIN group_members gm ON gm.user_id=u.id WHERE gm.group_id=?').all(rt.group_id) as any[]).map(publicUser)
    : [publicUser(db.prepare('SELECT * FROM users WHERE id=?').get(rt.user_id) as any)]

  // Latest ping per member
  const pings = rt.group_id
    ? (db.prepare(`SELECT rlp.* FROM ride_location_pings rlp
        JOIN group_members gm ON gm.user_id=rlp.user_id
        WHERE gm.group_id=? AND rlp.route_id=?
        ORDER BY rlp.created_at DESC`).all(rt.group_id, rt.id) as any[])
    : (db.prepare('SELECT * FROM ride_location_pings WHERE route_id=? AND user_id=? ORDER BY created_at DESC LIMIT 1').all(rt.id, userId) as any[])

  // Dedupe to latest ping per user
  const latestPings: Record<string, any> = {}
  for (const p of pings) if (!latestPings[p.user_id]) latestPings[p.user_id] = p

  const checkins = db.prepare('SELECT * FROM ride_checkins WHERE route_id=? ORDER BY created_at ASC').all(rt.id) as any[]

  // Carpool requests (road mode, owner only sees full list)
  const carpoolReqs = rt.mode === 'road' && rt.user_id === userId
    ? (db.prepare('SELECT cr.*, u.name, u.avatar_color, u.avatar_emoji FROM carpool_requests cr JOIN users u ON u.id=cr.requester_id WHERE cr.route_id=?').all(rt.id) as any[])
    : []

  res.json({
    ...routeShape(rt),
    members,
    latestPings: Object.values(latestPings).map(p => ({
      userId: p.user_id, latitude: p.latitude, longitude: p.longitude,
      accuracy: p.accuracy, batteryPct: p.battery_pct, createdAt: p.created_at,
    })),
    checkins: checkins.map(c => ({
      id: c.id, userId: c.user_id, waypointLabel: c.waypoint_label,
      latitude: c.latitude, longitude: c.longitude, missed: !!c.missed, createdAt: c.created_at,
    })),
    carpoolRequests: carpoolReqs.map(cr => ({
      id: cr.id, requesterId: cr.requester_id, name: cr.name,
      avatarColor: cr.avatar_color, avatarEmoji: cr.avatar_emoji,
      status: cr.status, message: cr.message, createdAt: cr.created_at,
    })),
  })
})

adventuresRouter.put('/adventures/routes/:id', (req, res) => {
  const userId = r(req).userId
  const rt = db.prepare('SELECT * FROM adventure_routes WHERE id = ?').get(req.params.id) as any
  if (!rt) return res.status(404).json({ error: 'Route not found' })
  if (rt.user_id !== userId) return res.status(403).json({ error: 'Only the route owner can edit' })

  const b = req.body || {}
  const validStatuses = ['planning', 'active', 'completed', 'cancelled']

  db.prepare(`UPDATE adventure_routes SET
    title=?, from_city=?, to_city=?, waypoints=?, start_date=?, end_date=?,
    distance_km=?, status=?, seat_capacity=?, seat_cost=?, notes=?, companion_matching=?, updated_at=?
    WHERE id=?`).run(
    String(b.title ?? rt.title).slice(0, 100),
    String(b.fromCity ?? rt.from_city).slice(0, 80),
    String(b.toCity ?? rt.to_city).slice(0, 80),
    Array.isArray(b.waypoints) ? j(b.waypoints) : rt.waypoints,
    b.startDate ?? rt.start_date,
    b.endDate ?? rt.end_date,
    b.distanceKm != null ? Number(b.distanceKm) : rt.distance_km,
    validStatuses.includes(b.status) ? b.status : rt.status,
    b.seatCapacity != null ? Math.max(1, Math.min(9, Number(b.seatCapacity))) : rt.seat_capacity,
    b.seatCost != null ? Math.max(0, Number(b.seatCost)) : rt.seat_cost,
    String(b.notes ?? rt.notes).slice(0, 500),
    b.companionMatching != null ? (b.companionMatching ? 1 : 0) : rt.companion_matching,
    nowIso(),
    rt.id,
  )

  // When route goes active, create a hub if none yet
  if (b.status === 'active' && !rt.group_id) {
    const hub = findOrCreateHub({
      type: 'adventure' as any,
      id: rt.id,
      name: rt.title,
      destination: `${rt.from_city} → ${rt.to_city}`,
      startDate: rt.start_date,
      endDate: rt.end_date,
    }, userId)
    db.prepare('UPDATE adventure_routes SET group_id=? WHERE id=?').run(hub.id, rt.id)
  }

  const updated = db.prepare('SELECT * FROM adventure_routes WHERE id = ?').get(rt.id) as any
  res.json(routeShape(updated))
})

adventuresRouter.delete('/adventures/routes/:id', (req, res) => {
  const userId = r(req).userId
  const rt = db.prepare('SELECT * FROM adventure_routes WHERE id = ?').get(req.params.id) as any
  if (!rt) return res.status(404).json({ error: 'Route not found' })
  if (rt.user_id !== userId) return res.status(403).json({ error: 'Only the route owner can delete' })
  db.prepare("UPDATE adventure_routes SET status='cancelled', updated_at=? WHERE id=?").run(nowIso(), rt.id)
  res.json({ ok: true })
})

// ─────────────────────────────────────────────
// Companion matching (PRD US-401)
// ─────────────────────────────────────────────
adventuresRouter.get('/adventures/routes/:id/companions', (req, res) => {
  const userId = r(req).userId
  const rt = db.prepare('SELECT * FROM adventure_routes WHERE id = ?').get(req.params.id) as any
  if (!rt) return res.status(404).json({ error: 'Route not found' })
  if (rt.user_id !== userId) return res.status(403).json({ error: 'Not your route' })

  const myUser = db.prepare('SELECT * FROM users WHERE id=?').get(userId) as any

  // Find other routes in the same mode, overlapping city pair, within ±7 days
  const candidates = (db.prepare(`SELECT ar.*, u.*
    FROM adventure_routes ar JOIN users u ON u.id = ar.user_id
    WHERE ar.mode = ? AND ar.companion_matching = 1
      AND ar.status IN ('planning','active')
      AND ar.user_id != ?`)
    .all(rt.mode, userId) as any[]).filter(cand => {
      // Route overlap: same from+to (either direction) OR shared waypoint city
      const myWaypoints = pj<any[]>(rt.waypoints, []).map((w: any) => w.city?.toLowerCase())
      const candWaypoints = pj<any[]>(cand.waypoints, []).map((w: any) => w.city?.toLowerCase())
      const fromTo = [rt.from_city.toLowerCase(), rt.to_city.toLowerCase()]
      const candFromTo = [cand.from_city.toLowerCase(), cand.to_city.toLowerCase()]

      const routeOverlap =
        (fromTo.includes(candFromTo[0]) && fromTo.includes(candFromTo[1])) ||
        myWaypoints.some((w: string) => candFromTo.includes(w)) ||
        candWaypoints.some((w: string) => fromTo.includes(w))

      // Date proximity ±7 days
      if (!routeOverlap) return false
      if (!rt.start_date || !cand.start_date) return true
      const diff = Math.abs(Date.parse(rt.start_date) - Date.parse(cand.start_date))
      return diff <= 7 * 86400000
    })

  // Score + shape
  const results = candidates.map(cand => {
    const compat = compatibility(myUser, cand)
    const bikeP = rt.mode === 'bike' ? bikeProfileShape(db.prepare('SELECT * FROM bike_profiles WHERE user_id=?').get(cand.user_id) as any) : null
    const carP = rt.mode === 'road' ? carProfileShape(db.prepare('SELECT * FROM car_profiles WHERE user_id=?').get(cand.user_id) as any) : null
    return {
      user: publicUser(cand),
      route: routeShape(cand),
      compatibility: compat.score,
      reasons: compat.reasons,
      bikeProfile: bikeP,
      carProfile: carP,
    }
  }).sort((a, b) => b.compatibility - a.compatibility)

  res.json(results)
})

// ─────────────────────────────────────────────
// Live location (PRD US-402) — poll every 60s
// ─────────────────────────────────────────────
adventuresRouter.post('/adventures/routes/:id/location', (req, res) => {
  const userId = r(req).userId
  const rt = db.prepare('SELECT * FROM adventure_routes WHERE id = ?').get(req.params.id) as any
  if (!rt) return res.status(404).json({ error: 'Route not found' })

  const isMember = rt.user_id === userId ||
    (rt.group_id && db.prepare('SELECT 1 FROM group_members WHERE group_id=? AND user_id=?').get(rt.group_id, userId))
  if (!isMember) return res.status(403).json({ error: 'Not a member' })

  const { latitude, longitude, accuracy, batteryPct } = req.body || {}
  if (typeof latitude !== 'number' || typeof longitude !== 'number')
    return res.status(400).json({ error: 'latitude and longitude required' })

  db.prepare('INSERT INTO ride_location_pings (id, route_id, user_id, latitude, longitude, accuracy, battery_pct) VALUES (?,?,?,?,?,?,?)')
    .run(uid(), rt.id, userId, latitude, longitude, accuracy ?? null, batteryPct ?? null)

  // Prune pings older than 24h for this route (additive delete — only old pings, never recent data)
  const cutoff = new Date(Date.now() - 86400000).toISOString().replace('T', ' ').slice(0, 19)
  db.prepare("DELETE FROM ride_location_pings WHERE route_id=? AND created_at < ?").run(rt.id, cutoff)

  res.json({ ok: true })
})

adventuresRouter.get('/adventures/routes/:id/location', (req, res) => {
  const userId = r(req).userId
  const rt = db.prepare('SELECT * FROM adventure_routes WHERE id = ?').get(req.params.id) as any
  if (!rt) return res.status(404).json({ error: 'Route not found' })

  const isMember = rt.user_id === userId ||
    (rt.group_id && db.prepare('SELECT 1 FROM group_members WHERE group_id=? AND user_id=?').get(rt.group_id, userId))
  if (!isMember) return res.status(403).json({ error: 'Not a member' })

  const pings = db.prepare(`SELECT * FROM ride_location_pings WHERE route_id=? ORDER BY created_at DESC`).all(rt.id) as any[]
  // Dedupe to latest per user
  const latest: Record<string, any> = {}
  for (const p of pings) if (!latest[p.user_id]) latest[p.user_id] = p
  res.json(Object.values(latest).map(p => ({
    userId: p.user_id, latitude: p.latitude, longitude: p.longitude,
    accuracy: p.accuracy, batteryPct: p.battery_pct, createdAt: p.created_at,
  })))
})

// ─────────────────────────────────────────────
// Waypoint check-ins (PRD US-401 safety)
// ─────────────────────────────────────────────
adventuresRouter.post('/adventures/routes/:id/checkins', (req, res) => {
  const userId = r(req).userId
  const rt = db.prepare('SELECT * FROM adventure_routes WHERE id = ?').get(req.params.id) as any
  if (!rt) return res.status(404).json({ error: 'Route not found' })

  const isMember = rt.user_id === userId ||
    (rt.group_id && db.prepare('SELECT 1 FROM group_members WHERE group_id=? AND user_id=?').get(rt.group_id, userId))
  if (!isMember) return res.status(403).json({ error: 'Not a member' })

  const { waypointLabel, latitude, longitude } = req.body || {}
  if (!waypointLabel) return res.status(400).json({ error: 'waypointLabel required' })

  db.prepare('INSERT INTO ride_checkins (id, route_id, user_id, waypoint_label, latitude, longitude) VALUES (?,?,?,?,?,?)')
    .run(uid(), rt.id, userId, String(waypointLabel).slice(0, 100), latitude ?? null, longitude ?? null)

  // Notify hub members of check-in
  if (rt.group_id) {
    const checkerName = (db.prepare('SELECT name FROM users WHERE id=?').get(userId) as any)?.name || 'Someone'
    const members = db.prepare('SELECT user_id FROM group_members WHERE group_id=? AND user_id!=?').all(rt.group_id, userId) as any[]
    for (const m of members) {
      db.prepare('INSERT INTO notifications (id,user_id,type,title,body,link) VALUES (?,?,?,?,?,?)')
        .run(uid(), m.user_id, 'checkin', `${checkerName} reached ${waypointLabel}`, `Safe check-in on "${rt.title}"`, `/adventures/routes/${rt.id}`)
    }
  }

  res.json({ ok: true })
})

adventuresRouter.get('/adventures/routes/:id/checkins', (req, res) => {
  const userId = r(req).userId
  const rt = db.prepare('SELECT * FROM adventure_routes WHERE id = ?').get(req.params.id) as any
  if (!rt) return res.status(404).json({ error: 'Route not found' })

  const isMember = rt.user_id === userId ||
    (rt.group_id && db.prepare('SELECT 1 FROM group_members WHERE group_id=? AND user_id=?').get(rt.group_id, userId))
  if (!isMember) return res.status(403).json({ error: 'Not a member' })

  const checkins = db.prepare(`SELECT rc.*, u.name FROM ride_checkins rc JOIN users u ON u.id=rc.user_id WHERE rc.route_id=? ORDER BY rc.created_at ASC`).all(rt.id) as any[]
  res.json(checkins.map(c => ({
    id: c.id, userId: c.user_id, name: c.name, waypointLabel: c.waypoint_label,
    latitude: c.latitude, longitude: c.longitude, missed: !!c.missed, createdAt: c.created_at,
  })))
})

// ─────────────────────────────────────────────
// SOS (PRD US-402 — safety)
// ─────────────────────────────────────────────
adventuresRouter.post('/adventures/routes/:id/sos', (req, res) => {
  const userId = r(req).userId
  const rt = db.prepare('SELECT * FROM adventure_routes WHERE id = ?').get(req.params.id) as any
  if (!rt) return res.status(404).json({ error: 'Route not found' })

  const isMember = rt.user_id === userId ||
    (rt.group_id && db.prepare('SELECT 1 FROM group_members WHERE group_id=? AND user_id=?').get(rt.group_id, userId))
  if (!isMember) return res.status(403).json({ error: 'Not a member' })

  const sender = db.prepare('SELECT * FROM users WHERE id=?').get(userId) as any
  const senderName = sender?.name || 'A rider'
  const { latitude, longitude } = req.body || {}
  const locationStr = latitude && longitude ? ` at (${latitude.toFixed(4)}, ${longitude.toFixed(4)})` : ''
  const body = `${senderName} has triggered an emergency SOS${locationStr} on route "${rt.title}". Check in with them immediately.`

  // Notify all hub members
  if (rt.group_id) {
    const members = db.prepare('SELECT user_id FROM group_members WHERE group_id=? AND user_id!=?').all(rt.group_id, userId) as any[]
    for (const m of members) {
      db.prepare('INSERT INTO notifications (id,user_id,type,title,body,link) VALUES (?,?,?,?,?,?)')
        .run(uid(), m.user_id, 'sos', '🆘 Emergency SOS', body, `/adventures/routes/${rt.id}`)
    }
  }

  // Also notify the route owner if triggered by a member
  if (rt.user_id !== userId) {
    db.prepare('INSERT INTO notifications (id,user_id,type,title,body,link) VALUES (?,?,?,?,?,?)')
      .run(uid(), rt.user_id, 'sos', '🆘 Emergency SOS', body, `/adventures/routes/${rt.id}`)
  }

  // Store the SOS ping if location provided
  if (latitude && longitude) {
    db.prepare('INSERT INTO ride_location_pings (id, route_id, user_id, latitude, longitude, battery_pct) VALUES (?,?,?,?,?,?)')
      .run(uid(), rt.id, userId, latitude, longitude, req.body.batteryPct ?? null)
  }

  // Return the emergency contact details of the SOS sender (for the UI to show tel: link)
  res.json({
    ok: true,
    emergencyName: sender?.emergency_name || null,
    emergencyPhone: sender?.emergency_phone || null,
  })
})

// ─────────────────────────────────────────────
// Carpooling (PRD US-404 road trips)
// ─────────────────────────────────────────────
adventuresRouter.post('/adventures/routes/:id/carpool/request', (req, res) => {
  const userId = r(req).userId
  const rt = db.prepare('SELECT * FROM adventure_routes WHERE id = ?').get(req.params.id) as any
  if (!rt) return res.status(404).json({ error: 'Route not found' })
  if (rt.mode !== 'road') return res.status(400).json({ error: 'Carpooling only available for road trips' })
  if (rt.user_id === userId) return res.status(400).json({ error: 'Cannot request a seat on your own route' })

  // Check seat availability
  const acceptedCount = (db.prepare("SELECT COUNT(*) AS c FROM carpool_requests WHERE route_id=? AND status='accepted'").get(rt.id) as any).c
  if (acceptedCount >= rt.seat_capacity - 1) return res.status(409).json({ error: 'No seats available' })

  const existing = db.prepare('SELECT * FROM carpool_requests WHERE route_id=? AND requester_id=?').get(rt.id, userId)
  if (existing) return res.status(409).json({ error: 'Already requested a seat' })

  const message = String(req.body?.message || '').slice(0, 280)
  db.prepare('INSERT INTO carpool_requests (id, route_id, requester_id, message) VALUES (?,?,?,?)')
    .run(uid(), rt.id, userId, message)

  // Notify owner
  const requesterName = (db.prepare('SELECT name FROM users WHERE id=?').get(userId) as any)?.name || 'Someone'
  db.prepare('INSERT INTO notifications (id,user_id,type,title,body,link) VALUES (?,?,?,?,?,?)')
    .run(uid(), rt.user_id, 'carpool_request', `${requesterName} wants a seat`, `Seat request for "${rt.title}"`, `/adventures/routes/${rt.id}`)

  res.status(201).json({ ok: true })
})

adventuresRouter.put('/adventures/routes/:id/carpool/:requestId', (req, res) => {
  const userId = r(req).userId
  const rt = db.prepare('SELECT * FROM adventure_routes WHERE id = ?').get(req.params.id) as any
  if (!rt) return res.status(404).json({ error: 'Route not found' })
  if (rt.user_id !== userId) return res.status(403).json({ error: 'Only route owner can manage requests' })

  const cr = db.prepare('SELECT * FROM carpool_requests WHERE id=? AND route_id=?').get(req.params.requestId, rt.id) as any
  if (!cr) return res.status(404).json({ error: 'Request not found' })

  const status = req.body?.status === 'accepted' ? 'accepted' : 'rejected'
  db.prepare('UPDATE carpool_requests SET status=? WHERE id=?').run(status, cr.id)

  // On accept: add to hub, notify requester
  if (status === 'accepted') {
    const hub = findOrCreateHub({
      type: 'adventure' as any,
      id: rt.id,
      name: rt.title,
      destination: `${rt.from_city} → ${rt.to_city}`,
      startDate: rt.start_date,
      endDate: rt.end_date,
    }, rt.user_id)
    // Add requester to hub
    if (!db.prepare('SELECT 1 FROM group_members WHERE group_id=? AND user_id=?').get(hub.id, cr.requester_id)) {
      db.prepare("INSERT INTO group_members (group_id, user_id, role) VALUES (?,?,'member')").run(hub.id, cr.requester_id)
      db.prepare('INSERT OR IGNORE INTO chat_members (chat_id, user_id) VALUES (?,?)').run(hub.chat_id, cr.requester_id)
    }
    // Update route with hub_id
    if (!rt.group_id) db.prepare('UPDATE adventure_routes SET group_id=? WHERE id=?').run(hub.id, rt.id)
    db.prepare('INSERT INTO notifications (id,user_id,type,title,body,link) VALUES (?,?,?,?,?,?)')
      .run(uid(), cr.requester_id, 'carpool_accepted', 'Seat confirmed! 🎉', `Your seat on "${rt.title}" is confirmed. You've been added to the ride group.`, `/adventures/routes/${rt.id}`)
  } else {
    db.prepare('INSERT INTO notifications (id,user_id,type,title,body,link) VALUES (?,?,?,?,?,?)')
      .run(uid(), cr.requester_id, 'carpool_rejected', 'Seat not available', `Your request for "${rt.title}" was not accepted.`, '/adventures/carpool')
  }

  res.json({ ok: true, status })
})
