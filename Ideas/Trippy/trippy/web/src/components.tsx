import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fmtDate, inr } from './api'


// Consumer discovery card for a PUBLISHED partner trip → links to Trip Details.
// onCompare + compareSelected are optional — omit them to render without compare UI.
export function PartnerTripCard({ trip, onCompare, compareSelected }: {
  trip: any
  onCompare?: (trip: any) => void
  compareSelected?: boolean
}) {
  return (
    <div className="ptrip-card-wrap">
      <Link to={`/trip/${trip.slug || trip.id}`} className="ptrip-card plain-link">
        <div className="ptrip-cover" style={{ backgroundImage: trip.coverImage ? `url(${trip.coverImage})` : undefined }}>
          {trip.category && (
            <span className="ptrip-cat">
              {trip.category.includes('bike') || trip.category.includes('motorcycle') ? '🏍️ ' : trip.category === 'road-trip' ? '🚗 ' : ''}
              {trip.category.replace('-', ' ')}
            </span>
          )}
        </div>
        <div className="ptrip-body">
          <div className="ptrip-host">by {trip.hostName}</div>
          <strong className="ptrip-name">{trip.name}</strong>
          {trip.availability?.capacity != null && (
            trip.availability.full
              ? <span className="seat-chip seat-chip-full">Sold out · waitlist</span>
              : trip.availability.fillingFast
                ? <span className="seat-chip seat-chip-fast">🔥 {trip.availability.seatsLeft} seats left</span>
                : <span className="seat-chip">{trip.availability.seatsLeft} of {trip.availability.capacity} seats left</span>
          )}
          <div className="ptrip-meta">📍 {trip.destination}</div>
          <div className="ptrip-meta">🗓️ {trip.startDate ? `${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}` : 'Flexible'}{trip.durationDays ? ` · ${trip.durationDays}D` : ''}</div>
          <div className="ptrip-foot">
            <span className="ptrip-price">{trip.price ? inr(trip.price) : '—'}<span className="tiny faint"> /person</span></span>
            {trip.originalPrice > trip.price && <span className="ptrip-was">{inr(trip.originalPrice)}</span>}
            {trip.avgRating && <span className="star-display">★ {trip.avgRating.toFixed(1)} ({trip.reviewCount})</span>}
          </div>
        </div>
      </Link>
      {onCompare && (
        <button
          className={`compare-add-btn ${compareSelected ? 'compare-add-btn-on' : ''}`}
          onClick={e => { e.preventDefault(); e.stopPropagation(); onCompare(trip) }}
          title={compareSelected ? 'Remove from comparison' : 'Add to comparison'}
        >
          {compareSelected ? '✓ Added' : '+ Compare'}
        </button>
      )}
    </div>
  )
}

export function BrandMark() {
  return (
    <>
      <span className="brand-tile"><i className="ph-bold ph-compass" /></span>
      <span className="brand-word">Trippy</span>
    </>
  )
}

// Bottom-center toast pill (auto-dismisses after ~2.6s)
export function useToast(): [React.ReactNode, (msg: string) => void] {
  const [msg, setMsg] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const show = useCallback((m: string) => {
    setMsg(m)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMsg(null), 2600)
  }, [])
  const node = msg ? <div className="toast">{msg}</div> : null
  return [node, show]
}

export function Avatar({ user, size = 44 }: { user: any; size?: number }) {
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.5, background: user?.avatarColor || '#0d9488' }}>
      {user?.avatarEmoji || '🧭'}
    </div>
  )
}

// Positive trust badge only — shown when a profile is ID-verified, hidden
// otherwise (no negative "Unverified" flag).
export function VerifiedBadges({ user, compact }: { user: any; compact?: boolean }) {
  if (!user?.idVerified) return null
  return (
    <span className="badges">
      <span className="badge badge-ok" title="Government ID verified"><i className="ph-fill ph-seal-check" />{!compact && ' ID verified'}</span>
    </span>
  )
}

export function ScorePill({ score }: { score: number }) {
  const tone = score >= 70 ? 'high' : score >= 45 ? 'mid' : 'low'
  return <span className={`score score-${tone}`}>{score}% match</span>
}

export function TrustStars({ user }: { user: any }) {
  if (!user?.trustScore) return <span className="muted small">New member</span>
  return <span className="small">⭐ {user.trustScore} · {user.trustReviews} companion review{user.trustReviews === 1 ? '' : 's'}</span>
}

export function Chips({ items, active, onToggle }: { items: string[]; active?: string[]; onToggle?: (v: string) => void }) {
  return (
    <div className="chips">
      {items.map(item => (
        <button
          key={item}
          type="button"
          className={`chip ${active?.includes(item) ? 'chip-active' : ''}`}
          onClick={onToggle ? () => onToggle(item) : undefined}
          style={{ cursor: onToggle ? 'pointer' : 'default' }}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

export function UserLink({ user, children }: { user: any; children: React.ReactNode }) {
  return <Link className="plain-link" to={`/users/${user.id}`}>{children}</Link>
}

export function Empty({ emoji, title, hint, action }: { emoji: string; title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-emoji">{emoji}</div>
      <h3>{title}</h3>
      {hint && <p className="muted">{hint}</p>}
      {action}
    </div>
  )
}

export function Spinner() {
  return <div className="spinner" aria-label="Loading" />
}

export function StarRating({ value, onChange, size = 20 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <span className={`star-rating${onChange ? ' interactive' : ''}`} style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          className="star"
          style={{ cursor: onChange ? 'pointer' : 'default' }}
          onClick={() => onChange?.(n)}
        >
          {n <= value ? '★' : '☆'}
        </span>
      ))}
    </span>
  )
}

export function StarDisplay({ rating, count }: { rating: number | null; count?: number }) {
  if (!rating) return null
  return (
    <span className="star-display">
      ★ {rating.toFixed(1)}{count != null ? ` (${count})` : ''}
    </span>
  )
}
