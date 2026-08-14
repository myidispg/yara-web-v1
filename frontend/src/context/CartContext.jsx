"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "yara_cart";

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
    });

    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);

    /* selection = { karat, gold_color, ring_size, price } */
    const addItem = (product, selection, qty = 1) => {
        const key = `${product.id}:${selection.karat}:${selection.gold_color}:${selection.ring_size ?? "OS"}`;
        setItems((prev) => {
            const existing = prev.find((i) => i.key === key);
            if (existing)
                return prev.map((i) => (i.key === key ? { ...i, qty: Number(i.qty) + Number(qty) } : i));
            return [...prev, {
                key,
                product_id: product.id,
                slug: product.slug,
                name: product.name,
                image: product.media?.[0]?.url ?? "",
                design_code: product.design_code,
                karat: selection.karat,
                gold_color: selection.gold_color,
                ring_size: selection.ring_size ?? null,
                label: `${selection.karat} ${selection.gold_color} Gold${selection.ring_size ? ` | Size ${selection.ring_size}` : ""}`,
                unit_price: Number(selection.price),
                qty: Number(qty),
            }];
        });
    };

    const setQty = (key, qty) =>
        setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Number(qty)) } : i)));

    const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
    const clear = () => setItems([]);

    const { subtotal, count } = useMemo(() => ({
        subtotal: items.reduce((s, i) => s + Number(i.unit_price) * Number(i.qty), 0),
        count: items.reduce((s, i) => s + Number(i.qty), 0),
    }), [items]);

    return (
        <CartContext.Provider value={{ items, addItem, setQty, removeItem, clear, subtotal, count }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);