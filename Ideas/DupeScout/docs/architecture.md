# DupeScout — System Architecture

> **Status:** Blueprint-phase reference. Populated from Volume 5 AI Architecture & Technical Design. Will be updated as each service is implemented.

---

## Overview

DupeScout is a distributed platform with three surfaces backed by one API layer.

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  Next.js 14 (SSR)     │  React Native (Phase 2)         │
│  Consumer / Seller / Admin surfaces                      │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────────┐
│                    API LAYER                             │
│  FastAPI (Python) — async, 3 JWT realms                 │
│  /api/consumer/*  /api/seller/*  /api/admin/*           │
└──┬──────────┬──────────┬──────────┬──────────┬──────────┘
   │          │          │          │          │
┌──▼──┐  ┌───▼───┐  ┌───▼───┐  ┌──▼───┐  ┌──▼──────┐
│ PG  │  │ Redis │  │  ES   │  │  S3  │  │ClickHse │
│ 16  │  │   7   │  │   8   │  │ /R2  │  │(events) │
│+pgv │  │       │  │       │  │      │  │         │
└─────┘  └───────┘  └───────┘  └──────┘  └─────────┘
                                               ▲
┌──────────────────────────────────────────────┤
│               AI SERVICES                    │
│  Visual Similarity Engine (CLIP + pgvector)  │
│  Product DNA Engine (Vision LLM)             │
│  Conversational AI (Claude Sonnet 5)         │
│  Recommendation Engine (4-model ensemble)    │
└──────────────────────────────────────────────┘
```

---

## Services

### API Gateway (FastAPI)

- Single FastAPI application, split into three route namespaces
- Auth middleware validates JWT per realm before any route handler runs
- Standard JSON envelope: `{ "success": bool, "data": ..., "error": { "code": str, "message": str } }`
- Rate limiting via Redis (consumer: 100 req/min, seller: 200 req/min, admin: 500 req/min)

### Primary Database (PostgreSQL 16 + pgvector)

- Multi-AZ RDS instance in ap-south-1
- pgvector extension for 512-dimensional CLIP embeddings
- HNSW index: `CREATE INDEX ON product_embeddings USING hnsw (embedding vector_cosine_ops)`
- See Volume 5 §11 for full schema

### Cache (Redis 7)

- AWS ElastiCache cluster
- TTLs: search results 5 min · product pages 10 min · seller dashboards 2 min · sessions 4h

### Search (Elasticsearch 8)

- AWS OpenSearch Service
- Keyword search: BM25
- Semantic search: dense_vector field with HNSW
- Hybrid search: RRF (Reciprocal Rank Fusion)

### Object Storage (S3 / R2)

- Product images: `dupescout-products-prod` bucket, ap-south-1
- Seller KYC documents: `dupescout-kyc-prod` (private, lifecycle 7 years)
- CDN: CloudFront in front of product images

### Analytics (ClickHouse)

- Append-only event store — no updates or deletes
- Kafka → ClickHouse consumer for real-time ingestion
- See Volume 5 §12 for event taxonomy

---

## AI Services

### Visual Similarity Engine

- **Model:** OpenAI CLIP ViT-L/14 → fine-tuned on Indian fashion/home catalog
- **Pipeline:** Image → CLIP → 512-dim embedding → pgvector ANN → top-100 candidates → re-rank
- **Latency target:** <2s end-to-end for 10M product catalog
- **Similarity formula:** Visual (50%) + Attribute match (30%) + Aesthetic alignment (20%)
- **Source of truth:** Volume 5 §2

### Product DNA Engine

- **Input:** Product image(s)
- **Output:** Structured JSON with material, construction, aesthetic codes (200+ tags), quality tier
- **Model:** Vision LLM (Claude Sonnet 5 with vision)
- **Source of truth:** Volume 5 §3

### Conversational AI (Shopping Copilot)

- **Model:** Claude Sonnet 5 (Anthropic API)
- **Tools:** 8 shopping tools (visual_search, keyword_search, get_product_details, compare_products, check_price_history, find_alternatives, get_recommendations, check_availability)
- **Latency target:** <800ms first token (streaming SSE)
- **Source of truth:** Volume 5 §4

### Recommendation Engine

- **4-model ensemble:** User-based CF · Item-based CF · Content-based (Product DNA) · Real-time contextual bandits
- **Cold start:** Style quiz (onboarding) + implicit signals (referral source, location, device)
- **Source of truth:** Volume 5 §5

### Ranking Algorithm

- **Model:** LambdaMART
- **Features:** Relevance · visual_similarity · quality_score · value_score · seller_trust · freshness
- **Post-processing:** "Local First" rule — within 5% of top score, local/artisan seller ranks above large brand
- **Source of truth:** Volume 5 §6

---

## Deployment

- **Cloud:** AWS ap-south-1 (Mumbai) — all services, all data
- **Compute:** ECS Fargate — no EC2 management overhead
- **Infrastructure as Code:** Terraform (to be added in build phase)
- **Environments:** `dev` · `staging` · `prod`
- **CI/CD:** GitHub Actions → staging auto-deploy → prod manual gate

---

## Data residency

All user data, product data, and transactional data stays in ap-south-1. No cross-region replication without explicit legal review. Required for DPDP Act 2023 compliance.

---

*This document reflects the blueprint-phase architecture. Implementation details will be added as each service is built.*
