# API Reference

> Truth source: `dupescout/api/routes/*.py` and `dupescout/api/main.py`. This is a map, not a
> mirror — for exact request/response shapes read the route file + the service it calls.
> Update this file whenever an endpoint is added, removed, or changes contract.

## Conventions

- **Base URL:** `/api/v1`. JSON in/out.
- **Auth:** `Authorization: Bearer <JWT>` header. Three realms — tokens are **not interchangeable**
  (see [auth.md](auth.md)).
- **Response envelope** (always):
  ```json
  { "success": true,  "data": { ... }, "meta": { "took_ms": 12 } }
  { "success": false, "error": { "code": "NOT_FOUND", "message": "Product not found" } }
  ```
- **Pagination:** list endpoints accept `page` (1-indexed) + `per_page` (max 100, default 20).
  Response `meta` carries `page, per_page, total`.
- **Dates:** ISO 8601 strings (`YYYY-MM-DD`). Amounts in paise (integer) where noted.
- **Interactive docs (dev):** `http://localhost:8000/api/docs` (Swagger UI)

---

## Auth (`routes/auth.py`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/auth/otp/send` | Public | Send OTP to phone number |
| `POST` | `/auth/otp/verify` | Public | Verify OTP → returns consumer JWT + user |
| `GET` | `/auth/me` | Consumer | Current user profile |
| `POST` | `/seller/auth/login` | Public | Seller email+password login → seller JWT |
| `POST` | `/admin/auth/login` | Public | Admin email+password → admin JWT |

---

## Visual Search (`routes/visual_search.py`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/search/visual` | Consumer | Image / URL / text → similarity results (3 tiers) |

Request body: `{ "image_base64"?: str, "url"?: str, "query"?: str, "filters"?: SearchFilters }`  
Response `data`: `VisualSearchResult` (see `lib/types.ts` for shape mirror)

---

## Keyword Search (`routes/keyword_search.py`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/search/keyword` | Consumer | BM25 + semantic keyword search |

Query params: `q` (required), `category`, `price_min`, `price_max`, `local_only`, `verified_only`, `page`, `per_page`

---

## Consumer (`routes/consumer.py`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/discovery/trending` | Public | Trending aesthetic cards |
| `GET` | `/discovery/recommendations` | Consumer | Personalised product feed |
| `GET` | `/products/:id` | Public | Product detail |
| `GET` | `/categories/:slug` | Public | Products by category |

---

## Orders (`routes/orders.py`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/orders` | Consumer | Create order (initiates Razorpay payment) |
| `GET` | `/orders` | Consumer | Order list |
| `GET` | `/orders/:id` | Consumer | Order detail |

---

## Wishlist (`routes/wishlist.py`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/wishlist` | Consumer | Add product to wishlist |
| `DELETE` | `/wishlist/:product_id` | Consumer | Remove from wishlist |
| `GET` | `/wishlist` | Consumer | Get wishlist |

---

## AI Chat (`routes/ai_chat.py`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/ai/chat` | Consumer | Shopping Copilot — streaming SSE response |

---

## Seller (`routes/seller.py`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/seller/onboarding` | Public | Seller registration + KYC initiation |
| `GET` | `/seller/dashboard` | Seller | Dashboard metrics |
| `GET` | `/seller/products` | Seller | Seller's product listings |
| `POST` | `/seller/products` | Seller | Create listing |
| `PUT` | `/seller/products/:id` | Seller | Update listing |
| `GET` | `/seller/orders` | Seller | Seller's orders (scoped to `seller_id`) |
| `GET` | `/seller/payouts` | Seller | Payout history |

---

## Admin (`routes/admin/router.py`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/admin/overview` | Admin | Platform metrics |
| `GET` | `/admin/sellers` | Admin | Seller list + KYC queue |
| `PUT` | `/admin/sellers/:id/verify` | Admin | Approve / reject seller KYC |
| `GET` | `/admin/catalog` | Admin | Full product catalog |
| `DELETE` | `/admin/catalog/:id` | Admin | Remove listing |
| `GET` | `/admin/orders` | Admin | All platform orders |
| `GET` | `/admin/customers` | Admin | Customer accounts |
| `GET` | `/admin/disputes` | Admin | Open disputes |
| `GET` | `/admin/finance` | Admin | Payout ledger |
| `GET` | `/admin/fraud` | Admin | Fraud signals queue |
| `GET`/`PUT` | `/admin/feature-flags` | Admin | Feature flag console |

---

## Webhooks

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/webhooks/razorpay` | HMAC signature | Razorpay payment events |

Signature verification is done in `routes/razorpay_webhook.py` — never remove this check.

---

## GST Invoice (`routes/gst_invoice.py`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/orders/:id/invoice` | Consumer | Download GST invoice PDF |

---

*Endpoints are added here in the same commit as the route file. Stubs above will be detailed as each route is implemented.*
