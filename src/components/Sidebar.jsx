import React from 'react';
import { 
  Trophy, FolderGit2, Sparkles, GraduationCap, ShieldCheck, Plus, User, Crown, 
  Compass, LayoutGrid, ChevronRight, CheckCircle2, Zap
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, onOpenLaunchModal }) {
  const mainNav = [
    { id: 'launchpad', label: 'Launchpad Feed', icon: Trophy, badge: 'Product Hunt' },
    { id: 'blueprints', label: 'My Projects', icon: FolderGit2 },
    { id: 'idealab', label: 'AI Builder Studio', icon: Sparkles, badge: 'AGY' },
    { id: 'lms', label: 'AI Academy (LMS)', icon: GraduationCap },
    { id: 'landing', label: 'Platform Overview', icon: Compass },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 hidden md:flex sticky top-0 h-screen select-none z-30">
      {/* Top Branding Section */}
      <div className="p-5 space-y-6">
        <div 
          onClick={() => setActiveTab('launchpad')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 font-black text-xl group-hover:scale-105 transition-transform">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight">StartupOS</span>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">
                2026
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">AI Launch & Build Platform</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpenLaunchModal}
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group active:scale-98"
        >
          <Plus className="w-4 h-4 text-amber-300 group-hover:rotate-90 transition-transform" />
          <span>Launch Product</span>
        </button>

        {/* Navigation Categories */}
        <div className="space-y-6 pt-2">
          {/* Main Workspace Section */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-2">
              Ecosystem Navigation
            </span>
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/40 shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Admin Governance Section */}
          {currentUser.role === 'admin' && (
            <div className="space-y-1 border-t border-slate-800/80 pt-4">
              <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase px-3 block mb-2 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" /> Admin Ops Realm
              </span>
              <button
                onClick={() => setActiveTab('admin')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Admin Console</span>
                </div>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                  Ops
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Health & User Card */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        {/* 4-File Parity Health Card */}
        <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 4-File Parity
            </span>
            <span className="text-emerald-400 font-extrabold text-[10px] bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
              100% Health
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-tight">
            All 4 projects contain AGENTS, ROADMAP, CLAUDE & CONTRIBUTING.
          </p>
        </div>

        {/* User Mini Profile */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-sm shrink-0">
              {currentUser.avatar}
            </span>
            <div className="truncate">
              <span className="text-xs font-bold text-slate-200 block truncate">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 block truncate">{currentUser.badge}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
