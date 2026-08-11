import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import usePageTitle from "../utils/usePageTitle";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const Field = ({ label, ...props }) => (
    <label className="block">
        <span className="text-[10px] uppercase tracking-[0.16em] font-medium text-ink/60 mb-1 block">{label}</span>
        <input
            {...props}
            className="w-full bg-transparent border-b border-line py-2.5 text-sm focus:outline-none focus:border-ink transition-colors"
        />
    </label>
);

export default function CheckoutPage() {
    const { items, subtotal, clear } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

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

    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
    const emiPerMonth = Math.ceil(subtotal / 6);

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
                const orderNumber = data.order_number ?? data.reference ?? `#YARA-${data.id ?? Math.floor(100000 + Math.random() * 900000)}`;
                clear();
                navigate(`/order-confirmed/${orderNumber}`);
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
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-12">
            <h1 className="font-serif text-4xl md:text-5xl mb-2">Secure Checkout</h1>
            <p className="text-xs uppercase tracking-[0.16em] text-ink/50 mb-10">
                1. Delivery Address &nbsp;&nbsp;—&nbsp;&nbsp; 2. Payment Method (INR)
            </p>

            <form onSubmit={placeOrder} className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
                <div className="space-y-12">
                    {/* Address */}
                    <section className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
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
                            { id: "emi", title: "No Cost EMI", sub: `Starting ${inr(emiPerMonth)}/mo` },
                        ].map((m) => (
                            <label
                                key={m.id}
                                className={`block border rounded-xl p-5 cursor-pointer transition-all ${method === m.id
                                        ? "border-ink bg-cream shadow-card"
                                        : "border-line bg-white hover:border-ink/40"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <input
                                        type="radio"
                                        name="pay"
                                        checked={method === m.id}
                                        onChange={() => setMethod(m.id)}
                                        className="w-4 h-4 accent-ink"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-ink">{m.title}</p>
                                        <p className="text-xs text-ink/60">{m.sub}</p>
                                    </div>
                                </div>

                                {method === "upi" && m.id === "upi" && (
                                    <input
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="yourname@upi"
                                        className="mt-4 w-full bg-transparent border-b border-line py-2 text-sm focus:outline-none focus:border-ink"
                                    />
                                )}
                                {method === "emi" && m.id === "emi" && (
                                    <p className="mt-3 text-xs text-ink/60 pl-8">
                                        6 monthly instalments of {inr(emiPerMonth)} · 0% interest
                                    </p>
                                )}
                            </label>
                        ))}
                    </section>
                </div>

                {/* Summary */}
                <aside className="bg-cream/40 border border-line rounded-xl p-6 lg:sticky lg:top-32">
                    <h2 className="font-serif text-2xl mb-6">Summary</h2>
                    <div className="space-y-3 text-sm mb-6 max-h-60 overflow-y-auto">
                        {items.map((i) => (
                            <div key={i.key} className="flex justify-between gap-4">
                                <span className="text-ink/70">{i.name} <span className="text-ink/40">× {i.qty}</span></span>
                                <span className="font-medium text-ink">{inr(i.unit_price * i.qty)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-line pt-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-ink/60">Subtotal</span>
                            <span className="font-medium text-ink">{inr(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-ink/60">Insured Shipping</span>
                            <span className="font-semibold text-gold-dark">FREE</span>
                        </div>
                        <div className="flex justify-between text-base pt-2 border-t border-line">
                            <span className="font-semibold text-ink">Total</span>
                            <span className="font-semibold text-ink">{inr(subtotal)}</span>
                        </div>
                    </div>

                    {error && <p className="text-xs text-blush font-medium mt-4">{error}</p>}

                    <button type="submit" disabled={placing} className="btn-solid w-full mt-6 disabled:opacity-50">
                        {placing ? "Placing Insured Order…" : `Place Insured Order (${inr(subtotal)})`}
                    </button>
                    <p className="text-[10px] text-ink/50 text-center mt-4 uppercase tracking-[0.12em]">
                        256-bit SSL · PCI-DSS · Insured Delivery
                    </p>
                </aside>
            </form>
        </div>
    );
}