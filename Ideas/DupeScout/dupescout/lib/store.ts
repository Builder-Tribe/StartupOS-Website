"use client";
/**
 * Zustand stores for client-side state.
 * Cart and Orders are persisted to localStorage so they survive page refresh.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, ProductVariant } from "./types";

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  getItem: (productId: string, variantId?: string) => CartItem | undefined;
}

function itemKey(productId: string, variantId?: string) {
  return `${productId}::${variantId ?? "default"}`;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const key = itemKey(product.id, variant?.id);
          const existing = state.items.find(
            (i) => itemKey(i.product.id, i.variant?.id) === key
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.product.id, i.variant?.id) === key
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, variant, quantity }] };
        });
      },

      removeItem: (productId, variantId) => {
        const key = itemKey(productId, variantId);
        set((state) => ({
          items: state.items.filter(
            (i) => itemKey(i.product.id, i.variant?.id) !== key
          ),
        }));
      },

      updateQuantity: (productId, variantId, quantity) => {
        const key = itemKey(productId, variantId);
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) => itemKey(i.product.id, i.variant?.id) !== key
                )
              : state.items.map((i) =>
                  itemKey(i.product.id, i.variant?.id) === key
                    ? { ...i, quantity }
                    : i
                ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, i) =>
            sum + (i.variant?.price ?? i.product.price) * i.quantity,
          0
        ),

      getItem: (productId, variantId) => {
        const key = itemKey(productId, variantId);
        return get().items.find(
          (i) => itemKey(i.product.id, i.variant?.id) === key
        );
      },
    }),
    { name: "ds-cart" }
  )
);

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface PlacedOrder {
  id: string;
  items: CartItem[];
  address: {
    name: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  payment_method: string;
  total: number;
  status: "confirmed" | "shipped" | "delivered" | "cancelled";
  placed_at: string;
  seller_ids: string[];
}

interface OrderStore {
  orders: PlacedOrder[];
  addOrder: (order: PlacedOrder) => void;
  getOrder: (id: string) => PlacedOrder | undefined;
}

export const useOrders = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      getOrder: (id) => get().orders.find((o) => o.id === id),
    }),
    { name: "ds-orders" }
  )
);
