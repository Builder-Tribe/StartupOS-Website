# Trippy — AI-Powered Solo Travel & Community Platform

Travel solo, never alone. This repo contains the **Phase 1 platform** from the [PRD](SoloTravel_PRD.md) — three applications on one shared backend and canonical database:

| App | URL | Who it's for |
|---|---|---|
| **Consumer** | `/` (port 5173) | Travellers — discovery, matching, community, DIY trips |
| **Partner CRM** | `/partner` | Travel communities & trip hosts — create and publish group trips |
| **Admin Console** | `/admin` | The Trippy team — platform dashboard, management, RBAC, audit logs |
| **Marketing website** | port 5174 | Public homepage — acquisition for travellers and partners |

## Start here

| If you are… | Read |
|---|---|
| Anyone (human or AI) about to change code | [`AGENTS.md`](AGENTS.md) — the repository constitution |
| A new contributor setting up | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| Looking for architecture / API / DB / auth depth | [`docs/README.md`](docs/README.md) — engineering knowledge base |
| Checking product requirements or scope history | [`SoloTravel_PRD.md`](SoloTravel_PRD.md) (living PRD, versioned changelog) |
| Checking what's done vs pending | [`ROADMAP.md`](ROADMAP.md) |

## GitHub organisation

All Trippy repos live under the **[Nomad-Tribe](https://github.com/Nomad-Tribe)** GitHub organisation, owned by `1997agarwal` (`agarwal.harshit97@gmail.com`). All repos are private.

| Repo | Purpose | Status |
|---|---|---|
| **[Nomad-Tribe/Trippy](https://github.com/Nomad-Tribe/Trippy)** | **Parent monorepo — source of truth for everything** | Active |
| [Nomad-Tribe/trippy-website](https://github.com/Nomad-Tribe/trippy-website) | Marketing website (independent deploy) | Active |
| [Nomad-Tribe/trippy-mobile](https://github.com/Nomad-Tribe/trippy-mobile) | React Native iOS + Android app | Planned |
| [Nomad-Tribe/trippy-data](https://github.com/Nomad-Tribe/trippy-data) | Trip aggregation pipeline (Phase 2 operators) | Planned |
| [Nomad-Tribe/trippy-infra](https://github.com/Nomad-Tribe/trippy-infra) | Cloud deployment, CI/CD, Docker configs | Planned |

**Rule:** `Trippy` (this repo) always contains the full, authoritative codebase. Satellite repos are extracted copies for independent work or deployment — they do not replace this repo as the source of truth.

**Git identity for all commits:** `Harshit Agarwal <agarwal.harshit97@gmail.com>`

## Repo layout

- [`AGENTS.md`](AGENTS.md) / [`CONTRIBUTING.md`](CONTRIBUTING.md) / [`docs/`](docs/README.md) — engineering rules + knowledge base
- [`SoloTravel_PRD.md`](SoloTravel_PRD.md) — full product requirements (living document)
- [`trippy/web/`](trippy/web) — React 18 + Vite + TypeScript SPA (consumer + partner + admin)
- [`trippy/website/`](trippy/website) — static marketing website (Vite, port 5174)
- [`trippy/server/`](trippy/server) — Node.js + Express + TypeScript API
- [`trippy/design/`](trippy/design) — design system specs + Claude Design reference exports
- **DB:** SQLite via Node's built-in `node:sqlite` — zero external services
- **Auth:** Email + password (scrypt) with per-app JWT namespaces; admin sessions revocable

The MVP is intentionally dependency-light so each piece swaps in cleanly later: SQLite → PostgreSQL/Supabase, chat polling → Realtime, rule-based scoring → Claude API, external payment links → Razorpay.

## Run it

Requires Node 22+ (installed locally at `~/.local/node/node-v22.17.0-darwin-arm64` on this machine).

```bash
cd trippy
npm install
npm run dev
```

- Web: http://localhost:5173 (consumer) · http://localhost:5173/partner · http://localhost:5173/admin
- Marketing website: http://localhost:5174
- API: http://localhost:4000/api/health

### Demo logins (seeded)

| App | Email | Password |
|---|---|---|
| Consumer | traveller@trippy.test | Traveller@123 |
| Partner | admin@himalayanwolves.test | Trekking@123 |
| Partner | admin@coastalnomads.test | Beaches@123 |
| Admin (super) | super@trippy.test | Super@123 |
| Admin (founder) | founder@trippy.test | Founder@123 |
| Admin (read-only) | readonly@trippy.test | Readonly@123 |

The database auto-seeds on first run (destinations, hostels, partner orgs + trips, demo travellers, admin roles). To start fresh: `npm run reset-db` — note this wipes local data.

## What's implemented

**Consumer:** profiles + personality scoring, matching engine (±3-day overlap, compatibility scores), travel requests + chat, hostel discovery, search-first Landing → Results, DIY path, Phase 4 Bike & Road Trip Verticals (motorcycle rides & road trip hubs, rider/driver profiles, OpenStreetMap embed, 60s GPS location tracking, waypoint check-ins, emergency SOS alerts, companion matching, road trip carpooling).

**Partner CRM:** self-serve org signup (multi-tenant), sidebar shell with first-run onboarding checklist, trip builder with day-wise itinerary + media + pricing and a section-completion rail, payment-link guidance, draft → validated publish lifecycle, preview-as-consumer (new tab), external payment links, outbound-click analytics.

**Admin Console:** live dashboard (counts, growth, activity, action queues), partner/trip/hostel/traveller management with lifecycle controls, bulk actions (permission-gated, per-row audited), canonical hostel (Property) creation & publishing, RBAC (9 roles, ~45 permissions, server-enforced) with confirmed permission edits, immutable audit logs (action/actor/resource/date filters + audited CSV export), typed-confirmation for high-risk actions (partner offboarding), login/session tracking + revocation, internal notes, global search (⌘K), CSV exports.

**Tests:** `npm test -w server` — consumer auth, partner CRM (org isolation, publish validation), admin console (auth boundary, RBAC, lifecycle audit, secret non-exposure).

Deliberately simulated/deferred for the local MVP: SMS OTP, real ID verification, push notifications, external operator feeds, payment processing (external host pages by design), Claude-powered scoring (rule-based with identical inputs/outputs).

---

*Formerly "TravelTribe" — renamed to Trippy in July 2026. See the PRD changelog for scope history.*
