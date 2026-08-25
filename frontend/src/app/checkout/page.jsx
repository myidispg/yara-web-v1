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

    // Address state
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: "home", line1: "", line2: "", city: "", state: "", pincode: "",
    });

    // Payment state
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

    // Redirect guests to login
    useEffect(() => {
        if (mounted && !authLoading && !user) {
            router.push("/auth?next=/checkout");
        }
    }, [mounted, authLoading, user, router]);

    // Load saved addresses once user is available
    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const { data } = await api.get("/addresses/");
                const addresses = data.results || data;
                setSavedAddresses(addresses);
                // Pre-select default address (or first one)
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
        const addressPayload = {
            label: "home",
            full_name: `${form.first_name} ${form.last_name}`.trim(),
            phone: form.phone,
            line1: form.address,
            line2: form.landmark ?? "",
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            is_default: true,
        };
        const { data: addressData } = await api.post("/addresses/", addressPayload);
        const addressId = addressData.id;

        const orderPayload = { address: addressId, payment_method: method, items: itemsPayload };
        const { data } = await api.post("/orders/", orderPayload);
        clear();

        // Only show Dialog 2 if there are UNEXPECTED MTO items (stock changed after preview)
        const unexpectedMto = (data.mto_items || []).filter(item => !expectedMtoItems.includes(item));

        if (unexpectedMto.length > 0) {
            setMtoDialog({ orderNumber: data.order_number ?? `#YARA-${data.id}`, items: unexpectedMto, preOrder: false });
        } else {
            setPlaced({ number: data.order_number ?? `#YARA-${data.id ?? Math.floor(100000 + Math.random() * 900000)}` });
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
            await submitOrder(itemsPayload);
        } catch (err) {
            handleOrderError(err);
            setPlacing(false);
        }
    };

    if (!mounted || authLoading) return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
            <h1 className="text-4xl font-serif mb-2">Secure Checkout</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 mb-10">Loading…</p>
        </div>
    );

    const emiPerMonth = Math.ceil(subtotal / 6);

    /* ── MTO Dialog ── */
    if (mtoDialog)
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-hero max-w-lg w-full p-8 md:p-10 text-center">
                    <span className="w-12 h-12 mx-auto rounded-full bg-gold/10 text-gold-dark flex items-center justify-center mb-4">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                    </span>
                    <h2 className="font-serif text-2xl md:text-3xl text-ink mb-3">
                        {mtoDialog.preOrder ? "Before You Place This Order" : "Crafting Your Jewellery"}
                    </h2>
                    <p className="text-sm text-ink/60 mb-6 leading-relaxed">
                        {mtoDialog.preOrder
                            ? <>One or more items in your bag are currently out of physical stock. If you proceed, we will handcraft them for you in our <span className="font-semibold text-gold-dark">Made-to-Order</span> queue.</>
                            : <>One or more items in your order were out of physical stock at the time of checkout. We have automatically placed them in our <span className="font-semibold text-gold-dark">Made-to-Order</span> fabrication queue.</>}
                    </p>
                    <div className="bg-cream rounded-xl p-4 text-left mb-6 max-h-48 overflow-y-auto border border-line">
                        <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/50 mb-2">Items Being Crafted:</p>
                        <ul className="space-y-1.5">
                            {mtoDialog.items.map((item, idx) => (
                                <li key={idx} className="text-sm text-ink flex items-start gap-2">
                                    <span className="text-gold-dark mt-1 text-[10px]">◆</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <p className="text-xs text-ink/50 mb-8">
                        These pieces will be handcrafted and shipped within <span className="font-semibold text-ink">10–12 days</span>. Any in-stock items will ship immediately.
                    </p>
                    {mtoDialog.preOrder ? (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => { setMtoDialog(null); router.push("/cart"); }} className="btn-outline flex-1">Edit My Bag</button>
                            <button
                                onClick={async () => {
                                    const payload = mtoDialog.itemsPayload;
                                    const expected = mtoDialog.items; // These were already confirmed
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
                                className="btn-solid flex-1"
                            >
                                Proceed & Place Order
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => { setPlaced({ number: mtoDialog.orderNumber }); setMtoDialog(null); }} className="btn-solid w-full">
                            Continue to Order Confirmation
                        </button>
                    )}
                </div>
            </div>
        );

    if (placed)
        return (
            <div className="max-w-3xl mx-auto px-6 py-24 text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gold-dark mb-3">Order Confirmed</p>
                <h1 className="text-5xl font-serif mb-4">Thank You For Your Order!</h1>
                <p className="text-sm text-charcoal/70 mb-10 leading-relaxed">
                    Your order <span className="font-medium text-charcoal">{placed.number}</span> has been confirmed and is fully insured.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/account" className="btn-solid">Track Order</Link>
                    <Link href="/" className="btn-outline">Continue Shopping</Link>
                </div>
            </div>
        );

    if (!items.length)
        return (
            <div className="max-w-3xl mx-auto px-6 py-24 text-center">
                <h1 className="text-3xl font-serif mb-6">Nothing to checkout</h1>
                <Link href="/" className="btn-outline inline-block">Return Home</Link>
            </div>
        );

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
            <h1 className="text-4xl font-serif mb-2">Secure Checkout</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 mb-10">
                1. Delivery Address — 2. Payment Method (INR)
            </p>

            <form onSubmit={placeOrder} className="flex flex-col lg:flex-row gap-12 items-start">
                <div className="flex-1 w-full space-y-12">

                    {/* ── Contact Info (read-only from profile) ── */}
                    <section>
                        <h2 className="font-serif text-xl mb-4">Contact Details</h2>
                        <div className="grid sm:grid-cols-2 gap-4 bg-cream rounded-xl p-6 border border-line">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-charcoal/50">Name</p>
                                <p className="text-sm font-medium mt-1">{user?.first_name} {user?.last_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-charcoal/50">Email</p>
                                <p className="text-sm font-medium mt-1">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-charcoal/50">Phone</p>
                                <p className="text-sm font-medium mt-1">{user?.phone || "—"}</p>
                            </div>
                            <div className="flex items-end">
                                <Link href="/account" className="text-xs text-gold-dark font-semibold hover:text-ink">Edit in My Account →</Link>
                            </div>
                        </div>
                    </section>

                    {/* ── Delivery Address ── */}
                    <section>
                        <h2 className="font-serif text-xl mb-4">Delivery Address</h2>

                        {/* Saved addresses */}
                        {savedAddresses.length > 0 && (
                            <div className="space-y-3 mb-4">
                                {savedAddresses.map((addr) => (
                                    <label
                                        key={addr.id}
                                        className={`block border rounded-xl p-5 cursor-pointer transition-colors ${!useNewAddress && selectedAddressId === addr.id
                                            ? "border-gold bg-cream shadow-card"
                                            : "border-charcoal/15 hover:border-gold/50"
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <input
                                                type="radio"
                                                name="address"
                                                checked={!useNewAddress && selectedAddressId === addr.id}
                                                onChange={() => { setSelectedAddressId(addr.id); setUseNewAddress(false); }}
                                                className="mt-1 accent-[#B08D3E]"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-semibold capitalize">{addr.label || "Home"}</span>
                                                    {addr.is_default && (
                                                        <span className="text-[9px] bg-gold-dark text-white px-2 py-0.5 rounded-full uppercase tracking-wide">Default</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-charcoal/70">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                                                <p className="text-sm text-charcoal/70">{addr.city}, {addr.state} — {addr.pincode}</p>
                                            </div>
                                        </div>
                                    </label>
                                ))}

                                {/* Option: Use a new address */}
                                <label
                                    className={`block border rounded-xl p-5 cursor-pointer transition-colors ${useNewAddress ? "border-gold bg-cream shadow-card" : "border-charcoal/15 hover:border-gold/50"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="radio"
                                            name="address"
                                            checked={useNewAddress}
                                            onChange={() => setUseNewAddress(true)}
                                            className="accent-[#B08D3E]"
                                        />
                                        <span className="text-sm font-semibold">+ Deliver to a new address</span>
                                    </div>
                                </label>
                            </div>
                        )}

                        {/* New address form (shown when no saved addresses OR user selects "new") */}
                        {(useNewAddress || savedAddresses.length === 0) && (
                            <div className="grid sm:grid-cols-2 gap-6 border border-line rounded-xl p-6 bg-white">
                                <label className="block sm:col-span-2">
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-charcoal/60">Address Label</span>
                                    <select
                                        value={newAddress.label}
                                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                                        className="w-full bg-transparent border-b border-charcoal/25 py-2 text-sm focus:outline-none focus:border-gold"
                                    >
                                        <option value="home">Home</option>
                                        <option value="office">Office</option>
                                        <option value="other">Other</option>
                                    </select>
                                </label>

                                <label className="block sm:col-span-2">
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-charcoal/60">Address Line 1 *</span>
                                    <input
                                        required
                                        value={newAddress.line1}
                                        onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                                        placeholder="House no., Street, Area"
                                        className="w-full bg-transparent border-b border-charcoal/25 py-2 text-sm focus:outline-none focus:border-gold"
                                    />
                                </label>

                                <label className="block sm:col-span-2">
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-charcoal/60">Landmark (Optional)</span>
                                    <input
                                        value={newAddress.line2}
                                        onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                                        placeholder="Near metro station, opposite mall…"
                                        className="w-full bg-transparent border-b border-charcoal/25 py-2 text-sm focus:outline-none focus:border-gold"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-charcoal/60">State *</span>
                                    <select
                                        required
                                        value={newAddress.state}
                                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                        className="w-full bg-transparent border-b border-charcoal/25 py-2 text-sm focus:outline-none focus:border-gold"
                                    >
                                        <option value="">Select State</option>
                                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </label>

                                <label className="block">
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-charcoal/60">City / Town *</span>
                                    <input
                                        required
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                        className="w-full bg-transparent border-b border-charcoal/25 py-2 text-sm focus:outline-none focus:border-gold"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-charcoal/60">Pincode *</span>
                                    <input
                                        required
                                        value={newAddress.pincode}
                                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                                        className={`w-full bg-transparent border-b py-2 text-sm focus:outline-none ${newAddress.pincode && newAddress.pincode.length !== 6
                                            ? "border-red-500 focus:border-red-500"
                                            : "border-charcoal/25 focus:border-gold"
                                            }`}
                                    />
                                    {newAddress.pincode && newAddress.pincode.length !== 6 && (
                                        <span className="text-[10px] text-red-500 mt-1 block">Valid 6-digit pincode required</span>
                                    )}
                                </label>
                            </div>
                        )}
                    </section>

                    {/* ── Payment Method ── */}
                    <section className="space-y-4">
                        <h2 className="font-serif text-xl mb-2">Payment Method</h2>
                        {[
                            { id: "upi", title: "UPI / QR Code", sub: "Google Pay, PhonePe, Paytm" },
                            { id: "card", title: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay" },
                            { id: "emi", title: "No Cost EMI", sub: `Starting ${inr(emiPerMonth)}/mo` },
                        ].map((m) => (
                            <label
                                key={m.id}
                                className={`block border p-5 cursor-pointer transition-colors ${method === m.id ? "border-gold bg-cream" : "border-charcoal/20 hover:border-gold"}`}
                            >
                                <div className="flex items-center gap-4">
                                    <input type="radio" name="pay" checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-[#B08D3E]" />
                                    <div>
                                        <p className="text-sm font-medium">{m.title}</p>
                                        <p className="text-xs text-charcoal/60">{m.sub}</p>
                                    </div>
                                </div>
                                {method === "upi" && m.id === "upi" && (
                                    <input
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="yourname@upi"
                                        className="mt-4 w-full bg-transparent border-b border-charcoal/25 py-2 text-sm focus:outline-none focus:border-gold"
                                    />
                                )}
                                {method === "emi" && m.id === "emi" && (
                                    <p className="mt-3 text-xs text-charcoal/60">6 monthly instalments of {inr(emiPerMonth)} · 0% interest</p>
                                )}
                            </label>
                        ))}
                    </section>
                </div>

                {/* ── Order Summary ── */}
                <aside className="bg-cream border border-gold/40 p-8 w-full lg:w-96 shrink-0 sticky top-24">
                    <h2 className="font-serif text-2xl mb-6">Summary</h2>
                    <div className="space-y-2 text-sm mb-6">
                        {items.map((i) => {
                            const lineTotal = Number(i.unit_price || 0) * Number(i.qty || 0);
                            return (
                                <div key={i.key} className="flex justify-between gap-4">
                                    <span className="text-charcoal/70">{i.name} <span className="text-charcoal/50">× {i.qty}</span></span>
                                    <span>{inr(lineTotal)}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="border-t border-charcoal/15 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
                        <div className="flex justify-between"><span>Insured Shipping</span><span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gold-dark">FREE</span></div>
                        <div className="flex justify-between font-serif text-xl pt-2">
                            <span>Total</span><span>{inr(subtotal)}</span>
                        </div>
                    </div>

                    {error && <p className="text-xs text-red-700 mt-4">{error}</p>}

                    <button type="submit" disabled={placing || !isAddressValid()} className="btn-solid w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
                        {placing ? "Placing…" : `Place Order (${inr(subtotal)})`}
                    </button>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 text-center mt-4">
                        256-bit SSL · PCI-DSS · Insured Delivery
                    </p>
                </aside>
            </form>
        </div>
    );
}