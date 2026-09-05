"""Seller authentication, onboarding, and catalog API.

POST /api/v1/seller/auth/login  — email + password → seller-realm JWT
POST /api/v1/seller/onboarding  — complete onboarding (GST + bank)
POST /api/v1/seller/catalog/ai-create — AI Catalog Creator (Claude Sonnet 5)
GET  /api/v1/seller/products    — list seller's products
GET  /api/v1/seller/orders      — list seller's orders
GET  /api/v1/seller/analytics   — revenue / views / conversion
"""
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from api.lib.auth import TokenPayload, create_token, require_seller
from api.lib.database import get_db
from api.lib.response import ApiResponse, ApiMeta, ok, err
from api.services.product_dna import extract_product_dna

router = APIRouter(prefix="/seller", tags=["seller"])

# ── In-memory seller store ──────────────────────────────────────────────────
# In production: sellers table in PostgreSQL with bcrypt-hashed passwords.
_SELLERS: dict[str, dict] = {
    "agarwal.harshit97@gmail.com": {
        "password":      "harshit@14597",
        "id":            "sel_harshit_agarwal",
        "name":          "Harshit Agarwal",
        "email":         "agarwal.harshit97@gmail.com",
        "business_name": "DupeScout Demo Store",
        "city":          "Bengaluru",
        "is_onboarded":  True,
    },
}


# ── Auth models ────────────────────────────────────────────────────────────────

class SellerRegisterRequest(BaseModel):
    name:     str
    email:    EmailStr
    password: str


class SellerLoginRequest(BaseModel):
    email:    EmailStr
    password: str


# ── Auth routes ────────────────────────────────────────────────────────────────

@router.post("/auth/register", response_model=ApiResponse, status_code=201)
async def seller_register(request: SellerRegisterRequest):
    """Create a new seller account. Returns seller-realm JWT + is_new_seller flag."""
    if len(request.name.strip()) < 2:
        raise HTTPException(status_code=422, detail="Name must be at least 2 characters")
    if len(request.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")

    email = request.email.lower()
    if email in _SELLERS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A seller account with this email already exists",
        )

    import random, string
    seller_id = "sel_" + "".join(random.choices(string.ascii_lowercase + string.digits, k=9))
    _SELLERS[email] = {
        "password":      request.password,
        "id":            seller_id,
        "name":          request.name.strip(),
        "email":         email,
        "business_name": "",
        "city":          "",
        "is_onboarded":  False,
    }

    token = create_token(subject=seller_id, realm="seller")
    return ok({
        "token":         token,
        "is_new_seller": True,
        "seller": {
            "id":            seller_id,
            "name":          request.name.strip(),
            "email":         email,
            "business_name": "",
            "city":          "",
        },
    })


@router.post("/auth/login", response_model=ApiResponse)
async def seller_login(request: SellerLoginRequest):
    """Verify email + password. On success: return seller-realm JWT."""
    seller_record = _SELLERS.get(request.email.lower())

    if not seller_record or seller_record["password"] != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = create_token(subject=seller_record["id"], realm="seller")
    return ok({
        "token":         token,
        "is_new_seller": not seller_record.get("is_onboarded", True),
        "seller": {
            "id":            seller_record["id"],
            "name":          seller_record["name"],
            "email":         seller_record["email"],
            "business_name": seller_record.get("business_name", ""),
            "city":          seller_record.get("city", ""),
        },
    })



# ── Onboarding + catalog models ───────────────────────────────────────────────

class OnboardingRequest(BaseModel):
    business_name: str
    seller_type: str   # artisan | brand | d2c | reseller
    city: str
    gstin: str
    upi_id: str


class AICatalogRequest(BaseModel):
    images: list[str]   # base64-encoded product images (up to 8)

    @field_validator("images")
    @classmethod
    def check_images(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("At least one image is required")
        if len(v) > 8:
            raise ValueError("Maximum 8 images allowed")
        return v


# ── Onboarding ────────────────────────────────────────────────────────────────

@router.post("/onboarding", response_model=ApiResponse)
async def complete_onboarding(
    request: OnboardingRequest,
    user: Annotated[TokenPayload, Depends(require_seller)],
):
    """
    Complete seller onboarding:
    1. Validate GSTIN format (15 chars, checksum)
    2. Call GSTN API to verify and fetch trade name
    3. Verify UPI ID via Razorpay penny-drop API
    4. Upsert seller record in DB with is_verified=True
    5. Emit seller.onboarded event
    """
    # TODO: GSTN API integration
    gstin_upper = request.gstin.strip().upper()
    if len(gstin_upper) != 15:
        return err("INVALID_GSTIN", "GSTIN must be 15 characters")

    # TODO: real verification — mock response
    return ok({
        "seller_id": user.sub,
        "business_name": request.business_name,
        "gstin": gstin_upper,
        "gst_trade_name": request.business_name,
        "is_gst_verified": True,
        "status": "active",
        "message": "Onboarding complete — you can now list products",
    })


# ── AI Catalog Creator ────────────────────────────────────────────────────────

@router.post("/catalog/ai-create", response_model=ApiResponse)
async def ai_create_listing(
    request: AICatalogRequest,
    user: Annotated[TokenPayload, Depends(require_seller)],
):
    """
    AI Catalog Creator pipeline:
    1. Validate and decode base64 images
    2. Call Claude Sonnet 5 with vision (via extract_product_dna service)
    3. Return structured JSON for seller review + editing
    """
    result = await extract_product_dna(request.images)
    return ok(result)


# ── Products (seller's own) ───────────────────────────────────────────────────

@router.get("/products", response_model=ApiResponse)
async def list_seller_products(
    user: Annotated[TokenPayload, Depends(require_seller)],
):
    """List all products owned by the authenticated seller."""
    # TODO: SELECT * FROM products WHERE seller_id = user.sub
    return ok([], ApiMeta(total=0))


@router.get("/orders", response_model=ApiResponse)
async def list_seller_orders(
    user: Annotated[TokenPayload, Depends(require_seller)],
):
    """List orders containing the seller's products, newest first."""
    # TODO: JOIN orders → order_items → products WHERE products.seller_id = user.sub
    return ok([], ApiMeta(total=0))


# ── Seller Return & Dispute Handling ─────────────────────────────────────────

class SellerReturnResponseRequest(BaseModel):
    action: str  # "approve" | "escalate"
    seller_notes: str | None = None


@router.post("/orders/{order_id}/return/respond", response_model=ApiResponse)
async def respond_to_return(
    order_id: str,
    request: SellerReturnResponseRequest,
    user: Annotated[TokenPayload, Depends(require_seller)],
):
    """
    Seller response to buyer return request (Vol 3 §8).
    Action 'approve': accepts return and prepares return pickup.
    Action 'escalate': sends dispute to admin console for mediation.
    """
    from api.routes.orders import _returns_db

    if request.action not in ("approve", "escalate"):
        return err("INVALID_ACTION", "Action must be 'approve' or 'escalate'")

    new_status = "return_approved" if request.action == "approve" else "dispute_escalated"
    if order_id in _returns_db:
        _returns_db[order_id]["status"] = new_status
        _returns_db[order_id]["seller_response"] = {
            "action": request.action,
            "seller_notes": request.seller_notes,
            "responded_at": datetime.now(timezone.utc).isoformat(),
        }
        return ok({"return": _returns_db[order_id], "message": f"Return request updated to {new_status}"})

    # Dev fallback record
    updated_record = {
        "return_id": f"RET-{order_id}",
        "order_id": order_id,
        "status": new_status,
        "seller_response": {
            "action": request.action,
            "seller_notes": request.seller_notes,
            "responded_at": datetime.now(timezone.utc).isoformat(),
        },
    }
    _returns_db[order_id] = updated_record
    return ok({"return": updated_record, "message": f"Return request updated to {new_status}"})


@router.get("/analytics", response_model=ApiResponse)
async def seller_analytics(
    user: Annotated[TokenPayload, Depends(require_seller)],
):
    """Return seller analytics: revenue, views, orders, conversion rate."""
    # TODO: aggregate from ClickHouse (visual_searches + order_items by seller)
    return ok({
        "revenue_30d": 0,
        "orders_30d": 0,
        "views_30d": 0,
        "conversion_rate": 0.0,
        "avg_rating": 0.0,
    })

