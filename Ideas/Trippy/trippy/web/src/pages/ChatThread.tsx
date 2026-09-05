import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, fmtDate, parseDbDate } from '../api'
import { useAuth } from '../App'
import { Avatar, Spinner } from '../components'

export default function ChatThread() {
  const { id } = useParams()
  const { user } = useAuth()
  const [chat, setChat] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const firstLoad = useRef(true)

  // Poll for new messages every 3s (Supabase Realtime replaces this later)
  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const data = await api.get(`/chats/${id}`)
        if (alive) {
          setChat(data)
          setError(null)
        }
      } catch (err: any) {
        if (alive) {
          setError(err?.message || 'Chat unavailable or access denied')
        }
      }
    }
    load()
    const iv = setInterval(load, 3000)
    return () => { alive = false; clearInterval(iv) }
  }, [id])

  useEffect(() => {
    if (chat && firstLoad.current) {
      bottomRef.current?.scrollIntoView()
      firstLoad.current = false
    } else if (chat) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chat?.messages?.length])

  if (error && !chat) {
    return (
      <div className="page-center">
        <div className="card text-center" style={{ maxWidth: 400, padding: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
          <h3>Chat Unavailable</h3>
          <p className="muted" style={{ marginBottom: 20 }}>{error}</p>
          <Link to="/chats" className="btn btn-primary">Back to Chats</Link>
        </div>
      </div>
    )
  }

  if (!chat) return <Spinner />

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || sending) return
    const content = text
    setText('')
    setSendError('')
    setSending(true)
    try {
      await api.post(`/chats/${id}/messages`, { type: 'text', content })
      setChat(await api.get(`/chats/${id}`))
    } catch {
      setText(content)
      setSendError('Message failed to send. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const togglePin = async (m: any) => {
    await api.post(`/chats/${id}/messages/${m.id}/pin`, { pinned: !m.pinned })
    setChat(await api.get(`/chats/${id}`))
  }

  // Location pin (PRD 1.4.4): browser geolocation if granted, else a typed place name.
  const shareLocation = async () => {
    const send = async (payload: any) => {
      await api.post(`/chats/${id}/messages`, { type: 'location', content: JSON.stringify(payload) })
      setChat(await api.get(`/chats/${id}`))
    }
    const fallback = () => {
      const place = prompt('Share a place (e.g. "Zostel Old Manali" or "Kasol bus stand"):')
      if (place?.trim()) send({ name: place.trim() })
    }
    if (!navigator.geolocation) return fallback()
    navigator.geolocation.getCurrentPosition(
      pos => send({ lat: +pos.coords.latitude.toFixed(5), lng: +pos.coords.longitude.toFixed(5), name: 'My current location' }),
      fallback, { timeout: 4000 },
    )
  }

  const vote = async (pollId: string, option: number) => {
    if (!chat?.groupId) return
    await api.post(`/groups/${chat.groupId}/polls/${pollId}/vote`, { option })
    setChat(await api.get(`/chats/${id}`))
  }

  const other = chat.type === 'dm' ? chat.members.find((m: any) => m.id !== user.id) : null

  return (
    <div className="chat-page">
      <div className="chat-header card">
        {other
          ? <Link to={`/users/${other.id}`} className="plain-link chat-title"><Avatar user={other} size={36} /> <strong>{chat.name}</strong></Link>
          : <span className="chat-title">👥 <strong>{chat.name}</strong> <span className="muted small">{chat.members.length} members</span></span>}
        {chat.groupId && <Link className="btn btn-secondary small" to={`/groups/${chat.groupId}`}>Trip page</Link>}
      </div>

      {chat.pinnedMessages.length > 0 && (
        <div className="pinned-bar">
          📌 {chat.pinnedMessages.map((p: any) => <span key={p.id} className="pinned-item">{p.content}</span>)}
        </div>
      )}

      <div className="messages">
        {chat.messages.map((m: any) => {
          if (m.type === 'system') return <div key={m.id} className="msg-system">{m.content}</div>
          if (m.type === 'announcement') {
            const who = chat.members.find((mem: any) => mem.id === m.sender_id)
            return <div key={m.id} className="msg-announce">📣 <strong>{who?.name || 'Trip leader'}:</strong> {m.content}</div>
          }
          const mine = m.sender_id === user.id
          const sender = chat.members.find((mem: any) => mem.id === m.sender_id)
          if (m.type === 'poll') {
            const p = chat.polls?.[m.content]
            if (!p) return null
            return (
              <div key={m.id} className={`msg ${mine ? 'msg-mine' : ''}`}>
                {!mine && <div className="msg-sender">{sender?.name || 'Traveler'} started a poll</div>}
                <div className="msg-poll">
                  <div className="msg-poll-q">🗳️ {p.question}{p.closed && <span className="tiny faint"> · closed</span>}</div>
                  {p.options.map((o: any, i: number) => {
                    const pct = p.totalVotes ? Math.round(o.votes / p.totalVotes * 100) : 0
                    return (
                      <button key={i} className={`poll-opt ${p.myVote === i ? 'mine' : ''}`} disabled={p.closed} onClick={() => vote(p.id, i)}>
                        <span className="poll-bar" style={{ width: `${pct}%` }} />
                        <span className="poll-label">{p.myVote === i ? '● ' : ''}{o.label}</span>
                        <span className="poll-count">{o.votes}</span>
                      </button>
                    )
                  })}
                  <span className="tiny faint">{p.totalVotes} vote{p.totalVotes === 1 ? '' : 's'} · tap to vote</span>
                </div>
                <div className="msg-time">{fmtDate(m.created_at)} {parseDbDate(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            )
          }
          if (m.type === 'location') {
            let loc: any = {}
            try { loc = JSON.parse(m.content) } catch { loc = { name: m.content } }
            const mapsUrl = loc.lat != null ? `https://www.google.com/maps?q=${loc.lat},${loc.lng}` : `https://www.google.com/maps?q=${encodeURIComponent(loc.name || '')}`
            return (
              <div key={m.id} className={`msg ${mine ? 'msg-mine' : ''}`}>
                {!mine && chat.type === 'group' && <div className="msg-sender">{sender?.name || 'Traveler'}</div>}
                <a className="msg-location" href={mapsUrl} target="_blank" rel="noreferrer">
                  <i className="ph-fill ph-map-pin" />
                  <span>
                    <strong>{loc.name || 'Shared location'}</strong>
                    <span className="tiny">{loc.lat != null ? `${loc.lat}, ${loc.lng} · ` : ''}Open in Maps ↗</span>
                  </span>
                </a>
                <div className="msg-time">{fmtDate(m.created_at)} {parseDbDate(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            )
          }
          return (
            <div key={m.id} className={`msg ${mine ? 'msg-mine' : ''}`}>
              {!mine && chat.type === 'group' && <div className="msg-sender">{sender?.name || 'Traveler'}</div>}
              <div className="msg-bubble" onDoubleClick={() => togglePin(m)} title="Double-click to pin/unpin">
                {m.content}
                {!!m.pinned && ' 📌'}
              </div>
              <div className="msg-time">{fmtDate(m.created_at)} {parseDbDate(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {sendError && <p className="error small" style={{ margin: '4px 0 0', padding: '0 12px' }}>{sendError}</p>}
      <form className="chat-compose-bar" onSubmit={send}>
        <button type="button" className="chat-attach" title="Share a location" onClick={shareLocation}><i className="ph-bold ph-map-pin" /></button>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message…" autoFocus />
        <button className="btn btn-primary" disabled={!text.trim() || sending}>{sending ? '…' : 'Send'}</button>
      </form>
      <p className="tiny muted center">Stay safe: keep personal contact details private until you both agree. Double-click any message to pin it.</p>
    </div>
  )
}
