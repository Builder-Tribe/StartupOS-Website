import React, { useState } from 'react';
import { AI_TOOLS, ARCHITECTURE_PRESETS, recommendToolchain } from '../data/toolMatrixData';
import { 
  Sparkles, Check, Copy, ExternalLink, Code2, Layers, Cpu, Server, 
  Terminal, ShieldCheck, Database, Sliders, CheckCircle2, ArrowRight
} from 'lucide-react';

export default function ToolMatrixStudio({ ideas = [], activeIdea }) {
  // Tabs: 'MATRIX' | 'ARCH_STUDIO' | 'RECOMMENDER'
  const [activeTab, setActiveTab] = useState('RECOMMENDER');
  
  // Quiz filter states
  const [projectType, setProjectType] = useState(activeIdea ? 'Solo SaaS' : 'Solo SaaS');
  const [skillLevel, setSkillLevel] = useState('Product Manager');
  const [environment, setEnvironment] = useState('Local IDE + Hybrid Cloud');
  const [budget, setBudget] = useState('$20/mo Builder');

  // Selected tool for deep dive
  const [selectedToolId, setSelectedToolId] = useState('antigravity');
  // Selected architecture preset
  const [selectedArchId, setSelectedArchId] = useState('solo-saas');
  // Architecture view mode: 'VISUAL' | 'MERMAID' | 'ASCII'
  const [archViewMode, setArchViewMode] = useState('VISUAL');

  const [copiedKey, setCopiedKey] = useState(null);

  const selectedTool = AI_TOOLS.find(t => t.id === selectedToolId) || AI_TOOLS[0];
  const selectedArch = ARCHITECTURE_PRESETS.find(a => a.id === selectedArchId) || ARCHITECTURE_PRESETS[0];

  const recommendation = recommendToolchain({
    projectType,
    skillLevel,
    environment,
    budget
  });

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 border border-slate-800 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            Phase 2 • 360° Builder Toolkit
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            AI Tool Selection Matrix & Architecture Visualizer
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate architectural uncertainty. Compare leading AI builder environments (AntiGravity, Claude Code, Cursor, Replit), 
            discover your ideal pairing, and preview production-ready multi-surface system architectures with exportable specs.
          </p>

          {/* Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <button
              onClick={() => setActiveTab('RECOMMENDER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'RECOMMENDER'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              1. Intelligent Toolchain Recommender
            </button>
            <button
              onClick={() => setActiveTab('MATRIX')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'MATRIX'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              2. Full Tool Comparison Matrix
            </button>
            <button
              onClick={() => setActiveTab('ARCH_STUDIO')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'ARCH_STUDIO'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              3. Multi-Surface Architecture Visualizer
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: INTELLIGENT RECOMMENDER */}
      {activeTab === 'RECOMMENDER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Quiz Panel */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                Project Parameters
              </h2>
              <span className="text-xs text-indigo-700 bg-indigo-50 font-bold px-2.5 py-1 rounded-full border border-indigo-200/60">
                Interactive
              </span>
            </div>

            {/* Project Archetype */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                What are you building?
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="Solo SaaS">Solo AI SaaS / Micro-Startup</option>
                <option value="Voice AI">Realtime Voice Agent / Multimodal Assistant</option>
                <option value="Full-Stack Web">Multi-Surface Web & Chrome Extension</option>
                <option value="Student Portfolio">School / College Student Portfolio Project</option>
                <option value="High-Scale Fintech">B2B Fintech / High-Scale Escrow & Workflow</option>
              </select>
            </div>

            {/* Coding Experience */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Your Technical Profile
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Product Manager', 'Full-Stack Dev'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSkillLevel(lvl)}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all border ${
                      skillLevel === lvl
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Environment Preference */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Development Environment
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="Local IDE + Hybrid Cloud">Local Apple Silicon / PC (AntiGravity / Cursor / Claude)</option>
                <option value="Cloud Browser">Cloud Browser Only (Replit / iPad / Chromebook)</option>
              </select>
            </div>

            {/* Budget Tier */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Monthly AI Budget
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['$0 Free Tier', '$20/mo Builder'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBudget(b)}
                    className={`py-2 px-3 text-center rounded-xl text-xs font-bold transition-all border ${
                      budget === b
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                StartupOS Guarantee
              </span>
              All recommended toolchains adhere strictly to 4-File Parity and reproducible environment standards.
            </div>
          </div>

          {/* Recommendation Output Card */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-indigo-100 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-50 to-transparent w-48 h-full pointer-events-none"></div>

              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Recommended Match • 98% Fit
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">
                    Optimal AI Pair Programming Stack
                  </h3>
                </div>
              </div>

              {/* Rationale Quote */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100/90 text-slate-700 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                "{recommendation.rationale}"
              </div>

              {/* Tool Pairing Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Primary Agent */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
                      Primary Architect
                    </span>
                    <span className="text-xs bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-mono">
                      Lead
                    </span>
                  </div>
                  <div className="text-xl font-black text-white">{recommendation.primaryTool.name}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {recommendation.primaryTool.tagline}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-indigo-200 font-semibold border-t border-slate-800">
                    <span>Config: {recommendation.primaryTool.configFileName}</span>
                    <button
                      onClick={() => handleCopy('primary-config', recommendation.primaryTool.configSnippet)}
                      className="hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'primary-config' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Config</span>
                    </button>
                  </div>
                </div>

                {/* Secondary Assistant */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                      Secondary Assistant
                    </span>
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                      Fast Edits
                    </span>
                  </div>
                  <div className="text-xl font-black text-slate-900">{recommendation.secondaryTool.name}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {recommendation.secondaryTool.tagline}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-600 font-semibold border-t border-slate-200">
                    <span>Config: {recommendation.secondaryTool.configFileName}</span>
                    <button
                      onClick={() => handleCopy('secondary-config', recommendation.secondaryTool.configSnippet)}
                      className="hover:text-slate-900 flex items-center gap-1"
                    >
                      {copiedKey === 'secondary-config' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Config</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recommended Architecture Preset Preview */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    Recommended Architecture Blueprint
                  </span>
                  <button
                    onClick={() => {
                      setSelectedArchId(recommendation.architecture.id);
                      setActiveTab('ARCH_STUDIO');
                    }}
                    className="text-xs text-white hover:text-indigo-300 font-bold flex items-center gap-1 underline"
                  >
                    Open in Visualizer <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-lg font-bold">{recommendation.architecture.name}</div>
                <p className="text-xs text-slate-300">{recommendation.architecture.tagline}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono text-slate-400">
                  {recommendation.architecture.layers.map((l, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                      <span className="block text-indigo-300 font-bold text-[9px] uppercase">{l.tier}</span>
                      <span className="text-white truncate block">{l.tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULL TOOL COMPARISON MATRIX */}
      {activeTab === 'MATRIX' && (
        <div className="space-y-6">
          {/* Tool Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {AI_TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedToolId(t.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                  selectedToolId === t.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Detailed Tool Deep Dive Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full uppercase">
                    {selectedTool.category}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Pricing: {selectedTool.pricing}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">{selectedTool.name}</h2>
                <p className="text-slate-600 text-sm mt-1">{selectedTool.tagline}</p>
              </div>

              {/* Performance Radar Metrics */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Capability Benchmark (2026 Evaluation)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(selectedTool.rating).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                      <div className="text-lg font-black text-indigo-600">{val}</div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-0.5">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                    Core Strengths
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedTool.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 space-y-2">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                    Considerations
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedTool.weaknesses.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Config & Rule Generator */}
            <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono text-indigo-400 font-bold flex items-center gap-1.5">
                    <Code2 className="w-4 h-4" />
                    {selectedTool.configFileName}
                  </span>
                  <button
                    onClick={() => handleCopy('matrix-config', selectedTool.configSnippet)}
                    className="text-xs text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700"
                  >
                    {copiedKey === 'matrix-config' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Config</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-800 max-h-72">
                  {selectedTool.configSnippet}
                </pre>
              </div>

              <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3">
                Add this file to your repository root to enforce deterministic outputs with {selectedTool.name}.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ARCHITECTURE VISUALIZER */}
      {activeTab === 'ARCH_STUDIO' && (
        <div className="space-y-6">
          {/* Preset Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {ARCHITECTURE_PRESETS.map((arch) => (
                <button
                  key={arch.id}
                  onClick={() => setSelectedArchId(arch.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                    selectedArchId === arch.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {arch.name}
                </button>
              ))}
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setArchViewMode('VISUAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  archViewMode === 'VISUAL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Visual Nodes
              </button>
              <button
                onClick={() => setArchViewMode('MERMAID')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  archViewMode === 'MERMAID' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mermaid Diagram
              </button>
              <button
                onClick={() => setArchViewMode('ASCII')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  archViewMode === 'ASCII' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ASCII Spec
              </button>
            </div>
          </div>

          {/* Architecture Overview Banner */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">{selectedArch.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{selectedArch.tagline}</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Est. Cost</span>
                <span className="font-bold text-emerald-600">{selectedArch.monthlyCostEst}</span>
              </div>
              <div className="text-right border-l border-slate-200 pl-4">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Best For</span>
                <span className="font-bold text-slate-700">{selectedArch.bestFor}</span>
              </div>
            </div>
          </div>

          {/* VISUAL NODE CANVAS */}
          {archViewMode === 'VISUAL' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedArch.layers.map((layer, index) => (
                <div 
                  key={index}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3 relative group hover:border-indigo-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
                      {index + 1}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {layer.ports}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block">
                      {layer.tier}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {layer.tech}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {layer.role}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* MERMAID DIAGRAM EXPORT */}
          {archViewMode === 'MERMAID' && (
            <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-indigo-400 font-mono">
                  mermaid.js (Ready to embed into README.md & PRD)
                </span>
                <button
                  onClick={() => handleCopy('mermaid', `\`\`\`mermaid\n${selectedArch.mermaidDiagram}\n\`\`\``)}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
                >
                  {copiedKey === 'mermaid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Mermaid Code</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
                {selectedArch.mermaidDiagram}
              </pre>
            </div>
          )}

          {/* ASCII SPEC EXPORT */}
          {archViewMode === 'ASCII' && (
            <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-indigo-400 font-mono">
                  ASCII Architecture Diagram (Plain Text Compatible)
                </span>
                <button
                  onClick={() => handleCopy('ascii', selectedArch.asciiDiagram)}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
                >
                  {copiedKey === 'ascii' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy ASCII</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-emerald-300 bg-slate-950 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-800 whitespace-pre">
                {selectedArch.asciiDiagram}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
