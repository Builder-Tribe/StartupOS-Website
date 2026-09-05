import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, fmtDate } from '../api'
import { Spinner, Empty } from '../components'

const SOURCE_META: Record<string, { icon: string; cls: string }> = {
  partner: { icon: 'ph-fill ph-sparkle', cls: 'hosted' },
  operator: { icon: 'ph-bold ph-bus', cls: 'operator' },
  diy: { icon: 'ph-bold ph-path', cls: 'diy' },
  adventure: { icon: 'ph-bold ph-motorcycle', cls: 'adventure' },
}

function TripCard({ t, destinations }: { t: any; destinations: any[] }) {
  const meta = SOURCE_META[t.sourceType] || SOURCE_META.diy
  const dest = destinations.find(d => d.slug === t.destination)
  const content = (
    <>
      <div className={`mytrip-icon ${meta.cls}`}><i className={meta.icon} /></div>
      <div className="mytrip-main">
        <strong>{t.name}</strong>
        <span className="muted small">
          {dest ? `${dest.emoji} ${dest.name}` : (t.destination?.replace(/-/g, ' ') ?? '')}{t.startDate ? ` · ${fmtDate(t.startDate)}${t.endDate ? ` – ${fmtDate(t.endDate)}` : ''}` : <span className="faint" title="Set dates inside the hub"> · dates not set</span>}
        </span>
        <span className="mytrip-sub">
          {t.sourceLabel} · {t.memberCount} traveller{t.memberCount === 1 ? '' : 's'}{t.role === 'leader' ? ' · you lead' : ''}
          {t.bookingStatus === 'confirmed' && <span className="badge badge-ok" style={{ marginLeft: 6 }}>Booked ✓</span>}
          {t.bookingStatus === 'claimed' && <span className="badge badge-warn" style={{ marginLeft: 6 }}>Booking pending</span>}
        </span>
      </div>
      <i className="ph-bold ph-caret-right mytrip-caret" />
    </>
  )
  if (!t.id) return <div className={`mytrip-card ${t.past ? 'past' : ''}`}>{content}</div>
  return (
    <Link to={`/groups/${t.id}`} className={`mytrip-card plain-link ${t.past ? 'past' : ''}`}>
      {content}
    </Link>
  )
}

export default function MyTrips() {
  const [trips, setTrips] = useState<any[] | null>(null)
  const [destinations, setDestinations] = useState<any[]>([])
  useEffect(() => {
    api.get('/mytrips').then(setTrips).catch(() => setTrips([]))
    api.get('/destinations').then(setDestinations).catch(() => {})
  }, [])
  if (!trips) return <Spinner />

  const upcoming = trips.filter(t => !t.past)
  const past = trips.filter(t => t.past)

  return (
    <div className="fade-up" style={{ paddingTop: 22 }}>
      <div className="results-head">
        <h1>🧳 My trips</h1>
        <p className="results-sub">Every trip you've joined or built — each with its own hub: chat, people, itinerary, polls.</p>
      </div>

      {trips.length === 0 && (
        <Empty emoji="🗺️" title="No trips yet"
          hint="Join a hosted trip, hop on a group departure, or build your own — it lands here."
          action={<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}><Link to="/" className="btn btn-primary">Find a trip →</Link><Link to="/diy" className="btn btn-secondary">Build your own</Link></div>} />
      )}

      {upcoming.length > 0 && (
        <div className="mytrip-section">
          <div className="overline">Upcoming</div>
          {upcoming.map(t => <TripCard key={t.id} t={t} destinations={destinations} />)}
        </div>
      )}
      {past.length > 0 && (
        <div className="mytrip-section">
          <div className="overline">Past</div>
          {past.map(t => <TripCard key={t.id} t={t} destinations={destinations} />)}
        </div>
      )}
    </div>
  )
}
