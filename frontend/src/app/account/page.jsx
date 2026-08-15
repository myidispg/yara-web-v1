"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/client";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const STATUS_STYLES = {
    delivered: "bg-[#3E5C4B] text-white",
    shipped: "bg-gold-dark text-white",
    in_transit: "bg-gold-dark text-white",
    processing: "bg-ink/10 text-ink/70",
    pending: "bg-ink/10 text-ink/70",
};

const statusLabel = (s) =>
    ({ delivered: "Delivered", shipped: "In Transit (Insured)", in_transit: "In Transit (Insured)", processing: "Processing", pending: "Processing" }[s] ?? s ?? "Processing");

export default function AccountPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        document.title = "My Account | YA-RA Jewels";
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !user) {
            router.push("/auth");
        }
    }, [mounted, user, router]);

    useEffect(() => {
        if (mounted && user) {
            (async () => {
                try {
                    const { data } = await api.get("/orders/");
                    const list = data?.results ?? data;
                    if (Array.isArray(list)) setOrders(list);
                } catch {
                    setOrders([]);
                }
            })();
        }
    }, [mounted, user]);

    if (!mounted || !user) return (
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-12">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gold-dark mb-2">Loading…</p>
        </div>
    );

    return (
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-12">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gold-dark mb-2">YA-RA Account</p>
            <h1 className="font-serif text-4xl md:text-5xl mb-10">
                My Account{user?.first_name ? <span className="text-ink/40 text-2xl md:text-3xl"> — {user.first_name}</span> : null}
            </h1>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
                <aside className="bg-ink text-white p-8 rounded-xl w-full lg:w-80 shrink-0">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-gold mb-3 font-semibold">Member Profile</p>
                    <p className="font-serif text-2xl mb-1">{[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Guest"}</p>
                    <p className="text-xs text-white/60 mb-8">{user?.email}</p>
                    <nav className="space-y-4 text-sm border-t border-white/10 pt-6">
                        <Link href="/policies" className="block hover:text-gold transition-colors">Policies & Certifications</Link>
                        <Link href="/" className="block hover:text-gold transition-colors">Continue Shopping</Link>
                        <button
                            onClick={() => { logout(); router.push("/"); }}
                            className="text-[10px] uppercase tracking-[0.14em] font-medium text-gold underline underline-offset-4"
                        >
                            Logout
                        </button>
                    </nav>
                </aside>

                <section className="flex-1 w-full">
                    <h2 className="font-serif text-2xl mb-6">Recent Orders</h2>
                    {orders.length ? (
                        <div className="space-y-5">
                            {orders.map((o) => {
                                const status = (o.status ?? "processing").toLowerCase();
                                return (
                                    <div key={o.id || o.order_number} className="bg-white rounded-xl border border-line shadow-card p-5 flex flex-col sm:flex-row justify-between gap-4">
                                        <div>
                                            <p className="font-serif text-lg text-ink">
                                                Order {o.order_number ?? o.reference ?? `#YARA-${o.id}`}
                                            </p>
                                            <p className="text-xs text-ink/60 mt-1">
                                                {o.items?.map((i) => i.product_name ?? i.name).filter(Boolean).join(", ") || "Fine jewellery"}
                                            </p>
                                            <p className="text-xs text-ink/40 mt-1">
                                                {o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""}
                                            </p>
                                        </div>
                                        <div className="flex sm:flex-col items-start sm:items-end justify-between gap-3">
                                            <p className="font-semibold text-ink">{inr(o.total ?? 0)}</p>
                                            <span className={`text-[10px] uppercase tracking-[0.12em] font-medium px-3 py-1.5 rounded-full ${STATUS_STYLES[status] ?? STATUS_STYLES.processing}`}>
                                                {statusLabel(status)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-line shadow-card p-8 text-center">
                            <p className="text-sm text-ink/60 mb-4">No orders yet.</p>
                            <Link href="/" className="btn-outline inline-block">Explore the collection →</Link>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}