import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { rmSync } from 'node:fs'

const DB = join(tmpdir(), `trippy-adv-${process.pid}-${Date.now()}.db`)
process.env.TRIPPY_DB_PATH = DB
process.env.TRIPPY_TEST = '1'
process.env.JWT_SECRET = 'test-secret'

const { createApp } = await import('../src/index.js')

let base = ''
let server: any
let token1: string, token2: string, userId1: string, userId2: string
let bikeRouteId: string, roadRouteId: string

async function http(method: string, path: string, opts: { token?: string; body?: any } = {}) {
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

before(async () => {
  server = createApp().listen(0)
  await new Promise(r => server.once('listening', r))
  base = `http://127.0.0.1:${server.address().port}`

  // Register two test users
  const r1 = await http('POST', '/api/auth/signup', { body: { email: `adv1_${Date.now()}@t.com`, password: 'pass1234', name: 'Rider One' } })
  token1 = r1.data.token; userId1 = r1.data.user.id
  const r2 = await http('POST', '/api/auth/signup', { body: { email: `adv2_${Date.now()}@t.com`, password: 'pass1234', name: 'Rider Two' } })
  token2 = r2.data.token; userId2 = r2.data.user.id
})

after(() => {
  server?.close()
  for (const ext of ['', '-wal', '-shm']) rmSync(DB + ext, { force: true })
})

// ─── Bike profile ─────────────────────────────────────
describe('Bike profile', () => {
  it('requires auth', async () => {
    const { status } = await http('GET', '/api/adventures/bike/profile')
    assert.equal(status, 401)
  })

  it('returns null for new user', async () => {
    const { status, data } = await http('GET', '/api/adventures/bike/profile', { token: token1 })
    assert.equal(status, 200)
    assert.equal(data, null)
  })

  it('upserts bike profile', async () => {
    const { status, data } = await http('PUT', '/api/adventures/bike/profile', {
      token: token1,
      body: { vehicleType: 'Royal Enfield', engineCc: 350, experienceLevel: 'intermediate', ridingSince: 2018, bio: 'Mountain rides' },
    })
    assert.equal(status, 200)
    assert.equal(data.vehicleType, 'Royal Enfield')
    assert.equal(data.engineCc, 350)
  })

  it('GET returns own profile', async () => {
    const { data } = await http('GET', '/api/adventures/bike/profile', { token: token1 })
    assert.equal(data.vehicleType, 'Royal Enfield')
  })

  it('GET with userId returns other user public profile', async () => {
    const { data } = await http('GET', `/api/adventures/bike/profile?userId=${userId1}`, { token: token2 })
    assert.equal(data.vehicleType, 'Royal Enfield')
  })

  it('invalid experience level defaults to intermediate', async () => {
    const { data } = await http('PUT', '/api/adventures/bike/profile', {
      token: token1, body: { vehicleType: 'Scooter', experienceLevel: 'god' },
    })
    assert.equal(data.experienceLevel, 'intermediate')
  })
})

// ─── Car profile ──────────────────────────────────────
describe('Car profile', () => {
  it('upserts car profile', async () => {
    const { status, data } = await http('PUT', '/api/adventures/car/profile', {
      token: token1, body: { vehicleType: 'SUV', seatingCapacity: 7, ac: true, routeBio: 'Highway drives' },
    })
    assert.equal(status, 200)
    assert.equal(data.vehicleType, 'SUV')
    assert.equal(data.seatingCapacity, 7)
    assert.equal(data.ac, true)
  })

  it('clamps seating capacity to max 9', async () => {
    const { data } = await http('PUT', '/api/adventures/car/profile', {
      token: token1, body: { vehicleType: 'Van', seatingCapacity: 99, ac: false },
    })
    assert.equal(data.seatingCapacity, 9)
  })
})

// ─── Routes — CRUD ────────────────────────────────────
describe('Adventure routes — CRUD', () => {
  it('GET /adventures/routes requires auth', async () => {
    const { status } = await http('GET', '/api/adventures/routes')
    assert.equal(status, 401)
  })

  it('POST rejects route without title', async () => {
    const { status } = await http('POST', '/api/adventures/routes', {
      token: token1, body: { mode: 'bike', fromCity: 'Delhi', toCity: 'Leh' },
    })
    assert.equal(status, 400)
  })

  it('creates a bike route', async () => {
    const { status, data } = await http('POST', '/api/adventures/routes', {
      token: token1,
      body: { mode: 'bike', title: 'Delhi → Leh', fromCity: 'Delhi', toCity: 'Leh', startDate: '2026-09-01', endDate: '2026-09-10', distanceKm: 1000 },
    })
    assert.equal(status, 201)
    assert.equal(data.mode, 'bike')
    bikeRouteId = data.id
  })

  it('GET /adventures/routes returns own routes', async () => {
    const { data } = await http('GET', '/api/adventures/routes', { token: token1 })
    assert.ok(Array.isArray(data))
    assert.ok(data.some((r: any) => r.id === bikeRouteId))
  })

  it('non-member cannot GET route detail', async () => {
    const { status } = await http('GET', `/api/adventures/routes/${bikeRouteId}`, { token: token2 })
    assert.equal(status, 403)
  })

  it('owner can GET full route detail', async () => {
    const { status, data } = await http('GET', `/api/adventures/routes/${bikeRouteId}`, { token: token1 })
    assert.equal(status, 200)
    assert.equal(data.title, 'Delhi → Leh')
    assert.ok(Array.isArray(data.checkins))
    assert.ok(Array.isArray(data.latestPings))
  })

  it('PUT updates route', async () => {
    const { data } = await http('PUT', `/api/adventures/routes/${bikeRouteId}`, {
      token: token1, body: { notes: 'Bring warm gear' },
    })
    assert.equal(data.notes, 'Bring warm gear')
  })

  it('non-owner cannot PUT route', async () => {
    const { status } = await http('PUT', `/api/adventures/routes/${bikeRouteId}`, {
      token: token2, body: { notes: 'hack' },
    })
    assert.equal(status, 403)
  })

  it('soft-delete sets status cancelled', async () => {
    const { data: temp } = await http('POST', '/api/adventures/routes', {
      token: token1, body: { mode: 'bike', title: 'Temp', fromCity: 'A', toCity: 'B' },
    })
    await http('DELETE', `/api/adventures/routes/${temp.id}`, { token: token1 })
    const { data: list } = await http('GET', '/api/adventures/routes', { token: token1 })
    assert.equal(list.find((r: any) => r.id === temp.id)?.status, 'cancelled')
  })

  it('non-owner cannot delete route', async () => {
    const { status } = await http('DELETE', `/api/adventures/routes/${bikeRouteId}`, { token: token2 })
    assert.equal(status, 403)
  })
})

// ─── Live location ────────────────────────────────────
describe('Live location', () => {
  it('non-member cannot POST location', async () => {
    const { status } = await http('POST', `/api/adventures/routes/${bikeRouteId}/location`, {
      token: token2, body: { latitude: 28.6, longitude: 77.2 },
    })
    assert.equal(status, 403)
  })

  it('rejects ping without latitude/longitude', async () => {
    const { status } = await http('POST', `/api/adventures/routes/${bikeRouteId}/location`, {
      token: token1, body: {},
    })
    assert.equal(status, 400)
  })

  it('owner can POST location ping', async () => {
    const { status } = await http('POST', `/api/adventures/routes/${bikeRouteId}/location`, {
      token: token1, body: { latitude: 28.63, longitude: 77.21, batteryPct: 80 },
    })
    assert.equal(status, 200)
  })

  it('GET returns latest ping per member', async () => {
    const { data } = await http('GET', `/api/adventures/routes/${bikeRouteId}/location`, { token: token1 })
    assert.ok(Array.isArray(data))
    assert.equal(data.length, 1)
    assert.equal(data[0].batteryPct, 80)
  })

  it('non-member cannot GET location', async () => {
    const { status } = await http('GET', `/api/adventures/routes/${bikeRouteId}/location`, { token: token2 })
    assert.equal(status, 403)
  })
})

// ─── Check-ins ────────────────────────────────────────
describe('Waypoint check-ins', () => {
  it('rejects check-in without waypointLabel', async () => {
    const { status } = await http('POST', `/api/adventures/routes/${bikeRouteId}/checkins`, {
      token: token1, body: {},
    })
    assert.equal(status, 400)
  })

  it('owner can check in', async () => {
    const { status } = await http('POST', `/api/adventures/routes/${bikeRouteId}/checkins`, {
      token: token1, body: { waypointLabel: 'Rohtang Pass', latitude: 32.37, longitude: 77.25 },
    })
    assert.equal(status, 200)
  })

  it('GET returns all check-ins with name', async () => {
    const { data } = await http('GET', `/api/adventures/routes/${bikeRouteId}/checkins`, { token: token1 })
    assert.ok(Array.isArray(data))
    assert.equal(data[0].waypointLabel, 'Rohtang Pass')
    assert.ok(data[0].name)
  })

  it('non-member cannot GET check-ins', async () => {
    const { status } = await http('GET', `/api/adventures/routes/${bikeRouteId}/checkins`, { token: token2 })
    assert.equal(status, 403)
  })
})

// ─── SOS ──────────────────────────────────────────────
describe('SOS', () => {
  it('owner can trigger SOS', async () => {
    const { status, data } = await http('POST', `/api/adventures/routes/${bikeRouteId}/sos`, {
      token: token1, body: { latitude: 32.5, longitude: 77.1 },
    })
    assert.equal(status, 200)
    assert.equal(data.ok, true)
  })

  it('non-member cannot trigger SOS', async () => {
    const { status } = await http('POST', `/api/adventures/routes/${bikeRouteId}/sos`, {
      token: token2, body: {},
    })
    assert.equal(status, 403)
  })
})

// ─── Carpooling ───────────────────────────────────────
describe('Carpooling', () => {
  it('creates a road trip with seat_capacity', async () => {
    const { status, data } = await http('POST', '/api/adventures/routes', {
      token: token1,
      body: { mode: 'road', title: 'Mumbai → Goa', fromCity: 'Mumbai', toCity: 'Goa', seatCapacity: 4, seatCost: 2000, startDate: '2026-10-01' },
    })
    assert.equal(status, 201)
    assert.equal(data.seatCapacity, 4)
    roadRouteId = data.id
  })

  it('bike route rejects carpool request', async () => {
    const { status } = await http('POST', `/api/adventures/routes/${bikeRouteId}/carpool/request`, {
      token: token2, body: {},
    })
    assert.equal(status, 400)
  })

  it('owner cannot request own road trip', async () => {
    const { status } = await http('POST', `/api/adventures/routes/${roadRouteId}/carpool/request`, {
      token: token1, body: {},
    })
    assert.equal(status, 400)
  })

  it('requester can request a seat', async () => {
    const { status } = await http('POST', `/api/adventures/routes/${roadRouteId}/carpool/request`, {
      token: token2, body: { message: 'Happy to share fuel!' },
    })
    assert.equal(status, 201)
  })

  it('duplicate request rejected', async () => {
    const { status } = await http('POST', `/api/adventures/routes/${roadRouteId}/carpool/request`, {
      token: token2, body: {},
    })
    assert.equal(status, 409)
  })

  it('owner sees pending requests in route detail', async () => {
    const { data } = await http('GET', `/api/adventures/routes/${roadRouteId}`, { token: token1 })
    assert.ok(Array.isArray(data.carpoolRequests))
    assert.equal(data.carpoolRequests.length, 1)
    assert.equal(data.carpoolRequests[0].status, 'pending')
  })

  it('owner accepts request; requester joins hub and can view route', async () => {
    const { data: detail } = await http('GET', `/api/adventures/routes/${roadRouteId}`, { token: token1 })
    const reqId = detail.carpoolRequests[0].id
    const { status, data } = await http('PUT', `/api/adventures/routes/${roadRouteId}/carpool/${reqId}`, {
      token: token1, body: { status: 'accepted' },
    })
    assert.equal(status, 200)
    assert.equal(data.status, 'accepted')
    // Requester is now hub member — route is accessible
    const { status: s2 } = await http('GET', `/api/adventures/routes/${roadRouteId}`, { token: token2 })
    assert.equal(s2, 200)
  })
})

// ─── Companion matching ───────────────────────────────
describe('Companion matching', () => {
  it('requires auth', async () => {
    const { status } = await http('GET', `/api/adventures/routes/${bikeRouteId}/companions`)
    assert.equal(status, 401)
  })

  it('non-owner cannot view companions', async () => {
    const { status } = await http('GET', `/api/adventures/routes/${bikeRouteId}/companions`, { token: token2 })
    assert.equal(status, 403)
  })

  it('owner can view companion list', async () => {
    const { status, data } = await http('GET', `/api/adventures/routes/${bikeRouteId}/companions`, { token: token1 })
    assert.equal(status, 200)
    assert.ok(Array.isArray(data))
  })

  it('matching route from other user appears in companions list', async () => {
    // token2 creates a matching route
    await http('POST', '/api/adventures/routes', {
      token: token2,
      body: { mode: 'bike', title: 'Delhi → Leh B', fromCity: 'Delhi', toCity: 'Leh', startDate: '2026-09-03' },
    })
    const { data } = await http('GET', `/api/adventures/routes/${bikeRouteId}/companions`, { token: token1 })
    assert.ok(data.length >= 1)
    assert.ok(typeof data[0].compatibility === 'number')
    assert.ok(data[0].user)
    assert.ok(data[0].route)
  })
})
