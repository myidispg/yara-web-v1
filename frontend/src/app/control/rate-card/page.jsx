"use client";

import { useEffect, useState } from "react";
import controlApi from "@/api/controlClient";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function RateCardPage() {
    const [rateCard, setRateCard] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [fetchOutput, setFetchOutput] = useState("");
    const [form, setForm] = useState({ gold_rate_14kt: "", gold_rate_18kt: "", making: "", gst: "", default_grade: "" });
    const [auto, setAuto] = useState({ enabled: false, increment: "0.50", thresholdType: "percentage", thresholdPct: "0.50", thresholdAmt: "500" });
    const [bands, setBands] = useState([]);
    const [newBand, setNewBand] = useState({ name: "", rate: "" });

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const [{ data }, hist] = await Promise.all([controlApi.getRateCard(), controlApi.getRateHistory().catch(() => ({ data: [] }))]);
            setRateCard(data);
            setHistory(hist.data || []);
            setForm({
                gold_rate_14kt: data.gold_rate_14kt.toString(),
                gold_rate_18kt: data.gold_rate_18kt.toString(),
                making: data.making_charges_percentage.toString(),
                gst: data.gst_percentage.toString(),
                default_grade: data.default_grade,
            });
            setAuto({
                enabled: !!data.auto_fetch_enabled,
                increment: data.increment_percentage?.toString() ?? "0.50",
                thresholdType: data.change_threshold_type || "percentage",
                thresholdPct: data.change_threshold_percentage?.toString() ?? "0.50",
                thresholdAmt: data.change_threshold_amount?.toString() ?? "500",
            });
            setBands(Object.entries(data.diamond_rates || {}).map(([name, rate]) => ({ name, rate: String(rate) })));
        } catch (err) {
            console.error("Failed to load rate card:", err);
        } finally {
            setLoading(false);
        }
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const diamond_rates = {};
            bands.forEach((b) => {
                if (b.name.trim() && b.rate) diamond_rates[b.name.trim()] = parseFloat(b.rate);
            });
            const payload = {
                gold_rate_14kt: parseFloat(form.gold_rate_14kt),
                gold_rate_18kt: parseFloat(form.gold_rate_18kt),
                making_charges_percentage: parseFloat(form.making),
                gst_percentage: parseFloat(form.gst),
                diamond_rates,
                default_grade: form.default_grade,
                auto_fetch_enabled: auto.enabled,
                increment_percentage: parseFloat(auto.increment),
                change_threshold_type: auto.thresholdType,
                change_threshold_percentage: parseFloat(auto.thresholdPct),
                change_threshold_amount: parseFloat(auto.thresholdAmt),
            };
            const { data } = await controlApi.updateRateCard(payload);
            setRateCard(data);
            alert("Rate card updated successfully!");
        } catch (err) {
            alert("Failed to update: " + JSON.stringify(err.response?.data || err.message));
        } finally {
            setSaving(false);
        }
    };

    const fetchNow = async () => {
        setFetching(true);
        setFetchOutput("");
        try {
            const { data } = await controlApi.fetchRatesNow();
            setFetchOutput(data.output || "Done.");
            await load();
        } catch (err) {
            setFetchOutput("Failed: " + (err.response?.data?.error || err.message));
        } finally {
            setFetching(false);
        }
    };

    if (loading) return <div className="text-center py-12">Loading rate card...</div>;

    const activeBands = bands.filter((b) => b.name.trim() && b.rate);
    const lastFetch = history.find((h) => h.fetch_successful);
    const lastApplied = history.find((h) => h.rate_applied);

    return (
        <div>
            <h1 className="font-serif text-4xl mb-8">Rate Card</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form onSubmit={save} className="bg-white rounded-xl border border-line p-8 shadow-card space-y-6 min-w-0">
                    <h2 className="font-serif text-2xl">Live Rates</h2>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Gold 14Kt (₹/g)</label>
                            <input type="number" step="1" min="0" max="500000" value={form.gold_rate_14kt} onChange={(e) => setForm({ ...form, gold_rate_14kt: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3" required />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Gold 18Kt (₹/g)</label>
                            <input type="number" step="1" min="0" max="500000" value={form.gold_rate_18kt} onChange={(e) => setForm({ ...form, gold_rate_18kt: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3" required />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Making Charges (%)</label>
                            <input type="number" step="0.01" min="0" max="100" value={form.making} onChange={(e) => setForm({ ...form, making: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3" required />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">GST (%)</label>
                            <input type="number" step="0.01" min="0" max="100" value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3" required />
                        </div>
                    </div>

                    <div>
                        <h3 className="font-serif text-xl mb-3">Diamond Grade Bands (₹/carat)</h3>
                        <div className="space-y-3">
                            {bands.map((b, i) => (
                                <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 items-center">
                                    <input value={b.name} onChange={(e) => { const n = [...bands]; n[i].name = e.target.value; setBands(n); }} placeholder="Band (e.g., HI/SI)" className="w-full min-w-0 border border-line rounded-lg px-4 py-2 text-sm" />
                                    <input type="number" value={b.rate} onChange={(e) => { const n = [...bands]; n[i].rate = e.target.value; setBands(n); }} placeholder="₹/ct (blank = ignored)" className="w-full min-w-0 border border-line rounded-lg px-4 py-2 text-sm" />
                                    <button type="button" onClick={() => setBands(bands.filter((_, x) => x !== i))} className="text-red-500 text-sm">✕</button>
                                </div>
                            ))}
                            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 items-center">
                                <input value={newBand.name} onChange={(e) => setNewBand({ ...newBand, name: e.target.value })} placeholder="Add custom band (e.g., EF/VVS)" className="w-full min-w-0 border border-line rounded-lg px-4 py-2 text-sm" />
                                <input type="number" value={newBand.rate} onChange={(e) => setNewBand({ ...newBand, rate: e.target.value })} placeholder="₹/ct" className="w-full min-w-0 border border-line rounded-lg px-4 py-2 text-sm" />
                                <button type="button" onClick={() => { if (newBand.name.trim()) { setBands([...bands, { ...newBand }]); setNewBand({ name: "", rate: "" }); } }} className="btn-outline text-xs">+ Add</button>
                            </div>
                        </div>
                        <p className="text-xs text-ink/50 mt-2">Bands with an empty rate are ignored. Custom bands become selectable when adding products.</p>
                    </div>

                    <div>
                        <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Default Band (for MTO & base prices)</label>
                        <select value={form.default_grade} onChange={(e) => setForm({ ...form, default_grade: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3">
                            {activeBands.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
                        </select>
                    </div>

                    <div className="border-t border-line pt-6">
                        <h3 className="font-serif text-xl mb-4">Automatic Gold Rate Updates</h3>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer">
                                <input type="checkbox" checked={auto.enabled} onChange={(e) => setAuto({ ...auto, enabled: e.target.checked })} className="w-4 h-4" />
                                Enable auto-fetch (6 AM – 11 PM IST, every 30 min)
                            </label>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Markup After Rounding (%)</label>
                                    <input type="number" step="0.01" min="0" max="10" value={auto.increment} onChange={(e) => setAuto({ ...auto, increment: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Update Threshold Type</label>
                                    <select value={auto.thresholdType} onChange={(e) => setAuto({ ...auto, thresholdType: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3">
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="amount">Amount (₹)</option>
                                    </select>
                                </div>
                                {auto.thresholdType === "percentage" ? (
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Change Threshold (%)</label>
                                        <input type="number" step="0.01" min="0" max="10" value={auto.thresholdPct} onChange={(e) => setAuto({ ...auto, thresholdPct: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3" />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Change Threshold (₹ / 10g)</label>
                                        <input type="number" step="1" min="0" max="10000" value={auto.thresholdAmt} onChange={(e) => setAuto({ ...auto, thresholdAmt: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3" />
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-ink/50">
                                Formula: fetched 24Kt ₹/10g → round up to nearest 100 → add markup % → round up to nearest 100. Rates update only when the result differs from the current rate by at least the threshold. Manual rate setting above always remains available.
                            </p>
                        </div>
                    </div>

                    <button type="submit" disabled={saving} className="btn-solid w-full">{saving ? "Saving..." : "Update Rate Card"}</button>
                </form>

                <div className="space-y-6 min-w-0">
                    <div className="bg-white rounded-xl border border-line p-8 shadow-card">
                        <h2 className="font-serif text-2xl mb-4 text-ink">Last Updated</h2>
                        <p className="text-ink/70 font-medium">
                            {rateCard?.updated_at ? new Date(rateCard.updated_at).toLocaleString("en-IN") : "Never"}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-line p-8 shadow-card">
                        <h3 className="font-serif text-xl mb-4">Auto-Fetch Status</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-ink/60">Status</span>
                                <span className={`font-semibold ${auto.enabled ? "text-green-600" : "text-ink/50"}`}>{auto.enabled ? "Enabled" : "Disabled"}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-ink/60">Last successful fetch</span>
                                <span className="font-semibold text-right">{lastFetch ? new Date(lastFetch.fetched_at).toLocaleString("en-IN") : "—"}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-ink/60">Last rate auto-update</span>
                                <span className="font-semibold text-right">{lastApplied ? new Date(lastApplied.fetched_at).toLocaleString("en-IN") : "—"}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-ink/60">Last scheduler check</span>
                                <span className="font-semibold text-right">
                                    {rateCard?.last_auto_run_at ? new Date(rateCard.last_auto_run_at).toLocaleString("en-IN") : "—"}
                                </span>
                            </div>
                            <button type="button" onClick={fetchNow} disabled={fetching} className="btn-outline w-full mt-4">
                                {fetching ? "Fetching…" : "Fetch Rates Now"}
                            </button>
                            {fetchOutput && <p className="text-xs text-ink/60 mt-2 whitespace-pre-wrap">{fetchOutput}</p>}
                        </div>
                    </div>

                    <div className="bg-cream rounded-xl p-8">
                        <h3 className="font-serif text-xl mb-4">Impact Notice</h3>
                        <p className="text-sm text-ink/70 leading-relaxed">
                            Updating rates recalculates prices for newly created products and Made-to-Order quotes.
                            Existing in-stock products keep their locked-in prices.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-line p-8 shadow-card">
                        <h3 className="font-serif text-xl mb-4">Quick Stats</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-ink/60">18Kt vs 14Kt Premium</span>
                                <span className="font-semibold">{((parseFloat(form.gold_rate_18kt) / parseFloat(form.gold_rate_14kt) - 1) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink/60">Active Grade Bands</span>
                                <span className="font-semibold">{activeBands.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink/60">Default Band</span>
                                <span className="font-semibold">{form.default_grade}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-line shadow-card overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-line bg-cream">
                    <h3 className="font-semibold">Gold Rate Fetch History (last 30 days)</h3>
                </div>
                <table className="w-full">
                    <thead className="bg-cream/50">
                        <tr>
                            <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Time</th>
                            <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Raw 24Kt (₹/10g)</th>
                            <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Calculated</th>
                            <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Previous</th>
                            <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Applied</th>
                            <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-ink/50">No fetches recorded yet.</td></tr>
                        ) : history.map((h) => (
                            <tr key={h.id} className="border-b border-line hover:bg-cream/30">
                                <td className="px-6 py-3 text-sm">{new Date(h.fetched_at).toLocaleString("en-IN")}</td>
                                <td className="px-6 py-3 text-sm">{h.raw_24kt_rate ?? "—"}</td>
                                <td className="px-6 py-3 text-sm">{h.calculated_rate ?? "—"}</td>
                                <td className="px-6 py-3 text-sm">{h.previous_rate ?? "—"}</td>
                                <td className="px-6 py-3 text-sm">{h.rate_applied ? "✅" : "—"}</td>
                                <td className="px-6 py-3 text-sm">
                                    {h.fetch_successful ? (
                                        <span className="text-green-600 font-semibold">OK</span>
                                    ) : (
                                        <span className="text-red-600 font-semibold" title={h.error_message}>Failed</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}