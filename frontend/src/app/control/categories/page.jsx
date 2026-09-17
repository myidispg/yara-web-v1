"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import controlApi from "@/api/controlClient";
import api from "@/api/client";

const inputCls = "w-full border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536] transition-colors";
const labelCls = "text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-2";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ name: "", parent: "", is_active: true });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [expandedCategory, setExpandedCategory] = useState(null);

    const load = async () => {
        try {
            const [catRes, desRes] = await Promise.all([
                controlApi.getCategories(),
                controlApi.getProductsSummary()  // ← Changed from getProducts
            ]);
            const cats = catRes.data.results || catRes.data;
            const dess = desRes.data;  // ← Changed from desRes.data.results
            setCategories(cats);
            setDesigns(dess);
        } catch (e) {
            console.error("Failed to load:", e);
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
        if (cat.product_count > 0) {
            alert(`Cannot delete "${cat.name}". This category has ${cat.product_count} design(s). Please move or delete the designs first.`);
            return;
        }
        if (!confirm(`Delete "${cat.name}"? This action cannot be undone.`)) return;
        try {
            await controlApi.deleteCategory(cat.id);
            await load();
        } catch (err) {
            alert(err.response?.data?.error || "Cannot delete this category.");
        }
    };

    const toggleExpand = (categoryId) => {
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    };

    // Get all designs for a category AND its subcategories
    const getCategoryDesigns = (category) => {
        const categorySlugs = [category.slug];
        if (category.subcategories) {
            category.subcategories.forEach(sub => categorySlugs.push(sub.slug));
        }
        return designs.filter(d => categorySlugs.includes(d.category_slug));
    };

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <p className="text-sm text-[#1A2536]/50">Loading categories…</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">catalog structure</span>
                    <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Categories</h1>
                </div>
                <button onClick={() => openAdd(null)} className="px-6 py-3 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow">
                    + Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.filter(c => !c.parent).map((cat) => {
                    const categoryDesigns = getCategoryDesigns(cat);
                    const isExpanded = expandedCategory === cat.id;

                    return (
                        <div key={cat.id} className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                            <div className="flex items-start justify-between mb-5">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536] mb-1">{cat.name}</h3>
                                    <p className="text-xs text-[#1A2536]/60 font-mono">
                                        /{cat.slug} · {categoryDesigns.length} design{categoryDesigns.length !== 1 ? "s" : ""}
                                        {!cat.is_active && <span className="ml-2 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold uppercase border border-red-200">Inactive</span>}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {categoryDesigns.length > 0 && (
                                        <button
                                            onClick={() => toggleExpand(cat.id)}
                                            className="text-xs text-[#B86B5A] font-bold uppercase tracking-wider hover:underline"
                                        >
                                            {isExpanded ? "Hide" : "Show"} Designs
                                        </button>
                                    )}
                                    <button onClick={() => openEdit(cat)} className="text-xs text-[#B86B5A] font-bold uppercase tracking-wider hover:underline">
                                        Edit
                                    </button>
                                    <button onClick={() => remove(cat)} className="text-xs text-red-500 font-bold uppercase tracking-wider hover:underline">
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Expanded designs list */}
                            {isExpanded && categoryDesigns.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-[#E5BDB0]/40 space-y-2">
                                    <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] mb-3">
                                        Designs in this category
                                    </p>
                                    {categoryDesigns.map((design) => (
                                        <Link
                                            key={design.id}
                                            href={`/control/inventory?design=${design.id}`}
                                            className="flex items-center gap-3 p-3 bg-[#1A2536]/[0.02] hover:bg-[#1A2536]/[0.05] rounded-xl transition-colors border border-[#E5BDB0]/40"
                                        >
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#1A2536]/[0.03] flex-shrink-0">
                                                {design.thumbnail ? (
                                                    <img
                                                        src={design.thumbnail.url}
                                                        alt={design.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-[#1A2536]/30 text-[9px]">No img</div>';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#1A2536]/30 text-[9px]">No img</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-[#1A2536] truncate">{design.name}</p>
                                                <p className="text-[10px] text-[#1A2536]/60 font-mono">{design.design_code} · {design.instance_count} products</p>
                                            </div>
                                            <span className="text-xs text-[#B86B5A] font-bold">→</span>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-2">
                                {cat.subcategories?.map((sub) => {
                                    const subDesigns = designs.filter(d => d.category_slug === sub.slug);
                                    const isSubExpanded = expandedCategory === sub.id;

                                    return (
                                        <div key={sub.id} className="glass-card-vibrant rounded-xl border border-[#E5BDB0]/60 px-4 py-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-[#1A2536]">↳ {sub.name}</p>
                                                    <p className="text-[10px] text-[#1A2536]/50 font-mono mt-0.5">
                                                        /{sub.slug} · {subDesigns.length} design{subDesigns.length !== 1 ? "s" : ""}
                                                        {!sub.is_active && <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[9px] font-bold uppercase border border-red-200">Inactive</span>}
                                                    </p>
                                                </div>
                                                <div className="flex gap-3">
                                                    {subDesigns.length > 0 && (
                                                        <button
                                                            onClick={() => toggleExpand(sub.id)}
                                                            className="text-[10px] text-[#B86B5A] font-bold uppercase tracking-wider hover:underline"
                                                        >
                                                            {isSubExpanded ? "Hide" : "Show"}
                                                        </button>
                                                    )}
                                                    <button onClick={() => openEdit(sub)} className="text-[10px] text-[#B86B5A] font-bold uppercase tracking-wider hover:underline">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => remove(sub)} className="text-[10px] text-red-500 font-bold uppercase tracking-wider hover:underline">
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expanded subcategory designs */}
                                            {isSubExpanded && subDesigns.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-[#E5BDB0]/40 space-y-2">
                                                    {subDesigns.map((design) => (
                                                        <Link
                                                            key={design.id}
                                                            href={`/control/inventory?design=${design.id}`}
                                                            className="flex items-center gap-3 p-2 bg-[#1A2536]/[0.02] hover:bg-[#1A2536]/[0.05] rounded-lg transition-colors"
                                                        >
                                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1A2536]/[0.03] flex-shrink-0">
                                                                {design.thumbnail ? (
                                                                    <img
                                                                        src={design.thumbnail.url}
                                                                        alt={design.name}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            e.currentTarget.onerror = null;
                                                                            e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-[#1A2536]/30 text-[9px]">No img</div>';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-[#1A2536]/30 text-[9px]">No img</div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-[#1A2536] truncate">{design.name}</p>
                                                                <p className="text-[9px] text-[#1A2536]/60 font-mono">{design.design_code}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                <button onClick={() => openAdd(cat.id)} className="w-full text-left text-xs text-[#B86B5A] font-bold uppercase tracking-wider hover:underline px-4 py-3 border-2 border-dashed border-[#E5BDB0] rounded-xl transition-colors hover:border-[#B86B5A]">
                                    + Add Subcategory
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 bg-[#1A2536]/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModal(null)}>
                    <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8 w-full max-w-md space-y-6 shadow-2xl">
                        <div>
                            <span className="font-cursive text-2xl text-[#B86B5A] block -mb-1">
                                {modal.id ? "update" : "create new"}
                            </span>
                            <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">
                                {modal.id ? "Edit" : form.parent ? "Add Subcategory" : "Add Category"}
                            </h2>
                        </div>

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
                            <p className="text-[10px] text-[#1A2536]/50 mt-1">Slug is generated automatically from the name.</p>
                        </div>

                        <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer glass-card-vibrant rounded-xl border border-[#E5BDB0] px-4 py-3">
                            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-5 h-5 accent-[#B86B5A]" />
                            <div>
                                <span className="font-bold text-[#1A2536]">Active</span>
                                <p className="text-xs text-[#1A2536]/60 mt-0.5">Visible on storefront</p>
                            </div>
                        </label>

                        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 font-semibold">{error}</p>}

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setModal(null)} className="flex-1 py-3 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving} className="flex-1 py-3 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow disabled:opacity-50">
                                {saving ? "Saving…" : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}