import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../App'
import { Spinner } from '../components'

const FALLBACK_DESTINATIONS = [
  { slug: 'goa', label: 'Goa' },
  { slug: 'manali', label: 'Manali' },
  { slug: 'gokarna', label: 'Gokarna' },
  { slug: 'spiti-valley', label: 'Spiti Valley' },
  { slug: 'rajasthan', label: 'Rajasthan' },
  { slug: 'leh-ladakh', label: 'Leh & Ladakh' },
  { slug: 'rishikesh', label: 'Rishikesh' },
  { slug: 'coorg', label: 'Coorg' },
  { slug: 'andaman', label: 'Andaman' },
  { slug: 'kerala', label: 'Kerala' },
]

interface StepDraft {
  id?: string
  dayNumber: number
  date: string
  location: string
  country: string
  title: string
  description: string
  photos: string[]
  _photoInput?: string
}

function newStep(dayNum: number): StepDraft {
  return { dayNumber: dayNum, date: '', location: '', country: 'India', title: '', description: '', photos: [], _photoInput: '' }
}

export default function StoryEditor() {
  const { id } = useParams()   // undefined = create mode
  const isEdit = !!id
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [destinations, setDestinations] = useState<{ slug: string; label: string }[]>(FALLBACK_DESTINATIONS)

  // Story metadata
  const [title, setTitle] = useState('')
  const [coverPhoto, setCoverPhoto] = useState('')
  const [destination, setDestination] = useState('')
  const [destinationSlug, setDestinationSlug] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [status, setStatus] = useState<'active' | 'completed'>('completed')

  // Steps
  const [steps, setSteps] = useState<StepDraft[]>([newStep(1)])
  const [storyId, setStoryId] = useState<string | null>(id ?? null)

  // Load existing story in edit mode
  useEffect(() => {
    if (!isEdit) return
    api.get(`/stories/${id}`).then((s: any) => {
      if (!s.isOwn) { navigate('/stories'); return }
      setTitle(s.title || '')
      setCoverPhoto(s.coverPhoto || '')
      setDestination(s.destination || '')
      setDestinationSlug(s.destinationSlug || '')
      setStartDate(s.startDate || '')
      setEndDate(s.endDate || '')
      setVisibility(s.visibility || 'public')
      setStatus(s.status || 'completed')
      setSteps(s.steps?.length ? s.steps.map((st: any) => ({
        id: st.id, dayNumber: st.dayNumber, date: st.date || '',
        location: st.location || '', country: st.country || 'India',
        title: st.title || '', description: st.description || '',
        photos: st.photos || [], _photoInput: '',
      })) : [newStep(1)])
    }).catch(() => navigate('/stories')).finally(() => setLoading(false))
  }, [id])

  // Redirect guests
  useEffect(() => {
    if (!user) navigate('/login?mode=signup')
  }, [user])

  // Load destinations dynamically
  useEffect(() => {
    api.get('/destinations')
      .then((ds: any[]) => setDestinations(ds.map(d => ({ slug: d.slug, label: d.name }))))
      .catch(() => {})
  }, [])

  const saveMeta = async (): Promise<string> => {
    const destObj = destinations.find(d => d.slug === destinationSlug)
    const body = {
      title: title.trim() || 'My travel story',
      coverPhoto: coverPhoto.trim(),
      destination: destination || destObj?.label || '',
      destinationSlug: destinationSlug || null,
      startDate: startDate || null,
      endDate: endDate || null,
      visibility,
      status,
    }
    if (storyId) {
      await api.put(`/stories/${storyId}`, body)
      return storyId
    } else {
      const res: any = await api.post('/stories', body)
      setStoryId(res.id)
      return res.id
    }
  }

  const saveAll = async () => {
    setSaving(true); setError('')
    try {
      const sid = await saveMeta()

      // For each step: if it has an id, update; if new, create
      let updatedSteps = [...steps]
      for (let i = 0; i < updatedSteps.length; i++) {
        const step = updatedSteps[i]
        const payload = {
          dayNumber: step.dayNumber,
          date: step.date || null,
          location: step.location,
          country: step.country || 'India',
          title: step.title,
          description: step.description,
          photos: step.photos,
        }
        if (step.id) {
          await api.put(`/stories/${sid}/steps/${step.id}`, payload)
        } else {
          const res: any = await api.post(`/stories/${sid}/steps`, payload)
          updatedSteps[i] = { ...step, id: res.id }
        }
      }
      setSteps(updatedSteps)

      navigate(`/stories/${sid}`)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const addStep = () => {
    const maxDay = steps.length ? Math.max(...steps.map(s => s.dayNumber)) : 0
    setSteps(prev => [...prev, newStep(maxDay + 1)])
  }

  const removeStep = async (idx: number) => {
    if (!window.confirm('Remove this stop?')) return
    const step = steps[idx]
    if (step.id && storyId) {
      try { await api.del(`/stories/${storyId}/steps/${step.id}`) } catch {}
    }
    setSteps(prev => prev.filter((_, i) => i !== idx))
  }

  const updateStep = (idx: number, patch: Partial<StepDraft>) => {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s))
  }

  const addPhoto = (idx: number) => {
    const step = steps[idx]
    const url = step._photoInput?.trim()
    if (!url) return
    updateStep(idx, { photos: [...step.photos, url], _photoInput: '' })
  }

  const removePhoto = (stepIdx: number, photoIdx: number) => {
    setSteps(prev => prev.map((s, i) => i === stepIdx
      ? { ...s, photos: s.photos.filter((_, pi) => pi !== photoIdx) }
      : s))
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spinner /></div>

  return (
    <div className="fade-up se-page">
      <div className="se-header">
        <Link to={storyId ? `/stories/${storyId}` : '/stories'} className="sv-back">
          ← {isEdit ? 'Back to story' : 'Cancel'}
        </Link>
        <h1>{isEdit ? 'Edit your story' : 'Start a new story'}</h1>
      </div>

      <div className="se-body">
        {/* Left: metadata */}
        <div className="se-meta-col">
          <h3 className="se-section-title">Story details</h3>

          <label className="se-label">Title
            <input className="se-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="My adventure in Manali…" />
          </label>

          <label className="se-label">Cover photo URL
            <input className="se-input" value={coverPhoto} onChange={e => setCoverPhoto(e.target.value)} placeholder="https://…" type="url" />
            {coverPhoto && <img src={coverPhoto} alt="cover preview" className="se-cover-preview" onError={e => (e.currentTarget.style.display = 'none')} />}
          </label>

          <label className="se-label">Destination
            <select className="se-input" value={destinationSlug} onChange={e => {
              const d = destinations.find(d => d.slug === e.target.value)
              setDestinationSlug(e.target.value)
              setDestination(d?.label || '')
            }}>
              <option value="">Select a destination…</option>
              {destinations.map(d => <option key={d.slug} value={d.slug}>{d.label}</option>)}
              <option value="_other">Other</option>
            </select>
            {destinationSlug === '_other' && (
              <input className="se-input" style={{ marginTop: 6 }} value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Coorg, Karnataka" />
            )}
          </label>

          <div className="se-row2">
            <label className="se-label">Start date
              <input className="se-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </label>
            <label className="se-label">End date
              <input className="se-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </label>
          </div>

          <div className="se-row2">
            <label className="se-label">Who can see this?
              <select className="se-input" value={visibility} onChange={e => setVisibility(e.target.value as any)}>
                <option value="public">Public — appears in Community feed</option>
                <option value="private">Friends only — visible to your connections</option>
              </select>
            </label>
            <label className="se-label">Journey status
              <select className="se-input" value={status} onChange={e => setStatus(e.target.value as any)}>
                <option value="completed">Completed</option>
                <option value="active">Live (in progress)</option>
              </select>
            </label>
          </div>
        </div>

        {/* Right: steps */}
        <div className="se-steps-col">
          <div className="se-steps-head">
            <h3 className="se-section-title">Day-by-day stops</h3>
            <button className="btn btn-secondary small" type="button" onClick={addStep}>+ Add stop</button>
          </div>

          {steps.length === 0 && (
            <div className="se-steps-empty">
              <p className="muted">No stops yet. Click "Add stop" to document your first location.</p>
            </div>
          )}

          {steps.map((step, idx) => (
            <div key={idx} className="se-step-block">
              <div className="se-step-hdr">
                <span className="se-step-num">Day {step.dayNumber}</span>
                <button className="se-remove-btn" type="button" onClick={() => removeStep(idx)} title="Remove this stop">×</button>
              </div>

              <div className="se-row2">
                <label className="se-label">Day #
                  <input className="se-input small" type="number" min={1} value={step.dayNumber} onChange={e => updateStep(idx, { dayNumber: Number(e.target.value) })} />
                </label>
                <label className="se-label">Date
                  <input className="se-input" type="date" value={step.date} onChange={e => updateStep(idx, { date: e.target.value })} />
                </label>
              </div>

              <div className="se-row2">
                <label className="se-label">Location / city
                  <input className="se-input" value={step.location} onChange={e => updateStep(idx, { location: e.target.value })} placeholder="e.g. Old Manali" />
                </label>
                <label className="se-label">Country
                  <input className="se-input" value={step.country} onChange={e => updateStep(idx, { country: e.target.value })} placeholder="India" />
                </label>
              </div>

              <label className="se-label">Stop title
                <input className="se-input" value={step.title} onChange={e => updateStep(idx, { title: e.target.value })} placeholder="e.g. Morning at Solang Valley" />
              </label>

              <label className="se-label">What happened
                <textarea className="se-textarea" value={step.description} onChange={e => updateStep(idx, { description: e.target.value })} rows={3} placeholder="Describe your experience at this stop…" />
              </label>

              {/* Photo URLs */}
              <div className="se-photos-section">
                <span className="se-label-text small">Photos (paste image URL)</span>
                <div className="se-photo-list">
                  {step.photos.map((url, pi) => (
                    <div key={pi} className="se-photo-thumb">
                      <img src={url} alt="" onError={e => (e.currentTarget.style.opacity = '0.3')} />
                      <button className="se-photo-remove" type="button" onClick={() => removePhoto(idx, pi)}>×</button>
                    </div>
                  ))}
                </div>
                <div className="se-photo-add">
                  <input className="se-input se-photo-url" value={step._photoInput || ''} onChange={e => updateStep(idx, { _photoInput: e.target.value })} placeholder="https://…" type="url" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPhoto(idx))} />
                  <button className="btn btn-secondary small" type="button" onClick={() => addPhoto(idx)}>Add</button>
                </div>
              </div>
            </div>
          ))}

          <button className="se-add-stop-btn" type="button" onClick={addStep}>
            <span>+</span> Add another stop
          </button>
        </div>
      </div>

      {error && <div className="se-error">{error}</div>}

      <div className="se-footer">
        <Link to={storyId ? `/stories/${storyId}` : '/stories'} className="btn btn-secondary">
          Cancel
        </Link>
        <button className="btn btn-primary" onClick={saveAll} disabled={saving}>
          {saving ? <Spinner /> : (isEdit ? 'Save changes' : 'Publish story')}
        </button>
      </div>
    </div>
  )
}
