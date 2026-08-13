import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import usePageTitle from "../utils/usePageTitle";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const STATUS_STYLES = {
    delivered: "bg-[#3E5C4B] text-white",
    shipped: "bg-gold-dark text-white",
    in_transit: "bg-gold-dark text-white",
    processing: "bg-ink/10 text-ink/70",
    pending: "bg-ink/10 text-ink/70",
};

const statusLabel = (s) =>
    ({ delivered: "Delivered", shipped: "In Transit (Insured)", in_transit: "In Transit (Insured)", processing: "Processing", pending: "Processing" }[s] ?? s ?? "Processing");

export default function AccountPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);

    usePageTitle("My Account");

    useEffect(() => {
        (async () => {
            for (const path of ["/orders/", "/orders/mine/", "/auth/orders/"]) {
                try {
                    const { data } = await api.get(path);
                    const list = data?.results ?? data;
                    if (Array.isArray(list)) { setOrders(list); return; }
                } catch { /* try next */ }
            }
        })();
    }, []);

    return (
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-12">
            <p className="eyebrow mb-2">YA-RA Account</p>
            <h1 className="font-serif text-4xl md:text-5xl mb-10">
                My Account{user?.first_name ? <span className="text-ink/40 text-2xl md:text-3xl"> — {user.first_name}</span> : null}
            </h1>

            <div className="grid lg:grid-cols-[320px_1fr] gap-10 items-start">
                {/* Profile */}
                <aside className="bg-ink text-white p-8 rounded-xl h-fit">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-gold mb-3 font-semibold">Member Profile</p>
                    <p className="font-serif text-2xl mb-1">{[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Guest"}</p>
                    <p className="text-xs text-white/60 mb-8">{user?.email}</p>
                    <nav className="space-y-4 text-sm border-t border-white/10 pt-6">
                        <Link to="/policies" className="block hover:text-gold transition-colors">Policies &amp; Certifications</Link>
                        <Link to="/" className="block hover:text-gold transition-colors">Continue Shopping</Link>
                        <button
                            onClick={() => { logout(); navigate("/"); }}
                            className="text-[10px] uppercase tracking-[0.14em] font-medium text-gold underline underline-offset-4"
                        >
                            Logout
                        </button>
                    </nav>
                </aside>

                {/* Orders */}
                <section>
                    <h2 className="font-serif text-2xl mb-6">Recent Orders</h2>
                    {orders.length ? (
                        <div className="space-y-5">
                            {orders.map((o) => {
                                const status = (o.status ?? "processing").toLowerCase();
                                return (
                                    <div key={o.id} className="bg-white rounded-xl border border-line shadow-card p-5 flex flex-col sm:flex-row justify-between gap-4">
                                        <div>
                                            <p className="font-serif text-lg text-ink">
                                                Order {o.order_number ?? o.reference ?? `#YARA-${o.id}`}
                                            </p>
                                            <p className="text-xs text-ink/60 mt-1">
                                                {o.items?.map((i) => i.name ?? i.product?.name).filter(Boolean).join(", ") ||
                                                    o.summary || "Fine jewellery"}
                                            </p>
                                            <p className="text-xs text-ink/40 mt-1">
                                                {o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""}
                                            </p>
                                        </div>
                                        <div className="flex sm:flex-col items-start sm:items-end justify-between gap-3">
                                            <p className="font-semibold text-ink">{inr(o.total ?? o.total_amount ?? 0)}</p>
                                            <span className={`text-[10px] uppercase tracking-[0.12em] font-medium px-3 py-1.5 rounded-full ${STATUS_STYLES[status] ?? STATUS_STYLES.processing}`}>
                                                {statusLabel(status)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-line shadow-card p-8 text-center">
                            <p className="text-sm text-ink/60 mb-4">No orders yet.</p>
                            <Link to="/" className="btn-outline inline-block">Explore the collection →</Link>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}