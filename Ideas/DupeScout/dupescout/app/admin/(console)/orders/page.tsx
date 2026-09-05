"use client";

import { useState } from "react";
import { Package, Truck, AlertCircle, CheckCircle, Search, ChevronDown, Clock } from "lucide-react";
import { cn } from "@/lib/cn";

type OrderStatus = "placed" | "packed" | "shipped" | "delivered" | "cancelled" | "disputed";

interface AdminOrder {
  id: string;
  buyer: string;
  seller: string;
  amount: number;
  status: OrderStatus;
  placed_at: string;
  items_count: number;
  payment_method: string;
  awb?: string;
  flag?: "fraud_risk" | "high_value" | "late";
}

const MOCK_ORDERS: AdminOrder[] = [
  { id: "ORD-9042", buyer: "Priya Sharma", seller: "Pochampally Weaves", amount: 8200, status: "shipped",   placed_at: "31 Jul 15:32", items_count: 2, payment_method: "UPI", awb: "SR-AWB-998877", flag: "high_value" },
  { id: "ORD-9040", buyer: "Rohan Mehta",  seller: "Priya Textiles",      amount: 1299, status: "placed",    placed_at: "31 Jul 14:10", items_count: 1, payment_method: "COD",                                            },
  { id: "ORD-9038", buyer: "Anika Patel",  seller: "Dokra Craft Studio",  amount: 2499, status: "disputed",  placed_at: "30 Jul 10:05", items_count: 3, payment_method: "Card",               flag: "fraud_risk"           },
  { id: "ORD-9030", buyer: "Vikram Singh", seller: "Ajrakh Artisans",     amount: 3850, status: "delivered", placed_at: "28 Jul 09:20", items_count: 1, payment_method: "UPI"                                             },
  { id: "ORD-9012", buyer: "Meera Iyer",   seller: "Pochampally Weaves",  amount: 650,  status: "cancelled", placed_at: "25 Jul 18:45", items_count: 1, payment_method: "COD",                flag: "late"                 },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  placed:    { label: "Placed",    color: "text-blue-400 bg-blue-900/30"   },
  packed:    { label: "Packed",    color: "text-amber-400 bg-amber-900/30" },
  shipped:   { label: "Shipped",   color: "text-indigo-400 bg-indigo-900/30" },
  delivered: { label: "Delivered", color: "text-emerald-400 bg-emerald-900/30" },
  cancelled: { label: "Cancelled", color: "text-zinc-400 bg-zinc-800"      },
  disputed:  { label: "Disputed",  color: "text-red-400 bg-red-900/30"     },
};

const FLAG_LABELS: Record<string, string> = {
  fraud_risk: "⚠ Fraud Risk",
  high_value: "💎 High Value",
  late: "🕐 Late",
};

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  const filtered = MOCK_ORDERS.filter((o) => {
    const matchSearch = !search || o.id.includes(search) || o.buyer.toLowerCase().includes(search.toLowerCase()) || o.seller.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    active:   MOCK_ORDERS.filter((o) => ["placed", "packed", "shipped"].includes(o.status)).length,
    disputed: MOCK_ORDERS.filter((o) => o.status === "disputed").length,
    cod:      MOCK_ORDERS.filter((o) => o.payment_method === "COD").length,
  };

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold text-zinc-100 mb-6">Order Monitoring</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Active",    value: stats.active,   color: "text-emerald-400" },
          { label: "Disputed",  value: stats.disputed, color: "text-red-400"     },
          { label: "COD Pending", value: stats.cod,    color: "text-amber-400"   },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-zinc-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 h-9">
          <Search size={14} className="text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order ID, buyer, or seller…"
            className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-600 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 outline-none"
        >
          <option value="all">All statuses</option>
          {Object.keys(STATUS_CONFIG).map((s) => (
            <option key={s} value={s}>{STATUS_CONFIG[s as OrderStatus].label}</option>
          ))}
        </select>
      </div>

      {/* Orders table */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-zinc-500 font-medium">Order</th>
              <th className="px-4 py-3 text-left text-zinc-500 font-medium">Buyer / Seller</th>
              <th className="px-4 py-3 text-left text-zinc-500 font-medium">Amount</th>
              <th className="px-4 py-3 text-left text-zinc-500 font-medium">Status</th>
              <th className="px-4 py-3 text-left text-zinc-500 font-medium">Flags</th>
              <th className="px-4 py-3 text-left text-zinc-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const cfg = STATUS_CONFIG[order.status];
              return (
                <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-4 py-3">
                    <p className="font-mono font-semibold text-zinc-200">{order.id}</p>
                    <p className="text-zinc-500">{order.placed_at}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-zinc-200">{order.buyer}</p>
                    <p className="text-zinc-500">{order.seller}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-zinc-100">₹{order.amount.toLocaleString()}</p>
                    <p className="text-zinc-500">{order.payment_method}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", cfg.color)}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {order.flag && (
                      <span className="text-xs text-zinc-400">{FLAG_LABELS[order.flag]}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-[10px] font-medium">
                        View
                      </button>
                      {order.status === "disputed" && (
                        <button className="px-2 py-1 rounded-lg bg-red-900/40 text-red-400 hover:bg-red-900/60 text-[10px] font-medium">
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
