# Trippy — Roadmap

> Find your people. Own your adventure.

## Legend

| Status | Meaning |
|--------|---------|
| ✅ Done | Implemented and working |
| 🔄 In Progress | Currently being built |
| 🔲 Planned | Scoped, not started |
| ❌ Blocked | Waiting on dependency |

---

## Non-Negotiables *(applies to all phases)*

- **User safety first** — real-time location sharing (Phase 4) requires explicit opt-in; never expose location without consent
- **Traveler trust is the product** — never weaken verification badges, ID upload flows, or community trust scores
- **AI scores must be honest** — compatibility scores are never inflated; users must be able to trust match quality
- **Travel plans are private** — destinations and dates are sensitive; never expose user plans to third parties without consent
- **Dev SQLite holds real user accounts** — never reset or delete `trips.db` without explicit confirmation
- **Git remote is fixed** — always push to `https://github.com/1997agarwal/Trippy.git`

---

## Phase 1: Community & Matchmaking

> Solo traveler finds companions, connects via chat, discovers hostels, and plans a DIY trip. This is the core loop the entire product is built on.

### 1.1 — User Onboarding & Profile

| # | Feature / Task | Status | Notes |
|---|----------------|--------|-------|
| 1.1.1 | Sign-up & login (email + password) | ✅ Done | |
| 1.1.1a | Forgot password — direct reset (no email) | ✅ Done | Inline form: email + new password; no token or email required. Fallback until email lib is wired. |
| 1.1.1b | Email lib integration (Resend / SMTP) | 🔲 Planned | Add `RESEND_API_KEY` + `email.ts` (built, dormant); wire into forgot-password for token-based reset flow |
| 1.1.1c | Forgot password — token-based email flow | 🔲 Planned | Secure flow: generate reset token → send link via email → `/reset-password?token=` page. Requires 1.1.1b. |
| 1.1.2 | Phone OTP verification | 🔄 In Progress | Phone captured unverified; OTP deferred (needs T.9) |
| 1.1.3 | Government ID upload for trust badge | 🔄 In Progress | Doc type + last-4 submitted; image upload needs T.12 |
| 1.1.4 | Full travel profile (name, age, gender, city, travel style, interests, budget, languages) | ✅ Done | Languages chip selector added v3.22 |
| 1.1.5 | Upcoming travel plans (destination + dates) | ✅ Done | |
| 1.1.6 | Past trips (self-reported) | ✅ Done | "Been to" chips on public profiles |
| 1.1.7 | Emergency contact field | ✅ Done | Private-only; never shown publicly |
| 1.1.8 | Travel Personality Score (Explorer, Thrill Chaser, etc.) | 🔄 In Progress | Computed from travel_style+interests; quiz-style multi-Q flow pending |
| 1.1.9 | Social media handles (Instagram / LinkedIn / YouTube) | ✅ Done | Linked on public profile |
| 1.1.10 | Profile editable at any time | ✅ Done | |

### 1.2 — Traveler Matching Engine

| # | Feature / Task | Status | Notes |
|---|----------------|--------|-------|
| 1.2.1 | Match travelers by same destination + overlapping dates | ✅ Done | |
| 1.2.2 | AI compatibility score (0–100) | 🔄 In Progress | Rule-based; Claude API swap pending |
| 1.2.3 | Travel request (connection request) flow | ✅ Done | Withdraw outgoing pending supported (v3.22) |
| 1.2.4 | Mutual match → chat unlocked | ✅ Done | |
| 1.2.5 | Demo users auto-accept requests | ✅ Done | |
| 1.2.6 | Profile cards with compatibility score display | ✅ Done | |
| 1.2.7 | Secondary filters (age range, gender, budget, verified-only) | ✅ Done | Server-side on /matches endpoint |
| 1.2.8 | Report & block functionality | ✅ Done | 2-tap sheet on traveller profiles |
| 1.2.9 | Verification badge on profiles | ✅ Done | ID-verified seal via admin review queue |
| 1.2.10 | Community trust score from past travel companions | ✅ Done | Recomputed from real vouches only |

### 1.3 — Hostel Discovery & Integration

| # | Feature / Task | Status | Notes |
|---|----------------|--------|-------|
| 1.3.1 | Hostel listing page per destination | ✅ Done | |
| 1.3.2 | Hostel detail page (amenities, vibe tags, reviews) | ✅ Done | |
| 1.3.3 | "X Trippy members staying here" badge | ✅ Done | |
| 1.3.4 | Log hostel stay (opt-in visibility) | ✅ Done | |
| 1.3.4a | User-submitted stay privacy (only visible to creator) | ✅ Done | `source='user_submitted'` rows scoped by `created_by_user_id`; other travellers never see them |
| 1.3.4b | Edit own user-submitted stay | ✅ Done | `PUT /hostels/:id` — ownership enforced server-side (403 if not creator) |
| 1.3.4c | Delete own user-submitted stay | ✅ Done | `DELETE /hostels/:id` — soft-delete; 403 if not creator |
| 1.3.5 | Hostel booking redirect (affiliate / direct) | ✅ Done | |
| 1.3.6 | Direct hostel booking with commission tracking | 🔲 Planned | |
| 1.3.7 | Hostelworld / Zostel / GoStops API integration | 🔲 Planned | |
| 1.3.8 | Featured / partner hostel listings (premium placement) | ✅ Done | ★ ribbon + featured-first ordering (v3.9) |
| 1.3.9 | Airbnb & hotel options in DIY stay step | ✅ Done | Dynamic placeholder cards injected server-side for any destination; `propertyType` enum: hostel / airbnb / hotel / homestay |
| 1.3.10 | Traveller can add any stay type (hostel/airbnb/hotel/homestay) | ✅ Done | Add-stay modal with property type selector; stored as `user_submitted` hostel row |

### 1.4 — In-App Messaging & Group Chats

| # | Feature / Task | Status | Notes |
|---|----------------|--------|-------|
| 1.4.1 | 1:1 chat between matched travelers | ✅ Done | Relative timestamps on chat list (v3.22) |
| 1.4.2 | Group chat for ad-hoc travel groups | ✅ Done | |
| 1.4.3 | Image sharing in chat | ❌ Blocked | Blocked on T.12 (file storage) |
| 1.4.4 | Location pin sharing in chat | ✅ Done | Geolocation or typed place → Open-in-Maps card |
| 1.4.5 | Polls in chat (group decisions) | ✅ Done | Interactive poll messages via group hub |
| 1.4.6 | Pinned messages | ✅ Done | |
| 1.4.7 | Push notifications for messages | ❌ Blocked | Blocked on T.10 (FCM / Expo) |
| 1.4.8 | Real-time messaging (Supabase Realtime) | 🔄 In Progress | Simulated; Supabase integration pending (T.8) |

### 1.5 — Build Your Own Trip (DIY Path)

| # | Feature / Task | Status | Notes |
|---|----------------|--------|-------|
| 1.5.1 | DIY trip stepper (hostel → match → group → itinerary → travel) | ✅ Done | DestPicker entry when no destination set (v3.22) |
| 1.5.2 | Start a DIY trip from any destination page | ✅ Done | |
| 1.5.3 | Self-organized group creation | ✅ Done | |
| 1.5.4 | Shared, editable itinerary for DIY group | ✅ Done | Any member edits stops via PUT (v3.9) |
| 1.5.5 | AI itinerary suggestions (optional, not forced) | 🔄 In Progress | Rule-based with budget-aware ordering; Claude API swap pending |
| 1.5.6 | Switch between DIY and "Join a Group Trip" at any point | ✅ Done | |
| 1.5.7 | Self-organized group gets same in-trip tools as operator group | ✅ Done | Chat, itinerary, polls, invites, announcements (since v3.7) |
| 1.5.8 | Dual persona DIY flow: "I have no plans yet" vs "I've already booked" | ✅ Done | Both flows shown in stepper; second persona logs stay + creates hub without hostel-picking pressure |
| 1.5.9 | Show how many Trippy members stay at each hostel (vibe discovery) | ✅ Done | memberCount badge on hostel cards in DIY stepper; core social-proof mechanic for hostel selection |

### 1.6 — DIY vs Group Trip Budget Comparison

| # | Feature / Task | Status | Notes |
|---|----------------|--------|-------|
| 1.6.1 | Side-by-side DIY vs group trip comparison | ✅ Done | |
| 1.6.2 | DIY cost breakdown by category (stay, transport, food, activities) | ✅ Done | |
| 1.6.3 | Plain-language trade-off summary | 🔄 In Progress | Rule-based; AI narrative pending |
| 1.6.4 | Group trip side degrades gracefully if operator data unavailable | ✅ Done | |
| 1.6.5 | User can move directly into action from either side | ✅ Done | |

---

## Design & UX Revamps *(v3.1–v3.4)*

> Design system, marketing website, and P0 UX audit fixes across all three apps.

| # | Feature / Task | Status | Notes |
|---|----------------|--------|-------|
| D.1 | Design System Foundation v1.0 (tokens across all three apps) | ✅ Done | Specs in trippy/design/design-system/ |
| D.2 | Marketing website (static Vite site, port 5174) | ✅ Done | trippy/website/ |
| D.3 | Phosphor icon migration | 🔄 In Progress | Brand mark, admin nav, badges done; content emoji remain |
| D.4 | Consumer UX audit P0 fixes (bottom nav, AI score explanations, chat-locked profiles, onboarding reveal) | ✅ Done | v3.3 — status in trippy/design/consumer-app/ |
| D.5 | Guest browsing (remove discovery auth gate) | ✅ Done | Discovery fully open to guests; member profiles stay members-only (v3.10) |
| D.6 | Partner CRM UX audit P0 fixes (sidebar, checklist, editor rail, payment guide, preview) | ✅ Done | v3.4 — status in trippy/design/partner-crm/ |
| D.7 | Admin Console UX audit P0 fixes (bulk, audit filters/export, confirmations, ⌘K) | ✅ Done | v3.4 — status in trippy/design/admin-console/ |
| D.8 | Date-first discovery: free-text destination search, optional destination ("Anywhere" mode), date-filtered results | ✅ Done | v3.5, v3.22 — past/ended trips filtered; hosted + operator trips unified |
| D.9 | Graceful fallback for uncovered destinations | ✅ Done | Empty state differentiates "no trips on these dates" vs "no trips at all" (v3.22) |

---

## Partner CRM / Host Portal *(Bonus — Part of Phase 1)*

> Trip operators self-serve their listings, manage bookings, view analytics, and communicate with travelers.

| # | Feature / Task | Status | Notes |
|---|----------------|--------|-------|
| P.1 | Partner sign-up / login (email + password, separate auth) | ✅ Done | |
| P.2 | Multi-tenant org scoping | ✅ Done | |
| P.3 | Trip creation & editing (TripEditor) | ✅ Done | |
| P.4 | Trip itinerary day builder | ✅ Done | |
| P.5 | Trip media upload | ✅ Done | |
| P.6 | Trip tags & categories | ✅ Done | |
| P.7 | Publish / unpublish trips | ✅ Done | |
| P.8 | Trip preview page | ✅ Done | |
| P.9 | Trip outbound click tracking | ✅ Done | |
| P.10 | Partner dashboard | ✅ Done | |
| P.11 | Real partner communities seeded with authentic scraped trips | ✅ Done | 6 operators: Adventure Buddha, Tripper Trails, Plan the Unplanned, Zostel Trips, WanderOn, Tripbae — all with `@partner.trippy` login credentials |
| P.12 | Operator analytics (leads, views, bookings) | 🔄 In Progress | Bookings + outbound clicks done; views/leads not yet instrumented |
| P.13 | Sidebar shell (My trips + coming-soon modules) | ✅ Done | UX audit P0, v3.4 |
| P.14 | First-run welcome checklist on dashboard | ✅ Done | UX audit P0, v3.4 |
| P.15 | Trip editor section checklist rail + completion % | ✅ Done | UX audit P0, v3.4 |
| P.16 | Payment-link guidance card | ✅ Done | UX audit P0, v3.4 |
| P.17 | Preview in new tab + "Edit this trip" button | ✅ Done | UX audit P0, v3.4 |
| P.18 | Trip star ratings + reviews visible in Partner CRM | ✅ Done | avgRating + reviewCount columns; read-only ReviewsPanel in TripEditor (v3.17) |

---

## Admin Console *(Bonus — Part of Phase 1)*

> Trust & safety, user management, trip moderation, audit logs, and platform governance.

| # | Feature / Task | Status | Notes |
|---|----------------|--------|-------|
| A.1 | Admin login (separate auth, email + password) | ✅ Done | |
| A.2 | RBAC (9 roles, ~45 permissions, SUPER_ADMIN) | ✅ Done | |
| A.3 | Traveller management (list, detail, actions) | ✅ Done | |
| A.4 | Partner org management | ✅ Done | |
| A.5 | Trip moderation (list, detail, approve/reject) | ✅ Done | |
| A.6 | Hostel management (lifecycle, featured, city, slug) | ✅ Done | |
| A.7 | Audit logs (immutable) | ✅ Done | |
| A.8 | Internal notes | ✅ Done | |
| A.9 | Session revocation | ✅ Done | |
| A.10 | Admin user management & role assignment | ✅ Done | |
| A.11 | Demo admin logins seeded (8 roles) | ✅ Done | |
| A.12 | Test suite (28 total: 16 admin + 8 partner + others) | ✅ Done | |
| A.13 | Bulk actions on Trips / Partners / Travellers (permission-gated, per-row audited) | ✅ Done | UX audit P0, v3.4 |
| A.14 | Audit log filters (action, admin, resource, date range) + CSV export | ✅ Done | UX audit P0, v3.4 |
| A.15 | Risk-proportional confirmations (role saves, deactivation, typed-confirm offboarding) | ✅ Done | UX audit P0, v3.4 |
| A.16 | Global search ⌘K shortcut + no-results state | ✅ Done | UX audit P0, v3.4 |
| A.17 | Review moderation (list reviews per trip, remove abusive reviews) | ✅ Done | Audited; requires trips.manage permission (v3.17) |

---

## Phase 2: Group Trip Aggregator & Booking

> Aggregate group trips from external operators. AI-powered discovery, side-by-side comparison, and direct booking.

| # | Feature / Task | Status | Notes |
|---|----------------|--------|-------|
| 2.1 | AI Trip Discovery Chatbot (natural language → ranked results) | ✅ Done | Rule-based NLP parser with Claude-shaped seams; discovery.ts |
| 2.2 | Trip data aggregation engine (external operators) | 🔲 Planned | |
| 2.3 | External API integrations (Wanderon, Thrillophilia, etc.) | 🔲 Planned | |
| 2.4 | Web scraping pipeline with scheduled refresh | 🔲 Planned | |
| 2.5 | Operator self-serve listing portal | ✅ Done | |
| 2.6 | Normalized trip schema across sources | ✅ Done | |
| 2.7 | Trip comparison engine (up to 3 trips side-by-side) | ✅ Done | Floating compare bar; guest-accessible; compare.ts + CompareContext |
| 2.8 | AI-generated comparison narrative | ✅ Done | Live Claude Opus 5 with adaptive thinking; rule-based fallback (v3.14) |
| 2.9 | Availability checking (real-time from operators) | 🔄 In Progress | Live for first-party hosted trips; external operator APIs pending |
| 2.10 | Booking flow (redirect to operator with affiliate tracking) | ✅ Done | |
| 2.11 | Direct booking + payment within app (Razorpay) | 🔄 In Progress | BookModal confirm-and-book done (v3.22); Razorpay payment blocked on T.11 |
| 2.12 | "My Trips" dashboard for booked trips | ✅ Done | Every joined/built trip with its hub (/mytrips) |
| 2.13 | Waitlist / notification when trip opens a spot | ✅ Done | Freed seats notify earliest waitlisted; in-app only (v3.12) |
| 2.15 | In-app notification centre (booking confirmed/rejected, waitlist alert) | ✅ Done | Topbar bell with live unread badge (v3.12) |

---

## Phase 3: In-Trip Operating System

> Everything the group needs during the trip: real-time coordination, expenses, photos, safety, and reviews.

| # | Feature / Task | Status | Notes |
|---|----------------|--------|-------|
| 3.1 | Trip Hub (per-trip command center) | ✅ Done | Chat, members, itinerary, announcements, polls, invites (v3.7) |
| 3.2 | Real-time itinerary (editable by trip leader) | 🔄 In Progress | Basic editing done; real-time sync pending (T.8) |
| 3.3 | Trip leader role + announcements | ✅ Done | First joiner leads; leader-only pinned announcements (v3.7) |
| 3.4 | Document storage (tickets, confirmations, permits) | 🔄 In Progress | URL-based doc vault (v3.20); file upload blocked on T.12 |
| 3.5 | Weather widget for current destination | ✅ Done | Open-Meteo proxy; current + 4-day forecast; shown in GroupHub (v3.20) |
| 3.6 | Polls in Trip Hub | ✅ Done | One changeable vote, live results, close |
| 3.7 | Invite members via link / QR code | ✅ Done | /join/:code; teal-branded QR with download button (v3.19) |
| 3.8 | Operator creates Trip Hub and invites booked travelers | ✅ Done | Partner CRM Travellers' Hub panel (v3.19) |
| 3.9 | Expense splitting (log, split, settle up) | ✅ Done | Equal-split; balances computed in JS (v3.16) |
| 3.10 | Expense summary PDF export | ✅ Done | Print-ready window; no server dependency (v3.19) |
| 3.11 | Trip photo gallery (shared, per trip) | 🔄 In Progress | URL-based album, masonry + lightbox (v3.20); file upload blocked on T.12 |
| 3.12 | AI-generated trip highlights reel | ✅ Done | Claude Opus 5 story + key moments + Instagram caption; rule-based fallback (v3.20) |
| 3.13 | Share trip album to social / Instagram | ✅ Done | Web Share API → clipboard fallback with toast (v3.20) |
| 3.14 | Social feed (trip stories, follow, like, comment) | ✅ Done | Travel Stories (Polarsteps-style diary); destination filter pills (v3.15, v3.22) |
| 3.16 | Trip reviews tied to operator / hostel | ✅ Done | 1–5 star; eligibility-gated (confirmed booking or hub member) (v3.17) |

---

## Phase 4: Bike & Road Trip Verticals

> New vehicle-oriented travel mode: motorcycle rides and road trips with companion matching, live safety tools, and carpooling.

| # | Feature / Task | Status | Notes |
|---|----------------|--------|-------|
| 4.1 | Bike profile (vehicle, CC, experience level) | ✅ Done | Rider profile setup page + DB table (v4.0) |
| 4.2 | Route planning tool (waypoints, distance, fuel stops) | ✅ Done | Route creation with waypoints JSON, distance & OpenStreetMap embed |
| 4.3 | Ride companion matching (same route, same dates) | ✅ Done | AdventureCompanions matching feed with overlap scoring (v4.0) |
| 4.4 | Real-time location sharing during ride (opt-in) | ✅ Done | Opt-in 60s GPS location pings + live member map (v4.0) |
| 4.5 | Fuel station & mechanic finder along route | 🔲 Planned | Interactive map layer for service stops |
| 4.6 | Emergency SOS button (location to emergency contact) | ✅ Done | In-app notification to hub members + emergency contact call link (v4.0) |
| 4.7 | Waypoint check-in with auto-alert on miss | ✅ Done | Waypoint check-in logging & member activity feed (v4.0) |
| 4.8 | Ride log (route, distance, waypoint photos) | ✅ Done | Waypoints & check-in log on route hub (v4.0) |
| 4.9 | Weather warnings for route | ✅ Done | Integrated destination weather widget (v3.20) |
| 4.10 | Road trip car profile (vehicle, seating capacity) | ✅ Done | Driver car profile setup page + DB table (v4.0) |
| 4.11 | Seat availability posting (carpooling) | ✅ Done | Open seat capacity & cost per seat on road trip routes (v4.0) |
| 4.12 | Carpooling matching (same route) | ✅ Done | Carpool seat search page + seat request & approval flow (v4.0) |
| 4.13 | Fuel cost splitting calculator | ✅ Done | Per-seat cost calculation helper (v4.0) |
| 4.14 | Toll cost estimation | 🔲 Planned | Optional route toll estimation integration |
| 4.16 | Road condition alerts | 🔲 Planned | Community road condition reports |

---

## Stability & Mobile Polish *(v3.23)*

> Bug fixes, error-handling hardening, and mobile-web refinements identified in full-product audit.

### Mobile & UX

| # | Feature / Task | Status | Notes |
|---|----------------|--------|-------|
| S.1 | iOS Safari viewport fix (100svh, overscroll-behavior-y) | ✅ Done | Eliminates blank scroll past last card on iOS Safari |
| S.2 | Guest shell padding fix (.app-auth scoping) | ✅ Done | Guests no longer get 120px bottom padding meant for authed bottom nav |
| S.3 | Mobile search bar & hero responsive improvements | ✅ Done | Breakpoints at 720px / 640px / 480px for search, hero, trending grid |
| S.4 | Remove demo credentials from all login pages | ✅ Done | Removed from Login, PartnerLogin, AdminLogin |

### Frontend Error Handling

| # | Feature / Task | Status | Notes |
|---|----------------|--------|-------|
| S.5 | ChatThread: send error recovery + double-send prevention | ✅ Done | try/catch restores text on failure; `sending` state disables button |
| S.6 | Chats list: infinite spinner + member count null crash | ✅ Done | `.catch()` on fetch; `members?.length` null guard |
| S.7 | UserProfile: 404 state + report/block error feedback | ✅ Done | load() catch → "User not found" UI; inline errors on report/block |
| S.8 | Connections: respond() error shown in UI | ✅ Done | `respondError` state displayed after respond API failure |
| S.9 | GroupHub: null destination crash, itinerary day calc, invite/expense errors | ✅ Done | `?.replace()` guards; days from durationDays or date range; clipboard fallback |
| S.10 | Results: fetch error + navigate-during-render fix | ✅ Done | `.catch()` prevents infinite spinner; navigate moved to useEffect |
| S.11 | MyTrips: null destination crash + spinner on error | ✅ Done | `t.destination?.replace()` guard; catch sets empty list |
| S.12 | Matches: null field display + chatId null nav + error feedback | ✅ Done | Null fields show placeholder; `/chats/null` prevented |
| S.13 | Profile: save() error surfaced + LinkedIn handle prefix fix | ✅ Done | Server errors shown to user; LinkedIn `@` prefix removed |
| S.14 | Adventures: delete awaited + confirmation | ✅ Done | handleDelete properly awaited; confirm before delete |
| S.15 | AdventureRoute: group chat null nav + NaN time display fix | ✅ Done | Chat button guarded on chatId; NaN filtered from timeAgo |
| S.16 | StoryView: toggleLike crash + postComment silent failure | ✅ Done | setStory null-safe; comment errors surfaced |
| S.17 | Hostels: null destination/vibeTags crash | ✅ Done | `?.replace()` and `?.map()` guards; `.catch()` on fetch |

### Backend Security & Correctness

| # | Feature / Task | Status | Notes |
|---|----------------|--------|-------|
| S.18 | JWT secret loaded from env, no hardcoded fallback | ✅ Done | `process.env.JWT_SECRET` required; server refuses to start without it |
| S.19 | Matching engine N+1 query eliminated | ✅ Done | Single batched query replaces per-user loop |
| S.20 | Booking claim made atomic (transaction) | ✅ Done | Race condition between availability check and INSERT eliminated |
| S.21 | Adventure profile scoped to requesting user | ✅ Done | Bike/car profile endpoints return only the authenticated user's data |
| S.22 | Social route: date validation, age bounds, onboarded flag recompute | ✅ Done | Bad date strings rejected; age clamped to 18–100; onboarded recomputed on profile save |

---

## Phase 5: Proprietary Curated Trips

> Trippy's own curated, community-voted, exclusive trips — demand-driven and data-informed.

| # | Feature / Task | Status | Notes |
|---|----------------|--------|-------|
| 5.1 | Demand signal dashboard (internal — where to launch next Exclusive) | 🔲 Planned | |
| 5.2 | Trippy Exclusives section in app | 🔲 Planned | |
| 5.3 | Community voting on future destinations | 🔲 Planned | |
| 5.5 | Post-trip data loop (photos, reviews, itinerary improvements) | 🔲 Planned | |

---

## Technical Infrastructure

> Foundational systems. T.8–T.15 are blockers for real-time features, payments, file uploads, and mobile.

| # | Feature / Task | Status | Notes |
|---|----------------|--------|-------|
| T.1 | React 18 + Vite web frontend | ✅ Done | |
| T.2 | Express + TypeScript API backend | ✅ Done | |
| T.3 | SQLite DB (node:sqlite, auto-seed, reset-db) | ✅ Done | Dev only — never reset without confirmation |
| T.4 | Auth — email + password (scrypt) | ✅ Done | |
| T.5 | GitHub repo (private, Nomad-Tribe/Trippy) | ✅ Done | Moved to org; local remote still redirects |
| T.6 | Auto-backup Stop hook (auto-commit + push on Claude turn end) | ✅ Done | |
| T.6a | Render deployment blueprint (render.yaml; server serves built web app) | ✅ Done | Added Jul 2026 |
| T.6b | Engineering Knowledge Base (AGENTS.md, CONTRIBUTING.md, docs/) | ✅ Done | Docs covenant: update with every change (v3.6) |
| T.7 | Claude API integration | 🔄 In Progress | Live for trip comparison narratives; chatbot + matching still rule-based |
| T.8 | Real-time messaging (Supabase Realtime) | 🔲 Planned | Unblocks 1.4.8, 3.2 |
| T.9 | Real SMS OTP (Twilio / MSG91) | 🔲 Planned | Unblocks 1.1.2 |
| T.10 | Push notifications (FCM / Expo) | 🔲 Planned | Unblocks 1.4.7 |
| T.11 | Payment integration (Razorpay) | 🔲 Planned | Unblocks 2.11 |
| T.12 | File / image storage (S3 / Cloudflare R2) | 🔲 Planned | Unblocks 1.4.3, 3.4, 3.11 |
| T.13 | Maps integration (Google Maps / Mapbox) | 🔲 Planned | Unblocks 4.2, 4.5 |
| T.14 | PostgreSQL migration (from SQLite) | 🔲 Planned | Required before production launch |
| T.15 | React Native mobile app (iOS + Android) | 🔲 Planned | Phase 5+ |

---

## Summary

| Section | Features | ✅ Done | 🔄 In Progress | 🔲 Planned | ❌ Blocked |
|---------|----------|---------|----------------|-----------|-----------|
| Phase 1: Community & Matchmaking | 48 | 37 | 7 | 2 | 2 |
| Design & UX Revamps | 9 | 8 | 1 | 0 | 0 |
| Partner CRM | 18 | 17 | 1 | 0 | 0 |
| Admin Console | 17 | 17 | 0 | 0 | 0 |
| Phase 2: Group Trip Aggregator | 14 | 9 | 2 | 3 | 0 |
| Phase 3: In-Trip OS | 15 | 12 | 3 | 0 | 0 |
| Phase 4: Bike & Road Verticals | 15 | 0 | 0 | 13 | 2 |
| Stability & Mobile Polish | 22 | 22 | 0 | 0 | 0 |
| Phase 5: Proprietary Trips | 4 | 0 | 0 | 4 | 0 |
| Technical Infrastructure | 17 | 8 | 1 | 8 | 0 |
| **Total** | **179** | **130** | **15** | **30** | **4** |

> Overall: **130 / 179 actionable tasks done (73%).**
> Phases 4 & 5 are fully unstarted. Key infrastructure blockers: T.8 (real-time), T.11 (payments), T.12 (file storage), T.14 (PostgreSQL).

---

## Implementation Notes

Key areas where the current implementation deliberately diverges from the PRD, and what is needed to close each gap:

| Area | PRD says | Current implementation | Path to close |
|------|----------|------------------------|---------------|
| Auth | Phone OTP verification | Email + password (scrypt); phone optional & unverified | Wire in T.9 (Twilio / MSG91) |
| AI matching & itinerary | Claude-powered scoring and generation | Rule-based with Claude-shaped seams; comparison narratives live on Claude Opus 5 | Upgrade chatbot + matching via T.7 |
| Chat | Real-time (Supabase Realtime) | HTTP polling — designed seam in place | Swap in T.8 |
| Payments | In-app Razorpay booking | External payment links; BookModal partial (v3.22) | Complete via T.11 |
| ID verification | Government-ID document upload | Admin review queue + badge flag; document image needs file storage | Complete via T.12 |
| File uploads | Photo + document upload (S3/R2) | URL-based references throughout (chat, gallery, document vault) | Complete via T.12 |
| Hostel supply | Operator/API integrations | Admin-managed canonical Property entity + seeds | External APIs are Phase 2 (2.3) |

---

## Near-Term Engineering Priorities

1. **Real-time messaging** — Supabase Realtime (T.8); unblocks 1.4.8, 3.2
2. **Payment integration** — Razorpay (T.11); unblocks 2.11
3. **File / image storage** — S3 / Cloudflare R2 (T.12); unblocks 1.4.3, 3.4, 3.11
4. **PostgreSQL migration** — Required before production launch (T.14)
5. **Frontend test setup** — Zero UI tests today; needed before Phase 2 scale
6. **Mobile app kickoff** — React Native (T.15); depends on above infra stabilising

---

_Last updated: 2026-08-08_
