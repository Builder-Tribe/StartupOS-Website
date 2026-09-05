import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, fmtDate } from '../api'
import { Spinner, Empty, useToast } from '../components'

const MODE_META = {
  bike: { emoji: '🏍️', label: 'Bike Trip', color: 'var(--brand)', bg: 'var(--brand-soft)' },
  road: { emoji: '🚗', label: 'Road Trip', color: 'var(--coral)', bg: 'var(--coral-soft)' },
}

const STATUS_BADGE: Record<string, string> = {
  planning: 'badge-muted',
  active: 'badge-ok adv-live-dot-wrap',
  completed: 'badge-muted',
  cancelled: 'badge-warn',
}

function RouteCard({ rt, onDelete }: { rt: any; onDelete: (id: string) => void }) {
  const meta = MODE_META[rt.mode as 'bike' | 'road'] || MODE_META.bike
  return (
    <div className="adv-route-card">
      <Link to={`/adventures/routes/${rt.id}`} className="plain-link adv-route-link">
        <span className="adv-route-badge" style={{ background: meta.bg, color: meta.color }}>{meta.emoji} {meta.label}</span>
        <div className="adv-route-main">
          <strong>{rt.title}</strong>
          <span className="muted small">{rt.fromCity} → {rt.toCity}{rt.distanceKm ? ` · ~${rt.distanceKm} km` : ''}</span>
          {rt.startDate && <span className="muted small">{fmtDate(rt.startDate)}{rt.endDate ? ` – ${fmtDate(rt.endDate)}` : ''}</span>}
        </div>
        <div className="adv-route-right">
          <span className={`badge ${STATUS_BADGE[rt.status] || 'badge-muted'}`}>
            {rt.status === 'active' && <span className="adv-live-dot" />}
            {rt.status}
          </span>
          {rt.mode === 'road' && rt.seatCapacity > 1 && (
            <span className="adv-seat-pill">{rt.seatCapacity - 1} seat{rt.seatCapacity - 1 !== 1 ? 's' : ''} open</span>
          )}
        </div>
      </Link>
      {rt.status !== 'active' && rt.status !== 'completed' && (
        <button className="adv-route-delete btn-ghost small muted" title="Cancel route" onClick={() => onDelete(rt.id)}>×</button>
      )}
    </div>
  )
}

export default function Adventures() {
  const navigate = useNavigate()
  const [routes, setRoutes] = useState<any[] | null>(null)
  const [bikeProfile, setBikeProfile] = useState<any>(null)
  const [carProfile, setCarProfile] = useState<any>(null)
  const [creating, setCreating] = useState(false)
  const [mode, setMode] = useState<'bike' | 'road'>('bike')
  const [form, setForm] = useState({ title: '', fromCity: '', toCity: '', startDate: '', endDate: '', distanceKm: '', seatCapacity: '1', seatCost: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [toast, showToast] = useToast()

  const load = () => {
    api.get('/adventures/routes').then(setRoutes).catch(() => setRoutes([]))
    api.get('/adventures/bike/profile').then(setBikeProfile).catch(() => {})
    api.get('/adventures/car/profile').then(setCarProfile).catch(() => {})
  }
  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.fromCity || !form.toCity) return showToast('Title, from and to city are required')
    setSaving(true)
    try {
      const rt = await api.post('/adventures/routes', {
        ...form,
        mode,
        distanceKm: form.distanceKm ? Number(form.distanceKm) : undefined,
        seatCapacity: Number(form.seatCapacity) || 1,
        seatCost: form.seatCost ? Number(form.seatCost) : 0,
      })
      navigate(`/adventures/routes/${rt.id}`)
    } catch (err: any) { showToast(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Cancel this route? This cannot be undone.')) return
    try {
      await api.del(`/adventures/routes/${id}`)
      load()
    } catch (err: any) {
      showToast(err.message || 'Failed to delete route')
    }
  }

  const upcoming = (routes || []).filter(rt => rt.status !== 'completed' && rt.status !== 'cancelled')
  const past = (routes || []).filter(rt => rt.status === 'completed' || rt.status === 'cancelled')

  return (
    <div className="fade-up" style={{ paddingTop: 22 }}>
      {toast}
      <div className="results-head">
        <h1>🏍️ Adventures</h1>
        <p className="results-sub">Plan bike expeditions and road trips — find companions, share live location, and stay safe together.</p>
      </div>

      {/* Mode selector cards */}
      {!creating && (
        <div className="adv-mode-grid">
          <div className="adv-mode-card adv-mode-bike" onClick={() => { setMode('bike'); setCreating(true) }}>
            <span className="adv-mode-emoji">🏍️</span>
            <div>
              <strong>Plan a Bike Trip</strong>
              <p>Routes, companions, live safety tracking</p>
            </div>
            {bikeProfile ? (
              <span className="badge badge-ok adv-profile-badge">Profile set ✓</span>
            ) : (
              <Link to="/adventures/bike/profile" className="btn btn-secondary small" onClick={e => e.stopPropagation()}>Set up profile first</Link>
            )}
          </div>
          <div className="adv-mode-card adv-mode-road" onClick={() => { setMode('road'); setCreating(true) }}>
            <span className="adv-mode-emoji">🚗</span>
            <div>
              <strong>Plan a Road Trip</strong>
              <p>Carpool seats, cost splitting, companions</p>
            </div>
            {carProfile ? (
              <span className="badge badge-ok adv-profile-badge">Profile set ✓</span>
            ) : (
              <Link to="/adventures/car/profile" className="btn btn-secondary small" onClick={e => e.stopPropagation()}>Set up profile first</Link>
            )}
          </div>
        </div>
      )}

      {/* Carpool search entry */}
      {!creating && (
        <div className="adv-carpool-banner">
          <span>🚗 Looking for carpool seats?</span>
          <Link to="/adventures/carpool" className="btn btn-secondary small">Search road trips with open seats →</Link>
        </div>
      )}

      {/* Create route form */}
      {creating && (
        <div className="card adv-create-form fade-up">
          <div className="itin-head">
            <h3>{mode === 'bike' ? '🏍️ New Bike Trip' : '🚗 New Road Trip'}</h3>
            <button className="btn btn-ghost small" onClick={() => setCreating(false)}>Cancel</button>
          </div>
          <div className="adv-mode-toggle">
            <button className={`adv-mode-tab ${mode === 'bike' ? 'active bike' : ''}`} onClick={() => setMode('bike')}>🏍️ Bike</button>
            <button className={`adv-mode-tab ${mode === 'road' ? 'active road' : ''}`} onClick={() => setMode('road')}>🚗 Road</button>
          </div>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Route name *</label>
              <input placeholder="e.g. Manali → Leh via Rohtang" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="row2">
              <div><label>From city *</label><input placeholder="Delhi" value={form.fromCity} onChange={e => setForm(f => ({ ...f, fromCity: e.target.value }))} required /></div>
              <div><label>To city *</label><input placeholder="Leh" value={form.toCity} onChange={e => setForm(f => ({ ...f, toCity: e.target.value }))} required /></div>
            </div>
            <div className="row2">
              <div><label>Start date</label><input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
              <div><label>End date</label><input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            </div>
            <div>
              <label>Estimated distance (km)</label>
              <input type="number" placeholder="e.g. 480" value={form.distanceKm} onChange={e => setForm(f => ({ ...f, distanceKm: e.target.value }))} />
            </div>
            {mode === 'road' && (
              <div className="row2">
                <div><label>Available seats (incl. yours)</label>
                  <select value={form.seatCapacity} onChange={e => setForm(f => ({ ...f, seatCapacity: e.target.value }))}>
                    {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div><label>Per-seat cost share (₹)</label>
                  <input type="number" placeholder="e.g. 2000" value={form.seatCost} onChange={e => setForm(f => ({ ...f, seatCost: e.target.value }))} />
                </div>
              </div>
            )}
            <div>
              <label>Notes</label>
              <textarea placeholder="Route details, gear required, experience level needed…" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Creating…' : `Plan this ${mode === 'bike' ? 'ride' : 'road trip'} →`}</button>
          </form>
        </div>
      )}

      {/* Routes list */}
      {routes === null && <Spinner />}
      {routes !== null && !creating && upcoming.length === 0 && past.length === 0 && (
        <Empty emoji="🗺️" title="No adventures yet"
          hint="Create your first bike ride or road trip above — invite companions and ride together."
          action={null} />
      )}
      {upcoming.length > 0 && (
        <div className="mytrip-section">
          <div className="overline">Upcoming & active</div>
          {upcoming.map(rt => <RouteCard key={rt.id} rt={rt} onDelete={handleDelete} />)}
        </div>
      )}
      {past.length > 0 && (
        <div className="mytrip-section">
          <div className="overline">Past rides</div>
          {past.map(rt => <RouteCard key={rt.id} rt={rt} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  )
}
