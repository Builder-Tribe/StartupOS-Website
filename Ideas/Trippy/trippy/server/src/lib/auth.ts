import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { db } from '../db.js'

const _jwtSecret = process.env.JWT_SECRET
if (!_jwtSecret) throw new Error('JWT_SECRET environment variable is required')
export const JWT_SECRET: string = _jwtSecret
const SECRET = JWT_SECRET

// sid (session id) + ep (session epoch) let admins revoke sessions. Both are
// optional so tokens minted before this change keep working.
export function signToken(userId: string, sid?: string, epoch = 0) {
  return jwt.sign({ sub: userId, sid, ep: epoch }, SECRET, { expiresIn: '30d' })
}

export interface AuthedRequest extends Request {
  userId: string
  user: any
}

// Guest browsing (PRD guest access): attaches the user when a valid token is
// present, otherwise continues with userId = '' — never rejects the request.
// Use ONLY on read-only discovery endpoints; anything that writes or exposes
// member data beyond public profiles keeps requireAuth.
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  ;(req as AuthedRequest).userId = ''
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (token) {
    try {
      const payload = jwt.verify(token, SECRET) as { sub: string }
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub) as any
      if (user && user.status !== 'suspended') {
        ;(req as AuthedRequest).userId = payload.sub
        ;(req as AuthedRequest).user = user
      }
    } catch { /* invalid/expired token → treat as guest */ }
  }
  next()
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Not signed in' })
  try {
    const payload = jwt.verify(token, SECRET) as { sub: string; sid?: string; ep?: number }
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub) as any
    if (!user) return res.status(401).json({ error: 'Account not found' })
    if (user.status === 'suspended') return res.status(403).json({ error: 'Your account has been suspended. Contact support.' })
    // Session revocation: explicit session mark, or an epoch bump for older tokens.
    if (payload.sid) {
      const s = db.prepare('SELECT revoked FROM sessions WHERE id = ?').get(payload.sid) as any
      if (!s || s.revoked) return res.status(401).json({ error: 'Session ended, please sign in again' })
    }
    if (payload.ep !== undefined && payload.ep !== (user.session_epoch || 0)) {
      return res.status(401).json({ error: 'Session ended, please sign in again' })
    }
    ;(req as AuthedRequest).userId = payload.sub
    ;(req as AuthedRequest).user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired, please sign in again' })
  }
}
