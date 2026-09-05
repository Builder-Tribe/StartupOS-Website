import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, fmtDate, inr } from '../api'
import { PartnerTripCard } from '../components'
import { useCompare } from '../CompareContext'

const iso = (d: Date) => d.toISOString().slice(0, 10)
const plusDays = (base: string, n: number) => {
  const d = new Date(base + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return iso(d)
}

export default function Landing() {
  const navigate = useNavigate()
  const { add, remove, isSelected } = useCompare()
  const [destinations, setDestinations] = useState<any[]>([])
  const [trips, setTrips] = useState<any[]>([])
  const [hosted, setHosted] = useState<any[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [suggestOpen, setSuggestOpen] = useState(false)
  const defaultStart = useMemo(() => plusDays(iso(new Date()), 14), [])
  const [form, setForm] = useState({ destination: '', startDate: defaultStart, endDate: plusDays(defaultStart, 4) })

  useEffect(() => {
    api.get('/destinations').then(setDestinations)
    api.get('/grouptrips').then(setTrips)
    api.get('/discover/trips').then(setHosted)
    api.get('/destinations/trending').then(setTrending).catch(() => {})
  }, [])

  const suggestions = useMemo(() => {
    const activeDests = destinations.filter(d => (d.activeTripCount || 0) > 0)
    const baseList = activeDests.length > 0 ? activeDests : destinations
    const t = form.destination.trim().toLowerCase()
    if (!t) {
      return [...baseList]
        .sort((a, b) => (b.activeTripCount || 0) - (a.activeTripCount || 0) || a.name.localeCompare(b.name))
        .slice(0, 8)
    }
    return destinations
      .filter(d => `${d.name} ${d.state} ${d.slug}`.toLowerCase().includes(t))
      .sort((a, b) => (b.activeTripCount || 0) - (a.activeTripCount || 0))
      .slice(0, 10)
  }, [form.destination, destinations])

  const placeholderText = useMemo(() => {
    const activeNames = destinations.filter(d => (d.activeTripCount || 0) > 0).map(d => d.name)
    const names = activeNames.length > 0 ? activeNames : destinations.map(d => d.name)
    if (names.length > 0) return `Anywhere — try ${names.slice(0, 3).join(', ')}…`
    return 'Anywhere — try Gokarna, Manali…'
  }, [destinations])

  const tripCount = (slug: string) => trips.filter(t => t.destination === slug).length
  const soonTrips = useMemo(() =>
    [...trips]
      .filter(t => t.startDate >= iso(new Date()))
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 4),
    [trips])
  const destBySlug = (slug: string) => destinations.find(d => d.slug === slug)

  const go = (destination: string, startDate = form.startDate, endDate = form.endDate) => {
    const end = endDate <= startDate ? plusDays(startDate, 4) : endDate
    const t = destination.trim().toLowerCase()
    const known = destinations.find(d => d.slug === t || d.name.toLowerCase() === t)
      || (t ? destinations.find(d => d.name.toLowerCase().startsWith(t)) : null)
    navigate(`/search?destination=${encodeURIComponent(known ? known.slug : destination.trim())}&start=${startDate}&end=${end}`)
  }

  const availChip = (t: any) => {
    const cls = t.availability === 'filling_fast' ? 'badge-warn' : t.availability === 'full' ? '' : 'badge-open'
    const label = t.availability === 'filling_fast' ? 'Filling fast' : t.availability === 'full' ? 'Full' : 'Open'
    return <span className={`avail-chip badge ${cls}`}>{label}</span>
  }

  const popularTop5 = useMemo(() => {
    return [...destinations]
      .filter(d => (d.activeTripCount || 0) > 0)
      .sort((a, b) => (b.activeTripCount || 0) - (a.activeTripCount || 0) || a.name.localeCompare(b.name))
      .slice(0, 5)
  }, [destinations])

  return (
    <div className="fade-up">
      {/* ── 1. HERO & DIRECT SEARCH (PRD 1.1) ───────────────────────── */}
      <div className="landing-hero">
        <div className="pill pill-teal hero-badge">✦ AI-powered solo travel & community</div>
        <h1 className="hero-title">Find your people. Find your trip.</h1>
        <p className="hero-sub">Search any destination and your dates — or leave the destination blank to see every trip leaving then. Join a group, or build your own and bring the tribe.</p>
      </div>

      <form className="searchbar" onSubmit={e => { e.preventDefault(); go(form.destination) }}>
        <div className="sb-field wide sb-combo" style={{ position: 'relative' }}>
          <label>Destination</label>
          <input
            type="text"
            placeholder={placeholderText}
            value={form.destination}
            onChange={e => setForm({ ...form, destination: e.target.value })}
            onFocus={() => setSuggestOpen(true)}
            onBlur={() => setTimeout(() => setSuggestOpen(false), 200)}
            onKeyDown={e => e.key === 'Enter' && go(form.destination)}
            autoComplete="off"
          />
          {suggestOpen && (
            <div className="sb-suggest">
              {/* 1. Fast AI Trip Finder Banner */}
              <button
                type="button"
                className="sb-suggest-ai-btn"
                onMouseDown={() => navigate('/chat')}
              >
                <span className="ai-sparkle-icon">✨</span>
                <div className="ai-btn-text">
                  <strong>Anywhere, Anytime</strong> — Ask AI Trip Finder
                </div>
                <span className="ai-arrow">→</span>
              </button>

              {/* 2. Section Header */}
              {!form.destination.trim() ? (
                <div className="sb-suggest-header">
                  <span>🔥 POPULAR DESTINATIONS</span>
                </div>
              ) : (
                <div className="sb-suggest-header">
                  <span>🧭 SEARCH DESTINATIONS</span>
                </div>
              )}

              {/* 3. Destination Items */}
              <div className="sb-suggest-list">
                {suggestions.length > 0 ? (
                  suggestions.map(d => (
                    <button
                      key={d.slug}
                      type="button"
                      className="sb-suggest-item"
                      onMouseDown={() => { setForm(f => ({ ...f, destination: d.name })); setSuggestOpen(false) }}
                    >
                      <div className="sb-suggest-left">
                        <span className="sb-dest-emoji">{d.emoji || '🧭'}</span>
                        <div className="sb-dest-text">
                          <span className="sb-dest-name">{d.name}</span>
                          {d.state && <span className="sb-dest-state">, {d.state}</span>}
                        </div>
                      </div>
                      {(d.activeTripCount || 0) > 0 ? (
                        <span className="sb-suggest-badge active">
                          ⚡ {d.activeTripCount} live trip{d.activeTripCount > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="sb-suggest-badge">
                          DIY available
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div style={{ padding: '12px 14px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    No matching destinations for "{form.destination.trim()}". Press Search to explore options.
                  </div>
                )}
              </div>

              {/* 4. Elegant Sticky DIY Footer Banner */}
              <div className="sb-suggest-footer">
                {form.destination.trim() && !suggestions.some(d => d.name.toLowerCase().includes(form.destination.toLowerCase().trim())) ? (
                  <button
                    type="button"
                    className="sb-suggest-diy-footer-btn alert"
                    onMouseDown={() => navigate(`/diy?destination=${encodeURIComponent(form.destination.trim())}&start=${form.startDate}&end=${form.endDate}`)}
                  >
                    <span>⚠️ <strong>No hosted trips for "{form.destination.trim()}"?</strong> Build DIY Trip →</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="sb-suggest-diy-footer-btn"
                    onMouseDown={() => navigate(`/diy?start=${form.startDate}&end=${form.endDate}`)}
                  >
                    <span>🛠️ <strong>Prefer solo travel or custom dates?</strong> Build DIY Trip →</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="sb-divider" />
        <div className="sb-field">
          <label>From</label>
          <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
        </div>
        <div className="sb-divider" />
        <div className="sb-field">
          <label>To</label>
          <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
        </div>
        <button className="sb-btn" type="submit">Search trips →</button>
      </form>

      {/* Prominent AI Trip Finder Banner directly below search */}
      <div
        className="ai-finder-banner"
        onClick={() => navigate('/chat')}
        style={{
          cursor: 'pointer',
          margin: '16px 0 24px',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(14, 159, 143, 0.1) 0%, rgba(242, 104, 60, 0.1) 100%)',
          border: '1.5px solid rgba(14, 159, 143, 0.3)',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          boxShadow: '0 4px 16px rgba(14, 159, 143, 0.08)',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: '1.6rem', filter: 'drop-shadow(0 2px 4px rgba(242, 104, 60, 0.3))' }}>✨</span>
          <div>
            <strong style={{ fontSize: '1rem', color: 'var(--text)', display: 'block', marginBottom: 2 }}>
              Anywhere, Anytime — Ask AI Trip Finder
            </strong>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Not sure where to go? Chat with Trippy AI to find perfect destinations, budget breakdown & smart itineraries
            </span>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-diy btn-sm"
          style={{ whiteSpace: 'nowrap', borderRadius: 20, padding: '8px 18px', fontSize: '0.88rem', fontWeight: 700, flexShrink: 0 }}
        >
          Ask AI Trip Finder →
        </button>
      </div>

      {/* Feature Cards Grid (DIY Builder, Bike Expeditions, Carpooling) */}
      <div className="adv-mode-grid" style={{ marginTop: 24, marginBottom: 28 }}>
        <div className="adv-mode-card adv-mode-diy" onClick={() => navigate('/diy')}>
          <div className="adv-mode-emoji">🛠️</div>
          <div>
            <strong>DIY Trip Builder & Solo Match</strong>
            <p>Build custom itineraries, estimate hostel budgets, and match with solo travellers heading there.</p>
          </div>
          <span className="pill pill-coral adv-profile-badge">Build DIY Trip →</span>
        </div>

        <div className="adv-mode-card adv-mode-bike" onClick={() => navigate('/adventures')}>
          <div className="adv-mode-emoji">🏍️</div>
          <div>
            <strong>Bike Expeditions & Rides</strong>
            <p>Plan motorcycle routes, match with co-riders, share live GPS tracking & emergency SOS alerts.</p>
          </div>
          <span className="pill pill-teal adv-profile-badge">Explore Rides →</span>
        </div>

        <div className="adv-mode-card adv-mode-road" onClick={() => navigate('/adventures')}>
          <div className="adv-mode-emoji">🚗</div>
          <div>
            <strong>Road Trips & Carpooling</strong>
            <p>Host highway road trips, offer or request carpool seats, and coordinate stop check-ins.</p>
          </div>
          <span className="pill pill-coral adv-profile-badge">Find Carpools →</span>
        </div>
      </div>

      {trending.length > 0 && (
        <div className="strip">
          <div className="strip-head">
            <h2>Trending destinations 🔥</h2>
            <span className="small faint">Most stories, reviews & bookings in the last 30 days</span>
          </div>
          <div className="trending-grid">
            {trending.map(d => (
              <button key={d.slug} className="trending-card" onClick={() => go(d.slug)}>
                <div className="trending-emoji">{d.emoji}</div>
                <div className="trending-info">
                  <span className="trending-name">{d.name}</span>
                  <span className="trending-state">{d.state}</span>
                  <div className="trending-stats">
                    {d.storyCount > 0 && <span>📖 {d.storyCount} {d.storyCount === 1 ? 'story' : 'stories'}</span>}
                    {d.reviewCount > 0 && <span>⭐ {d.reviewCount} {d.reviewCount === 1 ? 'review' : 'reviews'}</span>}
                    {d.bookingCount > 0 && <span>🎒 {d.bookingCount} booked</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {soonTrips.length > 0 && (
        <div className="strip">
          <div className="strip-head">
            <h2>Leaving soon 🔥</h2>
            <span className="small faint">Real departures from operators on Trippy</span>
          </div>
          <div className="soon-grid">
            {soonTrips.map(t => {
              const d = destBySlug(t.destination)
              return (
                <button key={t.id} className="soon-card" onClick={() => go(t.destination, t.startDate, t.startDate ? plusDays(t.startDate, t.durationDays || 4) : form.endDate)}>
                  <div className="soon-top">
                    <span className="soon-emoji">{d?.emoji || '🎒'}</span>
                    {availChip(t)}
                  </div>
                  <span className="soon-title">{t.title}</span>
                  <span className="soon-meta">{d?.name || t.destination} · departs {fmtDate(t.startDate)} · {t.durationDays}D</span>
                  <div className="soon-foot">
                    <span className="soon-price">{inr(t.price)}</span>
                    <span className="soon-meta">⭐ {t.rating}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {hosted.length > 0 && (
        <div className="strip">
          <div className="strip-head">
            <h2>Hosted by travel communities ✦</h2>
            <span className="small faint">Curated group trips you can book directly</span>
          </div>
          <div className="ptrip-grid">
            {hosted.map(t => (
              <PartnerTripCard key={t.id} trip={t}
                onCompare={trip => isSelected(trip.id) ? remove(trip.id) : add({ id: trip.id, name: trip.name, kind: 'hosted', price: trip.price, destination: trip.destination })}
                compareSelected={isSelected(t.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="strip">
        <div className="strip-head">
          <h2>Popular with the tribe 🔥</h2>
          <span className="small faint">Top 5 destinations by available active trips</span>
        </div>
        <div className="tile-grid">
          {popularTop5.map(d => {
            const count = d.activeTripCount || 0
            return (
              <button key={d.slug} className="dest-tile" onClick={() => go(d.slug)}>
                <span className="t-emoji">{d.emoji}</span>
                <span className="t-name">{d.name}</span>
                <span className="t-state">{d.state}</span>
                {count > 0 ? (
                  <span className="t-count" style={{ color: 'var(--brand-dark)', fontWeight: 600 }}>
                    ⚡ {count} live trip{count > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="t-count faint">Explore / DIY →</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
