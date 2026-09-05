"""Visual Similarity Engine — CLIP-based image embedding + pgvector ANN search.

Architecture (Vol 5 §2):
  1. Input:  base64 image OR URL
  2. Encode: CLIP ViT-L/14 → 512-dim float32 embedding (normalised)
  3. Search: pgvector HNSW index, ef_search=100, top-K=150
  4. Rerank: cosine similarity + Local First boost + quality score
  5. Tier:   original / smart_value / similar by threshold

Performance targets:
  - CLIP encoding:    < 200ms  (GPU) / < 800ms (CPU)
  - pgvector search:  < 100ms  (10M products, HNSW m=16)
  - End-to-end:       < 2,000ms

Local First rule: within 5% of top score, local/artisan sellers are ranked first.
Similarity score is NEVER inflated — raw cosine similarity shown to user.
"""
from __future__ import annotations

import base64
import io
import os
from dataclasses import dataclass, field
from typing import Optional

import numpy as np


# ── Types ─────────────────────────────────────────────────────────────────────

@dataclass
class SimilarityBreakdown:
    shape:    float  # 0-100
    color:    float
    material: float
    style:    float
    overall:  float


@dataclass
class SearchResult:
    product_id:  str
    score:       float              # raw cosine similarity, 0-1
    breakdown:   SimilarityBreakdown
    similarity_tier: str            # "original" | "smart_value" | "similar"


@dataclass
class VisualSearchOutput:
    search_id:          str
    results:            list[SearchResult]
    search_time_ms:     int
    identified_product: Optional[dict] = None


# ── Tier thresholds ───────────────────────────────────────────────────────────

TIER_ORIGINAL     = 0.95   # ≥95% = likely same product from different seller
TIER_SMART_VALUE  = 0.80   # 80-95% = visually very close alternative
TIER_SIMILAR      = 0.60   # 60-80% = same style/vibe

LOCAL_FIRST_MARGIN = 0.05   # boost local sellers within 5% of top score


# ── CLIP model loader (singleton) ─────────────────────────────────────────────

_clip_model  = None
_clip_preprocess = None


def _load_clip():
    """Load CLIP model once and cache. Falls back gracefully if unavailable."""
    global _clip_model, _clip_preprocess
    if _clip_model is not None:
        return _clip_model, _clip_preprocess

    try:
        import clip  # pip install git+https://github.com/openai/CLIP.git
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _clip_model, _clip_preprocess = clip.load("ViT-L/14", device=device)
        _clip_model.eval()
        print(f"CLIP ViT-L/14 loaded on {device}")
    except ImportError:
        print("⚠️  CLIP not installed — visual similarity will use random embeddings (dev only)")
        _clip_model = "stub"
        _clip_preprocess = None

    return _clip_model, _clip_preprocess


# ── Embedding ─────────────────────────────────────────────────────────────────

async def encode_image_base64(image_b64: str) -> np.ndarray:
    """Decode base64 image → CLIP embedding (512-dim, L2-normalised)."""
    model, preprocess = _load_clip()

    if model == "stub":
        # Dev fallback: deterministic pseudo-embedding from image hash
        image_bytes = base64.b64decode(image_b64)
        seed = int.from_bytes(image_bytes[:4], "big") % (2**31)
        rng = np.random.default_rng(seed)
        vec = rng.standard_normal(512).astype(np.float32)
        return vec / np.linalg.norm(vec)

    import torch
    from PIL import Image

    image_bytes = base64.b64decode(image_b64)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_tensor = preprocess(image).unsqueeze(0)  # type: ignore[operator]

    device = next(model.parameters()).device
    image_tensor = image_tensor.to(device)

    with torch.no_grad():
        embedding = model.encode_image(image_tensor)
        embedding = embedding / embedding.norm(dim=-1, keepdim=True)

    return embedding.cpu().numpy()[0].astype(np.float32)


async def encode_image_url(url: str) -> np.ndarray:
    """Fetch image from URL → CLIP embedding."""
    import httpx
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()
    b64 = base64.b64encode(resp.content).decode()
    return await encode_image_base64(b64)


# ── pgvector ANN search ───────────────────────────────────────────────────────

async def search_similar(
    query_embedding: np.ndarray,
    db,
    top_k: int = 150,
    category: Optional[str] = None,
) -> list[dict]:
    """
    Run HNSW approximate nearest-neighbour search on product_embeddings table.

    SQL:
      SET LOCAL hnsw.ef_search = 100;
      SELECT
        pe.product_id,
        1 - (pe.embedding <=> $1::vector) AS similarity,
        p.seller_id,
        p.is_local,
        p.quality_score
      FROM product_embeddings pe
      JOIN products p ON p.id = pe.product_id
      WHERE p.is_approved = true
        AND ($2::text IS NULL OR p.category = $2)
      ORDER BY pe.embedding <=> $1::vector
      LIMIT $3;

    Returns list of {product_id, similarity, seller_id, is_local, quality_score}
    """
    vec_str = "[" + ",".join(f"{x:.6f}" for x in query_embedding) + "]"

    # TODO: replace with real async DB query
    # async with db.execute(ANN_SQL, [vec_str, category, top_k]) as cursor:
    #     rows = await cursor.fetchall()
    # return [dict(r) for r in rows]

    # Dev stub: return empty (product set is empty until seeded)
    return []


# ── Similarity breakdown ──────────────────────────────────────────────────────

def compute_breakdown(query_vec: np.ndarray, candidate_vec: np.ndarray) -> SimilarityBreakdown:
    """
    Approximate per-dimension breakdown by projecting onto style sub-spaces.

    In production: each dimension uses a dedicated CLIP text-anchor projection:
      shape    → average of ["shape", "silhouette", "form", "outline"] text embeddings
      color    → average of ["color", "hue", "tone", "shade"] text embeddings
      material → average of ["material", "texture", "fabric", "surface"] text embeddings
      style    → average of ["style", "aesthetic", "design", "look"] text embeddings

    For now: partition the 512-dim vector into 4 blocks and compute cosine similarity per block.
    """
    q = query_vec / (np.linalg.norm(query_vec) + 1e-8)
    c = candidate_vec / (np.linalg.norm(candidate_vec) + 1e-8)

    block = 128
    scores = []
    for i in range(4):
        qb = q[i*block:(i+1)*block]
        cb = c[i*block:(i+1)*block]
        dot = float(np.dot(qb, cb))
        scores.append(max(0.0, min(1.0, (dot + 1) / 2)) * 100)

    overall = float(np.dot(q, c))
    overall = max(0.0, min(1.0, (overall + 1) / 2)) * 100

    return SimilarityBreakdown(
        shape=round(scores[0], 1),
        color=round(scores[1], 1),
        material=round(scores[2], 1),
        style=round(scores[3], 1),
        overall=round(overall, 1),
    )


# ── Tier assignment ───────────────────────────────────────────────────────────

def assign_tier(score: float) -> str:
    if score >= TIER_ORIGINAL:    return "original"
    if score >= TIER_SMART_VALUE: return "smart_value"
    return "similar"


# ── Local First reranking ─────────────────────────────────────────────────────

def apply_local_first(results: list[dict]) -> list[dict]:
    """
    Within LOCAL_FIRST_MARGIN (5%) of the top score, move local/artisan
    sellers to the front. Scores are NEVER modified — only display order changes.
    """
    if not results:
        return results

    top_score = results[0]["similarity"]
    threshold = top_score - LOCAL_FIRST_MARGIN

    within_margin = [r for r in results if r["similarity"] >= threshold]
    outside       = [r for r in results if r["similarity"] < threshold]

    local_first = sorted(within_margin, key=lambda r: (0 if r.get("is_local") else 1, -r["similarity"]))
    return local_first + outside


# ── Main search pipeline ──────────────────────────────────────────────────────

async def run_visual_search(
    image_b64: Optional[str] = None,
    image_url: Optional[str] = None,
    query_text: Optional[str] = None,
    db = None,
    category: Optional[str] = None,
) -> VisualSearchOutput:
    """Full visual similarity search pipeline."""
    import time
    import uuid

    start_ms = time.time() * 1000

    # 1. Encode
    if image_b64:
        query_vec = await encode_image_base64(image_b64)
    elif image_url:
        query_vec = await encode_image_url(image_url)
    elif query_text:
        # Text-to-image: encode text with CLIP text encoder
        query_vec = await _encode_text_clip(query_text)
    else:
        raise ValueError("Must provide image_b64, image_url, or query_text")

    # 2. ANN search
    raw_results = await search_similar(query_vec, db, top_k=150, category=category)

    # 3. Rerank with Local First
    reranked = apply_local_first(raw_results)

    # 4. Build output with breakdown
    search_results = []
    for row in reranked[:100]:   # cap at 100 results
        breakdown = compute_breakdown(query_vec, np.array(row.get("embedding", [0.0] * 512)))
        search_results.append(SearchResult(
            product_id=row["product_id"],
            score=row["similarity"],
            breakdown=breakdown,
            similarity_tier=assign_tier(row["similarity"]),
        ))

    end_ms = time.time() * 1000

    return VisualSearchOutput(
        search_id=str(uuid.uuid4()),
        results=search_results,
        search_time_ms=int(end_ms - start_ms),
    )


async def _encode_text_clip(text: str) -> np.ndarray:
    """Encode a text query using CLIP's text encoder."""
    model, _ = _load_clip()
    if model == "stub":
        seed = sum(ord(c) for c in text) % (2**31)
        rng = np.random.default_rng(seed)
        vec = rng.standard_normal(512).astype(np.float32)
        return vec / np.linalg.norm(vec)

    import torch
    import clip as clip_module
    tokens = clip_module.tokenize([text]).to(next(model.parameters()).device)  # type: ignore[attr-defined]
    with torch.no_grad():
        emb = model.encode_text(tokens)
        emb = emb / emb.norm(dim=-1, keepdim=True)
    return emb.cpu().numpy()[0].astype(np.float32)
