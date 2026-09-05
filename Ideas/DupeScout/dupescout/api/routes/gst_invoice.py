"""GST Invoice generation for sellers — S-15.

GET  /api/v1/seller/gst/invoices           — list invoices for a billing period
GET  /api/v1/seller/gst/invoices/{id}      — get single invoice PDF
GET  /api/v1/seller/gst/gstr1?month=YYYY-MM — GSTR-1 compatible export (JSON / CSV)

Invoice format:
  - Tax invoice per order (B2B: GSTIN present, B2C: consumer without GSTIN)
  - HSN code auto-assigned from product category
  - CGST 9% + SGST 9% (intra-state) or IGST 18% (inter-state)
  - Sequential invoice numbering: DS/{SELLER_CODE}/{YY-MM}/{SEQ}
"""
from __future__ import annotations

import io
import os
from datetime import datetime
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from api.lib.auth import TokenPayload, require_seller
from api.lib.database import get_db
from api.lib.response import ApiResponse, ApiMeta, ok, err

router = APIRouter(prefix="/seller/gst", tags=["seller-gst"])


# ── HSN code mapping by product category ─────────────────────────────────────

HSN_CODES: dict[str, str] = {
    "saree":           "52089020",
    "kurta":           "62044200",
    "dupatta":         "62149000",
    "lehenga":         "62044900",
    "jewellery":       "71179000",
    "bag":             "42022900",
    "footwear":        "64035910",
    "home_decor":      "57050010",
    "pottery":         "69120010",
    "paintings":       "97019900",
    "accessories":     "62170000",
    "default":         "62149900",  # Other made-up textile articles
}

TAX_RATE = 0.18  # 18% GST (9% CGST + 9% SGST intra-state, or 18% IGST inter-state)


# ── Mock invoice data ─────────────────────────────────────────────────────────

def _mock_invoices(seller_id: str, month: Optional[str]) -> list[dict]:
    return [
        {
            "invoice_number": "DS/PRT/26-07/001",
            "order_id": "ORD-8812",
            "invoice_date": "2026-07-31",
            "buyer_name": "Ananya Kumar",
            "buyer_gstin": None,
            "buyer_state": "Telangana",
            "seller_state": "Rajasthan",
            "supply_type": "interstate",
            "items": [
                {
                    "title": "Ajrakh Block Print Kurta",
                    "hsn_code": "62044200",
                    "qty": 1,
                    "unit_price": 1099.15,
                    "taxable_value": 1099.15,
                    "igst_rate": 18,
                    "igst_amount": 197.85,
                    "total": 1297.00,
                }
            ],
            "total_taxable": 1099.15,
            "total_igst": 197.85,
            "total_amount": 1297.00,
            "status": "issued",
        },
        {
            "invoice_number": "DS/PRT/26-07/002",
            "order_id": "ORD-9001",
            "invoice_date": "2026-07-28",
            "buyer_name": "Rohan Mehta",
            "buyer_gstin": "27AABCU9603R1ZX",
            "buyer_state": "Maharashtra",
            "seller_state": "Rajasthan",
            "supply_type": "interstate",
            "items": [
                {
                    "title": "Phulkari Dupatta",
                    "hsn_code": "62149000",
                    "qty": 2,
                    "unit_price": 847.46,
                    "taxable_value": 1694.92,
                    "igst_rate": 18,
                    "igst_amount": 305.08,
                    "total": 2000.00,
                }
            ],
            "total_taxable": 1694.92,
            "total_igst": 305.08,
            "total_amount": 2000.00,
            "status": "issued",
        },
    ]


def _gstr1_b2b(invoices: list[dict]) -> list[dict]:
    """GSTR-1 B2B invoices block — buyers with GSTIN."""
    return [
        {
            "ctin": inv["buyer_gstin"],
            "inv": [{
                "inum":  inv["invoice_number"],
                "idt":   inv["invoice_date"],
                "val":   inv["total_amount"],
                "pos":   inv["buyer_state"][:2],
                "rchrg": "N",
                "inv_typ": "R",
                "itms": [{
                    "num": 1,
                    "itm_det": {
                        "rt":    item["igst_rate"],
                        "txval": item["taxable_value"],
                        "iamt":  item["igst_amount"],
                        "csamt": 0,
                    }
                } for item in inv["items"]],
            }]
        }
        for inv in invoices if inv.get("buyer_gstin")
    ]


def _gstr1_b2c(invoices: list[dict]) -> list[dict]:
    """GSTR-1 B2CS (B2C small — under ₹2.5L) invoices block."""
    by_state_rate: dict[tuple, float] = {}
    for inv in invoices:
        if inv.get("buyer_gstin"):
            continue
        key = (inv["buyer_state"][:2], 18)
        by_state_rate[key] = by_state_rate.get(key, 0) + inv["total_taxable"]

    return [
        {
            "sply_ty": "INTER",
            "pos": state,
            "rt": rate,
            "txval": round(txval, 2),
        }
        for (state, rate), txval in by_state_rate.items()
    ]


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/invoices", response_model=ApiResponse)
async def list_invoices(
    month: Optional[str] = Query(None, description="YYYY-MM format"),
    db: Annotated[AsyncSession, Depends(get_db)] = None,
    seller: Annotated[TokenPayload, Depends(require_seller)] = None,
):
    """List all GST invoices for the seller, optionally filtered by month."""
    invoices = _mock_invoices(seller.sub, month)
    return ok(invoices, ApiMeta(total=len(invoices)))


@router.get("/gstr1", response_model=ApiResponse)
async def gstr1_export(
    month: str = Query(..., description="YYYY-MM, e.g. 2026-07"),
    db: Annotated[AsyncSession, Depends(get_db)] = None,
    seller: Annotated[TokenPayload, Depends(require_seller)] = None,
):
    """
    Export GSTR-1 compatible JSON for filing.
    Structure matches the GSTN API format:
      - fp: filing period (MMYYYY)
      - b2b: B2B invoices (buyer has GSTIN)
      - b2cs: B2C small invoices (consumer, under ₹2.5L per invoice)
    """
    invoices = _mock_invoices(seller.sub, month)

    # fp format: MMYYYY e.g. "072026"
    parts = month.split("-")
    fp = f"{parts[1]}{parts[0]}" if len(parts) == 2 else month

    gstr1 = {
        "gstin": "08ABCDE1234F1Z5",  # TODO: use seller's actual GSTIN
        "fp": fp,
        "gt": sum(inv["total_amount"] for inv in invoices),
        "cur_gt": sum(inv["total_amount"] for inv in invoices),
        "b2b": _gstr1_b2b(invoices),
        "b2cs": _gstr1_b2c(invoices),
    }

    return ok(gstr1)


@router.get("/invoices/{invoice_number}/pdf")
async def invoice_pdf(
    invoice_number: str,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
    seller: Annotated[TokenPayload, Depends(require_seller)] = None,
):
    """
    Generate and stream a PDF invoice.
    Uses reportlab (installed in production) or returns a plain-text stub in dev.

    TODO: Replace stub with proper PDF generation using reportlab or weasyprint.
    """
    invoices = _mock_invoices(seller.sub, None)
    inv = next((i for i in invoices if i["invoice_number"] == invoice_number), None)
    if not inv:
        return err("NOT_FOUND", "Invoice not found")

    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import A4

        buf = io.BytesIO()
        c = canvas.Canvas(buf, pagesize=A4)
        w, h = A4

        # Header
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, h - 50, "TAX INVOICE")
        c.setFont("Helvetica", 10)
        c.drawString(50, h - 70, f"Invoice No: {inv['invoice_number']}")
        c.drawString(50, h - 85, f"Date: {inv['invoice_date']}")
        c.drawString(50, h - 100, f"Order: {inv['order_id']}")

        # Seller block
        c.setFont("Helvetica-Bold", 10)
        c.drawString(50, h - 130, "Seller (DupeScout Partner)")
        c.setFont("Helvetica", 9)
        c.drawString(50, h - 145, "GSTIN: 08ABCDE1234F1Z5")

        # Buyer block
        c.setFont("Helvetica-Bold", 10)
        c.drawString(300, h - 130, "Bill To")
        c.setFont("Helvetica", 9)
        c.drawString(300, h - 145, inv["buyer_name"])
        if inv.get("buyer_gstin"):
            c.drawString(300, h - 158, f"GSTIN: {inv['buyer_gstin']}")

        # Items
        y = h - 200
        c.setFont("Helvetica-Bold", 9)
        c.drawString(50, y, "Description")
        c.drawString(300, y, "HSN")
        c.drawString(360, y, "Qty")
        c.drawString(400, y, "Rate")
        c.drawString(450, y, "Tax")
        c.drawString(500, y, "Total")
        c.line(50, y - 5, 550, y - 5)

        y -= 20
        c.setFont("Helvetica", 9)
        for item in inv["items"]:
            c.drawString(50, y, item["title"][:40])
            c.drawString(300, y, item["hsn_code"])
            c.drawString(360, y, str(item["qty"]))
            c.drawString(400, y, f"₹{item['unit_price']:.2f}")
            c.drawString(450, y, f"₹{item['igst_amount']:.2f}")
            c.drawString(500, y, f"₹{item['total']:.2f}")
            y -= 18

        # Totals
        y -= 10
        c.line(50, y, 550, y)
        y -= 15
        c.setFont("Helvetica-Bold", 10)
        c.drawString(400, y, f"Total: ₹{inv['total_amount']:.2f}")

        c.setFont("Helvetica", 8)
        c.drawString(50, 50, "This is a computer-generated invoice and does not require a signature.")
        c.drawString(50, 38, "DupeScout Commerce Pvt. Ltd. | CIN: U74999MH2026PTC123456 | support@dupescout.in")

        c.save()
        buf.seek(0)

        return StreamingResponse(
            buf,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{invoice_number}.pdf"'},
        )

    except ImportError:
        # Dev environment without reportlab — return plain text
        text = f"INVOICE: {invoice_number}\nOrder: {inv['order_id']}\nTotal: ₹{inv['total_amount']}\n"
        return StreamingResponse(
            io.BytesIO(text.encode()),
            media_type="text/plain",
            headers={"Content-Disposition": f'attachment; filename="{invoice_number}.txt"'},
        )
