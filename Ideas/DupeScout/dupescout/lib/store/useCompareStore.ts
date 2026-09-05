import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/types";

interface CompareState {
  items: Product[];
  isOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  clearCompare: () => void;
  setIsOpen: (isOpen: boolean) => void;
  isCompared: (productId: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product) => {
        const { items } = get();
        if (items.some((i) => i.id === product.id)) return;
        if (items.length >= 4) return;
        set({ items: [...items, product] });
      },

      removeItem: (productId) => {
        const { items } = get();
        set({ items: items.filter((i) => i.id !== productId) });
      },

      toggleItem: (product) => {
        const { items, addItem, removeItem } = get();
        if (items.some((i) => i.id === product.id)) {
          removeItem(product.id);
        } else {
          addItem(product);
        }
      },

      clearCompare: () => set({ items: [], isOpen: false }),
      setIsOpen: (isOpen) => set({ isOpen }),
      isCompared: (productId) => get().items.some((i) => i.id === productId),
    }),
    {
      name: "ds_compare_storage",
    }
  )
);
