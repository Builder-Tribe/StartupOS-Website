import { db, uid, j, nowIso } from '../db.js'
import type { Request } from 'express'
import type { AdminRequest } from './adminAuth.js'

export const ipOf = (req: Request) =>
  (String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket?.remoteAddress || ''

// Very small UA sniff — enough for operational device/browser/OS columns without
// pulling in a parsing dependency. Never stores the raw UA as identity.
export function parseUA(ua: string | undefined) {
  const s = ua || ''
  const device = /Mobile|Android|iPhone|iPad/i.test(s) ? 'Mobile' : s ? 'Desktop' : 'Unknown'
  const browser = /Edg/i.test(s) ? 'Edge' : /Chrome/i.test(s) ? 'Chrome' : /Firefox/i.test(s) ? 'Firefox'
    : /Safari/i.test(s) ? 'Safari' : 'Unknown'
  const os = /Windows/i.test(s) ? 'Windows' : /Mac OS/i.test(s) ? 'macOS' : /Android/i.test(s) ? 'Android'
    : /iPhone|iPad|iOS/i.test(s) ? 'iOS' : /Linux/i.test(s) ? 'Linux' : 'Unknown'
  return { device, browser, os }
}

// Immutable audit write. Called by every sensitive admin action.
export function writeAudit(req: Request, a: {
  action: string; resourceType?: string; resourceId?: string; resourceName?: string
  prev?: unknown; next?: unknown; reason?: string; metadata?: unknown
}) {
  const r = req as AdminRequest
  db.prepare(`INSERT INTO admin_audit_logs
    (id, admin_id, admin_name, action, resource_type, resource_id, resource_name, prev_state, new_state, reason, metadata, ip, request_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(uid(), r.admin?.id || null, r.admin?.name || r.admin?.email || null, a.action,
      a.resourceType || null, a.resourceId || null, a.resourceName || null,
      a.prev !== undefined ? j(a.prev) : null, a.next !== undefined ? j(a.next) : null,
      a.reason || null, a.metadata !== undefined ? j(a.metadata) : null,
      ipOf(req), r.requestId || null)
}

export function recordStatusChange(req: Request, entityType: string, entityId: string, from: string | null, to: string, reason?: string) {
  const r = req as AdminRequest
  db.prepare(`INSERT INTO status_history (id, entity_type, entity_id, from_status, to_status, actor_id, actor_name, reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(uid(), entityType, entityId, from, to, r.admin?.id || null, r.admin?.name || r.admin?.email || null, reason || null)
}

export function recordLoginEvent(e: { userType: string; userId?: string | null; email?: string; success: boolean; failureReason?: string; provider?: string; req: Request }) {
  const { device, browser, os } = parseUA(e.req.headers['user-agent'] as string)
  db.prepare(`INSERT INTO login_events (id, user_type, user_id, email, success, failure_reason, provider, device, browser, os, ip)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(uid(), e.userType, e.userId || null, e.email || null, e.success ? 1 : 0, e.failureReason || null,
      e.provider || 'password', device, browser, os, ipOf(e.req))
}

export function createSession(userType: string, userId: string, req: Request): string {
  const { device, browser, os } = parseUA(req.headers['user-agent'] as string)
  const id = uid()
  db.prepare(`INSERT INTO sessions (id, user_type, user_id, device, browser, os, ip) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(id, userType, userId, device, browser, os, ipOf(req))
  return id
}

// ---- Internal notes (admin-only) ----
export function listNotes(entityType: string, entityId: string) {
  return (db.prepare('SELECT * FROM internal_notes WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC').all(entityType, entityId) as any[])
    .map(n => ({ id: n.id, content: n.content, author: n.author_name, edited: !!n.edited, createdAt: n.created_at, updatedAt: n.updated_at }))
}

export function addNote(req: Request, entityType: string, entityId: string, content: string) {
  const r = req as AdminRequest
  const id = uid()
  db.prepare('INSERT INTO internal_notes (id, entity_type, entity_id, author_id, author_name, content) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, entityType, entityId, r.admin?.id || null, r.admin?.name || r.admin?.email || null, content)
  return id
}

// ---- Activity timeline: merge audit + status history for an entity ----
export function activityFor(entityType: string, entityId: string, limit = 40) {
  const audits = (db.prepare('SELECT action, admin_name AS actor, reason, created_at FROM admin_audit_logs WHERE resource_type = ? AND resource_id = ? ORDER BY created_at DESC LIMIT ?').all(entityType, entityId, limit) as any[])
    .map(a => ({ kind: 'audit', label: a.action, actor: a.actor, detail: a.reason || '', at: a.created_at }))
  const hist = (db.prepare('SELECT from_status, to_status, actor_name AS actor, reason, created_at FROM status_history WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC LIMIT ?').all(entityType, entityId, limit) as any[])
    .map(h => ({ kind: 'status', label: `Status → ${h.to_status}${h.from_status ? ` (from ${h.from_status})` : ''}`, actor: h.actor, detail: h.reason || '', at: h.created_at }))
  return [...audits, ...hist].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, limit)
}

// Bump-and-mark session revocation for a whole user (admin action).
export function revokeUserSessions(userType: string, userId: string, byAdminId: string) {
  const info = db.prepare("UPDATE sessions SET revoked = 1, revoked_by = ? WHERE user_type = ? AND user_id = ? AND revoked = 0")
    .run(byAdminId, userType, userId)
  // Also bump epoch so any legacy (sid-less) tokens are invalidated.
  if (userType === 'traveller') db.prepare('UPDATE users SET session_epoch = session_epoch + 1 WHERE id = ?').run(userId)
  return Number(info.changes || 0)
}

// CSV builder for exports (values quoted/escaped).
export function toCsv(rows: Record<string, any>[], columns: string[]): string {
  const esc = (v: any) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  return [columns.join(','), ...rows.map(r => columns.map(c => esc(r[c])).join(','))].join('\n')
}

export const nowStamp = nowIso
