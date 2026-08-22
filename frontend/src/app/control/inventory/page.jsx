"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import controlApi from "@/api/controlClient";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const RING_SLUGS = ["rings", "solitaires", "color-stone"];

const INSTANCE_STATUS = {
    in_stock: { label: "In Stock", cls: "bg-green-100 text-green-800" },
    sold: { label: "Sold (Online)", cls: "bg-gray-200 text-gray-700" },
    sold_offline: { label: "Sold (Offline)", cls: "bg-purple-100 text-purple-800" },
    reserved: { label: "Reserved", cls: "bg-yellow-100 text-yellow-800" },
};

export default function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [view, setView] = useState("designs");
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    // Bulk selection state
    const [checked, setChecked] = useState([]);
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

    // ── Bulk operations ────────────────────────────────────────────
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

    if (loading) return <div className="text-center py-12">Loading inventory...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-serif text-4xl">Inventory</h1>
                <div className="flex items-center gap-3">
                    <div className="flex rounded-lg border border-line overflow-hidden">
                        <button onClick={() => { setView("designs"); setSelected(null); }} className={`px-4 py-2 text-sm font-semibold ${view === "designs" ? "bg-ink text-white" : "bg-white text-ink/60 hover:text-ink"}`}>Designs</button>
                        <button onClick={() => { setView("products"); setSelected(null); }} className={`px-4 py-2 text-sm font-semibold ${view === "products" ? "bg-ink text-white" : "bg-white text-ink/60 hover:text-ink"}`}>All Products</button>
                    </div>
                    <p className="text-sm text-ink/60 mr-2">{products.length} designs</p>
                    <Link href="/control/inventory/new?mode=product" className="btn-outline">+ Add Product</Link>
                    <Link href="/control/inventory/new?mode=design" className="btn-solid">+ Add Design</Link>
                </div>
            </div>

            {view === "products" ? (
                <div>
                    {/* Bulk action bar */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setChecked([]); }} className="border border-line rounded-lg px-4 py-2 text-sm bg-white">
                            <option value="">All statuses</option>
                            <option value="in_stock">In Stock</option>
                            <option value="sold">Sold (Online)</option>
                            <option value="sold_offline">Sold (Offline)</option>
                            <option value="reserved">Reserved</option>
                        </select>
                        <span className="text-sm text-ink/60">{visibleProducts.length} products</span>
                        {checked.length > 0 && (
                            <div className="flex items-center gap-2 ml-auto bg-ink text-white rounded-lg px-4 py-2">
                                <span className="text-sm font-semibold mr-2">{checked.length} selected</span>
                                <button onClick={() => runBulk("mark_sold_offline")} disabled={bulkBusy} className="text-xs font-semibold hover:text-gold-dark disabled:opacity-40">Mark Sold Offline</button>
                                <span className="text-white/30">|</span>
                                <button onClick={() => runBulk("return_to_stock")} disabled={bulkBusy} className="text-xs font-semibold hover:text-gold-dark disabled:opacity-40">Return to Stock</button>
                                <span className="text-white/30">|</span>
                                <button onClick={exportSelected} disabled={bulkBusy} className="text-xs font-semibold hover:text-gold-dark disabled:opacity-40">Export Selected</button>
                                <span className="text-white/30">|</span>
                                <button onClick={() => runBulk("delete")} disabled={bulkBusy} className="text-xs font-semibold text-red-300 hover:text-red-400 disabled:opacity-40">Delete</button>
                                <span className="text-white/30">|</span>
                                <button onClick={() => setChecked([])} className="text-xs text-white/60 hover:text-white">Clear</button>
                            </div>
                        )}
                    </div>

                    {bulkResult && (
                        <div className="mb-4 rounded-xl border border-line bg-cream p-4 text-sm">
                            <p className="font-semibold">
                                Done: {bulkResult.processed.length} processed
                                {bulkResult.skipped.length > 0 && ` · ${bulkResult.skipped.length} skipped`}
                            </p>
                            {bulkResult.skipped.length > 0 && (
                                <ul className="mt-2 text-xs text-ink/60 space-y-1 max-h-32 overflow-y-auto">
                                    {bulkResult.skipped.map((s) => (
                                        <li key={s.id}>• {s.item_code}: {s.reason}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="bg-white rounded-xl border border-line shadow-card overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-cream/50">
                                <tr>
                                    <th className="px-4 py-3 w-10">
                                        <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-4 h-4" />
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Item Code</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Design</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Hallmark</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Variant</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Weight</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Price</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleProducts.map((p) => {
                                    const st = INSTANCE_STATUS[p.status] || { label: p.status, cls: "bg-gray-100 text-gray-800" };
                                    return (
                                        <tr key={p.id} className="border-b border-line hover:bg-cream/30">
                                            <td className="px-4 py-4">
                                                <input type="checkbox" checked={checked.includes(p.id)} onChange={() => toggleCheck(p.id)} className="w-4 h-4" />
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm">{p.item_code}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <p className="font-medium">{p.design_name}</p>
                                                <p className="text-xs text-ink/50">{p.design_code}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm">{p.hallmark_number || "—"}</td>
                                            <td className="px-6 py-4 text-sm">
                                                {p.karat} {p.gold_color}
                                                {p.ring_size && ` · Size ${p.ring_size}`}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-ink/70">{Number(p.actual_net_weight).toFixed(3)}g</td>
                                            <td className="px-6 py-4 font-semibold">{inr(p.price)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {visibleProducts.length === 0 && (
                                    <tr><td colSpan="8" className="px-6 py-8 text-center text-sm text-ink/50">No products found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : selected ? (
                <div>
                    <button onClick={() => setSelected(null)} className="mb-6 text-sm text-gold-dark hover:text-ink">
                        ← Back to Inventory
                    </button>

                    <div className="bg-white rounded-xl border border-line p-8 shadow-card mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="font-serif text-2xl mb-2">{selected.name}</h2>
                                <p className="text-sm text-ink/60">Design Code: {selected.design_code} · {selected.category_name}</p>
                            </div>
                            <div className="flex gap-2">
                                <Link href={`/control/inventory/${selected.id}/edit`} className="btn-outline text-sm">
                                    Edit Design
                                </Link>
                                <button onClick={deleteDesign} className="btn-outline text-sm text-red-600 border-red-600 hover:bg-red-50">
                                    Delete Design
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-6 mb-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60 mb-1">
                                    {RING_SLUGS.includes(selected.category_slug) ? "Base Weight @ Size 12 · 14Kt" : "Base Weight @ 14Kt"}
                                </p>
                                <p className="font-semibold">{Number(selected.base_net_weight_14kt).toFixed(3)} g</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60 mb-1">From Price</p>
                                <p className="font-semibold">{inr(selected.base_price)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60 mb-1">Total Products</p>
                                <p className="font-semibold">{selected.instance_count}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60 mb-1">In Stock</p>
                                <p className="font-semibold text-green-600">{selected.in_stock_count}</p>
                            </div>
                        </div>

                        {selected.size_weight_refs && Object.keys(selected.size_weight_refs).length > 0 && (
                            <div className="bg-cream rounded-xl p-4 mb-4 space-y-3">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 mb-2">14Kt Reference Weights</p>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {Object.entries(selected.size_weight_refs).map(([size, w]) => (
                                            <span key={`14-${size}`} className="bg-white border border-line rounded-full px-3 py-1">
                                                <span className="font-semibold">{size === "base" ? "Base" : `#${size}`}</span> {Number(w).toFixed(3)}g
                                                <span className="text-ink/40 ml-1">({selected.size_weight_counts?.[size] ?? 1} upd)</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 mb-2">18Kt Reference Weights</p>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {Object.entries(selected.size_weight_refs).map(([size, w]) => (
                                            <span key={`18-${size}`} className="bg-white border border-line rounded-full px-3 py-1">
                                                <span className="font-semibold">{size === "base" ? "Base" : `#${size}`}</span> {(Number(w) * 1.2).toFixed(3)}g
                                                <span className="text-ink/40 ml-1">({selected.size_weight_counts?.[size] ?? 1} upd)</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {selected.media && selected.media.length > 0 && (
                            <div className="mb-4">
                                <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 mb-2">
                                    Media ({selected.media.length})
                                </p>
                                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                    {selected.media.map((m, i) => (
                                        <div key={i} className="aspect-square rounded-lg overflow-hidden bg-cream relative group">
                                            {m.kind === "video" ? (
                                                <video src={m.url} className="w-full h-full object-cover" muted />
                                            ) : (
                                                <img src={m.url} alt={`Media ${i + 1}`} className="w-full h-full object-cover" />
                                            )}
                                            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                                                {m.kind === "video" ? "▶ Video" : "Image"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selected.description && (
                            <div className="text-sm text-ink/70 leading-relaxed">
                                {selected.description}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-line shadow-card overflow-hidden">
                        <div className="px-6 py-4 border-b border-line bg-cream flex items-center justify-between">
                            <h3 className="font-semibold">Products ({selected.products.length})</h3>
                            <Link
                                href={`/control/inventory/new?mode=product&design_id=${selected.id}`}
                                className="text-xs text-gold-dark font-semibold hover:text-ink"
                            >
                                + Add Product to this Design
                            </Link>
                        </div>
                        <table className="w-full">
                            <thead className="bg-cream/50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Item Code</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Hallmark</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Variant</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Grade</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Dia (Ct)</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Weight</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Price</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Status</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {selected.products.map((p) => {
                                    const st = INSTANCE_STATUS[p.status] || { label: p.status, cls: "bg-gray-100 text-gray-800" };
                                    return (
                                        <tr key={p.id} className="border-b border-line hover:bg-cream/30">
                                            <td className="px-6 py-4 font-mono text-sm">{p.item_code}</td>
                                            <td className="px-6 py-4 text-sm">{p.hallmark_number || '—'}</td>
                                            <td className="px-6 py-4 text-sm">
                                                {p.karat} {p.gold_color}
                                                {p.ring_size && ` · Size ${p.ring_size}`}
                                            </td>
                                            <td className="px-6 py-4 text-sm">{p.diamond_grade}</td>
                                            <td className="px-6 py-4 text-sm text-ink/70">{Number(p.actual_diamond_weight).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm text-ink/70">{Number(p.actual_net_weight).toFixed(3)}g</td>
                                            <td className="px-6 py-4 font-semibold">{inr(p.price)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                                                {p.sold_in_order_number && <p className="text-[10px] text-ink/50 mt-1">→ {p.sold_in_order_number}</p>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    {p.status === "in_stock" ? (
                                                        <button onClick={() => markSoldOffline(p.id)} className="text-sm text-gold-dark hover:text-ink font-semibold">Mark Sold</button>
                                                    ) : (
                                                        <button onClick={() => returnToStock(p.id)} className="text-sm text-green-600 hover:text-ink font-semibold">Return to Stock</button>
                                                    )}
                                                    {p.status === "in_stock" && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deleteProduct(p.id, p.item_code); }}
                                                            className="text-sm text-red-600 hover:text-red-800 font-semibold"
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
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((d) => (
                        <div key={d.id} onClick={() => viewDesign(d.id)} className="bg-white rounded-xl border border-line p-6 shadow-card hover:shadow-hero cursor-pointer transition-shadow">
                            <h3 className="font-serif text-xl mb-2">{d.name}</h3>
                            <p className="text-sm text-ink/60 mb-4">{d.design_code} · {d.category_name}</p>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60">Products</p>
                                    <p className="font-semibold">{d.instance_count}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60">In Stock</p>
                                    <p className="font-semibold text-green-600">{d.in_stock_count}</p>
                                </div>
                            </div>
                            <p className="text-sm font-semibold">From {inr(d.base_price)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}