// Shared operator-trip booking modal — used by Results and Chatbot.
// Takes `user` as a prop (rather than useAuth) to avoid circular imports.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, fmtDate, inr } from './api'

export function BookModal({ trip, user, onClose, onJoinHub }: {
  trip: any
  user?: any
  onClose: () => void
  onJoinHub: (t: any) => Promise<void>
}) {
  const navigate = useNavigate()
  const [step, setStep] = useState<'confirm' | 'booked'>('confirm')
  const [busy, setBusy] = useState(false)
  const [joiningHub, setJoiningHub] = useState(false)
  const [error, setError] = useState('')

  const confirmBooking = async () => {
    if (!user) { navigate('/login?mode=signup'); return }
    setBusy(true); setError('')
    try {
      await api.post(`/grouptrips/${trip.id}/book`)
      setStep('booked')
    } catch (e: any) {
      setError(e.message || 'Could not complete booking')
    } finally { setBusy(false) }
  }

  const joinHub = async () => {
    setJoiningHub(true)
    try { await onJoinHub(trip) }
    catch { setJoiningHub(false) }
  }

  return (
    <div className="book-overlay" onClick={onClose}>
      <div className="book-modal" onClick={e => e.stopPropagation()}>
        {step === 'confirm' ? (
          <>
            <div className="book-modal-head">
              <h2>Book this trip</h2>
              <button className="book-modal-close" onClick={onClose} aria-label="Close">×</button>
            </div>
            <div className="book-trip-summary">
              <span className="op-chip">{trip.operator}</span>
              <h3 style={{ margin: '10px 0 4px' }}>{trip.title}</h3>
              <p className="small faint">{fmtDate(trip.startDate)} · {trip.durationDays} days · from {trip.startCity}</p>
              <div className="incl-row" style={{ marginTop: 10 }}>
                {(trip.inclusions || []).map((i: string) => <span key={i} className="incl-chip">✓ {i}</span>)}
              </div>
              <div className="book-price-row">
                <div>
                  <div className="small faint">Price per person</div>
                  <div className="book-price">{inr(trip.price)}</div>
                </div>
                <div className="small faint" style={{ textAlign: 'right' }}>
                  👥 {trip.groupSizeCurrent}/{trip.groupSizeMax} booked<br />
                  <span style={{ color: 'var(--brand-dark)', fontWeight: 600 }}>
                    {trip.groupSizeMax - trip.groupSizeCurrent} spots left
                  </span>
                </div>
              </div>
            </div>
            {error && <p className="error" style={{ marginTop: 8 }}>{error}</p>}
            <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={busy} onClick={confirmBooking}>
              {busy ? 'Booking…' : `Confirm & pay ${inr(trip.price)}`}
            </button>
            <button className="btn btn-secondary btn-block" style={{ marginTop: 8 }} onClick={onClose}>Cancel</button>
            <p className="small faint" style={{ textAlign: 'center', marginTop: 8 }}>
              Simulated payment — no real charge in this build
            </p>
          </>
        ) : (
          <>
            <div className="book-success">
              <div className="book-success-icon">✅</div>
              <h2>Trip booked!</h2>
              <p className="muted" style={{ margin: '6px 0 2px' }}><strong>{trip.title}</strong></p>
              <p className="small faint">The operator will share joining details. Track this in My Trips.</p>
            </div>
            <div className="book-next-options">
              <button className="btn btn-primary btn-block" disabled={joiningHub} onClick={joinHub}>
                {joiningHub ? 'Joining…' : '👥 Join the travel hub →'}
              </button>
              <p className="small faint" style={{ textAlign: 'center', margin: '4px 0' }}>
                Chat with fellow travellers, plan the itinerary, share documents
              </p>
              <button className="btn btn-secondary btn-block" onClick={onClose}>
                Skip for now — I'll join later
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
