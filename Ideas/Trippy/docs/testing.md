# Testing

> Truth source: `trippy/server/test/*.test.ts`. Run: `npm test -w server` (root) or `npm test`
> inside `trippy/server`. All tests must pass before any commit that touches the server.

## What exists

Node's built-in test runner (`node --test`, sequential via `--test-concurrency=1`), three suites,
~28 tests:

| Suite | Covers |
|---|---|
| `auth.test.ts` | Consumer signup/login, password rules, token behaviour |
| `partner.test.ts` | Partner auth, **org isolation** (org A can never read/write org B), publish validation gate |
| `admin.test.ts` | Admin auth boundary, RBAC enforcement (permission-gated endpoints), lifecycle actions writing audit rows, **secret non-exposure** (no hash/salt/token in any payload), traveller suspension killing consumer sessions, dashboard counts being real |

There are currently **no frontend tests** — UI verification is manual/browser-driven. This is a
known gap, acceptable while the team is small; if you add a frontend test setup, document it here.

## How the suites work

- Each test file boots the real app via `createApp()` against a **fresh temp SQLite DB**
  (`TRIPPY_DB_PATH` + `TRIPPY_TEST=1`), listens on an ephemeral port, and makes real HTTP calls
  through a small `api()` helper (with one retry for transient socket resets). No mocks — the
  full stack including seeds runs.
- Tests rely on seeded fixtures (demo admins per role, two partner orgs, demo traveller).

## Writing new tests — patterns to copy

1. **Test the security property, not the happy path**: wrong-realm token → 401/403; missing
   permission → 403; other org's id → 404/403; response body contains no secrets.
2. Use `tok(email, password)` to mint realm tokens; hit endpoints exactly like a client would.
3. After any admin mutation, assert the audit row exists (`/audit-logs?resourceType=…`).
4. **Pagination gotcha:** seeded rows share one `created_at` second, so "is my row on page 1" is
   nondeterministic. Query with `?pageSize=200` or a search filter when locating fixtures
   (this bit us — see decision log entry on the flaky traveller test).
5. Keep tests independent of wall-clock date where possible; seeds use relative dates.

## Manual verification checklist (UI changes)

- `npx tsc --noEmit` in both `web/` and `server/`.
- Exercise the changed flow in the browser (dev servers via `.claude/launch.json` or `npm run dev`).
- Consumer changes: check ≤760px (bottom nav) and desktop.
- Admin changes: check with a low-privilege demo admin (e.g. `analyst@trippy.test`) to confirm
  permission gating, not just with SUPER_ADMIN.
