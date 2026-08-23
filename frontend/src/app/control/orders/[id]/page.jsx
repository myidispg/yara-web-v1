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
                        Placed {new Date(order.created_at).toLocaleString("en-IN")} · {order.payment_method}
                    </p>
                </div>
                <Link href="/control/orders" className="btn-outline text-sm">All Orders</Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                        <h3 className="font-serif text-xl mb-4">Customer</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between gap-2"><span className="text-ink/60">Name</span><span className="font-semibold text-right">{order.customer_name}</span></div>
                            <div className="flex justify-between gap-2"><span className="text-ink/60">Email</span><span className="font-semibold text-right">{order.customer_email}</span></div>
                            <div className="flex justify-between gap-2"><span className="text-ink/60">Phone</span><span className="font-semibold text-right">{order.customer_phone}</span></div>
                        </div>
                        {order.customer_id && (
                            <Link href={`/control/customers/${order.customer_id}`} className="btn-outline w-full mt-4 text-sm">View Customer Profile</Link>
                        )}
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
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-line shadow-card overflow-hidden">
                        <div className="px-6 py-4 border-b border-line bg-cream">
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
                                            {it.instance ? (
                                                <Link href={`/control/inventory/products/${it.instance}`} className="font-mono text-gold-dark hover:text-ink font-semibold">
                                                    {it.product_name}
                                                </Link>
                                            ) : (
                                                <span className="font-medium">{it.product_name}</span>
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