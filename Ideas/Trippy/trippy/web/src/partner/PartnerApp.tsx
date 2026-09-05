import { createContext, useContext, useEffect, useState } from 'react'
import { Routes, Route, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { papi, getPartnerToken, setPartnerToken } from './partnerApi'
import { Spinner } from '../components'
import PartnerLogin from './PartnerLogin'
import Dashboard from './Dashboard'
import TripEditor from './TripEditor'
import Preview from './Preview'

interface PartnerCtx {
  admin: any
  org: any
  refresh: () => Promise<void>
  signIn: (token: string) => Promise<void>
  signOut: () => void
}
const Ctx = createContext<PartnerCtx>(null!)
export const usePartner = () => useContext(Ctx)

export default function PartnerApp() {
  const [admin, setAdmin] = useState<any>(null)
  const [org, setOrg] = useState<any>(null)
  const [loading, setLoading] = useState(!!getPartnerToken())
  const location = useLocation()
  const navigate = useNavigate()

  const refresh = async () => {
    try {
      const [me, o] = await Promise.all([papi.get('/me'), papi.get('/org')])
      setAdmin(me); setOrg(o)
    } catch {
      setPartnerToken(null); setAdmin(null); setOrg(null)
    }
  }

  useEffect(() => {
    if (getPartnerToken()) refresh().finally(() => setLoading(false))
  }, [])

  const signIn = async (token: string) => { setPartnerToken(token); await refresh() }
  const signOut = () => { setPartnerToken(null); setAdmin(null); setOrg(null); navigate('/partner/login') }

  if (loading) return <div className="page-center"><Spinner /></div>

  if (!admin) {
    return (
      <Ctx.Provider value={{ admin, org, refresh, signIn, signOut }}>
        <Routes>
          <Route path="/partner/login" element={<PartnerLogin />} />
          <Route path="*" element={<Navigate to="/partner/login" replace />} />
        </Routes>
      </Ctx.Provider>
    )
  }

  return (
    <Ctx.Provider value={{ admin, org, refresh, signIn, signOut }}>
      <div className="crm">
        <header className="crm-topbar">
          <NavLink to="/partner" className="crm-brand">
            <span className="brand-tile" style={{ background: org?.logoColor || '#0d9488' }}>{org?.logoEmoji || '🧭'}</span>
            <span className="crm-brand-text">
              <span className="crm-brand-name">{org?.name || 'Partner'}</span>
              <span className="crm-brand-sub">Trippy Partner CRM</span>
            </span>
          </NavLink>
          <div className="crm-topbar-right">
            <a href="/" className="crm-link" title="Open the traveller site">Consumer site ↗</a>
            <span className="crm-admin">{admin.name || admin.email}</span>
            <button className="btn btn-ghost small" onClick={signOut}>Log out</button>
          </div>
        </header>
        <div className="crm-body">
          <aside className="crm-sidebar">
            <nav className="crm-side-nav">
              <NavLink to="/partner" end className={({ isActive }) => `crm-side-link ${isActive || location.pathname.startsWith('/partner/trips') ? 'active' : ''}`}>
                <i className="ph-bold ph-path" /> My trips
              </NavLink>
              {[
                { label: 'Analytics', icon: 'chart-line-up' },
                { label: 'Organisation', icon: 'buildings' },
                { label: 'Team', icon: 'users-three' },
                { label: 'Payment links', icon: 'link' },
              ].map(item => (
                <span key={item.label} className="crm-side-link crm-side-soon" title="Coming soon">
                  <i className={`ph-bold ph-${item.icon}`} /> {item.label}
                  <span className="crm-soon-tag">Soon</span>
                </span>
              ))}
            </nav>
          </aside>
          <main className="crm-main" key={location.pathname}>
            <Routes>
              <Route path="/partner" element={<Dashboard />} />
              <Route path="/partner/login" element={<Navigate to="/partner" replace />} />
              <Route path="/partner/trips/new" element={<TripEditor />} />
              <Route path="/partner/trips/:id" element={<TripEditor />} />
              <Route path="/partner/trips/:id/preview" element={<Preview />} />
              <Route path="*" element={<Navigate to="/partner" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Ctx.Provider>
  )
}
