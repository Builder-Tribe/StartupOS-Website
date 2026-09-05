# Authentication & Authorization

> Truth source: `dupescout/api/lib/auth.py` and `dupescout/api/routes/auth.py`.
> Update this file whenever token realms, middleware, or permissions change.

## Three isolated auth realms

All three realms share the same mechanism (JWT, Bearer header) but are **not interchangeable**.
A consumer token can never call seller or admin APIs and vice versa.

| Realm | Who | JWT claim | localStorage key | Python middleware |
|---|---|---|---|---|
| Consumer | Shoppers | `realm: 'consumer'` | `ds_token` | `require_consumer_auth` |
| Seller | Merchants | `realm: 'seller'` | `ds_seller_token` | `require_seller_auth` |
| Admin | Ops team | `realm: 'admin'` | `ds_admin_token` | `require_admin_auth` |

## Token lifecycle

- **Consumer:** Phone-based OTP login. `POST /api/v1/auth/otp/send` → `POST /api/v1/auth/otp/verify` → JWT returned. Stateless; expiry 30 days.
- **Seller:** Email + password. `POST /api/v1/seller/auth/login` → JWT returned. Stateless; expiry 7 days.
- **Admin:** Email + password. `POST /api/v1/admin/auth/login` → JWT returned. **Server-tracked session** — logout invalidates immediately; enables revocation without key rotation.

## JWT configuration

- **Algorithm:** HS256 in development (`JWT_SECRET_KEY` env var).
- **Production:** Switch to RS256 (`JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY`); see `.env.example`.
- **Claims:** `sub` (user id), `realm`, `iat`, `exp`.
- One secret, three namespaced realms — never share tokens across realms.

## Seller isolation (multi-tenancy)

`require_seller_auth` attaches `seller_id` from the JWT to the request state **server-side**.
Every query in `routes/seller.py` must filter by `request.state.seller_id`. The client never
supplies a seller id. New seller endpoints must copy this pattern — the pattern is the security
boundary.

## Admin permissions

Admin RBAC is role-based. Roles and their permission grants are defined in `lib/auth.py`.
Every admin endpoint checks the required permission before running. Audit-log entry is written
for any action that mutates platform state — see `AGENTS.md §3.6`.

## Frontend token handling

Consumer auth token: stored in `localStorage` as `ds_token`, attached to every request by the
axios interceptor in `dupescout/lib/api.ts`. Seller and admin surfaces use separate axios
instances with their own storage keys. **Never cross-attach tokens between surfaces.**

---

*Populated from Volume 5 §7 and the initial implementation. Update in the same commit as any
auth or permission change.*
