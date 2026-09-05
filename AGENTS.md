# AGENTS.md — How to work in this repository

> **Read this first.** This file is the constitution of the StartupOS repository. It applies to every
> engineer and every AI coding assistant (AntiGravity, Claude Code, Cursor, Copilot, Codex, Windsurf, Replit Agent,
> or anything that comes later). If a tool only reads one file, it should be this one.

---

## 1. What StartupOS is

StartupOS is an AI-powered operating system for founders and builders to go from zero to launch:
ideation, market validation, business model generation, startup voice branding, LMS learning modules, partner payments, and multi-product management under one unified platform.

**Tagline:** "The All-in-One Operating System for AI Startups."

The platform hosts multiple product surfaces backed by shared backend modules:

| Surface / Product | Path | Description | Users |
|---|---|---|---|
| StartupOS Core | `/` (dev port 8081) | Executive hub, AI idea builder, Startup Voice, My Projects | Founders & Entrepreneurs |
| AI Builder Academy | `/lms` or tab | Interactive LMS for learning AI startup creation | Builders & Students |
| CollabKaro | `Ideas/CollabKaro/` | Influencer-brand collaboration marketplace | Creators & Brands |
| BusinessPay | `Ideas/BusinessPay/` | B2B invoice financing & payment routing | Small Businesses & Vendors |
| DupeScout | `Ideas/DupeScout/` | AI vision product similarity & dupes marketplace | Gen Z Shoppers & Sellers |
| Trippy | `Ideas/Trippy/` | AI solo travel group matching & trip host platform | Travellers & Communities |
| Mobile App | `apps/mobile/` | iOS & Android cross-platform companion app | Mobile Founders & Users |

- **Vision & Requirements:** 6-Volume Founder Blueprint (`VOLUME1` through `VOLUME6`).
- **Implementation Status:** [`ROADMAP.md`](ROADMAP.md) live done/pending tracker.
- **Deep Documentation:** [`docs/`](docs/README.md) architecture, API, database, auth, frontend, Replit, mobile specs.
- **Rule of Interpretation:** The *implementation is the current truth*; PRDs depict intended vision. Document divergences in [`docs/decision-log.md`](docs/decision-log.md) — never silently alter code without explicit instructions.

---

## 2. The Stack (Do not replace without explicit approval)

| Layer | Technology | Rationale & Notes |
|---|---|---|
| **Frontend Web** | React 18 + Vite + Tailwind CSS / Modern CSS Tokens | 2026 Light modern UI (OpenAI Astra ambient blur + Razorpay glassmorphism cards). |
| **Backend API** | Node.js (Express / ESM `server.mjs`) + Python FastAPI | High-performance API endpoints + AI/ML vector search capabilities. |
| **Database** | SQLite (`data/startup_os.db`) / PostgreSQL + pgvector | Lightweight local dev & vector search capabilities. Parameterized SQL queries. |
| **Auth System** | Multi-Realm JWT (scrypt hashing) | Scope isolation between User, Partner/Seller, and Admin. |
| **Mobile App** | React Native (Expo) + TypeScript | Cross-platform iOS & Android companion app in `apps/mobile/`. |
| **Replit Integration** | `replit.md` + `.replit` config | Co-development setup for AntiGravity + Replit execution environments. |
| **Payments** | Razorpay SDK | UPI, Card subscriptions, B2B invoicing. |

---

## 3. Non-Negotiable Rules

1. **Analyze before coding.** Inspect relevant files, existing endpoints, UI components, and `docs/` before writing code.
2. **Reuse before generating.** Always reuse UI primitives, dialogs, toasts, formatters, and backend helpers. Creating duplicate logic is a defect.
3. **Modify, don't rewrite.** Extend existing code. Never rewrite working modules from scratch.
4. **Preserve multi-surface architecture.** Keep core routes in `src/`, LMS modules in `src/lms/`, product ideas in `Ideas/`, and mobile code in `apps/mobile/`.
5. **Server-side enforcement is the security boundary.** Every API endpoint must enforce authentication, permission checks, and payload validation. Never leak secrets, hashes, or tokens.
6. **Audit administrative actions.** Immutable logging for administrative state changes (`writeAudit`).
7. **Additive migrations & database safety.** Schema updates must be non-destructive (`CREATE TABLE IF NOT EXISTS`, additive `ALTER TABLE`). Never reset databases or clear `data/` without explicit user consent.
8. **Verify before declaring done.** Mandatory 3-step verification:
   - Compile check: `npx tsc --noEmit` or syntax verification.
   - Test check: Run test suite where applicable.
   - Runtime flow check: Verify in live browser/server context.

---

## 4. Documentation Covenant

**Every change altering scope, features, API, schema, or architecture must update documentation in the same commit set.**

| You changed… | You must update… |
|---|---|
| Product features / scope | `ROADMAP.md` status rows & matching `VOLUME` PRD |
| API endpoints | [`docs/api.md`](docs/api.md) |
| Database schema | [`docs/database.md`](docs/database.md) |
| Replit setup / ports | [`replit.md`](replit.md) |
| Mobile app features | [`apps/mobile/MOBILE_PRD.md`](apps/mobile/MOBILE_PRD.md) |
| Architecture decisions | [`docs/decision-log.md`](docs/decision-log.md) |
| User-visible changes | Root [`README.md`](README.md) |

---

## 5. Replit & AntiGravity Co-Development Protocol

- Maintain `replit.md` with explicit setup instructions, port maps, and environment variables.
- Keep `.replit` updated with `npm run dev` entrypoint and Nix package dependencies.
- Ensure all API endpoints listen on `process.env.PORT || 8081` to support Replit's dynamic proxy routing.

---

## 6. Mobile App Architecture & Structure

- All mobile code resides in `apps/mobile/` (React Native Expo TypeScript).
- Maintain dedicated documentation in `apps/mobile/MOBILE_PRD.md` and `apps/mobile/MOBILE_ARCHITECTURE.md`.
- Shared TypeScript interfaces between web and mobile reside in `src/types/` or `shared/`.

---

## 7. Backup & Safeguard Policy

- **Automated Commit & Push**: Run `scripts/auto-backup.sh` or push changes to `https://github.com/1997agarwal/StartupOS.git` at key milestones.
- **Snapshot Backups**: JSON DB state snapshots stored in `data/backups/`.
- **Secret Protection**: `.env`, tokens, and credentials strictly excluded via `.gitignore`.

---

## 8. Repository Map

```
StartupOS/                                 ← Git Root (https://github.com/1997agarwal/StartupOS)
├── AGENTS.md                              ← You are here (Repository Constitution)
├── CLAUDE.md                              ← Thin pointer for CLI agents
├── README.md                              ← Master project overview & quickstart
├── ROADMAP.md                             ← Live feature completion status
├── CONTRIBUTING.md                        ← Workflow, pull requests, branch guidelines
├── replit.md                              ← Instructions for Replit co-development
├── VOLUME1_Vision_Market_Research.md      # PRD Vol 1
├── VOLUME2_Consumer_PRD.md                # PRD Vol 2
├── VOLUME3_Partner_Vendor_CRM_PRD.md      # PRD Vol 3
├── VOLUME4_Admin_Console_PRD.md           # PRD Vol 4
├── VOLUME5_AI_Architecture_Technical.md   # PRD Vol 5
├── VOLUME6_GTM_Growth_Monetization.md     # PRD Vol 6
├── docs/                                  ← Engineering knowledge base
│   ├── README.md
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   ├── auth.md
│   ├── frontend.md
│   ├── decision-log.md
│   └── testing.md
├── Ideas/                                 ← Flagship products monorepo
│   ├── CollabKaro/                        # Influencer marketplace
│   ├── BusinessPay/                       # B2B invoice financing
│   ├── DupeScout/                         # AI visual shopping
│   └── Trippy/                            # AI solo travel platform
├── apps/                                  ← Multi-platform applications
│   └── mobile/                            # Mobile app (React Native/Expo)
│       ├── MOBILE_PRD.md
│       ├── MOBILE_ARCHITECTURE.md
│       └── app/
├── src/                                   ← Main web application
├── server.mjs                             ← Node Express API server
└── data/                                  ← Local SQLite DB & backups
```

---

## 9. Working Agreements for AI Assistants

- Prefer small, high-confidence diffs over broad speculative refactors.
- Match surrounding code style and design system tokens.
- Never edit existing decision log entries; append new entries to record choices.
- Run verification checks before declaring completion.
