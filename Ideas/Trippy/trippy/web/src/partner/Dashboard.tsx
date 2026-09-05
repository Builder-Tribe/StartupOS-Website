import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { papi } from './partnerApi'
import { fmtDate, inr } from '../api'
import { Spinner, StarDisplay, useToast } from '../components'

const STATUS_LABEL: Record<string, string> = { draft: 'Draft', published: 'Live', completed: 'Completed', archived: 'Archived' }

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [busyId, setBusyId] = useState('')
  const [toast, showToast] = useToast()

  const load = () => papi.get('/trips').then(setData)
  useEffect(() => { load() }, [])

  if (!data) return <Spinner />

  const createTrip = async () => {
    const t = await papi.post('/trips', {})
    navigate(`/partner/trips/${t.id}`)
  }

  const act = async (id: string, fn: () => Promise<any>, okMsg?: string) => {
    setBusyId(id)
    try { await fn(); await load(); if (okMsg) showToast(okMsg) }
    catch (e: any) { showToast(e.errors?.[0] || e.message) }
    finally { setBusyId('') }
  }

  const publish = (id: string) => act(id, () => papi.post(`/trips/${id}/publish`), 'Trip published — it\'s now live on Trippy 🎉')
  const unpublish = (id: string) => act(id, () => papi.post(`/trips/${id}/unpublish`), 'Trip moved back to draft')
  const del = (id: string) => { if (confirm('Delete this draft trip? This cannot be undone.')) act(id, () => papi.del(`/trips/${id}`), 'Draft deleted') }

  const s = data.summary
  const hasPayment = data.trips.some((t: any) => t.hasPayment || t.paymentUrl)
  const firstRun = s.total === 0 || s.published === 0
  const steps = [
    { label: 'Create your first trip', done: s.total > 0 },
    { label: 'Add itinerary, pricing & a payment link', done: hasPayment },
    { label: 'Publish it to Trippy', done: s.published > 0 },
  ]
  const tiles = [
    { label: 'Total trips', value: s.total, tone: '' },
    { label: 'Drafts', value: s.draft, tone: 'draft' },
    { label: 'Live', value: s.published, tone: 'published' },
    { label: 'Upcoming', value: s.upcoming, tone: 'upcoming' },
    { label: 'Completed', value: s.completed, tone: 'completed' },
  ]

  return (
    <div className="fade-up">
      <div className="crm-head">
        <div>
          <h1>Your trips</h1>
          <p className="muted">Create, manage and publish group trips to Trippy.</p>
        </div>
        <button className="btn btn-primary" onClick={createTrip}>+ Create Trip</button>
      </div>

      {firstRun && (
        <div className="crm-welcome">
          <div className="crm-welcome-text">
            <h3>Welcome to your Partner CRM 👋</h3>
            <p className="muted">Three steps to get your first trip in front of travellers on Trippy:</p>
            <ul className="crm-checklist">
              {steps.map(st => (
                <li key={st.label} className={st.done ? 'done' : ''}>
                  <i className={st.done ? 'ph-fill ph-check-circle' : 'ph-bold ph-circle'} /> {st.label}
                </li>
              ))}
            </ul>
          </div>
          {s.total === 0 && <button className="btn btn-primary" onClick={createTrip}>+ Create your first trip</button>}
        </div>
      )}

      <div className="crm-tiles">
        {tiles.map(t => (
          <div key={t.label} className={`crm-tile crm-tile-${t.tone}`}>
            <div className="crm-tile-value">{t.value}</div>
            <div className="crm-tile-label">{t.label}</div>
          </div>
        ))}
      </div>

      {data.trips.length === 0 ? (
        <div className="crm-empty">
          <div className="empty-emoji">🗺️</div>
          <h3>No trips yet</h3>
          <p className="muted">Create your first group trip and publish it to Trippy.</p>
          <button className="btn btn-primary" onClick={createTrip} style={{ marginTop: 10 }}>+ Create your first trip</button>
        </div>
      ) : (
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Trip</th><th>Destination</th><th>Dates</th><th>Price</th><th>Rating</th><th>Status</th><th>Updated</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data.trips.map((t: any) => (
                <tr key={t.id}>
                  <td><Link to={`/partner/trips/${t.id}`} className="crm-trip-name">{t.name}</Link></td>
                  <td className="muted">{t.destination || '—'}</td>
                  <td className="muted small">{t.startDate ? `${fmtDate(t.startDate)} – ${fmtDate(t.endDate)}` : '—'}</td>
                  <td>{t.price ? inr(t.price) : '—'}</td>
                  <td>{t.avgRating ? <StarDisplay rating={t.avgRating} count={t.reviewCount} /> : <span className="muted small">—</span>}</td>
                  <td>
                    <span className={`crm-status crm-status-${t.status}`}>{STATUS_LABEL[t.status] || t.status}</span>
                    {t.pendingBookings > 0 && <Link to={`/partner/trips/${t.id}`} className="crm-pending-chip" title="Booking claims waiting for verification">{t.pendingBookings} to verify</Link>}
                    {t.availability?.full && <span className="crm-pending-chip crm-full-chip">Full</span>}
                  </td>
                  <td className="muted small">{fmtDate(t.updatedAt)}</td>
                  <td className="crm-actions">
                    <Link to={`/partner/trips/${t.id}`} className="crm-act">Edit</Link>
                    <Link to={`/partner/trips/${t.id}/preview`} className="crm-act">Preview</Link>
                    {(t.status === 'draft') && <button className="crm-act crm-act-primary" disabled={busyId === t.id} onClick={() => publish(t.id)}>Publish</button>}
                    {(t.status === 'published') && <button className="crm-act" disabled={busyId === t.id} onClick={() => unpublish(t.id)}>Unpublish</button>}
                    {(t.status === 'published') && <a className="crm-act" href={`/trip/${t.slug}`} target="_blank" rel="noreferrer">View ↗</a>}
                    {(t.status === 'draft') && <button className="crm-act crm-act-danger" disabled={busyId === t.id} onClick={() => del(t.id)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {toast}
    </div>
  )
}
