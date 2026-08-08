import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import { useCategories } from "../context/CategoryContext";

const COLORS = [["", "All colours"], ["yellow", "Yellow"], ["rose", "Rose"], ["white", "White"]];
const PURITIES = [["", "All KT"], ["14K", "14 KT"], ["18K", "18 KT"]];
const SORTS = [["featured", "Featured"], ["new", "Newest"], ["price_asc", "Price · low to high"], ["price_desc", "Price · high to low"]];

export default function CategoryPage() {
    const { slug } = useParams();
    const [params, setParams] = useSearchParams();
    const { categories } = useCategories();
    const category = categories.find((c) => c.slug === slug);

    const sub = params.get("sub") || "";
    const color = params.get("color") || "";
    const purity = params.get("purity") || "";
    const sort = params.get("sort") || "featured";

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get("/products/", {
            params: {
                category: slug, ...(sub && { subcategory: sub }), ...(color && { color }),
                ...(purity && { purity }), sort
            },
        })
            .then((r) => setProducts(r.data.results ?? r.data))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [slug, sub, color, purity, sort]);

    const setParam = (k, v) => {
        const p = new URLSearchParams(params);
        if (v) p.set(k, v); else p.delete(k);
        setParams(p);
    };

    return (
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
            <Reveal>
                <p className="eyebrow">
                    <Link to="/" className="hover:text-gold-deep">Home</Link> / Collection
                </p>
                <h1 className="mt-3 font-display text-5xl tracking-tight sm:text-6xl">
                    {category?.name || slug[0].toUpperCase() + slug.slice(1)}
                </h1>
                {category?.description && <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink/60">{category.description}</p>}
            </Reveal>

            {category?.subcategories?.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                    <button onClick={() => setParam("sub", "")}
                        className={`chip ${!sub ? "border-gold-deep bg-gold-deep text-ivory" : "border-ink/20 text-ink/60 hover:border-gold-deep"}`}>
                        All
                    </button>
                    {category.subcategories.map((s) => (
                        <button key={s.slug} onClick={() => setParam("sub", s.slug === sub ? "" : s.slug)}
                            className={`chip ${sub === s.slug ? "border-gold-deep bg-gold-deep text-ivory" : "border-ink/20 text-ink/60 hover:border-gold-deep"}`}>
                            {s.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-ink/10 py-4">
                <div className="flex flex-wrap gap-2">
                    {COLORS.map(([v, l]) => (
                        <button key={l} onClick={() => setParam("color", v)}
                            className={`chip ${color === v ? "border-ink bg-ink text-ivory" : "border-ink/20 text-ink/60 hover:border-ink"}`}>{l}</button>
                    ))}
                    {PURITIES.map(([v, l]) => (
                        <button key={l} onClick={() => setParam("purity", v)}
                            className={`chip ${purity === v ? "border-ink bg-ink text-ivory" : "border-ink/20 text-ink/60 hover:border-ink"}`}>{l}</button>
                    ))}
                </div>
                <select value={sort} onChange={(e) => setParam("sort", e.target.value)}
                    className="border border-ink/20 bg-transparent px-3 py-2 text-[11px] uppercase tracking-[0.18em] outline-none">
                    {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="animate-pulse"><div className="aspect-[4/5] bg-parchment" /><div className="mt-4 h-3 w-2/3 bg-parchment" /><div className="mt-2 h-3 w-1/3 bg-parchment" /></div>
                    ))}
                </div>
            ) : products.length ? (
                <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
                    {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
            ) : (
                <div className="py-24 text-center">
                    <p className="font-display text-3xl">Nothing here yet</p>
                    <p className="mt-2 text-sm text-ink/55">Try clearing a filter, or explore another collection.</p>
                </div>
            )}
        </div>
    );
}