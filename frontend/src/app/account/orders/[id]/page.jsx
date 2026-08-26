"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/api/client";
import { useAuth } from "@/context/AuthContext";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const fmtDate = (d) => d ? new Date(d).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
}) : "—";

const STATUS_STYLES = {
    placed: { label: "Order Placed", cls: "bg-blue-100 text-blue-800" },
    confirmed: { label: "Order Confirmed", cls: "bg-yellow-100 text-yellow-800" },
    shipped: { label: "Shipped", cls: "bg-purple-100 text-purple-800" },
    delivered: { label: "Delivered", cls: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-800" },
};

export default function OrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/auth?next=/account");
            return;
        }
        load();
    }, [user, authLoading]);

    const load = async () => {
        try {
            const { data } = await api.get(`/orders/${id}/`);
            setOrder(data);
        } catch (err) {
            console.error("Failed to load order:", err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) return <div className="text-center py-12">Loading order…</div>;
    if (!order) return <div className="text-center py-12">Order not found.</div>;

    const st = STATUS_STYLES[order.status] || { label: order.status, cls: "bg-gray-100 text-gray-800" };

    return (
        <div className="max-w-5xl mx-auto px-8 py-12">
            <button onClick={() => router.push("/account")} className="mb-6 text-sm text-gold-dark hover:text-ink">
                ← Back to My Account
            </button>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-serif text-3xl flex items-center gap-4">
                        {order.order_number}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                    </h1>
                    <p className="text-sm text-ink/60 mt-1">
                        Placed {fmtDate(order.placed_at)} · {order.payment_method.toUpperCase()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-ink/60 text-sm">Total</p>
                    <p className="font-serif text-2xl font-semibold">{inr(order.total)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Items + Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-line shadow-card overflow-hidden">
                        <div className="px-6 py-4 border-b border-line bg-cream">
                            <h3 className="font-semibold">Items ({order.items.length})</h3>
                        </div>
                        <div className="divide-y divide-line">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-6">
                                    <div>
                                        {item.design_slug ? (
                                            <Link href={`/product/${item.design_slug}`} className="font-semibold text-gold-dark hover:text-ink">
                                                {item.product_name}
                                            </Link>
                                        ) : (
                                            <p className="font-semibold">{item.product_name}</p>
                                        )}
                                        <p className="text-sm text-ink/60">{item.variant_label || "—"}</p>
                                        <p className="text-xs text-ink/50 mt-1">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{inr(item.line_total)}</p>
                                        {item.quantity > 1 && (
                                            <p className="text-xs text-ink/50">{inr(item.unit_price)} each</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                        <h3 className="font-serif text-xl mb-4">Order Timeline</h3>
                        <div className="relative pl-8">
                            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-line" />
                            {(order.timeline || []).map((event, idx) => {
                                const isLast = idx === order.timeline.length - 1;
                                const stInfo = STATUS_STYLES[event.status] || { label: event.status };
                                return (
                                    <div key={idx} className="relative mb-6 last:mb-0">
                                        <div className={`absolute -left-8 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isLast ? "bg-gold-dark border-gold-dark text-white" : "bg-white border-line text-ink/40"
                                            }`}>
                                            {isLast ? "✓" : "•"}
                                        </div>
                                        <div>
                                            <p className={`font-semibold text-sm ${isLast ? "text-ink" : "text-ink/70"}`}>
                                                {stInfo.label}
                                            </p>
                                            <p className="text-xs text-ink/50">{fmtDate(event.timestamp)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Shipping, Payment, Invoice */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                        <h3 className="font-serif text-xl mb-4">Shipping Address</h3>
                        {order.address ? (
                            <p className="text-sm text-ink/70 leading-relaxed">
                                {order.address.full_name}<br />
                                {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />
                                {order.address.city}, {order.address.state} — {order.address.pincode}<br />
                                <span className="text-ink/50">{order.address.phone}</span>
                            </p>
                        ) : (
                            <p className="text-sm text-ink/50">No address recorded.</p>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                        <h3 className="font-serif text-xl mb-4">Payment Details</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-ink/60">Payment Method</span>
                                <span className="font-semibold uppercase">{order.payment_method}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink/60">Transaction ID</span>
                                <span className="font-mono text-xs">{order.transaction_id || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink/60">Payment Status</span>
                                <span className={`font-semibold ${order.status === 'cancelled' ? 'text-red-600' : 'text-green-600'}`}>
                                    {order.status === 'cancelled' ? 'Refunded' : 'Paid'}
                                </span>
                            </div>
                        </div>
                        <div className="border-t border-line my-4" />
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span>{inr(order.subtotal)}</span></div>
                            <div className="flex justify-between"><span className="text-ink/60">Shipping</span><span>{inr(order.shipping_fee)}</span></div>
                            <div className="border-t border-line pt-2 mt-2 flex justify-between font-semibold">
                                <span>Total</span>
                                <span>{inr(order.total)}</span>
                            </div>
                        </div>
                    </div>

                                        {/* Invoice */}
                    {order.status === "delivered" && order.invoice_number && (
                        <div className="bg-cream rounded-xl border border-line p-6 shadow-card">
                            <h3 className="font-serif text-xl mb-3">Invoice</h3>
                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between">
                                    <span className="text-ink/60">Invoice No.</span>
                                    <span className="font-mono font-semibold">{order.invoice_number}</span>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await api.downloadInvoice(order.id);
                                        const url = URL.createObjectURL(response.data);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${order.invoice_number}.pdf`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                    } catch (err) {
                                        alert("Failed to download invoice. Please try again.");
                                    }
                                }}
                                className="btn-solid w-full text-sm"
                            >
                                Download Invoice (PDF)
                            </button>
                        </div>
                    )}

                    {/* No invoice yet but delivered */}
                    {order.status === "delivered" && !order.invoice_number && (
                        <div className="bg-cream rounded-xl border border-line p-6 shadow-card">
                            <h3 className="font-serif text-xl mb-3">Invoice</h3>
                            <p className="text-sm text-ink/60">
                                Your invoice is being generated. Please check back shortly.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}