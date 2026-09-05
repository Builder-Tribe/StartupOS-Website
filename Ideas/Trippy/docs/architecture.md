# System Architecture

> Truth source: `trippy/server/src/index.ts` (composition root), `trippy/web/src/main.tsx` +
> `App.tsx` (SPA shell), `trippy/render.yaml` (production shape). If this document and the code
> disagree, the code wins — then fix this document.

## The one-paragraph version

Trippy is a **modular monolith**: one Express API (`trippy/server`) over one SQLite database,
serving three logically separate frontends that ship as **one React SPA** (`trippy/web`) plus a
static marketing site (`trippy/website`). Separation between the consumer app, Partner CRM, and
Admin Console is enforced at the **auth layer** (three JWT realms) and the **route layer**
(separate routers with separate middleware), not by separate services. This is deliberate: one
engineer can run and reason about the whole platform, and each seam (DB, realtime, payments, AI)
has a designed upgrade path.

## Runtime topology

```
                       ┌──────────────────────────────────────────┐
 Browser ──────────────▶  React SPA (Vite dev :5173 / built dist)  │
   /            consumer│   ├─ /          → App.tsx  (consumer)    │
   /partner      partner│   ├─ /partner   → PartnerApp.tsx         │
   /admin          admin│   └─ /admin     → AdminApp.tsx           │
                       └───────────────┬──────────────────────────┘
 Browser ──────────────▶ Marketing site (Vite :5174, static)       │ /api/* (fetch, Bearer JWT)
                       ┌───────────────▼──────────────────────────┐
                       │  Express API (:4000)  createApp()         │
                       │   /api/auth      consumer signup/login    │
                       │   /api/admin     admin console (RBAC)     │
                       │   /api/partner   partner CRM (org-scoped) │
                       │   /api/*         social, chats, hostels,  │
                       │                  diy, public trips        │
                       │   static: serves web/dist in production   │
                       └───────────────┬──────────────────────────┘
                       ┌───────────────▼──────────────────────────┐
                       │  SQLite (node:sqlite) — one canonical DB  │
                       │  dev: server/data/trippy.db               │
                       │  prod: /var/data/trippy.db (Render disk)  │
                       └──────────────────────────────────────────┘
```

- **Dev:** three processes via `npm run dev` (concurrently: server, web, website). Vite proxies
  are not used — the web app calls `http://localhost:4000` style relative `/api` paths
  (see `web/vite.config.ts`).
- **Prod (Render):** a single service. `yarn workspace web build` produces `web/dist`; the server
  serves it statically with an SPA fallback, so API + app share one origin and port.

## The monorepo

npm workspaces, three packages:

| Package | Role | Key entry points |
|---|---|---|
| `server` | Express + TypeScript API, DB, seed, tests | `src/index.ts`, `src/db.ts`, `src/seed.ts` |
| `web` | React SPA (all three apps) | `src/main.tsx`, `src/App.tsx`, `src/partner/PartnerApp.tsx`, `src/admin/AdminApp.tsx` |
| `website` | Static marketing site | `index.html`, `src/styles.css` |

## Backend layering

```
routes/  ── HTTP layer: request parsing, auth middleware, response shaping
   auth.ts        consumer signup/login (public)
   social.ts      profile, trips, matching, connections, report/block (requireAuth)
   chats.ts       1:1 + group messaging (requireAuth, polling)
   hostels.ts     hostel discovery + stays (requireAuth)
   diy.ts         destinations, group trips, DIY compare, groups + itineraries (requireAuth)
   publicTrips.ts hosted-trip discovery + booking click tracking (public, optional token)
   partner.ts     Partner CRM (partner JWT + org scoping on every query)
   admin.ts       Admin Console (admin JWT + requirePermission per endpoint + audit)
lib/     ── domain layer: shared logic, no Express types leaking in
   password.ts    scrypt hash/verify
   auth.ts        consumer JWT middleware
   partnerAuth.ts partner JWT + org context
   adminAuth.ts   admin JWT + server-tracked revocable sessions
   permissions.ts RBAC catalogue: roles, permissions, default grants
   adminOps.ts    writeAudit, status transitions, shared admin helpers
   matching.ts    compatibility scoring + travel personality (rule-based, Claude-shaped I/O)
   trips.ts       partner-trip shaping, publish validation, public card shape
   hostels.ts     hostel shaping
   shape.ts       user shaping (public vs own profile)
db.ts    ── data layer: schema DDL, additive migrations, uid/j/pj helpers
seed.ts  ── idempotent demo data (destinations, hostels, users, partners, admins)
```

**Conventions:** DB columns `snake_case`; API JSON `camelCase` (conversion happens in `lib/*`
shape functions); ids are `uid()` TEXT; list-ish data is JSON-encoded TEXT columns via `j`/`pj`.

## Frontend structure

One SPA, three mount branches chosen by path in `main.tsx`/`App.tsx`:

- **Consumer** (`web/src/pages/*.tsx`, routes in `App.tsx`): auth-gated behind `Login`/`Onboarding`
  (guest browsing is a known open item; `/trip/:slug` is already public). Mobile-web first —
  bottom nav ≤760px (`BottomNav.tsx`), desktop topnav unchanged.
- **Partner CRM** (`web/src/partner/`): topbar + sidebar shell, org-scoped API (`partnerApi.ts`).
- **Admin Console** (`web/src/admin/`): sidebar shell, RBAC-aware UI (`usePerms`/`Can`),
  URL-persisted list state, shared `ui.tsx` kit (see [frontend.md](frontend.md)).

**State management:** React context for auth/session (`useAuth`, `usePartner`, `usePerms`),
component-local `useState`/`useEffect` + fetch for data. URL search params hold list/filter state
in admin. **There is no Redux/Zustand/React Query — do not add one.**

## Cross-cutting concerns

| Concern | Where | Notes |
|---|---|---|
| AuthN/AuthZ | `lib/{auth,partnerAuth,adminAuth,permissions}.ts` | Three JWT realms; details in [auth.md](auth.md) |
| Audit | `lib/adminOps.ts` `writeAudit` | Immutable `admin_audit_logs`; every admin mutation |
| Org isolation | every query in `routes/partner.ts` | `WHERE org_id = ?` — never join across orgs |
| Pagination/filtering | `routes/admin.ts` `paginate`/`listResp`/`sortClause` | Server-side; DataTable consumes |
| Validation | inline per route + `lib/trips.ts` publish validation | No validation library |
| Error handling | terminal middleware in `index.ts` | Routes return `{ error }` / `{ errors: [] }` |
| Seeding | `seed.ts` `seedIfEmpty()` | Idempotent, guarded per domain; runs on boot |

## Designed upgrade seams (don't jump early)

| Today | Later | Seam |
|---|---|---|
| SQLite (`node:sqlite`) | PostgreSQL / Supabase | All SQL behind `db.prepare`; schema in one file |
| Chat polling | Realtime (websockets/Supabase) | `chats.ts` routes + `ChatThread` polling loop |
| Rule-based matching/compare | Claude API | `lib/matching.ts` + `/compare` keep Claude-shaped inputs/outputs |
| External payment links | Razorpay integration | `publicTrips.ts` track-click → payment URL redirect |
| Simulated ID/phone verification | Real KYC / SMS OTP | `verify-id` endpoint, `otps` table, optional phone field |

See [decision-log.md](decision-log.md) for why each of these is the way it is.
