-- Migration 001: Initial DupeScout schema
-- Run with: psql $DATABASE_URL -f db/migrations/001_initial.sql
-- Requires: PostgreSQL 16+, pgvector extension

-- ── Extensions ───────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- fuzzy text search


-- ── Enums ─────────────────────────────────────────────────────────────────────

CREATE TYPE product_category AS ENUM ('fashion', 'furniture', 'beauty', 'electronics', 'home', 'other');
CREATE TYPE seller_type       AS ENUM ('artisan', 'brand', 'd2c', 'reseller');
CREATE TYPE seller_status     AS ENUM ('pending', 'approved', 'suspended', 'banned');
CREATE TYPE order_status      AS ENUM ('placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'return_initiated', 'returned');
CREATE TYPE similarity_tier   AS ENUM ('original', 'smart_value', 'similar');


-- ── Users (consumers) ─────────────────────────────────────────────────────────

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone           VARCHAR(15) UNIQUE NOT NULL,
    name            VARCHAR(100),
    email           VARCHAR(200) UNIQUE,
    avatar_url      TEXT,
    city            VARCHAR(100),
    is_pro          BOOLEAN NOT NULL DEFAULT FALSE,
    pro_expires_at  TIMESTAMPTZ,
    style_prefs     TEXT[] DEFAULT '{}',   -- aesthetic codes
    search_count_today INT NOT NULL DEFAULT 0,
    search_date     DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX users_phone_idx ON users (phone);
CREATE INDEX users_email_idx ON users (email) WHERE email IS NOT NULL;


-- ── Sellers ───────────────────────────────────────────────────────────────────

CREATE TABLE sellers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone               VARCHAR(15) UNIQUE NOT NULL,
    business_name       VARCHAR(200) NOT NULL,
    seller_type         seller_type NOT NULL DEFAULT 'brand',
    status              seller_status NOT NULL DEFAULT 'pending',
    gstin               VARCHAR(15),
    pan                 VARCHAR(10),
    aadhaar_last4       VARCHAR(4),
    bank_account_verified BOOLEAN NOT NULL DEFAULT FALSE,
    city                VARCHAR(100),
    state               VARCHAR(100),
    lat                 NUMERIC(9, 6),
    lng                 NUMERIC(9, 6),
    commission_rate     NUMERIC(4, 2),   -- override; NULL = use category default
    rating              NUMERIC(3, 2) NOT NULL DEFAULT 0,
    review_count        INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX sellers_status_idx  ON sellers (status);
CREATE INDEX sellers_city_idx    ON sellers (city);
-- Geo index for local sellers feature
CREATE INDEX sellers_geo_idx     ON sellers USING gist (point(lng, lat));


-- ── Products ──────────────────────────────────────────────────────────────────

CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id       UUID NOT NULL REFERENCES sellers (id) ON DELETE RESTRICT,
    title           VARCHAR(300) NOT NULL,
    description     TEXT,
    category        product_category NOT NULL,
    price           NUMERIC(10, 2) NOT NULL,
    mrp             NUMERIC(10, 2) NOT NULL,
    currency        CHAR(3) NOT NULL DEFAULT 'INR',
    images          TEXT[] NOT NULL DEFAULT '{}',
    aesthetic_codes TEXT[] DEFAULT '{}',
    material        VARCHAR(200),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_approved     BOOLEAN NOT NULL DEFAULT FALSE,
    moderation_note TEXT,
    rating          NUMERIC(3, 2) NOT NULL DEFAULT 0,
    review_count    INT NOT NULL DEFAULT 0,
    view_count      INT NOT NULL DEFAULT 0,
    order_count     INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX products_seller_idx    ON products (seller_id);
CREATE INDEX products_category_idx  ON products (category);
CREATE INDEX products_active_idx    ON products (is_active, is_approved);
CREATE INDEX products_price_idx     ON products (price);
-- Trigram index for keyword search fallback
CREATE INDEX products_title_trgm    ON products USING gin (title gin_trgm_ops);


-- ── Product embeddings (Visual Similarity Engine) ─────────────────────────────

CREATE TABLE product_embeddings (
    product_id  UUID PRIMARY KEY REFERENCES products (id) ON DELETE CASCADE,
    embedding   vector(512) NOT NULL,  -- CLIP ViT-L/14 output
    model_ver   VARCHAR(50) NOT NULL DEFAULT 'clip-vit-l14-v1',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HNSW index — fast approximate nearest neighbour search
-- m=16, ef_construction=64 → good recall/speed tradeoff at 10M scale
CREATE INDEX product_embeddings_hnsw ON product_embeddings
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);


-- ── Product variants ──────────────────────────────────────────────────────────

CREATE TABLE product_variants (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    size        VARCHAR(50),
    color       VARCHAR(50),
    sku         VARCHAR(100) UNIQUE,
    price       NUMERIC(10, 2),   -- NULL = same as parent product price
    mrp         NUMERIC(10, 2),
    stock_count INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX variants_product_idx ON product_variants (product_id);


-- ── Orders ────────────────────────────────────────────────────────────────────

CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users (id),
    seller_id       UUID NOT NULL REFERENCES sellers (id),
    status          order_status NOT NULL DEFAULT 'placed',
    subtotal        NUMERIC(10, 2) NOT NULL,
    shipping_fee    NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount        NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total           NUMERIC(10, 2) NOT NULL,
    razorpay_order_id   VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    shiprocket_order_id VARCHAR(100),
    awb_number      VARCHAR(100),
    carrier         VARCHAR(50),
    shipping_address JSONB NOT NULL,
    placed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at    TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX orders_user_idx   ON orders (user_id);
CREATE INDEX orders_seller_idx ON orders (seller_id);
CREATE INDEX orders_status_idx ON orders (status);


-- ── Order items ───────────────────────────────────────────────────────────────

CREATE TABLE order_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id    UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES products (id),
    variant_id  UUID REFERENCES product_variants (id),
    quantity    INT NOT NULL DEFAULT 1,
    unit_price  NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);

CREATE INDEX order_items_order_idx ON order_items (order_id);


-- ── Visual search log ─────────────────────────────────────────────────────────

CREATE TABLE visual_searches (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users (id),     -- NULL for anonymous
    query_type      VARCHAR(20) NOT NULL,            -- 'image' | 'url' | 'text'
    query_url       TEXT,
    identified_name VARCHAR(300),
    category        product_category,
    result_count    INT NOT NULL DEFAULT 0,
    clicked_product_id UUID REFERENCES products (id),
    purchased       BOOLEAN DEFAULT FALSE,
    search_time_ms  INT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX visual_searches_user_idx ON visual_searches (user_id);
CREATE INDEX visual_searches_date_idx ON visual_searches (created_at);


-- ── User saved products (wishlist) ────────────────────────────────────────────

CREATE TABLE user_saved_products (
    user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    saved_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, product_id)
);


-- ── Reviews ───────────────────────────────────────────────────────────────────

CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users (id),
    order_id        UUID REFERENCES orders (id),
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title           VARCHAR(200),
    body            TEXT,
    images          TEXT[] DEFAULT '{}',
    is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    authenticity_score   NUMERIC(3, 2),  -- from Review Authenticity AI
    is_flagged      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX reviews_product_idx ON reviews (product_id);
CREATE INDEX reviews_user_idx    ON reviews (user_id);


-- ── Admin audit log (immutable) ───────────────────────────────────────────────

CREATE TABLE admin_audit_log (
    id          BIGSERIAL PRIMARY KEY,
    admin_id    UUID NOT NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id   UUID,
    before_json JSONB,
    after_json  JSONB,
    ip_address  INET,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent any updates or deletes on the audit log
CREATE RULE no_update_audit AS ON UPDATE TO admin_audit_log DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO admin_audit_log DO INSTEAD NOTHING;

CREATE INDEX audit_log_admin_idx ON admin_audit_log (admin_id);
CREATE INDEX audit_log_entity_idx ON admin_audit_log (entity_type, entity_id);
CREATE INDEX audit_log_date_idx  ON admin_audit_log (created_at);
