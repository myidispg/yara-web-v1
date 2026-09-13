"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import controlApi from "@/api/controlClient";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const RING_SIZES = ["6", "8", "10", "12", "14", "16", "18", "20"];
const inputCls = "w-full border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536] transition-colors";
const labelCls = "text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-2";

export default function NewPage() {
    const router = useRouter();
    const [mode, setMode] = useState("new");
    const [categories, setCategories] = useState([]);
    const [designs, setDesigns] = useState([]);
    const [rateCard, setRateCard] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [files, setFiles] = useState([]);

    const [designCode, setDesignCode] = useState("");
    const [designName, setDesignName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [existingDesignId, setExistingDesignId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [productCode, setProductCode] = useState("");
    const [karat, setKarat] = useState("18Kt");
    const [goldColor, setGoldColor] = useState("Yellow");
    const [ringSize, setRingSize] = useState("");
    const [netWeight, setNetWeight] = useState("");

    const [melleWeight, setMelleWeight] = useState("");
    const [pointerWeights, setPointerWeights] = useState([""]);
    const [fancyWeights, setFancyWeights] = useState([""]);
    const [colorStoneWeights, setColorStoneWeights] = useState([""]);

    const [diamondGrade, setDiamondGrade] = useState("IJ/SI");
    const [reportLab, setReportLab] = useState("IGI");
    const [reportNumber, setReportNumber] = useState("");
    const [huids, setHuids] = useState([""]);

    const [priceBreakdown, setPriceBreakdown] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const [cats, rc, ds] = await Promise.all([
                    controlApi.getCategories(),
                    controlApi.getRateCard(),
                    controlApi.getProducts(),
                ]);
                setCategories(cats.data.results || cats.data);
                setRateCard(rc.data);
                setDesigns(ds.data.results || ds.data);
                setDiamondGrade(rc.data.default_grade || "IJ/SI");
            } catch (e) {
                console.error(e);
            }
        })();
    }, []);

    useEffect(() => {
        calculatePrice();
    }, [netWeight, melleWeight, pointerWeights, fancyWeights, karat, diamondGrade, rateCard]);

    const calculatePrice = async () => {
        if (!rateCard || !netWeight) {
            setPriceBreakdown(null);
            return;
        }

        const melle = parseFloat(melleWeight) || 0;
        const pointerTotal = pointerWeights.reduce((sum, w) => sum + (parseFloat(w) || 0), 0);
        const fancyTotal = fancyWeights.reduce((sum, w) => sum + (parseFloat(w) || 0), 0);

        try {
            const { data } = await controlApi.calculatePrice({
                net_weight: parseFloat(netWeight),
                karat,
                diamond_grade: diamondGrade,
                diamond_weight_round_melle: melle,
                pointer_weights: pointerWeights.map(w => parseFloat(w) || 0),
                fancy_weights: fancyWeights.map(w => parseFloat(w) || 0),
            });
            setPriceBreakdown(data);
        } catch (e) {
            console.error("Price calculation failed:", e);
        }
    };

    const flatCategories = categories.flatMap((c) => [
        { id: c.id, label: c.name, slug: c.slug, parent_slug: null },
        ...(c.subcategories || []).map((s) => ({ id: s.id, label: `${c.name} › ${s.name}`, slug: s.slug, parent_slug: c.slug })),
    ]);

    const isRingCategory = (catId) => {
        const cat = flatCategories.find((c) => c.id === parseInt(catId));
        return cat && (["rings", "solitaires", "color-stone"].includes(cat.slug) ||
            ["rings", "solitaires", "color-stone"].includes(cat.parent_slug));
    };

    const showRingSize = mode === "new" ? isRingCategory(categoryId) :
        designs.find(d => d.id === parseInt(existingDesignId))?.is_ring;

    const filteredDesigns = searchQuery.length >= 2
        ? designs.filter(d =>
            d.design_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 10)
        : [];

    const handleFiles = (e) => {
        const newFiles = Array.from(e.target.files).map((file, i) => ({
            file,
            id: Date.now() + i,
            preview: URL.createObjectURL(file),
        }));
        setFiles([...files, ...newFiles]);
    };

    const removeFile = (id) => {
        setFiles(files.filter(f => f.id !== id));
    };

    const reorderMedia = (fromIndex, toIndex) => {
        const updated = [...files];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        setFiles(updated);
    };

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

    const addHuid = () => {
        if (huids.length < 3) setHuids([...huids, ""]);
    };
    const removeHuid = (i) => setHuids(huids.filter((_, idx) => idx !== i));
    const updateHuid = (i, val) => {
        const updated = [...huids];
        updated[i] = val;
        setHuids(updated);
    };

    const validate = () => {
        if (mode === "new") {
            if (!designCode.trim()) return "Design code is required";
            if (!designName.trim()) return "Design name is required";
            if (!categoryId) return "Category is required";
        } else {
            if (!existingDesignId) return "Please select an existing design";
        }
        if (!productCode.trim()) return "Product code is required";
        if (!netWeight) return "Net weight is required";
        if (showRingSize && !ringSize) return "Ring size is required";
        return null;
    };

    const submit = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            let designId = mode === "existing" ? parseInt(existingDesignId) : null;

            if (mode === "new") {
                const designData = {
                    name: designName.trim(),
                    design_code: designCode.trim(),
                    category: parseInt(categoryId),
                    base_net_weight_14kt: parseFloat(netWeight) / (karat === "18Kt" ? 1.2 : 1),
                    reference_weight: parseFloat(netWeight) / (karat === "18Kt" ? 1.2 : 1),
                    reference_size: parseInt(ringSize) || 12,
                    diamond_weight_round_melle: parseFloat(melleWeight) || 0,
                    pointer_weights: pointerWeights.map(w => parseFloat(w) || 0).filter(w => w > 0),
                    fancy_weights: fancyWeights.map(w => parseFloat(w) || 0).filter(w => w > 0),
                    color_stone_weights: colorStoneWeights.map(w => parseFloat(w) || 0).filter(w => w > 0),
                };

                const { data } = await controlApi.createDesign(designData);
                designId = data.id;

                for (let i = 0; i < files.length; i++) {
                    await controlApi.uploadMedia(designId, files[i].file);
                }
            }

            const totalDia = (parseFloat(melleWeight) || 0) +
                pointerWeights.reduce((sum, w) => sum + (parseFloat(w) || 0), 0) +
                fancyWeights.reduce((sum, w) => sum + (parseFloat(w) || 0), 0);

            await controlApi.addInstance(designId, {
                item_code: productCode.trim(),
                karat,
                gold_color: goldColor,
                ring_size: showRingSize ? ringSize : null,
                diamond_grade: diamondGrade,
                actual_net_weight: parseFloat(netWeight),
                actual_diamond_weight: totalDia > 0 ? totalDia : null,
                actual_color_stone_weight: colorStoneWeights.reduce((sum, w) => sum + (parseFloat(w) || 0), 0),
                report_lab: reportLab,
                report_number: reportNumber,
                hallmark_numbers: huids.filter(h => h.trim()),
            });

            router.push("/control/inventory");
        } catch (err) {
            const d = err.response?.data;
            setError(typeof d === "object" ? JSON.stringify(d) : String(d || err.message));
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            <button onClick={() => router.push("/control/inventory")} className="text-xs text-[#B86B5A] font-bold uppercase tracking-wider hover:underline flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Inventory
            </button>

            <div>
                <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">create new</span>
                <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Add Product</h1>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                    onClick={() => setMode("new")}
                    className={`p-5 rounded-2xl border-2 text-sm font-semibold transition-all ${mode === "new" ? "border-[#1A2536] bg-[#1A2536] text-white shadow-lg" : "border-[#E5BDB0] text-[#1A2536] hover:border-[#B86B5A]"}`}
                >
                    Create New Design
                </button>
                <button
                    onClick={() => setMode("existing")}
                    className={`p-5 rounded-2xl border-2 text-sm font-semibold transition-all ${mode === "existing" ? "border-[#1A2536] bg-[#1A2536] text-white shadow-lg" : "border-[#E5BDB0] text-[#1A2536] hover:border-[#B86B5A]"}`}
                >
                    Add to Existing Design
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 space-y-6">
                        <h2 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">Design Information</h2>

                        {mode === "new" ? (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>Design Code *</label>
                                    <input value={designCode} onChange={(e) => setDesignCode(e.target.value)} className={inputCls} placeholder="e.g., ER-001" />
                                </div>
                                <div>
                                    <label className={labelCls}>Design Name *</label>
                                    <input value={designName} onChange={(e) => setDesignName(e.target.value)} className={inputCls} placeholder="e.g., Classic Stud Earrings" />
                                </div>
                                <div>
                                    <label className={labelCls}>Category *</label>
                                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
                                        <option value="">Select category...</option>
                                        {flatCategories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>Search Design *</label>
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setExistingDesignId("");
                                        }}
                                        className={inputCls}
                                        placeholder="Type design code or name..."
                                    />
                                    {filteredDesigns.length > 0 && !existingDesignId && (
                                        <div className="mt-2 border border-[#E5BDB0] rounded-xl max-h-60 overflow-y-auto">
                                            {filteredDesigns.map((d) => (
                                                <button
                                                    key={d.id}
                                                    onClick={() => {
                                                        setExistingDesignId(d.id.toString());
                                                        setSearchQuery(`${d.design_code} - ${d.name}`);
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-[#1A2536]/[0.03] border-b border-[#E5BDB0]/40 last:border-0"
                                                >
                                                    <p className="font-bold text-[#1A2536]">{d.design_code} - {d.name}</p>
                                                    <p className="text-xs text-[#1A2536]/60">{d.category_name}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 space-y-6">
                        <h2 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">Product Details</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Product Code *</label>
                                <input value={productCode} onChange={(e) => setProductCode(e.target.value)} className={inputCls} placeholder="Unique identifier" />
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
                            {showRingSize && (
                                <div>
                                    <label className={labelCls}>Ring Size *</label>
                                    <select value={ringSize} onChange={(e) => setRingSize(e.target.value)} className={inputCls}>
                                        <option value="">Select size...</option>
                                        {RING_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className={labelCls}>Actual Net Weight (g) *</label>
                            <input type="number" step="0.001" value={netWeight} onChange={(e) => setNetWeight(e.target.value)} className={inputCls} placeholder="Enter weight" />
                        </div>
                    </div>

                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 space-y-6">
                        <h2 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">Diamond Weights</h2>

                        <div>
                            <label className={labelCls}>Round Melle (Ct)</label>
                            <input type="number" step="0.01" value={melleWeight} onChange={(e) => setMelleWeight(e.target.value)} className={inputCls} placeholder="Total melle weight" />
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
                                        <button onClick={() => removePointer(i)} className="px-3 text-red-500 hover:text-red-700">
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button onClick={addPointer} className="text-xs text-[#B86B5A] font-bold hover:underline">
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
                                        <button onClick={() => removeFancy(i)} className="px-3 text-red-500 hover:text-red-700">
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button onClick={addFancy} className="text-xs text-[#B86B5A] font-bold hover:underline">
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
                                        <button onClick={() => removeColorStone(i)} className="px-3 text-red-500 hover:text-red-700">
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button onClick={addColorStone} className="text-xs text-[#B86B5A] font-bold hover:underline">
                                + Add Color Stone
                            </button>
                        </div>
                    </div>

                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 space-y-6">
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
                                        <button onClick={() => removeHuid(i)} className="px-3 text-red-500 hover:text-red-700">
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            {huids.length < 3 && (
                                <button onClick={addHuid} className="text-xs text-[#B86B5A] font-bold hover:underline">
                                    + Add HUID
                                </button>
                            )}
                            <p className="text-xs text-[#1A2536]/50">
                                {huids.filter(h => h.trim()).length}/3 entered
                            </p>
                        </div>
                    </div>

                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 space-y-6">
                        <h2 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">Media Upload</h2>

                        <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleFiles}
                            className="hidden"
                            id="file-upload"
                        />
                        <label 
                            htmlFor="file-upload" 
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.classList.add('border-[#B86B5A]', 'bg-[#B86B5A]/10');
                            }}
                            onDragEnter={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.classList.add('border-[#B86B5A]', 'bg-[#B86B5A]/10');
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.classList.remove('border-[#B86B5A]', 'bg-[#B86B5A]/10');
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.classList.remove('border-[#B86B5A]', 'bg-[#B86B5A]/10');
                                
                                const droppedFiles = Array.from(e.dataTransfer.files);
                                if (droppedFiles.length > 0) {
                                    const newFiles = droppedFiles.map((file, i) => ({
                                        file,
                                        id: Date.now() + i,
                                        preview: URL.createObjectURL(file),
                                    }));
                                    setFiles(prev => [...prev, ...newFiles]);
                                }
                            }}
                            className="cursor-pointer block border-2 border-dashed border-[#E5BDB0] rounded-2xl p-8 text-center hover:border-[#B86B5A] transition-colors"
                        >
                            <svg className="w-12 h-12 mx-auto text-[#B86B5A] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm font-semibold text-[#1A2536]">Click to upload or drag and drop files here</p>
                            <p className="text-xs text-[#1A2536]/50 mt-1">PNG, JPG, WEBP, MP4, WEBM up to 50MB</p>
                        </label>

                        {files.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs text-[#1A2536]/60 font-semibold uppercase tracking-wider">
                                    Drag the ⋮⋮ icon to reorder • {files.length} file{files.length !== 1 ? 's' : ''}
                                </p>
                                {files.map((f, i) => (
                                    <div
                                        key={f.id}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.classList.add('border-[#B86B5A]', 'bg-[#B86B5A]/5');
                                        }}
                                        onDragEnter={(e) => {
                                            e.preventDefault();
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
                                            const toIndex = i;
                                            if (!isNaN(fromIndex) && fromIndex !== toIndex) {
                                                reorderMedia(fromIndex, toIndex);
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

                                        {f.file.type.startsWith('image/') ? (
                                            <img src={f.preview} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                                        ) : (
                                            <div className="w-16 h-16 bg-[#1A2536]/[0.03] rounded-lg flex items-center justify-center text-xs flex-shrink-0">
                                                <svg className="w-6 h-6 text-[#1A2536]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-[#1A2536] truncate">{f.file.name}</p>
                                            <p className="text-xs text-[#1A2536]/50">
                                                {(f.file.size / 1024 / 1024).toFixed(2)} MB • {f.file.type.split('/')[0]}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeFile(f.id)}
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
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-6 space-y-4">
                        {priceBreakdown && (
                            <div className="glass-card-vibrant rounded-3xl border border-[#B86B5A]/30 bg-gradient-to-br from-[#B86B5A]/5 to-transparent p-6 space-y-3">
                                <h3 className="font-serif-luxury text-lg font-semibold text-[#1A2536]">Price Breakdown</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[#1A2536]/70">Gold Value</span>
                                        <span className="font-bold">{inr(priceBreakdown.gold_value)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#1A2536]/70">Diamond Value</span>
                                        <span className="font-bold">{inr(priceBreakdown.diamond_value)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#1A2536]/70">Making Charges</span>
                                        <span className="font-bold">{inr(priceBreakdown.making_charges)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-[#E5BDB0] pt-2">
                                        <span className="text-[#1A2536]/70">Subtotal</span>
                                        <span className="font-bold">{inr(priceBreakdown.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#1A2536]/70">GST</span>
                                        <span className="font-bold">{inr(priceBreakdown.gst_amount)}</span>
                                    </div>
                                    <div className="flex justify-between border-t-2 border-[#B86B5A] pt-2">
                                        <span className="font-bold text-[#1A2536]">Total</span>
                                        <span className="text-2xl font-serif-luxury font-extrabold text-[#B86B5A]">{inr(priceBreakdown.total)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                                <p className="text-sm text-red-600 font-semibold">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={submit}
                            disabled={submitting}
                            className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-sm font-bold uppercase tracking-wider rounded-full transition-all shadow disabled:opacity-50"
                        >
                            {submitting ? "Saving..." : "Save Product"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}