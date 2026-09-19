"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "@/components/charts/ChartLoader";
import controlApi from "@/api/controlClient";

const inr = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function AnalyticsPage() {
    const [summary, setSummary] = useState(null);
    const [timeseries, setTimeseries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => { loadSummary(); }, []);
    useEffect(() => { loadTimeseries(days); }, [days]);

    const loadSummary = async () => {
        try {
            const { data } = await controlApi.getAnalyticsSummary();
            setSummary(data);
        } catch (err) {
            console.error("Failed to load summary:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadTimeseries = async (d) => {
        try {
            const { data } = await controlApi.getAnalyticsTimeseries(d);
            setTimeseries(data);
        } catch (err) {
            console.error("Failed to load timeseries:", err);
        }
    };

    if (loading || !summary) return (
        <div className="flex items-center justify-center py-24">
            <p className="text-sm text-[#1A2536]/50">Loading analytics…</p>
        </div>
    );

    const maxCategoryRevenue = Math.max(...summary.by_category.map(c => c.revenue), 1);
    const totalChannelRevenue = summary.channel_split.online.revenue + summary.channel_split.offline.revenue;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">data insights</span>
                    <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Reports & Analytics</h1>
                </div>
                <p className="text-xs text-[#1A2536]/50">Data for this month unless specified</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: "Today", data: summary.revenue.today },
                    { label: "This Week", data: summary.revenue.this_week },
                    { label: "This Month", data: summary.revenue.this_month },
                    { label: "This Year", data: summary.revenue.this_year },
                ].map((kpi) => (
                    <div key={kpi.label} className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                        <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/60 mb-2">{kpi.label}</p>
                        <p className="text-2xl font-serif-luxury font-semibold text-[#1A2536]">{inr(kpi.data.revenue)}</p>
                        <p className="text-xs text-[#1A2536]/50 mt-1">{kpi.data.count} order{kpi.data.count !== 1 ? 's' : ''}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Channel Split */}
                <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                    <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536] mb-5">Sales Channel (This Month)</h3>
                    <div className="space-y-5">
                        {['online', 'offline'].map((ch) => {
                            const val = summary.channel_split[ch];
                            const pct = totalChannelRevenue > 0 ? (val.revenue / totalChannelRevenue) * 100 : 0;
                            return (
                                <div key={ch}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-bold text-[#1A2536] capitalize">{ch}</span>
                                        <span className="text-[#1A2536]/70 text-xs">{val.count} items · {inr(val.revenue)}</span>
                                    </div>
                                    <div className="w-full bg-[#E5BDB0]/30 rounded-full h-2.5">
                                        <div className="bg-[#B86B5A] h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Stock Aging */}
                <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 lg:col-span-2">
                    <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536] mb-5">Inventory Aging (In-Stock)</h3>
                    <div className="space-y-4">
                        {Object.entries(summary.stock_aging).map(([bucket, data]) => (
                            <div key={bucket} className="flex items-center justify-between text-sm">
                                <span className="font-bold text-[#1A2536] w-28">{bucket}</span>
                                <div className="flex-1 mx-4 bg-[#E5BDB0]/30 rounded-full h-2">
                                    <div className="bg-[#1A2536] h-2 rounded-full transition-all" style={{ width: `${(data.count / Math.max(summary.stock_aging['0-30 days'].count, 1)) * 100}%` }}></div>
                                </div>
                                <span className="text-[#1A2536]/70 w-40 text-right text-xs">{data.count} pcs · {inr(data.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Timeseries Chart */}
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">Revenue Trend</h3>
                    <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="border border-[#E5BDB0] rounded-full px-4 py-2 text-sm bg-white focus:outline-none focus:border-[#1A2536]">
                        <option value={7}>Last 7 Days</option>
                        <option value={14}>Last 14 Days</option>
                        <option value={30}>Last 30 Days</option>
                        <option value={90}>Last 90 Days</option>
                    </select>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeseries} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5BDB0" strokeOpacity={0.4} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                tick={{ fontSize: 11, fill: '#1A2536' }}
                                stroke="#E5BDB0"
                            />
                            <YAxis
                                tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`}
                                tick={{ fontSize: 11, fill: '#1A2536' }}
                                stroke="#E5BDB0"
                            />
                            <Tooltip
                                formatter={(value) => inr(value)}
                                labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                contentStyle={{ borderRadius: 12, border: '1px solid #E5BDB0', background: 'white' }}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#B86B5A" strokeWidth={3} dot={{ fill: '#B86B5A', r: 3 }} activeDot={{ r: 5, fill: '#1A2536' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales by Category */}
                <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
                    <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536] mb-5">Sales by Category (This Month)</h3>
                    <div className="space-y-4">
                        {summary.by_category.length === 0 ? (
                            <p className="text-sm text-[#1A2536]/50">No sales this month yet.</p>
                        ) : summary.by_category.map((cat) => (
                            <div key={cat.category}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-bold text-[#1A2536]">{cat.category}</span>
                                    <span className="text-[#1A2536]/70 text-xs">{cat.quantity} sold · {inr(cat.revenue)}</span>
                                </div>
                                <div className="w-full bg-[#E5BDB0]/30 rounded-full h-2">
                                    <div className="bg-[#B86B5A] h-2 rounded-full transition-all" style={{ width: `${(cat.revenue / maxCategoryRevenue) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Designs */}
                <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#E5BDB0]/40 bg-[#1A2536]/[0.02]">
                        <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">Top Designs (This Month)</h3>
                    </div>
                    <div className="p-6">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#E5BDB0]/40 text-left">
                                    <th className="pb-3 font-bold text-[10px] uppercase tracking-[0.16em] text-[#1A2536]">Design</th>
                                    <th className="pb-3 font-bold text-[10px] uppercase tracking-[0.16em] text-[#1A2536] text-right">Qty</th>
                                    <th className="pb-3 font-bold text-[10px] uppercase tracking-[0.16em] text-[#1A2536] text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.top_designs.length === 0 ? (
                                    <tr><td colSpan="3" className="py-6 text-center text-[#1A2536]/50 text-sm">No sales this month yet.</td></tr>
                                ) : summary.top_designs.map((d, i) => (
                                    <tr key={d.id} className="border-b border-[#E5BDB0]/20 last:border-0">
                                        <td className="py-3">
                                            <p className="font-bold text-[#1A2536]">{d.name}</p>
                                            <p className="text-xs text-[#1A2536]/50 font-mono">{d.design_code} · {d.category}</p>
                                        </td>
                                        <td className="py-3 text-right font-semibold text-[#1A2536]">{d.quantity}</td>
                                        <td className="py-3 text-right font-extrabold text-[#B86B5A]">{inr(d.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}