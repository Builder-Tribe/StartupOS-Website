# Database

> Truth source: `dupescout/db/migrations/` (schema DDL) and `dupescout/api/lib/database.py`
> (async SQLAlchemy session factory). Update this file with every schema change.

## Engine & configuration

- **Engine:** PostgreSQL 16 + `pgvector` extension (vector similarity search)
- **ORM:** SQLAlchemy 2.0 async (`asyncpg` driver)
- **Migrations:** Alembic — migration files in `dupescout/db/migrations/`
- **Dev connection:** `DATABASE_URL=postgresql+asyncpg://dupescout:password@localhost:5432/dupescout`
- **Prod:** AWS RDS Multi-AZ, ap-south-1. Connection string from `DATABASE_URL` env var.

## Running migrations

```bash
cd dupescout
source .venv/bin/activate
alembic upgrade head          # apply all pending migrations
alembic revision --autogenerate -m "add_xyz"   # generate a new migration
```

Migration files live in `db/migrations/`. Never hand-edit a migration that has been applied to
production — create a new migration instead.

## Conventions

- **IDs:** UUID v4 strings (TEXT column). Generated server-side — never let clients supply IDs.
- **Column naming:** `snake_case`. Table naming: plural nouns (`products`, `sellers`, `orders`).
- **Timestamps:** `created_at`, `updated_at` — both `TIMESTAMP WITH TIME ZONE`, default `NOW()`.
- **Amounts:** stored as integers in paise (₹1 = 100 paise). Never store floats for money.
- **Booleans:** native PostgreSQL BOOLEAN.
- **JSON fields:** `JSONB` for structured blobs (style preferences, detected attributes).
- **Migrations are additive:** `ADD COLUMN IF NOT EXISTS` for new columns; never drop or rename
  without a multi-step migration + explicit consent.

## Key tables (001_initial.sql)

| Table | Purpose |
|---|---|
| `users` | Consumer accounts: phone auth, profile, style preferences, pro status |
| `sellers` | Seller accounts: KYC status, bank details (encrypted), payout config |
| `products` | Product listings: title, images, price, category, seller FK |
| `product_variants` | Size/colour variants per product with individual price/stock |
| `product_embeddings` | 512-dim CLIP vectors (pgvector); HNSW index for ANN search |
| `orders` | Consumer orders; `seller_id` FK for isolation |
| `order_items` | Line items per order |
| `payments` | Razorpay payment records linked to orders |
| `wishlists` | Consumer → product saves |
| `reviews` | Product reviews: rating, text, images, authenticity flag |
| `admin_users` | Admin accounts with RBAC roles |
| `audit_log` | **Append-only.** Every admin mutation with `actor_id`, `action`, `payload`, `ts` |
| `feature_flags` | Key/value store for runtime feature toggles |

## pgvector index

```sql
-- HNSW index for cosine similarity on CLIP embeddings
CREATE INDEX ON product_embeddings USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

Target: <100ms ANN search at 10M product scale. See Volume 5 §11 for full pgvector tuning guide.

## Data residency

All data lives in RDS ap-south-1 (Mumbai). No cross-region replication without legal review.
Required for DPDP Act 2023 compliance. Never configure a read replica in another region without
an explicit compliance sign-off.

---

*Schema is populated as each domain is built. Add new tables at the bottom of the latest
migration; add new columns with a new migration file.*
