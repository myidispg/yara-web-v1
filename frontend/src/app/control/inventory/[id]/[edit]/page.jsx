"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import controlApi from "@/api/controlClient";

const inputCls = "w-full border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold-dark";
const labelCls = "text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2";

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

    if (!form) return <div className="text-center py-12">Loading design…</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={() => router.push(`/control/inventory?design=${id}`)} className="mb-6 text-sm text-gold-dark hover:text-ink">← Back</button>
            <h1 className="font-serif text-3xl mb-8">Edit Design</h1>

            <form onSubmit={save} className="bg-white rounded-xl border border-line p-8 shadow-card space-y-6">
                <div className="grid grid-cols-2 gap-6">
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
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} rows={3} />
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <label className={labelCls}>Melle (Ct)</label>
                        <input type="number" step="0.01" value={form.diamond_weight_round_melle} onChange={(e) => setForm({ ...form, diamond_weight_round_melle: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Pointer (Ct)</label>
                        <input type="number" step="0.01" value={form.pointer_solitaire_weight} onChange={(e) => setForm({ ...form, pointer_solitaire_weight: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Fancy (Ct)</label>
                        <input type="number" step="0.01" value={form.fancy_cut_weight} onChange={(e) => setForm({ ...form, fancy_cut_weight: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Color Stone (Ct)</label>
                        <input type="number" step="0.01" value={form.color_stone_weight} onChange={(e) => setForm({ ...form, color_stone_weight: e.target.value })} className={inputCls} />
                    </div>
                </div>

                <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4" />
                    Active (visible on storefront)
                </label>

                <button type="submit" disabled={saving} className="btn-solid w-full">{saving ? "Saving…" : "Save Changes"}</button>
            </form>

            <div className="bg-white rounded-xl border border-line p-8 shadow-card mt-6">
                <h3 className="font-serif text-xl mb-4">Media ({design?.media?.length || 0})</h3>
                <div className="grid grid-cols-4 gap-3 mb-4">
                    {(design?.media || []).map((m) => (
                        <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden bg-cream group">
                            {m.kind === "video"
                                ? <video src={m.url} className="w-full h-full object-cover" muted />
                                : <img src={m.url} alt="" className="w-full h-full object-cover" />}
                            <button type="button" onClick={() => removeMedia(m.id)}
                                className="absolute top-1 right-1 bg-red-600 text-white text-xs w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                        </div>
                    ))}
                </div>
                <label className="btn-outline inline-block cursor-pointer text-sm">
                    {uploading ? "Uploading…" : "+ Add Media"}
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={onUpload} disabled={uploading} />
                </label>
            </div>
        </div>
    );
}