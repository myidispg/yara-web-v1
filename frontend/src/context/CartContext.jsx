import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { variantLabel } from "../utils/format";

const CartContext = createContext(null);
const STORAGE_KEY = "yara_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);

  const addItem = (product, variant, qty = 1) => {
    const key = `${product.id}:${variant.id}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      return [...prev, {
        key,
        id: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images?.[0]?.url || product.primary_image || null,
        carat: product.carat ?? product.carat_weight ?? null,
        variant: {
          id: variant.id, gold_color: variant.gold_color, purity: variant.purity,
          ring_size: variant.ring_size, price: variant.price, label: variantLabel(variant)
        },
        unit_price: variant.price,
        qty,
      }];
    });
  };

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
  const setQty = (key, qty) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)));
  const clear = () => setItems([]);

  const { subtotal, count } = useMemo(() => ({
    subtotal: items.reduce((sum, i) => sum + i.unit_price * i.qty, 0),
    count: items.reduce((sum, i) => sum + i.qty, 0),
  }), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, setQty, clear, subtotal, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);