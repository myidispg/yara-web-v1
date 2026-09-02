"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function CartPage() {
    const { items, setQty, removeItem, subtotal, count } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.title = "Shopping Bag | YA-RA Jewels";
    }, []);

    const emptyState = (
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
            <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">your selected favourites</span>
            <h1 className="font-serif-luxury text-4xl sm:text-5xl font-normal text-[#1A2536] mb-4">Your Bag is Empty</h1>
            <p className="text-sm text-[#1A2536]/60 mb-8 max-w-md mx-auto leading-relaxed">
                Discover certified natural diamonds, handcrafted in BIS hallmarked gold.
            </p>
            <Link
                href="/"
                className="inline-block px-8 py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl"
            >
                Explore The Collection
            </Link>
        </div>
    );

    if (!mounted) return emptyState;
    if (!items.length) return emptyState;

    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-10">
                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">your selected favourites</span>
                    <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">
                        Shopping Bag <span className="font-sans italic text-[#1A2536]/50 text-2xl font-light">({count} {count === 1 ? "Piece" : "Pieces"})</span>
                    </h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* Items List */}
                    <div className="flex-1 w-full space-y-4">
                        {items.map((i) => (
                            <div key={i.key} className="glass-card-vibrant p-5 rounded-3xl border border-[#E5BDB0]">
                                {/* Mobile Layout: Stacked */}
                                <div className="sm:hidden space-y-4">
                                    <Link href={`/product/${i.slug}`} className="block">
                                        <img src={i.image} alt={i.name} className="w-full h-64 object-cover rounded-2xl border border-[#E5BDB0]/40" />
                                    </Link>
                                    <div className="space-y-2">
                                        <Link href={`/product/${i.slug}`} className="font-serif-luxury text-xl font-semibold text-[#1A2536] hover:underline decoration-[#1A2536] underline-offset-4 transition-all leading-tight block">
                                            {i.name}
                                        </Link>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A2536]/[0.04] border border-[#E5BDB0] text-[10px] font-bold text-[#1A2536] uppercase tracking-wider">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#B86B5A]"></span>
                                            {i.label}
                                        </span>
                                        <p className="text-[10px] uppercase tracking-[0.14em] text-[#1A2536]/50 font-semibold">Design Code: {i.design_code}</p>
                                        <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            100% Certified Natural Diamonds
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-[#E5BDB0]/40">
                                        <p className="font-extrabold text-xl text-[#1A2536]">{inr(i.unit_price * i.qty)}</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center bg-white border border-[#E5BDB0] rounded-full overflow-hidden shadow-sm">
                                                <button
                                                    onClick={() => setQty(i.key, i.qty - 1)}
                                                    disabled={i.qty <= 1}
                                                    className="w-8 h-8 flex items-center justify-center text-[#1A2536] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold"
                                                >
                                                    −
                                                </button>
                                                <span className="w-8 h-8 flex items-center justify-center text-xs font-bold text-[#1A2536] border-x border-[#E5BDB0]">
                                                    {i.qty}
                                                </span>
                                                <button
                                                    onClick={() => setQty(i.key, i.qty + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-[#1A2536] hover:bg-white transition-colors font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(i.key)}
                                                className="text-[10px] uppercase tracking-[0.14em] text-[#1A2536]/50 hover:text-[#B86B5A] font-bold transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Layout: Horizontal */}
                                <div className="hidden sm:flex gap-5 items-center">
                                    <Link href={`/product/${i.slug}`} className="shrink-0">
                                        <img src={i.image} alt={i.name} className="w-28 h-28 object-cover rounded-2xl border border-[#E5BDB0]/40" />
                                    </Link>

                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <Link href={`/product/${i.slug}`} className="font-serif-luxury text-xl font-semibold text-[#1A2536] hover:underline decoration-[#1A2536] underline-offset-4 transition-all leading-tight block">
                                            {i.name}
                                        </Link>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A2536]/[0.04] border border-[#E5BDB0] text-[10px] font-bold text-[#1A2536] uppercase tracking-wider">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#B86B5A]"></span>
                                            {i.label}
                                        </span>
                                        <p className="text-[10px] uppercase tracking-[0.14em] text-[#1A2536]/50 font-semibold">Design Code: {i.design_code}</p>
                                        <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 pt-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            100% Certified Natural Diamonds
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 shrink-0">
                                        <p className="font-extrabold text-lg text-[#1A2536]">{inr(i.unit_price * i.qty)}</p>
                                        <div className="flex items-center bg-white border border-[#E5BDB0] rounded-full overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => setQty(i.key, i.qty - 1)}
                                                disabled={i.qty <= 1}
                                                className="w-8 h-8 flex items-center justify-center text-[#1A2536] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold"
                                            >
                                                −
                                            </button>
                                            <span className="w-8 h-8 flex items-center justify-center text-xs font-bold text-[#1A2536] border-x border-[#E5BDB0]">
                                                {i.qty}
                                            </span>
                                            <button
                                                onClick={() => setQty(i.key, i.qty + 1)}
                                                className="w-8 h-8 flex items-center justify-center text-[#1A2536] hover:bg-white transition-colors font-bold"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeItem(i.key)}
                                            className="text-[10px] uppercase tracking-[0.14em] text-[#1A2536]/50 hover:text-[#B86B5A] font-bold transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <aside className="glass-card-vibrant p-6 sm:p-8 rounded-3xl border border-[#E5BDB0] w-full lg:w-[380px] shrink-0 lg:sticky lg:top-24 space-y-6">
                        <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Order Summary</h2>

                        <div className="space-y-3 text-sm border-b border-[#E5BDB0]/40 pb-6">
                            <div className="flex justify-between">
                                <span className="text-[#1A2536]/70">Subtotal</span>
                                <span className="font-bold text-[#1A2536]">{inr(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#1A2536]/70">Safe and Secure Delivery</span>
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">FREE</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#1A2536]/70">GST (3%)</span>
                                <span className="text-[#1A2536]/50 text-xs font-semibold">Included</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-baseline">
                            <span className="font-serif-luxury text-xl text-[#1A2536]">Total Payable</span>
                            <span className="font-extrabold text-2xl text-[#1A2536]">{inr(subtotal)}</span>
                        </div>

                        <button
                            onClick={() => router.push(user ? "/checkout" : "/auth?next=/checkout")}
                            className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                            <span>Proceed To Secure Checkout</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>

                        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E5BDB0]/40">
                            <div className="text-center">
                                <p className="text-[9px] font-bold text-[#1A2536] uppercase tracking-wider">Hallmarked</p>
                                <p className="text-[8px] text-[#1A2536]/50 mt-0.5">BIS Hallmarked Gold</p>
                            </div>
                            <div className="text-center border-x border-[#E5BDB0]/40">
                                <p className="text-[9px] font-bold text-[#1A2536] uppercase tracking-wider">Certified</p>
                                <p className="text-[8px] text-[#1A2536]/50 mt-0.5">IGI / SGL / GIA</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[9px] font-bold text-[#1A2536] uppercase tracking-wider">Fine Luxury</p>
                                <p className="text-[8px] text-[#1A2536]/50 mt-0.5">At Affordable Prices</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}