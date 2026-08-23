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

const KARAT_OPTIONS = ["14Kt", "18Kt"];
const COLOR_OPTIONS = ["Yellow", "Rose", "White"];
const RING_SIZES = ["6", "8", "10", "12", "14", "16", "18", "20"];

export default function ControlProductPage() {
    const { id } = useParams();
    const router = useRouter();
    const [p, setP] = useState(null);
    const [design, setDesign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [previewPrice, setPreviewPrice] = useState(null);

    const load = async () => {
        try {
            const { data } = await controlApi.getProductDetail(id);
            setP(data);
            if (data.design) {
                const d = await controlApi.getProduct(data.design);
                setDesign(d.data || d);
            }
        } catch (e) {
            console.error("Failed to load product:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [id]);

    useEffect(() => {
        if (!editForm || !p) return;
        const fetchPreview = async () => {
            try {
                const { data } = await controlApi.previewPrice({
                    product_id: p.id,
                    karat: editForm.karat,
                    diamond_grade: editForm.diamond_grade,
                });
                setPreviewPrice(data.price);
            } catch (err) {
                console.error("Preview failed:", err);
            }
        };
        fetchPreview();
    }, [editForm?.karat, editForm?.diamond_grade, p]);

    useEffect(() => {
        document.title = p ? `${p.item_code} | Control Panel` : "Product | Control Panel";
    }, [p]);

    const openEdit = () => {
        setEditForm({
            karat: p.karat,
            gold_color: p.gold_color,
            ring_size: p.ring_size || "",
            diamond_grade: p.diamond_grade,
            report_lab: p.report_lab || "",
            report_number: p.report_number || "",
            hallmark_number: p.hallmark_number || "",
        });
        setShowEdit(true);
    };

    const saveEdit = async () => {
        setSaving(true);
        try {
            const payload = {
                karat: editForm.karat,
                gold_color: editForm.gold_color,
                ring_size: editForm.ring_size || null,
                diamond_grade: editForm.diamond_grade,
                report_lab: editForm.report_lab.trim(),
                report_number: editForm.report_number.trim(),
                hallmark_number: editForm.hallmark_number.trim(),
            }; await controlApi.updateProduct(p.id, payload);
            setShowEdit(false);
            await load();
        } catch (err) {
            alert("Failed to save: " + JSON.stringify(err.response?.data || err.message));
        } finally {
            setSaving(false);
        }
    };

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

    if (loading) return <div className="text-center py-12">Loading product…</div>;
    if (!p) return <div className="text-center py-12">Product not found.</div>;

    const st = STATUS[p.status] || { label: p.status, cls: "bg-gray-100 text-gray-700" };
    const isRing = design?.is_ring || false;

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
                    <button onClick={openEdit} className="btn-solid text-sm">Edit Product</button>
                    {p.status === "in_stock" ? (
                        <>
                            <button onClick={markSold} className="btn-outline text-sm">Mark Sold Offline</button>
                            <button onClick={deleteProduct} className="btn-outline text-sm text-red-600 border-red-600 hover:bg-red-50">Delete</button>
                        </>
                    ) : (
                        <button onClick={returnToStock} className="btn-outline text-sm text-green-700 border-green-700 hover:bg-green-50">Return to Stock</button>
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

            {/* Media Gallery */}
            {design?.media && design.media.length > 0 && (
                <div className="mt-8 bg-white rounded-xl border border-line p-6 shadow-card">
                    <h3 className="font-serif text-xl mb-4">Product Media</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {design.media.map((m, i) => (
                            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-cream">
                                {m.kind === "video" ? (
                                    <video src={m.url} className="w-full h-full object-cover" controls muted />
                                ) : (
                                    <img src={m.url} alt={p.design_name} className="w-full h-full object-cover" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEdit && editForm && (
                <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4" onClick={() => setShowEdit(false)}>
                    <div className="bg-white rounded-xl border border-line p-8 shadow-hero w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h2 className="font-serif text-2xl mb-6">Edit {p.item_code}</h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Karat</label>
                                    <select value={editForm.karat} onChange={(e) => setEditForm({ ...editForm, karat: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3 text-sm">
                                        {KARAT_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Gold Colour</label>
                                    <select value={editForm.gold_color} onChange={(e) => setEditForm({ ...editForm, gold_color: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3 text-sm">
                                        {COLOR_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            {isRing && (
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Ring Size</label>
                                    <select value={editForm.ring_size} onChange={(e) => setEditForm({ ...editForm, ring_size: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3 text-sm">
                                        <option value="">No size</option>
                                        {RING_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Diamond Grade</label>
                                <input value={editForm.diamond_grade} onChange={(e) => setEditForm({ ...editForm, diamond_grade: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3 text-sm" placeholder="e.g., IJ/SI" />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Calculated Price (₹)</label>
                                <div className="w-full border border-line rounded-lg px-4 py-3 text-sm bg-cream font-semibold">
                                    {inr(previewPrice || p.price)}
                                </div>
                                <p className="text-[10px] text-ink/50 mt-1">Auto-calculated based on weight, karat, and grade</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Certificate Lab</label>
                                    <input value={editForm.report_lab} onChange={(e) => setEditForm({ ...editForm, report_lab: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3 text-sm" placeholder="e.g., IGI, GIA" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Certificate Number</label>
                                    <input value={editForm.report_number} onChange={(e) => setEditForm({ ...editForm, report_number: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3 text-sm" placeholder="e.g., 123456789" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Hallmark (HUID)</label>
                                <input value={editForm.hallmark_number} onChange={(e) => setEditForm({ ...editForm, hallmark_number: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3 text-sm" placeholder="e.g., HMK-001" />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowEdit(false)} className="btn-outline flex-1">Cancel</button>
                            <button onClick={saveEdit} disabled={saving} className="btn-solid flex-1">
                                {saving ? "Saving…" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}