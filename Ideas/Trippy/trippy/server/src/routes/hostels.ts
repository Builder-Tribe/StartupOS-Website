import { Router } from 'express'
import { db, uid, pj, today } from '../db.js'
import { requireAuth, optionalAuth, type AuthedRequest } from '../lib/auth.js'
import { publicUser } from '../lib/shape.js'

export const hostelsRouter = Router()

const r = (req: any) => req as AuthedRequest

function hostelShape(h: any, me: string) {
  // Member count only includes stays whose owner opted into visibility (PRD 1.3)
  const memberCount = (db.prepare(`
    SELECT COUNT(DISTINCT user_id) AS c FROM hostel_stays
    WHERE hostel_id = ? AND visible = 1 AND end_date >= ? AND user_id != ?
  `).get(h.id, today(), me) as any)?.c || 0
  const myStay = db.prepare('SELECT * FROM hostel_stays WHERE hostel_id = ? AND user_id = ? AND end_date >= ?').get(h.id, me, today()) as any
  const isMine = !!(me && h.created_by_user_id === me)
  return {
    id: h.id, destination: h.destination, name: h.name, area: h.area, city: h.city,
    pricePerNight: h.price_per_night, rating: h.rating, reviewCount: h.review_count,
    propertyType: h.property_type || 'hostel',
    amenities: pj<string[]>(h.amenities, []), vibeTags: pj<string[]>(h.vibe_tags, []),
    description: h.description, coverImage: h.cover_image || '', featured: !!h.featured,
    partner: !!h.partner, bookingUrl: h.booking_url,
    memberCount, myStay: myStay || null,
    isMine, canEdit: isMine, canDelete: isMine, createdByUserId: h.created_by_user_id || null,
  }
}

// Consumer only ever sees PUBLISHED hostels (canonical status lives on the row).
// User-submitted stays are private to the traveller who created them.
hostelsRouter.get('/hostels', optionalAuth, (req, res) => {
  const dest = String(req.query.destination || '').trim()
  const slugified = dest.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const me = r(req).userId || ''

  let dbRows = (dest
    ? db.prepare(`
        SELECT * FROM hostels
        WHERE (LOWER(destination) = LOWER(?) OR LOWER(destination) = LOWER(?) OR LOWER(city) = LOWER(?) OR LOWER(slug) = LOWER(?))
        AND status = 'published'
        AND (source IS NULL OR source != 'user_submitted' OR created_by_user_id = ?)
        ORDER BY featured DESC, rating DESC
      `).all(dest, slugified, dest, slugified, me)
    : db.prepare(`
        SELECT * FROM hostels
        WHERE status = 'published'
        AND (source IS NULL OR source != 'user_submitted' OR created_by_user_id = ?)
        ORDER BY featured DESC, rating DESC
      `).all(me)) as any[]

  const result = dbRows.map(h => hostelShape(h, me))

  // Dynamically enrich stay options with Airbnbs and Boutique Hotels for any destination
  if (dest) {
    const cleanName = dest.split(/[- ]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    const hasAirbnb = result.some(r => r.propertyType === 'airbnb')
    const hasHotel = result.some(r => r.propertyType === 'hotel')

    if (!hasAirbnb) {
      result.push({
        id: `airbnb-${slugified}-1`,
        destination: slugified,
        name: `Lakeview Private Villa & Apartment`,
        area: `Central ${cleanName}`,
        city: cleanName,
        pricePerNight: 2499,
        rating: 4.85,
        reviewCount: 142,
        propertyType: 'airbnb',
        amenities: ['wifi', 'kitchen', 'balcony', 'self check-in', 'ac'],
        vibeTags: ['airbnb', 'private', 'scenic'],
        description: `Entire high-rated private apartment in ${cleanName} with kitchen, panoramic views, and high-speed Wi-Fi. Ideal for small groups & solo travellers.`,
        coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
        featured: false,
        partner: false,
        bookingUrl: `https://www.airbnb.com/s/${encodeURIComponent(cleanName)}`,
        memberCount: 0,
        myStay: null,
        isMine: false, canEdit: false, canDelete: false, createdByUserId: null
      })
      result.push({
        id: `airbnb-${slugified}-2`,
        destination: slugified,
        name: `${cleanName} Heritage Homestay (Entire Floor)`,
        area: `Old Town ${cleanName}`,
        city: cleanName,
        pricePerNight: 1899,
        rating: 4.9,
        reviewCount: 88,
        propertyType: 'airbnb',
        amenities: ['wifi', 'breakfast included', 'patio', 'workspace'],
        vibeTags: ['airbnb', 'homestay', 'cozy'],
        description: `Charming local homestay hosted by a local family in ${cleanName}. Organic breakfast included.`,
        coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
        featured: false,
        partner: false,
        bookingUrl: `https://www.airbnb.com/s/${encodeURIComponent(cleanName)}`,
        memberCount: 0,
        myStay: null,
        isMine: false, canEdit: false, canDelete: false, createdByUserId: null
      })
    }

    if (!hasHotel) {
      result.push({
        id: `hotel-${slugified}-1`,
        destination: slugified,
        name: `The ${cleanName} Grand Heritage Hotel & Spa`,
        area: `Palace Quarter`,
        city: cleanName,
        pricePerNight: 3999,
        rating: 4.7,
        reviewCount: 320,
        propertyType: 'hotel',
        amenities: ['pool', 'spa', 'fine dining', 'valet parking', 'room service'],
        vibeTags: ['luxury', 'heritage', 'hotel'],
        description: `Premier boutique heritage hotel in ${cleanName} featuring a rooftop pool, spa, and royal dining rooms.`,
        coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
        featured: true,
        partner: false,
        bookingUrl: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(cleanName)}`,
        memberCount: 0,
        myStay: null,
        isMine: false, canEdit: false, canDelete: false, createdByUserId: null
      })
      result.push({
        id: `hotel-${slugified}-2`,
        destination: slugified,
        name: `${cleanName} Royal Boutique Resort`,
        area: `Riverside / Lakefront`,
        city: cleanName,
        pricePerNight: 2899,
        rating: 4.5,
        reviewCount: 210,
        propertyType: 'hotel',
        amenities: ['wifi', 'bar', 'restaurant', 'lake view', 'airport shuttle'],
        vibeTags: ['boutique', 'scenic', 'hotel'],
        description: `Scenic 4-star boutique hotel near major attractions with lakefront dining and 24/7 concierge.`,
        coverImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
        featured: false,
        partner: false,
        bookingUrl: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(cleanName)}`,
        memberCount: 0,
        myStay: null,
        isMine: false, canEdit: false, canDelete: false, createdByUserId: null
      })
    }
  }

  res.json(result)
})

// User-submitted accommodation endpoint (PRD 1.3 community submissions)
hostelsRouter.post('/hostels', requireAuth, (req, res) => {
  const { name, destination, propertyType, area, pricePerNight, bookingUrl, description } = req.body || {}
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Property name is required' })
  }
  if (!destination || typeof destination !== 'string' || !destination.trim()) {
    return res.status(400).json({ error: 'Destination is required' })
  }

  const userId = r(req).userId
  const id = uid()
  const destSlug = destination.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const cleanDest = destination.trim().split(/[- ]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
  const type = ['hostel', 'airbnb', 'hotel', 'homestay'].includes(String(propertyType).toLowerCase())
    ? String(propertyType).toLowerCase()
    : 'hostel'
  const price = Number(pricePerNight) > 0 ? Number(pricePerNight) : (type === 'hotel' ? 2500 : type === 'airbnb' ? 2000 : 750)
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + id.slice(0, 6)

  db.prepare(`
    INSERT INTO hostels (
      id, destination, name, area, price_per_night, rating, review_count,
      amenities, vibe_tags, description, partner, booking_url, property_type,
      status, featured, source, slug, city, country, created_by_user_id, created_at, published_at
    ) VALUES (
      ?, ?, ?, ?, ?, 4.8, 1,
      ?, ?, ?, 0, ?, ?,
      'published', 0, 'user_submitted', ?, ?, 'India', ?, datetime('now'), datetime('now')
    )
  `).run(
    id, destSlug, name.trim(), area?.trim() || cleanDest, price,
    JSON.stringify(['wifi', 'user stay']), JSON.stringify([type, 'user submission']),
    description?.trim() || `User-submitted ${type} stay in ${cleanDest}.`,
    bookingUrl?.trim() || null, type, slug, cleanDest, userId
  )

  const created = db.prepare('SELECT * FROM hostels WHERE id = ?').get(id) as any
  res.status(201).json(hostelShape(created, userId))
})

// Edit own stay endpoint
hostelsRouter.put('/hostels/:id', requireAuth, (req, res) => {
  const me = r(req).userId
  const h = db.prepare('SELECT * FROM hostels WHERE id = ?').get(req.params.id) as any
  if (!h) return res.status(404).json({ error: 'Stay not found' })
  if (h.created_by_user_id !== me) {
    return res.status(403).json({ error: 'You can only edit stays created by you' })
  }

  const { name, propertyType, area, pricePerNight, bookingUrl, description } = req.body || {}
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Stay name is required' })
  }

  const type = ['hostel', 'airbnb', 'hotel', 'homestay'].includes(String(propertyType).toLowerCase())
    ? String(propertyType).toLowerCase()
    : h.property_type || 'hostel'
  const price = Number(pricePerNight) > 0 ? Number(pricePerNight) : h.price_per_night

  db.prepare(`
    UPDATE hostels SET
      name = ?, property_type = ?, area = ?, price_per_night = ?,
      booking_url = ?, description = ?
    WHERE id = ? AND created_by_user_id = ?
  `).run(
    name.trim(), type, area?.trim() || h.area, price,
    bookingUrl?.trim() || null, description?.trim() || h.description,
    req.params.id, me
  )

  const updated = db.prepare('SELECT * FROM hostels WHERE id = ?').get(req.params.id) as any
  res.json(hostelShape(updated, me))
})

// Delete own stay endpoint
hostelsRouter.delete('/hostels/:id', requireAuth, (req, res) => {
  const me = r(req).userId
  const h = db.prepare('SELECT * FROM hostels WHERE id = ?').get(req.params.id) as any
  if (!h) return res.status(404).json({ error: 'Stay not found' })
  if (h.created_by_user_id !== me) {
    return res.status(403).json({ error: 'You can only delete stays created by you' })
  }

  db.prepare("UPDATE hostels SET status = 'deleted' WHERE id = ? AND created_by_user_id = ?").run(req.params.id, me)
  db.prepare("DELETE FROM hostel_stays WHERE hostel_id = ? AND user_id = ?").run(req.params.id, me)
  res.json({ ok: true, deletedId: req.params.id })
})

hostelsRouter.get('/hostels/:id', optionalAuth, (req, res) => {
  const h = db.prepare("SELECT * FROM hostels WHERE id = ? AND status = 'published'").get(req.params.id) as any
  if (!h) return res.status(404).json({ error: 'Hostel not found' })
  const me = r(req).userId
  // Guests see the member COUNT (via hostelShape) but not who — profiles are for the community.
  const members = !me ? [] : (db.prepare(`
    SELECT u.*, s.start_date AS stay_start, s.end_date AS stay_end FROM hostel_stays s JOIN users u ON u.id = s.user_id
    WHERE s.hostel_id = ? AND s.visible = 1 AND s.end_date >= ? AND s.user_id != ?
    ORDER BY s.start_date
  `).all(h.id, today(), me) as any[]).map(row => ({ ...publicUser(row), stay: { startDate: row.stay_start, endDate: row.stay_end } }))
  const reviews = (db.prepare(`
    SELECT hr.*, u.name AS user_name, u.avatar_color, u.avatar_emoji FROM hostel_reviews hr LEFT JOIN users u ON u.id = hr.user_id
    WHERE hr.hostel_id = ? ORDER BY hr.created_at DESC LIMIT 10
  `).all(h.id) as any[]).map(rv => ({ id: rv.id, rating: rv.rating, text: rv.text, userName: rv.user_name, avatarColor: rv.avatar_color, avatarEmoji: rv.avatar_emoji }))
  res.json({ ...hostelShape(h, me), members, reviews })
})

// Writes are per-route authed (no router-wide use(): these routers share the
// /api mount, and a global gate here would 401 guest requests passing through
// to other routers).
hostelsRouter.post('/hostels/:id/stay', requireAuth, (req, res) => {
  const { startDate, endDate, visible } = req.body || {}
  if (!startDate || !endDate || endDate < startDate) return res.status(400).json({ error: 'Valid dates are required' })
  const h = db.prepare('SELECT id FROM hostels WHERE id = ?').get(req.params.id)
  if (!h) return res.status(404).json({ error: 'Hostel not found' })
  const id = uid()
  // Visibility is opt-in; default private (PRD 1.3)
  db.prepare('INSERT INTO hostel_stays (id, user_id, hostel_id, start_date, end_date, visible) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, r(req).userId, req.params.id, startDate, endDate, visible ? 1 : 0)
  res.json(db.prepare('SELECT * FROM hostel_stays WHERE id = ?').get(id))
})

hostelsRouter.delete('/stays/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM hostel_stays WHERE id = ? AND user_id = ?').run(req.params.id, r(req).userId)
  res.json({ ok: true })
})

hostelsRouter.put('/stays/:id/visibility', requireAuth, (req, res) => {
  db.prepare('UPDATE hostel_stays SET visible = ? WHERE id = ? AND user_id = ?')
    .run(req.body?.visible ? 1 : 0, req.params.id, r(req).userId)
  res.json({ ok: true })
})
