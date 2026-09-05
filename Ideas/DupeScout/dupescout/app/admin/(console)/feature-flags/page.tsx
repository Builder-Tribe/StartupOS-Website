"use client";

import { useState } from "react";
import { ToggleLeft, ToggleRight, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  rollout_pct: number;
  category: "consumer" | "seller" | "ai" | "infra";
  is_dangerous: boolean;
}

const INITIAL_FLAGS: FeatureFlag[] = [
  { key: "visual_search_v2",        label: "Visual Search v2 (CLIP ViT-L/14)", description: "Upgraded CLIP model with higher accuracy. 40ms latency vs 28ms for v1.",                             enabled: true,  rollout_pct: 100, category: "ai",       is_dangerous: false },
  { key: "conversational_ai",       label: "Conversational AI (Claude Sonnet 5)", description: "8-tool AI assistant for shopping queries. Currently in beta.",                                      enabled: true,  rollout_pct: 20,  category: "ai",       is_dangerous: false },
  { key: "affiliate_results",       label: "Affiliate Results (Amazon/Flipkart)", description: "Show affiliate product links in search results. Revenue share enabled.",                            enabled: false, rollout_pct: 0,   category: "consumer", is_dangerous: false },
  { key: "upi_autopay",             label: "UPI AutoPay for Pro",               description: "Razorpay recurring UPI mandate for Pro subscriptions.",                                               enabled: true,  rollout_pct: 100, category: "consumer", is_dangerous: false },
  { key: "ai_catalog_v2",           label: "AI Catalog Creator v2",             description: "Faster 4-stage pipeline. Reduces 22min flow to ~8min.",                                              enabled: true,  rollout_pct: 100, category: "seller",   is_dangerous: false },
  { key: "seller_analytics_pro",    label: "Seller Analytics Pro",              description: "Advanced analytics with ClickHouse charts for sellers.",                                              enabled: false, rollout_pct: 0,   category: "seller",   is_dangerous: false },
  { key: "es_hybrid_search",        label: "Elasticsearch Hybrid Search",       description: "BM25+semantic hybrid. Falls back to semantic-only if ES is unavailable.",                           enabled: true,  rollout_pct: 100, category: "infra",    is_dangerous: false },
  { key: "pgvector_hnsw",           label: "pgvector HNSW Index",               description: "HNSW index for ANN search (m=16, ef=64). 10x faster than flat scan.",                              enabled: true,  rollout_pct: 100, category: "infra",    is_dangerous: false },
  { key: "disable_organic_ads",     label: "Block Ads in Organic Search",       description: "PERMANENT FLAG — sponsored content must be separated. NEVER disable.",                               enabled: true,  rollout_pct: 100, category: "consumer", is_dangerous: true  },
  { key: "counterfeit_detection",   label: "Counterfeit Detection (AI)",        description: "Claude Sonnet 5 brand logo + counterfeit detection in catalog moderation. NEVER disable.",          enabled: true,  rollout_pct: 100, category: "ai",       is_dangerous: true  },
  { key: "dpdp_data_residency",     label: "DPDP Data Residency (ap-south-1)", description: "Enforces all data stays in AWS ap-south-1. NEVER disable — legal requirement.",                    enabled: true,  rollout_pct: 100, category: "infra",    is_dangerous: true  },
];

const CATEGORY_LABELS: Record<string, string> = {
  consumer: "Consumer",
  seller:   "Seller",
  ai:       "AI / ML",
  infra:    "Infrastructure",
};

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [filterCat, setFilterCat] = useState<"all" | string>("all");

  const toggle = (key: string) => {
    setFlags((prev) =>
      prev.map((f) => {
        if (f.key !== key) return f;
        if (f.is_dangerous && f.enabled) return f; // cannot disable dangerous flags
        return { ...f, enabled: !f.enabled };
      })
    );
    // TODO: PATCH /api/v1/admin/feature-flags/{key} { enabled: !current }
    // TODO: write to admin_audit_log (immutable)
  };

  const filtered = flags.filter((f) => filterCat === "all" || f.category === filterCat);

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-lg font-bold text-zinc-100 mb-2">Feature Flags</h1>
      <p className="text-xs text-zinc-500 mb-6">All changes are logged to the immutable audit log.</p>

      {/* Category filter */}
      <div className="flex gap-2 mb-5">
        {["all", "consumer", "seller", "ai", "infra"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={cn(
              "h-7 px-3 rounded-full text-xs font-medium transition-colors",
              filterCat === cat ? "bg-zinc-200 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            {cat === "all" ? "All" : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Warning banner */}
      {filtered.some((f) => f.is_dangerous) && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-900/20 border border-red-800/50">
          <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">
            Flags marked <span className="font-semibold">Permanent</span> cannot be disabled. They protect core product contracts (no ads in organic search, data residency, counterfeit detection).
          </p>
        </div>
      )}

      {/* Flag list */}
      <div className="space-y-2">
        {filtered.map((flag) => (
          <div key={flag.key} className={cn(
            "bg-zinc-900 rounded-xl border overflow-hidden",
            flag.is_dangerous ? "border-red-800/50" : "border-zinc-800"
          )}>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-zinc-100">{flag.label}</p>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                    flag.category === "ai"       ? "bg-purple-900/40 text-purple-400" :
                    flag.category === "seller"   ? "bg-blue-900/40 text-blue-400"     :
                    flag.category === "infra"    ? "bg-zinc-800 text-zinc-400"        :
                                                   "bg-emerald-900/40 text-emerald-400"
                  )}>
                    {CATEGORY_LABELS[flag.category]}
                  </span>
                  {flag.is_dangerous && (
                    <span className="text-[10px] bg-red-900/40 text-red-400 px-1.5 py-0.5 rounded-full font-medium">Permanent</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5 truncate">{flag.description}</p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {flag.rollout_pct < 100 && flag.enabled && (
                  <span className="text-xs text-amber-400 font-mono">{flag.rollout_pct}%</span>
                )}
                <button
                  onClick={() => toggle(flag.key)}
                  disabled={flag.is_dangerous && flag.enabled}
                  className={cn("transition-colors", flag.is_dangerous && flag.enabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer")}
                >
                  {flag.enabled
                    ? <ToggleRight size={28} className="text-brand-500" />
                    : <ToggleLeft size={28} className="text-zinc-600" />
                  }
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
