"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import controlApi from "@/api/controlClient";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const STATUS = {
    placed: { label: "Placed", cls: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
    confirmed: { label: "Confirmed", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    shipped: { label: "Shipped", cls: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
    delivered: { label: "Delivered", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

const PAYMENT_LABELS = {
    upi: "UPI",
    card: "Credit / Debit Card",
    netbanking: "Net Banking",
    emi: "EMI",
    cod: "Cash on Delivery",
};

export default function OrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mtoModal, setMtoModal] = useState(null);
    const [availableProducts, setAvailableProducts] = useState([]);

    useEffect(() => { document.title = "Order | Control Panel"; }, []);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await controlApi.getOrder(id);
                setOrder(data);
            } catch (err) {
                console.error("Failed to load order:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <p className="text-sm text-[#1A2536]/50">Loading order…</p>
        </div>
    );
    if (!order) return (
        <div className="flex items-center justify-center py-24">
            <p className="text-sm text-red-600 font-semibold">Order not found</p>
        </div>
    );

    const st = STATUS[order.status] || { label: order.status, cls: "bg-gray-50 text-gray-700 border-gray-200", dot: "bg-gray-500" };

    const openMtoModal = async (item) => {
        setMtoModal(item);
        setAvailableProducts([]);
        try {
            const { data } = await controlApi.getInstances({
                design_id: item.design_id,
                status: 'in_stock'
            });
            const products = data.results || data;
            const matching = products.filter(p =>
                p.design_id == item.design_id &&
                p.karat === item.karat &&
                p.gold_color === item.gold_color &&
                p.diamond_grade === item.diamond_grade
            );
            setAvailableProducts(matching);
        } catch (err) {
            console.error("Failed to load products:", err);
            setAvailableProducts([]);
        }
    };

    const mapProduct = async (productId) => {
        try {
            const { data } = await controlApi.mapProductToOrder(order.id, mtoModal.id, productId);
            setOrder(data);
            setMtoModal(null);
            alert("Product mapped successfully!");
        } catch (err) {
            alert("Failed to map product: " + (err.response?.data?.error || err.message));
        }
    };

    const updateStatus = async (newStatus) => {
        const labels = {
            confirmed: "Confirm this order?",
            shipped: "Mark as shipped?",
            delivered: "Mark as delivered? This will generate an invoice.",
            cancelled: "Cancel this order?",
        };
        if (!confirm(labels[newStatus])) return;
        try {
            const { data } = await controlApi.updateOrderStatus(id, newStatus);
            if (data && data.order_number) {
                setOrder(data);
            } else {
                const { data: freshOrder } = await controlApi.getOrder(id);
                setOrder(freshOrder);
            }
        } catch (err) {
            alert("Failed: " + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="space-y-6">
            {/* Back button */}
            <button onClick={() => router.push("/control/orders")} className="text-xs text-[#B86B5A] font-bold uppercase tracking-wider hover:underline flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All Orders
            </button>

            {/* Order Header Card */}
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <span className="font-cursive text-2xl text-[#B86B5A] block -mb-1">order details</span>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#1A2536] font-mono">
                                {order.order_number}
                            </h1>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${st.cls}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                                {st.label}
                            </span>
                        </div>
                        <p className="text-sm text-[#1A2536]/60 mt-2">
                            Placed {new Date(order.placed_at || order.created_at).toLocaleString("en-IN")} · {PAYMENT_LABELS[order.payment_method] || order.payment_method}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {order.status === "placed" && (
                            <button onClick={() => updateStatus("confirmed")} className="px-5 py-2.5 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow">
                                Confirm Order
                            </button>
                        )}
                        {order.status === "confirmed" && (
                            <button onClick={() => updateStatus("shipped")} className="px-5 py-2.5 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow">
                                Mark Shipped
                            </button>
                        )}
                        {order.status === "shipped" && (
                            <button onClick={() => updateStatus("delivered")} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow">
                                Mark Delivered
                            </button>
                        )}
                        {(order.status === "placed" || order.status === "confirmed") && (
                            <button onClick={() => updateStatus("cancelled")} className="px-5 py-2.5 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all">
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column: Customer, Payment, Address, Timeline */}
                <div className="space-y-5">
                    {/* Customer */}
                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-[#1A2536]/[0.05] flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#1A2536]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="font-serif-luxury text-lg font-semibold text-[#1A2536]">Customer</h3>
                        </div>
                        <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between gap-2">
                                <span className="text-[#1A2536]/60">Name</span>
                                <span className="font-bold text-[#1A2536] text-right">{order.customer_name}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="text-[#1A2536]/60">Email</span>
                                <span className="font-bold text-[#1A2536] text-right text-xs">{order.customer_email}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="text-[#1A2536]/60">Phone</span>
                                <span className="font-bold text-[#1A2536] text-right">{order.customer_phone}</span>
                            </div>
                        </div>
                        {order.customer_id && (
                            <Link
                                href={`/control/customers/${order.customer_id}`}
                                onClick={(e) => {
                                    if (!order.customer_id || order.customer_id <= 0) {
                                        e.preventDefault();
                                        alert("Customer profile not available");
                                    }
                                }}
                                className="mt-4 block text-center px-5 py-2.5 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all"
                            >
                                View Customer Profile
                            </Link>
                        )}
                    </div>

                    {/* Payment */}
                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-[#1A2536]/[0.05] flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#1A2536]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <h3 className="font-serif-luxury text-lg font-semibold text-[#1A2536]">Payment</h3>
                        </div>
                        <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between gap-2">
                                <span className="text-[#1A2536]/60">Method</span>
                                <span className="font-bold uppercase text-[#1A2536]">{order.payment_method}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="text-[#1A2536]/60">Transaction ID</span>
                                <span className="font-mono text-xs text-[#1A2536]">{order.transaction_id || "—"}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="text-[#1A2536]/60">Subtotal</span>
                                <span className="font-semibold text-[#1A2536]">{inr(order.subtotal_excl_tax)}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="text-[#1A2536]/60">GST (3%)</span>
                                <span className="font-semibold text-[#1A2536]">{inr(order.gst_amount)}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="text-[#1A2536]/60">Shipping</span>
                                <span className="font-semibold text-[#1A2536]">{inr(order.shipping_fee)}</span>
                            </div>
                            <div className="border-t border-[#E5BDB0]/40 pt-2.5 mt-2.5 flex justify-between gap-2">
                                <span className="font-bold text-[#1A2536]">Total</span>
                                <span className="font-extrabold text-lg text-[#1A2536]">{inr(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-[#1A2536]/[0.05] flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#1A2536]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="font-serif-luxury text-lg font-semibold text-[#1A2536]">Shipping Address</h3>
                        </div>
                        {order.address ? (
                            <p className="text-sm text-[#1A2536]/80 leading-relaxed">
                                <span className="font-bold text-[#1A2536] block mb-1">{order.address.full_name}</span>
                                {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />
                                {order.address.city}, {order.address.state} — {order.address.pincode}<br />
                                <span className="text-[#1A2536]/50 text-xs">{order.address.phone}</span>
                            </p>
                        ) : (
                            <p className="text-sm text-[#1A2536]/50">No address recorded.</p>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-[#1A2536]/[0.05] flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#1A2536]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-serif-luxury text-lg font-semibold text-[#1A2536]">Timeline</h3>
                        </div>
                        <div className="relative pl-8">
                            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-[#E5BDB0]/60" />
                            {(order.timeline || []).map((event, idx) => {
                                const isLast = idx === order.timeline.length - 1;
                                const eventSt = STATUS[event.status] || { label: event.status, dot: "bg-[#E5BDB0]" };
                                const labels = {
                                    placed: "Order Placed",
                                    confirmed: "Order Confirmed",
                                    shipped: "Shipped",
                                    delivered: "Delivered",
                                    cancelled: "Cancelled"
                                };
                                return (
                                    <div key={idx} className="relative mb-5 last:mb-0">
                                        <div className={`absolute -left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs ${isLast ? `${eventSt.dot} text-white` : "bg-white border-2 border-[#E5BDB0] text-[#1A2536]/40"}`}>
                                            {isLast ? "✓" : "•"}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${isLast ? "text-[#1A2536]" : "text-[#1A2536]/70"}`}>
                                                {labels[event.status] || event.status}
                                            </p>
                                            <p className="text-xs text-[#1A2536]/50 mt-0.5">
                                                {event.timestamp ? new Date(event.timestamp).toLocaleString("en-IN") : "—"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Invoice */}
                    {order.status === "delivered" && order.invoice_number && (
                        <div className="glass-card-vibrant rounded-3xl border-2 border-[#D4AF37]/30 bg-gradient-to-br from-white to-[#F5EFE6] p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-serif-luxury text-lg font-semibold text-[#1A2536]">Invoice</h3>
                            </div>
                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between">
                                    <span className="text-[#1A2536]/60">Invoice No.</span>
                                    <span className="font-mono font-bold text-[#1A2536]">{order.invoice_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#1A2536]/60">Total</span>
                                    <span className="font-extrabold text-[#1A2536]">{inr(order.total)}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={async () => {
                                        try {
                                            const response = await controlApi.downloadInvoice(order.invoice_id);
                                            const url = URL.createObjectURL(response.data);
                                            window.open(url, '_blank');
                                        } catch (err) {
                                            alert("Failed to open invoice PDF.");
                                        }
                                    }}
                                    className="px-4 py-2.5 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all"
                                >
                                    View
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const response = await controlApi.downloadInvoice(order.invoice_id);
                                            const url = URL.createObjectURL(response.data);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `${order.invoice_number}.pdf`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);
                                        } catch (err) {
                                            alert("Failed to download invoice PDF.");
                                        }
                                    }}
                                    className="px-4 py-2.5 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all"
                                >
                                    Download
                                </button>
                            </div>
                        </div>
                    )}

                    {order.status === "delivered" && !order.invoice_number && (
                        <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                            <h3 className="font-serif-luxury text-lg font-semibold text-[#1A2536] mb-2">Invoice</h3>
                            <p className="text-sm text-[#1A2536]/60">Invoice not yet generated.</p>
                        </div>
                    )}
                </div>

                {/* Right column: Items + Totals */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Items Table */}
                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#E5BDB0]/40 bg-[#1A2536]/[0.02] flex items-center justify-between">
                            <h3 className="font-serif-luxury text-lg font-semibold text-[#1A2536]">
                                Items <span className="text-[#B86B5A]">({order.items.length})</span>
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#1A2536]/[0.03]">
                                        <th className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Product</th>
                                        <th className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Variant</th>
                                        <th className="text-right px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Qty</th>
                                        <th className="text-right px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Total</th>
                                        <th className="text-center px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Fulfillment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((it) => (
                                        <tr key={it.id} className="border-b border-[#E5BDB0]/20 last:border-0 hover:bg-[#1A2536]/[0.02] transition-colors">
                                            <td className="px-6 py-4 text-sm">
                                                {it.design_id ? (
                                                    <Link href={`/control/inventory?design=${it.design_id}`} className="font-bold text-[#B86B5A] hover:text-[#1A2536] hover:underline transition-colors">
                                                        {it.product_name}
                                                    </Link>
                                                ) : (
                                                    <span className="font-bold text-[#1A2536]">{it.product_name}</span>
                                                )}
                                                {it.design_code && (
                                                    <p className="text-xs text-[#1A2536]/50 font-mono mt-0.5">{it.design_code}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[#1A2536]/70">{it.variant_label || "—"}</td>
                                            <td className="px-6 py-4 text-sm text-right font-bold text-[#1A2536]">{it.quantity}</td>
                                            <td className="px-6 py-4 text-sm text-right font-extrabold text-[#1A2536]">{inr(it.total_price)}</td>
                                            <td className="px-6 py-4 text-sm text-center">
                                                {it.is_mto_pending ? (
                                                    <button
                                                        onClick={() => openMtoModal(it)}
                                                        className="px-4 py-1.5 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-full transition-all"
                                                    >
                                                        Map Product
                                                    </button>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Mapped
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals summary */}
                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 ml-auto max-w-sm">
                        <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[#1A2536]/60">Subtotal</span>
                                <span className="font-semibold text-[#1A2536]">{inr(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#1A2536]/60">Shipping</span>
                                <span className="font-semibold text-[#1A2536]">{inr(order.shipping_fee)}</span>
                            </div>
                            <div className="border-t border-[#E5BDB0]/40 pt-2.5 mt-2.5 flex justify-between">
                                <span className="font-bold text-[#1A2536]">Total</span>
                                <span className="font-extrabold text-xl text-[#1A2536]">{inr(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MTO Modal */}
            {mtoModal && (
                <div className="fixed inset-0 bg-[#1A2536]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <span className="font-cursive text-2xl text-[#B86B5A] block -mb-1">fabrication mapping</span>
                                <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Map Product to MTO Order</h2>
                            </div>
                            <button onClick={() => setMtoModal(null)} className="w-9 h-9 rounded-full hover:bg-[#E5BDB0]/20 flex items-center justify-center text-[#1A2536]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-sm text-[#1A2536]/70 mb-6">
                            Select a fabricated product to map to this order:
                        </p>
                        <div className="space-y-3 mb-6">
                            {availableProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-sm text-[#1A2536]/60">
                                        No matching products available. Add a new product first.
                                    </p>
                                </div>
                            ) : (
                                availableProducts.map((product) => (
                                    <div key={product.id} className="border-2 border-[#E5BDB0] rounded-2xl p-4 hover:border-[#B86B5A] transition-colors">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-mono font-bold text-[#1A2536]">{product.item_code}</p>
                                                <p className="text-sm text-[#1A2536]/80 mt-1">
                                                    {product.karat} {product.gold_color} Gold
                                                    {product.ring_size && ` · Size ${product.ring_size}`}
                                                </p>
                                                <p className="text-xs text-[#1A2536]/50 mt-1">
                                                    Hallmark: {product.hallmark_number || "—"} ·
                                                    Report: {product.report_number || "—"}
                                                </p>
                                                <p className="text-xs text-[#1A2536]/50">
                                                    Weight: {product.actual_net_weight}g ·
                                                    Diamond: {product.actual_diamond_weight}ct
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => mapProduct(product.id)}
                                                className="px-5 py-2.5 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow shrink-0"
                                            >
                                                Map to Order
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button
                            onClick={() => setMtoModal(null)}
                            className="w-full py-3 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}