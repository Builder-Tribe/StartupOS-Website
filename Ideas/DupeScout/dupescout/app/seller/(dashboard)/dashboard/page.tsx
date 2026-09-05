"use client";

import Link from "next/link";
import { TrendingUp, Package, ShoppingCart, Star, Plus, ArrowRight, Clock, CheckCircle, Truck } from "lucide-react";

// Mock data — replace with real API calls
const MOCK_STATS = [
  { label: "This Month Revenue",  value: "₹1,24,580", delta: "+18%", icon: TrendingUp, color: "emerald" },
  { label: "Active Products",     value: "47",         delta: "+3 this week", icon: Package,   color: "blue"    },
  { label: "Pending Orders",      value: "12",         delta: "Action needed", icon: ShoppingCart, color: "amber" },
  { label: "Avg Rating",          value: "4.7",        delta: "94 reviews",  icon: Star,      color: "purple"  },
];

const MOCK_ORDERS = [
  { id: "ORD-8812", product: "Indigo Block Print Kurta (M)", amount: "₹1,299", status: "pending",  time: "2h ago"   },
  { id: "ORD-8811", product: "Ajrakh Dupatta (Blue)",        amount: "₹849",   status: "shipped", time: "5h ago"   },
  { id: "ORD-8808", product: "Hand-dyed Linen Shirt (L)",    amount: "₹2,199", status: "delivered", time: "1d ago" },
  { id: "ORD-8806", product: "Kantha Embroidery Tote",       amount: "₹699",   status: "pending",  time: "2d ago"  },
];

const STATUS_STYLES = {
  pending:   { label: "Action needed", color: "bg-amber-50 text-amber-700",   icon: Clock },
  shipped:   { label: "Shipped",        color: "bg-blue-50 text-blue-700",     icon: Truck },
  delivered: { label: "Delivered",      color: "bg-emerald-50 text-emerald-700", icon: CheckCircle },
} as const;

const STAT_COLORS = {
  emerald: "bg-emerald-50 text-emerald-600",
  blue:    "bg-blue-50 text-blue-600",
  amber:   "bg-amber-50 text-amber-600",
  purple:  "bg-purple-50 text-purple-600",
} as const;

export default function SellerDashboardPage() {
  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500">Thursday, 31 July 2026</p>
        </div>
        <Link
          href="/seller/products/new"
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-brand-500 text-white text-sm font-semibold"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {MOCK_STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-zinc-500">{stat.label}</p>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${STAT_COLORS[stat.color as keyof typeof STAT_COLORS]}`}>
                  <Icon size={14} />
                </div>
              </div>
              <p className="text-xl font-bold text-zinc-900">{stat.value}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{stat.delta}</p>
            </div>
          );
        })}
      </div>

      {/* AI Catalog Creator CTA */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-brand-500 to-emerald-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold opacity-80 mb-1">✨ AI Catalog Creator</p>
            <p className="text-lg font-bold">Turn a photo into a listing in 22 minutes</p>
            <p className="text-xs opacity-80 mt-1">Claude Sonnet 5 generates title, description, tags & price</p>
          </div>
          <Link href="/seller/products/new" className="flex-shrink-0 ml-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <ArrowRight size={18} />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50">
          <h2 className="text-sm font-bold text-zinc-900">Recent Orders</h2>
          <Link href="/seller/orders" className="text-xs text-brand-600 font-medium flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div>
          {MOCK_ORDERS.map((order) => {
            const statusInfo = STATUS_STYLES[order.status as keyof typeof STATUS_STYLES];
            const StatusIcon = statusInfo.icon;
            return (
              <div key={order.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">{order.product}</p>
                  <p className="text-xs text-zinc-400">{order.id} · {order.time}</p>
                </div>
                <p className="text-sm font-semibold text-zinc-900 flex-shrink-0">{order.amount}</p>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusInfo.color}`}>
                  <StatusIcon size={11} />
                  {statusInfo.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
