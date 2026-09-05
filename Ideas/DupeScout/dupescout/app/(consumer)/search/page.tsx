"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/search/SearchBar";
import { ProductCard } from "@/components/search/ProductCard";
import { SimilarityScore } from "@/components/search/SimilarityScore";
import { AIExplanationCard } from "@/components/search/AIExplanationCard";
import { Badge } from "@/components/ui/badge";
import { MOCK_SEARCH_RESULT } from "@/lib/mock-data";
import type { VisualSearchResult, SearchFilters } from "@/lib/types";
import Image from "next/image";
import {
  SlidersHorizontal, Zap, CheckCircle, ArrowUpDown,
  ChevronDown, ChevronUp, X,
} from "lucide-react";
import { cn } from "@/lib/cn";

type SortOption = "best_match" | "lowest_price" | "best_reviewed" | "trending";

const SORT_LABELS: Record<SortOption, string> = {
  best_match:    "Best match",
  lowest_price:  "Lowest price",
  best_reviewed: "Best reviewed",
  trending:      "Trending",
};

const AESTHETICS = ["artisan-craft", "indie-boho", "quiet-luxury", "cottagecore", "festive-ethnic", "slow-fashion"];
const CATEGORIES  = ["Sarees", "Kurtas", "Jewellery", "Bags", "Footwear", "Home Decor"];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q   = searchParams.get("q");
  const url = searchParams.get("url");
  const img = searchParams.get("img");

  const [result,      setResult]      = useState<VisualSearchResult | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [sort,        setSort]        = useState<SortOption>("best_match");
  const [filters,     setFilters]     = useState<SearchFilters>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const runSearch = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    // Always set results: when no query params, show default recommendations
    setResult(MOCK_SEARCH_RESULT);
    setLoading(false);
  // q/url/img deps intentionally kept: search re-runs when params change (real API wiring)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, url, img]);

  useEffect(() => { runSearch(); }, [runSearch]);

  return (
    <div className="min-h-screen bg-zinc-50">

      {/* ── Search bar (sticky, full-width on this page) ────────────────────── */}
      <div className="sticky top-16 z-30 bg-white border-b border-zinc-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <SearchBar />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* ── Desktop sidebar filters ────────────────────────────────────── */}
          <aside className="hidden lg:block w-56 shrink-0">
            <FilterSidebar filters={filters} setFilters={setFilters} />
          </aside>

          {/* ── Main results ───────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Sort + mobile filter bar */}
            <div className="flex items-center gap-2 mb-5">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-xs font-medium text-zinc-700 hover:border-zinc-300 shrink-0"
              >
                <SlidersHorizontal size={13} />
                Filter
              </button>
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide flex-1">
                <div className="hidden sm:flex items-center gap-1 text-xs text-zinc-500 shrink-0">
                  <ArrowUpDown size={12} />
                  Sort:
                </div>
                {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSort(opt)}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0",
                      sort === opt
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                    )}
                  >
                    {SORT_LABELS[opt]}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <SearchLoadingState />
            ) : result ? (
              <SearchResults result={result} sort={sort} />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl p-5 lg:hidden max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-zinc-900">Filters</p>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} className="text-zinc-500" />
              </button>
            </div>
            <FilterSidebar filters={filters} setFilters={setFilters} />
            <button
              onClick={() => setSidebarOpen(false)}
              className="mt-5 w-full h-11 rounded-xl bg-zinc-900 text-white font-semibold text-sm"
            >
              Apply Filters
            </button>
          </div>
        </>
      )}

      <div className="h-16 md:h-4" />
    </div>
  );
}

// ── Filter Sidebar ─────────────────────────────────────────────────────────────

function FilterSidebar({ filters, setFilters }: { filters: SearchFilters; setFilters: (f: SearchFilters) => void }) {
  const [priceExpanded,    setPriceExpanded]    = useState(true);
  const [categoryExpanded, setCategoryExpanded] = useState(true);
  const [aestheticExpanded, setAestheticExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-zinc-900">Filters</p>

      {/* Local only */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.local_only ?? false}
          onChange={(e) => setFilters({ ...filters, local_only: e.target.checked })}
          className="w-4 h-4 accent-brand-500 rounded"
        />
        <span className="text-sm text-zinc-700 font-medium">Local sellers only</span>
      </label>

      {/* Price range */}
      <FilterGroup title="Price Range" expanded={priceExpanded} onToggle={() => setPriceExpanded((v) => !v)}>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[
            { label: "Under ₹500",   min: 0,    max: 500  },
            { label: "₹500–₹2K",     min: 500,  max: 2000 },
            { label: "₹2K–₹5K",      min: 2000, max: 5000 },
            { label: "₹5K+",         min: 5000, max: undefined },
          ].map((range) => (
            <button
              key={range.label}
              onClick={() => setFilters({ ...filters, price_min: range.min, price_max: range.max })}
              className={cn(
                "text-xs px-2.5 py-1.5 rounded-lg border transition-colors text-left",
                filters.price_min === range.min && filters.price_max === range.max
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Category */}
      <FilterGroup title="Category" expanded={categoryExpanded} onToggle={() => setCategoryExpanded((v) => !v)}>
        <div className="space-y-1.5 mt-2">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 accent-brand-500" />
              <span className="text-sm text-zinc-600">{cat}</span>
            </label>
          ))}
        </div>
      </FilterGroup>

      {/* Aesthetic */}
      <FilterGroup title="Aesthetic" expanded={aestheticExpanded} onToggle={() => setAestheticExpanded((v) => !v)}>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {AESTHETICS.map((code) => (
            <button
              key={code}
              className="text-xs px-2.5 py-1 rounded-full border border-zinc-200 text-zinc-600 hover:border-brand-300 hover:text-brand-600 capitalize"
            >
              {code.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      </FilterGroup>

      {Object.keys(filters).length > 0 && (
        <button
          onClick={() => setFilters({})}
          className="text-xs text-red-500 font-medium hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

function FilterGroup({
  title, expanded, onToggle, children,
}: {
  title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-t border-zinc-100 pt-3">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-sm font-semibold text-zinc-700"
      >
        {title}
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {expanded && children}
    </div>
  );
}

// ── Loading state ──────────────────────────────────────────────────────────────

function SearchLoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Zap size={14} className="text-brand-500 animate-pulse" />
        <p className="text-sm text-zinc-500 animate-pulse">AI is analysing your search…</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="card overflow-hidden">
            <div className="skeleton aspect-[3/4]" />
            <div className="p-3 space-y-2">
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
              <div className="skeleton h-4 w-1/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-24">
      <p className="text-5xl mb-4">🔍</p>
      <p className="font-semibold text-zinc-900 text-lg">No results found</p>
      <p className="text-sm text-zinc-500 mt-2">Try a different image or describe what you&apos;re looking for.</p>
    </div>
  );
}

// ── Full results ───────────────────────────────────────────────────────────────

function SearchResults({ result, sort }: { result: VisualSearchResult; sort: SortOption }) {
  const { identified_product, results, search_time_ms } = result;

  return (
    <div className="space-y-8">
      {identified_product && (
        <IdentifiedProductBanner product={identified_product} timeMs={search_time_ms} />
      )}

      {results.original.length > 0 && (
        <ResultSection
          title="Original / Identified"
          badge={{ label: "Source", variant: "info" }}
          description="This is what the AI identified in your image"
          full
        >
          {results.original.map((p) => (
            <ProductCard key={p.id} product={p} showAIExplanation className="col-span-2 sm:col-span-1" />
          ))}
        </ResultSection>
      )}

      {results.smart_value.length > 0 && (
        <ResultSection
          title="Smart Value Picks"
          badge={{ label: "Best deals", variant: "brand" }}
          description="High similarity · Lower price"
        >
          {results.smart_value.map((p) => (
            <ProductCard key={p.id} product={p} showAIExplanation />
          ))}
        </ResultSection>
      )}

      {results.similar.length > 0 && (
        <ResultSection
          title="Similar Products"
          badge={{ label: "60–79% match", variant: "muted" }}
          description="Broader matches worth considering"
        >
          {results.similar.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </ResultSection>
      )}

      <p className="text-center text-xs text-zinc-400 pb-4">
        {result.total_results} results · found in {(search_time_ms / 1000).toFixed(1)}s
      </p>
    </div>
  );
}

function IdentifiedProductBanner({
  product,
  timeMs,
}: {
  product: NonNullable<VisualSearchResult["identified_product"]>;
  timeMs: number;
}) {
  return (
    <div className="card p-4 sm:p-5 flex items-start gap-4">
      <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-zinc-100 shrink-0 flex items-center justify-center text-2xl">
        🔍
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle size={14} className="text-brand-500" />
          <span className="text-xs font-semibold text-brand-600">AI Identified</span>
          <span className="text-xs text-zinc-400">· {(timeMs / 1000).toFixed(1)}s</span>
        </div>
        <p className="font-semibold text-zinc-900">{product.name}</p>
        <p className="text-xs text-zinc-500 capitalize mt-0.5">{product.category.replace("_", " ")}</p>
        {product.estimated_price && (
          <p className="text-sm text-zinc-500 mt-1">
            Est. original price:{" "}
            <span className="font-semibold text-zinc-700">₹{product.estimated_price.toLocaleString("en-IN")}</span>
          </p>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          {Object.entries(product.detected_attributes).map(([k, v]) => (
            <Badge key={k} variant="muted">{v}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultSection({
  title, badge, description, children, full = false,
}: {
  title: string;
  badge?: { label: string; variant: "brand" | "info" | "muted" };
  description?: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-1.5">
        <h2 className="text-base font-bold text-zinc-900">{title}</h2>
        {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
      </div>
      {description && <p className="text-xs text-zinc-500 mb-4">{description}</p>}
      <div className={cn(
        "grid gap-4",
        full
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      )}>
        {children}
      </div>
    </section>
  );
}
