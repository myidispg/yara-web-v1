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
    placed: { label: "Placed", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    confirmed: { label: "Confirmed", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    shipped: { label: "Shipped", cls: "bg-purple-50 text-purple-700 border-purple-200" },
    delivered: { label: "Delivered", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700 border-red-200" },
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

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <p className="text-sm text-[#1A2536]/50">Loading orders…</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">all orders</span>
                    <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Orders</h1>
                </div>
                <div className="glass-card-vibrant rounded-full px-5 py-2.5 border border-[#E5BDB0]">
                    <span className="text-sm font-bold text-[#1A2536]">{orders.length}</span>
                    <span className="text-sm text-[#1A2536]/60 ml-1">total orders</span>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A2536]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder="Search order #, customer, email, transaction ID…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm border border-[#E5BDB0] rounded-full bg-white focus:outline-none focus:border-[#1A2536] transition-colors"
                />
            </div>

            {/* Orders Table */}
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#1A2536]/[0.03] border-b border-[#E5BDB0]/40">
                                <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Order #</th>
                                <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Customer</th>
                                <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Payment</th>
                                <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Status</th>
                                <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Invoice</th>
                                <th className="text-right px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Total</th>
                                <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center">
                                        <p className="font-serif-luxury text-xl text-[#1A2536] mb-2">
                                            {search ? "No orders match" : "No orders yet"}
                                        </p>
                                        <p className="text-sm text-[#1A2536]/50">
                                            {search ? "Try a different search term." : "Orders will appear here once customers place them."}
                                        </p>
                                    </td>
                                </tr>
                            ) : filtered.map((o) => {
                                const st = STATUS[o.status] || { label: o.status, cls: "bg-gray-50 text-gray-700 border-gray-200" };
                                return (
                                    <tr key={o.id} className="border-b border-[#E5BDB0]/20 last:border-0 hover:bg-[#1A2536]/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <Link href={`/control/orders/${o.id}`} className="font-mono text-sm font-bold text-[#B86B5A] hover:text-[#1A2536] hover:underline transition-colors">
                                                {o.order_number}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-[#1A2536]">{o.customer_name}</p>
                                            <p className="text-xs text-[#1A2536]/50 mt-0.5">{o.customer_email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold uppercase tracking-wider text-[#1A2536]/80">{PAYMENT_LABELS[o.payment_method] || o.payment_method}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${st.cls}`}>
                                                {st.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {o.invoice_number ? (
                                                <span className="font-mono text-xs text-emerald-700 font-bold">{o.invoice_number}</span>
                                            ) : (
                                                <span className="text-[#1A2536]/30 text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-extrabold text-[#1A2536]">{inr(o.total)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-[#1A2536]/60">{fmtDate(o.created_at)}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}