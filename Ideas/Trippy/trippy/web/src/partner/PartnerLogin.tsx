import { useState } from 'react'
import { papi } from './partnerApi'
import { usePartner } from './PartnerApp'

export default function PartnerLogin() {
  const { signIn } = usePartner()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [form, setForm] = useState({ orgName: '', name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      const res = mode === 'signup'
        ? await papi.post('/auth/signup', { orgName: form.orgName, name: form.name, email: form.email, password: form.password })
        : await papi.post('/auth/login', { email: form.email, password: form.password })
      await signIn(res.token)
    } catch (err: any) {
      setError(err.message); setBusy(false)
    }
  }

  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-hero">🧭</div>
        <h1>Trippy for Partners</h1>
        <p className="muted">{mode === 'signup' ? 'Create your community account to publish trips.' : 'Sign in to manage your community\'s trips.'}</p>

        <div className="auth-toggle">
          <button className={mode === 'login' ? 'on' : ''} onClick={() => { setMode('login'); setError('') }}>Sign in</button>
          <button className={mode === 'signup' ? 'on' : ''} onClick={() => { setMode('signup'); setError('') }}>Create account</button>
        </div>

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <>
              <label>Community / organization name</label>
              <input value={form.orgName} onChange={e => set('orgName', e.target.value)} placeholder="e.g. Himalayan Wolves" />
              <label>Your name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
            </>
          )}
          <label>Work email</label>
          <input type="email" autoComplete="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@community.com" />
          <label>Password</label>
          <input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'} />
          <button className="btn btn-primary btn-block" disabled={busy || !form.email || !form.password || (mode === 'signup' && !form.orgName)}>
            {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}
