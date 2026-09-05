import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { rmSync } from 'node:fs'

const DB = join(tmpdir(), `trippy-authtest-${process.pid}-${Date.now()}.db`)
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

async function api(method: string, path: string, opts: { token?: string; body?: any } = {}) {
  const headers: Record<string, string> = {}
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`
  const res = await fetch(base + path, { method, headers, body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined })
  return { status: res.status, data: await res.json().catch(() => ({})) }
}

test('consumer signup issues a token and needs onboarding', async () => {
  const res = await api('POST', '/api/auth/signup', { body: { name: 'Neo', email: 'neo@example.com', password: 'matrix99' } })
  assert.equal(res.status, 200)
  assert.ok(res.data.token)
  assert.equal(res.data.needsOnboarding, true)
  assert.equal(res.data.user.email, 'neo@example.com')
})

test('signup rejects duplicate email and weak password', async () => {
  await api('POST', '/api/auth/signup', { body: { email: 'dup@example.com', password: 'longenough1' } })
  const dup = await api('POST', '/api/auth/signup', { body: { email: 'dup@example.com', password: 'longenough1' } })
  assert.equal(dup.status, 409)
  const weak = await api('POST', '/api/auth/signup', { body: { email: 'weak@example.com', password: 'short' } })
  assert.equal(weak.status, 400)
  const bademail = await api('POST', '/api/auth/signup', { body: { email: 'notanemail', password: 'longenough1' } })
  assert.equal(bademail.status, 400)
})

test('login succeeds with correct password and fails otherwise', async () => {
  await api('POST', '/api/auth/signup', { body: { email: 'trin@example.com', password: 'redpill7' } })
  const ok = await api('POST', '/api/auth/login', { body: { email: 'trin@example.com', password: 'redpill7' } })
  assert.equal(ok.status, 200)
  assert.ok(ok.data.token)
  const bad = await api('POST', '/api/auth/login', { body: { email: 'trin@example.com', password: 'wrong' } })
  assert.equal(bad.status, 401)
  const nouser = await api('POST', '/api/auth/login', { body: { email: 'ghost@example.com', password: 'whatever1' } })
  assert.equal(nouser.status, 401)
})

test('partner self-serve signup creates an org and a working session', async () => {
  const res = await api('POST', '/api/partner/auth/signup', {
    body: { orgName: 'Test Trekkers', name: 'Lead', email: 'lead@testtrekkers.com', password: 'summit123' },
  })
  assert.equal(res.status, 200)
  assert.ok(res.data.token)
  assert.equal(res.data.org.name, 'Test Trekkers')
  assert.ok(res.data.org.slug)

  // The new session works and starts with zero trips scoped to this org.
  const list = await api('GET', '/api/partner/trips', { token: res.data.token })
  assert.equal(list.status, 200)
  assert.equal(list.data.trips.length, 0)

  // Duplicate email is rejected.
  const dup = await api('POST', '/api/partner/auth/signup', {
    body: { orgName: 'Other', email: 'lead@testtrekkers.com', password: 'summit123' },
  })
  assert.equal(dup.status, 409)
})

// ------------------------------------------------------------- guest browsing
test('guests can browse discovery endpoints without a token', async () => {
  for (const path of ['/api/destinations', '/api/grouptrips', '/api/compare?destination=manali&days=4', '/api/hostels', '/api/discover/trips']) {
    const res = await api('GET', path)
    assert.equal(res.status, 200, `${path} should be public`)
  }
  const hostels = (await api('GET', '/api/hostels')).data
  const detail = await api('GET', `/api/hostels/${hostels[0].id}`)
  assert.equal(detail.status, 200)
  // Guests get the member count but never the member profiles
  assert.equal(detail.data.members.length, 0)
  assert.ok(typeof detail.data.memberCount === 'number')
})

test('guest browsing never opens user data or actions', async () => {
  for (const [method, path] of [
    ['GET', '/api/me'], ['GET', '/api/matches'], ['GET', '/api/chats'], ['GET', '/api/mytrips'], ['GET', '/api/groups'],
    ['POST', '/api/hostels/x/stay'], ['POST', '/api/grouptrips/x/join'],
  ] as [string, string][]) {
    const res = await api(method, path, method === 'POST' ? { body: {} } : {})
    assert.equal(res.status, 401, `${method} ${path} must require auth`)
  }
})
