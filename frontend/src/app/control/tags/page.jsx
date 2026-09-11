"use client";

import { useEffect, useState } from "react";
import controlApi from "@/api/controlClient";

const GROUPS = [
    { value: "style", label: "Style" },
    { value: "occasion", label: "Occasion" },
    { value: "material", label: "Material" },
    { value: "collection", label: "Collection" },
];

const GROUP_COLORS = {
    style: "bg-blue-50 text-blue-700 border-blue-200",
    occasion: "bg-purple-50 text-purple-700 border-purple-200",
    material: "bg-amber-50 text-amber-700 border-amber-200",
    collection: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function TagsPage() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ name: "", group: "style" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [filterGroup, setFilterGroup] = useState("");

    const load = async () => {
        try {
            const { data } = await controlApi.getTags();
            setTags(data.results || data);
        } catch (e) {
            console.error("Failed to load tags:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const openAdd = () => {
        setForm({ name: "", group: "style" });
        setModal({});
        setError("");
    };

    const openEdit = (tag) => {
        setForm({ name: tag.name, group: tag.group });
        setModal({ id: tag.id });
        setError("");
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const payload = { name: form.name.trim(), group: form.group };
            if (modal?.id) await controlApi.updateTag(modal.id, payload);
            else await controlApi.createTag(payload);
            setModal(null);
            await load();
        } catch (err) {
            const d = err.response?.data;
            setError(typeof d === "object" ? JSON.stringify(d) : String(d || err.message));
        } finally {
            setSaving(false);
        }
    };

    const remove = async (tag) => {
        if (tag.design_count > 0) {
            alert(`Cannot delete "${tag.name}". ${tag.design_count} design(s) use this tag. Remove the tag from those designs first.`);
            return;
        }
        if (!confirm(`Delete tag "${tag.name}"?`)) return;
        try {
            await controlApi.deleteTag(tag.id);
            await load();
        } catch (err) {
            alert(err.response?.data?.error || "Cannot delete this tag.");
        }
    };

    const filteredTags = filterGroup ? tags.filter(t => t.group === filterGroup) : tags;

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <p className="text-sm text-[#1A2536]/50">Loading tags…</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">product labels</span>
                    <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Tags</h1>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value)}
                        className="border border-[#E5BDB0] rounded-full px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#1A2536]"
                    >
                        <option value="">All groups</option>
                        {GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                    <button onClick={openAdd} className="px-6 py-3 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow">
                        + Add Tag
                    </button>
                </div>
            </div>

            {/* Tags Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTags.map((tag) => (
                    <div key={tag.id} className="glass-card-vibrant rounded-2xl border border-[#E5BDB0] p-5">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-serif-luxury text-lg font-semibold text-[#1A2536]">{tag.name}</h3>
                                <p className="text-[10px] text-[#1A2536]/50 font-mono mt-0.5">/{tag.slug}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${GROUP_COLORS[tag.group] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                                {GROUPS.find(g => g.value === tag.group)?.label || tag.group}
                            </span>
                        </div>
                        <p className="text-xs text-[#1A2536]/60 mb-4">
                            {tag.design_count} design{tag.design_count !== 1 ? "s" : ""}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => openEdit(tag)} className="text-xs text-[#B86B5A] font-bold uppercase tracking-wider hover:underline">
                                Edit
                            </button>
                            <button onClick={() => remove(tag)} className="text-xs text-red-500 font-bold uppercase tracking-wider hover:underline">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                {filteredTags.length === 0 && (
                    <div className="col-span-full text-center py-16">
                        <p className="font-serif-luxury text-xl text-[#1A2536] mb-2">No tags found</p>
                        <p className="text-sm text-[#1A2536]/50">
                            {filterGroup ? "Try a different group filter." : "Create your first tag to get started."}
                        </p>
                    </div>
                )}
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
                                {modal.id ? "Edit Tag" : "Add Tag"}
                            </h2>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-2">Name *</label>
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536]" required maxLength={100} placeholder="e.g., daily-wear" />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-2">Group *</label>
                            <select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536]">
                                {GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                            </select>
                            <p className="text-[10px] text-[#1A2536]/50 mt-1">Slug is generated automatically from the name.</p>
                        </div>

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