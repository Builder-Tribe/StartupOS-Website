// Admin Console API client — separate token namespace from consumer/partner.
const TOKEN_KEY = 'tt_admin_token'
export const getAdminToken = () => localStorage.getItem(TOKEN_KEY)
export const setAdminToken = (t: string | null) => t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY)

export class AdminApiError extends Error {
  status: number
  errors?: string[]
  constructor(status: number, message: string, errors?: string[]) {
    super(message); this.status = status; this.errors = errors
  }
}

async function request(method: string, path: string, body?: unknown) {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getAdminToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`/api/admin${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new AdminApiError(res.status, data.error || 'Request failed', data.errors)
  return data
}

export const aapi = {
  get: (path: string) => request('GET', path),
  post: (path: string, body?: unknown) => request('POST', path, body),
  put: (path: string, body?: unknown) => request('PUT', path, body),
  del: (path: string) => request('DELETE', path),
}

// Build a query string from a filter object (skips empty values).
export const qs = (obj: Record<string, any>) => {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) if (v !== '' && v != null) p.set(k, String(v))
  const s = p.toString()
  return s ? `?${s}` : ''
}

// Trigger a CSV download from an admin export endpoint (carries the token).
export async function downloadCsv(path: string, filename: string) {
  const res = await fetch(`/api/admin${path}`, { headers: { Authorization: `Bearer ${getAdminToken()}` } })
  if (!res.ok) throw new AdminApiError(res.status, 'Export failed')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// Run a per-id call for each selected row; report partial failures honestly.
export async function bulkRun(ids: string[], fn: (id: string) => Promise<any>) {
  const results = await Promise.allSettled(ids.map(fn))
  const failed = results.filter(r => r.status === 'rejected').length
  if (failed) throw new Error(`${failed} of ${ids.length} failed (validation or permissions) — the rest were applied`)
}
