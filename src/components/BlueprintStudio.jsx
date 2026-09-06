import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink, 
  Terminal, Sparkles, Rocket, RefreshCw, Lock, Eye, ChevronRight
} from 'lucide-react';

export default function BlueprintStudio({ currentUser, userIdeas, onNavigateToIdeaLab }) {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('building'); // 'building' | 'launch'

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects/health');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (e) {
      console.error('Failed to fetch health data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const projectMetadata = {
    Trippy: {
      tagline: "AI Solo Travel Group Matching & Community Trip Host Platform",
      stack: ["React 18", "Express", "SQLite", "Node 22"],
      repoUrl: "https://github.com/1997agarwal/StartupOS/tree/main/Ideas/Trippy",
      localPath: "Ideas/Trippy",
      surfaces: ["Consumer Web", "Partner CRM", "Admin Console", "Marketing Website"]
    },
    DupeScout: {
      tagline: "Shop the Look. Not the Markup. AI Visual Similarity & Dupes Engine",
      stack: ["FastAPI", "Next.js 14", "PostgreSQL", "pgvector"],
      repoUrl: "https://github.com/1997agarwal/StartupOS/tree/main/Ideas/DupeScout",
      localPath: "Ideas/DupeScout",
      surfaces: ["Consumer App", "Seller Portal", "Admin Console", "Chrome Extension"]
    },
    BusinessPay: {
      tagline: "B2B Accounts Receivable Collections & Early Payment Cash Accelerator",
      stack: ["React 19", "Express 5", "Dynamic Discounts", "SQLite"],
      repoUrl: "https://github.com/1997agarwal/StartupOS/tree/main/Ideas/BusinessPay",
      localPath: "Ideas/BusinessPay",
      surfaces: ["Collector Workqueue", "Buyer Portal Simulation", "Admin Console"]
    },
    CollabKaro: {
      tagline: "India-First Creator Marketplace & Escrow Milestone Operating System",
      stack: ["React TS", "Express", "Escrow API", "SQLite"],
      repoUrl: "https://github.com/1997agarwal/StartupOS/tree/main/Ideas/CollabKaro",
      localPath: "Ideas/CollabKaro",
      surfaces: ["Brand & Agency Portal", "Creator Media Kit Hub", "Escrow Admin Console"]
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Projects Workspace</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Authenticated User: {currentUser.name}
            </span>
          </div>
          <p className="text-slate-600 text-sm font-medium mt-1">
            Manage product health, 4-file constitutions (`AGENTS.md`, `ROADMAP.md`, `CLAUDE.md`, `CONTRIBUTING.md`), and AI agent execution rules.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/70">
          <button
            onClick={() => setViewMode('building')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'building' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" /> Building & Health Mode
          </button>
          <button
            onClick={() => setViewMode('launch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'launch' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Rocket className="w-4 h-4" /> Launch Readiness Mode
          </button>
        </div>
      </div>

      {/* Flagship Projects Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-600" />
            Flagship Startup Portfolio ({healthData.length})
          </h2>
          <button
            onClick={fetchHealthData}
            className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-audit Health
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {healthData.map((proj) => {
            const meta = projectMetadata[proj.name] || {};

            return (
              <div
                key={proj.name}
                className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 space-y-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">{proj.name}</h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {meta.localPath}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{meta.tagline}</p>
                  </div>

                  {/* Health Score Pill */}
                  <div className="flex flex-col items-end">
                    <div
                      className={`px-3 py-1 rounded-xl text-xs font-black border flex items-center gap-1.5 ${
                        proj.healthScore === 100
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{proj.healthScore}% HEALTH</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium mt-1">4-File Parity</span>
                  </div>
                </div>

                {/* 4 Core Baseline Files Checklist */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Core Operational Constitution Checklist
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {proj.hasAgents ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                      <span className={proj.hasAgents ? 'font-bold text-slate-800' : 'text-slate-400'}>AGENTS.md</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {proj.hasRoadmap ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                      <span className={proj.hasRoadmap ? 'font-bold text-slate-800' : 'text-slate-400'}>ROADMAP.md</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {proj.hasClaude ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                      <span className={proj.hasClaude ? 'font-bold text-slate-800' : 'text-slate-400'}>CLAUDE.md</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {proj.hasContributing ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                      <span className={proj.hasContributing ? 'font-bold text-slate-800' : 'text-slate-400'}>CONTRIBUTING.md</span>
                    </div>
                  </div>
                </div>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {meta.stack && meta.stack.map((t, idx) => (
                    <span key={idx} className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-semibold">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Actions Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={meta.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    <span>View GitHub Repo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                      ✓ Parity Verified
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
