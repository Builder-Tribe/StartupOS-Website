# AGENTS.md — How to work in this repository

> **Read this first.** This file is the constitution of the Trippy repository. It applies to every
> engineer and every AI coding assistant (Claude Code, Cursor, Copilot, Codex, Windsurf, Emergent,
> or anything that comes later). If a tool only reads one file, it should be this one.

---

## 1. What Trippy is

Trippy is an AI-powered solo-travel platform: travellers find group trips or build their own,
match with compatible travellers on overlapping dates, and book hosted trips directly from travel
communities. **This is a working product, not an MVP scaffold.** Four surfaces run on one shared
backend and one canonical SQLite database:

| Surface | Path / port | Code | Users |
|---|---|---|---|
| Consumer app | `/` (dev port 5173) | `trippy/web/src/` (root + `pages/`) | Travellers |
| Partner CRM | `/partner` (same SPA) | `trippy/web/src/partner/` | Travel communities & trip hosts |
| Admin Console | `/admin` (same SPA) | `trippy/web/src/admin/` | Internal Trippy team |
| Marketing website | dev port 5174 | `trippy/website/` | Public visitors |
| API server | port 4000 | `trippy/server/` | All of the above |

- **Vision & requirements:** [`SoloTravel_PRD.md`](SoloTravel_PRD.md) (living document, versioned changelog).
- **Implementation status:** [`ROADMAP.md`](ROADMAP.md) (live done/pending tracker).
- **Deep documentation:** [`docs/`](docs/README.md) (architecture, API, database, auth, frontend, testing, deployment, decisions, mobile scope).
- **Rule of interpretation:** the *implementation is the current truth*; the PRD is the intended
  vision. Where they differ, the differences are catalogued in [`docs/roadmap.md`](docs/roadmap.md) —
  document divergences, never "fix" code to match the PRD without an explicit request.

## 2. The stack (do not replace any of this)

- **Backend:** Node 22 + Express + TypeScript, executed with `tsx`. SQLite via Node's built-in
  `node:sqlite` (`NODE_OPTIONS=--experimental-sqlite` — already set in every npm script). No ORM;
  hand-written parameterized SQL through `db.prepare(...)`.
- **Frontend:** React 18 + Vite + TypeScript. One SPA serves consumer + partner + admin. React
  Router v6. **No state library** — state is React context + hooks + fetch; keep it that way.
- **Styling:** hand-written CSS with the Design System v1.0 token architecture in
  `trippy/web/src/styles.css` (`:root` custom properties) and `trippy/web/src/admin/admin.css`.
  No Tailwind, no CSS-in-JS, no component framework. Icons: Phosphor (`ph-bold` default, `ph-fill` for status).
- **Monorepo:** npm workspaces (`server`, `web`, `website`). The Render deployment uses yarn
  (`yarn.lock` is the committed lockfile) — see [`docs/deployment.md`](docs/deployment.md).
- **Auth:** email + password (scrypt, in `server/src/lib/password.ts`), three separate JWT realms
  (consumer / partner / admin). See [`docs/auth.md`](docs/auth.md).

Everything above is a deliberate decision with a migration path already designed
(SQLite → Postgres, polling → realtime, rule-based scoring → Claude API, payment links → Razorpay).
**Do not introduce those replacements ahead of schedule** — see the Decision Log
([`docs/decision-log.md`](docs/decision-log.md)) before proposing stack changes.

## 3. Non-negotiable rules

1. **Analyze before coding.** Read the relevant route/page/lib files and the matching doc in
   `docs/` before writing anything. The codebase already solves most cross-cutting problems
   (auth, pagination, audit, dialogs, toasts, cards) — find the existing solution first.
2. **Reuse before generating.** The reuse catalogue in [`docs/frontend.md`](docs/frontend.md) and
   [`docs/api.md`](docs/api.md) lists what already exists. Creating a parallel implementation of
   an existing helper/component/endpoint is a defect, even if it works.
3. **Modify, don't rewrite.** Extend existing files and patterns. Never regenerate a working file
   from scratch when an edit will do. Never rewrite the backend, the auth system, the design
   tokens, or the DataTable to "clean them up" without an explicit instruction.
4. **Preserve the architecture.** New consumer features go in `web/src/pages/` + a route in
   `App.tsx`; partner features in `web/src/partner/`; admin features in `web/src/admin/pages/`
   registered in `AdminApp.tsx`; API endpoints in the matching `server/src/routes/*.ts` router.
   Shared logic goes in `server/src/lib/` or `web/src/components.tsx` — not copied between files.
5. **Server-side enforcement is the security boundary.** Client-side permission checks (`Can`,
   `usePerms`) are UX only. Every admin endpoint must use `requirePermission(...)`; every partner
   endpoint must scope queries by `org_id`; every consumer endpoint must use `requireAuth`.
   Never expose `password_hash`, `password_salt`, tokens, or OTP secrets in any API response.
6. **Audit everything administrative.** Any admin action that changes state must call
   `writeAudit(...)`. Audit logs are immutable — no update/delete paths, ever.
7. **Dangerous actions need friction.** Destructive/irreversible UI actions use `ConfirmDialog`
   (with `requireReason` when the server expects a reason) or `HighRiskDialog` (typed confirmation)
   from `web/src/admin/ui.tsx`. Follow the existing risk-proportional pattern.
8. **Migrations are additive.** Schema changes go in `server/src/db.ts` as
   `CREATE TABLE IF NOT EXISTS` plus in-place `ALTER TABLE` upgrade guards (see the existing
   pattern near the bottom of `db.ts`). Never write a migration that drops or rewrites user data.
   Never run `reset-db` or delete `server/data/` without explicit user consent — the dev DB holds
   real accounts.
9. **Work incrementally and non-breaking.** Ship features so existing flows keep working
   (the mobile bottom nav, sidebar shells, and date-first search were all added this way).
   Feature-gate with CSS breakpoints or additive props, not forks of pages.
10. **Verify before declaring done.** `npx tsc --noEmit` in `web/` and `server/`, `npm test -w server`
    (28+ tests must pass), and exercise the changed flow in a browser when it has UI.

## 4. Documentation covenant

**Every change that alters scope, behaviour, API, schema, or architecture must update the
documentation in the same change set.** Specifically:

| You changed… | You must update… |
|---|---|
| Product scope / features | `SoloTravel_PRD.md` (changelog row + affected sections) **and** `ROADMAP.md` (status rows) |
| API endpoints | [`docs/api.md`](docs/api.md) |
| Database schema | [`docs/database.md`](docs/database.md) |
| Auth / permissions | [`docs/auth.md`](docs/auth.md) |
| Shared components / utilities | [`docs/frontend.md`](docs/frontend.md) reuse catalogue |
| Architecture / stack decisions | [`docs/decision-log.md`](docs/decision-log.md) (new entry, never edit old ones) |
| Anything user-visible | root `README.md` if the "What's implemented" summary is affected |

Commit docs together with the code they describe. A PR that changes behaviour without touching
docs is incomplete.

## 5. Never do (without an explicit human instruction)

- Never regenerate or restructure working systems (backend, auth, RBAC, DataTable, design tokens).
- Never create a second implementation of something that exists (a new fetch wrapper, a new table
  component, a new dialog, a new date formatter, a new CSS palette).
- Never add dependencies casually — the stack is deliberately dependency-light; every new package
  needs a reason the standard library or existing code can't satisfy.
- Never change the git remote (see §8 for the canonical URL) or commit to a satellite repo without back-porting to Trippy.
- Never commit secrets, `.env` files, or the SQLite database.
- Never weaken the org-isolation (`org_id` scoping) in partner routes or permission checks in admin routes.
- Never delete or mutate audit-log rows or the tables they live in.
- Never "upgrade" SQLite→Postgres, polling→websockets, or rule-based scoring→LLM calls as a side
  effect of another task.

## 6. How to add a feature (the golden path)

1. **Locate the surface** (consumer / partner / admin / website) and read its existing pages to
   absorb conventions (CSS class prefixes: consumer = unprefixed, partner = `crm-`, admin = `a-`).
2. **Design the API first** in the matching router; follow existing response shapes
   (`listResp` pagination for admin lists; camelCase JSON everywhere; shaped objects from `lib/`).
3. **Reuse the data layer**: `db.prepare` with parameterized SQL; JSON columns via the `j`/`pj`
   helpers; ids via `uid()`.
4. **Build UI from the reuse catalogue** before writing new markup; add new CSS at the end of the
   relevant stylesheet using existing tokens (`var(--brand)` etc.), never hard-coded hex.
5. **Add/extend tests** in `server/test/` for API behaviour (auth boundaries, org isolation,
   permission gates are the highest-value assertions).
6. **Update docs** per §4. **Verify** per §3.10. Commit with a descriptive message.

## 7. Repository map

```
Travel App/                    ← git root → Nomad-Tribe/Trippy (parent monorepo)
├── AGENTS.md                  ← you are here (the constitution)
├── CLAUDE.md                  ← thin pointer for Claude Code
├── CONTRIBUTING.md            ← human workflow: setup, branches, review, docs policy
├── README.md                  ← product summary, quickstart, demo logins
├── SoloTravel_PRD.md          ← living PRD (vision + versioned changelog)
├── ROADMAP.md                  ← live implementation status tracker
├── docs/                      ← engineering knowledge base (start at docs/README.md)
└── trippy/
    ├── server/                ← Express API + SQLite + seed + tests
    │   └── src/{db,index,seed}.ts, lib/, routes/
    ├── web/                   ← React SPA: consumer (pages/), partner/, admin/
    ├── website/               ← static marketing site (also mirrored in Nomad-Tribe/trippy-website)
    ├── design/                ← design system specs + Claude Design exports + audit status docs
    └── render.yaml            ← production deployment blueprint (Render)
```

## 8. GitHub organisation structure

All repos live under **[Nomad-Tribe](https://github.com/Nomad-Tribe)** (org owner: `1997agarwal`, `agarwal.harshit97@gmail.com`). All repos are private.

| Repo | Role |
|---|---|
| **Nomad-Tribe/Trippy** | **Parent monorepo — the single source of truth.** Contains every surface: server, consumer web, partner CRM, admin console, marketing website, design system, and all docs. |
| Nomad-Tribe/trippy-website | Marketing website extracted for independent deployment. Mirrors `trippy/website/`. |
| Nomad-Tribe/trippy-mobile | React Native iOS + Android app (planned — not started). |
| Nomad-Tribe/trippy-data | Trip aggregation pipeline for Phase 2 external operator feeds (planned). |
| Nomad-Tribe/trippy-infra | Cloud deployment configs, CI/CD, Docker (planned). |

**Satellite repo rule:** `Nomad-Tribe/Trippy` always contains the authoritative code. Satellite repos are created when a segment needs independent deployment or a separate team. Whenever changes are made to `trippy/website/`, push the subtree to the satellite repo (`git subtree push --prefix trippy/website https://github.com/Nomad-Tribe/trippy-website.git main`).

**Git identity:** all commits must use `Harshit Agarwal <agarwal.harshit97@gmail.com>`. The local repo config enforces this — do not override it.

**Remote:** `https://github.com/1997agarwal/Trippy.git` (GitHub redirects to `Nomad-Tribe/Trippy` — same repo, different URL). Do not change this remote.

## 9. Working agreements for AI assistants

## 10. Working agreements for AI assistants

- Prefer **small diffs with high confidence** over broad speculative refactors.
- When a task is ambiguous, state your interpretation and proceed on the smallest reasonable
  scope; list bigger options for the human to choose.
- When you find a bug outside your task, report it — don't silently fix unrelated code.
- When implementation and documentation disagree, trust the code, then fix the documentation.
- Match the surrounding code's style exactly: compact expressions, minimal comments (only for
  non-obvious constraints), existing naming conventions (`snake_case` DB columns, `camelCase` JSON/TS).
- Leave the repository better documented than you found it — but never duplicate content across
  documents; link to the single source of truth instead.
