"""Razorpay webhook handler.

POST /api/v1/webhooks/razorpay

Events handled:
  - payment.captured    → update order to 'placed', trigger seller notification
  - payment.failed      → update order to 'payment_failed', notify buyer
  - refund.created      → update refund record
  - order.paid          → cross-check (idempotent guard)
  - subscription.charged → confirm Pro subscription renewal

Webhook signature verification:
  X-Razorpay-Signature header = HMAC-SHA256(raw_body, webhook_secret)

Docs: https://razorpay.com/docs/webhooks/
"""
from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os

from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse

RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def _verify_webhook_signature(raw_body: bytes, signature: str) -> bool:
    """
    Verify the Razorpay webhook signature.
    Uses the webhook secret (different from the API key secret).
    """
    if not RAZORPAY_WEBHOOK_SECRET:
        logger.warning("RAZORPAY_WEBHOOK_SECRET not set — skipping signature verification in dev")
        return True

    expected = hmac.new(
        RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
        raw_body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/razorpay")
async def razorpay_webhook(request: Request):
    """
    Receive and process Razorpay webhook events.
    Returns 200 immediately (Razorpay retries on non-2xx up to 3 times).
    Heavy processing runs asynchronously via background tasks.
    """
    raw_body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    if not _verify_webhook_signature(raw_body, signature):
        logger.warning("Invalid Razorpay webhook signature")
        return JSONResponse(status_code=400, content={"error": "invalid_signature"})

    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError:
        return JSONResponse(status_code=400, content={"error": "invalid_json"})

    event = payload.get("event", "")
    entity = payload.get("payload", {})

    logger.info(f"Razorpay webhook: event={event}")

    if event == "payment.captured":
        await _handle_payment_captured(entity)
    elif event == "payment.failed":
        await _handle_payment_failed(entity)
    elif event == "refund.created":
        await _handle_refund_created(entity)
    elif event == "order.paid":
        await _handle_order_paid(entity)
    elif event == "subscription.charged":
        await _handle_subscription_charged(entity)
    else:
        logger.info(f"Unhandled Razorpay event: {event}")

    # Always return 200 to acknowledge receipt
    return Response(status_code=200)


async def _handle_payment_captured(entity: dict) -> None:
    """
    payment.captured: A payment succeeded.
    1. Look up order by razorpay_order_id
    2. Verify signature (idempotent — may have already been verified via frontend callback)
    3. UPDATE orders SET status='placed', razorpay_payment_id=... WHERE razorpay_order_id=...
    4. Emit order.placed → Kafka/Redis pubsub → seller gets WhatsApp notification
    5. Schedule Shiprocket shipment creation
    """
    payment = entity.get("payment", {}).get("entity", {})
    rzp_order_id  = payment.get("order_id")
    rzp_payment_id = payment.get("id")
    amount_paise  = payment.get("amount", 0)

    if not rzp_order_id:
        logger.warning("payment.captured missing order_id")
        return

    # TODO: db.execute(UPDATE orders SET status='placed', razorpay_payment_id=:pid
    #                  WHERE razorpay_order_id=:oid AND status='payment_pending')
    # TODO: emit order.placed event
    logger.info(f"Payment captured: order={rzp_order_id} payment={rzp_payment_id} amount={amount_paise}")


async def _handle_payment_failed(entity: dict) -> None:
    """
    payment.failed: A payment attempt failed.
    UPDATE orders SET status='payment_failed' WHERE razorpay_order_id=...
    Notify buyer (WhatsApp/push) to retry.
    """
    payment = entity.get("payment", {}).get("entity", {})
    rzp_order_id = payment.get("order_id")
    error_code   = payment.get("error_code")
    error_desc   = payment.get("error_description")

    # TODO: UPDATE orders SET status='payment_failed' WHERE razorpay_order_id=rzp_order_id
    # TODO: send retry link to buyer
    logger.info(f"Payment failed: order={rzp_order_id} error={error_code}: {error_desc}")


async def _handle_refund_created(entity: dict) -> None:
    """
    refund.created: A refund was initiated.
    Update refund record in DB. Notify buyer.
    """
    refund = entity.get("refund", {}).get("entity", {})
    payment_id = refund.get("payment_id")
    refund_id  = refund.get("id")
    amount     = refund.get("amount", 0)

    # TODO: UPDATE refunds SET status='created', razorpay_refund_id=refund_id WHERE payment_id=...
    logger.info(f"Refund created: payment={payment_id} refund={refund_id} amount={amount}")


async def _handle_order_paid(entity: dict) -> None:
    """
    order.paid: Idempotent guard — same as payment.captured in most cases.
    Skip if order is already in 'placed' status.
    """
    order = entity.get("order", {}).get("entity", {})
    rzp_order_id = order.get("id")
    # TODO: check if already placed, skip if so
    logger.info(f"Order paid (idempotent check): {rzp_order_id}")


async def _handle_subscription_charged(entity: dict) -> None:
    """
    subscription.charged: A Pro subscription renewal succeeded.
    Extend user's Pro expiry date by 30 days.
    """
    subscription = entity.get("subscription", {}).get("entity", {})
    sub_id = subscription.get("id")
    # TODO: UPDATE users SET pro_expires_at = pro_expires_at + INTERVAL '30 days'
    #       WHERE razorpay_subscription_id = sub_id
    logger.info(f"Subscription renewed: {sub_id}")
