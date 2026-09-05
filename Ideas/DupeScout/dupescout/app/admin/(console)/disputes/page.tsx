"use client";

import { useState } from "react";
import { MessageSquare, Clock, CheckCircle, AlertTriangle, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

type DisputeStatus = "open" | "under_review" | "resolved" | "escalated";

const MOCK_DISPUTES = [
  {
    id: "D-118",
    order_id: "ORD-8801",
    type: "not_as_described",
    buyer: "Ananya K.",
    seller: "Urban Desi Collective",
    amount: 3499,
    opened: "29 Jul 2026",
    sla_hours_left: 18,
    status: "escalated" as DisputeStatus,
    ai_recommendation: "Refund recommended — product images show significant difference from listing. Buyer evidence is credible (3 photos). Seller response was delayed >24h.",
    summary: "Buyer says dupatta colour is different from listing photos. Wants full refund.",
  },
  {
    id: "D-117",
    order_id: "ORD-8795",
    type: "not_received",
    buyer: "Meera S.",
    seller: "Craft Bazaar",
    amount: 699,
    opened: "28 Jul 2026",
    sla_hours_left: 40,
    status: "under_review" as DisputeStatus,
    ai_recommendation: "Shiprocket tracking shows 'Out for delivery' since 26 Jul. Request seller to follow up with carrier. If not resolved in 24h, initiate replacement.",
    summary: "Order shipped 6 days ago but not delivered. Buyer last notified 27 Jul.",
  },
  {
    id: "D-116",
    order_id: "ORD-8788",
    type: "quality_issue",
    buyer: "Priya M.",
    seller: "Nila Handloom",
    amount: 1299,
    opened: "26 Jul 2026",
    sla_hours_left: 0,
    status: "resolved" as DisputeStatus,
    ai_recommendation: "Partial refund of ₹400 accepted by both parties.",
    summary: "Minor stitching defect on sleeve. Resolved with partial refund.",
  },
];

const STATUS_META: Record<DisputeStatus, { label: string; color: string; icon: React.ElementType }> = {
  open:          { label: "Open",         color: "bg-zinc-700 text-zinc-300 border-zinc-600",       icon: MessageSquare },
  under_review:  { label: "Under Review", color: "bg-blue-500/10 text-blue-400 border-blue-500/20",   icon: Clock         },
  resolved:      { label: "Resolved",     color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle },
  escalated:     { label: "Escalated",    color: "bg-red-500/10 text-red-400 border-red-500/20",      icon: AlertTriangle },
};

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState(MOCK_DISPUTES);
  const [expanded, setExpanded] = useState<string | null>("D-118");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleResolveDispute = async (id: string, action: "approve_refund" | "reject_claim") => {
    setIsProcessing(true);
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("ds_admin_token") : null;

      await fetch(`${BASE}/api/v1/admin/disputes/${id}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, admin_notes: `Resolved via admin console as ${action}` }),
      });

      setDisputes((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: "resolved" as DisputeStatus } : d))
      );
    } catch (e) {
      setDisputes((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: "resolved" as DisputeStatus } : d))
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-lg font-bold text-zinc-100 mb-1">Disputes & Returns Mediation</h1>
      <p className="text-xs text-zinc-500 mb-6">72-hour SLA. Dupe AI analyses buyer proof vs seller notes and recommends resolution.</p>

      <div className="space-y-3">
        {disputes.map((dispute) => {
          const meta = STATUS_META[dispute.status];
          const StatusIcon = meta.icon;
          const isExpanded = expanded === dispute.id;

          return (
            <div key={dispute.id} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-zinc-800/30"
                onClick={() => setExpanded(isExpanded ? null : dispute.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-zinc-100">{dispute.id}</p>
                    <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border", meta.color)}>
                      <StatusIcon size={9} /> {meta.label}
                    </span>
                    {dispute.sla_hours_left > 0 && dispute.sla_hours_left <= 24 && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-medium border border-red-500/20">
                        ⚡ {dispute.sla_hours_left}h left
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">{dispute.type.replace(/_/g, " ")} · {dispute.buyer} vs {dispute.seller} · ₹{dispute.amount.toLocaleString()}</p>
                </div>
                <span className="text-xs text-zinc-600 flex-shrink-0">{dispute.opened}</span>
                <ChevronDown size={14} className={cn("text-zinc-600 flex-shrink-0 transition-transform", isExpanded ? "rotate-180" : "")} />
              </div>

              {isExpanded && (
                <div className="border-t border-zinc-800 px-4 py-4 space-y-3">
                  <p className="text-xs text-zinc-400">{dispute.summary}</p>

                  {/* AI Recommendation */}
                  <div className="p-3 rounded-lg bg-brand-500/5 border border-brand-500/20">
                    <p className="text-[10px] font-semibold text-brand-400 mb-1 flex items-center gap-1">
                      <Sparkles size={10} /> AI Recommendation
                    </p>
                    <p className="text-xs text-zinc-300">{dispute.ai_recommendation}</p>
                  </div>

                  {dispute.status !== "resolved" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResolveDispute(dispute.id, "approve_refund")}
                        disabled={isProcessing}
                        className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        Approve Buyer Refund
                      </button>
                      <button
                        onClick={() => handleResolveDispute(dispute.id, "reject_claim")}
                        disabled={isProcessing}
                        className="px-3 py-2 rounded-lg bg-red-600/80 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                      >
                        Reject Buyer Claim
                      </button>
                      <button
                        onClick={() => handleResolveDispute(dispute.id, "approve_refund")}
                        disabled={isProcessing}
                        className="px-3 py-2 rounded-lg bg-zinc-700 text-zinc-300 text-xs font-medium hover:bg-zinc-600 transition-colors"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

