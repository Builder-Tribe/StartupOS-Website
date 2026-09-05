import { Router } from 'express'
import { db, uid } from '../db.js'
import { requireAuth, type AuthedRequest } from '../lib/auth.js'
import { publicUser } from '../lib/shape.js'
import { pollShape } from '../lib/hubs.js'

export const chatsRouter = Router()
chatsRouter.use(requireAuth)

const r = (req: any) => req as AuthedRequest

function memberOf(chatId: string, userId: string) {
  return !!db.prepare('SELECT 1 FROM chat_members WHERE chat_id = ? AND user_id = ?').get(chatId, userId)
}

function chatSummary(chat: any, me: string) {
  const rawMembers = db.prepare('SELECT u.* FROM chat_members cm JOIN users u ON u.id = cm.user_id WHERE cm.chat_id = ?').all(chat.id) as any[]
  const members = rawMembers.map(publicUser).filter(Boolean)
  const last = db.prepare('SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at DESC, id DESC LIMIT 1').get(chat.id) as any
  const other = chat.type === 'dm' ? members.find(m => m && m.id !== me) : null
  return {
    id: chat.id,
    type: chat.type,
    groupId: chat.group_id,
    name: chat.type === 'dm' ? (other?.name || 'Traveler') : (chat.name || 'Group Chat'),
    avatarColor: (chat.type === 'dm' ? (other?.avatarColor || '#0d9488') : '#0d9488'),
    avatarEmoji: (chat.type === 'dm' ? (other?.avatarEmoji || '💬') : '👥'),
    members,
    lastMessage: last ? { content: last.content, type: last.type, createdAt: last.created_at, mine: last.sender_id === me } : null,
  }
}

chatsRouter.get('/chats', (req, res) => {
  try {
    const me = r(req).userId
    const chats = db.prepare(`
      SELECT c.* FROM chats c JOIN chat_members cm ON cm.chat_id = c.id WHERE cm.user_id = ?
      ORDER BY (SELECT MAX(created_at) FROM messages m WHERE m.chat_id = c.id) DESC
    `).all(me) as any[]
    res.json(chats.map(c => chatSummary(c, me)))
  } catch (err: any) {
    console.error('[chats] GET /chats error:', err)
    res.status(500).json({ error: err.message || 'Failed to fetch chats' })
  }
})

chatsRouter.get('/chats/:id', (req, res) => {
  try {
    const me = r(req).userId
    if (!memberOf(req.params.id, me)) return res.status(403).json({ error: 'Not a member of this chat' })
    const chat = db.prepare('SELECT * FROM chats WHERE id = ?').get(req.params.id) as any
    if (!chat) return res.status(404).json({ error: 'Chat not found' })
    const after = req.query.after as string | undefined
    const messages = (after
      ? db.prepare('SELECT * FROM messages WHERE chat_id = ? AND created_at > ? ORDER BY created_at, id').all(chat.id, after)
      : db.prepare('SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at, id').all(chat.id)) as any[]
    const pinned = db.prepare('SELECT * FROM messages WHERE chat_id = ? AND pinned = 1 ORDER BY created_at DESC LIMIT 3').all(chat.id)
    // Group chats render polls inline (PRD 1.4.5): ship current poll state keyed by id.
    let polls: Record<string, any> | undefined
    if (chat.group_id) {
      polls = {}
      for (const p of db.prepare('SELECT * FROM polls WHERE group_id = ?').all(chat.group_id) as any[]) polls[p.id] = pollShape(p, me)
    }
    res.json({ ...chatSummary(chat, me), messages, pinnedMessages: pinned, polls })
  } catch (err: any) {
    console.error('[chats] GET /chats/:id error:', err)
    res.status(500).json({ error: err.message || 'Failed to fetch chat details' })
  }
})

chatsRouter.post('/chats/:id/messages', (req, res) => {
  try {
    const me = r(req).userId
    if (!memberOf(req.params.id, me)) return res.status(403).json({ error: 'Not a member of this chat' })
    const type = ['text', 'location'].includes(req.body?.type) ? req.body.type : 'text'
    const content = String(req.body?.content || '').trim().slice(0, 4000)
    if (!content) return res.status(400).json({ error: 'Message is empty' })
    const id = uid()
    db.prepare('INSERT INTO messages (id, chat_id, sender_id, type, content) VALUES (?, ?, ?, ?, ?)').run(id, req.params.id, me, type, content)
    res.json(db.prepare('SELECT * FROM messages WHERE id = ?').get(id))
  } catch (err: any) {
    console.error('[chats] POST /chats/:id/messages error:', err)
    res.status(500).json({ error: err.message || 'Failed to send message' })
  }
})

chatsRouter.post('/chats/:id/messages/:mid/pin', (req, res) => {
  try {
    const me = r(req).userId
    if (!memberOf(req.params.id, me)) return res.status(403).json({ error: 'Not a member of this chat' })
    db.prepare('UPDATE messages SET pinned = ? WHERE id = ? AND chat_id = ?').run(req.body?.pinned ? 1 : 0, req.params.mid, req.params.id)
    res.json({ ok: true })
  } catch (err: any) {
    console.error('[chats] POST /chats/:id/messages/:mid/pin error:', err)
    res.status(500).json({ error: err.message || 'Failed to pin message' })
  }
})
