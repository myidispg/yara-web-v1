"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => { document.title = "Customer | cPanel"; }, []);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await controlApi.getCustomerFull(id);
                setData(data);
            } catch (err) {
                console.error("Failed to load customer:", err);
                if (err.response?.status === 404) {
                    alert("Customer not found");
                    router.push("/cpanel/customers"); // Fixed: Redirects to customer list, not orders
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const handleDeactivate = async () => {
        if (!confirm(`Deactivate this account? They will be locked out immediately.`)) return;
        setProcessing(true);
        try {
            await controlApi.deactivateUser(id);
            window.location.reload();
        } catch (err) {
            alert("Failed: " + (err.response?.data?.error || err.message));
            setProcessing(false);
        }
    };

    const handleActivate = async () => {
        if (!confirm(`Reactivate this account? They will be able to log in again.`)) return;
        setProcessing(true);
        try {
            await controlApi.activateUser(id);
            window.location.reload();
        } catch (err) {
            alert("Failed: " + (err.response?.data?.error || err.message));
            setProcessing(false);
        }
    };

    if (loading || !data) return <div className="text-center py-12 text-[#1A2536]/50">Loading customer…</div>;

    const c = data.customer;
    const name = `${c.first_name} ${c.last_name}`.trim() || c.email;

    return (
        <div>
            <button onClick={() => router.push("/cpanel/customers")} className="mb-6 text-xs text-[#B86B5A] font-bold uppercase tracking-wider hover:underline">
                ← Back to Customers
            </button>

            <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
                <div className="flex items-center gap-3">
                    <h1 className="font-serif-luxury text-3xl font-semibold text-[#1A2536]">{name}</h1>
                    {c.is_staff && (
                        <span className="px-3 py-1 bg-[#1A2536] text-white text-xs font-semibold rounded-full uppercase tracking-wider">
                            Staff Account
                        </span>
                    )}
                    {!c.is_active && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-full uppercase tracking-wider">
                            Deactivated
                        </span>
                    )}
                </div>

                {/* USER ACTIONS: Deactivate / Activate */}
                {!c.is_staff && (
                    c.is_active ? (
                        <button
                            onClick={handleDeactivate}
                            disabled={processing}
                            className="px-6 py-2.5 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all disabled:opacity-50"
                        >
                            {processing ? "Processing..." : "Deactivate Account"}
                        </button>
                    ) : (
                        <button
                            onClick={handleActivate}
                            disabled={processing}
                            className="px-6 py-2.5 border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all disabled:opacity-50"
                        >
                            {processing ? "Processing..." : "Activate Account"}
                        </button>
                    )
                )}
            </div>
            <p className="text-sm text-[#1A2536]/60 mb-8">Customer since {new Date(c.date_joined).toLocaleDateString("en-IN")}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-[#E5BDB0] p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.16em] font-semibold text-[#1A2536]/60 mb-1">Email</p>
                    <p className="text-sm font-semibold break-all text-[#1A2536]">{c.email || "—"}</p>
                </div>
                <div className="bg-white rounded-xl border border-[#E5BDB0] p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.16em] font-semibold text-[#1A2536]/60 mb-1">Phone</p>
                    <p className="text-sm font-semibold text-[#1A2536]">{c.phone || "—"}</p>
                </div>
                <div className="bg-white rounded-xl border border-[#E5BDB0] p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.16em] font-semibold text-[#1A2536]/60 mb-1">Gender</p>
                    <p className="text-sm font-semibold text-[#1A2536] capitalize">
                        {c.gender ? c.gender.replace(/_/g, ' ') : "—"}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-[#E5BDB0] p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.16em] font-semibold text-[#1A2536]/60 mb-1">Date of Birth</p>
                    <p className="text-sm font-semibold text-[#1A2536]">
                        {c.date_of_birth
                            ? c.date_of_birth.split("-").reverse().join("/")
                            : "—"}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-[#E5BDB0] p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.16em] font-semibold text-[#1A2536]/60 mb-1">Total Orders</p>
                    <p className="text-2xl font-semibold text-[#1A2536]">{data.total_orders}</p>
                </div>
                <div className="bg-white rounded-xl border border-[#E5BDB0] p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.16em] font-semibold text-[#1A2536]/60 mb-1">Total Spent</p>
                    <p className="text-2xl font-semibold text-[#1A2536]">{inr(data.total_spent)}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E5BDB0] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E5BDB0] bg-[#1A2536]/[0.03]">
                    <h3 className="font-serif-luxury text-lg font-semibold text-[#1A2536]">Order History ({data.orders.length})</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#1A2536]/[0.02]">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold text-[#1A2536]">Order #</th>
                                <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold text-[#1A2536]">Date</th>
                                <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold text-[#1A2536]">Status</th>
                                <th className="text-right px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold text-[#1A2536]">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.orders.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-[#1A2536]/50">No orders yet.</td></tr>
                            ) : data.orders.map((o) => {
                                const st = STATUS[o.status] || { label: o.status, cls: "bg-gray-100 text-gray-800" };
                                return (
                                    <tr key={o.id} className="border-b border-[#E5BDB0]/30 last:border-0 hover:bg-[#1A2536]/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <Link href={`/cpanel/orders/${o.id}`} className="font-mono text-sm text-[#B86B5A] hover:text-[#1A2536] hover:underline font-semibold">{o.order_number}</Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#1A2536]/70">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                                        <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold border ${st.cls}`}>{st.label}</span></td>
                                        <td className="px-6 py-4 text-sm text-right font-semibold text-[#1A2536]">{inr(o.total)}</td>
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