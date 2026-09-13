import React from 'react';
import { 
  Sparkles, FolderGit2, ShieldCheck, Rocket, Users, 
  HelpCircle, ArrowUpRight, CheckCircle2, Plus, Terminal, GraduationCap
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, isLoggedIn, onOpenLaunchModal, onExitToWebsite, onOpenHelpCenter, onOpenCommandCenter }) {
  // Founder Workspace Stages (Clean, de-phased navigation)
  const founderStages = [
    { 
      id: 'idealab', 
      label: 'Ideate & Validate', 
      icon: Sparkles, 
      subtitle: 'Idea Lab, PRDs & Prompts' 
    },
    { 
      id: 'blueprints', 
      label: 'Build & Scaffold', 
      icon: FolderGit2, 
      subtitle: 'Projects & 4-File Parity' 
    },
    { 
      id: 'testing', 
      label: 'Test & Pre-Flight QA', 
      icon: ShieldCheck, 
      subtitle: 'Sandbox Runner & 100-pt Audit' 
    },
    { 
      id: 'launchpad', 
      label: 'Ship & Deploy', 
      icon: Rocket, 
      subtitle: 'Deploy Recipes & Launchpad' 
    },
    { 
      id: 'cobuilders', 
      label: 'Co-Builders & Demo Day', 
      icon: Users, 
      subtitle: 'Co-Founder Match & Pitch Deck' 
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 hidden md:flex sticky top-0 h-screen select-none z-30">
      {/* Top Branding Section */}
      <div className="p-5 space-y-4 overflow-y-auto">
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
            <span className="text-[11px] text-slate-400 font-medium block">AI Founder Operating System</span>
          </div>
        </div>

        {/* Top Global Quick Actions: Launch Product & AI Academy */}
        <div className="space-y-2">
          <button
            onClick={onOpenLaunchModal}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300 group-hover:rotate-90 transition-transform" />
            <span>Launch Product</span>
          </button>

          <button
            onClick={() => setActiveTab('academy')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              activeTab === 'academy' || activeTab === 'lms'
                ? 'bg-indigo-600/30 text-white border-indigo-500/60 shadow-xs ring-1 ring-indigo-500/40'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/70 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <span className="block leading-tight text-white">AI Builder Academy</span>
                <span className="text-[10px] text-slate-400 font-normal">Cross-Stage Playbooks</span>
              </div>
            </div>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Courses
            </span>
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="space-y-3 pt-1">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-2">
              Founder Workspace
            </span>
            {founderStages.map((stage) => {
              const Icon = stage.icon;
              // Map related sub-tabs to active primary stage
              const isStageActive = 
                activeTab === stage.id ||
                (stage.id === 'idealab' && (activeTab === 'specstudio' || activeTab === 'promptvault' || activeTab === 'toolmatrix' || activeTab === 'creator')) ||
                (stage.id === 'launchpad' && activeTab === 'deploy') ||
                (stage.id === 'testing' && activeTab === 'audit') ||
                (stage.id === 'cobuilders' && activeTab === 'makerprofile');

              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveTab(stage.id)}
                  className={`w-full flex items-start justify-between p-2.5 rounded-xl text-xs transition-all text-left cursor-pointer ${
                    isStageActive
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/40 shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isStageActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="leading-tight">{stage.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal block leading-tight mt-0.5">
                        {stage.subtitle}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Footer Section: "How We Can Help" & Exit Link */}
      <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-900/90">
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
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            100% Audited
          </span>
        </div>
      </div>
    </aside>
  );
}
