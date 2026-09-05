"""Shiprocket logistics integration.

Used for:
  - Creating shipments (order → AWB number)
  - Generating shipping labels (PDF)
  - Real-time tracking via AWB
  - Webhook receiver for delivery status updates
  - Returns management

Docs: https://apidocs.shiprocket.in/
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Optional

import httpx

SHIPROCKET_EMAIL    = os.getenv("SHIPROCKET_EMAIL", "")
SHIPROCKET_PASSWORD = os.getenv("SHIPROCKET_PASSWORD", "")
SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external"

_sr_token: Optional[str] = None


@dataclass
class ShipmentOrder:
    shipment_id:  int
    order_id:     int
    awb_code:     Optional[str] = None
    courier_name: Optional[str] = None
    label_url:    Optional[str] = None
    status:       str = "PENDING"


@dataclass
class TrackingInfo:
    awb:              str
    current_status:   str
    current_location: Optional[str]
    estimated_delivery: Optional[str]
    events:           list[dict] = field(default_factory=list)


async def _get_token() -> str:
    """Get (or refresh) Shiprocket auth token. Tokens expire in 24h."""
    global _sr_token
    if _sr_token:
        return _sr_token

    async with httpx.AsyncClient(base_url=SHIPROCKET_BASE_URL, timeout=10.0) as client:
        resp = await client.post(
            "/auth/login",
            json={"email": SHIPROCKET_EMAIL, "password": SHIPROCKET_PASSWORD},
        )
        resp.raise_for_status()
        _sr_token = resp.json()["token"]
    return _sr_token


async def create_shipment(
    order_id: str,
    channel_order_id: str,
    pickup_location: str,
    billing_customer_name: str,
    billing_phone: str,
    billing_address: str,
    billing_city: str,
    billing_state: str,
    billing_pincode: str,
    order_items: list[dict],   # [{"name": str, "sku": str, "units": int, "selling_price": float}]
    payment_method: str,        # "Prepaid" | "COD"
    sub_total: float,
    weight: float = 0.5,       # kg
) -> ShipmentOrder:
    """
    Create a Shiprocket shipment from a placed order.
    Returns shipment with AWB number and label URL.

    Shiprocket auto-assigns the cheapest eligible courier.
    """
    token = await _get_token()

    payload = {
        "order_id":             order_id,
        "order_date":           "2026-07-31",   # TODO: use actual order date
        "pickup_location":      pickup_location,
        "channel_id":           "",
        "comment":              "DupeScout order",
        "billing_customer_name": billing_customer_name,
        "billing_last_name":    "",
        "billing_address":      billing_address,
        "billing_city":         billing_city,
        "billing_pincode":      billing_pincode,
        "billing_state":        billing_state,
        "billing_country":      "India",
        "billing_email":        "noreply@dupescout.in",
        "billing_phone":        billing_phone,
        "shipping_is_billing":  True,
        "order_items":          order_items,
        "payment_method":       payment_method,
        "shipping_charges":     0,
        "giftwrap_charges":     0,
        "transaction_charges":  0,
        "total_discount":       0,
        "sub_total":            sub_total,
        "length":               15,
        "breadth":              12,
        "height":               8,
        "weight":               weight,
    }

    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient(base_url=SHIPROCKET_BASE_URL, timeout=15.0, headers=headers) as client:
        resp = await client.post("/orders/create/adhoc", json=payload)
        resp.raise_for_status()
        data = resp.json()

    return ShipmentOrder(
        shipment_id=data.get("shipment_id", 0),
        order_id=data.get("order_id", 0),
        awb_code=data.get("awb_code"),
        courier_name=data.get("courier_name"),
        label_url=data.get("label_url"),
        status=data.get("status", "PENDING"),
    )


async def track_shipment(awb: str) -> TrackingInfo:
    """
    Get real-time tracking for an AWB.
    Returns current status, location, ETA, and full event history.
    """
    token = await _get_token()
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient(base_url=SHIPROCKET_BASE_URL, timeout=10.0, headers=headers) as client:
        resp = await client.get(f"/courier/track/awb/{awb}")
        resp.raise_for_status()
        data = resp.json()

    tracking = data.get("tracking_data", {})
    current = tracking.get("shipment_track_activities", [])

    return TrackingInfo(
        awb=awb,
        current_status=tracking.get("track_status", "Unknown"),
        current_location=tracking.get("current_location"),
        estimated_delivery=tracking.get("edd"),
        events=[
            {"time": e.get("date"), "location": e.get("location"), "activity": e.get("activity")}
            for e in current
        ],
    )


async def get_label(shipment_id: int) -> str:
    """Get PDF label URL for a shipment."""
    token = await _get_token()
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient(base_url=SHIPROCKET_BASE_URL, timeout=10.0, headers=headers) as client:
        resp = await client.get(
            "/courier/generate/label",
            params={"shipment_id[]": shipment_id},
        )
        resp.raise_for_status()
        data = resp.json()

    return data.get("label_url", "")
