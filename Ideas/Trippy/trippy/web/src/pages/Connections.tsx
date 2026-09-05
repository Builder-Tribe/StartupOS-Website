import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Avatar, VerifiedBadges, Empty, Spinner, UserLink } from '../components'

export default function Connections() {
  const [data, setData] = useState<any>(null)
  const [busyId, setBusyId] = useState('')
  const [respondError, setRespondError] = useState('')

  const load = () => api.get('/connections').then(setData)
  useEffect(() => { load() }, [])

  if (!data) return <Spinner />

  const respond = async (id: string, accept: boolean) => {
    setBusyId(id)
    setRespondError('')
    try {
      await api.post(`/connections/${id}/respond`, { accept })
      await load()
    } catch (err: any) {
      setRespondError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setBusyId('')
    }
  }

  const withdraw = async (id: string) => {
    setBusyId(id)
    try {
      await api.del(`/connections/${id}`)
      await load()
    } catch { } finally { setBusyId('') }
  }

  const Row = ({ c, actions }: { c: any; actions?: React.ReactNode }) => (
    <div className="card row-card">
      <UserLink user={c.user}><Avatar user={c.user} /></UserLink>
      <div className="row-main">
        <UserLink user={c.user}><strong>{c.user.name}</strong></UserLink>
        <div className="muted small">{c.user.city} · {c.user.personality}</div>
        <VerifiedBadges user={c.user} compact />
      </div>
      <div className="row-actions">{actions}</div>
    </div>
  )

  const total = data.incoming.length + data.outgoing.length + data.accepted.length

  return (
    <div>
      <h1>People</h1>
      {respondError && <p className="error" style={{ marginBottom: 12 }}>{respondError}</p>}
      {total === 0 && <Empty emoji="🤝" title="No requests yet" hint="Find travelers on your dates and send a travel request to connect." action={<Link to="/matches" className="btn btn-primary">Browse matches</Link>} />}

      {data.incoming.length > 0 && (
        <>
          <h3 className="section-title">Incoming ({data.incoming.length})</h3>
          {data.incoming.map((c: any) => (
            <Row key={c.id} c={c} actions={
              <>
                <button className="btn btn-primary small" disabled={busyId === c.id} onClick={() => respond(c.id, true)}>Accept</button>
                <button className="btn btn-ghost small" disabled={busyId === c.id} onClick={() => respond(c.id, false)}>Decline</button>
              </>
            } />
          ))}
        </>
      )}

      {data.accepted.length > 0 && (
        <>
          <h3 className="section-title">Connected ({data.accepted.length})</h3>
          {data.accepted.map((c: any) => (
            <Row key={c.id} c={c} actions={<Link to={`/chats/${c.chatId}`} className="btn btn-secondary small">Chat 💬</Link>} />
          ))}
        </>
      )}

      {data.outgoing.length > 0 && (
        <>
          <h3 className="section-title">Sent ({data.outgoing.length})</h3>
          {data.outgoing.map((c: any) => <Row key={c.id} c={c} actions={<button className="btn btn-ghost small" disabled={busyId === c.id} onClick={() => withdraw(c.id)}>Withdraw</button>} />)}
        </>
      )}
    </div>
  )
}
