"use client";

import { TrendingUp, Clock, CheckCircle, AlertCircle, Download, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

const MOCK_STATS = [
  { label: "Pending Payout", value: "₹12,480", note: "Settles on 7 Aug 2026", color: "amber" },
  { label: "This Month",      value: "₹1,24,580", note: "July 2026",           color: "emerald" },
  { label: "All Time",        value: "₹8,34,220", note: "Since Mar 2026",       color: "blue"    },
];

const MOCK_PAYOUTS = [
  { id: "PAY-2026-07", period: "1–15 Jul 2026", amount: 58420, orders: 47, status: "paid",    date: "22 Jul 2026" },
  { id: "PAY-2026-06", period: "16–31 Jun 2026", amount: 41850, orders: 33, status: "paid",   date: "7 Jul 2026"  },
  { id: "PAY-2026-05", period: "1–15 Jun 2026",  amount: 24310, orders: 21, status: "paid",   date: "22 Jun 2026" },
];

const MOCK_DEDUCTIONS = [
  { label: "DupeScout Commission (8%)", amount: -1120 },
  { label: "Shiprocket Shipping",        amount: -240  },
  { label: "Payment Gateway Fee (2%)",   amount: -280  },
];

const STAT_COLORS: Record<string, string> = {
  amber:   "bg-amber-50 border-amber-100 text-amber-700",
  emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
  blue:    "bg-blue-50 border-blue-100 text-blue-700",
};

export default function SellerPayoutsPage() {
  const grossOrder = 14000;
  const totalDeductions = MOCK_DEDUCTIONS.reduce((sum, d) => sum + d.amount, 0);
  const netPayout = grossOrder + totalDeductions;

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-zinc-900">Payouts</h1>
        <button className="flex items-center gap-2 h-9 px-4 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-600">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {MOCK_STATS.map((stat) => (
          <div key={stat.label} className={cn("p-4 rounded-2xl border", STAT_COLORS[stat.color])}>
            <p className="text-xs font-medium opacity-70 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs opacity-60 mt-0.5">{stat.note}</p>
          </div>
        ))}
      </div>

      {/* Next payout breakdown */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 mb-5">
        <h2 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <Clock size={15} className="text-amber-500" /> Upcoming Payout — 7 Aug 2026
        </h2>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Gross order value (10 orders)</span>
            <span className="font-semibold text-zinc-800">₹{grossOrder.toLocaleString()}</span>
          </div>
          {MOCK_DEDUCTIONS.map((d, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-zinc-500">{d.label}</span>
              <span className="text-red-500 font-medium">-₹{Math.abs(d.amount).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 border-t border-zinc-100">
            <span className="text-sm font-bold text-zinc-900">Net Payout</span>
            <span className="text-lg font-bold text-emerald-600">₹{netPayout.toLocaleString()}</span>
          </div>
        </div>
        <p className="text-xs text-zinc-400">Will be transferred to your UPI ID on 7 Aug 2026. T+7 settlement.</p>
      </div>

      {/* UPI bank info */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 mb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <CheckCircle size={18} className="text-emerald-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-zinc-800">Payout to priyatextiles@ybl</p>
          <p className="text-xs text-zinc-400">Verified UPI ID · ₹1 penny drop confirmed</p>
        </div>
        <button className="text-xs text-brand-600 font-medium flex items-center gap-1">Edit <ArrowRight size={12} /></button>
      </div>

      {/* Payout history */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-50">
          <h2 className="text-sm font-bold text-zinc-900">Payout History</h2>
        </div>
        {MOCK_PAYOUTS.map((payout) => (
          <div key={payout.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-50 last:border-0">
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900">{payout.period}</p>
              <p className="text-xs text-zinc-400">{payout.orders} orders · Paid {payout.date}</p>
            </div>
            <p className="text-sm font-bold text-zinc-900">₹{payout.amount.toLocaleString()}</p>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
              <CheckCircle size={10} /> Paid
            </div>
            <button className="text-zinc-300 hover:text-zinc-500">
              <Download size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* GST Invoice link */}
      <div className="mt-4 p-4 rounded-xl border border-zinc-100 bg-white flex items-center gap-3">
        <AlertCircle size={16} className="text-blue-400 flex-shrink-0" />
        <p className="flex-1 text-xs text-zinc-600">Need GST invoices for your records? <span className="text-brand-600 font-medium cursor-pointer">Download GSTR-1 compatible export</span></p>
      </div>
    </div>
  );
}
