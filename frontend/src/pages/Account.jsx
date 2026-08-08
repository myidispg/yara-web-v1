import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDate, inr } from "../utils/format";

const STATUS_STYLE = {
    delivered: "bg-moss/15 text-moss",
    shipped: "bg-gold/25 text-gold-deep",
    confirmed: "bg-gold/25 text-gold-deep",
    placed: "bg-ink/10 text-ink/70",
    cancelled: "bg-rust/15 text-rust",
};

const EMPTY_ADDRESS = { label: "home", full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" };

export default function AccountPage() {
    const { user, logout } = useAuth();
    const [tab, setTab] = useState("orders");
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);

    useEffect(() => {
        api.get("/orders/").then((r) => setOrders(r.data.results ?? r.data)).catch(() => { });
        api.get("/addresses/").then((r) => setAddresses(r.data.results ?? r.data)).catch(() => { });
    }, []);

    const saveAddress = async (e) => {
        e.preventDefault();
        await api.post("/addresses/", addressForm);
        setAddressForm(EMPTY_ADDRESS);
        setShowAddressForm(false);
        const { data } = await api.get("/addresses/");
        setAddresses(data.results ?? data);
    };

    const tabs = [["orders", `Orders (${orders.length})`], ["addresses", `Addresses (${addresses.length})`], ["profile", "Profile"]];

    return (
        <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
            <p className="eyebrow">My account</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <h1 className="font-display text-5xl tracking-tight">Namaste, {user.first_name || "there"}</h1>
                <button onClick={logout} className="btn-ghost !px-5 !py-2.5">Sign out</button>
            </div>

            <div className="mt-8 flex gap-2 border-b border-ink/10">
                {tabs.map(([k, l]) => (
                    <button key={k} onClick={() => setTab(k)}
                        className={`-mb-px border-b-2 px-4 py-3 text-[12px] uppercase tracking-[0.22em] transition ${tab === k ? "border-gold-deep text-gold-deep" : "border-transparent text-ink/50 hover:text-ink"}`}>
                        {l}
                    </button>
                ))}
            </div>

            {tab === "orders" && (
                <div className="mt-8 space-y-4">
                    {orders.length === 0 && (
                        <div className="border border-ink/10 bg-gold-pale p-10 text-center">
                            <p className="font-display text-2xl">No orders yet</p>
                            <p className="mt-2 text-sm text-ink/60">Your past and current orders will appear here.</p>
                            <Link to="/category/rings" className="btn-gold mt-6 inline-flex">Start exploring</Link>
                        </div>
                    )}
                    {orders.map((o) => (
                        <details key={o.order_number} className="group border border-ink/10 bg-white/60">
                            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
                                <span className="font-display text-lg">{o.order_number}</span>
                                <span className="text-sm text-ink/55">{formatDate(o.created_at)}</span>
                                <span className={`px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${STATUS_STYLE[o.status] || "bg-ink/10"}`}>{o.status_label}</span>
                                <span className="ml-auto font-medium">{inr(o.total)}</span>
                                <span className="text-gold transition group-open:rotate-45">+</span>
                            </summary>
                            <div className="border-t border-ink/10 px-5 py-5">
                                <div className="grid gap-6 md:grid-cols-[1fr_260px]">
                                    <div className="space-y-4">
                                        {o.items.map((it, i) => (
                                            <div key={i} className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="font-display">{it.product_name}</p>
                                                    <p className="mt-0.5 text-xs text-ink/55">{it.variant_label} · Qty {it.quantity}</p>
                                                </div>
                                                <p className="text-sm">{inr(it.line_total)}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-3 text-sm text-ink/70">
                                        <p><span className="text-[10px] uppercase tracking-[0.25em] text-ink/45">Payment</span><br />{o.payment_label}</p>
                                        {o.address && (
                                            <p><span className="text-[10px] uppercase tracking-[0.25em] text-ink/45">Deliver to</span><br />
                                                {o.address.full_name}, {o.address.line1}{o.address.line2 && `, ${o.address.line2}`},<br />
                                                {o.address.city} — {o.address.pincode}</p>
                                        )}
                                        <p className="border-t border-ink/10 pt-3">
                                            Subtotal {inr(o.subtotal)} · Shipping {o.shipping_fee > 0 ? inr(o.shipping_fee) : "Free"}<br />
                                            <strong>Total {inr(o.total)}</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </details>
                    ))}
                </div>
            )}

            {tab === "addresses" && (
                <div className="mt-8">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {addresses.map((a) => (
                            <div key={a.id} className="border border-ink/10 bg-white/60 p-5">
                                <p className="text-[10px] uppercase tracking-[0.25em] text-gold-deep">{a.label} {a.is_default && "· Default"}</p>
                                <p className="mt-2 font-display text-lg">{a.full_name}</p>
                                <p className="mt-1 text-sm leading-relaxed text-ink/70">
                                    {a.line1}{a.line2 && `, ${a.line2}`}<br />{a.city}, {a.state} — {a.pincode}<br />+91 {a.phone}
                                </p>
                            </div>
                        ))}
                    </div>
                    {showAddressForm ? (
                        <form onSubmit={saveAddress} className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
                            <select className="input" value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}>
                                <option value="home">Home</option><option value="office">Office</option><option value="other">Other</option>
                            </select>
                            <input className="input" placeholder="Full name" required value={addressForm.full_name} onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })} />
                            <input className="input" placeholder="Phone" maxLength={10} required value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} />
                            <input className="input" placeholder="PIN code" maxLength={6} required value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} />
                            <input className="input sm:col-span-2" placeholder="Address line 1" required value={addressForm.line1} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} />
                            <input className="input sm:col-span-2" placeholder="Address line 2 (optional)" value={addressForm.line2} onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })} />
                            <input className="input" placeholder="City" required value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
                            <input className="input" placeholder="State" required value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} />
                            <div className="flex gap-3 sm:col-span-2">
                                <button className="btn-gold">Save address</button>
                                <button type="button" onClick={() => setShowAddressForm(false)} className="btn-ghost">Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <button onClick={() => setShowAddressForm(true)} className="btn-ghost mt-6">+ Add address</button>
                    )}
                </div>
            )}

            {tab === "profile" && (
                <div className="mt-8 max-w-md space-y-4">
                    {[["Name", user.name], ["Email", user.email], ["Phone", `+91 ${user.phone}`], ["Member since", formatDate(user.date_joined)]].map(([k, v]) => (
                        <div key={k} className="border border-ink/10 bg-white/60 px-5 py-4">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-ink/45">{k}</p>
                            <p className="mt-1">{v}</p>
                        </div>
                    ))}
                    <p className="text-xs text-ink/45">Contact care@vaira.in to update your email or phone.</p>
                </div>
            )}
        </div>
    );
}