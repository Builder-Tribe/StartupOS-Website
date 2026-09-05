import { db, uid, pj } from '../db.js'

// Poll projection with per-option counts and the viewer's own vote.
// Used by the Trip Hub page and by group chats (polls render inline there).
export function pollShape(p: any, me: string) {
  const votes = db.prepare('SELECT user_id, option_idx FROM poll_votes WHERE poll_id = ?').all(p.id) as any[]
  const options = pj<string[]>(p.options, [])
  return {
    id: p.id, question: p.question, closed: !!p.closed, createdBy: p.created_by, createdAt: p.created_at,
    options: options.map((label, i) => ({ label, votes: votes.filter(v => v.option_idx === i).length })),
    totalVotes: votes.length,
    myVote: votes.find(v => v.user_id === me)?.option_idx ?? null,
  }
}

// Trip Hubs (PRD 3.1): every trip a traveller joins gets one shared group —
// the same `groups` machinery DIY trips use (chat, members, itinerary, polls) —
// linked back to its source trip via (source_type, source_id).
// The first joiner becomes the hub's coordinator ('leader'); for hosted trips
// the host communicates through announcements once operator hubs (PRD 3.8) land.

export interface HubSource {
  type: 'partner' | 'operator'
  id: string
  name: string
  destination: string
  startDate: string | null
  endDate: string | null
}

export function findOrCreateHub(source: HubSource, userId: string) {
  let g = db.prepare('SELECT * FROM groups WHERE source_type = ? AND source_id = ?').get(source.type, source.id) as any
  if (!g) {
    const groupId = uid()
    const chatId = uid()
    db.prepare("INSERT INTO chats (id, type, name, group_id) VALUES (?, 'group', ?, ?)").run(chatId, source.name, groupId)
    db.prepare('INSERT INTO groups (id, name, destination, start_date, end_date, creator_id, chat_id, source_type, source_id, invite_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(groupId, source.name, source.destination, source.startDate, source.endDate, userId, chatId, source.type, source.id, uid().slice(0, 8))
    db.prepare("INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'leader')").run(groupId, userId)
    db.prepare('INSERT INTO chat_members (chat_id, user_id) VALUES (?, ?)').run(chatId, userId)
    db.prepare("INSERT INTO messages (id, chat_id, sender_id, type, content) VALUES (?, ?, NULL, 'system', ?)")
      .run(uid(), chatId, `Welcome to the travellers' hub for "${source.name}" — say hi, plan together, and watch for announcements.`)
    g = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId)
  } else if (!db.prepare('SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?').get(g.id, userId)) {
    db.prepare("INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'member')").run(g.id, userId)
    db.prepare('INSERT OR IGNORE INTO chat_members (chat_id, user_id) VALUES (?, ?)').run(g.chat_id, userId)
  }
  return g
}

export function ensureInviteCode(groupId: string): string {
  const g = db.prepare('SELECT invite_code FROM groups WHERE id = ?').get(groupId) as any
  if (g?.invite_code) return g.invite_code
  const code = uid().slice(0, 8)
  db.prepare('UPDATE groups SET invite_code = ? WHERE id = ?').run(code, groupId)
  return code
}
