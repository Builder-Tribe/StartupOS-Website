// Partner CRM API client — token is stored under a DIFFERENT key than the
// consumer app so a host can be logged into the CRM and the traveller app
// independently without the sessions colliding.
const TOKEN_KEY = 'tt_partner_token'

export const getPartnerToken = () => localStorage.getItem(TOKEN_KEY)
export const setPartnerToken = (t: string | null) => t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY)

export class PartnerApiError extends Error {
  status: number
  errors?: string[]
  constructor(status: number, message: string, errors?: string[]) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

async function request(method: string, path: string, body?: unknown) {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getPartnerToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`/api/partner${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new PartnerApiError(res.status, data.error || 'Request failed', data.errors)
  return data
}

export const papi = {
  get: (path: string) => request('GET', path),
  post: (path: string, body?: unknown) => request('POST', path, body),
  put: (path: string, body?: unknown) => request('PUT', path, body),
  del: (path: string) => request('DELETE', path),
}
