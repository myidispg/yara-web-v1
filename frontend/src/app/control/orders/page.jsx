"use client";

import { useEffect, useState } from "react";
import controlApi from "@/api/controlClient";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const STATUS_STYLES = {
    placed: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
};

const STATUS_LABELS = {
    placed: "Placed",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const { data } = await controlApi.getOrders();
            setOrders(data.results || data);
        } catch (err) {
            console.error("Failed to load orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        if (!confirm(`Change order status to ${STATUS_LABELS[newStatus]}?`)) return;
        
        setUpdating(true);
        try {
            await controlApi.updateOrderStatus(orderId, newStatus);
            await loadOrders();
            if (selectedOrder?.id === orderId) {
                const { data } = await controlApi.getOrder(orderId);
                setSelectedOrder(data);
            }
        } catch (err) {
            alert("Failed to update status: " + (err.response?.data?.error || err.message));
        } finally {
            setUpdating(false);
        }
    };

    const cancelOrder = async (orderId) => {
        if (!confirm("Cancel this order? Stock will be returned automatically.")) return;
        
        setUpdating(true);
        try {
            await controlApi.cancelOrder(orderId);
            await loadOrders();
            setSelectedOrder(null);
        } catch (err) {
            alert("Failed to cancel: " + (err.response?.data?.error || err.message));
        } finally {
            setUpdating(false);
        }
    };

    const viewOrder = async (orderId) => {
        try {
            const { data } = await controlApi.getOrder(orderId);
            setSelectedOrder(data);
        } catch (err) {
            console.error("Failed to load order:", err);
        }
    };

    if (loading) return <div className="text-center py-12">Loading orders...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-serif text-4xl">Orders</h1>
                <p className="text-sm text-ink/60">{orders.length} total orders</p>
            </div>

            {selectedOrder ? (
                <div>
                    <button
                        onClick={() => setSelectedOrder(null)}
                        className="mb-6 text-sm text-gold-dark hover:text-ink flex items-center gap-2"
                    >
                        ← Back to Orders
                    </button>

                    <div className="bg-white rounded-xl border border-line p-8 shadow-card">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="font-serif text-2xl">Order {selectedOrder.order_number}</h2>
                                <p className="text-sm text-ink/60 mt-1">
                                    Placed on {new Date(selectedOrder.created_at).toLocaleString("en-IN")}
                                </p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-xs font-semibold ${STATUS_STYLES[selectedOrder.status] || "bg-gray-100 text-gray-800"}`}>
                                {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60 mb-2">Customer</p>
                                <p className="font-semibold">{selectedOrder.customer_name}</p>
                                <p className="text-sm text-ink/60">✉️ {selectedOrder.customer_email}</p>
                                <p className="text-sm text-ink/60">📞 {selectedOrder.customer_phone || "Not provided"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60 mb-2">Shipping Address</p>
                                {selectedOrder.address ? (
                                    <p className="text-sm text-ink/70">
                                        <span className="font-semibold text-ink">{selectedOrder.address.full_name}</span><br />
                                        {selectedOrder.address.line1}<br />
                                        {selectedOrder.address.line2 && <>{selectedOrder.address.line2}<br /></>}
                                        {selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.pincode}<br />
                                        <span className="text-ink/60">📞 {selectedOrder.address.phone}</span>
                                    </p>
                                ) : (
                                    <p className="text-sm text-ink/50">No address on file</p>
                                )}
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60 mb-4">Order Items</p>
                            <div className="space-y-3">
                                {selectedOrder.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-cream rounded-lg">
                                        <div>
                                            <p className="font-semibold">{item.product_name}</p>
                                            <p className="text-sm text-ink/60">{item.variant_label} × {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{inr(item.total_price)}</p>
                                            <p className="text-xs text-ink/50">{inr(item.unit_price)} each</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-line pt-6 mb-6">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-ink/60">Subtotal</span>
                                    <span className="font-semibold">{inr(selectedOrder.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-ink/60">Shipping</span>
                                    <span className="font-semibold">{inr(selectedOrder.shipping_fee)}</span>
                                </div>
                                <div className="flex justify-between text-lg border-t border-line pt-2 mt-2">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-bold">{inr(selectedOrder.total)}</span>
                                </div>
                            </div>
                        </div>

                        {selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                            <div className="flex gap-3">
                                {selectedOrder.status === "placed" && (
                                    <>
                                        <button
                                            onClick={() => updateStatus(selectedOrder.id, "confirmed")}
                                            disabled={updating}
                                            className="btn-solid flex-1"
                                        >
                                            Mark as Confirmed
                                        </button>
                                        <button
                                            onClick={() => cancelOrder(selectedOrder.id)}
                                            disabled={updating}
                                            className="btn-outline flex-1 text-red-600 border-red-600 hover:bg-red-50"
                                        >
                                            Cancel Order
                                        </button>
                                    </>
                                )}
                                {selectedOrder.status === "confirmed" && (
                                    <>
                                        <button
                                            onClick={() => updateStatus(selectedOrder.id, "shipped")}
                                            disabled={updating}
                                            className="btn-solid flex-1"
                                        >
                                            Mark as Shipped
                                        </button>
                                        <button
                                            onClick={() => cancelOrder(selectedOrder.id)}
                                            disabled={updating}
                                            className="btn-outline flex-1 text-red-600 border-red-600 hover:bg-red-50"
                                        >
                                            Cancel Order
                                        </button>
                                    </>
                                )}
                                {selectedOrder.status === "shipped" && (
                                    <button
                                        onClick={() => updateStatus(selectedOrder.id, "delivered")}
                                        disabled={updating}
                                        className="btn-solid flex-1"
                                    >
                                        Mark as Delivered
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-line shadow-card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-cream border-b border-line">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.16em] font-semibold">Order</th>
                                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.16em] font-semibold">Customer</th>
                                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.16em] font-semibold">Date</th>
                                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.16em] font-semibold">Total</th>
                                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.16em] font-semibold">Status</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        viewOrder(order.id);
                                    }}
                                    className="border-b border-line hover:bg-cream/50 transition-colors cursor-pointer select-none"
                                >
                                    <td className="px-6 py-4">
                                        <p className="font-semibold">{order.order_number}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm">{order.customer_name}</p>
                                        <p className="text-xs text-ink/60">{order.customer_email}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-ink/70">
                                        {new Date(order.created_at).toLocaleDateString("en-IN")}
                                    </td>
                                    <td className="px-6 py-4 font-semibold">{inr(order.total)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] || "bg-gray-100 text-gray-800"}`}>
                                            {STATUS_LABELS[order.status] || order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm text-gold-dark font-semibold">View →</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}