import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, fmtDate } from './api'
import { useAuth } from './App'
import { Avatar, StarRating } from './components'

const CATEGORIES: Record<string, string> = {
  partner_trip: 'this trip',
  operator_trip: 'this trip',
  hostel: 'this hostel',
}

export default function ReviewSection({ targetType, targetId, canReview }: {
  targetType: string
  targetId: string
  canReview?: boolean
}) {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => api.get(`/reviews?targetType=${targetType}&targetId=${targetId}`).then(setData).catch(() => {})
  useEffect(() => { load() }, [targetType, targetId])

  const myReview = data?.reviews?.find((r: any) => r.isOwn)

  const openNew = () => {
    setEditing(null); setRating(5); setTitle(''); setBody(''); setError(''); setShowForm(true)
  }
  const openEdit = (r: any) => {
    setEditing(r); setRating(r.rating); setTitle(r.title); setBody(r.body); setError(''); setShowForm(true)
  }
  const cancel = () => { setShowForm(false); setEditing(null) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      if (editing) {
        await api.put(`/reviews/${editing.id}`, { rating, title, body })
      } else {
        await api.post('/reviews', { targetType, targetId, rating, title, body })
      }
      setShowForm(false); setEditing(null)
      await load()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally { setSaving(false) }
  }

  const deleteReview = async (id: string) => {
    if (!confirm('Delete your review?')) return
    await api.del(`/reviews/${id}`)
    await load()
  }

  if (!data) return null

  return (
    <div className="reviews-section">
      <div className="reviews-agg">
        {data.avgRating
          ? <><span className="reviews-agg-star">★</span><span className="reviews-agg-num">{data.avgRating.toFixed(1)}</span><span className="reviews-agg-count">({data.count} review{data.count !== 1 ? 's' : ''})</span></>
          : <span className="reviews-agg-empty">No reviews yet — be the first!</span>}
        {canReview && user && !myReview && !showForm && (
          <button className="btn btn-secondary small" style={{ marginLeft: 'auto' }} onClick={openNew}>Write a review</button>
        )}
        {!user && canReview && (
          <Link to="/login?mode=signup" className="btn btn-secondary small" style={{ marginLeft: 'auto' }}>Sign in to review</Link>
        )}
      </div>

      {showForm && (
        <form className="review-form" onSubmit={submit}>
          <div>
            <div className="review-form-label">Your rating</div>
            <StarRating value={rating} onChange={setRating} size={28} />
          </div>
          <input
            className="review-form-input"
            placeholder="Give your review a title…"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <textarea
            className="review-form-textarea"
            placeholder={`Tell others what you thought of ${CATEGORIES[targetType] || 'this'}…`}
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={4}
            required
          />
          {error && <p className="error small">{error}</p>}
          <div className="review-form-actions">
            <button className="btn btn-primary small" type="submit" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Post review'}</button>
            <button className="btn btn-ghost small" type="button" onClick={cancel}>Cancel</button>
          </div>
        </form>
      )}

      <div className="reviews-list">
        {data.reviews.map((r: any) => (
          <div key={r.id} className="review-card">
            <div className="review-header">
              <Avatar user={{ avatarColor: r.reviewer?.avatarColor, avatarEmoji: r.reviewer?.avatarEmoji }} size={32} />
              <div className="review-header-meta">
                <span className="review-author">{r.reviewer?.name || 'Traveller'}</span>
                <StarRating value={r.rating} size={14} />
              </div>
              <span className="review-date faint small">{fmtDate(r.createdAt)}</span>
            </div>
            {r.title && <div className="review-title">{r.title}</div>}
            {r.body && <p className="review-body">{r.body}</p>}
            {r.isOwn && !showForm && (
              <div className="review-own-actions">
                <button className="linkish small" onClick={() => openEdit(r)}>Edit</button>
                <button className="linkish small error" onClick={() => deleteReview(r.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
