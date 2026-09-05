import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, inr } from '../api'
import { useToast } from '../components'

const VEHICLE_TYPES = ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Crossover', 'Pickup truck', 'Minivan']

export default function AdventureCarProfile() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    vehicleType: 'Hatchback', seatingCapacity: '5', ac: true, routeBio: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, showToast] = useToast()

  useEffect(() => {
    api.get('/adventures/car/profile').then(p => {
      if (p) setForm({
        vehicleType: p.vehicleType || 'Hatchback',
        seatingCapacity: String(p.seatingCapacity || 5),
        ac: p.ac !== false,
        routeBio: p.routeBio || '',
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/adventures/car/profile', {
        vehicleType: form.vehicleType,
        seatingCapacity: Number(form.seatingCapacity),
        ac: form.ac,
        routeBio: form.routeBio,
      })
      showToast('Car profile saved ✓')
      setTimeout(() => navigate('/adventures'), 800)
    } catch (err: any) { showToast(err.message) }
    finally { setSaving(false) }
  }

  if (loading) return null

  return (
    <div className="fade-up" style={{ paddingTop: 22, maxWidth: 560, margin: '0 auto' }}>
      {toast}
      <button className="btn btn-ghost small" style={{ marginBottom: 16 }} onClick={() => navigate('/adventures')}>← Adventures</button>
      <div className="pill pill-coral" style={{ marginBottom: 12 }}>🚗 Car profile</div>
      <h1>Your car profile</h1>
      <p className="muted">This lets other travellers see your car details when you offer carpool seats on road trips.</p>

      <form onSubmit={save} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 20 }}>
        <div className="row2">
          <div>
            <label>Vehicle type</label>
            <select value={form.vehicleType} onChange={e => setForm(f => ({ ...f, vehicleType: e.target.value }))}>
              {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label>Total seating capacity</label>
            <select value={form.seatingCapacity} onChange={e => setForm(f => ({ ...f, seatingCapacity: e.target.value }))}>
              {[2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n} seats</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="adv-checkbox-label">
            <input type="checkbox" checked={form.ac} onChange={e => setForm(f => ({ ...f, ac: e.target.checked }))} />
            <span>Air conditioned ❄️</span>
          </label>
        </div>

        <div>
          <label>About your car / driving style (optional)</label>
          <textarea
            placeholder="e.g. Comfortable Innova with good boot space, comfortable for long highway drives."
            rows={3} value={form.routeBio}
            onChange={e => setForm(f => ({ ...f, routeBio: e.target.value }))}
          />
        </div>

        <div className="adv-seat-calc">
          <p className="muted small">🧮 With {form.seatingCapacity} total seats, you can offer up to <strong>{Number(form.seatingCapacity) - 1}</strong> carpool seat{Number(form.seatingCapacity) - 1 !== 1 ? 's' : ''} to co-travellers when you create a road trip route.</p>
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save car profile →'}
        </button>
      </form>
    </div>
  )
}
