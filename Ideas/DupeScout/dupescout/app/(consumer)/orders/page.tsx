"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Truck, CheckCircle, Clock, ChevronRight, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/cn";
import { useOrders } from "@/lib/store";

type OrderStatus = "placed" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";

interface DisplayOrder {
  id: string;
  status: OrderStatus;
  placed_at: string;
  amount: number;
  items: { title: string; image: string; qty: number }[];
  estimated_delivery?: string;
}

const STATIC_ORDERS: DisplayOrder[] = [
  {
    id: "ORD-8812",
    status: "delivered",
    placed_at: "31 Jul 2026",
    amount: 1299,
    estimated_delivery: "3 Aug 2026",
    items: [{ title: "Ajrakh Block Print Kurta", image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=80&q=70", qty: 1 }],
  },
  {
    id: "ORD-8811",
    status: "shipped",
    placed_at: "31 Jul 2026",
    amount: 849,
    estimated_delivery: "4 Aug 2026",
    items: [{ title: "Ajrakh Dupatta (Blue)", image: "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=80&q=70", qty: 1 }],
  },
  {
    id: "ORD-8810",
    status: "confirmed",
    placed_at: "30 Jul 2026",
    amount: 2199,
    estimated_delivery: "5 Aug 2026",
    items: [{ title: "Hand-dyed Linen Shirt", image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=80&q=70", qty: 1 }],
  },
  {
    id: "ORD-7741",
    status: "delivered",
    placed_at: "22 Jul 2026",
    amount: 2480,
    items: [
      { title: "Phulkari Dupatta Ivory", image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=80&q=70", qty: 1 },
      { title: "Indigo Kantha Stole",    image: "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=80&q=70", qty: 2 },
    ],
  },
  {
    id: "ORD-6103",
    status: "cancelled",
    placed_at: "15 Jul 2026",
    amount: 799,
    items: [{ title: "Warli Print Tote Bag", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=80&q=70", qty: 1 }],
  },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: typeof Package }> = {
  placed:    { label: "Order Placed",  color: "text-blue-600 bg-blue-50",       icon: Clock       },
  confirmed: { label: "Confirmed",     color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
  packed:    { label: "Packed",        color: "text-amber-600 bg-amber-50",     icon: Package     },
  shipped:   { label: "Shipped",       color: "text-indigo-600 bg-indigo-50",   icon: Truck       },
  delivered: { label: "Delivered",     color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
  cancelled: { label: "Cancelled",     color: "text-red-500 bg-red-50",         icon: Clock       },
};

const FILTER_TABS: { key: "all" | OrderStatus; label: string }[] = [
  { key: "all",       label: "All orders"  },
  { key: "confirmed", label: "Confirmed"   },
  { key: "shipped",   label: "Shipped"     },
  { key: "delivered", label: "Delivered"   },
  { key: "cancelled", label: "Cancelled"   },
];

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | OrderStatus>("all");
  const { orders: placedOrders } = useOrders();

  // Convert PlacedOrder → DisplayOrder
  const realOrders: DisplayOrder[] = placedOrders.map((o) => ({
    id:       o.id,
    status:   (o.status === "confirmed" ? "confirmed" : o.status) as OrderStatus,
    placed_at: o.placed_at,
    amount:   o.total,
    items:    o.items.map((i) => ({
      title: i.product.title,
      image: i.product.images[0] ?? "",
      qty:   i.quantity,
    })),
  }));

  const allOrders = [...realOrders, ...STATIC_ORDERS];
  const filtered  = allOrders.filter((o) => activeFilter === "all" || o.status === activeFilter);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <h1 className="text-2xl font-bold text-zinc-900 mb-6">My Orders</h1>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                "flex-shrink-0 h-9 px-4 rounded-xl text-sm font-medium transition-colors",
                activeFilter === tab.key
                  ? "bg-zinc-900 text-white"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center">
              <ShoppingBag size={28} className="text-zinc-300" />
            </div>
            <p className="text-zinc-500">No orders found</p>
            <Link
              href="/"
              className="h-10 px-5 rounded-xl bg-brand-600 text-white text-sm font-semibold flex items-center"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const cfg  = STATUS_CONFIG[order.status];
              const Icon = cfg.icon;
              return (
                <Link key={order.id} href={`/orders/${order.id}`} className="block">
                  <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm hover:border-zinc-200 hover:shadow-md transition-all overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-50">
                      <span className="text-xs font-mono font-medium text-zinc-500">{order.id}</span>
                      <div className={cn(
                        "flex items-center gap-1.5 ml-auto px-2.5 py-1 rounded-full text-xs font-semibold",
                        cfg.color
                      )}>
                        <Icon size={11} />
                        {cfg.label}
                      </div>
                    </div>

                    <div className="px-5 py-4 flex items-center gap-4">
                      <div className="flex -space-x-2 shrink-0">
                        {order.items.slice(0, 3).map((item, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={i}
                            src={item.image}
                            alt=""
                            className="w-14 h-14 rounded-xl object-cover border-2 border-white"
                          />
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">
                          {order.items[0].title}
                          {order.items.length > 1 && (
                            <span className="text-zinc-400"> +{order.items.length - 1} more</span>
                          )}
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">{order.placed_at}</p>
                        {order.status === "shipped" && order.estimated_delivery && (
                          <p className="text-xs text-indigo-600 font-medium mt-0.5">
                            Est. delivery: {order.estimated_delivery}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-2">
                        <p className="text-sm font-bold text-zinc-900">₹{order.amount.toLocaleString()}</p>
                        <ChevronRight size={16} className="text-zinc-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
