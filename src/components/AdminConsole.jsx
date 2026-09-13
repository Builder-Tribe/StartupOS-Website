import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Crown, Flame, Trash2, Award, Users, Lock, CheckCircle2, 
  AlertTriangle, RefreshCw, Search, Filter, Activity, Zap, LayoutDashboard,
  GraduationCap, Rocket, Code2, Building2, Check, FileText, ExternalLink,
  MessageSquare, Star, Sliders, Layers, ChevronRight, LogOut, Settings,
  Lightbulb, FolderGit2, Sparkles, Send, Presentation, TrendingUp, GitBranch
} from 'lucide-react';

export default function AdminConsole({ currentUser, onExitToWebsite, onOpenAuthModal }) {
  const [launches, setLaunches] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditsList, setAuditsList] = useState([]);
  const [ideasList, setIdeasList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [cobuildersList, setCobuildersList] = useState([]);
  const [connectionsList, setConnectionsList] = useState([]);
  
  // Navigation & Filter states
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ideas' | 'blueprints' | 'cobuilders' | 'moderation' | 'users' | 'settings'
  const [personaFilter, setPersonaFilter] = useState('all'); // 'all' | 'student' | 'founder' | 'developer'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'featured' | 'approved'
  const [ideaScoreFilter, setIdeaScoreFilter] = useState('all'); // 'all' | 'high' | 'medium'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Audit evaluation drawer state
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [auditScoreInput, setAuditScoreInput] = useState(95);
  const [auditFeedbackInput, setAuditFeedbackInput] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [resL, resU, resA, resIdeas, resProj, resCobuilders, resConn] = await Promise.all([
        fetch('/api/launches').then(r => r.json()).catch(() => []),
        fetch('/api/auth/users').then(r => r.json()).catch(() => []),
        fetch('/api/admin/audits').then(r => r.json()).catch(() => []),
        fetch('/api/ideas').then(r => r.json()).catch(() => []),
        fetch('/api/projects').then(r => r.json()).catch(() => []),
        fetch('/api/cobuilders').then(r => r.json()).catch(() => []),
        fetch('/api/cobuilders/connections').then(r => r.json()).catch(() => [])
      ]);
      setLaunches(Array.isArray(resL) ? resL : []);
      setUsersList(Array.isArray(resU) ? resU : []);
      setAuditsList(Array.isArray(resA) ? resA : []);
      setIdeasList(Array.isArray(resIdeas) ? resIdeas : []);
      setProjectsList(Array.isArray(resProj) ? resProj : []);
      setCobuildersList(Array.isArray(resCobuilders) ? resCobuilders : []);
      setConnectionsList(Array.isArray(resConn) ? resConn : []);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAdminAction = async (launchId, action) => {
    try {
      const res = await fetch(`/api/admin/launches/${launchId}/${action}`, { method: 'POST' });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error('Admin action failed:', err);
    }
  };

  const handleReviewAudit = async (e) => {
    e.preventDefault();
    if (!selectedAudit) return;
    try {
      const res = await fetch(`/api/admin/audits/${selectedAudit.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: auditScoreInput,
          status: 'verified',
          examinerFeedback: auditFeedbackInput || '4-File Parity score verified by StartupOS Core Team.'
        })
      });
      if (res.ok) {
        fetchAdminData();
        setSelectedAudit(null);
        alert('Project Audit completed and certificate granted!');
      }
    } catch (err) {
      console.error('Audit review failed:', err);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5 text-white shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">StartupOS Admin Access Required</h2>
          <p className="text-slate-400 text-xs leading-relaxed font-medium">
            You are signed in as <span className="font-bold text-white">{currentUser?.name || 'Guest'}</span>. Admin credentials are required to access the StartupOS Internal Management Portal.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={onOpenAuthModal}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              Sign In as Admin
            </button>
            <button
              onClick={onExitToWebsite}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Exit to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Telemetry computations
  const studentCount = usersList.filter(u => u.persona === 'student').length;
  const founderCount = usersList.filter(u => u.persona === 'founder' || !u.persona).length;
  const devCount = usersList.filter(u => u.persona === 'developer').length;
  const featuredCount = launches.filter(l => l.isFeatured).length;
  const avgIdeaScore = ideasList.length > 0 
    ? Math.round(ideasList.reduce((acc, i) => acc + (Number(i.score) || 0), 0) / ideasList.length)
    : 0;
  const avgParityScore = projectsList.length > 0 
    ? Math.round(projectsList.reduce((acc, p) => acc + (Number(p.parityScore) || 0), 0) / projectsList.length)
    : 100;

  // Filtered lists
  const filteredUsers = usersList.filter(u => {
    const matchesPersona = personaFilter === 'all' || (u.persona || 'founder') === personaFilter;
    const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.workspaceName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPersona && matchesSearch;
  });

  const filteredLaunches = launches.filter(l => {
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'featured' && l.isFeatured) ||
                          (statusFilter === 'approved' && l.status === 'approved');
    const matchesSearch = (l.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ((l.maker && l.maker.name) || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredIdeas = ideasList.filter(i => {
    const score = Number(i.score) || 0;
    const matchesScore = ideaScoreFilter === 'all' || 
                         (ideaScoreFilter === 'high' && score >= 75) ||
                         (ideaScoreFilter === 'medium' && score < 75);
    const matchesSearch = (i.name || i.idea || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (i.audience || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesScore && matchesSearch;
  });

  const adminNavItems = [
    { id: 'overview', label: 'Founder Telemetry Pulse', icon: LayoutDashboard },
    { id: 'ideas', label: 'Idea Lab Tracker', icon: Lightbulb, badge: `${ideasList.length}` },
    { id: 'blueprints', label: 'Repos & 4-File Parity', icon: FolderGit2, badge: `${projectsList.length}` },
    { id: 'cobuilders', label: 'Co-Builders & Pitches', icon: Users, badge: `${connectionsList.length}` },
    { id: 'moderation', label: 'Product Launches (CMS)', icon: Rocket, badge: `${launches.length}` },
    { id: 'users', label: 'Users & Personas', icon: Users, badge: `${usersList.length}` },
    { id: 'settings', label: 'System & Architecture', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-600 selection:text-white flex overflow-hidden">
      {/* 1. LEFT ADMIN SIDEBAR PANEL */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 select-none">
        <div className="p-5 space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/30">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">StartupOS</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
                  Admin CMS
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">Founder Activity & Management</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1 pt-2">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-2">
              Founder Activity Modules
            </span>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Sign Out */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700 flex items-center justify-center text-sm shrink-0">
                👑
              </span>
              <div className="truncate">
                <span className="text-xs font-bold text-white block truncate">{currentUser?.name}</span>
                <span className="text-[10px] text-amber-400 font-semibold block truncate">StartupOS Team</span>
              </div>
            </div>

            {onExitToWebsite && (
              <button
                onClick={onExitToWebsite}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Exit to Website"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MAIN ADMIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Top Header */}
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-extrabold text-white capitalize flex items-center gap-2">
              {activeTab === 'overview' && '📊 Founder Activity Telemetry Pulse'}
              {activeTab === 'ideas' && '💡 Idea Lab Concepts & Market Demand'}
              {activeTab === 'blueprints' && '🛠️ Connected Repos & 4-File Parity Governance'}
              {activeTab === 'cobuilders' && '🤝 Co-Founder Matching Radar & Pitch Proposals'}
              {activeTab === 'moderation' && '🚀 Product Launches & Launchpad CMS'}
              {activeTab === 'users' && '👥 Signed-Up Builders & Persona Breakdown'}
              {activeTab === 'settings' && '⚙️ System Architecture & Storage Health'}
            </h1>
            <p className="text-xs text-slate-400 font-medium">Tracking what founders are building, testing, and shipping</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64 hidden sm:block">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search ideas, repos, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={fetchAdminData}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </header>

        {/* View Contents */}
        <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
          {/* TAB 1: 360° FOUNDER TELEMETRY PULSE */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Executive Metrics Cards: Full 5-Stage Pulse */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Active Builders</span>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">{usersList.length}</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    <span className="text-indigo-400 font-bold">{founderCount} Founders</span> • <span className="text-emerald-400 font-bold">{devCount} Devs</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Ideas Ingested</span>
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-amber-400">{ideasList.length}</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Avg Viability Score: <span className="text-white font-bold">{avgIdeaScore}/100</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Connected Repos</span>
                    <FolderGit2 className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">{projectsList.length}</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Avg Parity Health: <span className="text-emerald-400 font-bold">{avgParityScore}%</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Products Shipped</span>
                    <Rocket className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-purple-400">{launches.length}</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    <span className="text-white font-bold">{launches.reduce((acc, l) => acc + (l.upvotes || 0), 0)}</span> Total Upvotes
                  </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Pitches Exchanged</span>
                    <Send className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-400">{connectionsList.length}</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Co-Founder Match Proposals
                  </div>
                </div>
              </div>

              {/* 2-Column Live Streams: Ideas Pulse & Repo Parity Pulse */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Recent Startup Concepts Ingested */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>Live Idea Lab Pulse (Latest Concepts)</span>
                    </h3>
                    <button 
                      onClick={() => setActiveTab('ideas')} 
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {ideasList.slice(0, 4).map((idea) => (
                      <div key={idea.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white">{idea.name || idea.idea}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1">Audience: <span className="text-slate-200">{idea.audience || 'Founders'}</span> • Pain: {idea.problem || 'Market inefficiency'}</p>
                          <span className="text-[10px] text-slate-500 block">Moat: {idea.advantage || 'AI-native differentiation'}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                            (idea.score || 0) >= 75 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}>
                            {idea.score || 70} pts
                          </span>
                        </div>
                      </div>
                    ))}
                    {ideasList.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-6">No ideas registered yet.</p>
                    )}
                  </div>
                </div>

                {/* Right: Connected Repositories & Parity Health */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-indigo-400" />
                      <span>Connected Repositories & Parity Health</span>
                    </h3>
                    <button 
                      onClick={() => setActiveTab('blueprints')} 
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {projectsList.slice(0, 4).map((proj) => (
                      <div key={proj.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white">{proj.name}</h4>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {proj.category || 'Commercial'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{proj.tagline}</p>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            {(proj.stack || []).slice(0, 3).map((st, i) => (
                              <span key={i} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                                {st}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                            (proj.parityScore || 0) === 100 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}>
                            {proj.parityScore || 100}% Parity
                          </span>
                        </div>
                      </div>
                    ))}
                    {projectsList.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-6">No repositories registered yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IDEA LAB TRACKER */}
          {activeTab === 'ideas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase font-mono">Viability Filter:</span>
                  {[
                    { id: 'all', label: 'All Ideas' },
                    { id: 'high', label: 'High Viability (≥75)' },
                    { id: 'medium', label: 'Developing (<75)' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setIdeaScoreFilter(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        ideaScoreFilter === f.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-400">{filteredIdeas.length} concepts analyzed</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredIdeas.map((idea) => (
                  <div key={idea.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">{idea.name || idea.idea}</h4>
                        <span className="text-[10px] text-indigo-400 font-mono font-bold">Target: {idea.audience || 'Founders'}</span>
                      </div>
                      <span className={`text-xs font-extrabold px-2.5 py-1 rounded-xl border ${
                        (idea.score || 0) >= 75 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {idea.score || 70} / 100
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Problem Statement</span>
                        <p className="text-slate-300">{idea.problem || 'Solving operational inefficiencies.'}</p>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Unfair Advantage</span>
                        <p className="text-slate-300">{idea.advantage || 'AI-first automation and deep integrations.'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>Budget: {idea.budget ? `₹${idea.budget}` : 'Bootstrapped'}</span>
                      <span className="font-medium text-slate-300">{idea.verdict || 'Validated concept'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REGISTERED REPOSITORIES & 4-FILE PARITY */}
          {activeTab === 'blueprints' && (
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="px-5 py-3">Project / Repository</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Tech Stack</th>
                      <th className="px-5 py-3">Constitutional Parity</th>
                      <th className="px-5 py-3 text-right">Links</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {projectsList.map((proj) => (
                      <tr key={proj.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-white text-sm">{proj.name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 max-w-sm">{proj.tagline}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {proj.category || 'Commercial'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(proj.stack || []).map((s, i) => (
                              <span key={i} className="text-[9px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                            (proj.parityScore || 0) === 100 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}>
                            {proj.parityScore || 100}% Parity
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          {proj.repoUrl && (
                            <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1">
                              Repo <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {proj.demoUrl && (
                            <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1">
                              Demo <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CO-BUILDERS & PITCHES */}
          {activeTab === 'cobuilders' && (
            <div className="space-y-6">
              {/* Proposals Sent Log */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span>Founder Collaboration Pitches Exchanged ({connectionsList.length})</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Live Pitch Proposals</span>
                </div>

                {connectionsList.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No co-founder pitch proposals sent yet. Active matches will stream here in real time.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {connectionsList.map((conn) => (
                      <div key={conn.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">
                            {conn.senderName} ➔ <span className="text-indigo-400">{conn.recipientName}</span>
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {conn.equityOffered}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 italic">"{conn.pitchMessage}"</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span>Role Offered: <strong className="text-slate-200">{conn.roleOffered}</strong></span>
                          <span>Project: <strong className="text-slate-200">{conn.projectName}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Co-Builder Profiles Directory */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Registered Co-Builders Directory ({cobuildersList.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cobuildersList.map((c) => (
                    <div key={c.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.avatar || '👨‍💻'}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white">{c.name}</h4>
                          <p className="text-[11px] text-indigo-400">{c.role}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">{c.bio}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {(c.skills || []).map((sk, i) => (
                          <span key={i} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRODUCT LAUNCHES (CMS) */}
          {activeTab === 'moderation' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-400 shrink-0 uppercase font-mono">Filter Launches:</span>
                  {['all', 'featured', 'approved'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
                        statusFilter === s
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {s} ({launches.filter(l => s === 'all' || (s === 'featured' && l.isFeatured) || (s === 'approved' && l.status === 'approved')).length})
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-400">{filteredLaunches.length} products listed</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLaunches.map((launch) => (
                  <div key={launch.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">{launch.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{launch.tagline}</p>
                      </div>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                        🔥 {launch.upvotes || 0} Upvotes
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                      <span className="text-slate-400">Maker: <strong className="text-slate-200">{launch.maker?.name}</strong></span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAdminAction(launch.id, 'feature')}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer"
                        >
                          {launch.isFeatured ? '★ Featured' : 'Feature'}
                        </button>
                        <button
                          onClick={() => handleAdminAction(launch.id, 'approve')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: USERS & PERSONAS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-400 shrink-0 uppercase font-mono">Filter Persona:</span>
                  {['all', 'student', 'founder', 'developer'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPersonaFilter(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
                        personaFilter === p
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-400">{filteredUsers.length} accounts found</span>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="px-5 py-3">Builder Name</th>
                      <th className="px-5 py-3">Email Address</th>
                      <th className="px-5 py-3">Persona</th>
                      <th className="px-5 py-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3 font-bold text-white flex items-center gap-2">
                          <span className="text-base">{user.avatar || '👨‍💻'}</span>
                          <span>{user.name}</span>
                        </td>
                        <td className="px-5 py-3 text-slate-400 font-mono">{user.email}</td>
                        <td className="px-5 py-3">
                          <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                            {user.persona || 'Founder'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            user.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: SYSTEM ARCHITECTURE & HEALTH */}
          {activeTab === 'settings' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold uppercase text-white font-mono">Backend API Infrastructure & Data Health</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block">Server Daemon:</span>
                  <span className="text-emerald-400 font-bold text-sm">🟢 Running on Port 8081</span>
                  <p className="text-[10px] text-slate-500">Pure Node.js standard library runtime</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block">Data Repositories:</span>
                  <span className="text-white font-bold text-sm">9 Atomic Stores</span>
                  <p className="text-[10px] text-slate-500">ideas, projects, cobuilders, audits, launches</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block">QA Engine:</span>
                  <span className="text-indigo-400 font-bold text-sm">Pre-Flight Sandbox v3.0</span>
                  <p className="text-[10px] text-slate-500">5-suite live filesystem verification</p>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 bg-slate-950 mt-auto">
          StartupOS Internal Management CMS — 360° Founder Telemetry Engine.
        </footer>
      </div>
    </div>
  );
}
