import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { rmSync } from 'node:fs'

// Point the DB at a throwaway file and flag test mode BEFORE importing the app
// (db.ts reads TRIPPY_DB_PATH at import time; index.ts skips listen under TRIPPY_TEST).
const DB = join(tmpdir(), `trippy-test-${process.pid}-${Date.now()}.db`)
process.env.TRIPPY_DB_PATH = DB
process.env.TRIPPY_TEST = '1'
process.env.JWT_SECRET = 'test-secret'

const { createApp } = await import('../src/index.js')
const { db } = await import('../src/db.js')

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

async function api(method: string, path: string, opts: { token?: string; body?: any } = {}) {
  const headers: Record<string, string> = {}
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`
  const res = await fetch(base + path, { method, headers, body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined })
  return { status: res.status, data: await res.json().catch(() => ({})) }
}
const login = async (email: string, password: string) =>
  (await api('POST', '/api/partner/auth/login', { body: { email, password } }))

// A fully-completed draft ready to publish, minus whatever we omit per test.
async function completeDraft(token: string) {
  const { data: t } = await api('POST', '/api/partner/trips', { token, body: { name: 'QA Trek' } })
  await api('PUT', `/api/partner/trips/${t.id}`, { token, body: {
    destination: 'Manali', startDate: '2026-10-01', endDate: '2026-10-04', price: 9999,
    coverImage: 'https://picsum.photos/seed/qa/1200/800', longDesc: 'Great trip.',
    paymentUrl: 'https://example.com/pay/qa',
  } })
  await api('POST', `/api/partner/trips/${t.id}/itinerary`, { token, body: { title: 'Day one' } })
  return t.id
}

test('partner admin authentication — success and failure', async () => {
  const ok = await login('admin@himalayanwolves.test', 'Trekking@123')
  assert.equal(ok.status, 200)
  assert.ok(ok.data.token)
  assert.equal(ok.data.org.name, 'Himalayan Wolves')

  const bad = await login('admin@himalayanwolves.test', 'wrongpass')
  assert.equal(bad.status, 401)

  const noauth = await api('GET', '/api/partner/trips')
  assert.equal(noauth.status, 401)
})

test('organization-level data isolation', async () => {
  const org1 = (await login('admin@himalayanwolves.test', 'Trekking@123')).data.token
  const org2 = (await login('admin@coastalnomads.test', 'Beaches@123')).data.token
  const { data: t } = await api('POST', '/api/partner/trips', { token: org1, body: { name: 'Secret Trip' } })

  // org2 must not read, edit, publish, or delete org1's trip.
  assert.equal((await api('GET', `/api/partner/trips/${t.id}`, { token: org2 })).status, 404)
  assert.equal((await api('PUT', `/api/partner/trips/${t.id}`, { token: org2, body: { name: 'hijack' } })).status, 404)
  assert.equal((await api('POST', `/api/partner/trips/${t.id}/publish`, { token: org2 })).status, 404)
  assert.equal((await api('DELETE', `/api/partner/trips/${t.id}`, { token: org2 })).status, 404)

  // org2's own listing never contains org1's trip.
  const list2 = await api('GET', '/api/partner/trips', { token: org2 })
  assert.ok(!list2.data.trips.some((x: any) => x.id === t.id))
})

test('create trip, save draft, edit draft', async () => {
  const token = (await login('admin@himalayanwolves.test', 'Trekking@123')).data.token
  const created = await api('POST', '/api/partner/trips', { token, body: { name: 'Draft One' } })
  assert.equal(created.status, 200)
  assert.equal(created.data.status, 'draft')

  const edited = await api('PUT', `/api/partner/trips/${created.data.id}`, { token, body: { shortDesc: 'Edited', price: 5000 } })
  assert.equal(edited.data.shortDesc, 'Edited')
  assert.equal(edited.data.price, 5000)

  const reread = await api('GET', `/api/partner/trips/${created.data.id}`, { token })
  assert.equal(reread.data.shortDesc, 'Edited')
})

test('publish validation blocks incomplete trips', async () => {
  const token = (await login('admin@himalayanwolves.test', 'Trekking@123')).data.token
  const { data: t } = await api('POST', '/api/partner/trips', { token, body: { name: 'Incomplete' } })
  const res = await api('POST', `/api/partner/trips/${t.id}/publish`, { token })
  assert.equal(res.status, 422)
  assert.ok(Array.isArray(res.data.errors) && res.data.errors.length >= 5)
})

test('non-https payment url is rejected', async () => {
  const token = (await login('admin@himalayanwolves.test', 'Trekking@123')).data.token
  const { data: t } = await api('POST', '/api/partner/trips', { token, body: { name: 'URL test' } })
  const res = await api('PUT', `/api/partner/trips/${t.id}`, { token, body: { paymentUrl: 'http://insecure.example.com' } })
  assert.equal(res.status, 400)
})

test('publish trip then it is visible publicly (and draft is not)', async () => {
  const token = (await login('admin@himalayanwolves.test', 'Trekking@123')).data.token

  // A separate untouched draft that should never surface publicly.
  const { data: draft } = await api('POST', '/api/partner/trips', { token, body: { name: 'Hidden Draft' } })

  const id = await completeDraft(token)
  const pub = await api('POST', `/api/partner/trips/${id}/publish`, { token })
  assert.equal(pub.status, 200)
  assert.equal(pub.data.status, 'published')
  const slug = pub.data.slug
  assert.ok(slug)

  const list = await api('GET', '/api/discover/trips')
  assert.ok(list.data.some((x: any) => x.slug === slug), 'published trip should be listed')
  assert.ok(!list.data.some((x: any) => x.id === draft.id), 'draft must not be listed')
})

test('consumer trip details loads and hides the payment url', async () => {
  const token = (await login('admin@coastalnomads.test', 'Beaches@123')).data.token
  const id = await completeDraft(token)
  const slug = (await api('POST', `/api/partner/trips/${id}/publish`, { token })).data.slug

  const detail = await api('GET', `/api/discover/trips/${slug}`)
  assert.equal(detail.status, 200)
  assert.equal(detail.data.name, 'QA Trek')
  assert.equal(detail.data.itinerary.length, 1)
  assert.equal(detail.data.bookable, true)
  assert.equal('paymentUrl' in detail.data, false, 'public payload must not leak paymentUrl')

  // A raw draft id must 404 through the public API.
  const { data: d } = await api('POST', '/api/partner/trips', { token, body: { name: 'nope' } })
  assert.equal((await api('GET', `/api/discover/trips/${d.id}`)).status, 404)
})

test('external payment redirect records an outbound booking click', async () => {
  const token = (await login('admin@himalayanwolves.test', 'Trekking@123')).data.token
  const id = await completeDraft(token)
  const slug = (await api('POST', `/api/partner/trips/${id}/publish`, { token })).data.slug
  const orgId = (await api('GET', '/api/partner/me', { token })).data.orgId

  const before = (db.prepare('SELECT COUNT(*) AS c FROM trip_outbound_clicks WHERE trip_id = ?').get(id) as any).c
  const res = await api('POST', `/api/discover/trips/${slug}/track-click`, {
    body: { cta: 'book_now', sourcePage: 'trip_details', anonSessionId: 'anon-xyz' },
  })
  assert.equal(res.status, 200)
  assert.equal(res.data.paymentUrl, 'https://example.com/pay/qa')

  const row = db.prepare('SELECT * FROM trip_outbound_clicks WHERE trip_id = ? ORDER BY created_at DESC').get(id) as any
  const after = (db.prepare('SELECT COUNT(*) AS c FROM trip_outbound_clicks WHERE trip_id = ?').get(id) as any).c
  assert.equal(after, before + 1)
  assert.equal(row.org_id, orgId)
  assert.equal(row.cta, 'book_now')
  assert.equal(row.anon_session_id, 'anon-xyz')
})
