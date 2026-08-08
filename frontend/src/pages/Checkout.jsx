import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import { inr } from "../utils/format";

const PAYMENT_METHODS = [["upi", "UPI — GPay / PhonePe / Paytm"], ["card", "Credit / Debit card"],
["emi", "No-cost EMI"], ["cod", "Cash on Delivery"]];

const EMPTY = { label: "home", full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" };

export default function CheckoutPage() {
    const { items, subtotal, clear } = useCart();
    const [addresses, setAddresses] = useState([]);
    const [addressId, setAddressId] = useState(null);
    const [payment, setPayment] = useState("upi");
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState("");
    const [placed, setPlaced] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY);

    useEffect(() => {
        api.get("/addresses/").then((r) => {
            const list = r.data.results ?? r.data;
            setAddresses(list);
            setAddressId(list.find((a) => a.is_default)?.id ?? list[0]?.id ?? null);
        }).catch(() => { });
    }, []);

    const saveAddress = async (e) => {
        e.preventDefault();
        const { data } = await api.post("/addresses/", form);
        setAddresses((prev) => [...prev, data]);
        setAddressId(data.id);
        setShowForm(false);
        setForm(EMPTY);
    };

    const placeOrder = async () => {
        if (!addressId) { setError("Please select or add a delivery address."); return; }
        setError(""); setPlacing(true);
        try {
            const { data } = await api.post("/orders/", {
                address: addressId,
                payment_method: payment,
                items: items.map((i) => ({ variant: i.variant.id, quantity: i.qty })),
            });
            setPlaced(data);
            clear();
        } catch (err) {
            const detail = err.response?.data;
            setError(typeof detail === "string" ? detail : "Could not place the order. Please try again.");
        } finally {
            setPlacing(false);
        }
    };

    if (placed) {
        return (
            <div className="py-32 text-center">
                <p className="text-5xl text-moss">✓</p>
                <h1 className="mt-5 font-display text-5xl tracking-tight">Order placed</h1>
                <p className="mt-3 text-ink/60">
                    <span className="font-medium text-ink">{placed.order_number}</span> · {inr(placed.total)} · {placed.payment_label}
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-ink/55">
                    A confirmation is on its way. Track it any time from your account.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Link to="/account" className="btn-gold">View my orders</Link>
                    <Link to="/" className="btn-ghost">Continue browsing</Link>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="py-32 text-center">
                <h1 className="font-display text-4xl">Nothing to check out</h1>
                <Link to="/category/rings" className="btn-gold mt-8 inline-flex">Explore the collections</Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
            <p className="eyebrow">Checkout</p>
            <h1 className="mt-3 font-display text-5xl tracking-tight">Almost yours</h1>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
                <div className="space-y-10">
                    <section>
                        <h2 className="text-[12px] uppercase tracking-[0.25em] text-ink/55">1 · Delivery address</h2>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {addresses.map((a) => (
                                <label key={a.id} className={`cursor-pointer border p-4 transition ${addressId === a.id ? "border-gold-deep bg-gold-pale" : "border-ink/15 hover:border-ink/40"}`}>
                                    <input type="radio" name="address" className="sr-only" checked={addressId === a.id} onChange={() => setAddressId(a.id)} />
                                    <p className="text-[10px] uppercase tracking-[0.25em] text-gold-deep">{a.label}</p>
                                    <p className="mt-1 font-display">{a.full_name}</p>
                                    <p className="mt-1 text-sm text-ink/65">{a.line1}, {a.city} — {a.pincode}</p>
                                </label>
                            ))}
                        </div>
                        {showForm ? (
                            <form onSubmit={saveAddress} className="mt-4 grid max-w-xl gap-3 sm:grid-cols-2">
                                <input className="input" placeholder="Full name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                                <input className="input" placeholder="Phone" maxLength={10} required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                <input className="input sm:col-span-2" placeholder="Address line 1" required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
                                <input className="input" placeholder="City" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                                <div className="flex gap-3">
                                    <input className="input" placeholder="State" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                                    <input className="input" placeholder="PIN" maxLength={6} required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                                </div>
                                <div className="flex gap-3 sm:col-span-2">
                                    <button className="btn-gold">Save & use</button>
                                    <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <button onClick={() => setShowForm(true)} className="mt-4 text-[11px] uppercase tracking-[0.22em] text-gold-deep hover:underline">+ Add a new address</button>
                        )}
                    </section>

                    <section>
                        <h2 className="text-[12px] uppercase tracking-[0.25em] text-ink/55">2 · Payment</h2>
                        <div className="mt-4 space-y-2">
                            {PAYMENT_METHODS.map(([value, label]) => (
                                <label key={value} className={`flex cursor-pointer items-center justify-between border px-5 py-4 transition ${payment === value ? "border-gold-deep bg-gold-pale" : "border-ink/15 hover:border-ink/40"}`}>
                                    <span className="text-sm">{label}</span>
                                    <input type="radio" name="payment" checked={payment === value} onChange={() => setPayment(value)} />
                                </label>
                            ))}
                        </div>
                        <p className="mt-3 text-xs text-ink/45">
                            Starter build: payment is recorded, not captured. Wire in Razorpay/Stripe next.
                        </p>
                    </section>
                </div>

                <aside className="h-fit border border-ink/10 bg-gold-pale p-7">
                    <h2 className="font-display text-2xl">Your pieces</h2>
                    <div className="mt-4 space-y-3 text-sm">
                        {items.map((i) => (
                            <div key={i.key} className="flex justify-between gap-3">
                                <span className="text-ink/70">{i.qty} × {i.name}<br /><span className="text-xs text-ink/45">{i.variant.label}</span></span>
                                <span>{inr(i.unit_price * i.qty)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 flex justify-between border-t border-ink/15 pt-4 font-display text-lg">
                        <span>Total</span><span>{inr(subtotal)}</span>
                    </div>
                    {error && <p className="mt-4 text-sm text-rust">{error}</p>}
                    <button onClick={placeOrder} disabled={placing} className="btn-gold mt-6 w-full disabled:opacity-50">
                        {placing ? "Placing order…" : "Place order"}
                    </button>
                </aside>
            </div>
        </div>
    );
}