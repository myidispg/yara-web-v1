import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "yara_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);

  const addItem = (product, variant, qty = 1) => {
    // Create a rock-solid key using slug and variant details to prevent duplicate line items
    const variantKey = variant.id || variant.sku || `${variant.purity}-${variant.gold_color}-${variant.ring_size}`;
    const key = `${product.slug || product.id}:${variantKey}`;
    
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        // Force Number() to prevent string concatenation (e.g. "1" + 1 = "11")
        return prev.map((i) => (i.key === key ? { ...i, qty: Number(i.qty) + Number(qty) } : i));
      }
      return [...prev, {
        key,
        id: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images?.[0]?.url || product.primary_image || null,
        variant: {
          id: variant.id, gold_color: variant.gold_color, purity: variant.purity,
          ring_size: variant.ring_size, price: variant.price, label: variant.label || `${variant.purity} ${variant.gold_color} Gold`,
          stock: Number(variant.stock ?? 0)
        },
        unit_price: Number(variant.price), // Force Number
        qty: Number(qty),                  // Force Number
      }];
    });
  };

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
  
  const setQty = (key, qty) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Number(qty)) } : i)));
    
  const clear = () => setItems([]);

  const { subtotal, count } = useMemo(() => ({
    // Force Number() on both to guarantee accurate multiplication
    subtotal: items.reduce((sum, i) => sum + (Number(i.unit_price || 0) * Number(i.qty || 0)), 0),
    count: items.reduce((sum, i) => sum + Number(i.qty || 0), 0),
  }), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, setQty, clear, subtotal, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);