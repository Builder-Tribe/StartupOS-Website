import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, fmtDate } from '../api'
import { useAuth } from '../App'
import { Avatar, Chips, TrustStars, useToast } from '../components'
import { PERSONALITY_META } from '../lib/personality'

const STYLES = ['adventure', 'leisure', 'cultural', 'spiritual', 'party', 'mixed']
const INTERESTS = ['trekking', 'biking', 'photography', 'food', 'history', 'nightlife', 'camping', 'yoga', 'meditation', 'music', 'beaches', 'water sports', 'cafes', 'architecture', 'local markets']
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Spanish', 'French', 'German', 'Japanese', 'Mandarin']
const DOC_TYPES = [['aadhaar', 'Aadhaar'], ['passport', 'Passport'], ['driving_licence', 'Driving licence'], ['voter_id', 'Voter ID']]
const SOCIALS: [string, string, string][] = [['instagram', 'Instagram', 'yourhandle'], ['linkedin', 'LinkedIn', 'in/yourname'], ['youtube', 'YouTube', 'yourchannel']]
const THIS_YEAR = new Date().getFullYear()

// Profile completeness (the single biggest driver of match responses on community platforms).
function completeness(u: any): { pct: number; missing: string[] } {
  const checks: [boolean, string][] = [
    [!!u.name, 'your name'],
    [!!u.age, 'your age'],
    [!!u.city, 'home city'],
    [!!(u.bio && u.bio.length >= 30), 'a bio (30+ characters)'],
    [!!u.travelStyle, 'travel style'],
    [(u.interests?.length || 0) >= 3, 'at least 3 interests'],
    [(u.languages?.length || 0) >= 1, 'languages you speak'],
    [!!u.emergencyName, 'an emergency contact'],
    [(u.pastTrips?.length || 0) >= 1, 'a past trip'],
    [Object.keys(u.socials || {}).length >= 1, 'a social handle'],
    [!!u.idVerified, 'ID verification'],
  ]
  const done = checks.filter(c => c[0]).length
  return { pct: Math.round(done / checks.length * 100), missing: checks.filter(c => !c[0]).map(c => c[1]).slice(0, 3) }
}

export default function Profile() {
  const { user, refresh, signOut } = useAuth()
  const [editing, setEditing] = useState(false)
  const [f, setF] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [doc, setDoc] = useState({ docType: 'aadhaar', docLast4: '' })
  const [toast, showToast] = useToast()
  const [bikeProfile, setBikeProfile] = useState<any>(null)
  const [carProfile, setCarProfile] = useState<any>(null)

  useEffect(() => {
    api.get('/adventures/bike/profile').then(setBikeProfile).catch(() => {})
    api.get('/adventures/car/profile').then(setCarProfile).catch(() => {})
  }, [])

  const startEdit = () => {
    setF({
      name: user.name, age: user.age, city: user.city, bio: user.bio, travelStyle: user.travelStyle,
      interests: [...user.interests], budget: user.budget,
      emergencyName: user.emergencyName || '', emergencyPhone: user.emergencyPhone || '',
      pastTrips: [...(user.pastTrips || [])],
      socials: { ...(user.socials || {}) },
      languages: [...(user.languages || [])],
    })
    setEditing(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/me', { ...f, age: Number(f.age) })
      await refresh()
      setEditing(false)
      showToast('Profile saved ✓')
    } catch (err: any) {
      showToast(err.message || 'Could not save profile')
    } finally { setSaving(false) }
  }

  const submitVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/me/verify-id', doc)
      await refresh()
      setVerifying(false)
      showToast('Submitted — the Trippy team reviews requests within a day')
    } catch (err: any) { showToast(err.message) }
  }

  const metaLine = [user.age, user.city, user.email].filter(Boolean).join(' · ')
  const comp = completeness(user)
  const idv = user.idVerification

  return (
    <div className="fade-up profile-page">
      <div className="profile-head card">
        <Avatar user={user} size={72} />
        <div className="profile-id">
          <h1>{user.name || 'Your profile'}</h1>
          {metaLine && <p className="muted">{metaLine}</p>}
          {user.personality && (() => {
            const pm = PERSONALITY_META[user.personality]
            return pm ? (
              <div className="personality-tag" title={pm.desc}>{pm.icon} {user.personality}</div>
            ) : (
              <div className="personality-tag">🧬 {user.personality}</div>
            )
          })()}
          {user.memberSince && <p className="tiny faint">On Trippy since {fmtDate(user.memberSince)}</p>}
        </div>
        <div className="profile-actions">
          {!editing && <button className="btn btn-secondary small" onClick={startEdit}>Edit profile</button>}
          <button className="btn btn-ghost small" onClick={signOut}>Sign out</button>
        </div>
      </div>

      {/* Completeness meter — complete profiles get dramatically more match responses */}
      {!editing && comp.pct < 100 && (
        <div className="card comp-card">
          <div className="comp-head">
            <strong>Profile strength: {comp.pct}%</strong>
            <span className="tiny muted">Complete profiles get more travel requests accepted</span>
          </div>
          <div className="comp-bar"><span style={{ width: `${comp.pct}%` }} /></div>
          <p className="small muted" style={{ margin: '8px 0 0' }}>Add {comp.missing.join(', ')} to level up.</p>
        </div>
      )}

      {/* Personality card — shown in view mode with full description + compat types */}
      {!editing && user.personality && (() => {
        const pm = PERSONALITY_META[user.personality]
        if (!pm) return null
        return (
          <div className="card personality-card">
            <div className="personality-card-head">
              <span className="personality-card-icon">{pm.icon}</span>
              <div>
                <div className="personality-card-type">The <strong>{pm.em}</strong>{pm.rest ? ` ${pm.rest}` : ''}</div>
                <p className="small muted" style={{ margin: '4px 0 0' }}>{pm.desc}</p>
              </div>
            </div>
            <div className="personality-card-compat">
              <span className="tiny faint">Matches best with</span>
              <div className="personality-compat-chips">
                {pm.compat.map(c => <span key={c} className="pr-type-chip">{c}</span>)}
              </div>
            </div>
            <p className="tiny faint" style={{ marginTop: 8 }}>Personality is derived from your travel style and interests — update them in Edit profile to recalculate.</p>
          </div>
        )
      })()}

      {/* Trust & verification — the reason strangers say yes */}
      {!editing && (
        <div className="card trust-card">
          <h3>🛡️ Trust & verification</h3>
          <div className="trust-rows">
            <div className="trust-row">
              <i className={`ph-fill ph-seal-check ${user.idVerified ? 'ok' : 'off'}`} />
              <div className="trust-main">
                <strong>Government ID {user.idVerified ? 'verified' : 'verification'}</strong>
                {user.idVerified ? <span className="small muted">Verified by the Trippy team — shown on your profile.</span>
                  : idv?.status === 'pending' ? <span className="small muted">Under review — usually within a day.</span>
                  : idv?.status === 'rejected' ? <span className="small error">Rejected: {idv.reason || 'please retry'} — you can submit again.</span>
                  : <span className="small muted">Travellers with a verified ID get accepted far more often.</span>}
              </div>
              {!user.idVerified && idv?.status !== 'pending' && !verifying &&
                <button className="btn btn-secondary small" onClick={() => setVerifying(true)}>Verify now</button>}
              {idv?.status === 'pending' && <span className="badge badge-warn">Pending</span>}
              {user.idVerified && <span className="badge badge-ok">Verified</span>}
            </div>
            {verifying && (
              <form onSubmit={submitVerification} className="verify-form">
                <div className="row2">
                  <div>
                    <label>Document type</label>
                    <select value={doc.docType} onChange={e => setDoc({ ...doc, docType: e.target.value })}>
                      {DOC_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Last 4 digits</label>
                    <input inputMode="numeric" maxLength={4} placeholder="1234" value={doc.docLast4}
                      onChange={e => setDoc({ ...doc, docLast4: e.target.value.replace(/\D/g, '') })} />
                  </div>
                </div>
                <p className="tiny faint">We never store the full document number. Document photo upload is coming; for now the team verifies the reference you submit.</p>
                <div className="row-actions">
                  <button type="button" className="btn btn-ghost small" onClick={() => setVerifying(false)}>Cancel</button>
                  <button className="btn btn-primary small">Submit for review</button>
                </div>
              </form>
            )}
            <div className="trust-row">
              <i className={`ph-fill ph-envelope-simple ${user.email ? 'ok' : 'off'}`} />
              <div className="trust-main"><strong>Email on file</strong><span className="small muted">{user.email}</span></div>
            </div>
            <div className="trust-row">
              <i className={`ph-fill ph-users-three ${user.trustReviews ? 'ok' : 'off'}`} />
              <div className="trust-main">
                <strong>Community vouches</strong>
                {user.trustReviews
                  ? <span className="small muted"><TrustStars user={user} /> from {user.trustReviews} travel companion{user.trustReviews === 1 ? '' : 's'}</span>
                  : <span className="small muted">Travel with people — companions can vouch for you afterwards.</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {editing ? (
        <div className="card">
          <label>Name</label>
          <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
          <div className="row2">
            <div><label>Age</label><input inputMode="numeric" value={f.age} onChange={e => setF({ ...f, age: e.target.value.replace(/\D/g, '') })} /></div>
            <div><label>City</label><input value={f.city} onChange={e => setF({ ...f, city: e.target.value })} /></div>
          </div>
          <label>Bio</label>
          <textarea rows={3} value={f.bio} onChange={e => setF({ ...f, bio: e.target.value })} placeholder="What kind of traveller are you? What should a future trip-mate know?" />
          <label>Travel style</label>
          <Chips items={STYLES} active={[f.travelStyle]} onToggle={v => setF({ ...f, travelStyle: v })} />
          <label>Interests</label>
          <Chips items={INTERESTS} active={f.interests} onToggle={v => setF({ ...f, interests: f.interests.includes(v) ? f.interests.filter((x: string) => x !== v) : [...f.interests, v] })} />
          <label>Budget</label>
          <Chips items={['budget', 'mid-range', 'premium']} active={[f.budget]} onToggle={v => setF({ ...f, budget: v })} />
          <label>Languages you speak</label>
          <Chips items={LANGUAGES} active={f.languages || []} onToggle={v => setF({ ...f, languages: (f.languages || []).includes(v) ? (f.languages || []).filter((x: string) => x !== v) : [...(f.languages || []), v] })} />

          <label>Past trips — where have you already been?</label>
          {f.pastTrips.map((t: any, i: number) => (
            <div key={i} className="ptrip-row">
              <input placeholder="Destination (e.g. Spiti Valley)" value={t.destination}
                onChange={e => setF({ ...f, pastTrips: f.pastTrips.map((x: any, j: number) => j === i ? { ...x, destination: e.target.value } : x) })} />
              <input inputMode="numeric" maxLength={4} placeholder="Year" value={t.year || ''}
                onChange={e => setF({ ...f, pastTrips: f.pastTrips.map((x: any, j: number) => j === i ? { ...x, year: Number(e.target.value.replace(/\D/g, '')) || '' } : x) })} />
              <button type="button" className="btn btn-ghost small" onClick={() => setF({ ...f, pastTrips: f.pastTrips.filter((_: any, j: number) => j !== i) })}>✕</button>
            </div>
          ))}
          {f.pastTrips.length < 20 &&
            <button type="button" className="btn btn-diy-soft small" onClick={() => setF({ ...f, pastTrips: [...f.pastTrips, { destination: '', year: THIS_YEAR, note: '' }] })}>+ Add past trip</button>}

          <label>Social handles (optional — shown on your profile for trust)</label>
          {SOCIALS.map(([key, label, ph]) => (
            <div key={key} className="social-row">
              <span className="social-label">{label}</span>
              <input placeholder={ph} value={f.socials[key] || ''} onChange={e => setF({ ...f, socials: { ...f.socials, [key]: e.target.value } })} />
            </div>
          ))}

          <label>Emergency contact (never shown publicly)</label>
          <div className="row2">
            <input placeholder="Name" value={f.emergencyName} onChange={e => setF({ ...f, emergencyName: e.target.value })} />
            <input placeholder="Phone" inputMode="numeric" maxLength={10} value={f.emergencyPhone} onChange={e => setF({ ...f, emergencyPhone: e.target.value.replace(/\D/g, '') })} />
          </div>
          <div className="wizard-nav">
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <h3>About</h3>
            <p>{user.bio || <span className="muted">No bio yet — tap Edit profile to add one.</span>}</p>
          </div>
          <div className="card">
            <label>Travel style & budget</label>
            <Chips items={[user.travelStyle, user.budget].filter(Boolean)} />
            <label>Interests</label>
            {user.interests?.length ? <Chips items={user.interests} /> : <p className="muted small">None added yet.</p>}
            <label>Languages</label>
            {user.languages?.length ? <Chips items={user.languages} /> : <p className="muted small">None added yet.</p>}
          </div>
          {(user.pastTrips?.length > 0 || Object.keys(user.socials || {}).length > 0) && (
            <div className="card">
              {user.pastTrips?.length > 0 && <>
                <label>Been to</label>
                <Chips items={user.pastTrips.map((t: any) => t.year ? `${t.destination} '${String(t.year).slice(2)}` : t.destination)} />
              </>}
              {Object.keys(user.socials || {}).length > 0 && <>
                <label>Find me on</label>
                <Chips items={Object.entries(user.socials).map(([k, v]) =>
                  (k === 'instagram' || k === 'twitter') ? `${k}: @${v}` : `${k}: ${v}`
                )} />
              </>}
            </div>
          )}
          <div className="card">
            <label>Emergency contact (private)</label>
            <p className="small">{user.emergencyName ? `${user.emergencyName} · ${user.emergencyPhone}` : <span className="muted">Not set — add one for safety features.</span>}</p>
          </div>
          {/* Phase 4: Adventure profiles */}
          <div className="card">
            <div className="itin-head" style={{ marginBottom: 10 }}>
              <label style={{ margin: 0 }}>🏍️ Adventure profiles</label>
              <span className="muted small">Shown on companion matches</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bikeProfile ? (
                <div className="adv-profile-summary">
                  <span>🏍️ <strong>{bikeProfile.vehicleType}</strong>{bikeProfile.engineCc ? ` ${bikeProfile.engineCc}cc` : ''} · {bikeProfile.experienceLevel}</span>
                  <Link to="/adventures/bike/profile" className="btn btn-ghost small">Edit</Link>
                </div>
              ) : (
                <div className="adv-profile-summary muted">
                  <span>🏍️ No bike profile yet</span>
                  <Link to="/adventures/bike/profile" className="btn btn-secondary small">Set up →</Link>
                </div>
              )}
              {carProfile ? (
                <div className="adv-profile-summary">
                  <span>🚗 <strong>{carProfile.vehicleType}</strong> · {carProfile.seatingCapacity} seats{carProfile.ac ? ' · ❄️ AC' : ''}</span>
                  <Link to="/adventures/car/profile" className="btn btn-ghost small">Edit</Link>
                </div>
              ) : (
                <div className="adv-profile-summary muted">
                  <span>🚗 No car profile yet</span>
                  <Link to="/adventures/car/profile" className="btn btn-secondary small">Set up →</Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {toast}
    </div>
  )
}
