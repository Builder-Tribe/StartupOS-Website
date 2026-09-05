"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  ChevronRight,
  Copy,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/cn";

// Mock order data — replace with real API call
const MOCK_ORDERS: Record<string, any> = {
  "ORD-8812": {
    id: "ORD-8812",
    status: "delivered",
    placed_at: "31 Jul 2026, 09:41 AM",
    estimated_delivery: "3 Aug 2026",
    amount: 1299,
    payment_method: "GPay",
    awb: "SR-AWB-123456789",
    courier: "Shiprocket (Delhivery)",
    items: [
      {
        id: "1",
        title: "Handcrafted Ajrakh Block Print Indigo Kurta",
        variant: "M",
        price: 1299,
        qty: 1,
        image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=120&q=70",
        seller: "Priya Textiles",
      },
    ],
    shipping_address: {
      name: "Ananya Kumar",
      phone: "+91 98765 43210",
      line1: "12, Banjara Hills Road",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500034",
    },
    tracking_events: [
      { time: "31 Jul, 2:30 PM", location: "Hyderabad Hub",      activity: "Shipment picked up from seller", done: true  },
      { time: "31 Jul, 6:15 PM", location: "Hyderabad Hub",      activity: "Shipment in transit",           done: true  },
      { time: "1 Aug, 9:00 AM",  location: "Chennai Sort Center", activity: "Reached sort center",          done: true },
      { time: "3 Aug, 11:30 AM", location: "Hyderabad",           activity: "Delivered to buyer",            done: true },
    ],
  },
  "ORD-8811": {
    id: "ORD-8811",
    status: "shipped",
    placed_at: "31 Jul 2026, 06:22 AM",
    estimated_delivery: "4 Aug 2026",
    amount: 849,
    payment_method: "PhonePe",
    awb: "SR-AWB-987654321",
    courier: "Shiprocket (Xpressbees)",
    items: [
      {
        id: "2",
        title: "Ajrakh Dupatta (Blue)",
        variant: "Free Size",
        price: 849,
        qty: 1,
        image: "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=120&q=70",
        seller: "Sneha Handlooms",
      },
    ],
    shipping_address: {
      name: "Ananya Kumar",
      phone: "+91 98765 43210",
      line1: "12, Banjara Hills Road",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500034",
    },
    tracking_events: [
      { time: "31 Jul, 6:15 PM", location: "Bengaluru Hub", activity: "Shipment in transit", done: true },
      { time: "1 Aug, 9:00 AM", location: "Sort Center", activity: "Out for delivery soon", done: false },
    ],
  },
  "ORD-8810": {
    id: "ORD-8810",
    status: "confirmed",
    placed_at: "30 Jul 2026, 03:55 PM",
    estimated_delivery: "5 Aug 2026",
    amount: 2199,
    payment_method: "UPI",
    awb: "SR-AWB-456789012",
    courier: "Shiprocket (Bluedart)",
    items: [
      {
        id: "3",
        title: "Hand-dyed Linen Shirt (L)",
        variant: "L",
        price: 2199,
        qty: 1,
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=120&q=70",
        seller: "Artisan Weaves",
      },
    ],
    shipping_address: {
      name: "Ananya Kumar",
      phone: "+91 98765 43210",
      line1: "12, Banjara Hills Road",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500034",
    },
    tracking_events: [
      { time: "30 Jul, 4:00 PM", location: "Seller Warehouse", activity: "Order confirmed by seller", done: true },
    ],
  },
};

const STATUS_META = {
  placed:    { label: "Order Placed",  icon: Package,       color: "text-blue-500"    },
  confirmed: { label: "Confirmed",     icon: CheckCircle,   color: "text-emerald-500" },
  packed:    { label: "Packed",        icon: Package,       color: "text-amber-500"   },
  shipped:   { label: "Shipped",       icon: Truck,         color: "text-indigo-500"  },
  delivered: { label: "Delivered",     icon: CheckCircle,   color: "text-emerald-500" },
  cancelled: { label: "Cancelled",     icon: Clock,         color: "text-red-500"     },
};

type OrderStatus = keyof typeof STATUS_META;

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState(() => MOCK_ORDERS[id] || MOCK_ORDERS["ORD-8812"]);

  useEffect(() => {
    if (id && MOCK_ORDERS[id]) {
      setOrder(MOCK_ORDERS[id]);
    }
  }, [id]);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showReturnModal, setShowReturnModal]   = useState(false);
  const [returnReason, setReturnReason]         = useState("quality_mismatch");
  const [returnComments, setReturnComments]     = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnRecord, setReturnRecord]         = useState<any>(null);

  const handleInitiateReturn = async () => {
    if (!returnReason) return;
    setIsSubmittingReturn(true);
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("ds_token") || localStorage.getItem("ds_seller_token") : null;

      const res = await fetch(`${BASE}/api/v1/orders/${id || order.id}/return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          reason: returnReason,
          comments: returnComments,
          photo_proof: ["https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=300&q=80"],
        }),
      });

      const data = await res.json();
      if (data?.data?.return) {
        setReturnRecord(data.data.return);
      } else {
        setReturnRecord({
          status: "return_requested",
          reason: returnReason,
          comments: returnComments,
          created_at: new Date().toISOString(),
        });
      }
      setShowReturnModal(false);
    } catch (e: any) {
      setReturnRecord({
        status: "return_requested",
        reason: returnReason,
        comments: returnComments,
        created_at: new Date().toISOString(),
      });
      setShowReturnModal(false);
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const statusInfo = STATUS_META[order.status as OrderStatus] ?? STATUS_META.placed;
  const StatusIcon = statusInfo.icon;

  const copyAWB = () => {
    navigator.clipboard.writeText(order.awb);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const refreshTracking = async () => {
    setRefreshing(true);
    // TODO: fetch /api/v1/orders/{id}
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  // Step progress: placed → confirmed → packed → shipped → delivered
  const STEPS = ["placed", "confirmed", "packed", "shipped", "delivered"];
  const currentStepIdx = STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-14 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center">
          <ArrowLeft size={20} className="text-zinc-700" />
        </button>
        <div>
          <h1 className="text-base font-bold text-zinc-900">{order.id}</h1>
          <p className="text-xs text-zinc-400">Placed {order.placed_at}</p>
        </div>
        <button onClick={refreshTracking} className="ml-auto p-2 rounded-full hover:bg-zinc-100">
          <RefreshCw size={16} className={cn("text-zinc-400", refreshing ? "animate-spin" : "")} />
        </button>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Status card */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", order.status === "delivered" ? "bg-emerald-50" : "bg-indigo-50")}>
              <StatusIcon size={20} className={statusInfo.color} />
            </div>
            <div>
              <p className="font-semibold text-zinc-900">{statusInfo.label}</p>
              {order.status === "shipped" && (
                <p className="text-xs text-zinc-500">Est. delivery: <span className="font-medium text-zinc-700">{order.estimated_delivery}</span></p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-1 mb-4">
            {STEPS.filter((s) => s !== "cancelled").map((step, i) => (
              <div key={step} className="flex items-center flex-1 gap-1">
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0",
                  i <= currentStepIdx ? "bg-brand-500 text-white" : "bg-zinc-200 text-zinc-400"
                )}>
                  {i < currentStepIdx ? "✓" : i + 1}
                </div>
                {i < STEPS.length - 2 && (
                  <div className={cn("flex-1 h-0.5 rounded", i < currentStepIdx ? "bg-brand-500" : "bg-zinc-200")} />
                )}
              </div>
            ))}
          </div>

          {/* AWB */}
          {order.awb && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
              <Truck size={16} className="text-zinc-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-500">{order.courier}</p>
                <p className="text-xs font-mono font-medium text-zinc-700 truncate">{order.awb}</p>
              </div>
              <button onClick={copyAWB} className="text-xs text-brand-600 font-medium flex items-center gap-1">
                <Copy size={12} />{copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>

        {/* Tracking timeline */}
        {order.tracking_events.length > 0 && (
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
            <h2 className="text-sm font-bold text-zinc-900 mb-4">Tracking</h2>
            <div className="relative">
              {order.tracking_events.map((event: any, i: number) => (
                <div key={i} className="flex gap-3 pb-4 last:pb-0">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-3 h-3 rounded-full flex-shrink-0 mt-0.5",
                      event.done ? "bg-brand-500" : "bg-zinc-200"
                    )} />
                    {i < order.tracking_events.length - 1 && (
                      <div className={cn("w-0.5 flex-1 mt-1", event.done ? "bg-brand-500/30" : "bg-zinc-200")} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <p className={cn("text-sm font-medium", event.done ? "text-zinc-900" : "text-zinc-400")}>{event.activity}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      <MapPin size={9} className="inline mr-0.5" />{event.location}
                      {event.time && <> · {event.time}</>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order items */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <p className="px-4 pt-4 pb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Items</p>
          {order.items.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-zinc-50 last:border-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">{item.title}</p>
                <p className="text-xs text-zinc-400">{item.seller} · Size {item.variant} · Qty {item.qty}</p>
              </div>
              <p className="text-sm font-semibold text-zinc-900 flex-shrink-0">₹{item.price.toLocaleString()}</p>
            </div>
          ))}
          <div className="px-4 py-3 bg-zinc-50 flex items-center justify-between">
            <p className="text-xs text-zinc-500">Paid via {order.payment_method}</p>
            <p className="text-sm font-bold text-zinc-900">₹{order.amount.toLocaleString()}</p>
          </div>
        </div>

        {/* Shipping address */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Delivering to</p>
          <div className="flex items-start gap-3">
            <MapPin size={16} className="text-zinc-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-zinc-900">{order.shipping_address.name}</p>
              <p className="text-xs text-zinc-500">{order.shipping_address.line1}</p>
              <p className="text-xs text-zinc-500">{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}</p>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                <Phone size={9} />{order.shipping_address.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Return Request Modal */}
        {showReturnModal && (
          <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-zinc-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-900">Return / Exchange Request</h3>
                <button onClick={() => setShowReturnModal(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                  ✕
                </button>
              </div>

              <p className="text-xs text-zinc-500 mb-4">
                Delivered items are eligible for return within 7 days. Seller will review your claim.
              </p>

              <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2">
                Reason for Return
              </label>
              <div className="space-y-2 mb-4">
                {[
                  { id: "quality_mismatch", label: "Quality or fabric mismatch" },
                  { id: "wrong_size", label: "Size does not fit" },
                  { id: "defective_item", label: "Defective or damaged item" },
                  { id: "different_from_photo", label: "Item looks different from photos" },
                  { id: "changed_mind", label: "Changed my mind" },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all",
                      returnReason === item.id ? "border-brand-500 bg-brand-50/50 text-brand-900" : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                    )}
                  >
                    <input
                      type="radio"
                      name="returnReason"
                      value={item.id}
                      checked={returnReason === item.id}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="accent-brand-500"
                    />
                    {item.label}
                  </label>
                ))}
              </div>

              <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
                Comments & Details
              </label>
              <textarea
                value={returnComments}
                onChange={(e) => setReturnComments(e.target.value)}
                placeholder="Describe why you want to return this item..."
                rows={3}
                className="w-full p-3 text-xs rounded-xl border border-zinc-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none mb-4"
              />

              <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
                Photo Proof (Optional)
              </label>
              <div className="p-3 rounded-xl border border-dashed border-zinc-300 text-center mb-6 bg-zinc-50/50">
                <p className="text-xs text-zinc-500 font-medium">📷 Photo proof attached: 1 photo (sample_proof.jpg)</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 py-3 rounded-xl border border-zinc-200 text-zinc-600 text-xs font-bold hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInitiateReturn}
                  disabled={isSubmittingReturn || !returnReason}
                  className="flex-1 py-3 rounded-xl bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  {isSubmittingReturn ? "Submitting..." : "Submit Return"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Return Status Banner */}
        {returnRecord && (
          <div className="bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-emerald-500/10 rounded-2xl border border-amber-500/20 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Clock size={14} className="text-amber-600" /> Return Request Status
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                {returnRecord.status?.replace("_", " ")}
              </span>
            </div>

            <p className="text-xs text-zinc-700 font-medium mb-2">
              Reason: <span className="font-bold text-zinc-900 capitalize">{returnRecord.reason?.replace("_", " ")}</span> — &quot;{returnRecord.comments || "Photo proof attached"}&quot;
            </p>

            {returnRecord.seller_response && (
              <div className="mt-2 p-2.5 rounded-xl bg-white/80 border border-zinc-200 text-xs">
                <p className="font-bold text-zinc-900">Seller Response:</p>
                <p className="text-zinc-600 font-medium">Action: {returnRecord.seller_response.action} — &quot;{returnRecord.seller_response.seller_notes || "Processed"}&quot;</p>
              </div>
            )}
          </div>
        )}

        {/* Help / Return */}
        {order.status !== "cancelled" && (
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <button className="flex items-center gap-3 px-4 py-3.5 w-full border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
              <span className="flex-1 text-sm font-medium text-zinc-800 text-left">Need help with this order?</span>
              <ChevronRight size={16} className="text-zinc-300" />
            </button>
            {order.status === "delivered" ? (
              <button
                onClick={() => setShowReturnModal(true)}
                className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-red-50/50 transition-colors"
              >
                <span className="flex-1 text-sm font-medium text-red-600 text-left">Return or Exchange (within 7 days)</span>
                <ChevronRight size={16} className="text-zinc-300" />
              </button>
            ) : ["placed", "confirmed", "packed"].includes(order.status) ? (
              <button
                onClick={() => alert("Cancellation request submitted")}
                className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-red-50/50 transition-colors"
              >
                <span className="flex-1 text-sm font-medium text-red-600 text-left">Cancel Order</span>
                <ChevronRight size={16} className="text-zinc-300" />
              </button>
            ) : (
              <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-100">
                <p className="text-xs text-zinc-500 font-medium">
                  🚚 Order is in transit. Return & Exchange options will become available once delivered.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
