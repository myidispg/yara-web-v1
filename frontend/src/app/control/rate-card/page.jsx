"use client";

import { useEffect, useState } from "react";
import controlApi from "@/api/controlClient";

export default function RateCardPage() {
    const [rateCard, setRateCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ gold_rate_14kt: "", gold_rate_18kt: "", making: "", gst: "", default_grade: "" });
    const [bands, setBands] = useState([]); // [{name, rate}]
    const [newBand, setNewBand] = useState({ name: "", rate: "" });

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const { data } = await controlApi.getRateCard();
            setRateCard(data);
            setForm({
                gold_rate_14kt: data.gold_rate_14kt.toString(),
                gold_rate_18kt: data.gold_rate_18kt.toString(),
                making: data.making_charges_percentage.toString(),
                gst: data.gst_percentage.toString(),
                default_grade: data.default_grade,
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

    if (loading) return <div className="text-center py-12">Loading rate card...</div>;

    const activeBands = bands.filter((b) => b.name.trim() && b.rate);

    return (
        <div>
            <h1 className="font-serif text-4xl mb-8">Rate Card</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form onSubmit={save} className="bg-white rounded-xl border border-line p-8 shadow-card space-y-6">
                    <h2 className="font-serif text-2xl">Live Rates</h2>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Gold 14Kt (₹/g)</label>
                            <input type="number" step="0.01" value={form.gold_rate_14kt} onChange={(e) => setForm({ ...form, gold_rate_14kt: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3" required />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Gold 18Kt (₹/g)</label>
                            <input type="number" step="0.01" value={form.gold_rate_18kt} onChange={(e) => setForm({ ...form, gold_rate_18kt: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3" required />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Making Charges (%)</label>
                            <input type="number" step="0.01" value={form.making} onChange={(e) => setForm({ ...form, making: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3" required />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">GST (%)</label>
                            <input type="number" step="0.01" value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} className="w-full border border-line rounded-lg px-4 py-3" required />
                        </div>
                    </div>

                    <div>
                        <h3 className="font-serif text-xl mb-3">Diamond Grade Bands (₹/carat)</h3>
                        <div className="space-y-3">
                            {bands.map((b, i) => (
                                <div key={i} className="flex gap-3 items-center">
                                    <input value={b.name} onChange={(e) => { const n = [...bands]; n[i].name = e.target.value; setBands(n); }} placeholder="Band (e.g., HI/SI)" className="flex-1 border border-line rounded-lg px-4 py-2 text-sm" />
                                    <input type="number" value={b.rate} onChange={(e) => { const n = [...bands]; n[i].rate = e.target.value; setBands(n); }} placeholder="₹/ct (blank = ignored)" className="flex-1 border border-line rounded-lg px-4 py-2 text-sm" />
                                    <button type="button" onClick={() => setBands(bands.filter((_, x) => x !== i))} className="text-red-500 text-sm">✕</button>
                                </div>
                            ))}
                            <div className="flex gap-3 items-center">
                                <input value={newBand.name} onChange={(e) => setNewBand({ ...newBand, name: e.target.value })} placeholder="Add custom band (e.g., EF/VVS)" className="flex-1 border border-line rounded-lg px-4 py-2 text-sm" />
                                <input type="number" value={newBand.rate} onChange={(e) => setNewBand({ ...newBand, rate: e.target.value })} placeholder="₹/ct" className="flex-1 border border-line rounded-lg px-4 py-2 text-sm" />
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

                    <button type="submit" disabled={saving} className="btn-solid w-full">{saving ? "Saving..." : "Update Rate Card"}</button>
                </form>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-line p-8 shadow-card">
                        <h2 className="font-serif text-2xl mb-4 text-ink">Last Updated</h2>
                        <p className="text-ink/70 font-medium">
                            {rateCard?.updated_at ? new Date(rateCard.updated_at).toLocaleString("en-IN") : "Never"}
                        </p>
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
        </div>
    );
}