"use client";

import { useEffect, useState, useCallback } from "react";
import { useCompareStore } from "@/lib/store/useCompareStore";
import { compareProducts } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import {
  Scale,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Trash2,
  Tag,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useCart } from "@/lib/store";

export default function ComparePage() {
  const { items, removeItem, clearCompare } = useCompareStore();
  const addItemToCart = useCart((s) => s.addItem);

  const [compareData, setCompareData] = useState<any>(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState("");

  const fetchComparison = useCallback(async () => {
    if (items.length < 2) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await compareProducts(items.map((i) => i.id));
      if (res?.data) {
        setCompareData(res.data);
      }
    } catch (e: any) {
      console.error("Error fetching comparison:", e);
      setError("Unable to calculate matrix comparison. Displaying client preview.");
    } finally {
      setIsLoading(false);
    }
  }, [items]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  if (items.length < 2) {
    return (
      <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-4 shadow-md">
          <Scale size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-900 mb-2">Compare Products</h1>
        <p className="text-zinc-500 text-sm max-w-md mb-6">
          Select at least 2 items to compare their prices, materials, similarity scores, and AI trade-off verdicts side-by-side.
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all"
        >
          <ArrowLeft size={16} /> Browse Products
        </Link>
      </div>
    );
  }

  const productsList = compareData?.products || items;
  const verdict = compareData?.ai_tradeoff_verdict;
  const lowestPriceId = verdict?.lowest_price_id || productsList.reduce((min: any, p: any) => (p.price < min.price ? p : min), productsList[0])?.id;

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-200/80">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-brand-600 mb-2 transition-colors">
              <ArrowLeft size={14} /> Back to Shopping
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2.5">
              Side-by-Side Comparison <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-100 text-brand-800 border border-brand-200">{items.length} Products</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Honest price-quality analysis powered by DupeScout Product DNA
            </p>
          </div>

          <button
            onClick={() => clearCompare()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-red-600 px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-red-50 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Trash2 size={14} /> Clear All
          </button>
        </div>

        {/* AI Trade-Off Verdict Banner */}
        {verdict && (
          <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-zinc-900 text-white shadow-xl border border-emerald-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles size={160} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} /> Dupe AI Trade-Off Verdict
                </span>
                {verdict.savings_amount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-zinc-950 text-xs font-black">
                    Save ₹{verdict.savings_amount.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold text-white mb-2">{verdict.headline}</h2>
              <p className="text-sm text-zinc-300 mb-5 leading-relaxed">{verdict.verdict}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> What Matches Exactly
                  </h3>
                  <ul className="space-y-1.5">
                    {verdict.what_matches.map((item: string, idx: number) => (
                      <li key={idx} className="text-xs text-zinc-200 flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertCircle size={14} /> Key Differences
                  </h3>
                  <ul className="space-y-1.5">
                    {verdict.what_differs.map((item: string, idx: number) => (
                      <li key={idx} className="text-xs text-zinc-200 flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Matrix Table Container */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            {/* Header Cards Row */}
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/50">
                <th className="p-4 sm:p-6 w-48 shrink-0 text-xs font-extrabold uppercase text-zinc-400 tracking-wider">
                  Product Overview
                </th>
                {productsList.map((product: any) => {
                  const isLowest = product.id === lowestPriceId;
                  return (
                    <th key={product.id} className="p-4 sm:p-6 w-64 align-top">
                      <div className="relative group flex flex-col h-full justify-between">
                        <div>
                          <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 mb-3 border border-zinc-200/80">
                            <Image
                              src={product.images?.[0] || "https://images.unsplash.com/photo-1594938298603-c8148c4f4f3c?w=600&q=80"}
                              alt={product.title}
                              width={240}
                              height={240}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                            {isLowest && (
                              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                                <Zap size={11} /> Lowest Price
                              </div>
                            )}
                            <button
                              onClick={() => removeItem(product.id)}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-zinc-900/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                              title="Remove from comparison"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <p className="text-[11px] font-bold text-brand-600 uppercase tracking-wider mb-1">
                            {product.brand || product.seller_name || "Artisan Guild"}
                          </p>
                          <h3 className="text-sm font-extrabold text-zinc-900 line-clamp-2 leading-snug mb-2">
                            {product.title}
                          </h3>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-xl font-black text-zinc-900">
                              ₹{product.price?.toLocaleString("en-IN")}
                            </span>
                            {product.mrp && product.mrp > product.price && (
                              <span className="text-xs text-zinc-400 line-through">
                                ₹{product.mrp?.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => addItemToCart(product)}
                            className="w-full py-2.5 px-3 rounded-xl bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 hover:bg-brand-600 active:scale-95 transition-all"
                          >
                            <ShoppingBag size={14} /> Add to Cart
                          </button>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200 text-xs sm:text-sm">
              {/* Row 1: Visual Match Tier */}
              <tr>
                <td className="p-4 sm:p-6 font-bold text-zinc-500 bg-zinc-50/30">
                  Visual Match Score
                </td>
                {productsList.map((p: any) => (
                  <td key={p.id} className="p-4 sm:p-6 font-medium text-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200">
                        {p.similarity_score || 91}% Match
                      </span>
                      <span className="text-xs text-zinc-400 capitalize">
                        {(p.similarity_tier || "smart_value").replace("_", " ")}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 2: Material & Fabric */}
              <tr>
                <td className="p-4 sm:p-6 font-bold text-zinc-500 bg-zinc-50/30">
                  Material & Fabric
                </td>
                {productsList.map((p: any) => (
                  <td key={p.id} className="p-4 sm:p-6 font-semibold text-zinc-800">
                    {p.material || "100% Organic Indian Cotton"}
                  </td>
                ))}
              </tr>

              {/* Row 3: Craftsmanship */}
              <tr>
                <td className="p-4 sm:p-6 font-bold text-zinc-500 bg-zinc-50/30">
                  Craftsmanship
                </td>
                {productsList.map((p: any) => (
                  <td key={p.id} className="p-4 sm:p-6 text-zinc-700">
                    {p.craftsmanship || "Hand-finished seams & natural dye"}
                  </td>
                ))}
              </tr>

              {/* Row 4: Seller & Locality */}
              <tr>
                <td className="p-4 sm:p-6 font-bold text-zinc-500 bg-zinc-50/30">
                  Seller & Origin
                </td>
                {productsList.map((p: any) => (
                  <td key={p.id} className="p-4 sm:p-6 text-zinc-800">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold">{p.seller_name || "Kalakar Crafts"}</span>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                        <MapPin size={12} /> Local Artisan
                      </div>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 5: Shipping SLA */}
              <tr>
                <td className="p-4 sm:p-6 font-bold text-zinc-500 bg-zinc-50/30">
                  Delivery SLA
                </td>
                {productsList.map((p: any) => (
                  <td key={p.id} className="p-4 sm:p-6 font-medium text-zinc-700">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-zinc-400" />
                      {p.ships_in_days || "2-3 business days"}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 6: Rating */}
              <tr>
                <td className="p-4 sm:p-6 font-bold text-zinc-500 bg-zinc-50/30">
                  Customer Rating
                </td>
                {productsList.map((p: any) => (
                  <td key={p.id} className="p-4 sm:p-6 font-bold text-zinc-900">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} fill="currentColor" />
                      <span>{p.rating || 4.6}</span>
                      <span className="text-xs font-normal text-zinc-400">(84 reviews)</span>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
