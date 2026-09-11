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
    placed: { label: "Order Placed", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    confirmed: { label: "Order Confirmed", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    shipped: { label: "Shipped", cls: "bg-purple-50 text-purple-700 border-purple-200" },
    delivered: { label: "Delivered", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700 border-red-200" },
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

    if (authLoading || loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <p className="text-sm text-[#1A2536]/50">Loading order details…</p>
        </div>
    );

    if (!order) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <p className="text-sm text-[#1A2536]/50">Order not found.</p>
        </div>
    );

    const st = STATUS_STYLES[order.status] || { label: order.status, cls: "bg-gray-50 text-gray-700 border-gray-200" };

    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back Button */}
                <button
                    onClick={() => router.push("/account")}
                    className="mb-6 text-xs text-[#B86B5A] font-bold uppercase tracking-widest hover:underline flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to My Account
                </button>

                {/* Header */}
                <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8 mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <span className="font-cursive text-2xl text-[#B86B5A] block -mb-1">order details</span>
                            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[#1A2536] flex items-center gap-4 flex-wrap">
                                {order.order_number}
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${st.cls}`}>
                                    {st.label}
                                </span>
                            </h1>
                            <p className="text-xs text-[#1A2536]/60 mt-2">
                                Placed {fmtDate(order.placed_at)} · {order.payment_method.toUpperCase()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[#1A2536]/60 text-xs uppercase tracking-wider font-bold">Total</p>
                            <p className="font-extrabold text-3xl text-[#1A2536]">{inr(order.total)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Items + Timeline */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Items */}
                        <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#E5BDB0]/40 bg-white/60">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-[#1A2536]">
                                    Items ({order.items.length})
                                </h3>
                            </div>
                            <div className="divide-y divide-[#E5BDB0]/40">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-6">
                                        <div className="flex-1 min-w-0">
                                            {item.design_slug ? (
                                                <Link href={`/product/${item.design_slug}`} className="font-serif-luxury text-lg font-semibold text-[#1A2536] hover:text-[#B86B5A] hover:underline transition-colors block leading-tight">
                                                    {item.product_name}
                                                </Link>
                                            ) : (
                                                <p className="font-serif-luxury text-lg font-semibold text-[#1A2536]">{item.product_name}</p>
                                            )}
                                            <p className="text-xs text-[#B86B5A] font-bold mt-1">{item.variant_label || "—"}</p>
                                            <p className="text-[10px] text-[#1A2536]/50 mt-1">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right shrink-0 ml-4">
                                            <p className="font-extrabold text-lg text-[#1A2536]">{inr(item.line_total)}</p>
                                            {item.quantity > 1 && (
                                                <p className="text-[10px] text-[#1A2536]/50">{inr(item.unit_price)} each</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                            <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536] mb-6">Order Timeline</h3>
                            <div className="relative pl-8">
                                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-[#E5BDB0]/60" />
                                {(order.timeline || []).map((event, idx) => {
                                    const isLast = idx === order.timeline.length - 1;
                                    const stInfo = STATUS_STYLES[event.status] || { label: event.status };
                                    return (
                                        <div key={idx} className="relative mb-6 last:mb-0">
                                            <div className={`absolute -left-8 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                isLast ? "bg-[#B86B5A] border-[#B86B5A] text-white" : "bg-white border-[#E5BDB0] text-[#1A2536]/40"
                                            }`}>
                                                {isLast ? "✓" : "•"}
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm ${isLast ? "text-[#1A2536]" : "text-[#1A2536]/70"}`}>
                                                    {stInfo.label}
                                                </p>
                                                <p className="text-xs text-[#1A2536]/50">{fmtDate(event.timestamp)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Shipping, Payment, Invoice */}
                    <div className="space-y-6">
                        {/* Shipping Address */}
                        <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                            <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536] mb-4">Shipping Address</h3>
                            {order.address ? (
                                <p className="text-sm text-[#1A2536]/70 leading-relaxed">
                                    <span className="font-bold text-[#1A2536]">{order.address.full_name}</span><br />
                                    {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />
                                    {order.address.city}, {order.address.state} — {order.address.pincode}<br />
                                    <span className="text-[#1A2536]/50 text-xs">{order.address.phone}</span>
                                </p>
                            ) : (
                                <p className="text-sm text-[#1A2536]/50">No address recorded.</p>
                            )}
                        </div>

                        {/* Payment Details */}
                        <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                            <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536] mb-4">Payment Details</h3>
                            <div className="space-y-3 text-sm mb-4 pb-4 border-b border-[#E5BDB0]/40">
                                <div className="flex justify-between">
                                    <span className="text-[#1A2536]/60">Payment Method</span>
                                    <span className="font-bold uppercase text-[#1A2536]">{order.payment_method}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#1A2536]/60">Transaction ID</span>
                                    <span className="font-mono text-xs text-[#1A2536]">{order.transaction_id || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#1A2536]/60">Payment Status</span>
                                    <span className={`font-bold ${order.status === 'cancelled' ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {order.status === 'cancelled' ? 'Refunded' : 'Paid'}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-[#1A2536]/60">Subtotal (excl. tax)</span>
                                    <span className="font-semibold text-[#1A2536]">{inr(order.subtotal_excl_tax)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#1A2536]/60">GST (3%)</span>
                                    <span className="font-semibold text-[#1A2536]">{inr(order.gst_amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#1A2536]/60">Shipping</span>
                                    <span className="font-semibold text-[#1A2536]">{inr(order.shipping_fee)}</span>
                                </div>
                                <div className="border-t border-[#E5BDB0]/40 pt-3 mt-3 flex justify-between">
                                    <span className="font-bold text-[#1A2536]">Total</span>
                                    <span className="font-extrabold text-[#1A2536]">{inr(order.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Invoice */}
                        {order.status === "delivered" && order.invoice_number && (
                            <div className="glass-card-vibrant rounded-3xl border-2 border-[#D4AF37]/40 p-6 bg-gradient-to-br from-[#FDFBF7] to-[#F5EFE6]">
                                <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536] mb-3">Invoice</h3>
                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-[#1A2536]/60">Invoice No.</span>
                                        <span className="font-mono font-bold text-[#1A2536]">{order.invoice_number}</span>
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
                                    className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download Invoice (PDF)
                                </button>
                            </div>
                        )}

                        {/* No invoice yet but delivered */}
                        {order.status === "delivered" && !order.invoice_number && (
                            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                                <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536] mb-3">Invoice</h3>
                                <p className="text-sm text-[#1A2536]/60">
                                    Your invoice is being generated. Please check back shortly.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}