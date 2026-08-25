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

export default function CustomerDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { document.title = "Customer | Control Panel"; }, []);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await controlApi.getCustomerFull(id);
                setData(data);
            } catch (err) {
                console.error("Failed to load customer:", err);
                if (err.response?.status === 404) {
                    alert("Customer not found");
                    router.push("/control/orders");
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading || !data) return <div className="text-center py-12">Loading customer…</div>;

    const c = data.customer;
    const name = `${c.first_name} ${c.last_name}`.trim() || c.email;

    return (
        <div>
            <button onClick={() => window.history.back()} className="mb-6 text-sm text-gold-dark hover:text-ink">← Back</button>

            <h1 className="font-serif text-3xl mb-2">{name}</h1>
            <p className="text-sm text-ink/60 mb-8">Customer since {new Date(c.date_joined).toLocaleDateString("en-IN")}</p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                    <p className="text-xs uppercase tracking-[0.16em] font-semibold text-ink/60 mb-1">Email</p>
                    <p className="text-sm font-semibold break-all">{c.email}</p>
                </div>
                <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                    <p className="text-xs uppercase tracking-[0.16em] font-semibold text-ink/60 mb-1">Phone</p>
                    <p className="text-sm font-semibold">{c.phone || "—"}</p>
                </div>
                <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                    <p className="text-xs uppercase tracking-[0.16em] font-semibold text-ink/60 mb-1">Total Orders</p>
                    <p className="text-2xl font-semibold">{data.total_orders}</p>
                </div>
                <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                    <p className="text-xs uppercase tracking-[0.16em] font-semibold text-ink/60 mb-1">Total Spent</p>
                    <p className="text-2xl font-semibold">{inr(data.total_spent)}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-line shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-line bg-cream">
                    <h3 className="font-semibold">Order History ({data.orders.length})</h3>
                </div>
                <table className="w-full">
                    <thead className="bg-cream/50">
                        <tr>
                            <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Order #</th>
                            <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Date</th>
                            <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Status</th>
                            <th className="text-right px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.orders.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-ink/50">No orders yet.</td></tr>
                        ) : data.orders.map((o) => {
                            const st = STATUS[o.status] || { label: o.status, cls: "bg-gray-100 text-gray-800" };
                            return (
                                <tr key={o.id} className="border-b border-line last:border-0 hover:bg-cream/30">
                                    <td className="px-6 py-4">
                                        <Link href={`/control/orders/${o.id}`} className="font-mono text-sm text-gold-dark hover:text-ink font-semibold">{o.order_number}</Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{new Date(o.created_at).toLocaleString("en-IN")}</td>
                                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span></td>
                                    <td className="px-6 py-4 text-sm text-right font-semibold">{inr(o.total)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}