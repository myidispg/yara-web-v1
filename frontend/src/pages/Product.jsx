import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import { inr } from "../utils/format";

const COLOR_HEX = { yellow: "#d9b64f", rose: "#d99f86", white: "#e9e7e0" };
const COLOR_NAME = { yellow: "Yellow", rose: "Rose", white: "White" };
const STOCK_LABEL = {
    in_stock: "In stock · ships in 2–3 days", low_stock: "Low stock · ships in 2–3 days",
    out_of_stock: "Currently sold out", made_to_order: "Made to order · 2–3 weeks"
};

export default function ProductPage() {
    const { slug } = useParams();
    const { addItem } = useCart();
    const [product, setProduct] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [media, setMedia] = useState(null);
    const [color, setColor] = useState("yellow");
    const [purity, setPurity] = useState("18K");
    const [size, setSize] = useState("");
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        setProduct(null); setNotFound(false);
        api.get(`/products/${slug}/`)
            .then((r) => {
                setProduct(r.data);
                setMedia({ type: "image", src: r.data.images?.[0]?.url });
                const variants = r.data.variants || [];
                if (variants[0]) { setColor(variants[0].gold_color); setPurity(variants[0].purity); }
            })
            .catch(() => setNotFound(true));
    }, [slug]);

    const options = useMemo(() => {
        if (!product) return { colors: [], purities: [], sizes: [] };
        const v = product.variants || [];
        return {
            colors: [...new Set(v.map((x) => x.gold_color))],
            purities: [...new Set(v.map((x) => x.purity))],
            sizes: [...new Set(v.filter((x) => x.ring_size).map((x) => x.ring_size))]
                .sort((a, b) => parseFloat(a) - parseFloat(b)),
        };
    }, [product]);

    const selected = useMemo(() => {
        if (!product) return null;
        const needsSize = options.sizes.length > 0;
        return product.variants.find((v) =>
            v.gold_color === color && v.purity === purity && (!needsSize || v.ring_size === size)) || null;
    }, [product, options, color, purity, size]);

    const price = selected ? selected.price : product ? Math.min(...product.variants.map((v) => v.price)) : 0;
    const canAdd = selected && selected.in_stock && (options.sizes.length === 0 || size);

    if (notFound) {
        return <div className="py-32 text-center"><p className="font-display text-3xl">Piece not found</p><Link to="/" className="btn-ghost mt-6 inline-flex">Back home</Link></div>;
    }
    if (!product) {
        return <div className="flex min-h-[60vh] items-center justify-center"><span className="h-9 w-9 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>;
    }

    const handleAdd = () => {
        if (!canAdd) return;
        addItem(product, selected, qty);
        setAdded(true);
        setTimeout(() => setAdded(false), 2200);
    };

    return (
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-ink/50">
                <Link to="/" className="hover:text-gold-deep">Home</Link> /{" "}
                {product.category_parent && <><Link to={`/category/${product.category_parent.slug}`} className="hover:text-gold-deep">{product.category_parent.name}</Link> / </>}
                <Link to={`/category/${product.category_slug}`} className="hover:text-gold-deep">{product.category_name}</Link> /{" "}
                <span className="text-ink">{product.name}</span>
            </p>

            <div className="mt-8 grid gap-12 lg:grid-cols-2">
                {/* gallery */}
                <div>
                    <div className="relative aspect-square overflow-hidden bg-parchment">
                        {media?.type === "video" ? (
                            <video src={media.src} controls autoPlay muted loop className="h-full w-full object-cover" />
                        ) : (
                            media?.src && <img src={media.src} alt={product.name} className="h-full w-full object-cover" />
                        )}
                        {product.discount_percent > 0 && (
                            <span className="absolute left-4 top-4 bg-champagne px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-deep">−{product.discount_percent}%</span>
                        )}
                    </div>
                    <div className="mt-3 flex gap-3">
                        {product.images.map((img) => (
                            <button key={img.id} onClick={() => setMedia({ type: "image", src: img.url })}
                                className={`h-20 w-20 overflow-hidden border transition ${media?.src === img.url ? "border-gold-deep" : "border-transparent hover:border-gold"}`}>
                                <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                            </button>
                        ))}
                        {product.videos.map((v) => (
                            <button key={v.id} onClick={() => setMedia({ type: "video", src: v.video_url })}
                                className={`relative flex h-20 w-20 items-center justify-center border bg-pine text-champagne transition ${media?.type === "video" ? "border-gold-deep" : "border-transparent hover:border-gold"}`}>
                                <span className="text-xl">▶</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* details */}
                <div>
                    <p className="eyebrow">{product.category_name} · IGI certified</p>
                    <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">{product.name}</h1>

                    <div className="mt-5 flex items-baseline gap-4">
                        <p className="font-display text-3xl">{inr(price)}</p>
                        {product.mrp > product.base_price && <p className="text-lg text-ink/40 line-through">{inr(product.mrp)}</p>}
                        <p className="text-[11px] uppercase tracking-[0.2em] text-ink/45">incl. GST</p>
                    </div>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-moss">{STOCK_LABEL[product.stock_status]}</p>

                    <div className="gold-rule my-7" />

                    <div className="space-y-7">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.25em] text-ink/55">Gold · <span className="text-ink">{COLOR_NAME[color]}</span></p>
                            <div className="mt-3 flex gap-3">
                                {options.colors.map((c) => (
                                    <button key={c} onClick={() => setColor(c)} aria-label={COLOR_NAME[c]}
                                        className={`h-9 w-9 rounded-full border-2 transition ${color === c ? "border-ink scale-110" : "border-ink/15 hover:border-ink/40"}`}
                                        style={{ background: COLOR_HEX[c] }} />
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-[11px] uppercase tracking-[0.25em] text-ink/55">Purity</p>
                            <div className="mt-3 flex gap-2">
                                {options.purities.map((p) => (
                                    <button key={p} onClick={() => setPurity(p)}
                                        className={`chip ${purity === p ? "border-ink bg-ink text-ivory" : "border-ink/20 text-ink/60 hover:border-ink"}`}>
                                        {p === "14K" ? "14 KT" : "18 KT"}
                                    </button>
                                ))}
                            </div>
                            <p className="mt-2 text-xs text-ink/45">BIS 916 / 585 hallmarked · 18 KT carries a small premium</p>
                        </div>

                        {options.sizes.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] uppercase tracking-[0.25em] text-ink/55">Ring size</p>
                                    <span className="text-xs text-gold-deep underline-offset-4 hover:underline"><a href="#">Size guide</a></span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {options.sizes.map((s) => (
                                        <button key={s} onClick={() => setSize(s)}
                                            className={`chip min-w-[3.2rem] justify-center ${size === s ? "border-ink bg-ink text-ivory" : "border-ink/20 text-ink/60 hover:border-ink"}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                                {!size && <p className="mt-2 text-xs text-rust">Select a size to continue</p>}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <div className="flex items-center border border-ink/20">
                                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 hover:text-gold-deep">−</button>
                                <span className="w-8 text-center">{qty}</span>
                                <button onClick={() => setQty(qty + 1)} className="px-4 py-3 hover:text-gold-deep">+</button>
                            </div>
                            <button onClick={handleAdd} disabled={!canAdd}
                                className={`btn-gold flex-1 ${!canAdd ? "cursor-not-allowed opacity-40" : ""} ${added ? "!bg-moss !text-ivory" : ""}`}>
                                {added ? "Added to bag ✓" : canAdd ? "Add to bag" : "Unavailable"}
                            </button>
                        </div>
                    </div>

                    <div className="mt-9 space-y-0 border-t border-ink/10">
                        <details className="group border-b border-ink/10 py-4" open>
                            <summary className="flex cursor-pointer list-none justify-between text-[12px] uppercase tracking-[0.25em]">The piece <span className="text-gold transition group-open:rotate-45">+</span></summary>
                            <p className="mt-3 text-sm leading-relaxed text-ink/70">{product.description}</p>
                        </details>
                        <details className="group border-b border-ink/10 py-4">
                            <summary className="flex cursor-pointer list-none justify-between text-[12px] uppercase tracking-[0.25em]">Diamond & metal <span className="text-gold transition group-open:rotate-45">+</span></summary>
                            <p className="mt-3 text-sm leading-relaxed text-ink/70">{product.diamond_info || "Natural, IGI certified diamond."}<br />SKU: {selected?.sku || product.sku}</p>
                        </details>
                        <details className="group border-b border-ink/10 py-4">
                            <summary className="flex cursor-pointer list-none justify-between text-[12px] uppercase tracking-[0.25em]">Shipping · Returns · Warranty <span className="text-gold transition group-open:rotate-45">+</span></summary>
                            <p className="mt-3 text-sm leading-relaxed text-ink/70">Free insured delivery across India in 5–7 working days. 15-day returns. Lifetime exchange against full invoice value.</p>
                        </details>
                    </div>
                </div>
            </div>
        </div>
    );
}