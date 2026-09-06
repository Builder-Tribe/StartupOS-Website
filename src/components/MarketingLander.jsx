import React from 'react';
import { 
  Sparkles, Trophy, Rocket, ShieldCheck, CheckCircle2, ArrowRight, 
  Terminal, Code2, Users, Flame, BookOpen, Layers, Cpu, Compass
} from 'lucide-react';

export default function MarketingLander({ onGetStarted, onOpenLms }) {
  const pillars = [
    {
      step: "01",
      title: "How to Build",
      desc: "Step-by-step 0-to-1 build pipelines and AI Builder Academy courses for students & founders.",
      icon: BookOpen,
      color: "from-blue-500 to-indigo-600"
    },
    {
      step: "02",
      title: "What Apps & Tools to Use",
      desc: "Tool selection matrix pairing AntiGravity, Emergent, Replit, Claude, Cursor & Windsurf.",
      icon: Cpu,
      color: "from-indigo-500 to-purple-600"
    },
    {
      step: "03",
      title: "What Prompts to Give",
      desc: "Copy-pasteable system prompts, PRD generator prompts, and AI agent constitutions.",
      icon: Code2,
      color: "from-purple-500 to-pink-600"
    },
    {
      step: "04",
      title: "What Architecture to Use",
      desc: "Interactive architecture diagrams for React, Express, SQLite, PostgreSQL & pgvector.",
      icon: Layers,
      color: "from-amber-500 to-orange-600"
    },
    {
      step: "05",
      title: "What Governance to Have",
      desc: "Pre-configured AGENTS.md rules, non-destructive migrations & 4-file parity checks.",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-600"
    },
    {
      step: "06",
      title: "Deployment & Distribution",
      desc: "One-click deployment recipes + Product Hunt-inspired Launchpad feed for upvotes & traction.",
      icon: Trophy,
      color: "from-rose-500 to-pink-600"
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>The Universal Operating System for AI Product Creation</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-none">
            Building Software As Easy As Writing A Document.
          </h1>

          <p className="text-slate-600 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Whether you are a student building resume portfolio projects or a professional launching an AI startup — StartupOS gives you the tools, prompts, architecture, and community upvotes to ship.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-base px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Rocket className="w-5 h-5 text-amber-300" />
              Explore Launchpad & Build
            </button>
            <button
              onClick={onOpenLms}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-base px-8 py-4 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Start AI Academy Course
            </button>
          </div>
        </div>
      </section>

      {/* The 6 Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            360° Product Lifecycle
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">Everything Needed From Zero To Launch</h2>
          <p className="text-slate-600 text-sm font-medium">StartupOS removes the guesswork from AI software development.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.step} className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${p.color} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-slate-200 group-hover:text-indigo-200 transition-colors font-mono">
                    {p.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{p.title}</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Target Audience Section (Students & Professionals) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 uppercase tracking-widest">
              For Students & Professionals
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Built For Portfolio Projects & Real Startups.</h2>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              School and college students can build verified AI projects for their resume and portfolio. Founders can architect, test, and launch real-world startups to a community of early adopters.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button onClick={onGetStarted} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-2">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl space-y-3 font-mono text-xs">
            <div className="text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> <span>AGENTS.md Constitution Loaded</span>
            </div>
            <div className="text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> <span>4-File Parity Auditor Active</span>
            </div>
            <div className="text-indigo-300 flex items-center gap-2">
              <Terminal className="w-4 h-4" /> <span>AntiGravity + Emergent + Replit Engine Ready</span>
            </div>
            <div className="text-amber-300 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> <span>Product Hunt Launchpad Active</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
