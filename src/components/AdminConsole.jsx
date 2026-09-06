import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Crown, Flame, Trash2, Award, Users, Lock, CheckCircle2, 
  AlertTriangle, RefreshCw, Search, Filter, Activity, UserPlus, Zap
} from 'lucide-react';

export default function AdminConsole({ currentUser }) {
  const [launches, setLaunches] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('moderation'); // 'moderation' | 'users' | 'audit'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'featured' | 'approved'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [resL, resU] = await Promise.all([
        fetch('/api/launches').then(r => r.json()),
        fetch('/api/auth/users').then(r => r.json())
      ]);
      setLaunches(resL);
      setUsersList(resU);
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
      if (res.ok) {
        fetchAdminData();
      }
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
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Role promotion failed:', err);
    }
  };

  if (currentUser.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Admin Console Privileges Required</h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto font-medium">
          You are currently signed in as <span className="font-bold text-slate-900">{currentUser.name}</span> (User Realm). Super Admin privileges are required to moderate launches and manage platform users.
        </p>
      </div>
    );
  }

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top B2B Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-indigo-900/50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white font-bold flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
            <Crown className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">Platform Admin Governance Console</h1>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-1">
              Inspired by Linear & Stripe • Manage products, feature Product of the Day, and assign maker credentials.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Sync Telemetry
        </button>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Registered Makers</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{usersList.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Product Launches Listed</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{launches.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Featured #1 Products</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{featuredCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>4-File Parity Audit</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">100%</p>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex border-b border-slate-200/80 gap-6">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'moderation'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" /> Product Launch Moderation
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> Maker Directory & Role Manager
        </button>
      </div>

      {/* TAB 1: PRODUCT LAUNCH MODERATION */}
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
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
              >
                All ({launches.length})
              </button>
              <button
                onClick={() => setStatusFilter('featured')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${statusFilter === 'featured' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
              >
                Featured #1 ({featuredCount})
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Upvotes</th>
                  <th className="py-3.5 px-4">Featured Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLaunches.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                      <div className="text-xs text-slate-500 font-medium line-clamp-1">{item.tagline}</div>
                      <div className="text-[11px] text-indigo-600 font-bold mt-0.5">Maker: {item.maker.name}</div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-xs text-slate-700">{item.category}</td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">{item.upvotes}</td>
                    <td className="py-4 px-4">
                      {item.isFeatured ? (
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          ★ #1 Product of Day
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Standard Feed</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleAdminAction(item.id, 'feature')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          item.isFeatured ? 'bg-slate-200 text-slate-800' : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}
                      >
                        {item.isFeatured ? 'Unfeature' : 'Set Featured'}
                      </button>
                      <button
                        onClick={() => handleAdminAction(item.id, 'delete')}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
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

      {/* TAB 2: MAKER DIRECTORY & ROLE MANAGER */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Maker Name & Avatar</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Persona</th>
                  <th className="py-3.5 px-4">Current Badge</th>
                  <th className="py-3.5 px-4 text-right">Role Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{u.avatar}</span>
                        <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600 font-medium">{u.email}</td>
                    <td className="py-4 px-4 text-xs font-semibold capitalize text-slate-700">{u.persona || 'founder'}</td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>
                        {u.badge}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      {u.role === 'user' ? (
                        <button
                          onClick={() => handleRolePromotion(u.id, 'admin')}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-all"
                        >
                          Promote to Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRolePromotion(u.id, 'user')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
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
    </div>
  );
}
