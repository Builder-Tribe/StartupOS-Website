"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { ProductCard } from "@/components/search/ProductCard";

const AESTHETIC_LABELS: Record<string, string> = {
  quiet_luxury:  "Quiet Luxury",
  artisan_craft: "Artisan Craft",
  y2k:           "Y2K Revival",
  japandi:       "Japandi Home",
  clean_girl:    "Clean Girl",
  cottagecore:   "Cottagecore",
  streetwear:    "Streetwear",
  bohemian:      "Bohemian",
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const aesthetic = slug.replace(/-/g, "_");
  const label     = AESTHETIC_LABELS[aesthetic] ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const products  = MOCK_PRODUCTS.filter((p) => p.aesthetic_codes?.includes(aesthetic));

  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}
      <section className="bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 mb-4 transition-colors"
          >
            <ArrowLeft size={14} /> Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mb-2">{label}</h1>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Sparkles size={14} className="text-brand-500" />
            AI-matched Indian alternatives · Real similarity scores
            <span className="text-zinc-300">·</span>
            <span>{products.length} products</span>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <p className="text-5xl">🔍</p>
            <p className="text-xl font-bold text-zinc-900">No products yet</p>
            <p className="text-zinc-500 text-sm max-w-sm">We&apos;re adding more dupes for this aesthetic. Check back soon!</p>
            <Link
              href="/"
              className="mt-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-semibold hover:bg-brand-700 transition-colors"
            >
              Browse all aesthetics
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
