import { useState } from 'react'
import { api } from '../api'
import { useAuth } from '../App'

export default function Login() {
  const { signIn } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(
    new URLSearchParams(window.location.search).get('mode') === 'signup' ? 'signup' : 'login')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const switchMode = (m: typeof mode) => { setMode(m); setError(''); setResetDone(false) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (mode === 'forgot') {
      if (form.newPassword !== form.confirmPassword) { setError('Passwords do not match'); return }
    }
    setBusy(true)
    try {
      if (mode === 'forgot') {
        await api.post('/auth/forgot-password', { email: form.email, password: form.newPassword })
        setResetDone(true)
      } else {
        const res = mode === 'signup'
          ? await api.post('/auth/signup', { name: form.name, email: form.email, phone: form.phone || undefined, password: form.password })
          : await api.post('/auth/login', { email: form.email, password: form.password })
        await signIn(res.token)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-hero">🧭</div>
        <h1>Trippy</h1>
        <p className="muted">Find your people. Travel solo, never alone.</p>

        {mode !== 'forgot' && (
          <div className="auth-toggle">
            <button className={mode === 'login' ? 'on' : ''} onClick={() => switchMode('login')}>Sign in</button>
            <button className={mode === 'signup' ? 'on' : ''} onClick={() => switchMode('signup')}>Create account</button>
          </div>
        )}

        {mode === 'forgot' ? (
          resetDone ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
              <p><strong>Password updated!</strong></p>
              <p className="muted small">Sign in with your new password.</p>
              <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={() => switchMode('login')}>Sign in</button>
            </div>
          ) : (
            <>
              <p className="muted small" style={{ marginBottom: 12 }}>Enter your email and choose a new password.</p>
              <form onSubmit={submit}>
                <label>Email</label>
                <input type="email" autoComplete="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
                <label>New password</label>
                <input type="password" autoComplete="new-password" value={form.newPassword} onChange={e => set('newPassword', e.target.value)} placeholder="At least 8 characters" />
                <label>Confirm password</label>
                <input type="password" autoComplete="new-password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Same password again" />
                <button className="btn btn-primary btn-block" disabled={busy || !form.email || !form.newPassword || !form.confirmPassword}>
                  {busy ? 'Saving…' : 'Set new password'}
                </button>
              </form>
              {error && <p className="error">{error}</p>}
              <p style={{ textAlign: 'center', marginTop: 8 }}>
                <button className="link-btn" onClick={() => switchMode('login')}>Back to sign in</button>
              </p>
            </>
          )
        ) : (
          <>
            <form onSubmit={submit}>
              {mode === 'signup' && (
                <>
                  <label>Name</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
                  <label>Phone <span className="faint" style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <div className="phone-row">
                    <span className="prefix">+91</span>
                    <input inputMode="numeric" maxLength={10} value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, ''))} placeholder="10-digit number" />
                  </div>
                </>
              )}
              <label>Email</label>
              <input type="email" autoComplete="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
              <label>Password</label>
              <input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'} />
              <button className="btn btn-primary btn-block" disabled={busy || !form.email || !form.password}>
                {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            </form>
            {error && <p className="error">{error}</p>}
            {mode === 'login' && (
              <p style={{ textAlign: 'center', marginTop: 8 }}>
                <button className="link-btn" onClick={() => switchMode('forgot')}>Forgot password?</button>
              </p>
            )}
            <p className="tiny muted">{mode === 'signup' ? 'Create an account with your email and a password.' : 'Welcome back — sign in to continue.'}</p>
          </>
        )}
      </div>
    </div>
  )
}
