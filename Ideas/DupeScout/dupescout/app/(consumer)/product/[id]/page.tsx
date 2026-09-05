"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Share2, Heart, ShieldCheck, Truck, RotateCcw,
  ChevronDown, ChevronUp, ArrowLeft, Star,
} from "lucide-react";
import { ImageGallery } from "@/components/product/ImageGallery";
import { VariantSelector } from "@/components/product/VariantSelector";
import { ReviewSummary } from "@/components/product/ReviewSummary";
import { SellerCard } from "@/components/product/SellerCard";
import { AIExplanationCard } from "@/components/search/AIExplanationCard";
import { SimilarityScore } from "@/components/search/SimilarityScore";
import { ProductCard } from "@/components/search/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/store";
import { MOCK_PRODUCT_DETAIL, MOCK_PRODUCTS_BY_ID, MOCK_REVIEWS, MOCK_RECOMMENDATIONS } from "@/lib/mock-data";
import type { ProductVariant } from "@/lib/types";
import { cn } from "@/lib/cn";

export default function ProductDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const { addItem, getItem } = useCart();

  const product = MOCK_PRODUCTS_BY_ID[id] ?? MOCK_PRODUCT_DETAIL;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.find((v) => v.stock_count > 0)
  );
  const [saved,             setSaved]             = useState(false);
  const [materialExpanded,  setMaterialExpanded]  = useState(false);
  const [addedToCart,       setAddedToCart]       = useState(false);

  const price      = selectedVariant?.price ?? product.price;
  const mrp        = selectedVariant?.mrp   ?? product.mrp;
  const discountPct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const inCart     = getItem(product.id, selectedVariant?.id);

  function handleAddToCart() {
    addItem(product, selectedVariant);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleBuyNow() {
    addItem(product, selectedVariant);
    router.push("/cart");
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-zinc-400">
        <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-zinc-700 transition-colors">
          <ArrowLeft size={14} />
          Back
        </button>
        <span>/</span>
        <span className="text-zinc-600 truncate">{product.title}</span>
      </div>

      {/* ── 2-column layout (desktop) ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14">

          {/* ── Left: Image gallery (sticky on desktop) ──────────────────────── */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <ImageGallery images={product.images} productName={product.title} />

            {/* Share + Save — desktop only, below gallery */}
            <div className="hidden lg:flex items-center gap-2 mt-4">
              <button
                onClick={() => setSaved((s) => !s)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors flex-1 justify-center",
                  saved ? "border-red-200 text-red-600 bg-red-50" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                )}
              >
                <Heart size={16} className={cn(saved && "fill-red-500 stroke-red-500")} />
                {saved ? "Saved" : "Save to wishlist"}
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-medium hover:border-zinc-300 transition-colors">
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>

          {/* ── Right: Product info ──────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Title + actions */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-snug">{product.title}</h1>
                {/* Mobile share/save */}
                <div className="flex items-center gap-1 lg:hidden shrink-0 mt-1">
                  <button onClick={() => setSaved((s) => !s)} className="p-2 rounded-xl hover:bg-zinc-100">
                    <Heart size={20} className={cn("transition-colors", saved ? "fill-red-500 stroke-red-500" : "stroke-zinc-500")} />
                  </button>
                  <button className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Seller + badges */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Link href={`/search?q=${encodeURIComponent(product.seller.name)}`} className="text-sm text-zinc-500 hover:text-brand-600">
                  by {product.seller.name}
                </Link>
                {product.seller.is_verified && (
                  <span className="flex items-center gap-0.5 text-xs text-brand-600 font-medium">
                    <ShieldCheck size={12} /> Verified
                  </span>
                )}
                {product.seller.type === "artisan" && (
                  <Badge variant="brand">Artisan</Badge>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 stroke-amber-400" />
                  <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
                  <span className="text-sm text-zinc-400">({product.review_count.toLocaleString("en-IN")} reviews)</span>
                </div>
                <span className="text-zinc-200">·</span>
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <Truck size={12} /> Ships in {product.ships_in_days ?? "3-5 business days"}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 py-4 border-y border-zinc-100">
              <span className="text-3xl font-bold text-zinc-900">₹{price.toLocaleString("en-IN")}</span>
              {mrp > price && (
                <>
                  <span className="text-lg text-zinc-400 line-through">₹{mrp.toLocaleString("en-IN")}</span>
                  <Badge variant="success">{discountPct}% off</Badge>
                </>
              )}
            </div>

            {/* ── Original vs Dupe comparison ─────────────────────────────── */}
            {product.original_ref && (
              <div className="rounded-2xl border border-zinc-100 overflow-hidden">
                <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 flex items-center gap-1.5">
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Original vs Dupe</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-zinc-100">
                  {/* Original */}
                  <div className="p-4">
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-1">Original</p>
                    <p className="text-sm font-semibold text-zinc-900 leading-snug">{product.original_ref.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{product.original_ref.brand}</p>
                    <p className="text-base font-bold text-zinc-900 mt-2">₹{product.original_ref.price.toLocaleString("en-IN")}</p>
                  </div>
                  {/* Dupe */}
                  <div className="p-4 bg-brand-50/40">
                    <p className="text-[10px] font-semibold text-brand-600 uppercase tracking-wide mb-1">This Dupe</p>
                    <p className="text-sm font-semibold text-zinc-900 leading-snug">{product.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{product.seller.name}</p>
                    <p className="text-base font-bold text-brand-600 mt-2">₹{(selectedVariant?.price ?? product.price).toLocaleString("en-IN")}</p>
                  </div>
                </div>
                {/* Savings callout */}
                {product.original_ref.price > (selectedVariant?.price ?? product.price) && (
                  <div className="px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold text-center">
                    You save ₹{(product.original_ref.price - (selectedVariant?.price ?? product.price)).toLocaleString("en-IN")} · {Math.round(((product.original_ref.price - (selectedVariant?.price ?? product.price)) / product.original_ref.price) * 100)}% cheaper
                  </div>
                )}
                {/* What matches / differs */}
                {product.ai_explanation && (
                  <div className="grid grid-cols-2 divide-x divide-zinc-100 border-t border-zinc-100">
                    <div className="p-3">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1.5">What matches</p>
                      <ul className="space-y-1">
                        {product.ai_explanation.what_matches.slice(0, 3).map((m) => (
                          <li key={m} className="text-xs text-zinc-600 flex items-start gap-1.5">
                            <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>{m}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] font-bold text-amber-600 uppercase mb-1.5">What differs</p>
                      <ul className="space-y-1">
                        {product.ai_explanation.what_differs.slice(0, 3).map((d) => (
                          <li key={d} className="text-xs text-zinc-600 flex items-start gap-1.5">
                            <span className="text-amber-500 mt-0.5 shrink-0">≈</span>{d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Similarity pill */}
            {product.similarity_score && product.similarity_breakdown && (
              <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 flex items-center justify-between gap-3">
                <div>
                  <SimilarityScore
                    score={product.similarity_score}
                    breakdown={product.similarity_breakdown}
                    size="md"
                  />
                  <p className="text-xs text-zinc-500 mt-1">similar to Zara Linen Co-ord (₹7,999)</p>
                </div>
                <Link
                  href={`/search?compare=${product.id}`}
                  className="text-xs font-medium text-brand-600 hover:underline shrink-0"
                >
                  Compare →
                </Link>
              </div>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <VariantSelector
                variants={product.variants}
                selectedId={selectedVariant?.id}
                onSelect={setSelectedVariant}
                type="size"
              />
            )}

            {/* CTA buttons — always visible in right column on desktop */}
            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
              >
                {addedToCart
                  ? "✓ Added to cart"
                  : inCart
                  ? `Update cart (${inCart.quantity} in cart)`
                  : `Add to cart · ₹${price.toLocaleString("en-IN")}`}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleBuyNow}
                className="w-full border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white"
              >
                ⚡ Buy Now
              </Button>
            </div>

            {/* Trust signals */}
            <div className="flex gap-4 py-3 border-y border-zinc-100">
              <TrustPill icon={<Truck size={14} />} text="Free delivery above ₹999" />
              <TrustPill icon={<RotateCcw size={14} />} text="7-day easy returns" />
            </div>

            {/* AI Says */}
            {product.ai_explanation && (
              <div>
                <p className="text-sm font-bold text-zinc-900 mb-2">AI Says</p>
                <AIExplanationCard explanation={product.ai_explanation} />
              </div>
            )}

            {/* Description */}
            <div>
              <p className="text-sm font-bold text-zinc-900 mb-2">About this product</p>
              <p className="text-sm text-zinc-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Aesthetic codes */}
            {product.aesthetic_codes && product.aesthetic_codes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.aesthetic_codes.map((code) => (
                  <Badge key={code} variant="muted" className="capitalize">{code.replace(/_/g, " ")}</Badge>
                ))}
              </div>
            )}

            {/* Material & Construction */}
            <div className="border border-zinc-100 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors"
                onClick={() => setMaterialExpanded((v) => !v)}
              >
                Material & Construction
                {materialExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {materialExpanded && (
                <div className="px-4 pb-4 space-y-1.5">
                  {(product.material_details ?? []).map((d) => (
                    <p key={d} className="text-sm text-zinc-600 flex items-start gap-2">
                      <span className="text-brand-500 mt-0.5">·</span>{d}
                    </p>
                  ))}
                  {(product.care_instructions ?? []).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-100">
                      <p className="text-xs font-semibold text-zinc-700 mb-1">Care instructions</p>
                      {(product.care_instructions ?? []).map((c) => (
                        <p key={c} className="text-xs text-zinc-500">{c}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-zinc-900">Reviews ({product.review_count.toLocaleString("en-IN")})</p>
                <Link href={`/product/${product.id}/reviews`} className="text-xs font-medium text-brand-600 hover:underline">
                  See all
                </Link>
              </div>
              <ReviewSummary data={MOCK_REVIEWS} />
            </div>

            {/* Seller */}
            <div>
              <p className="text-sm font-bold text-zinc-900 mb-2">Seller</p>
              <SellerCard seller={{ ...product.seller, total_orders: 2847, response_time_hours: 4, ships_pan_india: true }} />
            </div>
          </div>
        </div>

        {/* ── You might also love (full width) ─────────────────────────────── */}
        <div className="mt-16 pt-8 border-t border-zinc-100">
          <p className="text-lg font-bold text-zinc-900 mb-5">You might also love</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {MOCK_RECOMMENDATIONS.slice(0, 5).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile sticky CTA ───────────────────────────────────────────────── */}
      <div className="fixed bottom-14 left-0 right-0 z-40 bg-white border-t border-zinc-100 px-4 pt-3 pb-safe lg:hidden">
        <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setSaved((s) => !s)}
            className={cn(saved && "border-red-300 text-red-600")}
          >
            <Heart size={18} className={cn(saved && "fill-red-500 stroke-red-500")} />
            {saved ? "Saved" : "Save"}
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleAddToCart}
          >
            {addedToCart ? "✓ Added" : `₹${price.toLocaleString("en-IN")} · Add`}
          </Button>
        </div>
      </div>

      <div className="h-24 lg:h-0" />
    </div>
  );
}

function TrustPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-600">
      <span className="text-brand-500">{icon}</span>
      {text}
    </div>
  );
}
