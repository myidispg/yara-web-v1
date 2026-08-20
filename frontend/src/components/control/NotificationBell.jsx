"use client";

import { useEffect, useRef, useState } from "react";
import controlApi from "@/api/controlClient";

const TYPE_STYLES = {
    info: "border-blue-300 bg-blue-50 text-blue-800",
    warning: "border-yellow-300 bg-yellow-50 text-yellow-800",
    error: "border-red-300 bg-red-50 text-red-800",
    success: "border-green-300 bg-green-50 text-green-800",
};

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const boxRef = useRef(null);

    const load = async () => {
        try {
            const { data } = await controlApi.getNotifications();
            setItems(data);
        } catch (e) { /* silent */ }
    };

    useEffect(() => {
        load();
        const t = setInterval(load, 60000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const onClick = (e) => {
            if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    const unread = items.filter((n) => !n.read).length;

    const markAll = async () => {
        try {
            await controlApi.markAllNotificationsRead();
            load();
        } catch (e) { /* silent */ }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50" ref={boxRef}>
            {open && (
                <div className="mb-3 w-96 max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-white shadow-hero">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-line sticky top-0 bg-white">
                        <p className="text-xs uppercase tracking-[0.16em] font-semibold">Notifications</p>
                        <button onClick={markAll} className="text-xs text-gold-dark font-semibold hover:text-ink">Mark all read</button>
                    </div>
                    {items.length === 0 ? (
                        <p className="p-6 text-sm text-ink/50 text-center">No notifications</p>
                    ) : (
                        <ul className="divide-y divide-line">
                            {items.map((n) => (
                                <li key={n.id} className={`px-4 py-3 text-sm ${n.read ? "opacity-60" : ""}`}>
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${TYPE_STYLES[n.message_type] || TYPE_STYLES.info}`}>
                                        {n.message_type}
                                    </span>
                                    <p className="mt-1 leading-snug">{n.message}</p>
                                    <p className="text-[10px] text-ink/40 mt-1">{new Date(n.created_at).toLocaleString("en-IN")}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            <button
                onClick={() => setOpen(!open)}
                className="w-12 h-12 rounded-full bg-ink text-white shadow-hero flex items-center justify-center relative hover:bg-ink/90"
                aria-label="Notifications"
            >
                🔔
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                        {unread}
                    </span>
                )}
            </button>
        </div>
    );
}