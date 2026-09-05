import { useEffect, useState } from 'react'
import { fmtDate, inr } from './api'

function wmoEmoji(code: number) {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌦️'
  if (code <= 86) return '🌨️'
  return '⛈️'
}

function InlinedWeather({ slug }: { slug: string }) {
  const [wx, setWx] = useState<any>(null)
  useEffect(() => {
    fetch(`/api/destinations/${slug}/weather`).then(r => r.json()).then(setWx).catch(() => {})
  }, [slug])
  if (!wx) return null
  const c = wx.current
  return (
    <div className="td-weather">
      <h2 className="td-section">🌤️ Current weather</h2>
      <div className="weather-widget">
        <div className="wx-now">
          <span className="wx-emoji">{c.emoji}</span>
          <div>
            <span className="wx-temp">{c.temp}°C</span>
            <span className="wx-label">{c.label}</span>
            <span className="wx-meta">{c.humidity}% humidity · {c.windSpeed} km/h wind</span>
          </div>
        </div>
        <div className="wx-forecast">
          {wx.daily.slice(0, 4).map((d: any) => (
            <div key={d.date} className="wx-day">
              <span className="wx-day-label">{new Date(d.date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short' })}</span>
              <span className="wx-day-emoji">{d.emoji}</span>
              <span className="wx-day-temps">{d.max}° / {d.min}°</span>
              {d.precipitation > 0 && <span className="wx-rain">{d.precipitation}mm</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Presentational trip-details view shared by the consumer Trip Details page
// and the Partner CRM preview — single source of truth for trip presentation.
// Availability line (bookings backbone, PRD 2.9): capacity is first-party data.
function SeatsLine({ a }: { a: any }) {
  if (!a || a.capacity == null) return null
  if (a.full) return <p className="seats-line seats-full"><i className="ph-fill ph-warning-circle" /> Sold out — {a.capacity} seats taken</p>
  if (a.fillingFast) return <p className="seats-line seats-fast"><i className="ph-fill ph-fire" /> Filling fast — only {a.seatsLeft} of {a.capacity} seats left</p>
  return <p className="seats-line"><i className="ph-bold ph-users" /> {a.seatsLeft} of {a.capacity} seats left</p>
}

export default function TripDetailsView({
  trip, bookable, onBook, onJoinHub, mode = 'consumer', busy, withNav,
  pendingClaim, onClaim, onDismissClaim, onJoinWaitlist, onCancelBooking,
}: {
  trip: any
  bookable?: boolean
  onBook?: () => void
  onJoinHub?: () => void // signed-in consumers: join this trip's travellers' hub
  mode?: 'consumer' | 'preview'
  busy?: boolean
  withNav?: boolean // true when the mobile bottom nav is present (lifts the sticky book bar)
  pendingClaim?: boolean          // traveller just came back from the host's payment page
  onClaim?: () => void            // "Yes, I completed my booking"
  onDismissClaim?: () => void
  onJoinWaitlist?: () => void
  onCancelBooking?: () => void
}) {
  if (!trip) return null
  const host = trip.host || {}
  const gallery: any[] = trip.media || []
  const cur = (n: number) => (trip.currency === 'INR' || !trip.currency ? inr(n) : `${trip.currency} ${n.toLocaleString()}`)
  const dateRange = trip.startDate ? `${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}` : 'Dates flexible'

  return (
    <div className="trip-detail">
      {mode === 'preview' && (
        <div className="preview-ribbon">👁️ Preview — this is how travellers will see your trip{trip.status !== 'published' ? ' once published' : ''}. Close this tab to return to the editor.</div>
      )}

      {trip.coverImage
        ? <div className="td-cover" style={{ backgroundImage: `url(${trip.coverImage})` }} />
        : <div className="td-cover td-cover-empty">🏞️ No cover image yet</div>}

      <div className="td-body">
        <div className="td-main">
          <div className="td-headrow">
            <div>
              <div className="td-host">
                <span className="td-host-badge" style={{ background: host.logoColor || '#0d9488' }}>{host.logoEmoji || '🧭'}</span>
                <span>{host.name || 'Travel community'}</span>
                {trip.category && <span className="chip chip-mini">{trip.category}</span>}
              </div>
              <h1 className="td-title">{trip.name || 'Untitled trip'}</h1>
              <p className="td-meta">📍 {trip.destination || '—'}{trip.startCity ? ` · from ${trip.startCity}` : ''} · 🗓️ {dateRange} · {trip.durationDays ? `${trip.durationDays} days` : ''}</p>
              <div className="td-tags">
                {(trip.tags || []).map((t: string) => <span key={t} className="chip chip-mini chip-alt">{t}</span>)}
              </div>
            </div>
          </div>

          {trip.shortDesc && <p className="td-lede">{trip.shortDesc}</p>}
          {trip.longDesc && <p className="td-long">{trip.longDesc}</p>}

          {gallery.length > 0 && (
            <div className="td-gallery">
              {gallery.map((m: any) => <div key={m.id || m.url} className="td-gallery-img" style={{ backgroundImage: `url(${m.url})` }} />)}
            </div>
          )}

          <div className="td-facts">
            {trip.difficulty && <span className="td-fact">⛰️ {trip.difficulty}</span>}
            {trip.maxGroupSize && <span className="td-fact">👥 Up to {trip.maxGroupSize}</span>}
            {trip.minAge && <span className="td-fact">🔞 {trip.minAge}+</span>}
          </div>

          {trip.destinationSlug && <InlinedWeather slug={trip.destinationSlug} />}

          <h2 className="td-section">Day-by-day itinerary</h2>
          {(trip.itinerary || []).length === 0 && <p className="muted">No itinerary added yet.</p>}
          <div className="td-itin">
            {(trip.itinerary || []).map((d: any) => (
              <div key={d.id || d.dayNumber} className="td-day">
                <div className="td-day-num">Day {d.dayNumber}</div>
                <div className="td-day-body">
                  <strong>{d.title || `Day ${d.dayNumber}`}</strong>
                  {d.location && <span className="td-day-loc">📍 {d.location}</span>}
                  {d.description && <p className="muted small">{d.description}</p>}
                  {(d.activities || []).length > 0 && (
                    <div className="chips">{d.activities.map((a: string) => <span key={a} className="chip chip-mini">{a}</span>)}</div>
                  )}
                  {(d.accommodation || (d.meals || []).length > 0) && (
                    <div className="td-day-extra">
                      {d.accommodation && <span className="inc-chip inc-stay">🛏️ {d.accommodation}</span>}
                      {(d.meals || []).length > 0 && <span className="inc-chip inc-meal">🍽️ {d.meals.join(', ')}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {(trip.inclusions?.length > 0 || trip.exclusions?.length > 0) && (
            <div className="td-incl-grid">
              {trip.inclusions?.length > 0 && (
                <div>
                  <h3 className="td-section">What's included</h3>
                  <ul className="td-list td-list-yes">{trip.inclusions.map((i: string) => <li key={i}>{i}</li>)}</ul>
                </div>
              )}
              {trip.exclusions?.length > 0 && (
                <div>
                  <h3 className="td-section">Not included</h3>
                  <ul className="td-list td-list-no">{trip.exclusions.map((i: string) => <li key={i}>{i}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="td-book">
          <div className="td-price">
            {trip.originalPrice && trip.originalPrice > trip.price && <span className="td-price-was">{cur(trip.originalPrice)}</span>}
            <span className="td-price-now">{trip.price ? cur(trip.price) : 'Price TBD'}</span>
            <span className="small faint">per person</span>
          </div>
          {trip.pricingNotes && <p className="tiny muted">{trip.pricingNotes}</p>}
          <SeatsLine a={trip.availability} />

          {/* Transparent pricing — presentational; reinforces Trippy's zero-fee, pay-the-host model */}
          {mode === 'consumer' && trip.price && trip.myBookingStatus !== 'confirmed' && trip.myBookingStatus !== 'claimed' && (
            <div className="td-fees">
              <div className="td-fee-row"><span>Package price</span><span>{cur(trip.price)}<span className="td-fee-per"> /person</span></span></div>
              <div className="td-fee-row"><span>Trippy booking fee</span><span className="td-fee-free">Free</span></div>
              <div className="td-fee-row td-fee-total"><span>You pay {host.name || 'the host'}</span><span>{cur(trip.price)}</span></div>
              <p className="td-fee-note">No platform fee, no markup — you pay the host directly on their secure page.</p>
            </div>
          )}

          {/* Booking state ladder: booked → pending → claim prompt → book/waitlist */}
          {trip.myBookingStatus === 'confirmed' ? (
            <>
              <div className="book-state book-state-ok">
                <i className="ph-fill ph-check-circle" />
                <div><strong>Booked — you're going! 🎉</strong><span className="tiny">The host confirmed your payment.</span></div>
                {onCancelBooking && <button className="linkish tiny" onClick={onCancelBooking}>Cancel</button>}
              </div>
              {onJoinHub && (
                <button className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={onJoinHub}>
                  <i className="ph-bold ph-users-three" /> Go to my trip hub →
                </button>
              )}
            </>
          ) : trip.myBookingStatus === 'claimed' ? (
            <>
              <div className="book-state book-state-wait">
                <i className="ph-fill ph-clock" />
                <div><strong>Waiting for host confirmation</strong><span className="tiny">{host.name || 'The host'} is verifying your payment.</span></div>
                {onCancelBooking && <button className="linkish tiny" onClick={onCancelBooking}>Cancel</button>}
              </div>
              {onJoinHub && (
                <button className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={onJoinHub}>
                  <i className="ph-bold ph-users-three" /> Join your trip hub while you wait →
                </button>
              )}
            </>
          ) : pendingClaim && onClaim ? (
            <div className="book-state book-state-claim">
              <div><strong>Did you complete payment on {host.name || 'the host'}'s page?</strong></div>
              <div className="row-actions" style={{ marginTop: 8 }}>
                <button className="btn btn-primary small" onClick={onClaim}>Yes, I booked ✓</button>
                <button className="btn btn-ghost small" onClick={onDismissClaim}>Not yet</button>
              </div>
            </div>
          ) : trip.availability?.full ? (
            trip.onWaitlist ? (
              <div className="book-state book-state-wait"><i className="ph-fill ph-list-plus" /><div><strong>You're on the waitlist</strong><span className="tiny">We'll notify you the moment a seat opens.</span></div></div>
            ) : (
              <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} onClick={onJoinWaitlist} disabled={mode === 'preview' || !onJoinWaitlist}>
                <i className="ph-bold ph-list-plus" /> Join the waitlist
              </button>
            )
          ) : (
            <>
              <button
                className="btn btn-primary btn-block"
                disabled={mode === 'preview' || bookable === false || busy}
                onClick={onBook}
                style={{ marginTop: 12 }}
              >
                {mode === 'preview' ? 'Book Now (disabled in preview)' : busy ? 'Redirecting…' : 'Book Now →'}
              </button>
              {mode === 'consumer' && bookable !== false && <p className="tiny muted center" style={{ marginTop: 8 }}>You'll complete payment on {host.name || 'the host'}'s secure page, then confirm here.</p>}
              {bookable === false && mode === 'consumer' && <p className="tiny error center">Booking is temporarily unavailable for this trip.</p>}
            </>
          )}
        </aside>
      </div>

      {/* Sticky mobile booking bar (UX audit: Book Now was below the fold on mobile) */}
      {mode === 'consumer' && !trip.myBookingStatus && (
        <div className={`book-bar ${withNav ? 'book-bar-lift' : ''}`}>
          <div className="book-bar-price">
            <strong>{trip.price ? cur(trip.price) : 'Price TBD'}</strong>
            <span>{trip.availability?.full ? 'sold out · waitlist open' : `per person · pay on ${host.name || 'the host'}'s page`}</span>
          </div>
          {trip.availability?.full
            ? <button className="btn btn-primary" disabled={trip.onWaitlist || !onJoinWaitlist} onClick={onJoinWaitlist}>{trip.onWaitlist ? 'On waitlist ✓' : 'Join waitlist'}</button>
            : <button className="btn btn-primary" disabled={bookable === false || busy} onClick={onBook}>{busy ? 'Redirecting…' : 'Book Now →'}</button>}
        </div>
      )}
    </div>
  )
}
