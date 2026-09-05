import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, fmtDate, inr } from '../api'
import { useAuth } from '../App'
import { Avatar, Spinner, UserLink, useToast } from '../components'

const MODE_LABEL = { bike: '🏍️ Bike Trip', road: '🚗 Road Trip' }
const STATUS_COLOR: Record<string, string> = {
  planning: 'var(--muted)', active: 'var(--brand)', completed: 'var(--muted)', cancelled: 'var(--coral)',
}

// ---- Live location panel ----
function LiveMap({ route, pings, members }: { route: any; pings: any[]; members: any[] }) {
  const mapUrl = () => {
    const wps = route.waypoints?.map((w: any) => encodeURIComponent(w.city)).join('|') || ''
    const from = encodeURIComponent(route.fromCity)
    const to = encodeURIComponent(route.toCity)
    return `https://www.google.com/maps/embed/v1/directions?key=&origin=${from}&destination=${to}&waypoints=${wps}&mode=${route.mode === 'bike' ? 'driving' : 'driving'}`
  }

  const memberById = Object.fromEntries(members.map(m => [m.id, m]))

  return (
    <div className="card">
      <div className="itin-head"><h3>🗺️ Route Map</h3>
        <a href={`https://www.google.com/maps/dir/${encodeURIComponent(route.fromCity)}/${encodeURIComponent(route.toCity)}`}
          target="_blank" rel="noopener noreferrer" className="btn btn-ghost small">Open in Maps ↗</a>
      </div>
      <div className="adv-map-embed">
        <iframe
          title="Route map"
          loading="lazy"
          allowFullScreen
          src={`https://maps.google.com/maps?saddr=${encodeURIComponent(route.fromCity)}&daddr=${encodeURIComponent(route.toCity)}&output=embed`}
          style={{ width: '100%', height: 220, border: 0, borderRadius: 10 }}
        />
      </div>
      {pings.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="overline" style={{ marginBottom: 8 }}>Live members</div>
          {pings.map(p => {
            const m = memberById[p.userId]
            const ago = p.createdAt ? Math.round((Date.now() - Date.parse(p.createdAt)) / 60000) : null
            return (
              <div key={p.userId} className="adv-ping-row">
                <Avatar user={m} size={28} />
                <div className="adv-ping-info">
                  <span className="adv-live-dot" /><strong>{m?.name || 'Rider'}</strong>
                  <span className="muted small">{ago === null || ago < 2 ? 'just now' : `${ago}m ago`}</span>
                  {p.latitude && <span className="muted small">{p.latitude.toFixed(3)}, {p.longitude.toFixed(3)}</span>}
                </div>
                {p.batteryPct != null && (
                  <span className={`adv-battery ${p.batteryPct < 20 ? 'low' : ''}`}>🔋{p.batteryPct}%</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---- Check-in log ----
function CheckinLog({ routeId, isActive, checkins, onCheckin }: { routeId: string; isActive: boolean; checkins: any[]; onCheckin: () => void }) {
  const [form, setForm] = useState({ waypointLabel: '' })
  const [submitting, setSubmitting] = useState(false)
  const [, showToast] = useToast()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.waypointLabel.trim()) return
    setSubmitting(true)
    try {
      // Get current location if available
      let lat: number | undefined, lon: number | undefined
      await new Promise<void>(resolve => {
        if (!navigator.geolocation) return resolve()
        navigator.geolocation.getCurrentPosition(pos => {
          lat = pos.coords.latitude; lon = pos.coords.longitude; resolve()
        }, () => resolve(), { timeout: 5000 })
      })
      await api.post(`/adventures/routes/${routeId}/checkins`, { waypointLabel: form.waypointLabel, latitude: lat, longitude: lon })
      setForm({ waypointLabel: '' })
      onCheckin()
    } catch (err: any) { showToast(err.message) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="card">
      <div className="itin-head"><h3>✅ Check-ins</h3></div>
      {checkins.length === 0 && <p className="muted small">No check-ins yet — post one when you reach a waypoint to let the group know you're safe.</p>}
      <div className="adv-checkin-list">
        {checkins.map(c => (
          <div key={c.id} className="adv-checkin-item">
            <span className="adv-checkin-dot">📍</span>
            <div>
              <strong>{c.waypointLabel}</strong>
              <span className="muted small"> · {c.name} · {new Date(c.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
      </div>
      {isActive && (
        <form onSubmit={submit} className="adv-checkin-form">
          <input placeholder="Where did you just reach? e.g. Rohtang Pass" value={form.waypointLabel}
            onChange={e => setForm(f => ({ ...f, waypointLabel: e.target.value }))} />
          <button className="btn btn-primary small" type="submit" disabled={submitting}>
            {submitting ? '…' : 'I reached safely ✓'}
          </button>
        </form>
      )}
    </div>
  )
}

// ---- SOS panel ----
function SOSPanel({ routeId, route, onSOS }: { routeId: string; route: any; onSOS: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [, showToast] = useToast()

  const sendSOS = async () => {
    setSending(true)
    try {
      let lat: number | undefined, lon: number | undefined
      await new Promise<void>(resolve => {
        navigator.geolocation?.getCurrentPosition(pos => {
          lat = pos.coords.latitude; lon = pos.coords.longitude; resolve()
        }, () => resolve(), { timeout: 3000 })
      })
      const res = await api.post(`/adventures/routes/${routeId}/sos`, { latitude: lat, longitude: lon })
      setResult(res)
      setConfirming(false)
      showToast('🆘 SOS sent — all group members notified')
      onSOS()
    } catch (err: any) { showToast(err.message) }
    finally { setSending(false) }
  }

  return (
    <div className="card adv-sos-card">
      <div className="itin-head"><h3>🆘 Emergency SOS</h3></div>
      <p className="muted small">Sends an emergency alert with your location to all group members and your emergency contact.</p>
      {!confirming && !result && (
        <button className="adv-sos-btn" onClick={() => setConfirming(true)}>Trigger SOS</button>
      )}
      {confirming && (
        <div className="adv-sos-confirm">
          <p><strong>Are you sure?</strong> This will alert everyone in your group.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="adv-sos-btn" disabled={sending} onClick={sendSOS}>{sending ? 'Sending…' : '🆘 Send SOS now'}</button>
            <button className="btn btn-ghost small" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        </div>
      )}
      {result && (
        <div className="adv-sos-result">
          <p>✅ SOS sent. Group members notified.</p>
          {result.emergencyName && result.emergencyPhone && (
            <a href={`tel:${result.emergencyPhone}`} className="btn btn-primary">
              📞 Call {result.emergencyName}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// ---- Carpool requests (road trips, owner view) ----
function CarpoolRequests({ route, requests, onUpdate }: { route: any; requests: any[]; onUpdate: () => void }) {
  const [, showToast] = useToast()
  const pending = requests.filter(r => r.status === 'pending')
  const accepted = requests.filter(r => r.status === 'accepted')

  const respond = async (reqId: string, status: 'accepted' | 'rejected') => {
    try {
      await api.put(`/adventures/routes/${route.id}/carpool/${reqId}`, { status })
      onUpdate()
    } catch (err: any) { showToast(err.message) }
  }

  return (
    <div className="card">
      <div className="itin-head">
        <h3>🚗 Carpool Seats</h3>
        <span className="muted small">{accepted.length}/{route.seatCapacity - 1} filled</span>
      </div>
      {route.seatCost > 0 && <p className="muted small">Cost per seat: {inr(route.seatCost)} (fuel split)</p>}
      {pending.length === 0 && accepted.length === 0 && <p className="muted small">No seat requests yet. Share your route to find co-travellers.</p>}
      {pending.map(req => (
        <div key={req.id} className="adv-carpool-req">
          <span className="adv-carpool-emoji">{req.avatarEmoji || '🧭'}</span>
          <div style={{ flex: 1 }}>
            <strong>{req.name}</strong>
            {req.message && <p className="muted small">"{req.message}"</p>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary small" onClick={() => respond(req.id, 'accepted')}>Accept</button>
            <button className="btn btn-ghost small" onClick={() => respond(req.id, 'rejected')}>Decline</button>
          </div>
        </div>
      ))}
      {accepted.map(req => (
        <div key={req.id} className="adv-carpool-req accepted">
          <span className="adv-carpool-emoji">{req.avatarEmoji || '🧭'}</span>
          <strong>{req.name}</strong>
          <span className="badge badge-ok" style={{ marginLeft: 'auto' }}>Confirmed ✓</span>
        </div>
      ))}
    </div>
  )
}

// ---- Location sharing ----
function LocationSharing({ routeId, isActive }: { routeId: string; isActive: boolean }) {
  const [sharing, setSharing] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [, showToast] = useToast()

  const ping = async () => {
    navigator.geolocation?.getCurrentPosition(async pos => {
      try {
        await api.post(`/adventures/routes/${routeId}/location`, {
          latitude: pos.coords.latitude, longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          batteryPct: (navigator as any).getBattery
            ? Math.round((await (navigator as any).getBattery()).level * 100) : null,
        })
      } catch { /* silent — polling will retry */ }
    })
  }

  const start = () => {
    if (!navigator.geolocation) return showToast('Location not available on this device')
    setSharing(true)
    ping()
    intervalRef.current = setInterval(ping, 60000) // PRD: every 60s
  }

  const stop = () => {
    setSharing(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  if (!isActive) return null
  return (
    <div className="adv-location-bar">
      {sharing ? (
        <>
          <span className="adv-live-dot" />
          <span>Sharing live location (every 60s)</span>
          <button className="btn btn-ghost small" onClick={stop}>Stop</button>
        </>
      ) : (
        <>
          <span>🔒 Location hidden</span>
          <button className="btn btn-secondary small" onClick={start}>Share my location</button>
        </>
      )}
    </div>
  )
}

export default function AdventureRoute() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [rt, setRt] = useState<any>(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [statusSaving, setStatusSaving] = useState(false)
  const [, showToast] = useToast()

  const load = () => api.get(`/adventures/routes/${id}`).then(setRt).catch(() => setError('Route not found or you are not a member.'))
  useEffect(() => { load() }, [id])

  if (error) return <div className="fade-up" style={{ paddingTop: 40, textAlign: 'center' }}><p className="muted">{error}</p><button className="btn btn-ghost" onClick={() => navigate('/adventures')}>← Back</button></div>
  if (!rt) return <Spinner />

  const isOwner = rt.userId === user?.id
  const isActive = rt.status === 'active'
  const isMember = rt.members?.some((m: any) => m.id === user?.id)

  const setStatus = async (status: string) => {
    setStatusSaving(true)
    try {
      await api.put(`/adventures/routes/${id}`, { status })
      load()
    } catch (err: any) { showToast(err.message) }
    finally { setStatusSaving(false) }
  }

  return (
    <div className="fade-up" style={{ paddingTop: 22 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-ghost small" onClick={() => navigate('/adventures')}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0 }}>{rt.title}</h1>
            <span className="adv-route-badge" style={{ fontSize: 13 }}>{rt.mode === 'bike' ? '🏍️ Bike' : '🚗 Road'}</span>
            <span className="badge" style={{ background: STATUS_COLOR[rt.status] ? 'color-mix(in srgb,' + STATUS_COLOR[rt.status] + ' 15%, white)' : undefined }}>
              {rt.status === 'active' && <span className="adv-live-dot" />}{rt.status}
            </span>
          </div>
          <p className="muted" style={{ margin: '4px 0 0' }}>{rt.fromCity} → {rt.toCity}{rt.distanceKm ? ` · ~${rt.distanceKm} km` : ''}</p>
          {rt.startDate && <p className="muted small" style={{ margin: 0 }}>{fmtDate(rt.startDate)}{rt.endDate ? ` – ${fmtDate(rt.endDate)}` : ''}</p>}
        </div>
        {isOwner && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {rt.status === 'planning' && <button className="btn btn-primary small" disabled={statusSaving} onClick={() => setStatus('active')}>{statusSaving ? '…' : '🚀 Start ride'}</button>}
            {rt.status === 'active' && <button className="btn btn-secondary small" disabled={statusSaving} onClick={() => setStatus('completed')}>{statusSaving ? '…' : '🏁 Complete'}</button>}
            <Link to={`/adventures/routes/${id}/companions`} className="btn btn-secondary small">Find companions →</Link>
          </div>
        )}
      </div>

      {/* Notes */}
      {rt.notes && <div className="card" style={{ marginBottom: 16 }}><p style={{ margin: 0 }}>{rt.notes}</p></div>}

      {/* Waypoints */}
      {(rt.waypoints?.length ?? 0) > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="itin-head"><h3>📍 Waypoints</h3></div>
          <div className="adv-waypoints">
            <span className="adv-wp-city start">{rt.fromCity}</span>
            {(rt.waypoints ?? []).map((wp: any, i: number) => (
              <span key={i} className="adv-wp-city mid">→ {wp.city}</span>
            ))}
            <span className="adv-wp-city end">→ {rt.toCity}</span>
          </div>
        </div>
      )}

      {/* Location sharing bar */}
      <LocationSharing routeId={id!} isActive={isActive} />

      {/* Map + pings */}
      <div style={{ marginBottom: 16 }}>
        <LiveMap route={rt} pings={rt.latestPings || []} members={rt.members || []} />
      </div>

      {/* Check-ins */}
      <div style={{ marginBottom: 16 }}>
        <CheckinLog routeId={id!} isActive={isActive} checkins={rt.checkins || []} onCheckin={load} />
      </div>

      {/* Carpool (road, owner only) */}
      {rt.mode === 'road' && isOwner && rt.carpoolRequests && (
        <div style={{ marginBottom: 16 }}>
          <CarpoolRequests route={rt} requests={rt.carpoolRequests} onUpdate={load} />
        </div>
      )}

      {/* Road trip cost info (for non-owners) */}
      {rt.mode === 'road' && !isOwner && rt.seatCost > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <p className="muted small">💰 Cost per seat: <strong>{inr(rt.seatCost)}</strong> (fuel split)</p>
        </div>
      )}

      {/* Members */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="itin-head"><h3>👥 Members ({rt.members?.length || 1})</h3>
          {rt.groupId && <Link to={`/chats/${rt.groupId}`} className="btn btn-ghost small">Group chat →</Link>}
        </div>
        <div className="adv-members-list">
          {(rt.members || []).map((m: any) => (
            <div key={m.id} className="adv-member-row">
              <Avatar user={m} size={32} />
              <UserLink user={m}><strong>{m.name}</strong></UserLink>
              {rt.latestPings?.find((p: any) => p.userId === m.id) && <span className="adv-live-dot" title="Live" />}
            </div>
          ))}
        </div>
      </div>

      {/* Hub link */}
      {rt.groupId && (
        <div className="card" style={{ marginBottom: 16 }}>
          <p className="muted small">💬 This route has a group hub — chat, polls, shared itinerary and more.</p>
          <Link to={`/groups/${rt.groupId}`} className="btn btn-secondary">Open group hub →</Link>
        </div>
      )}

      {/* SOS (active rides only) */}
      {isActive && isMember && (
        <div style={{ marginBottom: 16 }}>
          <SOSPanel routeId={id!} route={rt} onSOS={load} />
        </div>
      )}
    </div>
  )
}
