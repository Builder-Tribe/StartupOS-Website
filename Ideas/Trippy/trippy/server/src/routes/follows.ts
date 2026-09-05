import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth, type AuthedRequest } from '../lib/auth.js'

export const followsRouter = Router()

const r = (req: any) => req as AuthedRequest

// POST /api/follows/:userId — toggle follow on/off
followsRouter.post('/follows/:userId', requireAuth, (req, res) => {
  const me = r(req).userId
  const them = req.params.userId
  if (me === them) return res.status(400).json({ error: 'Cannot follow yourself' })
  const user = db.prepare('SELECT 1 FROM users WHERE id = ?').get(them)
  if (!user) return res.status(404).json({ error: 'User not found' })
  const existing = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(me, them)
  if (existing) {
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(me, them)
    const count = (db.prepare('SELECT COUNT(*) c FROM follows WHERE following_id = ?').get(them) as any).c
    return res.json({ following: false, followerCount: count })
  }
  db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(me, them)
  const count = (db.prepare('SELECT COUNT(*) c FROM follows WHERE following_id = ?').get(them) as any).c
  res.json({ following: true, followerCount: count })
})

// GET /api/follows/following — users the current user follows
followsRouter.get('/follows/following', requireAuth, (req, res) => {
  const me = r(req).userId
  const rows = db.prepare(
    'SELECT u.id, u.name, u.avatar_emoji, u.avatar_color FROM follows f JOIN users u ON u.id = f.following_id WHERE f.follower_id = ? ORDER BY f.created_at DESC'
  ).all(me) as any[]
  res.json(rows.map(u => ({ id: u.id, name: u.name, avatarEmoji: u.avatar_emoji, avatarColor: u.avatar_color })))
})

// GET /api/follows/followers — users following the current user
followsRouter.get('/follows/followers', requireAuth, (req, res) => {
  const me = r(req).userId
  const rows = db.prepare(
    'SELECT u.id, u.name, u.avatar_emoji, u.avatar_color FROM follows f JOIN users u ON u.id = f.follower_id WHERE f.following_id = ? ORDER BY f.created_at DESC'
  ).all(me) as any[]
  res.json(rows.map(u => ({ id: u.id, name: u.name, avatarEmoji: u.avatar_emoji, avatarColor: u.avatar_color })))
})
