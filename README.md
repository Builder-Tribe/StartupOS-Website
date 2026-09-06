# 🚀 StartupOS — 360° AI Product Incubator & Operating System

**StartupOS** is a universal operating system and incubator for **Founders**, **College Students**, and **Developers** to build, launch, and scale AI-native products. It provides an end-to-end workflow from idea blueprinting and 4-file code parity auditing to community product exchange and internal platform administration.

---

## 🌟 The 3 Decoupled Interfaces

StartupOS is architected into **three completely decoupled applications**, ensuring clean separation of concerns between public visitors, customer builders, and internal platform admins:

### 1. 🌐 Standalone Public Marketing Website
* **URL**: [`http://localhost:3000/?view=website`](http://localhost:3000/?view=website)
* **Purpose**: Public-facing landing page explaining how StartupOS guides builders across the **6 Core Pillars**:
  1. *How to Build* (Step-by-step AI workflows)
  2. *Apps to Use* (Recommended dev stacks)
  3. *Prompts to Give* (Battle-tested system prompts)
  4. *Architecture* (System design & diagrams)
  5. *Governance* (4-File code parity & standards)
  6. *Deployment / Launchpad* (Community product exchange)
* **CTAs**: **"Get Started Free — Create Account"** (Registration modal with persona picker) & **"Explore Portal Demo"** (Guest demo access).

---

### 2. 🚀 Customer Builder Portal
* **URL**: [`http://localhost:3000/?view=portal`](http://localhost:3000/?view=portal)
* **Purpose**: The main operating workspace for builders. Contains:
  * **Left Sidebar Navigation** (`Sidebar.jsx`): Access to all builder modules (`Launchpad Feed`, `My Projects`, `AI Builder Studio`, `AI Academy`).
  * **Top Header** (`Navbar.jsx`): Clean workspace switcher, global search, and `+ Launch Product` CTA.
  * **StartupOS Launchpad Feed**: Community product exchange to launch, discover, and upvote next-gen AI products (*zero competitor references*).
  * **My Projects Workspace**: Manage idea blueprints, intake criteria, and 4-file parity health.
  * **AI Builder Studio**: Generate PRDs, App Stacks, System Prompts, and Architecture diagrams via AntiGravity AI.
  * **AI Academy**: Hands-on learning paths for AI engineering and product building (*no LMS jargon*).
  * **"How We Can Help?"**: Interactive AI assistance concierge (`HelpCenterModal.jsx`) for 1-on-1 technical & governance guidance.

---

### 3. 👑 B2B Internal Admin CMS Portal
* **URL**: [`http://localhost:3000/?view=admin`](http://localhost:3000/?view=admin)
* **Purpose**: Dedicated internal management dashboard for the StartupOS team (*isolated from customer builder tools*). Features:
  * **Vertical Left Sidebar**: Sleek navigation between admin management modules.
  * **📊 Dashboard Overview**: Platform KPIs (Registered Users, Products Shipped, Project Audits, 4-File Parity Baseline 100%) and User Persona Distribution Breakdown (*Founders*, *College Students*, *Developers*).
  * **👥 Users & Personas Directory**: Searchable directory tracking registered builders with persona tags, work emails, workspace names, and registration dates.
  * **🚀 Product Launches (CMS)**: Content management system to approve submissions, delete listings, and feature the **#1 Product of the Day**.
  * **🎓 Project Audits (Admin LMS)**: Code evaluation workbench to inspect 4-file parity compliance (`PRD`, `Apps`, `Prompts`, `Architecture`), assign verified scores (0–100), write examiner notes, and grant verified builder certificates.
  * **⚙️ System & Health**: Backend Node API health monitoring (`http://localhost:8081`).

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: React 18, Vite 6, TailwindCSS, Lucide Icons
* **Backend Hub**: Node.js ESM HTTP API Server (`server.mjs`) running on port `8081`
* **Data Persistence**: Atomic JSON datastores in `data/`:
  * `data/users.json` — Registered builder accounts & persona metadata
  * `data/ideas.json` — User project blueprints & 4-file parity scores
  * `data/launches.json` — Community product listings & upvotes
  * `data/audits.json` — Code audit requests & examiner feedback

---

## 🚀 Quickstart & Setup

### Prerequisites
* Node.js v18+ 

### Installation

```bash
# Clone the repository
git clone https://github.com/1997agarwal/StartupOS.git
cd StartupOS

# Install dependencies
npm install
```

### Running the Application

```bash
# Start both Backend API Server (8081) and Vite Dev Server (3000)
npm run dev

# Or start Backend API Server individually:
node server.mjs
```

Open your browser at `http://localhost:3000`.

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Email-first user lookup & session initialization |
| `POST` | `/api/auth/register` | Register new user with persona picker |
| `GET` | `/api/auth/users` | List all registered users by persona (Admin) |
| `GET` | `/api/ideas` | Fetch user project blueprints |
| `POST` | `/api/ideas` | Save new idea blueprint |
| `GET` | `/api/launches` | Fetch community product launches |
| `POST` | `/api/launches` | Submit new product for launch |
| `POST` | `/api/launches/:id/upvote` | Upvote a product launch |
| `GET` | `/api/admin/audits` | Fetch 4-file parity audit queue (Admin LMS) |
| `POST` | `/api/admin/audits/:id/review` | Verify project audit & assign score (Admin LMS) |

---

## 🛡️ 4-File Code Parity Standard

StartupOS enforces a **4-File Parity Standard** across all projects:
1. `AGENTS.md` — AI agent definitions & capabilities
2. `ROADMAP.md` — Product roadmap & execution timeline
3. `CLAUDE.md` — System prompts & coding guidelines
4. `CONTRIBUTING.md` — Governance & contribution rules

---

© 2026 StartupOS — Universal AI Product Incubator & Operating System.
