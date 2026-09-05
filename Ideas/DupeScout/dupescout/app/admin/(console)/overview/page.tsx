"use client";

import { TrendingUp, ShoppingCart, Store, Users, AlertTriangle, Clock, CheckCircle, XCircle, Zap } from "lucide-react";

const LIVE_STATS = [
  { label: "GMV Today",        value: "₹4,12,850",  delta: "+23% vs yesterday", color: "emerald", icon: TrendingUp  },
  { label: "Orders Today",     value: "312",         delta: "18 pending action", color: "blue",    icon: ShoppingCart },
  { label: "Active Sellers",   value: "847",         delta: "3 pending approval", color: "purple", icon: Store      },
  { label: "Active Users",     value: "6,214",       delta: "Last 24h",          color: "amber",   icon: Users      },
];

const ACTION_QUEUE = [
  { type: "seller_approval", count: 3,  label: "Seller Applications",  color: "text-amber-400",  href: "/admin/sellers?tab=pending"   },
  { type: "catalog_review",  count: 12, label: "Products to Moderate", color: "text-blue-400",   href: "/admin/catalog?tab=queue"     },
  { type: "fraud_alert",     count: 2,  label: "Fraud Alerts",         color: "text-red-400",    href: "/admin/fraud"                 },
  { type: "dispute",         count: 5,  label: "Open Disputes",        color: "text-orange-400", href: "/admin/disputes"              },
];

const RECENT_EVENTS = [
  { time: "09:41",  type: "order",    text: "ORD-8812 placed — ₹1,299",          status: "ok"      },
  { time: "09:38",  type: "fraud",    text: "Risk score 87 flagged — user #4412", status: "warn"    },
  { time: "09:35",  type: "seller",   text: "New seller application — Meera Textiles", status: "pending" },
  { time: "09:28",  type: "catalog",  text: "Product #p491 approved by AI (conf. 94%)", status: "ok"  },
  { time: "09:20",  type: "order",    text: "ORD-8808 delivered — Shiprocket",    status: "ok"      },
  { time: "08:55",  type: "fraud",    text: "Review stuffing detected — seller #S221", status: "critical" },
  { time: "08:41",  type: "dispute",  text: "Dispute #D-118 escalated — ₹3,499", status: "warn"    },
];

const STATUS_DOT = {
  ok:       "bg-emerald-500",
  warn:     "bg-amber-500",
  pending:  "bg-blue-500",
  critical: "bg-red-500",
};

const STAT_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-400",
  blue:    "bg-blue-500/10 text-blue-400",
  purple:  "bg-purple-500/10 text-purple-400",
  amber:   "bg-amber-500/10 text-amber-400",
};

export default function AdminOverviewPage() {
  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-zinc-100">War Room</h1>
          <p className="text-xs text-zinc-500">Live ops · 31 July 2026 · ap-south-1</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-emerald-400 font-medium">
          <Zap size={12} className="fill-emerald-400" /> Live
        </div>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {LIVE_STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500">{stat.label}</p>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${STAT_COLORS[stat.color]}`}>
                  <Icon size={14} />
                </div>
              </div>
              <p className="text-xl font-bold text-zinc-100">{stat.value}</p>
              <p className="text-xs text-zinc-600 mt-0.5">{stat.delta}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Action queue */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" /> Action Required
          </h2>
          <div className="space-y-2">
            {ACTION_QUEUE.map((item) => (
              <a key={item.type} href={item.href} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
                <span className="text-sm text-zinc-300">{item.label}</span>
                <span className={`text-sm font-bold ${item.color}`}>{item.count}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Live event feed */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <Clock size={14} className="text-zinc-400" /> Live Feed
          </h2>
          <div className="space-y-2.5">
            {RECENT_EVENTS.map((ev, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${STATUS_DOT[ev.status as keyof typeof STATUS_DOT]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-300 truncate">{ev.text}</p>
                </div>
                <span className="text-[10px] text-zinc-600 flex-shrink-0">{ev.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
