import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { rmSync } from 'node:fs'

const DB = join(tmpdir(), `trippy-bookingstest-${process.pid}-${Date.now()}.db`)
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
const partnerTok = async (email: string, password: string) => (await api('POST', '/api/partner/auth/login', { body: { email, password } })).data.token as string

// Build a small dedicated trip: capacity 2, published, owned by Himalayan Wolves.
async function makeTrip(partner: string, capacity: number | null) {
  const t = (await api('POST', '/api/partner/trips', { token: partner, body: {} })).data
  await api('PUT', `/api/partner/trips/${t.id}`, { token: partner, body: {
    name: `Cap Test ${t.id.slice(0, 4)}`, shortDesc: 'seat test', longDesc: 'seat test trip', destination: 'Manali',
    startDate: '2026-09-01', endDate: '2026-09-04', durationDays: 4, category: 'trekking',
    price: 5000, maxGroupSize: capacity, paymentUrl: 'https://rzp.io/l/captest',
    coverImage: 'https://picsum.photos/seed/captest/1200/800',
  } })
  await api('POST', `/api/partner/trips/${t.id}/itinerary`, { token: partner, body: { title: 'Arrive & acclimatise', description: 'Base day', location: 'Manali' } })
  const pub = await api('POST', `/api/partner/trips/${t.id}/publish`, { token: partner })
  assert.equal(pub.status, 200, JSON.stringify(pub.data))
  return pub.data
}

test('availability: claims + confirmations hold seats; full trips reject claims', async () => {
  const partner = await partnerTok('admin@himalayanwolves.test', 'Trekking@123')
  const trip = await makeTrip(partner, 2)
  const a = await consumer('seat-a@x.com')
  const b = await consumer('seat-b@x.com')
  const c = await consumer('seat-c@x.com')

  // Anonymous claim rejected
  assert.equal((await api('POST', `/api/discover/trips/${trip.slug}/claim-booking`)).status, 401)

  assert.equal((await api('POST', `/api/discover/trips/${trip.slug}/claim-booking`, { token: a })).status, 200)
  // Double-claim by the same traveller blocked
  assert.equal((await api('POST', `/api/discover/trips/${trip.slug}/claim-booking`, { token: a })).status, 400)
  assert.equal((await api('POST', `/api/discover/trips/${trip.slug}/claim-booking`, { token: b })).status, 200)

  const detail = (await api('GET', `/api/discover/trips/${trip.slug}`, { token: c })).data
  assert.equal(detail.availability.full, true)
  assert.equal(detail.availability.seatsLeft, 0)
  // Third traveller can't oversell — waitlist instead
  assert.equal((await api('POST', `/api/discover/trips/${trip.slug}/claim-booking`, { token: c })).status, 400)
  assert.equal((await api('POST', `/api/discover/trips/${trip.slug}/waitlist`, { token: c })).status, 200)

  // Claiming also lands the traveller in the trip's hub → shows in My Trips with booking status
  const mine = (await api('GET', '/api/mytrips', { token: a })).data
  const entry = mine.find((m: any) => m.sourceType === 'partner' && m.bookingStatus === 'claimed')
  assert.ok(entry, 'claim joins the hub and carries bookingStatus')
})

test('partner verifies claims (org-scoped); rejection frees the seat and notifies the waitlist', async () => {
  const partner = await partnerTok('admin@himalayanwolves.test', 'Trekking@123')
  const otherOrg = await partnerTok('admin@coastalnomads.test', 'Beaches@123')
  const trip = await makeTrip(partner, 1)
  const a = await consumer('verify-a@x.com')
  const w = await consumer('verify-w@x.com')

  await api('POST', `/api/discover/trips/${trip.slug}/claim-booking`, { token: a })
  await api('POST', `/api/discover/trips/${trip.slug}/waitlist`, { token: w })

  // Org isolation: the other org can't see or decide these bookings
  assert.equal((await api('GET', `/api/partner/trips/${trip.id}/bookings`, { token: otherOrg })).status, 404)

  const list = (await api('GET', `/api/partner/trips/${trip.id}/bookings`, { token: partner })).data
  assert.equal(list.bookings.length, 1)
  assert.equal(list.waitlistCount, 1)
  const bookingId = list.bookings[0].id

  assert.equal((await api('POST', `/api/partner/trips/${trip.id}/bookings/${bookingId}/decide`, { token: otherOrg, body: { action: 'confirm' } })).status, 404)

  // Reject → seat frees → waitlisted traveller gets an in-app notification
  const rej = await api('POST', `/api/partner/trips/${trip.id}/bookings/${bookingId}/decide`, { token: partner, body: { action: 'reject' } })
  assert.equal(rej.status, 200)
  // Re-deciding a decided booking is blocked
  assert.equal((await api('POST', `/api/partner/trips/${trip.id}/bookings/${bookingId}/decide`, { token: partner, body: { action: 'confirm' } })).status, 400)

  const notifs = (await api('GET', '/api/notifications', { token: w })).data
  assert.ok(notifs.notifications.some((n: any) => n.type === 'waitlist_spot'), 'waitlisted traveller notified of the open seat')
  assert.ok(notifs.unread >= 1)
  // Rejected traveller is told too
  const aNotifs = (await api('GET', '/api/notifications', { token: a })).data
  assert.ok(aNotifs.notifications.some((n: any) => n.type === 'booking_rejected'))
})

test('confirm flow notifies the traveller; cancel frees the seat and wakes the waitlist', async () => {
  const partner = await partnerTok('admin@himalayanwolves.test', 'Trekking@123')
  const trip = await makeTrip(partner, 1)
  const a = await consumer('confirm-a@x.com')
  const w = await consumer('confirm-w@x.com')

  await api('POST', `/api/discover/trips/${trip.slug}/claim-booking`, { token: a })
  await api('POST', `/api/discover/trips/${trip.slug}/waitlist`, { token: w })

  const list = (await api('GET', `/api/partner/trips/${trip.id}/bookings`, { token: partner })).data
  await api('POST', `/api/partner/trips/${trip.id}/bookings/${list.bookings[0].id}/decide`, { token: partner, body: { action: 'confirm' } })

  const detail = (await api('GET', `/api/discover/trips/${trip.slug}`, { token: a })).data
  assert.equal(detail.myBookingStatus, 'confirmed')
  assert.ok((await api('GET', '/api/notifications', { token: a })).data.notifications.some((n: any) => n.type === 'booking_confirmed'))

  // Traveller cancels → seat opens → waitlist notified
  assert.equal((await api('POST', `/api/discover/trips/${trip.slug}/cancel-booking`, { token: a })).status, 200)
  assert.ok((await api('GET', '/api/notifications', { token: w })).data.notifications.some((n: any) => n.type === 'waitlist_spot'))
  // Read-all clears the badge
  await api('POST', '/api/notifications/read-all', { token: w })
  assert.equal((await api('GET', '/api/notifications', { token: w })).data.unread, 0)
})

test('trips without a seat cap never report full; waitlist requires a full trip', async () => {
  const partner = await partnerTok('admin@himalayanwolves.test', 'Trekking@123')
  const trip = await makeTrip(partner, null)
  const a = await consumer('nocap-a@x.com')
  const detail = (await api('GET', `/api/discover/trips/${trip.slug}`, { token: a })).data
  assert.equal(detail.availability.capacity, null)
  assert.equal(detail.availability.full, false)
  assert.equal((await api('POST', `/api/discover/trips/${trip.slug}/waitlist`, { token: a })).status, 400)
  assert.equal((await api('POST', `/api/discover/trips/${trip.slug}/claim-booking`, { token: a })).status, 200)
})
