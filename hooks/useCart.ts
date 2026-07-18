"use client";

// Carrito de tienda persistente (localStorage) — PRD §7.3.
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  slug: string;
  name: string;
  priceUSD: number;
  image: string | null;
  size?: string;
  color?: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (slug: string, size?: string, color?: string) => void;
  updateQty: (slug: string, quantity: number, size?: string, color?: string) => void;
  clear: () => void;
}

function sameVariant(a: CartItem, slug: string, size?: string, color?: string) {
  return a.slug === slug && a.size === size && a.color === color;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) =>
            sameVariant(i, item.slug, item.size, item.color),
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameVariant(i, item.slug, item.size, item.color)
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (slug, size, color) =>
        set((state) => ({
          items: state.items.filter((i) => !sameVariant(i, slug, size, color)),
        })),
      updateQty: (slug, quantity, size, color) =>
        set((state) => ({
          items: state.items.map((i) =>
            sameVariant(i, slug, size, color) ? { ...i, quantity: Math.max(1, quantity) } : i,
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "bts-cart" },
  ),
);

export function cartSubtotal(items: CartItem[]): number {
  return Math.round(items.reduce((sum, i) => sum + i.priceUSD * i.quantity, 0) * 100) / 100;
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
