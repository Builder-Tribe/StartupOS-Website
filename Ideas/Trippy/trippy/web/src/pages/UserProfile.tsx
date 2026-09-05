import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, fmtDate } from '../api'
import { Avatar, Chips, Spinner, TrustStars, VerifiedBadges, useToast } from '../components'
import { PERSONALITY_META } from '../lib/personality'

const SOCIAL_URL: Record<string, (h: string) => string> = {
  instagram: h => `https://instagram.com/${h}`,
  linkedin: h => `https://linkedin.com/${h.includes('/') ? h : 'in/' + h}`,
  youtube: h => `https://youtube.com/@${h.replace(/^@/, '')}`,
}

export default function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [u, setU] = useState<any>(null)
  const [conn, setConn] = useState<any>(null)      // this user's connection entry, if any
  const [notFound, setNotFound] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [reportError, setReportError] = useState('')
  const [blockError, setBlockError] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [vouching, setVouching] = useState(false)
  const [vouch, setVouch] = useState({ rating: 5, text: '' })
  const [toast, showToast] = useToast()

  const load = async () => {
    try {
      const [user, cons] = await Promise.all([api.get(`/users/${id}`), api.get('/connections')])
      setU(user)
      const all = [...cons.incoming, ...cons.outgoing, ...cons.accepted]
      setConn(all.find((c: any) => c.user.id === id) || null)
    } catch {
      setNotFound(true)
    }
  }
  useEffect(() => { load() }, [id])

  if (notFound) return (
    <div className="page-center" style={{ flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 40 }}>👤</div>
      <h2>User not found</h2>
      <p className="muted">This profile may have been removed or doesn't exist.</p>
    </div>
  )
  if (!u) return <Spinner />

  const sendRequest = async () => {
    setBusy(true)
    try { await api.post('/connections', { toUserId: id }); await load(); showToast('Travel request sent ✓') }
    catch (e: any) { showToast(e.message) }
    finally { setBusy(false) }
  }
  const acceptRequest = async () => {
    setBusy(true)
    try { await api.post(`/connections/${conn.id}/respond`, { accept: true }); await load(); showToast(`You're connected with ${u.name?.split(' ')[0]}!`) }
    finally { setBusy(false) }
  }
  const withdrawRequest = async () => {
    setBusy(true)
    try { await api.del(`/connections/${conn.id}`); await load(); showToast('Request withdrawn') }
    catch (e: any) { showToast(e.message) }
    finally { setBusy(false) }
  }
  const report = async (e: React.FormEvent) => {
    e.preventDefault()
    setReportError('')
    try {
      await api.post(`/users/${id}/report`, { reason })
      setReporting(false)
      setReason('')
      showToast('Report submitted. Our safety team will review it.')
    } catch (err: any) {
      setReportError(err.message || 'Failed to submit report. Please try again.')
    }
  }
  const block = async () => {
    if (!confirm(`Block ${u.name}? They won't appear in your matches and can't contact you.`)) return
    setBlockError('')
    try {
      await api.post(`/users/${id}/block`)
      navigate('/matches')
    } catch (err: any) {
      setBlockError(err.message || 'Failed to block user. Please try again.')
      showToast(err.message || 'Failed to block user. Please try again.')
    }
  }

  const connected = conn?.status === 'accepted'

  const submitVouch = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post(`/users/${id}/vouch`, vouch)
      setVouching(false)
      await load()
      showToast(`Vouched for ${u.name?.split(' ')[0]} ✓`)
    } catch (err: any) { showToast(err.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="fade-up">
      <div className="profile-head card">
        <Avatar user={u} size={72} />
        <div className="profile-id">
          <h1>{u.name}</h1>
          <p className="muted">{u.age} · {u.gender} · {u.city}</p>
          <VerifiedBadges user={u} />
          {u.personality && <div className="personality-tag">{PERSONALITY_META[u.personality]?.icon || '🧬'} {u.personality}</div>}
          <TrustStars user={u} />
          {u.memberSince && <p className="tiny faint">On Trippy since {fmtDate(u.memberSince)}</p>}
        </div>
        {/* Report/block within 2 taps of any profile (UX audit P0) */}
        <button className="up-more" title="More options" onClick={() => setSheetOpen(true)}>
          <i className="ph-bold ph-dots-three" />
        </button>
      </div>

      <div className="card">
        <p>{u.bio}</p>
        <label>Travel style & budget</label>
        <Chips items={[u.travelStyle, u.budget].filter(Boolean)} />
        <label>Interests</label>
        <Chips items={u.interests} />
        <label>Languages</label>
        <Chips items={u.languages} />
        {u.pastTrips?.length > 0 && <>
          <label>Been to</label>
          <Chips items={u.pastTrips.map((t: any) => `${t.destination} '${String(t.year).slice(2)}`)} />
        </>}
        {Object.keys(u.socials || {}).length > 0 && (
          <>
            <label>Find them on</label>
            <div className="social-links">
              {Object.entries(u.socials).map(([k, v]: any) => (
                <a key={k} className="social-link" href={SOCIAL_URL[k]?.(v) || '#'} target="_blank" rel="noreferrer">
                  <i className={`ph-bold ph-${k === 'linkedin' ? 'linkedin-logo' : k === 'youtube' ? 'youtube-logo' : 'instagram-logo'}`} /> @{v}
                </a>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Community vouches — endorsements from people who actually travelled with them */}
      <div className="card">
        <div className="itin-head">
          <h3>🤝 Vouched by travel companions {u.trustReviews ? <span className="muted small">· {u.trustReviews}</span> : ''}</h3>
          {u.canVouch && !vouching && <button className="btn btn-secondary small" onClick={() => setVouching(true)}>Vouch for {u.name?.split(' ')[0]}</button>}
        </div>
        {u.hasVouched && <p className="small muted">You've vouched for {u.name?.split(' ')[0]} ✓</p>}
        {vouching && (
          <form onSubmit={submitVouch} className="vouch-form">
            <label>How was travelling with {u.name?.split(' ')[0]}?</label>
            <div className="vouch-stars">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" className={`vouch-star ${vouch.rating >= n ? 'on' : ''}`} onClick={() => setVouch({ ...vouch, rating: n })}>★</button>
              ))}
            </div>
            <textarea rows={2} maxLength={280} placeholder="One line for future trip-mates (optional)" value={vouch.text} onChange={e => setVouch({ ...vouch, text: e.target.value })} />
            <div className="row-actions">
              <button type="button" className="btn btn-ghost small" onClick={() => setVouching(false)}>Cancel</button>
              <button className="btn btn-primary small" disabled={busy}>Submit vouch</button>
            </div>
          </form>
        )}
        {u.vouches?.length === 0 && !vouching && (
          <p className="muted small">{u.canVouch ? 'Be the first to vouch — you travelled together.' : 'No vouches yet. Vouches come from travellers who shared a trip with them.'}</p>
        )}
        {u.vouches?.map((v: any, i: number) => (
          <div key={i} className="vouch-item">
            <Avatar user={v.from} size={30} />
            <div className="vouch-main">
              <span className="vouch-head"><strong>{v.from.name}</strong> <span className="vouch-rating">{'★'.repeat(v.rating)}</span></span>
              {v.text && <span className="small">{v.text}</span>}
              <span className="tiny faint">{fmtDate(v.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Connection-aware chat area: the lock state is visible, never a silent 403 (UX audit P0) */}
      <div className="card">
        {connected ? (
          <>
            <h3>You're connected 🎉</h3>
            <p className="muted small">Plan together, share hostel details, and meet up safely.</p>
            <Link to={`/chats/${conn.chatId}`} className="btn btn-primary btn-block">Open chat</Link>
          </>
        ) : (
          <>
            <div className="chat-locked">
              <span className="lock-icon"><i className="ph-bold ph-lock-simple" /></span>
              <div className="lock-title">Chat unlocks when you both connect</div>
              <div className="lock-sub">
                {conn?.status === 'pending' && conn.direction === 'outgoing'
                  ? `Your request is with ${u.name?.split(' ')[0]} — the chat opens automatically if they accept.`
                  : conn?.status === 'pending' && conn.direction === 'incoming'
                    ? `${u.name?.split(' ')[0]} sent you a travel request — accept it to open the chat.`
                    : `Send a travel request first. If ${u.name?.split(' ')[0]} accepts, your chat opens automatically.`}
              </div>
            </div>
            {conn?.status === 'pending' && conn.direction === 'outgoing' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-secondary btn-block" disabled>Request sent ✓</button>
                <button className="btn btn-ghost btn-block" disabled={busy} onClick={withdrawRequest}>Withdraw request</button>
              </div>
            )}
            {conn?.status === 'pending' && conn.direction === 'incoming' && (
              <button className="btn btn-primary btn-block" disabled={busy} onClick={acceptRequest}>Accept travel request</button>
            )}
            {!conn && (
              <button className="btn btn-primary btn-block" disabled={busy} onClick={sendRequest}>Send travel request</button>
            )}
            {conn?.status === 'declined' && <p className="muted small center">This request was declined.</p>}
          </>
        )}
      </div>

      {reporting && (
        <div className="card safety-card">
          <strong>Report {u.name?.split(' ')[0]}</strong>
          <form onSubmit={report} style={{ marginTop: 8 }}>
            <textarea rows={2} required autoFocus placeholder="What happened? (inappropriate content, fake profile…)" value={reason} onChange={e => setReason(e.target.value)} />
            {reportError && <p className="error small" style={{ marginTop: 4 }}>{reportError}</p>}
            <div className="row-actions" style={{ marginTop: 8 }}>
              <button type="button" className="btn btn-ghost small" onClick={() => { setReporting(false); setReportError('') }}>Cancel</button>
              <button className="btn btn-primary small">Submit report</button>
            </div>
          </form>
        </div>
      )}

      {/* Report / block bottom sheet — 2 taps from the profile */}
      {sheetOpen && (
        <div className="sheet-backdrop" onClick={() => setSheetOpen(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title">More options</div>
            <button className="sheet-item" onClick={() => { setSheetOpen(false); setReporting(true) }}>
              <span className="sheet-icon" style={{ background: 'var(--diy-softer)' }}><i className="ph-bold ph-flag" style={{ color: 'var(--diy-dark)' }} /></span>
              <span><span className="sheet-item-label coral">Report {u.name?.split(' ')[0]}</span><span className="sheet-item-sub">Inappropriate content, fake profile</span></span>
            </button>
            <button className="sheet-item" onClick={() => { setSheetOpen(false); block() }}>
              <span className="sheet-icon" style={{ background: '#fee2e2' }}><i className="ph-bold ph-prohibit" style={{ color: 'var(--danger)' }} /></span>
              <span><span className="sheet-item-label danger">Block {u.name?.split(' ')[0]}</span><span className="sheet-item-sub">They won't see you or be able to contact you</span></span>
            </button>
            <button className="sheet-item" onClick={() => setSheetOpen(false)}>
              <span className="sheet-icon" style={{ background: 'var(--line-softer)' }}><i className="ph-bold ph-x" style={{ color: 'var(--muted)' }} /></span>
              <span><span className="sheet-item-label">Cancel</span></span>
            </button>
          </div>
        </div>
      )}
      {toast}
    </div>
  )
}
