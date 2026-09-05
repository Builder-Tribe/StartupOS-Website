import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../App'
import { Spinner, useToast } from '../components'
import TripDetailsView from '../TripDetailsView'
import ReviewSection from '../ReviewSection'

// Stable anonymous session id so unauthenticated booking clicks are still attributable.
function anonSessionId() {
  let id = localStorage.getItem('tt_anon')
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('tt_anon', id) }
  return id
}

export default function TripDetails() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)
  const [busy, setBusy] = useState(false)
  const [pendingClaim, setPendingClaim] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [toast, showToast] = useToast()

  useEffect(() => {
    setTrip(null); setNotFound(false)
    api.get(`/discover/trips/${slug}`).then(t => {
      setTrip(t)
      // Came back from the host's payment page earlier → ask about the booking.
      setPendingClaim(!!user && !t.myBookingStatus && localStorage.getItem('tt_pending_claim') === slug)
    }).catch(() => setNotFound(true))
  }, [slug])

  const book = async () => {
    setBusy(true)
    // Pre-open target tab during user click event to prevent popup-blocker blocking
    const win = typeof window !== 'undefined' ? window.open('about:blank', '_blank') : null
    try {
      if (user) localStorage.setItem('tt_pending_claim', slug!)
      const { paymentUrl } = await api.post(`/discover/trips/${slug}/track-click`, {
        anonSessionId: anonSessionId(), sourcePage: 'trip_details', cta: 'book_now',
      })
      if (paymentUrl) {
        if (win) {
          win.location.href = paymentUrl
        } else {
          window.location.href = paymentUrl
        }
      } else {
        if (win) win.close()
        showToast('Booking URL not available for this trip')
      }
      setBusy(false)
      if (user) setPendingClaim(true)
    } catch (e: any) {
      if (win) win.close()
      showToast(e.message || 'Could not start booking')
      setBusy(false)
    }
  }

  const claim = async () => {
    try {
      await api.post(`/discover/trips/${slug}/claim-booking`)
      localStorage.removeItem('tt_pending_claim')
      setPendingClaim(false)
      setTrip(await api.get(`/discover/trips/${slug}`))
      showToast('Noted! The host will confirm your payment shortly ✓')
    } catch (e: any) { showToast(e.message) }
  }

  const dismissClaim = () => { localStorage.removeItem('tt_pending_claim'); setPendingClaim(false) }

  const joinWaitlist = async () => {
    if (!user) return navigate('/login?mode=signup')
    try {
      await api.post(`/discover/trips/${slug}/waitlist`)
      setTrip(await api.get(`/discover/trips/${slug}`))
      showToast("You're on the waitlist — we'll notify you when a seat opens")
    } catch (e: any) { showToast(e.message) }
  }

  const cancelBooking = () => setCancelConfirm(true)

  const doCancel = async () => {
    setCancelConfirm(false)
    try {
      await api.post(`/discover/trips/${slug}/cancel-booking`)
      setTrip(await api.get(`/discover/trips/${slug}`))
      showToast('Booking cancelled')
    } catch (e: any) {
      showToast(e.message || 'Could not cancel booking')
    }
  }

  if (notFound) {
    return (
      <div className="fade-up" style={{ paddingTop: 40, textAlign: 'center' }}>
        <div className="empty-emoji">🧭</div>
        <h1>Trip not found</h1>
        <p className="muted">This trip may have been unpublished or the link is wrong.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>Back to discovery</Link>
      </div>
    )
  }
  if (!trip) return <Spinner />

  // Hub navigation — only available after the user has a booking (claimed or confirmed).
  // claim-booking already calls findOrCreateHub on the server, so join is idempotent here.
  const joinHub = async () => {
    try {
      const { groupId } = await api.post(`/discover/trips/${slug}/join`)
      navigate(`/groups/${groupId}?joined=1`)
    } catch (e: any) { showToast(e.message || 'Could not open the hub') }
  }

  return (
    <div className="fade-up" style={{ paddingTop: 16 }}>
      <Link to="/" className="back-link">← Back to discovery</Link>
      {cancelConfirm && (
        <div className="book-state book-state-wait" style={{ marginBottom: 12, gap: 12 }}>
          <div><strong>Cancel your booking?</strong><span className="tiny">Your seat will go back to the waitlist.</span></div>
          <div className="row-actions">
            <button className="btn btn-ghost small" onClick={() => setCancelConfirm(false)}>Keep booking</button>
            <button className="btn btn-primary small" onClick={doCancel}>Yes, cancel</button>
          </div>
        </div>
      )}
      <TripDetailsView trip={trip} bookable={trip.bookable} onBook={book} busy={busy} withNav={!!user?.onboarded}
        onJoinHub={trip.myBookingStatus ? joinHub : undefined}
        pendingClaim={pendingClaim} onClaim={user ? claim : undefined} onDismissClaim={dismissClaim}
        onJoinWaitlist={joinWaitlist} onCancelBooking={user && trip.myBookingStatus ? cancelBooking : undefined} />
      <ReviewSection
        targetType="partner_trip"
        targetId={trip.id}
        canReview={!!user && (trip.myBookingStatus === 'confirmed' || !!trip.joined)}
      />
      {toast}
    </div>
  )
}
