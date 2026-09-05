import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Routes, Route, NavLink, Navigate, useLocation, Link } from 'react-router-dom'
import { api, getToken, setToken } from './api'
import { BrandMark, Spinner, Avatar } from './components'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Landing from './pages/Landing'
import Results from './pages/Results'
import Compare from './pages/Compare'
import Matches from './pages/Matches'
import Connections from './pages/Connections'
import Chats from './pages/Chats'
import ChatThread from './pages/ChatThread'
import Hostels from './pages/Hostels'
import HostelDetail from './pages/HostelDetail'
import DIY from './pages/DIY'
import GroupHub from './pages/GroupHub'
import MyTrips from './pages/MyTrips'
import Invite from './pages/Invite'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import TripDetails from './pages/TripDetails'
import Chatbot from './pages/Chatbot'
import Stories from './pages/Stories'
import StoryView from './pages/StoryView'
import StoryEditor from './pages/StoryEditor'
import Adventures from './pages/Adventures'
import AdventureRoute from './pages/AdventureRoute'
import AdventureBikeProfile from './pages/AdventureBikeProfile'
import AdventureCarProfile from './pages/AdventureCarProfile'
import AdventureCompanions from './pages/AdventureCompanions'
import AdventureCarpoolSearch from './pages/AdventureCarpoolSearch'
import BottomNav from './BottomNav'
import CompareBar from './CompareBar'
import { CompareProvider } from './CompareContext'
import ResetPassword from './pages/ResetPassword'
import PartnerApp from './partner/PartnerApp'
import AdminApp from './admin/AdminApp'

interface AuthCtx {
  user: any
  refresh: () => Promise<void>
  signIn: (token: string) => Promise<void>
  signOut: () => void
}
const Ctx = createContext<AuthCtx>(null!)
export const useAuth = () => useContext(Ctx)

function Blobs() {
  return (
    <div className="bg-blobs" aria-hidden>
      <div className="blob blob-peach" />
      <div className="blob blob-sky" />
      <div className="blob blob-mint" />
      <div className="blob blob-lav" />
    </div>
  )
}

// Guest shell (PRD guest browsing): discovery is open to visitors — search,
// results, trip pages and hostels all work signed-out. Actions (join, request,
// chat, DIY) route to /login. The persistent CTA is the conversion point.
function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-root">
      <header className="topbar">
        <Link to="/" className="brand"><BrandMark /></Link>
        <nav className="topnav guest-nav">
          <Link to="/adventures">Adventures</Link>
          <Link to="/stories">Stories</Link>
          <Link to="/hostels">Hostels</Link>
          <Link to="/login" className="guest-signin">Sign in</Link>
          <Link to="/login?mode=signup" className="btn btn-primary small guest-join">Join Trippy — it's free</Link>
        </nav>
      </header>
      <main className="shell content">{children}</main>
      <div className="guest-bar">
        <span>Browsing as a guest — join free to match with travellers, chat and build trips.</span>
        <Link to="/login?mode=signup" className="btn btn-primary small">Join Trippy</Link>
      </div>
    </div>
  )
}

// Matches nav link with live pending-request badge
function MatchesLink() {
  const [pending, setPending] = useState(0)
  useEffect(() => {
    const load = () => api.get('/home').then((d: any) => setPending(d.pendingIncoming || 0)).catch(() => {})
    load()
    const iv = setInterval(load, 60000)
    return () => clearInterval(iv)
  }, [])
  return (
    <NavLink to="/matches" className="topnav-link-badge">
      People
      {pending > 0 && <span className="topnav-badge">{pending > 9 ? '9+' : pending}</span>}
    </NavLink>
  )
}

// In-app notifications (bookings backbone: booking confirmed, waitlist spot).
// Polls lightly; push notifications (PRD 1.4.7) replace the polling later.
// Panel is portaled to document.body so it escapes the topbar's stacking context
// (topbar has backdrop-filter + position:sticky which traps fixed descendants on Safari).
function NotifBell() {
  const [data, setData] = useState<{ notifications: any[]; unread: number } | null>(null)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const load = () => api.get('/notifications').then(setData).catch(() => {})
    load()
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [])
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const handler = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node
      if (wrapRef.current?.contains(t) || panelRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [open])
  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (next && data?.unread) {
      await api.post('/notifications/read-all')
      setData(d => d ? { ...d, unread: 0, notifications: d.notifications.map(n => ({ ...n, read: true })) } : d)
    }
  }
  const close = () => setOpen(false)
  // On desktop the panel is a fixed dropdown anchored below the bell button.
  const desktopStyle: React.CSSProperties = (() => {
    if (!open || !wrapRef.current || window.innerWidth <= 760) return {}
    const r = wrapRef.current.getBoundingClientRect()
    return { position: 'fixed', right: window.innerWidth - r.right, top: r.bottom + 8 }
  })()
  return (
    <>
      <div className="notif-wrap" ref={wrapRef}>
        <button className="notif-bell" title="Notifications" onClick={toggle}>
          <i className="ph-bold ph-bell" />
          {!!data?.unread && <span className="notif-badge">{data.unread > 9 ? '9+' : data.unread}</span>}
        </button>
      </div>
      {open && createPortal(
        <>
          <div className="notif-overlay" onClick={close} />
          <div className="notif-panel" ref={panelRef} style={desktopStyle}>
            <div className="notif-sheet-handle" />
            <div className="notif-header">
              <span className="notif-title">Notifications</span>
              <button className="notif-close" onClick={close} aria-label="Close notifications">
                <i className="ph-bold ph-x" />
              </button>
            </div>
            {(!data || data.notifications.length === 0)
              ? (
                <div className="notif-empty">
                  <i className="ph-bold ph-bell-slash" />
                  <p>Nothing yet</p>
                  <span>Booking updates and waitlist alerts will appear here.</span>
                </div>
              )
              : data.notifications.map(n => (
                <Link key={n.id} to={n.link || '#'} className={`notif-item ${n.read ? '' : 'unread'}`} onClick={close}>
                  <div className="notif-item-dot" />
                  <div className="notif-item-body">
                    <strong>{n.title}</strong>
                    {n.body && <span className="small muted">{n.body}</span>}
                  </div>
                </Link>
              ))
            }
          </div>
        </>,
        document.body
      )}
    </>
  )
}

// Top-level split: the Partner CRM is a fully separate authenticated app.
export default function App() {
  const location = useLocation()
  if (location.pathname.startsWith('/admin')) return <AdminApp />
  if (location.pathname.startsWith('/partner')) return <PartnerApp />
  return (
    <CompareProvider>
      <ConsumerApp />
      <CompareBar />
    </CompareProvider>
  )
}

function ConsumerApp() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(!!getToken())
  const location = useLocation()

  const refresh = async () => {
    try {
      setUser(await api.get('/me'))
    } catch {
      setToken(null)
      setUser(null)
    }
  }

  useEffect(() => {
    if (getToken()) refresh().finally(() => setLoading(false))
  }, [])

  const signIn = async (token: string) => {
    setToken(token)
    await refresh()
  }
  const signOut = () => {
    setToken(null)
    setUser(null)
  }

  if (loading) return <><Blobs /><div className="page-center"><Spinner /></div></>

  return (
    <Ctx.Provider value={{ user, refresh, signIn, signOut }}>
      <Blobs />
      {!user ? (
        <Routes>
          {/* Guest browsing: the whole discovery funnel is open; actions gate on /login */}
          <Route path="/" element={<PublicShell><Landing /></PublicShell>} />
          <Route path="/search" element={<PublicShell><Results /></PublicShell>} />
          <Route path="/chat" element={<PublicShell><Chatbot /></PublicShell>} />
          <Route path="/compare" element={<PublicShell><Compare /></PublicShell>} />
          <Route path="/trip/:slug" element={<PublicShell><TripDetails /></PublicShell>} />
          <Route path="/stories" element={<PublicShell><Stories /></PublicShell>} />
          <Route path="/stories/:id" element={<PublicShell><StoryView /></PublicShell>} />
          <Route path="/stories/new" element={<Login />} />
          <Route path="/stories/:id/edit" element={<Login />} />
          <Route path="/hostels" element={<PublicShell><Hostels /></PublicShell>} />
          <Route path="/hostels/:id" element={<PublicShell><HostelDetail /></PublicShell>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Login />} />
        </Routes>
      ) : !user.onboarded ? (
        <Routes>
          <Route path="*" element={<Onboarding />} />
        </Routes>
      ) : (
        <div className="app-root app-auth">
          <header className="topbar">
            <NavLink to="/" end className="brand"><BrandMark /></NavLink>
            <div className="topbar-right">
              <nav className="topnav">
                <NavLink to="/" end>Discover</NavLink>
                <NavLink to="/adventures">Adventures</NavLink>
                <NavLink to="/mytrips">My Trips</NavLink>
                <NavLink to="/chats">Chats</NavLink>
                <MatchesLink />
                <NavLink to="/stories">Stories</NavLink>
                <NavLink to="/hostels">Hostels</NavLink>
              </nav>
              <NotifBell />
              <NavLink to="/profile" className="user-chip" title="Your profile">
                <Avatar user={user} size={28} />
                <span>{user.name?.split(' ')[0] || 'You'}</span>
              </NavLink>
            </div>
          </header>
          <main className="shell content" key={location.pathname}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/search" element={<Results />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/chat" element={<Chatbot />} />
              <Route path="/trip/:slug" element={<TripDetails />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="/chats" element={<Chats />} />
              <Route path="/chats/:id" element={<ChatThread />} />
              <Route path="/hostels" element={<Hostels />} />
              <Route path="/hostels/:id" element={<HostelDetail />} />
              <Route path="/diy" element={<DIY />} />
              <Route path="/groups/:id" element={<GroupHub />} />
              <Route path="/mytrips" element={<MyTrips />} />
              <Route path="/join/:code" element={<Invite />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/users/:id" element={<UserProfile />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/stories/new" element={<StoryEditor />} />
              <Route path="/stories/:id" element={<StoryView />} />
              <Route path="/stories/:id/edit" element={<StoryEditor />} />
              <Route path="/adventures" element={<Adventures />} />
              <Route path="/adventures/routes/:id" element={<AdventureRoute />} />
              <Route path="/adventures/routes/:id/companions" element={<AdventureCompanions />} />
              <Route path="/adventures/bike/profile" element={<AdventureBikeProfile />} />
              <Route path="/adventures/car/profile" element={<AdventureCarProfile />} />
              <Route path="/adventures/carpool" element={<AdventureCarpoolSearch />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      )}
    </Ctx.Provider>
  )
}
