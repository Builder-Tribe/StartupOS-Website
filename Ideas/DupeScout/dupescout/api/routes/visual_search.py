"""Visual Search endpoint — core product feature.

POST /api/v1/search/visual
  - Accepts: image (base64), URL, or text query
  - Returns: identified product + 3-tier results (original, smart_value, similar)

POST /api/v1/search/visual/upload
  - Accepts: multipart/form-data with image file
  - Returns: same as above
"""
import base64
import time
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from api.lib.auth import TokenPayload, require_consumer_opt
from api.lib.database import get_db
from api.lib.response import ApiResponse, ApiMeta, ok, err
from api.services.visual_similarity import run_visual_search

router = APIRouter(prefix="/search", tags=["search"])


# ── Request / Response models ─────────────────────────────────────────────────

class SearchFilters(BaseModel):
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    similarity_min: Optional[int] = None  # 0-100
    local_only: bool = False
    verified_only: bool = False
    category: Optional[str] = None


class VisualSearchRequest(BaseModel):
    image_base64: Optional[str] = None  # base64-encoded image bytes
    url: Optional[str] = None           # product URL on any supported platform
    query: Optional[str] = None         # text fallback
    filters: Optional[SearchFilters] = None

    @field_validator("image_base64")
    @classmethod
    def validate_b64(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        try:
            base64.b64decode(v, validate=True)
        except Exception:
            raise ValueError("image_base64 must be valid base64")
        return v

    def has_input(self) -> bool:
        return bool(self.image_base64 or self.url or self.query)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/visual", response_model=ApiResponse)
async def visual_search(
    request: VisualSearchRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(require_consumer_opt)] = None,
):
    """
    Primary visual search endpoint.

    Input priority: image_base64 > url > query
    Rate limit: 20 searches/day for anonymous, unlimited for Pro.
    """
    start = time.time()

    if not request.has_input():
        return err("MISSING_INPUT", "Provide image_base64, url, or query")

    result = await _run_search(request, user, db)

    took_ms = int((time.time() - start) * 1000)
    return ok(result, ApiMeta(took_ms=took_ms))


@router.post("/visual/upload", response_model=ApiResponse)
async def visual_search_upload(
    file: Annotated[UploadFile, File(description="Product image (JPG, PNG, WEBP, HEIC)")],
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(require_consumer_opt)] = None,
):
    """Multipart upload variant — for direct browser file uploads."""
    start = time.time()

    if file.content_type not in ("image/jpeg", "image/png", "image/webp", "image/heic"):
        return err("INVALID_IMAGE_TYPE", f"Unsupported image type: {file.content_type}")

    content = await file.read()
    if len(content) > 25 * 1024 * 1024:  # 25MB
        return err("IMAGE_TOO_LARGE", "Maximum image size is 25MB")

    image_b64 = base64.b64encode(content).decode("utf-8")
    req = VisualSearchRequest(image_base64=image_b64)
    result = await _run_search(req, user, db)

    took_ms = int((time.time() - start) * 1000)
    return ok(result, ApiMeta(took_ms=took_ms))


# ── Internal ──────────────────────────────────────────────────────────────────

async def _run_search(
    request: VisualSearchRequest,
    user: Optional[TokenPayload],
    db: AsyncSession,
) -> dict:
    """
    Full search pipeline:
    1. CLIP encode (image_b64 → url → text fallback)
    2. pgvector ANN search via visual_similarity service
    3. Hydrate product details from DB (product IDs → full product objects)
    4. Affiliate results merged in (Amazon/Flipkart/Myntra — TODO)
    5. AI explanation per result via Claude Sonnet 5 (TODO)
    6. Return tiered results
    """
    category = request.filters.category if request.filters else None

    output = await run_visual_search(
        image_b64=request.image_base64,
        image_url=request.url if request.url and not request.image_base64 else None,
        query_text=request.query if not request.image_base64 and not request.url else None,
        db=db,
        category=category,
    )

    # Group results by tier
    original    = [r for r in output.results if r.similarity_tier == "original"]
    smart_value = [r for r in output.results if r.similarity_tier == "smart_value"]
    similar     = [r for r in output.results if r.similarity_tier == "similar"]

    # TODO: hydrate product_id → full Product objects from DB
    # TODO: merge affiliate results
    # TODO: generate AI explanations via Claude Sonnet 5

    def result_to_dict(r):
        return {
            "id": r.product_id,
            "similarity_score": round(r.score * 100, 1),
            "similarity_tier": r.similarity_tier,
            "similarity_breakdown": {
                "shape":    r.breakdown.shape,
                "color":    r.breakdown.color,
                "material": r.breakdown.material,
                "style":    r.breakdown.style,
                "overall":  r.breakdown.overall,
            },
        }

    return {
        "search_id": output.search_id,
        "identified_product": output.identified_product,
        "results": {
            "original":    [result_to_dict(r) for r in original],
            "smart_value": [result_to_dict(r) for r in smart_value],
            "similar":     [result_to_dict(r) for r in similar],
        },
        "total_results": len(output.results),
        "search_time_ms": output.search_time_ms,
    }
