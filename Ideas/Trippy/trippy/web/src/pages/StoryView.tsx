import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, fmtDate } from '../api'
import { useAuth } from '../App'
import { Avatar, Spinner } from '../components'

function StatPill({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="sv-stat">
      <span className="sv-stat-icon">{icon}</span>
      <span className="sv-stat-val">{value}</span>
      <span className="sv-stat-label">{label}</span>
    </div>
  )
}

function PhotoGrid({ photos }: { photos: string[] }) {
  if (!photos.length) return null
  return (
    <div className={`sv-photo-grid sv-photo-${Math.min(photos.length, 4)}`}>
      {photos.slice(0, 4).map((url, i) => (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="sv-photo-wrap">
          <img src={url} alt="" className="sv-photo" loading="lazy" />
          {i === 3 && photos.length > 4 && (
            <div className="sv-photo-more">+{photos.length - 4}</div>
          )}
        </a>
      ))}
    </div>
  )
}

export default function StoryView() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [story, setStory] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [commentError, setCommentError] = useState('')
  const commentRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setStory(null); setNotFound(false)
    api.get(`/stories/${id}`).then(setStory).catch(() => setNotFound(true))
  }, [id])

  const toggleLike = async () => {
    if (!user) return navigate('/login?mode=signup')
    try {
      const res = await api.post(`/stories/${id}/like`)
      setStory((s: any) => ({ ...s, liked: res.liked, likeCount: res.likeCount }))
    } catch {
      // leave story state unchanged on failure
    }
  }

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return navigate('/login?mode=signup')
    if (!commentText.trim() || submitting) return
    setSubmitting(true)
    setCommentError('')
    try {
      const c = await api.post(`/stories/${id}/comments`, { text: commentText.trim() })
      setStory((s: any) => ({ ...s, comments: [...(s.comments || []), c] }))
      setCommentText('')
    } catch (err: any) {
      setCommentError(err.message || 'Failed to post comment')
    } finally { setSubmitting(false) }
  }

  if (notFound) return (
    <div className="fade-up" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 40 }}>🗺️</div>
      <h2>Story not found</h2>
      <Link to="/stories" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>Browse all stories</Link>
    </div>
  )
  if (!story) return <div style={{ textAlign: 'center', padding: 60 }}><Spinner /></div>

  // Compute stats from steps
  const places = [...new Set(story.steps?.map((s: any) => s.location).filter(Boolean))]
  const days = story.startDate && story.endDate
    ? Math.max(1, Math.round((Date.parse(story.endDate) - Date.parse(story.startDate)) / 86400000) + 1)
    : story.steps?.length || 0

  // Group steps by day_number for the timeline
  const stepsByDay: Record<number, any[]> = {}
  for (const s of (story.steps || [])) {
    const d = s.dayNumber || 1
    ;(stepsByDay[d] ||= []).push(s)
  }
  const dayNumbers = Object.keys(stepsByDay).map(Number).sort((a, b) => a - b)

  const coverStyle: React.CSSProperties = story.coverPhoto
    ? { backgroundImage: `url(${story.coverPhoto})` }
    : { background: 'linear-gradient(135deg,#0d9488,#6366f1)' }

  return (
    <div className="fade-up sv-page">
      {/* Hero cover */}
      <div className="sv-hero" style={coverStyle}>
        <div className="sv-hero-overlay">
          <Link to="/stories" className="sv-back">← All stories</Link>
          <div className="sv-hero-content">
            {story.status === 'active' && <span className="story-live-badge">● Live journey</span>}
            <h1 className="sv-title">{story.title || 'Travel Story'}</h1>
            <div className="sv-author-row">
              {story.author && <Avatar user={{ avatarColor: story.author.avatarColor, avatarEmoji: story.author.avatarEmoji }} size={28} />}
              <span>{story.author?.name || 'Traveller'}</span>
              {story.startDate && <span className="sv-dates">{fmtDate(story.startDate)}{story.endDate ? ` – ${fmtDate(story.endDate)}` : ''}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="sv-stats-bar">
        {days > 0 && <StatPill icon="📅" value={days} label={days === 1 ? 'day' : 'days'} />}
        {places.length > 0 && <StatPill icon="📍" value={places.length} label={places.length === 1 ? 'stop' : 'stops'} />}
        {story.destination && <StatPill icon="🌍" value={story.destination} label="destination" />}
        {story.steps?.length > 0 && <StatPill icon="📝" value={story.steps.length} label={story.steps.length === 1 ? 'update' : 'updates'} />}
        <div className="sv-stats-actions">
          <button className={`sv-like-btn ${story.liked ? 'liked' : ''}`} onClick={toggleLike}>
            {story.liked ? '❤️' : '🤍'} {story.likeCount || 0}
          </button>
          {story.isOwn && (
            <Link to={`/stories/${id}/edit`} className="btn btn-secondary small">Edit story</Link>
          )}
        </div>
      </div>

      {/* Timeline */}
      {dayNumbers.length === 0 && (
        <div className="sv-empty-steps">
          <p className="muted" style={{ textAlign: 'center', padding: '32px 20px' }}>
            {story.isOwn ? 'No stops added yet — ' : 'This story has no stops yet — '}
            {story.isOwn && <Link to={`/stories/${id}/edit`}>add your first stop →</Link>}
          </p>
        </div>
      )}

      {dayNumbers.length > 0 && (
        <div className="sv-timeline">
          {dayNumbers.map(dayNum => {
            const daySteps = stepsByDay[dayNum]
            const firstStep = daySteps[0]
            const dateLabel = firstStep.date ? fmtDate(firstStep.date) : null
            return (
              <div key={dayNum} className="sv-day-block">
                <div className="sv-day-header">
                  <div className="sv-day-dot" />
                  <span className="sv-day-label">Day {dayNum}</span>
                  {dateLabel && <span className="sv-day-date">{dateLabel}</span>}
                </div>
                {daySteps.map((step: any) => (
                  <div key={step.id} className="sv-step-card">
                    {step.location && (
                      <div className="sv-step-location">
                        <i className="ph-bold ph-map-pin" /> {step.location}
                        {step.country && step.country !== 'India' && <span className="sv-step-country">, {step.country}</span>}
                      </div>
                    )}
                    {step.title && <h3 className="sv-step-title">{step.title}</h3>}
                    {step.photos?.length > 0 && <PhotoGrid photos={step.photos} />}
                    {step.description && <p className="sv-step-desc">{step.description}</p>}
                  </div>
                ))}
              </div>
            )
          })}
          <div className="sv-timeline-end">
            <div className="sv-day-dot sv-end-dot" />
            {story.status === 'active' ? (
              <span className="muted small">Journey in progress…</span>
            ) : (
              <span className="muted small">Trip completed ✓</span>
            )}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="sv-comments-section">
        <h3 className="sv-comments-title">
          {story.comments?.length ? `${story.comments.length} comment${story.comments.length > 1 ? 's' : ''}` : 'Comments'}
        </h3>
        {story.comments?.length === 0 && (
          <p className="muted small" style={{ marginBottom: 16 }}>No comments yet — be the first to react!</p>
        )}
        <div className="sv-comments-list">
          {story.comments?.map((c: any) => (
            <div key={c.id} className="sv-comment">
              <Avatar user={{ avatarColor: c.author?.avatarColor, avatarEmoji: c.author?.avatarEmoji }} size={30} />
              <div className="sv-comment-body">
                <span className="sv-comment-author">{c.author?.name || 'Traveller'}</span>
                <p className="sv-comment-text">{c.text}</p>
                <span className="sv-comment-time faint small">{fmtDate(c.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={postComment} className="sv-comment-form">
          {user && <Avatar user={user} size={30} />}
          <input
            ref={commentRef}
            className="sv-comment-input"
            placeholder={user ? 'Add a comment…' : 'Sign in to comment'}
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            disabled={!user}
            onFocus={() => !user && navigate('/login?mode=signup')}
          />
          {user && (
            <button className="btn btn-primary small" type="submit" disabled={!commentText.trim() || submitting}>
              Post
            </button>
          )}
        </form>
        {commentError && <p className="error small" style={{ margin: '4px 0 0' }}>{commentError}</p>}
      </div>
    </div>
  )
}
