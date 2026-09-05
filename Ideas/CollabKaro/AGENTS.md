# AGENTS.md — How to work in this repository

> **Read this first.** This file is the constitution of the CollabKaro repository. It applies to every
> engineer and every AI coding assistant (AntiGravity, Emergent, Replit Agent, Claude Code, Codex, Cursor, Windsurf, Copilot,
> or anything that comes later). If a tool only reads one file, it should be this one.

---

## 1. What CollabKaro is

CollabKaro is an India-first, two-sided marketplace and operating system for brands, agencies, influencers, UGC creators, affiliate partners, and offline event creators. It governs the full collaboration lifecycle from creator discovery and brief pitching to escrow milestone funding and proof-of-delivery payout.

**Tagline:** "India's Creator Collaboration & Escrow Marketplace."

The platform hosts three surfaces backed by one Express REST API and a canonical SQLite database:

| Surface | Description | Path / Code | Users |
|---|---|---|---|
| Brand & Agency Portal | Campaign brief builder, creator search, proposal review | `src/App.jsx` | Brands & Marketing Agencies |
| Creator Media Kit Hub | Profile setup, inbound campaign pitches, milestone delivery | `src/App.jsx` | Influencers, UGC & Offline Creators |
| Admin Governance Console | Escrow release, dispute arbitration, verification audit log | `src/App.jsx` | Platform Operations & Admins |

- **Vision & Requirements:** 6-Volume Founder Blueprint (`VOLUME1` through `VOLUME6`).
- **Implementation Status:** [`ROADMAP.md`](ROADMAP.md) live done/pending tracker.
- **Deep Documentation:** [`docs/`](docs/README.md) architecture, API, database, auth, frontend, decisions.
- **Rule of Interpretation:** The *implementation is the current truth*; PRDs depict intended vision.

---

## 2. The Stack (Do not replace without explicit approval)

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | React 18 + Vite 5 + Tailwind CSS | Modern 2026 Light design system |
| **Backend API** | Node.js Express 5 | RESTful API (`server/index.js`) |
| **Database** | SQLite via `better-sqlite3` | `data/collabkaro.db` |
| **Auth System** | Multi-Realm JWT | Scoped authentication for Brands, Creators, and Admins |
| **Escrow & Payments**| Razorpay B2B Escrow Gateway | Milestone funding and automated creator payouts |

---

## 3. Non-Negotiable Rules

1. **Analyze before coding.** Inspect relevant files, existing API routes, and `docs/` before writing code.
2. **Reuse before generating.** Always reuse UI primitives, badges, modals, toasts, and API helpers.
3. **Modify, don't rewrite.** Extend existing files. Never rewrite working backend modules.
4. **Server-side security boundary.** Every API endpoint must enforce auth and role checks (`brand`, `creator`, `admin`).
5. **Escrow Safety.** Milestone funds must be held in escrow prior to content work starting. Never release escrow funds without brand approval or admin dispute resolution.
6. **Additive migrations.** Database updates must be non-destructive (`CREATE TABLE IF NOT EXISTS`).
7. **Verify before declaring done.** Mandatory 3-step check (compile, API test, live browser verification).

---

## 4. Documentation Covenant

**Every change altering scope, features, API, schema, or architecture must update documentation in the same commit set.**

| You changed… | You must update… |
|---|---|
| Product features / scope | `ROADMAP.md` status rows & matching `VOLUME` PRD |
| API endpoints | [`docs/api.md`](docs/api.md) |
| Database schema | [`docs/database.md`](docs/database.md) |
| Replit setup / ports | [`replit.md`](replit.md) |
| Architecture decisions | [`docs/decision-log.md`](docs/decision-log.md) |
| User-visible changes | Root [`README.md`](README.md) |

---

## 5. Repository Map

```
CollabKaro/
├── AGENTS.md                             ← You are here (Repository Constitution)
├── CLAUDE.md                             ← Thin pointer for CLI agents
├── README.md                             ← Overview & quickstart
├── ROADMAP.md                            ← Live feature completion tracker
├── CONTRIBUTING.md                       ← Development guidelines
├── replit.md                             ← Replit setup instructions
├── .replit                               ← Replit Nix environment config
├── VOLUME1_Vision_Market_Research.md     # PRD Vol 1
├── VOLUME2_Consumer_PRD.md               # PRD Vol 2
├── VOLUME3_Vendor_Management_System.md   # PRD Vol 3
├── VOLUME4_Admin_Console_PRD.md          # PRD Vol 4
├── VOLUME5_AI_Architecture_Technical.md  # PRD Vol 5
├── VOLUME6_GTM_Growth_Monetization.md    # PRD Vol 6
├── docs/                                 ← Engineering knowledge base
│   ├── README.md
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   ├── auth.md
│   ├── frontend.md
│   └── decision-log.md
├── server/
│   └── index.js                          ← Express API & SQLite database seeder
├── src/
│   ├── App.jsx                           ← Main React SPA
│   ├── main.jsx
│   └── styles.css
├── index.html
├── vite.config.js
└── package.json
```
