import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { rmSync } from 'node:fs'

const DB = join(tmpdir(), `trippy-hubstest-${process.pid}-${Date.now()}.db`)
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

async function consumer(email: string) {
  const r = await api('POST', '/api/auth/signup', { body: { email, password: 'password123' } })
  return r.data.token as string
}

// ------------------------------------------------------------- trip hubs
test('joining a hosted trip requires auth and creates one shared hub', async () => {
  const trips = (await api('GET', '/api/discover/trips')).data
  const trip = trips.find((t: any) => t.slug)
  assert.ok(trip, 'seed should contain a published hosted trip')

  // Anonymous join is rejected
  assert.equal((await api('POST', `/api/discover/trips/${trip.slug}/join`)).status, 401)

  const a = await consumer('hub-a@x.com')
  const b = await consumer('hub-b@x.com')
  const first = await api('POST', `/api/discover/trips/${trip.slug}/join`, { token: a })
  assert.equal(first.status, 200)
  const second = await api('POST', `/api/discover/trips/${trip.slug}/join`, { token: b })
  // Both joiners land in the SAME hub group
  assert.equal(first.data.groupId, second.data.groupId)

  const hub = (await api('GET', `/api/groups/${first.data.groupId}`, { token: a })).data
  assert.equal(hub.sourceType, 'partner')
  assert.equal(hub.members.length, 2)
  // First joiner coordinates; second is a member
  assert.equal(hub.members.find((m: any) => m.role === 'leader') != null, true)

  // Hub shows up in both members' My Trips with a source label
  const mine = (await api('GET', '/api/mytrips', { token: b })).data
  const entry = mine.find((t: any) => t.id === first.data.groupId)
  assert.ok(entry && entry.sourceType === 'partner' && entry.memberCount === 2)
})

test('joining an operator trip creates its hub; re-joining is idempotent', async () => {
  const t = await consumer('hub-c@x.com')
  const gt = (await api('GET', '/api/grouptrips', { token: t })).data[0]
  const g1 = await api('POST', `/api/grouptrips/${gt.id}/join`, { token: t })
  const g2 = await api('POST', `/api/grouptrips/${gt.id}/join`, { token: t })
  assert.equal(g1.data.id, g2.data.id)
  assert.equal(g1.data.sourceType, 'operator')
  assert.equal(g2.data.members.length, 1)
})

// ------------------------------------------------------------- announcements
test('announcements are leader-only and land pinned in the hub chat', async () => {
  const leader = await consumer('hub-lead@x.com')
  const member = await consumer('hub-mem@x.com')
  const gt = (await api('GET', '/api/grouptrips', { token: leader })).data[1]
  const hub = (await api('POST', `/api/grouptrips/${gt.id}/join`, { token: leader })).data
  await api('POST', `/api/grouptrips/${gt.id}/join`, { token: member })

  // Member (non-leader) cannot announce
  assert.equal((await api('POST', `/api/groups/${hub.id}/announce`, { token: member, body: { content: 'hi' } })).status, 403)

  const after = await api('POST', `/api/groups/${hub.id}/announce`, { token: leader, body: { content: 'Meet at the bus stand 6am!' } })
  assert.equal(after.status, 200)
  assert.equal(after.data.announcements[0].content, 'Meet at the bus stand 6am!')

  const chat = (await api('GET', `/api/chats/${hub.chatId}`, { token: member })).data
  const msg = chat.messages.find((m: any) => m.type === 'announcement')
  assert.ok(msg && msg.pinned)
})

// ------------------------------------------------------------- polls
test('polls: members create and vote once (changeable); non-members blocked', async () => {
  const a = await consumer('poll-a@x.com')
  const b = await consumer('poll-b@x.com')
  const outsider = await consumer('poll-x@x.com')
  const gt = (await api('GET', '/api/grouptrips', { token: a })).data[2]
  const hub = (await api('POST', `/api/grouptrips/${gt.id}/join`, { token: a })).data
  await api('POST', `/api/grouptrips/${gt.id}/join`, { token: b })

  const created = await api('POST', `/api/groups/${hub.id}/polls`, { token: a, body: { question: 'Which trek day?', options: ['Sat', 'Sun'] } })
  assert.equal(created.status, 200)
  const poll = created.data.polls[0]

  assert.equal((await api('POST', `/api/groups/${hub.id}/polls/${poll.id}/vote`, { token: outsider, body: { option: 0 } })).status, 403)

  await api('POST', `/api/groups/${hub.id}/polls/${poll.id}/vote`, { token: a, body: { option: 0 } })
  await api('POST', `/api/groups/${hub.id}/polls/${poll.id}/vote`, { token: b, body: { option: 1 } })
  // b changes their mind — still one vote per member
  const changed = await api('POST', `/api/groups/${hub.id}/polls/${poll.id}/vote`, { token: b, body: { option: 0 } })
  const p = changed.data.polls.find((x: any) => x.id === poll.id)
  assert.equal(p.totalVotes, 2)
  assert.equal(p.options[0].votes, 2)
  assert.equal(p.options[1].votes, 0)

  // Close, then voting is rejected
  await api('POST', `/api/groups/${hub.id}/polls/${poll.id}/close`, { token: a })
  assert.equal((await api('POST', `/api/groups/${hub.id}/polls/${poll.id}/vote`, { token: b, body: { option: 1 } })).status, 400)
})

// ------------------------------------------------------------- invites
test('invite links let unconnected travellers join; bad codes 404', async () => {
  const host = await consumer('inv-host@x.com')
  const guest = await consumer('inv-guest@x.com')
  const created = await api('POST', '/api/groups', { token: host, body: { name: 'Kasol crew', destination: 'kasol' } })
  const groupId = created.data.id

  const { data: inv } = await api('GET', `/api/groups/${groupId}/invite`, { token: host })
  assert.ok(inv.code)

  // Guest is NOT connected to host but can join via code (bypasses connection gate)
  const preview = await api('GET', `/api/invites/${inv.code}`, { token: guest })
  assert.equal(preview.data.name, 'Kasol crew')
  const joined = await api('POST', `/api/invites/${inv.code}/join`, { token: guest })
  assert.equal(joined.status, 200)
  assert.equal(joined.data.members.length, 2)

  assert.equal((await api('GET', '/api/invites/nope1234', { token: guest })).status, 404)
})

// ------------------------------------------------------------- phase-1 finishing sprint
test('polls appear inline in the group chat and are votable from there', async () => {
  const t = await consumer('inline-poll@x.com')
  const gt = (await api('GET', '/api/grouptrips', { token: t })).data[3]
  const hub = (await api('POST', `/api/grouptrips/${gt.id}/join`, { token: t })).data
  const created = await api('POST', `/api/groups/${hub.id}/polls`, { token: t, body: { question: 'Café or trek first?', options: ['Café', 'Trek'] } })
  const pollId = created.data.polls[0].id

  const chat = (await api('GET', `/api/chats/${hub.chatId}`, { token: t })).data
  const pollMsg = chat.messages.find((m: any) => m.type === 'poll')
  assert.ok(pollMsg, 'poll message lands in the group chat')
  assert.equal(pollMsg.content, pollId)
  assert.ok(chat.polls[pollId], 'chat payload carries poll state')
  assert.equal(chat.polls[pollId].question, 'Café or trek first?')
})

test('location messages round-trip through chat', async () => {
  const t = await consumer('loc-share@x.com')
  const gt = (await api('GET', '/api/grouptrips', { token: t })).data[4]
  const hub = (await api('POST', `/api/grouptrips/${gt.id}/join`, { token: t })).data
  const sent = await api('POST', `/api/chats/${hub.chatId}/messages`, { token: t, body: { type: 'location', content: JSON.stringify({ lat: 32.2396, lng: 77.1887, name: 'Old Manali bridge' }) } })
  assert.equal(sent.status, 200)
  assert.equal(sent.data.type, 'location')
})

test('itinerary items are editable by members (PRD 1.5.4)', async () => {
  const t = await consumer('itin-edit@x.com')
  const outsider = await consumer('itin-out@x.com')
  const g = (await api('POST', '/api/groups', { token: t, body: { name: 'Edit crew', destination: 'manali' } })).data
  const item = (await api('POST', `/api/groups/${g.id}/itinerary`, { token: t, body: { day: 1, title: 'Jogini waterfall', cost: 0 } })).data
  const upd = await api('PUT', `/api/groups/${g.id}/itinerary/${item.id}`, { token: t, body: { day: 2, title: 'Jogini waterfall hike', cost: 200 } })
  assert.equal(upd.status, 200)
  assert.equal(upd.data.title, 'Jogini waterfall hike')
  assert.equal(upd.data.day, 2)
  assert.equal(upd.data.cost, 200)
  assert.equal((await api('PUT', `/api/groups/${g.id}/itinerary/${item.id}`, { token: outsider, body: { title: 'hax' } })).status, 403)
})

function daysFromNow(d: number) {
  const dt = new Date()
  dt.setDate(dt.getDate() + d)
  return dt.toISOString().slice(0, 10)
}

test('match secondary filters narrow by gender/budget/age/verified (PRD 1.2.7)', async () => {
  const me = await consumer('filter-me@x.com')
  await api('PUT', '/api/me', { token: me, body: { name: 'Filter Me', age: 27, travelStyle: 'adventure', budget: 'budget', gender: 'female' } })
  await api('POST', '/api/trips', { token: me, body: { destination: 'manali', startDate: daysFromNow(12), endDate: daysFromNow(18) } })

  const all = (await api('GET', '/api/matches', { token: me })).data.matches
  assert.ok(all.length > 0, 'seeded demo travellers should match on manali')
  const women = (await api('GET', '/api/matches?gender=female', { token: me })).data.matches
  assert.ok(women.every((m: any) => m.user.gender === 'female'))
  const young = (await api('GET', '/api/matches?ageMin=18&ageMax=27', { token: me })).data.matches
  assert.ok(young.every((m: any) => m.user.age >= 18 && m.user.age <= 27))
  const premium = (await api('GET', '/api/matches?budget=premium', { token: me })).data.matches
  assert.ok(premium.every((m: any) => m.user.budget === 'premium'))
  assert.ok(women.length <= all.length && young.length <= all.length)
})

// ------------------------------------------------------------- DIY suggestions (v3.11 fixes)
test('itinerary suggestions dedupe against the plan and spread across days', async () => {
  const t = await consumer('suggest-fix@x.com')
  const g = (await api('POST', '/api/groups', { token: t, body: { name: 'Spread crew', destination: 'manali', startDate: '2026-08-01', endDate: '2026-08-06' } })).data

  const first = (await api('POST', `/api/groups/${g.id}/suggest-itinerary`, { token: t })).data
  assert.ok(first.suggestions.length > 2)
  // Even spread: activities must not all pile onto days 2-3 of a 6-day trip
  const actDays = first.suggestions.filter((s: any) => s.day > 1 && !s.title.includes('Group dinner')).map((s: any) => s.day)
  assert.ok(new Set(actDays).size >= Math.min(3, actDays.length), `activities spread over days, got ${actDays}`)

  // Accept one suggestion, then re-suggest: the accepted title must not come back
  const taken = first.suggestions.find((s: any) => s.day > 1 && !s.title.includes('Group dinner'))
  await api('POST', `/api/groups/${g.id}/itinerary`, { token: t, body: taken })
  const second = (await api('POST', `/api/groups/${g.id}/suggest-itinerary`, { token: t })).data
  assert.ok(!second.suggestions.some((s: any) => s.title === taken.title), 'accepted suggestion is not re-offered')
  // Plan is no longer empty, so the day-1 check-in starter is dropped too
  assert.ok(!second.suggestions.some((s: any) => s.title.includes('Check in')), 'check-in starter only offered for empty plans')
})

test('itinerary suggestions lead with cheap picks for budget-majority groups', async () => {
  const t = await consumer('suggest-budget@x.com')
  await api('PUT', '/api/me', { token: t, body: { name: 'Budget B', age: 25, travelStyle: 'adventure', budget: 'budget' } })
  const g = (await api('POST', '/api/groups', { token: t, body: { name: 'Cheap crew', destination: 'manali', startDate: '2026-08-01', endDate: '2026-08-04' } })).data
  const res = (await api('POST', `/api/groups/${g.id}/suggest-itinerary`, { token: t })).data
  assert.equal(res.budgetAware, true)
  const acts = res.suggestions.filter((s: any) => !s.title.includes('Check in') && !s.title.includes('Group dinner'))
  const costs = acts.map((s: any) => s.cost)
  assert.deepEqual(costs, [...costs].sort((a: number, b: number) => a - b), 'cheapest activities first')
})
