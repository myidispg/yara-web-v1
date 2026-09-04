"use client"

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import api from "@/api/client";
import ProductCard from "@/components/ProductCard";

const TITLES = {
    rings: ["Natural Diamond & Gold Rings", "Explore handcrafted natural diamond rings set in 14Kt and 18Kt Solid Gold."],
    earrings: ["Diamond Earrings", "Studs, huggies & drops in certified natural diamonds."],
    necklaces: ["Necklaces & Pendants", "Solitaire drops & fine chains in 14Kt & 18Kt gold."],
    bracelets: ["Tennis Collection", "Diamond bracelets & bangles in classic silhouettes."],
    solitaires: ["Solitaires", "Engagement rings & solitaire bands, crafted forever."],
    "color-stone": ["Color Stone Fine Jewellery", "Ruby, sapphire & emerald accents with natural diamonds."],
};

const PAGE = 12;
const KARAT_OPTIONS = ["14Kt", "18Kt"];
const COLOR_OPTIONS = ["Yellow", "Rose", "White"];
const SWATCH = { Yellow: "#FFD700", Rose: "#E5BDB0", White: "#E8E8E8" };
const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
];

const BANNERS = [
    {
        position: 3,
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
        title: "Made to Order",
        subtitle: "Custom crafted just for you"
    },
    { position: 6, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop", title: "Every piece tells a story.", subtitle: "Handcrafted to be worn, loved, and passed down." },
    { position: 11, image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600&auto=format&fit=crop", title: "Certified forever.", subtitle: "IGI & GIA certified natural diamonds, 100% earth-mined." },
    { position: 17, image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop", title: "Crafted for you.", subtitle: "14Kt & 18Kt solid gold, BIS hallmarked for life." },
    { position: 22, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop", title: "Worn every day.", subtitle: "Effortless fine jewellery for the modern woman." },
];

export default function CategoryPage() {
    const { slug } = useParams();
    const [sel, setSel] = useState({ karat: [], color: [], priceMax: 200000 });
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sort, setSort] = useState("newest");
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showMobileSort, setShowMobileSort] = useState(false);
    const [mounted, setMounted] = useState(false);
    const sentinelRef = useRef(null);
    const seqRef = useRef(0);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedSub, setSelectedSub] = useState("");

    const [title, subtitle] = TITLES[slug] ?? ["Fine Jewellery", "Handcrafted natural diamond jewellery in 14Kt & 18Kt solid gold."];

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        api.get("/categories/", { params: { parent_slug: slug } })
            .then(({ data }) => setSubcategories(data?.results ?? data ?? []))
            .catch(() => setSubcategories([]));
    }, [slug]);

    const hasMore = items.length < total;
    const activeCount = sel.karat.length + sel.color.length + (inStockOnly ? 1 : 0) + (selectedSub ? 1 : 0) + (sel.priceMax < 200000 ? 1 : 0);

    const toggle = (group, value) =>
        setSel((s) => ({
            ...s,
            [group]: s[group].includes(value) ? s[group].filter((v) => v !== value) : [...s[group], value],
        }));

    const clearAll = () => {
        setSel({ karat: [], color: [], priceMax: 200000 });
        setInStockOnly(false);
        setSelectedSub("");
    };

    const buildParams = (offset) => {
        const p = { category: slug, limit: PAGE, offset, sort };
        if (selectedSub) p.sub = selectedSub;
        if (sel.karat.length) p.purity = sel.karat;
        if (sel.color.length) p.color = sel.color;
        if (inStockOnly) p.in_stock = "1";
        if (sel.priceMax < 200000) p.price_max = sel.priceMax;
        return p;
    };

    const fetchPage = async (offset, append) => {
        const seq = ++seqRef.current;
        if (append) setLoadingMore(true); else setLoading(true);
        try {
            const { data } = await api.get("/products/", { params: buildParams(offset) });
            if (seq !== seqRef.current) return;
            const list = data?.results ?? data ?? [];
            setTotal(data?.count ?? list.length);
            setItems((prev) => (append ? [...prev, ...list] : list));
        } catch {
            if (seq === seqRef.current) { setItems([]); setTotal(0); }
        }
        if (seq === seqRef.current) { setLoading(false); setLoadingMore(false); }
    };

    useEffect(() => { fetchPage(0, false); }, [slug, sel, sort, inStockOnly, selectedSub]);

    useEffect(() => {
        if (!sentinelRef.current || !hasMore) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingMore) {
                    fetchPage(items.length, true);
                }
            },
            { rootMargin: "200px" }
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, loadingMore, items.length]);

    if (!mounted) return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-500 mb-4">Loading…</p>
        </div>
    );

    const Chip = ({ group, value, children }) => {
        const active = sel[group].includes(value);
        return (
            <button
                onClick={() => toggle(group, value)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${active
                    ? "bg-[#1A2536] text-white shadow-md"
                    : "bg-white text-[#1A2536] border border-[#E5BDB0] hover:border-[#B86B5A]"
                    }`}
            >
                {children || value}
            </button>
        );
    };

    const filterBody = (
        <div className="space-y-6">
            {/* Subcategories */}
            {subcategories.length > 0 && (
                <div>
                    <h3 className="text-xs uppercase tracking-[0.16em] font-bold text-[#1A2536] mb-3">Subcategories</h3>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedSub("")}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${!selectedSub
                                ? "bg-[#1A2536] text-white shadow-md"
                                : "bg-white text-[#1A2536] border border-[#E5BDB0] hover:border-[#B86B5A]"
                                }`}
                        >
                            All
                        </button>
                        {subcategories.map((sub) => (
                            <button
                                key={sub.id}
                                onClick={() => setSelectedSub(sub.slug)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedSub === sub.slug
                                    ? "bg-[#1A2536] text-white shadow-md"
                                    : "bg-white text-[#1A2536] border border-[#E5BDB0] hover:border-[#B86B5A]"
                                    }`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Price Range */}
            <div>
                <h3 className="text-xs uppercase tracking-[0.16em] font-bold text-[#1A2536] mb-3">Price Range</h3>
                <input
                    type="range"
                    min="10000"
                    max="200000"
                    step="5000"
                    value={sel.priceMax}
                    onChange={(e) => setSel({ ...sel, priceMax: Number(e.target.value) })}
                    className="w-full accent-[#1A2536]"
                />
                <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] font-bold text-[#1A2536]/50">₹10K</span>
                    <span className="text-xs font-extrabold text-[#B86B5A]">
                        {sel.priceMax >= 200000
                            ? "Any Price"
                            : `Up to ${sel.priceMax >= 100000 ? `₹${(sel.priceMax / 100000).toFixed(1)}L` : `₹${(sel.priceMax / 1000).toFixed(0)}K`}`}
                    </span>
                    <span className="text-[10px] font-bold text-[#1A2536]/50">₹2L+</span>
                </div>
            </div>

            {/* Gold Purity */}
            <div>
                <h3 className="text-xs uppercase tracking-[0.16em] font-bold text-[#1A2536] mb-3">Gold Purity</h3>
                <div className="flex flex-wrap gap-2">
                    {KARAT_OPTIONS.map((k) => <Chip key={k} group="karat" value={k} />)}
                </div>
            </div>

            {/* Gold Colour */}
            <div>
                <h3 className="text-xs uppercase tracking-[0.16em] font-bold text-[#1A2536] mb-3">Gold Colour</h3>
                <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                        <Chip key={c} group="color" value={c}>
                            <span className="inline-flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ background: SWATCH[c] }} />
                                {c} Gold
                            </span>
                        </Chip>
                    ))}
                </div>
            </div>

            {/* Availability */}
            <div>
                <h3 className="text-xs uppercase tracking-[0.16em] font-bold text-[#1A2536] mb-3">Availability</h3>
                <button
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`w-full flex items-center justify-between text-xs font-medium px-4 py-3 rounded-2xl border-2 transition-colors ${inStockOnly
                        ? "border-[#1A2536] bg-[#1A2536] text-white"
                        : "border-[#E5BDB0] bg-white text-[#1A2536] hover:border-[#B86B5A]"
                        }`}
                >
                    In Stock Only
                    <span className={`w-9 h-5 rounded-full relative transition-colors ${inStockOnly ? "bg-[#B86B5A]" : "bg-[#E5BDB0]"}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${inStockOnly ? "left-4" : "left-0.5"}`} />
                    </span>
                </button>
            </div>
        </div>
    );

        const cells = [];
    let p = 0;
    while (p < items.length) {
        const pos = cells.length;
        const banner = BANNERS.find((b) => b.position === pos);
        if (banner) {
            cells.push(
                <div key={`banner-${banner.position}`} className="relative shape-asymmetric overflow-hidden shadow-xl border-2 border-[#E5BDB0] aspect-square">
                    <Image 
                        src={banner.image} 
                        alt={banner.title} 
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A2536]/85 via-[#1A2536]/20 to-transparent" />
                    <div className="relative aspect-square flex flex-col justify-end p-6 text-white">
                        <span className="font-cursive text-2xl text-[#E5BDB0] block -mb-1">crafted for you</span>
                        <p className="font-serif-luxury text-2xl leading-tight mb-1">{banner.title}</p>
                        <p className="text-xs text-white/80">{banner.subtitle}</p>
                    </div>
                </div>
            );
        } else {
            cells.push(<ProductCard key={items[p].id ?? items[p].slug} product={items[p]} />);
            p++;
        }
    }

    return (
        <div className="bg-white pb-28 lg:pb-12">
            <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 pt-8 pb-12 space-y-8">
                {/* Breadcrumb */}
                <p className="text-xs text-gray-500">
                    <Link href="/" className="hover:text-[#B86B5A]">Home</Link> / Jewellery / {title}
                </p>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-card-vibrant p-3 rounded-2xl border border-[#E5BDB0]">
                    <div className="flex items-center gap-3 text-xs">
                        <span className="font-bold text-[#1A2536]">Showing {items.length} of {total} Designs</span>
                        {activeCount > 0 && (
                            <button onClick={clearAll} className="text-[#B86B5A] font-bold hover:underline">
                                Clear Filters
                            </button>
                        )}
                    </div>
                    <label className="hidden lg:flex items-center gap-3 text-xs">
                        <span className="uppercase tracking-[0.16em] font-bold text-[#1A2536]">Sort By:</span>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="border border-[#E5BDB0] bg-white px-4 py-2 text-sm rounded-full focus:outline-none focus:border-[#B86B5A] font-medium"
                        >
                            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </label>
                </div>

                {/* Main Grid */}
                <div className="flex gap-4 lg:grid lg:grid-cols-[240px_1fr]">
                    {/* Desktop Filters */}
                    <aside className="hidden lg:block space-y-6">
                        <div className="glass-card-vibrant p-6 rounded-3xl border border-[#E5BDB0] space-y-6">
                            <h2 className="text-xs uppercase tracking-[0.16em] font-bold text-[#1A2536]">Filter Products</h2>
                            {filterBody}
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <p className="text-sm text-gray-500">Loading designs…</p>
                        ) : items.length ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5">{cells}</div>
                                {hasMore && <div ref={sentinelRef} className="h-10" aria-hidden="true" />}
                                {loadingMore && <p className="text-center text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-6 font-bold">Loading more designs…</p>}
                                {!hasMore && total > PAGE && <p className="text-center text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-8 font-bold">You've viewed all {total} designs.</p>}
                            </>
                        ) : (
                            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-10 text-center max-w-2xl mx-auto">
                                <p className="font-serif-luxury text-2xl text-[#1A2536] mb-3">No designs match your filters</p>
                                <p className="text-sm text-[#1A2536]/60 mb-6">Try adjusting your filters or clearing them to see more designs.</p>
                                <button onClick={clearAll} className="px-8 py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl">
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Bottom Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass-nav-vibrant px-4 py-3.5 flex items-center justify-around shadow-2xl">
                    <button onClick={() => setShowMobileFilters(true)} className="flex items-center gap-2.5 text-[#1A2536] font-bold text-sm">
                        Filter
                        {activeCount > 0 && (
                            <span className="bg-[#B86B5A] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>
                        )}
                    </button>
                    <div className="w-px h-6 bg-[#E5BDB0]" />
                    <button onClick={() => setShowMobileSort(true)} className="flex items-center gap-2.5 text-[#1A2536] font-bold text-sm">
                        Sort: <span className="text-[#B86B5A]">{SORT_OPTIONS.find((o) => o.value === sort)?.label}</span>
                    </button>
                </div>

                {/* Mobile Filters Drawer */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
                        <div className="relative bg-white w-full max-h-[85vh] rounded-t-[32px] flex flex-col shadow-2xl border-t-2 border-[#E5BDB0]">
                            <div className="flex items-center justify-between p-5 border-b border-[#E5BDB0]/40">
                                <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">Filter Products</h3>
                                <button onClick={() => setShowMobileFilters(false)} className="text-[#1A2536] hover:text-[#B86B5A] text-2xl">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5 space-y-6">{filterBody}</div>
                            <div className="p-5 border-t border-[#E5BDB0]/40 flex items-center justify-between gap-4">
                                <button onClick={clearAll} className="text-xs uppercase tracking-[0.16em] font-bold text-[#B86B5A] underline underline-offset-4">Clear All</button>
                                <button onClick={() => setShowMobileFilters(false)} className="px-8 py-3 bg-[#1A2536] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-xl">Show {total} Results</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Sort Drawer */}
                {showMobileSort && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileSort(false)} />
                        <div className="relative bg-white w-full rounded-t-[32px] shadow-2xl p-2 border-t-2 border-[#E5BDB0]">
                            {SORT_OPTIONS.map((o) => (
                                <button
                                    key={o.value}
                                    onClick={() => { setSort(o.value); setShowMobileSort(false); }}
                                    className={`w-full text-left px-4 py-4 text-sm flex items-center justify-between rounded-2xl ${sort === o.value ? "text-[#B86B5A] font-bold bg-white" : "text-[#1A2536]"
                                        }`}
                                >
                                    {o.label}
                                    {sort === o.value && <span className="text-[#B86B5A]">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}