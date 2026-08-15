"use client";

import { useEffect, useState } from "react";
import controlApi from "@/api/controlClient";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function RateCardPage() {
    const [rateCard, setRateCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        gold_rate_14kt: "",
        gold_rate_18kt: "",
        diamond_rate_per_carat: "",
        making_charges_percentage: "",
        gst_percentage: "",
    });

    useEffect(() => {
        loadRateCard();
    }, []);

    const loadRateCard = async () => {
        try {
            const { data } = await controlApi.getRateCard();
            setRateCard(data);
            setForm({
                gold_rate_14kt: data.gold_rate_14kt.toString(),
                gold_rate_18kt: data.gold_rate_18kt.toString(),
                diamond_rate_per_carat: data.diamond_rate_per_carat.toString(),
                making_charges_percentage: data.making_charges_percentage.toString(),
                gst_percentage: data.gst_percentage.toString(),
            });
        } catch (err) {
            console.error("Failed to load rate card:", err);
        } finally {
            setLoading(false);
        }
    };

    const saveRateCard = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const payload = {
                gold_rate_14kt: parseFloat(form.gold_rate_14kt),
                gold_rate_18kt: parseFloat(form.gold_rate_18kt),
                diamond_rate_per_carat: parseFloat(form.diamond_rate_per_carat),
                making_charges_percentage: parseFloat(form.making_charges_percentage),
                gst_percentage: parseFloat(form.gst_percentage),
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

    return (
        <div>
            <h1 className="font-serif text-4xl mb-8">Rate Card</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-line p-8 shadow-card">
                    <h2 className="font-serif text-2xl mb-6">Current Rates</h2>
                    
                    <form onSubmit={saveRateCard} className="space-y-6">
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">
                                Gold Rate 14Kt (₹/gram)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.gold_rate_14kt}
                                onChange={(e) => setForm({ ...form, gold_rate_14kt: e.target.value })}
                                className="w-full border border-line rounded-lg px-4 py-3 text-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">
                                Gold Rate 18Kt (₹/gram)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.gold_rate_18kt}
                                onChange={(e) => setForm({ ...form, gold_rate_18kt: e.target.value })}
                                className="w-full border border-line rounded-lg px-4 py-3 text-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">
                                Diamond Rate (₹/carat)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.diamond_rate_per_carat}
                                onChange={(e) => setForm({ ...form, diamond_rate_per_carat: e.target.value })}
                                className="w-full border border-line rounded-lg px-4 py-3 text-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">
                                Making Charges (%)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.making_charges_percentage}
                                onChange={(e) => setForm({ ...form, making_charges_percentage: e.target.value })}
                                className="w-full border border-line rounded-lg px-4 py-3 text-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">
                                GST (%)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.gst_percentage}
                                onChange={(e) => setForm({ ...form, gst_percentage: e.target.value })}
                                className="w-full border border-line rounded-lg px-4 py-3 text-lg"
                                required
                            />
                        </div>

                        <button type="submit" disabled={saving} className="btn-solid w-full">
                            {saving ? "Saving..." : "Update Rate Card"}
                        </button>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="bg-ink rounded-xl p-8 text-white">
                        <h2 className="font-serif text-2xl mb-4">Last Updated</h2>
                        <p className="text-white/80">
                            {rateCard?.updated_at 
                                ? new Date(rateCard.updated_at).toLocaleString("en-IN")
                                : "Never"}
                        </p>
                    </div>

                    <div className="bg-cream rounded-xl p-8">
                        <h3 className="font-serif text-xl mb-4">Impact Notice</h3>
                        <p className="text-sm text-ink/70 leading-relaxed">
                            Updating these rates will automatically recalculate prices for all 
                            Made-to-Order products based on their blueprint weights. In-stock 
                            items will retain their locked-in prices.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-line p-8">
                        <h3 className="font-serif text-xl mb-4">Quick Stats</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-ink/60">18Kt vs 14Kt Premium</span>
                                <span className="font-semibold">
                                    {rateCard && ((parseFloat(rateCard.gold_rate_18kt) / parseFloat(rateCard.gold_rate_14kt) - 1) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink/60">Total Markup</span>
                                <span className="font-semibold">
                                    {rateCard && (parseFloat(rateCard.making_charges_percentage) + parseFloat(rateCard.gst_percentage)).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}