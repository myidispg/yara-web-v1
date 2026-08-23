"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import controlApi from "@/api/controlClient";

export default function SearchAnalyticsPage() {
    const [data, setData] = useState(null);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "Search Insights | Control Panel";
    }, []);

    useEffect(() => { load(); }, [days]);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await controlApi.getSearchAnalytics(days);
            setData(data);
        } catch (e) {
            console.error("Failed to load search analytics:", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) return <div className="text-center py-12">Loading search insights…</div>;

    const zeroRate = data.total_searches ? Math.round((data.zero_result_searches / data.total_searches) * 100) : 0;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-serif text-4xl">Search Insights</h1>
                <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="border border-line rounded-lg px-4 py-2 text-sm bg-white">
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                    <p className="text-xs uppercase tracking-[0.16em] font-semibold text-ink/60 mb-1">Total Searches</p>
                    <p className="text-3xl font-semibold">{data.total_searches}</p>
                </div>
                <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                    <p className="text-xs uppercase tracking-[0.16em] font-semibold text-ink/60 mb-1">Unique Terms</p>
                    <p className="text-3xl font-semibold">{data.unique_terms}</p>
                </div>
                <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                    <p className="text-xs uppercase tracking-[0.16em] font-semibold text-ink/60 mb-1">Zero-Result Rate</p>
                    <p className={`text-3xl font-semibold ${zeroRate > 20 ? "text-red-600" : "text-green-600"}`}>{zeroRate}%</p>
                    <p className="text-xs text-ink/50 mt-1">{data.zero_result_searches} searches found nothing</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-line p-6 shadow-card mb-8">
                <h3 className="font-serif text-xl mb-6">Search Volume per Day</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.daily}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} tick={{ fontSize: 11, fill: "#6b7280" }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                            <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} />
                            <Bar dataKey="count" fill="#b8860b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-line shadow-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-line bg-cream">
                        <h3 className="font-semibold">Top Search Terms</h3>
                    </div>
                    <table className="w-full">
                        <thead className="bg-cream/50">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">#</th>
                                <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Term</th>
                                <th className="text-right px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Searches</th>
                                <th className="text-right px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Last</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.top_terms.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-ink/50">No searches recorded yet.</td></tr>
                            ) : data.top_terms.map((t, i) => (
                                <tr key={t.term} className="border-b border-line last:border-0">
                                    <td className="px-6 py-3 text-sm text-ink/50">{i + 1}</td>
                                    <td className="px-6 py-3 text-sm font-medium">"{t.term}"</td>
                                    <td className="px-6 py-3 text-sm text-right font-semibold">{t.count}</td>
                                    <td className="px-6 py-3 text-sm text-right text-ink/50">{new Date(t.last).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white rounded-xl border border-line shadow-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-line bg-cream">
                        <h3 className="font-semibold">Demand Gaps — Zero Results</h3>
                        <p className="text-xs text-ink/50 mt-1">Terms customers searched that found nothing. Consider adding products or synonyms.</p>
                    </div>
                    <table className="w-full">
                        <thead className="bg-cream/50">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Term</th>
                                <th className="text-right px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Searches</th>
                                <th className="text-right px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Last</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.zero_terms.length === 0 ? (
                                <tr><td colSpan="3" className="px-6 py-8 text-center text-sm text-ink/50">Great — every search found results.</td></tr>
                            ) : data.zero_terms.map((t) => (
                                <tr key={t.term} className="border-b border-line last:border-0">
                                    <td className="px-6 py-3 text-sm font-medium text-red-600">"{t.term}"</td>
                                    <td className="px-6 py-3 text-sm text-right font-semibold">{t.count}</td>
                                    <td className="px-6 py-3 text-sm text-right text-ink/50">{new Date(t.last).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}