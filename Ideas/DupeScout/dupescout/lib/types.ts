// ─── Core domain types ──────────────────────────────────────────────────────

export type ProductCategory = "fashion" | "furniture" | "beauty" | "electronics" | "home" | "other";

export type SimilarityTier = "original" | "smart_value" | "similar";

export interface SimilarityBreakdown {
  shape: number;
  color: number;
  material: number;
  style: number;
  overall: number;
}

export interface Seller {
  id: string;
  name: string;
  type: "artisan" | "brand" | "d2c" | "reseller";
  city?: string;
  is_verified: boolean;
  is_local: boolean;
  rating: number;
}

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  price: number;
  mrp: number;
  stock_count: number;
}

export interface OriginalProductRef {
  name: string;
  brand: string;
  price: number;
  image?: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  category: ProductCategory;
  images: string[];
  price: number;
  mrp: number;
  currency: "INR";
  seller: Seller;
  rating: number;
  review_count: number;
  similarity_score?: number;
  similarity_breakdown?: SimilarityBreakdown;
  similarity_tier?: SimilarityTier;
  ai_explanation?: AIExplanation;
  aesthetic_codes?: string[];
  is_affiliate?: boolean;
  affiliate_platform?: string;
  affiliate_url?: string;
  variants?: ProductVariant[];
  original_ref?: OriginalProductRef;
  material_details?: string[];
  care_instructions?: string[];
  ships_in_days?: string;
}

export interface AIExplanation {
  verdict: "excellent_value" | "good_match" | "decent_alternative" | "notable_differences";
  headline: string;
  what_matches: string[];
  what_differs: string[];
  ai_recommendation: string;
}

export interface TrendCard {
  id: string;
  aesthetic: string;
  label: string;
  cover_image: string;
  save_count: number;
  product_count: number;
}

// ─── Visual Search ────────────────────────────────────────────────────────────

export interface VisualSearchRequest {
  image_base64?: string;
  url?: string;
  query?: string;
  filters?: SearchFilters;
}

export interface SearchFilters {
  price_min?: number;
  price_max?: number;
  similarity_min?: number; // 0-100
  local_only?: boolean;
  verified_only?: boolean;
  category?: ProductCategory;
}

export interface VisualSearchResult {
  search_id: string;
  query_image_url?: string;
  identified_product?: {
    name: string;
    category: ProductCategory;
    estimated_price?: number;
    source_platform?: string;
    detected_attributes: Record<string, string>;
  };
  results: {
    original: Product[];
    smart_value: Product[];
    similar: Product[];
  };
  total_results: number;
  search_time_ms: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;           // primary identity — required
  phone?: string;          // optional (kept for legacy OTP records)
  name?: string;
  avatar_url?: string;
  is_pro: boolean;
  style_preferences?: string[];
  city?: string;
}

export type AuthRealm = "consumer" | "seller" | "admin";

// ─── API response envelope ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
    took_ms?: number;
  };
}
