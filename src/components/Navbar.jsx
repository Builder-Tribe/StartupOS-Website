import React from 'react';
import { 
  Trophy, FolderGit2, Sparkles, GraduationCap, ShieldCheck, Plus, User, Crown, Lock, Compass
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentUser, onOpenLaunchModal, onOpenAuthModal }) {
  const tabs = [
    { id: 'launchpad', label: '🏆 Launchpad', icon: Trophy, badge: 'Product Hunt' },
    { id: 'blueprints', label: '📁 My Projects', icon: FolderGit2 },
    { id: 'idealab', label: '💡 AI Builder', icon: Sparkles },
    { id: 'lms', label: '🎓 AI Academy', icon: GraduationCap },
    { id: 'landing', label: '🌐 Overview', icon: Compass },
  ];

  if (currentUser.role === 'admin') {
    tabs.push({ id: 'admin', label: '👑 Admin Console', icon: Crown });
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('launchpad')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-black text-xl">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
                StartupOS
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 uppercase tracking-wider">
                2026 AI OS
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block -mt-0.5">Build & Launch Platform</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 ml-0.5">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Launch Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLaunchModal}
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Launch Product
          </button>

          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 pl-2 border-l border-slate-200/80 hover:opacity-80 transition-opacity"
          >
            <span className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-sm shadow-xs">
              {currentUser.avatar}
            </span>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-bold text-slate-800 block leading-tight">{currentUser.name}</span>
              <span className={`text-[10px] font-medium flex items-center gap-1 ${currentUser.role === 'admin' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {currentUser.role === 'admin' ? <Crown className="w-3 h-3 text-amber-500" /> : <ShieldCheck className="w-3 h-3" />}
                {currentUser.badge}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
