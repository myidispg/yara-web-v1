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
    const [allTags, setAllTags] = useState([]);
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dirty, setDirty] = useState(false);

    useEffect(() => { document.title = "Edit Design | Control Panel"; }, []);

    // Warn user if they try to close the tab with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (dirty) {
                e.preventDefault();
                e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
                return e.returnValue;
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [dirty]);

    const reload = async () => {
        const { data } = await controlApi.getProduct(id);
        setDesign(data);
        return data;
    };

    useEffect(() => {
        (async () => {
            try {
                const [d, cats, tagsRes] = await Promise.all([
                    reload(), controlApi.getCategories(), controlApi.getTags()
                ]);
                const list = cats.data?.results || cats.data || cats.results || cats;
                setCategories((Array.isArray(list) ? list : []).flatMap((c) => [
                    { id: c.id, label: c.name },
                    ...(c.subcategories || []).map((s) => ({ id: s.id, label: `${c.name} › ${s.name}` })),
                ]));
                const tagsData = tagsRes.data;
                setAllTags(tagsData?.results || tagsData || []);
                const mediaList = (d.media || []).sort((a, b) => a.sort_order - b.sort_order);
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
                    tags: d.tags?.map(t => t.id) || [],
                    media: mediaList,
                    media_order: mediaList.map(m => m.id),
                });
            } catch (err) {
                console.error("Failed to load design:", err);
            }
        })();
    }, [id]);

    const updateForm = (updates) => {
        setForm(prev => ({ ...prev, ...updates }));
        setDirty(true);
    };

    const addField = (fieldName) => {
        updateForm({ [fieldName]: [...form[fieldName], ""] });
    };

    const removeField = (fieldName, index) => {
        if (form[fieldName].length > 1) {
            updateForm({ [fieldName]: form[fieldName].filter((_, i) => i !== index) });
        }
    };

    const updateField = (fieldName, index, value) => {
        const updated = [...form[fieldName]];
        updated[index] = value;
        updateForm({ [fieldName]: updated });
    };

    const toggleTag = (tagId) => {
        updateForm({
            tags: form.tags.includes(tagId)
                ? form.tags.filter(id => id !== tagId)
                : [...form.tags, tagId]
        });
    };

    const reorderMedia = (fromIndex, toIndex) => {
        if (fromIndex === toIndex) return;
        const newMedia = [...form.media];
        const newOrder = [...form.media_order];
        const [movedMedia] = newMedia.splice(fromIndex, 1);
        const [movedId] = newOrder.splice(fromIndex, 1);
        newMedia.splice(toIndex, 0, movedMedia);
        newOrder.splice(toIndex, 0, movedId);
        updateForm({ media: newMedia, media_order: newOrder });
    };

    const save = async () => {
        setSaving(true);
        try {
            await controlApi.updateDesign(id, {
                name: form.name.trim(),
                design_code: form.design_code.trim(),
                category: Number(form.category),
                is_active: form.is_active,
                base_net_weight_14kt: parseFloat(form.base_net_weight_14kt) || 0,
                diamond_weight_round_melle: parseFloat(form.diamond_weight_round_melle) || 0,
                pointer_weights: form.pointer_weights.map(w => parseFloat(w) || 0).filter(w => w > 0),
                fancy_weights: form.fancy_weights.map(w => parseFloat(w) || 0).filter(w => w > 0),
                color_stone_weights: form.color_stone_weights.map(w => parseFloat(w) || 0).filter(w => w > 0),
                tags: form.tags,
            });

            // Save media order if it changed
            const originalOrder = (design.media || [])
                .sort((a, b) => a.sort_order - b.sort_order)
                .map(m => m.id);
            const orderChanged = JSON.stringify(form.media_order) !== JSON.stringify(originalOrder);

            if (orderChanged && form.media_order.length > 0) {
                await controlApi.reorderDesignMedia(id, form.media_order);
            }

            router.push(`/cpanel/inventory?design=${id}`);
        } catch (err) {
            alert("Failed to save: " + JSON.stringify(err.response?.data || err.message));
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
            const d = await reload();
            const mediaList = (d.media || []).sort((a, b) => a.sort_order - b.sort_order);
            setForm(prev => ({
                ...prev,
                media: mediaList,
                media_order: mediaList.map(m => m.id),
            }));
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
        const d = await reload();
        const mediaList = (d.media || []).sort((a, b) => a.sort_order - b.sort_order);
        setForm(prev => ({
            ...prev,
            media: mediaList,
            media_order: mediaList.map(m => m.id),
        }));
    };

    const handleBack = () => {
        if (dirty && !confirm("You have unsaved changes. Discard them?")) return;
        router.push(`/cpanel/inventory?design=${id}`);
    };

    if (!form) return (
        <div className="flex items-center justify-center py-24">
            <p className="text-sm text-[#1A2536]/50">Loading design…</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <button
                onClick={handleBack}
                className="text-xs text-[#B86B5A] font-bold uppercase tracking-wider hover:underline flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Design
            </button>

            <div className="flex items-end justify-between">
                <div>
                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">update blueprint</span>
                    <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Edit Design</h1>
                </div>
                {dirty && (
                    <span className="text-xs text-amber-600 font-bold uppercase tracking-wider bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                        Unsaved changes
                    </span>
                )}
            </div>

            {/* Design Form */}
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className={labelCls}>Design Name *</label>
                        <input value={form.name} onChange={(e) => updateForm({ name: e.target.value })} className={inputCls} required />
                    </div>
                    <div>
                        <label className={labelCls}>Design Code *</label>
                        <input value={form.design_code} onChange={(e) => updateForm({ design_code: e.target.value })} className={inputCls} required />
                    </div>
                </div>

                <div>
                    <label className={labelCls}>Category</label>
                    <select value={form.category} onChange={(e) => updateForm({ category: e.target.value })} className={inputCls}>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                </div>

                <div>
                    <label className={labelCls}>Tags</label>
                    {allTags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {allTags.map(tag => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => toggleTag(tag.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${form.tags?.includes(tag.id)
                                            ? 'bg-[#1A2536] text-white border-[#1A2536]'
                                            : 'border-[#E5BDB0] text-[#1A2536]/70 hover:border-[#B86B5A]'
                                        }`}
                                >
                                    {tag.name}
                                    <span className="ml-1 opacity-60">({tag.group_display})</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-[#1A2536]/50">No tags available. Create tags in the Tags section first.</p>
                    )}
                    {form.tags?.length > 0 && (
                        <p className="text-xs text-[#1A2536]/50 mt-2">
                            {form.tags.length} tag{form.tags.length !== 1 ? 's' : ''} selected
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelCls}>Base Net Weight @14Kt (g) *</label>
                    <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={form.base_net_weight_14kt}
                        onChange={(e) => updateForm({ base_net_weight_14kt: e.target.value })}
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
                            onChange={(e) => updateForm({ diamond_weight_round_melle: e.target.value })}
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
                                    <button type="button" onClick={() => removeField('pointer_weights', i)} className="px-3 text-red-500 hover:text-red-700">
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={() => addField('pointer_weights')} className="text-xs text-[#B86B5A] font-bold hover:underline">
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
                                    <button type="button" onClick={() => removeField('fancy_weights', i)} className="px-3 text-red-500 hover:text-red-700">
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={() => addField('fancy_weights')} className="text-xs text-[#B86B5A] font-bold hover:underline">
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
                                    <button type="button" onClick={() => removeField('color_stone_weights', i)} className="px-3 text-red-500 hover:text-red-700">
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={() => addField('color_stone_weights')} className="text-xs text-[#B86B5A] font-bold hover:underline">
                            + Add Color Stone
                        </button>
                    </div>
                </div>

                <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer glass-card-vibrant rounded-xl border border-[#E5BDB0] px-4 py-3">
                    <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => updateForm({ is_active: e.target.checked })}
                        className="w-5 h-5 accent-[#B86B5A]"
                    />
                    <div>
                        <span className="font-bold text-[#1A2536]">Active</span>
                        <p className="text-xs text-[#1A2536]/60 mt-0.5">Visible on storefront</p>
                    </div>
                </label>
            </div>

            {/* Media Section */}
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">
                        Media <span className="text-[#B86B5A]">({form.media?.length || 0})</span>
                    </h3>
                </div>

                {form.media?.length > 0 && (
                    <div className="space-y-2 mb-5">
                        <p className="text-xs text-[#1A2536]/60 font-semibold uppercase tracking-wider">
                            Drag the ⋮⋮ handle to reorder
                        </p>
                        {form.media.map((m, i) => (
                            <div
                                key={m.id}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = 'move';
                                    e.currentTarget.classList.add('border-[#B86B5A]', 'bg-[#B86B5A]/5');
                                }}
                                onDragLeave={(e) => {
                                    e.currentTarget.classList.remove('border-[#B86B5A]', 'bg-[#B86B5A]/5');
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.currentTarget.classList.remove('border-[#B86B5A]', 'bg-[#B86B5A]/5');
                                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                    if (!isNaN(fromIndex) && fromIndex !== i) {
                                        reorderMedia(fromIndex, i);
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
                                        Position: {i + 1} of {form.media.length}
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

            {/* Save Button at the bottom */}
            <button
                onClick={save}
                disabled={saving || !dirty}
                className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl disabled:opacity-40 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
            >
                {saving ? "Saving…" : "Save Changes"}
            </button>
        </div>
    );
}