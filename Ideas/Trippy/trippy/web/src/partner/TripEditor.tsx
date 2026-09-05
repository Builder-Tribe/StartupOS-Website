import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { papi } from './partnerApi'
import { Spinner, StarDisplay, useToast } from '../components'
import { fmtDate } from '../api'

const CATEGORIES = [
  'bike-expedition', 'motorcycle-tour', 'road-trip', 'trekking', 'backpacking', 'beach', 'spiritual', 'adventure'
]
const DIFFICULTIES = ['easy', 'moderate', 'difficult']

// A blank itinerary day template used by the builder.
const emptyDay = { title: '', description: '', location: '', activities: [] as string[], accommodation: '', meals: [] as string[] }

// Trip Hub panel (PRD 3.8): operator view of confirmed travelers + announcement posting
function HubPanel({ tripId }: { tripId: string }) {
  const [hub, setHub] = useState<any>(null)
  const [announce, setAnnounce] = useState('')
  const [posting, setPosting] = useState(false)
  const [toast, showToast] = useToast()

  const load = () => papi.get(`/trips/${tripId}/hub`).then(setHub).catch(() => {})
  useEffect(() => { load() }, [tripId])

  if (!hub) return null
  if (!hub.hubCreated) return (
    <section className="crm-card">
      <h3>Travellers' hub</h3>
      <p className="muted small">No hub yet — it's created automatically when the first traveller claims a booking. Once active, you'll see all members here and can post announcements directly into their group chat.</p>
    </section>
  )

  const post = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!announce.trim()) return
    setPosting(true)
    try {
      await papi.post(`/trips/${tripId}/hub/announce`, { content: announce.trim() })
      setAnnounce('')
      showToast('Announcement sent to all hub members ✓')
      load()
    } catch (e: any) { showToast(e.message) }
    finally { setPosting(false) }
  }

  const STATUS_COLOR: Record<string, string> = { confirmed: 'ok', claimed: 'warn', joined: 'muted' }
  const STATUS_LABEL: Record<string, string> = { confirmed: 'Confirmed', claimed: 'Pending', joined: 'Joined hub' }

  return (
    <section className="crm-card" id="sec-hub">
      <div className="itin-head">
        <h2>Travellers' hub</h2>
        <span className="muted small">{hub.confirmedCount} confirmed · {hub.claimedCount} pending · {hub.memberCount} in hub</span>
      </div>

      <div className="hub-member-list">
        {hub.members.map((m: any) => (
          <div key={m.id} className="crm-booking-row">
            <span className="a-avatar" style={{ background: m.avatarColor }}>{m.avatarEmoji}</span>
            <div className="crm-booking-main">
              <strong>{m.name || 'Traveller'}</strong>
              <span className="muted small">{m.email}</span>
            </div>
            <span className={`crm-status crm-status-${STATUS_COLOR[m.bookingStatus] || 'muted'}`}>
              {STATUS_LABEL[m.bookingStatus] || m.bookingStatus}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 14, margin: '0 0 10px' }}>📣 Post an announcement</h3>
        <p className="muted small" style={{ marginBottom: 10 }}>Announcements land in the group chat pinned and notify all {hub.memberCount} members.</p>
        <form onSubmit={post} style={{ display: 'flex', gap: 8 }}>
          <input
            value={announce} onChange={e => setAnnounce(e.target.value)}
            placeholder="e.g. Please meet at New Delhi station by 6 AM on Day 1…"
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary small" disabled={posting || !announce.trim()}>
            {posting ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>

      {hub.announcements.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="overline" style={{ marginBottom: 8 }}>Recent announcements</div>
          {hub.announcements.map((a: any, i: number) => (
            <div key={i} className="crm-review-row">
              <div className="crm-review-header">
                <span><strong>{a.senderName}</strong></span>
                <span className="muted small">{fmtDate(a.createdAt)}</span>
              </div>
              <p className="crm-review-body small">{a.content}</p>
            </div>
          ))}
        </div>
      )}
      {toast}
    </section>
  )
}

function ReviewsPanel({ tripId }: { tripId: string }) {
  const [data, setData] = useState<any>(null)
  useEffect(() => {
    fetch(`/api/reviews?targetType=partner_trip&targetId=${tripId}`)
      .then(r => r.json()).then(setData).catch(() => {})
  }, [tripId])
  if (!data || data.count === 0) return (
    <section className="crm-card">
      <h3>Traveller reviews</h3>
      <p className="muted small">{data ? 'No reviews yet — reviews appear here once travellers complete their trip.' : 'Loading…'}</p>
    </section>
  )
  return (
    <section className="crm-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Traveller reviews</h3>
        <StarDisplay rating={data.avgRating} count={data.count} />
      </div>
      <div className="crm-review-list">
        {data.reviews.map((rv: any) => (
          <div key={rv.id} className="crm-review-row">
            <div className="crm-review-header">
              <span>{rv.reviewer?.avatarEmoji || '👤'} <strong>{rv.reviewer?.name || 'Traveller'}</strong></span>
              <StarDisplay rating={rv.rating} />
              <span className="muted small">{fmtDate(rv.createdAt)}</span>
            </div>
            {rv.title && <div className="crm-review-title">{rv.title}</div>}
            {rv.body && <p className="crm-review-body small">{rv.body}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

// Bookings backbone (PRD 2.14): travellers claim "I paid" on the trip page;
// the host verifies each claim against their payment provider and decides here.
function BookingsPanel({ tripId }: { tripId: string }) {
  const [data, setData] = useState<any>(null)
  const load = () => papi.get(`/trips/${tripId}/bookings`).then(setData)
  useEffect(() => { load() }, [tripId])
  if (!data) return null
  const a = data.availability
  const decide = async (bookingId: string, action: 'confirm' | 'reject') => {
    await papi.post(`/trips/${tripId}/bookings/${bookingId}/decide`, { action })
    await load()
  }
  const STATUS_META: Record<string, [string, string]> = { claimed: ['To verify', 'warn'], confirmed: ['Confirmed', 'ok'], rejected: ['Rejected', 'err'], cancelled: ['Cancelled', 'muted'] }
  return (
    <section className="crm-card" id="sec-bookings">
      <div className="itin-head">
        <h2>Bookings</h2>
        <span className="muted small">
          {a.capacity != null ? `${a.confirmed} confirmed · ${a.claimed} to verify · ${a.seatsLeft} of ${a.capacity} seats left` : `${a.confirmed} confirmed · ${a.claimed} to verify · no seat cap set`}
          {data.waitlistCount > 0 && ` · ${data.waitlistCount} waitlisted`}
        </span>
      </div>
      {a.capacity == null && <p className="muted small">Tip: set “Max group size” above to enable live seat counts, sold-out state and the waitlist.</p>}
      {data.bookings.length === 0 && <p className="muted">No bookings yet. When travellers pay on your page and confirm on Trippy, they appear here for verification.</p>}
      {data.bookings.map((b: any) => (
        <div key={b.id} className="crm-booking-row">
          <span className="a-avatar" style={{ background: b.traveller.avatarColor }}>{b.traveller.avatarEmoji}</span>
          <div className="crm-booking-main">
            <strong>{b.traveller.name || b.traveller.email}</strong>
            <span className="muted small">{b.traveller.email} · claimed {new Date(b.createdAt + 'Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>
          <span className={`crm-status crm-status-${STATUS_META[b.status]?.[1] || 'muted'}`}>{STATUS_META[b.status]?.[0] || b.status}</span>
          {b.status === 'claimed' && <>
            <button className="crm-act crm-act-primary" onClick={() => decide(b.id, 'confirm')}>Confirm</button>
            <button className="crm-act crm-act-danger" onClick={() => decide(b.id, 'reject')}>Reject</button>
          </>}
        </div>
      ))}
      <p className="tiny muted" style={{ marginTop: 10 }}>Cross-check each claim against your payment provider before confirming — confirming marks the traveller as booked and holds their seat.</p>
    </section>
  )
}

export default function TripEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<any>(null)
  const [form, setForm] = useState<any>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [publishErrors, setPublishErrors] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [toast, showToast] = useToast()
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()

  // Map the server trip shape into the flat editable form.
  const toForm = (t: any) => ({
    name: t.name || '', shortDesc: t.shortDesc || '', longDesc: t.longDesc || '',
    destination: t.destination || '', destinationSlug: t.destinationSlug || '', startCity: t.startCity || '',
    startDate: t.startDate || '', endDate: t.endDate || '', durationDays: t.durationDays ?? '',
    category: t.category || '', tripType: t.tripType || 'group', difficulty: t.difficulty || '',
    minAge: t.minAge ?? '', maxGroupSize: t.maxGroupSize ?? '',
    price: t.price ?? '', originalPrice: t.originalPrice ?? '', pricingNotes: t.pricingNotes || '',
    inclusions: t.inclusions || [], exclusions: t.exclusions || [],
    coverImage: t.coverImage || '', paymentUrl: t.paymentUrl || '',
    tags: (t.tags || []).join(', '), media: t.media || [],
  })

  useEffect(() => {
    let alive = true
    const init = async () => {
      let t
      if (id) t = await papi.get(`/trips/${id}`)
      else { t = await papi.post('/trips', {}); navigate(`/partner/trips/${t.id}`, { replace: true }) }
      if (!alive) return
      setTrip(t); setForm(toForm(t))
    }
    init()
    return () => { alive = true && false }
  }, [id])

  // Debounced autosave whenever the form changes.
  const scheduleSave = useCallback((next: any) => {
    setSaveState('saving')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        const payload = {
          ...next,
          durationDays: next.durationDays === '' ? null : Number(next.durationDays),
          minAge: next.minAge === '' ? null : Number(next.minAge),
          maxGroupSize: next.maxGroupSize === '' ? null : Number(next.maxGroupSize),
          price: next.price === '' ? null : Number(next.price),
          originalPrice: next.originalPrice === '' ? null : Number(next.originalPrice),
          tags: next.tags.split(',').map((s: string) => s.trim()).filter(Boolean),
          media: (next.media || []).map((m: any) => m.url),
        }
        const updated = await papi.put(`/trips/${id}`, payload)
        setTrip(updated); setSaveState('saved')
      } catch (e: any) {
        setSaveState('idle'); showToast(e.message || 'Autosave failed')
      }
    }, 700)
  }, [id, showToast])

  const set = (patch: any) => setForm((f: any) => { const next = { ...f, ...patch }; scheduleSave(next); return next })

  if (!trip || !form) return <Spinner />

  // ---- Inclusions / exclusions list editors ----
  const listEditor = (key: 'inclusions' | 'exclusions', label: string, placeholder: string) => (
    <div>
      <label>{label}</label>
      {form[key].map((item: string, i: number) => (
        <div key={i} className="line-item">
          <input value={item} onChange={e => { const arr = [...form[key]]; arr[i] = e.target.value; set({ [key]: arr }) }} />
          <button type="button" className="btn btn-ghost small" onClick={() => set({ [key]: form[key].filter((_: any, j: number) => j !== i) })}>✕</button>
        </div>
      ))}
      <button type="button" className="btn btn-diy-soft small" onClick={() => set({ [key]: [...form[key], ''] })}>+ Add {placeholder}</button>
    </div>
  )

  // ---- Itinerary operations (persist immediately, server returns full trip) ----
  const addDay = async () => setTrip(await papi.post(`/trips/${id}/itinerary`, emptyDay))
  const updateDay = async (dayId: string, patch: any) => {
    // optimistic local update, then persist
    setTrip((t: any) => ({ ...t, itinerary: t.itinerary.map((d: any) => d.id === dayId ? { ...d, ...patch } : d) }))
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      const day = (trip.itinerary.find((d: any) => d.id === dayId)) || {}
      await papi.put(`/trips/${id}/itinerary/${dayId}`, { ...day, ...patch })
    }, 500)
  }
  const deleteDay = async (dayId: string) => setTrip(await papi.del(`/trips/${id}/itinerary/${dayId}`))
  const moveDay = async (index: number, dir: -1 | 1) => {
    const order = trip.itinerary.map((d: any) => d.id)
    const j = index + dir
    if (j < 0 || j >= order.length) return
    ;[order[index], order[j]] = [order[j], order[index]]
    setTrip(await papi.put(`/trips/${id}/itinerary-reorder`, { order }))
  }

  const flushThen = async (fn: () => Promise<any>) => {
    clearTimeout(saveTimer.current)
    // Persist current form before publishing so server validates the latest state.
    const payload = {
      ...form,
      durationDays: form.durationDays === '' ? null : Number(form.durationDays),
      minAge: form.minAge === '' ? null : Number(form.minAge),
      maxGroupSize: form.maxGroupSize === '' ? null : Number(form.maxGroupSize),
      price: form.price === '' ? null : Number(form.price),
      originalPrice: form.originalPrice === '' ? null : Number(form.originalPrice),
      tags: form.tags.split(',').map((s: string) => s.trim()).filter(Boolean),
      media: (form.media || []).map((m: any) => m.url),
    }
    await papi.put(`/trips/${id}`, payload)
    setSaveState('saved')
    return fn()
  }

  const publish = async () => {
    setBusy(true); setPublishErrors([])
    try {
      const updated = await flushThen(() => papi.post(`/trips/${id}/publish`))
      setTrip(updated)
      showToast('Published — your trip is now live on Trippy 🎉')
      setTimeout(() => navigate('/partner'), 900)
    } catch (e: any) {
      if (e.errors?.length) setPublishErrors(e.errors)
      else showToast(e.message || 'Could not publish')
    } finally { setBusy(false) }
  }

  const unpublish = async () => {
    setBusy(true)
    try { setTrip(await papi.post(`/trips/${id}/unpublish`)); showToast('Moved back to draft') }
    finally { setBusy(false) }
  }

  const isPublished = trip.status === 'published'

  // Section completion checklist (UX audit P0) — mirrors server-side publish validation.
  const sections = [
    { id: 'sec-basic', label: 'Basic information', done: !!(form.name && form.shortDesc && form.destination && form.startDate && form.endDate && form.category) },
    { id: 'sec-pricing', label: 'Pricing', done: form.price !== '' && Number(form.price) > 0 },
    { id: 'sec-payment', label: 'Payment link', done: /^https:\/\//.test(form.paymentUrl) },
    { id: 'sec-itinerary', label: 'Itinerary', done: trip.itinerary.length > 0 },
    ...(isPublished ? [{ id: 'sec-hub', label: "Travellers' hub", done: true }] : []),
  ]
  const pct = Math.round(sections.filter(s => s.done).length / sections.length * 100)

  return (
    <div className="fade-up crm-editor">
      <div className="crm-editor-head">
        <Link to="/partner" className="back-link">← All trips</Link>
        <div className="crm-editor-status">
          <span className={`crm-status crm-status-${trip.status}`}>{trip.status}</span>
          <span className="save-indicator">{saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'All changes saved' : ''}</span>
        </div>
      </div>

      <h1 className="crm-editor-title">{form.name || 'New trip'}</h1>

      {publishErrors.length > 0 && (
        <div className="publish-errors">
          <strong>Complete these before publishing:</strong>
          <ul>{publishErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}

      <div className="crm-editor-layout">
      <aside className="crm-editor-rail">
        <div className="crm-rail-progress">
          <div className="crm-rail-pct">{pct}% ready</div>
          <div className="crm-rail-bar"><span style={{ width: `${pct}%` }} /></div>
        </div>
        {sections.map(s => (
          <a key={s.id} href={`#${s.id}`} className={`crm-rail-item ${s.done ? 'done' : ''}`}
            onClick={e => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>
            <i className={s.done ? 'ph-fill ph-check-circle' : 'ph-bold ph-circle'} /> {s.label}
          </a>
        ))}
      </aside>
      <div className="crm-editor-body">

      {/* ---- Basic info ---- */}
      <section className="crm-card" id="sec-basic">
        <h2>Basic information</h2>
        <label>Trip name</label>
        <input value={form.name} onChange={e => set({ name: e.target.value })} placeholder="e.g. Hampta Pass Trek & Camp" />
        <label>Short description</label>
        <input value={form.shortDesc} onChange={e => set({ shortDesc: e.target.value })} placeholder="One line that sells the trip" />
        <label>Detailed description</label>
        <textarea rows={4} value={form.longDesc} onChange={e => set({ longDesc: e.target.value })} placeholder="The full pitch — what makes this trip special" />
        <div className="crm-grid2">
          <div><label>Destination</label><input value={form.destination} onChange={e => set({ destination: e.target.value })} placeholder="Manali, Himachal Pradesh" /></div>
          <div><label>Discovery link (destination slug)</label><input value={form.destinationSlug} onChange={e => set({ destinationSlug: e.target.value })} placeholder="manali (optional)" /></div>
        </div>
        <div className="crm-grid2">
          <div><label>Starting location</label><input value={form.startCity} onChange={e => set({ startCity: e.target.value })} placeholder="Delhi" /></div>
          <div><label>Duration (days)</label><input inputMode="numeric" value={form.durationDays} onChange={e => set({ durationDays: e.target.value.replace(/\D/g, '') })} /></div>
        </div>
        <div className="crm-grid2">
          <div><label>Start date</label><input type="date" value={form.startDate} onChange={e => set({ startDate: e.target.value })} /></div>
          <div><label>End date</label><input type="date" value={form.endDate} min={form.startDate} onChange={e => set({ endDate: e.target.value })} /></div>
        </div>
        <div className="crm-grid3">
          <div>
            <label>Category</label>
            <select value={form.category} onChange={e => set({ category: e.target.value })}>
              <option value="">Select…</option>
              <option value="bike-expedition">🏍️ Bike Expedition</option>
              <option value="motorcycle-tour">🏍️ Motorcycle Tour</option>
              <option value="road-trip">🚗 Road Trip</option>
              <option value="trekking">🥾 Trekking</option>
              <option value="backpacking">🎒 Backpacking</option>
              <option value="beach">🏖️ Beach & Coastal</option>
              <option value="spiritual">🧘 Spiritual & Wellness</option>
              <option value="adventure">⚡ General Adventure</option>
            </select>
          </div>
          <div><label>Difficulty</label><select value={form.difficulty} onChange={e => set({ difficulty: e.target.value })}><option value="">—</option>{DIFFICULTIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label>Trip type</label><input value={form.tripType} onChange={e => set({ tripType: e.target.value })} placeholder="group" /></div>
        </div>
        {(form.category === 'bike-expedition' || form.category === 'motorcycle-tour' || form.category === 'road-trip') && (
          <div style={{ padding: '12px 14px', background: 'var(--brand-soft)', borderRadius: 10, marginTop: -4 }}>
            <strong style={{ fontSize: 13, color: 'var(--brand-dark)' }}>
              {form.category === 'road-trip' ? '🚗 Road Trip Logistics' : '🏍️ Bike Expedition Logistics'}
            </strong>
            <p className="muted small" style={{ margin: '4px 0 0' }}>
              Tip for hosts: Mention bike/vehicle models provided (e.g. <em>Royal Enfield Himalayan 450 provided</em> or <em>BYOB — Bring Your Own Bike</em>), backup van, mechanic support, and fuel terms in description & tags.
            </p>
          </div>
        )}
        <div className="crm-grid3">
          <div><label>Max group size</label><input inputMode="numeric" value={form.maxGroupSize} onChange={e => set({ maxGroupSize: e.target.value.replace(/\D/g, '') })} /></div>
          <div><label>Minimum age</label><input inputMode="numeric" value={form.minAge} onChange={e => set({ minAge: e.target.value.replace(/\D/g, '') })} /></div>
          <div><label>Tags (comma-separated)</label><input value={form.tags} onChange={e => set({ tags: e.target.value })} placeholder="trekking, camping" /></div>
        </div>
        <label>Cover image URL (https)</label>
        <input value={form.coverImage} onChange={e => set({ coverImage: e.target.value })} placeholder="https://…" />
        {form.coverImage && <div className="cover-thumb" style={{ backgroundImage: `url(${form.coverImage})` }} />}
        <label>Gallery image URLs</label>
        {form.media.map((m: any, i: number) => (
          <div key={i} className="line-item">
            <input value={m.url} onChange={e => { const media = [...form.media]; media[i] = { ...media[i], url: e.target.value }; set({ media }) }} placeholder="https://…" />
            <button type="button" className="btn btn-ghost small" onClick={() => set({ media: form.media.filter((_: any, j: number) => j !== i) })}>✕</button>
          </div>
        ))}
        <button type="button" className="btn btn-diy-soft small" onClick={() => set({ media: [...form.media, { url: '' }] })}>+ Add gallery image</button>
      </section>

      {/* ---- Pricing ---- */}
      <section className="crm-card" id="sec-pricing">
        <h2>Pricing</h2>
        <div className="crm-grid3">
          <div><label>Price (₹)</label><input inputMode="numeric" value={form.price} onChange={e => set({ price: e.target.value.replace(/\D/g, '') })} /></div>
          <div><label>Original price (optional)</label><input inputMode="numeric" value={form.originalPrice} onChange={e => set({ originalPrice: e.target.value.replace(/\D/g, '') })} /></div>
          <div><label>Currency</label><input value="INR" disabled /></div>
        </div>
        <label>Pricing notes</label>
        <input value={form.pricingNotes} onChange={e => set({ pricingNotes: e.target.value })} placeholder="e.g. Ex-Delhi. Group discounts for 4+." />
        <div className="crm-grid2">
          {listEditor('inclusions', "What's included", 'inclusion')}
          {listEditor('exclusions', "What's not included", 'exclusion')}
        </div>
      </section>

      {/* ---- Payment link ---- */}
      <section className="crm-card" id="sec-payment">
        <h2>Payment link</h2>
        <p className="muted small">Trippy doesn't process payments in Phase 1. Travellers who tap "Book Now" are sent to your secure external payment page.</p>
        <div className="crm-payguide">
          <i className="ph-bold ph-lightbulb" />
          <div>
            <strong>How to get a payment link</strong>
            <p className="muted small">Create a no-code payment page in your payment provider (Razorpay Payment Pages, Instamojo Smart Links, or Stripe Payment Links), set the trip price there, and paste the https link below. Travellers pay you directly — Trippy never touches the money.</p>
          </div>
        </div>
        <label>External payment URL (https)</label>
        <input value={form.paymentUrl} onChange={e => set({ paymentUrl: e.target.value })} placeholder="https://rzp.io/l/your-trip" />
        {form.paymentUrl && !/^https:\/\//.test(form.paymentUrl) && <p className="error small">Must be a valid https:// URL.</p>}
      </section>

      {/* ---- Bookings (backbone: verify traveller payment claims) ---- */}
      {isPublished && <BookingsPanel tripId={id!} />}
      {/* ---- Travellers' hub (PRD 3.8): operator view + announcements ---- */}
      {isPublished && <HubPanel tripId={id!} />}
      {isPublished && <ReviewsPanel tripId={id!} />}

      {/* ---- Itinerary builder ---- */}
      <section className="crm-card" id="sec-itinerary">
        <div className="itin-head">
          <h2>Day-by-day itinerary</h2>
          <button type="button" className="btn btn-secondary small" onClick={addDay}>+ Add day</button>
        </div>
        {trip.itinerary.length === 0 && <p className="muted">No days yet. Add at least one day before publishing.</p>}
        {trip.itinerary.map((d: any, i: number) => (
          <div key={d.id} className="itin-editor-day">
            <div className="itin-editor-daynum">
              Day {d.dayNumber}
              <div className="itin-move">
                <button type="button" disabled={i === 0} onClick={() => moveDay(i, -1)} title="Move up">↑</button>
                <button type="button" disabled={i === trip.itinerary.length - 1} onClick={() => moveDay(i, 1)} title="Move down">↓</button>
                <button type="button" className="itin-del" onClick={() => deleteDay(d.id)} title="Delete day">✕</button>
              </div>
            </div>
            <div className="itin-editor-fields">
              <input value={d.title} onChange={e => updateDay(d.id, { title: e.target.value })} placeholder="Day title" />
              <div className="crm-grid2">
                <input value={d.location} onChange={e => updateDay(d.id, { location: e.target.value })} placeholder="Location" />
                <input value={d.accommodation} onChange={e => updateDay(d.id, { accommodation: e.target.value })} placeholder="Accommodation (optional)" />
              </div>
              <textarea rows={2} value={d.description} onChange={e => updateDay(d.id, { description: e.target.value })} placeholder="What happens on this day" />
              <div className="crm-grid2">
                <input value={(d.activities || []).join(', ')} onChange={e => updateDay(d.id, { activities: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} placeholder="Activities (comma-separated)" />
                <input value={(d.meals || []).join(', ')} onChange={e => updateDay(d.id, { meals: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} placeholder="Meals included (comma-separated)" />
              </div>
            </div>
          </div>
        ))}
      </section>

      </div>
      </div>

      {/* ---- Sticky action bar ---- */}
      <div className="crm-actionbar">
        <span className="save-indicator">{saveState === 'saving' ? 'Saving…' : 'All changes saved'}</span>
        <div className="crm-actionbar-btns">
          <Link to={`/partner/trips/${id}/preview`} target="_blank" className="btn btn-secondary">Preview ↗</Link>
          {isPublished
            ? <button className="btn btn-ghost" disabled={busy} onClick={unpublish}>Unpublish</button>
            : <button className="btn btn-primary" disabled={busy} onClick={publish}>{busy ? 'Publishing…' : 'Publish trip'}</button>}
        </div>
      </div>
      {toast}
    </div>
  )
}
