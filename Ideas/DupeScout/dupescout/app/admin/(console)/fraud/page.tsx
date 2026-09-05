"use client";

import { useState } from "react";
import { AlertTriangle, Shield, Ban, Eye, TrendingUp, User, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/cn";

const MOCK_ALERTS = [
  {
    id: "F-042",
    type: "review_stuffing",
    severity: "critical",
    entity: "Seller #S-221 — Fake Reviews Shop",
    detail: "47 reviews from 3 IP addresses in 2 hours. Same device fingerprint.",
    risk_score: 97,
    signals: ["ip_cluster", "time_cluster", "device_fingerprint"],
    time: "08:55",
    resolved: false,
  },
  {
    id: "F-041",
    type: "high_risk_user",
    severity: "high",
    entity: "User #4412 — +91 44444 44444",
    detail: "5 orders in 15 minutes across 3 sellers. Different delivery addresses. Possible card testing.",
    risk_score: 87,
    signals: ["order_velocity", "address_diversity", "payment_decline_history"],
    time: "09:38",
    resolved: false,
  },
  {
    id: "F-040",
    type: "counterfeit",
    severity: "high",
    entity: "Product #P-487 — 'Replica Gucci Bag'",
    detail: "Brand logo detected in product images. Title contains brand name. Listing flagged by AI counterfeit detector.",
    risk_score: 99,
    signals: ["brand_logo_detected", "brand_name_in_title"],
    time: "Yesterday 22:10",
    resolved: true,
  },
];

const SEVERITY_STYLES = {
  critical: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", dot: "bg-red-500" },
  high:     { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", dot: "bg-amber-500" },
  medium:   { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", dot: "bg-yellow-500" },
};

const TYPE_META = {
  review_stuffing: { icon: Star,          label: "Review Stuffing"    },
  high_risk_user:  { icon: User,          label: "High Risk User"     },
  counterfeit:     { icon: Shield,        label: "Counterfeit"        },
  order_fraud:     { icon: ShoppingCart,  label: "Order Fraud"        },
};

export default function AdminFraudPage() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);

  const resolve = (id: string) => setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, resolved: true } : a));

  const unresolved = alerts.filter((a) => !a.resolved);
  const resolved   = alerts.filter((a) => a.resolved);

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-lg font-bold text-zinc-100">Fraud Detection</h1>
        {unresolved.length > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
            {unresolved.length} active
          </span>
        )}
      </div>

      {/* Active alerts */}
      {unresolved.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Active Alerts</p>
          <div className="space-y-3">
            {unresolved.map((alert) => {
              const sev = SEVERITY_STYLES[alert.severity as keyof typeof SEVERITY_STYLES];
              const type = TYPE_META[alert.type as keyof typeof TYPE_META] ?? { icon: AlertTriangle, label: alert.type };
              const TypeIcon = type.icon;
              return (
                <div key={alert.id} className={cn("rounded-xl border p-4", sev.bg, sev.border)}>
                  <div className="flex items-start gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", sev.bg, "border", sev.border)}>
                      <TypeIcon size={16} className={sev.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={cn("text-xs font-bold uppercase tracking-wide", sev.text)}>{type.label}</p>
                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold text-white", sev.dot === "bg-red-500" ? "bg-red-500" : "bg-amber-500")}>
                          Risk {alert.risk_score}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-zinc-200 mb-1">{alert.entity}</p>
                      <p className="text-xs text-zinc-400">{alert.detail}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {alert.signals.map((sig) => (
                          <span key={sig} className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-medium border border-zinc-700">
                            {sig.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-600 flex-shrink-0">{alert.time}</span>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800/50">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-300 text-xs font-medium border border-zinc-700">
                      <Eye size={11} /> Investigate
                    </button>
                    <button onClick={() => resolve(alert.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-300 text-xs font-medium">
                      <TrendingUp size={11} /> Resolve
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/80 text-white text-xs font-semibold ml-auto">
                      <Ban size={11} /> Take Action
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-3">Resolved</p>
          <div className="space-y-2">
            {resolved.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 opacity-60">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span className="text-xs text-zinc-500">{alert.id}</span>
                <span className="flex-1 text-xs text-zinc-400 truncate">{alert.entity}</span>
                <span className="text-[10px] text-emerald-600">Resolved</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
