# AGENTS.md — How to work in this repository

> **Read this first.** This file is the constitution of the BusinessPay repository. It applies to every
> engineer and every AI coding assistant (AntiGravity, Emergent, Replit Agent, Claude Code, Codex, Cursor, Windsurf, Copilot,
> or anything that comes later). If a tool only reads one file, it should be this one.

---

## 1. What BusinessPay is

BusinessPay is a modern, high-performance B2B Accounts Receivable (AR) management and cash acceleration platform built for finance, AR, and credit management teams. It empowers organizations to reduce Days Sales Outstanding (DSO), manage overdue invoices, resolve customer disputes, track Promises to Pay (PTP), evaluate customer credit risk, and launch targeted early-payment liquidity campaigns.

**Tagline:** "Accelerate B2B Cash Flow & Liquidity."

The platform has three primary operational surfaces backed by one API and a canonical SQLite database:

| Surface | Description | Path / Code | Users |
|---|---|---|---|
| AR Collector Portal | Main collections workqueue, invoice drawer, dynamic discounts | `src/App.jsx` | AR Collectors & Credit Managers |
| Buyer Portal Simulation | End customer view to review & accept discount offers | `src/App.jsx` (Buyer view) | End Buyers / Accounts Payable |
| Admin Console | Risk grading, liquidity campaign governance, audit log | `src/App.jsx` (Admin view) | Finance Leadership & Admins |

- **Vision & Requirements:** The 6-Volume Founder Blueprint (`VOLUME1` through `VOLUME6`).
- **Implementation Status:** [`ROADMAP.md`](ROADMAP.md) live done/pending tracker.
- **Deep Documentation:** [`docs/`](docs/README.md) architecture, API, database, auth, frontend, decisions.
- **Rule of Interpretation:** The *implementation is the current truth*; PRDs depict intended vision. Document divergences in [`docs/decision-log.md`](docs/decision-log.md).

---

## 2. The Stack (Do not replace without explicit approval)

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | React 19 + Vite 8 + Tailwind CSS | Single Page Application with interactive drawers |
| **Backend API** | Node.js Express 5 | RESTful API server (`server/index.js`) |
| **Database** | SQLite via `better-sqlite3` (WAL mode) | `data/businesspay.db` |
| **Auth System** | Multi-Realm JWT | Scoped authentication for Collectors, Buyers, and Admins |
| **Payments** | Razorpay SDK | B2B invoice collection and automated payment routing |

---

## 3. Non-Negotiable Rules

1. **Analyze before coding.** Inspect relevant routes, UI components, and `docs/` before writing code.
2. **Reuse before generating.** Reuse UI primitives, drawers, toasts, formatters, and backend helpers.
3. **Modify, don't rewrite.** Extend existing files. Never rewrite working backend modules.
4. **Server-side enforcement is the security boundary.** Every API route must enforce auth and permission checks. Never expose sensitive fields.
5. **Audit everything administrative.** Any state-changing admin action must log to `activity_log`.
6. **Additive migrations.** Database updates must be non-destructive (`CREATE TABLE IF NOT EXISTS`). Never reset `data/businesspay.db` without explicit consent.
7. **Verify before declaring done.** Mandatory 3-step check:
   - Syntax / TypeScript check.
   - API endpoint response check.
   - Live browser flow verification.

---

## 4. Documentation Covenant

**Every change that alters scope, features, API, schema, or architecture must update documentation in the same commit set.**

| You changed… | You must update… |
|---|---|
| Product features / scope | `ROADMAP.md` status rows & matching `VOLUME` PRD |
| API endpoints | [`docs/api.md`](docs/api.md) |
| Database schema | [`docs/database.md`](docs/database.md) |
| Architecture decisions | [`docs/decision-log.md`](docs/decision-log.md) |
| User-visible changes | Root [`README.md`](README.md) |

---

## 5. Repository Map

```
BusinessPay/
├── AGENTS.md                             ← You are here (Repository Constitution)
├── CLAUDE.md                             ← Thin pointer for CLI agents
├── README.md                             ← Overview & getting started
├── ROADMAP.md                            ← Live feature tracker
├── CONTRIBUTING.md                       ← Development guidelines
├── replit.md                             ← Replit setup instructions
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
│   └── index.js                          ← Express API & SQLite schema/seeders
├── src/
│   ├── App.jsx                           ← Main React SPA
│   └── main.jsx
├── data/
│   └── businesspay.db                    ← SQLite database
├── index.html
├── vite.config.js
└── package.json
```

---

## 6. Working Agreements for AI Assistants

- Prefer small, high-confidence diffs over broad speculative refactors.
- Match surrounding code style and design system tokens.
- Never edit existing decision log entries; append new entries to record choices.
- Run verification checks before declaring completion.
