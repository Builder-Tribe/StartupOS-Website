# Admin Console — UX Audit & Redesign

> Sources: [`Admin Console UX Audit.dc.html`](./Admin%20Console%20UX%20Audit.dc.html) (per-screen findings + revamp briefs) and [`Admin Console Redesign.dc.html`](./Admin%20Console%20Redesign.dc.html) (screens implementing the P0 fixes).

## Direction

The Admin Console is the internal control center (dark `#14202a` sidebar surface). The audit's core finding: operators could only act on one record at a time, the immutable audit log was barely queryable, and the most dangerous actions (role edits, partner offboarding) had the same friction as trivial ones. Fixes ship server-enforced: every bulk row is individually permission-checked and audited.

## P0 fixes — implementation status (July 2026)

| # | Fix (from audit) | Status | Where |
|---|---|---|---|
| 1 | Bulk selection + bulk actions on tables | ✅ Shipped | `web/src/admin/ui.tsx` (DataTable checkbox column + `.a-bulkbar` + confirm dialog), `adminApi.ts` `bulkRun` (per-row calls, partial-failure reporting). Wired: Trips (publish/suspend/feature/archive), Partners (activate/suspend), Travellers (suspend/reactivate). Permission-gated per action; reason required for dangerous ones; each row audited individually |
| 2 | Audit log filters + export | ✅ Shipped | `server/src/routes/admin.ts` — shared `auditFilters` (+ `from`/`to` date range), `GET /audit-log-facets` (distinct actions + actors), `GET /audit-logs/export` (CSV, capped 5000, itself audited). `pages/AuditLogs.tsx` — action / admin / resource dropdowns, date range, Export CSV |
| 3 | Confirmation on role-permission saves | ✅ Shipped | `pages/Roles.tsx` — ConfirmDialog before save, stating the change applies immediately to the role's N admin users |
| 4 | Friction proportional to risk on partner actions | ✅ Shipped | `pages/PartnerDetail.tsx` — partner-user deactivation now confirms; **offboarding upgraded to HighRiskDialog** (type the org name to confirm + reason) |
| 5 | Global search discoverability + dead-end empty state | ✅ Shipped | `AdminApp.tsx` — ⌘K/Ctrl+K focuses search from anywhere; explicit "No results" row instead of a silently-empty dropdown |

## Notable items still open

Saved filter views, audit-log detail drawer (metadata JSON), per-admin activity page linking into filtered audit logs, bulk actions on Hostels, CSV export column picker, session management UI polish (list/revoke exists on Traveller/Admin detail).
