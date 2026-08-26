"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import controlApi from "@/api/controlClient";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const STATUS = {
    placed: { label: "Placed", cls: "bg-blue-100 text-blue-800" },
    confirmed: { label: "Confirmed", cls: "bg-yellow-100 text-yellow-800" },
    shipped: { label: "Shipped", cls: "bg-purple-100 text-purple-800" },
    delivered: { label: "Delivered", cls: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-800" },
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
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading || !order) return <div className="text-center py-12">Loading order…</div>;

    const st = STATUS[order.status] || { label: order.status, cls: "bg-gray-100 text-gray-800" };

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
            // If backend returns full order, use it. Otherwise reload.
            if (data && data.order_number) {
                setOrder(data);
            } else {
                // Reload the order
                const { data: freshOrder } = await controlApi.getOrder(id);
                setOrder(freshOrder);
            }
        } catch (err) {
            alert("Failed: " + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div>
            <button onClick={() => window.history.back()} className="mb-6 text-sm text-gold-dark hover:text-ink">← Back</button>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-4">
                        <h1 className="font-serif text-3xl font-mono">{order.order_number}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                    </div>
                    <p className="text-sm text-ink/60 mt-1">
                        Placed {new Date(order.placed_at || order.created_at).toLocaleString("en-IN")} · {PAYMENT_LABELS[order.payment_method] || order.payment_method}
                    </p>
                </div>
                <div className="flex gap-2">
                    {order.status === "placed" && (
                        <button onClick={() => updateStatus("confirmed")} className="btn-outline text-sm">Confirm</button>
                    )}
                    {order.status === "confirmed" && (
                        <button onClick={() => updateStatus("shipped")} className="btn-outline text-sm">Mark Shipped</button>
                    )}
                    {order.status === "shipped" && (
                        <button onClick={() => updateStatus("delivered")} className="btn-outline text-sm">Mark Delivered</button>
                    )}
                    {(order.status === "placed" || order.status === "confirmed") && (
                        <button onClick={() => updateStatus("cancelled")} className="btn-outline text-sm text-red-600 border-red-600 hover:bg-red-50">Cancel</button>
                    )}
                    <Link href="/control/orders" className="btn-outline text-sm">All Orders</Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column: Customer, Payment, Address, Timeline */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                        <h3 className="font-serif text-xl mb-4">Customer</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between gap-2">
                                <span className="text-ink/60">Name</span>
                                <span className="font-semibold text-right">{order.customer_name}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="text-ink/60">Email</span>
                                <span className="font-semibold text-right">{order.customer_email}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="text-ink/60">Phone</span>
                                <span className="font-semibold text-right">{order.customer_phone}</span>
                            </div>
                        </div>
                        {order.customer_id && (
                            <Link
                                href={`/control/customers/${order.customer_id}`}
                                className="btn-outline w-full mt-4 text-sm"
                                onClick={(e) => {
                                    // Prevent navigation if customer_id is invalid
                                    if (!order.customer_id || order.customer_id <= 0) {
                                        e.preventDefault();
                                        alert("Customer profile not available");
                                    }
                                }}
                            >
                                View Customer Profile
                            </Link>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                        <h3 className="font-serif text-xl mb-4">Payment</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between gap-2">
                                <span className="text-ink/60">Method</span>
                                <span className="font-semibold uppercase">{order.payment_method}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="text-ink/60">Transaction ID</span>
                                <span className="font-mono text-xs">{order.transaction_id || "—"}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="text-ink/60">Subtotal (excl. tax)</span>
                                <span>{inr(order.subtotal_excl_tax)}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="text-ink/60">GST (3%)</span>
                                <span>{inr(order.gst_amount)}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="text-ink/60">Shipping</span>
                                <span>{inr(order.shipping_fee)}</span>
                            </div>
                            <div className="border-t border-line pt-2 mt-2 flex justify-between gap-2 font-semibold">
                                <span>Total</span>
                                <span className="text-lg">{inr(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                        <h3 className="font-serif text-xl mb-4">Shipping Address</h3>
                        {order.address ? (
                            <p className="text-sm text-ink/70 leading-relaxed">
                                {order.address.full_name}<br />
                                {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />
                                {order.address.city}, {order.address.state} — {order.address.pincode}<br />
                                {order.address.phone}
                            </p>
                        ) : (
                            <p className="text-sm text-ink/50">No address recorded.</p>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                        <h3 className="font-serif text-xl mb-4">Timeline</h3>
                        <div className="relative pl-8">
                            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-line" />
                            {(order.timeline || []).map((event, idx) => {
                                const isLast = idx === order.timeline.length - 1;
                                const labels = {
                                    placed: "Order Placed",
                                    confirmed: "Order Confirmed",
                                    shipped: "Shipped",
                                    delivered: "Delivered",
                                    cancelled: "Cancelled"
                                };
                                return (
                                    <div key={idx} className="relative mb-6 last:mb-0">
                                        <div className={`absolute -left-8 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${isLast ? "bg-gold-dark border-gold-dark text-white" : "bg-white border-line text-ink/40"
                                            }`}>
                                            {isLast ? "✓" : "•"}
                                        </div>
                                        <div>
                                            <p className={`font-semibold text-sm ${isLast ? "text-ink" : "text-ink/70"}`}>
                                                {labels[event.status] || event.status}
                                            </p>
                                            <p className="text-xs text-ink/50">
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
                        <div className="bg-cream rounded-xl border border-line p-6 shadow-card">
                            <h3 className="font-serif text-xl mb-3">Invoice</h3>
                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between">
                                    <span className="text-ink/60">Invoice No.</span>
                                    <span className="font-mono font-semibold">{order.invoice_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-ink/60">Total</span>
                                    <span className="font-semibold">{inr(order.total)}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={async () => {
                                        try {
                                            const response = await controlApi.downloadInvoice(order.invoice_id);
                                            const url = URL.createObjectURL(response.data);
                                            window.open(url, '_blank');
                                        } catch (err) {
                                            console.error("Failed to open invoice:", err);
                                            alert("Failed to open invoice PDF.");
                                        }
                                    }}
                                    className="btn-outline flex-1 text-sm"
                                >
                                    View PDF
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
                                            console.error("Failed to download invoice:", err);
                                            alert("Failed to download invoice PDF.");
                                        }
                                    }}
                                    className="btn-solid flex-1 text-sm"
                                >
                                    Download
                                </button>
                            </div>
                        </div>
                    )}

                    {order.status === "delivered" && !order.invoice_number && (
                        <div className="bg-cream rounded-xl border border-line p-6 shadow-card">
                            <h3 className="font-serif text-xl mb-3">Invoice</h3>
                            <p className="text-sm text-ink/60">Invoice not yet generated.</p>
                        </div>
                    )}
                </div>

                {/* Right column: Items table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-line shadow-card overflow-hidden">
                        <div className="px-6 py-4 border-b border-line bg-cream flex items-center justify-between">
                            <h3 className="font-semibold">Items ({order.items.length})</h3>
                        </div>
                        <table className="w-full">
                            <thead className="bg-cream/50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Product</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Variant</th>
                                    <th className="text-right px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Qty</th>
                                    <th className="text-right px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((it) => (
                                    <tr key={it.id} className="border-b border-line last:border-0">
                                        <td className="px-6 py-4 text-sm">
                                            {it.design_id ? (
                                                <Link href={`/control/inventory?design=${it.design_id}`} className="text-gold-dark hover:text-ink font-semibold">
                                                    {it.product_name}
                                                </Link>
                                            ) : (
                                                <span className="font-medium">{it.product_name}</span>
                                            )}
                                            {it.design_code && (
                                                <p className="text-xs text-ink/50 font-mono mt-0.5">{it.design_code}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-ink/70">{it.variant_label || "—"}</td>
                                        <td className="px-6 py-4 text-sm text-right">{it.quantity}</td>
                                        <td className="px-6 py-4 text-sm text-right font-semibold">{inr(it.total_price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals summary */}
                    <div className="bg-white rounded-xl border border-line p-6 shadow-card max-w-sm ml-auto">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span>{inr(order.subtotal)}</span></div>
                            <div className="flex justify-between"><span className="text-ink/60">Shipping</span><span>{inr(order.shipping_fee)}</span></div>
                            <div className="flex justify-between border-t border-line pt-2 mt-2">
                                <span className="font-semibold">Total</span>
                                <span className="font-semibold text-lg">{inr(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}