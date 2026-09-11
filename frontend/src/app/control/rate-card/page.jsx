"use client";

import { useEffect, useState, useRef } from "react";
import controlApi from "@/api/controlClient";

const inr = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const inputCls = "w-full border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536] transition-colors";
const labelCls = "text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-2";

export default function RateCardPage() {
    const [rateCard, setRateCard] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [fetchOutput, setFetchOutput] = useState("");
    const formDirtyRef = useRef(false);
    const [form, setForm] = useState({ 
        gold_rate_14kt: "", 
        gold_rate_18kt: "", 
        making_fixed_per_gram: "", 
        making_pct_24kt: "", 
        gst_percentage: "", 
        default_grade: "" 
    });
    const [auto, setAuto] = useState({
        enabled: false,
        interval: "30",
        increment: "0.50",
        thresholdType: "percentage",
        thresholdPct: "0.50",
        thresholdAmt: "500"
    });
    const [bands, setBands] = useState([]);
    const [newBand, setNewBand] = useState({ name: "", rate: "" });
    const [lastRefreshed, setLastRefreshed] = useState(null);

    const markFormDirty = () => { formDirtyRef.current = true; };

    const load = async () => {
        try {
            const [{ data }, hist] = await Promise.all([
                controlApi.getRateCard(),
                controlApi.getRateHistory().catch(() => ({ data: [] }))
            ]);
            setRateCard(data);
            setHistory(hist.data || []);
            setLastRefreshed(new Date());
            if (!formDirtyRef.current) {
                setForm({
                    gold_rate_14kt: data.gold_rate_14kt.toString(),
                    gold_rate_18kt: data.gold_rate_18kt.toString(),
                    making_fixed_per_gram: data.making_fixed_per_gram?.toString() || "0",
                    making_pct_24kt: data.making_pct_24kt?.toString() || "0",
                    gst_percentage: data.gst_percentage.toString(),
                    default_grade: data.default_grade,
                });
                setAuto({
                    enabled: !!data.auto_fetch_enabled,
                    interval: String(data.auto_fetch_interval_minutes || 30),
                    increment: data.increment_percentage?.toString() ?? "0.50",
                    thresholdType: data.change_threshold_type || "percentage",
                    thresholdPct: data.change_threshold_percentage?.toString() ?? "0.50",
                    thresholdAmt: data.change_threshold_amount?.toString() ?? "500",
                });
                setBands(Object.entries(data.diamond_rates || {}).map(([name, rate]) => ({ name, rate: String(rate) })));
            }
        } catch (err) {
            console.error("Failed to load rate card:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const activeBands = bands.filter((b) => b.name && b.rate);

    const handleSaveClick = async () => {
        setSaving(true);
        try {
            const payload = {
                gold_rate_14kt: parseFloat(form.gold_rate_14kt),
                gold_rate_18kt: parseFloat(form.gold_rate_18kt),
                making_fixed_per_gram: parseFloat(form.making_fixed_per_gram) || 0,
                making_pct_24kt: parseFloat(form.making_pct_24kt) || 0,
                gst_percentage: parseFloat(form.gst_percentage),
                default_grade: form.default_grade,
                diamond_rates: Object.fromEntries(bands.filter((b) => b.name).map((b) => [b.name, parseFloat(b.rate) || 0])),
                auto_fetch_enabled: auto.enabled,
                auto_fetch_interval_minutes: parseInt(auto.interval) || 30,
                increment_percentage: parseFloat(auto.increment) || 0.50,
                change_threshold_type: auto.thresholdType,
                change_threshold_percentage: parseFloat(auto.thresholdPct) || 0.50,
                change_threshold_amount: parseFloat(auto.thresholdAmt) || 500,
            };
            await controlApi.updateRateCard(payload);
            formDirtyRef.current = false;
            alert("Rate card updated successfully!");
            await load();
        } catch (err) {
            alert("Failed to save: " + JSON.stringify(err.response?.data || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <p className="text-sm text-[#1A2536]/50">Loading rate card…</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">pricing configuration</span>
                    <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Rate Card</h1>
                </div>
                {lastRefreshed && (
                    <div className="glass-card-vibrant rounded-full px-5 py-2.5 border border-[#E5BDB0]">
                        <span className="text-xs text-[#1A2536]/60">Auto-refreshed: </span>
                        <span className="text-xs font-bold text-[#1A2536]">{lastRefreshed.toLocaleTimeString("en-IN")}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live Rates Card */}
                <form onChange={markFormDirty} className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8 space-y-6">
                    <div>
                        <span className="font-cursive text-2xl text-[#B86B5A] block -mb-1">current rates</span>
                        <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Live Rates</h2>
                    </div>

                    {/* Gold Rates */}
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#B86B5A] mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B86B5A]"></span>
                            Gold Rates
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Gold 14Kt (₹/g)</label>
                                <input type="number" step="1" min="0" max="500000" value={form.gold_rate_14kt} onChange={(e) => setForm({ ...form, gold_rate_14kt: e.target.value })} className={inputCls} required />
                            </div>
                            <div>
                                <label className={labelCls}>Gold 18Kt (₹/g)</label>
                                <input type="number" step="1" min="0" max="500000" value={form.gold_rate_18kt} onChange={(e) => setForm({ ...form, gold_rate_18kt: e.target.value })} className={inputCls} required />
                            </div>
                        </div>
                    </div>

                    {/* Making Charges */}
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#B86B5A] mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B86B5A]"></span>
                            Making Charges
                        </p>
                        <p className="text-xs text-[#1A2536]/50 mb-3">Total = Fixed amount + (% × 24Kt gold rate)</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/70 block mb-1">Fixed ₹/gram</label>
                                <input type="number" step="0.01" min="0" value={form.making_fixed_per_gram} onChange={(e) => setForm({ ...form, making_fixed_per_gram: e.target.value })} className={inputCls} placeholder="400" required />
                            </div>
                            <div>
                                <label className="text-[9px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/70 block mb-1">% of 24Kt</label>
                                <input type="number" step="0.01" min="0" max="100" value={form.making_pct_24kt} onChange={(e) => setForm({ ...form, making_pct_24kt: e.target.value })} className={inputCls} placeholder="4" required />
                            </div>
                        </div>
                    </div>

                    {/* GST */}
                    <div>
                        <label className={labelCls}>GST (%)</label>
                        <input type="number" step="0.01" min="0" max="100" value={form.gst_percentage} onChange={(e) => setForm({ ...form, gst_percentage: e.target.value })} className={inputCls} required />
                    </div>

                    {/* Diamond Bands */}
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#B86B5A] mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B86B5A]"></span>
                            Diamond Grade Bands (₹/carat)
                        </p>
                        <div className="space-y-3 mb-3">
                            {bands.map((b, i) => (
                                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                                    <input value={b.name} onChange={(e) => { const n = [...bands]; n[i].name = e.target.value; setBands(n); }} placeholder="Band (e.g., HI/SI)" className={inputCls} />
                                    <input type="number" value={b.rate} onChange={(e) => { const n = [...bands]; n[i].rate = e.target.value; setBands(n); }} placeholder="₹/ct (blank = ignored)" className={inputCls} />
                                    <button type="button" onClick={() => setBands(bands.filter((_, x) => x !== i))} className="w-9 h-9 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                            <input value={newBand.name} onChange={(e) => setNewBand({ ...newBand, name: e.target.value })} placeholder="Add custom band (e.g., EF/VVS)" className={inputCls} />
                            <input type="number" value={newBand.rate} onChange={(e) => setNewBand({ ...newBand, rate: e.target.value })} placeholder="₹/ct" className={inputCls} />
                            <button type="button" onClick={() => { if (newBand.name.trim()) { setBands([...bands, { ...newBand }]); setNewBand({ name: "", rate: "" }); } }} className="px-5 py-3 bg-[#B86B5A] hover:bg-[#A05A4A] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all">
                                + Add
                            </button>
                        </div>
                        <p className="text-xs text-[#1A2536]/50 mt-2">Bands with an empty rate are ignored. Custom bands become selectable when adding products.</p>
                    </div>

                    {/* Default Band */}
                    <div>
                        <label className={labelCls}>Default Band (for MTO & base prices)</label>
                        <select value={form.default_grade} onChange={(e) => setForm({ ...form, default_grade: e.target.value })} className={inputCls}>
                            {activeBands.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
                        </select>
                    </div>

                    <button type="button" onClick={handleSaveClick} disabled={saving} className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl disabled:opacity-50">
                        {saving ? "Saving…" : "Update Rate Card"}
                    </button>
                </form>

                {/* Auto-Fetch Settings Card */}
                <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8 space-y-6">
                    <div>
                        <span className="font-cursive text-2xl text-[#B86B5A] block -mb-1">automation</span>
                        <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Automatic Gold Rate Updates</h2>
                    </div>

                    <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer glass-card-vibrant rounded-xl border border-[#E5BDB0] px-4 py-3">
                        <input type="checkbox" checked={auto.enabled} onChange={(e) => setAuto({ ...auto, enabled: e.target.checked })} className="w-5 h-5 accent-[#B86B5A]" />
                        <div>
                            <span className="font-bold text-[#1A2536]">Enable auto-fetch</span>
                            <p className="text-xs text-[#1A2536]/60 mt-0.5">Active 6 AM – 11 PM IST</p>
                        </div>
                    </label>

                    <div>
                        <label className={labelCls}>Fetch Interval (minutes)</label>
                        <input type="number" step="1" min="1" max="1440" value={auto.interval} onChange={(e) => setAuto({ ...auto, interval: e.target.value })} className={inputCls} />
                        <p className="text-[10px] text-[#1A2536]/50 mt-1">Set to 1 for testing. Production: 30.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Markup After Rounding (%)</label>
                            <input type="number" step="0.01" min="0" max="10" value={auto.increment} onChange={(e) => setAuto({ ...auto, increment: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Update Threshold Type</label>
                            <select value={auto.thresholdType} onChange={(e) => setAuto({ ...auto, thresholdType: e.target.value })} className={inputCls}>
                                <option value="percentage">Percentage (%)</option>
                                <option value="amount">Amount (₹)</option>
                            </select>
                        </div>
                    </div>

                    {auto.thresholdType === "percentage" ? (
                        <div>
                            <label className={labelCls}>Change Threshold (%)</label>
                            <input type="number" step="0.01" min="0" max="10" value={auto.thresholdPct} onChange={(e) => setAuto({ ...auto, thresholdPct: e.target.value })} className={inputCls} />
                        </div>
                    ) : (
                        <div>
                            <label className={labelCls}>Change Threshold (₹ / 10g)</label>
                            <input type="number" step="1" min="0" max="10000" value={auto.thresholdAmt} onChange={(e) => setAuto({ ...auto, thresholdAmt: e.target.value })} className={inputCls} />
                        </div>
                    )}

                    <div className="glass-card-vibrant rounded-2xl border border-[#B86B5A]/30 bg-gradient-to-br from-[#B86B5A]/5 to-transparent p-5">
                        <p className="text-xs text-[#1A2536]/70 leading-relaxed">
                            <span className="font-bold text-[#1A2536]">Formula:</span> fetched 24Kt ₹/10g → round up to nearest 100 → add markup % → round up to nearest 100. Rates update only when the result differs from the current rate by at least the threshold.
                        </p>
                    </div>

                    <button type="button" onClick={handleSaveClick} disabled={saving} className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl disabled:opacity-50">
                        {saving ? "Saving…" : "Update Rate Card"}
                    </button>
                </div>
            </div>

            {/* Rate History */}
            {history.length > 0 && (
                <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
                    <div className="mb-5">
                        <span className="font-cursive text-2xl text-[#B86B5A] block -mb-1">audit trail</span>
                        <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Rate History (Last 30 Days)</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#1A2536]/[0.03] border-b border-[#E5BDB0]/40">
                                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Date</th>
                                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Raw 24Kt</th>
                                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Calculated</th>
                                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Previous</th>
                                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Applied</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.slice(0, 20).map((h) => (
                                    <tr key={h.id} className="border-b border-[#E5BDB0]/20 last:border-0 hover:bg-[#1A2536]/[0.02] transition-colors">
                                        <td className="px-4 py-3 text-xs text-[#1A2536]/70">{new Date(h.fetched_at).toLocaleString("en-IN")}</td>
                                        <td className="px-4 py-3 text-xs font-mono text-[#1A2536]">{h.raw_24kt_rate || "—"}</td>
                                        <td className="px-4 py-3 text-xs font-mono font-bold text-[#1A2536]">{h.calculated_rate || "—"}</td>
                                        <td className="px-4 py-3 text-xs font-mono text-[#1A2536]/70">{h.previous_rate || "—"}</td>
                                        <td className="px-4 py-3">
                                            {h.rate_applied ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Applied
                                                </span>
                                            ) : (
                                                <span className="text-xs text-[#1A2536]/40">Skipped</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}