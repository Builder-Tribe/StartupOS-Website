import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { rmSync } from 'node:fs'

const DB = join(tmpdir(), `trippy-profiletest-${process.pid}-${Date.now()}.db`)
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
  const headers: Record<string, string> = { Connection: 'close' }
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(base + path, { method, headers, body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined })
      return { status: res.status, data: await res.json().catch(() => ({})) }
    } catch (e) {
      if (attempt >= 4) throw e
      await new Promise(r => setTimeout(r, 60))
    }
  }
}

const consumer = async (email: string) => (await api('POST', '/api/auth/signup', { body: { email, password: 'password123' } })).data.token as string
const adminTok = async (email: string, password: string) => (await api('POST', '/api/admin/auth/login', { body: { email, password } })).data.token as string

// ------------------------------------------------------ profile trust fields
test('past trips and socials round-trip; invalid entries are dropped; private fields stay private', async () => {
  const t = await consumer('trust-a@x.com')
  const updated = await api('PUT', '/api/me', {
    token: t,
    body: {
      name: 'Trusty', age: 28, travelStyle: 'adventure', budget: 'budget',
      emergencyName: 'Mom', emergencyPhone: '9999999999',
      pastTrips: [
        { destination: 'Spiti Valley', year: 2024, note: 'bike circuit' },
        { destination: '', year: 2023 },                  // dropped: no destination
        { destination: 'Mars', year: 1200 },              // dropped: bad year
      ],
      socials: { instagram: '@trusty_travels', linkedin: 'javascript:alert(1)', youtube: 'TrustyT' },
    },
  })
  assert.equal(updated.status, 200)
  assert.equal(updated.data.pastTrips.length, 1)
  assert.equal(updated.data.pastTrips[0].destination, 'Spiti Valley')
  assert.equal(updated.data.socials.instagram, 'trusty_travels')   // @ stripped
  assert.equal(updated.data.socials.linkedin, undefined)           // invalid chars rejected
  assert.equal(updated.data.socials.youtube, 'TrustyT')

  // Public view: past trips + socials visible; emergency contact + email are NOT
  const viewer = await consumer('trust-b@x.com')
  const me = updated.data
  const pub = (await api('GET', `/api/users/${me.id}`, { token: viewer })).data
  assert.equal(pub.pastTrips.length, 1)
  assert.equal(pub.socials.instagram, 'trusty_travels')
  const blob = JSON.stringify(pub)
  assert.ok(!blob.includes('9999999999') && !blob.includes('trust-a@x.com'), 'public profile must not leak private fields')
})

// ------------------------------------------------------ ID verification flow
test('ID verification: submit → pending → admin approves (audited) → badge; duplicates rejected', async () => {
  const t = await consumer('verify-me@x.com')
  // Bad submissions rejected
  assert.equal((await api('POST', '/api/me/verify-id', { token: t, body: { docType: 'aadhaar', docLast4: '12' } })).status, 400)
  assert.equal((await api('POST', '/api/me/verify-id', { token: t, body: { docType: 'library_card', docLast4: '1234' } })).status, 400)

  const sub = await api('POST', '/api/me/verify-id', { token: t, body: { docType: 'aadhaar', docLast4: '1234' } })
  assert.equal(sub.status, 200)
  assert.equal(sub.data.idVerification.status, 'pending')
  // Double-submit while pending is blocked
  assert.equal((await api('POST', '/api/me/verify-id', { token: t, body: { docType: 'passport', docLast4: '5678' } })).status, 400)

  const ops = await adminTok('ops@trippy.test', 'Ops@12345')
  const queue = (await api('GET', '/api/admin/id-verifications?status=pending', { token: ops })).data.rows
  const item = queue.find((v: any) => v.email === 'verify-me@x.com')
  assert.ok(item, 'request appears in the admin queue')

  // Reject requires a reason
  assert.equal((await api('POST', `/api/admin/id-verifications/${item.id}/decide`, { token: ops, body: { action: 'reject' } })).status, 400)

  const ok = await api('POST', `/api/admin/id-verifications/${item.id}/decide`, { token: ops, body: { action: 'approve' } })
  assert.equal(ok.status, 200)
  const me = (await api('GET', '/api/me', { token: t })).data
  assert.equal(me.idVerified, true)
  // Re-review of a decided request is blocked; verified users can't resubmit
  assert.equal((await api('POST', `/api/admin/id-verifications/${item.id}/decide`, { token: ops, body: { action: 'approve' } })).status, 400)
  assert.equal((await api('POST', '/api/me/verify-id', { token: t, body: { docType: 'aadhaar', docLast4: '1234' } })).status, 400)

  const audit = await api('GET', '/api/admin/audit-logs?action=traveller.id_verify.approve', { token: ops })
  assert.ok(audit.data.rows.some((r: any) => r.resource_id === me.id))
})

test('ID verification review requires the travellers.verify permission', async () => {
  const analyst = await adminTok('analyst@trippy.test', 'Analyst@123')
  assert.equal((await api('GET', '/api/admin/id-verifications', { token: analyst })).status, 403)
})

// ------------------------------------------------------ community vouches
test('vouches: only travel companions; one per pair (updatable); trust score recomputed', async () => {
  const a = await consumer('vouch-a@x.com')
  const b = await consumer('vouch-b@x.com')
  const stranger = await consumer('vouch-s@x.com')

  // Not companions yet
  const bId = (await api('GET', '/api/me', { token: b })).data.id
  assert.equal((await api('POST', `/api/users/${bId}/vouch`, { token: a, body: { rating: 5 } })).status, 403)

  // Share a hub → eligible
  const gt = (await api('GET', '/api/grouptrips', { token: a })).data[0]
  await api('POST', `/api/grouptrips/${gt.id}/join`, { token: a })
  await api('POST', `/api/grouptrips/${gt.id}/join`, { token: b })

  assert.equal((await api('POST', `/api/users/${bId}/vouch`, { token: a, body: { rating: 9 } })).status, 400)
  const v1 = await api('POST', `/api/users/${bId}/vouch`, { token: a, body: { rating: 5, text: 'Great trip buddy' } })
  assert.equal(v1.status, 200)
  assert.equal(v1.data.trustScore, 5)
  assert.equal(v1.data.trustReviews, 1)

  // Same voucher again → updates, doesn't duplicate
  const v2 = await api('POST', `/api/users/${bId}/vouch`, { token: a, body: { rating: 4 } })
  assert.equal(v2.data.trustReviews, 1)
  assert.equal(v2.data.trustScore, 4)

  // Stranger (no shared trip) still blocked; self-vouch blocked
  assert.equal((await api('POST', `/api/users/${bId}/vouch`, { token: stranger, body: { rating: 5 } })).status, 403)
  assert.equal((await api('POST', `/api/users/${bId}/vouch`, { token: b, body: { rating: 5 } })).status, 400)

  // Public profile shows the vouch + canVouch flags
  const pub = (await api('GET', `/api/users/${bId}`, { token: a })).data
  assert.equal(pub.vouches.length, 1)
  assert.equal(pub.hasVouched, true)
  assert.equal(pub.canVouch, false)
})
