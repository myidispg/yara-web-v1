"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import controlApi from "@/api/controlClient";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const RING_SLUGS = ["rings", "solitaires", "color-stone"];
const DIAMOND_COLORS = ["EF", "GH", "IJ"];
const DIAMOND_CLARITIES = ["VVS", "VS", "SI"];

const emptyInstance = () => ({
    karat: "18Kt", gold_color: "Yellow", ring_size: "",
    actual_net_weight: "", actual_diamond_weight: "", actual_color_stone_weight: "",
    report_lab: "IGI", report_number: "",
});

const STEPS = ["Basics", "Materials", "Media", "Instances", "Review"];

export default function NewDesignPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [categories, setCategories] = useState([]);
    const [rateCard, setRateCard] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        category: "", name: "", design_code: "", description: "",
        base_net_weight_14kt: "", diamond_weight_round_melle: "0",
        pointer_solitaire_weight: "0", fancy_cut_weight: "0", color_stone_weight: "0",
        diamond_color: "EF", diamond_clarity: "VVS",
    });
    const [media, setMedia] = useState([{ url: "", kind: "image" }]);
    const [instances, setInstances] = useState([emptyInstance()]);

    useEffect(() => {
        (async () => {
            try {
                const [cats, rc] = await Promise.all([controlApi.getCategories(), controlApi.getRateCard()]);
                setCategories(cats.data.results || cats.data);
                setRateCard(rc.data);
            } catch (e) { console.error(e); }
        })();
    }, []);

    const selectedCategory = categories.find((c) => String(c.id) === String(form.category));
    const isRing = RING_SLUGS.includes(selectedCategory?.slug);

    const estimatePrice = (netG, diaCt, karat) => {
        if (!rateCard || !netG) return 0;
        const goldRate = karat === "18Kt" ? Number(rateCard.gold_rate_18kt) : Number(rateCard.gold_rate_14kt);
        const goldValue = Number(netG) * goldRate;
        const diaValue = Number(diaCt || 0) * Number(rateCard.diamond_rate_per_carat);
        const making = (goldValue + diaValue) * (Number(rateCard.making_charges_percentage) / 100);
        const gst = (goldValue + diaValue + making) * (Number(rateCard.gst_percentage) / 100);
        return Math.round(goldValue + diaValue + making + gst);
    };

    const totalDia = () =>
        (parseFloat(form.diamond_weight_round_melle) || 0) +
        (parseFloat(form.pointer_solitaire_weight) || 0) +
        (parseFloat(form.fancy_cut_weight) || 0);

    const validMedia = media.filter((m) => m.url.trim() !== "");
    const baseEstimate = estimatePrice(form.base_net_weight_14kt, totalDia(), "14Kt");

    const canProceed = () => {
        if (step === 0) return form.category && form.name.trim() && form.design_code.trim();
        if (step === 1) return parseFloat(form.base_net_weight_14kt) > 0;
        return true;
    };

    const submit = async () => {
        setSubmitting(true);
        setError("");
        try {
            const payload = {
                name: form.name.trim(),
                design_code: form.design_code.trim(),
                category: Number(form.category),
                description: form.description,
                base_net_weight_14kt: parseFloat(form.base_net_weight_14kt),
                diamond_weight_round_melle: parseFloat(form.diamond_weight_round_melle) || 0,
                pointer_solitaire_weight: parseFloat(form.pointer_solitaire_weight) || 0,
                fancy_cut_weight: parseFloat(form.fancy_cut_weight) || 0,
                color_stone_weight: parseFloat(form.color_stone_weight) || 0,
                diamond_color: form.diamond_color,
                diamond_clarity: form.diamond_clarity,
                media: validMedia,
                instances: instances.map((i) => ({
                    karat: i.karat,
                    gold_color: i.gold_color,
                    ring_size: isRing ? (i.ring_size || null) : null,
                    actual_net_weight: i.actual_net_weight ? parseFloat(i.actual_net_weight) : null,
                    actual_diamond_weight: i.actual_diamond_weight ? parseFloat(i.actual_diamond_weight) : null,
                    actual_color_stone_weight: i.actual_color_stone_weight ? parseFloat(i.actual_color_stone_weight) : 0,
                    report_lab: i.report_lab,
                    report_number: i.report_number,
                })),
            };
            await controlApi.createDesign(payload);
            router.push("/control/inventory");
        } catch (err) {
            setError(JSON.stringify(err.response?.data || err.message));
            setSubmitting(false);
        }
    };

    const inputCls = "w-full border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold-dark";
    const labelCls = "text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2";

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => router.push("/control/inventory")} className="mb-6 text-sm text-gold-dark hover:text-ink">
                ← Back to Inventory
            </button>
            <h1 className="font-serif text-4xl mb-8">Create New Design</h1>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-10">
                {STEPS.map((s, i) => (
                    <button
                        key={s}
                        onClick={() => i < step && setStep(i)}
                        className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] px-4 py-2 rounded-full transition-colors ${i === step ? "bg-ink text-white" : i < step ? "bg-gold-dark text-white" : "bg-cream text-ink/50"
                            }`}
                    >
                        <span>{i + 1}</span> {s}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-line p-8 shadow-card">
                {step === 0 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className={labelCls}>Category *</label>
                                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                                    <option value="">Select category…</option>
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Design Code *</label>
                                <input value={form.design_code} onChange={(e) => setForm({ ...form, design_code: e.target.value })} placeholder="e.g., RG-031 (required)" className={inputCls} />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Design Name *</label>
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Aura Diamond Ring" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Description</label>
                            <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className={labelCls}>Net Gold Weight @14Kt (g) *</label>
                                <input type="number" step="0.001" value={form.base_net_weight_14kt} onChange={(e) => setForm({ ...form, base_net_weight_14kt: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Round / Melle Diamond (Ct)</label>
                                <input type="number" step="0.01" value={form.diamond_weight_round_melle} onChange={(e) => setForm({ ...form, diamond_weight_round_melle: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Pointer / Solitaire (Ct)</label>
                                <input type="number" step="0.01" value={form.pointer_solitaire_weight} onChange={(e) => setForm({ ...form, pointer_solitaire_weight: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Fancy Cut (Ct)</label>
                                <input type="number" step="0.01" value={form.fancy_cut_weight} onChange={(e) => setForm({ ...form, fancy_cut_weight: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Color Stone (Ct)</label>
                                <input type="number" step="0.01" value={form.color_stone_weight} onChange={(e) => setForm({ ...form, color_stone_weight: e.target.value })} className={inputCls} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Diamond Color</label>
                                    <select value={form.diamond_color} onChange={(e) => setForm({ ...form, diamond_color: e.target.value })} className={inputCls}>
                                        {DIAMOND_COLORS.map((c) => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Clarity</label>
                                    <select value={form.diamond_clarity} onChange={(e) => setForm({ ...form, diamond_clarity: e.target.value })} className={inputCls}>
                                        {DIAMOND_CLARITIES.map((c) => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="bg-cream rounded-xl p-6 flex items-center justify-between">
                            <p className="text-sm text-ink/60">Estimated base price (14Kt, live rates)</p>
                            <p className="text-2xl font-serif">{inr(baseEstimate)}</p>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        {media.map((m, i) => (
                            <div key={i} className="flex gap-3 items-center">
                                <input value={m.url} onChange={(e) => {
                                    const next = [...media]; next[i].url = e.target.value; setMedia(next);
                                }} placeholder="https://… image or video URL" className={inputCls} />
                                <select value={m.kind} onChange={(e) => {
                                    const next = [...media]; next[i].kind = e.target.value; setMedia(next);
                                }} className="border border-line rounded-lg px-3 py-3 text-sm">
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                </select>
                                <button onClick={() => setMedia(media.filter((_, x) => x !== i))} className="text-red-500 text-sm shrink-0">✕</button>
                            </div>
                        ))}
                        <button onClick={() => setMedia([...media, { url: "", kind: "image" }])} className="btn-outline">+ Add Media URL</button>
                        <p className="text-xs text-ink/50">Media is optional — you can add photos later. Order on screen = display order.</p>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <p className="text-sm text-ink/60">
                            Add the physical pieces you received from the workshop. Leave empty to sell this design as Made-to-Order only.
                        </p>
                        {instances.map((inst, i) => (
                            <div key={i} className="border border-line rounded-xl p-5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm">Instance {i + 1}</p>
                                    <button onClick={() => setInstances(instances.filter((_, x) => x !== i))} className="text-red-500 text-sm">Remove</button>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelCls}>Karat</label>
                                        <select value={inst.karat} onChange={(e) => { const n = [...instances]; n[i].karat = e.target.value; setInstances(n); }} className={inputCls}>
                                            <option>14Kt</option><option>18Kt</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Gold Color</label>
                                        <select value={inst.gold_color} onChange={(e) => { const n = [...instances]; n[i].gold_color = e.target.value; setInstances(n); }} className={inputCls}>
                                            <option>Yellow</option><option>Rose</option><option>White</option>
                                        </select>
                                    </div>
                                    {isRing && (
                                        <div>
                                            <label className={labelCls}>Ring Size</label>
                                            <input value={inst.ring_size} onChange={(e) => { const n = [...instances]; n[i].ring_size = e.target.value; setInstances(n); }} placeholder="e.g., 12" className={inputCls} />
                                        </div>
                                    )}
                                    <div>
                                        <label className={labelCls}>Net Weight (g)</label>
                                        <input type="number" step="0.001" value={inst.actual_net_weight} onChange={(e) => { const n = [...instances]; n[i].actual_net_weight = e.target.value; setInstances(n); }} placeholder={form.base_net_weight_14kt || "0.000"} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Diamond (Ct)</label>
                                        <input type="number" step="0.01" value={inst.actual_diamond_weight} onChange={(e) => { const n = [...instances]; n[i].actual_diamond_weight = e.target.value; setInstances(n); }} placeholder={totalDia().toFixed(2)} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Cert Lab / No.</label>
                                        <div className="flex gap-2">
                                            <select value={inst.report_lab} onChange={(e) => { const n = [...instances]; n[i].report_lab = e.target.value; setInstances(n); }} className={inputCls}>
                                                <option>IGI</option><option>GIA</option><option>SGL</option>
                                            </select>
                                            <input value={inst.report_number} onChange={(e) => { const n = [...instances]; n[i].report_number = e.target.value; setInstances(n); }} placeholder="Cert #" className={inputCls} />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-ink/50">
                                    Estimated price: <span className="font-semibold text-ink">{inr(estimatePrice(inst.actual_net_weight || form.base_net_weight_14kt, inst.actual_diamond_weight || totalDia(), inst.karat))}</span>
                                </p>
                            </div>
                        ))}
                        <button onClick={() => setInstances([...instances, emptyInstance()])} className="btn-outline">+ Add Instance</button>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className={labelCls}>Design</p>
                                <p className="font-serif text-xl">{form.name}</p>
                                <p className="text-ink/60">{selectedCategory?.name} · {form.design_code || "(auto code)"}</p>
                                <p className="text-ink/60">{form.diamond_color}-{form.diamond_clarity} · {totalDia().toFixed(2)} Ct · {form.base_net_weight_14kt}g @14Kt</p>
                            </div>
                            <div>
                                <p className={labelCls}>Summary</p>
                                <p className="text-ink/70">Media: {validMedia.length} item(s)</p>
                                <p className="text-ink/70">Physical instances: {instances.length}</p>
                                <p className="text-ink/70">Est. base price: <span className="font-semibold text-ink">{inr(baseEstimate)}</span></p>
                            </div>
                        </div>
                        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}
                    </div>
                )}

                {/* Nav buttons */}
                <div className="flex justify-between mt-10 pt-6 border-t border-line">
                    <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="btn-outline disabled:opacity-40">
                        ← Back
                    </button>
                    {step < STEPS.length - 1 ? (
                        <button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="btn-solid disabled:opacity-40">
                            Continue →
                        </button>
                    ) : (
                        <button onClick={submit} disabled={submitting} className="btn-solid">
                            {submitting ? "Creating…" : "Create Design"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}