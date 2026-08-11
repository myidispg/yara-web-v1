import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import usePageTitle from "../utils/usePageTitle";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const Field = ({ label, ...props }) => (
    <label className="block">
        <span className="micro-label text-charcoal/60">{label}</span>
        <input
            {...props}
            className="w-full bg-transparent border-b border-charcoal/25 py-2 text-sm focus:outline-none focus:border-gold"
        />
    </label>
);

export default function CheckoutPage() {
    const { items, subtotal, clear } = useCart();
    const { user } = useAuth();

    usePageTitle("Secure Checkout");

    const [form, setForm] = useState({
        first_name: user?.first_name ?? "",
        last_name: user?.last_name ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        address: "",
        landmark: "",
        country: "India",
        state: "",
        city: "",
        pincode: "",
    });
    const [method, setMethod] = useState("upi");
    const [upiId, setUpiId] = useState("");
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState("");
    const [placed, setPlaced] = useState(null);

    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
    const emiPerMonth = Math.ceil(subtotal / 6);

    const isFormValid = () => {
        if (!form.first_name || !form.last_name || !form.email || !form.phone || !form.address || !form.state || !form.city || !form.pincode) return false;
        if (form.pincode.length !== 6) return false;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return false;
        if (!/^[6-9]\d{9}$/.test(form.phone)) return false;
        return true;
    };

    /* ── Confirmation screen ── */
    if (placed)
        return (
            <div className="max-w-3xl mx-auto px-6 py-24 text-center">
                <p className="eyebrow mb-3">Order Confirmed</p>
                <h1 className="text-5xl font-serif mb-4">Thank You For Your Order!</h1>
                <p className="text-sm text-charcoal/70 mb-10 leading-relaxed">
                    Your order <span className="font-medium text-charcoal">{placed.number}</span> has been
                    confirmed and is fully insured.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/account" className="btn-solid">Track Order</Link>
                    <Link to="/" className="btn-outline">Continue Shopping</Link>
                </div>
            </div>
        );

    if (!items.length)
        return (
            <div className="max-w-3xl mx-auto px-6 py-24 text-center">
                <h1 className="text-3xl font-serif mb-6">Nothing to checkout</h1>
                <Link to="/" className="btn-outline inline-block">Return Home</Link>
            </div>
        );

    const placeOrder = async (e) => {
        e.preventDefault();
        if (!isFormValid()) {
            setError("Please ensure all required fields are filled correctly.");
            return;
        }
        setPlacing(true);
        setError("");
        try {
            /* ── Step 1: save the delivery address ── */
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
            let addressId = null;
            let addressErr = null;
            for (const path of ["/addresses/", "/orders/addresses/"]) {
                try {
                    const { data } = await api.post(path, addressPayload);
                    addressId = data.id;
                    break;
                } catch (err) { addressErr = err; }
            }
            if (!addressId) throw addressErr ?? new Error("Could not save the address.");

            /* ── Step 2: place the order with the address ID ── */
            const orderPayload = {
                address: addressId,
                payment_method: method,
                items: items.map((i) => ({ variant: i.variant.id, quantity: i.qty })),
            };
            const { data } = await api.post("/orders/", orderPayload);
            setPlaced({
                number: data.order_number ?? `#YARA-${data.id ?? Math.floor(100000 + Math.random() * 900000)}`,
            });
            clear();
        } catch (err) {
            const d = err.response?.data ?? {};
            setError(
                Object.entries(d)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : (typeof v === "object" ? JSON.stringify(v) : v)}`)
                    .join(" · ") ||
                "Could not place the order. Please try again."
            );
            setPlacing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
            <h1 className="text-4xl font-serif mb-2">Secure Checkout</h1>
            <p className="micro-label text-charcoal/50 mb-10">
                1. Delivery Address&nbsp;&nbsp;—&nbsp;&nbsp;2. Payment Method (INR)
            </p>

            <form onSubmit={placeOrder} className="grid lg:grid-cols-[1fr_380px] gap-12">
                <div className="space-y-12">
                    {/* Address */}
                    <section className="grid sm:grid-cols-2 gap-6">
                        <Field label="First Name" required value={form.first_name} onChange={set("first_name")} />
                        <Field label="Last Name" required value={form.last_name} onChange={set("last_name")} />
                        <Field label="Email Address" type="email" required value={form.email} onChange={set("email")} />

                        <label className="block">
                            <span className="micro-label text-charcoal/60">Phone (+91)</span>
                            <input
                                type="tel"
                                required
                                value={form.phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setForm({ ...form, phone: val });
                                }}
                                className={`w-full bg-transparent border-b py-2 text-sm focus:outline-none ${form.phone && form.phone.length !== 10 ? 'border-red-500 focus:border-red-500' : 'border-charcoal/25 focus:border-gold'
                                    }`}
                            />
                            {form.phone && form.phone.length !== 10 && (
                                <span className="micro-label text-red-500 mt-1 block">Valid 10-digit number required</span>
                            )}
                        </label>

                        <div className="sm:col-span-2">
                            <Field label="Address" required value={form.address} onChange={set("address")} />
                        </div>

                        <div className="sm:col-span-2">
                            <Field label="Landmark (Optional)" value={form.landmark} onChange={set("landmark")} />
                        </div>

                        <label className="block">
                            <span className="micro-label text-charcoal/60">Country</span>
                            <input
                                type="text"
                                value="India"
                                disabled
                                className="w-full bg-transparent border-b border-charcoal/10 py-2 text-sm text-charcoal/50 cursor-not-allowed"
                            />
                        </label>

                        <label className="block">
                            <span className="micro-label text-charcoal/60">State</span>
                            <select
                                value={form.state}
                                onChange={set("state")}
                                className="w-full bg-transparent border-b border-charcoal/25 py-2 text-sm focus:outline-none focus:border-gold"
                            >
                                <option value="">Select State</option>
                                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </label>

                        <Field label="City / Town" required value={form.city} onChange={set("city")} />

                        <label className="block">
                            <span className="micro-label text-charcoal/60">Pincode</span>
                            <input
                                type="text"
                                required
                                value={form.pincode}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setForm({ ...form, pincode: val });
                                }}
                                className={`w-full bg-transparent border-b py-2 text-sm focus:outline-none ${form.pincode && form.pincode.length !== 6 ? 'border-red-500 focus:border-red-500' : 'border-charcoal/25 focus:border-gold'
                                    }`}
                            />
                            {form.pincode && form.pincode.length !== 6 && (
                                <span className="micro-label text-red-500 mt-1 block">Valid 6-digit pincode required</span>
                            )}
                        </label>
                    </section>

                    {/* Payment */}
                    <section className="space-y-4">
                        {[
                            { id: "upi", title: "UPI / QR Code", sub: "Google Pay, PhonePe, Paytm" },
                            { id: "card", title: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay" },
                            { id: "emi", title: `No Cost EMI`, sub: `Starting ${inr(emiPerMonth)}/mo` },
                        ].map((m) => (
                            <label
                                key={m.id}
                                className={`block border p-5 cursor-pointer transition-colors ${method === m.id ? "border-gold bg-cream" : "border-charcoal/20 hover:border-gold"
                                    }`}
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
                                    <p className="mt-3 text-xs text-charcoal/60">
                                        6 monthly instalments of {inr(emiPerMonth)} · 0% interest
                                    </p>
                                )}
                            </label>
                        ))}
                    </section>
                </div>

                {/* Summary */}
                <aside className="bg-cream border border-gold/40 p-8 h-fit">
                    <h2 className="font-serif text-2xl mb-6">Summary</h2>
                    <div className="space-y-2 text-sm mb-6">
                        {items.map((i) => {
                            // Force Number() here as well to guarantee the line total is correct
                            const lineTotal = Number(i.unit_price || 0) * Number(i.qty || 0);
                            return (
                                <div key={i.key} className="flex justify-between gap-4">
                                    <span className="text-charcoal/70">{i.name} <span className="text-charcoal/50">× {i.qty}</span></span>
                                    <span>{inr(lineTotal)}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="hairline border-t border-charcoal/15 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
                        <div className="flex justify-between"><span>Insured Shipping</span><span className="micro-label text-gold">FREE</span></div>
                        <div className="flex justify-between font-serif text-xl pt-2">
                            <span>Total</span><span>{inr(subtotal)}</span>
                        </div>
                    </div>

                    {error && <p className="text-xs text-red-700 mt-4">{error}</p>}

                    <button type="submit" disabled={placing || !isFormValid()} className="btn-solid w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
                        {placing ? "Placing…" : `Place Insured Order (${inr(subtotal)})`}
                    </button>
                    <p className="micro-label text-charcoal/50 text-center mt-4">
                        256-bit SSL · PCI-DSS · Insured Delivery
                    </p>
                </aside>
            </form>
        </div>
    );
}