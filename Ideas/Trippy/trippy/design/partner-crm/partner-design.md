# Partner CRM — UX Audit & Redesign

> Sources: [`Partner CRM UX Audit.dc.html`](./Partner%20CRM%20UX%20Audit.dc.html) (per-screen findings + revamp briefs) and [`Partner CRM Redesign.dc.html`](./Partner%20CRM%20Redesign.dc.html) (screens implementing the P0 fixes).

## Direction

The Partner CRM is an **opaque SaaS surface** (per the design system) used by trip hosts on desktop first. The audit's core finding: the portal was a bare topbar + table with no orientation for new partners, no sense of progress while building a trip, and a confusing in-place preview. Fixes were incorporated incrementally without breaking the existing publish flow.

## P0 fixes — implementation status (July 2026)

| # | Fix (from audit) | Status | Where |
|---|---|---|---|
| 1 | First-run welcome / getting-started checklist | ✅ Shipped | `web/src/partner/Dashboard.tsx` — `.crm-welcome` banner when the org has 0 trips or 0 published: create → complete (itinerary/pricing/payment link) → publish, with live done-states |
| 2 | Trip editor progress: section checklist + completion % | ✅ Shipped | `web/src/partner/TripEditor.tsx` — sticky `.crm-editor-rail` (Basic info / Pricing / Payment link / Itinerary) with per-section done icons, % progress bar, smooth-scroll anchors. Mirrors server publish validation. Hidden ≤900px |
| 3 | Payment link guidance (partners don't know what to paste) | ✅ Shipped | `TripEditor.tsx` — `.crm-payguide` card: create a no-code payment page (Razorpay Payment Pages / Instamojo Smart Links / Stripe Payment Links), paste the https link; Trippy never touches the money |
| 4 | Left sidebar shell (org anchor + room to grow) | ✅ Shipped | `web/src/partner/PartnerApp.tsx` — `.crm-sidebar` with My trips (active) + greyed coming-soon modules (Analytics, Organisation, Team, Payment links). Hidden ≤860px — mobile keeps the topbar-only shell |
| 5 | Preview confusion (in-place navigation lost editor state) | ✅ Shipped | Preview opens in a **new tab** from the editor action bar; `Preview.tsx` gets an "Edit this trip" button; the traveller-view ribbon copy now says to close the tab to return to the editor |

## Notable items still open

Trip duplication, image upload (URLs only today), draft scheduling/publish-at, analytics module (clicks per trip exists on the admin side), team management (multi-user orgs exist in the schema; invite flow is admin-driven), payment-link click tracking surfaced to partners.
