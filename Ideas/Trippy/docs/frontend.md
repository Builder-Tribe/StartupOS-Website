# Frontend Guide & Reuse Catalogue

> Truth source: `trippy/web/src/`. This is the "reuse before generating" reference — check here
> before writing any new component, helper, or CSS. Update it when shared code is added or changed.

## One SPA, three apps

`web/src/main.tsx` mounts a single React app; path decides the surface: `/admin/*` →
`AdminApp.tsx`, `/partner/*` → `PartnerApp.tsx`, everything else → `App.tsx` (consumer).
Each surface has its own auth context, API client, and CSS namespace. **Never import across
surfaces except from the shared root files listed below.**

| Surface | CSS namespace | API client | Auth context |
|---|---|---|---|
| Consumer (`pages/`) | unprefixed classes in `styles.css` | `api.ts` (`api.get/post/put/del`) | `useAuth()` in `App.tsx` |
| Partner (`partner/`) | `crm-*` in `styles.css` | `partner/partnerApi.ts` (`papi`) | `usePartner()` |
| Admin (`admin/`) | `a-*` in `admin/admin.css` | `admin/adminApi.ts` (`aapi`) | `usePerms()` via `AdminApp` |

## Design system (do not invent styles)

Tokens live in `styles.css` `:root` — three layers (primitives → semantics → components); specs in
[`trippy/design/design-system/`](../trippy/design/design-system/design-system.md) (`tokens.json`,
`components.md`). Brand teal `#0e9f8f`, coral `#f2683c`, ink `#14202a`; Bricolage Grotesque
(display) + Hanken Grotesque (text); Phosphor icons (`ph-bold` default, `ph-fill` for status only).
**Always use `var(--…)` tokens — hard-coded hex in component CSS is a defect.** Per-surface
character: consumer is glassmorphic, partner is opaque SaaS, admin has the dark `#14202a` sidebar.
New CSS is appended to the owning stylesheet under a dated/feature comment header, mobile-first
where the surface is consumer.

## Shared root files (usable by all surfaces)

| File | Exports | Use for |
|---|---|---|
| `api.ts` | `api` (fetch wrapper + ApiError), `getToken/setToken`, `fmtDate`, `parseDbDate`, `inr` | All consumer HTTP + date/₹ formatting everywhere |
| `components.tsx` | `PartnerTripCard`, `BrandMark`, `useToast`, `Avatar`, `VerifiedBadges`, `ScorePill`, `TrustStars`, `Chips`, `UserLink`, `Empty`, `Spinner` | Generic UI; toasts; user display |
| `TripDetailsView.tsx` | trip detail renderer (`mode="preview"` prop, `withNav`, sticky book bar) | Consumer trip page **and** partner preview — one renderer, never fork it |
| `BottomNav.tsx` | consumer mobile bottom nav (≤760px) | Extend tabs here, don't add second navs |

## Admin UI kit (`admin/ui.tsx` + `adminApi.ts`) — the crown jewels

**Never rebuild any of these.** Extend with props if a page needs more.

- `DataTable<T>` — server-paginated, URL-persisted list: search, dropdown `filters`,
  `extraControls` (e.g. date inputs) + `extraParamKeys`, sortable columns, `rowLink`,
  `bulkActions` (checkbox column + bulk bar + confirm), empty/error/loading states.
- Dialogs: `ConfirmDialog` (danger, `requireReason`), `HighRiskDialog` (typed entity-name confirm).
- Display: `PageHeader` (breadcrumbs/actions), `Section`, `KeyVal`, `StatusBadge`, `MetricCard`,
  `EntityLink`, `Empty`, `ErrorState`, `Spinner`, `fmtDate/fmtDateTime`.
- Domain widgets: `InternalNotes`, `ActivityTimeline`.
- RBAC: `Can` component, `usePerms()` hook.
- `adminApi.ts`: `aapi` client, `downloadCsv`, `qs`, `bulkRun` (per-row bulk with partial-failure
  reporting), token helpers.

## Partner patterns

- `TripEditor.tsx`: single-scroll sections + 700ms debounced autosave + section checklist rail
  (completion mirrors server publish validation) + sticky action bar. New trip fields: add to the
  `toForm` mapping, a section, the server column map in `routes/partner.ts`, and (if publish-
  gating) `lib/trips.ts` validation — in one change.
- Dashboard first-run checklist and sidebar shell are additive patterns; keep "coming soon" nav
  items greyed rather than hiding future modules.

## Consumer patterns

- Mobile-web first: bottom nav ≤760px; desktop topnav untouched. Sticky book bar on trip details
  ≤820px. Compatibility scores always carry an AI explanation (`.ai-explain`) — never a bare number.
- Search: free-text destination combobox on `Landing.tsx`; `Results.tsx` has three modes
  (known destination / unknown "we don't cover X yet" fallback / blank = anywhere) with date
  filtering (±3-day tolerance; server-side via `/discover/trips?from&to`).
- Date math near timezones: use noon-anchored `Date` construction (see `shiftDays` in
  `Results.tsx`) to avoid UTC off-by-one for IST.
- The traveller journey: joining any trip (hosted / operator / invite link) lands in its
  **Trip Hub** (`GroupHub.tsx` — chat, members, itinerary, announcements, polls, invite link);
  `MyTrips.tsx` (`/mytrips`) lists every hub with source-typed cards. Extend the hub rather than
  building per-trip-type pages; hub creation is server-side in `lib/hubs.ts`.
- Phase 4 Bike & Road Trips (`/adventures`): `Adventures.tsx` (landing + route creation),
  `AdventureRoute.tsx` (live location map, check-ins, SOS alert, carpool management),
  `AdventureBikeProfile.tsx` / `AdventureCarProfile.tsx` (vehicle setup),
  `AdventureCompanions.tsx` (matching riders/drivers), `AdventureCarpoolSearch.tsx` (seat finder).

## State management rules

React context for session state; local `useState` + `useEffect` fetch for data;
**URL search params are the state for list filters** (admin DataTable) so views are shareable.
No Redux/Zustand/React Query/SWR — do not add state or fetching libraries.

## Adding UI without regressions

1. Find the closest existing page and copy its structure/conventions.
2. Pull from the catalogues above; only write new components when nothing fits — and if it's
   generic, put it in the surface's shared file and add it to this document.
3. Style with tokens; add CSS at the end of the owning stylesheet; test ≤760px for consumer.
4. Gate admin UI with `Can`/`usePerms`; wire dangerous actions through the dialog contract
   (see [auth.md](auth.md)).
