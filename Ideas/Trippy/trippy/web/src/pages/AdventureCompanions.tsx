import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, fmtDate } from '../api'
import { Avatar, ScorePill, Spinner, UserLink, useToast } from '../components'

const EXP_LABEL: Record<string, string> = {
  beginner: '🌱 Beginner', intermediate: '🔥 Intermediate', expert: '⚡ Expert',
}

export default function AdventureCompanions() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [route, setRoute] = useState<any>(null)
  const [companions, setCompanions] = useState<any[] | null>(null)
  const [inviting, setInviting] = useState<Record<string, boolean>>({})
  const [toast, showToast] = useToast()

  useEffect(() => {
    api.get(`/adventures/routes/${id}`).then(setRoute).catch(() => navigate('/adventures'))
    api.get(`/adventures/routes/${id}/companions`).then(setCompanions).catch(() => setCompanions([]))
  }, [id])

  const invite = async (userId: string) => {
    setInviting(i => ({ ...i, [userId]: true }))
    try {
      // Use existing connections flow — send a travel request
      await api.post('/connections/request', { toUserId: userId, message: `Hey! I saw we're both planning a ${route?.mode === 'bike' ? 'bike ride' : 'road trip'} on a similar route — "${route?.title}". Want to ride together?` })
      showToast('Connection request sent ✓')
    } catch (err: any) { showToast(err.message || 'Could not send request') }
    finally { setInviting(i => ({ ...i, [userId]: false })) }
  }

  if (!route) return <Spinner />

  return (
    <div className="fade-up" style={{ paddingTop: 22 }}>
      {toast}
      <button className="btn btn-ghost small" style={{ marginBottom: 16 }} onClick={() => navigate(`/adventures/routes/${id}`)}>← Route hub</button>

      <div className="results-head">
        <h1>👥 Find companions</h1>
        <p className="results-sub">
          {route.mode === 'bike' ? 'Bikers' : 'Road trippers'} planning a similar route — <strong>{route.fromCity} → {route.toCity}</strong>
          {route.startDate ? ` around ${fmtDate(route.startDate)}` : ''}.
        </p>
      </div>

      {companions === null && <Spinner />}
      {companions !== null && companions.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
          <p style={{ fontSize: 32 }}>🔍</p>
          <p><strong>No matches yet</strong></p>
          <p className="muted small">No other {route.mode === 'bike' ? 'bikers' : 'road trippers'} with overlapping routes found right now. Check back closer to your start date, or share your route to attract co-travellers.</p>
        </div>
      )}

      {companions !== null && companions.length > 0 && companions.map(c => (
        <div key={c.user.id} className="card adv-companion-card">
          <div className="adv-companion-header">
            <Avatar user={c.user} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <UserLink user={c.user}><strong>{c.user.name}</strong></UserLink>
                <ScorePill score={c.compatibility} />
              </div>
              <p className="muted small" style={{ margin: '2px 0' }}>
                {c.user.city && `${c.user.city} · `}{c.user.travelStyle && `${c.user.travelStyle} traveller`}
              </p>
              {c.reasons?.length > 0 && (
                <p className="ai-explain small" style={{ margin: '4px 0 0' }}>
                  ✨ {c.reasons.slice(0, 2).join(' · ')}
                </p>
              )}
            </div>
          </div>

          {/* Their route */}
          <div className="adv-companion-route">
            <span className="muted small">
              📍 {c.route.fromCity} → {c.route.toCity}
              {c.route.startDate ? ` · ${fmtDate(c.route.startDate)}` : ''}
              {c.route.distanceKm ? ` · ~${c.route.distanceKm} km` : ''}
            </span>
          </div>

          {/* Bike/car profile */}
          {c.bikeProfile && (
            <div className="adv-companion-vehicle">
              🏍️ <strong>{c.bikeProfile.vehicleType}</strong>
              {c.bikeProfile.engineCc && ` ${c.bikeProfile.engineCc}cc`}
              {' · '}{EXP_LABEL[c.bikeProfile.experienceLevel] || c.bikeProfile.experienceLevel}
              {c.bikeProfile.bio && <span className="muted small"> · "{c.bikeProfile.bio}"</span>}
            </div>
          )}
          {c.carProfile && (
            <div className="adv-companion-vehicle">
              🚗 <strong>{c.carProfile.vehicleType}</strong> · {c.carProfile.seatingCapacity} seats{c.carProfile.ac ? ' · ❄️ AC' : ''}
              {c.carProfile.routeBio && <span className="muted small"> · "{c.carProfile.routeBio}"</span>}
            </div>
          )}

          <button
            className="btn btn-primary small"
            disabled={inviting[c.user.id]}
            onClick={() => invite(c.user.id)}
          >
            {inviting[c.user.id] ? 'Sending…' : '✉️ Send ride request'}
          </button>
        </div>
      ))}
    </div>
  )
}
