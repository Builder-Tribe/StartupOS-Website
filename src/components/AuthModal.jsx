import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, UserCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user'); // 'user' | 'admin'
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e, selectRole = role, customEmail = email) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customEmail || (selectRole === 'admin' ? 'admin@startupos.io' : 'harshita@vibe-coding.io'), role: selectRole })
      });
      if (res.ok) {
        const userData = await res.json();
        onLoginSuccess(userData);
        onClose();
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md">
            S
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Authenticate to StartupOS</h2>
          <p className="text-xs text-slate-500 font-medium">Access your personal workspace or admin control console</p>
        </div>

        {/* Quick One-Click Demo Logins */}
        <div className="space-y-2.5 pt-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            ⚡ Quick Demo Sign In Options
          </span>

          <button
            onClick={() => handleLogin(null, 'user', 'harshita@vibe-coding.io')}
            className="w-full bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 p-3.5 rounded-2xl flex items-center justify-between text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👩‍💻</span>
              <div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-600">Harshita G (Founder / Builder)</span>
                <span className="text-[10px] text-slate-500 font-medium">User Realm • Personal Workspace & Launches</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </button>

          <button
            onClick={() => handleLogin(null, 'admin', 'admin@startupos.io')}
            className="w-full bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 p-3.5 rounded-2xl flex items-center justify-between text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-700">Platform Admin Ops</span>
                <span className="text-[10px] text-slate-500 font-medium">Admin Realm • Moderation & User Management</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 transition-colors" />
          </button>
        </div>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Or custom email</span></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@startupos.io"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Role Realm</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="user">Builder User Realm</option>
              <option value="admin">Platform Admin Ops Realm</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}
