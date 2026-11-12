"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProduct } from "@/lib/catalog";

export interface CartItem {
  slug: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  ready: boolean;
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartState | null>(null);
const KEY = "eloria-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        setItems(parsed.filter((i) => getProduct(i.slug) && i.quantity > 0));
      }
    } catch {
      /* storage unavailable */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items, ready]);

  const add = useCallback((slug: string, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === slug);
      if (existing) return prev.map((i) => (i.slug === slug ? { ...i, quantity: Math.min(20, i.quantity + quantity) } : i));
      return [...prev, { slug, quantity }];
    });
  }, []);
  const setQuantity = useCallback((slug: string, quantity: number) => {
    setItems((prev) => (quantity <= 0 ? prev.filter((i) => i.slug !== slug) : prev.map((i) => (i.slug === slug ? { ...i, quantity: Math.min(20, quantity) } : i))));
  }, []);
  const remove = useCallback((slug: string) => setItems((prev) => prev.filter((i) => i.slug !== slug)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartState>(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotalCents = items.reduce((s, i) => s + (getProduct(i.slug)?.priceCents ?? 0) * i.quantity, 0);
    return { items, count, subtotalCents, ready, add, setQuantity, remove, clear };
  }, [items, ready, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
