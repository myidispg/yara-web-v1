"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import api from "@/api/client";
import ProductCard from "@/components/ProductCard";

const PAGE = 18;

const SORT_OPTIONS = [
    { value: "newest", label: "Newest Arrivals" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
];

const POPULAR = [
    { label: "Rings", href: "/category/rings" },
    { label: "Earrings", href: "/category/earrings" },
    { label: "Necklaces", href: "/category/necklaces" },
    { label: "Bracelets", href: "/category/bracelets" },
    { label: "Solitaires", href: "/category/solitaires" },
    { label: "Color Stone", href: "/category/color-stone" },
];

function SearchInner() {
    const params = useSearchParams();
    const q = (params.get("q") || "").trim();

    const [sort, setSort] = useState("newest");
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [mounted, setMounted] = useState(false);
    const seqRef = useRef(0);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        document.title = q ? `Search: "${q}" | YA-RA Jewellery` : "Search | YA-RA Jewellery";
    }, [q]);

    const hasMore = items.length < total;

    const fetchPage = async (offset, append) => {
        const seq = ++seqRef.current;
        if (append) setLoadingMore(true); else setLoading(true);
        try {
            const { data } = await api.get("/products/", {
                params: { search: q, limit: PAGE, offset, sort },
            });
            if (seq !== seqRef.current) return;
            const list = data?.results ?? data ?? [];
            const totalResults = data?.count ?? list.length;
            setTotal(totalResults);
            setItems((prev) => (append ? [...prev, ...list] : list));
            // Record committed searches (first page only), fire-and-forget
            if (!append && q) {
                api.post("/control/search/track/", { q, results: totalResults }).catch(() => { });
            }
        } catch {
            if (seq === seqRef.current) { setItems([]); setTotal(0); }
        }
        if (seq === seqRef.current) { setLoading(false); setLoadingMore(false); }
    };

    useEffect(() => {
        if (!mounted || !q) { setItems([]); setTotal(0); setLoading(false); return; }
        setItems([]); setTotal(0);
        fetchPage(0, false);
    }, [q, sort, mounted]);

    if (!mounted) return null;

    return (
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-12 pb-20">
            <p className="text-xs uppercase tracking-[0.16em] text-ink/50 mb-4">
                <Link href="/" className="hover:text-gold-dark">Home</Link> / Search
            </p>

            {q ? (
                <>
                    <h1 className="font-serif text-4xl md:text-5xl mb-2">Search Results</h1>
                    <p className="text-sm text-ink/60 mb-8">
                        {loading ? "Searching…" : `${total} piece${total !== 1 ? "s" : ""} found for`} <span className="font-semibold text-ink">"{q}"</span>
                    </p>

                    <div className="flex items-center justify-end mb-6">
                        <label className="flex items-center gap-3 text-xs">
                            <span className="uppercase tracking-[0.16em] font-medium">Sort By:</span>
                            <select value={sort} onChange={(e) => setSort(e.target.value)}
                                className="border border-line bg-white px-4 py-2 text-sm rounded-md focus:outline-none focus:border-gold-dark">
                                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </label>
                    </div>

                    {loading ? (
                        <p className="text-sm text-ink/50">Loading results…</p>
                    ) : items.length ? (
                        <>
                            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                                {items.map((p) => <ProductCard key={p.id ?? p.slug} product={p} />)}
                            </div>
                            <div className="text-center mt-10">
                                {hasMore ? (
                                    <button onClick={() => fetchPage(items.length, true)} disabled={loadingMore}
                                        className="btn-outline disabled:opacity-40">
                                        {loadingMore ? "Loading…" : "Load More Results"}
                                    </button>
                                ) : (
                                    total > PAGE && <p className="text-[10px] uppercase tracking-[0.2em] text-ink/50">You've viewed all {total} results.</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-xl border border-line p-10 shadow-card text-center">
                            <p className="font-serif text-2xl mb-2">No pieces match "{q}"</p>
                            <p className="text-sm text-ink/60 mb-6">Try a different keyword, or browse a collection instead.</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {POPULAR.map((c) => (
                                    <Link key={c.href} href={c.href}
                                        className="text-xs font-medium px-4 py-2 rounded-full border border-line bg-white hover:border-ink hover:bg-ink hover:text-white transition-colors">
                                        {c.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white rounded-xl border border-line p-10 shadow-card text-center">
                    <p className="font-serif text-2xl mb-2">Search YA-RA</p>
                    <p className="text-sm text-ink/60 mb-6">Use the search bar above to find designs by name, code, or category.</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {POPULAR.map((c) => (
                            <Link key={c.href} href={c.href}
                                className="text-xs font-medium px-4 py-2 rounded-full border border-line bg-white hover:border-ink hover:bg-ink hover:text-white transition-colors">
                                {c.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={null}>
            <SearchInner />
        </Suspense>
    );
}