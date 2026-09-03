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
                    description: d.description || "",
                    category: d.category ?? "",
                    is_active: d.is_active !== false,
                    diamond_weight_round_melle: String(d.diamond_weight_round_melle ?? 0),
                    pointer_solitaire_weight: String(d.pointer_solitaire_weight ?? 0),
                    fancy_cut_weight: String(d.fancy_cut_weight ?? 0),
                    color_stone_weight: String(d.color_stone_weight ?? 0),
                });
            } catch (err) {
                console.error("Failed to load design:", err);
            }
        })();
    }, [id]);

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await controlApi.updateDesign(id, {
                name: form.name.trim(),
                design_code: form.design_code.trim(),
                description: form.description,
                category: Number(form.category),
                is_active: form.is_active,
                diamond_weight_round_melle: parseFloat(form.diamond_weight_round_melle) || 0,
                pointer_solitaire_weight: parseFloat(form.pointer_solitaire_weight) || 0,
                fancy_cut_weight: parseFloat(form.fancy_cut_weight) || 0,
                color_stone_weight: parseFloat(form.color_stone_weight) || 0,
            });
            router.push(`/control/inventory?design=${id}`);
        } catch (err) {
            alert("Failed to save: " + JSON.stringify(err.response?.data || err.message));
        } finally {
            setSaving(false);
        }
    };

    const onUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            await controlApi.uploadMedia(id, file);
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
            {/* Back button */}
            <button 
                onClick={() => router.push(`/control/inventory?design=${id}`)} 
                className="text-xs text-[#B86B5A] font-bold uppercase tracking-wider hover:underline flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Design
            </button>

            {/* Header */}
            <div>
                <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">update blueprint</span>
                <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Edit Design</h1>
            </div>

            {/* Main Form */}
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
                    <label className={labelCls}>Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} rows={4} />
                </div>

                <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] mb-3">Diamond Weights (Ct)</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <label className={labelCls}>Melle</label>
                            <input type="number" step="0.01" value={form.diamond_weight_round_melle} onChange={(e) => setForm({ ...form, diamond_weight_round_melle: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Pointer</label>
                            <input type="number" step="0.01" value={form.pointer_solitaire_weight} onChange={(e) => setForm({ ...form, pointer_solitaire_weight: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Fancy</label>
                            <input type="number" step="0.01" value={form.fancy_cut_weight} onChange={(e) => setForm({ ...form, fancy_cut_weight: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Color Stone</label>
                            <input type="number" step="0.01" value={form.color_stone_weight} onChange={(e) => setForm({ ...form, color_stone_weight: e.target.value })} className={inputCls} />
                        </div>
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
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-5">
                    {(design?.media || []).map((m) => (
                        <div key={m.id} className="relative aspect-square rounded-xl overflow-hidden bg-[#1A2536]/[0.03] border border-[#E5BDB0]/40 group">
                            {m.kind === "video"
                                ? <video src={m.url} className="w-full h-full object-cover" muted />
                                : <img src={m.url} alt="" className="w-full h-full object-cover" />}
                            <button 
                                type="button" 
                                onClick={() => removeMedia(m.id)}
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                            >
                                ✕
                            </button>
                            <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                                {m.kind === "video" ? "▶" : "◆"}
                            </span>
                        </div>
                    ))}
                </div>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer">
                    {uploading ? "Uploading…" : "+ Add Media"}
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={onUpload} disabled={uploading} />
                </label>
            </div>
        </div>
    );
}