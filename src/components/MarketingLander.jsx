import React from 'react';
import { 
  Sparkles, Trophy, Rocket, ShieldCheck, CheckCircle2, ArrowRight, 
  Terminal, Code2, Users, Flame, BookOpen, Layers, Cpu, Compass,
  UserCheck, LogIn, ChevronRight, HelpCircle
} from 'lucide-react';

export default function MarketingLander({ onEnterPortal, onOpenAuthModal }) {
  const pillars = [
    {
      step: "01",
      title: "How to Build an AI Product",
      desc: "Step-by-step 0-to-1 build pipelines and AI Academy courses guiding students and founders from initial idea to working prototype.",
      icon: BookOpen,
      color: "from-blue-500 to-indigo-600"
    },
    {
      step: "02",
      title: "What Apps & Tools to Use",
      desc: "Tool selection matrix pairing AntiGravity, Emergent, Replit, Claude Code, Cursor & Windsurf for your specific stack.",
      icon: Cpu,
      color: "from-indigo-500 to-purple-600"
    },
    {
      step: "03",
      title: "What Prompts & Specs to Give",
      desc: "Verified prompt templates, PRD generator prompts, and AI agent constitutions to generate clean code without hallucinations.",
      icon: Code2,
      color: "from-purple-500 to-pink-600"
    },
    {
      step: "04",
      title: "What Architecture to Use",
      desc: "Interactive architecture blueprints for React, Node/Express, SQLite, PostgreSQL, and vector similarity search.",
      icon: Layers,
      color: "from-amber-500 to-orange-600"
    },
    {
      step: "05",
      title: "What Governance to Have",
      desc: "Pre-configured AGENTS.md rules, safe non-destructive database migrations, and automated 4-file parity checks.",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-600"
    },
    {
      step: "06",
      title: "Deployment & Launchpad Feed",
      desc: "One-click deployment recipes + StartupOS Launchpad feed to publish your product, gain upvotes, and build an audience.",
      icon: Trophy,
      color: "from-rose-500 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-600 selection:text-white relative overflow-x-hidden">
      {/* Ambient Floating Background Mesh Orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="animate-orb-1 absolute -top-40 -left-20 w-[650px] h-[650px] bg-gradient-to-tr from-indigo-600/30 to-violet-600/30 rounded-full blur-3xl opacity-60"></div>
        <div className="animate-orb-2 absolute top-1/3 -right-20 w-[700px] h-[700px] bg-gradient-to-br from-blue-600/30 to-sky-500/20 rounded-full blur-3xl opacity-50"></div>
        <div className="animate-orb-3 absolute -bottom-40 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10">
        {/* STANDALONE MARKETING WEBSITE HEADER */}
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Brand Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={onEnterPortal}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">
                S
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white block">StartupOS</span>
                <span className="text-[11px] text-indigo-300 font-medium block">360° AI Product Ecosystem</span>
              </div>
            </div>

            {/* Middle Nav Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
              <a href="#pillars" className="hover:text-indigo-400 transition-colors">6 Product Pillars</a>
              <a href="#audience" className="hover:text-indigo-400 transition-colors">For Builders & Students</a>
              <a href="#governance" className="hover:text-indigo-400 transition-colors">4-File Parity</a>
            </nav>

            {/* CTAs: Sign In & Launch Portal */}
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenAuthModal}
                className="text-xs font-bold text-slate-200 hover:text-white px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sign In / Register</span>
              </button>

              <button
                onClick={onEnterPortal}
                className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 transform active:scale-95"
              >
                <Rocket className="w-4 h-4 text-amber-300" />
                <span>Enter StartupOS Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="pt-20 pb-24 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-bold shadow-md backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>The Universal Operating System for AI Product Creation</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight max-w-5xl mx-auto leading-none bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Building Software As Easy As Writing A Document.
          </h1>

          <p className="text-slate-300 text-lg sm:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
            Whether you are a student building resume portfolio projects or a founder launching a 0-to-1 AI startup — StartupOS gives you the exact tools, prompts, architecture, and community upvotes to ship.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-base px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <UserCheck className="w-5 h-5 text-amber-300" />
              <span>Get Started Free — Create Account</span>
            </button>
            <button
              onClick={onEnterPortal}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-base px-8 py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Rocket className="w-5 h-5 text-indigo-400" />
              <span>Explore Portal Demo</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Social Proof */}
          <div className="pt-8 flex items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> 1,200+ Builders Registered
            </span>
            <span>•</span>
            <span>4-File Parity Governance Active</span>
            <span>•</span>
            <span>AntiGravity + Emergent Ready</span>
          </div>
        </section>

        {/* THE 6 PILLARS OF PRODUCT CREATION */}
        <section id="pillars" className="py-20 bg-slate-900/60 border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30">
                360° AI Product Lifecycle
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How StartupOS Helps You Build</h2>
              <p className="text-slate-400 text-base font-medium">
                Everything required from zero to launch — removing guesswork from AI product development.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pillars.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.step} className="bg-slate-900/90 p-8 rounded-3xl border border-slate-800 shadow-xl hover:border-indigo-500/50 transition-all space-y-4 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${p.color} text-white flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-3xl font-black text-slate-700 group-hover:text-indigo-400 transition-colors font-mono">
                        {p.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{p.title}</h3>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* AUDIENCE & USE CASES SECTION */}
        <section id="audience" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl p-8 md:p-12 text-white shadow-2xl border border-indigo-900/60 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 uppercase tracking-widest">
                For Students & Startup Founders
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Built For Portfolio Projects & Real Startups.</h2>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                School and college students can build verified AI projects for their resume and portfolio. Founders can architect, test, and launch real-world startups to a community of early adopters.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={onEnterPortal}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  Enter Portal & Start Building <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div id="governance" className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 font-mono text-xs shadow-inner">
              <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
                StartupOS Governance Stack
              </div>
              <div className="text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> <span>AGENTS.md Constitution Active</span>
              </div>
              <div className="text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> <span>4-File Parity Score Audit (100% Health)</span>
              </div>
              <div className="text-indigo-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 shrink-0" /> <span>AntiGravity + Emergent + Replit Engine</span>
              </div>
              <div className="text-amber-300 flex items-center gap-2">
                <Trophy className="w-4 h-4 shrink-0" /> <span>StartupOS Ecosystem Launchpad Feed</span>
              </div>
            </div>
          </div>
        </section>

        {/* STANDALONE WEBSITE FOOTER */}
        <footer className="border-t border-slate-800 py-10 text-center text-xs text-slate-500 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 space-y-3">
            <div className="flex items-center justify-center gap-3">
              <span className="font-extrabold text-sm text-slate-300">StartupOS 2026</span>
              <span>•</span>
              <span>Learn. Architect. Ship.</span>
            </div>
            <p className="text-slate-600">
              The 360° AI Product Creation Platform & Ecosystem. Built for founders, developers, and students.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
