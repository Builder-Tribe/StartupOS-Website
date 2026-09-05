"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShieldCheck, MapPin, Star, Scale } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { SimilarityScore } from "./SimilarityScore";
import { AIExplanationCard } from "./AIExplanationCard";
import type { Product } from "@/lib/types";
import { useCompareStore } from "@/lib/store/useCompareStore";

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

function formatSavings(price: number, mrp: number): string {
  const pct = Math.round(((mrp - price) / mrp) * 100);
  return pct > 0 ? `${pct}% off` : "";
}

interface ProductCardProps {
  product: Product;
  showAIExplanation?: boolean;
  className?: string;
}

export function ProductCard({ product, showAIExplanation = false, className }: ProductCardProps) {
  const [saved, setSaved] = useState(false);
  const [imgError, setImgError] = useState(false);
  const savings = formatSavings(product.price, product.mrp);

  const toggleCompare = useCompareStore((s) => s.toggleItem);
  const compared = useCompareStore((s) => s.items.some((i) => i.id === product.id));

  return (
    <div className={cn("card group overflow-hidden", className)}>
      <Link href={`/product/${product.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square bg-zinc-100 overflow-hidden">
          {!imgError ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 45vw, 220px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs">
              No image
            </div>
          )}

          {/* Similarity score badge — top left */}
          {product.similarity_score && (
            <div className="absolute top-2 left-2">
              <SimilarityScore
                score={product.similarity_score}
                breakdown={product.similarity_breakdown}
                size="sm"
              />
            </div>
          )}

          {/* Compare toggle button — top right beside Heart */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleCompare(product);
              }}
              className={cn(
                "p-1.5 rounded-full backdrop-blur-sm transition-all shadow-sm",
                compared
                  ? "bg-brand-500 text-white border border-brand-400"
                  : "bg-white/80 text-zinc-600 hover:bg-white hover:text-zinc-900"
              )}
              title={compared ? "Remove from Compare" : "Add to Compare"}
              aria-label={compared ? "Remove from Compare" : "Add to Compare"}
            >
              <Scale size={14} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setSaved((s) => !s);
              }}
              className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
              aria-label={saved ? "Remove from saved" : "Save"}
            >
              <Heart
                size={16}
                className={cn("transition-colors", saved ? "fill-red-500 stroke-red-500" : "stroke-zinc-500")}
              />
            </button>
          </div>

          {/* Affiliate badge */}
          {product.is_affiliate && (
            <span className="absolute bottom-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-900/70 text-white">
              via {product.affiliate_platform}
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3">
        <Link href={`/product/${product.id}`}>
          <p className="text-sm font-medium text-zinc-900 line-clamp-2 leading-snug hover:text-brand-600 transition-colors">
            {product.title}
          </p>
        </Link>

        {/* Seller */}
        <div className="flex items-center gap-1 mt-1">
          {product.seller.is_verified && (
            <ShieldCheck size={12} className="text-brand-500 shrink-0" />
          )}
          {product.seller.is_local && product.seller.city && (
            <MapPin size={12} className="text-zinc-400 shrink-0" />
          )}
          <span className="text-xs text-zinc-500 truncate">
            {product.seller.name}
            {product.seller.is_local && product.seller.city && ` · ${product.seller.city}`}
          </span>
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="text-base font-bold text-zinc-900">{formatPrice(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-zinc-400 line-through">{formatPrice(product.mrp)}</span>
          )}
          {savings && (
            <span className="text-xs font-semibold text-brand-600">{savings}</span>
          )}
        </div>

        {/* Rating */}
        {product.review_count > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star size={11} className="fill-amber-400 stroke-amber-400" />
            <span className="text-xs text-zinc-600 font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-zinc-400">({product.review_count.toLocaleString("en-IN")})</span>
          </div>
        )}

        {/* AI Explanation */}
        {showAIExplanation && product.ai_explanation && (
          <AIExplanationCard
            explanation={product.ai_explanation}
            compact
            className="mt-3"
          />
        )}
      </div>
    </div>
  );
}
