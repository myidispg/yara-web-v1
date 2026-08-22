"use client";

import { useEffect, useState } from "react";
import controlApi from "@/api/controlClient";

const ACTION_META = {
    created: { icon: "➕", cls: "bg-green-100 text-green-700" },
    updated: { icon: "✏️", cls: "bg-blue-100 text-blue-700" },
    deleted: { icon: "🗑️", cls: "bg-red-100 text-red-700" },
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
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-serif text-4xl">Activity</h1>
                <div className="flex items-center gap-2 text-xs text-ink/50">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live · auto-refreshes every 60s
                    {lastPoll && <span>· last {lastPoll.toLocaleTimeString("en-IN")}</span>}
                </div>
            </div>

            {/* Summary chips */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "Created", value: counts.created, cls: "text-green-600" },
                    { label: "Updated", value: counts.updated, cls: "text-blue-600" },
                    { label: "Deleted", value: counts.deleted, cls: "text-red-600" },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-line p-4 shadow-card flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.16em] font-semibold text-ink/60">{s.label}</span>
                        <span className={`text-2xl font-semibold ${s.cls}`}>{s.value}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <select value={days} onChange={(e) => setDays(e.target.value)} className="border border-line rounded-lg px-4 py-2 text-sm bg-white">
                    <option value="">All time</option>
                    <option value="1">Last 24 hours</option>
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                </select>
                <select value={model} onChange={(e) => setModel(e.target.value)} className="border border-line rounded-lg px-4 py-2 text-sm bg-white">
                    <option value="">All models</option>
                    {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={action} onChange={(e) => setAction(e.target.value)} className="border border-line rounded-lg px-4 py-2 text-sm bg-white">
                    <option value="">All actions</option>
                    <option value="created">Created</option>
                    <option value="updated">Updated</option>
                    <option value="deleted">Deleted</option>
                </select>
            </div>

            {/* Feed */}
            <div className="bg-white rounded-xl border border-line shadow-card overflow-hidden">
                {loading ? (
                    <p className="p-8 text-center text-sm text-ink/50">Loading activity…</p>
                ) : logs.length === 0 ? (
                    <p className="p-8 text-center text-sm text-ink/50">No activity recorded for this filter yet.</p>
                ) : (
                    logs.map((log) => {
                        const meta = ACTION_META[log.action] || ACTION_META.updated;
                        return (
                            <div key={log.id} className="flex gap-4 px-6 py-4 border-b border-line last:border-0 hover:bg-cream/30">
                                <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 ${meta.cls}`}>
                                    {meta.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm leading-snug">{log.description}</p>
                                    <p className="text-[11px] text-ink/50 mt-1">
                                        {relTime(log.timestamp)} · {new Date(log.timestamp).toLocaleString("en-IN")} · {log.model_name} #{log.object_id}
                                        {log.ip_address && ` · ${log.ip_address}`}
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