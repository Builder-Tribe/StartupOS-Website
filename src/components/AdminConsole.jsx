import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Crown, Flame, Trash2, Award, Users, Lock, CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';

export default function AdminConsole({ currentUser }) {
  const [launches, setLaunches] = useState([]);
  const [usersList, setUsersList] = useState([]);
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

  if (currentUser.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Admin Console Access Restricted</h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          You are currently signed in as <span className="font-bold text-slate-900">{currentUser.name}</span> (User Realm). Admin Ops privileges are required to access this portal.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Portal Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-bold flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Platform Admin Governance Console</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Super Admin Realm
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Moderate launched products, set Featured Product of the Day, and audit platform users.</p>
          </div>
        </div>

        <button onClick={fetchAdminData} className="flex items-center gap-1.5 text-xs text-amber-700 font-bold bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl hover:bg-amber-100 transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Sync Admin Feed
        </button>
      </div>

      {/* Launches Moderation Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Product Launches Moderation ({launches.length})
        </h2>

        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Product & Maker</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Upvotes</th>
                <th className="py-3.5 px-4">Featured Status</th>
                <th className="py-3.5 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {launches.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-500 font-medium line-clamp-1">{item.tagline}</div>
                    <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">by {item.maker.name}</div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-xs text-slate-700">{item.category}</td>
                  <td className="py-4 px-4 font-mono font-bold text-slate-900">{item.upvotes}</td>
                  <td className="py-4 px-4">
                    {item.isFeatured ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        ★ #1 Product of Day
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Standard Listing</span>
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

      {/* Users Governance */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          Registered Platform Users ({usersList.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {usersList.map((u) => (
            <div key={u.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{u.avatar}</span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{u.name}</h4>
                  <span className="text-xs text-slate-500 font-medium">{u.email}</span>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-50 text-indigo-700'}`}>
                {u.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
