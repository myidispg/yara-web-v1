import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import usePageTitle from "../utils/usePageTitle";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const STATUS_STYLES = {
    delivered: "bg-[#3E5C4B] text-ivory",
    shipped: "bg-gold text-ivory",
    in_transit: "bg-gold text-ivory",
    processing: "bg-charcoal/10 text-charcoal/70",
    pending: "bg-charcoal/10 text-charcoal/70",
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
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
            <p className="eyebrow mb-2">YA-RA Account</p>
            <h1 className="text-4xl font-serif mb-10">
                My Account{user?.first_name ? <span className="italic text-charcoal/50 text-2xl"> — {user.first_name}</span> : null}
            </h1>

            <div className="grid lg:grid-cols-[320px_1fr] gap-12">
                {/* Profile */}
                <aside className="bg-charcoal text-ivory p-8 h-fit">
                    <p className="micro-label text-gold mb-2">Member Profile</p>
                    <p className="font-serif text-2xl mb-1">{[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Guest"}</p>
                    <p className="text-xs text-ivory/60 mb-8">{user?.email}</p>
                    <nav className="space-y-3 text-sm">
                        <Link to="/policies" className="block hover:text-gold">Policies &amp; Certifications</Link>
                        <Link to="/" className="block hover:text-gold">Continue Shopping</Link>
                        <button
                            onClick={() => { logout(); navigate("/"); }}
                            className="micro-label text-gold underline underline-offset-4"
                        >
                            Logout
                        </button>
                    </nav>
                </aside>

                {/* Orders */}
                <section>
                    <h2 className="font-serif text-2xl mb-6">Recent Orders</h2>
                    {orders.length ? (
                        <div className="space-y-6">
                            {orders.map((o) => {
                                const status = (o.status ?? "processing").toLowerCase();
                                return (
                                    <div key={o.id} className="hairline border-b border-charcoal/15 pb-6 grid sm:grid-cols-[1fr_auto] gap-4">
                                        <div>
                                            <p className="font-serif text-lg">
                                                Order {o.order_number ?? o.reference ?? `#YARA-${o.id}`}
                                            </p>
                                            <p className="text-xs text-charcoal/60 mt-1">
                                                {o.items?.map((i) => i.name ?? i.product?.name).filter(Boolean).join(", ") ||
                                                    o.summary || "Fine jewellery"}
                                            </p>
                                            <p className="text-xs text-charcoal/50 mt-1">
                                                {o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""}
                                            </p>
                                        </div>
                                        <div className="flex sm:flex-col items-center sm:items-end gap-3">
                                            <p className="price-tag">{inr(o.total ?? o.total_amount ?? 0)}</p>
                                            <span className={`micro-label px-3 py-1 ${STATUS_STYLES[status] ?? STATUS_STYLES.processing}`}>
                                                {statusLabel(status)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-charcoal/60">
                            No orders yet.{" "}
                            <Link to="/" className="text-gold underline underline-offset-4">Explore the collection →</Link>
                        </p>
                    )}
                </section>
            </div>
        </div>
    );
}