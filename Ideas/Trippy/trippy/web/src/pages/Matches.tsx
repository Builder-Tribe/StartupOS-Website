import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, fmtDate } from '../api'
import { Avatar, VerifiedBadges, ScorePill, TrustStars, Empty, Spinner, UserLink } from '../components'

const AGE_RANGES: [string, number, number][] = [['18–25', 18, 25], ['26–35', 26, 35], ['36+', 36, 200]]

export default function Matches() {
  const [data, setData] = useState<any>(null)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  // Secondary filters (PRD 1.2.7) — server-side, so counts stay honest.
  const [filters, setFilters] = useState({ gender: '', budget: '', age: '', verifiedOnly: false })

  const load = () => {
    const q = new URLSearchParams()
    if (filters.gender) q.set('gender', filters.gender)
    if (filters.budget) q.set('budget', filters.budget)
    const range = AGE_RANGES.find(r => r[0] === filters.age)
    if (range) { q.set('ageMin', String(range[1])); q.set('ageMax', String(range[2])) }
    if (filters.verifiedOnly) q.set('verifiedOnly', '1')
    return api.get(`/matches${q.toString() ? '?' + q.toString() : ''}`).then(setData)
  }
  useEffect(() => { load() }, [filters])

  if (!data) return <Spinner />

  if (!data.trip) {
    return <Empty emoji="🗺️" title="Plan a trip first"
      hint="Matching activates once you have an upcoming trip — we find travellers heading to the same place on overlapping dates (±3 days)."
      action={
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/diy" className="btn btn-primary">Plan a trip →</Link>
          <Link to="/profile" className="btn btn-secondary">Update profile</Link>
        </div>
      } />
  }

  const connect = async (userId: string) => {
    setBusyId(userId); setError('')
    try {
      await api.post('/connections', { toUserId: userId })
      await load()
    } catch (err: any) {
      setError(err.message || 'Could not send request')
    } finally {
      setBusyId('')
    }
  }

  const respond = async (connId: string, accept: boolean) => {
    setBusyId(connId); setError('')
    try {
      await api.post(`/connections/${connId}/respond`, { accept })
      await load()
    } catch (err: any) {
      setError(err.message || 'Could not respond to request')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div>
      <h1>Travelers heading to {data.trip?.destination?.replace(/-/g, ' ') ?? 'Anywhere'}</h1>
      <p className="muted">Your dates: {fmtDate(data.trip.start_date)} – {fmtDate(data.trip.end_date)} · showing overlaps within ±3 days · verified profiles first</p>
      {error && <p className="error" style={{ marginBottom: 12 }}>{error}</p>}

      <div className="match-filters">
        <select value={filters.gender} onChange={e => setFilters({ ...filters, gender: e.target.value })}>
          <option value="">Gender: any</option><option value="female">Women</option><option value="male">Men</option><option value="other">Other</option>
        </select>
        <select value={filters.age} onChange={e => setFilters({ ...filters, age: e.target.value })}>
          <option value="">Age: any</option>{AGE_RANGES.map(([l]) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={filters.budget} onChange={e => setFilters({ ...filters, budget: e.target.value })}>
          <option value="">Budget: any</option><option value="budget">Budget</option><option value="mid-range">Mid-range</option><option value="premium">Premium</option>
        </select>
        <button className={`chip ${filters.verifiedOnly ? 'chip-active' : ''}`} onClick={() => setFilters({ ...filters, verifiedOnly: !filters.verifiedOnly })}>
          <i className="ph-fill ph-seal-check" /> Verified only
        </button>
        {(filters.gender || filters.budget || filters.age || filters.verifiedOnly) &&
          <button className="chip" onClick={() => setFilters({ gender: '', budget: '', age: '', verifiedOnly: false })}>Clear ✕</button>}
      </div>

      {data.matches.length === 0 ? (
        <Empty emoji="🔭" title="No travelers found" hint={(filters.gender || filters.budget || filters.age || filters.verifiedOnly) ? 'No one matches these filters — try relaxing them.' : "You're early! Check back closer to your dates, or try flexible dates."} />
      ) : (
        <div className="grid2">
          {data.matches.map((m: any) => (
            <div key={m.user.id} className={`card match-card ${!m.user.idVerified ? 'card-dim' : ''}`}>
              <div className="match-head">
                <UserLink user={m.user}><Avatar user={m.user} size={56} /></UserLink>
                <div className="match-id">
                  <UserLink user={m.user}><strong>{m.user.name}</strong></UserLink>
                  <div className="muted small">{[m.user.age, m.user.city].filter(Boolean).join(' · ')}</div>
                  <VerifiedBadges user={m.user} />
                </div>
                <ScorePill score={m.score} />
              </div>
              <p className="muted small">{[m.user.personality, m.user.travelStyle, m.user.budget].filter(Boolean).join(' · ')}</p>
              {/* Score is never a bare number — always framed with the AI reasoning (UX audit P0) */}
              <div className={`ai-explain ${m.score < 70 ? 'ai-explain-mid' : ''}`}>
                <i className="ph-bold ph-sparkle" />
                <span>{m.reasons.length > 0 ? m.reasons.join('. ') + '.' : 'Heading to the same destination on overlapping dates.'}</span>
              </div>
              <p className="small">🗓️ from {fmtDate(m.trip.startDate)} – {fmtDate(m.trip.endDate)}{m.trip.flexible ? ' (flexible)' : ''}</p>
              <TrustStars user={m.user} />
              <div className="match-actions">
                {!m.connection && (
                  <button className="btn btn-primary" disabled={busyId === m.user.id} onClick={() => connect(m.user.id)}>
                    Send travel request
                  </button>
                )}
                {m.connection?.status === 'pending' && m.connection.direction === 'outgoing' && <span className="badge">Request sent ✓</span>}
                {m.connection?.status === 'pending' && m.connection.direction === 'incoming' && (
                  <>
                    <button className="btn btn-primary" disabled={busyId === m.connection.id} onClick={() => respond(m.connection.id, true)}>Accept request</button>
                    <button className="btn btn-ghost" onClick={() => respond(m.connection.id, false)}>Decline</button>
                  </>
                )}
                {m.connection?.status === 'accepted' && (
                  m.connection.chatId
                    ? <Link className="btn btn-secondary" to={`/chats/${m.connection.chatId}`}>Open chat 💬</Link>
                    : <span className="muted small">Chat starting…</span>
                )}
                {m.connection?.status === 'declined' && <span className="muted small">Request declined</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
