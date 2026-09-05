"use client";

import { TrendingUp, TrendingDown, IndianRupee, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

const MONTHLY_REVENUE = [
  { month: "Feb", gmv: 420000,  commission: 33600,  net: 28400  },
  { month: "Mar", gmv: 680000,  commission: 54400,  net: 45800  },
  { month: "Apr", gmv: 920000,  commission: 73600,  net: 61900  },
  { month: "May", gmv: 1240000, commission: 99200,  net: 83400  },
  { month: "Jun", gmv: 1820000, commission: 145600, net: 122500 },
  { month: "Jul", gmv: 2340000, commission: 187200, net: 157400 },
];

const PAYOUTS_DUE = [
  { seller: "Pochampally Weaves", amount: 48200, due_date: "7 Aug", status: "scheduled"  },
  { seller: "Priya Textiles",     amount: 12480, due_date: "7 Aug", status: "scheduled"  },
  { seller: "Dokra Craft Studio", amount: 8940,  due_date: "7 Aug", status: "scheduled"  },
  { seller: "Ajrakh Artisans",    amount: 31200, due_date: "7 Aug", status: "processing" },
];

const PENDING_REFUNDS = [
  { order: "ORD-8812", buyer: "Ananya Kumar", amount: 1299, days_pending: 2 },
  { order: "ORD-8204", buyer: "Rohan Mehta",  amount: 2499, days_pending: 5 },
];

const current = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1];
const prev    = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 2];
const gmvGrowth = ((current.gmv - prev.gmv) / prev.gmv * 100).toFixed(1);

const maxGmv = Math.max(...MONTHLY_REVENUE.map((m) => m.gmv));

export default function AdminFinancePage() {
  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-lg font-bold text-zinc-100 mb-6">Finance Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "GMV — Jul",        value: `₹${(current.gmv / 100000).toFixed(1)}L`,      growth: `+${gmvGrowth}%`, positive: true  },
          { label: "Commission — Jul", value: `₹${(current.commission / 1000).toFixed(0)}K`,  growth: "+28.5%",         positive: true  },
          { label: "Pending Payouts",  value: `₹${(100820 / 1000).toFixed(0)}K`,              growth: "4 sellers",      positive: null  },
          { label: "Refunds Pending",  value: `₹${(3798 / 1000).toFixed(1)}K`,                growth: "2 orders",       positive: false },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">{kpi.label}</p>
            <p className="text-xl font-bold text-zinc-100">{kpi.value}</p>
            <p className={cn("text-xs mt-1 font-medium",
              kpi.positive === true ? "text-emerald-400" :
              kpi.positive === false ? "text-red-400" : "text-zinc-400"
            )}>
              {kpi.growth}
            </p>
          </div>
        ))}
      </div>

      {/* GMV Bar Chart */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 mb-5">
        <h2 className="text-sm font-bold text-zinc-200 mb-4">GMV — Last 6 Months</h2>
        <div className="flex items-end gap-3 h-32">
          {MONTHLY_REVENUE.map((m, i) => {
            const barH = Math.round((m.gmv / maxGmv) * 100);
            const isLast = i === MONTHLY_REVENUE.length - 1;
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="relative w-full flex items-end" style={{ height: "100px" }}>
                  <div
                    className={cn("w-full rounded-t-md transition-all", isLast ? "bg-brand-500" : "bg-zinc-700")}
                    style={{ height: `${barH}%` }}
                  />
                </div>
                <span className={cn("text-[10px]", isLast ? "text-zinc-200 font-semibold" : "text-zinc-500")}>{m.month}</span>
                {isLast && <span className="text-[9px] text-brand-400">₹{(m.gmv / 100000).toFixed(1)}L</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Upcoming payouts */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-200">Upcoming Payouts</h2>
            <span className="text-xs text-zinc-500">7 Aug 2026</span>
          </div>
          {PAYOUTS_DUE.map((p) => (
            <div key={p.seller} className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50 last:border-0">
              <div className="flex-1">
                <p className="text-sm text-zinc-200">{p.seller}</p>
                <p className="text-xs text-zinc-500">Due {p.due_date}</p>
              </div>
              <p className="text-sm font-bold text-zinc-100">₹{p.amount.toLocaleString()}</p>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                p.status === "processing" ? "bg-amber-900/30 text-amber-400" : "bg-emerald-900/30 text-emerald-400"
              )}>
                {p.status}
              </span>
            </div>
          ))}
        </div>

        {/* Pending refunds */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-200">Pending Refunds</h2>
            <span className="text-xs text-red-400">{PENDING_REFUNDS.length} open</span>
          </div>
          {PENDING_REFUNDS.map((r) => (
            <div key={r.order} className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50 last:border-0">
              <div className="flex-1">
                <p className="text-xs font-mono text-zinc-300">{r.order}</p>
                <p className="text-xs text-zinc-500">{r.buyer} · {r.days_pending}d pending</p>
              </div>
              <p className="text-sm font-bold text-zinc-100">₹{r.amount.toLocaleString()}</p>
              <button className="h-7 px-2.5 rounded-lg bg-red-900/40 text-red-400 text-xs font-medium hover:bg-red-900/60">
                Process
              </button>
            </div>
          ))}
          {PENDING_REFUNDS.length === 0 && (
            <p className="px-4 py-6 text-xs text-zinc-500 text-center">No pending refunds</p>
          )}
        </div>
      </div>

      {/* Commission breakdown */}
      <div className="mt-4 bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
        <h2 className="text-sm font-bold text-zinc-200 mb-3">Revenue Breakdown — July 2026</h2>
        <div className="space-y-3">
          {[
            { label: "Platform Commission (8%)", amount: current.commission,               pct: 100  },
            { label: "Payment Gateway Fees (-2%)", amount: -current.gmv * 0.02,             pct: -25  },
            { label: "Logistics Subsidy",          amount: -current.gmv * 0.005,            pct: -6.2 },
            { label: "Net Revenue",                amount: current.net,                     pct: 84   },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="flex-1 text-xs text-zinc-400">{row.label}</span>
              <span className={cn("text-sm font-semibold", row.amount < 0 ? "text-red-400" : i === 3 ? "text-emerald-400" : "text-zinc-200")}>
                {row.amount < 0 ? "-" : ""}₹{Math.abs(row.amount / 1000).toFixed(0)}K
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
