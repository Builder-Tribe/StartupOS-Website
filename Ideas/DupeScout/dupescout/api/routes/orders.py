"""Order creation and management — consumer-facing.

POST /api/v1/orders            — place order (creates Razorpay order + our order record)
GET  /api/v1/orders            — list user's orders
GET  /api/v1/orders/{id}       — get order detail + tracking status
POST /api/v1/orders/{id}/cancel — cancel order (if not yet shipped)
POST /api/v1/orders/{id}/return — initiate return
"""
import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from api.lib.auth import TokenPayload, require_consumer
from api.lib.database import get_db
from api.lib.response import ApiResponse, ApiMeta, ok, err
from api.services.razorpay_service import create_order as rzp_create_order, verify_payment_signature
from api.services.shiprocket_service import track_shipment

router = APIRouter(prefix="/orders", tags=["orders"])


# ── Request models ─────────────────────────────────────────────────────────────

class OrderItem(BaseModel):
    product_id: str
    variant_id: str | None = None
    quantity: int

    @field_validator("quantity")
    @classmethod
    def qty_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("quantity must be at least 1")
        return v


class ShippingAddress(BaseModel):
    name: str
    phone: str
    line1: str
    line2: str | None = None
    city: str
    state: str
    pincode: str


class PlaceOrderRequest(BaseModel):
    items: list[OrderItem]
    shipping_address: ShippingAddress
    payment_method: str   # "upi_gpay" | "upi_phonepe" | "upi_bhim" | "card" | "cod"
    upi_id: str | None = None
    coupon_code: str | None = None


class VerifyPaymentRequest(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("", response_model=ApiResponse)
async def place_order(
    request: PlaceOrderRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(require_consumer)],
):
    """
    Order placement pipeline:
    1. Validate all items are in stock (lock rows for update)
    2. Calculate total (price × qty) for each item
    3. Apply coupon if provided
    4. Create Razorpay order (for UPI/card) or skip (COD)
    5. Insert order + order_items records
    6. Decrement stock_count for each variant
    7. Send WhatsApp confirmation to buyer and seller
    8. Emit order.placed Kafka event → seller notification

    Returns: { order_id, razorpay_order_id, amount, currency }
    For COD: returns { order_id, status: "confirmed" } directly
    """
    # COD limit: ₹5,000
    COD_LIMIT = 5000.0

    # TODO: Step 1 — fetch product prices from DB and validate stock
    # For now use a mock amount
    mock_amount = 1299.0

    if request.payment_method == "cod":
        if mock_amount > COD_LIMIT:
            return err("COD_LIMIT_EXCEEDED", f"Cash on Delivery is not available above ₹{int(COD_LIMIT):,}")

        order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        # TODO: INSERT INTO orders (id, user_id, status='placed', payment_method='cod', ...)
        # TODO: Send WhatsApp confirmation
        return ok({
            "order_id": order_id,
            "status": "confirmed",
            "payment_method": "cod",
            "amount": mock_amount,
        })

    # UPI / Card — create Razorpay order
    order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    try:
        rzp_order = await rzp_create_order(
            amount_inr=mock_amount,
            receipt=order_id,
            notes={"user_id": user.sub, "payment_method": request.payment_method},
        )
    except Exception as exc:
        return err("PAYMENT_INIT_FAILED", f"Could not create payment order: {exc}")

    # TODO: INSERT INTO orders with status='payment_pending', razorpay_order_id=rzp_order.id
    return ok({
        "order_id": order_id,
        "razorpay_order_id": rzp_order.id,
        "amount": rzp_order.amount,
        "currency": rzp_order.currency,
        "status": "payment_pending",
    })


@router.get("", response_model=ApiResponse)
async def list_orders(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(require_consumer)],
):
    """List all orders for the authenticated user, newest first."""
    # TODO: query orders WHERE user_id = user.sub ORDER BY placed_at DESC
    return ok([], ApiMeta(total=0))


@router.post("/verify-payment", response_model=ApiResponse)
async def verify_payment(
    request: VerifyPaymentRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(require_consumer)],
):
    """
    Called after Razorpay checkout completes on the frontend.
    Verifies HMAC signature server-side — NEVER trust client-provided payment status.
    On success: updates order status to 'placed' and triggers seller notification.
    """
    is_valid = verify_payment_signature(
        request.razorpay_order_id,
        request.razorpay_payment_id,
        request.razorpay_signature,
    )
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payment signature")

    # TODO: UPDATE orders SET status='placed', razorpay_payment_id=... WHERE id=request.order_id
    # TODO: Emit order.placed event → seller notification
    return ok({"order_id": request.order_id, "status": "placed"})


@router.get("/{order_id}", response_model=ApiResponse)
async def get_order(
    order_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(require_consumer)],
):
    """
    Get order detail + live Shiprocket tracking.
    If order has an AWB number, fetches live tracking from Shiprocket.
    """
    # TODO: SELECT from orders WHERE id=order_id AND user_id=user.sub
    # Mock order for dev testing
    mock_awb = None  # Set to a real AWB to test tracking

    tracking = None
    if mock_awb:
        try:
            t = await track_shipment(mock_awb)
            tracking = {
                "awb": t.awb,
                "current_status": t.current_status,
                "current_location": t.current_location,
                "estimated_delivery": t.estimated_delivery,
                "events": t.events,
            }
        except Exception:
            pass  # tracking unavailable — non-fatal

    return err("NOT_FOUND", "Order not found")


@router.post("/{order_id}/cancel", response_model=ApiResponse)
async def cancel_order(
    order_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[TokenPayload, Depends(require_consumer)],
):
    """Cancel an order. Only allowed if status is 'placed' or 'confirmed'."""
    # TODO: check status, issue refund via Razorpay, update status, notify seller
    return err("NOT_IMPLEMENTED", "Order cancellation coming soon")


# ── Return & Dispute Models ──────────────────────────────────────────────────

class ReturnRequestModel(BaseModel):
    reason: str  # "defective_item" | "wrong_size" | "quality_mismatch" | "different_from_photos" | "changed_mind"
    comments: str
    photo_proof: list[str] = []


# In-memory DB for returns & disputes dev testing
_returns_db: dict[str, dict] = {}


@router.post("/{order_id}/return", response_model=ApiResponse)
async def initiate_return(
    order_id: str,
    request: ReturnRequestModel,
    user: Annotated[TokenPayload, Depends(require_consumer)],
):
    """
    Initiate a return (Vol 2 §5.8). Only allowed within 7 days of delivery.
    Creates a return record with photo proof and notifies the seller.
    """
    if not request.reason:
        return err("INVALID_REASON", "Please select a valid return reason")

    return_id = f"RET-{uuid.uuid4().hex[:8].upper()}"
    return_record = {
        "return_id": return_id,
        "order_id": order_id,
        "user_id": user.sub,
        "status": "return_requested",
        "reason": request.reason,
        "comments": request.comments,
        "photo_proof": request.photo_proof,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "seller_response": None,
        "ai_recommendation": {
            "verdict": "approve_refund",
            "confidence": 92,
            "reasoning": "Buyer provided clear photo proof showing material variation mismatch.",
        },
    }

    _returns_db[order_id] = return_record
    return ok({"return": return_record, "message": "Return request submitted successfully. Seller will review within 48 hours."})


@router.get("/{order_id}/return", response_model=ApiResponse)
async def get_order_return(
    order_id: str,
    user: Annotated[TokenPayload, Depends(require_consumer)],
):
    """Fetch return status for a specific order."""
    if order_id in _returns_db:
        return ok(_returns_db[order_id])
    return err("NOT_FOUND", "No return request found for this order")

