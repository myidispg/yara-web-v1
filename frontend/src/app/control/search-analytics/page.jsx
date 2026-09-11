"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "@/components/charts/ChartLoader";
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

    if (loading || !data) return (
        <div className="flex items-center justify-center py-24">
            <p className="text-sm text-[#1A2536]/50">Loading search insights…</p>
        </div>
    );

    const zeroRate = data.total_searches ? Math.round((data.zero_result_searches / data.total_searches) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">customer demand</span>
                    <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Search Insights</h1>
                </div>
                <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="border border-[#E5BDB0] rounded-full px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#1A2536]">
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                </select>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                    <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/60 mb-2">Total Searches</p>
                    <p className="text-3xl font-serif-luxury font-semibold text-[#1A2536]">{data.total_searches}</p>
                </div>
                <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                    <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/60 mb-2">Unique Terms</p>
                    <p className="text-3xl font-serif-luxury font-semibold text-[#1A2536]">{data.unique_terms}</p>
                </div>
                <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                    <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/60 mb-2">Zero-Result Rate</p>
                    <p className={`text-3xl font-serif-luxury font-semibold ${zeroRate > 20 ? "text-red-600" : "text-emerald-600"}`}>{zeroRate}%</p>
                    <p className="text-xs text-[#1A2536]/50 mt-1">{data.zero_result_searches} searches found nothing</p>
                </div>
            </div>

            {/* Chart */}
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536] mb-5">Search Volume per Day</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.daily}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5BDB0" strokeOpacity={0.4} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                tick={{ fontSize: 11, fill: '#1A2536' }}
                                stroke="#E5BDB0"
                            />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#1A2536' }} stroke="#E5BDB0" />
                            <Tooltip
                                labelFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                                contentStyle={{ borderRadius: 12, border: '1px solid #E5BDB0', background: 'white' }}
                            />
                            <Bar dataKey="count" fill="#B86B5A" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Search Terms */}
                <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#E5BDB0]/40 bg-[#1A2536]/[0.02]">
                        <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">Top Search Terms</h3>
                    </div>
                    <table className="w-full">
                        <thead className="bg-[#1A2536]/[0.03]">
                            <tr>
                                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">#</th>
                                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Term</th>
                                <th className="text-right px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Searches</th>
                                <th className="text-right px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Last</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.top_terms.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-sm text-[#1A2536]/50">No searches recorded yet.</td></tr>
                            ) : data.top_terms.map((t, i) => (
                                <tr key={t.term} className="border-b border-[#E5BDB0]/20 last:border-0 hover:bg-[#1A2536]/[0.02] transition-colors">
                                    <td className="px-6 py-3.5 text-sm text-[#1A2536]/50 font-bold">{i + 1}</td>
                                    <td className="px-6 py-3.5 text-sm font-bold text-[#1A2536]">"{t.term}"</td>
                                    <td className="px-6 py-3.5 text-sm text-right font-extrabold text-[#B86B5A]">{t.count}</td>
                                    <td className="px-6 py-3.5 text-sm text-right text-[#1A2536]/60">{new Date(t.last).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Demand Gaps */}
                <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#E5BDB0]/40 bg-[#1A2536]/[0.02]">
                        <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">Demand Gaps — Zero Results</h3>
                        <p className="text-xs text-[#1A2536]/60 mt-1">Terms customers searched that found nothing. Consider adding products or synonyms.</p>
                    </div>
                    <table className="w-full">
                        <thead className="bg-[#1A2536]/[0.03]">
                            <tr>
                                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Term</th>
                                <th className="text-right px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Searches</th>
                                <th className="text-right px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Last</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.zero_terms.length === 0 ? (
                                <tr><td colSpan="3" className="px-6 py-12 text-center text-sm text-[#1A2536]/50">Great — every search found results.</td></tr>
                            ) : data.zero_terms.map((t) => (
                                <tr key={t.term} className="border-b border-[#E5BDB0]/20 last:border-0 hover:bg-[#1A2536]/[0.02] transition-colors">
                                    <td className="px-6 py-3.5 text-sm font-bold text-red-600">"{t.term}"</td>
                                    <td className="px-6 py-3.5 text-sm text-right font-extrabold text-[#1A2536]">{t.count}</td>
                                    <td className="px-6 py-3.5 text-sm text-right text-[#1A2536]/60">{new Date(t.last).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}