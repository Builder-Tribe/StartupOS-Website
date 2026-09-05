import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api, fmtDate, inr } from '../api'
import { useAuth } from '../App'
import { Spinner, useToast, PartnerTripCard } from '../components'
import { BookModal } from '../BookModal'
import { useCompare } from '../CompareContext'

const dayDiff = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000)
const shiftDays = (isoDate: string, n: number) => {
  // Noon avoids the UTC-rollback off-by-one for timezones ahead of UTC (e.g. IST)
  const d = new Date(isoDate + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function OperatorTripCard({ t, onBook, onCompare, compareSelected }: {
  t: any; onBook: (t: any) => void
  onCompare?: (t: any) => void; compareSelected?: boolean
}) {
  const spotsLeft = t.groupSizeMax - t.groupSizeCurrent
  return (
    <div className="tripcard">
      <div className="tripcard-top">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span className="op-chip">{t.operator}</span>
            <span className={`date-chip ${t.onDates ? 'on' : ''}`}>{t.onDates ? '✓ On your dates' : `Departs ${fmtDate(t.startDate)}`}</span>
            {spotsLeft <= 3 && spotsLeft > 0 && <span className="date-chip" style={{ background: '#fff3cd', color: '#856404' }}>⚡ {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} left</span>}
          </div>
          <h3>{t.title}</h3>
          <p className="trip-meta">{t.operator} · from {t.startCity} · {t.durationDays} days · departs {fmtDate(t.startDate)}</p>
        </div>
        <div className="trip-price">{inr(t.price)}<span className="per">per person</span></div>
      </div>
      <div className="incl-row">
        {t.inclusions.map((i: string) => <span key={i} className="incl-chip">✓ {i}</span>)}
      </div>
      <div className="trip-foot">
        <div className="trip-stats">
          <span>⭐ <strong style={{ color: 'var(--ink)' }}>{t.rating}</strong> ({t.reviewCount})</span>
          <span>👥 {t.groupSizeCurrent}/{t.groupSizeMax} joined</span>
          <span>{t.genderRatio ? `${t.genderRatio.male}M / ${t.genderRatio.female}F` : 'mixed group'}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {onCompare && (
            <button className={`compare-add-btn ${compareSelected ? 'compare-add-btn-on' : ''}`} onClick={() => onCompare(t)}>
              {compareSelected ? '✓ Added' : '+ Compare'}
            </button>
          )}
          <button className="btn btn-primary small" onClick={() => onBook(t)}>Book trip</button>
        </div>
      </div>
    </div>
  )
}


export default function Results() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { add, remove, isSelected } = useCompare()
  const destParam = params.get('destination') || ''
  const start = params.get('start') || ''
  const end = params.get('end') || ''
  const nights = Math.max(1, dayDiff(start, end))
  const days = nights + 1
  const [destinations, setDestinations] = useState<any[] | null>(null)
  const [data, setData] = useState<any>(null)
  const [hosted, setHosted] = useState<any[] | null>(null)
  const [allTrips, setAllTrips] = useState<any[] | null>(null)
  const [bookingTrip, setBookingTrip] = useState<any>(null)
  const [toast, showToast] = useToast()

  const compareOp = (t: any) => isSelected(t.id)
    ? remove(t.id)
    : add({ id: t.id, name: t.title, kind: 'operator', price: t.price, destination: t.destination })
  const compareHosted = (t: any) => isSelected(t.id)
    ? remove(t.id)
    : add({ id: t.id, name: t.name, kind: 'hosted', price: t.price, destination: t.destination })

  // Resolve the free-text destination against known destinations:
  // 'dest' = known destination, 'unknown' = searched text we don't cover yet, 'all' = blank ("anywhere")
  const resolved = useMemo(() => {
    if (!destinations) return null
    const t = destParam.trim().toLowerCase()
    if (!t) return { mode: 'all' as const, dest: null }
    const d = destinations.find(x => x.slug === t || x.name.toLowerCase() === t)
      || destinations.find(x => x.name.toLowerCase().startsWith(t))
    return d ? { mode: 'dest' as const, dest: d } : { mode: 'unknown' as const, dest: null }
  }, [destinations, destParam])

  useEffect(() => {
    api.get('/destinations').then(setDestinations).catch(() => { setDestinations([]) })
  }, [])

  useEffect(() => {
    if (!resolved) return
    setData(null); setHosted(null); setAllTrips(null)
    if (resolved.mode === 'dest') {
      api.get(`/compare?destination=${resolved.dest.slug}&days=${days}`).then(setData)
      api.get(`/discover/trips?destinationSlug=${resolved.dest.slug}`).then(setHosted)
    } else {
      // Anywhere / unknown destination: every hosted trip departing in the window
      // (server applies the ±3-day tolerance) + operator trips filtered client-side.
      api.get(`/discover/trips?from=${start}&to=${end}`).then(setHosted)
      api.get('/grouptrips').then(setAllTrips)
    }
  }, [resolved, days, start, end])

  const onDates = (startDate: string | null) => !startDate || (startDate >= shiftDays(start, -3) && startDate <= shiftDays(end, 3))

  const trips = useMemo(() => {
    if (!data) return []
    // "On your dates": departure within [start − 3d, end + 3d] (PRD ±3-day tolerance)
    return [...data.groupTrips]
      .map((t: any) => ({ ...t, onDates: onDates(t.startDate) }))
      .sort((a: any, b: any) => Number(b.onDates) - Number(a.onDates) || b.rating - a.rating)
  }, [data, start, end])

  useEffect(() => {
    if (!start || !end) navigate('/', { replace: true })
  }, [start, end])

  if (!start || !end) return null
  if (!resolved) return <Spinner />

  // Hub join — called from BookModal after the user has confirmed their booking.
  const joinHub = async (t: any) => {
    const res = await api.post(`/grouptrips/${t.id}/join`)
    navigate(`/groups/${res.id}?joined=1`)
  }

  // Opens the booking modal; guests are sent to sign-up first.
  const openBook = (t: any) => {
    if (!user) return navigate('/login?mode=signup')
    setBookingTrip(t)
  }
  const dateLabel = `${fmtDate(start)} – ${fmtDate(end)} · ${nights} night${nights > 1 ? 's' : ''}`

  // ---------- Anywhere / unknown destination ----------
  if (resolved.mode !== 'dest') {
    if (!hosted || !allTrips) return <Spinner />
    const operatorOn = allTrips
      .filter((t: any) => onDates(t.startDate))
      .map((t: any) => ({ ...t, onDates: true }))
      .sort((a: any, b: any) => (a.startDate || '').localeCompare(b.startDate || ''))
    const total = hosted.length + operatorOn.length
    return (
      <div className="fade-up" style={{ paddingTop: 22 }}>
        <Link to="/" className="back-link">← Edit search</Link>
        <div className="results-head">
          <h1>{resolved.mode === 'all' ? '🌍 All trips on your dates' : `Trips on your dates`}</h1>
          <p className="results-sub">{dateLabel} · <span style={{ color: 'var(--brand-dark)', fontWeight: 600 }}>{total} trip{total === 1 ? '' : 's'} departing</span></p>
        </div>
        {resolved.mode === 'unknown' && (
          <>
            <div className="notfound-banner">
              <span className="nf-emoji">🌱</span>
              <div>
                <strong>We don't have trips to "{destParam}" just yet.</strong>
                <p>But these trips depart on your dates — give one of them a shot, or build your own and we'll match you with travellers going then.</p>
              </div>
            </div>
            <div className="diy-nudge">
              <strong>Want to go anyway?</strong>
              <p className="muted small">You can build your own trip — connect with travelers on Trippy heading to nearby destinations, or start a DIY group for this one.</p>
              <Link to="/diy" className="btn btn-diy small" style={{ marginTop: 8, display: 'inline-block' }}>Build your own trip →</Link>
            </div>
          </>
        )}
        {total === 0 ? (
          <div className="empty-trips">
            No trips departing between {fmtDate(start)} and {fmtDate(end)}.{' '}
            <Link to="/" style={{ color: 'var(--brand-dark)', fontWeight: 600 }}>Try different dates</Link> or{' '}
            <Link to="/diy" style={{ color: 'var(--diy-dark)', fontWeight: 600 }}>build your own trip →</Link>
          </div>
        ) : (
          <div className="trip-grid">
            {hosted.map(t => (
              <PartnerTripCard key={t.id} trip={t}
                onCompare={compareHosted} compareSelected={isSelected(t.id)} />
            ))}
            {operatorOn.map((t: any) => (
              <OperatorTripCard key={t.id} t={t} onBook={openBook}
                onCompare={compareOp} compareSelected={isSelected(t.id)} />
            ))}
          </div>
        )}
        {bookingTrip && <BookModal trip={bookingTrip} user={user} onClose={() => setBookingTrip(null)} onJoinHub={joinHub} />}
        {toast}
      </div>
    )
  }

  // ---------- Known destination ----------
  if (!data || !hosted) return <Spinner />
  const d = data.destination
  const hostedOn = hosted.filter(t => onDates(t.startDate))
  const hostedOff = hosted.filter(t => !onDates(t.startDate))
  const tripsOn = trips.filter((t: any) => t.onDates)
  const tripsOff = trips.filter((t: any) => !t.onDates)
  const onCount = hostedOn.length + tripsOn.length

  const cheapest = trips.length ? Math.min(...trips.map((t: any) => t.price)) : null
  const saving = cheapest != null ? cheapest - data.diy.total : null
  const savingLabel = saving == null
    ? 'flexible & social'
    : saving > 0 ? `≈ ${inr(saving)} cheaper than a group trip` : `≈ ${inr(-saving)} more, fully flexible`
  const diyLink = `/diy?destination=${d.slug}&start=${start}&end=${end}`

  return (
    <div className="fade-up" style={{ paddingTop: 22 }}>
      <Link to="/" className="back-link">← Edit search</Link>
      <div className="results-head">
        <h1>{d.emoji} Trips to {d.name}</h1>
        <p className="results-sub">
          {dateLabel} · <span style={{ color: 'var(--brand-dark)', fontWeight: 600 }}>{onCount} trip{onCount === 1 ? '' : 's'} on these dates</span>
        </p>
      </div>

      <div className="results-grid">
        <div className="trip-list">
          {onCount === 0 && (
            <div className="diy-nudge" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 20 }}>🛠️</span>
                <strong>Trips not available for {d.name} on these dates</strong>
              </div>
              <p className="muted small">Organized trips are not listed for these dates, but you can build your own custom trip using our DIY flow — set custom hostel stays, estimate costs, and match with fellow solo travellers!</p>
              <Link to={diyLink} className="btn btn-diy small" style={{ marginTop: 10, display: 'inline-block' }}>🛠️ Plan DIY Trip to {d.name} →</Link>
            </div>
          )}
          {onCount > 0 && (
            <div className="diy-nudge" style={{ marginBottom: 16, background: '#f0fdfa', borderColor: '#b2f5ea' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <strong>⚡ {onCount} organized trip{onCount > 1 ? 's' : ''} available to {d.name}</strong>
                  <p className="muted small" style={{ margin: 0 }}>Don't like existing itineraries or want to plan it solo?</p>
                </div>
                <Link to={diyLink} className="btn btn-secondary small">🛠️ Build DIY Trip to {d.name} →</Link>
              </div>
            </div>
          )}
          {onCount > 0 && (
            <div className="trip-grid">
              {hostedOn.map(t => (
                <PartnerTripCard key={t.id} trip={t}
                  onCompare={compareHosted} compareSelected={isSelected(t.id)} />
              ))}
              {tripsOn.map((t: any) => (
                <OperatorTripCard key={t.id} t={t} onBook={openBook}
                  onCompare={compareOp} compareSelected={isSelected(t.id)} />
              ))}
            </div>
          )}

          {(tripsOff.length > 0 || hostedOff.length > 0) && (
            <div className="other-divider">Other departures to {d.name}</div>
          )}
          {(tripsOff.length > 0 || hostedOff.length > 0) && (
            <div className="trip-grid">
              {hostedOff.map(t => (
                <PartnerTripCard key={t.id} trip={t}
                  onCompare={compareHosted} compareSelected={isSelected(t.id)} />
              ))}
              {tripsOff.map((t: any) => (
                <OperatorTripCard key={t.id} t={t} onBook={openBook}
                  onCompare={compareOp} compareSelected={isSelected(t.id)} />
              ))}
            </div>
          )}
        </div>

        <aside className="diy-rail">
          <div className="pill pill-coral">🛠️ Rather do it yourself?</div>
          <h3>Build your own {d.name} trip</h3>
          <p>Pick a hostel, match with travelers on your dates, form a group and plan the itinerary together.</p>
          <div className="diy-cost">
            <div className="diy-cost-row">
              <span className="small faint">Est. DIY cost</span>
              <span className="diy-total">{inr(data.diy.total)}</span>
            </div>
            <div className="diy-saving">{savingLabel}</div>
          </div>
          <Link to={diyLink} className="btn btn-diy btn-block" style={{ marginTop: 0 }}>Build your own trip →</Link>
        </aside>
      </div>
      {bookingTrip && (
        <BookModal
          trip={bookingTrip}
          user={user}
          onClose={() => setBookingTrip(null)}
          onJoinHub={joinHub}
        />
      )}
      {toast}
    </div>
  )
}
