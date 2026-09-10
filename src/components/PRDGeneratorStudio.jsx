import React, { useState } from 'react';
import { 
  FileCode, Copy, Check, Sparkles, Folder, Layers, ShieldCheck, 
  Download, Archive, ArrowRight, ExternalLink, CheckCircle2, Terminal,
  Sliders, Settings, Wrench, RefreshCw, ChevronDown, ChevronUp, Cpu, Lock
} from 'lucide-react';
import { downloadMarkdownFile, downloadZipBundle } from '../utils/zipExport';

export default function PRDGeneratorStudio({ ideas = [], activeIdea, setActiveIdea, onNavigateToIdeaLab, onNavigateToPromptVault }) {
  const [activeDoc, setActiveDoc] = useState('AGENTS');
  const [copied, setCopied] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'governance' | 'specs'

  // Interactive Constitution & Agent Customizer State
  const [agentTarget, setAgentTarget] = useState('universal'); // 'universal' | 'antigravity' | 'claude' | 'cursor'
  const [stackPreset, setStackPreset] = useState('vite-react'); // 'vite-react' | 'nextjs' | 'node-express' | 'fastapi'
  const [sandboxPolicy, setSandboxPolicy] = useState('safe-sandbox'); // 'safe-sandbox' | 'strict-approval'
  const [qaGate, setQaGate] = useState('strict'); // 'strict' | 'lean'
  const [architectureModel, setArchitectureModel] = useState('monorepo-satellites'); // 'monorepo-satellites' | 'single-repo'
  const [showConfigDrawer, setShowConfigDrawer] = useState(true);

  const currentWorkspace = activeIdea || ideas[0] || {
    id: 'demo-app',
    name: 'NextGen AI Startup',
    audience: 'Modern AI Builders & Engineers',
    problem: 'Friction between rapid AI coding and engineering governance',
    advantage: '4-File Parity Constitution & multi-surface architecture',
    budget: '$500 MVP validation',
    alternatives: 'Manual doc writing and fragmented prompts',
    score: 85,
    summary: 'An AI-native platform providing structured 0-to-1 blueprints and governance suites.'
  };

  const safeSlug = (currentWorkspace.name || 'project')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const resetConfig = () => {
    setAgentTarget('universal');
    setStackPreset('vite-react');
    setSandboxPolicy('safe-sandbox');
    setQaGate('strict');
    setArchitectureModel('monorepo-satellites');
  };

  // Stack Metadata Dictionary
  const stackConfigs = {
    'vite-react': {
      name: 'React 18 + Vite + Tailwind CSS v4',
      devCmd: 'npm run dev',
      buildCmd: 'npm run build',
      testCmd: 'npm test (Vitest)',
      lintCmd: 'npm run lint',
      port: '5173',
      runtime: 'Node.js 20+ / Browser',
      folderLayout: `├── src/
│   ├── components/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── vite.config.js`
    },
    'nextjs': {
      name: 'Next.js 15 (App Router) + TypeScript + Tailwind',
      devCmd: 'npm run dev',
      buildCmd: 'npm run build',
      testCmd: 'npm test (Jest)',
      lintCmd: 'npm run lint && npm run typecheck (tsc --noEmit)',
      port: '3000',
      runtime: 'Node.js 20+ / Edge / Serverless',
      folderLayout: `├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
├── components/
├── lib/
├── package.json
└── next.config.ts`
    },
    'node-express': {
      name: 'Node.js (Express) + SQLite / PostgreSQL',
      devCmd: 'npm run dev (nodemon server.mjs)',
      buildCmd: 'npm run build',
      testCmd: 'npm test (Supertest / Vitest)',
      lintCmd: 'npm run lint',
      port: '3001',
      runtime: 'Node.js 20+',
      folderLayout: `├── src/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── server.mjs
├── db/
│   └── migrations/
└── package.json`
    },
    'fastapi': {
      name: 'FastAPI + Python 3.12 + Pydantic + Uvicorn',
      devCmd: 'uvicorn app.main:app --reload',
      buildCmd: 'uv pip install -e .',
      testCmd: 'pytest',
      lintCmd: 'ruff check . && mypy .',
      port: '8000',
      runtime: 'Python 3.12+ (uv)',
      folderLayout: `├── app/
│   ├── api/
│   ├── models/
│   ├── schemas/
│   └── main.py
├── tests/
└── pyproject.toml`
    }
  };

  const currentStack = stackConfigs[stackPreset] || stackConfigs['vite-react'];

  // Complete Reactive 8-Document Specification & Constitution Suite
  const generatedDocs = {
    // === GOVERNANCE / 4-FILE PARITY SUITE ===
    'AGENTS': {
      filename: 'AGENTS.md',
      category: 'governance',
      title: 'AGENTS.md — Repository Constitution',
      desc: 'Master AI Agent Rules, Tool Matrix, and Satellite Architecture',
      content: `# AGENTS.md — Constitution of ${currentWorkspace.name}

> **Read this first.** This file is the constitution of the \`${currentWorkspace.name}\` repository. 
> It applies to every developer and every AI coding assistant (${
  agentTarget === 'antigravity'
    ? 'Google AntiGravity 2.0 Priority'
    : agentTarget === 'claude'
    ? 'Claude Code CLI Priority'
    : agentTarget === 'cursor'
    ? 'Cursor & Windsurf IDE Priority'
    : 'AntiGravity, Claude Code, Codex, Cursor, Windsurf, Copilot'
}).

---

## 1. Product Vision & Architecture Scope

**Product Name:** ${currentWorkspace.name}  
**Primary Audience:** ${currentWorkspace.audience}  
**Core Problem Solved:** ${currentWorkspace.problem}  
**Unfair Advantage:** ${currentWorkspace.advantage || 'AI-native streamlined execution'}  
**Stack Preset:** ${currentStack.name}  
**Architecture Model:** ${architectureModel === 'monorepo-satellites' ? 'Parent Monorepo + Satellites' : 'Standalone Single Repository'}

---

## 2. Universal Governance & Isolation Principles

1. **Standalone Application:** All features, APIs, and schemas developed here belong strictly to \`${currentWorkspace.name}\`.
2. **Clean 2026 Light UI Standard:** Every user interface must adhere to the 2026 Light Modern Standard (zinc-50/slate-50 canvas, crisp \`#ffffff\` cards, subtle borders, high-contrast typography \`#0f172a\`, and purposeful brand accents). Avoid cluttered, dark, or cramped layouts.
3. **Non-Destructive Database Migrations:** All schema changes must be additive (\`CREATE TABLE IF NOT EXISTS\`, additive columns). Never run destructive migrations without explicit human confirmation.
4. **Documentation Covenant:** Any commit modifying core features, APIs, or data schemas MUST update \`ROADMAP.md\` and relevant documentation in the same commit.
5. **Sandbox & Safety Policy (${sandboxPolicy === 'strict-approval' ? 'Strict Approval' : 'Standard Sandboxed'}):** ${
  sandboxPolicy === 'strict-approval'
    ? 'All filesystem writes, package installations, and system commands REQUIRE explicit human approval before execution.'
    : 'Normal builds, tests, and reads run securely inside standard sandboxed execution; prompt human only when bypassing sandbox or executing destructive commands.'
}

---

## 3. ${
  architectureModel === 'monorepo-satellites'
    ? 'Parent Monorepo & Satellite Architecture Standard'
    : 'Standalone Repository Architecture'
}

${
  architectureModel === 'monorepo-satellites'
    ? `To preserve clean Git hygiene and enable independent production deployments, this project adheres to the **Parent Monorepo + Satellite Repositories** model:

1. **Parent Monorepo is Authoritative:** Contains 100% of the project's source code across all surfaces (server, web app, marketing website, mobile specs).
2. **Never Nest \`.git\` Folders:** Surfaces (\`website/\`, \`mobile/\`) live as normal tracked directories inside the monorepo.
3. **Subtree Push Workflow:** Deployable satellite repositories are mirrored from the parent monorepo using Git subtree push:
   \`\`\`bash
   # Sync website surface to standalone satellite deployment repo
   git subtree push --prefix website <satellite-remote-name> main
   \`\`\``
    : `This project is structured as a **Standalone Single Repository**:
1. All client, server, and asset code live directly within this repository.
2. Root directory maintains core scripts, configurations, and the 4-file parity constitution.
3. Keep dependency manifests unified and avoid unnecessary nested package boundaries.`
}

---

## 4. Working Agreements for AI Assistants

${
  agentTarget === 'antigravity'
    ? `- **Planning Mode:** For non-trivial architectural changes, enter Planning Mode and create an \`implementation_plan.md\` artifact with request_feedback=true before modifying files.
- **Artifacts:** Present multi-step walkthroughs and design documents in dedicated artifacts rather than dumping raw markdown walls in chat.
- **Subagents:** Delegate deep research and codebase exploration to research subagents to keep context clean.
- **Terminal Sandbox:** Execute commands sandboxed by default. Use BypassSandbox only when network or outside-workspace access is strictly necessary.`
    : agentTarget === 'claude'
    ? `- **CLAUDE.md as Thin Pointer:** Keep \`CLAUDE.md\` lean (<100 lines); defer all constitutional and architecture details to this \`AGENTS.md\`.
- **Zero Loop Scripts:** Do not install automated turn-end backup or git commit hooks that cause execution loops.
- **Targeted Diffs:** Perform single contiguous block edits and verify builds before declaring tasks done.`
    : agentTarget === 'cursor'
    ? `- **Context Precision:** Reference files directly with \`@filename\` and avoid scanning entire vendor directories.
- **Cursor Rules Alignment:** Adhere to project guidelines defined in \`.cursorrules\` which mirrors this \`AGENTS.md\`.
- **Atomic Edits:** Keep modifications focused on the specific requested components.`
    : `- Prefer small, high-confidence diffs over broad speculative refactors.
- Match existing naming conventions (\`camelCase\` TS/JS, \`snake_case\` Python/SQL).
- Always verify runtime builds and tests before declaring tasks complete.`
}

---

## 5. Quality Assurance Gate (${qaGate === 'strict' ? 'Strict Parity' : 'Lean Velocity'})

${
  qaGate === 'strict'
    ? `- **Zero Warnings Policy:** Lint and typecheck must pass with 0 errors and 0 warnings before merge.
- **Mandatory 4-File Parity:** \`AGENTS.md\`, \`ROADMAP.md\`, \`CLAUDE.md\`, and \`CONTRIBUTING.md\` must exist and be kept synchronized.
- **Verification Command:** \`${currentStack.lintCmd} && ${currentStack.testCmd}\` must succeed.`
    : `- **Lean Velocity Mode:** Focus on rapid functional validation.
- **Verification Command:** \`${currentStack.buildCmd}\` must compile successfully without breaking runtime.`
}`
    },

    'CLAUDE': {
      filename: 'CLAUDE.md',
      category: 'governance',
      title: 'CLAUDE.md — Operational CLI Commands',
      desc: 'Thin pointer for Claude Code, CLI agents, and dev servers',
      content: `# CLAUDE.md — Operational Commands for ${currentWorkspace.name}

Read [\`AGENTS.md\`](AGENTS.md) first — it is the master constitution of this repository.

---

## Quick Reference Commands

- **Tech Stack:** ${currentStack.name}
- **Start Dev Server:** \`${currentStack.devCmd}\` (Port ${currentStack.port})
- **Production Build:** \`${currentStack.buildCmd}\`
- **Run Tests:** \`${currentStack.testCmd}\`
- **Lint / Quality Check:** \`${currentStack.lintCmd}\`

---

## Operational Agreements

- **Single Source of Truth:** Code logic is governed by \`AGENTS.md\`; feature status is tracked in \`ROADMAP.md\`.
- **Quality Gate:** ${qaGate === 'strict' ? 'Strict parity gate: run lint and tests before commit.' : 'Lean mode: verify build succeeds before commit.'}
- **Git Hygiene:** Commit with clear Conventional Commit messages (\`feat:\`, \`fix:\`, \`docs:\`, \`chore:\`). Automated blind auto-backup scripts on turn-end are disabled.
- **Verification Bar:** Verify UI and API responses before committing.`
    },

    'ROADMAP': {
      filename: 'ROADMAP.md',
      category: 'governance',
      title: 'ROADMAP.md — Implementation Status Tracker',
      desc: 'Living 3-phase milestone tracker (Done / In Progress / Backlog)',
      content: `# ROADMAP.md — Implementation Tracker for ${currentWorkspace.name}

> **Live Status Tracker.** Updated with every feature shipped.

---

## 🟢 Phase 1: MVP Core Foundation (In Progress)
- [x] Project scaffolding and constitutional governance setup (\`AGENTS.md\`, \`CLAUDE.md\`, \`ROADMAP.md\`, \`CONTRIBUTING.md\`).
- [x] Tech stack initialized: **${currentStack.name}**.
- [ ] User intake and authentication flow for ${currentWorkspace.audience}.
- [ ] Core execution engine: ${currentWorkspace.advantage || 'primary automated outcome'}.
- [ ] Responsive modern 2026 Light UI dashboard.

## 🟡 Phase 2: Advanced Capabilities & Integrations
- [ ] Multi-tenant workspace data persistence.
- [ ] Real-time analytics, exportable reports, and activity feeds.
- [ ] Automated third-party API webhook integrations.

## 🔵 Phase 3: Scale, Intelligence & Production Hardening
- [ ] Automated rate limiting, security auditing, and compliance checks (${sandboxPolicy === 'strict-approval' ? 'Strict Audit Enabled' : 'Standard'}).
- [ ] Advanced AI-driven personalized recommendations.
${architectureModel === 'monorepo-satellites' ? '- [ ] Standalone satellite deployments for marketing landing and mobile surfaces.' : '- [ ] Production CDN and containerized deployment setup.'}`
    },

    'CONTRIBUTING': {
      filename: 'CONTRIBUTING.md',
      category: 'governance',
      title: 'CONTRIBUTING.md — Engineering Guidelines',
      desc: 'Branch workflows, Conventional Commits, and code review rules',
      content: `# Contributing to ${currentWorkspace.name}

Thank you for contributing to **${currentWorkspace.name}**! To maintain software quality and team velocity, adhere to these guidelines.

---

## 1. Branch Strategy & Conventional Commits

- **Branch Naming:**
  - \`feat/<feature-name>\` for new functionality
  - \`fix/<bug-name>\` for bug resolutions
  - \`docs/<topic>\` for documentation updates

- **Commit Messages:** Follow Conventional Commits:
  - \`feat(core): implement user intake validation\`
  - \`fix(api): resolve CORS header on health check\`
  - \`docs(constitution): update satellite subtree sync instructions\`

---

## 2. Quality Bar (${qaGate === 'strict' ? 'Strict' : 'Lean'})

${
  qaGate === 'strict'
    ? `Before opening a pull request or submitting code, ensure:
1. \`${currentStack.lintCmd}\` completes with 0 errors and 0 warnings.
2. \`${currentStack.testCmd}\` passes 100% of test suites.
3. \`${currentStack.buildCmd}\` builds cleanly.`
    : `Before submitting code:
1. Ensure \`${currentStack.buildCmd}\` succeeds cleanly.
2. Manually verify the user journey meets requirements.`
}

---

## 3. Documentation Covenant

Every pull request or commit that changes business logic, API schemas, or UI states **MUST** update \`ROADMAP.md\` and corresponding documentation files in the exact same commit.`
    },

    // === PRODUCT SPECIFICATION SUITE ===
    'PRD': {
      filename: '01-master-prd.md',
      category: 'specs',
      title: '01-master-prd.md — Master PRD',
      desc: 'Executive summary, user persona, problem/solution, and MVP scope',
      content: `# 01 — Master Product Requirements Document (PRD)

## Product Name: ${currentWorkspace.name}

### 1. Executive Summary
${currentWorkspace.summary || `${currentWorkspace.name} is an AI-powered solution designed for ${currentWorkspace.audience}.`}

### 2. Problem Statement
- **Target Persona:** ${currentWorkspace.audience}
- **Critical Pain Point:** ${currentWorkspace.problem}
- **Current Inefficient Workarounds:** ${currentWorkspace.alternatives || 'Manual spreadsheets and ad-hoc communication.'}

### 3. Solution & Strategic Differentiation
- **Core Value Proposition:** ${currentWorkspace.advantage || 'AI-native automated workflow'}
- **Validation Constraint / Budget:** ${currentWorkspace.budget || 'Bootstrapped validation stage'}
- **Selected Tech Stack:** ${currentStack.name}

### 4. Functional Requirements (MVP Scope)
1. **Intake & Onboarding:** Collect user parameters and validate inputs against persona constraints.
2. **Core Matching / Processing Engine:** Deliver the primary promise: ${currentWorkspace.problem}.
3. **Dashboard & Analytics:** Visual feedback loop showing status, progress, and actionable next steps.
4. **Export & Sharing:** Clean export of outputs for downstream human or AI execution.`
    },

    'COMPETITORS': {
      filename: '02-competitor-research.md',
      category: 'specs',
      title: '02-competitor-research.md — Market & Competitors',
      desc: 'Target market breakdown, alternative workarounds, and strategic gap',
      content: `# 02 — Market & Competitor Research for ${currentWorkspace.name}

## 1. Target Market Segment
- **Primary Audience:** ${currentWorkspace.audience}
- **Market Dynamics:** Fast-moving, digital-first users seeking frictionless self-serve tools.

## 2. Existing Workarounds & Competitors
${currentWorkspace.alternatives ? `- **Existing Alternative:** ${currentWorkspace.alternatives}` : '- **Manual Alternatives:** Spreadsheets, disjointed DMs, legacy agencies.'}

## 3. Competitive Matrix & Strategic Gap

| Vector / Capability | Legacy Workarounds | ${currentWorkspace.name} |
|---|---|---|
| **Speed & Turnaround** | Manual / Multi-day latency | Instant AI-driven execution |
| **Setup Overhead** | High complexity & learning curve | Zero-configuration onboarding |
| **Governance & Quality** | Fragmented & unstandardized | 4-File Parity & Constitutional Safety |
| **Cost Efficiency** | Expensive retained services | Flexible, value-aligned pricing |`
    },

    'ARCHITECTURE': {
      filename: '03-technical-architecture.md',
      category: 'specs',
      title: '03-technical-architecture.md — Architecture & Schemas',
      desc: 'System architecture, API contracts, and database schema design',
      content: `# 03 — Technical Architecture & Data Design for ${currentWorkspace.name}

## 1. System Topology & Technology Stack

- **Stack Preset:** ${currentStack.name}
- **Runtime Environment:** ${currentStack.runtime}
- **Architecture Model:** ${architectureModel === 'monorepo-satellites' ? 'Parent Monorepo + Satellites' : 'Standalone Single Repository'}
- **Dev Server Command:** \`${currentStack.devCmd}\`
- **Build Output:** \`${currentStack.buildCmd}\`

## 2. Suggested Directory Structure

\`\`\`
${currentStack.folderLayout}
\`\`\`

## 3. Primary Data Schema (JSON Entity)

\`\`\`json
{
  "id": "uuid-v4",
  "name": "${currentWorkspace.name}",
  "audience": "${currentWorkspace.audience}",
  "problem": "${currentWorkspace.problem}",
  "score": ${currentWorkspace.score || 85},
  "status": "active",
  "createdAt": "${currentWorkspace.createdAt || new Date().toISOString()}"
}
\`\`\`

## 4. Key API Endpoints
- \`GET /api/health\` — Service uptime and version check.
- \`POST /api/items\` — Create new workspace item.
- \`GET /api/items\` — Retrieve user dashboard data.`
    },

    'BUILD_PLAN': {
      filename: '04-build-plan.md',
      category: 'specs',
      title: '04-build-plan.md — Staged AI Build Plan',
      desc: 'Step-by-step instructions for AI coding assistants (AntiGravity, Cursor)',
      content: `# 04 — Staged AI Build Plan for ${currentWorkspace.name}

## Milestone 1: Constitutional Setup & Scaffolding
- Drop \`AGENTS.md\`, \`CLAUDE.md\`, \`ROADMAP.md\`, and \`CONTRIBUTING.md\` into repository root.
- Initialize project with **${currentStack.name}**.
- Verify dev server: \`${currentStack.devCmd}\`.

## Milestone 2: Backend API & Data Persistence
- Setup service endpoints and data models according to \`03-technical-architecture.md\`.
- Establish database schemas with non-destructive migrations.

## Milestone 3: Core User Experience
- Build intake form, scoring/processing views, and real-time dashboard.
- Adhere to the 2026 Clean Light UI standard.

## Milestone 4: Verification & Public Launch
- Run quality checks: \`${currentStack.lintCmd}\` and \`${currentStack.buildCmd}\`.
- Verify mobile viewport responsiveness.
- Submit live project to StartupOS Launchpad.`
    }
  };

  const docList = Object.entries(generatedDocs).map(([key, doc]) => ({
    id: key,
    ...doc
  }));

  const filteredDocs = docList.filter((doc) => {
    if (filterType === 'all') return true;
    return doc.category === filterType;
  });

  const selectedDocObj = generatedDocs[activeDoc] || docList[0];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCurrent = () => {
    downloadMarkdownFile(selectedDocObj.filename, selectedDocObj.content);
  };

  const handleDownloadAllZip = () => {
    const filesToZip = docList.map((d) => ({
      name: d.filename,
      content: d.content
    }));
    downloadZipBundle(`${safeSlug}-full-scaffold.zip`, filesToZip);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 border border-slate-800 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Full AI Specification & Constitution Suite</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Specification & Constitution Studio
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Generate, preview, and 1-click download production-grade PRDs, system architecture designs, and the complete 
              <strong className="text-white font-bold"> 4-File Parity Governance Suite</strong> (<code className="text-indigo-300">AGENTS.md</code>, <code className="text-indigo-300">ROADMAP.md</code>, <code className="text-indigo-300">CLAUDE.md</code>, <code className="text-indigo-300">CONTRIBUTING.md</code>).
            </p>
          </div>

          {/* Master Actions: ZIP Download & Autonomous Prompts */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={handleDownloadAllZip}
              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 group cursor-pointer"
            >
              <Archive className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>Download Scaffold (.ZIP)</span>
            </button>

            {onNavigateToPromptVault && (
              <button
                onClick={() => onNavigateToPromptVault(currentWorkspace, currentStack.name)}
                className="bg-purple-600/90 hover:bg-purple-600 text-white font-bold text-xs px-5 py-2.5 rounded-2xl border border-purple-400/40 shadow-md shadow-purple-900/40 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-purple-200" />
                <span>Autonomous Prompts →</span>
              </button>
            )}

            <div className="text-[10px] text-slate-400 text-center font-medium">
              8 files bundled with live config
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 font-bold">
            <Folder className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Active Project Workspace
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              {currentWorkspace.name}
            </span>
          </div>
        </div>

        {/* Workspace Switcher Dropdown */}
        {ideas.length > 0 && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <label className="text-xs font-semibold text-slate-500">Switch Workspace:</label>
            <select
              value={currentWorkspace.id}
              onChange={(e) => {
                const selected = ideas.find((i) => i.id === e.target.value);
                if (selected && setActiveIdea) setActiveIdea(selected);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              {ideas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.score || 85}/100)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Interactive Constitution & Architecture Customizer Drawer */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
        {/* Toggle Bar */}
        <div 
          onClick={() => setShowConfigDrawer(!showConfigDrawer)}
          className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors border-b border-slate-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Constitution & Tech Stack Configurator
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Customize AI target rules, stack commands, quality gates, and architecture before exporting.
              </p>
            </div>
          </div>

          {/* Applied Badges Summary & Toggle Chevron */}
          <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold">
            <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              🤖 {agentTarget.toUpperCase()}
            </span>
            <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              ⚡ {currentStack.name.split('+')[0].trim()}
            </span>
            <span className="px-2 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
              🛡️ {sandboxPolicy === 'strict-approval' ? 'Strict Safety' : 'Sandboxed'}
            </span>
            <button className="p-1 rounded-md text-slate-400 hover:text-slate-600 ml-1">
              {showConfigDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Options Body */}
        {showConfigDrawer && (
          <div className="p-5 bg-slate-50/50 space-y-5 border-t border-slate-100 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Option 1: AI Assistant Target */}
              <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <label className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" /> Primary AI Agent Target
                </label>
                <select
                  value={agentTarget}
                  onChange={(e) => setAgentTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="universal">Universal (All Models)</option>
                  <option value="antigravity">Google AntiGravity 2.0</option>
                  <option value="claude">Claude Code CLI</option>
                  <option value="cursor">Cursor / Windsurf IDE</option>
                </select>
                <span className="text-[10px] text-slate-400 block">
                  Tailors Working Agreements in AGENTS.md
                </span>
              </div>

              {/* Option 2: Tech Stack Preset */}
              <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <label className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-indigo-600" /> Tech Stack Preset
                </label>
                <select
                  value={stackPreset}
                  onChange={(e) => setStackPreset(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="vite-react">React 18 + Vite + Tailwind v4</option>
                  <option value="nextjs">Next.js 15 (App Router) + TS</option>
                  <option value="node-express">Node.js + Express + SQLite</option>
                  <option value="fastapi">FastAPI + Python 3.12</option>
                </select>
                <span className="text-[10px] text-slate-400 block">
                  Injects dev & build commands in CLAUDE.md
                </span>
              </div>

              {/* Option 3: Sandbox & Safety Policy */}
              <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <label className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Sandbox & Safety Policy
                </label>
                <select
                  value={sandboxPolicy}
                  onChange={(e) => setSandboxPolicy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="safe-sandbox">Standard Sandbox (Auto-run Safe)</option>
                  <option value="strict-approval">Strict Approval (Prompt on all writes)</option>
                </select>
                <span className="text-[10px] text-slate-400 block">
                  Specifies safety boundaries in AGENTS.md
                </span>
              </div>

              {/* Option 4: QA Gate & Architecture Model */}
              <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <label className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" /> Architecture Model
                </label>
                <select
                  value={architectureModel}
                  onChange={(e) => setArchitectureModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="monorepo-satellites">Monorepo + Satellites (Subtrees)</option>
                  <option value="single-repo">Standalone Single Repo</option>
                </select>
                <span className="text-[10px] text-slate-400 block">
                  Defines multi-surface sync workflow
                </span>
              </div>
            </div>

            {/* Quick Reset & Secondary Toggles */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-600">QA Gate Standard:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQaGate('strict')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      qaGate === 'strict'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Strict Parity (0 warnings)
                  </button>
                  <button
                    onClick={() => setQaGate('lean')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      qaGate === 'lean'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Lean MVP Velocity
                  </button>
                </div>
              </div>

              <button
                onClick={resetConfig}
                className="text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Reset to Defaults
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs (All / Governance / Specs) */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          All 8 Documents
        </button>
        <button
          onClick={() => setFilterType('governance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filterType === 'governance'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>⚖️ 4-File Parity Constitution (4)</span>
        </button>
        <button
          onClick={() => setFilterType('specs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filterType === 'specs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>📘 Product PRDs & Architecture (4)</span>
        </button>
      </div>

      {/* Main Studio View: Document Navigation + Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Document Tabs */}
        <aside className="lg:col-span-4 space-y-2.5 h-fit">
          {filteredDocs.map((doc) => {
            const isSelected = activeDoc === doc.id;
            const isGov = doc.category === 'governance';

            return (
              <button
                key={doc.id}
                onClick={() => setActiveDoc(doc.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20 text-slate-900'
                    : 'bg-white/80 border-slate-200/80 text-slate-600 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                    {isGov ? <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> : <FileCode className="w-3.5 h-3.5 text-slate-500" />}
                    {doc.filename}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                    isGov ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isGov ? 'Constitution' : 'Spec'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium line-clamp-1">
                  {doc.desc}
                </div>
              </button>
            );
          })}
        </aside>

        {/* Right: Markdown Viewer & Action Bar */}
        <main className="lg:col-span-8 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-extrabold text-slate-900">
                  {selectedDocObj.filename}
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Configured: {currentStack.name.split('+')[0].trim()}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedDocObj.desc}
              </p>
            </div>

            {/* Document Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(selectedDocObj.content)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownloadCurrent}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .MD</span>
              </button>
            </div>
          </div>

          {/* Clean Markdown Preview Container */}
          <div className="relative rounded-2xl bg-slate-950 p-6 overflow-hidden border border-slate-800">
            <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[550px] overflow-y-auto pr-2">
              {selectedDocObj.content}
            </pre>
          </div>
        </main>
      </div>
    </div>
  );
}
