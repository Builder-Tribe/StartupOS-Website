# AGENTS.md — Constitution of StartupOS

> **Read this first.** This file is the constitution of the StartupOS repository. It applies to every
> engineer and every AI coding assistant (AntiGravity, Emergent, Replit Agent, Claude Code, Codex, Cursor, Windsurf, Copilot,
> or anything that comes later). If a tool only reads one file, it should be this one.

---

## 1. What StartupOS Is (The Vision & Objective)

StartupOS is an independent, universal platform built to democratize product creation for everyone—from school/college students building portfolio projects to seasoned professionals launching real-world AI startups. It makes building software as intuitive as creating a document or spreadsheet.

**Vision Statement:** "The Universal Operating System & Community Launchpad for AI Product Builders."

StartupOS guides builders through the entire 360° product creation lifecycle:

| Lifecycle Stage | What StartupOS Provides |
|---|---|
| **1. How to Build** | Step-by-step 0-to-1 build recipes, workflow guides, and interactive AI Builder Academy (LMS). |
| **2. What Tools to Use** | Recommended tool selection matrix (AntiGravity, Emergent, Replit, Claude, Cursor, Windsurf, Vercel, Supabase). |
| **3. What Prompts to Give** | Battle-tested system prompts, PRD generator prompts, and AI agent instructions. |
| **4. What Architecture to Use** | Visual architecture diagrams, database schemas (SQLite, Postgres, pgvector), multi-surface patterns. |
| **5. What Governance to Have** | Constitution standards (`AGENTS.md`), security boundaries, non-destructive migration rules, risk-proportional dialogs, and 4-file parity. |
| **6. Deployment, Push & Engagement** | Deployment blueprints, Git push workflows, and a Product Hunt-inspired Launchpad feed to gain traction, upvotes, and feedback. |

---

## 2. STRICT RULE OF ISOLATION FOR INDIVIDUAL PROJECTS (NON-NEGOTIABLE)

1. **StartupOS is a Standalone Application:** All code, features, documentation, and tools developed here belong strictly to `StartupOS`.
2. **ZERO Unrequested Edits to Individual Projects:** Never add, edit, or commit any code, files, or documentation inside individual project directories (`Ideas/Trippy`, `Ideas/DupeScout`, `Ideas/BusinessPay`, `Ideas/CollabKaro` or external `Projects/` folders).
3. **Individual Entity Isolation:** Flagship projects (`Trippy`, `DupeScout`, `BusinessPay`, `CollabKaro`) are separate entities with individual GitHub org setups (`Nomad-Tribe`, `Trend-Tribe`, `Business-Tribe`, `Collab-Tribe`).
4. **Mandatory Explicit Confirmation Protocol:** Even if the user mentions an individual project, **do NOT make changes to that project's folder** unless:
   - The user explicitly requests a change inside that specific project.
   - You cross-check and receive explicit confirmation from the user BEFORE making any edits.

---

## 3. The Stack (Do Not Replace Without Explicit Approval)

| Layer | Technology | Rationale & Notes |
|---|---|---|
| **Frontend Web** | React 18 + Vite + Tailwind CSS / Modern CSS Tokens | 2026 Light modern UI (OpenAI Astra ambient blur + Razorpay glassmorphic cards). |
| **Backend Server** | Node.js (`server.mjs`) | HTTP REST API with persistent JSON/SQLite databases for Launches, Upvotes, Ideas, and Health Checks. |
| **Auth System** | Multi-Realm JWT | User Authentication & Personal Builder Workspaces. |
| **Styling** | Lucide Icons + Tailwind CSS | Clean, responsive 2026 design system tokens. |

---

## 4. Tool-Wise Development Protocol & Execution Matrix

- **AntiGravity:** Lead architectural design, multi-agent orchestration, full-stack implementation, and local runtime verification (`http://localhost:8081`).
- **Emergent:** Autonomous full-stack feature generation respecting security boundaries and component reuse.
- **Replit:** Cloud prototyping, live webview previews, dynamic `process.env.PORT` binding.
- **Claude Code:** Terminal automation, CLI refactoring, and code reviews.
- **Codex & Copilot:** Inline code autocomplete governed by `tsconfig.json`.
- **Cursor & Windsurf:** Multi-file indexing and semantic search.

---

## 5. Repository Map

```
StartupOS/                                 ← Git Root (https://github.com/1997agarwal/StartupOS)
├── AGENTS.md                              ← You are here (StartupOS Constitution)
├── CLAUDE.md                              ← Thin pointer for CLI agents
├── README.md                              ← Master project overview & quickstart
├── ROADMAP.md                             ← Live feature completion status
├── CONTRIBUTING.md                        ← Workflow & branch guidelines
├── replit.md                              ← Replit co-development guide
├── server.mjs                             ← Node REST API server (Port 8081)
├── index.html
├── package.json
├── vite.config.js
├── data/                                  ← Persistent database (ideas.json, launches.json)
├── src/                                   ← Main StartupOS Application
│   ├── App.jsx                            ← Tab orchestrator (Launchpad, Workspace, Builder, LMS)
│   ├── main.jsx
│   ├── components/
│   │   ├── Navbar.jsx                     # 2026 Top Navigation
│   │   ├── LaunchpadFeed.jsx              # Product Hunt-Style Launch & Upvote Feed
│   │   ├── LaunchSubmissionModal.jsx       # Launch Product Submission Modal
│   │   ├── BlueprintStudio.jsx            # My Projects Workspace & 4-File Health Auditor
│   │   ├── IdeaLab.jsx                    # 0-to-1 Voice/Prompt Startup Builder
│   │   ├── PRDGeneratorStudio.jsx         # PRD & Architecture Generator
│   │   └── LMSHub.jsx                     # AI Builder Academy (LMS)
│   └── data/
```

---

## 6. Working Agreements for AI Assistants

- **Mandatory UI Design Standard:** Every user interface and feature must adhere to the **Clean, Intuitive & Modern 2026 Light Theme** (zinc/slate-50 canvas, crisp `#ffffff` cards, subtle borders, high-contrast typography `#0f172a`, and purposeful accent colors). Avoid cramped, dark, or cluttered single-screen info dumps; prefer guided, step-by-step workflows with generous whitespace.
- Prefer small, high-confidence diffs over broad speculative refactors.
- Match surrounding code style and design system tokens.
- Maintain documentation integrity and update `ROADMAP.md` on feature completion.
- Verify runtime execution before declaring done.

---

## 7. Universal Parent Monorepo & Satellite Architecture Standard

To preserve clean Git hygiene, ensure full codebase visibility for AI assistants, and enable isolated production deployments, all ventures adhere to the **Parent Monorepo + Satellite Repositories** model:

1. **Parent Monorepo is Authoritative Single Source of Truth:**
   - The primary venture repository (e.g., `Nomad-Tribe/Trippy`, `Business-Tribe/BusinessPay`, `Collab-Tribe/CollabKaro`, `Trend-Tribe/DupeScout`) contains 100% of the project's source code across all surfaces.
   - Dedicated surfaces live in designated subdirectories inside the parent repository (e.g. `website/`, `mobile/`, `data/`, `server/`, `web/`).
   - Every file must be tracked directly by the parent Git repository so cloning the monorepo provides the complete product.

2. **Satellite Repositories for Independent Deployment Boundaries:**
   - Separate repositories (e.g., `<Project>-Website`, `<Project>-Mobile`, `<Project>-Data`) exist solely to provide dedicated deployment targets (e.g. Vercel/Cloudflare Pages for landing pages, Expo/EAS for mobile builds, isolated DB/ML runners).
   - **Never embed a `.git` folder inside the monorepo working tree:** Never clone a satellite repo with its own `.git` directly inside the parent repo unless formally configured in `.gitmodules`. Doing so causes Git submodule confusion, ignored code, and detached pointer issues.
   - **Subtree Push Workflow:** Sync code from the parent monorepo to the satellite repo using `git subtree push`:
     ```bash
     # Example: Syncing marketing website from parent monorepo to satellite
     git subtree push --prefix website <satellite-remote-name> main
     ```

3. **Future Extension Rule (Mobile & Database Management):**
   - When building mobile apps (React Native / Flutter) or dedicated database/pipeline services:
     - Develop the surface directly within the parent monorepo under `mobile/` or `data/`.
     - Create a satellite repo under the corresponding GitHub organization (`<Tribe>/<Project>-Mobile`).
     - Register the remote in the parent repository and mirror commits via Git subtree sync.

