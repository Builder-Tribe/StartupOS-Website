import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { db } from '../db.js'
import { JWT_SECRET as SECRET } from './auth.js'

// Password hashing now lives in lib/password; re-exported here for existing importers.
export { hashPassword, verifyPassword } from './password.js'

export function signPartnerToken(adminId: string, orgId: string) {
  return jwt.sign({ sub: adminId, org: orgId, kind: 'partner' }, SECRET, { expiresIn: '30d' })
}

export interface PartnerRequest extends Request {
  adminId: string
  orgId: string
  admin: any
}

// Auth + tenant guard: attaches the admin and their org, and guarantees every
// downstream query can scope to req.orgId. One org can never see another's data.
export function requirePartner(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Not signed in' })
  try {
    const payload = jwt.verify(token, SECRET) as { sub: string; org: string; kind?: string }
    if (payload.kind !== 'partner') return res.status(401).json({ error: 'Not a partner session' })
    const admin = db.prepare('SELECT * FROM partner_admins WHERE id = ?').get(payload.sub) as any
    if (!admin || admin.org_id !== payload.org) return res.status(401).json({ error: 'Account not found' })
    ;(req as PartnerRequest).adminId = admin.id
    ;(req as PartnerRequest).orgId = admin.org_id
    ;(req as PartnerRequest).admin = admin
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired, please sign in again' })
  }
}
