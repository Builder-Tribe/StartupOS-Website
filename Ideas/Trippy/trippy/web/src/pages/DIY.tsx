import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, fmtDate, inr } from '../api'
import { Avatar, ScorePill, Spinner, useToast } from '../components'

// The DIY "Build Your Own Trip" stepper (PRD 1.5): hostel → people → group.
// Entered from the Results screen's "Build your own trip" CTA.
// After group creation we route to the Trip Hub (/groups/:id) for the itinerary.

type Step = 'overview' | 'hostel' | 'people' | 'group'
const STEPS: { key: Step; label: string }[] = [
  { key: 'hostel', label: 'Stay' },
  { key: 'people', label: 'People' },
  { key: 'group', label: 'Group' },
]

const dayDiff = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000)

function DestPicker({ navigate, initialStart, initialEnd }: { navigate: (to: string) => void; initialStart?: string; initialEnd?: string }) {
  const [destinations, setDestinations] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [start, setStart] = useState(() => {
    if (initialStart) return initialStart
    const d = new Date(); d.setDate(d.getDate() + 14)
    return d.toISOString().slice(0, 10)
  })
  const [end, setEnd] = useState(() => {
    if (initialEnd) return initialEnd
    const d = new Date(); d.setDate(d.getDate() + 18)
    return d.toISOString().slice(0, 10)
  })

  useEffect(() => { api.get('/destinations').then(setDestinations).catch(() => {}) }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return destinations
    return destinations.filter(d => (d.name || '').toLowerCase().includes(q) || (d.state || '').toLowerCase().includes(q) || (d.slug || '').toLowerCase().includes(q))
  }, [destinations, query])

  const handleSelect = (destName: string) => {
    setQuery(destName)
    setFocused(false)
  }

  const handleStartPlan = () => {
    const target = query.trim()
    if (!target) return
    navigate(`/diy?destination=${encodeURIComponent(target)}&start=${start}&end=${end}`)
  }

  return (
    <div className="fade-up" style={{ paddingTop: 28, maxWidth: 560, margin: '0 auto', paddingLeft: 16, paddingRight: 16 }}>
      <div className="pill pill-coral" style={{ marginBottom: 12 }}>🛠️ DIY Trip Builder</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>Where are you headed?</h1>
      <p className="muted" style={{ fontSize: '1.05rem', lineHeight: 1.5, marginBottom: 24 }}>
        Type any place or city to build your custom itinerary and match with travelers on your dates.
      </p>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 24, boxShadow: '0 12px 36px rgba(15,23,42,0.08)' }}>
        <div style={{ position: 'relative' }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Destination or City</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="e.g. Ooty, Pondicherry, Munnar, Goa, Chikmagalur..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={e => { if (e.key === 'Enter' && query.trim()) handleStartPlan() }}
              style={{ width: '100%', padding: '12px 14px', fontSize: '1rem', borderRadius: 10, border: '1px solid var(--border)' }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', opacity: 0.5, fontSize: '1.1rem' }}
              >
                ✕
              </button>
            )}
          </div>

          {focused && filtered.length > 0 && (
            <div
              className="diy-suggest-dropdown"
              style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, marginTop: 4,
                background: 'var(--bg-card, #fff)', border: '1px solid var(--border)', borderRadius: 12,
                boxShadow: '0 12px 32px rgba(0,0,0,0.15)', maxHeight: 260, overflowY: 'auto'
              }}
            >
              {filtered.map(d => (
                <div
                  key={d.slug}
                  onMouseDown={() => handleSelect(d.name)}
                  style={{
                    padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', borderBottom: '1px solid var(--border-light, #f1f5f9)'
                  }}
                  className="diy-suggest-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.2rem' }}>{d.emoji || '📍'}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{d.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.state || 'India'}</div>
                    </div>
                  </div>
                  {d.activeTripCount > 0 ? (
                    <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>⚡ {d.activeTripCount} trips</span>
                  ) : (
                    <span className="badge badge-slate" style={{ fontSize: '0.75rem' }}>🛠️ DIY Plan</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Select Popular Destinations */}
        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
            Popular Destinations
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {destinations.slice(0, 8).map(d => (
              <button
                key={d.slug}
                type="button"
                className={`btn btn-sm ${query.toLowerCase() === d.name.toLowerCase() ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setQuery(d.name)}
                style={{ borderRadius: 20, padding: '6px 12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>{d.emoji}</span>
                <span>{d.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="row2">
          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>From</label>
            <input type="date" value={start} onChange={e => setStart(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>To</label>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }} />
          </div>
        </div>

        <button
          className="btn btn-diy"
          disabled={!query.trim()}
          onClick={handleStartPlan}
          style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 700, borderRadius: 12, marginTop: 6 }}
        >
          Plan DIY Trip for {query.trim() || 'this place'} →
        </button>
      </div>
    </div>
  )
}

export default function DIY() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const destination = params.get('destination') || ''
  const start = params.get('start') || ''
  const end = params.get('end') || ''
  const nights = start && end ? Math.max(1, dayDiff(start, end)) : 3
  const days = nights + 1

  const [step, setStep] = useState<Step>('overview')
  const [compare, setCompare] = useState<any>(null)
  const [tripId, setTripId] = useState('')
  const [hostels, setHostels] = useState<any[] | null>(null)
  const [selectedHostel, setSelectedHostel] = useState<any>(null)
  const [stayCategory, setStayCategory] = useState<'hostel' | 'airbnb' | 'hotel' | 'own'>('hostel')
  const [matches, setMatches] = useState<any[] | null>(null)
  const [groupName, setGroupName] = useState('')
  const [excluded, setExcluded] = useState<string[]>([])
  const [nearbyTravelers, setNearbyTravelers] = useState<any[] | null>(null)
  const [nearbyConn, setNearbyConn] = useState<Record<string, string>>({}) // userId → 'sent'
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [altStart, setAltStart] = useState(start)
  const [altEnd, setAltEnd] = useState(end)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [toast, showToast] = useToast()

  // Add / Edit Stay Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStayId, setEditingStayId] = useState<string | null>(null)
  const [newStay, setNewStay] = useState({
    name: '',
    propertyType: 'hostel' as 'hostel' | 'airbnb' | 'hotel' | 'homestay',
    area: '',
    pricePerNight: '',
    bookingUrl: ''
  })
  const [submittingStay, setSubmittingStay] = useState(false)

  const openAddModal = (category?: 'hostel' | 'airbnb' | 'hotel' | 'homestay') => {
    setEditingStayId(null)
    setNewStay({
      name: '',
      propertyType: category || (stayCategory === 'airbnb' ? 'airbnb' : stayCategory === 'hotel' ? 'hotel' : 'hostel'),
      area: '',
      pricePerNight: '',
      bookingUrl: ''
    })
    setShowAddModal(true)
  }

  const openEditModal = (h: any) => {
    setEditingStayId(h.id)
    setNewStay({
      name: h.name || '',
      propertyType: h.propertyType || 'hostel',
      area: h.area || '',
      pricePerNight: h.pricePerNight ? String(h.pricePerNight) : '',
      bookingUrl: h.bookingUrl || ''
    })
    setShowAddModal(true)
  }

  const handleSaveStay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStay.name.trim()) return showToast('Please enter property or stay name')
    setSubmittingStay(true)
    try {
      if (editingStayId) {
        const updated = await api.put(`/hostels/${editingStayId}`, {
          name: newStay.name.trim(),
          destination,
          propertyType: newStay.propertyType,
          area: newStay.area.trim() || d?.name || destination,
          pricePerNight: Number(newStay.pricePerNight) || (newStay.propertyType === 'hotel' ? 2500 : newStay.propertyType === 'airbnb' ? 2000 : 750),
          bookingUrl: newStay.bookingUrl.trim() || undefined,
        })
        setHostels(prev => (prev || []).map(item => item.id === editingStayId ? updated : item))
        if (selectedHostel?.id === editingStayId) setSelectedHostel(updated)
        setShowAddModal(false)
        showToast(`✏️ Stay updated successfully!`)
      } else {
        const created = await api.post('/hostels', {
          name: newStay.name.trim(),
          destination,
          propertyType: newStay.propertyType,
          area: newStay.area.trim() || d?.name || destination,
          pricePerNight: Number(newStay.pricePerNight) || (newStay.propertyType === 'hotel' ? 2500 : newStay.propertyType === 'airbnb' ? 2000 : 750),
          bookingUrl: newStay.bookingUrl.trim() || undefined,
        })
        setHostels(prev => [created, ...(prev || [])])
        setSelectedHostel(created)
        setStayCategory(newStay.propertyType === 'homestay' ? 'airbnb' : newStay.propertyType)
        setShowAddModal(false)
        showToast(`🎉 "${created.name}" added & selected as your base!`)
      }
      setEditingStayId(null)
      setNewStay({ name: '', propertyType: 'hostel', area: '', pricePerNight: '', bookingUrl: '' })
    } catch (err: any) {
      showToast(err.message || 'Failed to save stay')
    } finally {
      setSubmittingStay(false)
    }
  }

  const handleDeleteStay = async (h: any, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`Are you sure you want to delete "${h.name}"?`)) return
    try {
      await api.del(`/hostels/${h.id}`)
      setHostels(prev => (prev || []).filter(item => item.id !== h.id))
      if (selectedHostel?.id === h.id) setSelectedHostel(null)
      showToast(`🗑️ "${h.name}" deleted`)
    } catch (err: any) {
      showToast(err.message || 'Failed to delete stay')
    }
  }

  // Load cost model + make sure an upcoming trip exists so matching activates
  // (the redesign creates the trip lazily instead of gating discovery on it)
  useEffect(() => {
    if (!destination) return
    let isSubscribed = true
    api.get(`/compare?destination=${encodeURIComponent(destination)}&days=${days}`)
      .then(d => {
        if (!isSubscribed) return
        setCompare(d)
        setGroupName(g => g || `${d.destination?.name || destination} Crew`)
      })
      .catch(err => {
        console.error('Failed to load compare data', err)
        if (!isSubscribed) return
        setCompare({
          destination: { name: destination, emoji: '🎒', state: 'India' },
          days,
          diy: {
            breakdown: { stay: 600 * nights, food: 500 * days, localTransport: 300 * days, activities: 1000, intercityTransport: 2500 },
            total: 600 * nights + 800 * days + 3500,
            perDay: 1200,
            steps: [`Book return transport to ${destination}`, `Pick a hostel in ${destination}`, `Connect with travelers on same dates`],
            effort: 'low',
            activities: [],
          },
          groupTrips: [],
          summary: `Doing ${destination} yourself for ${days} days. Trippy will help you match with fellow solo travelers on your dates.`,
        })
        setGroupName(g => g || `${destination} Crew`)
      })

    if (start && end) {
      api.get('/trips').then(async (trips: any[]) => {
        const existing = trips.find(t => (t.destination || '').toLowerCase() === destination.toLowerCase() && t.start_date <= end && t.end_date >= start)
        if (existing) setTripId(existing.id)
        else {
          const t = await api.post('/trips', { destination, startDate: start, endDate: end, flexible: true }).catch(() => null)
          if (t && t.id) setTripId(t.id)
        }
      }).catch(() => {})
    }

    return () => { isSubscribed = false }
  }, [destination, days, start, end])

  useEffect(() => {
    if (step === 'hostel' && !hostels) api.get(`/hostels?destination=${encodeURIComponent(destination)}`).then(setHostels).catch(() => setHostels([]))
    if (step === 'people' && !matches && tripId) api.get(`/matches?tripId=${tripId}`).then(d => setMatches(d.matches)).catch(() => setMatches([]))
  }, [step, tripId, destination])

  // When no date-exact matches exist, fetch travelers on other dates so we can
  // offer them as an alternative rather than showing a dead-end empty state.
  useEffect(() => {
    if (step === 'people' && matches !== null && matches.length === 0 && nearbyTravelers === null) {
      api.get(`/matches/nearby?destination=${encodeURIComponent(destination)}`).then(setNearbyTravelers).catch(() => setNearbyTravelers([]))
    }
  }, [step, matches, destination])

  const connected = useMemo(() => (matches || []).filter(m => m.connection?.status === 'accepted'), [matches])
  const members = connected.filter(m => !excluded.includes(m.user.id))

  if (!destination) {
    return <DestPicker navigate={navigate} initialStart={start} initialEnd={end} />
  }
  if (!compare) return <Spinner />
  const d = compare.destination

  const cheapest = compare.groupTrips.length ? Math.min(...compare.groupTrips.map((t: any) => t.price)) : null
  const saving = cheapest != null ? cheapest - compare.diy.total : null
  const savingLabel = saving == null ? 'flexible & social' : saving > 0 ? `≈ ${inr(saving)} cheaper than a group trip` : `≈ ${inr(-saving)} more, fully flexible`

  const connect = async (m: any) => {
    try {
      await api.post('/connections', { toUserId: m.user.id })
      const res = await api.get(`/matches?tripId=${tripId}`)
      setMatches(res.matches)
      const fresh = res.matches.find((x: any) => x.user.id === m.user.id)
      showToast(fresh?.connection?.status === 'accepted'
        ? `You're connected with ${m.user.name.split(' ')[0]}!`
        : `Request sent to ${m.user.name.split(' ')[0]}`)
    } catch (err: any) {
      showToast(err.message)
    }
  }

  const createGroup = async () => {
    setError('')
    setCreating(true)
    try {
      const g = await api.post('/groups', {
        name: groupName, destination,
        startDate: start || undefined, endDate: end || undefined,
        memberIds: members.map(m => m.user.id),
      })
      // If a hostel was selected, record a stay for the user
      if (selectedHostel && start && end) {
        api.post(`/hostels/${selectedHostel.id}/stay`, { startDate: start, endDate: end, visible: true }).catch(() => {})
      }
      navigate(`/groups/${g.id}?new=1`)
    } catch (err: any) {
      setError(err.message)
      setCreating(false)
    }
  }

  const planSolo = async () => {
    if (creating) return
    setCreating(true)
    try {
      const g = await api.post('/groups', {
        name: groupName || `${d.name} Solo Trip`,
        destination,
        startDate: start || undefined,
        endDate: end || undefined,
        memberIds: [],
      })
      if (selectedHostel && start && end) {
        api.post(`/hostels/${selectedHostel.id}/stay`, { startDate: start, endDate: end, visible: true }).catch(() => {})
      }
      navigate(`/groups/${g.id}?new=1`)
    } catch (err: any) {
      showToast(err.message)
      setCreating(false)
    }
  }

  const stepDone = (k: Step) => (k === 'hostel' && !!selectedHostel) || (k === 'people' && connected.length > 0)

  return (
    <div className="fade-up" style={{ paddingTop: 18 }}>
      <button className="back-link" onClick={() => (step === 'overview' ? navigate(-1) : setStep('overview'))}>← Back</button>

      {step !== 'overview' && (
        <div className="stepper">
          {STEPS.map((s, i) => (
            <button key={s.key} className={`step-chip ${step === s.key ? 'active' : ''} ${stepDone(s.key) ? 'done' : ''}`} onClick={() => setStep(s.key)}>
              <span className="step-num">{stepDone(s.key) ? '✓' : i + 1}</span>
              {s.label}
            </button>
          ))}
          <button className="step-chip" disabled style={{ cursor: 'default' }}>
            <span className="step-num">4</span>
            Itinerary (in your Trip Hub)
          </button>
        </div>
      )}

      {step === 'overview' && (
        <>
          <div className="diy-overview">
            <div className="pill pill-coral">🛠️ Build your own trip</div>
            <h1>Here's what a DIY trip to {d.name} looks like</h1>
            <p>Four steps, fully flexible, and about <strong style={{ color: 'var(--diy-dark)' }}>{inr(compare.diy.total)}</strong> for {nights} night{nights > 1 ? 's' : ''} — {savingLabel}.</p>
          </div>
          <div className="path-grid">
            {[
              { n: 1, emoji: '🏨', title: 'Pick your stay', desc: 'Hostels, Airbnbs, Hotels or your own stay' },
              { n: 2, emoji: '🤝', title: 'Meet people', desc: 'Match with travelers on your dates' },
              { n: 3, emoji: '👥', title: 'Form a group', desc: 'Turn your connections into a crew' },
              { n: 4, emoji: '🗺️', title: 'Plan & travel', desc: 'Build the itinerary together in your Trip Hub' },
            ].map(p => (
              <div key={p.n} className="path-card">
                <div className="path-num">{p.n}</div>
                <div className="path-emoji">{p.emoji}</div>
                <strong>{p.title}</strong>
                <span>{p.desc}</span>
              </div>
            ))}
          </div>
          <div className="center">
            <button className="btn btn-diy" style={{ padding: '15px 34px', fontSize: 16, borderRadius: 14 }} onClick={() => setStep('hostel')}>Choose your stay & start →</button>
          </div>
        </>
      )}

      {step === 'hostel' && (
        <>
          <div className="dhead">
            <h1>🏨 Find your base in {d.name}</h1>
            {selectedHostel && <button className="btn btn-diy" onClick={() => setStep('people')}>Next: find people →</button>}
          </div>
          <div className="dsub" style={{ margin: '8px 0 18px', lineHeight: 1.5 }}>
            <span style={{ display: 'block', marginBottom: 4 }}>
              🎯 <strong>Persona 1 — Planning your stay:</strong> Select a hostel where Trippy members matching your vibe are already staying on your dates.
            </span>
            <span style={{ display: 'block', color: 'var(--text-muted)' }}>
              🔑 <strong>Persona 2 — Already booked:</strong> Select or add your stay below, or skip directly to your Trip Hub to build itineraries, manage schedules & match with nearby crews!
            </span>
          </div>

          {/* Stay Category Filter Tabs */}
          <div style={{ display: 'flex', gap: 10, margin: '18px 0 22px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className={`btn ${stayCategory === 'hostel' ? 'btn-diy' : 'btn-ghost'}`}
              onClick={() => setStayCategory('hostel')}
              style={{ borderRadius: 20, padding: '8px 16px', fontSize: '0.88rem' }}
            >
              🛏️ Hostels & Dorms
            </button>
            <button
              type="button"
              className={`btn ${stayCategory === 'airbnb' ? 'btn-diy' : 'btn-ghost'}`}
              onClick={() => setStayCategory('airbnb')}
              style={{ borderRadius: 20, padding: '8px 16px', fontSize: '0.88rem' }}
            >
              🏡 Airbnbs & Homestays
            </button>
            <button
              type="button"
              className={`btn ${stayCategory === 'hotel' ? 'btn-diy' : 'btn-ghost'}`}
              onClick={() => setStayCategory('hotel')}
              style={{ borderRadius: 20, padding: '8px 16px', fontSize: '0.88rem' }}
            >
              🏨 Boutique & Famous Hotels
            </button>
            <button
              type="button"
              className={`btn ${stayCategory === 'own' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setStayCategory('own')}
              style={{ borderRadius: 20, padding: '8px 16px', fontSize: '0.88rem' }}
            >
              🔑 I have my own stay / Booked elsewhere
            </button>
          </div>

          {stayCategory === 'own' ? (
            <div className="card" style={{ padding: 32, textAlign: 'center', margin: '20px 0', border: '1.5px dashed var(--brand)', borderRadius: 16, background: 'var(--bg-card)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔑</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Already have your stay booked elsewhere?</h3>
              <p className="muted" style={{ maxWidth: 520, margin: '0 auto 20px', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Log your booked stay to add it to our community map, or skip straight to your <strong>Trip Hub</strong> to build custom itineraries, organize travel schedules & match with nearby solo travellers going to {d.name}!
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setNewStay(s => ({ ...s, propertyType: 'hostel' }))
                    setShowAddModal(true)
                  }}
                  style={{ borderRadius: 12, padding: '10px 20px', fontWeight: 600 }}
                >
                  ➕ Log / Add my booked stay
                </button>
                <button
                  type="button"
                  className="btn btn-diy"
                  style={{ padding: '10px 24px', fontSize: '1rem', fontWeight: 700, borderRadius: 12 }}
                  onClick={() => { setSelectedHostel({ name: 'Booked Elsewhere / Own Stay', id: 'own' }); setStep('people') }}
                >
                  Skip stay & match with people →
                </button>
              </div>
            </div>
          ) : !hostels ? <Spinner /> : (
            <div className="hostel-grid">
              {hostels
                .filter(h => stayCategory === 'hostel' ? (h.propertyType === 'hostel' || !h.propertyType) : h.propertyType === stayCategory)
                .map(h => {
                  const sel = selectedHostel?.id === h.id
                  const badgeIcon = h.propertyType === 'airbnb' ? '🏡 Airbnb' : h.propertyType === 'hotel' ? '🏨 Hotel' : '🛏️ Hostel'
                  return (
                    <div key={h.id} className={`hostel-pick ${sel ? 'selected' : ''}`}>
                      {h.coverImage && (
                        <div style={{ height: 140, borderRadius: '12px 12px 0 0', overflow: 'hidden', margin: '-18px -18px 14px -18px', position: 'relative' }}>
                          <img src={h.coverImage} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <span className="badge badge-brand" style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(15,23,42,0.85)', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                            {badgeIcon}
                          </span>
                          {h.memberCount > 0 && (
                            <span className="badge badge-brand" style={{ position: 'absolute', top: 10, right: 10, background: 'var(--brand)', color: '#fff', fontSize: '0.78rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                              👥 {h.memberCount} member{h.memberCount === 1 ? '' : 's'} booked
                            </span>
                          )}
                        </div>
                      )}
                      <div className="hp-top">
                        <div>
                          <h3>{h.name}</h3>
                          <span className="small faint">{h.area || h.city}</span>
                        </div>
                        <div className="hp-price">{inr(h.pricePerNight)}<span className="per">/night</span></div>
                      </div>
                      <p className="hp-desc">{h.description}</p>
                      <div className="interest-row">
                        {(h.vibeTags || []).map((v: string) => <span key={v} className="chip-mini chip">{v}</span>)}
                      </div>
                      <div className="hp-foot" style={{ marginTop: 14, flexWrap: 'wrap', gap: 8 }}>
                        {h.memberCount > 0 ? (
                          <span className="member-badge" style={{ background: 'rgba(14, 159, 143, 0.12)', color: 'var(--brand-dark)', fontWeight: 700, padding: '4px 10px', borderRadius: 12 }}>
                            👥 {h.memberCount} member{h.memberCount === 1 ? '' : 's'} staying on your dates
                          </span>
                        ) : (
                          <span className="member-badge" style={{ opacity: 0.8 }}>
                            ⭐ {h.rating || 4.8} rating · 👥 Be 1st member staying here
                          </span>
                        )}
                        <button
                          className={`btn small ${sel ? 'btn-diy' : 'btn-diy-soft'}`}
                          onClick={() => {
                            setSelectedHostel(sel ? null : h)
                            if (!sel) showToast(`${h.name} selected as your base! Next: find people →`)
                          }}
                        >
                          {sel ? '✓ Selected' : 'Stay here & match →'}
                        </button>

                        {h.isMine && (
                          <div style={{ display: 'flex', gap: 6, marginTop: 8, width: '100%', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px dashed var(--border)' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--brand-dark)', fontWeight: 700 }}>👤 Added by you</span>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={e => { e.stopPropagation(); openEditModal(h) }}
                                style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: 8, color: 'var(--text)', border: '1px solid var(--border)' }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={e => handleDeleteStay(h, e)}
                                style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: 8, color: '#ef4444', border: '1px solid #fca5a5', background: 'rgba(239, 68, 68, 0.05)' }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

              {/* In-Grid Category Add Action Card */}
              <div
                className="hostel-pick add-stay-card"
                onClick={() => openAddModal()}
                style={{
                  border: '2px dashed var(--brand)',
                  borderRadius: 16,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'rgba(14, 159, 143, 0.04)',
                  minHeight: 220,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '2.4rem', marginBottom: 10 }}>➕</div>
                <strong style={{ fontSize: '1.05rem', marginBottom: 6, color: 'var(--text)' }}>
                  {stayCategory === 'airbnb' ? 'Add an Airbnb or Homestay' : stayCategory === 'hotel' ? 'Add a Boutique Hotel' : 'Add a Hostel'}
                </strong>
                <p className="small faint" style={{ margin: '0 0 14px', maxWidth: 220, lineHeight: 1.4 }}>
                  {stayCategory === 'airbnb' ? "Have an Airbnb link or homestay in mind? Add it to your trip." : stayCategory === 'hotel' ? "Staying at a specific hotel? Add it here." : "Don't see your hostel listed? Add it to anchor your stay."}
                </p>
                <button type="button" className="btn btn-diy btn-sm" style={{ borderRadius: 16, padding: '6px 16px', fontSize: '0.85rem', fontWeight: 700 }}>
                  + Add {stayCategory === 'airbnb' ? 'Airbnb' : stayCategory === 'hotel' ? 'Hotel' : 'Hostel'}
                </button>
              </div>
            </div>
          )}

          {/* High-Contrast Crystal-Clear Add/Edit Stay Modal Overlay */}
          {showAddModal && (
            <div
              className="modal-backdrop"
              onClick={() => setShowAddModal(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
                padding: 16,
              }}
            >
              <div
                className="modal-content fade-up"
                onClick={e => e.stopPropagation()}
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  padding: 28,
                  borderRadius: 20,
                  maxWidth: 500,
                  width: '100%',
                  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.3)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    {editingStayId ? '✏️ Edit Your Stay' : `➕ Add a ${newStay.propertyType === 'airbnb' ? 'Airbnb / Homestay' : newStay.propertyType === 'hotel' ? 'Hotel' : 'Hostel'} in ${d.name}`}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ fontSize: '1.2rem', padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    ✕
                  </button>
                </div>
                <p style={{ margin: '0 0 20px', fontSize: '0.88rem', color: '#475569', lineHeight: 1.4 }}>
                  {editingStayId ? 'Update details for your stay. Changes are saved to your private stay.' : `Know a stay in ${d.name}? Add it to set it as your base and keep it for your trip!`}
                </p>
                <form onSubmit={handleSaveStay} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: 6, color: '#1e293b' }}>
                      Stay / Property Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Zostel South Goa, Seaside Villa Airbnb, Taj Hotel..."
                      value={newStay.name}
                      onChange={e => setNewStay({ ...newStay, name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: '1.5px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>
                  <div className="row2">
                    <div>
                      <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: 6, color: '#1e293b' }}>
                        Category
                      </label>
                      <select
                        value={newStay.propertyType}
                        onChange={e => setNewStay({ ...newStay, propertyType: e.target.value as any })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: '1.5px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontSize: '0.92rem',
                        }}
                      >
                        <option value="hostel">🛏️ Hostel / Backpackers</option>
                        <option value="airbnb">🏡 Airbnb / Homestay</option>
                        <option value="hotel">🏨 Hotel / Resort</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: 6, color: '#1e293b' }}>
                        Price / night (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 799"
                        value={newStay.pricePerNight}
                        onChange={e => setNewStay({ ...newStay, pricePerNight: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: '1.5px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontSize: '0.95rem',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: 6, color: '#1e293b' }}>
                      Area / Locality
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. Anjuna, Baga, Old Town ${d.name}...`}
                      value={newStay.area}
                      onChange={e => setNewStay({ ...newStay, area: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: '1.5px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: 6, color: '#1e293b' }}>
                      Booking URL / Airbnb link (optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.airbnb.com/rooms/... or website link"
                      value={newStay.bookingUrl}
                      onChange={e => setNewStay({ ...newStay, bookingUrl: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: '1.5px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setShowAddModal(false)}
                      style={{ color: '#64748b', fontWeight: 600 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-diy"
                      disabled={submittingStay}
                      style={{ padding: '11px 24px', fontSize: '0.95rem', fontWeight: 700 }}
                    >
                      {submittingStay ? 'Saving…' : editingStayId ? 'Save Changes →' : 'Add & Select Stay →'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {step === 'people' && (
        <>
          <div className="dhead">
            <h1>🤝 Meet your people</h1>
            {connected.length > 0 && <button className="btn btn-diy" onClick={() => setStep('group')}>Next: form group ({connected.length}) →</button>}
          </div>
          <p className="dsub">Travelers heading to {d.name} on your dates, ranked by compatibility. Connect with the ones you vibe with.</p>
          {!matches ? <Spinner /> : matches.length === 0 ? (
            <div className="nobody-yet fade-up">
              <div className="nobody-emoji">🔭</div>
              <strong>Nobody's going to {d.name} on your dates yet</strong>
              <p className="muted small" style={{ margin: '6px 0 0' }}>
                {start && end ? `${fmtDate(start)} – ${fmtDate(end)} · ` : ''}no overlapping travellers found.
              </p>

              <button className="btn btn-diy btn-block" style={{ marginTop: 18 }} disabled={creating} onClick={planSolo}>
                {creating ? 'Setting up…' : '🗺️ Plan & travel solo → set up my hub'}
              </button>

              {!datePickerOpen
                ? <button className="btn btn-secondary btn-block" style={{ marginTop: 8 }} onClick={() => setDatePickerOpen(true)}>📅 Try different dates</button>
                : (
                  <div className="inline-date-changer">
                    <div className="row2">
                      <div><label>New start</label><input type="date" value={altStart} onChange={e => setAltStart(e.target.value)} /></div>
                      <div><label>New end</label><input type="date" value={altEnd} onChange={e => setAltEnd(e.target.value)} /></div>
                    </div>
                    <button className="btn btn-diy btn-block" onClick={() => navigate(`/diy?destination=${destination}&start=${altStart}&end=${altEnd}`)}>
                      Re-check matches →
                    </button>
                  </div>
                )}

              {nearbyTravelers === null && <div style={{ marginTop: 20 }}><Spinner /></div>}
              {nearbyTravelers && nearbyTravelers.length > 0 && (
                <div className="nearby-travelers">
                  <div className="nearby-title">🗓️ Travelling to {d.name} — just on different dates</div>
                  <p className="muted small">Connect with them now. If your plans are flexible you can sync up, or just start the conversation.</p>
                  <div className="people-grid" style={{ marginTop: 14 }}>
                    {nearbyTravelers.map((t: any) => {
                      const sent = nearbyConn[t.id] === 'sent' || t.connection?.status === 'pending' || t.connection?.status === 'accepted'
                      return (
                        <div key={t.id} className="person-card">
                          <div className="person-top">
                            <Avatar user={t} size={46} />
                            <div className="person-id">
                              <div className="person-name">{t.name}</div>
                              <span className="person-sub">{t.age && `${t.age} · `}{t.city}</span>
                            </div>
                          </div>
                          <div className="nearby-dates">📅 {fmtDate(t.trip.startDate)} – {fmtDate(t.trip.endDate)}</div>
                          {t.connection?.status === 'accepted'
                            ? <button className="btn btn-secondary btn-block" style={{ marginTop: 8 }} disabled>✓ Connected</button>
                            : <button className="btn btn-diy-soft btn-block" style={{ marginTop: 8 }} disabled={sent}
                                onClick={async () => {
                                  try {
                                    await api.post('/connections', { toUserId: t.id })
                                    setNearbyConn(c => ({ ...c, [t.id]: 'sent' }))
                                    showToast(`Request sent to ${t.name.split(' ')[0]}`)
                                  } catch (e: any) { showToast(e.message) }
                                }}>
                                {sent ? 'Request sent…' : 'Connect'}
                              </button>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {nearbyTravelers && nearbyTravelers.length === 0 && (
                <p className="muted small" style={{ marginTop: 18 }}>No one's heading to {d.name} in the next 90 days either — you'd be a pioneer! Go solo and inspire others.</p>
              )}
            </div>
          ) : (
            <div className="people-grid">
              {matches.map(m => {
                const status = m.connection?.status
                return (
                  <div key={m.user.id} className="person-card">
                    <div className="person-top">
                      <Avatar user={m.user} size={46} />
                      <div className="person-id">
                        <div className="person-name">{m.user.name} {m.user.idVerified && <span className="verified-tick" title="Verified">✔</span>}</div>
                        <span className="person-sub">{m.user.age} · {m.user.city}</span>
                      </div>
                      <ScorePill score={m.score} />
                    </div>
                    {/* Compact AI insight: score never appears without a reason (UX audit P0) */}
                    <div className={`ai-explain ai-explain-compact ${m.score < 70 ? 'ai-explain-mid' : ''}`}>
                      <i className="ph-bold ph-sparkle" />
                      <span>{m.reasons?.[0] || 'Same destination, overlapping dates.'}</span>
                    </div>
                    <p className="person-bio">{m.user.bio}</p>
                    <div className="interest-row">
                      {m.user.interests.slice(0, 3).map((i: string) => <span key={i} className="interest-chip">{i}</span>)}
                    </div>
                    {status === 'accepted'
                      ? <button className="btn btn-secondary btn-block" style={{ marginTop: 0 }} disabled>✓ Connected</button>
                      : status === 'pending'
                        ? <button className="btn btn-diy-soft btn-block" style={{ marginTop: 0 }} disabled>Request sent…</button>
                        : <button className="btn btn-diy btn-block" style={{ marginTop: 0 }} onClick={() => connect(m)}>Send request</button>}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {step === 'group' && (
        <>
          <div className="dhead"><h1>👥 Form your trip group</h1></div>
          <p className="dsub">Name your crew and pick who's in. They'll get the same tools as a booked trip — chat, itinerary, expenses.</p>
          <div className="groupform">
            <label>Group name</label>
            <input value={groupName} onChange={e => setGroupName(e.target.value)} />
            <div className="small faint" style={{ margin: '8px 0 18px' }}>
              📍 {d.name}{start && ` · ${fmtDate(start)} – ${fmtDate(end)}`} · {nights} night{nights > 1 ? 's' : ''}{selectedHostel && ` · 🛏️ ${selectedHostel.name}`}
            </div>
            <label>Members</label>
            <div className="mchip-row">
              <span className="mchip in" style={{ cursor: 'default' }}>
                <span className="avatar" style={{ width: 26, height: 26, fontSize: 13, background: 'var(--brand)' }}>🧭</span> You
              </span>
              {connected.map(m => {
                const isIn = !excluded.includes(m.user.id)
                return (
                  <button key={m.user.id} className={`mchip ${isIn ? 'in' : ''}`}
                    onClick={() => setExcluded(x => isIn ? [...x, m.user.id] : x.filter(id => id !== m.user.id))}>
                    <Avatar user={m.user} size={26} /> {m.user.name.split(' ')[0]} <span style={{ opacity: .6 }}>{isIn ? '✓' : '+'}</span>
                  </button>
                )
              })}
            </div>
            {connected.length === 0 && <p className="small faint" style={{ margin: '0 0 20px' }}>You haven't connected with anyone yet — create the group solo and invite people once they accept.</p>}
            <button className="btn btn-diy btn-block" style={{ marginTop: 0 }} disabled={creating || !groupName.trim()} onClick={createGroup}>
              {creating ? 'Creating…' : 'Create group & plan itinerary →'}
            </button>
            {error && <p className="error">{error}</p>}
          </div>
        </>
      )}
      {toast}
    </div>
  )
}
