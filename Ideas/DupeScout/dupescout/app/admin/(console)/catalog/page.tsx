"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Sparkles, Tag } from "lucide-react";
import { cn } from "@/lib/cn";

type ReviewStatus = "pending" | "approved" | "rejected";

const MOCK_ITEMS = [
  { id: "P-491", title: "Hand-block Ajrakh Kurta", seller: "Priya Textiles", category: "Fashion", ai_conf: 94, ai_verdict: "auto_approve", flags: [], status: "pending" as ReviewStatus },
  { id: "P-490", title: "Vintage Denim Jacket", seller: "Urban Desi", category: "Fashion", ai_conf: 72, ai_verdict: "human_review", flags: ["brand_logo_detected", "low_confidence"], status: "pending" as ReviewStatus },
  { id: "P-489", title: "Terracotta Chai Set", seller: "Craft Bazaar", category: "Home", ai_conf: 89, ai_verdict: "auto_approve", flags: [], status: "pending" as ReviewStatus },
  { id: "P-488", title: "Natural Face Serum", seller: "Glow Studio", category: "Beauty", ai_conf: 61, ai_verdict: "human_review", flags: ["claims_require_review", "ingredient_list_missing"], status: "pending" as ReviewStatus },
  { id: "P-487", title: "Replica Gucci Bag", seller: "Fake Reviews Shop", category: "Fashion", ai_conf: 97, ai_verdict: "reject", flags: ["counterfeit_detected", "brand_impersonation"], status: "pending" as ReviewStatus },
];

const VERDICT_STYLES = {
  auto_approve: { label: "AI: Auto-approve",   color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  human_review: { label: "AI: Human review",   color: "bg-amber-500/10 text-amber-400 border-amber-500/20"   },
  reject:       { label: "AI: Reject",          color: "bg-red-500/10 text-red-400 border-red-500/20"           },
};

export default function AdminCatalogPage() {
  const [items, setItems] = useState(MOCK_ITEMS);
  const [filter, setFilter] = useState("pending");

  const updateStatus = (id: string, status: ReviewStatus) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, status } : item));
  };

  const filtered = items.filter((item) => filter === "all" || item.status === filter);

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-lg font-bold text-zinc-100 mb-1">Catalog Moderation</h1>
      <p className="text-xs text-zinc-500 mb-6">Products auto-approved by AI at ≥92% confidence. Below that, human review required.</p>

      <div className="flex gap-2 mb-5">
        {["pending", "approved", "rejected", "all"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors", filter === f ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300")}
          >
            {f}
            {f === "pending" && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold">{items.filter((i) => i.status === "pending").length}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((item) => {
          const verdict = VERDICT_STYLES[item.ai_verdict as keyof typeof VERDICT_STYLES];
          return (
            <div key={item.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${verdict.color}`}>
                      <Sparkles size={8} /> {verdict.label}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{item.id} · {item.seller} · {item.category}</p>
                  {item.flags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.flags.map((flag) => (
                        <span key={flag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-medium border border-red-500/20">
                          <AlertTriangle size={8} /> {flag.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-zinc-500 mb-1">AI Conf.</p>
                  <p className={cn("text-sm font-bold", item.ai_conf >= 92 ? "text-emerald-400" : item.ai_conf >= 70 ? "text-amber-400" : "text-red-400")}>{item.ai_conf}%</p>
                </div>
              </div>

              {item.status === "pending" && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800">
                  <button onClick={() => updateStatus(item.id, "approved")} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600/80 text-white text-xs font-semibold">
                    <CheckCircle size={12} /> Approve
                  </button>
                  <button onClick={() => updateStatus(item.id, "rejected")} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600/80 text-white text-xs font-semibold">
                    <XCircle size={12} /> Reject
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-700 text-zinc-300 text-xs font-medium">
                    <Tag size={12} /> View Listing
                  </button>
                </div>
              )}

              {item.status !== "pending" && (
                <div className="mt-2 pt-2 border-t border-zinc-800">
                  <span className={cn("text-xs font-medium", item.status === "approved" ? "text-emerald-400" : "text-red-400")}>
                    {item.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
