import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { rmSync } from 'node:fs'

const DB = join(tmpdir(), `trippy-admintest-${process.pid}-${Date.now()}.db`)
process.env.TRIPPY_DB_PATH = DB
process.env.TRIPPY_TEST = '1'
process.env.JWT_SECRET = 'test-secret'

const { createApp } = await import('../src/index.js')

let base = ''
let server: any
before(async () => {
  server = createApp().listen(0)
  await new Promise(r => server.once('listening', r))
  base = `http://127.0.0.1:${server.address().port}`
})
after(() => {
  server?.close()
  for (const ext of ['', '-wal', '-shm']) rmSync(DB + ext, { force: true })
})

async function api(method: string, path: string, opts: { token?: string; body?: any; raw?: boolean } = {}) {
  const headers: Record<string, string> = { Connection: 'close' } // avoid undici keep-alive socket reuse against the in-process server
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`
  const body = opts.body !== undefined ? JSON.stringify(opts.body) : undefined
  // Retry once on transient network errors (socket resets under rapid sequential calls).
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(base + path, { method, headers, body })
      if (opts.raw) return { status: res.status, text: await res.text() }
      return { status: res.status, data: await res.json().catch(() => ({})) }
    } catch (e) {
      if (attempt >= 4) throw e
      await new Promise(r => setTimeout(r, 60))
    }
  }
}
const login = async (email: string, password: string) => (await api('POST', '/api/admin/auth/login', { body: { email, password } }))
const tok = async (email: string, password: string) => (await login(email, password)).data.token as string

// ------------------------------------------------------------------ AUTH
test('admin login succeeds and returns permissions; bad credentials & no token rejected', async () => {
  const ok = await login('super@trippy.test', 'Super@123')
  assert.equal(ok.status, 200)
  assert.ok(ok.data.token)
  assert.ok(ok.data.permissions.length > 30, 'super admin has all permissions')

  assert.equal((await login('super@trippy.test', 'wrong')).status, 401)
  assert.equal((await api('GET', '/api/admin/dashboard')).status, 401)
})

test('a consumer/partner token cannot access admin routes (separate auth boundary)', async () => {
  // Create a consumer and use its token against an admin route.
  const signup = await api('POST', '/api/auth/signup', { body: { email: 'x@x.com', password: 'password123' } })
  assert.equal((await api('GET', '/api/admin/dashboard', { token: signup.data.token })).status, 401)
})

test('deactivated admin is blocked', async () => {
  const superTok = await tok('super@trippy.test', 'Super@123')
  const roTok = await tok('readonly@trippy.test', 'Readonly@123')
  const list = await api('GET', '/api/admin/admin-users', { token: superTok })
  const ro = list.data.rows.find((u: any) => u.email === 'readonly@trippy.test')
  await api('POST', `/api/admin/admin-users/${ro.id}/status`, { token: superTok, body: { action: 'deactivate' } })
  // The readonly admin's existing session is now rejected (401 revoked or 403 deactivated).
  assert.ok([401, 403].includes((await api('GET', '/api/admin/me', { token: roTok })).status))
  // restore for other tests
  await api('POST', `/api/admin/admin-users/${ro.id}/status`, { token: superTok, body: { action: 'activate' } })
})

test('admin logout revokes the session', async () => {
  const t = await tok('ops@trippy.test', 'Ops@12345')
  assert.equal((await api('GET', '/api/admin/me', { token: t })).status, 200)
  await api('POST', '/api/admin/auth/logout', { token: t })
  assert.equal((await api('GET', '/api/admin/me', { token: t })).status, 401)
})

// ------------------------------------------------------------------ RBAC
test('RBAC: read-only admin can view but cannot perform write actions', async () => {
  const ro = await tok('readonly@trippy.test', 'Readonly@123')
  assert.equal((await api('GET', '/api/admin/partners', { token: ro })).status, 200)
  assert.equal((await api('GET', '/api/admin/trips', { token: ro })).status, 200)
  // No write permissions.
  const trips = (await api('GET', '/api/admin/trips', { token: ro })).data.rows
  assert.equal((await api('POST', `/api/admin/trips/${trips[0].id}/suspend`, { token: ro, body: { reason: 'x' } })).status, 403)
  assert.equal((await api('POST', `/api/admin/partners/x/status`, { token: ro, body: { action: 'suspend' } })).status, 403)
  // No export permission.
  assert.equal((await api('GET', '/api/admin/partners/export', { token: ro })).status, 403)
})

test('RBAC: trip manager cannot touch hostels', async () => {
  const tm = await tok('trips@trippy.test', 'Trips@12345')
  assert.equal((await api('GET', '/api/admin/trips', { token: tm })).status, 200)
  assert.equal((await api('GET', '/api/admin/hostels', { token: tm })).status, 403)
})

// ------------------------------------------------------------------ PARTNERS
test('partner detail, activation lifecycle, and audit trail', async () => {
  const t = await tok('super@trippy.test', 'Super@123')
  const partners = (await api('GET', '/api/admin/partners', { token: t })).data.rows
  const p = partners.find((x: any) => x.name === 'Coastal Nomads')
  const detail = await api('GET', `/api/admin/partners/${p.id}`, { token: t })
  assert.equal(detail.status, 200)
  assert.ok(Array.isArray(detail.data.users) && Array.isArray(detail.data.trips))

  const susp = await api('POST', `/api/admin/partners/${p.id}/status`, { token: t, body: { action: 'suspend', reason: 'test suspend' } })
  assert.equal(susp.data.status, 'suspended')
  await api('POST', `/api/admin/partners/${p.id}/status`, { token: t, body: { action: 'reactivate' } })

  const audit = await api('GET', '/api/admin/audit-logs?q=partner', { token: t })
  assert.ok(audit.data.rows.some((r: any) => r.action === 'partner.suspend' && r.resource_id === p.id))
})

// ------------------------------------------------------------------ TRIPS
test('trip publishing is validated; invalid trips cannot go live', async () => {
  const t = await tok('super@trippy.test', 'Super@123')
  const drafts = (await api('GET', '/api/admin/trips?status=draft', { token: t })).data.rows
  const incomplete = drafts.find((x: any) => x.name === 'Kasol Long Weekend')
  const res = await api('POST', `/api/admin/trips/${incomplete.id}/publish`, { token: t })
  assert.equal(res.status, 422)
  assert.ok(res.data.errors.length > 0)
})

test('trip unpublish → publish cycle works and is audited', async () => {
  const t = await tok('super@trippy.test', 'Super@123')
  const live = (await api('GET', '/api/admin/trips?status=published', { token: t })).data.rows[0]
  assert.equal((await api('POST', `/api/admin/trips/${live.id}/unpublish`, { token: t })).data.status, 'unpublished')
  assert.equal((await api('POST', `/api/admin/trips/${live.id}/publish`, { token: t })).data.status, 'published')
  const audit = await api('GET', `/api/admin/audit-logs?resourceType=trip`, { token: t })
  assert.ok(audit.data.rows.some((r: any) => r.action === 'trip.publish' && r.resource_id === live.id))
})

// ------------------------------------------------------------------ HOSTELS
test('hostel create → validate → publish → consumer visibility → suspend → archive, all audited', async () => {
  const admin = await tok('super@trippy.test', 'Super@123')
  // consumer to check public visibility
  const consumer = (await api('POST', '/api/auth/signup', { body: { email: 'h@h.com', password: 'password123' } })).data.token

  const created = await api('POST', '/api/admin/hostels', { token: admin, body: { name: 'QA Test Hostel', destination: 'manali', city: 'Manali' } })
  assert.equal(created.status, 200)
  const id = created.data.id
  assert.equal(created.data.status, 'draft')

  // Missing required fields → publish blocked.
  assert.equal((await api('POST', `/api/admin/hostels/${id}/publish`, { token: admin })).status, 422)

  // Fill required fields then publish.
  await api('PUT', `/api/admin/hostels/${id}`, { token: admin, body: { description: 'A test hostel', pricePerNight: 500, coverImage: 'https://picsum.photos/seed/qa/1200/800' } })
  assert.equal((await api('POST', `/api/admin/hostels/${id}/publish`, { token: admin })).data.status, 'published')

  // Consumer now sees it in manali (published only).
  let manali = (await api('GET', '/api/hostels?destination=manali', { token: consumer })).data
  assert.ok(manali.some((h: any) => h.id === id), 'published hostel visible to consumer')

  // Suspend → disappears from consumer.
  await api('POST', `/api/admin/hostels/${id}/suspend`, { token: admin, body: { reason: 'qa' } })
  manali = (await api('GET', '/api/hostels?destination=manali', { token: consumer })).data
  assert.ok(!manali.some((h: any) => h.id === id), 'suspended hostel hidden from consumer')

  // Archive works.
  assert.equal((await api('POST', `/api/admin/hostels/${id}/archive`, { token: admin })).data.status, 'archived')

  const audit = await api('GET', '/api/admin/audit-logs?resourceType=hostel', { token: admin })
  const actions = audit.data.rows.filter((r: any) => r.resource_id === id).map((r: any) => r.action)
  assert.ok(actions.includes('hostel.create') && actions.includes('hostel.publish') && actions.includes('hostel.suspend'))
})

// ------------------------------------------------------------------ TRAVELLERS
test('traveller detail never exposes secrets; suspend/reactivate + session revoke audited', async () => {
  const t = await tok('super@trippy.test', 'Super@123')
  // pageSize=200: seeded travellers share one created_at second, so the demo
  // account can fall off the 20-row first page depending on tie-break order.
  const travellers = (await api('GET', '/api/admin/travellers?pageSize=200', { token: t })).data.rows
  const demo = travellers.find((x: any) => x.email === 'traveller@trippy.test')

  const detail = await api('GET', `/api/admin/travellers/${demo.id}`, { token: t })
  assert.equal(detail.status, 200)
  const blob = JSON.stringify(detail.data)
  for (const secret of ['password_hash', 'password_salt', 'passwordHash', 'token']) {
    assert.ok(!blob.includes(secret), `traveller detail must not expose ${secret}`)
  }

  assert.equal((await api('POST', `/api/admin/travellers/${demo.id}/status`, { token: t, body: { action: 'suspend', reason: 'qa' } })).data.status, 'suspended')
  assert.equal((await api('POST', `/api/admin/travellers/${demo.id}/status`, { token: t, body: { action: 'reactivate' } })).data.status, 'active')
  assert.equal((await api('POST', `/api/admin/travellers/${demo.id}/revoke-sessions`, { token: t })).status, 200)

  const audit = await api('GET', '/api/admin/audit-logs?resourceType=traveller', { token: t })
  assert.ok(audit.data.rows.some((r: any) => r.action === 'traveller.suspend' && r.resource_id === demo.id))
})

test('suspended traveller can no longer use their consumer session', async () => {
  const admin = await tok('super@trippy.test', 'Super@123')
  const signup = await api('POST', '/api/auth/signup', { body: { email: 'victim@x.com', password: 'password123' } })
  const consumerTok = signup.data.token
  assert.equal((await api('GET', '/api/me', { token: consumerTok })).status, 200)
  const list = (await api('GET', '/api/admin/travellers?q=victim@x.com', { token: admin })).data.rows
  await api('POST', `/api/admin/travellers/${list[0].id}/revoke-sessions`, { token: admin })
  assert.equal((await api('GET', '/api/me', { token: consumerTok })).status, 401, 'revoked session rejected')
})

// ------------------------------------------------------------------ PLATFORM
test('dashboard returns real, non-hardcoded counts', async () => {
  const t = await tok('super@trippy.test', 'Super@123')
  const d = (await api('GET', '/api/admin/dashboard', { token: t })).data
  // Cross-check dashboard counts against the canonical list endpoints — proves
  // the numbers are computed from real data, not hardcoded.
  const partnersTotal = (await api('GET', '/api/admin/partners?pageSize=100', { token: t })).data.total
  const tripsTotal = (await api('GET', '/api/admin/trips?pageSize=100', { token: t })).data.total
  assert.equal(d.overview.partners.total, partnersTotal)
  assert.equal(d.overview.trips.total, tripsTotal)
  assert.ok(d.overview.travellers.total >= 1)
  assert.ok(Array.isArray(d.activity))
  assert.ok(d.actionRequired && typeof d.actionRequired === 'object')
})

test('global search respects module permissions', async () => {
  // Hostel manager cannot see partners in the module list, so partner results are filtered out.
  const hm = await tok('hostels@trippy.test', 'Hostel@123')
  const res = await api('GET', '/api/admin/search?q=himalayan', { token: hm })
  assert.equal(res.status, 200)
  assert.ok(!res.data.results.some((r: any) => r.type === 'partner'), 'no partner results without partners.view')
})

test('internal notes are admin-only and never leak to the consumer app', async () => {
  const admin = await tok('super@trippy.test', 'Super@123')
  const consumer = (await api('POST', '/api/auth/signup', { body: { email: 'n@n.com', password: 'password123' } })).data.token
  // Attach a note to a published hostel.
  const pubHostel = (await api('GET', '/api/admin/hostels?status=published', { token: admin })).data.rows[0]
  const secret = 'INTERNAL_NOTE_SECRET_' + Date.now()
  await api('POST', '/api/admin/notes', { token: admin, body: { entityType: 'hostel', entityId: pubHostel.id, content: secret } })
  // The consumer hostel detail must not contain it.
  const pub = await api('GET', `/api/hostels/${pubHostel.id}`, { token: consumer, raw: true })
  assert.ok(!pub.text.includes(secret), 'internal note must not appear in consumer response')
})

test('audit logs are immutable — mutation attempts are rejected and the record persists', async () => {
  const t = await tok('super@trippy.test', 'Super@123')
  const before = (await api('GET', '/api/admin/audit-logs?pageSize=200', { token: t })).data
  const row = before.rows[0]
  // No mutation endpoints exist; attempts are rejected (no handler accepts them).
  const del = await api('DELETE', `/api/admin/audit-logs/${row.id}`, { token: t })
  const put = await api('PUT', `/api/admin/audit-logs/${row.id}`, { token: t, body: { action: 'tamper' } })
  assert.ok(del.status >= 400, 'DELETE rejected')
  assert.ok(put.status >= 400, 'PUT rejected')
  // The record is unchanged and still present.
  const after = (await api('GET', '/api/admin/audit-logs?pageSize=200', { token: t })).data
  assert.equal(after.total, before.total)
  assert.ok(after.rows.find((r: any) => r.id === row.id), 'audit row persists')
})
