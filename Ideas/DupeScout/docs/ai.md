# AI Services

> Truth source: `dupescout/api/services/` and Volume 5 AI Architecture & Technical Design.
> Update this file whenever a model, prompt, or service contract changes.

## Overview

DupeScout has four AI service modules, all housed in `dupescout/api/services/`:

| Service | File | Model | Latency target |
|---|---|---|---|
| Visual Similarity Engine | `visual_similarity.py` | CLIP ViT-L/14 + pgvector | < 2s end-to-end |
| Product DNA Engine | `product_dna.py` | Claude Sonnet 5 (vision) | < 3s |
| Shopping Copilot (Conversational AI) | `conversational_ai.py` | Claude Sonnet 5 | < 800ms first token |
| Keyword Search | `keyword_search.py` | Elasticsearch 8 BM25 + dense_vector | < 500ms |

---

## Visual Similarity Engine (`visual_similarity.py`)

**What it does:** Takes an input image (upload / URL) and returns the top similar products ranked
by a composite similarity score.

**Pipeline:**
1. Image → CLIP ViT-L/14 → 512-dim embedding
2. pgvector HNSW ANN search → 100 candidate products
3. Re-rank by composite formula: Visual (50%) + Attribute match (30%) + Aesthetic alignment (20%)
4. Split results into three tiers: `original` (≥90%), `smart_value` (70–89%), `similar` (<70%)

**Critical rule:** Scores are the model's raw output. Never round up, clamp up, or adjust scores
to improve click-through. A 62% score must display as 62%. This is a core trust contract.

**Source of truth:** Volume 5 §2

---

## Product DNA Engine (`product_dna.py`)

**What it does:** Analyses a product image and extracts structured attributes used for matching
and cataloguing.

**Output schema:**
```json
{
  "material": "100% cotton",
  "construction": "woven",
  "aesthetic_codes": ["minimal", "earthy", "boho"],
  "quality_tier": "mid",
  "detected_attributes": { "pattern": "solid", "fit": "relaxed", "occasion": "casual" }
}
```

**Model:** Claude Sonnet 5 with vision input (`anthropic` SDK, `messages` API).

**Prompt versioning:** Every change to the Product DNA system prompt must be documented here
with a date and the specific change. The prompt is version-controlled in the source file — do
not externalise it without updating this doc.

**Source of truth:** Volume 5 §3

---

## Shopping Copilot — Conversational AI (`conversational_ai.py`)

**What it does:** Streaming chat interface that uses Claude with tool use to answer shopping
queries and surface relevant products.

**Model:** `claude-sonnet-5` via Anthropic API, streaming SSE.

**Tools (8):**
| Tool | What it does |
|---|---|
| `visual_search` | Search by image or description |
| `keyword_search` | BM25 + semantic keyword search |
| `get_product_details` | Fetch full product spec |
| `compare_products` | Side-by-side attribute comparison |
| `check_price_history` | Price trend for a product |
| `find_alternatives` | Find cheaper/local alternatives |
| `get_recommendations` | Personalised feed based on history |
| `check_availability` | Stock + delivery estimate |

**Critical rules:**
- Only real, in-stock products from the DupeScout catalog may be returned as tool results.
  Never fabricate product specs, prices, or availability.
- Prompt changes must be documented below with a date and description.
- Route: `POST /api/v1/ai/chat` — streaming SSE.

**Prompt changelog:**
| Date | Change |
|---|---|
| *(initial)* | Base system prompt established — see `conversational_ai.py` |

**Source of truth:** Volume 5 §4

---

## Recommendation Engine

**Status:** Not yet implemented. Planned for Phase 2.

**Design:** 4-model ensemble — User-based CF · Item-based CF · Content-based (Product DNA) ·
Real-time contextual bandits. Cold start handled via onboarding style quiz.

**Source of truth:** Volume 5 §5

---

## Adding or changing AI features

1. Update the service file in `dupescout/api/services/`.
2. Update this doc in the same commit — add a prompt changelog entry if the system prompt changed.
3. If the model or provider changes, add an entry to `docs/decision-log.md`.
4. AI moderation decisions (approve/reject listings) are **advisory only** — human review is
   required for any seller suspension, counterfeit flag > 70% confidence, or dispute resolution.
