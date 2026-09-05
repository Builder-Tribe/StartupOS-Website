import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, fmtDate } from '../api'
import { useAuth } from '../App'
import { Avatar, Spinner } from '../components'


function StoryCard({ s, onLike }: { s: any; onLike?: (id: string) => void }) {
  const gradients = [
    'linear-gradient(135deg,#667eea,#764ba2)',
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
    'linear-gradient(135deg,#fa709a,#fee140)',
    'linear-gradient(135deg,#a18cd1,#fbc2eb)',
    'linear-gradient(135deg,#fccb90,#d57eeb)',
    'linear-gradient(135deg,#0d9488,#38f9d7)',
  ]
  const grad = gradients[s.id.charCodeAt(0) % gradients.length]

  const days = s.startDate && s.endDate
    ? Math.max(1, Math.round((Date.parse(s.endDate) - Date.parse(s.startDate)) / 86400000) + 1)
    : s.stepCount || null

  return (
    <div className="story-card">
      <Link to={`/stories/${s.id}`} className="story-card-cover plain-link"
        style={{ background: s.coverPhoto ? undefined : grad, backgroundImage: s.coverPhoto ? `url(${s.coverPhoto})` : undefined }}>
        {s.status === 'active' && <span className="story-live-badge">● Live</span>}
        <div className="story-card-overlay">
          <span className="story-card-dest">{s.destination || '🌍 World'}</span>
        </div>
      </Link>
      <div className="story-card-body">
        <div className="story-card-author">
          {s.author && <Avatar user={{ avatarColor: s.author.avatarColor, avatarEmoji: s.author.avatarEmoji }} size={22} />}
          <span className="story-card-name">{s.author?.name || 'Traveller'}</span>
        </div>
        <Link to={`/stories/${s.id}`} className="story-card-title plain-link">{s.title || 'Travel Story'}</Link>
        <div className="story-card-stats">
          {days && <span>📅 {days}d</span>}
          {s.stepCount > 0 && <span>📍 {s.stepCount} stops</span>}
          {s.startDate && <span>{fmtDate(s.startDate)}</span>}
        </div>
        <div className="story-card-foot">
          <button className={`story-like-btn ${s.liked ? 'liked' : ''}`}
            onClick={() => onLike?.(s.id)} title={s.liked ? 'Unlike' : 'Like'}>
            {s.liked ? '❤️' : '🤍'} {s.likeCount || 0}
          </button>
          <Link to={`/stories/${s.id}`} className="story-read-link">Read story →</Link>
        </div>
      </div>
    </div>
  )
}

export default function Stories() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stories, setStories] = useState<any[] | null>(null)
  const [dest, setDest] = useState('')
  const [feed, setFeed] = useState<'community' | 'friends'>('community')
  const [destinations, setDestinations] = useState<any[]>([])

  const load = (d = dest, f = feed) => {
    setStories(null)
    const params = new URLSearchParams()
    if (d) params.set('destination', d)
    if (f === 'friends' && user) params.set('feed', f)
    api.get(`/stories${params.toString() ? `?${params}` : ''}`).then(setStories).catch(() => setStories([]))
  }

  useEffect(() => { load(dest, feed) }, [dest, feed])
  useEffect(() => { api.get('/destinations').then(setDestinations).catch(() => {}) }, [])

  const handleLike = async (id: string) => {
    if (!user) return navigate('/login?mode=signup')
    const res = await api.post(`/stories/${id}/like`)
    setStories(prev => prev?.map(s => s.id === id ? { ...s, liked: res.liked, likeCount: res.likeCount } : s) ?? null)
  }

  return (
    <div className="fade-up stories-page">
      <div className="stories-hero">
        <h1>Travel Stories</h1>
        <p className="hero-sub">Real journeys. Every stop documented by the Trippy community.</p>
        {user && (
          <Link to="/stories/new" className="btn btn-primary">
            <i className="ph-bold ph-pencil-simple" /> Start your story
          </Link>
        )}
      </div>

      {user && (
        <div className="stories-feed-tabs">
          <button className={`stories-feed-tab ${feed === 'community' ? 'active' : ''}`} onClick={() => setFeed('community')}>
            🌏 Community
          </button>
          <button className={`stories-feed-tab ${feed === 'friends' ? 'active' : ''}`} onClick={() => setFeed('friends')}>
            👥 Friends
          </button>
        </div>
      )}

      <div className="stories-filter-row">
        <button className={`filter-chip ${dest === '' ? 'filter-chip-on' : ''}`} onClick={() => setDest('')}>All trips</button>
        {destinations.map(d => (
          <button key={d.slug} className={`filter-chip ${dest === d.slug ? 'filter-chip-on' : ''}`} onClick={() => setDest(d.slug)}>
            {d.emoji} {d.name}
          </button>
        ))}
      </div>

      {!stories && <div style={{ textAlign: 'center', padding: 40 }}><Spinner /></div>}

      {stories && stories.length === 0 && feed === 'friends' && (
        <div className="empty-trips" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
          <strong>No private stories from your connections yet.</strong>
          <p className="muted" style={{ marginTop: 6 }}>When your connections share a story set to "Friends only", it appears here — just for you.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <Link to="/matches" className="btn btn-primary">Find travellers</Link>
            <button className="btn btn-secondary" onClick={() => setFeed('community')}>Browse community</button>
          </div>
        </div>
      )}
      {stories && stories.length === 0 && feed === 'community' && (
        <div className="empty-trips" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✈️</div>
          <strong>No stories here yet.</strong>
          <p className="muted" style={{ marginTop: 6 }}>Be the first — document your next adventure and share it with the community.</p>
          {user && <Link to="/stories/new" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>Start a story</Link>}
        </div>
      )}

      {stories && stories.length > 0 && (
        <div className="stories-grid">
          {stories.map(s => <StoryCard key={s.id} s={s} onLike={handleLike} />)}
        </div>
      )}

      {!user && (
        <div className="stories-join-bar">
          <span>📖 Join Trippy to share your own travel stories</span>
          <Link to="/login?mode=signup" className="btn btn-primary small">Join free</Link>
        </div>
      )}
    </div>
  )
}
