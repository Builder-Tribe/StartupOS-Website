# Decision Log

> Append-only. Each entry: context → decision → consequences. Never edit or delete old entries —
> add a new entry that supersedes. Add an entry whenever an architectural or product-shaping
> decision is made (or discovered to have been made implicitly).

| # | Date | Decision |
|---|---|---|
| D-001 | Jul 2026 | **Modular monolith over services.** One Express API + one SQLite DB serves consumer, partner, and admin. Separation via auth realms and routers, not processes. *Why:* one engineer must be able to run and reason about everything. *Consequence:* single instance; scaling waits for D-003. |
| D-002 | Jul 2026 | **Node built-in `node:sqlite`, no ORM, hand-written parameterized SQL.** *Why:* zero external services; SQL is the API contract. *Consequence:* `NODE_OPTIONS=--experimental-sqlite` everywhere; additive in-place migrations in `db.ts`. |
| D-003 | Jul 2026 | **Designed upgrade seams instead of premature infrastructure.** SQLite→Postgres, chat polling→realtime, rule-based scoring→Claude API, payment links→Razorpay. Rule-based scoring intentionally keeps Claude-shaped inputs/outputs so it upgrades in place. *Consequence:* never jump a seam as a side effect of a feature. |
| D-004 | Jul 2026 | **Email + password auth; OTP deferred; email verification removed.** OTP was simulated, then product switched to email+password (scrypt). Email verification was built (dev-mode delivery) and **removed by product decision** because it wasn't working. Phone captured at signup, unverified, reserved for future OTP login. *Consequence:* `otps`/`email_verifications` tables are legacy. |
| D-005 | Jul 2026 | **Three isolated JWT realms** (consumer / partner `kind:'partner'` / admin `kind:'admin'`), admin sessions server-tracked and revocable. *Why:* one mechanism, hard walls between surfaces. |
| D-006 | Jul 2026 | **RBAC catalogue lives in the database** (9 roles / ~45 permissions), editable at runtime; SUPER_ADMIN implicit-all; enforcement server-side via `requirePermission`; client `Can`/`usePerms` is UX only. |
| D-007 | Jul 2026 | **Immutable audit logs + risk-proportional UI friction.** Every admin mutation writes `admin_audit_logs` (insert-only); dangerous actions require reason; highest-risk require typed confirmation. Bulk operations fan out client-side per row so each row is authorised and audited individually — no bulk endpoints. |
| D-008 | Jul 2026 | **No payment processing in Phase 1.** Partners paste an external https payment link (Razorpay Pages / Instamojo / Stripe Links); Trippy validates the URL, tracks outbound clicks, never touches money. Server-side validation of the redirect closes the open-redirect hole. |
| D-009 | Jul 2026 | **One React SPA hosts all three apps; no state/fetch libraries; hand-written CSS on Design System v1.0 tokens** (three-layer: primitives→semantics→components). Icons: Phosphor. *Why:* consistency + smallest possible cognitive surface. |
| D-010 | Jul 2026 | **Hostels canonicalized as an Admin-managed Property entity** (created/published from the console), not partner-owned and not scraped. External hostel APIs (Hostelworld etc.) deferred to Phase 2. |
| D-011 | Jul 2026 | **Mobile-web first, native app later as an extension.** Consumer UI adapts ≤760px (bottom nav, sticky book bar) rather than forking. The future mobile app reuses the entire backend — see [mobile-app.md](mobile-app.md). |
| D-012 | Jul 2026 | **npm workspaces locally, yarn on Render.** A collaborator introduced `yarn.lock` + `render.yaml` (yarn build/start). Accepted as-is: yarn.lock is the production lockfile of record; npm remains fine for local dev. Revisit if lockfile drift causes a production/dev dependency mismatch. |
| D-013 | Jul 2026 | **Deployment: single Render service** — Express serves built `web/dist` + API on one origin; SQLite on a persistent disk. Marketing site deploys separately when needed. |
| D-014 | 14 Jul 2026 | **Date-first discovery.** Destination became free-text + optional ("Anywhere" mode); results are genuinely date-filtered (±3-day PRD tolerance, server-side `from`/`to` on `/discover/trips`); unknown destinations get a graceful fallback instead of a dead end. Supersedes the dropdown-based search-first Design A flow from v3.0. |
| D-015 | 14 Jul 2026 | **Repository lives in the Nomad-Tribe GitHub org** (moved from the personal repo; old URL redirects). The local remote repoint is pending explicit owner confirmation — do not change `origin` without it. |
| D-016 | 16 Jul 2026 | **Engineering Knowledge Base + AGENTS.md covenant.** The repo is the onboarding guide: `AGENTS.md` is the constitution for humans and AI assistants; `docs/` holds the single-source-of-truth deep dives; every behaviour-changing commit updates the affected docs, the PRD, and the checklist. |
| D-017 | 6 Aug 2026 | **Phase 4 Bike & Road Trip Verticals built on existing hub machinery.** Adventure routes link directly to DIY `groups` hubs (`group_id`). Real-time location uses 60-second polling (`navigator.geolocation`), SOS uses in-app broadcast + `tel:` emergency call links, and road trip carpooling matches open seats & auto-joins approved travellers to the route's hub. |

## Lessons worth keeping (not decisions, but paid for)

- **Status tracking:** [`ROADMAP.md`](../ROADMAP.md) is the live markdown status tracker for all phases and features (superseding `Trippy_Project_Checklist.xlsx`).
- **Tied seed timestamps** make "expect row on page 1" tests flaky — filter or raise `pageSize`.
- **Timezone off-by-one:** anchor date-only math at noon (`T12:00:00`), not midnight, for IST-like
  zones (fixed in `Results.tsx` `shiftDays`).
- **`npmjs.org` may be blocked** on the founder's machine — use `--registry=https://registry.npmmirror.com`.
