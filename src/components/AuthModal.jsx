import React, { useState } from 'react';
import { 
  X, Lock, Mail, ShieldCheck, UserCheck, Sparkles, ArrowRight, 
  Building2, GraduationCap, Rocket, Code2, CheckCircle2, User, KeyRound
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'signup' | 'demo'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [persona, setPersona] = useState('founder'); // 'student' | 'founder' | 'developer' | 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSignIn = async (e, customEmail = email, role = 'user') => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customEmail || 'harshita@vibe-coding.io', role })
      });
      if (res.ok) {
        const userData = await res.json();
        onLoginSuccess(userData);
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Server network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please provide your name and email address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          persona,
          workspaceName: workspaceName || `${name}'s Workspace`
        })
      });
      if (res.ok) {
        const userData = await res.json();
        onLoginSuccess(userData);
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Registration server error');
    } finally {
      setLoading(false);
    }
  };

  const personas = [
    { id: 'student', title: 'Student', icon: GraduationCap, desc: 'Building resume portfolio projects' },
    { id: 'founder', title: 'Founder', icon: Rocket, desc: 'Launching a 0-to-1 AI startup' },
    { id: 'developer', title: 'Developer', icon: Code2, desc: 'Architecting full-stack AI apps' },
    { id: 'admin', title: 'Admin Ops', icon: ShieldCheck, desc: 'Platform operations & governance' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Pane (Inspired by Clerk / Supabase Showcase) */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-md">
                S
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">StartupOS</span>
            </div>

            <div className="space-y-3 pt-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 uppercase tracking-widest">
                2026 AI Founder Ecosystem
              </span>
              <h3 className="text-2xl font-extrabold leading-tight text-white">
                Build Software As Easy As Writing A Document.
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Connect your workspace to AntiGravity, Emergent, Replit, and Claude. Audit project health, manage 4-file parity, and launch to Product Hunt feed.
              </p>
            </div>
          </div>

          {/* Bottom Social Proof */}
          <div className="relative z-10 pt-8 border-t border-indigo-900/60 space-y-3">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> <span>1,200+ Builders Registered</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium italic">
              "StartupOS made launching our B2B AI app seamless with pre-built AGENTS.md rules."
            </p>
          </div>
        </div>

        {/* Right Pane (Interactive B2B Sign In / Sign Up Tabs) */}
        <div className="w-full md:w-7/12 p-8 sm:p-10 space-y-6">
          {/* Tab Navigation (Clerk Style) */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('signin')}
                className={`text-sm font-bold pb-1 border-b-2 transition-all ${
                  activeTab === 'signin'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`text-sm font-bold pb-1 border-b-2 transition-all ${
                  activeTab === 'signup'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>

            <button
              onClick={() => setActiveTab('demo')}
              className="text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded-full transition-all"
            >
              ⚡ Quick Demos
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <X className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="harshita@vibe-coding.io"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Access Scope</label>
                <select
                  value={persona === 'admin' ? 'admin' : 'user'}
                  onChange={(e) => setPersona(e.target.value === 'admin' ? 'admin' : 'founder')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="user">Builder User Realm</option>
                  <option value="admin">Platform Admin Ops Realm</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                {loading ? 'Signing In...' : 'Sign In to Workspace'}
              </button>

              <div className="pt-2 text-center">
                <span className="text-xs text-slate-500 font-medium">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CREATE ACCOUNT (SIGN UP WITH PERSONA) */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Harshita Agarwal"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="harshita@vibe-coding.io"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Workspace / Studio Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g. Harshita's AI Studio"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Persona Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Select Builder Persona</label>
                <div className="grid grid-cols-2 gap-2">
                  {personas.map((p) => {
                    const Icon = p.icon;
                    const isSelected = persona === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPersona(p.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold">{p.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium block mt-0.5 line-clamp-1">{p.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Rocket className="w-4 h-4 text-amber-300" />
                {loading ? 'Creating Account...' : 'Register Workspace'}
              </button>
            </form>
          )}

          {/* TAB 3: ONE-CLICK QUICK DEMO ACCOUNTS */}
          {activeTab === 'demo' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block text-center">
                Select Pre-Configured Persona Demo
              </span>

              <button
                onClick={(e) => handleSignIn(e, 'harshita@vibe-coding.io', 'user')}
                className="w-full bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 p-4 rounded-2xl flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👩‍💻</span>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block group-hover:text-indigo-600">Harshita G (Founder / Builder)</span>
                    <span className="text-xs text-slate-500 font-medium">User Realm • Personal "My Projects" Workspace</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </button>

              <button
                onClick={(e) => handleSignIn(e, 'admin@startupos.io', 'admin')}
                className="w-full bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-300 p-4 rounded-2xl flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👑</span>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block group-hover:text-amber-700">Platform Admin Ops</span>
                    <span className="text-xs text-slate-500 font-medium">Admin Realm • Product Moderation & User Audit</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-700 transition-colors" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
