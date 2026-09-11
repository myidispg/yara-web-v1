"use client";

import { useEffect, useState } from "react";
import controlApi from "@/api/controlClient";

const ACTION_META = {
    created: { icon: "➕", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    updated: { icon: "✏️", cls: "bg-blue-50 text-blue-700 border border-blue-200" },
    deleted: { icon: "🗑️", cls: "bg-red-50 text-red-700 border border-red-200" },
};

const MODELS = ["Design", "Product", "RateCard", "Category", "Order"];

const relTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

export default function ActivityPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState("");
    const [model, setModel] = useState("");
    const [action, setAction] = useState("");
    const [lastPoll, setLastPoll] = useState(null);

    const load = async (silent = false) => {
        try {
            const params = { limit: 200 };
            if (days) params.days = days;
            if (model) params.model = model;
            if (action) params.action = action;
            const { data } = await controlApi.getAuditLogs(params);
            setLogs(data);
            setLastPoll(new Date());
        } catch (e) {
            console.error("Failed to load activity:", e);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => { load(); }, [days, model, action]);

    useEffect(() => {
        const t = setInterval(() => load(true), 60000);
        return () => clearInterval(t);
    }, [days, model, action]);

    const counts = {
        created: logs.filter((l) => l.action === "created").length,
        updated: logs.filter((l) => l.action === "updated").length,
        deleted: logs.filter((l) => l.action === "deleted").length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">audit trail</span>
                    <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Activity</h1>
                </div>
                <div className="glass-card-vibrant rounded-full px-5 py-2.5 border border-[#E5BDB0] flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-[#1A2536]">Live</span>
                    <span className="text-[#1A2536]/60">· auto-refreshes every 60s</span>
                    {lastPoll && <span className="text-[#1A2536]/60">· last {lastPoll.toLocaleTimeString("en-IN")}</span>}
                </div>
            </div>

            {/* Summary chips */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Created", value: counts.created, color: "#10B981" },
                    { label: "Updated", value: counts.updated, color: "#3B82F6" },
                    { label: "Deleted", value: counts.deleted, color: "#EF4444" },
                ].map((s) => (
                    <div key={s.label} className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-5 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">{s.label}</span>
                        <span className="text-3xl font-serif-luxury font-semibold" style={{ color: s.color }}>{s.value}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select value={days} onChange={(e) => setDays(e.target.value)} className="border border-[#E5BDB0] rounded-full px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#1A2536]">
                    <option value="">All time</option>
                    <option value="1">Last 24 hours</option>
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                </select>
                <select value={model} onChange={(e) => setModel(e.target.value)} className="border border-[#E5BDB0] rounded-full px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#1A2536]">
                    <option value="">All models</option>
                    {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={action} onChange={(e) => setAction(e.target.value)} className="border border-[#E5BDB0] rounded-full px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#1A2536]">
                    <option value="">All actions</option>
                    <option value="created">Created</option>
                    <option value="updated">Updated</option>
                    <option value="deleted">Deleted</option>
                </select>
            </div>

            {/* Feed */}
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <p className="text-sm text-[#1A2536]/50">Loading activity…</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="font-serif-luxury text-xl text-[#1A2536] mb-2">No activity recorded</p>
                        <p className="text-sm text-[#1A2536]/50">Try adjusting your filters.</p>
                    </div>
                ) : (
                    logs.map((log) => {
                        const meta = ACTION_META[log.action] || ACTION_META.updated;
                        return (
                            <div key={log.id} className="flex gap-4 px-6 py-4 border-b border-[#E5BDB0]/20 last:border-0 hover:bg-[#1A2536]/[0.02] transition-colors">
                                <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0 ${meta.cls}`}>
                                    {meta.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-[#1A2536] leading-snug font-medium">{log.description}</p>
                                    <p className="text-[11px] text-[#1A2536]/50 mt-1.5 flex flex-wrap gap-2">
                                        <span className="font-bold text-[#B86B5A]">{relTime(log.timestamp)}</span>
                                        <span>·</span>
                                        <span>{new Date(log.timestamp).toLocaleString("en-IN")}</span>
                                        <span>·</span>
                                        <span className="font-mono">{log.model_name} #{log.object_id}</span>
                                        {log.ip_address && (
                                            <>
                                                <span>·</span>
                                                <span className="font-mono">{log.ip_address}</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}