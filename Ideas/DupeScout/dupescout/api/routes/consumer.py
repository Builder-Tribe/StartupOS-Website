"""Consumer-facing routes: products, discovery, recommendations."""
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Path, Query
from api.lib.auth import TokenPayload, require_consumer_opt
from api.lib.database import get_db, AsyncSession
from api.lib.response import ApiResponse, ApiMeta, ok, err

router = APIRouter(tags=["consumer"])


# ── Products ──────────────────────────────────────────────────────────────────

@router.get("/products/{product_id}", response_model=ApiResponse)
async def get_product(
    product_id: Annotated[str, Path(description="Product UUID")],
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(require_consumer_opt)] = None,
):
    """Get full product detail page data."""
    # TODO: query products table, load seller, variants, reviews
    return err("NOT_IMPLEMENTED", "Product detail coming soon")


# ── Discovery ─────────────────────────────────────────────────────────────────

@router.get("/discovery/trending", response_model=ApiResponse)
async def get_trending(
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=20)] = 8,
):
    """Trending aesthetic categories for the home screen carousel."""
    # TODO: query trend_cards table from AI trend engine output
    return ok([], ApiMeta(total=0))


@router.get("/discovery/recommendations", response_model=ApiResponse)
async def get_recommendations(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(require_consumer_opt)] = None,
    limit: Annotated[int, Query(ge=1, le=40)] = 16,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    """
    Personalised product recommendations.
    - Anonymous: trending products
    - Logged in: recommendation engine output (content-based CF → collaborative CF)
    """
    # TODO: call recommendation engine from ai/recommendation/
    return ok([], ApiMeta(total=0, page=offset // limit + 1, per_page=limit))


@router.get("/discovery/local-sellers", response_model=ApiResponse)
async def get_local_sellers(
    db: Annotated[AsyncSession, Depends(get_db)],
    lat: Annotated[Optional[float], Query()] = None,
    lng: Annotated[Optional[float], Query()] = None,
    radius_km: Annotated[int, Query(ge=1, le=200)] = 50,
    limit: Annotated[int, Query(ge=1, le=20)] = 8,
):
    """Local sellers within radius_km of the user's location."""
    # TODO: PostGIS geospatial query on sellers table
    return ok([], ApiMeta(total=0))


# ── Wishlist / Collections ────────────────────────────────────────────────────

@router.post("/products/{product_id}/save", response_model=ApiResponse)
async def save_product(
    product_id: Annotated[str, Path()],
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(require_consumer_opt)],
):
    """Toggle save state for a product (add/remove from wishlist)."""
    if user is None:
        return err("AUTH_REQUIRED", "Log in to save products")
    # TODO: upsert into user_saved_products
    return ok({"saved": True})


# ── Side-by-Side Product Comparison ──────────────────────────────────────────

from pydantic import BaseModel, Field

class CompareRequest(BaseModel):
    product_ids: list[str] = Field(min_items=2, max_items=4, description="2 to 4 product IDs to compare")


@router.post("/compare", response_model=ApiResponse)
async def compare_products(request: CompareRequest):
    """
    Side-by-side comparison matrix for 2 to 4 products (Vol 2 §5.5).
    Calculates savings delta, visual similarity tier, material breakdown, and AI trade-off verdict.
    """
    ids = request.product_ids
    if len(ids) < 2 or len(ids) > 4:
        return err("INVALID_INPUT", "Must provide between 2 and 4 product IDs for comparison")

    # Mock DB product lookup for development/fallback
    mock_catalog = {
        "p_ql_1": {
            "id": "p_ql_1",
            "title": "Sage Green Linen Blazer Set",
            "brand": "Zara",
            "seller_name": "The Label Studio",
            "seller_type": "d2c",
            "price": 2499,
            "mrp": 4999,
            "images": ["https://images.unsplash.com/photo-1594938298603-c8148c4f4f3c?w=600&q=80"],
            "similarity_score": 91,
            "similarity_tier": "smart_value",
            "material": "100% Indian Linen",
            "craftsmanship": "Machine stitched, unlined",
            "ships_in_days": "2-3 days",
            "is_local": True,
            "rating": 4.6,
        },
        "p_ql_2": {
            "id": "p_ql_2",
            "title": "Linen Blend Tailored Blazer",
            "brand": "Mango",
            "seller_name": "Kalakar Crafts",
            "seller_type": "artisan",
            "price": 1899,
            "mrp": 3999,
            "images": ["https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=600&q=80"],
            "similarity_score": 88,
            "similarity_tier": "smart_value",
            "material": "Linen Cotton Blend",
            "craftsmanship": "Hand-stitched seams",
            "ships_in_days": "1-2 days",
            "is_local": True,
            "rating": 4.7,
        },
        "p_ac_1": {
            "id": "p_ac_1",
            "title": "Handcrafted Ajrakh Block Print Kurta",
            "brand": "FabIndia",
            "seller_name": "Kutch Artisans Collective",
            "seller_type": "artisan",
            "price": 1299,
            "mrp": 2499,
            "images": ["https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80"],
            "similarity_score": 94,
            "similarity_tier": "smart_value",
            "material": "100% Cotton (Natural Dyes)",
            "craftsmanship": "Authentic hand-block print",
            "ships_in_days": "3-4 days",
            "is_local": True,
            "rating": 4.8,
        },
        "sv1": {
            "id": "sv1",
            "title": "Sage Green Linen Co-ord Set",
            "brand": "Zara Ref",
            "seller_name": "The Label Studio",
            "seller_type": "d2c",
            "price": 2499,
            "mrp": 4999,
            "images": ["https://images.unsplash.com/photo-1594938298603-c8148c4f4f3c?w=600&q=80"],
            "similarity_score": 91,
            "similarity_tier": "smart_value",
            "material": "100% Indian Linen",
            "craftsmanship": "Hand-finished seams",
            "ships_in_days": "2-3 days",
            "is_local": True,
            "rating": 4.6,
        },
    }

    items = []
    for pid in ids:
        if pid in mock_catalog:
            items.append(mock_catalog[pid])
        else:
            # Fallback generated product
            items.append({
                "id": pid,
                "title": f"Artisan Handcrafted Item ({pid})",
                "brand": "Local Brand",
                "seller_name": "Artisan Guild",
                "seller_type": "artisan",
                "price": 1499,
                "mrp": 2999,
                "images": ["https://images.unsplash.com/photo-1589465885857-44edb59bbff2?w=600&q=80"],
                "similarity_score": 86,
                "similarity_tier": "similar",
                "material": "Natural Organic Cotton",
                "craftsmanship": "Hand-loom woven",
                "ships_in_days": "2 days",
                "is_local": True,
                "rating": 4.5,
            })

    min_item = min(items, key=lambda x: x["price"])
    max_item = max(items, key=lambda x: x["price"])
    savings = max_item["price"] - min_item["price"]

    tradeoff_verdict = {
        "lowest_price_id": min_item["id"],
        "savings_amount": savings,
        "headline": f"Save ₹{savings:,} by choosing {min_item['seller_name']}",
        "what_matches": [
            "Identical visual silhouette and color palette",
            "Breathable natural fabric composition",
            "Hand-finished quality details",
        ],
        "what_differs": [
            f"{max_item['title']} has slightly heavier fabric weight",
            f"{min_item['title']} is shipped directly from local artisan",
        ],
        "verdict": f"The {min_item['title']} delivers {min_item['similarity_score']}% of the visual aesthetic at {int((min_item['price']/max_item['price'])*100)}% of the cost. Excellent smart value purchase.",
    }

    return ok({
        "products": items,
        "ai_tradeoff_verdict": tradeoff_verdict,
    })

