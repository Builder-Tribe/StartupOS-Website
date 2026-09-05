# Product Requirements Document (PRD)
## Trippy — AI-Powered Solo Travel & Community Platform

**Version:** 3.24 (Living Document — updated as scope ships)  
**Author:** Product Strategy Session  
**Date:** 11 Aug 2026  
**Status:** Living — this PRD is updated whenever product scope changes or a feature ships  

### Document Changelog

| Version | Date | Change |
|---------|------|--------|
| 3.24 | 11 Aug 2026 | **Real partner communities + Dual-persona DIY + User-submitted stay CRUD.** (1) **6 real travel operator orgs seeded** from scraped public data: Adventure Buddha (3 treks), Tripper Trails (3 adventure trips), Plan the Unplanned (7 domestic/intl), Zostel Trips (3 group trips), WanderOn (3 pan-India), Tripbae (3 South India) — all with `@partner.trippy` credentials so Harshit can hand off to real partners. `seedRealCommunities()` is idempotent and separate from the test-only dummy partner seed. `Trippy Official & Host Community` (founder org) now correctly re-created on every boot via `seedFounderAccount()`. (2) **Dual-persona DIY flow** — two clear entry points: *"I don't know where I'm staying yet"* (hostel vibe-pick → social proof badges → create group) and *"I've already booked my stay"* (log it directly → skip to hub). Both flows converge on the same group/hub machinery. Hostel cards show `memberCount` badge (how many Trippy travellers are there) as the core social-proof mechanic for hostel discovery. (3) **User-submitted stays (Hostel / Airbnb / Hotel / Homestay)**: `POST /hostels` creates a traveller-owned `source='user_submitted'` row with `created_by_user_id`; `PUT /hostels/:id` edits own stay (403 on foreign ownership); `DELETE /hostels/:id` soft-deletes own stay (403 on foreign ownership). `GET /hostels` query now scopes `user_submitted` rows to the authenticated creator only — other travellers never see them. Response shape gains `isMine`, `canEdit`, `canDelete`, `createdByUserId` flags. Dynamic placeholder Airbnb and Boutique Hotel cards injected server-side for any destination that has no seeded entries. `created_by_user_id TEXT REFERENCES users(id)` added to `hostels` via migration guard. All 89 server tests pass. |
| 4.0 | 6 Aug 2026 | **Phase 4 — Bike & Road Trip Verticals shipped.** Adventure hub for motorcycle riders and road trippers. **Backend**: 6 new tables (`bike_profiles`, `car_profiles`, `adventure_routes`, `ride_location_pings`, `ride_checkins`, `carpool_requests`) in `server/src/db.ts` via additive migration. 14+ endpoints in `server/src/routes/adventures.ts` (/api/adventures): bike/car vehicle setup, route CRUD, real-time location pings (60s polling), waypoint check-ins log, SOS emergency alert (notifies members + emergency contact), companion matching (overlapping dates/cities + compatibility score), and road trip carpooling (seat requests, driver approval, auto-joins linked group hub). **Frontend**: 6 new pages (`Adventures.tsx` landing/creation, `AdventureRoute.tsx` hub with map embed/check-ins/SOS, `AdventureBikeProfile.tsx` rider setup, `AdventureCarProfile.tsx` driver setup, `AdventureCompanions.tsx` matching, `AdventureCarpoolSearch.tsx` seat finder). Integrated into `App.tsx` routes, `BottomNav.tsx` "+" sheet, `MyTrips.tsx` (motorcycle icon for adventure hubs), and `Profile.tsx` (vehicle summary card). All 40 dedicated unit tests in `server/test/adventures.test.ts` pass. |
| 3.23 | 2 Aug 2026 | **Trip-page presentation polish (cosmetic, competitor-informed).** After a competitor scan (MyTravelTown — an in-app agent-package marketplace), two display-only refinements to the hosted trip page (`TripDetailsView.tsx`), no logic/money-flow changes: (1) **Transparent price breakdown** in the booking sidebar — Package price / **Trippy booking fee: Free** / **You pay {host} directly** with a "no platform fee, no markup" note; presentational only (uses existing `price` + `host.name`), and deliberately inverts the competitor's convenience-fee + GST pattern to reinforce Trippy's zero-fee, pay-the-host model. (2) **Per-day "included" chips** — the itinerary's already-stored `accommodation` + `meals` now render as neutral bordered pills (🛏️ / 🍽️), visually distinct from the filled activity tags. CSS-only + JSX display; server, booking flow, and tests unchanged. |
| 3.22 | 31 Jul 2026 | **CX audit pass (21 fixes), DIY nearby-traveller empty state, booking flow overhaul, trip-grid unification.** Always-visible nav; DIY destination picker (no dead-end redirect); Profile languages field + save state; UserProfile broken Follow UI removed; `DELETE /connections/:id` withdraw endpoint; Connections "People" title + Withdraw button; Matches empty-state → `/diy`; Stories dynamic destination filter + "Following" tab removed; MyTrips emoji+name resolution; Chats timestamps; Hostels empty state; Results join confirmation + DIY nudge on unknown searches; Landing date-aware "Leaving soon" cards. DIY people step: nobody-on-dates shows up to 8 nearby travelers via new `GET /matches/nearby?destination=X` (90-day window) + plan-solo CTA creates hub directly. Results: `start_date < today` filter on `GET /grouptrips` / `/compare`; new `POST /grouptrips/:id/book` + `operator_bookings` table; BookModal separates purchase from hub join. TripDetails: hub button only shown after confirmed/claimed booking. Trip grid: partner + operator trips merged into one grid. |
| 3.21 | 31 Jul 2026 | **Trip Photo Album, AI Highlights Reel + Social Share — PRD 3.3 (partial) shipped.** (1) **Photo Album (PRD 3.3)**: new `trip_photos` table (id, group_id, added_by, url, caption, taken_at). Backend: `GET/POST/DELETE /groups/:id/photos` in `diy.ts` — membership-gated, own-photo delete (leader removes any). Frontend: `PhotoGallery` component in `GroupHub.tsx` — masonry thumbnail grid (aspect-ratio 1:1 tiles, CSS grid), click-to-expand lightbox with "Open original" / Remove / Close actions, inline add-photo form (URL, caption, date taken). URL-based — file upload deferred to T.12; covers Google Photos, Dropbox, Unsplash, etc. (2) **AI Highlights Reel (PRD 3.3 / US-308)**: `highlights_reel` + `highlights_at` columns on `groups`. Backend: `POST /groups/:id/highlights` — gathers trip context (members, photo captions, itinerary stops, announcements, total spend) and calls `claude-opus-5` with `thinking: {type: "adaptive"}` to produce `{story, moments[], caption}`; graceful rule-based fallback when `ANTHROPIC_API_KEY` absent; stored on group. `GET /groups/:id/highlights` — returns stored reel or null. Frontend: `HighlightsReel` component — story paragraph + key-moments list + Instagram caption box with "Copy caption" button; "✨ Generate" / "↺ Regenerate" button; "↗ Share" button. (3) **Social Share (PRD 3.3)**: "↗ Share" uses `navigator.share()` (native share sheet on mobile/PWA) with story + caption + hub URL; clipboard fallback with toast on desktop ("Copied! Paste into Instagram, WhatsApp, or Stories"). All 49 server tests pass. |
| 3.20 | 31 Jul 2026 | **Document Vault + Weather Widget — PRD 3.4 + 3.5 shipped.** (1) **Document Vault (3.4)**: new `trip_documents` table (id, group_id, added_by, doc_type, name, ref_number, date, url, notes). Backend: `GET/POST/DELETE /groups/:id/documents` in `diy.ts` — membership-gated, own-doc delete (leader can delete any). 9 doc types: e-ticket, hotel booking, permit, flight, bus, train, visa, insurance, other. Frontend: "Documents" card section in `GroupHub.tsx` with type-emoji list, clickable URL links, ref number badge, inline add form. File upload deferred to T.12; URL-based storage covers IRCTC, Drive, booking confirmations etc. (2) **Weather Widget (3.5)**: server-side proxy (`GET /api/destinations/:slug/weather`) calls Open-Meteo (free, no API key, CORS-friendly) with a 30-min in-memory cache; `DEST_COORDS` hardcodes lat/lon for all 6 destinations. WMO weather-code → emoji + label mapping. Frontend: `WeatherWidget` component in `GroupHub.tsx` (current temp/humidity/wind + 4-day forecast grid) and `InlinedWeather` in `TripDetailsView.tsx` (shown above itinerary when `destinationSlug` is set). All 49 server tests pass. |
| 3.19 | 31 Jul 2026 | **Four remaining Phase-3 features shipped.** (1) **Operator Trip Hub — PRD 3.8**: Partner CRM now includes a "Travellers' hub" section in every published trip — lists all hub members with booking status (Confirmed / Pending / Joined hub), counts, and an "Post announcement" form. Announcements are inserted as pinned chat messages and trigger in-app notifications to all hub members. Backend: `GET /api/partner/trips/:id/hub` (hub members + announcements), `POST /api/partner/trips/:id/hub/announce` (pinned message + bulk notify). (2) **Personality card — PRD 1.1.8**: Profile page now shows the full personality card (large icon, type name, description, "Matches best with" compat chips) instead of a bare text tag. `PERSONALITY_META` extracted to `web/src/lib/personality.ts` and shared by `Onboarding.tsx` and `Profile.tsx`. (3) **Invite QR code — PRD 3.7 complete**: clicking "Invite link" in GroupHub generates and shows a teal QR code (via `qrcode` npm package, client-side) alongside a "Download QR" button — operators can share/print for offline venues. (4) **Expense PDF export — PRD 3.10**: "Export" button in the expenses section opens a print-ready window (expenses grouped by category, settlement table, spend summary) and auto-triggers `window.print()` — no server dependency. All 49 server tests pass. |
| 3.18 | 30 Jul 2026 | **Trending Destinations — PRD 3.5 shipped.** Landing page now surfaces up to 6 destinations ranked by community activity (stories + reviews + bookings) in the last 30 days. **Backend**: `GET /api/destinations/trending` (public, no auth) — single CTE aggregates `trip_stories` by `destination_slug`, `trip_reviews → partner_trips` by destination, and `bookings → partner_trips` by destination, all within 30 days; scores each destination (stories×2 + reviews×3 + bookings×4); joins against `destinations` table for name/emoji/state; returns top 6. **Frontend**: new "Trending destinations 🔥" strip in `Landing.tsx` — compact horizontal card grid (emoji + name/state + colour-coded activity pills: 📖 stories / ⭐ reviews / 🎒 booked); clicking any card navigates to `/search?destination=<slug>`. Strip is omitted when there is no recent activity (new DB = no cards shown until seeds or real data exist). All 49 server tests pass. |
| 3.17 | 30 Jul 2026 | **Trip Reviews — PRD 3.4 shipped.** Star ratings + written reviews on partner trips and hostels. **Backend**: new `trip_reviews` table (reviewer, target_type/id, rating 1–5, title, body, photos, UNIQUE per reviewer+target). `GET /api/reviews?targetType=X&targetId=Y` — public feed with avgRating + count; `POST /api/reviews` — create with eligibility check (partner_trip: confirmed booking or hub member; operator_trip: hub member; hostel: any logged-in user); `PUT`/`DELETE` — edit/delete own review. `publicTripCard()` in `lib/trips.ts` now includes `avgRating` + `reviewCount` subqueries so every trip card can show the aggregate. **Frontend**: `ReviewSection.tsx` — reusable component showing aggregate stars + count, review list (avatar, name, interactive star display, title, body, date), inline write/edit form (interactive `StarRating`, title, body textarea); wired into `TripDetails.tsx` (partner trips, gated to confirmed/joined users) and `HostelDetail.tsx` (open to all logged-in users). `StarRating` (interactive) and `StarDisplay` (compact card inline) added to `components.tsx`; amber star rating shown on `PartnerTripCard` when reviews exist. All 49 server tests pass. |
| 3.16 | 30 Jul 2026 | **Expense Splitting — PRD 3.2 shipped.** Replaces Splitwise inside every Trip Hub. **Backend**: 2 new tables (`trip_expenses`, `expense_settlements`) + indices. `GET /groups/:id/expenses` — lists all expenses with computed per-pair balances and per-user net summary (totalSpend, mySpend, myOwed); `POST /groups/:id/expenses` — log expense (description, amount, category, paidBy, splitAmong); `PUT`/`DELETE` — edit/delete (payer or leader only); `POST /groups/:id/expenses/settle` — record a settlement, recomputes balances. Equal-split only (custom/percentage v2). **Frontend**: new Expenses card section in `GroupHub.tsx` with three sub-views: list (balance chips showing what you owe/are owed, expense log, net summary), add-expense form (category select with emoji, paid-by select, split-among checkboxes defaulting to all members), settle-up view (each outstanding balance with "Mark settled" button). Auth: all expense endpoints scoped to group members, using `/groups` path-scoped middleware so public discovery routes remain unaffected. All 49 server tests pass. |
| 2.0 | Jul 2026 | Final cut of the discovery-session PRD (as "TravelTribe") |
| 2.1 | 3 Jul 2026 | Product renamed **TravelTribe → Trippy** everywhere |
| 3.0 | 12 Jul 2026 | Phase 1 scope expanded to three applications and implementation status added: **Partner CRM / Host Portal** (supply side, pulled forward from Phase 2), **Admin Console** (internal control center with RBAC + audit logs), auth switched to **email + password** (phone optional, OTP deferred), hostels canonicalized as a **Property** entity managed from Admin, and the consumer discovery flow redesigned to **search-first** (Design A) |
| 3.1 | 13 Jul 2026 | **Design System Foundation v1.0** adopted across all three apps: three-layer token architecture (primitives → semantics → components) in `trippy/web/src/styles.css`, specs in `trippy/design/design-system/` (tokens.json, design-system.md, components.md). Refined brand teal (`#0e9f8f`), full teal/coral/indigo/neutral scales, 4px spacing grid, radius/shadow/motion tokens, type ramp, per-surface rules (consumer glassmorphic, partner opaque SaaS, admin dark `#14202a` sidebar) |
| 3.2 | 13 Jul 2026 | **Marketing website** launched as a fourth surface (`trippy/website/`, static Vite site, dev port 5174) built from the "Trippy Homepage" design — hero, how-it-works, stats, testimonials, DIY-vs-Hosted modes, hostel layer, partner acquisition banner, footer; CTAs link into the consumer app and Partner CRM. **Phosphor icon migration started** in the app (brand mark, admin nav, verified badge — `ph-bold`/`ph-fill` per the design system); design reference exports organized under `trippy/design/` |
| 3.15 | 30 Jul 2026 | **Travel Stories — Polarsteps-inspired trip diary + social feed (PRD 3.11, 3.14, 3.15, 3.16 partially).** Travellers can document real journeys day by day and share them with the community. **Backend**: 4 new tables (`trip_stories`, `story_steps`, `story_reactions`, `story_comments`) + indices. `GET /api/stories` — public feed (30 items, optional `?destination=slug`); `GET /api/stories/:id` — full story with steps + comments; `POST /api/stories` / `PUT` / `DELETE` — CRUD (auth, owner); `POST /api/stories/:id/steps` / `PUT` / `DELETE` — step management; `POST /api/stories/:id/like` — toggle like, returns `{liked, likeCount}`; `POST /api/stories/:id/comments` — add comment; `GET /api/destinations/:slug/stories` — destination stories. **Frontend**: `/stories` public feed (`Stories.tsx`) — story card grid with gradient cover fallback, destination filter chips, live-journey badge, like + read CTA, guest join bar. `/stories/:id` story view (`StoryView.tsx`) — full-bleed hero cover, stats bar (days / stops / destination), Polarsteps-style day-by-day timeline with photo grid (1–4 image layout + overflow count), like toggle, comment thread with post form. `/stories/new` + `/stories/:id/edit` story editor (`StoryEditor.tsx`) — metadata form (title, cover URL, destination, dates, visibility, status), per-stop form (day number, date, location, country, title, description, photo URL list), one-click save-all (creates story then syncs each step). Guest-accessible feed + view; auth-gated create/edit/like/comment. **Navigation**: "Stories" in both guest and auth topnav; "Start a travel story" entry in mobile bottom-nav "+" sheet. Visibility: public / private. Status: active (live journey — animated badge) / completed. All 49 server tests still pass. |
| 3.14 | 27 Jul 2026 | **Side-by-side Trip Comparison Engine — Phase 2.3 shipped.** Users can select up to 3 trips (mix of hosted partner trips and operator group trips) and compare them side-by-side across all dimensions. **Backend**: `POST /api/discover/compare` accepts up to 3 trip IDs, fetches full normalised data from both `partner_trips` and `group_trips` (including day-by-day itinerary for hosted trips), and calls `claude-opus-5` with `thinking: {type: "adaptive"}` to generate a structured narrative comparison with per-dimension breakdown and a recommended pick. Falls back to a rule-based summary if `ANTHROPIC_API_KEY` is not set. **Frontend**: "Add to compare" overlay button on every `PartnerTripCard` and `OperatorTripCard` across the landing and results pages; a floating `CompareBar` fixed at the bottom tracks selected trips (max 3) with remove chips and navigates to `/compare` when 2+ are selected; a new `/compare` page renders a full-width structured comparison table (price, destination, departure, duration, difficulty, group size, gender ratio, rating, availability, inclusions/exclusions, cancellation) followed by a day-by-day itinerary grid and an indigo-themed Claude AI analysis panel. Guest-accessible — no auth required. **Architecture**: `CompareContext` (React context/provider) manages selection state across the app. D-003 divergence row in `docs/roadmap.md` updated — AI features upgrade confirmed live with real Claude API for comparison narratives. |
| 3.13 | 27 Jul 2026 | **AI Trip Discovery Chatbot — Phase 2.1 shipped.** Conversational trip search lands as a first-class surface: `POST /api/discover/chat` (no auth required) wires the existing `parseTravelQuery` + `rankTrips` + `composeReply` pipeline in `lib/discovery.ts` into a stateless endpoint — the client echoes back the accumulated `TravelIntent` from each turn so the server can carry destination/budget/category context forward across messages. Frontend: `/chat` route accessible to both guests and signed-in users; full-screen chat UI (`Chatbot.tsx`) with user/assistant message bubbles, typing indicator, inline horizontal-scroll trip cards (compact `ChatTripCard` for both hosted and operator results, with "View trip →" link and match reasons), and four starter suggestion chips. Entry points: "Ask our AI Trip Finder →" link below the landing search bar, and "AI Trip Finder" item at the top of the mobile bottom-nav "+" sheet. Route added to both the public (guest) shell and the authenticated app in `App.tsx`. All 49 existing server tests still pass. |
| 3.12 | 21 Jul 2026 | **Bookings Backbone** (Phase 2 kickoff — PRD 2.9 first-party, 2.13, 2.14 in-app). Trippy now knows about its own conversions. **Capacity & live availability**: `max_group_size` is the seat cap; every trip card and page shows "N of M seats left" / "Filling fast" / "Sold out" (claims + confirmations both hold seats — no overselling). **Booking claims**: Book Now opens the host's payment page in a new tab and the trip page asks "Did you complete payment?" — claiming records a `claimed` booking and drops the traveller into the trip's hub. **Partner verification** (CRM): a Bookings panel on published trips lists claims to verify against the payment provider; Confirm/Reject notify the traveller; dashboard rows show "N to verify" + Full chips. **Waitlist**: sold-out trips offer "Join the waitlist"; any freed seat (cancel/reject) notifies the earliest waitlisted travellers. **In-app notifications**: new `notifications` table + topbar bell with unread badge (booking confirmed/rejected, waitlist spot) — the future landing spot for push (1.4.7). My Trips shows Booked ✓ / Booking pending. New tables: `bookings`, `waitlist`, `notifications`. +4 tests (49 total): oversell guard, org isolation, waitlist wake-up, notification lifecycle |
| 3.11 | 21 Jul 2026 | **DIY sync pass.** Cross-surface consistency: the marketing website's mode cards had DIY/hosted colours **swapped** vs the app (website: DIY teal, hosted coral; app tokens: `--diy` = coral, hosted = teal) — website now matches the app (DIY = coral, hosted = teal). Trip cards unified onto one **`.trip-grid` footprint** on search results: hosted (✦ block keeps its labelled teal frame) and operator cards share the same responsive column rhythm instead of compact tiles next to full-width slabs; landing grids aligned to the same rhythm. **DIY itinerary suggestions fixed + smarter** (still rule-based, PRD 1.5.5): activities now spread evenly across all trip days (previously piled onto days 2–3), accepted/planned items are never re-suggested (previously duplicated), free/cheap picks lead when the group's majority budget is "budget", and suggestions carry a best-months seasonal note. +2 tests (45 total) |
| 3.10 | 21 Jul 2026 | **Guest browsing** (consumer UX audit P0 #1 — the last one). The whole discovery funnel is now open to visitors: landing search, results (all three modes), trip pages, hostels list + detail — no account needed. Server: `/destinations`, `/grouptrips`, `/compare`, `/hostels`, `/hostels/:id` are public read-only (new `optionalAuth`; per-route `requireAuth` on writes; router mount order fixed so guest requests aren't swallowed by authed routers). Privacy line: guests see member **counts** but never member profiles; matching, chats, hubs, DIY groups all still require sign-in. Guest shell: topbar with Sign in + "Join Trippy — it's free", persistent bottom conversion bar, and every action (join a trip, log a stay, join a hub) routes to `/login?mode=signup` — signup lands directly on the create-account tab. +2 tests (43 total): public reads stay public, user data stays gated. Marketing-site CTAs retargeted to match: browse-type links → open discovery, account-required actions (DIY, Find companions) → the signup tab, hostel links → the now-public `/hostels` |
| 3.9 | 21 Jul 2026 | **Phase 1 finishing sprint** — every remaining Phase-1 item buildable without external services is now done (PRD 1.2.7, 1.3.8, 1.4.4, 1.4.5, 1.5.4). **Match secondary filters**: gender / age range / budget / verified-only, applied server-side on `/matches` with a filter bar on the Matches page and honest empty states. **Featured hostels** surfaced to consumers: ★ ribbon + branded border, featured-first ordering (admin featuring already existed). **Location pins in chat**: 📍 attach button — browser geolocation or a typed place — rendered as a pin card with an Open-in-Maps link. **Polls inline in group chat**: creating a hub poll now posts an interactive poll message into the group chat (vote from chat, live counts, one changeable vote). **Editable shared itinerary**: any member can edit a stop's day/time/title/notes/cost (✎ loads it into the form). +4 tests (41 total). Still open in Phase 1, all blocked on external services: SMS OTP, doc-image upload (file storage), hostel booking APIs, push, realtime, and the 4 Claude-API upgrades |
| 3.8 | 16 Jul 2026 | **Traveller trust pack** (PRD 1.1.3, 1.1.6, 1.1.9, 1.2.9, 1.2.10 + 1.1.7 audit). Profile is now the trust engine: **profile-strength meter** (11 signals, top-3 missing hints), **government-ID verification flow** — traveller submits doc type + last-4 (full number never stored), reviewed in a new **Admin Console queue** (`travellers.verify` permission, approve grants the badge, reject requires a reason shown to the traveller, both audited, dashboard action-queue count), **past trips** ("Been to" chips, validated self-reports), **social handles** (Instagram/LinkedIn/YouTube — handles only, no arbitrary URLs), **community vouches** (only travel companions who shared a hub/group can vouch, 1–5 stars + note, one changeable vouch per pair, trust score recomputed from real vouches and shown with reviewer attribution), "On Trippy since" on all profiles. Emergency contact confirmed live and private-only. +4 test files' worth of coverage (37 tests): shape privacy, verification lifecycle + RBAC, vouch eligibility |
| 3.7 | 16 Jul 2026 | **Traveller journey arc: real joins, My Trips & Trip Hub v1** (PRD 2.12, 3.1, 3.3, 3.6, 3.7). Joining is now real: hosted trips (`POST /discover/trips/:slug/join`, signed-in only) and operator departures (`POST /grouptrips/:id/join`) create or join the trip's **travellers' hub** — the same `groups` machinery DIY trips use (chat, members, shared itinerary), linked via `source_type`/`source_id`; first joiner coordinates as leader. **My Trips** (`/mytrips`, `GET /api/mytrips`): upcoming/past hubs with source labels (Hosted by X / Operated by Y / DIY), in the desktop topnav + mobile "+" sheet. **Trip Hub v1**: leader-only **announcements** (pinned into the hub chat with a distinct style), **polls** (any member creates, one changeable vote each, creator/leader closes, live result bars), **invite links** (`/join/:code` — preview + one-tap join, bypasses the connection gate), hosted/operator source badge, join celebration banner. Hosted trip pages gain a "Join the travellers' hub" CTA beside Book Now. +5 server tests (33 total): auth boundary, single-hub idempotency, leader-only announce, one-vote-per-member, invite joins |
| 3.6 | 16 Jul 2026 | **Engineering Knowledge Base.** The repository is now self-documenting for humans and AI coding agents: **`AGENTS.md`** (vendor-neutral repository constitution — architecture rules, reuse-before-generate, never-regenerate list, documentation covenant), **`CONTRIBUTING.md`** (setup, workflow, definition of done, working-with-AI guide), **`CLAUDE.md`** (Claude Code pointer), and **`docs/`** (architecture, API reference, database, auth/RBAC/audit, frontend reuse catalogue, testing, deployment, append-only decision log D-001…D-016, roadmap + PRD-vs-implementation divergence table, and the **mobile app scope/reuse contract**). Root README gains a "Start here" table; `trippy/design/README.md` indexes design sources. Standing covenant: every behaviour-changing commit updates the PRD, the checklist, and the affected docs |
| 3.5 | 14 Jul 2026 | **Date-first trip discovery.** Consumer search reworked: destination is now a **free-text search box with suggestions** (was a dropdown — doesn't scale past a handful of destinations), and it's **optional** — searching with dates only shows every trip departing in the window ("Anywhere" mode). Search results are now genuinely **date-filtered** (PRD ±3-day tolerance, applied server-side for hosted trips via new `from`/`to` params on `/discover/trips`): on-date trips lead, off-date departures are demoted under an explicit "Other departures" divider, and the results count is truthful. Searching a destination Trippy doesn't cover yet shows a graceful fallback — *"We don't have trips to X just yet, but these depart on your dates"* — instead of a dead end. Fixed a timezone off-by-one in the client date-window helper |
| 3.4 | 14 Jul 2026 | **Partner CRM + Admin Console UX revamp** from the Partner/Admin UX Audits (P0 fixes, incremental/non-breaking). Partner CRM: **left sidebar shell** (My trips + greyed coming-soon modules; hidden ≤860px so mobile keeps the topbar), **first-run welcome checklist** on the dashboard (create → complete → publish), trip editor **section checklist rail with completion %**, **payment-link guidance card** (Razorpay/Instamojo/Stripe how-to), preview opens in a **new tab** with an "Edit this trip" button and updated ribbon copy. Admin Console: **bulk selection + bulk actions** on Trips/Partners/Travellers tables (permission-gated, per-row audited, reason required for dangerous actions), **audit log filters** (action, admin actor, resource, from/to date range) + **audited CSV export** + `/audit-log-facets` endpoint, **confirmation dialog on role-permission saves** (shows affected user count), partner-user deactivation confirm + **offboarding upgraded to typed-confirmation HighRiskDialog**, global search **⌘K shortcut** + explicit no-results state. Audit docs + status in `trippy/design/partner-crm/` and `trippy/design/admin-console/` |
| 3.3 | 16 Jul 2026 | **Consumer mobile-web revamp** from the Consumer App UX Audit + Redesign (P0 fixes, incremental/non-breaking): mobile **bottom nav** (5 tabs, gradient "+" sheet: browse / DIY / hostels; desktop topnav unchanged), **AI explanation on every compatibility score** (never a bare number; Matches + DIY people step), **chat-locked state** + connection-aware request CTAs and **⋯ report/block bottom sheet** on traveller profiles (2 taps), **onboarding step 5** ("Where are you headed next?" — creates the first trip, skippable) + full-screen **Travel Personality reveal**, and a **sticky Book Now bar** on mobile trip details. Audit docs + status in `trippy/design/consumer-app/`. Deferred: guest browsing (auth-gate removal) |

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Vision & Mission](#vision--mission)
4. [Target Users & Personas](#target-users--personas)
5. [Product Architecture Overview](#product-architecture-overview)
6. [Go-to-Market & Phasing Strategy](#go-to-market--phasing-strategy)
7. [Phase 1 — Community & Matchmaking](#phase-1--community--matchmaking)
8. [Phase 2 — Group Trip Aggregator & Booking](#phase-2--group-trip-aggregator--booking)
9. [Phase 3 — In-Trip Operating System](#phase-3--in-trip-operating-system)
10. [Phase 4 — Bike & Road Trip Verticals](#phase-4--bike--road-trip-verticals)
11. [Phase 5 — Proprietary Curated Trips](#phase-5--proprietary-curated-trips)
12. [AI Architecture & Chatbot Specifications](#ai-architecture--chatbot-specifications)
13. [Technical Requirements](#technical-requirements)
14. [Success Metrics](#success-metrics)
15. [Revenue Model](#revenue-model)
16. [Non-Goals](#non-goals)
17. [Open Questions](#open-questions)
18. [Acceptance Criteria](#acceptance-criteria)

---

## Executive Summary

Trippy is an AI-powered travel platform built specifically for solo travelers and adventure communities. It solves two interconnected problems: (1) the loneliness and anxiety of solo travel by connecting like-minded travelers, and (2) the fragmentation of group trip discovery and booking across multiple platforms.

The platform starts as a community matchmaking app for solo travelers, evolves into a group trip aggregator powered by an AI chatbot, and ultimately becomes the end-to-end operating system for adventure travel — covering hostels, group trips, bike expeditions, road trips, and eventually proprietary curated experiences.

The entire product is designed to be built using AI-assisted development (Claude Code) with minimal manual engineering intervention. Every feature, flow, API integration, and UI component described in this PRD is specified in enough detail for AI to generate working code.

**As of v3.0, Phase 1 is live as three applications on one shared backend and canonical database:**

1. **Consumer Application** (`/`) — traveller-facing discovery, matching, community and DIY trip planning.
2. **Partner CRM / Host Portal** (`/partner`) — travel communities and trip organizers create, manage, and publish group trips (multi-tenant, org-scoped). Pulled forward from Phase 2 because supply acquisition proved to be a Phase 1 need.
3. **Admin Console** (`/admin`) — the internal control center for the Trippy team: platform dashboard, partner/trip/hostel/traveller management, RBAC, internal notes, and immutable audit logs.

Changes made in any application reflect in the others because all three operate on the same canonical entities — there are no duplicated admin-only copies of data.

---

## Problem Statement

Solo travelers face a fragmented and anxiety-inducing travel experience. Specifically:

**Problem 1 — Loneliness and Isolation**
Solo travelers — including introverts, people without a travel friend group, and those seeking new social experiences — have no structured way to find like-minded travel companions. Current solutions (WhatsApp groups, Facebook groups, hostel noticeboards) are unorganized, unsafe, and luck-dependent.

**Problem 2 — Group Trip Discovery Fragmentation**
Travelers who want to join curated group trips must manually visit five to ten different platforms (Wanderon,Tripbae, Plan the Unplan, Adventure Buddha, Zo Trips, etc.), compare itineraries line by line, call for availability, research group demographics, and read scattered reviews. This process takes hours and remains unreliable.

**Problem 3 — No Structured Post-Booking Experience**
After booking a group trip, travelers are dumped into unstructured WhatsApp groups for coordination. Expenses are tracked on separate apps (Splitwise), photos scattered across phone galleries, and itinerary updates arrive as informal messages. There is no dedicated operating system for the shared trip experience.

**Cost of not solving:**
- Millions of solo travelers avoid travel entirely or have subpar experiences due to loneliness
- Group travel operators lose potential customers who give up during the research phase
- No platform owns the end-to-end solo travel journey, leaving a massive market gap

---

## Vision & Mission

**Vision:** Become the default platform for every solo traveler in the world — from the moment they decide to travel to the moment they share their last memory.

**Mission:** Use AI to eliminate the friction, fear, and fragmentation from solo and group travel so that anyone, regardless of their social circle or travel experience, can have the adventure of their life.

---

## Target Users & Personas

### Persona 1 — The Lonely Adventurer (Primary)
- Age: 22–35
- Profile: Has the desire to travel but no friends available or willing to join
- Pain: Wants company but doesn't know how to find travel companions safely
- Goal: Meet like-minded people, explore new places, create memories
- Behavior: Uses Instagram for travel inspiration, searches group trips on Google, ends up overwhelmed

### Persona 2 — The Experienced Solo Traveler
- Age: 25–40
- Profile: Has traveled solo before, comfortable being alone, but open to meeting new people
- Pain: Wants flexibility but occasional companionship; tired of WhatsApp group chaos post-booking
- Goal: Curated experiences, quality travel companions, organized trip logistics
- Behavior: Active on travel communities, books hostels regularly, has tried multiple group trip operators

### Persona 3 — The Anxious First-Timer
- Age: 20–30
- Profile: Wants to travel solo but scared; never done it before
- Pain: Fear of being alone, not knowing what to do, safety concerns
- Goal: Structured guidance, community support, a safe first solo travel experience
- Behavior: Reads travel blogs, watches YouTube vlogs, asks questions in Reddit forums

### Persona 4 — The Adventure Enthusiast
- Age: 25–45
- Profile: Loves trekking, biking, road trips; activity-first traveler
- Pain: Hard to find companions specifically for adventure activities; group operators don't always match vibe
- Goal: Activity-specific companions, route planning, safety in numbers
- Behavior: Part of biking clubs, trekking groups; active on specialized forums

### Persona 5 — The Group Trip Operator (B2B Partner)
- Profile: Wanderon, Tripbae, Plan the Unpland, Adventure Buddha, Zo Trips, and similar companies
- Pain: Difficulty reaching solo travelers, low discovery, high cost of customer acquisition
- Goal: More bookings, better-qualified leads, streamlined communication with travelers
- Behavior: Runs WhatsApp groups for trip coordination, manually manages availability and bookings

### Persona 6 — The Trippy Team (Internal Operator) *(added v3.0)*
- Profile: Founders and team members who run the platform day to day (ops, partner managers, trip reviewers, hostel curators, support, analysts)
- Pain: Without a control center, operating the platform means poking at the database and losing track of who changed what
- Goal: One place to monitor growth, manage partners/trips/hostels/travellers, and act safely with an audit trail
- Behavior: Lives in the Admin Console; access is scoped by role (not everyone can do everything)

---

## Product Architecture Overview

### Applications (as built, v3.0)

```
Trippy Platform  —  one backend, one canonical database, three applications
│
├── CONSUMER APPLICATION  (/)                          [demand side — LIVE]
│   ├── Search-first discovery (destination + dates → group trips + DIY rail)
│   ├── Community & matchmaking (profiles, compatibility, requests, chat)
│   ├── Hostel discovery (published Properties only)
│   ├── DIY trip path (hostel → people → group → itinerary)
│   └── Trip Details + Book Now → host's external payment page (tracked)
│
├── PARTNER CRM / HOST PORTAL  (/partner)              [supply side — LIVE]
│   ├── Self-serve org signup + org-scoped (multi-tenant) access
│   ├── Trip builder: details, pricing, media, day-wise itinerary
│   ├── Draft → validate → publish lifecycle + preview-as-consumer
│   └── External payment link per trip (Trippy takes no payment in Phase 1)
│
├── ADMIN CONSOLE  (/admin)                            [internal — LIVE]
│   ├── Platform dashboard (live counts, growth, activity, action queues)
│   ├── Partner / Trip / Hostel / Traveller management (lifecycle controls)
│   ├── Hostel (Property) creation & publishing — canonical source for consumer
│   ├── RBAC: 9 roles, ~45 granular permissions, enforced server-side
│   ├── Internal notes, global search, CSV exports
│   └── Immutable audit logs + login/session tracking
│
└── MARKETING WEBSITE  (trippy/website, port 5174)     [acquisition — LIVE]
    ├── Homepage: hero, how-it-works, stats, testimonials, modes, hostel layer
    ├── Partner acquisition banner → Partner CRM signup
    └── Static site on the same design tokens; CTAs deep-link into the app
```

### Capability Layers (roadmap view)

```
Trippy Platform
│
├── Layer 1: AI Chatbot (Discovery & Recommendation Engine)
│   └── Natural language trip search, group matching, itinerary generation
│
├── Layer 2: Community & Matchmaking                    [LIVE]
│   ├── Solo traveler profiles
│   ├── Interest-based matching
│   └── Hostel-based discovery
│
├── Layer 3: Group Trip Supply & Booking                [PARTIALLY LIVE]
│   ├── Partner CRM self-listing (live)  ├── Aggregation from external operators (future)
│   ├── Comparison engine (live)         └── External payment redirect (live)
│
├── Layer 4: In-Trip Operating System
│   ├── Group management (basic version live via DIY groups)
│   ├── Real-time itinerary (basic version live)
│   ├── Expense splitting
│   └── Photo & memory logging
│
├── Layer 5: Adventure Verticals
│   ├── Bike trip community
│   └── Road trip community
│
└── Layer 6: Proprietary Trips (Future)
    └── Trippy Exclusive Experiences
```

---

## Go-to-Market & Phasing Strategy

### The Sequencing Logic (why community comes first)

The order of the phases is deliberate and driven by a specific go-to-market wedge: **build the solo traveler community first, then use that traveler data as leverage to onboard group operators.**

The reasoning:
- Onboarding group trip operators (Wanderon, TripDay, etc.) is hard if Trippy has nothing to offer them. Cold outreach with an empty platform gets ignored.
- But if Trippy first builds a base of, say, 100,000 solo travelers with known destinations, dates, and preferences, the pitch to operators changes completely: *"We have thousands of qualified solo travelers actively looking for trips to your destinations. We can send you leads and bookings."*
- The community layer is also simpler to build (no operator partnerships or data integrations required), so it can ship first and start compounding.

### The Data Flywheel

```
Community grows  →  Traveler preference & demand data accumulates
       ↑                                    │
       │                                    ▼
Better matches &            Data becomes leverage to onboard
 Exclusive trips            group operators (Phase 2) and to
       ↑                    create proprietary trips (Phase 5)
       │                                    │
       └────────  More travelers join  ◄────┘
```

### Phasing Summary

| Phase | Focus | Why now | Key unlock |
|-------|-------|---------|-----------|
| **Phase 1** | Solo community & matchmaking + hostels + DIY path | Simplest to build, no partnerships needed; builds the user base and data | Traveler demand data |
| **Phase 2** | Group trip aggregator + AI chatbot + booking | Use Phase 1 data to onboard operators; solve the research-headache pain | Booking revenue + operator relationships |
| **Phase 3** | In-trip operating system | Capture the post-booking experience; replace WhatsApp + Splitwise | Retention + content + trip data |
| **Phase 4** | Bike & road trip verticals | Reuse core infra for high-value adventure communities | New segments, safety differentiation |
| **Phase 5** | Proprietary curated trips | Enough demand data to run our own trips at high margin | Highest margin, full brand control |

### Operator Lead-Generation Motion (Phase 2 wedge in detail)

Once the community base exists, Trippy monetizes and grows supply through operator lead-gen:
- Show operators aggregate demand: "N travelers want [destination] in [month] within [budget]"
- Offer qualified leads or bookings from the community base
- Operators onboard their trips to reach these travelers
- This both fills the aggregator with supply AND creates a revenue stream (lead fees / commission / SaaS)

This is the bridge that turns a consumer community (Phase 1) into a two-sided marketplace (Phase 2).

---

## Phase 1 — Community & Matchmaking

### Objective
Build a community of solo travelers, enable them to find like-minded companions, and connect them with hostels where other verified travelers are staying. This phase builds the user base and data foundation needed for all future phases.

### Core Features

#### 1.1 User Onboarding & Profile Creation

**Description:**
Every user creates a detailed travel profile that serves as the foundation for AI-powered matching. The profile captures personality, travel style, interests, budget range, and upcoming travel plans.

**Fields to capture:**
- Full name, age, gender, profile photo
- City of residence
- Travel style (adventure / leisure / cultural / spiritual / party / mixed)
- Interests (trekking, biking, photography, food, history, nightlife, etc.) — multi-select
- Budget range per trip (budget / mid-range / premium)
- Languages spoken
- Upcoming travel plans (destination, dates, flexible/fixed)
- Past trips (self-reported or imported)
- Social media handles (optional, for trust verification)
- Emergency contact (for safety)
- Verification: Phone number OTP + optional government ID upload for trust badge
  - *(v3.0 update — as built: primary auth is **email + password**; phone is an optional signup field stored unverified, kept so phone-OTP login can be added later. ID verification is simulated in the MVP.)*

**AI Role:**
- Auto-suggest interests based on stated travel destinations
- Generate a "Travel Personality Score" (e.g., "Explorer," "Culture Seeker," "Thrill Chaser") based on profile inputs
- Surface compatibility score with other users

**Acceptance Criteria:**
- [ ] User can complete full profile in under 5 minutes
- [ ] Profile photo is mandatory before matching is enabled
- [ ] Phone verification is required before any traveler connection is made
- [ ] Travel Personality Score is generated and displayed on profile
- [ ] User can edit all profile fields at any time

---

#### 1.2 Traveler Matching Engine (Tinder for Travelers)

**Description:**
An AI-powered matching system that connects solo travelers heading to the same destination around the same dates with compatible travel styles and interests.

**Matching Logic:**
- Primary filter: Same destination + overlapping travel dates (±3 days tolerance)
- Secondary filters: Travel style compatibility, age range preference (optional), gender preference (optional), budget range overlap
- AI compatibility score (0–100) based on interest overlap, past trip similarity, and travel personality alignment
- Match suggestions presented as cards (swipe-style or list-style)

**Connection Flow:**
1. User sets upcoming trip (destination + dates)
2. AI surfaces compatible travelers heading to same destination
3. User reviews profile cards with compatibility score
4. User sends a "Travel Request" (like a connection request)
5. If mutual, a chat is unlocked
6. Both users can then decide to meet up, share hostel, or plan activities together

**Safety Features:**
- Profile verification badge (phone verified / ID verified)
- Report and block functionality
- Community trust score based on reviews from past travel companions
- In-app messaging only (no personal contact sharing until mutual agreement)
- Option to add emergency contact who can see trip details

**Acceptance Criteria:**
- [ ] Matching only activates when user has an upcoming trip set
- [ ] Compatibility score is displayed on every suggested match
- [ ] Chat is only unlocked after both users mutually connect
- [ ] Report/block works within 2 taps
- [ ] Unverified profiles are clearly labeled and deprioritized in matching

---

#### 1.3 Hostel Discovery & Integration

**Description:**
Users can browse hostels at their destination and see how many verified Trippy members are staying there. This creates a warm social entry point and encourages hostel tie-ups.

**Features:**
- Hostel listing page per destination (aggregated from Hostelworld, Zostel, GoStops, and other Indian hostel chains and independent/local hostels, plus direct partnerships)
- "X Trippy members staying here" badge on hostel cards
- Members staying at a hostel can choose to make themselves visible to other members
- Users can log their hostel stay ("I'm staying at [Hostel Name] from [Date] to [Date]")
- Hostel profile page shows: price range, amenities, vibe tags (party / chill / social / quiet), past Trippy reviews
- Option to book hostel directly through the app (affiliate or direct booking)

**Hostel Partnership Model:**
- Free listing for all hostels (scrape + manual data entry)
- Premium listing for partner hostels (direct booking, featured placement, verified data)
- Commission on bookings made through the app (5–15%)

**Acceptance Criteria:**
- [ ] User can search hostels by destination and dates
- [ ] Member count is shown on hostel cards (only for users who opted in to visibility)
- [ ] User can log their hostel stay in under 30 seconds
- [ ] Hostel booking redirects to partner page or shows affiliate link
- [ ] Privacy: hostel stay visibility is opt-in, default is private

---

#### 1.4 In-App Messaging & Group Chats

**Description:**
Secure, structured in-app communication replacing WhatsApp for traveler coordination.

**Features:**
- 1:1 chat between matched travelers
- Group chat creation for ad-hoc travel groups (formed by users themselves)
- Chat features: text, image sharing, location pin sharing, poll creation (for group decisions like "which restaurant?")
- Pinned messages for important trip info
- Message read receipts
- Push notifications for messages

**Acceptance Criteria:**
- [ ] Messages deliver within 2 seconds under normal network conditions
- [ ] Images upload and display correctly in chat
- [ ] Group chats support up to 30 members
- [ ] Pinned messages visible at top of chat
- [ ] Notifications work even when app is backgrounded

---

#### 1.5 The "Build Your Own Trip" (DIY) Path

**Description:**
This is a distinct, first-class product path — the counterpart to joining an operator-led group trip. It is the full self-organized journey for a traveler who wants control and flexibility. The user does not want to be handed a pre-packaged trip; they want to assemble their own adventure and their own group. Trippy guides them through it end to end.

**The DIY Journey (explicit flow):**
1. Traveler chooses a destination and dates
2. Trippy shows the step-by-step path: "Here is what a DIY trip to [destination] looks like"
3. **Find a hostel** — browse hostels, see which Trippy members are already staying there
4. **Meet like-minded people** — match with compatible travelers heading to the same place (via the matching engine)
5. **Form your own group** — the traveler and their matches create a self-organized group in the app
6. **Plan your own itinerary** — the group builds a shared, editable itinerary (with AI suggestions available)
7. **Travel together** — the self-formed group uses the in-trip tools (chat, expenses, photos) just like an operator group

**Why this matters:**
This path directly serves the traveler who said "I want to travel solo, find people in hostels, meet and greet, and plan the itinerary on our own." It gives travelers agency while still solving loneliness. It also produces the richest behavioral data (who they matched with, what they planned, where they went) that later powers operator lead-gen and proprietary trips.

**Acceptance Criteria:**
- [ ] User can start a DIY trip from any destination page
- [ ] The DIY path visibly walks the user through hostel → match → group → itinerary → travel
- [ ] A self-organized group gets the same in-trip tools as an operator-led trip (see Phase 3)
- [ ] The user can switch between "Build Your Own" and "Join a Group Trip" at any point
- [ ] AI itinerary suggestions are available but never forced

---

#### 1.6 DIY vs. Group Trip Budget & Effort Comparison

**Description:**
A decision-support feature that shows the traveler both paths side by side for the same destination — the "do it on your own" option versus the "join an organized group" option — with projected budget and required effort for each. This empowers the traveler to choose based on their comfort level, budget, and how much they want handled for them.

**What it shows:**
- **DIY path preview:** the steps involved (book hostel, arrange local transport, plan activities, buy permits, etc.), an estimated total budget, and an effort/complexity indicator
- **Group trip path preview:** the equivalent organized trip(s) from operators, their all-inclusive price, and what's handled for you
- A clear "here's the trade-off" summary: DIY is typically cheaper and more flexible but requires planning; group trips are curated, social, and lower-effort but less flexible

**Behavioral / partnership note:**
The group-trip side of this comparison depends on operator data. If a specific operator does not permit their pricing/itinerary to be displayed in a comparison, that operator's data can be hidden or shown in a limited form — the comparison degrades gracefully rather than breaking.

**AI Role:**
- Generate the DIY step list and cost estimate for any destination
- Pull and normalize comparable group-trip options for the same destination and dates
- Produce the plain-language trade-off summary

**Acceptance Criteria:**
- [ ] For a given destination + dates, user sees both a DIY estimate and at least one group-trip option (where data exists)
- [ ] DIY estimate breaks down cost by category (stay, transport, food, activities)
- [ ] The trade-off summary is generated in plain language
- [ ] If operator data is unavailable or restricted, the DIY side still renders fully and the group side degrades gracefully
- [ ] User can move directly from either side into action (start DIY trip, or book the group trip)

---

#### 1.7 Partner CRM / Host Portal *(added v3.0 — LIVE, pulled forward from Phase 2)*

**Description:**
A separate authenticated application (`/partner`) where travel communities and trip organizers manage their supply on Trippy. Multi-tenant from day one: every partner organization only ever sees and edits its own data.

**Features (as built):**
- Self-serve signup: creating an account creates a Partner Organization + its first admin user (email + password, scrypt-hashed)
- Dashboard: trip counts by status (draft / live / upcoming / completed) + trips table with per-status actions
- Trip builder: basic info, pricing (with inclusions/exclusions), cover + gallery media (https URLs), tags, and a structured **day-wise itinerary** (add / edit / delete / reorder), with autosave
- Trip lifecycle: **draft → validate → publish** (server-side validation blocks incomplete trips), unpublish, preview-as-consumer (reuses the consumer Trip Details component)
- **External payment link per trip** (validated https): travellers who tap "Book Now" are redirected to the host's own payment page — Trippy processes no payments in Phase 1, but records every outbound booking click (trip, org, traveller/anon session, source, CTA) for analytics
- Published trips appear automatically in consumer discovery (Landing "Hosted by travel communities" strip, destination Results, public `/trip/:slug` pages)

**Acceptance criteria:** all met — see `trippy/server/test/partner.test.ts` (org isolation, publish validation, draft privacy, click tracking).

---

#### 1.8 Admin Console *(added v3.0 — LIVE)*

**Description:**
The internal control center (`/admin`) from which the Trippy team operates the whole platform. Runs on the same backend and canonical entities as the consumer and partner apps — no duplicated admin copies of data.

**Features (as built):**
- **Dashboard:** live platform counts (travellers / partners / trips / hostels by status), growth sparklines over configurable ranges, recent platform activity, and "action required" queues (e.g. drafts missing info, trips without payment links)
- **Partner management:** list + partner 360 (overview, users, trips, performance, notes, activity); activate / suspend / reactivate / offboard; manage partner users
- **Trip management:** list + trip 360 across all partners; publish (validated) / unpublish / suspend / restore / archive / feature
- **Hostel (Property) management:** hostels are canonical DB entities created and managed here — draft → publish lifecycle, suspend / archive / permanently-closed, featured flag; **only published hostels appear in the consumer app**. Modeled as a `Property` (propertyType = hostel) so hotels/homestays/camps slot in later
- **Traveller management:** list + traveller 360 (account, login/session info, activity); suspend / reactivate; revoke sessions. Passwords, hashes, and tokens are never exposed
- **RBAC:** 9 seeded roles (SUPER_ADMIN → READ_ONLY_ADMIN) mapped to ~45 granular permissions; enforced server-side on every route; navigation and actions are permission-aware
- **Safety & accountability:** immutable audit logs (actor, action, resource, before/after, reason, IP), login-event + session tracking with revocation, internal notes on any entity (never visible outside admin), confirmation dialogs with mandatory reasons for sensitive actions, CSV exports (permission-gated and audited)
- **Global search** across partners, trips, hostels, and travellers, filtered by the admin's permissions

**Acceptance criteria:** all met — see `trippy/server/test/admin.test.ts` (auth boundary, RBAC, lifecycle + audit, secret non-exposure, note isolation, audit immutability).

---

#### 1.9 Authentication (updated v3.0)

Both consumer and partner accounts use **email + password** (scrypt-hashed; JWT sessions namespaced per app so tokens can't cross the consumer/partner/admin boundaries). Phone number is an **optional** consumer signup field stored unverified — the earlier phone-OTP flow was replaced but the data model keeps the door open to reintroduce OTP login later. Email verification was built and then descoped for Phase 1 (schema retained). Admin accounts additionally get server-side session records with revocation and last/failed-login tracking.

---

### Phase 1 User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|-----------|
| US-101 | Solo traveler | Create a detailed travel profile | Other travelers can assess compatibility before connecting |
| US-102 | Solo traveler | See travelers going to the same destination around my dates | I can find potential companions before I travel |
| US-103 | Solo traveler | Send and receive travel connection requests | I can initiate or respond to potential meetups |
| US-104 | Solo traveler | Chat securely with matched travelers | I can plan meetups without sharing personal contact info |
| US-105 | Solo traveler | Browse hostels at my destination and see which Trippy members are staying there | I can choose a hostel where I already know people |
| US-106 | Solo traveler | Log my hostel stay on the app | Other members know where to find me |
| US-107 | Solo traveler | Report or block another user | I feel safe using the platform |
| US-108 | Solo traveler | See a trust/verification badge on profiles | I know who has been verified and can trust more easily |
| US-109 | Solo traveler | Follow a guided "build your own trip" path | I can plan and travel on my own terms while still finding company |
| US-110 | Solo traveler | See a DIY-vs-group-trip budget and effort comparison for my destination | I can decide which travel style fits my budget and comfort level |
| US-111 | Self-organized group | Get the same in-trip tools as an operator group | Our DIY trip is just as organized as a booked one |
| US-112 *(v3.0)* | Travel community admin | Sign up, build a trip with itinerary + payment link, and publish it | My trips reach Trippy travellers without waiting for an integration |
| US-113 *(v3.0)* | Traveller | Open a hosted trip's details and tap Book Now | I pay on the host's page while Trippy tracks my intent |
| US-114 *(v3.0)* | Trippy team member | Manage partners, trips, hostels and travellers from one console | I can operate the platform safely with an audit trail |
| US-115 *(v3.0)* | Founder | See live platform counts, growth and action queues | I always know the state of the business |

---

## Phase 2 — Group Trip Aggregator & Booking

### Objective
Build an AI-powered discovery engine that aggregates group trips from multiple operators, normalizes the data, and lets users find and book the best trip for their preferences through a conversational chatbot interface. Monetize through booking commissions.

### Core Features

#### 2.1 AI Trip Discovery Chatbot

**Description:**
The primary interface for group trip discovery. Users converse with an AI chatbot in natural language to find the best group trip matching their requirements. The chatbot understands context, remembers preferences, and ranks results intelligently.

**Example Conversations:**
- "Find me a Kodaikanal trip in August under ₹12,000 with trekking"
- "I want a 5-day Manali trip with good gender ratio, departing from Delhi in the first week of September"
- "Which Spiti Valley trips have the best reviews and depart this weekend?"
- "Compare the top 3 Rajasthan trips under ₹15,000"

**Chatbot Capabilities:**
- Natural language understanding for destination, duration, budget, dates, activity preferences, group composition preferences
- Aggregated real-time data from partner operator APIs or scraped databases
- Ranked results with explanation ("Ranked #1 because it matches your trekking preference and has the best gender ratio")
- Side-by-side comparison of up to 3 trips
- Availability checking
- Direct booking initiation from chat
- Follow-up questions to refine search ("Do you prefer more days in the mountains or at the lake?")
- Memory of user preferences across sessions

**Data Sources to Aggregate:**
- Wanderon
- TripDay
- Plan the Unplan
- Adventure Buddha
- Zostel Trips
- Thrillophilia
- Local and regional operators (via manual onboarding or API)

**Acceptance Criteria:**
- [x] Chatbot understands trip queries with at least destination + one additional parameter — `parseTravelQuery` extracts destination, budget, month, duration, category, start city from free text
- [x] Results return within 3 seconds — rule-based pipeline; no external API call
- [x] Chatbot can handle at least 10 back-and-forth turns in a single search session — client passes accumulated `TravelIntent` as context on every turn
- [x] Results include: operator name, price, duration, availability status, rating (gender ratio shown when available in operator data)
- [x] User can initiate booking from within the chatbot — hosted trips show "View trip →" link directly in the chat card

---

#### 2.2 Trip Data Aggregation Engine

**Description:**
Backend system that continuously collects, normalizes, and indexes group trip data from multiple operators.

**Data Model per Trip:**
```
Trip {
  id: string
  operator: string
  destination: string
  startCity: string
  startDate: date
  endDate: date
  duration: number (days)
  price: number (INR)
  inclusions: string[]
  exclusions: string[]
  itinerary: ItineraryDay[]
  groupSize: { min: number, max: number, current: number }
  genderRatio: { male: number, female: number } (if available)
  ageRange: { min: number, max: number } (if available)
  activityTags: string[] (trekking, camping, sightseeing, etc.)
  difficultyLevel: easy | moderate | difficult
  reviews: Review[]
  averageRating: number
  availabilityStatus: available | filling_fast | full | waitlist
  bookingUrl: string
  lastUpdated: timestamp
}
```

**Aggregation Methods:**
- Direct API integration (preferred for major operators)
- Structured web scraping with scheduled refresh (every 6–12 hours)
- Manual data entry portal for operators to self-list and manage trips
- Operator onboarding dashboard

**Acceptance Criteria:**
- [ ] Data refreshes at minimum every 12 hours per operator
- [ ] Availability status is accurate within 24 hours
- [ ] Itinerary data is normalized to a standard format regardless of source
- [ ] Missing fields are clearly flagged (e.g., "Gender ratio not available")
- [ ] Operators can manually update their listings through a self-serve portal

---

#### 2.3 Trip Comparison Engine

**Description:**
Visual side-by-side comparison of up to 3 group trips across key parameters.

**Comparison Parameters:**
- Price (with inclusions breakdown)
- Itinerary day-by-day
- Operator rating and review count
- Group size and composition
- Activity tags
- Difficulty level
- Departure city and dates
- Cancellation policy

**UI:**
- Comparison table accessible from search results
- Highlight "best value," "most popular," "best reviews" labels
- Direct booking button on comparison page

**Acceptance Criteria:**
- [ ] User can add trips to comparison from search results in one tap
- [ ] Comparison page loads within 2 seconds
- [ ] Price differences are highlighted visually
- [ ] User can remove a trip from comparison without leaving the page

---

#### 2.4 Booking & Payment Integration

**Description:**
Users can book group trips directly through Trippy. For Phase 2, this can be redirect-to-operator with affiliate tracking. Later, direct booking with payment processing.

**Booking Flow:**
1. User finds trip via chatbot or search
2. Taps "Book Now" 
3. Sees booking summary: trip details, price, inclusions, cancellation policy
4. Option A: Redirect to operator website with affiliate tracking (Phase 2 MVP)
5. Option B: Direct booking with payment within app (Phase 2 enhanced)
6. Post-booking: Trip added to user's "My Trips" dashboard
7. Notification sent: "Your trip is confirmed! Here are your fellow travelers on Trippy..."

**Payment Integration (for direct booking):**
- Razorpay or PayU for Indian market
- Support: UPI, net banking, credit/debit cards, EMI
- Secure payment with PCI DSS compliance

**Acceptance Criteria:**
- [ ] Affiliate redirect correctly tracks conversions per operator
- [ ] Direct booking confirms within 30 seconds or shows pending status
- [ ] Booking confirmation sent via in-app notification + email + SMS
- [ ] Cancelled bookings trigger refund flow per operator policy
- [ ] "My Trips" dashboard shows all past and upcoming bookings

---

### Phase 2 User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|-----------|
| US-201 | Solo traveler | Ask the chatbot for group trips to my destination in natural language | I don't have to visit multiple websites |
| US-202 | Solo traveler | Compare up to 3 trips side by side | I can make an informed decision quickly |
| US-203 | Solo traveler | See the gender ratio and age range of a trip's group | I can find a trip where I'll feel comfortable |
| US-204 | Solo traveler | Check trip availability in real time | I don't waste time on fully booked trips |
| US-205 | Solo traveler | Book a trip directly from the app | I complete the entire journey in one place |
| US-206 | Group trip operator | List and manage my trips on Trippy | I get more qualified leads and bookings |
| US-207 | Solo traveler | See reviews from Trippy community members | I trust the feedback from people like me |
| US-208 | Solo traveler | Get notified when a sold-out trip opens a spot | I don't miss out on my preferred trip |

---

## Phase 3 — In-Trip Operating System

### Objective
Replace WhatsApp groups and Splitwise for the in-trip experience. Once a traveler joins a group trip (either self-organized or via a booked operator), Trippy becomes the single app for all coordination, expense management, memory logging, and social sharing.

### Core Features

#### 3.1 Group Trip Hub

**Description:**
Every trip — whether self-organized or from an operator — gets a dedicated Trip Hub on Trippy. This is the command center for the entire trip.

**Trip Hub Components:**
- Trip header: destination, dates, member list with photos
- Real-time itinerary (day-by-day, editable by trip leader)
- Group chat (native, replacing WhatsApp)
- Expense tracker
- Photo gallery
- Document storage (tickets, hotel confirmations, permits)
- Emergency contacts
- Weather widget for current destination
- Polls for group decisions

**Trip Leader Role:**
- Designated by the group or auto-assigned to trip organizer/operator
- Can edit itinerary, add documents, manage members, post announcements
- Can invite new members via link or QR code

**For Operator-Led Trips:**
- Operator creates the Trip Hub
- Invites all booked travelers via unique link
- Replaces WhatsApp group entirely
- Operator can post updates as announcements pinned to the top

**Acceptance Criteria:**
- [ ] Trip Hub is auto-created upon confirmed booking
- [ ] Trip leader can invite members via shareable link
- [ ] Itinerary updates are visible to all members in real time
- [ ] Documents can be uploaded and accessed offline
- [ ] Non-members cannot access the Trip Hub

---

#### 3.2 Expense Splitting

**Description:**
In-built expense tracking and splitting to replace Splitwise entirely within the trip context.

**Features:**
- Log an expense with: amount, description, category (food / transport / accommodation / activity / misc), who paid, who to split among
- Split options: equal split, custom split, percentage split
- Running balance per member ("You owe ₹450 to Rahul")
- Settle up feature: mark individual debts as settled
- Expense summary at trip end (PDF export)
- Support for group currency (INR default, with multi-currency for international trips in future)

**Acceptance Criteria:**
- [ ] Expense logged in under 30 seconds
- [ ] Balance updates immediately after logging
- [ ] Settle up marks individual transactions as resolved
- [ ] Export trip expense summary as PDF
- [ ] Expenses visible to all trip members

---

#### 3.3 Memory & Photo Sharing

**Description:**
A private, organized photo gallery for each trip where members can upload memories, tag locations, and create shareable trip albums.

**Features:**
- Upload photos and videos from phone gallery
- Auto-tag with location and date based on metadata
- Members can react and comment on photos
- AI-generated trip highlights reel (auto-selected best photos, compiled into a shareable video or collage)
- Option to share trip album publicly on Trippy feed
- Option to share to Instagram / other social media

**Acceptance Criteria:**
- [ ] Photo upload works on 4G and above — ⚠️ URL-based (T.12 file storage deferred); members paste public image links
- [x] AI highlights reel generated via Claude Opus 5; rule-based fallback; stored on hub — ✅ v3.21
- [x] Sharing to social media opens native share sheet (`navigator.share()`) → clipboard fallback — ✅ v3.21

#### v3.22 *(31 July 2026)* — CX audit pass, booking flow, trip-grid unification

- **21 CX audit fixes shipped:** always-visible nav, DIY destination picker (no dead-end redirect), Profile languages field + save loading state, UserProfile broken Follow UI removed (PERSONALITY_META icons), `DELETE /connections/:id` withdraw endpoint, Connections "People" title + Withdraw button, Matches empty-state → `/diy`, Stories dynamic destination filter + "Following" tab removed, MyTrips emoji+name resolution + DIY CTA, Chats timestamps, Hostels empty state, Results join confirmation dialog, Results DIY nudge on unknown-destination searches, Landing date-aware "Leaving soon" cards.
- **DIY people step — nobody on your dates:** shows up to 8 nearby travelers (same destination, other dates) via new `GET /matches/nearby?destination=X` endpoint (90-day lookahead); primary CTA "Plan & travel solo → set up my hub" creates hub directly without forcing group formation; inline date picker to re-check with new dates.
- **Results — past trips hidden:** `GET /grouptrips` and `/compare` now filter `start_date < today`; departed trips no longer appear in any search view.
- **Results — buy flow:** `POST /grouptrips/:id/book` records purchase in new `operator_bookings` table without joining the hub. "Book trip" button opens a BookModal (price, inclusions, group size, confirm); post-booking step offers "Join the travel hub →" as an explicit opt-in. Buying ≠ auto-joining the group.
- **Trip grid unified:** partner (hosted) and operator trips render in one shared grid; "Hosted on Trippy — book directly" section separator removed.
- **Hub access gated on booking:** "Join travellers' hub" button removed for unbooked users on TripDetails. Hub entry only shown after `claimed` or `confirmed` booking status.
- [ ] Private by default; public sharing requires explicit action — hub album is member-only; public sharing is manual (copy/share)
- [ ] Photos stored for minimum 12 months post-trip — N/A (URL references; actual storage at source)

---

#### 3.4 Social Feed & Community Layer

**Description:**
Public social feed where travelers share trip highlights, tips, and reviews. This builds the Trippy community and creates content that drives organic discovery and acquisition.

**Features:**
- Post trip stories (photo + caption + destination tag)
- Follow other travelers
- Like, comment, save posts
- Destination pages (aggregated posts tagged to a destination)
- Trending destinations based on community activity
- Trip reviews (structured: rating + text + photos) tied to operator or hostel

**Acceptance Criteria:**
- [ ] Post creation in under 60 seconds
- [ ] Destination pages auto-aggregate tagged posts
- [ ] Reviews are linked to specific operator trips or hostels
- [ ] Feed loads within 2 seconds

---

### Phase 3 User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|-----------|
| US-301 | Trip member | See the real-time itinerary in the app | I always know what's happening next without asking |
| US-302 | Trip member | Log and split expenses within the app | I don't need Splitwise |
| US-303 | Trip member | Upload photos to a shared trip gallery | All our memories are in one place |
| US-304 | Trip leader | Post announcements to all trip members | I don't need a WhatsApp group |
| US-305 | Solo traveler | Share my trip story to the Trippy feed | I inspire others and build my traveler profile |
| US-306 | Trip operator | Create a Trip Hub and invite all booked travelers | My trips are more organized and professional |
| US-307 | Trip member | See who owes what at trip end | Settling up is clear and conflict-free |
| US-308 | Trip member | Receive AI-generated trip highlights | I have a beautiful memory of my trip automatically |

---

## Phase 4 — Bike & Road Trip Verticals

### Objective
Extend the platform to serve two high-value adventure communities: motorcycle/bike travelers and road trip (car) travelers. These communities have unique needs around safety, route planning, and real-time coordination.

### Core Features

#### 4.1 Bike Trip Community

**Description:**
A dedicated vertical within Trippy for motorcycle enthusiasts planning multi-day bike trips.

**Unique Features for Bikers:**
- Bike profile: vehicle type, engine CC, riding experience level
- Route planning tool: mark waypoints, calculate distance, estimate fuel stops
- Ride companion matching: find bikers doing the same route around same dates
- Real-time location sharing during the ride (opt-in, shareable with group and emergency contact)
- Fuel station and mechanic finder along route (integrated maps)
- Emergency SOS button: sends location to emergency contact + nearest support
- Ride log: record route taken, distance, photos at waypoints
- Community ride posts: share completed ride with route map + photos

**Safety Features:**
- Mandatory "I've reached safely" check-in at each waypoint
- Auto-alert to emergency contact if check-in missed by more than 2 hours
- Integration with weather API for route weather warnings

**Acceptance Criteria:**
- [ ] Route planning tool works offline (cached maps)
- [ ] Real-time location sharing updates every 60 seconds
- [ ] SOS sends location within 10 seconds of activation
- [ ] Weather warnings show for next 24 hours along route
- [ ] Missed check-in alert fires within 2 hours + 5 minute grace period

---

#### 4.2 Road Trip Community

**Description:**
Same core features as bike trips but adapted for car-based road trips. Additional focus on carpooling and cost splitting for long routes.

**Unique Features for Road Trippers:**
- Car profile: vehicle type, seating capacity
- Seat availability posting ("I have 3 seats from Delhi to Manali on Aug 12")
- Carpooling matching: find others doing the same route
- Fuel cost splitting calculator
- Toll cost estimation along route
- Overnight stay suggestions along route (hostels, hotels, campsites)
- Road condition alerts (community-reported + API)

**Acceptance Criteria:**
- [ ] Seat posting visible to matched road trippers within same route parameters
- [ ] Fuel cost auto-calculated based on route distance and user-entered mileage
- [ ] Toll estimates accurate within 10% of actual cost
- [ ] Road condition alerts show for current route segment

---

### Phase 4 User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|-----------|
| US-401 | Biker | Find other bikers doing the same route | I'm not alone on dangerous mountain roads |
| US-402 | Biker | Share my real-time location with my group | They know where I am if something goes wrong |
| US-403 | Biker | Get weather warnings for my route | I can plan around bad weather |
| US-404 | Road tripper | Post my available car seats for a route | I find companions and split costs |
| US-405 | Road tripper | Calculate fuel and toll costs before I leave | I know my budget in advance |
| US-406 | Biker | Log my ride with waypoint photos | I have a record of my journey |

---

## Phase 5 — Proprietary Curated Trips

### Objective
Leverage the Trippy user base and data to launch exclusive, Trippy-branded group trips. Move from marketplace to operator, like Zostel launching Zostel Trips. This is a 18–24 month horizon goal.

### Strategic Rationale
- By Phase 2–3, Trippy has data on traveler preferences, demand signals by destination, and a captive community
- Use data to identify underserved demand (e.g., "5,000 bikers want a Ladakh trip in July but no operator offers it")
- Launch Trippy Exclusives: curated, community-driven trips managed end-to-end by Trippy
- Trippy acts as trip operator: handles logistics, accommodation, guides, and experiences
- Does not build infrastructure (no hostels, no vehicles) — coordinates and manages the supply chain end to end

### Reference Model — Zostel → Zostel Trips
The precedent for this move is Zostel, a hostel company that launched Zostel Trips to create and operate its own trips on top of its existing base and brand. Trippy follows the same logic in reverse: build the community and demand data first, then move up the value chain into operating its own trips. The difference is that Trippy starts from traveler demand data rather than physical hostel supply, which lets it launch trips that are pre-validated by real interest.

### Demand-Driven Trip Creation (the core mechanic)
- The platform continuously reads interest signals: which destinations, activity types (e.g., bike vs. group vs. trek), dates, and budgets travelers are searching for and matching around
- When a cluster of demand is detected (e.g., "5,000 users on the app are bikers, and a large subset want a specific route this season"), Trippy forms a trip around exactly that demand
- The trip is marked as a **Trippy Exclusive** — "we are running this trip, tailored to what you asked for" — and offered to the interested community segment
- Because it is built from real demand, fill rates and satisfaction should be higher than generic operator trips

### Features
- Trippy Exclusives section in app with branded trip cards
- Exclusive badge and higher trust signal
- Community voting on future destinations ("Vote for the next Exclusive trip")
- Demand-signal dashboard (internal) that surfaces where to launch the next Exclusive
- Early access for Trippy Premium members
- Post-trip data feeds back into community (photos, reviews, itinerary improvements)

### Revenue Impact
- Higher margin than commission-based affiliate model (30–50% gross margin vs. 5–10% commission)
- Full control of customer experience and brand
- Data flywheel: more trips = more data = better, better-targeted future trips

---

## AI Architecture & Chatbot Specifications

### AI Stack Recommendation
- **LLM:** Anthropic Claude via API. Use **Claude Sonnet** (`claude-sonnet-4-6`) as the default workhorse for chatbot search, matching explanations, and itinerary generation — it is fast and cost-effective at consumer scale. Reserve **Claude Opus** (the most capable tier) for complex, low-frequency tasks such as generating detailed multi-day itineraries or nuanced demand analysis where quality matters more than cost.
- **Embedding model:** For semantic search across trip database
- **Vector database:** Pinecone or Weaviate for trip and user embeddings
- **Backend:** Node.js / Python FastAPI
- **Frontend:** React Native (iOS + Android) or React.js (web MVP)

### Chatbot System Prompt Framework
The chatbot should be initialized with:
- Full trip database context (embedded)
- User profile and preference context
- Conversation history
- Current date and season context
- Available operators and their reliability scores

### Core AI Features

#### Trip Discovery AI
- Input: Natural language query from user
- Processing: Extract destination, dates, budget, activity preferences, group composition preferences
- Output: Ranked list of matching trips with explanation of ranking

#### Compatibility Matching AI
- Input: Two user profiles
- Processing: Calculate compatibility score across travel style, interests, budget, destination overlap
- Output: Compatibility percentage + brief explanation ("You both love trekking and have similar budgets")

#### Itinerary Generation AI
- Input: Destination, duration, group size, preferences, budget
- Processing: Generate custom day-by-day itinerary
- Output: Structured itinerary with activity suggestions, meal spots, accommodation options, estimated costs

#### Budget Comparison AI
- Input: User's destination and travel preferences
- Processing: Compare DIY travel cost vs. joining group trip cost
- Output: Side-by-side budget breakdown with pros/cons of each approach

#### v3.22 *(31 July 2026)* — CX audit pass, booking flow, trip grid unification

- **21 CX fixes shipped** across nav, DIY, Profile, UserProfile, Connections, Matches, Stories, MyTrips, Chats, Hostels, Results
- **DIY people step**: "nobody on your dates" empty state shows nearby travelers (new `GET /matches/nearby?destination=X`, 90-day lookahead) + plan-solo CTA; inline date-range picker to re-check without leaving the page
- **Results — past trips filtered**: `GET /grouptrips` and `/compare` now exclude trips where `start_date < today`
- **Results — booking flow**: `POST /grouptrips/:id/book` records purchase in new `operator_bookings` table without auto-joining hub; BookModal confirm step → optional hub-join step; "Book trip" replaces "Join trip"
- **Trip grid unified**: partner and operator trips render in one grid; "Hosted on Trippy" section separator removed
- **Hub access gated**: "Join travellers' hub" button only visible after booking is confirmed/claimed; `POST /discover/trips/:slug/join` no longer reachable from UI for unbooked users
- **`DELETE /connections/:id`**: withdraw outgoing pending connection request (sender only)
- **Profile**: languages field added to edit form; save button shows loading/disabled state
- **Connections page**: renamed "People"; Withdraw button on outgoing pending requests
- **Stories**: destination filter is now dynamic (fetched from `/destinations`); broken "Following" tab removed
- **MyTrips**: destination resolves to emoji + name (was raw slug); DIY CTA in empty state
- **Chats**: relative timestamps in chat list
- **Hostels**: empty state when filter returns 0 results
- **UserProfile**: removed broken Follow/Unfollow UI; personality tag uses PERSONALITY_META icons

#### Highlights Reel AI ✅ (v3.21 — text story + IG caption; video/collage deferred)
- Input: Trip context — group name/destination/dates, member names, photo captions, itinerary stops, announcements, total spend
- Processing: Claude Opus 5 (`thinking: adaptive`) generates story paragraph + key-moments bullets + Instagram caption; rule-based fallback when API key absent
- Output: `{story, moments[], caption}` stored on `groups.highlights_reel`; frontend share via Web Share API / clipboard

---

## Technical Requirements

### Current MVP Stack (as built, v3.0)

| Layer | As built |
|-------|----------|
| Web (all three apps) | React 18 + Vite + TypeScript, react-router — one SPA serving `/`, `/partner`, `/admin` |
| Backend | Node.js + Express + TypeScript (single API on `/api`, `/api/partner`, `/api/admin`) |
| Database | SQLite via Node's built-in `node:sqlite` (canonical entities shared by all apps; idempotent schema + in-place migrations) |
| Auth | Email + password (scrypt) with namespaced JWTs per app; admin sessions are server-tracked and revocable |
| RBAC | DB-driven roles/permissions, enforced server-side per route |
| Audit & analytics | Immutable `admin_audit_logs`, `login_events`, `sessions`, `trip_outbound_clicks` |
| Payments | None processed — validated external https payment links with tracked redirects |
| Tests | `node:test` suites: consumer auth, partner CRM, admin console |

The stack below remains the **production target**; the MVP was intentionally built dependency-light so each piece swaps in cleanly (SQLite → PostgreSQL/Supabase, polling → Realtime, simulated services → Twilio/Razorpay/Claude API).

### Platform (production target)
- **Mobile App:** React Native (iOS and Android from single codebase)
- **Web App:** React.js (progressive web app for wider reach)
- **Backend:** Node.js with Express or Python FastAPI
- **Database:** PostgreSQL (relational data) + MongoDB (trip content, itineraries) + Redis (caching, sessions)
- **File Storage:** AWS S3 or Cloudflare R2 for photos and documents
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Maps:** Google Maps API or Mapbox
- **Payments:** Razorpay (India-first)
- **Authentication:** Email + password (live today) + Google/Apple SSO; phone OTP as a later re-addition (optional phone already captured at signup)
- **AI:** Anthropic Claude API
- **Analytics:** Mixpanel or Amplitude

### API Integrations Required
- Hostelworld API (hostel listings)
- Zostel API or scraper (hostel + trip listings)
- GoStops API or scraper
- Wanderon scraper / API
- TripDay scraper / API
- Google Maps / Mapbox (navigation, location)
- OpenWeatherMap or Weatherstack (weather)
- Razorpay (payments)
- Firebase (push notifications, analytics)
- Twilio or MSG91 (SMS OTP)
- Cloudinary (image optimization and storage)

### Performance Requirements
- App cold start: under 3 seconds
- Chatbot response: under 3 seconds for search results
- Image upload: under 5 seconds for a 5MB photo on 4G
- Real-time location update: every 60 seconds
- Push notification delivery: within 30 seconds

### Security Requirements
- All API calls over HTTPS
- User data encrypted at rest and in transit
- PCI DSS compliance for payment flows
- GDPR-ready data architecture (user data export + deletion)
- Rate limiting on all public APIs
- Input sanitization to prevent injection attacks

---

## Success Metrics

### Phase 1 Metrics (Community & Matchmaking)

| Metric | Target at 3 months | Target at 6 months |
|--------|-------------------|-------------------|
| Total registered users | 5,000 | 25,000 |
| Profile completion rate | >70% | >75% |
| Match connection rate (% who connect with at least 1 traveler) | >30% | >40% |
| DAU/MAU ratio | >15% | >20% |
| Average session length | >4 minutes | >5 minutes |
| Hostel stay logs per month | 500 | 2,500 |
| User-reported meetups (actual in-person) | 100 | 500 |

### Phase 2 Metrics (Group Trip Aggregator)

| Metric | Target at 3 months post-launch | Target at 6 months |
|--------|-------------------------------|-------------------|
| Trips indexed on platform | 500 | 2,000 |
| Chatbot queries per day | 500 | 3,000 |
| Chatbot to booking conversion rate | >5% | >8% |
| Booking GMV per month | ₹10 lakhs | ₹50 lakhs |
| Operator partners onboarded | 10 | 30 |
| Average rating of booked trips (post-trip) | >4.0/5 | >4.2/5 |

### Phase 3 Metrics (In-Trip OS)

| Metric | Target |
|--------|--------|
| % of booked trips that activate Trip Hub | >60% |
| Expenses logged per trip | >5 per trip on average |
| Photos uploaded per trip | >20 per trip on average |
| NPS score from trip users | >50 |
| Trip Hub retention (return to app during trip) | >80% daily |

### North Star Metric
**Number of solo travelers who had a meaningful travel experience facilitated by Trippy per month** (measured by: trip completed + at least 1 connection made + positive post-trip review)

---

## Revenue Model

### Phase 1 Revenue
- **Hostel booking commission:** 8–12% on bookings made through the app
- **Premium membership (Trippy Pro):** ₹299/month — unlimited matches, priority in search results, early access to group trips, advanced filters
- **Hostel featured listings:** ₹5,000–15,000/month for premium placement

### Phase 2 Revenue
- **Group trip booking commission:** 5–10% of booking value per transaction
- **Operator SaaS subscription:** ₹2,000–5,000/month for operators to self-manage listings and access lead data
- **Lead generation fees:** Charge operators per qualified lead sent (if not taking commission on full booking)
- **Featured trip placement:** Operators pay for top placement in chatbot results

### Phase 3 Revenue
- **Premium membership upsell:** Pro users get access to Trip Hub premium features (AI highlights reel, unlimited photo storage)
- **Expense report exports:** Paid feature for detailed PDF exports

### Phase 4 Revenue
- **Bike/road trip premium features:** Route planning, offline maps, SOS features in pro tier
- **Carpooling transaction fee:** Small fee on matched carpooling bookings

### Phase 5 Revenue
- **Proprietary trip margin:** 30–50% gross margin on Trippy Exclusive trips (vs. 5–10% commission on third-party trips)
- **Sponsorships:** Gear brands, travel insurance, adventure equipment companies
- **Travel insurance:** Embedded travel insurance offering per trip

---

## Non-Goals

The following are explicitly out of scope for the current roadmap:

1. **Building physical infrastructure** — Trippy will not build, own, or operate hostels, hotels, or transportation. It manages the experience, not the supply.

2. **International market expansion in Phase 1** — The initial product is India-focused. International expansion is a Phase 3+ consideration.

3. **Flight and hotel (non-hostel) booking aggregation** — Trippy is adventure and community-first. OTA functionality for flights and luxury hotels is not in scope.

4. **Corporate or business travel** — The platform is built for leisure and adventure travel. B2B or corporate travel is not a target use case.

5. **Real-time navigation (like Google Maps)** — The platform will provide route planning and suggest navigation apps, but will not build a turn-by-turn navigation engine from scratch.

---

## Open Questions

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| OQ-1 | Which operators are open to direct API integration vs. requiring scraping? | Business Development | Phase 2 |
| OQ-2 | What is the legal framework for facilitating person-to-person meetups? (Liability, safety) | Legal | Phase 1 |
| OQ-3 | Should real-time location sharing in bike trips store historical location data? For how long? | Legal + Engineering | Phase 4 |
| OQ-4 | What is the minimum viable operator data set needed before launching the chatbot? | Product | Phase 2 |
| OQ-5 | Do we build a native payment flow in Phase 2 or redirect to operators? | Product + Engineering | Phase 2 |
| OQ-6 | Which hostel chains will be first partnership targets? | Business Development | Phase 1 |
| OQ-7 | Should user location be tracked passively or only when shared explicitly? | Product + Legal | Phase 1 |
| OQ-8 | How do we handle currency conversion for international group trips in Phase 4+? | Engineering | Phase 4 |

---

## Implementation Status *(v3.22 — 31 July 2026)*

| Area | Status | Notes |
|------|--------|-------|
| Consumer: profiles, matching, requests, chat | ✅ Live | Languages field in profile edit; cancel/withdraw pending requests (`DELETE /connections/:id`); personality icons from PERSONALITY_META |
| Consumer: search-first discovery (Landing → Results → DIY rail) | ✅ Live | Past trips filtered; unified trip grid (no partner/operator split); book modal with optional hub join |
| Consumer: DIY path (hostel → people → group → itinerary) | ✅ Live | Destination picker entry; nearby-traveler empty state + plan-solo CTA; `GET /matches/nearby`; hostel stay wired on group creation |
| Consumer: hostel discovery | ✅ Live | Empty state when filter returns 0 results |
| Consumer: hosted trip details + Book Now redirect | ✅ Live | Hub access gated on booking — "Join hub" button only after claim/confirm |
| Consumer: operator trip booking flow | ✅ Live | `POST /grouptrips/:id/book` + `operator_bookings` table; BookModal (confirm + optional hub join); buying ≠ auto-joining group |
| Consumer: nav & global UX | ✅ Live | Always-visible topnav; Discover|My Trips|Chats|People|Stories|Hostels order; bottom nav My Trips tab; 21 CX audit fixes shipped July 2026 |
| Consumer: trip hub access control | ✅ Live | Hub join gated on booking (confirmed/claimed); no free hub entry from trip detail page |
| Partner CRM (1.7) | ✅ Live | Multi-tenant; publish validation; external payment links |
| Admin Console (1.8) | ✅ Live | RBAC, audit logs, notes, exports, global search |
| Auth: email + password (1.9) | ✅ Live | Optional phone captured; OTP login deferred |
| Design System Foundation v1.0 (tokens across all 3 apps) | ✅ Live | `trippy/design/design-system/` + tokenized `styles.css` |
| Marketing website (`trippy/website/`) | ✅ Live | Static homepage from the "Trippy Homepage" design; dev port 5174 |
| Phosphor icon migration | 🔶 Started | Brand mark, admin nav, verified badge done; remaining content emoji migrate gradually |
| Guest browsing (no auth gate on discovery) | ⏳ Deferred | Audit P0 #1 — needs auth-flow rework; `/trip/:slug` already public |
| Payments processed by Trippy | ❌ Not in Phase 1 | External host payment pages only (by design) |
| SMS OTP, real ID verification, push notifications | 🔶 Simulated / deferred | Production services slot in without redesign |
| External operator aggregation (Wanderon etc.) | ⏳ Phase 2 | Partner CRM covers self-listed supply today |
| AI chatbot, in-trip expenses/photos, verticals, exclusives | ⏳ Phases 2–5 | Unchanged roadmap |

**PRD maintenance rule:** this document is a living spec. Any change to product scope — new application, feature, descoped item, or architectural shift — must be reflected here (changelog + relevant sections) in the same change set, and pushed to GitHub.

---

## Acceptance Criteria Summary

### Minimum Viable Product (MVP) for Phase 1 Launch

The MVP is ready to launch when ALL of the following are true:

- [ ] User can sign up, verify phone, and complete full profile
- [ ] User can create an upcoming trip with destination and dates
- [ ] User sees at least 3 matched traveler suggestions for any popular destination
- [ ] User can send and receive travel connection requests
- [ ] Chat unlocks only after mutual connection
- [ ] User can search and browse hostels at a destination
- [ ] User can log hostel stay
- [ ] User can see how many Trippy members are at a given hostel (opt-in visibility)
- [ ] Report and block functionality works
- [ ] Push notifications deliver for new matches and messages
- [ ] App loads in under 3 seconds on mid-range Android device
- [ ] No critical security vulnerabilities in authentication or messaging

---

## Appendix: Suggested Tech Stack for AI-Assisted Development

For Claude Code to build this effectively, the following stack is recommended:

```
Frontend:      React Native (Expo) — iOS + Android
Backend:       Node.js + Express + TypeScript
Database:      PostgreSQL (Supabase for managed hosting)
Auth:          Supabase Auth (phone OTP + social)
File Storage:  Supabase Storage or Cloudflare R2
Realtime:      Supabase Realtime (for chat + live updates)
AI:            Anthropic Claude API (claude-sonnet-4-6)
Maps:          Google Maps SDK
Payments:      Razorpay SDK
Notifications: Expo Push Notifications + FCM
Hosting:       Railway or Render (backend), Expo EAS (mobile builds)
Analytics:     Posthog (self-hostable, privacy-friendly)
```

This stack is chosen because:
- Supabase provides database, auth, storage, and realtime in one managed service — minimizing infrastructure setup
- React Native with Expo allows single codebase for iOS and Android
- All services have excellent documentation and Claude Code compatibility
- Minimal DevOps overhead — suitable for AI-first development

---

*Document Version 3.22 (Living) — originally audited line-by-line against the full product discovery session (v2.0), now maintained as a living spec that tracks what has actually shipped. Phase 1 is live as three applications on one canonical backend: the Consumer app, the Partner CRM / Host Portal, and the internal Admin Console. Every future scope change — additions, descopes, and architectural shifts — must be recorded in the changelog and reflected in the relevant sections of this document, then pushed to GitHub.*
