# DUPESCOUT — VOLUME 5
## AI Architecture, Technical Design & Engineering Specifications

**Classification:** Confidential — Founding Document  
**Version:** 1.0 | **Date:** July 2026  
**Part of:** DupeScout Founder Blueprint (6-Volume Series)

---

# TABLE OF CONTENTS — VOLUME 5

1. AI Strategy Overview
2. Visual Similarity Engine
3. Product DNA Engine
4. Conversational AI Shopping Copilot
5. Recommendation Engine
6. Ranking Algorithms
7. Trend Prediction Engine
8. Price Intelligence Engine
9. Review Authenticity AI
10. Overall Technical Architecture
11. Database Design & Schema
12. API Architecture
13. Infrastructure & DevOps
14. Security Architecture
15. Performance Engineering
16. ML Ops & Model Lifecycle
17. Event Tracking Plan
18. Analytics Data Architecture

---

# SECTION 1: AI STRATEGY OVERVIEW

## Why AI Is Not a Feature — It's the Foundation

Most ecommerce platforms treat AI as a feature layered on top of their core product. A recommendation widget here. A chatbot there. An automated email campaign generator. These are afterthoughts.

DupeScout's AI is not a feature. It is the product.

Every interaction a user has with DupeScout is mediated by AI:
- The home feed is AI-curated
- Search is AI-powered visual matching
- Product pages have AI-generated explanations
- Recommendations are AI-personalized
- Pricing advice is AI-computed
- Trend intelligence is AI-predicted
- Catalog creation is AI-assisted
- Fraud detection is AI-driven
- Moderation is AI-first

**The AI investment thesis:**

Every user interaction generates a training signal. Every search that results in a satisfied purchase teaches the visual similarity engine what "good match" means. Every collection a user saves teaches the recommendation engine what their taste profile looks like. Every product a user dismisses teaches the system what they don't want.

Over time, DupeScout's AI becomes more accurate than any competitor's. This is a compounding advantage: the data moat grows with every user interaction, and replicating it requires not just the technology but the user base that generated the training data.

## AI System Inventory

| System | Purpose | Technology | Latency Target |
|--------|---------|-----------|----------------|
| Visual Similarity Engine | Find products similar to uploaded image | Computer vision + vector search | <2s end-to-end |
| Product DNA Engine | Extract structured attributes from product images | Vision LLM + fine-tuned classifier | <3s |
| Conversational AI | Natural language shopping dialogue | LLM (Claude Sonnet 5) | <800ms first token |
| Recommendation Engine | Personalized product suggestions | Collaborative filtering + content-based | <200ms |
| Ranking Algorithm | Order search results by relevance + quality | ML ranking model | <50ms |
| Trend Prediction | Detect and predict aesthetic trends | Time-series + social signal ML | Batch (hourly) |
| Price Intelligence | Competitive pricing analysis | Statistical models + ML | Batch (hourly) |
| Review Authenticity | Detect fake reviews | NLP classifier + anomaly detection | Async |
| Catalog AI | Generate listing from photos | Vision LLM | <30s |
| Fraud Detection | Identify fraudulent activity | Gradient boosting + rule engine | <100ms |

---

# SECTION 2: VISUAL SIMILARITY ENGINE

## Overview

The Visual Similarity Engine is DupeScout's core technical differentiation. It must answer one question with high accuracy: **"Given this product image, find me the most visually similar products in the catalog."**

This is fundamentally different from Google Lens (which finds the *exact* product) or keyword search (which finds products that *match keywords*). The Visual Similarity Engine finds products that are *aesthetically equivalent* — similar in appearance, material, and style code, even if they are different products from different manufacturers.

## Technical Architecture

```
VISUAL SIMILARITY ENGINE — PIPELINE

INPUT: Image (user upload / URL screenshot / camera)
    ↓
PREPROCESSING
  → Image validation (format, size, quality check)
  → Object detection: identify primary product in frame
  → Background removal (optional, improves embedding quality)
  → Crop to product bounding box
  → Normalize to 512×512px
    ↓
DUAL-ENCODER EMBEDDING
  → Encoder 1: CLIP-based visual encoder
    (understands visual appearance: shape, color, texture, composition)
  → Encoder 2: Product DNA encoder (domain-specific, fine-tuned on product images)
    (understands product-specific attributes: material type, construction, style code)
  → Outputs: Two embedding vectors [v1: 768-dim, v2: 512-dim]
  → Concatenate: combined embedding [1280-dim]
  → Project to final embedding space [512-dim]
    ↓
VECTOR SEARCH
  → Query pgvector index with 512-dim embedding
  → ANN (Approximate Nearest Neighbor) search
  → Return top 200 candidate products
  → Latency target: <100ms for 10M product catalog
    ↓
RE-RANKING
  → Apply quality signals to candidate set:
    - Review score weight
    - In-stock status (out-of-stock pushed to bottom)
    - Price range relevance (to user's historical range)
    - Seller quality score
    - Freshness (newer listings get slight boost for discovery)
  → Apply diversity sampling (avoid showing 50 identical products)
    ↓
OUTPUT: Ranked product list with similarity scores
```

## Similarity Score Computation

The similarity score shown to users is not just the raw vector distance. It is a multi-dimensional score computed as:

```
SIMILARITY_SCORE = (
  VISUAL_SIMILARITY_SCORE × 0.50 +   # Raw vector cosine similarity
  ATTRIBUTE_MATCH_SCORE × 0.30 +     # Matching structured attributes (material, category)
  AESTHETIC_ALIGNMENT_SCORE × 0.20   # Matching style codes and aesthetic tags
) × 100

Where:
  VISUAL_SIMILARITY_SCORE: cosine_similarity(embedding_A, embedding_B) → [0,1]
  ATTRIBUTE_MATCH_SCORE: Jaccard similarity on material/category attributes → [0,1]
  AESTHETIC_ALIGNMENT_SCORE: Jaccard similarity on aesthetic tags → [0,1]

Note: Score is calibrated on human-labeled pairs. 
  "90% similar" should mean: a reasonable person would consider these products 
  equivalent alternatives with only minor visual differences.
```

## Vector Database Design

```
Product Vector Index (pgvector):
  Table: product_embeddings
  Columns:
    product_id: UUID (primary key)
    embedding: VECTOR(512)  -- visual similarity embedding
    category_code: VARCHAR(50)  -- used for filtered search
    price_tier: INTEGER  -- 1-5 (for price-range filtered search)
    status: VARCHAR(20)  -- only 'live' products in active index
    updated_at: TIMESTAMP

  Index:
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64)  -- HNSW index parameters
    WHERE status = 'live'  -- partial index: only live products

  Filtered search example:
    SELECT product_id, 1 - (embedding <=> $query_vec) AS similarity
    FROM product_embeddings
    WHERE category_code = 'furniture'
      AND price_tier BETWEEN 2 AND 4
      AND status = 'live'
    ORDER BY embedding <=> $query_vec
    LIMIT 50;
```

## Visual Similarity — Category-Specific Considerations

Different product categories have different visual similarity challenges:

**Fashion:**
- Silhouette is most important for garments (shape of the garment)
- Color matching must be calibrated (exact color vs. same color family)
- Pattern matching: subtle (small dots vs. large dots = different patterns)
- Distinguish between "dress" and "skirt" — category matters more than pure visual
- Solution: separate CLIP fine-tunes per category (fashion, home, beauty)

**Furniture:**
- Material differentiation is critical (wood grain type, fabric texture, metal finish)
- Scale matters: a side table and a dining table may look similar without scale reference
- Construction quality signals: joinery, finish quality, leg design
- Solution: Product DNA Engine extracts material + construction signals specifically

**Beauty/Skincare:**
- Packaging similarity is not product similarity
- Visual similarity mostly about packaging aesthetic
- Ingredient/formulation similarity requires text analysis (separate from visual)
- Solution: for beauty, combine visual (packaging) + text (ingredient description) embeddings

## Improving Similarity Accuracy Over Time

Every user interaction is a training signal for the similarity engine:

| User Action | Training Signal |
|-------------|----------------|
| User searches by image → clicks result | Positive: these two items are similar |
| User searches → does NOT click any results | Negative: no match found (possible coverage gap) |
| User clicks result → immediately returns to search | Weak negative: result was not as similar as expected |
| User clicks result → adds to cart | Strong positive: high-quality match |
| User compares two products → purchases one | Comparative signal: the purchased one was "more right" |
| User reports "not similar" on a result | Strong negative: this result should not appear for this query |

Training pipeline:
- Collect user interaction signals daily
- Re-train similarity model weekly on signal batch
- A/B test new model against current model before full deployment
- Maintain holdout set of human-labeled image pairs for ground truth evaluation

---

# SECTION 3: PRODUCT DNA ENGINE

## Overview

The Product DNA Engine goes beyond visual similarity. It creates a structured understanding of what a product *is* — its material composition, construction quality, design provenance, and aesthetic code — from product images alone.

This structured representation enables:
1. Accurate similarity scoring (matching by DNA, not just visual appearance)
2. AI explanation generation ("This product is different because the material is a linen blend, not pure linen")
3. Filter functionality ("Show me only solid wood options")
4. Aesthetic matching ("Find me products in the Japandi aesthetic")

## Product DNA Schema

```
PRODUCT DNA (extracted per product, stored as JSONB)

{
  "category": {
    "primary": "furniture",
    "secondary": "seating",
    "tertiary": "accent_chair"
  },
  
  "materials": {
    "primary": {
      "name": "sheesham_wood",
      "confidence": 0.91,
      "properties": ["solid", "hardwood", "natural_grain"]
    },
    "secondary": {
      "name": "cotton_fabric",
      "confidence": 0.84,
      "properties": ["woven", "natural_fiber"]
    }
  },
  
  "construction": {
    "joinery_type": "mortise_and_tenon",
    "finish_type": "natural_oil",
    "quality_tier": 3,  // 1-5 scale
    "handcrafted": true,
    "confidence": 0.78
  },
  
  "visual_attributes": {
    "color_primary": {
      "name": "warm_walnut",
      "hex": "#7B5B3A",
      "family": "brown"
    },
    "color_secondary": {
      "name": "natural_cotton",
      "hex": "#F5F0E8",
      "family": "cream"
    },
    "texture_primary": "wood_grain",
    "texture_secondary": "woven_fabric",
    "silhouette": "low_profile_accent_chair",
    "scale_estimate": "single_seating"
  },
  
  "aesthetic_codes": {
    "primary": "japandi",
    "secondary": ["wabi_sabi", "minimalist", "organic_modern"],
    "confidence": 0.88,
    "style_keywords": ["natural", "handcrafted", "warm", "grounded"]
  },
  
  "brand_signals": {
    "brand_logo_detected": false,
    "similar_to_known_brands": [
      {"brand": "CB2", "confidence": 0.71},
      {"brand": "West Elm", "confidence": 0.64}
    ]
  },
  
  "quality_signals": {
    "estimated_tier": "mid_premium",  // budget | value | mid | mid_premium | premium | luxury
    "quality_indicators": ["solid_wood", "visible_grain", "clean_finish"],
    "concern_indicators": [],
    "estimated_durability": "high"
  }
}
```

## Product DNA Extraction Pipeline

```
INPUT: Product images (3-15 photos)
    ↓
PRIMARY CATEGORIZATION
  → Fine-tuned ResNet classifier: determines product category + subcategory
  → Category is used to select specialized downstream extractors
    ↓
MATERIAL EXTRACTION
  → Vision LLM prompt: "Describe the materials visible in this product in detail"
  → Structured extraction via tool calling / function calling
  → Confidence scoring based on image clarity and AI certainty
    ↓
CONSTRUCTION ANALYSIS
  → Vision LLM: "Analyze the construction quality and methods visible"
  → Quality tier classification: budget → luxury
    ↓
AESTHETIC CODE CLASSIFICATION
  → Embedding comparison against aesthetic archetype centroids
  → 200+ aesthetic categories; assign top 3 with confidence scores
    ↓
COLOR ANALYSIS
  → Dominant color extraction (k-means clustering on image pixels)
  → Map to named color + color family
  → Ensure consistency across different lighting conditions in multiple photos
    ↓
BRAND SIGNAL DETECTION
  → Logo detection using specialized brand logo recognition model
  → "Similar to" detection: nearest-neighbor search against known brand product embeddings
    ↓
QUALITY TIER ESTIMATION
  → Combine: material quality + construction quality + price (if available) → quality tier
  → This feeds the "AI Says" explanation on product pages
    ↓
OUTPUT: Product DNA JSONB stored in products table
```

## Aesthetic Code System

DupeScout maintains a curated taxonomy of aesthetic codes that maps to how Gen Z actually describes products and spaces.

**Aesthetic Code Examples:**

```
FASHION AESTHETICS (selected)
  clean_girl           → minimal, neutral, polished
  quiet_luxury         → understated, high-quality, brand-free
  y2k                  → early-2000s influenced, metallic, low-rise
  cottagecore          → floral, pastoral, soft, vintage
  dark_academia        → moody, scholarly, earthy tones
  coastal_grandmother  → linen, wicker, ocean-adjacent, relaxed
  streetwear           → oversized, logo-heavy, sneaker-focused
  gorpcore             → technical outdoor wear in urban contexts
  boho                 → layered, earth-toned, artisan-influenced
  K_style              → Korean fashion influenced

HOME AESTHETICS (selected)
  japandi              → Japanese-Scandinavian fusion, minimal, natural
  wabi_sabi            → imperfect beauty, natural materials, aged
  maximalist           → bold color, pattern mixing, layered
  industrial           → raw metal, exposed wood, utilitarian
  coastal              → light, airy, sandy, ocean-influenced
  farmhouse            → warm wood, linen, vintage-inspired
  retro_70s            → earthy tones, rounded forms, shag textures
  mid_century_modern   → clean lines, organic forms, teak wood
  eclectic             → mixing multiple aesthetics intentionally
  grandmillennial      → traditional with modern attitude, preppy
```

**Aesthetic trends are added to this taxonomy on a rolling basis.** The taxonomy is versioned — new codes are added, older codes are marked "declining." Product DNA fields use the stable taxonomy.

---

# SECTION 4: CONVERSATIONAL AI SHOPPING COPILOT

## Architecture Overview

The Conversational AI is powered by Claude Sonnet 5 (latest Anthropic model). It is not a simple chatbot with scripted responses — it is a full-context shopping assistant with access to DupeScout's product catalog via tool use.

```
CONVERSATIONAL AI ARCHITECTURE

USER MESSAGE
    ↓
INTENT CLASSIFICATION (lightweight)
  → Category: product_search | comparison | gift_finder | price_check | 
               complaint | general_question | out_of_scope
    ↓
CONTEXT ASSEMBLY
  → User style profile (from preferences + history)
  → Current conversation history (last 10 turns)
  → Any images uploaded in this session
    ↓
TOOL SELECTION
  Claude decides which tools to use based on intent:
  → search_products(query, filters)     — search product catalog
  → get_product_details(product_id)     — get specific product info
  → compare_products([product_ids])     — compare multiple products
  → get_price_history(product_id)       — price trend for product
  → get_similar_products(product_id)    — find similar products
  → get_trend_info(aesthetic_code)      — trend lifecycle for aesthetic
  → search_by_image(image_url)          — visual search via image
    ↓
TOOL EXECUTION (parallel where possible)
    ↓
RESPONSE GENERATION
  Claude synthesizes tool results + user context → natural language response
  → Product cards embedded inline in response
  → AI takes a position when asked ("I'd recommend...")
  → Honest about uncertainty ("I'm not sure about that")
    ↓
OUTPUT: Structured response with embedded product cards
```

## System Prompt Design

The system prompt is the most important engineering artifact in the conversational AI layer. It defines the AI's persona, knowledge, limitations, and values.

```
SYSTEM PROMPT (abbreviated):

You are DupeScout's AI Shopping Copilot. You are the most knowledgeable, 
most honest, and most tasteful shopping advisor the user has ever talked to.

YOUR PERSONA:
- You are like the user's most stylish, well-researched friend
- You give opinions, not just lists. You say "I'd recommend option 2"
- You are honest even when honesty costs a sale. If the cheaper option 
  is genuinely worse, you say so clearly
- You ask clarifying questions, but never more than 2 before showing results
- You celebrate great value finds ("This is a genuinely excellent find!")

YOUR KNOWLEDGE:
- You know every product currently available on DupeScout
- You understand visual aesthetics: Japandi, Y2K, quiet luxury, cottagecore, etc.
- You understand product quality: materials, construction, what to look for
- You understand pricing: what things should cost vs. what they're marked up to

YOUR TOOLS:
[Tool definitions for all 8 shopping tools]

HONESTY RULES:
- Never claim a product is available if it's out of stock
- Never make up product specifications
- Never pretend to have seen a product if the visual search returned poor results
- Always disclose similarity scores — don't make them sound higher than they are
- If you don't know something, say "I don't know, but here's how you could find out"

WHAT YOU DON'T DO:
- You don't recommend counterfeit goods
- You don't recommend products that are not on DupeScout or that you haven't verified
- You don't make health/safety claims
- You don't disparage competitors by name

LANGUAGE:
- Respond in the same language the user uses (English or Hindi)
- Hinglish (mixed Hindi-English) is fine and natural
- Be warm and conversational, not corporate
```

## Tool Definitions for Claude

```json
{
  "tools": [
    {
      "name": "search_products",
      "description": "Search DupeScout's product catalog using text query and optional filters",
      "input_schema": {
        "type": "object",
        "properties": {
          "query": {"type": "string", "description": "Natural language search query"},
          "category": {"type": "string", "description": "Product category filter"},
          "price_max": {"type": "number", "description": "Maximum price in INR"},
          "price_min": {"type": "number", "description": "Minimum price in INR"},
          "aesthetic_codes": {"type": "array", "items": {"type": "string"}},
          "local_only": {"type": "boolean"},
          "limit": {"type": "integer", "default": 5}
        },
        "required": ["query"]
      }
    },
    {
      "name": "search_by_image",
      "description": "Find products visually similar to an image URL",
      "input_schema": {
        "type": "object",
        "properties": {
          "image_url": {"type": "string"},
          "price_max": {"type": "number"},
          "category": {"type": "string"},
          "limit": {"type": "integer", "default": 5}
        },
        "required": ["image_url"]
      }
    },
    {
      "name": "compare_products",
      "description": "Get structured comparison between 2-4 products",
      "input_schema": {
        "type": "object",
        "properties": {
          "product_ids": {"type": "array", "items": {"type": "string"}, "minItems": 2, "maxItems": 4}
        },
        "required": ["product_ids"]
      }
    },
    {
      "name": "get_trend_info",
      "description": "Get trend lifecycle and context for an aesthetic or product type",
      "input_schema": {
        "type": "object",
        "properties": {
          "aesthetic_or_product": {"type": "string"}
        },
        "required": ["aesthetic_or_product"]
      }
    }
  ]
}
```

## Context Management

The conversational AI maintains context across turns within a session. Key context elements:

1. **Style context:** What aesthetic is the user shopping for in this session?
2. **Budget context:** What budget has the user mentioned?
3. **Product context:** What products have been shown and discussed?
4. **Negative feedback:** What has the user rejected and why?
5. **Images:** Any images the user uploaded this session

Context is stored server-side per session, not passed entirely in each API call. The API returns the session_id which Claude uses to retrieve context.

Session context expires after 24 hours of inactivity. Users can start fresh at any time.

---

# SECTION 5: RECOMMENDATION ENGINE

## Overview

The Recommendation Engine personalizes every surface that shows products to users — the home feed, the "Also Love" section on product pages, the collections completion suggestions, and proactive notifications.

## Multi-Signal Personalization Architecture

```
RECOMMENDATION ENGINE — SIGNAL SOURCES

USER SIGNALS (real-time + historical)
  → Products viewed (last 30 days)
  → Products saved/wishlisted
  → Products purchased
  → Products explicitly rejected (swipe-left)
  → Collections created and their themes
  → AI chat queries and topic
  → Visual search history (what images uploaded)
  → Price range preference (derived from view + purchase history)

PRODUCT SIGNALS (catalog-level)
  → Product embeddings (visual DNA)
  → Product popularity (view count, purchase rate)
  → Product quality score (reviews, return rate)
  → Product trend score (current trend alignment)
  → Seller quality score

CONTEXTUAL SIGNALS (session-level)
  → Current session category (if user is in furniture mode, weight furniture)
  → Time of day (evening: browsing; morning: purchase intent)
  → Day of week (weekend: higher purchase intent)
  → Device type (mobile: impulse, desktop: considered purchase)
```

## Recommendation Models

**Model 1: User-Based Collaborative Filtering**
- "Users similar to you bought X"
- Computed offline, refreshed every 6 hours
- User vectors computed via matrix factorization on interaction history
- Effective for: users with at least 5 interactions (discovery layer)

**Model 2: Item-Based Collaborative Filtering**  
- "Users who bought A also bought B"
- Item co-occurrence matrix, updated daily
- Effective for: "Complete the look" and "Frequently bought together"

**Model 3: Content-Based Filtering**
- "This product matches your style profile"
- Uses Product DNA embeddings vs. user style profile embedding
- User style profile = weighted average of embeddings of products they've engaged with
- Effective for: new users (after 2-3 interactions) and style-specific recommendations

**Model 4: Real-Time Contextual Bandits**
- Online learning: adjusts recommendations based on real-time click signals in current session
- Balances exploitation (show what the user tends to like) with exploration (show new things that might expand their taste)
- Uses Thompson Sampling for the exploration-exploitation tradeoff

**Ensemble:**
```
FINAL_RECOMMENDATION_SCORE = (
  COLLABORATIVE_SCORE × 0.35 +
  CONTENT_SCORE × 0.35 +
  CONTEXTUAL_SCORE × 0.20 +
  QUALITY_SCORE × 0.10
) × DIVERSITY_FACTOR

DIVERSITY_FACTOR: Applied to prevent showing very similar products in a single recommendation set.
  If similarity between two recommended products > 0.85, suppress the lower-ranked one.
```

## Cold Start Problem

New users have no interaction history. Two strategies:

**Strategy 1: Style Quiz (explicit onboarding)**
- 3-5 visual mood board selections
- Budget range selection
- Primary category interest
- These initial signals bootstrap the content-based model

**Strategy 2: Implicit signals (zero-click)**
- Even without interactions, we have: device type, location, time, referral source
- If user came from Instagram fashion content → start with fashion recommendations
- If user came from a Pinterest home inspiration link → start with home recommendations
- Location: users in Mumbai/Delhi lean toward fashion; Bengaluru leans toward home/tech accessories

---

# SECTION 6: RANKING ALGORITHMS

## Overview

Ranking determines the order in which products appear in search results. It must balance multiple competing objectives:
- **Relevance:** How similar is this product to what the user searched for?
- **Quality:** How good is this product (reviews, return rate, seller quality)?
- **Value:** Is this a good deal at this price?
- **Diversity:** Should we avoid showing 20 identical products?
- **Freshness:** Should new products get visibility?
- **Local First:** Should local sellers rank equally to large sellers?

## Ranking Model Architecture

```
RANKING MODEL (Learning to Rank — LambdaMART)

Input features for each (query, product) pair:
  
  RELEVANCE FEATURES
  → visual_similarity_score: cosine similarity of embeddings
  → text_match_score: BM25 score if query has text component
  → category_match: boolean (exact category match)
  → attribute_match_score: Jaccard similarity of attributes
  → aesthetic_alignment_score: style code overlap
  
  QUALITY FEATURES
  → avg_review_score: 1-5 scale
  → review_count_log: log(review_count + 1)
  → return_rate: fraction returned (negative signal)
  → seller_quality_score: composite seller score 0-100
  → recency: days since listing (log-normalized)
  
  VALUE FEATURES
  → price_percentile: where this product sits in price distribution for category
  → price_vs_similar: this product's price / average price of similar products
  → value_score: (review_quality × similarity) / price_normalized
  
  PERSONALIZATION FEATURES
  → user_category_affinity: how much user has engaged with this category
  → user_price_range_fit: does this price fit user's historical range?
  → user_aesthetic_match: overlap between product aesthetics and user profile
  
  BUSINESS FEATURES
  → in_stock: boolean (out-of-stock products penalized heavily)
  → sponsored: boolean (sponsored products placed separately, not mixed in)
  → seller_tier: badge quality (Artisan Verified, Top Seller, etc.)

Target variable:
  → Learned from user clicks, add-to-carts, purchases (graded relevance)
  → Normalized discounted cumulative gain (NDCG) as optimization objective
```

## The "Local First" Ranking Rule

When two products have equal ranking scores (within 5% of each other), the local/artisan seller product ranks above the large brand product.

This is implemented as a post-processing step after the ML ranking:
```python
def apply_local_first(ranked_products, threshold=0.05):
    for i in range(len(ranked_products)):
        for j in range(i+1, len(ranked_products)):
            score_diff = ranked_products[i].score - ranked_products[j].score
            if score_diff < threshold:  # Within 5% of each other
                if ranked_products[j].is_local_artisan and not ranked_products[i].is_local_artisan:
                    ranked_products[i], ranked_products[j] = ranked_products[j], ranked_products[i]
    return ranked_products
```

This is a business rule reflecting DupeScout's values, not pure ML optimization. It is explicit and auditable.

## Diversity Injection

Without diversity injection, search results for "blue sofa" would show 50 blue sofas that look identical. Diversity injection ensures variety.

```python
def inject_diversity(candidates, diversity_threshold=0.85):
    selected = []
    for candidate in candidates:
        too_similar = False
        for selected_item in selected:
            if cosine_similarity(candidate.embedding, selected_item.embedding) > diversity_threshold:
                too_similar = True
                break
        if not too_similar:
            selected.append(candidate)
    return selected
```

---

# SECTION 7: TREND PREDICTION ENGINE

## Architecture

The Trend Prediction Engine monitors social signals and DupeScout internal signals to identify emerging aesthetic trends — and predict when a trend will peak.

**Data Sources:**

```
INTERNAL SIGNALS (highest quality, proprietary)
  → Daily save counts per aesthetic code
  → Search query volume by aesthetic keyword
  → Collection theme analysis (NLP on user-created collection names)
  → Visual search query clustering (what are users uploading?)
  → Pro user wishlist additions by category

EXTERNAL SIGNALS (complementary)
  → Google Trends India (official API)
  → Reddit post velocity: new posts with aesthetic keywords in target subreddits
  → Pinterest save velocity (via official API)
  → Instagram hashtag velocity (via approved API tier)
```

**Trend Lifecycle Model:**

```
TREND DETECTION:
  A keyword/aesthetic is "emerging" when:
  → Week-over-week growth rate > 40% for 2+ consecutive weeks
  → AND absolute volume crosses minimum threshold (100+ searches/day)
  → AND the signal is consistent across 2+ data sources

TREND PEAK DETECTION:
  A trend is "peaking" when:
  → Growth rate decelerates to <20% WoW
  → Absolute volume is at maximum
  → Mainstream fashion publication coverage detected (NLP on fashion news)

TREND DECLINE DETECTION:
  A trend is "declining" when:
  → Week-over-week change turns negative for 2+ consecutive weeks
  → AND being replaced by a new emerging trend in similar aesthetic space

TREND PEAK PREDICTION:
  → Time-series model (Prophet) trained on historical trend lifecycle data
  → Input: current growth trajectory
  → Output: predicted weeks until peak (± 2 weeks accuracy target)
```

---

# SECTION 8: PRICE INTELLIGENCE ENGINE

## Architecture

The Price Intelligence Engine answers: "For this product, is this a good price?" and "Is the price likely to change?"

**Data Collection:**

```
DUPESCOUT INTERNAL
  → Historical prices for all marketplace products (tracked continuously)
  → Return rate by price tier (quality signal)
  → Conversion rate by price tier (demand signal)

EXTERNAL PRICE TRACKING
  → Amazon India product prices (via price tracking APIs / affiliate data)
  → Flipkart prices (affiliate API)
  → Myntra prices (where available via affiliate partnership)
  → Meesho prices (for low-price segment benchmarks)
```

**Price Intelligence Outputs:**

```
For each product:

1. MARKET POSITION
   "Your price vs. similar products:
    You are priced at ₹8,200
    Similar products: ₹6,000 - ₹14,000 (median: ₹9,400)
    Position: Competitive (bottom 30% of range)"

2. PRICE HISTORY ANALYSIS
   "30-day high: ₹9,800 | 30-day low: ₹7,200 | Current: ₹8,200
    Price trend: Stable"

3. PRICE PREDICTION (for consumer price alerts)
   "Based on this seller's history, this product typically goes on sale
    during festival periods (next: Diwali in ~90 days). Average discount: 15-20%.
    Prediction confidence: 68%."

4. VALUE SCORE (for AI explanations)
   "At ₹8,200 with a 4.5-star rating, this product represents good value.
    Products with similar quality rating typically cost ₹10,000-12,000."
```

---

# SECTION 9: REVIEW AUTHENTICITY AI

## The Fake Review Problem

Fake reviews are endemic to Indian ecommerce. A 2024 study found 28% of 4-5 star reviews on major Indian ecommerce platforms showed signals of inauthenticity. This destroys consumer trust in ratings.

DupeScout's commitment: every review shown is a genuine review from a verified purchaser, or it is removed.

## Detection System

```
REVIEW AUTHENTICITY SIGNALS:

TEXT ANALYSIS
  → Sentiment vs. detail balance: genuine reviews have specific details
    ("The linen is slightly rough but softens with washing")
    Fake reviews are vague superlatives ("Amazing product! Love it!")
  → Writing style variation: real reviews show natural variation in style
  → Template detection: NLP finds reviews that follow the same template
  → Language model perplexity: AI-generated text has different perplexity profile

REVIEWER BEHAVIOR
  → Account age: reviews from accounts created within 48h of purchase → flag
  → Review pattern: reviewer who leaves 10 5-star reviews in 2 hours → flag
  → Purchase verification: EVERY review must be from a verified purchase (no exception)
  → Reviewer purchase history: reviewer who buys and reviews only from one seller → flag

NETWORK ANALYSIS
  → IP clustering: multiple reviews from same IP range → flag
  → Device fingerprint: multiple reviews from same device → flag
  → Seller-reviewer network graph: detect if sellers are connected to reviewers

STATISTICAL ANOMALIES
  → Sudden rating spikes: product goes from 3.8★ to 4.9★ in 48 hours → flag
  → Rating distribution anomaly: all reviews are exactly 5★ with no 4★ or 3★ → flag
```

**Action Thresholds:**
- Confidence >85%: Remove review + flag for human review
- Confidence 60-85%: Flag for human review; review stays visible
- Confidence <60%: No action; review stays visible with "Verified Purchase" badge

---

# SECTION 10: OVERALL TECHNICAL ARCHITECTURE

## System Architecture Diagram

```
                        DUPESCOUT SYSTEM ARCHITECTURE

  CLIENT LAYER
  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
  │   Android App   │  │     iOS App     │  │   Web (Next.js) │
  │   (React Native)│  │  (React Native) │  │                 │
  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
           │                    │                      │
           └────────────────────┼──────────────────────┘
                                │
                         CDN (CloudFront)
                                │
  API GATEWAY LAYER
  ┌──────────────────────────────────────────────────────────────┐
  │  API Gateway (Kong or AWS API Gateway)                       │
  │  Rate limiting | Auth | SSL termination | Routing           │
  └──────────────────────────────────────────────────────────────┘
                                │
          ┌─────────────────────┼──────────────────────┐
          │                     │                       │
  ┌───────┴───────┐   ┌─────────┴───────┐   ┌─────────┴──────┐
  │  Consumer API  │   │   Seller API    │   │   Admin API    │
  │  (FastAPI)     │   │  (FastAPI)      │   │  (FastAPI)     │
  └───────┬───────┘   └─────────┬───────┘   └─────────┬──────┘
          └─────────────────────┼──────────────────────┘
                                │
  AI SERVICES LAYER
  ┌──────────────────────────────────────────────────────────────┐
  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
  │  │Visual Search│  │ Product DNA  │  │ Conversational AI  │  │
  │  │ Service     │  │ Service      │  │ Service (Claude)   │  │
  │  └─────────────┘  └──────────────┘  └────────────────────┘  │
  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
  │  │ Recommenda- │  │   Ranking    │  │  Trend Prediction  │  │
  │  │ tion Service│  │   Service    │  │  Service           │  │
  │  └─────────────┘  └──────────────┘  └────────────────────┘  │
  └──────────────────────────────────────────────────────────────┘
                                │
  DATA LAYER
  ┌──────────────────────────────────────────────────────────────┐
  │  ┌──────────────────┐  ┌──────────────┐  ┌────────────────┐ │
  │  │ PostgreSQL 16     │  │  Redis 7     │  │ Elasticsearch  │ │
  │  │ (Primary DB +    │  │  (Cache +    │  │ (Full-text     │ │
  │  │  pgvector)       │  │   Sessions)  │  │  search index) │ │
  │  └──────────────────┘  └──────────────┘  └────────────────┘ │
  │  ┌──────────────────┐  ┌──────────────┐  ┌────────────────┐ │
  │  │ S3 / R2          │  │  Kafka       │  │ ClickHouse     │ │
  │  │ (Object Storage) │  │  (Event Bus) │  │ (Analytics)    │ │
  │  └──────────────────┘  └──────────────┘  └────────────────┘ │
  └──────────────────────────────────────────────────────────────┘
  
  EXTERNAL INTEGRATIONS
  ┌──────────────────────────────────────────────────────────────┐
  │  Razorpay (Payments)  │  Shiprocket (Logistics)             │
  │  Twilio (SMS/WhatsApp)│  GSTN API (GST validation)          │
  │  AWS Rekognition      │  Anthropic API (Claude)             │
  │  Amazon Affiliate API │  Flipkart Affiliate API             │
  └──────────────────────────────────────────────────────────────┘
```

## Technology Stack Decisions

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Mobile | React Native | Single codebase for iOS + Android; large talent pool in India |
| Web Frontend | Next.js 14 + TypeScript | SSR for SEO, App Router for performance, TypeScript for safety |
| API Services | Python FastAPI | Best ecosystem for AI/ML integration; async support; fast |
| Primary Database | PostgreSQL 16 + pgvector | ACID compliance; pgvector for vector search; mature ecosystem |
| Full-text Search | Elasticsearch 8 | Best-in-class for text search; needed for keyword + hybrid search |
| Cache | Redis 7 | Session management, API response caching, rate limiting |
| Analytics DB | ClickHouse | Columnar, extremely fast for analytical queries; open source |
| Event Streaming | Apache Kafka | High-throughput event streaming; replay capability |
| Object Storage | AWS S3 / Cloudflare R2 | Product images, documents; R2 for cost-optimized storage |
| AI Inference | Anthropic API + AWS SageMaker | Claude for LLM; SageMaker for custom fine-tuned models |
| ML Platform | MLflow | Experiment tracking, model versioning, deployment |
| CDN | CloudFront + Cloudflare | India edge nodes critical for performance |
| Container Platform | AWS ECS Fargate | Serverless containers; auto-scaling; India region |
| Observability | Datadog | APM, logs, metrics; India data residency |

## Why India Hosting Matters

All user data and product data must be hosted in India (AWS ap-south-1 Mumbai + ap-south-2 Hyderabad). Reasons:
1. Data localization compliance (India DPDP Act 2023)
2. Latency: <30ms from major Indian cities vs. 200ms+ from US
3. Payment gateway requirements
4. Future regulatory compliance

---

# SECTION 11: DATABASE DESIGN & SCHEMA

## Core Database Architecture

**Primary Database: PostgreSQL 16 with pgvector**
- All transactional data
- Product embeddings (via pgvector extension)
- Read replicas for heavy-read workloads

**Full-text Search: Elasticsearch 8**
- Product title and description search
- Keyword + semantic hybrid search
- Autocomplete and spell correction

**Analytics: ClickHouse**
- All event data (page views, clicks, searches, purchases)
- Aggregated metrics for dashboards
- Immutable; append-only

## Critical Tables and Schemas

```sql
-- USERS TABLE
CREATE TABLE users (
    user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number    VARCHAR(15) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE,
    name            VARCHAR(200),
    date_of_birth   DATE,
    city            VARCHAR(100),
    state           VARCHAR(100),
    pin_code        VARCHAR(10),
    style_profile   JSONB DEFAULT '{}',   -- style quiz results, aesthetic codes
    preferences     JSONB DEFAULT '{}',   -- notification prefs, size info
    is_pro          BOOLEAN DEFAULT FALSE,
    pro_expires_at  TIMESTAMP,
    credit_balance  DECIMAL(10,2) DEFAULT 0,
    referral_code   VARCHAR(20) UNIQUE,
    referred_by     UUID REFERENCES users(user_id),
    verification_status VARCHAR(50) DEFAULT 'phone_verified',
    total_orders    INTEGER DEFAULT 0,
    total_gmv       DECIMAL(12,2) DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    last_active     TIMESTAMP DEFAULT NOW(),
    account_status  VARCHAR(20) DEFAULT 'active'  -- active, suspended, deleted
);

-- PRODUCTS TABLE
CREATE TABLE products (
    product_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id       UUID REFERENCES sellers(seller_id) NOT NULL,
    title           VARCHAR(150) NOT NULL,
    slug            VARCHAR(200) UNIQUE NOT NULL,
    description     TEXT,
    category        VARCHAR(100) NOT NULL,
    subcategory     VARCHAR(100),
    price           DECIMAL(10,2) NOT NULL CHECK (price > 0),
    price_compare   DECIMAL(10,2),
    currency        VARCHAR(3) DEFAULT 'INR',
    stock_quantity  INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    weight_grams    INTEGER,
    dimensions_cm   JSONB,
    images          JSONB NOT NULL,  -- [{url, order, alt_text}]
    video_url       TEXT,
    material_primary VARCHAR(100),
    materials_tags  JSONB DEFAULT '[]',
    style_tags      JSONB DEFAULT '[]',
    aesthetic_codes JSONB DEFAULT '[]',
    product_dna     JSONB DEFAULT '{}',  -- full Product DNA object
    color_primary   VARCHAR(50),
    color_hex       VARCHAR(10),
    visual_embedding VECTOR(512),  -- pgvector
    similar_products JSONB DEFAULT '[]',  -- [{product_id, similarity_score}]
    avg_rating      DECIMAL(3,2),
    review_count    INTEGER DEFAULT 0,
    view_count      INTEGER DEFAULT 0,
    save_count      INTEGER DEFAULT 0,
    purchase_count  INTEGER DEFAULT 0,
    return_rate     DECIMAL(5,4) DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'pending_review',
    ai_generated    BOOLEAN DEFAULT TRUE,
    moderation_notes JSONB,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_embedding ON products 
    USING hnsw (visual_embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64)
    WHERE status = 'live';

CREATE INDEX idx_products_category_status ON products (category, status);
CREATE INDEX idx_products_seller ON products (seller_id, status);
CREATE INDEX idx_products_aesthetic ON products USING GIN (aesthetic_codes);

-- ORDERS TABLE
CREATE TABLE orders (
    order_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id        UUID REFERENCES users(user_id) NOT NULL,
    status          VARCHAR(30) DEFAULT 'pending_payment',
    items           JSONB NOT NULL,  -- [{product_id, variant_id, qty, price, seller_id}]
    subtotal        DECIMAL(12,2) NOT NULL,
    shipping_total  DECIMAL(10,2) DEFAULT 0,
    discount_total  DECIMAL(10,2) DEFAULT 0,
    total           DECIMAL(12,2) NOT NULL,
    currency        VARCHAR(3) DEFAULT 'INR',
    delivery_address JSONB NOT NULL,
    payment_method  VARCHAR(50),
    payment_ref     VARCHAR(200),
    payment_status  VARCHAR(20) DEFAULT 'pending',
    coupon_code     VARCHAR(50),
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ORDER_ITEMS TABLE (denormalized from orders.items for easier querying)
CREATE TABLE order_items (
    item_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID REFERENCES orders(order_id),
    seller_id       UUID REFERENCES sellers(seller_id),
    product_id      UUID REFERENCES products(product_id),
    variant_id      UUID,
    quantity        INTEGER NOT NULL,
    unit_price      DECIMAL(10,2) NOT NULL,
    total_price     DECIMAL(10,2) NOT NULL,
    fulfillment_status VARCHAR(30) DEFAULT 'pending',
    carrier         VARCHAR(100),
    tracking_number VARCHAR(200),
    shipped_at      TIMESTAMP,
    delivered_at    TIMESTAMP,
    estimated_delivery DATE,
    return_requested BOOLEAN DEFAULT FALSE,
    return_reason   TEXT
);

-- REVIEWS TABLE
CREATE TABLE reviews (
    review_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID REFERENCES products(product_id),
    order_item_id   UUID REFERENCES order_items(item_id),
    buyer_id        UUID REFERENCES users(user_id),
    rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
    title           VARCHAR(200),
    body            TEXT,
    photos          JSONB DEFAULT '[]',  -- [{url, order}]
    helpful_votes   INTEGER DEFAULT 0,
    similarity_rating INTEGER CHECK (similarity_rating BETWEEN 1 AND 5),  -- DupeScout-specific
    authenticity_score DECIMAL(5,4),  -- AI-computed, NULL = not yet scored
    is_verified     BOOLEAN DEFAULT TRUE,  -- always true (only verified purchases allowed)
    is_visible      BOOLEAN DEFAULT TRUE,
    moderation_status VARCHAR(20) DEFAULT 'approved',
    created_at      TIMESTAMP DEFAULT NOW()
);

-- COLLECTIONS TABLE
CREATE TABLE collections (
    collection_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(user_id),
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    cover_image     TEXT,
    visibility      VARCHAR(20) DEFAULT 'private',  -- private, friends, public
    item_count      INTEGER DEFAULT 0,
    follower_count  INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- COLLECTION_ITEMS TABLE
CREATE TABLE collection_items (
    item_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id   UUID REFERENCES collections(collection_id),
    product_id      UUID REFERENCES products(product_id),
    external_url    TEXT,  -- for non-DupeScout products saved as inspiration
    image_url       TEXT,
    note            TEXT,
    added_by        UUID REFERENCES users(user_id),
    price_at_save   DECIMAL(10,2),
    current_price   DECIMAL(10,2),
    price_change    DECIMAL(10,2),  -- current - at_save; negative = good
    added_at        TIMESTAMP DEFAULT NOW()
);
```

---

# SECTION 12: API ARCHITECTURE

## REST API Design Standards

**Base URL:** `https://api.dupescout.com/v1`  
**Authentication:** JWT Bearer tokens (short-lived, 4-hour expiry for consumer)  
**Rate Limiting:** 60 requests/minute for authenticated users; 10/minute for unauthenticated  
**Response Format:** Consistent JSON envelope

```json
// Success response
{
  "status": "success",
  "data": {...},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 847,
    "total_pages": 43
  }
}

// Error response
{
  "status": "error",
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with ID xyz does not exist",
    "field": "product_id"  // for validation errors
  }
}
```

## Visual Search API (Key Endpoint)

```
POST /v1/search/visual
Content-Type: multipart/form-data OR application/json

Request (image upload):
  Form field: image (file upload, max 25MB)
  Form field: category (optional, for filtered search)
  Form field: price_max (optional)
  Form field: price_min (optional)

Request (URL):
  {
    "image_url": "https://...",
    "category": "furniture",
    "price_max": 20000
  }

Response (200):
{
  "status": "success",
  "data": {
    "search_id": "uuid",
    "query_analysis": {
      "detected_category": "furniture",
      "detected_subcategory": "accent_chair",
      "detected_materials": ["bouclé fabric", "solid wood legs"],
      "detected_aesthetics": ["minimalist", "japandi"],
      "detected_color": "cream",
      "confidence": 0.91
    },
    "results": {
      "identified_original": {
        "name": "West Elm Cozy Accent Chair",
        "brand": "West Elm",
        "price": 89999,
        "url": "https://westelm.com/...",
        "confidence": 0.76,
        "affiliate_url": "https://..."
      },
      "smart_value": [
        {
          "product_id": "uuid",
          "title": "Bouclé Accent Chair",
          "seller_name": "Modern Living",
          "price": 12999,
          "similarity_score": 0.91,
          "avg_rating": 4.6,
          "review_count": 248,
          "image_url": "https://cdn.dupescout.com/...",
          "ai_explanation": "Near-identical silhouette and fabric type. Wood legs are pine vs. ash in the West Elm version. Functionally equivalent for most use cases.",
          "in_stock": true
        }
      ],
      "also_similar": [...]
    }
  },
  "meta": {
    "search_time_ms": 1840,
    "total_results": 47
  }
}
```

## AI Chat API

```
POST /v1/ai/chat
{
  "session_id": "uuid (null for new session)",
  "message": "string",
  "image_url": "string (optional)"
}

Response (streaming SSE):
event: token
data: {"token": "Here", "session_id": "uuid"}

event: token  
data: {"token": " are", "session_id": "uuid"}

...

event: products
data: {
  "products": [
    {
      "product_id": "uuid",
      "title": "string",
      "price": number,
      "similarity_score": number,
      "image_url": "string",
      "add_to_cart_url": "string"
    }
  ]
}

event: done
data: {"session_id": "uuid", "message_id": "uuid"}
```

---

# SECTION 13: INFRASTRUCTURE & DEVOPS

## Environment Strategy

| Environment | Purpose | Refresh |
|-------------|---------|---------|
| Development (dev) | Individual developer environments | Per-developer |
| Staging | Integration testing, QA, UAT | Continuous (matches production) |
| Production | Live traffic | Controlled deploys |

## Deployment Architecture

```
PRODUCTION DEPLOYMENT

  AWS Region: ap-south-1 (Mumbai) — primary
  AWS Region: ap-south-2 (Hyderabad) — DR and read replicas

  Container Platform: AWS ECS Fargate
    Consumer API:    Min 2 tasks, Max 50 tasks (auto-scale on CPU/request volume)
    Seller API:      Min 2 tasks, Max 20 tasks
    Admin API:       Min 1 task, Max 5 tasks
    Visual Search:   Min 2 tasks, Max 30 tasks (GPU-enabled instances for ML)
    AI Services:     Min 1 task, Max 20 tasks

  Database:
    PostgreSQL: RDS Multi-AZ (db.r6g.2xlarge) + 3 read replicas
    Redis:      ElastiCache Redis 7, 3-node cluster
    ClickHouse: Self-managed on ECS (or ClickHouse Cloud)
    Elasticsearch: AWS OpenSearch Service, 3-node cluster

  CDN: CloudFront with Lambda@Edge for image optimization
  
  Object Storage:
    Product images: S3 (ap-south-1) + CloudFront distribution
    Model artifacts: S3 with versioning
    Backups: S3 Glacier (30-day retention)
```

## CI/CD Pipeline

```
DEVELOPER PUSHES TO FEATURE BRANCH
    ↓
GITHUB ACTIONS — CI PIPELINE
  → Lint and type check
  → Unit tests (target: >80% coverage)
  → Integration tests (staging database)
  → Security scan (Snyk)
  → Docker build and push to ECR
    ↓
PULL REQUEST REVIEW
  → Code review (minimum 1 approver)
  → Automated test results visible in PR
    ↓
MERGE TO MAIN
    ↓
STAGING AUTO-DEPLOY
  → Deployed to staging within 10 minutes
  → Smoke tests run automatically
  → Staging URL available for QA testing
    ↓
PRODUCTION DEPLOY (manual trigger)
  → Blue-green deployment (zero downtime)
  → Canary release: 5% traffic to new version initially
  → Automatic rollback if error rate increases >0.5%
  → Full traffic cutover after 30-minute observation
```

---

# SECTION 14: SECURITY ARCHITECTURE

## Security Principles

1. **Zero Trust:** Every API call is authenticated. Internal services authenticate to each other.
2. **Least Privilege:** Every system component has only the permissions it needs.
3. **Defense in Depth:** Security at every layer — network, application, data.
4. **Encrypt Everything:** Data encrypted at rest (AES-256) and in transit (TLS 1.3).

## Security Controls

| Layer | Control | Implementation |
|-------|---------|----------------|
| API Authentication | JWT with RS256 | Short-lived tokens (4h) + refresh tokens (30d) |
| API Authorization | RBAC via JWT claims | Role claims in JWT; validated per endpoint |
| Data Encryption at Rest | AES-256 | AWS KMS managed keys |
| Data Encryption in Transit | TLS 1.3 | Enforced via API Gateway + internal service mesh |
| Secrets Management | AWS Secrets Manager | No secrets in code or environment variables |
| SQL Injection | Parameterized queries | SQLAlchemy ORM; no raw string queries |
| XSS Prevention | Content Security Policy | Next.js CSP headers |
| Rate Limiting | Token bucket | Kong API Gateway rate limiting |
| DDoS Protection | AWS Shield + WAF | Enabled at API Gateway level |
| PII Data Handling | Field-level encryption | Phone, email, bank details encrypted in DB |
| Audit Logging | Immutable log stream | All admin actions + sensitive operations logged to CloudWatch |

## India Data Protection Compliance (DPDP Act 2023)

| Requirement | Implementation |
|------------|----------------|
| Consent for data processing | Explicit consent at signup with granular toggles |
| Data minimization | Collect only what's needed for stated purpose |
| Right to access | User can download full data export within 72 hours |
| Right to erasure | Account deletion removes PII within 30 days |
| Data localization | All data stored in India (AWS ap-south-1/2) |
| Breach notification | Incident response plan with 72-hour regulatory notification |
| Data processing agreement | All third-party processors have signed DPAs |

---

# SECTION 15: PERFORMANCE ENGINEERING

## Performance Budgets

| Operation | P50 Target | P95 Target | P99 Target |
|-----------|-----------|-----------|-----------|
| Visual search (full pipeline) | 1.5s | 2.0s | 3.0s |
| Keyword search | 100ms | 200ms | 400ms |
| Product page load (API) | 80ms | 150ms | 300ms |
| AI chat first token | 600ms | 900ms | 1500ms |
| Checkout submission | 300ms | 600ms | 1000ms |
| Homepage feed (personalized) | 150ms | 250ms | 400ms |

## Performance Optimization Strategies

**Caching Strategy:**
```
L1: In-memory (application-level)
  → Product DNA for recently viewed products
  → User style profile (refresh every hour)
  → Trending products list (refresh every 15 minutes)
  TTL: 15-60 seconds; max 500MB per instance

L2: Redis Cache
  → Popular search queries → pre-computed results
  → Product detail pages → full rendered JSON
  → User session data + shopping cart
  → API rate limiting counters
  TTL: 5-30 minutes

L3: CDN Cache (CloudFront)
  → Product images (immutable; long-lived)
  → Static assets (js, css)
  → Pre-rendered listing pages for popular products
  TTL: Images: 365 days; Dynamic: 60 seconds
```

**Database Optimization:**
- Read replicas for all heavy-read operations (search, product listing, analytics)
- Materialized views for expensive aggregations (seller analytics dashboards)
- Partial indexes on frequently-filtered columns (status = 'live')
- Query analysis: Slow query log reviewed weekly; >100ms queries must be optimized

**Image Optimization:**
- All product images served via CloudFront with auto-format (WebP for modern browsers)
- Responsive images: 4 sizes generated (200px, 400px, 800px, 1200px)
- Lazy loading for below-fold images
- LQIP (Low Quality Image Placeholders) for immediate visual feedback

---

# SECTION 16: MLOPS & MODEL LIFECYCLE

## Model Versioning and Deployment

Every AI model in DupeScout is versioned, tracked, and deployed through a controlled pipeline.

```
MODEL LIFECYCLE

RESEARCH PHASE
  → Data scientist experiments on Jupyter + MLflow tracking
  → All experiments logged: hyperparameters, metrics, artifacts
  → Evaluation on holdout dataset + human evaluation panel
    ↓
STAGING DEPLOYMENT
  → Model wrapped in FastAPI service
  → Deployed to staging environment
  → A/B test against current production model (5% traffic)
  → Monitor: latency, error rate, business metrics
    ↓
PRODUCTION DEPLOYMENT (if A/B test positive)
  → Blue-green deployment
  → Canary: 10% traffic initially
  → Gradual ramp: 10% → 25% → 50% → 100% over 48 hours
  → Automatic rollback if quality metrics degrade
    ↓
MONITORING (ongoing)
  → Data drift detection: are production inputs looking different from training data?
  → Performance monitoring: are accuracy metrics stable?
  → Business metric correlation: does model quality correlate with GMV?
    ↓
RETRAINING TRIGGER
  → Scheduled: weekly retraining for fast-moving models (trend prediction)
  → Triggered: when data drift detected or accuracy drops >2%
```

## Key Models and Retraining Frequency

| Model | Retraining Frequency | Trigger |
|-------|---------------------|---------|
| Visual similarity embedding | Monthly | + User signal accumulation |
| Product DNA extractor | Quarterly | + New category added |
| Recommendation engine | Daily | Continuous learning via bandits |
| Ranking model | Weekly | Click signal accumulation |
| Trend prediction | Daily | New social signals |
| Fraud detection | Weekly | New fraud patterns |
| Review authenticity | Monthly | New fake review patterns |

---

# SECTION 17: EVENT TRACKING PLAN

## Tracking Philosophy

"Track everything you might ever want to analyze, but respect user privacy." All events are stored anonymously by default; user ID attached only when user is authenticated. No cross-site tracking. No selling data to advertisers.

## Event Taxonomy

```
CONSUMER EVENTS

APP EVENTS
  app_launched
  app_backgrounded
  app_version: {version}

DISCOVERY EVENTS
  search_initiated: {type: visual|keyword|ai_chat|link_paste, query_text?, has_image}
  search_results_shown: {search_id, result_count, top_result_score}
  search_result_clicked: {search_id, product_id, position, similarity_score}
  search_result_dismissed: {search_id, product_id, position}
  search_no_results: {search_id, query}
  
  visual_search_image_uploaded: {file_size, file_type, category_detected}
  link_pasted: {platform: amazon|instagram|pinterest|other}
  
  ai_chat_started: {session_id}
  ai_chat_message_sent: {session_id, message_length, has_image}
  ai_chat_product_shown: {session_id, product_id, position}
  ai_chat_product_clicked: {session_id, product_id}
  ai_chat_ended: {session_id, duration_seconds, messages_count}

PRODUCT EVENTS
  product_viewed: {product_id, source: search|recommendation|collection|direct}
  product_images_swiped: {product_id, images_viewed_count}
  comparison_viewed: {product_ids: []}
  ai_explanation_expanded: {product_id}
  seller_profile_viewed: {seller_id, from_product_id}
  similar_products_viewed: {product_id, similar_products_shown}

COLLECTION EVENTS
  product_saved: {product_id, collection_id: null|uuid}
  product_unsaved: {product_id}
  collection_created: {name, initial_product_id?}
  collection_shared: {collection_id, share_platform}
  collection_viewed: {collection_id, is_own}
  price_alert_set: {product_id, target_price}

PURCHASE EVENTS
  add_to_cart: {product_id, quantity, price, source}
  cart_viewed: {item_count, total}
  checkout_started: {order_value, item_count}
  checkout_step_completed: {step: address|payment, time_spent_seconds}
  payment_method_selected: {method: upi|card|cod|emi}
  order_placed: {order_id, total, item_count, payment_method}
  order_viewed: {order_id}
  
  coupon_applied: {coupon_code, discount_amount}
  coupon_failed: {coupon_code, reason}

ENGAGEMENT EVENTS
  share_initiated: {product_id, share_platform}
  referral_link_copied: {}
  notification_received: {type, product_id?}
  notification_opened: {type, product_id?}
  pro_subscription_viewed: {}
  pro_subscription_started: {plan: monthly|annual}

SELLER EVENTS (separate namespace)
  seller_product_published: {product_id, ai_assisted}
  seller_order_accepted: {order_id}
  seller_order_shipped: {order_id, carrier}
  seller_payout_received: {amount}
  seller_ai_insight_acted_on: {insight_type}
```

## Analytics Data Flow

```
EVENTS → Kafka Topic → ClickHouse Consumer → Analytics Tables
                     ↓
              Real-time dashboards (Grafana)
              A/B test analysis
              ML training data pipeline
              Business reporting (Metabase)
```

---

# SECTION 18: ANALYTICS DATA ARCHITECTURE

## ClickHouse Analytics Schema

```sql
-- All events
CREATE TABLE events (
    event_id        String,
    event_name      String,
    user_id         Nullable(String),
    session_id      String,
    timestamp       DateTime64(3),
    platform        Enum8('android'=1, 'ios'=2, 'web'=3),
    app_version     String,
    properties      String  -- JSON string of event properties
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (event_name, user_id, timestamp);

-- Product performance summary (materialized, refreshed hourly)
CREATE MATERIALIZED VIEW product_daily_metrics
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (product_id, date)
AS SELECT
    product_id,
    toDate(timestamp) AS date,
    countIf(event_name = 'product_viewed') AS views,
    countIf(event_name = 'add_to_cart') AS add_to_cart,
    countIf(event_name = 'order_placed') AS purchases,
    sumIf(
        JSONExtractFloat(properties, 'price'), 
        event_name = 'order_placed'
    ) AS gmv
FROM events
GROUP BY product_id, date;

-- Search quality metrics (for AI model evaluation)
CREATE MATERIALIZED VIEW search_quality
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (search_type, date)
AS SELECT
    toDate(timestamp) AS date,
    JSONExtractString(properties, 'type') AS search_type,
    count() AS total_searches,
    countIf(event_name = 'search_result_clicked') AS clicks,
    avgIf(
        JSONExtractFloat(properties, 'position'),
        event_name = 'search_result_clicked'
    ) AS avg_click_position,
    countIf(event_name = 'search_no_results') AS no_result_searches
FROM events
WHERE event_name IN ('search_initiated', 'search_result_clicked', 'search_no_results')
GROUP BY date, search_type;
```

---

*End of Volume 5.*

**Next: Volume 6 — GTM Strategy, Growth Loops, Monetization, Roadmap & Investor Memo**

---

*DupeScout Founder Blueprint — Volume 5 of 6*  
*Confidential. Not for distribution.*
