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
    const [rateCard, setRateCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [previewPrice, setPreviewPrice] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

    const load = async () => {
        try {
            const { data } = await controlApi.getProductDetail(id);
            setP(data);
            if (data.design_id) {
                const d = await controlApi.getProduct(data.design_id);
                setDesign(d.data || d);
            }
            const rc = await controlApi.getRateCard();
            setRateCard(rc.data);
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
            item_code: p.item_code,
            karat: p.karat,
            gold_color: p.gold_color,
            ring_size: p.ring_size || "",
            diamond_grade: p.diamond_grade,
            actual_net_weight: p.actual_net_weight || "",
            actual_diamond_weight: p.actual_diamond_weight || "",
            actual_color_stone_weight: p.actual_color_stone_weight || "",
            report_lab: p.report_lab || "",
            report_number: p.report_number || "",
            hallmark_numbers: p.hallmark_numbers?.length ? [...p.hallmark_numbers] : [""],
            status: p.status,
            melle_weight: design?.diamond_weight_round_melle || "",
            pointer_weights: design?.pointer_weights?.length ? [...design.pointer_weights] : [""],
            fancy_weights: design?.fancy_weights?.length ? [...design.fancy_weights] : [""],
            color_stone_weights: design?.color_stone_weights?.length ? [...design.color_stone_weights] : [""],
        });
        setIsDirty(false);
        setShowEdit(true);
    };

    // Single helper: updates form AND marks dirty
    const updateForm = (updates) => {
        setEditForm(prev => ({ ...prev, ...updates }));
        setIsDirty(true);
    };

    // Close handler: confirms if unsaved changes exist
    const handleClose = () => {
        if (isDirty && !confirm("You have unsaved changes. Discard them?")) {
            return;
        }
        setShowEdit(false);
        setIsDirty(false);
    };

    // Array helpers — all now mark dirty
    const addHuid = () => {
        if (editForm.hallmark_numbers.length < 3) {
            updateForm({ hallmark_numbers: [...editForm.hallmark_numbers, ""] });
        }
    };
    const removeHuid = (i) => {
        if (editForm.hallmark_numbers.length > 1) {
            updateForm({ hallmark_numbers: editForm.hallmark_numbers.filter((_, idx) => idx !== i) });
        }
    };
    const updateHuid = (i, val) => {
        // Strip non-alphanumeric characters and force uppercase
        const cleanVal = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const updated = [...editForm.hallmark_numbers];
        updated[i] = cleanVal;
        updateForm({ hallmark_numbers: updated });
    };

    const addField = (field) => {
        updateForm({ [field]: [...editForm[field], ""] });
    };
    const removeField = (field, i) => {
        if (editForm[field].length > 1) {
            updateForm({ [field]: editForm[field].filter((_, idx) => idx !== i) });
        }
    };
    const updateField = (field, i, val) => {
        const updated = [...editForm[field]];
        updated[i] = val;
        updateForm({ [field]: updated });
    };

    const saveEdit = async () => {
        setSaving(true);
        try {
            await controlApi.updateProduct(p.id, {
                item_code: editForm.item_code.trim(),
                karat: editForm.karat,
                gold_color: editForm.gold_color,
                ring_size: editForm.ring_size || null,
                diamond_grade: editForm.diamond_grade,
                actual_net_weight: parseFloat(editForm.actual_net_weight) || 0,
                actual_diamond_weight: parseFloat(editForm.actual_diamond_weight) || 0,
                actual_color_stone_weight: parseFloat(editForm.actual_color_stone_weight) || 0,
                report_lab: editForm.report_lab.trim(),
                report_number: editForm.report_number.trim(),
                hallmark_numbers: editForm.hallmark_numbers.filter(h => h.trim()),
                status: editForm.status,
            });

            if (design) {
                await controlApi.updateDesign(design.id, {
                    name: design.name,
                    design_code: design.design_code,
                    category: design.category,
                    is_active: design.is_active,
                    diamond_weight_round_melle: parseFloat(editForm.melle_weight) || 0,
                    pointer_weights: editForm.pointer_weights.map(w => parseFloat(w) || 0).filter(w => w > 0),
                    fancy_weights: editForm.fancy_weights.map(w => parseFloat(w) || 0).filter(w => w > 0),
                    color_stone_weights: editForm.color_stone_weights.map(w => parseFloat(w) || 0).filter(w => w > 0),
                });
            }

            setShowEdit(false);
            setIsDirty(false);
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
            router.push(`/cpanel/inventory?design=${p.design_id}`);
        } catch (err) {
            alert(err.response?.data?.error || "Cannot delete this product.");
        }
    };

    if (loading) return <div className="text-center py-12">Loading product…</div>;
    if (!p) return <div className="text-center py-12">Product not found.</div>;

    const st = STATUS[p.status] || { label: p.status, cls: "bg-gray-100 text-gray-700" };
    const isRing = design?.is_ring || false;
    const huids = p.hallmark_numbers || [];

    const Row = ({ label, value }) => (
        <div className="flex justify-between gap-4 text-sm py-1.5">
            <span className="text-ink/60">{label}</span>
            <span className="font-medium text-right">{value}</span>
        </div>
    );

    return (
        <div>
            <Link href={`/cpanel/inventory?design=${p.design_id}`} className="text-sm text-gold-dark hover:text-ink">
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
                <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                    <h3 className="font-serif text-xl mb-4">Specifications</h3>
                    <Row label="Design" value={<Link className="text-gold-dark hover:text-ink" href={`/cpanel/inventory?design=${p.design_id}`}>{p.design_code}</Link>} />
                    <Row label="Karat" value={p.karat} />
                    <Row label="Gold Colour" value={p.gold_color} />
                    <Row label="Ring Size" value={p.ring_size || "—"} />
                    <Row label="Diamond Grade" value={p.diamond_grade} />
                    <Row label="Hallmark (HUID)" value={
                        huids.length > 0
                            ? <div className="text-right">{huids.map((h, i) => <div key={i} className="text-xs font-mono">{h}</div>)}</div>
                            : "—"
                    } />
                    <Row label="Diamond Report" value={p.report_number ? `${p.report_lab} #${p.report_number}` : "—"} />
                </div>

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

                <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                    <h3 className="font-serif text-xl mb-4">Lifecycle</h3>
                    <Row label="Added on cPanel" value={fmt(p.created_at)} />
                    <Row label="Sold On" value={fmt(p.sold_at)} />
                    <Row label="Sold In Order" value={p.sold_in_order_number || "—"} />
                    <Row label="Sold To" value={p.sold_to_email || "—"} />
                    {p.sold_in_order_id && (
                        <Link href="/cpanel/orders" className="inline-block mt-3 text-xs text-gold-dark font-semibold hover:text-ink">
                            View order →
                        </Link>
                    )}
                </div>
            </div>

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
                <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4" onClick={handleClose}>
                    <div className="bg-white rounded-xl border border-line p-8 shadow-hero w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif text-2xl">Edit {p.item_code}</h2>
                            {isDirty && (
                                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                                    Unsaved changes
                                </span>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Item Code *</label>
                                    <input
                                        value={editForm.item_code}
                                        onChange={(e) => updateForm({ item_code: e.target.value })}
                                        className="w-full border border-line rounded-lg px-4 py-3 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Status</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => updateForm({ status: e.target.value })}
                                        className="w-full border border-line rounded-lg px-4 py-3 text-sm"
                                    >
                                        <option value="in_stock">In Stock</option>
                                        <option value="sold">Sold (Online)</option>
                                        <option value="sold_offline">Sold (Offline)</option>
                                        <option value="reserved">Reserved</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Karat</label>
                                    <select value={editForm.karat} onChange={(e) => updateForm({ karat: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3 text-sm">
                                        {KARAT_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Gold Colour</label>
                                    <select value={editForm.gold_color} onChange={(e) => updateForm({ gold_color: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3 text-sm">
                                        {COLOR_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                {isRing && (
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Ring Size</label>
                                        <select value={editForm.ring_size} onChange={(e) => updateForm({ ring_size: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3 text-sm">
                                            <option value="">No size</option>
                                            {RING_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Net Weight (g)</label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={editForm.actual_net_weight}
                                        onChange={(e) => updateForm({ actual_net_weight: e.target.value })}
                                        className="w-full border border-line rounded-lg px-4 py-3 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Diamond Weight (ct)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editForm.actual_diamond_weight}
                                        onChange={(e) => updateForm({ actual_diamond_weight: e.target.value })}
                                        className="w-full border border-line rounded-lg px-4 py-3 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Color Stone (ct)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editForm.actual_color_stone_weight}
                                        onChange={(e) => updateForm({ actual_color_stone_weight: e.target.value })}
                                        className="w-full border border-line rounded-lg px-4 py-3 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Diamond Grade</label>
                                <select value={editForm.diamond_grade} onChange={(e) => updateForm({ diamond_grade: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3 text-sm">
                                    {rateCard && Object.entries(rateCard.diamond_rates || {})
                                        .filter(([, v]) => v)
                                        .map(([k]) => <option key={k} value={k}>{k}</option>)}
                                </select>
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
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Diamond Report Lab</label>
                                    <select value={editForm.report_lab} onChange={(e) => updateForm({ report_lab: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3 text-sm">
                                        <option>IGI</option><option>GIA</option><option>SGL</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Diamond Report Number</label>
                                    <input value={editForm.report_number} onChange={(e) => updateForm({ report_number: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3 text-sm" placeholder="e.g., 123456789" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">HUID Numbers (max 3)</label>
                                {editForm.hallmark_numbers.map((h, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            value={h}
                                            onChange={(e) => updateHuid(i, e.target.value)}
                                            className="w-full border border-line rounded-lg px-4 py-3 text-sm flex-1 font-mono tracking-wider"
                                            placeholder={`HUID ${i + 1}`}
                                            autoCapitalize="characters"
                                            spellCheck="false"
                                        />
                                        {editForm.hallmark_numbers.length > 1 && (
                                            <button type="button" onClick={() => removeHuid(i)} className="px-3 text-red-500 hover:text-red-700 flex-shrink-0">
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {editForm.hallmark_numbers.length < 3 && (
                                    <button type="button" onClick={addHuid} className="text-xs text-gold-dark font-semibold hover:text-ink">
                                        + Add HUID
                                    </button>
                                )}
                                <p className="text-[10px] text-ink/50">
                                    {editForm.hallmark_numbers.filter(h => h.trim()).length}/3 entered
                                </p>
                            </div>

                            <div className="border-t border-line pt-6">
                                <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 mb-4">Design Diamond Weights (blueprint)</p>

                                <div className="mb-4">
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Round Melle (Ct)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editForm.melle_weight}
                                        onChange={(e) => updateForm({ melle_weight: e.target.value })}
                                        className="w-full border border-line rounded-lg px-4 py-3 text-sm"
                                    />
                                </div>

                                <div className="space-y-2 mb-4">
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Pointer / Solitaire Weights (Ct)</label>
                                    {editForm.pointer_weights.map((w, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={w}
                                                onChange={(e) => updateField('pointer_weights', i, e.target.value)}
                                                className="w-full border border-line rounded-lg px-4 py-3 text-sm flex-1"
                                                placeholder={`Pointer ${i + 1}`}
                                            />
                                            {editForm.pointer_weights.length > 1 && (
                                                <button type="button" onClick={() => removeField('pointer_weights', i)} className="px-3 text-red-500 hover:text-red-700 flex-shrink-0">
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addField('pointer_weights')} className="text-xs text-gold-dark font-semibold hover:text-ink">
                                        + Add Pointer
                                    </button>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Fancy Cut Weights (Ct)</label>
                                    {editForm.fancy_weights.map((w, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={w}
                                                onChange={(e) => updateField('fancy_weights', i, e.target.value)}
                                                className="w-full border border-line rounded-lg px-4 py-3 text-sm flex-1"
                                                placeholder={`Fancy ${i + 1}`}
                                            />
                                            {editForm.fancy_weights.length > 1 && (
                                                <button type="button" onClick={() => removeField('fancy_weights', i)} className="px-3 text-red-500 hover:text-red-700 flex-shrink-0">
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addField('fancy_weights')} className="text-xs text-gold-dark font-semibold hover:text-ink">
                                        + Add Fancy Cut
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Color Stone Weights (Ct)</label>
                                    {editForm.color_stone_weights.map((w, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={w}
                                                onChange={(e) => updateField('color_stone_weights', i, e.target.value)}
                                                className="w-full border border-line rounded-lg px-4 py-3 text-sm flex-1"
                                                placeholder={`Color Stone ${i + 1}`}
                                            />
                                            {editForm.color_stone_weights.length > 1 && (
                                                <button type="button" onClick={() => removeField('color_stone_weights', i)} className="px-3 text-red-500 hover:text-red-700 flex-shrink-0">
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addField('color_stone_weights')} className="text-xs text-gold-dark font-semibold hover:text-ink">
                                        + Add Color Stone
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={handleClose}
                                className="flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-widest border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white transition-all"
                            >Cancel</button>
                            <button
                                onClick={saveEdit}
                                disabled={saving || !isDirty}
                                className={`flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow ${saving || !isDirty
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-[#1A2536] hover:bg-[#111A29] text-white cursor-pointer'
                                    }`}
                            >
                                {saving ? "Saving…" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}