import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Avatar, Empty, Spinner } from '../components'

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts + (ts.includes('Z') ? '' : 'Z')).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  if (hrs < 48) return 'Yesterday'
  return `${Math.floor(hrs / 24)}d`
}

export default function Chats() {
  const [chats, setChats] = useState<any[] | null>(null)

  useEffect(() => {
    api.get('/chats').then(setChats).catch(() => setChats([]))
  }, [])

  if (!chats) return <Spinner />

  return (
    <div>
      <h1>Chats</h1>
      {chats.length === 0 ? (
        <Empty emoji="💬" title="No chats yet" hint="Chats unlock when you and another traveler both accept a connection — or when you create a trip group." action={<Link to="/matches" className="btn btn-primary">Find travelers</Link>} />
      ) : (
        chats.map(c => (
          <Link key={c.id} to={`/chats/${c.id}`} className="card row-card plain-link">
            {c.type === 'dm'
              ? <Avatar user={{ avatarColor: c.avatarColor, avatarEmoji: c.avatarEmoji }} />
              : <div className="avatar" style={{ width: 44, height: 44, fontSize: 22, background: '#334155' }}>👥</div>}
            <div className="row-main">
              <strong>{c.name || (c.type === 'group' ? 'Trip group' : 'Traveller')}</strong>
              <div className="muted small ellipsis">
                {c.lastMessage ? `${c.lastMessage.mine ? 'You: ' : ''}${c.lastMessage.content}` : 'Say hi!'}
              </div>
            </div>
            <div className="chat-meta">
              {c.lastMessage?.createdAt && <span className="chat-time">{timeAgo(c.lastMessage.createdAt)}</span>}
              {c.type === 'group' && <span className="badge">{c.members?.length ?? 0}</span>}
            </div>
          </Link>
        ))
      )}
    </div>
  )
}
