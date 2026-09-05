const TOKEN_KEY = 'tt_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t: string | null) => t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY)

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const API_BASE = import.meta.env.VITE_API_URL || ''

async function request(method: string, path: string, body?: unknown) {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const url = `${API_BASE}/api${path}`
  const res = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined })
  const text = await res.text().catch(() => '')
  let data: any = {}
  try { data = JSON.parse(text) } catch { data = { error: text.startsWith('<!') ? 'API server connection required. Deploy the backend API or set VITE_API_URL.' : text } }
  if (!res.ok) throw new ApiError(res.status, data.error || 'Request failed')
  return data
}

export const api = {
  get: (path: string) => request('GET', path),
  post: (path: string, body?: unknown) => request('POST', path, body),
  put: (path: string, body?: unknown) => request('PUT', path, body),
  del: (path: string) => request('DELETE', path),
}

// SQLite datetimes come back as "YYYY-MM-DD HH:MM:SS" (UTC) — normalize to ISO
export const parseDbDate = (iso: string) =>
  new Date(iso.length === 10 ? iso + 'T00:00:00' : iso.replace(' ', 'T') + (iso.endsWith('Z') ? '' : 'Z'))

export const fmtDate = (iso?: string | null) => {
  if (!iso) return ''
  return parseDbDate(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN')
