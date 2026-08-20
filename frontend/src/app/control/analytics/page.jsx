"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import controlApi from "@/api/controlClient";

const inr = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function AnalyticsPage() {
    const [summary, setSummary] = useState(null);
    const [timeseries, setTimeseries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        loadSummary();
    }, []);

    useEffect(() => {
        loadTimeseries(days);
    }, [days]);

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

    if (loading || !summary) return <div className="text-center py-12">Loading analytics...</div>;

    const maxCategoryRevenue = Math.max(...summary.by_category.map(c => c.revenue), 1);
    const totalChannelRevenue = summary.channel_split.online.revenue + summary.channel_split.offline.revenue;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-serif text-4xl">Reports & Analytics</h1>
                <p className="text-sm text-ink/50">Data for this month unless specified</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: "Today", data: summary.revenue.today },
                    { label: "This Week", data: summary.revenue.this_week },
                    { label: "This Month", data: summary.revenue.this_month },
                    { label: "This Year", data: summary.revenue.this_year },
                ].map((kpi) => (
                    <div key={kpi.label} className="bg-white rounded-xl border border-line p-6 shadow-card">
                        <p className="text-xs uppercase tracking-[0.16em] font-semibold text-ink/60 mb-1">{kpi.label}</p>
                        <p className="text-2xl font-semibold text-ink">{inr(kpi.data.revenue)}</p>
                        <p className="text-xs text-ink/50 mt-1">{kpi.data.count} order{kpi.data.count !== 1 ? 's' : ''}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Channel Split */}
                <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                    <h3 className="font-serif text-xl mb-4">Sales Channel (This Month)</h3>
                    <div className="space-y-4">
                        {['online', 'offline'].map((ch) => {
                            const val = summary.channel_split[ch];
                            const pct = totalChannelRevenue > 0 ? (val.revenue / totalChannelRevenue) * 100 : 0;
                            return (
                                <div key={ch}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-semibold capitalize">{ch}</span>
                                        <span className="text-ink/70">{val.count} items · {inr(val.revenue)}</span>
                                    </div>
                                    <div className="w-full bg-cream rounded-full h-2.5">
                                        <div className="bg-gold-dark h-2.5 rounded-full" style={{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Stock Aging */}
                <div className="bg-white rounded-xl border border-line p-6 shadow-card lg:col-span-2">
                    <h3 className="font-serif text-xl mb-4">Inventory Aging (In-Stock)</h3>
                    <div className="space-y-3">
                        {Object.entries(summary.stock_aging).map(([bucket, data]) => (
                            <div key={bucket} className="flex items-center justify-between text-sm">
                                <span className="font-medium w-24">{bucket}</span>
                                <div className="flex-1 mx-4 bg-cream rounded-full h-2">
                                    <div className="bg-ink h-2 rounded-full" style={{ width: `${(data.count / Math.max(summary.stock_aging['0-30 days'].count, 1)) * 100}%` }}></div>
                                </div>
                                <span className="text-ink/70 w-32 text-right">{data.count} pcs · {inr(data.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Timeseries Chart */}
            <div className="bg-white rounded-xl border border-line p-6 shadow-card mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-xl">Revenue Trend</h3>
                    <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="border border-line rounded-lg px-3 py-1.5 text-sm">
                        <option value={7}>Last 7 Days</option>
                        <option value={14}>Last 14 Days</option>
                        <option value={30}>Last 30 Days</option>
                        <option value={90}>Last 90 Days</option>
                    </select>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeseries} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                            />
                            <YAxis 
                                tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                            />
                            <Tooltip 
                                formatter={(value) => inr(value)}
                                labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#b8860b" strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Sales by Category */}
                <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                    <h3 className="font-serif text-xl mb-4">Sales by Category (This Month)</h3>
                    <div className="space-y-4">
                        {summary.by_category.length === 0 ? (
                            <p className="text-sm text-ink/50">No sales this month yet.</p>
                        ) : summary.by_category.map((cat) => (
                            <div key={cat.category}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold">{cat.category}</span>
                                    <span className="text-ink/70">{cat.quantity} sold · {inr(cat.revenue)}</span>
                                </div>
                                <div className="w-full bg-cream rounded-full h-2">
                                    <div className="bg-gold-dark h-2 rounded-full" style={{ width: `${(cat.revenue / maxCategoryRevenue) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Designs */}
                <div className="bg-white rounded-xl border border-line p-6 shadow-card">
                    <h3 className="font-serif text-xl mb-4">Top Designs (This Month)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-line text-left">
                                    <th className="pb-2 font-semibold text-ink/60">Design</th>
                                    <th className="pb-2 font-semibold text-ink/60 text-right">Qty</th>
                                    <th className="pb-2 font-semibold text-ink/60 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.top_designs.length === 0 ? (
                                    <tr><td colSpan="3" className="py-4 text-center text-ink/50">No sales this month yet.</td></tr>
                                ) : summary.top_designs.map((d, i) => (
                                    <tr key={d.id} className="border-b border-line last:border-0">
                                        <td className="py-2">
                                            <p className="font-medium">{d.name}</p>
                                            <p className="text-xs text-ink/50">{d.design_code} · {d.category}</p>
                                        </td>
                                        <td className="py-2 text-right">{d.quantity}</td>
                                        <td className="py-2 text-right font-semibold">{inr(d.revenue)}</td>
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