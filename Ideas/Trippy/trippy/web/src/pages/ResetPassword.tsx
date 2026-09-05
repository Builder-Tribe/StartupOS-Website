import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function ResetPassword() {
  const token = new URLSearchParams(window.location.search).get('token') || ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  if (!token) {
    return (
      <div className="page-center">
        <div className="auth-card">
          <div className="auth-hero">🔗</div>
          <h1>Invalid link</h1>
          <p className="muted">This reset link is missing a token. Please request a new one.</p>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/login')}>Back to sign in</button>
        </div>
      </div>
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setError('')
    setBusy(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-hero">🔑</div>
        <h1>New password</h1>

        {done ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <p><strong>Password updated!</strong></p>
            <p className="muted small">You can now sign in with your new password.</p>
            <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={() => navigate('/login')}>Sign in</button>
          </div>
        ) : (
          <>
            <p className="muted small" style={{ marginBottom: 12 }}>Choose a new password for your account.</p>
            <form onSubmit={submit}>
              <label>New password</label>
              <input type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" />
              <label>Confirm password</label>
              <input type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Same password again" />
              <button className="btn btn-primary btn-block" disabled={busy || !password || !confirm}>
                {busy ? 'Saving…' : 'Set new password'}
              </button>
            </form>
            {error && <p className="error">{error}</p>}
          </>
        )}
      </div>
    </div>
  )
}
