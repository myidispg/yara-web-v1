"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import controlApi from "@/api/controlClient";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const RING_SIZES = ["6", "8", "10", "12", "14", "16", "18", "20"];
const inputCls = "w-full border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536] transition-colors";
const labelCls = "text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-2";

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [design, setDesign] = useState(null);
    const [rateCard, setRateCard] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Product form state
    const [itemCode, setItemCode] = useState("");
    const [karat, setKarat] = useState("18Kt");
    const [goldColor, setGoldColor] = useState("Yellow");
    const [ringSize, setRingSize] = useState("");
    const [netWeight, setNetWeight] = useState("");
    const [totalDiaWeight, setTotalDiaWeight] = useState("");
    const [colorStoneWeight, setColorStoneWeight] = useState("");
    const [diamondGrade, setDiamondGrade] = useState("IJ/SI");
    const [reportLab, setReportLab] = useState("IGI");
    const [reportNumber, setReportNumber] = useState("");
    const [status, setStatus] = useState("in_stock");
    const [huids, setHuids] = useState([""]);

    // Design diamond weights (arrays)
    const [pointerWeights, setPointerWeights] = useState([""]);
    const [fancyWeights, setFancyWeights] = useState([""]);
    const [colorStoneWeights, setColorStoneWeights] = useState([""]);
    const [melleWeight, setMelleWeight] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const [prodRes, rcRes] = await Promise.all([
                    controlApi.getProductDetail(id),
                    controlApi.getRateCard()
                ]);
                
                const prod = prodRes.data;
                const rc = rcRes.data;
                
                setProduct(prod);
                setRateCard(rc);
                setDiamondGrade(rc.default_grade || "IJ/SI");

                // Set product form
                setItemCode(prod.item_code);
                setKarat(prod.karat);
                setGoldColor(prod.gold_color);
                setRingSize(prod.ring_size || "");
                setNetWeight(String(prod.actual_net_weight || ""));
                setTotalDiaWeight(String(prod.actual_diamond_weight || ""));
                setColorStoneWeight(String(prod.actual_color_stone_weight || "0"));
                setDiamondGrade(prod.diamond_grade || rc.default_grade);
                setReportLab(prod.report_lab || "IGI");
                setReportNumber(prod.report_number || "");
                setStatus(prod.status);
                setHuids(prod.hallmark_numbers?.length ? prod.hallmark_numbers : [""]);

                // Load design
                const designRes = await controlApi.getProduct(prod.design_id);
                const des = designRes.data;
                setDesign(des);

                // Set design diamond weights
                setMelleWeight(String(des.diamond_weight_round_melle || "0"));
                setPointerWeights(des.pointer_weights?.length ? des.pointer_weights.map(String) : [""]);
                setFancyWeights(des.fancy_weights?.length ? des.fancy_weights.map(String) : [""]);
                setColorStoneWeights(des.color_stone_weights?.length ? des.color_stone_weights.map(String) : [""]);
            } catch (e) {
                console.error("Failed to load product:", e);
            }
        })();
    }, [id]);

    // Array field helpers for HUIDs
    const addHuid = () => {
        if (huids.length < 3) setHuids([...huids, ""]);
    };
    const removeHuid = (i) => setHuids(huids.filter((_, idx) => idx !== i));
    const updateHuid = (i, val) => {
        const updated = [...huids];
        updated[i] = val;
        setHuids(updated);
    };

    // Array field helpers for design diamond weights
    const addPointer = () => setPointerWeights([...pointerWeights, ""]);
    const removePointer = (i) => setPointerWeights(pointerWeights.filter((_, idx) => idx !== i));
    const updatePointer = (i, val) => {
        const updated = [...pointerWeights];
        updated[i] = val;
        setPointerWeights(updated);
    };

    const addFancy = () => setFancyWeights([...fancyWeights, ""]);
    const removeFancy = (i) => setFancyWeights(fancyWeights.filter((_, idx) => idx !== i));
    const updateFancy = (i, val) => {
        const updated = [...fancyWeights];
        updated[i] = val;
        setFancyWeights(updated);
    };

    const addColorStone = () => setColorStoneWeights([...colorStoneWeights, ""]);
    const removeColorStone = (i) => setColorStoneWeights(colorStoneWeights.filter((_, idx) => idx !== i));
    const updateColorStone = (i, val) => {
        const updated = [...colorStoneWeights];
        updated[i] = val;
        setColorStoneWeights(updated);
    };

    const save = async (e) => {
        e.preventDefault();
        if (!itemCode.trim()) {
            setError("Product code is required");
            return;
        }

        setSaving(true);
        setError("");

        try {
            // Update product
            await controlApi.updateProduct(id, {
                item_code: itemCode.trim(),
                karat,
                gold_color: goldColor,
                ring_size: ringSize || null,
                diamond_grade: diamondGrade,
                actual_net_weight: parseFloat(netWeight) || 0,
                actual_diamond_weight: parseFloat(totalDiaWeight) || 0,
                actual_color_stone_weight: parseFloat(colorStoneWeight) || 0,
                report_lab: reportLab,
                report_number: reportNumber,
                status,
                hallmark_numbers: huids.filter(h => h.trim()),
            });

            // Update design diamond weights
            if (design) {
                await controlApi.updateDesign(design.id, {
                    name: design.name,
                    design_code: design.design_code,
                    category: design.category,
                    is_active: design.is_active,
                    diamond_weight_round_melle: parseFloat(melleWeight) || 0,
                    pointer_weights: pointerWeights.map(w => parseFloat(w) || 0).filter(w => w > 0),
                    fancy_weights: fancyWeights.map(w => parseFloat(w) || 0).filter(w => w > 0),
                    color_stone_weights: colorStoneWeights.map(w => parseFloat(w) || 0).filter(w => w > 0),
                });
            }

            router.push(`/control/inventory?design=${product.design_id}`);
        } catch (err) {
            const d = err.response?.data;
            setError(typeof d === "object" ? JSON.stringify(d) : String(d || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (!product) return (
        <div className="flex items-center justify-center py-24">
            <p className="text-sm text-[#1A2536]/50">Loading product…</p>
        </div>
    );

    const isRing = design?.is_ring;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            <button 
                onClick={() => router.push(`/control/inventory?design=${product.design_id}`)} 
                className="text-xs text-[#B86B5A] font-bold uppercase tracking-wider hover:underline flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Design
            </button>

            <div>
                <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">update product</span>
                <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Edit Product</h1>
                <p className="text-sm text-[#1A2536]/60 mt-2">
                    Design: <span className="font-bold">{design?.design_code}</span> - {design?.name}
                </p>
            </div>

            <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {/* Product Details */}
                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 space-y-4">
                        <h2 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">Product Details</h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Product Code *</label>
                                <input value={itemCode} onChange={(e) => setItemCode(e.target.value)} className={inputCls} required />
                            </div>
                            <div>
                                <label className={labelCls}>Status</label>
                                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                                    <option value="in_stock">In Stock</option>
                                    <option value="sold">Sold (Online)</option>
                                    <option value="sold_offline">Sold (Offline)</option>
                                    <option value="reserved">Reserved</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Karat</label>
                                <select value={karat} onChange={(e) => setKarat(e.target.value)} className={inputCls}>
                                    <option>14Kt</option>
                                    <option>18Kt</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Gold Color</label>
                                <select value={goldColor} onChange={(e) => setGoldColor(e.target.value)} className={inputCls}>
                                    <option>Yellow</option>
                                    <option>Rose</option>
                                    <option>White</option>
                                </select>
                            </div>
                            {isRing && (
                                <div>
                                    <label className={labelCls}>Ring Size</label>
                                    <select value={ringSize} onChange={(e) => setRingSize(e.target.value)} className={inputCls}>
                                        <option value="">Select size...</option>
                                        {RING_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className={labelCls}>Actual Net Weight (g)</label>
                            <input type="number" step="0.001" value={netWeight} onChange={(e) => setNetWeight(e.target.value)} className={inputCls} />
                        </div>

                        <div>
                            <label className={labelCls}>Total Diamond Weight (Ct)</label>
                            <input type="number" step="0.01" value={totalDiaWeight} onChange={(e) => setTotalDiaWeight(e.target.value)} className={inputCls} />
                        </div>

                        <div>
                            <label className={labelCls}>Color Stone Weight (Ct)</label>
                            <input type="number" step="0.01" value={colorStoneWeight} onChange={(e) => setColorStoneWeight(e.target.value)} className={inputCls} />
                        </div>
                    </div>

                    {/* Certification & HUID */}
                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 space-y-4">
                        <h2 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">Certification & HUID</h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Diamond Grade</label>
                                <select value={diamondGrade} onChange={(e) => setDiamondGrade(e.target.value)} className={inputCls}>
                                    {rateCard && Object.entries(rateCard.diamond_rates || {})
                                        .filter(([, v]) => v)
                                        .map(([k]) => <option key={k}>{k}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Report Lab</label>
                                <select value={reportLab} onChange={(e) => setReportLab(e.target.value)} className={inputCls}>
                                    <option>IGI</option>
                                    <option>GIA</option>
                                    <option>SGL</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className={labelCls}>Report Number</label>
                                <input value={reportNumber} onChange={(e) => setReportNumber(e.target.value)} className={inputCls} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={labelCls}>HUID Numbers (max 3)</label>
                            {huids.map((h, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        value={h}
                                        onChange={(e) => updateHuid(i, e.target.value)}
                                        className={`${inputCls} flex-1`}
                                        placeholder={`HUID ${i + 1}`}
                                    />
                                    {huids.length > 1 && (
                                        <button type="button" onClick={() => removeHuid(i)} className="px-3 text-red-500 hover:text-red-700">
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            {huids.length < 3 && (
                                <button type="button" onClick={addHuid} className="text-xs text-[#B86B5A] font-bold hover:underline">
                                    + Add HUID
                                </button>
                            )}
                            <p className="text-xs text-[#1A2536]/50">
                                {huids.filter(h => h.trim()).length}/3 entered
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Design Diamond Weights */}
                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 space-y-4">
                        <h2 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">Design Diamond Weights</h2>
                        <p className="text-xs text-[#1A2536]/60">These weights are stored on the design blueprint for future estimates.</p>

                        <div>
                            <label className={labelCls}>Round Melle (Ct)</label>
                            <input type="number" step="0.01" value={melleWeight} onChange={(e) => setMelleWeight(e.target.value)} className={inputCls} />
                        </div>

                        <div className="space-y-2">
                            <label className={labelCls}>Pointer / Solitaire Weights (Ct)</label>
                            {pointerWeights.map((w, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={w}
                                        onChange={(e) => updatePointer(i, e.target.value)}
                                        className={`${inputCls} flex-1`}
                                        placeholder={`Pointer ${i + 1}`}
                                    />
                                    {pointerWeights.length > 1 && (
                                        <button type="button" onClick={() => removePointer(i)} className="px-3 text-red-500 hover:text-red-700">
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addPointer} className="text-xs text-[#B86B5A] font-bold hover:underline">
                                + Add Pointer
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className={labelCls}>Fancy Cut Weights (Ct)</label>
                            {fancyWeights.map((w, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={w}
                                        onChange={(e) => updateFancy(i, e.target.value)}
                                        className={`${inputCls} flex-1`}
                                        placeholder={`Fancy ${i + 1}`}
                                    />
                                    {fancyWeights.length > 1 && (
                                        <button type="button" onClick={() => removeFancy(i)} className="px-3 text-red-500 hover:text-red-700">
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addFancy} className="text-xs text-[#B86B5A] font-bold hover:underline">
                                + Add Fancy Cut
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className={labelCls}>Color Stone Weights (Ct)</label>
                            {colorStoneWeights.map((w, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={w}
                                        onChange={(e) => updateColorStone(i, e.target.value)}
                                        className={`${inputCls} flex-1`}
                                        placeholder={`Color Stone ${i + 1}`}
                                    />
                                    {colorStoneWeights.length > 1 && (
                                        <button type="button" onClick={() => removeColorStone(i)} className="px-3 text-red-500 hover:text-red-700">
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addColorStone} className="text-xs text-[#B86B5A] font-bold hover:underline">
                                + Add Color Stone
                            </button>
                        </div>
                    </div>

                    {/* Price Display */}
                    {product.price && (
                        <div className="glass-card-vibrant rounded-3xl border border-[#B86B5A]/30 bg-gradient-to-br from-[#B86B5A]/5 to-transparent p-6">
                            <h3 className="font-serif-luxury text-lg font-semibold text-[#1A2536] mb-2">Current Price</h3>
                            <p className="text-3xl font-serif-luxury font-extrabold text-[#B86B5A]">{inr(product.price)}</p>
                            <p className="text-xs text-[#1A2536]/60 mt-2">
                                Price is calculated based on current rate card and product weights.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                            <p className="text-sm text-red-600 font-semibold">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-sm font-bold uppercase tracking-wider rounded-full transition-all shadow disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Product"}
                    </button>
                </div>
            </form>
        </div>
    );
}