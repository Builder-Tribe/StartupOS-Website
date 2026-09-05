"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck, Truck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/cn";

export default function CartPage() {
  const router  = useRouter();
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const { isLoggedIn } = useAuth();

  const total        = totalPrice();
  const count        = totalItems();
  const shippingFee  = total >= 999 ? 0 : 99;
  const grandTotal   = total + shippingFee;

  if (count === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-6 text-center">
        <ShoppingBag size={56} className="text-zinc-200" />
        <div>
          <p className="text-xl font-bold text-zinc-900 mb-1">Your cart is empty</p>
          <p className="text-sm text-zinc-500">Upload a photo or search to find what you love.</p>
        </div>
        <Button onClick={() => router.push("/")}>Start shopping</Button>
      </div>
    );
  }

  const bySeller = items.reduce<Record<string, typeof items>>(
    (acc, item) => {
      const sid = item.product.seller.id;
      if (!acc[sid]) acc[sid] = [];
      acc[sid].push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Page title */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-zinc-100 text-zinc-500">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-zinc-900">Cart ({count})</h1>
        </div>

        {/* 2-col layout: items left, summary right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Cart items ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {Object.values(bySeller).map((sellerItems) => {
              const seller = sellerItems[0].product.seller;
              return (
                <div key={seller.id} className="card overflow-hidden">
                  {/* Seller header */}
                  <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center gap-1.5 bg-zinc-50">
                    {seller.is_verified && <ShieldCheck size={13} className="text-brand-500" />}
                    <p className="text-xs font-semibold text-zinc-700">{seller.name}</p>
                    {seller.city && <span className="text-xs text-zinc-400">· {seller.city}</span>}
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-zinc-50">
                    {sellerItems.map((item) => {
                      const price = item.variant?.price ?? item.product.price;
                      const key   = `${item.product.id}::${item.variant?.id}`;
                      return (
                        <div key={key} className="flex gap-4 p-4">
                          <Link href={`/product/${item.product.id}`}>
                            <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.title}
                                fill
                                sizes="96px"
                                className="object-cover"
                              />
                            </div>
                          </Link>

                          <div className="flex-1 min-w-0">
                            <Link href={`/product/${item.product.id}`}>
                              <p className="text-sm font-medium text-zinc-900 line-clamp-2 hover:text-brand-600">
                                {item.product.title}
                              </p>
                            </Link>
                            {item.variant?.size && (
                              <p className="text-xs text-zinc-500 mt-0.5">Size: {item.variant.size}</p>
                            )}
                            <p className="text-base font-bold text-zinc-900 mt-1">
                              ₹{price.toLocaleString("en-IN")}
                            </p>

                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1 border border-zinc-200 rounded-xl overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity - 1)}
                                  className="p-1.5 hover:bg-zinc-100 transition-colors"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="text-sm font-semibold w-7 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity + 1)}
                                  className="p-1.5 hover:bg-zinc-100 transition-colors"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item.product.id, item.variant?.id)}
                                className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Trust signals */}
            <div className="flex gap-4 flex-wrap text-xs text-zinc-500 px-1 py-2">
              <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-brand-500" /> Secure payments</span>
              <span>↩ 7-day easy returns</span>
              <span className="flex items-center gap-1.5"><Truck size={13} className="text-brand-500" /> Verified sellers only</span>
            </div>
          </div>

          {/* ── Order summary sidebar ────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <div className="card p-5 space-y-4">
              <p className="font-bold text-zinc-900">Order Summary</p>
              <div className="space-y-2 text-sm">
                <SummaryRow label="Subtotal" value={`₹${total.toLocaleString("en-IN")}`} />
                <SummaryRow
                  label="Shipping"
                  value={shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
                  valueClass={shippingFee === 0 ? "text-brand-600 font-semibold" : undefined}
                />
                {shippingFee > 0 && (
                  <p className="text-xs text-zinc-400 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    Add ₹{(999 - total).toLocaleString("en-IN")} more for free shipping
                  </p>
                )}
              </div>
              <div className="border-t border-zinc-100 pt-3 flex items-center justify-between">
                <p className="font-bold text-zinc-900">Total</p>
                <p className="font-bold text-xl text-zinc-900">₹{grandTotal.toLocaleString("en-IN")}</p>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={() => isLoggedIn ? router.push("/checkout") : router.push("/login?redirect=/checkout")}
              >
                Proceed to Checkout
              </Button>
              <p className="text-center text-xs text-zinc-400">UPI · Cards · Cash on delivery</p>
            </div>

            {/* Promo code */}
            <div className="card p-4">
              <p className="text-sm font-semibold text-zinc-800 mb-2">Have a promo code?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-1 h-9 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-brand-500"
                />
                <button className="h-9 px-3 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky checkout */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-100 px-4 pt-3 pb-safe lg:hidden">
        <Button size="lg" className="w-full" onClick={() => isLoggedIn ? router.push("/checkout") : router.push("/login?redirect=/checkout")}>
          Checkout · ₹{grandTotal.toLocaleString("en-IN")}
        </Button>
      </div>

      <div className="h-20 lg:h-8" />
    </div>
  );
}

function SummaryRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between text-zinc-700">
      <span>{label}</span>
      <span className={cn("font-medium", valueClass)}>{value}</span>
    </div>
  );
}
