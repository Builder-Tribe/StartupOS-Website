# Deployment

> Update this file when environment config, CI/CD, or infrastructure changes.

## Environments

| Environment | Purpose | Deployed from |
|---|---|---|
| `development` | Local dev — SQLite not supported; use Docker Postgres | Local machine |
| `staging` | Pre-prod testing — mirrors prod infra | `main` branch auto-deploy |
| `production` | Live users | Manual gate after staging sign-off |

## Infrastructure (AWS ap-south-1 — Mumbai)

All services run in ap-south-1. **Never configure resources in another region.** This is
required for DPDP Act 2023 compliance and is a permanent constraint.

| Service | AWS offering |
|---|---|
| Frontend (Next.js) | ECS Fargate or Vercel (TBD — see decision-log) |
| API (FastAPI) | ECS Fargate — containerised with Docker |
| Database | RDS PostgreSQL 16 + pgvector, Multi-AZ |
| Cache | ElastiCache Redis 7 |
| Search | Amazon OpenSearch Service 8 |
| Object storage | S3 `dupescout-products-prod` (images), `dupescout-kyc-prod` (KYC docs — private) |
| CDN | CloudFront in front of product images |
| Events | MSK (Managed Kafka) → ClickHouse |

## CI/CD (GitHub Actions)

Pipeline is in `.github/workflows/` (to be created during build phase). Expected flow:

1. Push to any branch → run TypeScript check + lint + Python tests
2. Merge to `main` → build Docker image → deploy to staging automatically
3. Staging sign-off → manual trigger → deploy to production

## Docker

FastAPI runs as a containerised process. Dockerfile to be added to `dupescout/api/` during
build phase. Key requirements:
- Python 3.11 slim base
- Install `requirements.txt`
- Start command: `uvicorn api.main:app --host 0.0.0.0 --port 8000`

## Environment variables

All secrets are injected via environment variables — never hardcoded, never committed.
See `dupescout/.env.example` for the full list. In production, use AWS Secrets Manager or
ECS task environment variables.

Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` — RS256 keys for production (HS256 for dev)
- `ANTHROPIC_API_KEY` — Claude API key
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
- `AWS_REGION=ap-south-1`

## Local dev with Docker

```bash
# Start backing services
docker run -d --name dupescout-pg \
  -e POSTGRES_USER=dupescout -e POSTGRES_PASSWORD=password -e POSTGRES_DB=dupescout \
  -p 5432:5432 ankane/pgvector

docker run -d --name dupescout-redis -p 6379:6379 redis:7-alpine

# Run migrations
cd dupescout && source .venv/bin/activate && alembic upgrade head

# Start API
.venv/bin/uvicorn api.main:app --reload --port 8000

# Start frontend (separate terminal)
npm run dev
```

---

*Infrastructure-as-code (Terraform) will be added to a separate `dupescout-infra` repo during
the production launch phase.*
