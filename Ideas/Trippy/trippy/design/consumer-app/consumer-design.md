# Consumer App — UX Audit & Redesign

> Sources: [`Consumer App UX Audit.dc.html`](./Consumer%20App%20UX%20Audit.dc.html) (full audit: 5 P0 / 11 P1 / 9 P2, per-screen findings, revamp briefs, nav architecture, onboarding spec) and [`Consumer App Redesign.dc.html`](./Consumer%20App%20Redesign.dc.html) (6 mobile screens implementing the P0 fixes).

## Direction

Trippy consumer is **mobile-web first, web supported**: a bottom nav on small screens, the existing topnav on desktop. Incorporated incrementally without breaking existing flows.

## P0 fixes — implementation status (July 2026)

| # | Fix (from audit) | Status | Where |
|---|---|---|---|
| 1 | Remove auth gate from discovery (guest browsing) | ✅ Shipped | v3.10 — landing, search, results, trip pages, hostels all public; actions gate to signup; guest shell with conversion bar |
| 2 | Mobile bottom nav (5 tabs, coral/teal FAB, badges) | ✅ Shipped | `web/src/BottomNav.tsx` — Discover · Matches (live request badge) · + sheet (Browse / DIY / Hostels) · Chats · Profile. ≤760px only; desktop topnav unchanged. Hidden inside chat threads |
| 3 | Chat locked state + report/block within 2 taps | ✅ Shipped | `UserProfile.tsx` — connection-aware chat card ("Chat unlocks when you both connect"), send/accept request inline, ⋯ bottom sheet with Report / Block |
| 4 | AI explanation on compatibility score (never a bare number) | ✅ Shipped | `Matches.tsx` + DIY people step — `.ai-explain` insight box (teal ≥70, amber below), sentence framing, fallback copy |
| 5 | Onboarding step 5 (first trip) + Travel Personality reveal | ✅ Shipped | `Onboarding.tsx` — 5-step wizard with labelled progress bars; step 5 creates the trip (skippable); full-screen reveal with per-type copy + "See my first matches" |
| + | Sticky Book Now bar on mobile trip details (P1) | ✅ Shipped | `TripDetailsView.tsx` — fixed bottom bar ≤820px with price + CTA; lifts above the bottom nav when signed in |

## Notable P1/P2 items still open

Guest browsing (P0 #1), Requests merged into Matches as a sub-tab, chat last-message previews/unread counts, match filters, DIY localStorage draft persistence, long-press pin on mobile, hostel privacy toggle surfacing, "who's going" social proof on trip cards.
