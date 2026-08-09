import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import usePageTitle from "../utils/usePageTitle";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

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
        full_name: [user?.first_name, user?.last_name].filter(Boolean).join(" "),
        phone: user?.phone ?? "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });
    const [method, setMethod] = useState("upi");
    const [upiId, setUpiId] = useState("");
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState("");
    const [placed, setPlaced] = useState(null);

    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
    const emiPerMonth = Math.ceil(subtotal / 6);

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
        setPlacing(true);
        setError("");
        const payload = {
            items: items.map((i) => ({ product: i.id, variant: i.variant.id, quantity: i.qty })),
            shipping_address: form,
            payment_method: method,
            upi_id: method === "upi" ? upiId : undefined,
        };
        for (const path of ["/orders/create/", "/orders/"]) {
            try {
                const { data } = await api.post(path, payload);
                setPlaced({
                    number: data.order_number ?? data.reference ?? `#YARA-${data.id ?? Math.floor(100000 + Math.random() * 900000)}`,
                });
                clear();
                return;
            } catch (err) {
                setError(
                    Object.values(err.response?.data ?? {}).flat().join(" ") ||
                    "Could not place the order. Please try again."
                );
            }
        }
        setPlacing(false);
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
                        <Field label="Full Name" required value={form.full_name} onChange={set("full_name")} />
                        <Field label="Phone (+91)" required value={form.phone} onChange={set("phone")} />
                        <div className="sm:col-span-2">
                            <Field label="Address" required value={form.address} onChange={set("address")} />
                        </div>
                        <Field label="City" required value={form.city} onChange={set("city")} />
                        <Field label="State" required value={form.state} onChange={set("state")} />
                        <Field label="PIN Code" required value={form.pincode} onChange={set("pincode")} />
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
                        {items.map((i) => (
                            <div key={i.key} className="flex justify-between gap-4">
                                <span className="text-charcoal/70">{i.name} × {i.qty}</span>
                                <span>{inr(i.unit_price * i.qty)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="hairline border-t border-charcoal/15 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
                        <div className="flex justify-between"><span>Insured Shipping</span><span className="micro-label text-gold">FREE</span></div>
                        <div className="flex justify-between font-serif text-xl pt-2">
                            <span>Total</span><span>{inr(subtotal)}</span>
                        </div>
                    </div>

                    {error && <p className="text-xs text-red-700 mt-4">{error}</p>}

                    <button type="submit" disabled={placing} className="btn-solid w-full mt-6 disabled:opacity-50">
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