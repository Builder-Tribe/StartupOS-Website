import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto'

// Shared secure password hashing (scrypt) used by both consumer and partner auth.
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return { hash, salt }
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const candidate = scryptSync(password, salt, 64)
  const stored = Buffer.from(hash, 'hex')
  return stored.length === candidate.length && timingSafeEqual(stored, candidate)
}

// Minimal password policy shared by every signup path.
export function passwordProblem(password: string): string | null {
  if (typeof password !== 'string' || password.length < 8) return 'Password must be at least 8 characters'
  return null
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const isEmail = (v: unknown): v is string => typeof v === 'string' && EMAIL_RE.test(v.trim())
