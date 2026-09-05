"use client";

import { cn } from "@/lib/cn";
import type { ProductVariant } from "@/lib/types";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedId: string | undefined;
  onSelect: (variant: ProductVariant) => void;
  type: "size" | "color";
}

export function VariantSelector({ variants, selectedId, onSelect, type }: VariantSelectorProps) {
  const label = type === "size" ? "Size" : "Colour";
  const getValue = (v: ProductVariant) => (type === "size" ? v.size : v.color) ?? "";

  const grouped = Array.from(new Map(variants.map((v) => [getValue(v), v])).values());

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-sm font-semibold text-zinc-900">{label}</p>
        {selectedId && (
          <span className="text-sm text-zinc-500">
            {getValue(variants.find((v) => v.id === selectedId)!)}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {grouped.map((v) => {
          const value = getValue(v);
          const isSelected = v.id === selectedId;
          const outOfStock = v.stock_count === 0;

          return (
            <button
              key={v.id}
              onClick={() => !outOfStock && onSelect(v)}
              disabled={outOfStock}
              className={cn(
                "relative px-3 py-1.5 rounded-xl text-sm font-medium border transition-all",
                isSelected
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : outOfStock
                  ? "border-zinc-200 text-zinc-300 cursor-not-allowed line-through"
                  : "border-zinc-200 text-zinc-700 hover:border-zinc-400"
              )}
            >
              {value}
              {outOfStock && (
                <span className="sr-only">(Out of stock)</span>
              )}
            </button>
          );
        })}
      </div>
      {selectedId && (
        <p className="text-xs text-zinc-500 mt-1.5">
          {(() => {
            const v = variants.find((v) => v.id === selectedId);
            if (!v) return null;
            if (v.stock_count === 0) return "Out of stock";
            if (v.stock_count <= 3) return `Only ${v.stock_count} left`;
            return null;
          })()}
        </p>
      )}
    </div>
  );
}
