# API Reference

> Truth source: `trippy/server/src/routes/*.ts`. Mount points in `src/index.ts`. This is a map,
> not a mirror — for exact request/response shapes read the route + the `lib/*` shape function it
> calls. Update this file whenever an endpoint is added, removed, or changes contract.

## Conventions

- Base URL: `/api`. JSON in/out, `camelCase` keys. Auth via `Authorization: Bearer <JWT>`.
- Three token realms — tokens are **not interchangeable** (see [auth.md](auth.md)):
  consumer (`localStorage.tt_token`), partner (`tt_partner_token`, JWT `kind: 'partner'`),
  admin (`tt_admin_token`, `kind: 'admin'`, server-tracked session).
- Errors: `4xx/5xx` with `{ error: string }` or `{ errors: string[] }` (validation lists).
- Admin list endpoints share a contract: query `page, pageSize (≤200, default 20), q, sort, dir`
  + per-resource filters → `{ rows, total, page, pageSize, pages }`.
- Dates are ISO `YYYY-MM-DD` strings; timestamps are SQLite `datetime('now')` UTC strings.

## Public (no auth) — guest browsing

Read-only discovery is open to guests (v3.10): `GET /destinations`, `GET /grouptrips`,
`GET /compare`, `GET /hostels`, `GET /hostels/:id` (member **count** only — profiles need auth,
via `optionalAuth` in `lib/auth.ts`), plus everything below. **Mount-order rule:** routers with
public endpoints mount before `social`/`chats` in `index.ts` (their router-wide `requireAuth`
would 401 guest requests passing through); `hostels`/`diy` gate writes per-route, never router-wide.

### `publicTrips.ts`, `auth.ts`, `partner.ts (auth)`

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Liveness check |
| `POST /api/auth/signup` · `POST /api/auth/login` | Consumer account (email+password; optional `phone` at signup) |
| `POST /api/partner/auth/signup` · `login` · `logout` | Partner org + first admin; org login |
| `GET /api/destinations/trending` | Top 6 destinations by community activity (stories×2 + reviews×3 + bookings×4) in the last 30 days. Returns `[{slug, name, state, emoji, storyCount, reviewCount, bookingCount}]`. Empty when no recent activity. |
| `GET /api/discover/trips` | Published hosted trips. Filters: `q`, `destinationSlug`, `category`, `minPrice`, `maxPrice`, `from`/`to` (date window, ±3-day tolerance, flexible-date trips always match), `includePast=1` |
| `GET /api/discover/trips/:slugOrId` | Public trip detail (published only; strips `paymentUrl`, exposes `bookable`) |
| `POST /api/discover/trips/:slugOrId/track-click` | Records booking intent, returns validated https payment URL (attributes consumer if token present) |
| `POST /api/discover/trips/:slugOrId/join` | **Requires consumer token (401 otherwise)** — joins the trip's travellers' hub, returns `{ groupId, chatId }` |
| `POST .../claim-booking` · `.../cancel-booking` · `.../waitlist` | **Consumer token required** — bookings backbone: claim "I paid" (holds a seat, joins the hub, 400 if full/duplicate), cancel (frees seat → wakes waitlist), join waitlist (full trips only). Trip cards/detail carry `availability` `{capacity, confirmed, claimed, seatsLeft, full, fillingFast}`; detail adds `myBookingStatus` + `onWaitlist` for the viewer |

## Consumer (requireAuth) — `social.ts`, `chats.ts`, `hostels.ts`, `diy.ts`

| Area | Endpoints |
|---|---|
| Profile | `GET/PUT /me` (incl. `pastTrips` validated list, `socials` handles-only, emergency contact private), `POST /me/verify-id` (doc type + last-4 → pending admin review; 400 on duplicate/verified), `GET /suggest-interests`, `GET /home` |
| Travel plans | `GET/POST /trips`, `DELETE /trips/:id` |
| Matching | `GET /matches` (destination + ±3-day overlap + compatibility score from `lib/matching.ts`; secondary filters `gender`, `budget`, `ageMin`/`ageMax`, `verifiedOnly=1`). `GET /matches/nearby?destination=X` — travelers going to X in the next 90 days on any dates (up to 8, blocked users excluded); used by the DIY people-step empty state to show "going on other dates" alternatives. Returns `[{...publicUser, trip:{startDate,endDate}, connection?}]`. |
| Connections | `GET/POST /connections`, `POST /connections/:id/respond` (mutual accept unlocks chat), `DELETE /connections/:id` (withdraw an outgoing pending request; sender only; 404 if already responded or not found) |
| Other users | `GET /users/:id` (public shape + `vouches`, `canVouch`, `hasVouched`), `POST /users/:id/vouch` (shared-trip companions only; 1–5 rating, one changeable vouch per pair; recomputes trust score), `POST /users/:id/report`, `POST /users/:id/block` |
| Notifications | `GET /notifications` (latest 30 + unread count), `POST /notifications/read-all` — in-app only today; push (1.4.7) will reuse the same table |
| Chat | `GET /chats`, `GET /chats/:id` (group chats include a `polls` map for inline poll messages), `POST /chats/:id/messages` (types: `text`, `location` — JSON `{lat,lng,name}` or `{name}`), `POST /chats/:id/messages/:mid/pin` (clients poll). Message types rendered specially: `system`, `announcement`, `poll`, `location` |
| Hostels & Stays | `GET /hostels?destination=` (returns seeded hostels + dynamic Airbnb/Hotel placeholders; user-submitted stays filtered to creator only — `source='user_submitted' AND created_by_user_id = me`), `GET /hostels/:id`, `POST /hostels` (submit own stay: `destination`, `name`, `propertyType`, `pricePerNight` required; sets `created_by_user_id`), `PUT /hostels/:id` (edit own stay — ownership enforced server-side; 403 if not creator), `DELETE /hostels/:id` (soft-delete own stay; 403 if not creator), `POST /hostels/:id/stay`, `DELETE /stays/:id`, `PUT /stays/:id/visibility`. Response shape includes `isMine`, `canEdit`, `canDelete`, `createdByUserId` flags. |
| DIY | `GET /destinations`, `GET /grouptrips`, `GET /compare?destination&days` (DIY-vs-group cost model), `GET/POST /groups`, `GET /groups/:id`, `POST /groups/:id/members`, `POST/DELETE .../itinerary(...)`, `POST /groups/:id/suggest-itinerary` |
| My Trips & hubs | `GET /mytrips` (all hubs/groups with source labels + past flag), `POST /grouptrips/:id/book` (record purchase in `operator_bookings` without joining the hub; 400 if trip already departed; idempotent — returns existing booking), `POST /grouptrips/:id/join` (join the operator trip's travellers' hub; call after booking) |
| Trip Hub | `POST /groups/:id/announce` (leader-only, pinned into hub chat), `POST /groups/:id/polls` (also posts an inline `poll` message to the group chat), `POST /groups/:id/polls/:pollId/vote` (one changeable vote), `POST /groups/:id/polls/:pollId/close` (creator/leader), `PUT /groups/:id/itinerary/:itemId` (any member edits a stop), `GET /groups/:id/invite` (member → code), `GET /invites/:code` (preview), `POST /invites/:code/join` (bypasses connection gate) |
| Documents | `GET /groups/:id/documents` — list hub docs (newest first, each with `canDelete` flag). `POST /groups/:id/documents` — add doc (`docType`, `name`, optional `refNumber`, `date`, `url`, `notes`); URL must start with `http`. `DELETE /groups/:id/documents/:docId` — own doc or leader only. |
| Photos | `GET /groups/:id/photos` — list trip photos (sorted by `takenAt` desc, each with `canDelete` flag). `POST /groups/:id/photos` — add photo (`url` required, optional `caption`, `takenAt`); URL must start with `http`. `DELETE /groups/:id/photos/:photoId` — own photo or leader only. |
| Highlights | `GET /groups/:id/highlights` — fetch stored highlights reel; `null` if never generated. `POST /groups/:id/highlights` — generate (or regenerate) AI trip story via Claude Opus 5; falls back to rule-based when `ANTHROPIC_API_KEY` absent. Returns `{story, moments[], caption, aiPowered, generatedAt}`. Stored on the group; calling again overwrites. |
| Weather | `GET /api/destinations/:slug/weather` — current conditions + 4-day forecast from Open-Meteo (30-min server cache). Returns `{current: {temp,humidity,windSpeed,label,emoji}, daily: [{date,max,min,precipitation,label,emoji}×4]}`. 404 if the slug has no coordinates registered in `DEST_COORDS`. |
| Adventures (Phase 4) | `GET/PUT /adventures/bike/profile`, `GET/PUT /adventures/car/profile`, `GET/POST /adventures/routes`, `GET/PUT/DELETE /adventures/routes/:id`, `GET/POST /adventures/routes/:id/location`, `GET/POST /adventures/routes/:id/checkins`, `POST /adventures/routes/:id/sos`, `GET /adventures/routes/:id/companions`, `POST /adventures/routes/:id/carpool/request`, `PUT /adventures/routes/:id/carpool/:reqId` |

## Partner CRM (partner JWT; **every query org-scoped**) — `partner.ts`

| Area | Endpoints |
|---|---|
| Session | `GET /api/partner/me`, `GET /api/partner/org` |
| Trips | `GET /trips` (list + dashboard summary + `hasPayment`), `POST /trips` (create draft), `GET/PUT/DELETE /trips/:id`, `GET /trips/:id/preview` |
| Itinerary | `POST /trips/:id/itinerary`, `PUT/DELETE /trips/:id/itinerary/:dayId`, `PUT /trips/:id/itinerary-reorder` |
| Lifecycle | `POST /trips/:id/publish` (server-side validation gate — see `lib/trips.ts`), `POST /trips/:id/unpublish` |
| Bookings | `GET /trips/:id/bookings` (claims/confirmed + availability + waitlist count), `POST /trips/:id/bookings/:bookingId/decide` (`confirm`/`reject` — notifies the traveller; reject wakes the waitlist) |
| Trip Hub | `GET /trips/:id/hub` — operator view: hub members with booking status + recent announcements. Returns `{hubCreated, groupId, chatId, memberCount, confirmedCount, claimedCount, members, announcements}`. Empty `hubCreated:false` until the first traveller claims a booking. `POST /trips/:id/hub/announce` — post a pinned announcement into the hub chat; notifies all hub members in-app. |

## Admin Console (admin JWT + `requirePermission` + audit) — `admin.ts`

| Area | Endpoints |
|---|---|
| Session | `POST /api/admin/auth/login` · `logout` (revocable server session), `GET /me` (incl. effective permissions) |
| Dashboard | `GET /dashboard`, `GET /search` (global, permission-filtered) |
| Partners | `GET /partners(+/export, /:id)`, `POST /partners/:id/status` (activate/suspend/reactivate/offboard + reason), `POST /partners/:id/users/:userId/status` |
| Trips | `GET /trips(+/export, /:id)`, `POST /trips/:id/:action` (publish/unpublish/suspend/restore/archive/feature/unfeature) |
| Hostels | `GET/POST /hostels`, `GET/PUT /hostels/:id`, `POST /hostels/:id/:action` (lifecycle) |
| Travellers | `GET /travellers(+/export, /:id)`, `POST /travellers/:id/status` (suspend/reactivate), `POST /travellers/:id/revoke-sessions`, `GET /login-activity` |
| ID verification | `GET /id-verifications?status=` + `POST /id-verifications/:id/decide` (`travellers.verify` permission; approve grants badge, reject requires reason; audited) |
| Notes | `POST /notes` (internal notes on any entity) |
| Admin users | `GET/POST /admin-users`, `POST /admin-users/:id/roles`, `POST /admin-users/:id/status` |
| RBAC | `GET /roles`, `PUT /roles/:key/permissions` |
| Audit | `GET /audit-logs` (filters: `q, action, adminId, resourceType, resourceId, from, to`), `GET /audit-log-facets`, `GET /audit-logs/export` (CSV, capped 5000, itself audited) |

**Bulk operations** are client-side fan-out: the UI calls the single-entity endpoint per selected
row via `bulkRun` (`web/src/admin/adminApi.ts`) so each row is individually permission-checked
and audited. There are no bulk endpoints — keep it that way unless scale demands otherwise.

## Rules for extending the API

1. Add endpoints to the router that owns the domain; don't create new routers for one endpoint.
2. Shape responses through a `lib/*` function if the entity appears in more than one endpoint.
3. Admin: always `requirePermission`, always `writeAudit` on mutation, use `paginate`/`listResp`.
4. Partner: always scope by `p(req).orgId`; never accept an `orgId` from the client.
5. Never return auth material (hashes, salts, tokens, OTP codes) in any payload — there are tests
   asserting this; extend them for new endpoints.
6. Update this document in the same commit.
