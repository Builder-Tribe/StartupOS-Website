import React, { useState } from 'react';
import { FileCode, Copy, Check, Sparkles, Folder, Layers, ShieldCheck } from './icons';

export default function PRDGeneratorStudio({ ideas, activeIdea, setActiveIdea }) {
  const [activeDoc, setActiveDoc] = useState('01-prd');
  const [copied, setCopied] = useState(false);

  const currentWorkspace = activeIdea || ideas[0];

  if (!currentWorkspace) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <FileCode className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Idea Workspaces Found</h2>
        <p className="text-slate-400 text-sm mb-6">
          Create an idea workspace in Idea Lab first to generate full AI product documentation suites.
        </p>
      </div>
    );
  }

  // Synthesize complete 5-part AI documentation files dynamically from workspace input
  const generatedDocs = {
    '01-prd': `# 01 — Master Product Requirements Document (PRD)

## Product Name: ${currentWorkspace.name}

### Executive Overview
${currentWorkspace.summary}

### Problem Statement
Target Customer: ${currentWorkspace.audience}
Pain Point: ${currentWorkspace.problem}
Current Workarounds: ${currentWorkspace.alternatives || 'Manual spreadsheets and ad-hoc communication.'}

### Solution & Key Differentiator
Differentiator: ${currentWorkspace.advantage || 'AI-native workflow matching and automated execution.'}
Validation Budget / Boundary: ${currentWorkspace.budget || 'Bootstrapped validation'}

### Core Product Features (MVP Scope)
1. **User Intake & Workspace Creation**: Onboard customer, capture parameters, enforce client validation.
2. **Core Matching & Processing Engine**: Execute core promise (${currentWorkspace.advantage || 'primary user outcome'}).
3. **Persistent Analytics Dashboard**: Display real-time status, activity history, and metrics.
4. **Export & Security Controls**: Role-based access control, encrypted storage, clean JSON/CSV export.`,

    '02-competitors': `# 02 — Market & Competitor Research

## Target Market Analysis
Primary Segment: ${currentWorkspace.audience}

## Existing Market Workarounds
${currentWorkspace.alternatives ? `- **Direct Alternative**: ${currentWorkspace.alternatives}` : '- **Manual Workarounds**: Spreadsheets, manual DMs, legacy agencies.'}

## Competitive Matrix & Strategic Gap
| Feature / Axis | Legacy Workaround | ${currentWorkspace.name} |
|---|---|---|
| Speed & Automation | Slow / Manual | AI-Driven Real-time |
| Cost Efficiency | High Overhead | Frictionless Self-Serve |
| Focus | Generic | Specialized for ${currentWorkspace.audience} |`,

    '03-architecture': `# 03 — Technical Architecture & Data Design

## System Architecture Stack
- **Frontend**: React / Vite / Tailwind CSS (Responsive UI Studio)
- **Backend API**: Node.js Express REST Endpoints
- **Database**: PostgreSQL / SQLite (Persistent JSON Storage)
- **Authentication**: JWT / OAuth Session Management

## Data Schema (JSON Entity representation)
\`\`\`json
{
  "id": "uuid-v4",
  "name": "${currentWorkspace.name}",
  "audience": "${currentWorkspace.audience}",
  "problem": "${currentWorkspace.problem}",
  "score": ${currentWorkspace.score},
  "createdAt": "${currentWorkspace.createdAt || new Date().toISOString()}"
}
\`\`\``,

    '04-build-plan': `# 04 — Staged AI Build & Execution Plan

## Phase 1: Foundational Setup
- Initialize repository, setup React + Vite + Tailwind CSS.
- Configure server endpoints for persistent storage.

## Phase 2: Core User Workflow
- Build intake form, scoring logic, and validation states.
- Connect local database persistence.

## Phase 3: Verification & Launch
- Run unit tests, verify mobile responsiveness, and export AI prompts.`
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-xs text-indigo-400 uppercase tracking-widest font-mono font-semibold">
            Phase 3: PRD & AI Documentation Studio
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1 flex items-center gap-3">
            <FileCode className="w-8 h-8 text-indigo-400" />
            AI Specification Package
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Generating production-ready PRD, Market Analysis, and Technical Architecture docs for: <strong className="text-indigo-300">{currentWorkspace.name}</strong>
          </p>
        </div>

        {/* Workspace Selector dropdown */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
          <Folder className="w-4 h-4 text-indigo-400" />
          <select
            value={currentWorkspace.id}
            onChange={(e) => {
              const selected = ideas.find((i) => i.id === e.target.value);
              if (selected) setActiveIdea(selected);
            }}
            className="bg-transparent text-white text-xs font-semibold focus:outline-none pr-2 cursor-pointer"
          >
            {ideas.map((item) => (
              <option key={item.id} value={item.id} className="bg-slate-900 text-white">
                {item.name} ({item.score}/100)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Studio View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Document Navigation Tabs */}
        <aside className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2 h-fit">
          <h3 className="text-xs font-mono uppercase text-slate-400 px-3 py-1">Generated Documentation Files</h3>
          {[
            { id: '01-prd', label: '01-master-prd.md', desc: 'Full Product Requirements' },
            { id: '02-competitors', label: '02-competitor-research.md', desc: 'Market & Competitive Matrix' },
            { id: '03-architecture', label: '03-technical-architecture.md', desc: 'Backend & Data Schema' },
            { id: '04-build-plan', label: '04-build-plan.md', desc: 'Staged AI Builder Steps' }
          ].map((doc) => {
            const isSelected = activeDoc === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => setActiveDoc(doc.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-indigo-950/80 border-indigo-500 shadow-md shadow-indigo-950 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <div className="font-mono text-xs font-bold text-indigo-300">{doc.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{doc.desc}</div>
              </button>
            );
          })}
        </aside>

        {/* Document Markdown Viewer */}
        <main className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
            <span className="text-xs font-mono text-indigo-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> AI-Agent Ready Markdown
            </span>
            <button
              onClick={() => handleCopy(generatedDocs[activeDoc])}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied Content' : 'Copy File Content'}
            </button>
          </div>

          <pre className="bg-slate-950 p-6 rounded-xl text-xs font-mono text-slate-200 border border-slate-800 whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {generatedDocs[activeDoc]}
          </pre>
        </main>
      </div>
    </div>
  );
}
