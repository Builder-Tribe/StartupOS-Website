"use client";

import { useCompareStore } from "@/lib/store/useCompareStore";
import { Scale, X, ArrowRight, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

export function CompareBar() {
  const router = useRouter();
  const { items, removeItem, clearCompare, setIsOpen } = useCompareStore();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-in fade-in slide-in-from-bottom-6 duration-300">
      <div className="bg-zinc-900/95 text-white backdrop-blur-2xl border border-zinc-700/60 shadow-2xl rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3">
        {/* Thumbnails list */}
        <div className="flex items-center gap-2.5 overflow-x-auto py-0.5 no-scrollbar">
          {items.map((item) => (
            <div key={item.id} className="relative group shrink-0">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700">
                <Image
                  src={item.images[0] || "https://images.unsplash.com/photo-1594938298603-c8148c4f4f3c?w=100&q=70"}
                  alt={item.title}
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-600 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors shadow-md"
                title="Remove item"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {/* Empty slot placeholders */}
          {Array.from({ length: 4 - items.length }).map((_, idx) => (
            <div
              key={idx}
              className="w-11 h-11 rounded-xl border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-600 shrink-0 text-xs font-mono"
            >
              +{idx + 1}
            </div>
          ))}
        </div>

        {/* CTA & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => clearCompare()}
            className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Clear all comparison items"
          >
            <Trash2 size={16} />
          </button>

          {items.length >= 2 ? (
            <button
              onClick={() => {
                setIsOpen(true);
                router.push("/compare");
              }}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-brand-500/20 hover:from-brand-600 hover:to-emerald-600 transition-all active:scale-95"
            >
              <Scale size={15} />
              Compare ({items.length})
              <ArrowRight size={14} />
            </button>
          ) : (
            <span className="text-xs text-zinc-400 font-medium px-2 py-1 bg-zinc-800/80 rounded-lg">
              Add 1+ to compare
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
