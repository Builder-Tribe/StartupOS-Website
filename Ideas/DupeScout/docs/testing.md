# Testing

> Update this file when testing patterns or tooling changes.

## Mandatory Verification Steps Followed For Every Feature

1. **Backend Compilation:** `python3 -m py_compile` on all modified Python files to ensure 0 syntax errors.
2. **TypeScript Compilation:** `npx tsc --noEmit` inside `dupescout/` to verify TypeScript compilation (0 errors).
3. **Browser Verification:** Running dev servers (`npm run dev` & `uvicorn`) and testing the exact user flow on both desktop & mobile viewport modes (`≤760px`) before committing/pushing to GitHub.

---

## Manual Verification Checklist (UI & Backend Changes)

- Run `npx tsc --noEmit` in `dupescout/` to verify TypeScript compilation.
- Run `python3 -m py_compile` on modified Python files to ensure 0 syntax errors.
- Exercise the changed flow in a live browser (checking both mobile `≤760px` bottom nav and desktop views).

## Backend (FastAPI / Python)

- **Framework:** pytest + pytest-asyncio (to be set up; add to `requirements.txt` under a
  `[dev]` section when configured).
- **Test location:** `dupescout/api/tests/` (create this when writing the first test).
- **Priority assertions:** auth realm isolation (consumer token rejected on seller routes),
  `seller_id` scoping (seller A cannot read seller B's orders), admin permission gates, webhook
  HMAC signature verification.

## High-value test targets

When writing tests, prioritise in this order:

1. **Auth boundaries** — wrong realm returns 401/403, not 500 or data.
2. **Seller isolation** — every seller query must be scoped to `seller_id` from the JWT.
3. **Similarity score integrity** — scores must be the raw model output, not adjusted.
4. **Webhook signatures** — Razorpay webhook must reject unsigned or tampered payloads.
5. **Admin audit log** — every admin mutation must produce an audit row.

## What is not tested (and why)

- Visual similarity model accuracy — evaluated offline on a benchmark dataset, not in CI.
- Claude tool responses — non-deterministic; evaluate via prompt regression testing (separate
  process, not in CI).

---

*Add framework setup instructions here once pytest is configured.*
