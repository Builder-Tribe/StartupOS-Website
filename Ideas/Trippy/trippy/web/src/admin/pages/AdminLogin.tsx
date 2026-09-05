import { useState } from 'react'
import { aapi } from '../adminApi'
import { useAdmin } from '../AdminApp'

export default function AdminLogin() {
  const { signIn } = useAdmin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setBusy(true)
    try { const r = await aapi.post('/auth/login', { email, password }); await signIn(r.token) }
    catch (err: any) { setError(err.message || 'Login failed'); setBusy(false) }
  }

  return (
    <div className="a-login-wrap">
      <form className="a-login-card" onSubmit={submit}>
        <div className="a-login-brand"><span className="a-logo">🧭</span> Trippy <span className="a-brand-sub">Admin Console</span></div>
        <p className="a-muted">Internal platform control center. Authorized team members only.</p>
        <label className="a-label">Email</label>
        <input className="a-input" type="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="you@trippy.test" required />
        <label className="a-label">Password</label>
        <input className="a-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        <button className="a-btn a-btn-primary a-btn-block" disabled={busy || !email || !password}>{busy ? 'Signing in…' : 'Sign in'}</button>
        {error && <p className="a-error">{error}</p>}
      </form>
    </div>
  )
}


