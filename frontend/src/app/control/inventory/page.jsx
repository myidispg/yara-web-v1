"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import controlApi from "@/api/controlClient";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const RING_SLUGS = ["rings", "solitaires", "color-stone"];

const INSTANCE_STATUS = {
    in_stock: { label: "In Stock", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    sold: { label: "Sold (Online)", cls: "bg-gray-50 text-gray-700 border-gray-200", dot: "bg-gray-400" },
    sold_offline: { label: "Sold (Offline)", cls: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
    reserved: { label: "Reserved", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
};

export default function InventoryPage() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [view, setView] = useState("designs");
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    const [checked, setChecked] = useState([]);
    const [checkedDesigns, setCheckedDesigns] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");
    const [bulkBusy, setBulkBusy] = useState(false);
    const [bulkResult, setBulkResult] = useState(null);

    useEffect(() => {
        loadDesigns();
        loadFlat();
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (e.detail === "/control/inventory") { setSelected(null); setView("designs"); }
        };
        window.addEventListener("control-nav", handler);
        return () => window.removeEventListener("control-nav", handler);
    }, []);

    const loadDesigns = async () => {
        try {
            const { data } = await controlApi.getProducts();
            setProducts(data.results || data);
        } catch (err) {
            console.error("Failed to load designs:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadFlat = async () => {
        try {
            const { data } = await controlApi.getProductsFlat();
            setAllProducts(data);
        } catch (err) {
            console.error("Failed to load products:", err);
        }
    };

    const viewDesign = async (id) => {
        try {
            const { data } = await controlApi.getProduct(id);
            setSelected(data);
        } catch (err) {
            console.error("Failed to load design:", err);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const designId = params.get("design");
        if (designId) viewDesign(designId);
    }, []);

    const markSoldOffline = async (productId) => {
        if (!confirm("Mark this product as SOLD OFFLINE (showroom sale)?")) return;
        try {
            await controlApi.markSoldOffline(productId);
            await viewDesign(selected.id);
            await loadFlat();
        } catch (err) {
            alert("Failed: " + (err.response?.data?.error || err.message));
        }
    };

    const returnToStock = async (productId) => {
        if (!confirm("Return this product to stock?")) return;
        try {
            await controlApi.returnToStock(productId);
            await viewDesign(selected.id);
            await loadFlat();
        } catch (err) {
            alert("Failed: " + (err.response?.data?.error || err.message));
        }
    };

    const deleteProduct = async (productId, itemCode) => {
        if (!confirm(`Delete product "${itemCode}" permanently? This cannot be undone.`)) return;
        try {
            await controlApi.deleteProduct(productId);
            await viewDesign(selected.id);
            await loadFlat();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete product');
        }
    };

    const deleteDesign = async () => {
        if (!confirm(`Delete design "${selected.name}"? This cannot be undone.`)) return;
        try {
            await controlApi.deleteDesign(selected.id);
            setSelected(null);
            await loadDesigns();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete design');
        }
    };

    const visibleProducts = statusFilter ? allProducts.filter((p) => p.status === statusFilter) : allProducts;
    const allChecked = visibleProducts.length > 0 && visibleProducts.every((p) => checked.includes(p.id));

    const toggleCheck = (id) =>
        setChecked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

    const toggleAll = () =>
        setChecked(allChecked ? [] : visibleProducts.map((p) => p.id));

    const runBulk = async (actionName) => {
        const labels = {
            mark_sold_offline: `Mark ${checked.length} product(s) as SOLD OFFLINE?`,
            return_to_stock: `Return ${checked.length} product(s) to stock?`,
            delete: `Permanently DELETE ${checked.length} product(s)? Only in-stock items will be deleted; others will be skipped.`,
        };
        if (!confirm(labels[actionName])) return;
        setBulkBusy(true);
        setBulkResult(null);
        try {
            const { data } = await controlApi.bulkProductAction(checked, actionName);
            setBulkResult(data);
            setChecked([]);
            await loadFlat();
            await loadDesigns();
            if (selected) await viewDesign(selected.id);
        } catch (err) {
            alert(err.response?.data?.error || "Bulk action failed");
        } finally {
            setBulkBusy(false);
        }
    };

    const exportSelected = async () => {
        try {
            const { data } = await controlApi.exportSelectedProducts(checked);
            const url = URL.createObjectURL(data);
            const a = document.createElement("a");
            a.href = url;
            a.download = "products-selected.csv";
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert("Export failed");
        }
    };

    const runDesignBulk = async (actionName) => {
        const labels = {
            activate: `Activate ${checkedDesigns.length} design(s) (show on storefront)?`,
            deactivate: `Deactivate ${checkedDesigns.length} design(s) (hide from storefront)?`,
            delete: `Permanently DELETE ${checkedDesigns.length} design(s)? Designs with products will be skipped.`,
        };
        if (!confirm(labels[actionName])) return;
        setBulkBusy(true);
        setBulkResult(null);
        try {
            const { data } = await controlApi.bulkDesignAction(checkedDesigns, actionName);
            setBulkResult(data);
            setCheckedDesigns([]);
            await loadDesigns();
        } catch (err) {
            alert(err.response?.data?.error || "Bulk action failed");
        } finally {
            setBulkBusy(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <p className="text-sm text-[#1A2536]/50">Loading inventory…</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">designs & products</span>
                    <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Inventory</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="glass-card-vibrant rounded-full border border-[#E5BDB0] p-1 flex">
                        <button 
                            onClick={() => { setView("designs"); setSelected(null); }} 
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${view === "designs" ? "bg-[#1A2536] text-white" : "text-[#1A2536]/60 hover:text-[#1A2536]"}`}
                        >
                            Designs
                        </button>
                        <button 
                            onClick={() => { setView("products"); setSelected(null); }} 
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${view === "products" ? "bg-[#1A2536] text-white" : "text-[#1A2536]/60 hover:text-[#1A2536]"}`}
                        >
                            All Products
                        </button>
                    </div>
                    <div className="glass-card-vibrant rounded-full px-5 py-2.5 border border-[#E5BDB0]">
                        <span className="text-sm font-bold text-[#1A2536]">{products.length}</span>
                        <span className="text-sm text-[#1A2536]/60 ml-1">designs</span>
                    </div>
                    <Link href="/control/inventory/new?mode=product" className="px-5 py-2.5 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all">
                        + Add Product
                    </Link>
                    <Link href="/control/inventory/new?mode=design" className="px-5 py-2.5 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow">
                        + Add Design
                    </Link>
                </div>
            </div>

            {view === "products" ? (
                <div className="space-y-4">
                    {/* Bulk action bar */}
                    <div className="flex flex-wrap items-center gap-3">
                        <select 
                            value={statusFilter} 
                            onChange={(e) => { setStatusFilter(e.target.value); setChecked([]); }} 
                            className="border border-[#E5BDB0] rounded-full px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#1A2536]"
                        >
                            <option value="">All statuses</option>
                            <option value="in_stock">In Stock</option>
                            <option value="sold">Sold (Online)</option>
                            <option value="sold_offline">Sold (Offline)</option>
                            <option value="reserved">Reserved</option>
                        </select>
                        <span className="text-sm text-[#1A2536]/60">{visibleProducts.length} products</span>
                        {checked.length > 0 && (
                            <div className="flex items-center gap-2 ml-auto glass-card-vibrant rounded-full px-5 py-2.5 border border-[#E5BDB0]">
                                <span className="text-xs font-bold text-[#1A2536]">{checked.length} selected</span>
                                <span className="text-[#E5BDB0]">|</span>
                                <button onClick={() => runBulk("mark_sold_offline")} disabled={bulkBusy} className="text-[10px] font-bold uppercase tracking-wider text-[#1A2536] hover:text-[#B86B5A] disabled:opacity-40">Mark Sold</button>
                                <span className="text-[#E5BDB0]">|</span>
                                <button onClick={() => runBulk("return_to_stock")} disabled={bulkBusy} className="text-[10px] font-bold uppercase tracking-wider text-[#1A2536] hover:text-[#B86B5A] disabled:opacity-40">Return</button>
                                <span className="text-[#E5BDB0]">|</span>
                                <button onClick={exportSelected} disabled={bulkBusy} className="text-[10px] font-bold uppercase tracking-wider text-[#1A2536] hover:text-[#B86B5A] disabled:opacity-40">Export</button>
                                <span className="text-[#E5BDB0]">|</span>
                                <button onClick={() => runBulk("delete")} disabled={bulkBusy} className="text-[10px] font-bold uppercase tracking-wider text-red-600 hover:text-red-700 disabled:opacity-40">Delete</button>
                                <span className="text-[#E5BDB0]">|</span>
                                <button onClick={() => setChecked([])} className="text-[10px] font-bold uppercase tracking-wider text-[#1A2536]/50 hover:text-[#1A2536]">Clear</button>
                            </div>
                        )}
                    </div>

                    {bulkResult && (
                        <div className="glass-card-vibrant rounded-2xl border border-[#E5BDB0] p-4 text-sm">
                            <p className="font-bold text-[#1A2536]">
                                Done: {bulkResult.processed.length} processed
                                {bulkResult.skipped.length > 0 && ` · ${bulkResult.skipped.length} skipped`}
                            </p>
                            {bulkResult.skipped.length > 0 && (
                                <ul className="mt-2 text-xs text-[#1A2536]/60 space-y-1 max-h-32 overflow-y-auto">
                                    {bulkResult.skipped.map((s) => (
                                        <li key={s.id}>• {s.item_code}: {s.reason}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#1A2536]/[0.03] border-b border-[#E5BDB0]/40">
                                        <th className="px-4 py-3.5 w-10">
                                            <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-4 h-4 accent-[#B86B5A]" />
                                        </th>
                                        <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Item Code</th>
                                        <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Design</th>
                                        <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Hallmark</th>
                                        <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Variant</th>
                                        <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Weight</th>
                                        <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Price</th>
                                        <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleProducts.map((p) => {
                                        const st = INSTANCE_STATUS[p.status] || { label: p.status, cls: "bg-gray-50 text-gray-700 border-gray-200", dot: "bg-gray-400" };
                                        return (
                                            <tr key={p.id} onClick={() => router.push(`/control/inventory/products/${p.id}`)} className="border-b border-[#E5BDB0]/20 last:border-0 hover:bg-[#1A2536]/[0.02] transition-colors cursor-pointer">
                                                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                                    <input type="checkbox" checked={checked.includes(p.id)} onChange={() => toggleCheck(p.id)} className="w-4 h-4 accent-[#B86B5A]" />
                                                </td>
                                                <td className="px-6 py-4 font-mono text-sm font-bold text-[#B86B5A]">{p.item_code}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <p className="font-bold text-[#1A2536]">{p.design_name}</p>
                                                    <p className="text-xs text-[#1A2536]/50 font-mono mt-0.5">{p.design_code}</p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[#1A2536]/70">{p.hallmark_number || "—"}</td>
                                                <td className="px-6 py-4 text-sm text-[#1A2536]/70">
                                                    {p.karat} {p.gold_color}
                                                    {p.ring_size && ` · Size ${p.ring_size}`}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[#1A2536]/70">{Number(p.actual_net_weight).toFixed(3)}g</td>
                                                <td className="px-6 py-4 font-extrabold text-[#1A2536]">{inr(p.price)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${st.cls}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                                                        {st.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {visibleProducts.length === 0 && (
                                        <tr><td colSpan="8" className="px-6 py-16 text-center">
                                            <p className="font-serif-luxury text-xl text-[#1A2536] mb-2">No products found</p>
                                            <p className="text-sm text-[#1A2536]/50">Try adjusting your status filter.</p>
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : selected ? (
                <div className="space-y-6">
                    <button onClick={() => setSelected(null)} className="text-xs text-[#B86B5A] font-bold uppercase tracking-wider hover:underline flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Inventory
                    </button>

                    {/* Design Header Card */}
                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
                        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                            <div>
                                <span className="font-cursive text-2xl text-[#B86B5A] block -mb-1">design details</span>
                                <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#1A2536] mb-2">{selected.name}</h2>
                                <p className="text-sm text-[#1A2536]/60">
                                    <span className="font-mono font-bold">{selected.design_code}</span> · {selected.category_name}
                                    {!selected.is_active && <span className="ml-2 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold uppercase border border-red-200">Inactive</span>}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Link href={`/control/inventory/${selected.id}/edit`} className="px-5 py-2.5 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all">
                                    Edit Design
                                </Link>
                                <button onClick={deleteDesign} className="px-5 py-2.5 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all">
                                    Delete
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/60 mb-1">
                                    {RING_SLUGS.includes(selected.category_slug) ? "Base Weight @14Kt" : "Base Weight @14Kt"}
                                </p>
                                <p className="text-lg font-extrabold text-[#1A2536]">{Number(selected.base_net_weight_14kt).toFixed(3)} g</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/60 mb-1">From Price</p>
                                <p className="text-lg font-extrabold text-[#B86B5A]">{inr(selected.base_price)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/60 mb-1">Total Products</p>
                                <p className="text-lg font-extrabold text-[#1A2536]">{selected.instance_count}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/60 mb-1">In Stock</p>
                                <p className="text-lg font-extrabold text-emerald-600">{selected.in_stock_count}</p>
                            </div>
                        </div>

                        {selected.size_weight_refs && Object.keys(selected.size_weight_refs).length > 0 && (
                            <div className="bg-[#1A2536]/[0.03] rounded-2xl p-5 mb-6 space-y-4 border border-[#E5BDB0]/40">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] mb-3">14Kt Reference Weights</p>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {Object.entries(selected.size_weight_refs).map(([size, w]) => (
                                            <span key={`14-${size}`} className="glass-card-vibrant rounded-full px-3 py-1.5 border border-[#E5BDB0]">
                                                <span className="font-bold text-[#1A2536]">{size === "base" ? "Base" : `#${size}`}</span>
                                                <span className="text-[#1A2536]/70 ml-1">{Number(w).toFixed(3)}g</span>
                                                <span className="text-[#1A2536]/40 ml-1 text-[10px]">({selected.size_weight_counts?.[size] ?? 1})</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] mb-3">18Kt Reference Weights</p>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {Object.entries(selected.size_weight_refs).map(([size, w]) => (
                                            <span key={`18-${size}`} className="glass-card-vibrant rounded-full px-3 py-1.5 border border-[#E5BDB0]">
                                                <span className="font-bold text-[#1A2536]">{size === "base" ? "Base" : `#${size}`}</span>
                                                <span className="text-[#1A2536]/70 ml-1">{(Number(w) * 1.2).toFixed(3)}g</span>
                                                <span className="text-[#1A2536]/40 ml-1 text-[10px]">({selected.size_weight_counts?.[size] ?? 1})</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {selected.media && selected.media.length > 0 && (
                            <div className="mb-6">
                                <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] mb-3">
                                    Media ({selected.media.length})
                                </p>
                                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                    {selected.media.map((m, i) => (
                                        <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[#1A2536]/[0.03] relative group border border-[#E5BDB0]/40">
                                            {m.kind === "video" ? (
                                                <video src={m.url} className="w-full h-full object-cover" muted />
                                            ) : (
                                                <img src={m.url} alt={`Media ${i + 1}`} className="w-full h-full object-cover" />
                                            )}
                                            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                                                {m.kind === "video" ? "▶" : "◆"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selected.description && (
                            <div className="text-sm text-[#1A2536]/70 leading-relaxed border-t border-[#E5BDB0]/40 pt-4">
                                {selected.description}
                            </div>
                        )}
                    </div>

                    {/* Products Table */}
                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#E5BDB0]/40 bg-[#1A2536]/[0.02] flex items-center justify-between">
                            <h3 className="font-serif-luxury text-lg font-semibold text-[#1A2536]">
                                Products <span className="text-[#B86B5A]">({selected.products.length})</span>
                            </h3>
                            <Link
                                href={`/control/inventory/new?mode=product&design_id=${selected.id}`}
                                className="text-xs text-[#B86B5A] font-bold uppercase tracking-wider hover:underline"
                            >
                                + Add Product
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#1A2536]/[0.03]">
                                        <th className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Item Code</th>
                                        <th className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Hallmark</th>
                                        <th className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Variant</th>
                                        <th className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Grade</th>
                                        <th className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Dia (Ct)</th>
                                        <th className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Weight</th>
                                        <th className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Price</th>
                                        <th className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Status</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selected.products.map((p) => {
                                        const st = INSTANCE_STATUS[p.status] || { label: p.status, cls: "bg-gray-50 text-gray-700 border-gray-200", dot: "bg-gray-400" };
                                        return (
                                            <tr key={p.id} onClick={() => router.push(`/control/inventory/products/${p.id}`)} className="border-b border-[#E5BDB0]/20 last:border-0 hover:bg-[#1A2536]/[0.02] transition-colors cursor-pointer">
                                                <td className="px-6 py-4 font-mono text-sm font-bold text-[#B86B5A]">{p.item_code}</td>
                                                <td className="px-6 py-4 text-sm text-[#1A2536]/70">{p.hallmark_number || '—'}</td>
                                                <td className="px-6 py-4 text-sm text-[#1A2536]/70">
                                                    {p.karat} {p.gold_color}
                                                    {p.ring_size && ` · Size ${p.ring_size}`}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[#1A2536]/70">{p.diamond_grade}</td>
                                                <td className="px-6 py-4 text-sm text-[#1A2536]/70">{Number(p.actual_diamond_weight).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-sm text-[#1A2536]/70">{Number(p.actual_net_weight).toFixed(3)}g</td>
                                                <td className="px-6 py-4 font-extrabold text-[#1A2536]">{inr(p.price)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${st.cls}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                                                        {st.label}
                                                    </span>
                                                    {p.sold_in_order_number && <p className="text-[10px] text-[#1A2536]/50 mt-1 font-mono">→ {p.sold_in_order_number}</p>}
                                                </td>
                                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-2">
                                                        {p.status === "in_stock" ? (
                                                            <button onClick={() => markSoldOffline(p.id)} className="text-xs text-[#B86B5A] font-bold hover:underline">
                                                                Mark Sold
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => returnToStock(p.id)} className="text-xs text-emerald-600 font-bold hover:underline">
                                                                Return
                                                            </button>
                                                        )}
                                                        {p.status === "in_stock" && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); deleteProduct(p.id, p.item_code); }}
                                                                className="text-xs text-red-600 font-bold hover:underline"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Bulk action bar for designs */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox"
                                checked={products.length > 0 && products.every((d) => checkedDesigns.includes(d.id))}
                                onChange={() => setCheckedDesigns(
                                    products.every((d) => checkedDesigns.includes(d.id))
                                        ? []
                                        : products.map((d) => d.id)
                                )}
                                className="w-4 h-4 accent-[#B86B5A]" 
                            />
                            <span className="text-sm text-[#1A2536]/60">Select all</span>
                        </div>
                        {checkedDesigns.length > 0 && (
                            <div className="flex items-center gap-2 ml-auto glass-card-vibrant rounded-full px-5 py-2.5 border border-[#E5BDB0]">
                                <span className="text-xs font-bold text-[#1A2536]">{checkedDesigns.length} selected</span>
                                <span className="text-[#E5BDB0]">|</span>
                                <button onClick={() => runDesignBulk("activate")} disabled={bulkBusy} className="text-[10px] font-bold uppercase tracking-wider text-[#1A2536] hover:text-[#B86B5A] disabled:opacity-40">Activate</button>
                                <span className="text-[#E5BDB0]">|</span>
                                <button onClick={() => runDesignBulk("deactivate")} disabled={bulkBusy} className="text-[10px] font-bold uppercase tracking-wider text-[#1A2536] hover:text-[#B86B5A] disabled:opacity-40">Deactivate</button>
                                <span className="text-[#E5BDB0]">|</span>
                                <button onClick={() => runDesignBulk("delete")} disabled={bulkBusy} className="text-[10px] font-bold uppercase tracking-wider text-red-600 hover:text-red-700 disabled:opacity-40">Delete</button>
                                <span className="text-[#E5BDB0]">|</span>
                                <button onClick={() => setCheckedDesigns([])} className="text-[10px] font-bold uppercase tracking-wider text-[#1A2536]/50 hover:text-[#1A2536]">Clear</button>
                            </div>
                        )}
                    </div>

                    {bulkResult && (
                        <div className="glass-card-vibrant rounded-2xl border border-[#E5BDB0] p-4 text-sm">
                            <p className="font-bold text-[#1A2536]">
                                Done: {bulkResult.processed.length} processed
                                {bulkResult.skipped.length > 0 && ` · ${bulkResult.skipped.length} skipped`}
                            </p>
                            {bulkResult.skipped.length > 0 && (
                                <ul className="mt-2 text-xs text-[#1A2536]/60 space-y-1 max-h-32 overflow-y-auto">
                                    {bulkResult.skipped.map((s) => (
                                        <li key={s.id}>• {s.item_code}: {s.reason}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {products.map((d) => (
                            <div key={d.id} onClick={() => viewDesign(d.id)} className="relative glass-card-vibrant rounded-3xl border border-[#E5BDB0] hover:border-[#B86B5A] cursor-pointer transition-all hover:shadow-xl overflow-hidden group">
                                <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm rounded-full p-1.5" onClick={(e) => e.stopPropagation()}>
                                    <input 
                                        type="checkbox" 
                                        checked={checkedDesigns.includes(d.id)} 
                                        onChange={() => setCheckedDesigns((c) => c.includes(d.id) ? c.filter((x) => x !== d.id) : [...c, d.id])} 
                                        className="w-4 h-4 accent-[#B86B5A]" 
                                    />
                                </div>
                                {!d.is_active && (
                                    <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider">
                                        Inactive
                                    </div>
                                )}
                                <div className="aspect-[4/3] bg-[#1A2536]/[0.03] overflow-hidden">
                                    {d.media?.length > 0 ? (
                                        d.media[0].kind === "video"
                                            ? <video src={d.media[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted />
                                            : <img src={d.media[0].url} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#1A2536]/30 text-xs uppercase tracking-[0.2em]">No media</div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536] mb-1 group-hover:text-[#B86B5A] transition-colors">{d.name}</h3>
                                    <p className="text-xs text-[#1A2536]/60 mb-4 font-mono">
                                        {d.design_code} · {d.category_name}
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/60">Products</p>
                                            <p className="text-lg font-extrabold text-[#1A2536]">{d.instance_count}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/60">In Stock</p>
                                            <p className="text-lg font-extrabold text-emerald-600">{d.in_stock_count}</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-[#E5BDB0]/40 pt-3">
                                        <p className="text-xs text-[#1A2536]/60">From</p>
                                        <p className="text-lg font-extrabold text-[#B86B5A]">{inr(d.base_price)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}