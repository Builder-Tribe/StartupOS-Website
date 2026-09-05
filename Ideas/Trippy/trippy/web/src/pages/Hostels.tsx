import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, inr } from '../api'
import { Spinner } from '../components'

export default function Hostels() {
  const [params, setParams] = useSearchParams()
  const destination = params.get('destination') || ''
  const [hostels, setHostels] = useState<any[] | null>(null)
  const [destinations, setDestinations] = useState<any[]>([])

  useEffect(() => {
    api.get('/destinations').then(setDestinations).catch(() => {})
  }, [])

  useEffect(() => {
    setHostels(null)
    api.get(`/hostels${destination ? `?destination=${destination}` : ''}`).then(setHostels).catch(() => setHostels([]))
  }, [destination])

  return (
    <div>
      <h1>Hostels</h1>
      <p className="muted">See where the tribe is staying — the member count only includes travelers who chose to be visible.</p>
      <div className="chips" style={{ marginBottom: 16 }}>
        <button className={`chip ${!destination ? 'chip-active' : ''}`} onClick={() => setParams({})}>All</button>
        {destinations.map(d => (
          <button key={d.slug} className={`chip ${destination === d.slug ? 'chip-active' : ''}`} onClick={() => setParams({ destination: d.slug })}>
            {d.emoji} {d.name}
          </button>
        ))}
      </div>

      {!hostels ? <Spinner /> : hostels.length === 0 ? (
        <div className="empty-trips" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🏨</div>
          <strong>No hostels {destination ? `in ${destination.replace(/-/g, ' ')}` : ''} yet</strong>
          <p className="muted small" style={{ marginTop: 6 }}>We're adding new properties regularly — check back soon.</p>
        </div>
      ) : (
        <div className="grid2">
          {hostels.map(h => (
            <Link key={h.id} to={`/hostels/${h.id}`} className={`card plain-link hostel-card ${h.featured ? 'hostel-featured' : ''}`}>
              {h.featured && <div className="featured-ribbon">★ Featured</div>}
              <div className="hostel-head">
                <div>
                  <strong>{h.name}</strong>
                  <div className="muted small">{h.area} · {h.destination?.replace(/-/g, ' ') ?? ''}</div>
                </div>
                <div className="hostel-price">{inr(h.pricePerNight)}<span className="tiny muted">/night</span></div>
              </div>
              <div className="small">⭐ {h.rating} ({h.reviewCount}) {h.partner && <span className="badge badge-ok">Partner</span>}</div>
              <div className="chips">
                {(h.vibeTags ?? []).map((t: string) => <span key={t} className="chip chip-mini">{t}</span>)}
              </div>
              {h.memberCount > 0 && <div className="member-badge">🧭 {h.memberCount} Trippy member{h.memberCount > 1 ? 's' : ''} staying here</div>}
              {h.myStay && <div className="badge badge-ok">You're staying here ✓</div>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
