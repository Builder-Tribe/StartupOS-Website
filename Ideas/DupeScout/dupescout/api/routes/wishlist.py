"""Consumer wishlist / saved items API.

POST   /api/v1/wishlist          — add product to wishlist
DELETE /api/v1/wishlist/{id}     — remove product from wishlist
GET    /api/v1/wishlist          — list all saved items
"""
from typing import Annotated
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from api.lib.auth import TokenPayload, require_consumer
from api.lib.database import get_db
from api.lib.response import ApiResponse, ApiMeta, ok, err
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


class AddToWishlistRequest(BaseModel):
    product_id: str
    variant_id: str | None = None


@router.post("", response_model=ApiResponse)
async def add_to_wishlist(
    request: AddToWishlistRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(require_consumer)],
):
    """
    Add a product to the authenticated user's wishlist.
    Idempotent — adding an already-saved product is a no-op.

    Pipeline:
    1. Check if already in wishlist (SELECT)
    2. INSERT INTO wishlists (user_id, product_id, variant_id, added_at)
    3. Return item count
    """
    # TODO: INSERT INTO wishlists WHERE NOT EXISTS duplicate
    return ok({"product_id": request.product_id, "saved": True})


@router.delete("/{product_id}", response_model=ApiResponse)
async def remove_from_wishlist(
    product_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(require_consumer)],
):
    """Remove a product from the wishlist."""
    # TODO: DELETE FROM wishlists WHERE user_id=user.sub AND product_id=product_id
    return ok({"product_id": product_id, "saved": False})


@router.get("", response_model=ApiResponse)
async def get_wishlist(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(require_consumer)],
):
    """
    Get all saved items for the authenticated user.
    Returns full product objects with current price and availability.
    """
    # TODO: SELECT products JOIN wishlists ON ... WHERE wishlists.user_id = user.sub
    # Mock response for dev
    return ok([], ApiMeta(total=0))
