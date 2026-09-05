import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../App'
import { Chips } from '../components'
import { PERSONALITY_META } from '../lib/personality'

const STYLES = ['adventure', 'leisure', 'cultural', 'spiritual', 'party', 'mixed']
const INTERESTS = ['trekking', 'biking', 'photography', 'food', 'history', 'nightlife', 'camping', 'yoga', 'meditation', 'music', 'beaches', 'water sports', 'cafes', 'architecture', 'local markets']
const LANGUAGES = ['hindi', 'english', 'marathi', 'tamil', 'telugu', 'kannada', 'malayalam', 'bengali', 'gujarati', 'punjabi', 'konkani']
const EMOJIS = ['🧭', '🥾', '📸', '🏔️', '🌊', '🎒', '🛶', '🏍️', '🎸', '🧘', '🍜', '🌅']
const COLORS = ['#0d9488', '#e11d48', '#7c3aed', '#f59e0b', '#2563eb', '#059669', '#db2777', '#ea580c']
const STEP_LABELS = ['About you', 'Your avatar', 'Your travel DNA', 'Bio & safety', 'Your first trip']

export default function Onboarding() {
  const { refresh, signOut } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [destinations, setDestinations] = useState<any[]>([])
  const [reveal, setReveal] = useState<{ personality: string; destination?: string } | null>(null)
  const [f, setF] = useState({
    name: '', age: '', gender: '', city: '',
    avatarEmoji: '🧭', avatarColor: '#0d9488',
    travelStyle: '', interests: [] as string[], budget: '', languages: [] as string[],
    bio: '', emergencyName: '', emergencyPhone: '',
    destination: '', startDate: '', endDate: '', flexible: true,
  })
  const set = (k: string, v: any) => setF(prev => ({ ...prev, [k]: v }))
  const toggle = (k: 'interests' | 'languages', v: string) =>
    setF(prev => ({ ...prev, [k]: prev[k].includes(v) ? prev[k].filter(x => x !== v) : [...prev[k], v] }))

  useEffect(() => { api.get('/destinations').then(setDestinations).catch(() => {}) }, [])

  const tripComplete = f.destination && f.startDate && f.endDate && f.endDate >= f.startDate
  const canNext =
    step === 0 ? f.name.trim() && f.age && f.gender && f.city.trim()
    : step === 1 ? true
    : step === 2 ? f.travelStyle && f.budget && f.interests.length >= 2
    : true

  // Finish: save profile, optionally create the first trip (activates matching),
  // then show the Travel Personality reveal (UX audit P0: onboarding previously
  // ended with no trip set and no personality moment).
  const finish = async (withTrip: boolean) => {
    setBusy(true)
    setError('')
    try {
      await api.put('/me', { ...f, age: Number(f.age) })
      if (withTrip && tripComplete) {
        await api.post('/trips', { destination: f.destination, startDate: f.startDate, endDate: f.endDate, flexible: f.flexible })
      }
      const me = await api.get('/me')
      setReveal({ personality: me.personality || 'Explorer', destination: withTrip && tripComplete ? destinations.find(d => d.slug === f.destination)?.name : undefined })
    } catch (err: any) {
      setError(err.message)
      setBusy(false)
    }
  }

  const enterApp = async () => {
    await refresh()                      // flips user.onboarded → main shell renders
    navigate(reveal?.destination ? '/matches' : '/')
  }

  if (reveal) {
    const meta = PERSONALITY_META[reveal.personality] || PERSONALITY_META['Explorer']
    return (
      <div className="pr-screen">
        <div className="pr-blob" style={{ top: -60, right: -40, width: 220, height: 220, background: 'radial-gradient(circle, rgba(242,104,60,.4), transparent 70%)' }} />
        <div className="pr-blob" style={{ bottom: -40, left: -30, width: 180, height: 180, background: 'radial-gradient(circle, rgba(99,102,241,.3), transparent 70%)' }} />
        <div className="pr-eyebrow">Your travel personality</div>
        <div className="pr-icon">{meta.icon}</div>
        <div className="pr-type">The <em>{meta.em}</em>{meta.rest && <><br />{meta.rest}</>}</div>
        <p className="pr-desc">{meta.desc}</p>
        <div className="pr-compat">
          <div className="pr-compat-label">Matches best with</div>
          <div className="pr-compat-types">
            {meta.compat.map(c => <span key={c} className="pr-type-chip">{c}</span>)}
          </div>
        </div>
        <button className="pr-cta" onClick={enterApp}>
          <i className="ph-bold ph-sparkle" />
          {reveal.destination ? `See my first matches in ${reveal.destination}` : 'Start exploring Trippy'}
        </button>
        <div className="pr-note">Based on your travel style, budget, and interests</div>
      </div>
    )
  }

  return (
    <div className="page-center">
      <div className="auth-card wide">
        <div className="ob-progress">{[0, 1, 2, 3, 4].map(i => <span key={i} className={`ob-bar ${i <= step ? 'on' : ''}`} />)}</div>
        <div className="ob-steplabel">{step + 1} of 5 — {STEP_LABELS[step]}</div>

        {step === 0 && (
          <>
            <h2>Tell us about you</h2>
            <label>Full name</label>
            <input value={f.name} onChange={e => set('name', e.target.value)} placeholder="Your name" autoFocus />
            <div className="row2">
              <div>
                <label>Age</label>
                <input inputMode="numeric" value={f.age} maxLength={2} onChange={e => set('age', e.target.value.replace(/\D/g, ''))} placeholder="25" />
              </div>
              <div>
                <label>Gender</label>
                <select value={f.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="">Select</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
              </div>
            </div>
            <label>City of residence</label>
            <input value={f.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Bengaluru" />
          </>
        )}

        {step === 1 && (
          <>
            <h2>Pick your avatar</h2>
            <p className="muted">No photo needed — your travel style speaks for itself.</p>
            <div className="avatar-preview" style={{ background: f.avatarColor }}>{f.avatarEmoji}</div>
            <label>Emoji</label>
            <div className="picker">{EMOJIS.map(e => (
              <button key={e} type="button" className={`pick ${f.avatarEmoji === e ? 'pick-on' : ''}`} onClick={() => set('avatarEmoji', e)}>{e}</button>
            ))}</div>
            <label>Color</label>
            <div className="picker">{COLORS.map(c => (
              <button key={c} type="button" className={`pick swatch ${f.avatarColor === c ? 'pick-on' : ''}`} style={{ background: c }} onClick={() => set('avatarColor', c)} />
            ))}</div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Your travel DNA</h2>
            <label>Style</label>
            <Chips items={STYLES} active={f.travelStyle ? [f.travelStyle] : []} onToggle={v => set('travelStyle', v)} />
            <label>Interests (pick at least 2 to improve your matches)</label>
            <Chips items={INTERESTS} active={f.interests} onToggle={v => toggle('interests', v)} />
            <label>Budget per trip</label>
            <Chips items={['budget', 'mid-range', 'premium']} active={f.budget ? [f.budget] : []} onToggle={v => set('budget', v)} />
            <label>Languages you speak</label>
            <Chips items={LANGUAGES} active={f.languages} onToggle={v => toggle('languages', v)} />
          </>
        )}

        {step === 3 && (
          <>
            <h2>Almost there</h2>
            <label>Short bio</label>
            <textarea rows={3} value={f.bio} onChange={e => set('bio', e.target.value)} placeholder='e.g. "Solo trekker from Pune. Planning my first Ladakh trip. Looking for chill travel buddies."' />
            <label>Emergency contact 🛡️ (never shown publicly — only for safety features)</label>
            <div className="row2">
              <input value={f.emergencyName} onChange={e => set('emergencyName', e.target.value)} placeholder="Contact name" />
              <input inputMode="numeric" value={f.emergencyPhone} maxLength={10} onChange={e => set('emergencyPhone', e.target.value.replace(/\D/g, ''))} placeholder="Contact phone" />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2>Where are you headed next?</h2>
            <p className="muted">This activates matching — we'll find travellers heading to the same place on overlapping dates.</p>
            <label>Destination</label>
            <select value={f.destination} onChange={e => set('destination', e.target.value)}>
              <option value="">Choose a destination…</option>
              {destinations.map(d => <option key={d.slug} value={d.slug}>{d.emoji} {d.name}, {d.state}</option>)}
            </select>
            <div className="row2">
              <div>
                <label>From</label>
                <input type="date" value={f.startDate} onChange={e => set('startDate', e.target.value)} />
              </div>
              <div>
                <label>To</label>
                <input type="date" min={f.startDate} value={f.endDate} onChange={e => set('endDate', e.target.value)} />
              </div>
            </div>
            <div className="ob-flex-row">
              <i className="ph-bold ph-calendar-blank" style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span className="ob-flex-text">Mark as flexible — we'll show matches ±3 days from your dates too</span>
              <input type="checkbox" style={{ width: 'auto' }} checked={f.flexible} onChange={e => set('flexible', e.target.checked)} />
            </div>
            <p className="tiny muted" style={{ marginTop: 10 }}>You can add more trips later from the home page.</p>
          </>
        )}

        <div className="wizard-nav">
          {step > 0 ? <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button> : <button className="btn btn-ghost" onClick={signOut}>Sign out</button>}
          {step < 4
            ? <button className="btn btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>Next</button>
            : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" disabled={busy} onClick={() => finish(false)}>Skip for now</button>
                <button className="btn btn-primary" disabled={busy || !tripComplete} onClick={() => finish(true)}>
                  {busy ? 'Setting up…' : <>Find my matches <i className="ph-bold ph-sparkle" /></>}
                </button>
              </div>
            )}
        </div>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}
