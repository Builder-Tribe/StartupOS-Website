"use client";

import Link from "next/link";
import { Plus, Search, Package, Star, Edit2, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

const MOCK_PRODUCTS = [
  { id: "p1", title: "Handcrafted Ajrakh Block Print Indigo Kurta", category: "Fashion", price: 1299, mrp: 2499, rating: 4.8, reviews: 32, stock: 47, active: true, image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=80&q=70" },
  { id: "p2", title: "Hand-dyed Shibori Linen Saree – Indigo", category: "Fashion", price: 3499, mrp: 5999, rating: 4.9, reviews: 18, stock: 12, active: true, image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=80&q=70" },
  { id: "p3", title: "Terracotta Chai Mug Set (4 pcs)",           category: "Home",   price: 799,  mrp: 1299, rating: 4.7, reviews: 55, stock: 0,  active: false, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=80&q=70" },
  { id: "p4", title: "Kantha Embroidery Cotton Tote",             category: "Fashion", price: 699,  mrp: 1199, rating: 4.6, reviews: 24, stock: 28, active: true, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=80&q=70" },
];

export default function SellerProductsPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = (id: string) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, active: !p.active } : p));
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-zinc-900">Products</h1>
        <Link href="/seller/products/new" className="flex items-center gap-2 h-9 px-4 rounded-xl bg-brand-500 text-white text-sm font-semibold">
          <Plus size={15} /> Add with AI
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 h-11 rounded-xl border-2 border-zinc-200 focus-within:border-brand-500 px-4 mb-5 bg-white transition-colors">
        <Search size={16} className="text-zinc-400 flex-shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package size={36} className="text-zinc-300 mb-3" />
            <p className="text-sm font-medium text-zinc-500">No products found</p>
            <Link href="/seller/products/new" className="mt-3 text-sm text-brand-600 font-medium">Add your first product →</Link>
          </div>
        ) : (
          filtered.map((product) => (
            <div key={product.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-50 last:border-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.image} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">{product.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-zinc-400">{product.category}</span>
                  <span className="text-[10px] text-zinc-300">·</span>
                  <span className="text-xs font-semibold text-zinc-700">₹{product.price.toLocaleString()}</span>
                  <span className="text-[10px] text-zinc-300">·</span>
                  <Star size={9} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs text-zinc-500">{product.rating} ({product.reviews})</span>
                  {product.stock === 0 && (
                    <span className="text-[10px] font-medium bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full">Out of stock</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(product.id)} className={cn("transition-colors", product.active ? "text-brand-500" : "text-zinc-300")}>
                  {product.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
                <Link href={`/seller/products/${product.id}/edit`} className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 hover:bg-zinc-100">
                  <Edit2 size={14} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
