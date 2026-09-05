import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { db, uid, pj, j, nowIso } from '../db.js'
import { JWT_SECRET as SECRET } from '../lib/auth.js'

export const storiesRouter = Router()

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

function requireUser(req: any, res: any): string | null {
  const id = optionalUser(req)
  if (!id) { res.status(401).json({ error: 'Sign in to do that' }); return null }
  return id
}

function authorShape(userId: string) {
  return db.prepare('SELECT id, name, avatar_color, avatar_emoji FROM users WHERE id = ?').get(userId) as any
}

function storyCard(s: any, viewerId?: string | null) {
  const a = authorShape(s.user_id)
  const liked = viewerId ? !!db.prepare('SELECT 1 FROM story_reactions WHERE story_id = ? AND user_id = ?').get(s.id, viewerId) : false
  return {
    id: s.id, title: s.title, coverPhoto: s.cover_photo,
    destination: s.destination, destinationSlug: s.destination_slug,
    startDate: s.start_date, endDate: s.end_date,
    visibility: s.visibility, status: s.status,
    likeCount: s.like_count, stepCount: s.step_count,
    sourceType: s.source_type, sourceId: s.source_id,
    createdAt: s.created_at, updatedAt: s.updated_at,
    author: a ? { id: a.id, name: a.name, avatarColor: a.avatar_color, avatarEmoji: a.avatar_emoji } : null,
    isOwn: viewerId === s.user_id,
    liked,
  }
}

function shapeStep(s: any) {
  return {
    id: s.id, dayNumber: s.day_number, date: s.date,
    location: s.location, country: s.country,
    title: s.title, description: s.description,
    photos: pj<string[]>(s.photos, []),
    sortOrder: s.sort_order, createdAt: s.created_at,
  }
}

function stepsFor(storyId: string) {
  return (db.prepare('SELECT * FROM story_steps WHERE story_id = ? ORDER BY sort_order, date, day_number, created_at').all(storyId) as any[]).map(shapeStep)
}

// Feed: community = public stories everyone can see; friends = private stories from connections
storiesRouter.get('/stories', (req, res) => {
  const viewerId = optionalUser(req)
  const dest = String(req.query.destination || '')
  const feedParam = req.query.feed as string | undefined
  const friendsFeed = feedParam === 'friends' && !!viewerId
  const followingFeed = feedParam === 'following' && !!viewerId

  const where: string[] = []
  const args: any[] = []

  if (friendsFeed) {
    // Private stories authored by accepted connections (either direction) or yourself
    where.push("s.visibility = 'private'")
    where.push(`s.user_id IN (
      SELECT CASE WHEN from_user = ? THEN to_user ELSE from_user END
      FROM connections WHERE (from_user = ? OR to_user = ?) AND status = 'accepted'
      UNION SELECT ?
    )`)
    args.push(viewerId, viewerId, viewerId, viewerId)
  } else if (followingFeed) {
    // Public stories from people the viewer follows
    where.push("s.visibility = 'public'")
    where.push(`s.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)`)
    args.push(viewerId)
  } else {
    // Community: all public stories
    where.push("s.visibility = 'public'")
  }

  if (dest) { where.push('s.destination_slug = ?'); args.push(dest) }

  const rows = db.prepare(`SELECT s.* FROM trip_stories s WHERE ${where.join(' AND ')} ORDER BY s.created_at DESC LIMIT 30`).all(...args) as any[]
  res.json(rows.map(s => storyCard(s, viewerId)))
})

// My stories (auth required)
storiesRouter.get('/stories/mine', (req, res) => {
  const userId = requireUser(req, res)
  if (!userId) return
  const rows = db.prepare('SELECT * FROM trip_stories WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[]
  res.json(rows.map(s => storyCard(s, userId)))
})

// Stories by user id (public stories only unless own)
storiesRouter.get('/stories/by/:userId', (req, res) => {
  const viewerId = optionalUser(req)
  const targetId = req.params.userId
  const isSelf = viewerId === targetId
  const where = isSelf ? 'user_id = ?' : "user_id = ? AND visibility = 'public'"
  const rows = db.prepare(`SELECT * FROM trip_stories WHERE ${where} ORDER BY created_at DESC`).all(targetId) as any[]
  res.json(rows.map(s => storyCard(s, viewerId)))
})

// Full story detail with steps + comments
storiesRouter.get('/stories/:id', (req, res) => {
  const viewerId = optionalUser(req)
  const s = db.prepare('SELECT * FROM trip_stories WHERE id = ?').get(req.params.id) as any
  if (!s) return res.status(404).json({ error: 'Story not found' })
  if (s.visibility === 'private' && s.user_id !== viewerId) {
    // Private stories are readable by accepted connections
    const isConnected = viewerId && !!db.prepare(
      `SELECT 1 FROM connections WHERE ((from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?)) AND status = 'accepted'`
    ).get(viewerId, s.user_id, s.user_id, viewerId)
    if (!isConnected) return res.status(403).json({ error: 'This story is private — connect with this traveller to read it' })
  }
  const comments = (db.prepare(
    `SELECT c.*, u.name, u.avatar_color, u.avatar_emoji FROM story_comments c
     LEFT JOIN users u ON u.id = c.user_id WHERE c.story_id = ? ORDER BY c.created_at ASC`
  ).all(s.id) as any[]).map(c => ({
    id: c.id, text: c.text, createdAt: c.created_at,
    author: { id: c.user_id, name: c.name, avatarColor: c.avatar_color, avatarEmoji: c.avatar_emoji },
  }))
  res.json({ ...storyCard(s, viewerId), steps: stepsFor(s.id), comments })
})

// Create a story (auth)
storiesRouter.post('/stories', (req, res) => {
  const userId = requireUser(req, res)
  if (!userId) return
  const { title, coverPhoto, destination, destinationSlug, startDate, endDate, visibility, sourceType, sourceId } = req.body
  const safeVisibility = ['public', 'private'].includes(visibility) ? visibility : 'public'
  const id = uid()
  db.prepare(`INSERT INTO trip_stories (id, user_id, title, cover_photo, destination, destination_slug, start_date, end_date, visibility, source_type, source_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, userId, title || '', coverPhoto || '', destination || '', destinationSlug || null, startDate || null, endDate || null, safeVisibility, sourceType || null, sourceId || null)
  const s = db.prepare('SELECT * FROM trip_stories WHERE id = ?').get(id) as any
  res.json(storyCard(s, userId))
})

// Update story metadata (auth, owner)
storiesRouter.put('/stories/:id', (req, res) => {
  const userId = requireUser(req, res)
  if (!userId) return
  const s = db.prepare('SELECT * FROM trip_stories WHERE id = ?').get(req.params.id) as any
  if (!s) return res.status(404).json({ error: 'Story not found' })
  if (s.user_id !== userId) return res.status(403).json({ error: 'Not your story' })
  const { title, coverPhoto, destination, destinationSlug, startDate, endDate, visibility, status } = req.body
  const safeVisibility = ['public', 'private'].includes(visibility) ? visibility : s.visibility
  db.prepare(`UPDATE trip_stories SET title=?, cover_photo=?, destination=?, destination_slug=?, start_date=?, end_date=?, visibility=?, status=?, updated_at=? WHERE id=?`)
    .run(title ?? s.title, coverPhoto ?? s.cover_photo, destination ?? s.destination, destinationSlug ?? s.destination_slug, startDate ?? s.start_date, endDate ?? s.end_date, safeVisibility, status ?? s.status, nowIso(), s.id)
  const updated = db.prepare('SELECT * FROM trip_stories WHERE id = ?').get(s.id) as any
  res.json(storyCard(updated, userId))
})

// Delete story (auth, owner)
storiesRouter.delete('/stories/:id', (req, res) => {
  const userId = requireUser(req, res)
  if (!userId) return
  const s = db.prepare('SELECT * FROM trip_stories WHERE id = ?').get(req.params.id) as any
  if (!s) return res.status(404).json({ error: 'Not found' })
  if (s.user_id !== userId) return res.status(403).json({ error: 'Not your story' })
  db.prepare('DELETE FROM trip_stories WHERE id = ?').run(s.id)
  res.json({ ok: true })
})

// Add a step (auth, owner)
storiesRouter.post('/stories/:id/steps', (req, res) => {
  const userId = requireUser(req, res)
  if (!userId) return
  const s = db.prepare('SELECT * FROM trip_stories WHERE id = ?').get(req.params.id) as any
  if (!s) return res.status(404).json({ error: 'Story not found' })
  if (s.user_id !== userId) return res.status(403).json({ error: 'Not your story' })
  const { dayNumber, date, location, country, title, description, photos } = req.body
  const existingCount = (db.prepare('SELECT COUNT(*) as c FROM story_steps WHERE story_id = ?').get(s.id) as any).c
  const id = uid()
  db.prepare(`INSERT INTO story_steps (id, story_id, day_number, date, location, country, title, description, photos, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, s.id, dayNumber || 1, date || null, location || '', country || null, title || '', description || '', j(photos || []), existingCount)
  db.prepare('UPDATE trip_stories SET step_count = step_count + 1, updated_at = ? WHERE id = ?').run(nowIso(), s.id)
  const step = db.prepare('SELECT * FROM story_steps WHERE id = ?').get(id) as any
  res.json(shapeStep(step))
})

// Edit a step (auth, owner)
storiesRouter.put('/stories/:id/steps/:stepId', (req, res) => {
  const userId = requireUser(req, res)
  if (!userId) return
  const s = db.prepare('SELECT * FROM trip_stories WHERE id = ?').get(req.params.id) as any
  if (!s || s.user_id !== userId) return res.status(403).json({ error: 'Not your story' })
  const step = db.prepare('SELECT * FROM story_steps WHERE id = ? AND story_id = ?').get(req.params.stepId, s.id) as any
  if (!step) return res.status(404).json({ error: 'Step not found' })
  const { dayNumber, date, location, country, title, description, photos } = req.body
  db.prepare(`UPDATE story_steps SET day_number=?, date=?, location=?, country=?, title=?, description=?, photos=? WHERE id=?`)
    .run(dayNumber ?? step.day_number, date ?? step.date, location ?? step.location, country ?? step.country, title ?? step.title, description ?? step.description, j(photos ?? pj<string[]>(step.photos, [])), step.id)
  db.prepare('UPDATE trip_stories SET updated_at = ? WHERE id = ?').run(nowIso(), s.id)
  const updated = db.prepare('SELECT * FROM story_steps WHERE id = ?').get(step.id) as any
  res.json(shapeStep(updated))
})

// Delete a step (auth, owner)
storiesRouter.delete('/stories/:id/steps/:stepId', (req, res) => {
  const userId = requireUser(req, res)
  if (!userId) return
  const s = db.prepare('SELECT * FROM trip_stories WHERE id = ?').get(req.params.id) as any
  if (!s || s.user_id !== userId) return res.status(403).json({ error: 'Not your story' })
  const step = db.prepare('SELECT * FROM story_steps WHERE id = ? AND story_id = ?').get(req.params.stepId, s.id) as any
  if (!step) return res.status(404).json({ error: 'Step not found' })
  db.prepare('DELETE FROM story_steps WHERE id = ?').run(step.id)
  db.prepare('UPDATE trip_stories SET step_count = MAX(0, step_count - 1), updated_at = ? WHERE id = ?').run(nowIso(), s.id)
  res.json({ ok: true })
})

// Toggle like (auth)
storiesRouter.post('/stories/:id/like', (req, res) => {
  const userId = requireUser(req, res)
  if (!userId) return
  const s = db.prepare('SELECT * FROM trip_stories WHERE id = ?').get(req.params.id) as any
  if (!s) return res.status(404).json({ error: 'Story not found' })
  if (s.visibility === 'private' && s.user_id !== userId) {
    const isConnected = !!db.prepare(
      `SELECT 1 FROM connections WHERE ((from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?)) AND status = 'accepted'`
    ).get(userId, s.user_id, s.user_id, userId)
    if (!isConnected) return res.status(403).json({ error: 'Private story' })
  }
  const already = db.prepare('SELECT 1 FROM story_reactions WHERE story_id = ? AND user_id = ?').get(s.id, userId)
  if (already) {
    db.prepare('DELETE FROM story_reactions WHERE story_id = ? AND user_id = ?').run(s.id, userId)
    db.prepare('UPDATE trip_stories SET like_count = MAX(0, like_count - 1) WHERE id = ?').run(s.id)
    return res.json({ liked: false, likeCount: Math.max(0, s.like_count - 1) })
  }
  db.prepare('INSERT INTO story_reactions (id, story_id, user_id) VALUES (?, ?, ?)').run(uid(), s.id, userId)
  db.prepare('UPDATE trip_stories SET like_count = like_count + 1 WHERE id = ?').run(s.id)
  res.json({ liked: true, likeCount: s.like_count + 1 })
})

// Add a comment (auth)
storiesRouter.post('/stories/:id/comments', (req, res) => {
  const userId = requireUser(req, res)
  if (!userId) return
  const s = db.prepare('SELECT * FROM trip_stories WHERE id = ?').get(req.params.id) as any
  if (!s) return res.status(404).json({ error: 'Story not found' })
  if (s.visibility === 'private' && s.user_id !== userId) return res.status(403).json({ error: 'Private story' })
  const { text } = req.body
  if (!String(text || '').trim()) return res.status(400).json({ error: 'Comment text is required' })
  const id = uid()
  const body = String(text).trim()
  db.prepare('INSERT INTO story_comments (id, story_id, user_id, text) VALUES (?, ?, ?, ?)').run(id, s.id, userId, body)
  const u = db.prepare('SELECT name, avatar_color, avatar_emoji FROM users WHERE id = ?').get(userId) as any
  res.json({ id, text: body, createdAt: nowIso(), author: { id: userId, name: u?.name, avatarColor: u?.avatar_color, avatarEmoji: u?.avatar_emoji } })
})

// Public stories for a destination (guest-accessible)
storiesRouter.get('/destinations/:slug/stories', (req, res) => {
  const viewerId = optionalUser(req)
  const rows = db.prepare("SELECT * FROM trip_stories WHERE visibility = 'public' AND destination_slug = ? ORDER BY created_at DESC LIMIT 20").all(req.params.slug) as any[]
  res.json(rows.map(s => storyCard(s, viewerId)))
})
