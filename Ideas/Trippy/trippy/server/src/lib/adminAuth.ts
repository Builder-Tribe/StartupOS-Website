import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { db } from '../db.js'
import { ALL_PERMISSIONS } from './permissions.js'
import { JWT_SECRET as SECRET } from './auth.js'

export function signAdminToken(adminId: string, sid: string) {
  return jwt.sign({ sub: adminId, sid, kind: 'admin' }, SECRET, { expiresIn: '12h' })
}

// Server-side logout: revoke the session carried by this token so the JWT is
// dead immediately (not just dropped client-side).
export function revokeSessionByToken(token: string | null): boolean {
  if (!token) return false
  try {
    const p = jwt.verify(token, SECRET) as { sid?: string }
    if (p.sid) { db.prepare('UPDATE sessions SET revoked = 1 WHERE id = ?').run(p.sid); return true }
  } catch { /* ignore */ }
  return false
}

// Union of permissions across the admin's roles. SUPER_ADMIN ⇒ everything.
export function effectivePermissions(adminId: string): string[] {
  const roles = (db.prepare('SELECT role_key FROM admin_user_roles WHERE admin_id = ?').all(adminId) as any[]).map(r => r.role_key)
  if (roles.includes('SUPER_ADMIN')) return [...ALL_PERMISSIONS]
  if (!roles.length) return []
  const placeholders = roles.map(() => '?').join(',')
  const rows = db.prepare(`SELECT DISTINCT permission FROM admin_role_permissions WHERE role_key IN (${placeholders})`).all(...roles) as any[]
  return rows.map(r => r.permission)
}

export interface AdminRequest extends Request {
  admin: any
  adminId: string
  perms: string[]
  requestId: string
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Not signed in' })
  try {
    const payload = jwt.verify(token, SECRET) as { sub: string; sid?: string; kind?: string }
    if (payload.kind !== 'admin') return res.status(401).json({ error: 'Not an admin session' })
    const admin = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(payload.sub) as any
    if (!admin) return res.status(401).json({ error: 'Account not found' })
    if (admin.status !== 'active') return res.status(403).json({ error: 'This admin account is deactivated' })
    if (payload.sid) {
      const s = db.prepare('SELECT revoked FROM sessions WHERE id = ?').get(payload.sid) as any
      if (!s || s.revoked) return res.status(401).json({ error: 'Session ended, please sign in again' })
      db.prepare("UPDATE sessions SET last_seen_at = datetime('now') WHERE id = ?").run(payload.sid)
    }
    const r = req as AdminRequest
    r.admin = admin
    r.adminId = admin.id
    r.perms = effectivePermissions(admin.id)
    r.requestId = crypto.randomUUID()
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired, please sign in again' })
  }
}

// Route guard for a specific permission (server-side RBAC — the source of truth).
export function requirePermission(perm: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const r = req as AdminRequest
    if (!r.perms?.includes(perm)) return res.status(403).json({ error: `Missing permission: ${perm}` })
    next()
  }
}
