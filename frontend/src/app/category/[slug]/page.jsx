"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import api from "@/api/client";
import ProductCard from "@/components/ProductCard";

const PAGE = 18;

const TITLES = {
    rings: ["Natural Diamond & Gold Rings", "Explore handcrafted natural diamond rings set in 14Kt and 18Kt Solid Gold."],
    earrings: ["Diamond Earrings", "Studs, huggies & drops in certified natural diamonds."],
    necklaces: ["Necklaces & Pendants", "Solitaire drops & fine chains in 14Kt & 18Kt gold."],
    bracelets: ["Tennis Collection", "Diamond bracelets & bangles in classic silhouettes."],
    solitaires: ["Solitaires", "Engagement rings & solitaire bands, crafted forever."],
    "color-stone": ["Color Stone Fine Jewellery", "Ruby, sapphire & emerald accents with natural diamonds."],
};

const KARAT_OPTIONS = ["18Kt", "14Kt"];
const COLOR_OPTIONS = ["Yellow", "Rose", "White"];
const SWATCH = {
    Yellow: "linear-gradient(135deg, #F7E27A, #D9A93B)",
    Rose: "linear-gradient(135deg, #F2C0AC, #D98D6F)",
    White: "linear-gradient(135deg, #F5F5F3, #C9CCD3)",
};
const SORT_OPTIONS = [
    { value: "newest", label: "Newest Arrivals" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
];

const BANNERS = [
    { position: 4, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop", title: "Every piece tells a story.", subtitle: "Handcrafted to be worn, loved, and passed down." },
    { position: 11, image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600&auto=format&fit=crop", title: "Certified forever.", subtitle: "IGI & GIA certified natural diamonds, 100% earth-mined." },
    { position: 17, image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop", title: "Crafted for you.", subtitle: "14Kt & 18Kt solid gold, BIS hallmarked for life." },
    { position: 22, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop", title: "Worn every day.", subtitle: "Effortless fine jewellery for the modern woman." },
];

export default function CategoryPage() {
    const { slug } = useParams();
    const [sel, setSel] = useState({ karat: [], color: [] });
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

    const [title, subtitle] = TITLES[slug] ?? ["Fine Jewellery", "Handcrafted natural diamond jewellery in 14Kt & 18Kt solid gold."];

    useEffect(() => {
        document.title = `${title} | YA-RA Jewels`;
        setMounted(true);
    }, [title]);

    const hasMore = items.length < total;
    const activeCount = sel.karat.length + sel.color.length + (inStockOnly ? 1 : 0);

    const toggle = (group, value) =>
        setSel((s) => ({
            ...s,
            [group]: s[group].includes(value) ? s[group].filter((v) => v !== value) : [...s[group], value],
        }));

    const clearAll = () => { setSel({ karat: [], color: [] }); setInStockOnly(false); };

    const buildParams = (offset) => {
        const p = { category: slug, limit: PAGE, offset, sort };
        if (sel.karat.length) p.purity = sel.karat;
        if (sel.color.length) p.color = sel.color;
        if (inStockOnly) p.in_stock = "1";
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

    useEffect(() => {
        if (!mounted) return;
        setItems([]); setTotal(0);
        fetchPage(0, false);
    }, [slug, sel, inStockOnly, sort, mounted]);

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node || loading || loadingMore || !hasMore || !mounted) return;
        const obs = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            obs.disconnect();
            fetchPage(items.length, true);
        }, { rootMargin: "300px 0px" });
        obs.observe(node);
        return () => obs.disconnect();
    }, [items.length, hasMore, loading, loadingMore, mounted]);

    if (!mounted) return (
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-12">
            <p className="text-xs uppercase tracking-[0.16em] text-ink/50 mb-4">Loading…</p>
        </div>
    );

    const Chip = ({ group, value, children }) => (
        <button
            onClick={() => toggle(group, value)}
            className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${sel[group].includes(value)
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white text-ink hover:border-ink hover:bg-ink hover:text-white"
                }`}
        >
            {children ?? value}
        </button>
    );

    const filterBody = (
        <>
            <div>
                <h3 className="text-xs uppercase tracking-[0.16em] font-semibold text-gold-dark mb-3">Gold Purity</h3>
                <div className="flex flex-wrap gap-2">
                    {KARAT_OPTIONS.map((k) => <Chip key={k} group="karat" value={k} />)}
                </div>
            </div>
            <div>
                <h3 className="text-xs uppercase tracking-[0.16em] font-semibold text-gold-dark mb-3">Gold Colour</h3>
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
            <div>
                <h3 className="text-xs uppercase tracking-[0.16em] font-semibold text-gold-dark mb-3">Availability</h3>
                <button
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`w-full flex items-center justify-between text-xs font-medium px-4 py-3 rounded-lg border transition-colors ${inStockOnly ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink/40"
                        }`}
                >
                    In Stock Only
                    <span className={`w-9 h-5 rounded-full relative transition-colors ${inStockOnly ? "bg-gold-dark" : "bg-line"}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${inStockOnly ? "left-4" : "left-0.5"}`} />
                    </span>
                </button>
            </div>
        </>
    );

    const cells = [];
    let p = 0;
    while (p < items.length) {
        const pos = cells.length;
        const banner = BANNERS.find((b) => b.position === pos);
        if (banner) {
            cells.push(
                <div key={`banner-${banner.position}`} className="relative rounded-xl overflow-hidden shadow-card">
                    <img src={banner.image} alt={banner.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
                    <div className="relative aspect-square flex flex-col justify-end p-6 text-white">
                        <p className="font-serif text-2xl leading-tight mb-1">{banner.title}</p>
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
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-12 pb-28 lg:pb-12">
            <p className="text-xs uppercase tracking-[0.16em] text-ink/50 mb-4">
                <Link href="/" className="hover:text-gold-dark">Home</Link> / Jewellery / {title}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl mb-2">{title}</h1>
            <p className="text-sm text-ink/60 mb-8">{subtitle}</p>

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4 mb-6">
                <span className="text-xs text-ink/50">Showing {items.length} of {total} Designs</span>
                <label className="hidden lg:flex items-center gap-3 text-xs">
                    <span className="uppercase tracking-[0.16em] font-medium">Sort By:</span>
                    <select value={sort} onChange={(e) => setSort(e.target.value)}
                        className="border border-line bg-white px-4 py-2 text-sm rounded-md focus:outline-none focus:border-gold-dark">
                        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </label>
            </div>

            <div className="flex gap-6 lg:grid lg:grid-cols-[280px_1fr]">
                <aside className="hidden lg:block space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs uppercase tracking-[0.16em] font-semibold">Filter Products</h2>
                        <button onClick={clearAll} className="text-xs text-gold-dark underline underline-offset-4 hover:text-ink transition-colors">Clear All</button>
                    </div>
                    {filterBody}
                </aside>

                <div className="flex-1">
                    {loading ? (
                        <p className="text-sm text-ink/50">Loading designs…</p>
                    ) : items.length ? (
                        <>
                            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">{cells}</div>
                            {hasMore && <div ref={sentinelRef} className="h-10" aria-hidden="true" />}
                            {loadingMore && <p className="text-center text-[10px] uppercase tracking-[0.2em] text-ink/50 mt-6">Loading more designs…</p>}
                            {!hasMore && total > PAGE && <p className="text-center text-[10px] uppercase tracking-[0.2em] text-ink/50 mt-8">You've viewed all {total} designs.</p>}
                        </>
                    ) : (
                        <p className="text-sm text-ink/50">No designs match your filters yet.</p>
                    )}
                </div>
            </div>

            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-line px-4 py-3.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <button onClick={() => setShowMobileFilters(true)} className="flex items-center gap-2.5 text-ink font-medium text-sm">
                    Filter
                    {activeCount > 0 && (
                        <span className="bg-blush text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>
                    )}
                </button>
                <div className="w-px h-6 bg-line" />
                <button onClick={() => setShowMobileSort(true)} className="flex items-center gap-2.5 text-ink font-medium text-sm">
                    Sort: <span className="text-gold-dark">{SORT_OPTIONS.find((o) => o.value === sort)?.label}</span>
                </button>
            </div>

            {showMobileFilters && (
                <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
                    <div className="absolute inset-0 bg-ink/40" onClick={() => setShowMobileFilters(false)} />
                    <div className="relative bg-white w-full max-h-[85vh] rounded-t-2xl flex flex-col shadow-hero">
                        <div className="flex items-center justify-between p-5 border-b border-line">
                            <h3 className="font-serif text-xl">Filter Products</h3>
                            <button onClick={() => setShowMobileFilters(false)} className="text-ink/60 hover:text-ink">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">{filterBody}</div>
                        <div className="p-5 border-t border-line flex items-center justify-between gap-4">
                            <button onClick={clearAll} className="text-xs uppercase tracking-[0.16em] font-medium text-gold-dark underline underline-offset-4">Clear All</button>
                            <button onClick={() => setShowMobileFilters(false)} className="btn-solid flex-1 max-w-xs justify-center">Show {total} Results</button>
                        </div>
                    </div>
                </div>
            )}

            {showMobileSort && (
                <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
                    <div className="absolute inset-0 bg-ink/40" onClick={() => setShowMobileSort(false)} />
                    <div className="relative bg-white w-full rounded-t-2xl shadow-hero p-2">
                        {SORT_OPTIONS.map((o) => (
                            <button key={o.value}
                                onClick={() => { setSort(o.value); setShowMobileSort(false); }}
                                className={`w-full text-left px-4 py-4 text-sm flex items-center justify-between rounded-lg ${sort === o.value ? "text-gold-dark font-semibold" : "text-ink"}`}>
                                {o.label}
                                {sort === o.value && <span>✓</span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}