import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, fmtDate, inr } from '../api'
import { useAuth } from '../App'
import { Avatar, Spinner, UserLink, VerifiedBadges } from '../components'
import ReviewSection from '../ReviewSection'

export default function HostelDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [h, setH] = useState<any>(null)
  const [form, setForm] = useState({ startDate: '', endDate: '', visible: false })
  const [error, setError] = useState('')

  const load = () => api.get(`/hostels/${id}`).then(setH)
  useEffect(() => { load() }, [id])

  if (!h) return <Spinner />

  const logStay = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await api.post(`/hostels/${id}/stay`, form)
      await load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const removeStay = async () => {
    await api.del(`/stays/${h.myStay.id}`)
    await load()
  }

  const toggleVisibility = async () => {
    await api.put(`/stays/${h.myStay.id}/visibility`, { visible: !h.myStay.visible })
    await load()
  }

  return (
    <div>
      <h1>{h.name}</h1>
      <p className="muted">{h.area} · {h.destination.replace(/-/g, ' ')} · ⭐ {h.rating} ({h.reviewCount} reviews)</p>
      <div className="card">
        <p>{h.description}</p>
        <div className="chips">
          {h.vibeTags.map((t: string) => <span key={t} className="chip chip-mini">{t}</span>)}
          {h.amenities.map((a: string) => <span key={a} className="chip chip-mini chip-alt">{a}</span>)}
        </div>
        <div className="hostel-cta">
          <div className="hostel-price big">{inr(h.pricePerNight)}<span className="tiny muted">/night</span></div>
          <a className="btn btn-primary" href={h.bookingUrl} target="_blank" rel="noreferrer">
            {h.partner ? 'Book direct (partner)' : 'Book via partner site ↗'}
          </a>
        </div>
      </div>

      <div className="card">
        <h3>Your stay</h3>
        {!user ? (
          <p className="muted">
            <Link to="/login?mode=signup" className="a-link" style={{ fontWeight: 700 }}>Join Trippy</Link> to log your stay and meet the other travellers checking in here.
          </p>
        ) : h.myStay ? (
          <div>
            <p>🛏️ Logged: {fmtDate(h.myStay.start_date)} – {fmtDate(h.myStay.end_date)}</p>
            <label className="check">
              <input type="checkbox" checked={!!h.myStay.visible} onChange={toggleVisibility} />
              Visible to other members ({h.myStay.visible ? 'on' : 'off — private by default'})
            </label>
            <button className="btn btn-ghost small" onClick={removeStay}>Remove stay</button>
          </div>
        ) : (
          <form onSubmit={logStay} className="trip-form">
            <input type="date" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            <input type="date" required min={form.startDate} value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            <label className="check">
              <input type="checkbox" checked={form.visible} onChange={e => setForm({ ...form, visible: e.target.checked })} />
              Let other Trippy members see I'm staying here
            </label>
            <button className="btn btn-primary">Log my stay</button>
          </form>
        )}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="card">
        <h3>🧭 Members staying here ({user ? h.members.length : h.memberCount})</h3>
        {!user && h.memberCount > 0 && <p className="muted">Sign in to see who's staying and match with them.</p>}
        {user && h.members.length === 0
          ? <p className="muted">No visible members right now. Members who log a stay can choose to appear here.</p>
          : h.members.map((m: any) => (
            <div key={m.id} className="row-card inner">
              <UserLink user={m}><Avatar user={m} /></UserLink>
              <div className="row-main">
                <UserLink user={m}><strong>{m.name}</strong></UserLink>
                <div className="muted small">{fmtDate(m.stay.startDate)} – {fmtDate(m.stay.endDate)} · {m.personality}</div>
              </div>
              <VerifiedBadges user={m} compact />
            </div>
          ))}
      </div>

      <div className="card">
        <h3>Reviews from the tribe</h3>
        {h.reviews.map((rv: any) => (
          <div key={rv.id} className="review">
            <Avatar user={{ avatarColor: rv.avatarColor, avatarEmoji: rv.avatarEmoji }} size={32} />
            <div>
              <strong className="small">{rv.userName || 'Traveler'}</strong> <span className="small">{'⭐'.repeat(rv.rating)}</span>
              <p className="small muted">{rv.text}</p>
            </div>
          </div>
        ))}
        <ReviewSection targetType="hostel" targetId={h.id} canReview={!!user} />
      </div>
    </div>
  )
}
