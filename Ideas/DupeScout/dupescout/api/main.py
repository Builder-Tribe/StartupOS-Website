"""DupeScout FastAPI backend — entry point."""
import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from api.routes import auth, visual_search, consumer, orders, seller
from api.routes.admin.router import router as admin_router
from api.routes import keyword_search, wishlist, gst_invoice, razorpay_webhook, ai_chat


# ── Startup / Shutdown ────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # TODO: warm up CLIP model, pre-load aesthetic code embeddings
    print("DupeScout API starting up…")
    yield
    print("DupeScout API shutting down…")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="DupeScout API",
    description="AI visual shopping intelligence for Gen Z India",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# CORS — allow Next.js frontend and mobile app origins
ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,https://dupescout.in,https://www.dupescout.in",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"chrome-extension://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)


# ── Request timing middleware ─────────────────────────────────────────────────

@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    took_ms = int((time.time() - start) * 1000)
    response.headers["X-Response-Time-Ms"] = str(took_ms)
    return response


# ── Global error handler ──────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Log to monitoring (Sentry, CloudWatch) in production
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred"}},
    )


# ── Routes ────────────────────────────────────────────────────────────────────

API_PREFIX = "/api/v1"

app.include_router(auth.router,             prefix=API_PREFIX)
app.include_router(visual_search.router,    prefix=API_PREFIX)
app.include_router(keyword_search.router,   prefix=API_PREFIX)
app.include_router(consumer.router,         prefix=API_PREFIX)
app.include_router(orders.router,           prefix=API_PREFIX)
app.include_router(wishlist.router,         prefix=API_PREFIX)
app.include_router(seller.router,           prefix=API_PREFIX)
app.include_router(gst_invoice.router,      prefix=API_PREFIX)
app.include_router(razorpay_webhook.router, prefix=API_PREFIX)
app.include_router(ai_chat.router,          prefix=API_PREFIX)
app.include_router(admin_router,            prefix=API_PREFIX)


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}


# ── Dev entrypoint ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
