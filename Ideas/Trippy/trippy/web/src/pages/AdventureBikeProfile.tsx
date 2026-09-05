import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useToast } from '../components'

const VEHICLE_TYPES = ['Motorcycle', 'Scooter', 'Cruiser', 'ADV / Tourer', 'Sports bike', 'Dirt bike', 'Royal Enfield']
const EXPERIENCE_LEVELS: [string, string, string][] = [
  ['beginner', '🌱 Beginner', 'Under 2 years, local rides only'],
  ['intermediate', '🔥 Intermediate', '2–5 years, highway + mountain roads'],
  ['expert', '⚡ Expert', '5+ years, any terrain including high altitude'],
]

export default function AdventureBikeProfile() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    vehicleType: 'Motorcycle', engineCc: '', experienceLevel: 'intermediate',
    ridingSince: '', bio: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, showToast] = useToast()

  useEffect(() => {
    api.get('/adventures/bike/profile').then(p => {
      if (p) setForm({
        vehicleType: p.vehicleType || 'Motorcycle',
        engineCc: p.engineCc ? String(p.engineCc) : '',
        experienceLevel: p.experienceLevel || 'intermediate',
        ridingSince: p.ridingSince ? String(p.ridingSince) : '',
        bio: p.bio || '',
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/adventures/bike/profile', {
        ...form,
        engineCc: form.engineCc ? Number(form.engineCc) : null,
        ridingSince: form.ridingSince ? Number(form.ridingSince) : null,
      })
      showToast('Bike profile saved ✓')
      setTimeout(() => navigate('/adventures'), 800)
    } catch (err: any) { showToast(err.message) }
    finally { setSaving(false) }
  }

  if (loading) return null

  return (
    <div className="fade-up" style={{ paddingTop: 22, maxWidth: 560, margin: '0 auto' }}>
      {toast}
      <button className="btn btn-ghost small" style={{ marginBottom: 16 }} onClick={() => navigate('/adventures')}>← Adventures</button>
      <div className="pill pill-brand" style={{ marginBottom: 12 }}>🏍️ Bike profile</div>
      <h1>Your rider profile</h1>
      <p className="muted">This helps us match you with compatible riding companions on overlapping routes.</p>

      <form onSubmit={save} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 20 }}>
        <div>
          <label>Vehicle type</label>
          <select value={form.vehicleType} onChange={e => setForm(f => ({ ...f, vehicleType: e.target.value }))}>
            {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="row2">
          <div>
            <label>Engine CC (optional)</label>
            <input type="number" placeholder="e.g. 350" value={form.engineCc} onChange={e => setForm(f => ({ ...f, engineCc: e.target.value }))} />
          </div>
          <div>
            <label>Riding since (year)</label>
            <input type="number" placeholder={String(new Date().getFullYear() - 3)} min={1990} max={new Date().getFullYear()} value={form.ridingSince} onChange={e => setForm(f => ({ ...f, ridingSince: e.target.value }))} />
          </div>
        </div>

        <div>
          <label>Experience level</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {EXPERIENCE_LEVELS.map(([key, label, desc]) => (
              <label key={key} className={`adv-exp-option ${form.experienceLevel === key ? 'selected' : ''}`}>
                <input type="radio" name="experience" value={key} checked={form.experienceLevel === key} onChange={() => setForm(f => ({ ...f, experienceLevel: key }))} />
                <div>
                  <strong>{label}</strong>
                  <span className="muted small">{desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label>Bio / riding style (optional)</label>
          <textarea
            placeholder="e.g. Love long-distance solo rides through Himachal. Usually ride 300–400 km/day. No rush."
            rows={3} value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save bike profile →'}
        </button>
      </form>
    </div>
  )
}
