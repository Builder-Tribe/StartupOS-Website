import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Crown, Flame, Trash2, Award, Users, Lock, CheckCircle2, 
  AlertTriangle, RefreshCw, Search, Filter, Activity, Zap, LayoutDashboard,
  GraduationCap, Rocket, Code2, Building2, Check, FileText, ExternalLink,
  MessageSquare, Star, Sliders, Layers, ChevronRight, LogOut, Settings
} from 'lucide-react';

export default function AdminConsole({ currentUser, onExitToWebsite, onOpenAuthModal }) {
  const [launches, setLaunches] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditsList, setAuditsList] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'moderation' | 'audits' | 'settings'
  
  // Filters & Inputs
  const [personaFilter, setPersonaFilter] = useState('all'); // 'all' | 'student' | 'founder' | 'developer'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'featured' | 'approved'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Audit evaluation drawer state
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [auditScoreInput, setAuditScoreInput] = useState(95);
  const [auditFeedbackInput, setAuditFeedbackInput] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [resL, resU, resA] = await Promise.all([
        fetch('/api/launches').then(r => r.json()),
        fetch('/api/auth/users').then(r => r.json()),
        fetch('/api/admin/audits').then(r => r.json()).catch(() => [])
      ]);
      setLaunches(resL || []);
      setUsersList(resU || []);
      setAuditsList(resA || []);
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

  if (currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5 text-white shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">StartupOS Admin Access Required</h2>
          <p className="text-slate-400 text-xs leading-relaxed font-medium">
            You are signed in as <span className="font-bold text-white">{currentUser.name}</span>. Admin credentials are required to access the StartupOS Internal CMS.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={onOpenAuthModal}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
            >
              Sign In as Admin
            </button>
            <button
              onClick={onExitToWebsite}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
            >
              Exit to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Telemetry breakdown
  const studentCount = usersList.filter(u => u.persona === 'student').length;
  const founderCount = usersList.filter(u => u.persona === 'founder' || !u.persona).length;
  const devCount = usersList.filter(u => u.persona === 'developer').length;

  // Filtered users list
  const filteredUsers = usersList.filter(u => {
    const matchesPersona = personaFilter === 'all' || (u.persona || 'founder') === personaFilter;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.workspaceName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPersona && matchesSearch;
  });

  // Filtered launches list
  const filteredLaunches = launches.filter(l => {
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'featured' && l.isFeatured) ||
                          (statusFilter === 'approved' && l.status === 'approved');
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.maker.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const featuredCount = launches.filter(l => l.isFeatured).length;

  const adminNavItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users & Personas', icon: Users, badge: `${usersList.length}` },
    { id: 'moderation', label: 'Product Launches (CMS)', icon: Rocket, badge: `${launches.length}` },
    { id: 'audits', label: 'Project Audits (LMS)', icon: ShieldCheck, badge: `${auditsList.length}` },
    { id: 'settings', label: 'System & Health', icon: Settings },
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
              <span className="text-[10px] text-slate-400 font-medium block">Internal Management Portal</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1 pt-2">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-2">
              Management Modules
            </span>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
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
                <span className="text-xs font-bold text-white block truncate">{currentUser.name}</span>
                <span className="text-[10px] text-amber-400 font-semibold block truncate">Platform Admin</span>
              </div>
            </div>

            {onExitToWebsite && (
              <button
                onClick={onExitToWebsite}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Sign Out to Website"
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
              {activeTab === 'overview' && '📊 Platform Dashboard Overview'}
              {activeTab === 'users' && '👥 Signed-Up Users & Persona Directory'}
              {activeTab === 'moderation' && '🚀 Product Launches & Moderation CMS'}
              {activeTab === 'audits' && '🎓 4-File Parity Project Audits (LMS)'}
              {activeTab === 'settings' && '⚙️ System Architecture & Backend Health'}
            </h1>
            <p className="text-xs text-slate-400 font-medium">StartupOS Core Team Admin Panel</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64 hidden sm:block">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search users or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={fetchAdminData}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </header>

        {/* View Contents */}
        <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Executive Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Registered Builders</span>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">{usersList.length}</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    <span className="text-indigo-400 font-bold">{founderCount} Founders</span> • <span className="text-emerald-400 font-bold">{studentCount} Students</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Products Shipped</span>
                    <Flame className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">{launches.length}</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    <span className="text-amber-400 font-bold">{featuredCount} Featured</span> Product of the Day
                  </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Project Audits</span>
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">{auditsList.length}</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {auditsList.filter(a => a.status === 'pending').length} Pending Examiner Review
                  </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>4-File Parity Baseline</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-400">100%</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    AGENTS, ROADMAP, CLAUDE & CONTRIBUTING
                  </div>
                </div>
              </div>

              {/* Persona Distribution Showcase */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
                <h3 className="text-sm font-extrabold text-white tracking-wide uppercase font-mono">User Personas Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5"><Rocket className="w-3.5 h-3.5 text-indigo-400" /> Founders</span>
                      <span className="font-bold text-white">{founderCount}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Building 0-to-1 startups on StartupOS</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-emerald-400" /> College Students</span>
                      <span className="font-bold text-white">{studentCount}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Creating resume projects & learning AI</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5 text-amber-400" /> Developers</span>
                      <span className="font-bold text-white">{devCount}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Architecting full-stack AI applications</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-400 shrink-0 uppercase font-mono">Filter Persona:</span>
                  {['all', 'student', 'founder', 'developer'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPersonaFilter(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                        personaFilter === p
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Work Email</th>
                      <th className="py-3.5 px-4">Persona</th>
                      <th className="py-3.5 px-4">Workspace Studio</th>
                      <th className="py-3.5 px-4">Badge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-lg shrink-0">
                              {u.avatar || '👩‍💻'}
                            </span>
                            <div>
                              <span className="font-bold text-white block text-xs">{u.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">ID: {u.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            u.persona === 'student' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {u.persona || 'founder'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-300">
                          {u.workspaceName || `${u.name}'s Studio`}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {u.badge || 'Pro Builder'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCT LAUNCHES (CMS) */}
          {activeTab === 'moderation' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                  >
                    All ({launches.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('featured')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${statusFilter === 'featured' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                  >
                    ★ Product of the Day ({featuredCount})
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Product Details</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Upvotes</th>
                      <th className="py-3.5 px-4">Featured Status</th>
                      <th className="py-3.5 px-4 text-right">CMS Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredLaunches.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-white text-xs">{item.title}</div>
                          <div className="text-slate-400 font-medium line-clamp-1 mt-0.5">{item.tagline}</div>
                          <div className="text-[11px] text-indigo-400 font-bold mt-0.5">Maker: {item.maker.name}</div>
                        </td>
                        <td className="py-4 px-4 font-medium text-slate-300">{item.category}</td>
                        <td className="py-4 px-4 font-mono font-bold text-white">{item.upvotes}</td>
                        <td className="py-4 px-4">
                          {item.isFeatured ? (
                            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              ★ #1 Product of Day
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              Approved
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleAdminAction(item.id, 'feature')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              item.isFeatured ? 'bg-slate-800 text-slate-300' : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                            }`}
                          >
                            {item.isFeatured ? 'Unfeature' : 'Set #1 Featured'}
                          </button>
                          <button
                            onClick={() => handleAdminAction(item.id, 'delete')}
                            className="p-2 rounded-xl text-red-400 hover:bg-red-950/40 transition-colors"
                            title="Delete Product Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PROJECT AUDITS (LMS) */}
          {activeTab === 'audits' && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Project & Builder</th>
                      <th className="py-3.5 px-4">Persona</th>
                      <th className="py-3.5 px-4">4-File Parity Baseline</th>
                      <th className="py-3.5 px-4">Audit Score</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {auditsList.map((audit) => (
                      <tr key={audit.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-white text-xs">{audit.projectName}</div>
                          <div className="text-[11px] text-slate-400">{audit.builderName}</div>
                          <a href={audit.githubUrl} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5 mt-0.5">
                            GitHub Repo <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 text-indigo-300 border border-slate-800 capitalize">
                            {audit.persona || 'founder'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 font-mono text-[10px]">
                            <span className={`px-1.5 py-0.5 rounded ${audit.hasAgents ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'}`}>AGENTS</span>
                            <span className={`px-1.5 py-0.5 rounded ${audit.hasRoadmap ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'}`}>ROADMAP</span>
                            <span className={`px-1.5 py-0.5 rounded ${audit.hasClaude ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'}`}>CLAUDE</span>
                            <span className={`px-1.5 py-0.5 rounded ${audit.hasContributing ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'}`}>CONTRIBUTING</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono font-extrabold text-white text-sm">
                          {audit.score}/100
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full capitalize ${
                            audit.status === 'verified' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {audit.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedAudit(audit);
                              setAuditScoreInput(audit.score || 95);
                              setAuditFeedbackInput(audit.examinerFeedback || '');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs"
                          >
                            Audit Product
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* EVALUATION DRAWER MODAL */}
              {selectedAudit && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                  <div className="bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-800 text-white">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded">
                          Admin Code Examiner
                        </span>
                        <h3 className="text-xl font-extrabold text-white mt-1">Audit {selectedAudit.projectName}</h3>
                      </div>
                      <button onClick={() => setSelectedAudit(null)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
                    </div>

                    <form onSubmit={handleReviewAudit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1 font-mono">Assign Audit Score (0 - 100) *</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required
                          value={auditScoreInput}
                          onChange={(e) => setAuditScoreInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1 font-mono">Examiner Feedback & Audit Notes *</label>
                        <textarea
                          rows={3}
                          required
                          value={auditFeedbackInput}
                          onChange={(e) => setAuditFeedbackInput(e.target.value)}
                          placeholder="Add evaluation notes on 4-file parity, code quality, and architecture..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedAudit(null)}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                        >
                          Verify Audit & Grant Certificate
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold uppercase text-white font-mono">Backend API Infrastructure</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Server Status:</span>
                  <span className="text-emerald-400 font-bold">🟢 Running on Port 8081</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Data Repositories:</span>
                  <span className="text-white font-bold">ideas.json, users.json, audits.json</span>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 bg-slate-950 mt-auto">
          StartupOS Internal Management CMS — 1-Stop Admin Platform.
        </footer>
      </div>
    </div>
  );
}
