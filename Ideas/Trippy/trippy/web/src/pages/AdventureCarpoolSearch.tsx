import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, fmtDate, inr } from '../api'
import { Spinner, useToast } from '../components'

export default function AdventureCarpoolSearch() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ from: '', to: '', date: '' })
  const [results, setResults] = useState<any[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [requesting, setRequesting] = useState<Record<string, boolean>>({})
  const [reqMsg, setReqMsg] = useState<Record<string, string>>({})
  const [reqOpen, setReqOpen] = useState<string | null>(null)
  const [toast, showToast] = useToast()

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    try {
      const params = new URLSearchParams({ mode: 'road' })
      if (form.from) params.set('from', form.from)
      if (form.to) params.set('to', form.to)
      if (form.date) params.set('date', form.date)
      const data = await api.get(`/adventures/routes?${params}`)
      setResults(data)
    } catch (err: any) { showToast(err.message) }
    finally { setSearching(false) }
  }

  const requestSeat = async (routeId: string) => {
    setRequesting(r => ({ ...r, [routeId]: true }))
    try {
      await api.post(`/adventures/routes/${routeId}/carpool/request`, { message: reqMsg[routeId] || '' })
      showToast('Seat request sent ✓')
      setReqOpen(null)
      setResults(r => r ? r.map(rt => rt.id === routeId ? { ...rt, _requested: true } : rt) : r)
    } catch (err: any) { showToast(err.message) }
    finally { setRequesting(r => ({ ...r, [routeId]: false })) }
  }

  return (
    <div className="fade-up" style={{ paddingTop: 22 }}>
      {toast}
      <button className="btn btn-ghost small" style={{ marginBottom: 16 }} onClick={() => navigate('/adventures')}>← Adventures</button>

      <div className="results-head">
        <h1>🚗 Find carpool seats</h1>
        <p className="results-sub">Browse road trips with open seats — filter by city and date to find your co-travellers.</p>
      </div>

      <form onSubmit={search} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
        <div className="row2">
          <div><label>From city</label><input placeholder="Delhi" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} /></div>
          <div><label>To city</label><input placeholder="Manali" value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))} /></div>
        </div>
        <div>
          <label>Departure date (approximate)</label>
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={searching}>
          {searching ? 'Searching…' : '🔍 Search road trips'}
        </button>
      </form>

      {results === null && !searching && (
        <p className="muted" style={{ textAlign: 'center' }}>Enter a city pair above to search available carpool seats.</p>
      )}
      {searching && <Spinner />}

      {results !== null && results.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
          <p style={{ fontSize: 32 }}>🔍</p>
          <p><strong>No matches found</strong></p>
          <p className="muted small">Try different cities or dates, or <Link to="/adventures">create your own road trip</Link> and find companions.</p>
        </div>
      )}

      {results && results.map(rt => {
        const seatsLeft = rt.seatCapacity - 1 - (rt.acceptedSeats || 0)
        return (
          <div key={rt.id} className="card adv-carpool-result">
            <div className="adv-carpool-result-header">
              <span className="adv-carpool-owner-emoji">{rt.ownerAvatarEmoji || '🧭'}</span>
              <div style={{ flex: 1 }}>
                <strong>{rt.title}</strong>
                <p className="muted small">{rt.fromCity} → {rt.toCity}{rt.distanceKm ? ` · ~${rt.distanceKm} km` : ''}</p>
                {rt.startDate && <p className="muted small">{fmtDate(rt.startDate)}{rt.endDate ? ` – ${fmtDate(rt.endDate)}` : ''}</p>}
                <p className="muted small">by {rt.ownerName}</p>
              </div>
              <div className="adv-carpool-seats">
                <span className="adv-seat-pill">{seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} left</span>
                {rt.seatCost > 0 && <span className="muted small">{inr(rt.seatCost)}/seat</span>}
              </div>
            </div>
            {rt.notes && <p className="muted small" style={{ marginTop: 8 }}>"{rt.notes}"</p>}

            {rt._requested ? (
              <span className="badge badge-ok" style={{ marginTop: 10 }}>Request sent ✓</span>
            ) : reqOpen === rt.id ? (
              <div className="adv-carpool-req-form">
                <textarea placeholder="Optional message to the driver…" rows={2}
                  value={reqMsg[rt.id] || ''} onChange={e => setReqMsg(m => ({ ...m, [rt.id]: e.target.value }))} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary small" disabled={requesting[rt.id]} onClick={() => requestSeat(rt.id)}>
                    {requesting[rt.id] ? 'Sending…' : 'Send request'}
                  </button>
                  <button className="btn btn-ghost small" onClick={() => setReqOpen(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="btn btn-secondary small" style={{ marginTop: 10 }} onClick={() => setReqOpen(rt.id)}>
                Request a seat →
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
