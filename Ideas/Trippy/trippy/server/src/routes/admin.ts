import { Router } from 'express'
import type { Request, Response } from 'express'
import { db, uid, j, pj, nowIso, slugify, today } from '../db.js'
import { requireAdmin, requirePermission, effectivePermissions, signAdminToken, revokeSessionByToken, type AdminRequest } from '../lib/adminAuth.js'
import { hashPassword, verifyPassword, isEmail, passwordProblem } from '../lib/password.js'
import {
  writeAudit, recordStatusChange, addNote, listNotes, activityFor,
  recordLoginEvent, createSession, revokeUserSessions, toCsv,
} from '../lib/adminOps.js'
import { partnerTripShape, validateForPublish } from '../lib/trips.js'
import { hostelShape, validateHostelForPublish, uniqueHostelSlug } from '../lib/hostels.js'
import { PERMISSIONS, ROLES, ALL_PERMISSIONS } from '../lib/permissions.js'

export const adminRouter = Router()
const a = (req: any) => req as AdminRequest

// ---------- shared helpers ----------
function paginate(req: Request) {
  const page = Math.max(1, parseInt(String(req.query.page)) || 1)
  const pageSize = Math.min(200, Math.max(1, parseInt(String(req.query.pageSize)) || 20))
  return { page, pageSize, offset: (page - 1) * pageSize }
}
const listResp = (rows: any[], total: number, page: number, pageSize: number) =>
  ({ rows, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) })
// Whitelisted sort to prevent SQL injection via ORDER BY.
const sortClause = (req: Request, allowed: Record<string, string>, fallback: string) => {
  const col = allowed[String(req.query.sort || '')] || allowed[fallback]
  const dir = String(req.query.dir).toLowerCase() === 'asc' ? 'ASC' : 'DESC'
  return `${col} ${dir}`
}
const like = (s: string) => `%${s.replace(/[%_]/g, '')}%`

// ================================================================= AUTH
adminRouter.post('/auth/login', (req: Request, res: Response) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const admin = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email) as any
  if (!admin || !verifyPassword(password, admin.password_hash, admin.password_salt)) {
    if (admin) db.prepare('UPDATE admin_users SET failed_login_count = failed_login_count + 1 WHERE id = ?').run(admin.id)
    recordLoginEvent({ userType: 'admin', userId: admin?.id, email, success: false, failureReason: 'bad_credentials', req })
    writeAudit(req, { action: 'admin.login.failed', resourceType: 'admin_user', resourceId: admin?.id, resourceName: email })
    return res.status(401).json({ error: 'Incorrect email or password' })
  }
  if (admin.status !== 'active') {
    recordLoginEvent({ userType: 'admin', userId: admin.id, email, success: false, failureReason: 'deactivated', req })
    return res.status(403).json({ error: 'This admin account is deactivated' })
  }
  const sid = createSession('admin', admin.id, req)
  db.prepare("UPDATE admin_users SET last_login_at = datetime('now'), failed_login_count = 0 WHERE id = ?").run(admin.id)
  recordLoginEvent({ userType: 'admin', userId: admin.id, email, success: true, req })
  const token = signAdminToken(admin.id, sid)
  ;(req as AdminRequest).admin = admin
  writeAudit(req, { action: 'admin.login', resourceType: 'admin_user', resourceId: admin.id, resourceName: admin.name || admin.email })
  res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name }, permissions: effectivePermissions(admin.id) })
})

adminRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || req.body?.newPassword || '')
  if (!isEmail(email)) return res.status(400).json({ error: 'Enter a valid email address' })
  const pwErr = passwordProblem(password)
  if (pwErr) return res.status(400).json({ error: pwErr })

  const admin = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email) as any
  if (!admin) return res.status(404).json({ error: 'No admin account found with that email' })

  const { hash, salt } = hashPassword(password)
  db.prepare("UPDATE admin_users SET password_hash = ?, password_salt = ?, failed_login_count = 0, status = 'active' WHERE id = ?").run(hash, salt, admin.id)

  // Keep cross-realm accounts (users and partner_admins) in sync if they exist with the same email
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any
  if (user) db.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?').run(hash, salt, user.id)
  const partner = db.prepare('SELECT id FROM partner_admins WHERE email = ?').get(email) as any
  if (partner) db.prepare('UPDATE partner_admins SET password_hash = ?, password_salt = ? WHERE id = ?').run(hash, salt, partner.id)

  writeAudit(req, { action: 'admin.password.reset', resourceType: 'admin_user', resourceId: admin.id, resourceName: admin.email })
  res.json({ ok: true, message: 'Password reset successfully' })
})

adminRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || req.body?.newPassword || '')
  if (!isEmail(email)) return res.status(400).json({ error: 'Enter a valid email address' })
  const pwErr = passwordProblem(password)
  if (pwErr) return res.status(400).json({ error: pwErr })

  const admin = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email) as any
  if (!admin) return res.status(404).json({ error: 'No admin account found with that email' })

  const { hash, salt } = hashPassword(password)
  db.prepare("UPDATE admin_users SET password_hash = ?, password_salt = ?, failed_login_count = 0, status = 'active' WHERE id = ?").run(hash, salt, admin.id)

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any
  if (user) db.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?').run(hash, salt, user.id)
  const partner = db.prepare('SELECT id FROM partner_admins WHERE email = ?').get(email) as any
  if (partner) db.prepare('UPDATE partner_admins SET password_hash = ?, password_salt = ? WHERE id = ?').run(hash, salt, partner.id)

  writeAudit(req, { action: 'admin.password.reset', resourceType: 'admin_user', resourceId: admin.id, resourceName: admin.email })
  res.json({ ok: true, message: 'Password reset successfully' })
})

adminRouter.post('/auth/logout', (req, res) => {
  const h = req.headers.authorization || ''
  revokeSessionByToken(h.startsWith('Bearer ') ? h.slice(7) : null)
  res.json({ ok: true })
})

adminRouter.use(requireAdmin)

adminRouter.get('/me', (req, res) => {
  const admin = a(req).admin
  const roles = (db.prepare('SELECT r.key, r.label FROM admin_user_roles ur JOIN admin_roles r ON r.key = ur.role_key WHERE ur.admin_id = ?').all(admin.id) as any[])
  res.json({
    id: admin.id, email: admin.email, name: admin.name,
    roles, permissions: a(req).perms,
  })
})

// ================================================================= DASHBOARD
adminRouter.get('/dashboard', requirePermission('dashboard.view'), (req, res) => {
  const c = (sql: string, ...args: any[]) => (db.prepare(sql).get(...args) as any).c as number
  const d0 = today()
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)
  const monthAgo = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10)

  const overview = {
    travellers: {
      total: c('SELECT COUNT(*) c FROM users'),
      today: c("SELECT COUNT(*) c FROM users WHERE date(created_at) = ?", d0),
      week: c('SELECT COUNT(*) c FROM users WHERE date(created_at) >= ?', weekAgo),
      month: c('SELECT COUNT(*) c FROM users WHERE date(created_at) >= ?', monthAgo),
      active: c('SELECT COUNT(*) c FROM users WHERE last_login_at IS NOT NULL AND date(last_login_at) >= ?', monthAgo),
      suspended: c("SELECT COUNT(*) c FROM users WHERE status = 'suspended'"),
    },
    partners: {
      total: c('SELECT COUNT(*) c FROM partner_orgs'),
      active: c("SELECT COUNT(*) c FROM partner_orgs WHERE status = 'active'"),
      pending: c("SELECT COUNT(*) c FROM partner_orgs WHERE status = 'pending'"),
      suspended: c("SELECT COUNT(*) c FROM partner_orgs WHERE status IN ('suspended','offboarded')"),
    },
    trips: {
      total: c('SELECT COUNT(*) c FROM partner_trips'),
      draft: c("SELECT COUNT(*) c FROM partner_trips WHERE status = 'draft'"),
      published: c("SELECT COUNT(*) c FROM partner_trips WHERE status = 'published' AND (end_date IS NULL OR end_date >= ?)", d0),
      completed: c("SELECT COUNT(*) c FROM partner_trips WHERE status = 'published' AND end_date < ?", d0),
      suspended: c("SELECT COUNT(*) c FROM partner_trips WHERE status = 'suspended'"),
      archived: c("SELECT COUNT(*) c FROM partner_trips WHERE status = 'archived'"),
    },
    hostels: {
      total: c('SELECT COUNT(*) c FROM hostels'),
      published: c("SELECT COUNT(*) c FROM hostels WHERE status = 'published'"),
    },
  }

  // Growth: daily series over a range for several entities.
  const rangeDays = Math.min(365, Math.max(7, parseInt(String(req.query.range)) || 30))
  const since = new Date(Date.now() - rangeDays * 864e5).toISOString().slice(0, 10)
  const series = (sql: string, ...args: any[]) => {
    const rows = db.prepare(sql).all(...args) as any[]
    const map = new Map(rows.map(r => [r.d, r.c]))
    return Array.from({ length: rangeDays }, (_, i) => {
      const date = new Date(Date.now() - (rangeDays - 1 - i) * 864e5).toISOString().slice(0, 10)
      return { date, count: map.get(date) || 0 }
    })
  }
  const growth = {
    travellers: series("SELECT date(created_at) d, COUNT(*) c FROM users WHERE date(created_at) >= ? GROUP BY d", since),
    partners: series("SELECT date(created_at) d, COUNT(*) c FROM partner_orgs WHERE date(created_at) >= ? GROUP BY d", since),
    tripsCreated: series("SELECT date(created_at) d, COUNT(*) c FROM partner_trips WHERE date(created_at) >= ? GROUP BY d", since),
    tripsPublished: series("SELECT date(published_at) d, COUNT(*) c FROM partner_trips WHERE published_at IS NOT NULL AND date(published_at) >= ? GROUP BY d", since),
    hostelsAdded: series("SELECT date(created_at) d, COUNT(*) c FROM hostels WHERE created_at IS NOT NULL AND date(created_at) >= ? GROUP BY d", since),
  }

  // Recent platform activity (merge audit + registrations + logins).
  const activity = [
    ...(db.prepare("SELECT 'admin_action' k, action label, admin_name actor, created_at at, resource_type rt, resource_id rid FROM admin_audit_logs ORDER BY created_at DESC LIMIT 15").all() as any[]),
    ...(db.prepare("SELECT 'traveller_registered' k, 'Traveller registered' label, name actor, created_at at, 'traveller' rt, id rid FROM users ORDER BY created_at DESC LIMIT 10").all() as any[]),
    ...(db.prepare("SELECT 'login' k, ('Traveller ' || CASE WHEN success=1 THEN 'logged in' ELSE 'login failed' END) label, email actor, created_at at, 'traveller' rt, user_id rid FROM login_events WHERE user_type='traveller' ORDER BY created_at DESC LIMIT 10").all() as any[]),
  ].sort((x, y) => (x.at < y.at ? 1 : -1)).slice(0, 20)

  // Action-required queues (each returns a count + the filter to open).
  const staleDays = 7
  const staleDate = new Date(Date.now() - staleDays * 864e5).toISOString().slice(0, 10)
  const actionRequired = {
    idVerificationsPending: c("SELECT COUNT(*) c FROM id_verifications WHERE status = 'pending'"),
    partnersPending: c("SELECT COUNT(*) c FROM partner_orgs WHERE status = 'pending'"),
    tripsMissingPayment: c("SELECT COUNT(*) c FROM partner_trips WHERE status IN ('draft','published') AND (payment_url IS NULL OR payment_url = '')"),
    draftTripsStale: c("SELECT COUNT(*) c FROM partner_trips WHERE status = 'draft' AND date(created_at) < ?", staleDate),
    hostelsDraft: c("SELECT COUNT(*) c FROM hostels WHERE status = 'draft'"),
    suspendedTravellers: c("SELECT COUNT(*) c FROM users WHERE status = 'suspended'"),
    suspendedPartners: c("SELECT COUNT(*) c FROM partner_orgs WHERE status = 'suspended'"),
  }

  // Top performing (only from analytics we actually have: outbound clicks).
  const topTripsByClicks = db.prepare(`SELECT t.id, t.name, t.slug, COUNT(oc.id) clicks
    FROM partner_trips t JOIN trip_outbound_clicks oc ON oc.trip_id = t.id
    GROUP BY t.id ORDER BY clicks DESC LIMIT 5`).all() as any[]
  const topPartnersByTrips = db.prepare(`SELECT o.id, o.name, COUNT(t.id) published
    FROM partner_orgs o JOIN partner_trips t ON t.org_id = o.id AND t.status = 'published'
    GROUP BY o.id ORDER BY published DESC LIMIT 5`).all() as any[]
  const topPartnersByClicks = db.prepare(`SELECT o.id, o.name, COUNT(oc.id) clicks
    FROM partner_orgs o JOIN trip_outbound_clicks oc ON oc.org_id = o.id
    GROUP BY o.id ORDER BY clicks DESC LIMIT 5`).all() as any[]

  res.json({
    overview, growth, rangeDays, activity, actionRequired,
    topPerforming: { topTripsByClicks, topPartnersByTrips, topPartnersByClicks },
    // Honest note about analytics coverage.
    analyticsNote: 'Only outbound booking-click analytics are tracked today; detail-view / impression / save metrics are not yet instrumented.',
  })
})

// ================================================================= GLOBAL SEARCH
adminRouter.get('/search', (req, res) => {
  const q = String(req.query.q || '').trim()
  const perms = a(req).perms
  if (q.length < 2) return res.json({ results: [] })
  const L = like(q.toLowerCase())
  const results: any[] = []
  if (perms.includes('partners.view')) {
    for (const p of db.prepare('SELECT id, name FROM partner_orgs WHERE lower(name) LIKE ? OR id = ? LIMIT 6').all(L, q) as any[])
      results.push({ type: 'partner', id: p.id, label: p.name, sub: 'Partner' })
  }
  if (perms.includes('partners.users.view')) {
    for (const u of db.prepare('SELECT id, name, email, org_id FROM partner_admins WHERE lower(email) LIKE ? OR lower(name) LIKE ? LIMIT 6').all(L, L) as any[])
      results.push({ type: 'partner', id: u.org_id, label: u.name || u.email, sub: `Partner user · ${u.email}` })
  }
  if (perms.includes('trips.view')) {
    for (const t of db.prepare('SELECT id, name, destination FROM partner_trips WHERE lower(name) LIKE ? OR lower(destination) LIKE ? OR id = ? OR slug = ? LIMIT 6').all(L, L, q, q) as any[])
      results.push({ type: 'trip', id: t.id, label: t.name || 'Untitled trip', sub: `Trip · ${t.destination || ''}` })
  }
  if (perms.includes('hostels.view')) {
    for (const h of db.prepare('SELECT id, name, city, destination FROM hostels WHERE lower(name) LIKE ? OR lower(city) LIKE ? OR lower(destination) LIKE ? OR id = ? OR slug = ? LIMIT 6').all(L, L, L, q, q) as any[])
      results.push({ type: 'hostel', id: h.id, label: h.name, sub: `Hostel · ${h.city || h.destination || ''}` })
  }
  if (perms.includes('travellers.view')) {
    for (const u of db.prepare('SELECT id, name, email, phone FROM users WHERE lower(email) LIKE ? OR lower(name) LIKE ? OR phone LIKE ? OR id = ? LIMIT 6').all(L, L, L, q) as any[])
      results.push({ type: 'traveller', id: u.id, label: u.name || u.email || u.phone || 'Traveller', sub: `Traveller · ${u.email || u.phone || ''}` })
  }
  res.json({ results: results.slice(0, 20) })
})

// ================================================================= PARTNERS
const partnerCounts = (orgId: string) => ({
  users: (db.prepare('SELECT COUNT(*) c FROM partner_admins WHERE org_id = ?').get(orgId) as any).c,
  trips: (db.prepare('SELECT COUNT(*) c FROM partner_trips WHERE org_id = ?').get(orgId) as any).c,
  published: (db.prepare("SELECT COUNT(*) c FROM partner_trips WHERE org_id = ? AND status = 'published'").get(orgId) as any).c,
  drafts: (db.prepare("SELECT COUNT(*) c FROM partner_trips WHERE org_id = ? AND status = 'draft'").get(orgId) as any).c,
})

function partnerFilters(req: Request) {
  const where: string[] = []
  const args: any[] = []
  const status = String(req.query.status || '')
  const search = String(req.query.q || '').trim()
  if (status) { where.push('o.status = ?'); args.push(status) }
  if (search) { where.push('(lower(o.name) LIKE ? OR o.id = ?)'); args.push(like(search.toLowerCase()), search) }
  return { where: where.length ? 'WHERE ' + where.join(' AND ') : '', args }
}

adminRouter.get('/partners', requirePermission('partners.view'), (req, res) => {
  const { page, pageSize, offset } = paginate(req)
  const { where, args } = partnerFilters(req)
  const order = sortClause(req, { name: 'o.name', created: 'o.created_at', status: 'o.status' }, 'created')
  const total = (db.prepare(`SELECT COUNT(*) c FROM partner_orgs o ${where}`).get(...args) as any).c
  const rows = (db.prepare(`SELECT o.* FROM partner_orgs o ${where} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...args, pageSize, offset) as any[])
    .map(o => ({
      id: o.id, name: o.name, slug: o.slug, logoEmoji: o.logo_emoji, logoColor: o.logo_color,
      status: o.status, website: o.website, createdAt: o.created_at, ...partnerCounts(o.id),
    }))
  res.json(listResp(rows, total, page, pageSize))
})

adminRouter.get('/partners/export', requirePermission('partners.export'), (req, res) => {
  const { where, args } = partnerFilters(req)
  const rows = (db.prepare(`SELECT o.* FROM partner_orgs o ${where} ORDER BY o.created_at DESC`).all(...args) as any[])
    .map(o => ({ id: o.id, name: o.name, status: o.status, website: o.website, ...partnerCounts(o.id), createdAt: o.created_at }))
  writeAudit(req, { action: 'partners.export', metadata: { count: rows.length } })
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="partners.csv"')
  res.send(toCsv(rows, ['id', 'name', 'status', 'website', 'users', 'trips', 'published', 'drafts', 'createdAt']))
})

adminRouter.get('/partners/:id', requirePermission('partners.view'), (req, res) => {
  const o = db.prepare('SELECT * FROM partner_orgs WHERE id = ?').get(req.params.id) as any
  if (!o) return res.status(404).json({ error: 'Partner not found' })
  const users = (db.prepare('SELECT * FROM partner_admins WHERE org_id = ? ORDER BY created_at').all(o.id) as any[])
    .map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: u.status || 'active', emailVerified: !!u.email_verified, createdAt: u.created_at, lastLoginAt: u.last_login_at }))
  const trips = (db.prepare('SELECT id, name, destination, status, price, start_date, end_date, created_at, published_at FROM partner_trips WHERE org_id = ? ORDER BY updated_at DESC').all(o.id) as any[])
    .map(t => ({ id: t.id, name: t.name || 'Untitled', destination: t.destination, status: t.status, price: t.price, startDate: t.start_date, endDate: t.end_date, createdAt: t.created_at, publishedAt: t.published_at }))
  const clicks = (db.prepare('SELECT COUNT(*) c FROM trip_outbound_clicks WHERE org_id = ?').get(o.id) as any).c
  res.json({
    id: o.id, name: o.name, slug: o.slug, logoEmoji: o.logo_emoji, logoColor: o.logo_color,
    about: o.about, website: o.website, status: o.status, createdAt: o.created_at, updatedAt: o.updated_at,
    counts: partnerCounts(o.id), performance: { outboundClicks: clicks },
    users, trips,
    notes: listNotes('partner', o.id), activity: activityFor('partner', o.id),
  })
})

const PARTNER_STATUS: Record<string, string> = { activate: 'active', suspend: 'suspended', reactivate: 'active', offboard: 'offboarded' }
adminRouter.post('/partners/:id/status', (req, res) => {
  const action = String(req.body?.action || '')
  const to = PARTNER_STATUS[action]
  if (!to) return res.status(400).json({ error: 'Invalid action' })
  const perm = action === 'suspend' || action === 'offboard' ? 'partners.suspend' : 'partners.activate'
  if (!a(req).perms.includes(perm)) return res.status(403).json({ error: `Missing permission: ${perm}` })
  const o = db.prepare('SELECT * FROM partner_orgs WHERE id = ?').get(req.params.id) as any
  if (!o) return res.status(404).json({ error: 'Partner not found' })
  db.prepare("UPDATE partner_orgs SET status = ?, updated_at = datetime('now') WHERE id = ?").run(to, o.id)
  recordStatusChange(req, 'partner', o.id, o.status, to, req.body?.reason)
  writeAudit(req, { action: `partner.${action}`, resourceType: 'partner', resourceId: o.id, resourceName: o.name, prev: { status: o.status }, next: { status: to }, reason: req.body?.reason })
  res.json({ ok: true, status: to })
})

adminRouter.post('/partners/:id/users/:userId/status', requirePermission('partners.users.manage'), (req, res) => {
  const u = db.prepare('SELECT * FROM partner_admins WHERE id = ? AND org_id = ?').get(req.params.userId, req.params.id) as any
  if (!u) return res.status(404).json({ error: 'Partner user not found' })
  const to = req.body?.action === 'deactivate' ? 'deactivated' : 'active'
  db.prepare('UPDATE partner_admins SET status = ? WHERE id = ?').run(to, u.id)
  if (to === 'deactivated') db.prepare('UPDATE partner_admins SET session_epoch = session_epoch + 1 WHERE id = ?').run(u.id)
  writeAudit(req, { action: `partner.user.${req.body?.action || 'update'}`, resourceType: 'partner', resourceId: u.org_id, resourceName: u.email, next: { status: to } })
  res.json({ ok: true, status: to })
})

// ================================================================= TRIPS
function tripFilters(req: Request) {
  const where: string[] = []
  const args: any[] = []
  const push = (clause: string, ...vals: any[]) => { where.push(clause); args.push(...vals) }
  if (req.query.status) push('t.status = ?', String(req.query.status))
  if (req.query.orgId) push('t.org_id = ?', String(req.query.orgId))
  if (req.query.destination) push('lower(t.destination) LIKE ?', like(String(req.query.destination).toLowerCase()))
  if (req.query.q) push('(lower(t.name) LIKE ? OR t.id = ? OR t.slug = ?)', like(String(req.query.q).toLowerCase()), String(req.query.q), String(req.query.q))
  if (req.query.hasPayment === '1') push("t.payment_url != ''")
  if (req.query.hasPayment === '0') push("(t.payment_url IS NULL OR t.payment_url = '')")
  if (req.query.featured === '1') push('t.featured = 1')
  return { where: where.length ? 'WHERE ' + where.join(' AND ') : '', args }
}

adminRouter.get('/trips', requirePermission('trips.view'), (req, res) => {
  const { page, pageSize, offset } = paginate(req)
  const { where, args } = tripFilters(req)
  const order = sortClause(req, { name: 't.name', price: 't.price', created: 't.created_at', published: 't.published_at', start: 't.start_date' }, 'created')
  const total = (db.prepare(`SELECT COUNT(*) c FROM partner_trips t ${where}`).get(...args) as any).c
  const rows = (db.prepare(`SELECT t.*, o.name org_name FROM partner_trips t JOIN partner_orgs o ON o.id = t.org_id ${where} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...args, pageSize, offset) as any[])
    .map(t => ({
      id: t.id, name: t.name || 'Untitled', partnerName: t.org_name, orgId: t.org_id, destination: t.destination,
      status: t.status, featured: !!t.featured, price: t.price, currency: t.currency, startDate: t.start_date, endDate: t.end_date,
      durationDays: t.duration_days, hasPayment: !!t.payment_url, createdAt: t.created_at, publishedAt: t.published_at,
    }))
  res.json(listResp(rows, total, page, pageSize))
})

adminRouter.get('/trips/export', requirePermission('trips.export'), (req, res) => {
  const { where, args } = tripFilters(req)
  const rows = (db.prepare(`SELECT t.*, o.name org_name FROM partner_trips t JOIN partner_orgs o ON o.id = t.org_id ${where} ORDER BY t.created_at DESC`).all(...args) as any[])
    .map(t => ({ id: t.id, name: t.name, partner: t.org_name, destination: t.destination, status: t.status, price: t.price, startDate: t.start_date, endDate: t.end_date, hasPayment: t.payment_url ? 'yes' : 'no', createdAt: t.created_at }))
  writeAudit(req, { action: 'trips.export', metadata: { count: rows.length } })
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="trips.csv"')
  res.send(toCsv(rows, ['id', 'name', 'partner', 'destination', 'status', 'price', 'startDate', 'endDate', 'hasPayment', 'createdAt']))
})

adminRouter.get('/trips/:id', requirePermission('trips.view'), (req, res) => {
  const t = db.prepare('SELECT * FROM partner_trips WHERE id = ?').get(req.params.id) as any
  if (!t) return res.status(404).json({ error: 'Trip not found' })
  const org = db.prepare('SELECT * FROM partner_orgs WHERE id = ?').get(t.org_id) as any
  const clicks = (db.prepare('SELECT COUNT(*) c FROM trip_outbound_clicks WHERE trip_id = ?').get(t.id) as any).c
  res.json({
    ...partnerTripShape(t), featured: !!t.featured,
    partner: org ? { id: org.id, name: org.name, status: org.status } : null,
    performance: { outboundClicks: clicks },
    publishBlockers: validateForPublish(t),
    notes: listNotes('trip', t.id), activity: activityFor('trip', t.id),
  })
})

// Trip lifecycle transitions.
adminRouter.post('/trips/:id/:action', (req, res) => {
  const action = req.params.action
  const map: Record<string, { perm: string; to?: string; feature?: boolean }> = {
    publish: { perm: 'trips.publish', to: 'published' },
    unpublish: { perm: 'trips.unpublish', to: 'unpublished' },
    suspend: { perm: 'trips.suspend', to: 'suspended' },
    restore: { perm: 'trips.suspend', to: 'published' },
    archive: { perm: 'trips.archive', to: 'archived' },
    feature: { perm: 'trips.feature', feature: true },
    unfeature: { perm: 'trips.feature', feature: false },
  }
  const spec = map[action]
  if (!spec) return res.status(400).json({ error: 'Unknown action' })
  if (!a(req).perms.includes(spec.perm)) return res.status(403).json({ error: `Missing permission: ${spec.perm}` })
  const t = db.prepare('SELECT * FROM partner_trips WHERE id = ?').get(req.params.id) as any
  if (!t) return res.status(404).json({ error: 'Trip not found' })

  if (spec.feature !== undefined) {
    db.prepare("UPDATE partner_trips SET featured = ?, updated_at = datetime('now') WHERE id = ?").run(spec.feature ? 1 : 0, t.id)
    writeAudit(req, { action: `trip.${action}`, resourceType: 'trip', resourceId: t.id, resourceName: t.name, next: { featured: spec.feature } })
    return res.json({ ok: true, featured: spec.feature })
  }
  if (action === 'publish' || action === 'restore') {
    const errors = validateForPublish(t)
    if (errors.length) return res.status(422).json({ error: 'Trip is missing required information', errors })
  }
  let slug = t.slug
  if (action === 'publish' && !slug) slug = uniqueTripSlug(slugify(t.name), t.id)
  const publishedAt = action === 'publish' ? nowIso() : t.published_at
  db.prepare("UPDATE partner_trips SET status = ?, slug = ?, published_at = ?, updated_at = datetime('now') WHERE id = ?")
    .run(spec.to!, slug, publishedAt, t.id)
  recordStatusChange(req, 'trip', t.id, t.status, spec.to!, req.body?.reason)
  writeAudit(req, { action: `trip.${action}`, resourceType: 'trip', resourceId: t.id, resourceName: t.name, prev: { status: t.status }, next: { status: spec.to }, reason: req.body?.reason })
  res.json({ ok: true, status: spec.to })
})

function uniqueTripSlug(base: string, excludeId: string): string {
  let slug = base || 'trip'; let n = 1
  while (db.prepare('SELECT 1 FROM partner_trips WHERE slug = ? AND id != ?').get(slug, excludeId)) slug = `${base}-${++n}`
  return slug
}

// ================================================================= HOSTELS
function hostelFilters(req: Request) {
  const where: string[] = []
  const args: any[] = []
  const push = (clause: string, ...vals: any[]) => { where.push(clause); args.push(...vals) }
  if (req.query.status) push('status = ?', String(req.query.status))
  if (req.query.country) push('country = ?', String(req.query.country))
  if (req.query.state) push('state = ?', String(req.query.state))
  if (req.query.city) push('lower(city) LIKE ?', like(String(req.query.city).toLowerCase()))
  if (req.query.destination) push('destination = ?', String(req.query.destination))
  if (req.query.source) push('source = ?', String(req.query.source))
  if (req.query.featured === '1') push('featured = 1')
  if (req.query.hasBooking === '1') push("booking_url IS NOT NULL AND booking_url != ''")
  if (req.query.q) push('(lower(name) LIKE ? OR lower(city) LIKE ? OR id = ? OR slug = ?)', like(String(req.query.q).toLowerCase()), like(String(req.query.q).toLowerCase()), String(req.query.q), String(req.query.q))
  return { where: where.length ? 'WHERE ' + where.join(' AND ') : '', args }
}

adminRouter.get('/hostels', requirePermission('hostels.view'), (req, res) => {
  const { page, pageSize, offset } = paginate(req)
  const { where, args } = hostelFilters(req)
  const order = sortClause(req, { name: 'name', city: 'city', created: 'created_at', status: 'status' }, 'created')
  const total = (db.prepare(`SELECT COUNT(*) c FROM hostels ${where}`).get(...args) as any).c
  const rows = (db.prepare(`SELECT * FROM hostels ${where} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...args, pageSize, offset) as any[])
    .map(h => ({ id: h.id, name: h.name, coverImage: h.cover_image, city: h.city || h.area, state: h.state, country: h.country, destination: h.destination, status: h.status, featured: !!h.featured, hasBooking: !!h.booking_url, source: h.source, createdAt: h.created_at, publishedAt: h.published_at }))
  res.json(listResp(rows, total, page, pageSize))
})

adminRouter.get('/hostels/export', requirePermission('hostels.export'), (req, res) => {
  const { where, args } = hostelFilters(req)
  const rows = (db.prepare(`SELECT * FROM hostels ${where} ORDER BY created_at DESC`).all(...args) as any[])
    .map(h => ({ id: h.id, name: h.name, city: h.city, state: h.state, destination: h.destination, status: h.status, source: h.source, hasBooking: h.booking_url ? 'yes' : 'no', createdAt: h.created_at }))
  writeAudit(req, { action: 'hostels.export', metadata: { count: rows.length } })
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="hostels.csv"')
  res.send(toCsv(rows, ['id', 'name', 'city', 'state', 'destination', 'status', 'source', 'hasBooking', 'createdAt']))
})

const HOSTEL_TEXT: Record<string, string> = {
  name: 'name', shortDesc: 'short_desc', description: 'description', propertyType: 'property_type',
  destination: 'destination', city: 'city', state: 'state', country: 'country', locality: 'locality',
  address: 'address', postalCode: 'postal_code', area: 'area', email: 'email', phone: 'phone', website: 'website',
  coverImage: 'cover_image', checkinTime: 'checkin_time', checkoutTime: 'checkout_time', rules: 'rules',
  cancellation: 'cancellation', bookingUrl: 'booking_url', seoTitle: 'seo_title', seoDescription: 'seo_description',
  externalRef: 'external_ref', source: 'source',
}
const HOSTEL_NUM: Record<string, string> = { pricePerNight: 'price_per_night', latitude: 'latitude', longitude: 'longitude' }
const HOSTEL_ARR: Record<string, string> = { amenities: 'amenities', vibeTags: 'vibe_tags', highlights: 'highlights', suitableFor: 'suitable_for', gallery: 'gallery', categories: 'categories', tags: 'tags' }

function applyHostelFields(id: string, b: any) {
  const sets: string[] = []; const vals: any[] = []
  for (const [k, col] of Object.entries(HOSTEL_TEXT)) if (b[k] !== undefined) { sets.push(`${col} = ?`); vals.push(b[k] == null ? null : String(b[k])) }
  for (const [k, col] of Object.entries(HOSTEL_NUM)) if (b[k] !== undefined) { sets.push(`${col} = ?`); vals.push(b[k] === '' || b[k] == null ? null : Number(b[k])) }
  for (const [k, col] of Object.entries(HOSTEL_ARR)) if (b[k] !== undefined) { sets.push(`${col} = ?`); vals.push(j(Array.isArray(b[k]) ? b[k] : [])) }
  if (sets.length) { sets.push("updated_at = datetime('now')"); db.prepare(`UPDATE hostels SET ${sets.join(', ')} WHERE id = ?`).run(...vals, id) }
}

adminRouter.post('/hostels', requirePermission('hostels.create'), (req, res) => {
  const id = uid()
  const b = req.body || {}
  const name = String(b.name || 'Untitled hostel')
  db.prepare(`INSERT INTO hostels (id, name, destination, area, status, source, property_type, created_at, updated_at, slug)
    VALUES (?, ?, ?, ?, 'draft', 'admin', 'hostel', datetime('now'), datetime('now'), ?)`)
    .run(id, name, String(b.destination || ''), String(b.city || b.area || ''), uniqueHostelSlug(slugify(name)))
  applyHostelFields(id, b)
  writeAudit(req, { action: 'hostel.create', resourceType: 'hostel', resourceId: id, resourceName: name })
  res.json(hostelShape(db.prepare('SELECT * FROM hostels WHERE id = ?').get(id)))
})

adminRouter.get('/hostels/:id', requirePermission('hostels.view'), (req, res) => {
  const h = db.prepare('SELECT * FROM hostels WHERE id = ?').get(req.params.id) as any
  if (!h) return res.status(404).json({ error: 'Hostel not found' })
  res.json({ ...hostelShape(h), publishBlockers: validateHostelForPublish(h), notes: listNotes('hostel', h.id), activity: activityFor('hostel', h.id) })
})

adminRouter.put('/hostels/:id', requirePermission('hostels.edit'), (req, res) => {
  const h = db.prepare('SELECT * FROM hostels WHERE id = ?').get(req.params.id) as any
  if (!h) return res.status(404).json({ error: 'Hostel not found' })
  applyHostelFields(h.id, req.body || {})
  writeAudit(req, { action: 'hostel.edit', resourceType: 'hostel', resourceId: h.id, resourceName: h.name })
  res.json(hostelShape(db.prepare('SELECT * FROM hostels WHERE id = ?').get(h.id)))
})

adminRouter.post('/hostels/:id/:action', (req, res) => {
  const action = req.params.action
  const map: Record<string, { perm: string; to?: string; feature?: boolean }> = {
    publish: { perm: 'hostels.publish', to: 'published' },
    unpublish: { perm: 'hostels.unpublish', to: 'unpublished' },
    suspend: { perm: 'hostels.suspend', to: 'suspended' },
    restore: { perm: 'hostels.suspend', to: 'published' },
    archive: { perm: 'hostels.archive', to: 'archived' },
    close: { perm: 'hostels.archive', to: 'permanently_closed' },
    feature: { perm: 'hostels.feature', feature: true },
    unfeature: { perm: 'hostels.feature', feature: false },
  }
  const spec = map[action]
  if (!spec) return res.status(400).json({ error: 'Unknown action' })
  if (!a(req).perms.includes(spec.perm)) return res.status(403).json({ error: `Missing permission: ${spec.perm}` })
  const h = db.prepare('SELECT * FROM hostels WHERE id = ?').get(req.params.id) as any
  if (!h) return res.status(404).json({ error: 'Hostel not found' })
  if (spec.feature !== undefined) {
    db.prepare("UPDATE hostels SET featured = ?, updated_at = datetime('now') WHERE id = ?").run(spec.feature ? 1 : 0, h.id)
    writeAudit(req, { action: `hostel.${action}`, resourceType: 'hostel', resourceId: h.id, resourceName: h.name, next: { featured: spec.feature } })
    return res.json({ ok: true, featured: spec.feature })
  }
  if (action === 'publish' || action === 'restore') {
    const errors = validateHostelForPublish(h)
    if (errors.length) return res.status(422).json({ error: 'Hostel is missing required information', errors })
  }
  const publishedAt = action === 'publish' ? nowIso() : h.published_at
  db.prepare("UPDATE hostels SET status = ?, published_at = ?, updated_at = datetime('now') WHERE id = ?").run(spec.to!, publishedAt, h.id)
  recordStatusChange(req, 'hostel', h.id, h.status, spec.to!, req.body?.reason)
  writeAudit(req, { action: `hostel.${action}`, resourceType: 'hostel', resourceId: h.id, resourceName: h.name, prev: { status: h.status }, next: { status: spec.to }, reason: req.body?.reason })
  res.json({ ok: true, status: spec.to })
})

// ================================================================= TRAVELLERS
function travellerFilters(req: Request) {
  const where: string[] = []
  const args: any[] = []
  const push = (clause: string, ...vals: any[]) => { where.push(clause); args.push(...vals) }
  if (req.query.status) push('status = ?', String(req.query.status))
  if (req.query.emailVerified === '1') push('email_verified = 1')
  if (req.query.onboarded === '1') push('onboarded = 1')
  if (req.query.q) push('(lower(email) LIKE ? OR lower(name) LIKE ? OR phone LIKE ? OR id = ?)', like(String(req.query.q).toLowerCase()), like(String(req.query.q).toLowerCase()), like(String(req.query.q)), String(req.query.q))
  return { where: where.length ? 'WHERE ' + where.join(' AND ') : '', args }
}

adminRouter.get('/travellers', requirePermission('travellers.view'), (req, res) => {
  const { page, pageSize, offset } = paginate(req)
  const { where, args } = travellerFilters(req)
  const order = sortClause(req, { name: 'name', created: 'created_at', lastLogin: 'last_login_at' }, 'created')
  const total = (db.prepare(`SELECT COUNT(*) c FROM users ${where}`).get(...args) as any).c
  const rows = (db.prepare(`SELECT * FROM users ${where} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...args, pageSize, offset) as any[])
    .map(u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, avatarEmoji: u.avatar_emoji, avatarColor: u.avatar_color, status: u.status || 'active', emailVerified: !!u.email_verified, phoneVerified: !!u.phone_verified, onboarded: !!u.onboarded, createdAt: u.created_at, lastLoginAt: u.last_login_at, loginCount: u.login_count || 0 }))
  res.json(listResp(rows, total, page, pageSize))
})

adminRouter.get('/travellers/export', requirePermission('travellers.export'), (req, res) => {
  const { where, args } = travellerFilters(req)
  // Export excludes ALL authentication data (no hashes/tokens/otp).
  const rows = (db.prepare(`SELECT * FROM users ${where} ORDER BY created_at DESC`).all(...args) as any[])
    .map(u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, status: u.status, emailVerified: u.email_verified ? 'yes' : 'no', city: u.city, createdAt: u.created_at, lastLoginAt: u.last_login_at }))
  writeAudit(req, { action: 'travellers.export', metadata: { count: rows.length } })
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="travellers.csv"')
  res.send(toCsv(rows, ['id', 'name', 'email', 'phone', 'status', 'emailVerified', 'city', 'createdAt', 'lastLoginAt']))
})

// Login activity (global) — safe operational data only.
adminRouter.get('/login-activity', requirePermission('travellers.sessions.view'), (req, res) => {
  const { page, pageSize, offset } = paginate(req)
  const where: string[] = ["user_type = 'traveller'"]
  const args: any[] = []
  if (req.query.success === '1') where.push('success = 1')
  if (req.query.success === '0') where.push('success = 0')
  if (req.query.userId) { where.push('user_id = ?'); args.push(String(req.query.userId)) }
  const w = 'WHERE ' + where.join(' AND ')
  const total = (db.prepare(`SELECT COUNT(*) c FROM login_events ${w}`).get(...args) as any).c
  const rows = db.prepare(`SELECT id, user_id, email, success, failure_reason, provider, device, browser, os, ip, created_at FROM login_events ${w} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...args, pageSize, offset)
  res.json(listResp(rows as any[], total, page, pageSize))
})

adminRouter.get('/travellers/:id', requirePermission('travellers.view'), (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as any
  if (!u) return res.status(404).json({ error: 'Traveller not found' })
  const canSessions = a(req).perms.includes('travellers.sessions.view')
  const sessions = canSessions
    ? (db.prepare("SELECT id, device, browser, os, ip, revoked, created_at, last_seen_at FROM sessions WHERE user_type = 'traveller' AND user_id = ? ORDER BY created_at DESC LIMIT 25").all(u.id) as any[])
      .map(s => ({ id: s.id, device: s.device, browser: s.browser, os: s.os, ip: s.ip, revoked: !!s.revoked, createdAt: s.created_at, lastSeenAt: s.last_seen_at }))
    : []
  const logins = canSessions
    ? db.prepare("SELECT id, success, failure_reason, provider, device, browser, os, ip, created_at FROM login_events WHERE user_type = 'traveller' AND user_id = ? ORDER BY created_at DESC LIMIT 25").all(u.id)
    : []
  const savedTrips = (db.prepare('SELECT COUNT(*) c FROM trips WHERE user_id = ?').get(u.id) as any).c
  const connections = (db.prepare('SELECT COUNT(*) c FROM connections WHERE from_user = ? OR to_user = ?').get(u.id, u.id) as any).c
  const clicks = (db.prepare('SELECT COUNT(*) c FROM trip_outbound_clicks WHERE user_id = ?').get(u.id) as any).c
  // NOTE: never return password_hash / password_salt / tokens.
  res.json({
    id: u.id, name: u.name, email: u.email, phone: u.phone, avatarEmoji: u.avatar_emoji, avatarColor: u.avatar_color,
    city: u.city, age: u.age, gender: u.gender, bio: u.bio, personality: u.personality,
    status: u.status || 'active', emailVerified: !!u.email_verified, phoneVerified: !!u.phone_verified, onboarded: !!u.onboarded,
    provider: 'password', createdAt: u.created_at, lastLoginAt: u.last_login_at, loginCount: u.login_count || 0,
    activeSessions: canSessions ? sessions.filter(s => !s.revoked).length : null,
    sessions, logins,
    activity: { savedTrips, connections, outboundClicks: clicks },
    notes: listNotes('traveller', u.id), timeline: activityFor('traveller', u.id),
  })
})

adminRouter.post('/travellers/:id/status', requirePermission('travellers.suspend'), (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as any
  if (!u) return res.status(404).json({ error: 'Traveller not found' })
  const to = req.body?.action === 'suspend' ? 'suspended' : 'active'
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(to, u.id)
  if (to === 'suspended') revokeUserSessions('traveller', u.id, a(req).admin.id)
  recordStatusChange(req, 'traveller', u.id, u.status || 'active', to, req.body?.reason)
  writeAudit(req, { action: `traveller.${req.body?.action === 'suspend' ? 'suspend' : 'reactivate'}`, resourceType: 'traveller', resourceId: u.id, resourceName: u.name || u.email, prev: { status: u.status }, next: { status: to }, reason: req.body?.reason })
  res.json({ ok: true, status: to })
})

adminRouter.post('/travellers/:id/revoke-sessions', requirePermission('travellers.sessions.revoke'), (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as any
  if (!u) return res.status(404).json({ error: 'Traveller not found' })
  const n = revokeUserSessions('traveller', u.id, a(req).admin.id)
  writeAudit(req, { action: 'traveller.sessions.revoke', resourceType: 'traveller', resourceId: u.id, resourceName: u.name || u.email, metadata: { revoked: n } })
  res.json({ ok: true, revoked: n })
})

// ---- ID verification review queue (PRD 1.1.3) ----
adminRouter.get('/id-verifications', requirePermission('travellers.verify'), (req, res) => {
  const status = ['pending', 'approved', 'rejected'].includes(String(req.query.status)) ? String(req.query.status) : 'pending'
  const rows = db.prepare(`
    SELECT v.*, u.name, u.email, u.avatar_emoji, u.avatar_color FROM id_verifications v
    JOIN users u ON u.id = v.user_id WHERE v.status = ? ORDER BY v.created_at ASC LIMIT 100`).all(status) as any[]
  res.json({ rows: rows.map(v => ({ id: v.id, userId: v.user_id, name: v.name, email: v.email, avatarEmoji: v.avatar_emoji, avatarColor: v.avatar_color, docType: v.doc_type, docLast4: v.doc_last4, status: v.status, reason: v.reason, createdAt: v.created_at })) })
})

adminRouter.post('/id-verifications/:id/decide', requirePermission('travellers.verify'), (req, res) => {
  const v = db.prepare('SELECT * FROM id_verifications WHERE id = ?').get(req.params.id) as any
  if (!v) return res.status(404).json({ error: 'Verification request not found' })
  if (v.status !== 'pending') return res.status(400).json({ error: 'This request was already reviewed' })
  const action = String(req.body?.action)
  const reason = String(req.body?.reason || '').trim()
  if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'Invalid action' })
  if (action === 'reject' && !reason) return res.status(400).json({ error: 'A reason is required to reject' })
  const status = action === 'approve' ? 'approved' : 'rejected'
  db.prepare('UPDATE id_verifications SET status = ?, reason = ?, reviewed_by = ?, reviewed_at = datetime(\'now\') WHERE id = ?')
    .run(status, reason || null, a(req).admin.id, v.id)
  if (action === 'approve') db.prepare('UPDATE users SET id_verified = 1 WHERE id = ?').run(v.user_id)
  const u = db.prepare('SELECT name, email FROM users WHERE id = ?').get(v.user_id) as any
  writeAudit(req, { action: `traveller.id_verify.${action}`, resourceType: 'traveller', resourceId: v.user_id, resourceName: u?.name || u?.email, reason, metadata: { docType: v.doc_type } })
  res.json({ ok: true, status })
})

// ================================================================= INTERNAL NOTES (generic)
const NOTE_PERM: Record<string, string> = { partner: 'partners.notes.manage', trip: 'trips.notes.manage', hostel: 'hostels.notes.manage', traveller: 'travellers.notes.manage' }
adminRouter.post('/notes', (req, res) => {
  const { entityType, entityId, content } = req.body || {}
  const perm = NOTE_PERM[entityType]
  if (!perm) return res.status(400).json({ error: 'Invalid entity type' })
  if (!a(req).perms.includes(perm)) return res.status(403).json({ error: `Missing permission: ${perm}` })
  if (!String(content || '').trim()) return res.status(400).json({ error: 'Note content is required' })
  addNote(req, entityType, entityId, String(content).trim())
  writeAudit(req, { action: 'note.add', resourceType: entityType, resourceId: entityId })
  res.json({ ok: true, notes: listNotes(entityType, entityId) })
})

// ================================================================= ADMINISTRATION
adminRouter.get('/admin-users', requirePermission('admin_users.view'), (_req, res) => {
  const rows = (db.prepare('SELECT * FROM admin_users ORDER BY created_at').all() as any[]).map(u => ({
    id: u.id, name: u.name, email: u.email, status: u.status, lastLoginAt: u.last_login_at, createdAt: u.created_at,
    roles: (db.prepare('SELECT role_key FROM admin_user_roles WHERE admin_id = ?').all(u.id) as any[]).map(r => r.role_key),
  }))
  res.json({ rows })
})

adminRouter.post('/admin-users', requirePermission('admin_users.invite'), (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const name = req.body?.name ? String(req.body.name) : null
  const password = String(req.body?.password || '')
  const roles: string[] = Array.isArray(req.body?.roles) ? req.body.roles : []
  if (!isEmail(email)) return res.status(400).json({ error: 'Valid email required' })
  const pwErr = passwordProblem(password)
  if (pwErr) return res.status(400).json({ error: pwErr })
  if (db.prepare('SELECT 1 FROM admin_users WHERE email = ?').get(email)) return res.status(409).json({ error: 'Email already in use' })
  const id = uid()
  const { hash, salt } = hashPassword(password)
  db.prepare('INSERT INTO admin_users (id, email, password_hash, password_salt, name) VALUES (?, ?, ?, ?, ?)').run(id, email, hash, salt, name)
  const insRole = db.prepare('INSERT OR IGNORE INTO admin_user_roles (admin_id, role_key) VALUES (?, ?)')
  for (const r of roles) if (db.prepare('SELECT 1 FROM admin_roles WHERE key = ?').get(r)) insRole.run(id, r)
  writeAudit(req, { action: 'admin_user.create', resourceType: 'admin_user', resourceId: id, resourceName: email, next: { roles } })
  res.json({ ok: true, id })
})

adminRouter.post('/admin-users/:id/roles', requirePermission('admin_users.roles.manage'), (req, res) => {
  const u = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.params.id) as any
  if (!u) return res.status(404).json({ error: 'Admin user not found' })
  const roles: string[] = Array.isArray(req.body?.roles) ? req.body.roles : []
  const prev = (db.prepare('SELECT role_key FROM admin_user_roles WHERE admin_id = ?').all(u.id) as any[]).map(r => r.role_key)
  db.prepare('DELETE FROM admin_user_roles WHERE admin_id = ?').run(u.id)
  const insRole = db.prepare('INSERT OR IGNORE INTO admin_user_roles (admin_id, role_key) VALUES (?, ?)')
  for (const r of roles) if (db.prepare('SELECT 1 FROM admin_roles WHERE key = ?').get(r)) insRole.run(u.id, r)
  writeAudit(req, { action: 'admin_user.roles.change', resourceType: 'admin_user', resourceId: u.id, resourceName: u.email, prev: { roles: prev }, next: { roles } })
  res.json({ ok: true })
})

adminRouter.post('/admin-users/:id/status', requirePermission('admin_users.deactivate'), (req, res) => {
  const u = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.params.id) as any
  if (!u) return res.status(404).json({ error: 'Admin user not found' })
  const to = req.body?.action === 'deactivate' ? 'deactivated' : 'active'
  db.prepare('UPDATE admin_users SET status = ? WHERE id = ?').run(to, u.id)
  if (to === 'deactivated') db.prepare('UPDATE sessions SET revoked = 1 WHERE user_type = ? AND user_id = ?').run('admin', u.id)
  writeAudit(req, { action: `admin_user.${to === 'deactivated' ? 'deactivate' : 'activate'}`, resourceType: 'admin_user', resourceId: u.id, resourceName: u.email, next: { status: to } })
  res.json({ ok: true, status: to })
})

adminRouter.get('/roles', requirePermission('roles.view'), (_req, res) => {
  const roles = (db.prepare('SELECT * FROM admin_roles ORDER BY key').all() as any[]).map(r => ({
    key: r.key, label: r.label, description: r.description,
    permissions: (db.prepare('SELECT permission FROM admin_role_permissions WHERE role_key = ?').all(r.key) as any[]).map(p => p.permission),
    userCount: (db.prepare('SELECT COUNT(*) c FROM admin_user_roles WHERE role_key = ?').get(r.key) as any).c,
  }))
  res.json({ roles, permissions: PERMISSIONS })
})

adminRouter.put('/roles/:key/permissions', requirePermission('roles.manage'), (req, res) => {
  const role = db.prepare('SELECT * FROM admin_roles WHERE key = ?').get(req.params.key) as any
  if (!role) return res.status(404).json({ error: 'Role not found' })
  if (role.key === 'SUPER_ADMIN') return res.status(400).json({ error: 'SUPER_ADMIN always has all permissions' })
  const perms: string[] = (Array.isArray(req.body?.permissions) ? req.body.permissions : []).filter((p: string) => ALL_PERMISSIONS.includes(p))
  const prev = (db.prepare('SELECT permission FROM admin_role_permissions WHERE role_key = ?').all(role.key) as any[]).map(p => p.permission)
  db.prepare('DELETE FROM admin_role_permissions WHERE role_key = ?').run(role.key)
  const ins = db.prepare('INSERT OR IGNORE INTO admin_role_permissions (role_key, permission) VALUES (?, ?)')
  for (const p of perms) ins.run(role.key, p)
  writeAudit(req, { action: 'role.permissions.change', resourceType: 'role', resourceId: role.key, resourceName: role.label, prev: { permissions: prev }, next: { permissions: perms } })
  res.json({ ok: true })
})

function auditFilters(req: Request) {
  const where: string[] = []
  const args: any[] = []
  if (req.query.adminId) { where.push('admin_id = ?'); args.push(String(req.query.adminId)) }
  if (req.query.action) { where.push('action = ?'); args.push(String(req.query.action)) }
  if (req.query.resourceType) { where.push('resource_type = ?'); args.push(String(req.query.resourceType)) }
  if (req.query.resourceId) { where.push('resource_id = ?'); args.push(String(req.query.resourceId)) }
  // Date range (forensic queries: "who suspended X last Tuesday?")
  if (req.query.from) { where.push('date(created_at) >= date(?)'); args.push(String(req.query.from)) }
  if (req.query.to) { where.push('date(created_at) <= date(?)'); args.push(String(req.query.to)) }
  if (req.query.q) { where.push('(lower(action) LIKE ? OR lower(resource_name) LIKE ? OR lower(admin_name) LIKE ?)'); const l = like(String(req.query.q).toLowerCase()); args.push(l, l, l) }
  return { w: where.length ? 'WHERE ' + where.join(' AND ') : '', args }
}

adminRouter.get('/audit-logs', requirePermission('audit_logs.view'), (req, res) => {
  const { page, pageSize, offset } = paginate(req)
  const { w, args } = auditFilters(req)
  const total = (db.prepare(`SELECT COUNT(*) c FROM admin_audit_logs ${w}`).get(...args) as any).c
  const rows = (db.prepare(`SELECT id, admin_name, action, resource_type, resource_id, resource_name, reason, ip, created_at FROM admin_audit_logs ${w} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...args, pageSize, offset) as any[])
  res.json(listResp(rows, total, page, pageSize))
})

// Distinct values powering the audit-log filter dropdowns (action + actor).
adminRouter.get('/audit-log-facets', requirePermission('audit_logs.view'), (_req, res) => {
  const actions = (db.prepare('SELECT DISTINCT action FROM admin_audit_logs ORDER BY action').all() as any[]).map(r => r.action)
  const admins = (db.prepare('SELECT DISTINCT admin_id AS id, admin_name AS name FROM admin_audit_logs WHERE admin_id IS NOT NULL ORDER BY admin_name').all() as any[])
  res.json({ actions, admins })
})

adminRouter.get('/audit-logs/export', requirePermission('audit_logs.view'), (req, res) => {
  const { w, args } = auditFilters(req)
  const rows = (db.prepare(`SELECT created_at, admin_name, action, resource_type, resource_name, resource_id, reason, ip FROM admin_audit_logs ${w} ORDER BY created_at DESC LIMIT 5000`).all(...args) as any[])
    .map(r => ({ when: r.created_at, admin: r.admin_name, action: r.action, resourceType: r.resource_type, resourceName: r.resource_name, resourceId: r.resource_id, reason: r.reason, ip: r.ip }))
  writeAudit(req, { action: 'audit_logs.export', metadata: { count: rows.length } })
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"')
  res.send(toCsv(rows, ['when', 'admin', 'action', 'resourceType', 'resourceName', 'resourceId', 'reason', 'ip']))
})

// ── Reviews (admin read + delete) ────────────────────────────────────────────
adminRouter.get('/reviews', requirePermission('trips.view'), (req, res) => {
  const { targetType, targetId } = req.query as { targetType: string; targetId: string }
  if (!targetType || !targetId) return res.status(400).json({ error: 'targetType and targetId required' })
  const rows = db.prepare('SELECT r.*, u.name reviewer_name, u.avatar_color, u.avatar_emoji FROM trip_reviews r LEFT JOIN users u ON u.id = r.reviewer_id WHERE r.target_type = ? AND r.target_id = ? ORDER BY r.created_at DESC').all(targetType, targetId) as any[]
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.rating, 0) / rows.length * 10) / 10 : null
  res.json({
    reviews: rows.map(r => ({ id: r.id, rating: r.rating, title: r.title, body: r.body, createdAt: r.created_at, reviewer: { id: r.reviewer_id, name: r.reviewer_name, avatarColor: r.avatar_color, avatarEmoji: r.avatar_emoji } })),
    avgRating: avg,
    count: rows.length,
  })
})

adminRouter.delete('/reviews/:id', requirePermission('trips.manage' as any), (req, res) => {
  const rv = db.prepare('SELECT * FROM trip_reviews WHERE id = ?').get(req.params.id) as any
  if (!rv) return res.status(404).json({ error: 'Review not found' })
  db.prepare('DELETE FROM trip_reviews WHERE id = ?').run(rv.id)
  writeAudit(req, { action: 'review.delete', resourceType: 'review', resourceId: rv.id, metadata: { targetType: rv.target_type, targetId: rv.target_id } })
  res.json({ ok: true })
})
