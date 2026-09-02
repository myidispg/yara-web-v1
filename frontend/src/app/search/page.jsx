"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import api from "@/api/client";
import ProductCard from "@/components/ProductCard";

const PAGE = 20;

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

    // Forcefully unlock body scroll in case a drawer/modal left it locked
    useEffect(() => {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        // Force reflow to fix iOS Safari scroll locking
        void document.body.offsetHeight;
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
    }, []);

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
        <div className="w-full bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
                {/* Breadcrumb */}
                <p className="text-xs text-[#1A2536]/50 mb-6">
                    <Link href="/" className="hover:text-[#B86B5A]">Home</Link> / Search
                </p>

                {q ? (
                    <>
                        {/* Header */}
                        <div className="mb-8">
                            <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">search results</span>
                            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536] mb-2">
                                {loading ? "Searching…" : `${total} piece${total !== 1 ? "s" : ""} found for`}{" "}
                                <span className="font-bold text-[#B86B5A]">"{q}"</span>
                            </h1>
                        </div>

                        {/* Sort Toolbar */}
                        <div className="flex items-center justify-end mb-6">
                            <label className="glass-card-vibrant flex items-center gap-3 text-xs px-4 py-2.5 rounded-full border border-[#E5BDB0]">
                                <span className="uppercase tracking-[0.16em] font-bold text-[#1A2536]">Sort By:</span>
                                <select value={sort} onChange={(e) => setSort(e.target.value)}
                                    className="bg-transparent focus:outline-none font-bold text-[#1A2536] cursor-pointer">
                                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </label>
                        </div>

                        {/* Results */}
                        {loading ? (
                            <p className="text-sm text-[#1A2536]/50 text-center py-20">Loading results…</p>
                        ) : items.length ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
                                    {items.map((p) => <ProductCard key={p.id ?? p.slug} product={p} />)}
                                </div>
                                <div className="text-center mt-12">
                                    {hasMore ? (
                                        <button onClick={() => fetchPage(items.length, true)} disabled={loadingMore}
                                            className="px-8 py-4 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all disabled:opacity-40">
                                            {loadingMore ? "Loading…" : "Load More Results"}
                                        </button>
                                    ) : (
                                        total > PAGE && <p className="text-[10px] uppercase tracking-[0.2em] text-[#1A2536]/50 font-bold">You've viewed all {total} results.</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-10 text-center max-w-2xl mx-auto">
                                <p className="font-serif-luxury text-3xl text-[#1A2536] mb-3">No pieces match "{q}"</p>
                                <p className="text-sm text-[#1A2536]/60 mb-8">Try a different keyword, or browse our popular collections instead.</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {POPULAR.map((c) => (
                                        <Link key={c.href} href={c.href}
                                            className="px-5 py-2.5 rounded-full border border-[#E5BDB0] bg-white text-xs font-bold text-[#1A2536] hover:border-[#B86B5A] hover:text-[#B86B5A] transition-colors">
                                            {c.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-10 text-center max-w-2xl mx-auto">
                        <span className="font-cursive text-4xl text-[#B86B5A] block mb-2">explore our collection</span>
                        <h1 className="font-serif-luxury text-3xl text-[#1A2536] mb-4">Search YA-RA</h1>
                        <p className="text-sm text-[#1A2536]/60 mb-8">Use the search bar above to find designs by name, code, or category, or browse our popular collections below.</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {POPULAR.map((c) => (
                                <Link key={c.href} href={c.href}
                                    className="px-5 py-2.5 rounded-full border border-[#E5BDB0] bg-white text-xs font-bold text-[#1A2536] hover:border-[#B86B5A] hover:text-[#B86B5A] transition-colors">
                                    {c.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
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