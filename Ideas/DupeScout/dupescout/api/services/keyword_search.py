"""Hybrid keyword search — BM25 (Elasticsearch) + semantic (pgvector).

Search pipeline:
  1. BM25 lexical search via Elasticsearch (title, description, tags)
  2. CLIP text-embedding ANN search via pgvector (semantic understanding)
  3. RRF (Reciprocal Rank Fusion) merge of both result sets
  4. Local-First reranking: within 5% of top score, local/artisan sellers ranked first

Docs:
  - Elasticsearch Hybrid Search: https://www.elastic.co/guide/en/elasticsearch/reference/current/knn-search.html#_combine_approximate_knn_with_other_features
  - pgvector: cosine similarity via <=> operator
"""
from __future__ import annotations

import os
import re
from dataclasses import dataclass, field
from typing import Optional

ELASTICSEARCH_URL   = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
ELASTICSEARCH_INDEX = os.getenv("ELASTICSEARCH_INDEX", "ds_products")
RRF_K               = 60   # RRF constant (standard value)
TOP_K_BM25          = 50
TOP_K_SEMANTIC      = 50
TOP_N_FINAL         = 24   # products returned to frontend
LOCAL_FIRST_MARGIN  = 0.05


@dataclass
class SearchHit:
    product_id:   str
    title:        str
    seller_id:    str
    seller_name:  str
    is_local:     bool
    price:        float
    image_url:    str
    category:     str
    score:        float
    bm25_rank:    Optional[int] = None
    semantic_rank: Optional[int] = None
    aesthetic_codes: list[str] = field(default_factory=list)
    similarity_score: float = 0.0


@dataclass
class SearchOutput:
    query:         str
    hits:          list[SearchHit]
    total_bm25:    int
    total_semantic: int
    took_ms:       int
    spell_corrected: Optional[str] = None


def _sanitize_query(q: str) -> str:
    """Remove Elasticsearch DSL injection characters."""
    return re.sub(r'[+\-=&|!(){}\[\]^"~*?:\\/]', " ", q).strip()[:256]


async def bm25_search(
    query: str,
    category: Optional[str] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    local_only: bool = False,
    top_k: int = TOP_K_BM25,
) -> list[dict]:
    """
    Elasticsearch multi-match BM25 search.

    Fields and boosts:
      - title^3         (most important)
      - description^1.5
      - aesthetic_codes^2 (Gen Z aesthetic vocabulary, e.g. indie-boho, y2k-revival)
      - material_tags^1.5
      - seller_name^0.5

    Returns list of ES hit dicts.
    """
    try:
        import httpx

        q = _sanitize_query(query)
        must_clauses: list[dict] = [
            {
                "multi_match": {
                    "query": q,
                    "fields": ["title^3", "description^1.5", "aesthetic_codes^2", "material_tags^1.5", "seller_name^0.5"],
                    "type": "best_fields",
                    "fuzziness": "AUTO",
                }
            }
        ]
        filter_clauses: list[dict] = [{"term": {"is_active": True}}]

        if category:
            filter_clauses.append({"term": {"category": category}})
        if local_only:
            filter_clauses.append({"term": {"is_local": True}})
        if price_min is not None:
            filter_clauses.append({"range": {"price": {"gte": price_min}}})
        if price_max is not None:
            filter_clauses.append({"range": {"price": {"lte": price_max}}})

        es_query = {
            "size": top_k,
            "query": {
                "bool": {
                    "must": must_clauses,
                    "filter": filter_clauses,
                }
            },
            "_source": ["product_id", "title", "seller_id", "seller_name", "is_local",
                        "price", "image_url", "category", "aesthetic_codes"],
        }

        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(
                f"{ELASTICSEARCH_URL}/{ELASTICSEARCH_INDEX}/_search",
                json=es_query,
            )
            resp.raise_for_status()
            return resp.json().get("hits", {}).get("hits", [])

    except Exception:
        # ES unavailable — return empty; semantic leg will still run
        return []


async def semantic_search(
    query: str,
    db,
    category: Optional[str] = None,
    top_k: int = TOP_K_SEMANTIC,
) -> list[dict]:
    """
    CLIP text-embedding ANN search via pgvector.
    Encodes the query string as a CLIP text embedding and runs cosine similarity
    against the product_embeddings table.
    """
    try:
        from api.services.visual_similarity import encode_image_base64
        import numpy as np

        # Use CLIP text encoding path (encode_image_base64 accepts text fallback in dev)
        embedding = await encode_image_base64(None, text_query=query)  # type: ignore[arg-type]

        if embedding is None:
            return []

        vec_str = "[" + ",".join(f"{v:.6f}" for v in embedding.tolist()) + "]"
        cat_filter = f"AND p.category = '{category}'" if category else ""

        sql = f"""
            SELECT
                p.id AS product_id,
                p.title,
                p.seller_id,
                s.name AS seller_name,
                s.is_local,
                p.price,
                p.image_url,
                p.category,
                p.aesthetic_codes,
                1 - (pe.embedding <=> '{vec_str}'::vector) AS cosine_similarity
            FROM products p
            JOIN product_embeddings pe ON pe.product_id = p.id
            JOIN sellers s ON s.id = p.seller_id
            WHERE p.is_active = true
            {cat_filter}
            ORDER BY pe.embedding <=> '{vec_str}'::vector
            LIMIT {top_k};
        """
        rows = await db.execute(sql)
        return rows.fetchall()

    except Exception:
        return []


def rrf_merge(
    bm25_hits: list[dict],
    semantic_hits: list[dict],
    k: int = RRF_K,
) -> list[SearchHit]:
    """
    Reciprocal Rank Fusion: score = Σ 1/(k + rank_i) across result sets.
    Produces a unified ranking that balances lexical and semantic matches.
    """
    scores: dict[str, float] = {}
    meta:   dict[str, dict] = {}

    # BM25 ranks
    for rank, hit in enumerate(bm25_hits, start=1):
        src = hit.get("_source", hit)
        pid = src.get("product_id", hit.get("_id", ""))
        scores[pid] = scores.get(pid, 0.0) + 1.0 / (k + rank)
        if pid not in meta:
            meta[pid] = {**src, "bm25_rank": rank, "semantic_rank": None}
        else:
            meta[pid]["bm25_rank"] = rank

    # Semantic ranks
    for rank, row in enumerate(semantic_hits, start=1):
        pid = row[0] if isinstance(row, (list, tuple)) else row.get("product_id", "")
        scores[pid] = scores.get(pid, 0.0) + 1.0 / (k + rank)
        if pid not in meta:
            meta[pid] = {
                "product_id": pid,
                "title": row[1] if isinstance(row, (list, tuple)) else row.get("title", ""),
                "seller_id": row[2] if isinstance(row, (list, tuple)) else row.get("seller_id", ""),
                "seller_name": row[3] if isinstance(row, (list, tuple)) else row.get("seller_name", ""),
                "is_local": row[4] if isinstance(row, (list, tuple)) else row.get("is_local", False),
                "price": row[5] if isinstance(row, (list, tuple)) else row.get("price", 0),
                "image_url": row[6] if isinstance(row, (list, tuple)) else row.get("image_url", ""),
                "category": row[7] if isinstance(row, (list, tuple)) else row.get("category", ""),
                "aesthetic_codes": row[8] if isinstance(row, (list, tuple)) else row.get("aesthetic_codes", []),
                "bm25_rank": None,
                "semantic_rank": rank,
                "similarity_score": float(row[9]) if isinstance(row, (list, tuple)) else 0.0,
            }
        else:
            meta[pid]["semantic_rank"] = rank

    # Sort by RRF score
    sorted_pids = sorted(scores, key=lambda p: scores[p], reverse=True)

    hits = []
    for pid in sorted_pids:
        m = meta[pid]
        hits.append(SearchHit(
            product_id=pid,
            title=m.get("title", ""),
            seller_id=m.get("seller_id", ""),
            seller_name=m.get("seller_name", ""),
            is_local=bool(m.get("is_local", False)),
            price=float(m.get("price", 0)),
            image_url=m.get("image_url", ""),
            category=m.get("category", ""),
            aesthetic_codes=m.get("aesthetic_codes") or [],
            score=scores[pid],
            bm25_rank=m.get("bm25_rank"),
            semantic_rank=m.get("semantic_rank"),
            similarity_score=float(m.get("similarity_score", 0)),
        ))

    return hits


def apply_local_first(hits: list[SearchHit]) -> list[SearchHit]:
    """
    Local-First rule: within LOCAL_FIRST_MARGIN of the top RRF score, local/artisan
    sellers are ranked first. Scores are never modified — only display order.
    """
    if not hits:
        return hits

    top_score = hits[0].score
    threshold = top_score - LOCAL_FIRST_MARGIN

    in_margin_local    = [h for h in hits if h.score >= threshold and h.is_local]
    in_margin_nonlocal = [h for h in hits if h.score >= threshold and not h.is_local]
    rest               = [h for h in hits if h.score < threshold]

    return in_margin_local + in_margin_nonlocal + rest


async def run_keyword_search(
    query: str,
    db,
    category: Optional[str] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    local_only: bool = False,
    page: int = 1,
    page_size: int = TOP_N_FINAL,
) -> SearchOutput:
    """
    Main entry point for hybrid keyword search.
    Runs BM25 and semantic search concurrently, then merges via RRF.
    """
    import asyncio
    import time

    start = time.time()

    bm25_task     = bm25_search(query, category, price_min, price_max, local_only)
    semantic_task = semantic_search(query, db, category)

    bm25_hits, semantic_hits = await asyncio.gather(bm25_task, semantic_task)

    merged = rrf_merge(bm25_hits, semantic_hits)
    merged = apply_local_first(merged)

    offset = (page - 1) * page_size
    page_hits = merged[offset: offset + page_size]

    took_ms = int((time.time() - start) * 1000)

    return SearchOutput(
        query=query,
        hits=page_hits,
        total_bm25=len(bm25_hits),
        total_semantic=len(semantic_hits),
        took_ms=took_ms,
    )
