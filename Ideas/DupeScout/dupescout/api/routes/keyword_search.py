"""Keyword / hybrid search endpoint — C-8.

GET  /api/v1/search/keyword?q=...  — BM25 + semantic hybrid search
"""
import time
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from api.lib.auth import TokenPayload, require_consumer_opt
from api.lib.database import get_db
from api.lib.response import ApiResponse, ApiMeta, ok, err
from api.services.keyword_search import run_keyword_search

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/keyword", response_model=ApiResponse)
async def keyword_search(
    q: str = Query(..., min_length=1, max_length=256, description="Search query"),
    category: Optional[str] = Query(None),
    price_min: Optional[float] = Query(None, ge=0),
    price_max: Optional[float] = Query(None, ge=0),
    local_only: bool = Query(False),
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=100),
    db: Annotated[AsyncSession, Depends(get_db)] = None,
    user: Annotated[Optional[TokenPayload], Depends(require_consumer_opt)] = None,
):
    """
    Hybrid keyword search: BM25 (Elasticsearch) + semantic (CLIP text embedding).
    Results merged via Reciprocal Rank Fusion, then Local-First reranked.

    Filterable by category, price range, local_only.
    Paginated (default 24 per page).
    """
    result = await run_keyword_search(
        query=q,
        db=db,
        category=category,
        price_min=price_min,
        price_max=price_max,
        local_only=local_only,
        page=page,
        page_size=page_size,
    )

    hits_out = [
        {
            "product_id":      h.product_id,
            "title":           h.title,
            "seller_name":     h.seller_name,
            "is_local":        h.is_local,
            "price":           h.price,
            "image_url":       h.image_url,
            "category":        h.category,
            "aesthetic_codes": h.aesthetic_codes,
            "rrf_score":       round(h.score, 6),
            "bm25_rank":       h.bm25_rank,
            "semantic_rank":   h.semantic_rank,
        }
        for h in result.hits
    ]

    return ok(
        {
            "query":           result.query,
            "hits":            hits_out,
            "total_bm25":      result.total_bm25,
            "total_semantic":  result.total_semantic,
            "spell_corrected": result.spell_corrected,
        },
        ApiMeta(took_ms=result.took_ms, total=len(hits_out), page=page),
    )
