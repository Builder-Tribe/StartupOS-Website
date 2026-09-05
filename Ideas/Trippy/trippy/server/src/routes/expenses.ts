import { Router } from 'express'
import { db, uid, j, pj, nowIso } from '../db.js'
import { requireAuth, type AuthedRequest } from '../lib/auth.js'

export const expensesRouter = Router()
expensesRouter.use('/groups', requireAuth)

const r = (req: any) => req as AuthedRequest

const CATS = ['food', 'transport', 'accommodation', 'activity', 'misc']

function isMember(groupId: string, userId: string): boolean {
  return !!db.prepare('SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?').get(groupId, userId)
}

function isLeader(groupId: string, userId: string): boolean {
  return !!db.prepare("SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'leader'").get(groupId, userId)
}

function userShape(userId: string) {
  return db.prepare('SELECT id, name, avatar_color, avatar_emoji FROM users WHERE id = ?').get(userId) as any
}

function shapeExpense(e: any) {
  const splitAmong: string[] = pj(e.split_among, [])
  const splits: Record<string, number> = pj(e.splits, {})
  return {
    id: e.id,
    description: e.description,
    amount: e.amount,
    category: e.category,
    splitType: e.split_type,
    paidBy: userShape(e.paid_by),
    splitAmong,
    splits,
    createdAt: e.created_at,
  }
}

function computeBalances(groupId: string, members: any[]) {
  const expenses = db.prepare('SELECT * FROM trip_expenses WHERE group_id = ?').all(groupId) as any[]
  const settlements = db.prepare('SELECT * FROM expense_settlements WHERE group_id = ?').all(groupId) as any[]

  // net[A][B] = how much A owes B (positive means A owes B)
  const net: Record<string, Record<string, number>> = {}
  const init = (a: string, b: string) => {
    if (!net[a]) net[a] = {}
    if (!net[b]) net[b] = {}
    if (net[a][b] === undefined) net[a][b] = 0
    if (net[b][a] === undefined) net[b][a] = 0
  }

  for (const e of expenses) {
    const among: string[] = pj(e.split_among, [])
    if (!among.length) continue
    const share = Math.round((e.amount / among.length) * 100) / 100
    for (const uid of among) {
      if (uid === e.paid_by) continue
      init(uid, e.paid_by)
      net[uid][e.paid_by] += share
      net[e.paid_by][uid] -= share
    }
  }

  for (const s of settlements) {
    init(s.from_user, s.to_user)
    net[s.from_user][s.to_user] -= s.amount
    net[s.to_user][s.from_user] += s.amount
  }

  const balances: { from: any; to: any; amount: number }[] = []
  const seen = new Set<string>()
  for (const a of Object.keys(net)) {
    for (const b of Object.keys(net[a])) {
      const key = [a, b].sort().join(':')
      if (seen.has(key)) continue
      seen.add(key)
      const aOwesB = net[a]?.[b] ?? 0
      if (aOwesB > 0.01) {
        balances.push({ from: userShape(a), to: userShape(b), amount: Math.round(aOwesB * 100) / 100 })
      } else if (aOwesB < -0.01) {
        balances.push({ from: userShape(b), to: userShape(a), amount: Math.round(-aOwesB * 100) / 100 })
      }
    }
  }

  return balances
}

// GET /groups/:id/expenses
expensesRouter.get('/groups/:id/expenses', (req, res) => {
  const userId = r(req).userId
  const groupId = req.params.id
  if (!isMember(groupId, userId)) return res.status(403).json({ error: 'Not a member of this group' })

  const rows = db.prepare('SELECT * FROM trip_expenses WHERE group_id = ? ORDER BY created_at DESC').all(groupId) as any[]
  const expenses = rows.map(shapeExpense)

  const members = db.prepare('SELECT user_id FROM group_members WHERE group_id = ?').all(groupId) as any[]
  const balances = computeBalances(groupId, members)

  const totalSpend = rows.reduce((s, e) => s + e.amount, 0)
  const mySpend = rows.filter(e => e.paid_by === userId).reduce((s, e) => s + e.amount, 0)
  const myOwed = balances.reduce((s, b) => {
    if (b.to?.id === userId) return s + b.amount
    if (b.from?.id === userId) return s - b.amount
    return s
  }, 0)

  res.json({ expenses, balances, totalSpend, mySpend, myOwed: Math.round(myOwed * 100) / 100 })
})

// POST /groups/:id/expenses
expensesRouter.post('/groups/:id/expenses', (req, res) => {
  const userId = r(req).userId
  const groupId = req.params.id
  if (!isMember(groupId, userId)) return res.status(403).json({ error: 'Not a member of this group' })

  const { description, amount, category, paidBy, splitAmong } = req.body
  if (!description?.trim()) return res.status(400).json({ error: 'Description is required' })
  if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'Amount must be positive' })

  const payer = paidBy || userId
  if (!isMember(groupId, payer)) return res.status(400).json({ error: 'Payer must be a group member' })

  const among: string[] = Array.isArray(splitAmong) && splitAmong.length ? splitAmong : [payer]
  for (const uid of among) {
    if (!isMember(groupId, uid)) return res.status(400).json({ error: `${uid} is not a group member` })
  }

  const cat = CATS.includes(category) ? category : 'misc'
  const id = uid()
  db.prepare(`INSERT INTO trip_expenses (id, group_id, amount, description, category, paid_by, split_among, splits, split_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'equal')`)
    .run(id, groupId, Number(amount), description.trim(), cat, payer, j(among), j({}))

  const row = db.prepare('SELECT * FROM trip_expenses WHERE id = ?').get(id) as any
  res.json(shapeExpense(row))
})

// PUT /groups/:id/expenses/:expId
expensesRouter.put('/groups/:id/expenses/:expId', (req, res) => {
  const userId = r(req).userId
  const groupId = req.params.id
  if (!isMember(groupId, userId)) return res.status(403).json({ error: 'Not a member' })

  const e = db.prepare('SELECT * FROM trip_expenses WHERE id = ? AND group_id = ?').get(req.params.expId, groupId) as any
  if (!e) return res.status(404).json({ error: 'Expense not found' })
  if (e.paid_by !== userId && !isLeader(groupId, userId)) return res.status(403).json({ error: 'Only the payer or leader can edit this' })

  const { description, amount, category, paidBy, splitAmong } = req.body
  const among: string[] = Array.isArray(splitAmong) && splitAmong.length ? splitAmong : pj<string[]>(e.split_among, [])
  const cat = CATS.includes(category) ? category : e.category

  db.prepare(`UPDATE trip_expenses SET description=?, amount=?, category=?, paid_by=?, split_among=? WHERE id=?`)
    .run(description ?? e.description, amount ? Number(amount) : e.amount, cat, paidBy ?? e.paid_by, j(among), e.id)

  const updated = db.prepare('SELECT * FROM trip_expenses WHERE id = ?').get(e.id) as any
  res.json(shapeExpense(updated))
})

// DELETE /groups/:id/expenses/:expId
expensesRouter.delete('/groups/:id/expenses/:expId', (req, res) => {
  const userId = r(req).userId
  const groupId = req.params.id
  if (!isMember(groupId, userId)) return res.status(403).json({ error: 'Not a member' })

  const e = db.prepare('SELECT * FROM trip_expenses WHERE id = ? AND group_id = ?').get(req.params.expId, groupId) as any
  if (!e) return res.status(404).json({ error: 'Expense not found' })
  if (e.paid_by !== userId && !isLeader(groupId, userId)) return res.status(403).json({ error: 'Only the payer or leader can delete this' })

  db.prepare('DELETE FROM trip_expenses WHERE id = ?').run(e.id)
  res.json({ ok: true })
})

// POST /groups/:id/expenses/settle
expensesRouter.post('/groups/:id/expenses/settle', (req, res) => {
  const userId = r(req).userId
  const groupId = req.params.id
  if (!isMember(groupId, userId)) return res.status(403).json({ error: 'Not a member' })

  const { fromUser, toUser, amount } = req.body
  if (!fromUser || !toUser || !amount) return res.status(400).json({ error: 'fromUser, toUser and amount are required' })
  if (!isMember(groupId, fromUser) || !isMember(groupId, toUser)) return res.status(400).json({ error: 'Both users must be group members' })

  db.prepare('INSERT INTO expense_settlements (id, group_id, from_user, to_user, amount) VALUES (?, ?, ?, ?, ?)')
    .run(uid(), groupId, fromUser, toUser, Number(amount))

  const members = db.prepare('SELECT user_id FROM group_members WHERE group_id = ?').all(groupId) as any[]
  const balances = computeBalances(groupId, members)
  res.json({ ok: true, balances })
})
