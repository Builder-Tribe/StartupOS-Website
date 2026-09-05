# Authentication, Authorization & Audit

> Truth source: `trippy/server/src/lib/{password,auth,partnerAuth,adminAuth,permissions,adminOps}.ts`
> and the auth endpoints in `routes/{auth,partner,admin}.ts`. Update this file whenever tokens,
> roles, permissions, or audit behaviour change.

## Three isolated auth realms

All three realms share one mechanism — **email + password** (scrypt via `lib/password.ts`; never
store or log plaintext) and short JWTs — but are deliberately **not interchangeable**:

| Realm | Who | JWT claim | localStorage key | Middleware | Session model |
|---|---|---|---|---|---|
| Consumer | Travellers | (no `kind`) | `tt_token` | `requireAuth` (`lib/auth.ts`) | Stateless JWT; admin can revoke via `sessions` |
| Partner | Org users | `kind: 'partner'` | `tt_partner_token` | partner middleware (`lib/partnerAuth.ts`) attaches `{ adminId, orgId }` | Stateless JWT |
| Admin | Internal team | `kind: 'admin'` | `tt_admin_token` | `lib/adminAuth.ts` | **Server-tracked** in `sessions` — logout/revocation invalidates immediately |

- `JWT_SECRET` env var (dev default exists; Render generates a strong one). One secret, three
  namespaced token kinds — a consumer token can never call partner/admin APIs and vice versa.
- Consumer signup accepts an **optional phone** (stored unverified — reserved for future OTP login).
  Email verification was built and then **removed by product decision** (July 2026); the
  `email_verifications` table is legacy. Don't resurrect either without an explicit request.
- Password policy and login failure messages live in the routes; keep failure responses generic
  (no user-enumeration hints).

## Partner isolation (multi-tenancy)

Partner auth attaches `orgId` server-side from the token. **Every** query in `routes/partner.ts`
filters by it. The client never supplies an org id. When adding a partner endpoint, copy this
pattern; the test suite asserts cross-org isolation — extend it for new resources.

## Admin RBAC

- **Catalogue lives in the database**, not in code constants: `admin_roles` (9 roles:
  SUPER_ADMIN, FOUNDER, OPERATIONS_ADMIN, PARTNER_MANAGER, TRIP_MANAGER, HOSTEL_MANAGER,
  ANALYST, READ_ONLY_ADMIN, SUPPORT), `admin_permissions` (~46 grouped keys like `trips.publish`,
  `audit_logs.view`, `travellers.verify`), `admin_role_permissions`, `admin_user_roles`.
  New permissions added to `lib/permissions.ts` reconcile into existing DBs on boot
  (INSERT OR IGNORE), including default role grants. Defaults are seeded from
  `lib/permissions.ts` and are editable at runtime from the console (Roles page).
- **SUPER_ADMIN implicitly has every permission.** Role-permission edits apply immediately to all
  users with the role (the UI warns with the affected user count).
- **Server enforcement:** every admin endpoint is wrapped in `requirePermission('<key>')`.
  This is the security boundary.
- **Client convenience:** `usePerms()` hook and `<Can perm="…">` component
  (`web/src/admin/AdminApp.tsx`, `ui.tsx`) hide UI the user can't use. Never rely on these for
  security — they are UX only.

## Risk-proportional confirmation (UI contract)

| Action class | Component | Behaviour |
|---|---|---|
| Reversible mutation | plain button | immediate |
| Consequential (suspend, deactivate, role edit) | `ConfirmDialog` | confirm; `requireReason` when the endpoint expects a reason |
| High-risk / hard-to-reverse (partner offboarding) | `HighRiskDialog` | type the entity name + reason |
| Bulk anything | selection bar → `ConfirmDialog` | per-row API calls via `bulkRun` so each row is permission-checked and audited |

## Audit log (immutable)

- `writeAudit(req, { action, resourceType, resourceId, resourceName, reason, metadata })` in
  `lib/adminOps.ts` — call it in **every** admin mutation, including exports
  (`audit_logs.export` is itself audited).
- Insert-only. There is no update/delete path for `admin_audit_logs`, and none may be added.
- Queryable via `/audit-logs` (action, actor, resource, date-range filters) + CSV export.
- Status changes additionally write `status_history` (entity, from→to, actor, reason).

## Secret non-exposure (tested invariant)

No API response may contain `password_hash`, `password_salt`, token material, or OTP codes.
`server/test/admin.test.ts` asserts this on detail endpoints — when adding endpoints that return
users/admins/partners, shape through `lib/shape.ts`-style functions and extend the tests.
