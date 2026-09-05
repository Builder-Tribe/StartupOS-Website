import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { db, uid, pj } from '../db.js'
import { requireAuth, type AuthedRequest } from '../lib/auth.js'

export const reviewsRouter = Router()

const SECRET = process.env.JWT_SECRET || 'trippy-dev-secret'
const r = (req: any) => req as AuthedRequest

function optionalUser(req: any): string | null {
  const h = req.headers.authorization || ''
  const t = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!t) return null
  try {
    const p = jwt.verify(t, SECRET) as { sub: string; kind?: string }
    if (p.kind === 'partner') return null
    return db.prepare('SELECT 1 FROM users WHERE id = ?').get(p.sub) ? p.sub : null
  } catch { return null }
}

function reviewShape(rv: any, viewerId?: string | null) {
  const u = db.prepare('SELECT id, name, avatar_color, avatar_emoji FROM users WHERE id = ?').get(rv.reviewer_id) as any
  return {
    id: rv.id,
    rating: rv.rating,
    title: rv.title,
    body: rv.body,
    photos: pj<string[]>(rv.photos, []),
    createdAt: rv.created_at,
    reviewer: u ? { id: u.id, name: u.name, avatarColor: u.avatar_color, avatarEmoji: u.avatar_emoji } : null,
    isOwn: viewerId === rv.reviewer_id,
  }
}

// GET /api/reviews?targetType=X&targetId=Y — public
reviewsRouter.get('/reviews', (req, res) => {
  const { targetType, targetId } = req.query as Record<string, string>
  if (!targetType || !targetId) return res.status(400).json({ error: 'targetType and targetId required' })
  const viewerId = optionalUser(req)
  const rows = db.prepare('SELECT * FROM trip_reviews WHERE target_type = ? AND target_id = ? ORDER BY created_at DESC').all(targetType, targetId) as any[]
  const avgRating = rows.length ? Math.round(rows.reduce((s, rv) => s + rv.rating, 0) / rows.length * 10) / 10 : null
  res.json({ reviews: rows.map(rv => reviewShape(rv, viewerId)), avgRating, count: rows.length })
})

// POST /api/reviews — create (auth)
reviewsRouter.post('/reviews', requireAuth, (req, res) => {
  const userId = r(req).userId
  const { targetType, targetId, rating, title, body, photos } = req.body
  const VALID_TYPES = ['partner_trip', 'operator_trip', 'hostel']
  if (!VALID_TYPES.includes(targetType)) return res.status(400).json({ error: 'Invalid targetType' })
  if (!targetId) return res.status(400).json({ error: 'targetId required' })
  const ratingNum = Number(rating)
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) return res.status(400).json({ error: 'Rating must be 1–5' })

  let eligible = false
  if (targetType === 'partner_trip') {
    const confirmed = db.prepare("SELECT 1 FROM bookings WHERE user_id = ? AND trip_id = ? AND status = 'confirmed'").get(userId, targetId)
    const inHub = db.prepare("SELECT 1 FROM group_members gm JOIN groups g ON g.id = gm.group_id WHERE gm.user_id = ? AND g.source_type = 'partner' AND g.source_id = ?").get(userId, targetId)
    eligible = !!(confirmed || inHub)
  } else if (targetType === 'operator_trip') {
    const inHub = db.prepare("SELECT 1 FROM group_members gm JOIN groups g ON g.id = gm.group_id WHERE gm.user_id = ? AND g.source_type = 'operator' AND g.source_id = ?").get(userId, targetId)
    eligible = !!inHub
  } else if (targetType === 'hostel') {
    const hasTbl = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='hostel_stays'").get()
    eligible = hasTbl
      ? !!db.prepare('SELECT 1 FROM hostel_stays WHERE user_id = ? AND hostel_id = ?').get(userId, targetId)
      : true
  }

  if (!eligible) return res.status(403).json({ error: 'You can only review trips or hostels you have been part of' })

  if (db.prepare('SELECT 1 FROM trip_reviews WHERE reviewer_id = ? AND target_type = ? AND target_id = ?').get(userId, targetType, targetId)) {
    return res.status(409).json({ error: 'You have already reviewed this' })
  }

  const id = uid()
  db.prepare('INSERT INTO trip_reviews (id, reviewer_id, target_type, target_id, rating, title, body, photos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, userId, targetType, targetId, ratingNum, String(title || '').trim(), String(body || '').trim(), JSON.stringify(Array.isArray(photos) ? photos : []))
  const rv = db.prepare('SELECT * FROM trip_reviews WHERE id = ?').get(id) as any
  res.json(reviewShape(rv, userId))
})

// PUT /api/reviews/:id — edit own review (auth)
reviewsRouter.put('/reviews/:id', requireAuth, (req, res) => {
  const userId = r(req).userId
  const rv = db.prepare('SELECT * FROM trip_reviews WHERE id = ?').get(req.params.id) as any
  if (!rv) return res.status(404).json({ error: 'Review not found' })
  if (rv.reviewer_id !== userId) return res.status(403).json({ error: 'Not your review' })
  const { rating, title, body, photos } = req.body
  const ratingNum = rating !== undefined ? Number(rating) : rv.rating
  if (ratingNum < 1 || ratingNum > 5) return res.status(400).json({ error: 'Rating must be 1–5' })
  db.prepare('UPDATE trip_reviews SET rating=?, title=?, body=?, photos=? WHERE id=?')
    .run(ratingNum, title !== undefined ? String(title).trim() : rv.title, body !== undefined ? String(body).trim() : rv.body, photos !== undefined ? JSON.stringify(Array.isArray(photos) ? photos : []) : rv.photos, rv.id)
  const updated = db.prepare('SELECT * FROM trip_reviews WHERE id = ?').get(rv.id) as any
  res.json(reviewShape(updated, userId))
})

// DELETE /api/reviews/:id — delete own review (auth)
reviewsRouter.delete('/reviews/:id', requireAuth, (req, res) => {
  const userId = r(req).userId
  const rv = db.prepare('SELECT * FROM trip_reviews WHERE id = ?').get(req.params.id) as any
  if (!rv) return res.status(404).json({ error: 'Review not found' })
  if (rv.reviewer_id !== userId) return res.status(403).json({ error: 'Not your review' })
  db.prepare('DELETE FROM trip_reviews WHERE id = ?').run(rv.id)
  res.json({ ok: true })
})
