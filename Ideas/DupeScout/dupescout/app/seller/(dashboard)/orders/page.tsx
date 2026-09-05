"use client";

import { useState } from "react";
import { Search, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useOrders } from "@/lib/store";

const STATIC_ORDERS = [
  {
    id: "ORD-8813",
    product: "Chanderi Silk Saree (Green)",
    buyer: "Aarti S.",
    amount: 3499,
    status: "return_requested",
    placed: "01 Aug 2026 14:10",
    city: "Ahmedabad",
    return_reason: "Quality & weaving variation mismatch",
    buyer_notes: "Fabric density is different from photos shown on listing.",
    photo_proof: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=300&q=80",
  },
  { id: "ORD-8812", product: "Indigo Block Print Kurta (M)",   buyer: "Priya M.", amount: 1299, status: "pending",    placed: "31 Jul 2026 09:41", city: "Mumbai"    },
  { id: "ORD-8811", product: "Ajrakh Dupatta (Blue)",           buyer: "Sneha R.",  amount: 849,  status: "shipped",   placed: "31 Jul 2026 06:22", city: "Bengaluru" },
  { id: "ORD-8810", product: "Hand-dyed Linen Shirt (L)",       buyer: "Ananya K.", amount: 2199, status: "delivered", placed: "30 Jul 2026 15:55", city: "Delhi"     },
  { id: "ORD-8809", product: "Kantha Embroidery Tote",          buyer: "Meera S.",  amount: 699,  status: "pending",   placed: "30 Jul 2026 11:10", city: "Pune"      },
  { id: "ORD-8807", product: "Terracotta Chai Mug Set",         buyer: "Riya T.",   amount: 799,  status: "cancelled", placed: "29 Jul 2026 18:30", city: "Jaipur"   },
];

const STATUS_META = {
  pending:          { label: "Pending",          color: "bg-amber-50 text-amber-700",          icon: Clock,        action: "Mark Packed" },
  packed:           { label: "Packed",           color: "bg-blue-50 text-blue-700",            icon: Package,      action: "Generate Label" },
  shipped:          { label: "Shipped",          color: "bg-indigo-50 text-indigo-700",        icon: Truck,        action: "Track" },
  delivered:        { label: "Delivered",        color: "bg-emerald-50 text-emerald-700",       icon: CheckCircle, action: null },
  cancelled:        { label: "Cancelled",        color: "bg-red-50 text-red-500",              icon: XCircle,      action: null },
  confirmed:        { label: "New Order",        color: "bg-brand-50 text-brand-700",          icon: Clock,        action: "Mark Packed" },
  return_requested: { label: "Return Requested", color: "bg-amber-100 text-amber-900 font-bold border border-amber-300", icon: Clock, action: "Review Return" },
  return_approved:  { label: "Return Approved",  color: "bg-emerald-100 text-emerald-900 font-bold", icon: CheckCircle, action: null },
  dispute_escalated:{ label: "Escalated to Admin", color: "bg-red-100 text-red-900 font-bold", icon: XCircle, action: null },
} as const;

type OrderStatus = keyof typeof STATUS_META;

const FILTERS: { key: string; label: string }[] = [
  { key: "all",              label: "All" },
  { key: "return_requested", label: "Returns & Disputes" },
  { key: "pending",          label: "Pending" },
  { key: "confirmed",        label: "New" },
  { key: "shipped",          label: "Shipped" },
  { key: "delivered",        label: "Delivered" },
];

export default function SellerOrdersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<any>(null);
  const [sellerNotes, setSellerNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ordersList, setOrdersList] = useState(STATIC_ORDERS);
  const { orders: placedOrders } = useOrders();

  // Convert PlacedOrders to the seller order format
  const realOrders = placedOrders.flatMap((o) =>
    o.items.map((item, i) => ({
      id:      i === 0 ? o.id : `${o.id}-${i + 1}`,
      product: item.product.title + (item.variant?.size ? ` (${item.variant.size})` : ""),
      buyer:   o.address.name,
      amount:  (item.variant?.price ?? item.product.price) * item.quantity,
      status:  "confirmed" as OrderStatus,
      placed:  o.placed_at,
      city:    o.address.city,
    }))
  );

  const allOrders = [...realOrders, ...ordersList];

  const filtered = allOrders.filter((o) => {
    const matchFilter = filter === "all" || o.status === filter;
    const matchSearch = o.product.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search);
    return matchFilter && matchSearch;
  });

  const handleRespondToReturn = async (action: "approve" | "escalate") => {
    if (!selectedReturnOrder) return;
    setIsProcessing(true);
    const orderId = selectedReturnOrder.id;

    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("ds_seller_token") : null;

      await fetch(`${BASE}/api/v1/seller/orders/${orderId}/return/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, seller_notes: sellerNotes }),
      });

      const newStatus = action === "approve" ? "return_approved" : "dispute_escalated";
      setOrdersList((prev) =>
        prev.map((item) => (item.id === orderId ? { ...item, status: newStatus } : item))
      );
      setSelectedReturnOrder(null);
    } catch (e) {
      const newStatus = action === "approve" ? "return_approved" : "dispute_escalated";
      setOrdersList((prev) =>
        prev.map((item) => (item.id === orderId ? { ...item, status: newStatus } : item))
      );
      setSelectedReturnOrder(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <h1 className="text-xl font-bold text-zinc-900 mb-6">Orders & Returns</h1>

      {/* Search + filter */}
      <div className="flex items-center gap-2 h-11 rounded-xl border-2 border-zinc-200 focus-within:border-brand-500 px-4 mb-4 bg-white transition-colors">
        <Search size={16} className="text-zinc-400 flex-shrink-0" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders…" className="flex-1 bg-transparent text-sm outline-none" />
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors",
              filter === f.key ? "bg-brand-600 text-white font-bold" : "bg-white border border-zinc-200 text-zinc-600"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <Package size={36} className="text-zinc-300 mb-3" />
            <p className="text-sm text-zinc-500">No orders found</p>
          </div>
        ) : (
          filtered.map((order) => {
            const meta = STATUS_META[order.status as OrderStatus] || STATUS_META.pending;
            const Icon = meta.icon;
            return (
              <div key={order.id} className="px-4 py-4 border-b border-zinc-50 last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{order.product}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{order.id} · {order.buyer} · {order.city}</p>
                    <p className="text-xs text-zinc-400">{order.placed}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-zinc-900">₹{order.amount.toLocaleString()}</p>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium mt-1 ${meta.color}`}>
                      <Icon size={10} /> {meta.label}
                    </div>
                  </div>
                </div>
                {meta.action && (
                  <button
                    onClick={() => {
                      if (order.status === "return_requested") {
                        setSelectedReturnOrder(order);
                      }
                    }}
                    className="mt-2.5 px-4 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
                  >
                    {meta.action}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Review Return Modal */}
      {selectedReturnOrder && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-zinc-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-900">Review Buyer Return Claim</h3>
              <button onClick={() => setSelectedReturnOrder(null)} className="text-zinc-400 hover:text-zinc-600 p-1">
                ✕
              </button>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/60 mb-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-900 uppercase">Order ID: {selectedReturnOrder.id}</span>
                <span className="text-xs font-bold text-amber-900">₹{selectedReturnOrder.amount.toLocaleString()}</span>
              </div>
              <p className="text-xs text-zinc-700">
                <span className="font-semibold">Reason:</span> {selectedReturnOrder.return_reason || "Quality Mismatch"}
              </p>
              <p className="text-xs text-zinc-700">
                <span className="font-semibold">Buyer Notes:</span> &quot;{selectedReturnOrder.buyer_notes || "Item fabric density differs from photos."}&quot;
              </p>
            </div>

            {selectedReturnOrder.photo_proof && (
              <div className="mb-4">
                <p className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2">Buyer Photo Proof</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedReturnOrder.photo_proof}
                  alt="Buyer Proof"
                  className="w-full h-40 rounded-2xl object-cover border border-zinc-200"
                />
              </div>
            )}

            <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
              Seller Counter-Notes (Optional)
            </label>
            <textarea
              value={sellerNotes}
              onChange={(e) => setSellerNotes(e.target.value)}
              placeholder="Add response note for buyer or admin..."
              rows={2}
              className="w-full p-3 text-xs rounded-xl border border-zinc-200 outline-none mb-6 focus:border-brand-500"
            />

            <div className="flex gap-2">
              <button
                onClick={() => handleRespondToReturn("escalate")}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl border border-red-200 text-red-600 bg-red-50 text-xs font-bold hover:bg-red-100 transition-colors"
              >
                Escalate to Admin
              </button>
              <button
                onClick={() => handleRespondToReturn("approve")}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Approve Return & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

