"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import controlApi from "@/api/controlClient";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const RING_SLUGS = ["rings", "solitaires", "color-stone"];

const inputCls = "w-full border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536] transition-colors";
const labelCls = "text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-2";
const sectionCls = "text-[10px] uppercase tracking-[0.2em] font-bold text-[#B86B5A] mb-4 flex items-center gap-2";

export default function NewPage() {
    const router = useRouter();
    const [mode, setMode] = useState(null);
    const [step, setStep] = useState(0);
    const [categories, setCategories] = useState([]);
    const [designs, setDesigns] = useState([]);
    const [rateCard, setRateCard] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [files, setFiles] = useState([]);
    const [preselectedDesignId, setPreselectedDesignId] = useState("");

    const [designForm, setDesignForm] = useState({
        category: "", name: "", design_code: "", description: "",
        ref_weight: "", ref_size: "12",
        melle: "", pointer: "", fancy: "", cstone: "",
    });
    const [useNewDesign, setUseNewDesign] = useState(false);
    const [existingDesignId, setExistingDesignId] = useState("");
    const [productForm, setProductForm] = useState({
        item_code: "",
        karat: "18Kt", gold_color: "Yellow", ring_size: "", diamond_grade: "",
        actual_net_weight: "", actual_diamond_weight: "",
        report_lab: "IGI", report_number: "", hallmark_number: "",
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const m = params.get("mode");
        if (m === "design" || m === "product") setMode(m);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const [cats, rc, ds] = await Promise.all([
                    controlApi.getCategories(), controlApi.getRateCard(), controlApi.getProducts(),
                ]);
                const catData = cats.data.results || cats.data;
                const rcData = rc.data;
                const dsData = ds.data.results || ds.data;

                setCategories(catData);
                setRateCard(rcData);
                setDesigns(dsData);
                setProductForm((f) => ({ ...f, diamond_grade: rcData.default_grade || "IJ/SI" }));

                // Check for design_id parameter and auto-select if it exists
                const params = new URLSearchParams(window.location.search);
                const dId = params.get("design_id");
                if (dId) {
                    const matchingDesign = dsData.find((d) => String(d.id) === dId);
                    if (matchingDesign) {
                        setPreselectedDesignId(dId);
                        setExistingDesignId(dId);
                        setUseNewDesign(false);
                        setMode("product"); // Auto-set mode to product when design_id is present
                    }
                }
            } catch (e) { console.error(e); }
        })();
    }, []);

    const gradeBands = rateCard ? Object.entries(rateCard.diamond_rates || {}).filter(([, v]) => v).map(([k]) => k) : [];
    const flatCategories = categories.flatMap((c) => [
        { id: c.id, label: c.name, slug: c.slug, parent_slug: null },
        ...(c.subcategories || []).map((s) => ({ id: s.id, label: `${c.name} › ${s.name}`, slug: s.slug, parent_slug: c.slug })),
    ]);
    const isRingCat = (cat) => !!cat && (RING_SLUGS.includes(cat.slug) || RING_SLUGS.includes(cat.parent_slug));
    const selectedCategory = flatCategories.find((c) => String(c.id) === String(designForm.category));
    const isRingDesign = isRingCat(selectedCategory);
    const targetDesign = designs.find((d) => String(d.id) === String(existingDesignId));
    const productDesignIsRing = targetDesign ? !!targetDesign.is_ring : false;
    const ringContext = mode === "product" ? (useNewDesign ? isRingDesign : productDesignIsRing) : isRingDesign;

    const sum3 = (a, b, c) => (parseFloat(a) || 0) + (parseFloat(b) || 0) + (parseFloat(c) || 0);

    const estimate = (netG, diaCt, karat, grade) => {
        if (!rateCard || !netG) return 0;
        const goldRate = karat === "18Kt" ? Number(rateCard.gold_rate_18kt) : Number(rateCard.gold_rate_14kt);
        const gv = Number(netG) * goldRate;
        const dv = Number(diaCt || 0) * Number(rateCard.diamond_rates?.[grade || rateCard.default_grade] || 0);
        const making = (gv + dv) * (Number(rateCard.making_charges_percentage) / 100);
        const gst = (gv + dv + making) * (Number(rateCard.gst_percentage) / 100);
        return Math.round(gv + dv + making + gst);
    };

    const designRefNetAtSize = () => {
        if (useNewDesign || mode === "design") {
            const base = parseFloat(designForm.ref_weight) || 0;
            const refSize = parseInt(designForm.ref_size) || 12;
            const size = parseInt(productForm.ring_size);
            let w = base;
            if (ringContext && size) w = base * Math.pow(1.03, Math.floor((size - refSize) / 2));
            return w;
        }
        if (!targetDesign) return 0;
        const refs = targetDesign.size_weight_refs || {};
        const size = productForm.ring_size || "12";
        return Number(refs[size] ?? targetDesign.base_net_weight_14kt) || 0;
    };

    const designDiaTotal = () =>
        mode === "product" && !useNewDesign
            ? Number(targetDesign?.total_diamond_weight || 0)
            : sum3(designForm.melle, designForm.pointer, designForm.fancy);

    const liveEstimate = () => {
        const enteredNet = productForm.actual_net_weight ? parseFloat(productForm.actual_net_weight) : null;
        const enteredDia = sum3(productForm.a_melle, productForm.a_pointer, productForm.a_fancy);
        let net = enteredNet;
        if (net == null) {
            net = designRefNetAtSize();
            if (productForm.karat === "18Kt") net *= 1.2;
        }
        const dia = enteredDia > 0 ? enteredDia : designDiaTotal();
        return estimate(net, dia, productForm.karat, productForm.diamond_grade);
    };

    const designPayload = () => ({
        name: designForm.name.trim(),
        design_code: designForm.design_code.trim(),
        category: Number(designForm.category),
        description: designForm.description,
        base_net_weight_14kt: parseFloat(designForm.ref_weight),
        reference_weight: parseFloat(designForm.ref_weight),
        reference_size: parseInt(designForm.ref_size) || 12,
        diamond_weight_round_melle: parseFloat(designForm.melle) || 0,
        pointer_solitaire_weight: parseFloat(designForm.pointer) || 0,
        fancy_cut_weight: parseFloat(designForm.fancy) || 0,
        color_stone_weight: parseFloat(designForm.cstone) || 0,
        media: [],
        products: [],
    });

    const uploadFiles = async (designId) => {
        for (const f of files) await controlApi.uploadMedia(designId, f);
    };

    const steps = mode === "design"
        ? ["Basics", "References", "Media", "Review"]
        : ["Design", "The Piece", ...(useNewDesign ? ["Media"] : []), "Review"];

    const designBasicsValid = designForm.category && designForm.name.trim() && designForm.design_code.trim();
    const refsValid = parseFloat(designForm.ref_weight) > 0;
    const canProceed = () => {
        if (step === 0) {
            if (mode === "design") return !!designBasicsValid;
            if (useNewDesign) return !!designBasicsValid && refsValid;
            return !!existingDesignId;
        }
        if (step === 1) {
            if (mode === "design") return refsValid;
            if (ringContext && !productForm.ring_size) return false;
            return true;
        }
        return true;
    };

    const MAX_FILE = 50 * 1024 * 1024;
    const OK_EXT = ["jpg", "jpeg", "png", "webp", "mp4", "webm", "mov"];
    const fileProblem = () => {
        for (const f of files) {
            const ext = f.name.split(".").pop().toLowerCase();
            if (!OK_EXT.includes(ext)) return `"${f.name}" is not a supported file type.`;
            if (f.size > MAX_FILE) return `"${f.name}" is larger than 50MB. Remove or replace it before saving.`;
        }
        return null;
    };

    const submit = async () => {
        const problem = fileProblem();
        if (problem) { setError(problem); return; }
        setSubmitting(true);
        setError("");
        try {
            if (mode === "design") {
                const { data } = await controlApi.createDesign(designPayload());
                try {
                    if (files.length) await uploadFiles(data.id);
                } catch (upErr) {
                    await controlApi.deleteDesign(data.id).catch(() => { });
                    throw upErr;
                }
                router.push("/control/inventory");
                return;
            }

            let designId = existingDesignId;
            let createdNew = false;
            if (useNewDesign) {
                const { data } = await controlApi.createDesign(designPayload());
                designId = data.id;
                createdNew = true;
            }
            try {
                if (files.length && useNewDesign) await uploadFiles(designId);
                const enteredDia = sum3(productForm.a_melle, productForm.a_pointer, productForm.a_fancy);
                await controlApi.addInstance(designId, {
                    item_code: productForm.item_code,
                    karat: productForm.karat,
                    gold_color: productForm.gold_color,
                    ring_size: productDesignIsRing ? (productForm.ring_size || null) : null,
                    diamond_grade: productForm.diamond_grade || rateCard?.default_grade,
                    actual_net_weight: productForm.actual_net_weight ? parseFloat(productForm.actual_net_weight) : null,
                    actual_diamond_weight: enteredDia > 0 ? enteredDia : null,
                    actual_color_stone_weight: productForm.a_cstone ? parseFloat(productForm.a_cstone) : 0,
                    report_lab: productForm.report_lab,
                    report_number: productForm.report_number,
                    hallmark_number: productForm.hallmark_number,
                });
            } catch (innerErr) {
                if (createdNew) await controlApi.deleteDesign(designId).catch(() => { });
                throw innerErr;
            }
            router.push("/control/inventory");
        } catch (err) {
            const d = err.response?.data;
            setError(typeof d === "object" ? JSON.stringify(d) : String(d || err.message));
            setSubmitting(false);
        }
    };

    if (!mode)
        return (
            <div className="max-w-3xl mx-auto space-y-8">
                <button onClick={() => router.push("/control/inventory")} className="text-xs text-[#B86B5A] font-bold uppercase tracking-wider hover:underline flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Inventory
                </button>

                <div>
                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">create new</span>
                    <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">What are you adding?</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <button
                        onClick={() => setMode("design")}
                        className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] hover:border-[#B86B5A] p-8 text-left transition-all hover:shadow-xl group"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-[#B86B5A]/10 flex items-center justify-center mb-4 group-hover:bg-[#B86B5A]/20 transition-colors">
                            <svg className="w-8 h-8 text-[#B86B5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-2 group-hover:text-[#B86B5A] transition-colors">Add Design</h2>
                        <p className="text-sm text-[#1A2536]/60">Create a blueprint only. It becomes sellable immediately as Made-to-Order.</p>
                    </button>
                    <button
                        onClick={() => setMode("product")}
                        className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] hover:border-[#B86B5A] p-8 text-left transition-all hover:shadow-xl group"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mb-4 group-hover:bg-[#D4AF37]/20 transition-colors">
                            <svg className="w-8 h-8 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-2 group-hover:text-[#B86B5A] transition-colors">Add Product</h2>
                        <p className="text-sm text-[#1A2536]/60">Add a physical piece from the workshop. Attach it to an existing design or create a new one.</p>
                    </button>
                </div>
            </div>
        );

    const designFields = (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label className={labelCls}>Category *</label>
                    <select value={designForm.category} onChange={(e) => setDesignForm({ ...designForm, category: e.target.value })} className={inputCls}>
                        <option value="">Select category…</option>
                        {flatCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelCls}>Design Code *</label>
                    <input value={designForm.design_code} onChange={(e) => setDesignForm({ ...designForm, design_code: e.target.value })} placeholder="e.g., RG-031" maxLength={50} className={inputCls} />
                </div>
            </div>
            <div>
                <label className={labelCls}>Design Name *</label>
                <input value={designForm.name} onChange={(e) => setDesignForm({ ...designForm, name: e.target.value })} placeholder="e.g., Aura Diamond Ring" maxLength={255} className={inputCls} />
            </div>
            <div>
                <label className={labelCls}>Description</label>
                <textarea rows="4" value={designForm.description} onChange={(e) => setDesignForm({ ...designForm, description: e.target.value })} className={inputCls} />
            </div>
        </div>
    );

    const materialsFields = (
        <div className="space-y-6">
            <div>
                <p className={sectionCls}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B86B5A]"></span>
                    Design References (blueprint for Made-to-Order quotes)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className={labelCls}>Net Gold Weight @14Kt (g) *</label>
                        <input type="number" step="0.001" min="0" max={200} value={designForm.ref_weight} onChange={(e) => setDesignForm({ ...designForm, ref_weight: e.target.value })} className={inputCls} />
                    </div>
                    {isRingDesign && (
                        <div>
                            <label className={labelCls}>Entered Weight Is For Size</label>
                            <select value={designForm.ref_size} onChange={(e) => setDesignForm({ ...designForm, ref_size: e.target.value })} className={inputCls}>
                                {["6", "8", "10", "12", "14", "16", "18", "20"].map((s) => <option key={s} value={s}>{s === "12" ? "12 (default)" : s}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className={labelCls}>Round / Melle (Ct)</label>
                        <input type="number" step="0.01" min="0" max={50} value={designForm.melle} onChange={(e) => setDesignForm({ ...designForm, melle: e.target.value })} placeholder="blank = none" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Pointer / Solitaire (Ct)</label>
                        <input type="number" step="0.01" min="0" max={50} value={designForm.pointer} onChange={(e) => setDesignForm({ ...designForm, pointer: e.target.value })} placeholder="blank = none" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Fancy Cut (Ct)</label>
                        <input type="number" step="0.01" min="0" max={50} value={designForm.fancy} onChange={(e) => setDesignForm({ ...designForm, fancy: e.target.value })} placeholder="blank = none" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Color Stone (Ct)</label>
                        <input type="number" step="0.01" min="0" max={50} value={designForm.cstone} onChange={(e) => setDesignForm({ ...designForm, cstone: e.target.value })} placeholder="blank = none" className={inputCls} />
                    </div>
                </div>
                {isRingDesign && <p className="text-xs text-[#1A2536]/50 mt-3">References for all ring sizes will be calculated from this weight using the 3%-per-2-sizes formula.</p>}
            </div>
        </div>
    );

    const pieceFields = (
        <div className="space-y-6">
            <div>
                <p className={sectionCls}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B86B5A]"></span>
                    This Physical Piece (measured)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                        <label className={labelCls}>Karat</label>
                        <select value={productForm.karat} onChange={(e) => setProductForm({ ...productForm, karat: e.target.value })} className={inputCls}>
                            <option>14Kt</option><option>18Kt</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Gold Color</label>
                        <select value={productForm.gold_color} onChange={(e) => setProductForm({ ...productForm, gold_color: e.target.value })} className={inputCls}>
                            <option>Yellow</option><option>Rose</option><option>White</option>
                        </select>
                    </div>
                    {ringContext && (
                        <div>
                            <label className={labelCls}>Ring Size *</label>
                            <select value={productForm.ring_size} onChange={(e) => setProductForm({ ...productForm, ring_size: e.target.value })} className={inputCls}>
                                <option value="">Select size…</option>
                                {["6", "8", "10", "12", "14", "16", "18", "20"].map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className={labelCls}>Diamond Grade</label>
                        <select value={productForm.diamond_grade} onChange={(e) => setProductForm({ ...productForm, diamond_grade: e.target.value })} className={inputCls}>
                            {gradeBands.map((g) => <option key={g}>{g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Actual Net Weight (g)</label>
                        <input type="number" step="0.001" min="0" max={200} value={productForm.actual_net_weight} onChange={(e) => setProductForm({ ...productForm, actual_net_weight: e.target.value })} placeholder="blank = design ref" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Actual Melle (Ct)</label>
                        <input type="number" step="0.01" min="0" max={50} value={productForm.a_melle ?? ""} onChange={(e) => setProductForm({ ...productForm, a_melle: e.target.value })} placeholder="blank = design ref" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Actual Pointer (Ct)</label>
                        <input type="number" step="0.01" min="0" max={50} value={productForm.a_pointer ?? ""} onChange={(e) => setProductForm({ ...productForm, a_pointer: e.target.value })} placeholder="blank = design ref" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Actual Fancy (Ct)</label>
                        <input type="number" step="0.01" min="0" max={50} value={productForm.a_fancy ?? ""} onChange={(e) => setProductForm({ ...productForm, a_fancy: e.target.value })} placeholder="blank = design ref" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Actual Color Stone (Ct)</label>
                        <input type="number" step="0.01" min="0" max={50} value={productForm.a_cstone ?? ""} onChange={(e) => setProductForm({ ...productForm, a_cstone: e.target.value })} placeholder="blank = design ref" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Diamond Report Lab</label>
                        <select value={productForm.report_lab} onChange={(e) => setProductForm({ ...productForm, report_lab: e.target.value })} className={inputCls}>
                            <option>IGI</option><option>GIA</option><option>SGL</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Diamond Report Number</label>
                        <input value={productForm.report_number} onChange={(e) => setProductForm({ ...productForm, report_number: e.target.value })} maxLength={100} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Product Code (item_code)</label>
                        <input value={productForm.item_code} onChange={(e) => setProductForm({ ...productForm, item_code: e.target.value })} placeholder="blank = auto-generate" maxLength={100} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Hallmark Number</label>
                        <input value={productForm.hallmark_number} onChange={(e) => setProductForm({ ...productForm, hallmark_number: e.target.value })} maxLength={100} className={inputCls} />
                    </div>
                </div>
            </div>
            <div className="glass-card-vibrant rounded-2xl border border-[#B86B5A]/30 bg-gradient-to-br from-[#B86B5A]/5 to-transparent p-6 flex items-center justify-between">
                <p className="text-sm text-[#1A2536]/70">Estimated price (live rates, {productForm.diamond_grade})</p>
                <p className="text-3xl font-serif-luxury font-extrabold text-[#B86B5A]">{inr(liveEstimate())}</p>
            </div>
            <p className="text-xs text-[#1A2536]/50 leading-relaxed">
                Diamond total = melle + pointer + fancy. Entered weights are stored on this product and folded into the design's size references (running average) for better future estimates. Blank fields fall back to the design references.
            </p>
        </div>
    );

    const mediaStep = (
        <div className="space-y-4">
            <label className={labelCls}>Upload Images / Videos</label>
            <div className="border-2 border-dashed border-[#E5BDB0] rounded-2xl p-8 text-center">
                <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => setFiles([...files, ...Array.from(e.target.files)])}
                    className="hidden"
                    id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Choose Files
                </label>
                <p className="text-xs text-[#1A2536]/50 mt-3">Media is optional. Files upload after the record is created.</p>
            </div>
            {files.length > 0 && (
                <ul className="space-y-2">
                    {files.map((f, i) => (
                        <li key={i} className="flex items-center justify-between glass-card-vibrant rounded-xl border border-[#E5BDB0] px-4 py-3 text-sm">
                            <span className="text-[#1A2536]">
                                {f.name} <span className="text-[#1A2536]/50">({(f.size / 1024).toFixed(0)} KB)</span>
                            </span>
                            <button onClick={() => setFiles(files.filter((_, x) => x !== i))} className="text-red-500 hover:text-red-600 font-bold">✕</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    const isReviewStep = step === steps.length - 1;
    const isMediaStep = !isReviewStep && step === 2 && (mode === "design" || useNewDesign);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={() => router.push("/control/inventory")} className="text-xs text-[#B86B5A] font-bold uppercase tracking-wider hover:underline flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Inventory
            </button>

            {/* Header */}
            <div>
                <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">create new</span>
                <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">{mode === "design" ? "Add Design" : "Add Product"}</h1>
            </div>

            {/* Progress Steps */}
            <div className="flex flex-wrap items-center gap-2">
                {steps.map((s, i) => (
                    <button
                        key={s}
                        onClick={() => i < step && setStep(i)}
                        className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all ${i === step
                                ? "bg-[#1A2536] text-white shadow"
                                : i < step
                                    ? "bg-[#B86B5A] text-white"
                                    : "glass-card-vibrant border border-[#E5BDB0] text-[#1A2536]/50"
                            }`}
                    >
                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">{i + 1}</span>
                        {s}
                    </button>
                ))}
            </div>

            {/* Form Card */}
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
                {step === 0 && (mode === "design" ? designFields : (
                    <div className="space-y-6">
                        {!preselectedDesignId && (
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => { setUseNewDesign(false); }}
                                    className={`p-5 rounded-2xl border-2 text-sm font-semibold transition-all ${!useNewDesign
                                            ? "border-[#1A2536] bg-[#1A2536] text-white shadow-lg"
                                            : "border-[#E5BDB0] text-[#1A2536] hover:border-[#B86B5A]"
                                        }`}
                                >
                                    Existing Design
                                </button>
                                <button
                                    onClick={() => { setUseNewDesign(true); }}
                                    className={`p-5 rounded-2xl border-2 text-sm font-semibold transition-all ${useNewDesign
                                            ? "border-[#1A2536] bg-[#1A2536] text-white shadow-lg"
                                            : "border-[#E5BDB0] text-[#1A2536] hover:border-[#B86B5A]"
                                        }`}
                                >
                                    Create New Design
                                </button>
                            </div>
                        )}
                        {useNewDesign ? (
                            <div className="space-y-6">
                                {designFields}
                                {materialsFields}
                            </div>
                        ) : (
                            <div>
                                <label className={labelCls}>Select Design *</label>
                                <select value={existingDesignId} onChange={(e) => setExistingDesignId(e.target.value)} className={inputCls} disabled={!!preselectedDesignId}>
                                    <option value="">Choose a design…</option>
                                    {designs.map((d) => <option key={d.id} value={d.id}>{d.design_code} — {d.name}</option>)}
                                </select>
                                {preselectedDesignId && <p className="text-xs text-[#1A2536]/50 mt-1">Pre-selected from inventory view.</p>}
                            </div>
                        )}
                    </div>
                ))}

                {step === 1 && (mode === "design" ? materialsFields : pieceFields)}

                {isMediaStep && mediaStep}

                {isReviewStep && (
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <p className={labelCls}>Design</p>
                                {mode === "design" || useNewDesign ? (
                                    <>
                                        <p className="font-serif-luxury text-xl font-semibold text-[#1A2536]">{designForm.name}</p>
                                        <p className="text-[#1A2536]/60 text-xs mt-1">{selectedCategory?.label} · {designForm.design_code}</p>
                                        <p className="text-[#1A2536]/60 text-xs mt-1">
                                            {designForm.ref_weight}g @14Kt {isRingDesign && `(size ${designForm.ref_size})`} ·
                                            dia {sum3(designForm.melle, designForm.pointer, designForm.fancy).toFixed(2)} Ct
                                            {(parseFloat(designForm.cstone) || 0) > 0 && ` · stone ${parseFloat(designForm.cstone).toFixed(2)} Ct`}
                                        </p>
                                    </>
                                ) : (
                                    <p className="font-serif-luxury text-xl font-semibold text-[#1A2536]">
                                        {targetDesign?.name} <span className="text-sm text-[#1A2536]/50">({targetDesign?.design_code})</span>
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className={labelCls}>Summary</p>
                                {mode === "product" && (
                                    <p className="text-[#1A2536]/70 text-xs">
                                        {productForm.karat} {productForm.gold_color}
                                        {ringContext && productForm.ring_size && ` · Size ${productForm.ring_size}`} · {productForm.diamond_grade}
                                    </p>
                                )}
                                {mode === "product" && (
                                    <p className="text-[#1A2536]/70 text-xs mt-1">
                                        Measured: {productForm.actual_net_weight ? `${productForm.actual_net_weight}g` : "refs"} ·
                                        dia {sum3(productForm.a_melle, productForm.a_pointer, productForm.a_fancy) > 0
                                            ? sum3(productForm.a_melle, productForm.a_pointer, productForm.a_fancy).toFixed(2)
                                            : "refs"} Ct
                                    </p>
                                )}
                                {(mode === "design" || useNewDesign) && <p className="text-[#1A2536]/70 text-xs mt-1">Media files: {files.length}</p>}
                            </div>
                        </div>
                        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 font-semibold">{error}</p>}
                    </div>
                )}

                <div className="flex justify-between mt-10 pt-6 border-t border-[#E5BDB0]/40">
                    <button
                        onClick={() => setStep(Math.max(0, step - 1))}
                        disabled={step === 0}
                        className="px-6 py-3 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        ← Back
                    </button>
                    {step < steps.length - 1 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed()}
                            className="px-6 py-3 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Continue →
                        </button>
                    ) : (
                        <button
                            onClick={submit}
                            disabled={submitting}
                            className="px-6 py-3 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow disabled:opacity-50"
                        >
                            {submitting ? "Saving…" : mode === "design" ? "Create Design" : "Save Product"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}