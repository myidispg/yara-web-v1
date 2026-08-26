"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import controlApi from "@/api/controlClient";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const fmtDate = (d) =>
    d ? new Date(d).toLocaleString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    }) : "—";

const STATUS = {
    placed: { label: "Placed", cls: "bg-blue-100 text-blue-800" },
    confirmed: { label: "Confirmed", cls: "bg-yellow-100 text-yellow-800" },
    shipped: { label: "Shipped", cls: "bg-purple-100 text-purple-800" },
    delivered: { label: "Delivered", cls: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-800" },
};

const PAYMENT_LABELS = {
    upi: "UPI",
    card: "Card",
    netbanking: "Net Banking",
    emi: "EMI",
    cod: "COD",
};

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        document.title = "Orders | Control Panel";
        load();
    }, []);

    const load = async () => {
        try {
            const { data } = await controlApi.getOrders();
            setOrders(data.results || data);
        } catch (err) {
            console.error("Failed to load orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = orders.filter((o) => {
        const q = search.toLowerCase().trim();
        if (!q) return true;
        return (
            o.order_number.toLowerCase().includes(q) ||
            o.customer_name.toLowerCase().includes(q) ||
            o.customer_email.toLowerCase().includes(q) ||
            (o.transaction_id || "").toLowerCase().includes(q)
        );
    });

    if (loading) return <div className="text-center py-12">Loading orders…</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-serif text-4xl">Orders</h1>
                <p className="text-sm text-ink/60">{orders.length} total orders</p>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by order #, customer, email, or transaction ID…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-md border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold-dark"
                />
            </div>

            <div className="bg-white rounded-xl border border-line shadow-card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-cream/50">
                        <tr>
                            <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Order #</th>
                            <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Customer</th>
                            <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Payment</th>
                            <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Status</th>
                            <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Invoice</th>
                            <th className="text-right px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Total</th>
                            <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-sm text-ink/50">
                                    {search ? "No orders match your search." : "No orders yet."}
                                </td>
                            </tr>
                        ) : filtered.map((o) => {
                            const st = STATUS[o.status] || { label: o.status, cls: "bg-gray-100 text-gray-800" };
                            return (
                                <tr key={o.id} className="border-b border-line last:border-0 hover:bg-cream/30">
                                    <td className="px-6 py-4">
                                        <Link href={`/control/orders/${o.id}`} className="font-mono text-sm text-gold-dark hover:text-ink font-semibold">
                                            {o.order_number}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <p className="font-semibold">{o.customer_name}</p>
                                        <p className="text-xs text-ink/50">{o.customer_email}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="font-semibold uppercase">{PAYMENT_LABELS[o.payment_method] || o.payment_method}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {o.invoice_number ? (
                                            <span className="font-mono text-xs text-green-700 font-semibold">{o.invoice_number}</span>
                                        ) : (
                                            <span className="text-ink/40">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${st.cls}`}>
                                            {st.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right font-semibold">{inr(o.total)}</td>
                                    <td className="px-6 py-4 text-sm text-ink/70">{fmtDate(o.created_at)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}