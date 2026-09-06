import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Crown, Flame, Trash2, Award, Users, Lock, CheckCircle2, 
  AlertTriangle, RefreshCw, Search, Filter, Activity, UserPlus, Zap,
  GraduationCap, Rocket, Code2, Building2, Check, FileText, ExternalLink,
  MessageSquare, Star, Sliders, Layers, ChevronRight
} from 'lucide-react';

export default function AdminConsole({ currentUser, onExitToPortal, onExitToWebsite, onOpenAuthModal }) {
  const [launches, setLaunches] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditsList, setAuditsList] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'moderation' | 'audits' | 'cms'
  
  // Filters & Inputs
  const [personaFilter, setPersonaFilter] = useState('all'); // 'all' | 'student' | 'founder' | 'developer' | 'admin'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'featured' | 'approved' | 'pending'
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
      console.error('Failed to load admin telemetry', e);
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

  const handleRolePromotion = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole, badge: newRole === 'admin' ? 'Super Admin' : 'Pro Builder' })
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error('Role promotion failed:', err);
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
          <h2 className="text-2xl font-extrabold tracking-tight">StartupOS Team Access Required</h2>
          <p className="text-slate-400 text-xs leading-relaxed font-medium">
            You are currently signed in as <span className="font-bold text-white">{currentUser.name}</span> (User Realm). Super Admin privileges are required to access the StartupOS Team Command Center.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={onOpenAuthModal}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              Sign In as Platform Admin
            </button>
            <button
              onClick={onExitToPortal}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
            >
              Return to Builder Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Persona telemetry breakdown
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col">
      {/* COMMAND CENTER TOP HEADER BAR */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Command Center Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
              <Crown className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">StartupOS Command Center</span>
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest">
                  Admin Ops
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">Core Platform Telemetry & Governance</span>
            </div>
          </div>

          {/* Real-time Infrastructure Telemetry Ticker */}
          <div className="hidden lg:flex items-center gap-4 text-[11px] bg-slate-950/80 px-4 py-1.5 rounded-full border border-slate-800">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Node API Hub (8081)
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-300 font-medium">👥 <strong className="text-white">{usersList.length}</strong> Registered Users</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-300 font-medium">🚀 <strong className="text-white">{launches.length}</strong> Shipped Products</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-300 font-medium">🛡️ <strong className="text-white">{auditsList.length}</strong> Audits Pending</span>
          </div>

          {/* Right Header Navigation & Exit Options */}
          <div className="flex items-center gap-3">
            {/* Switch to Builder Portal */}
            {onExitToPortal && (
              <button
                onClick={onExitToPortal}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-700 transition-all"
                title="Switch to User Builder Portal"
              >
                <Rocket className="w-3.5 h-3.5 text-indigo-400" />
                <span>Builder Portal</span>
              </button>
            )}

            {/* Logout / Exit to Marketing Website */}
            {onExitToWebsite && (
              <button
                onClick={onExitToWebsite}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white px-3 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 transition-all"
                title="Exit Command Center to Marketing Website"
              >
                <span>Logout</span>
              </button>
            )}

            {/* Admin User Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-sm">
                👑
              </span>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-white block leading-tight">{currentUser.name}</span>
                <span className="text-[10px] font-bold text-amber-400 block">Super Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* COMMAND CENTER MAIN WORKBENCH */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Team Operations Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-indigo-900/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <Crown className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">StartupOS Core Team Command Center</h1>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest">
                  1-Stop Ops Console
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1">
                Unified internal dashboard to monitor registered users across personas (*Founders*, *College Students*, *Developers*), approve community launches, feature #1 Product of the Day, and conduct 4-file parity code audits.
              </p>
            </div>
          </div>

          <button
            onClick={fetchAdminData}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Sync Telemetry Data
          </button>
        </div>

      {/* EXECUTIVE TELEMETRY KPI DASHBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Signed-up Users</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{usersList.length}</div>
          <div className="flex gap-1 text-[10px] text-slate-500 font-medium pt-1">
            <span className="text-indigo-600 font-bold">{founderCount} Founders</span> • 
            <span className="text-emerald-600 font-bold">{studentCount} Students</span>
          </div>
        </div>

        {/* Total Shipped Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Products Shipped</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{launches.length}</div>
          <div className="text-[10px] text-slate-500 font-medium pt-1">
            {featuredCount} Featured Product of the Day
          </div>
        </div>

        {/* College Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>College Students</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{studentCount}</div>
          <div className="text-[10px] text-slate-500 font-medium pt-1">
            Resume portfolio builders
          </div>
        </div>

        {/* Audit Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Audit Requests</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-600">{auditsList.length}</div>
          <div className="text-[10px] text-slate-500 font-medium pt-1">
            {auditsList.filter(a => a.status === 'pending').length} Pending Team Review
          </div>
        </div>

        {/* System Parity Health */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>4-File Parity Health</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-500">100%</div>
          <div className="text-[10px] text-slate-500 font-medium pt-1">
            AGENTS, ROADMAP, CLAUDE & CONTRIBUTING
          </div>
        </div>
      </div>

      {/* TEAM COMMAND TAB NAVIGATION */}
      <div className="flex border-b border-slate-200/80 gap-6 overflow-x-auto">
        {[
          { id: 'users', label: '👥 User & Persona Directory', badge: `${usersList.length}` },
          { id: 'moderation', label: '🚀 Product Launch Approval & CMS', badge: `${launches.length}` },
          { id: 'audits', label: '🎓 Project Audit Workbench (Admin LMS)', badge: `${auditsList.length}` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: USER & PERSONA DIRECTORY (WHO ALL SIGNED UP & WHAT THEY ARE DOING) */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search registered builders by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Persona Filters */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Persona:</span>
              {['all', 'student', 'founder', 'developer', 'admin'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPersonaFilter(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                    personaFilter === p
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">User Name & Avatar</th>
                  <th className="py-3.5 px-4">Work Email</th>
                  <th className="py-3.5 px-4">Persona</th>
                  <th className="py-3.5 px-4">Workspace Studio</th>
                  <th className="py-3.5 px-4">Role & Badge</th>
                  <th className="py-3.5 px-4 text-right">Team Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-lg shrink-0">
                          {u.avatar || '👩‍💻'}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">{u.name}</span>
                          <span className="text-[10px] text-slate-400">ID: {u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        u.persona === 'student' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        u.persona === 'admin' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {u.persona || 'founder'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 flex items-center gap-1.5 pt-5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.workspaceName || `${u.name}'s Studio`}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {u.badge || 'Pro Builder'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {u.role === 'user' ? (
                        <button
                          onClick={() => handleRolePromotion(u.id, 'admin')}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                        >
                          Promote to Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRolePromotion(u.id, 'user')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                        >
                          Demote to User
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT LAUNCH APPROVAL & CMS DRIVER */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Filter launches or makers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
              >
                All ({launches.length})
              </button>
              <button
                onClick={() => setStatusFilter('featured')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${statusFilter === 'featured' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
              >
                ★ Product of the Day ({featuredCount})
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Upvotes</th>
                  <th className="py-3.5 px-4">Status & Featured</th>
                  <th className="py-3.5 px-4 text-right">CMS Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLaunches.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                      <div className="text-slate-500 font-medium line-clamp-1 mt-0.5">{item.tagline}</div>
                      <div className="text-[11px] text-indigo-600 font-bold mt-0.5">Maker: {item.maker.name}</div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700">{item.category}</td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">{item.upvotes}</td>
                    <td className="py-4 px-4">
                      {item.isFeatured ? (
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          ★ #1 Product of Day
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Approved Listing
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleAdminAction(item.id, 'feature')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          item.isFeatured ? 'bg-slate-200 text-slate-800' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                        }`}
                      >
                        {item.isFeatured ? 'Unfeature' : 'Set #1 Featured'}
                      </button>
                      <button
                        onClick={() => handleAdminAction(item.id, 'delete')}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
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

      {/* TAB 3: PROJECT AUDIT & CODE EVALUATION WORKBENCH (ADMIN LMS) */}
      {activeTab === 'audits' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs text-indigo-600 font-mono font-bold uppercase tracking-widest bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                Admin LMS & 4-File Parity Inspector
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-2">Submitted Product Audit Queue</h2>
              <p className="text-xs text-slate-500 mt-1">Review student & founder projects, inspect 4-file parity baseline, and issue verified builder scores.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Project & Builder</th>
                  <th className="py-3.5 px-4">Persona</th>
                  <th className="py-3.5 px-4">4-File Parity Baseline</th>
                  <th className="py-3.5 px-4">Audit Score</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {auditsList.map((audit) => (
                  <tr key={audit.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 text-xs">{audit.projectName}</div>
                      <div className="text-[11px] text-slate-500">{audit.builderName}</div>
                      <a href={audit.githubUrl} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5 mt-0.5">
                        GitHub Repo <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
                        {audit.persona || 'founder'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded ${audit.hasAgents ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>AGENTS</span>
                        <span className={`px-1.5 py-0.5 rounded ${audit.hasRoadmap ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>ROADMAP</span>
                        <span className={`px-1.5 py-0.5 rounded ${audit.hasClaude ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>CLAUDE</span>
                        <span className={`px-1.5 py-0.5 rounded ${audit.hasContributing ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>CONTRIBUTING</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-extrabold text-slate-900 text-sm">
                      {audit.score}/100
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full capitalize ${
                        audit.status === 'verified' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
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
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
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
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      Admin Code Examiner
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-1">Audit {selectedAudit.projectName}</h3>
                  </div>
                  <button onClick={() => setSelectedAudit(null)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
                </div>

                <form onSubmit={handleReviewAudit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1 font-mono">Assign Audit Score (0 - 100) *</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={auditScoreInput}
                      onChange={(e) => setAuditScoreInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1 font-mono">Examiner Feedback & Audit Notes *</label>
                    <textarea
                      rows={3}
                      required
                      value={auditFeedbackInput}
                      onChange={(e) => setAuditFeedbackInput(e.target.value)}
                      placeholder="Add evaluation notes on 4-file parity, code quality, and architecture..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAudit(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
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
      </main>
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 bg-slate-900/60 mt-auto">
        StartupOS Team Command Center — 1-Stop Admin Ops, User Telemetry, Moderation & 4-File Parity Audits.
      </footer>
    </div>
  );
}
