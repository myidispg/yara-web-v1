"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import controlApi from "@/api/controlClient";

const inputCls = "w-full border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536] transition-colors";
const labelCls = "text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-2";

export default function EditDesignPage() {
    const { id } = useParams();
    const router = useRouter();
    const [design, setDesign] = useState(null);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState([]);

    useEffect(() => { document.title = "Edit Design | Control Panel"; }, []);

    const reload = async () => {
        const { data } = await controlApi.getProduct(id);
        setDesign(data);
        return data;
    };

    useEffect(() => {
        (async () => {
            try {
                const [d, cats] = await Promise.all([reload(), controlApi.getCategories()]);
                const list = cats.data?.results || cats.data || cats.results || cats;
                setCategories((Array.isArray(list) ? list : []).flatMap((c) => [
                    { id: c.id, label: c.name },
                    ...(c.subcategories || []).map((s) => ({ id: s.id, label: `${c.name} › ${s.name}` })),
                ]));
                setForm({
                    name: d.name,
                    design_code: d.design_code,
                    category: d.category ?? "",
                    is_active: d.is_active !== false,
                    base_net_weight_14kt: String(d.base_net_weight_14kt ?? ""),
                    diamond_weight_round_melle: String(d.diamond_weight_round_melle ?? 0),
                    pointer_weights: d.pointer_weights?.length ? d.pointer_weights.map(String) : [""],
                    fancy_weights: d.fancy_weights?.length ? d.fancy_weights.map(String) : [""],
                    color_stone_weights: d.color_stone_weights?.length ? d.color_stone_weights.map(String) : [""],
                });
            } catch (err) {
                console.error("Failed to load design:", err);
            }
        })();
    }, [id]);

    // Array field helpers
    const addField = (fieldName) => {
        setForm({ ...form, [fieldName]: [...form[fieldName], ""] });
    };

    const removeField = (fieldName, index) => {
        if (form[fieldName].length > 1) {
            setForm({
                ...form,
                [fieldName]: form[fieldName].filter((_, i) => i !== index)
            });
        }
    };

    const updateField = (fieldName, index, value) => {
        const updated = [...form[fieldName]];
        updated[index] = value;
        setForm({ ...form, [fieldName]: updated });
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await controlApi.updateDesign(id, {
                name: form.name.trim(),
                design_code: form.design_code.trim(),
                category: Number(form.category),
                is_active: form.is_active,
                base_net_weight_14kt: parseFloat(form.base_net_weight_14kt) || 0,  // ADD THIS
                diamond_weight_round_melle: parseFloat(form.diamond_weight_round_melle) || 0,
                pointer_weights: form.pointer_weights.map(w => parseFloat(w) || 0).filter(w => w > 0),
                fancy_weights: form.fancy_weights.map(w => parseFloat(w) || 0).filter(w => w > 0),
                color_stone_weights: form.color_stone_weights.map(w => parseFloat(w) || 0).filter(w => w > 0),
            });
            router.push(`/control/inventory?design=${id}`);
        } catch (err) {
            alert("Failed to save: " + JSON.stringify(err.response?.data || err.message));
        } finally {
            setSaving(false);
        }
    };

    const onUpload = async (e) => {
        const newFiles = Array.from(e.target.files);
        if (!newFiles.length) return;
        setUploading(true);
        try {
            for (const file of newFiles) {
                await controlApi.uploadMedia(id, file);
            }
            await reload();
        } catch {
            alert("Upload failed");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const removeMedia = async (mediaId) => {
        if (!confirm("Remove this media?")) return;
        await controlApi.deleteMedia(id, mediaId);
        await reload();
    };

    if (!form) return (
        <div className="flex items-center justify-center py-24">
            <p className="text-sm text-[#1A2536]/50">Loading design…</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <button
                onClick={() => router.push(`/control/inventory?design=${id}`)}
                className="text-xs text-[#B86B5A] font-bold uppercase tracking-wider hover:underline flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Design
            </button>

            <div>
                <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">update blueprint</span>
                <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Edit Design</h1>
            </div>

            <form onSubmit={save} className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className={labelCls}>Design Name *</label>
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} required />
                    </div>
                    <div>
                        <label className={labelCls}>Design Code *</label>
                        <input value={form.design_code} onChange={(e) => setForm({ ...form, design_code: e.target.value })} className={inputCls} required />
                    </div>
                </div>

                <div>
                    <label className={labelCls}>Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                </div>

                <div>
                    <label className={labelCls}>Base Net Weight @14Kt (g) *</label>
                    <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={form.base_net_weight_14kt}
                        onChange={(e) => setForm({ ...form, base_net_weight_14kt: e.target.value })}
                        className={inputCls}
                        placeholder="Reference weight for price estimates"
                        required
                    />
                    <p className="text-[10px] text-[#1A2536]/50 mt-1">
                        Used for MTO pricing and ring size calculations
                    </p>
                </div>

                <div className="space-y-6">
                    <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Diamond Weights (Ct)</p>

                    <div>
                        <label className={labelCls}>Round Melle</label>
                        <input
                            type="number"
                            step="0.01"
                            value={form.diamond_weight_round_melle}
                            onChange={(e) => setForm({ ...form, diamond_weight_round_melle: e.target.value })}
                            className={inputCls}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className={labelCls}>Pointer / Solitaire Weights</label>
                        {form.pointer_weights.map((w, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={w}
                                    onChange={(e) => updateField('pointer_weights', i, e.target.value)}
                                    className={`${inputCls} flex-1`}
                                    placeholder={`Pointer ${i + 1}`}
                                />
                                {form.pointer_weights.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeField('pointer_weights', i)}
                                        className="px-3 text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addField('pointer_weights')}
                            className="text-xs text-[#B86B5A] font-bold hover:underline"
                        >
                            + Add Pointer
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className={labelCls}>Fancy Cut Weights</label>
                        {form.fancy_weights.map((w, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={w}
                                    onChange={(e) => updateField('fancy_weights', i, e.target.value)}
                                    className={`${inputCls} flex-1`}
                                    placeholder={`Fancy ${i + 1}`}
                                />
                                {form.fancy_weights.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeField('fancy_weights', i)}
                                        className="px-3 text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addField('fancy_weights')}
                            className="text-xs text-[#B86B5A] font-bold hover:underline"
                        >
                            + Add Fancy Cut
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className={labelCls}>Color Stone Weights</label>
                        {form.color_stone_weights.map((w, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={w}
                                    onChange={(e) => updateField('color_stone_weights', i, e.target.value)}
                                    className={`${inputCls} flex-1`}
                                    placeholder={`Color Stone ${i + 1}`}
                                />
                                {form.color_stone_weights.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeField('color_stone_weights', i)}
                                        className="px-3 text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addField('color_stone_weights')}
                            className="text-xs text-[#B86B5A] font-bold hover:underline"
                        >
                            + Add Color Stone
                        </button>
                    </div>
                </div>

                <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer glass-card-vibrant rounded-xl border border-[#E5BDB0] px-4 py-3">
                    <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                        className="w-5 h-5 accent-[#B86B5A]"
                    />
                    <div>
                        <span className="font-bold text-[#1A2536]">Active</span>
                        <p className="text-xs text-[#1A2536]/60 mt-0.5">Visible on storefront</p>
                    </div>
                </label>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl disabled:opacity-50"
                >
                    {saving ? "Saving…" : "Save Changes"}
                </button>
            </form>

            {/* Media Section */}
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">
                        Media <span className="text-[#B86B5A]">({design?.media?.length || 0})</span>
                    </h3>
                </div>

                {design?.media?.length > 0 && (
                    <div className="space-y-2 mb-5">
                        <p className="text-xs text-[#1A2536]/60 font-semibold uppercase tracking-wider">
                            Drag the ⋮⋮ icon to reorder
                        </p>
                        {design.media.map((m, i) => (
                            <div
                                key={m.id}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.add('border-[#B86B5A]', 'bg-[#B86B5A]/5');
                                }}
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.add('border-[#B86B5A]', 'bg-[#B86B5A]/5');
                                }}
                                onDragLeave={(e) => {
                                    e.currentTarget.classList.remove('border-[#B86B5A]', 'bg-[#B86B5A]/5');
                                }}
                                onDrop={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.currentTarget.classList.remove('border-[#B86B5A]', 'bg-[#B86B5A]/5');
                                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                    const toIndex = i;
                                    if (!isNaN(fromIndex) && fromIndex !== toIndex) {
                                        // Reorder in state
                                        const newMedia = [...design.media];
                                        const [moved] = newMedia.splice(fromIndex, 1);
                                        newMedia.splice(toIndex, 0, moved);
                                        setDesign({ ...design, media: newMedia });

                                        // Update sort_order for all media
                                        try {
                                            for (let idx = 0; idx < newMedia.length; idx++) {
                                                await controlApi.updateDesignMedia(id, newMedia[idx].id, idx + 1);
                                            }
                                        } catch (err) {
                                            console.error("Failed to update media order:", err);
                                            await reload();
                                        }
                                    }
                                }}
                                className="flex items-center gap-3 glass-card-vibrant rounded-xl border-2 border-[#E5BDB0] p-3 transition-all"
                            >
                                <div
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.effectAllowed = 'move';
                                        e.dataTransfer.setData('text/plain', i.toString());
                                        e.currentTarget.parentElement.classList.add('opacity-50', 'scale-95');
                                    }}
                                    onDragEnd={(e) => {
                                        e.currentTarget.parentElement.classList.remove('opacity-50', 'scale-95');
                                    }}
                                    className="cursor-grab active:cursor-grabbing p-2 hover:bg-[#1A2536]/[0.05] rounded-lg transition-colors flex-shrink-0"
                                >
                                    <svg className="w-5 h-5 text-[#1A2536]/40" fill="currentColor" viewBox="0 0 24 24">
                                        <circle cx="9" cy="6" r="1.5" />
                                        <circle cx="15" cy="6" r="1.5" />
                                        <circle cx="9" cy="12" r="1.5" />
                                        <circle cx="15" cy="12" r="1.5" />
                                        <circle cx="9" cy="18" r="1.5" />
                                        <circle cx="15" cy="18" r="1.5" />
                                    </svg>
                                </div>

                                {m.kind === "video" ? (
                                    <video src={m.url} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" muted />
                                ) : (
                                    <img src={m.url} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-[#1A2536] truncate">
                                        {m.kind === "video" ? "Video" : "Image"} #{i + 1}
                                    </p>
                                    <p className="text-xs text-[#1A2536]/50">
                                        Sort order: {m.sort_order}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeMedia(m.id)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <label className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer">
                    {uploading ? "Uploading…" : "+ Add Media"}
                    <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={onUpload} disabled={uploading} />
                </label>
            </div>
        </div>
    );
}