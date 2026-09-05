import React from 'react';
import { Sparkles, Shield, UserCheck, BookOpen, Upload, Award, Layers } from 'lucide-react';
import { sound } from '../utils/sound';

export default function Header({ currentRole, setCurrentRole, activeTab, setActiveTab, userStats }) {
  const handleRoleChange = (role) => {
    sound.playClick();
    setCurrentRole(role);
  };

  const handleTabChange = (tabId) => {
    sound.playClick();
    setActiveTab(tabId);
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-[2px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-cyan-400 text-lg">
              ⚡
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-heading font-extrabold tracking-tight text-white">
                AB-<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">LMS</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                AI Builder LMS
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block font-mono">Learn → Build → Ship AI Products</p>
          </div>
        </div>

        {/* Center: Role Switcher Pill */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-heading">
          <button
            onClick={() => handleRoleChange('LEARNER')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              currentRole === 'LEARNER'
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>👤 Learner</span>
          </button>

          <button
            onClick={() => handleRoleChange('CREATOR')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              currentRole === 'CREATOR'
                ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>👨‍🏫 Creator / Examiner</span>
          </button>

          <button
            onClick={() => handleRoleChange('ADMIN')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              currentRole === 'ADMIN'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>👑 Admin</span>
          </button>
        </div>

        {/* Right: User Gamification Stats */}
        <div className="flex items-center gap-3 sm:gap-4 bg-slate-900/80 px-3.5 py-1.5 rounded-2xl border border-slate-800 text-xs font-heading">
          <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>{userStats.xp} XP</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            🔥 <span>{userStats.streak} Days</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            🚀 <span>{userStats.projectsShipped} Shipped</span>
          </div>
        </div>

      </div>
    </header>
  );
}
