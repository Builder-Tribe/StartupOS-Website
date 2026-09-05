"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Plus, CreditCard, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart, useOrders } from "@/lib/store";
import { cn } from "@/lib/cn";
import Link from "next/link";

interface Address {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  is_default: boolean;
}

type PaymentMethod = "upi_gpay" | "upi_phonepe" | "upi_bhim" | "card" | "cod";
type CheckoutStep  = "address" | "payment" | "review";

const MOCK_ADDRESSES: Address[] = [
  {
    id: "addr1",
    name: "Priya Menon",
    line1: "Flat 4B, Stellar Heights",
    line2: "Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400058",
    phone: "+91 98765 43210",
    is_default: true,
  },
];

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: string; description?: string }[] = [
  { id: "upi_gpay",    label: "Google Pay",       icon: "G",  description: "UPI · instant" },
  { id: "upi_phonepe", label: "PhonePe",          icon: "P",  description: "UPI · instant" },
  { id: "upi_bhim",    label: "BHIM / Other UPI", icon: "B",  description: "Enter UPI ID" },
  { id: "card",        label: "Card",             icon: "💳", description: "Credit / debit / net banking" },
  { id: "cod",         label: "Cash on Delivery", icon: "💵", description: "Pay when delivered · max ₹5,000" },
];

const STEPS: { key: CheckoutStep; label: string }[] = [
  { key: "address", label: "Address" },
  { key: "payment", label: "Payment" },
  { key: "review",  label: "Review"  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { addOrder } = useOrders();

  const [step,            setStep]            = useState<CheckoutStep>("address");
  const [selectedAddress, setSelectedAddress] = useState<Address>(MOCK_ADDRESSES[0]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("upi_gpay");
  const [upiId,           setUpiId]           = useState("");
  const [placing,         setPlacing]         = useState(false);
  const [success,         setSuccess]         = useState(false);

  const total       = totalPrice();
  const shippingFee = total >= 999 ? 0 : 99;
  const grandTotal  = total + shippingFee;
  const codBlocked  = grandTotal > 5000 && selectedPayment === "cod";

  // Empty-cart guard
  if (items.length === 0 && !success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="text-xl font-bold text-zinc-900">Your cart is empty</h1>
        <p className="text-zinc-500 text-sm">Add some items before checking out.</p>
        <Link href="/" className="mt-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-semibold hover:bg-brand-700 transition-colors focus-ring">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (success) return <OrderSuccessScreen onTrack={() => router.push("/orders")} onContinue={() => router.push("/")} />;

  async function handlePlaceOrder() {
    if (codBlocked) return;
    setPlacing(true);
    try {
      await new Promise((r) => setTimeout(r, 2000));
      const orderId = "ORD-" + Math.random().toString(36).slice(2, 7).toUpperCase();
      addOrder({
        id: orderId,
        items: [...items],
        address: {
          name:    selectedAddress.name,
          line1:   selectedAddress.line1,
          city:    selectedAddress.city,
          state:   selectedAddress.state,
          pincode: selectedAddress.pincode,
          phone:   selectedAddress.phone,
        },
        payment_method: selectedPayment,
        total:          grandTotal,
        status:         "confirmed",
        placed_at:      new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        seller_ids:     items.map((i) => i.product.seller.id).filter((id, idx, arr) => arr.indexOf(id) === idx),
      });
      clearCart();
      setSuccess(true);
    } finally {
      setPlacing(false);
    }
  }

  const currentStepIdx = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50">
      {/* Sticky top bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-3">
            <button
              onClick={() => step === "address" ? router.back() : setStep(STEPS[currentStepIdx - 1].key)}
              aria-label="Back"
              className="p-2 -ml-2 rounded-xl hover:bg-zinc-100 focus-ring"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-base font-bold text-zinc-900">Checkout</h1>
            <div className="ml-auto flex items-center gap-3">
              {STEPS.map((s, i) => (
                <div key={s.key} className="flex items-center gap-1.5">
                  {i > 0 && <div className="w-6 h-px bg-zinc-200" />}
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                      i < currentStepIdx
                        ? "bg-brand-600 text-white"
                        : i === currentStepIdx
                        ? "bg-brand-600 text-white ring-2 ring-brand-200"
                        : "bg-zinc-200 text-zinc-400"
                    )}>
                      {i < currentStepIdx ? "✓" : i + 1}
                    </div>
                    <span className={cn(
                      "text-xs font-medium hidden sm:block",
                      i <= currentStepIdx ? "text-zinc-800" : "text-zinc-400"
                    )}>
                      {s.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column: step content */}
          <div className="lg:col-span-2 space-y-4">
            {/* ── STEP 1: Address ──────────────────────────────────── */}
            {step === "address" && (
              <>
                <h2 className="text-xl font-bold text-zinc-900">Delivery address</h2>
                <div className="space-y-3">
                  {MOCK_ADDRESSES.map((addr) => (
                    <AddressCard
                      key={addr.id}
                      address={addr}
                      selected={selectedAddress.id === addr.id}
                      onSelect={() => setSelectedAddress(addr)}
                    />
                  ))}
                  <button className="w-full flex items-center gap-2 p-4 rounded-2xl border border-dashed border-zinc-300 text-sm text-zinc-500 hover:border-brand-400 hover:text-brand-600 transition-colors focus-ring">
                    <Plus size={16} />
                    Add new address
                  </button>
                </div>
                <Button size="lg" className="w-full mt-2" onClick={() => setStep("payment")}>
                  Continue to payment
                </Button>
              </>
            )}

            {/* ── STEP 2: Payment ──────────────────────────────────── */}
            {step === "payment" && (
              <>
                <h2 className="text-xl font-bold text-zinc-900">Payment method</h2>
                <div className="space-y-2">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedPayment(opt.id)}
                      disabled={opt.id === "cod" && grandTotal > 5000}
                      aria-pressed={selectedPayment === opt.id}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all focus-ring",
                        selectedPayment === opt.id
                          ? "border-brand-600 bg-brand-50"
                          : "border-zinc-200 bg-white hover:border-zinc-300",
                        opt.id === "cod" && grandTotal > 5000 && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <span className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-sm font-bold text-zinc-700 shrink-0">
                        {opt.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900">{opt.label}</p>
                        {opt.description && <p className="text-xs text-zinc-500">{opt.description}</p>}
                        {opt.id === "cod" && grandTotal > 5000 && (
                          <p className="text-xs text-red-500">Not available above ₹5,000</p>
                        )}
                      </div>
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 shrink-0 transition-colors",
                        selectedPayment === opt.id ? "border-brand-600 bg-brand-600" : "border-zinc-300"
                      )} />
                    </button>
                  ))}
                </div>

                {selectedPayment === "upi_bhim" && (
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    aria-label="UPI ID"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  />
                )}

                <Button size="lg" className="w-full mt-2" onClick={() => setStep("review")}>
                  Review order
                </Button>
              </>
            )}

            {/* ── STEP 3: Review ───────────────────────────────────── */}
            {step === "review" && (
              <>
                <h2 className="text-xl font-bold text-zinc-900">Review order</h2>

                <ReviewCard
                  title="Delivery to"
                  icon={<MapPin size={16} className="text-brand-600" />}
                  onEdit={() => setStep("address")}
                >
                  <p className="text-sm font-medium text-zinc-900">{selectedAddress.name}</p>
                  <p className="text-sm text-zinc-600">
                    {selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""}
                  </p>
                  <p className="text-sm text-zinc-600">
                    {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                  </p>
                  <p className="text-sm text-zinc-500 mt-0.5">{selectedAddress.phone}</p>
                </ReviewCard>

                <ReviewCard
                  title="Payment"
                  icon={<CreditCard size={16} className="text-brand-600" />}
                  onEdit={() => setStep("payment")}
                >
                  <p className="text-sm font-medium text-zinc-900">
                    {PAYMENT_OPTIONS.find((p) => p.id === selectedPayment)?.label}
                  </p>
                </ReviewCard>

                {/* Items list */}
                <div className="card p-4 space-y-3">
                  <p className="text-sm font-bold text-zinc-900">Items ({items.length})</p>
                  {items.map((item) => {
                    const price = item.variant?.price ?? item.product.price;
                    const variantLabel = [item.variant?.size, item.variant?.color].filter(Boolean).join(", ");
                    return (
                      <div key={`${item.product.id}-${item.variant?.id ?? "default"}`} className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-zinc-100 shrink-0 overflow-hidden">
                          {item.product.images[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 truncate">{item.product.title}</p>
                          {variantLabel && <p className="text-xs text-zinc-500">{variantLabel}</p>}
                          <p className="text-xs text-zinc-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-zinc-900 shrink-0">
                          ₹{(price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  loading={placing}
                  onClick={handlePlaceOrder}
                  disabled={codBlocked}
                >
                  {placing ? "Placing order…" : `Place order · ₹${grandTotal.toLocaleString("en-IN")}`}
                </Button>
                <p className="text-center text-xs text-zinc-400">
                  By placing this order you agree to our{" "}
                  <Link href="/terms" className="underline underline-offset-2">Terms of Service</Link>
                </p>
              </>
            )}
          </div>

          {/* Right column: price summary (sticky on desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-32 card p-5 space-y-3 text-sm">
              <p className="font-bold text-zinc-900 text-base mb-1">Price details</p>
              <div className="flex justify-between text-zinc-700">
                <span>Subtotal ({items.length} {items.length === 1 ? "item" : "items"})</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-zinc-700">
                <span>Shipping</span>
                <span className={shippingFee === 0 ? "text-brand-600 font-semibold" : ""}>
                  {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
                </span>
              </div>
              {shippingFee === 0 && (
                <p className="text-xs text-brand-600">You get free delivery!</p>
              )}
              <div className="border-t border-zinc-100 pt-3 flex justify-between font-bold text-zinc-900 text-base">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-xs text-zinc-400">Inclusive of all taxes · Prices in INR</p>
            </div>
          </div>

          {/* Mobile price summary (collapsed) */}
          <div className="lg:hidden card p-4">
            <div className="flex justify-between text-sm font-bold text-zinc-900">
              <span>Total ({items.length} {items.length === 1 ? "item" : "items"})</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
            {shippingFee === 0 && (
              <p className="text-xs text-brand-600 mt-1">Free delivery included</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AddressCard({ address, selected, onSelect }: { address: Address; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left p-4 rounded-2xl border transition-all focus-ring",
        selected ? "border-brand-600 bg-brand-50" : "border-zinc-200 bg-white hover:border-zinc-300"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-zinc-900">{address.name}</p>
            {address.is_default && <Badge variant="brand">Default</Badge>}
          </div>
          <p className="text-sm text-zinc-600 mt-0.5">
            {address.line1}{address.line2 ? `, ${address.line2}` : ""}
          </p>
          <p className="text-sm text-zinc-600">{address.city}, {address.state} {address.pincode}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{address.phone}</p>
        </div>
        <div className={cn(
          "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 transition-colors",
          selected ? "border-brand-600 bg-brand-600" : "border-zinc-300"
        )} />
      </div>
    </button>
  );
}

function ReviewCard({ title, icon, children, onEdit }: { title: string; icon: React.ReactNode; children: React.ReactNode; onEdit: () => void }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
          {icon}
          {title}
        </div>
        <button onClick={onEdit} className="text-xs font-medium text-brand-600 hover:underline focus-ring rounded">
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

function OrderSuccessScreen({ onTrack, onContinue }: { onTrack: () => void; onContinue: () => void }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mb-5">
        <CheckCircle2 size={40} className="text-brand-600" />
      </div>
      <h1 className="text-2xl font-bold text-zinc-900">Order placed!</h1>
      <p className="text-zinc-500 mt-2 max-w-sm">
        You&apos;ll receive a WhatsApp confirmation shortly with tracking details.
      </p>
      <div className="mt-8 w-full max-w-sm space-y-3">
        <Button size="lg" className="w-full" onClick={onTrack}>
          Track order
        </Button>
        <Button variant="ghost" size="lg" className="w-full" onClick={onContinue}>
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
