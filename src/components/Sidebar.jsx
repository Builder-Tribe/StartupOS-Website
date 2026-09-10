import React from 'react';
import { 
  Trophy, FolderGit2, Sparkles, GraduationCap, ShieldCheck, Plus, User, Crown, 
  Globe, HelpCircle, ArrowUpRight, CheckCircle2, ArrowLeftRight, LogOut, Cpu, Terminal, UserCheck, FileCode
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, isLoggedIn, onOpenLaunchModal, onExitToWebsite, onOpenHelpCenter, onOpenCommandCenter }) {
  const mainNav = [
    { id: 'launchpad', label: 'Launchpad Feed', icon: Trophy, badge: 'Live' },
    { id: 'blueprints', label: 'My Projects', icon: FolderGit2 },
    { id: 'idealab', label: 'AI Builder Studio', icon: Sparkles, badge: 'AGY AI' },
    { id: 'specstudio', label: 'Specs & Constitution', icon: FileCode, badge: '4-File' },
    { id: 'promptvault', label: 'Prompt Vault', icon: Terminal, badge: 'Tested' },
    { id: 'toolmatrix', label: 'Tool Matrix & Arch', icon: Cpu, badge: '2026' },
    { id: 'academy', label: 'AI Academy', icon: GraduationCap },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 hidden md:flex sticky top-0 h-screen select-none z-30">
      {/* Top Branding Section */}
      <div className="p-5 space-y-5 overflow-y-auto">
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
                Portal
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">AI Product OS & Incubator</span>
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
        <div className="space-y-5 pt-1">
          {/* Main Workspace Section */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-2">
              StartupOS Modules
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
        </div>
      </div>

      {/* Bottom Footer Section: "How We Can Help", Health & Exit Link */}
      <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-900/90">
        {/* Dedicated "How We Can Help?" Trigger Card */}
        <div 
          onClick={onOpenHelpCenter}
          className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/80 to-slate-800 border border-indigo-500/30 hover:border-indigo-400 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-white font-bold flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> How We Can Help?
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
            Get 1-on-1 AI assistance, tech stack guidance & governance answers.
          </p>
        </div>

        {/* 4-File Parity Health Card */}
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5 text-[10px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> 4-File Parity
          </span>
          <span className="text-emerald-400 font-extrabold text-[9px] bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
            100% Health
          </span>
        </div>

        {/* Exit to Marketing Website (ONLY SHOWN TO GUEST DEMO VISITORS) */}
        {!isLoggedIn && (
          <button
            onClick={onExitToWebsite}
            className="w-full text-[11px] font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Exit Demo to Marketing Website</span>
          </button>
        )}

        {/* User Mini Profile (Clickable -> Opens Maker Profile) */}
        <div 
          onClick={() => setActiveTab('makerprofile')}
          className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer border ${
            activeTab === 'makerprofile' 
              ? 'bg-indigo-950/90 border-indigo-500/50 shadow-xs' 
              : 'hover:bg-slate-800/80 border-transparent'
          }`}
          title="View & Export Your Maker Profile"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 border border-indigo-400/40 flex items-center justify-center text-sm shrink-0 shadow-xs">
              {currentUser.avatar}
            </span>
            <div className="truncate text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200 block truncate">{currentUser.name}</span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  L5
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block truncate">{currentUser.badge} • Profile</span>
            </div>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
        </div>
      </div>
    </aside>
  );
}
