"""Razorpay payment integration.

Used for:
  - Creating payment orders (UPI, cards, net banking)
  - Verifying payment signatures (webhook + client-side callback)
  - Issuing refunds
  - Creating recurring subscriptions (DupeScout Pro)
  - Penny-drop bank verification (seller onboarding)

Docs: https://razorpay.com/docs/api/
"""
from __future__ import annotations

import hashlib
import hmac
import os
from dataclasses import dataclass
from typing import Optional

import httpx

RAZORPAY_KEY_ID     = os.getenv("RAZORPAY_KEY_ID", "rzp_test_placeholder")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "test_secret_placeholder")
RAZORPAY_BASE_URL   = "https://api.razorpay.com/v1"


@dataclass
class RazorpayOrder:
    id: str            # rzp_order_XXXX
    amount: int        # in paise (₹1 = 100 paise)
    currency: str      # "INR"
    receipt: str       # our internal order_id
    status: str        # "created" | "attempted" | "paid"


@dataclass
class RefundResult:
    id: str
    amount: int
    status: str


async def create_order(
    amount_inr: float,
    receipt: str,
    notes: Optional[dict] = None,
) -> RazorpayOrder:
    """
    Create a Razorpay payment order.

    Args:
        amount_inr: Order amount in INR (e.g. 1299.00)
        receipt:    Our internal order ID (max 40 chars)
        notes:      Optional metadata (product IDs, seller IDs, etc.)

    Returns:
        RazorpayOrder with id to pass to frontend checkout

    Frontend usage (Razorpay.js):
        const rzp = new Razorpay({
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            order_id: order.id,
            amount: order.amount,
            currency: "INR",
            handler: async (response) => {
                await verifyPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature)
            }
        })
        rzp.open()
    """
    amount_paise = int(amount_inr * 100)

    payload = {
        "amount":   amount_paise,
        "currency": "INR",
        "receipt":  receipt[:40],
        "notes":    notes or {},
        "payment_capture": 1,  # auto-capture
    }

    async with httpx.AsyncClient(
        base_url=RAZORPAY_BASE_URL,
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
        timeout=10.0,
    ) as client:
        resp = await client.post("/orders", json=payload)
        resp.raise_for_status()
        data = resp.json()

    return RazorpayOrder(
        id=data["id"],
        amount=data["amount"],
        currency=data["currency"],
        receipt=data.get("receipt", receipt),
        status=data["status"],
    )


def verify_payment_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> bool:
    """
    Verify the HMAC-SHA256 signature from Razorpay callback.
    MUST be called server-side — never trust client-provided payment status.

    Returns True if signature is valid and payment is authentic.
    """
    message = f"{razorpay_order_id}|{razorpay_payment_id}"
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, razorpay_signature)


async def issue_refund(
    payment_id: str,
    amount_inr: Optional[float] = None,   # None = full refund
    notes: Optional[dict] = None,
) -> RefundResult:
    """
    Issue a full or partial refund.
    Refunds appear in buyer's account within 5-7 business days.
    """
    payload: dict = {"speed": "normal"}
    if amount_inr is not None:
        payload["amount"] = int(amount_inr * 100)
    if notes:
        payload["notes"] = notes

    async with httpx.AsyncClient(
        base_url=RAZORPAY_BASE_URL,
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
        timeout=10.0,
    ) as client:
        resp = await client.post(f"/payments/{payment_id}/refund", json=payload)
        resp.raise_for_status()
        data = resp.json()

    return RefundResult(id=data["id"], amount=data["amount"], status=data["status"])


async def create_subscription(
    plan_id: str,
    customer_phone: str,
    total_count: int = 12,  # months
) -> dict:
    """
    Create a Razorpay subscription for DupeScout Pro.

    plan_id: Razorpay plan ID (monthly or annual)
    Returns subscription object with short_url for payment link.
    """
    payload = {
        "plan_id":    plan_id,
        "total_count": total_count,
        "quantity":   1,
        "customer_notify": 1,
    }

    async with httpx.AsyncClient(
        base_url=RAZORPAY_BASE_URL,
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
        timeout=10.0,
    ) as client:
        resp = await client.post("/subscriptions", json=payload)
        resp.raise_for_status()
        return resp.json()
