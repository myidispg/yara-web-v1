"use client";

import { useEffect, useState } from "react";
import controlApi from "@/api/controlClient";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showAddInstance, setShowAddInstance] = useState(false);
    const [newInstance, setNewInstance] = useState({
        karat: "18Kt",
        gold_color: "Yellow",
        ring_size: "",
        actual_net_weight: "",
        actual_diamond_weight: "",
        actual_color_stone_weight: "",
        report_lab: "",
        report_number: "",
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const { data } = await controlApi.getProducts();
            setProducts(data.results || data);
        } catch (err) {
            console.error("Failed to load products:", err);
        } finally {
            setLoading(false);
        }
    };

    const viewProduct = async (productId) => {
        try {
            const { data } = await controlApi.getProduct(productId);
            setSelectedProduct(data);
        } catch (err) {
            console.error("Failed to load product:", err);
        }
    };

    const markSoldOffline = async (instanceId) => {
        if (!confirm("Mark this instance as sold offline?")) return;
        
        try {
            await controlApi.markSoldOffline(instanceId);
            await viewProduct(selectedProduct.id);
        } catch (err) {
            alert("Failed: " + (err.response?.data?.error || err.message));
        }
    };

    const returnToStock = async (instanceId) => {
        if (!confirm("Return this instance to stock?")) return;
        
        try {
            await controlApi.returnToStock(instanceId);
            await viewProduct(selectedProduct.id);
        } catch (err) {
            alert("Failed: " + (err.response?.data?.error || err.message));
        }
    };

    const addInstance = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newInstance,
                actual_net_weight: parseFloat(newInstance.actual_net_weight) || selectedProduct.base_net_weight_14kt,
                actual_diamond_weight: parseFloat(newInstance.actual_diamond_weight) || selectedProduct.total_diamond_weight,
                actual_color_stone_weight: parseFloat(newInstance.actual_color_stone_weight) || 0,
                ring_size: newInstance.ring_size || null,
            };
            
            await controlApi.addInstance(selectedProduct.id, payload);
            setShowAddInstance(false);
            setNewInstance({
                karat: "18Kt",
                gold_color: "Yellow",
                ring_size: "",
                actual_net_weight: "",
                actual_diamond_weight: "",
                actual_color_stone_weight: "",
                report_lab: "",
                report_number: "",
            });
            await viewProduct(selectedProduct.id);
        } catch (err) {
            alert("Failed to add instance: " + JSON.stringify(err.response?.data || err.message));
        }
    };

    if (loading) return <div className="text-center py-12">Loading inventory...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-serif text-4xl">Inventory</h1>
                <p className="text-sm text-ink/60">{products.length} designs</p>
            </div>

            {selectedProduct ? (
                <div>
                    <button
                        onClick={() => setSelectedProduct(null)}
                        className="mb-6 text-sm text-gold-dark hover:text-ink flex items-center gap-2"
                    >
                        ← Back to Inventory
                    </button>

                    <div className="bg-white rounded-xl border border-line p-8 shadow-card mb-6">
                        <h2 className="font-serif text-2xl mb-2">{selectedProduct.name}</h2>
                        <p className="text-sm text-ink/60 mb-4">Design Code: {selectedProduct.design_code}</p>
                        
                        <div className="grid grid-cols-4 gap-6 mb-6">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60 mb-1">Category</p>
                                <p className="font-semibold">{selectedProduct.category_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60 mb-1">Base Price</p>
                                <p className="font-semibold">{inr(selectedProduct.base_price)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60 mb-1">Total Instances</p>
                                <p className="font-semibold">{selectedProduct.instance_count}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60 mb-1">In Stock</p>
                                <p className="font-semibold text-green-600">{selectedProduct.in_stock_count}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAddInstance(true)}
                            className="btn-solid"
                        >
                            + Add Physical Instance
                        </button>
                    </div>

                    {showAddInstance && (
                        <div className="bg-white rounded-xl border border-line p-8 shadow-card mb-6">
                            <h3 className="font-serif text-xl mb-6">Add New Instance</h3>
                            <form onSubmit={addInstance} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Karat</label>
                                        <select
                                            value={newInstance.karat}
                                            onChange={(e) => setNewInstance({ ...newInstance, karat: e.target.value })}
                                            className="w-full border border-line rounded px-3 py-2"
                                        >
                                            <option value="14Kt">14Kt</option>
                                            <option value="18Kt">18Kt</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Gold Color</label>
                                        <select
                                            value={newInstance.gold_color}
                                            onChange={(e) => setNewInstance({ ...newInstance, gold_color: e.target.value })}
                                            className="w-full border border-line rounded px-3 py-2"
                                        >
                                            <option value="Yellow">Yellow</option>
                                            <option value="Rose">Rose</option>
                                            <option value="White">White</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Ring Size (if applicable)</label>
                                        <input
                                            type="text"
                                            value={newInstance.ring_size}
                                            onChange={(e) => setNewInstance({ ...newInstance, ring_size: e.target.value })}
                                            placeholder="e.g., 12"
                                            className="w-full border border-line rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Net Weight (g)</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={newInstance.actual_net_weight}
                                            onChange={(e) => setNewInstance({ ...newInstance, actual_net_weight: e.target.value })}
                                            placeholder={selectedProduct.base_net_weight_14kt.toString()}
                                            className="w-full border border-line rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Diamond Weight (Ct)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={newInstance.actual_diamond_weight}
                                            onChange={(e) => setNewInstance({ ...newInstance, actual_diamond_weight: e.target.value })}
                                            placeholder={selectedProduct.total_diamond_weight.toString()}
                                            className="w-full border border-line rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Color Stone Weight (Ct)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={newInstance.actual_color_stone_weight}
                                            onChange={(e) => setNewInstance({ ...newInstance, actual_color_stone_weight: e.target.value })}
                                            placeholder="0"
                                            className="w-full border border-line rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Report Lab</label>
                                        <input
                                            type="text"
                                            value={newInstance.report_lab}
                                            onChange={(e) => setNewInstance({ ...newInstance, report_lab: e.target.value })}
                                            placeholder="e.g., IGI"
                                            className="w-full border border-line rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Report Number</label>
                                        <input
                                            type="text"
                                            value={newInstance.report_number}
                                            onChange={(e) => setNewInstance({ ...newInstance, report_number: e.target.value })}
                                            placeholder="e.g., 123456789"
                                            className="w-full border border-line rounded px-3 py-2"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button type="submit" className="btn-solid flex-1">Add Instance</button>
                                    <button type="button" onClick={() => setShowAddInstance(false)} className="btn-outline flex-1">Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-xl border border-line shadow-card overflow-hidden">
                        <div className="px-6 py-4 border-b border-line bg-cream">
                            <h3 className="font-semibold">Instances ({selectedProduct.instances.length})</h3>
                        </div>
                        <table className="w-full">
                            <thead className="bg-cream/50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Item Code</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Variant</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Weight</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Price</th>
                                    <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Status</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedProduct.instances.map((instance) => (
                                    <tr key={instance.id} className="border-b border-line hover:bg-cream/30">
                                        <td className="px-6 py-4 font-mono text-sm">{instance.item_code}</td>
                                        <td className="px-6 py-4 text-sm">
                                            {instance.karat} {instance.gold_color}
                                            {instance.ring_size && ` · Size ${instance.ring_size}`}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-ink/70">
                                            {Number(instance.actual_net_weight).toFixed(3)}g
                                        </td>
                                        <td className="px-6 py-4 font-semibold">{inr(instance.price)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                instance.status === "in_stock" 
                                                    ? "bg-green-100 text-green-800" 
                                                    : instance.status === "sold"
                                                    ? "bg-gray-100 text-gray-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}>
                                                {instance.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {instance.status === "in_stock" ? (
                                                <button
                                                    onClick={() => markSoldOffline(instance.id)}
                                                    className="text-sm text-gold-dark hover:text-ink font-semibold"
                                                >
                                                    Mark Sold
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => returnToStock(instance.id)}
                                                    className="text-sm text-green-600 hover:text-ink font-semibold"
                                                >
                                                    Return to Stock
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => viewProduct(product.id)}
                            className="bg-white rounded-xl border border-line p-6 shadow-card hover:shadow-hero cursor-pointer transition-shadow"
                        >
                            <h3 className="font-serif text-xl mb-2">{product.name}</h3>
                            <p className="text-sm text-ink/60 mb-4">{product.design_code} · {product.category_name}</p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60">Total</p>
                                    <p className="font-semibold">{product.instance_count}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60">In Stock</p>
                                    <p className="font-semibold text-green-600">{product.in_stock_count}</p>
                                </div>
                            </div>
                            
                            <p className="text-sm font-semibold">{inr(product.base_price)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}