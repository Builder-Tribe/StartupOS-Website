# DupeScout — Architecture Decision Log

> **Immutable record.** New entries go at the top. Never edit or delete existing entries.  
> Format: date · decision · rationale · alternatives rejected

---

## 2026-07-31 — Monorepo structure (single GitHub repo)

**Decision:** All three surfaces (consumer, seller, admin) in one repository at `github.com/1997agarwal/DupeScout`.

**Rationale:** Team is a single founder (early stage). Monorepo eliminates cross-repo dependency management overhead, simplifies CI, and lets AI assistants understand the whole codebase in one context window.

**Alternatives rejected:** Polyrepo (consumer-app, seller-app, api, ai) — adds coordination overhead with no benefit at current team size.

---

## 2026-07-31 — FastAPI (Python) over Node.js for backend API

**Decision:** Backend API is Python FastAPI, not Node.js/Express.

**Rationale:** Python has the best AI/ML library ecosystem (PyTorch, transformers, sentence-transformers, scikit-learn). The AI services (CLIP, Product DNA, Recommendation Engine) are Python-native. FastAPI is async, performant, and auto-generates OpenAPI docs.

**Alternatives rejected:** Node.js (TypeScript) — would require Python sidecar services for AI anyway; Express — lacks automatic request validation; Django REST — too heavy, not async-first.

---

## 2026-07-31 — pgvector over dedicated vector database (Pinecone / Weaviate / Qdrant)

**Decision:** Store CLIP embeddings in PostgreSQL with the pgvector extension rather than a standalone vector database.

**Rationale:** Eliminates an entire infrastructure dependency. PostgreSQL already holds all transactional data. pgvector with HNSW index delivers <100ms ANN search at 10M scale. Joins between vector search results and product/seller tables are free (same DB). DPDP compliance is simpler with fewer data stores.

**Alternatives rejected:** Pinecone — proprietary, US-based servers (data residency risk); Weaviate — another service to operate; Qdrant — strong product but adds operational complexity before product-market fit.

---

## 2026-07-31 — Claude Sonnet 5 for Conversational AI

**Decision:** Use Anthropic Claude Sonnet 5 (via API) for the Shopping Copilot.

**Rationale:** Best-in-class tool use (critical for 8 shopping tools). Strong instruction following, minimal hallucination in structured product domains. Fast enough for streaming <800ms first token. Commercial terms compatible with a marketplace use case.

**Alternatives rejected:** GPT-4o — comparable quality but OpenAI's data practices require more legal review for India DPDP; Gemini Pro — tool use less reliable at time of blueprint; open-source LLMs (Llama 3) — inference latency and hosting cost at required quality is prohibitive pre-PMF.

---

## 2026-07-31 — Razorpay for payments

**Decision:** Razorpay as the sole payments provider (UPI, cards, EMI, COD).

**Rationale:** Market leader in India, best UPI coverage, supports NACH for seller payouts, excellent webhooks, sandbox environment. GSTIN invoice generation built-in.

**Alternatives rejected:** Stripe — limited India UPI support; PayU — legacy API; PhonePe Business — UPI only, no card/EMI.

---

## 2026-07-31 — Shiprocket for logistics aggregation

**Decision:** Shiprocket as primary logistics aggregator (multi-carrier), with Delhivery as direct integration for high-volume sellers.

**Rationale:** Shiprocket aggregates 17+ carriers (BlueDart, DTDC, Delhivery, Xpressbees, Ecom Express) with a single API. Best coverage for Tier 2/3 India. Automatic AWB generation.

**Alternatives rejected:** Single-carrier (Delhivery only) — insufficient pin code coverage at launch; NimbusPost — smaller network; building direct integrations per carrier — too slow.

---

## 2026-07-31 — No ads in organic search (permanent rule)

**Decision:** Sponsored listings are permanently separated from organic search results. Mixing paid and organic results is forbidden at the code level.

**Rationale:** This is the single fastest way to destroy user trust in a dupe-discovery platform. Users come to DupeScout precisely because they distrust incumbent platforms' ad-polluted search. Structurally, Amazon's 30-40% India revenue from premium brand advertising is the moat we exploit — we cannot replicate their conflict of interest and claim to be different.

**Alternatives rejected:** Sponsored-in-organic (standard industry practice) — rejected permanently, not just for now.

---

## 2026-07-31 — "Local First" ranking rule

**Decision:** In the LambdaMART ranking output, any product from a local/artisan seller within 5% of the top-ranked product's score is boosted above large-brand equivalents.

**Rationale:** Core to DupeScout's differentiation and Gen Z positioning. Discovery of local artisans is a growth loop driver (sellers tell their communities, driving organic acquisition). Creates a structural reason for artisan sellers to choose DupeScout over Amazon/Flipkart.

**Alternatives rejected:** Pure ML ranking (no rule) — ML will always favor established sellers with more reviews and sales history, suppressing exactly the sellers we want to surface.

---

*Add new entries at the top of this file. Never edit existing entries.*
