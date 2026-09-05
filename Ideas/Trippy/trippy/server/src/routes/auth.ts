import { Router } from 'express'
import { db, uid } from '../db.js'
import { signToken } from '../lib/auth.js'
import { hashPassword, verifyPassword, isEmail, passwordProblem } from '../lib/password.js'
import { recordLoginEvent, createSession } from '../lib/adminOps.js'
import { ownUser } from '../lib/shape.js'
import { sendPasswordReset } from '../lib/email.js'

export const authRouter = Router()

authRouter.post('/signup', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const name = req.body?.name ? String(req.body.name).trim().slice(0, 100) : null
  // Phone is optional now; stored for future OTP-verification login. Kept
  // unverified (phone_verified = 0) until an OTP flow confirms it.
  const phone = req.body?.phone ? String(req.body.phone).replace(/\D/g, '') : null
  if (!isEmail(email)) return res.status(400).json({ error: 'Enter a valid email address' })
  const pwErr = passwordProblem(password)
  if (pwErr) return res.status(400).json({ error: pwErr })
  if (phone && phone.length !== 10) return res.status(400).json({ error: 'Enter a valid 10-digit phone number' })
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) {
    return res.status(409).json({ error: 'An account with this email already exists — try signing in' })
  }
  if (phone && db.prepare('SELECT 1 FROM users WHERE phone = ?').get(phone)) {
    return res.status(409).json({ error: 'This phone number is already linked to another account' })
  }
  const id = uid()
  const { hash, salt } = hashPassword(password)
  db.prepare('INSERT INTO users (id, email, password_hash, password_salt, name, phone) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, email, hash, salt, name, phone)
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any
  const sid = createSession('traveller', id, req)
  db.prepare("UPDATE users SET last_login_at = datetime('now'), login_count = login_count + 1 WHERE id = ?").run(id)
  recordLoginEvent({ userType: 'traveller', userId: id, email, success: true, provider: 'signup', req })
  res.json({ token: signToken(id, sid, user.session_epoch || 0), user: ownUser(user), needsOnboarding: true })
})

authRouter.post('/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any
  if (!user || !user.password_hash || !verifyPassword(password, user.password_hash, user.password_salt)) {
    recordLoginEvent({ userType: 'traveller', userId: user?.id, email, success: false, failureReason: 'bad_credentials', req })
    return res.status(401).json({ error: 'Incorrect email or password' })
  }
  if (user.status === 'suspended') {
    recordLoginEvent({ userType: 'traveller', userId: user.id, email, success: false, failureReason: 'suspended', req })
    return res.status(403).json({ error: 'Your account has been suspended. Contact support.' })
  }
  const sid = createSession('traveller', user.id, req)
  db.prepare("UPDATE users SET last_login_at = datetime('now'), login_count = login_count + 1 WHERE id = ?").run(user.id)
  recordLoginEvent({ userType: 'traveller', userId: user.id, email, success: true, req })
  res.json({ token: signToken(user.id, sid, user.session_epoch || 0), user: ownUser(user), needsOnboarding: !user.onboarded })
})

// --- Forgot password (direct reset — no email required) ---
authRouter.post('/forgot-password', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  if (!isEmail(email)) return res.status(400).json({ error: 'Enter a valid email address' })
  const pwErr = passwordProblem(password)
  if (pwErr) return res.status(400).json({ error: pwErr })
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any
  if (!user) return res.status(404).json({ error: 'No account found with that email' })
  const { hash, salt } = hashPassword(password)
  db.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?').run(hash, salt, user.id)
  res.json({ ok: true })
})

// --- Reset password ---
authRouter.post('/reset-password', (req, res) => {
  const token = String(req.body?.token || '').trim()
  const password = String(req.body?.password || '')
  if (!token) return res.status(400).json({ error: 'Missing reset token' })
  const pwErr = passwordProblem(password)
  if (pwErr) return res.status(400).json({ error: pwErr })

  const row = db.prepare('SELECT * FROM password_reset_tokens WHERE token = ?').get(token) as any
  if (!row) return res.status(400).json({ error: 'Invalid or expired reset link' })
  if (row.used) return res.status(400).json({ error: 'This reset link has already been used' })
  if (Math.floor(Date.now() / 1000) > row.expires_at) return res.status(400).json({ error: 'Reset link has expired — request a new one' })

  const { hash, salt } = hashPassword(password)
  db.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?').run(hash, salt, row.user_id)
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE token = ?').run(token)
  res.json({ ok: true })
})
