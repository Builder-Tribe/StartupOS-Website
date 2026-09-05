"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface WishlistItem {
  id: string;
  product_id: string;
  title: string;
  seller: string;
  price: number;
  original_price?: number;
  image: string;
  in_stock: boolean;
  aesthetic_codes: string[];
}

const MOCK_WISHLIST: WishlistItem[] = [
  {
    id: "w1",
    product_id: "p101",
    title: "Handwoven Ikat Silk Saree — Cobalt & Gold",
    seller: "Pochampally Weaves",
    price: 4200,
    original_price: 6500,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=300&q=80",
    in_stock: true,
    aesthetic_codes: ["artisan-craft", "festive-ethnic"],
  },
  {
    id: "w2",
    product_id: "p205",
    title: "Indigo Hand-Block Print Kaftan",
    seller: "Priya Textiles",
    price: 1850,
    image: "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=300&q=80",
    in_stock: true,
    aesthetic_codes: ["indie-boho", "slow-fashion"],
  },
  {
    id: "w3",
    product_id: "p312",
    title: "Silver Tribal Jhumka Earrings",
    seller: "Dokra Craft Studio",
    price: 890,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&q=80",
    in_stock: false,
    aesthetic_codes: ["artisan-craft"],
  },
  {
    id: "w4",
    product_id: "p409",
    title: "Madhubani Painted Kurta",
    seller: "Bihar Crafts",
    price: 2100,
    original_price: 2800,
    image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=300&q=80",
    in_stock: true,
    aesthetic_codes: ["artisan-craft", "indie-boho"],
  },
];

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>(MOCK_WISHLIST);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center">
          <Heart size={32} className="text-pink-300" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-1">Your wishlist is empty</h2>
          <p className="text-sm text-zinc-400">Click the heart on any product to save it here</p>
        </div>
        <Link
          href="/"
          className="h-11 px-6 rounded-xl bg-brand-500 text-white font-semibold text-sm flex items-center"
        >
          Discover Products
        </Link>
      </div>
    );
  }

  const inStockCount = items.filter((i) => i.in_stock).length;
  const outOfStock   = items.filter((i) => !i.in_stock);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">Saved Items</h1>
          <span className="text-sm text-zinc-400">{items.length} items · {inStockCount} in stock</span>
        </div>

        {/* Out-of-stock banner */}
        {outOfStock.length > 0 && (
          <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-sm text-amber-700 font-medium">
              {outOfStock.length} item{outOfStock.length > 1 ? "s are" : " is"} out of stock — we&apos;ll notify you when {outOfStock.length > 1 ? "they&apos;re" : "it&apos;s"} back.
            </p>
          </div>
        )}

        {/* Grid: 2 on mobile, 3 on tablet, 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col group"
            >
              {/* Image */}
              <div className="relative">
                <Link href={`/product/${item.product_id}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className={cn(
                      "w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300",
                      !item.in_stock && "opacity-50 grayscale"
                    )}
                  />
                </Link>
                {!item.in_stock && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-zinc-900/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      Out of Stock
                    </span>
                  </div>
                )}
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col flex-1 gap-1">
                <p className="text-xs text-zinc-400 truncate">{item.seller}</p>
                <p className="text-sm font-medium text-zinc-900 line-clamp-2 flex-1 leading-snug">
                  {item.title}
                </p>

                {/* Aesthetic codes */}
                {item.aesthetic_codes.length > 0 && (
                  <div className="flex flex-wrap gap-1 my-1">
                    {item.aesthetic_codes.slice(0, 2).map((code) => (
                      <span
                        key={code}
                        className="text-[10px] bg-zinc-50 border border-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-full capitalize"
                      >
                        {code.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-zinc-900">₹{item.price.toLocaleString()}</span>
                  {item.original_price && (
                    <span className="text-xs text-zinc-400 line-through">
                      ₹{item.original_price.toLocaleString()}
                    </span>
                  )}
                </div>

                <button
                  disabled={!item.in_stock}
                  className={cn(
                    "mt-1 w-full h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors",
                    item.in_stock
                      ? "bg-brand-500 text-white hover:bg-brand-600"
                      : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
                  )}
                >
                  <ShoppingCart size={13} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
