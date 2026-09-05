# Traveller Mobile Application — Scope & Reuse Contract

> **Read this before writing any mobile code.** The mobile app is an **extension of the existing
> platform, not a new project.** Any engineer or AI agent that starts a mobile codebase by
> re-implementing backend, auth, business logic, or design decisions is doing it wrong.

## What the mobile app is

A native (or React Native — see Open decisions) client for the **consumer** experience only:
discovery, matching, connections, chat, hostels, DIY trips, profile, booking hand-off. Partner CRM
and Admin Console stay web-only.

## The reuse contract

### MUST reuse as-is (never rebuild)

| Layer | What exists | Where |
|---|---|---|
| Backend & APIs | The entire Express API — every consumer flow already has endpoints | [`docs/api.md`](api.md); `trippy/server/src/routes/` |
| Database | The canonical schema — mobile adds **zero** new storage of its own | [`docs/database.md`](database.md) |
| Auth | Email+password login/signup, consumer JWT (`tt_token` semantics), optional phone field | [`docs/auth.md`](auth.md); `/api/auth/*` |
| Business logic | Matching + compatibility scoring, DIY cost model, publish/booking rules, org isolation — all server-side already | `server/src/lib/` |
| Validation | Server-side validation is the source of truth; the client mirrors it for UX only | route files |
| Design tokens | Colors, type ramp, spacing, radii, motion — port `tokens.json` to the mobile styling system, don't invent a palette | [`trippy/design/design-system/tokens.json`](../trippy/design/design-system/tokens.json) |
| Product behaviour | Score-with-explanation rule, ±3-day matching tolerance, chat-unlock-on-mutual-accept, report/block within 2 taps, external payment hand-off | PRD + [`frontend.md`](frontend.md) consumer patterns |

### CAN reuse with adaptation

- **Consumer IA and screens** — the mobile-web experience (bottom nav tabs: Discover / Matches /
  + / Chats / Profile; onboarding wizard + personality reveal; sticky book bar) is the blueprint;
  translate, don't redesign. Mobile design references live in `trippy/design/mobile-app/`.
- **API client conventions** — mirror `web/src/api.ts` (thin fetch wrapper, ApiError, token
  storage swapped for secure storage).
- **Copy/i18n strings** — lift from the web pages.

### NEEDS building (mobile-only)

- The native client itself: navigation shell, screens, secure token storage, deep links
  (`/trip/:slug` must open in-app), OS share sheets.
- **Push notifications** — the trigger points exist (new message, connection request/accept);
  needs a device-token table + send pipeline (this is the one legitimate backend addition —
  design it additively per [`database.md`](database.md) migration rules).
- Offline tolerance for chat/itinerary reads (client cache only — server stays the truth).
- App-store packaging, versioning, crash reporting.

### MUST NOT do

- No new backend, no BFF, no GraphQL layer, no second database, no separate auth system.
- No forked business logic ("mobile matching algorithm") — if mobile needs different data,
  extend the existing endpoint with a param, in the same router, documented in [`api.md`](api.md).
- No new design language — tokens are law.
- No breaking API changes for web: mobile consumes the same API version; extensions must be additive.

## Open decisions (record in the decision log when made)

1. **Framework** — React Native/Expo is the natural fit (React 18 skills + component patterns
   transfer; PRD tech section anticipated Expo push notifications). Native Swift/Kotlin only if a
   hard requirement appears.
2. **Realtime chat** — mobile may justify pulling the polling→realtime seam forward (D-003).
3. **Guest browsing** — decide the auth gate question (web open item) before mobile onboarding is
   designed, so both clients behave the same.

## Definition of ready

Mobile work should not start until: guest-browsing decision made, push-notification schema
designed, and the framework decision logged. When it starts, this document becomes the primary
reference and must be kept current like every other doc (AGENTS.md §4).
