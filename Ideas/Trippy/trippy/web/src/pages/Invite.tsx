import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, fmtDate } from '../api'
import { Spinner } from '../components'

// Invite-link landing (PRD 3.7): /join/:code — preview the trip, one tap to join.
export default function Invite() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [invite, setInvite] = useState<any>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { api.get(`/invites/${code}`).then(setInvite).catch(e => setError(e.message)) }, [code])

  const join = async () => {
    setBusy(true)
    try {
      const g = await api.post(`/invites/${code}/join`)
      navigate(`/groups/${g.id}?joined=1`)
    } catch (e: any) { setError(e.message); setBusy(false) }
  }

  if (error) return <div className="fade-up empty-trips" style={{ marginTop: 40 }}>{error}</div>
  if (!invite) return <Spinner />

  return (
    <div className="fade-up invite-card">
      <div className="big-emoji">💌</div>
      <h1>You're invited to “{invite.name}”</h1>
      <p className="muted">
        {invite.destination.replace(/-/g, ' ')}{invite.startDate ? ` · ${fmtDate(invite.startDate)} – ${fmtDate(invite.endDate)}` : ''} · {invite.memberCount} traveller{invite.memberCount === 1 ? '' : 's'} already in
      </p>
      {invite.alreadyMember
        ? <button className="btn btn-primary" onClick={() => navigate('/mytrips')}>You're in — open My trips</button>
        : <button className="btn btn-primary" disabled={busy} onClick={join}>{busy ? 'Joining…' : 'Join this trip 🎒'}</button>}
    </div>
  )
}
