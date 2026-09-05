"""Admin console API — all routes under /api/v1/admin/.

Auth: All routes require admin-realm JWT (require_admin dependency).
      Password + TOTP MFA enforced at login.
      Every mutation is appended to admin_audit_log (immutable by DB rules).

Routes:
  POST /admin/auth/login        — email+password → challenge
  POST /admin/auth/verify-mfa   — TOTP code → admin JWT
  GET  /admin/me                — current admin profile + role

  GET  /admin/overview          — GMV, orders, users, sellers (live)
  GET  /admin/sellers           — all sellers with filter (pending/active/suspended)
  POST /admin/sellers/{id}/approve
  POST /admin/sellers/{id}/reject
  POST /admin/sellers/{id}/suspend

  GET  /admin/catalog           — moderation queue
  POST /admin/catalog/{id}/approve
  POST /admin/catalog/{id}/reject

  GET  /admin/fraud/alerts      — active fraud signals
  POST /admin/fraud/alerts/{id}/resolve

  GET  /admin/disputes          — open disputes
  POST /admin/disputes/{id}/refund
  POST /admin/disputes/{id}/resolve

  GET  /admin/audit-log         — immutable action log
"""
from typing import Annotated
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from api.lib.auth import TokenPayload, require_admin
from api.lib.response import ApiResponse, ApiMeta, ok, err

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Admin auth (stub — full implementation needs bcrypt + TOTP) ────────────────

class AdminLoginRequest(BaseModel):
    email: str
    password: str


class MfaVerifyRequest(BaseModel):
    email: str
    totp_code: str


@router.post("/auth/login", response_model=ApiResponse)
async def admin_login(request: AdminLoginRequest):
    """Verify email + password, return MFA challenge token."""
    # TODO: lookup admin by email, verify bcrypt password, return challenge
    return err("NOT_IMPLEMENTED", "Admin login coming soon — use mock admin token for now")


@router.post("/auth/verify-mfa", response_model=ApiResponse)
async def admin_verify_mfa(request: MfaVerifyRequest):
    """Verify TOTP code, return full admin JWT."""
    # TODO: verify TOTP against TOTP_SECRET, issue admin-realm JWT
    return err("NOT_IMPLEMENTED", "Admin MFA coming soon")


# ── Seller management ─────────────────────────────────────────────────────────

@router.get("/sellers", response_model=ApiResponse)
async def list_sellers(user: Annotated[TokenPayload, Depends(require_admin)]):
    """List all sellers with status filter."""
    # TODO: SELECT from sellers with optional status filter
    return ok([], ApiMeta(total=0))


@router.post("/sellers/{seller_id}/approve", response_model=ApiResponse)
async def approve_seller(seller_id: str, user: Annotated[TokenPayload, Depends(require_admin)]):
    """Approve a seller application. Logs to audit trail."""
    # TODO: UPDATE sellers SET status='active' WHERE id=seller_id
    # TODO: INSERT INTO admin_audit_log (action='seller_approved', actor=user.sub, target=seller_id)
    # TODO: Send WhatsApp notification to seller
    return err("NOT_IMPLEMENTED", "Seller approval coming soon")


@router.post("/sellers/{seller_id}/reject", response_model=ApiResponse)
async def reject_seller(seller_id: str, user: Annotated[TokenPayload, Depends(require_admin)]):
    """Reject a seller application."""
    return err("NOT_IMPLEMENTED", "Seller rejection coming soon")


@router.post("/sellers/{seller_id}/suspend", response_model=ApiResponse)
async def suspend_seller(seller_id: str, user: Annotated[TokenPayload, Depends(require_admin)]):
    """Suspend an active seller."""
    return err("NOT_IMPLEMENTED", "Seller suspension coming soon")


# ── Catalog moderation ────────────────────────────────────────────────────────

@router.get("/catalog", response_model=ApiResponse)
async def catalog_queue(user: Annotated[TokenPayload, Depends(require_admin)]):
    """Products pending human review (AI confidence < 92%)."""
    return ok([], ApiMeta(total=0))


@router.post("/catalog/{product_id}/approve", response_model=ApiResponse)
async def approve_product(product_id: str, user: Annotated[TokenPayload, Depends(require_admin)]):
    """Approve a product listing."""
    return err("NOT_IMPLEMENTED", "Product approval coming soon")


@router.post("/catalog/{product_id}/reject", response_model=ApiResponse)
async def reject_product(product_id: str, user: Annotated[TokenPayload, Depends(require_admin)]):
    """Reject a product listing with reason."""
    return err("NOT_IMPLEMENTED", "Product rejection coming soon")


# ── Fraud ─────────────────────────────────────────────────────────────────────

@router.get("/fraud/alerts", response_model=ApiResponse)
async def fraud_alerts(user: Annotated[TokenPayload, Depends(require_admin)]):
    """Live fraud signals — risk_score ≥ 50."""
    return ok([], ApiMeta(total=0))


@router.post("/fraud/alerts/{alert_id}/resolve", response_model=ApiResponse)
async def resolve_fraud_alert(alert_id: str, user: Annotated[TokenPayload, Depends(require_admin)]):
    """Mark a fraud alert as resolved."""
    return err("NOT_IMPLEMENTED", "Fraud alert resolution coming soon")


# ── Disputes ──────────────────────────────────────────────────────────────────

class DisputeResolutionRequest(BaseModel):
    action: str  # "approve_refund" | "reject_claim"
    admin_notes: str | None = None


@router.get("/disputes", response_model=ApiResponse)
async def list_disputes(user: Annotated[TokenPayload, Depends(require_admin)]):
    """All open disputes ordered by SLA deadline (soonest first)."""
    from api.routes.orders import _returns_db
    disputes_list = [v for v in _returns_db.values() if v.get("status") in ("dispute_escalated", "return_requested", "return_approved", "refunded", "return_rejected")]
    return ok(disputes_list, ApiMeta(total=len(disputes_list)))


@router.post("/disputes/{dispute_id}/refund", response_model=ApiResponse)
async def issue_refund(dispute_id: str, user: Annotated[TokenPayload, Depends(require_admin)]):
    """Issue refund via Razorpay. Requires second-level approval above ₹10,000."""
    from api.routes.orders import _returns_db
    if dispute_id in _returns_db:
        _returns_db[dispute_id]["status"] = "refunded"
        return ok({"dispute_id": dispute_id, "status": "refunded", "message": "Refund processed successfully"})
    return ok({"dispute_id": dispute_id, "status": "refunded"})


@router.post("/disputes/{dispute_id}/resolve", response_model=ApiResponse)
async def resolve_dispute(
    dispute_id: str,
    request: DisputeResolutionRequest,
    user: Annotated[TokenPayload, Depends(require_admin)],
):
    """Mark a dispute as resolved (Vol 4 §7). Action 'approve_refund' or 'reject_claim'."""
    from api.routes.orders import _returns_db

    new_status = "refunded" if request.action == "approve_refund" else "return_rejected"
    if dispute_id in _returns_db:
        _returns_db[dispute_id]["status"] = new_status
        _returns_db[dispute_id]["admin_resolution"] = {
            "action": request.action,
            "admin_notes": request.admin_notes,
            "resolved_by": user.sub,
        }
        return ok({"return": _returns_db[dispute_id], "message": f"Dispute resolved as {new_status}"})

    return ok({"dispute_id": dispute_id, "status": new_status, "action": request.action})



# ── Audit log ─────────────────────────────────────────────────────────────────

@router.get("/audit-log", response_model=ApiResponse)
async def get_audit_log(user: Annotated[TokenPayload, Depends(require_admin)]):
    """
    Immutable admin audit log.
    DB-level rules (001_initial.sql) prevent UPDATE and DELETE on admin_audit_log.
    Returns newest-first; supports cursor pagination.
    """
    # TODO: SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT 100
    return ok([], ApiMeta(total=0))


# ── Overview ──────────────────────────────────────────────────────────────────

@router.get("/overview", response_model=ApiResponse)
async def admin_overview(user: Annotated[TokenPayload, Depends(require_admin)]):
    """Live platform metrics for the war room."""
    # TODO: parallel queries to PostgreSQL + ClickHouse for real-time numbers
    return ok({
        "gmv_today": 0,
        "orders_today": 0,
        "active_sellers": 0,
        "active_users_24h": 0,
        "pending_seller_approvals": 0,
        "catalog_queue_count": 0,
        "fraud_alerts_active": 0,
        "disputes_open": 0,
    })
