"use client";

import { useEffect, useState } from "react";
import controlApi from "@/api/controlClient";

const inputCls = "w-full border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold-dark";
const labelCls = "text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // { id?: number } when editing
    const [form, setForm] = useState({ name: "", parent: "", is_active: true });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const load = async () => {
        try {
            const { data } = await controlApi.getCategories();
            setCategories(data.results || data);
        } catch (e) {
            console.error("Failed to load categories:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const openAdd = (parentId = null) => {
        setForm({ name: "", parent: parentId ? String(parentId) : "", is_active: true });
        setModal({});
        setError("");
    };

    const openEdit = (cat) => {
        setForm({ name: cat.name, parent: cat.parent ? String(cat.parent) : "", is_active: cat.is_active });
        setModal({ id: cat.id });
        setError("");
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const payload = {
                name: form.name.trim(),
                parent: form.parent ? Number(form.parent) : null,
                is_active: form.is_active,
            };
            if (modal?.id) await controlApi.updateCategory(modal.id, payload);
            else await controlApi.createCategory(payload);
            setModal(null);
            await load();
        } catch (err) {
            const d = err.response?.data;
            setError(typeof d === "object" ? JSON.stringify(d) : String(d || err.message));
        } finally {
            setSaving(false);
        }
    };

    const remove = async (cat) => {
        if (!confirm(`Delete "${cat.name}"? Categories with designs cannot be deleted.`)) return;
        try {
            await controlApi.deleteCategory(cat.id);
            await load();
        } catch (err) {
            alert(err.response?.data?.error || "Cannot delete this category.");
        }
    };

    if (loading) return <div className="text-center py-12">Loading categories...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-serif text-4xl">Categories</h1>
                <button onClick={() => openAdd(null)} className="btn-solid">+ Add Category</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((cat) => (
                    <div key={cat.id} className="bg-white rounded-xl border border-line p-6 shadow-card">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-serif text-xl">{cat.name}</h3>
                                <p className="text-xs text-ink/50 mt-1">
                                    /{cat.slug} · {cat.product_count} design{cat.product_count !== 1 ? "s" : ""}
                                    {!cat.is_active && <span className="ml-2 text-red-500 font-semibold">INACTIVE</span>}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(cat)} className="text-xs text-gold-dark font-semibold hover:text-ink">Edit</button>
                                <button onClick={() => remove(cat)} className="text-xs text-red-500 font-semibold hover:text-red-700">Delete</button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {cat.subcategories.map((sub) => (
                                <div key={sub.id} className="flex items-center justify-between bg-cream rounded-lg px-4 py-2.5">
                                    <div>
                                        <p className="text-sm font-medium">↳ {sub.name}</p>
                                        <p className="text-[10px] text-ink/50">/{sub.slug} · {sub.product_count} design{sub.product_count !== 1 ? "s" : ""}
                                            {!sub.is_active && <span className="ml-2 text-red-500 font-semibold">INACTIVE</span>}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(sub)} className="text-xs text-gold-dark font-semibold hover:text-ink">Edit</button>
                                        <button onClick={() => remove(sub)} className="text-xs text-red-500 font-semibold hover:text-red-700">Delete</button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => openAdd(cat.id)} className="w-full text-left text-xs text-gold-dark font-semibold hover:text-ink px-4 py-2 border border-dashed border-line rounded-lg">
                                + Add Subcategory
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4" onClick={() => setModal(null)}>
                    <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl border border-line p-8 shadow-hero w-full max-w-md space-y-6">
                        <h2 className="font-serif text-2xl">{modal.id ? "Edit" : form.parent ? "Add Subcategory" : "Add Category"}</h2>

                        <div>
                            <label className={labelCls}>Name *</label>
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} required maxLength={100} />
                        </div>

                        <div>
                            <label className={labelCls}>Parent</label>
                            <select value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })} className={inputCls}>
                                <option value="">None (top-level category)</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <p className="text-[10px] text-ink/50 mt-1">Slug is generated automatically from the name.</p>
                        </div>

                        <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer">
                            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4" />
                            Active (visible on storefront)
                        </label>

                        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setModal(null)} className="btn-outline flex-1">Cancel</button>
                            <button type="submit" disabled={saving} className="btn-solid flex-1">{saving ? "Saving…" : "Save"}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}