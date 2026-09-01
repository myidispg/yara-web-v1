"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/api/client";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function CheckoutPage() {
    const { items, subtotal, clear } = useCart();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: "home", line1: "", line2: "", city: "", state: "", pincode: "",
    });

    const [method, setMethod] = useState("upi");
    const [upiId, setUpiId] = useState("");
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState("");
    const [placed, setPlaced] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [mtoDialog, setMtoDialog] = useState(null);

    useEffect(() => {
        document.title = "Secure Checkout | YA-RA Jewels";
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !authLoading && !user) {
            router.push("/auth?next=/checkout");
        }
    }, [mounted, authLoading, user, router]);

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const { data } = await api.get("/addresses/");
                const addresses = data.results || data;
                setSavedAddresses(addresses);
                const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr.id);
                    setUseNewAddress(false);
                } else {
                    setUseNewAddress(true);
                }
            } catch (err) {
                console.error("Failed to load addresses:", err);
                setUseNewAddress(true);
            }
        })();
    }, [user]);

    const buildItemsPayload = () =>
        items.map((i) => ({
            design: i.product_id,
            karat: i.karat,
            gold_color: i.gold_color,
            ring_size: i.ring_size,
            quantity: i.qty,
        }));

    const handleOrderError = (err) => {
        const status = err.response?.status;
        const d = err.response?.data ?? {};
        let msg;
        if (status === 401 || status === 403) {
            msg = "Please log in or create an account to place an order. Redirecting…";
            setError(msg);
            setTimeout(() => router.push("/auth?next=/checkout"), 1500);
            return;
        } else if (status === 400 && typeof d === "object") {
            if (d.items && Array.isArray(d.items)) {
                msg = d.items.join(" ");
            } else {
                msg = Object.entries(d)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : (typeof v === "object" ? JSON.stringify(v) : v)}`)
                    .join(" · ");
            }
        } else {
            msg = d?.detail || "Could not place the order. Please try again.";
        }
        setError(msg);
    };

    const submitOrder = async (itemsPayload, expectedMtoItems = []) => {
        let addressId = selectedAddressId;

        if (useNewAddress) {
            const addressPayload = {
                label: newAddress.label,
                line1: newAddress.line1,
                line2: newAddress.line2 || "",
                city: newAddress.city,
                state: newAddress.state,
                pincode: newAddress.pincode,
            };
            const { data: addressData } = await api.post("/addresses/", addressPayload);
            addressId = addressData.id;
        }

        const orderPayload = { address: addressId, payment_method: method, items: itemsPayload };
        const { data } = await api.post("/orders/", orderPayload);
        clear();

        const orderNumber = data.order_number ?? `#YARA-${data.id ?? Math.floor(100000 + Math.random() * 900000)}`;

        const normalize = (str) => str.replace(/\s*\([^\)]+\)\s*$/, '').trim();
        const normalizedExpected = expectedMtoItems.map(normalize);

        const unexpectedMto = (data.mto_items || []).filter(item => {
            return !normalizedExpected.includes(normalize(item));
        });

        if (unexpectedMto.length > 0) {
            setMtoDialog({ orderNumber, items: unexpectedMto, preOrder: false });
        } else {
            setPlaced({ number: orderNumber });
        }
    };

    const isAddressValid = () => {
        if (!useNewAddress) return !!selectedAddressId;
        return !!(newAddress.line1 && newAddress.city && newAddress.state && newAddress.pincode && newAddress.pincode.length === 6);
    };

    const placeOrder = async (e) => {
        e.preventDefault();
        if (!isAddressValid()) {
            setError("Please select or enter a delivery address.");
            return;
        }
        setPlacing(true);
        setError("");
        try {
            const itemsPayload = buildItemsPayload();
            const { data: preview } = await api.post("/orders/preview/", { items: itemsPayload });

            if (preview?.mto_items?.length) {
                setMtoDialog({ items: preview.mto_items, preOrder: true, itemsPayload });
                setPlacing(false);
                return;
            }

            await submitOrder(itemsPayload, false);
        } catch (err) {
            handleOrderError(err);
            setPlacing(false);
        }
    };

    if (!mounted || authLoading) return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <span className="font-cursive text-3xl text-[#D88C7D] block -mb-1">preparing your order</span>
            <h1 className="font-serif-luxury text-4xl font-normal text-[#1A2536] mb-2">Secure Checkout</h1>
            <p className="text-sm text-[#1A2536]/50">Loading your details…</p>
        </div>
    );

    const emiPerMonth = Math.ceil(subtotal / 6);

    if (mtoDialog)
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2536]/60 backdrop-blur-sm">
                <div className="glass-card-vibrant max-w-lg w-full p-8 md:p-10 text-center rounded-3xl border border-[#E5BDB0] shadow-2xl">
                    <span className="w-14 h-14 mx-auto rounded-full bg-[#D88C7D]/10 text-[#D88C7D] flex items-center justify-center mb-4">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                    </span>
                    <h2 className="font-serif-luxury text-2xl md:text-3xl text-[#1A2536] mb-3">
                        {mtoDialog.preOrder ? "Before You Place This Order" : "Crafting Your Jewellery"}
                    </h2>
                    <p className="text-sm text-[#1A2536]/60 mb-6 leading-relaxed">
                        {mtoDialog.preOrder
                            ? <>One or more items in your bag are currently out of physical stock. If you proceed, we will handcraft them for you on a <span className="font-semibold text-[#1A2536]">Made-to-Order</span> basis.</>
                            : <>One or more items in your order went out of stock just as you were checking out. We have automatically placed them in our <span className="font-semibold text-[#1A2536]">Made-to-Order</span> fabrication queue. Your order is confirmed.</>}
                    </p>

                    <div className="bg-white rounded-2xl p-4 text-left mb-6 max-h-48 overflow-y-auto border border-[#E5BDB0]">
                        <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/50 mb-2">Items Being Crafted:</p>
                        <ul className="space-y-1.5">
                            {mtoDialog.items.map((item, idx) => (
                                <li key={idx} className="text-sm text-[#1A2536] flex items-start gap-2">
                                    <span className="text-[#D4AF37] mt-1 text-[10px]">◆</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="text-xs text-[#1A2536]/50 mb-8">
                        These pieces will be handcrafted and shipped within <span className="font-semibold text-[#1A2536]">10–12 days</span>. Any in-stock items will ship immediately.
                    </p>

                    {mtoDialog.preOrder ? (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => { setMtoDialog(null); router.push("/cart"); }} className="flex-1 py-3.5 border-2 border-[#D88C7D] text-[#D88C7D] hover:bg-[#D88C7D] hover:text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all">
                                Edit My Bag
                            </button>
                            <button
                                onClick={async () => {
                                    const payload = mtoDialog.itemsPayload;
                                    const expected = mtoDialog.items;
                                    setMtoDialog(null);
                                    setPlacing(true);
                                    setError("");
                                    try {
                                        await submitOrder(payload, expected);
                                    } catch (err) {
                                        handleOrderError(err);
                                        setPlacing(false);
                                    }
                                }}
                                className="flex-1 py-3.5 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl"
                            >
                                Proceed & Place Order
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => { setPlaced({ number: mtoDialog.orderNumber }); setMtoDialog(null); }}
                            className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl"
                        >
                            Continue to Order Confirmation
                        </button>
                    )}
                </div>
            </div>
        );

    if (placed)
        return (
            <div className="max-w-3xl mx-auto px-6 py-24 text-center">
                <span className="font-cursive text-3xl text-[#D88C7D] block -mb-1">order confirmed</span>
                <h1 className="font-serif-luxury text-4xl sm:text-5xl font-normal text-[#1A2536] mb-4">Thank You For Your Order!</h1>
                <p className="text-sm text-[#1A2536]/60 mb-10 leading-relaxed max-w-md mx-auto">
                    Your order <span className="font-bold text-[#1A2536]">{placed.number}</span> has been
                    confirmed and is fully insured for transit.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/account" className="px-8 py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl">Track Order</Link>
                    <Link href="/" className="px-8 py-4 border-2 border-[#D88C7D] text-[#D88C7D] hover:bg-[#D88C7D] hover:text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all">Continue Shopping</Link>
                </div>
            </div>
        );

    if (!items.length)
        return (
            <div className="max-w-3xl mx-auto px-6 py-24 text-center">
                <span className="font-cursive text-3xl text-[#D88C7D] block -mb-1">nothing to checkout</span>
                <h1 className="font-serif-luxury text-4xl font-normal text-[#1A2536] mb-6">Your Shopping Bag is Empty</h1>
                <Link href="/" className="inline-block px-8 py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl">Explore Collection</Link>
            </div>
        );

    return (
        <div className="bg-[#FDFBF7] min-h-screen pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <span className="font-cursive text-3xl text-[#D88C7D] block -mb-1">secure Indian checkout</span>
                    <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">
                        Complete Your Order
                    </h1>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#1A2536]/50 font-bold mt-2">
                        1. Delivery Address — 2. Payment Method (INR)
                    </p>
                </div>

                <form onSubmit={placeOrder} className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                    <div className="flex-1 w-full space-y-8">
                        {/* Contact Info */}
                        <section>
                            <h2 className="font-serif-luxury text-xl sm:text-2xl font-semibold text-[#1A2536] mb-4">Contact Details</h2>
                            <div className="glass-card-vibrant rounded-2xl border border-[#E5BDB0] p-5 sm:p-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/50">Name</p>
                                        <p className="text-sm font-bold text-[#1A2536] mt-1">{user?.first_name} {user?.last_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/50">Email</p>
                                        <p className="text-sm font-bold text-[#1A2536] mt-1">{user?.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/50">Phone</p>
                                        <p className="text-sm font-bold text-[#1A2536] mt-1">{user?.phone || "—"}</p>
                                    </div>
                                    <div className="flex items-end">
                                        <Link href="/account" className="text-xs text-[#D88C7D] font-bold hover:underline">Edit in My Account →</Link>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Delivery Address */}
                        <section>
                            <h2 className="font-serif-luxury text-xl sm:text-2xl font-semibold text-[#1A2536] mb-4">Delivery Address</h2>

                            {savedAddresses.length > 0 && (
                                <div className="space-y-3 mb-4">
                                    {savedAddresses.map((addr) => (
                                        <label
                                            key={addr.id}
                                            className={`block border-2 rounded-2xl p-5 cursor-pointer transition-all ${!useNewAddress && selectedAddressId === addr.id
                                                    ? "border-[#1A2536] bg-white shadow-lg"
                                                    : "border-[#E5BDB0] bg-white/60 hover:border-[#D88C7D]"
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    checked={!useNewAddress && selectedAddressId === addr.id}
                                                    onChange={() => { setSelectedAddressId(addr.id); setUseNewAddress(false); }}
                                                    className="mt-1 accent-[#1A2536]"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-bold capitalize text-[#1A2536]">{addr.label || "Home"}</span>
                                                        {addr.is_default && (
                                                            <span className="text-[9px] bg-[#D4AF37] text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Default</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-[#1A2536]/70">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                                                    <p className="text-sm text-[#1A2536]/70">{addr.city}, {addr.state} — {addr.pincode}</p>
                                                </div>
                                            </div>
                                        </label>
                                    ))}

                                    <label
                                        className={`block border-2 rounded-2xl p-5 cursor-pointer transition-all ${useNewAddress ? "border-[#1A2536] bg-white shadow-lg" : "border-[#E5BDB0] bg-white/60 hover:border-[#D88C7D]"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="radio"
                                                name="address"
                                                checked={useNewAddress}
                                                onChange={() => setUseNewAddress(true)}
                                                className="accent-[#1A2536]"
                                            />
                                            <span className="text-sm font-bold text-[#1A2536]">+ Deliver to a new address</span>
                                        </div>
                                    </label>
                                </div>
                            )}

                            {(useNewAddress || savedAddresses.length === 0) && (
                                <div className="glass-card-vibrant rounded-2xl border border-[#E5BDB0] p-5 sm:p-6">
                                    <div className="space-y-4">
                                        <label className="block">
                                            <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-1.5">Address Label</span>
                                            <select
                                                value={newAddress.label}
                                                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                                                className="w-full bg-white border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536]"
                                            >
                                                <option value="home">Home</option>
                                                <option value="office">Office</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </label>

                                        <label className="block">
                                            <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-1.5">Address Line 1 *</span>
                                            <input
                                                required
                                                value={newAddress.line1}
                                                onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                                                placeholder="House no., Street, Area"
                                                className="w-full bg-white border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536]"
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-1.5">Landmark (Optional)</span>
                                            <input
                                                value={newAddress.line2}
                                                onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                                                placeholder="Near metro station, opposite mall…"
                                                className="w-full bg-white border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536]"
                                            />
                                        </label>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <label className="block">
                                                <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-1.5">State *</span>
                                                <select
                                                    required
                                                    value={newAddress.state}
                                                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                                    className="w-full bg-white border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536]"
                                                >
                                                    <option value="">Select State</option>
                                                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </label>

                                            <label className="block">
                                                <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-1.5">City / Town *</span>
                                                <input
                                                    required
                                                    value={newAddress.city}
                                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                    className="w-full bg-white border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536]"
                                                />
                                            </label>
                                        </div>

                                        <label className="block">
                                            <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-1.5">Pincode *</span>
                                            <input
                                                required
                                                value={newAddress.pincode}
                                                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                                                className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none ${newAddress.pincode && newAddress.pincode.length !== 6
                                                        ? "border-red-500 focus:border-red-500"
                                                        : "border-[#E5BDB0] focus:border-[#1A2536]"
                                                    }`}
                                            />
                                            {newAddress.pincode && newAddress.pincode.length !== 6 && (
                                                <span className="text-[10px] text-red-500 font-semibold block mt-1">Valid 6-digit pincode required</span>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Payment Method */}
                        <section>
                            <h2 className="font-serif-luxury text-xl sm:text-2xl font-semibold text-[#1A2536] mb-4">Payment Method</h2>
                            <div className="space-y-3">
                                {[
                                    { id: "upi", title: "UPI / QR Code", sub: "Google Pay, PhonePe, Paytm" },
                                    { id: "card", title: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay" },
                                    { id: "emi", title: "No Cost EMI", sub: `Starting ${inr(emiPerMonth)}/mo` },
                                ].map((m) => (
                                    <label
                                        key={m.id}
                                        className={`block border-2 rounded-2xl p-5 cursor-pointer transition-all ${method === m.id ? "border-[#1A2536] bg-white shadow-lg" : "border-[#E5BDB0] bg-white/60 hover:border-[#D88C7D]"}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <input type="radio" name="pay" checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-[#1A2536]" />
                                            <div>
                                                <p className="text-sm font-bold text-[#1A2536]">{m.title}</p>
                                                <p className="text-xs text-[#1A2536]/60">{m.sub}</p>
                                            </div>
                                        </div>
                                        {method === "upi" && m.id === "upi" && (
                                            <input
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value)}
                                                placeholder="yourname@upi"
                                                className="mt-4 w-full bg-white border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536]"
                                            />
                                        )}
                                        {method === "emi" && m.id === "emi" && (
                                            <p className="mt-3 text-xs text-[#1A2536]/60 font-semibold">6 monthly instalments of {inr(emiPerMonth)} · 0% interest</p>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Order Summary */}
                    <aside className="glass-card-vibrant rounded-2xl border border-[#E5BDB0] p-5 sm:p-6 w-full lg:w-[380px] shrink-0 lg:sticky lg:top-24 space-y-5">
                        <h2 className="font-serif-luxury text-xl sm:text-2xl font-semibold text-[#1A2536]">Order Summary</h2>
                        <div className="space-y-3 text-sm border-b border-[#E5BDB0]/40 pb-5 max-h-64 overflow-y-auto">
                            {items.map((i) => {
                                const lineTotal = Number(i.unit_price || 0) * Number(i.qty || 0);
                                return (
                                    <div key={i.key} className="flex justify-between gap-4">
                                        <span className="text-[#1A2536]/70">{i.name} <span className="text-[#1A2536]/50">× {i.qty}</span></span>
                                        <span className="font-bold text-[#1A2536] shrink-0">{inr(lineTotal)}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="space-y-3 text-sm border-b border-[#E5BDB0]/40 pb-5">
                            <div className="flex justify-between">
                                <span className="text-[#1A2536]/70">Subtotal</span>
                                <span className="font-bold text-[#1A2536]">{inr(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#1A2536]/70">Insured Pan-India Delivery</span>
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">FREE</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#1A2536]/70">GST (3%)</span>
                                <span className="text-[#1A2536]/50 text-xs font-semibold">Included</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-baseline">
                            <span className="font-serif-luxury text-lg sm:text-xl text-[#1A2536]">Total Payable</span>
                            <span className="font-extrabold text-xl sm:text-2xl text-[#1A2536]">{inr(subtotal)}</span>
                        </div>

                        {error && <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 p-3 rounded-xl">{error}</p>}

                        <button type="submit" disabled={placing || !isAddressValid()} className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {placing ? "Placing Secure Order…" : `Place Order (${inr(subtotal)})`}
                        </button>
                        
                        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E5BDB0]/40">
                            <div className="text-center">
                                <p className="text-[9px] font-bold text-[#1A2536] uppercase tracking-wider">256-bit SSL</p>
                                <p className="text-[8px] text-[#1A2536]/50 mt-0.5">Secure Payment</p>
                            </div>
                            <div className="text-center border-x border-[#E5BDB0]/40">
                                <p className="text-[9px] font-bold text-[#1A2536] uppercase tracking-wider">PCI-DSS</p>
                                <p className="text-[8px] text-[#1A2536]/50 mt-0.5">Protected Data</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[9px] font-bold text-[#1A2536] uppercase tracking-wider">Insured</p>
                                <p className="text-[8px] text-[#1A2536]/50 mt-0.5">Transit Cover</p>
                            </div>
                        </div>
                    </aside>
                </form>
            </div>
        </div>
    );
}