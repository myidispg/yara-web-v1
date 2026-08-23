"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import controlApi from "@/api/controlClient";

const inr = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);
const fmt = (d) => d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const STATUS = {
    in_stock: { label: "In Stock", cls: "bg-green-100 text-green-800" },
    sold: { label: "Sold (Online)", cls: "bg-gray-200 text-gray-700" },
    sold_offline: { label: "Sold (Offline)", cls: "bg-purple-100 text-purple-800" },
    reserved: { label: "Reserved", cls: "bg-yellow-100 text-yellow-800" },
};

export default function ControlProductPage() {
    const { id } = useParams();
    const router = useRouter();
        const [p, setP] = useState(null);
    const [loading, setLoading] = useState(true);
    const [edit, setEdit] = useState(null);

    const load = async () => {
        try {
                        const { data } = await controlApi.getProductDetail(id);
            setP(data);
            setEdit({
                price: String(data.price),
                diamond_grade: data.diamond_grade || "",
                report_lab: data.report_lab || "",
                report_number: data.report_number || "",
                hallmark_number: data.hallmark_number || "",
            });
        } catch (e) {
            console.error("Failed to load product:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [id]);

    useEffect(() => {
        document.title = p ? `${p.item_code} | Control Panel` : "Product | Control Panel";
    }, [p]);

    const markSold = async () => {
        if (!confirm("Mark this product as SOLD OFFLINE (showroom sale)?")) return;
        await controlApi.markSoldOffline(p.id);
        load();
    };

    const returnToStock = async () => {
        if (!confirm("Return this product to stock?")) return;
        await controlApi.returnToStock(p.id);
        load();
    };

    const deleteProduct = async () => {
        if (!confirm(`Permanently delete ${p.item_code}? This cannot be undone.`)) return;
        try {
            await controlApi.deleteProduct(p.id);
            router.push(`/control/inventory?design=${p.design_id}`);
        } catch (err) {
            alert(err.response?.data?.error || "Cannot delete this product.");
        }
    };

        const saveEdit = async () => {
        try {
            await controlApi.updateProduct(p.id, {
                price: parseFloat(edit.price),
                diamond_grade: edit.diamond_grade.trim(),
                report_lab: edit.report_lab.trim(),
                report_number: edit.report_number.trim(),
                hallmark_number: edit.hallmark_number.trim(),
            });
            alert("Product updated.");
            load();
        } catch (err) {
            alert("Failed: " + JSON.stringify(err.response?.data || err.message));
        }
    };

    if (loading) return <div className="text-center py-12">Loading product…</div>;
    if (!p) return <div className="text-center py-12">Product not found.</div>;

    const st = STATUS[p.status] || { label: p.status, cls: "bg-gray-100 text-gray-700" };

    const Row = ({ label, value }) => (
        <div className="flex justify-between gap-4 text-sm py-1.5">
            <span className="text-ink/60">{label}</span>
            <span className="font-medium text-right">{value}</span>
        </div>
    );

    return (
        <div>
            <Link href={`/control/inventory?design=${p.design_id}`} className="text-sm text-gold-dark hover:text-ink">
                ← Back to {p.design_code}
            </Link>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 mb-8">
                <div>
                    <h1 className="font-serif text-3xl flex items-center gap-4">
                        {p.item_code}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                    </h1>
                    <p className="text-sm text-ink/60 mt-1">{p.design_name} · {p.category_name}</p>
                </div>
                <div className="flex gap-2">
                    {p.status === "in_stock" ? (
                        <>
                            <button onClick={markSold} className="btn-solid text-sm">Mark Sold Offline</button>
                            <button onClick={deleteProduct} className="btn-outline text-sm text-red-600 border-red-600 hover:bg-red-50">Delete</button>
                        </>
                    ) : (
                        <button onClick={returnToStock} className="btn-solid text-sm">Return to Stock</button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Specifications */}
                <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                    <h3 className="font-serif text-xl mb-4">Specifications</h3>
                    <Row label="Design" value={<Link className="text-gold-dark hover:text-ink" href={`/control/inventory?design=${p.design_id}`}>{p.design_code}</Link>} />
                    <Row label="Karat" value={p.karat} />
                    <Row label="Gold Colour" value={p.gold_color} />
                    <Row label="Ring Size" value={p.ring_size || "—"} />
                    <Row label="Diamond Grade" value={p.diamond_grade} />
                    <Row label="Hallmark (HUID)" value={p.hallmark_number || "—"} />
                    <Row label="Certificate" value={p.report_number ? `${p.report_lab} #${p.report_number}` : "—"} />
                </div>

                {/* Weights & Pricing */}
                <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                    <h3 className="font-serif text-xl mb-4">Weights & Pricing</h3>
                    <Row label="Net Weight" value={`${Number(p.actual_net_weight).toFixed(3)} g`} />
                    <Row label="Diamond Weight" value={`${Number(p.actual_diamond_weight).toFixed(2)} ct`} />
                    <Row label="Color Stone Weight" value={`${Number(p.actual_color_stone_weight).toFixed(2)} ct`} />
                    <div className="border-t border-line my-3" />
                    <Row label="Gold Value" value={inr(p.gold_value)} />
                    <Row label="Diamond Value" value={inr(p.diamond_value)} />
                    <Row label="Making Charges" value={inr(p.making_charges)} />
                    <Row label="GST" value={inr(p.gst_amount)} />
                    <div className="border-t border-line my-3" />
                    <Row label="Final Price" value={<span className="font-semibold text-base">{inr(p.price)}</span>} />
                </div>

                {/* Lifecycle */}
                <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                    <h3 className="font-serif text-xl mb-4">Lifecycle</h3>
                    <Row label="Added on cPanel" value={fmt(p.created_at)} />
                    <Row label="Sold On" value={fmt(p.sold_at)} />
                    <Row label="Sold In Order" value={p.sold_in_order_number || "—"} />
                    <Row label="Sold To" value={p.sold_to_email || "—"} />
                    {p.sold_in_order_id && (
                        <Link href="/control/orders" className="inline-block mt-3 text-xs text-gold-dark font-semibold hover:text-ink">
                            View order →
                        </Link>
                    )}
                </div>
                        </div>

            {/* Edit Product */}
            <div className="bg-white rounded-xl border border-line p-6 shadow-card mt-6 max-w-2xl">
                <h3 className="font-serif text-xl mb-4">Edit Product</h3>
                {edit && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-1">Price (₹)</label>
                            <input type="number" value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-1">Diamond Grade</label>
                            <input value={edit.diamond_grade} onChange={(e) => setEdit({ ...edit, diamond_grade: e.target.value })} className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-1">Report Lab</label>
                            <input value={edit.report_lab} onChange={(e) => setEdit({ ...edit, report_lab: e.target.value })} className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-1">Report Number</label>
                            <input value={edit.report_number} onChange={(e) => setEdit({ ...edit, report_number: e.target.value })} className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-1">Hallmark (HUID)</label>
                            <input value={edit.hallmark_number} onChange={(e) => setEdit({ ...edit, hallmark_number: e.target.value })} className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div className="sm:col-span-2">
                            <button onClick={saveEdit} className="btn-solid w-full text-sm">Save Changes</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}