import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import usePageTitle from "../utils/usePageTitle";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const PURITY_ORDER = ["18Kt", "14Kt"];
const COLOR_ORDER = ["Yellow", "Rose", "White"];
const SWATCH = {
    Yellow: "linear-gradient(135deg, #F7E27A, #D9A93B)",
    Rose: "linear-gradient(135deg, #F2C0AC, #D98D6F)",
    White: "linear-gradient(135deg, #F5F5F3, #C9CCD3)",
};
const RING_SIZES = ["8", "10", "12", "14", "16", "18", "20"];

export default function ProductPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();

    const [product, setProduct] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [purity, setPurity] = useState(null);
    const [color, setColor] = useState(null);
    const [size, setSize] = useState(null);
    const [showAllMedia, setShowAllMedia] = useState(false);
    const [added, setAdded] = useState(false);
    const carouselRef = useRef(null);

    usePageTitle(product?.name);

    useEffect(() => {
        setProduct(null); setNotFound(false);
        setPurity(null); setColor(null); setSize(null);
        setShowAllMedia(false); setAdded(false);
        (async () => {
            try {
                const { data } = await api.get(`/products/${slug}/`);
                setProduct(data);
            } catch { setNotFound(true); }
        })();
    }, [slug]);

    if (notFound)
        return (
            <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-24 text-center">
                <h1 className="font-serif text-4xl mb-4">Piece not found</h1>
                <p className="text-sm text-ink/60 mb-8">This design may have been retired from the collection.</p>
                <Link to="/" className="btn-solid">Back to Home</Link>
            </div>
        );

    if (!product) return <p className="text-center text-sm text-ink/50 py-24">Loading design…</p>;

    /* ── Physical stock ── */
    const media = product.media ?? [];
    const desktopMedia = showAllMedia ? media : media.slice(0, 6);
    const instances = (product.instances ?? []).filter((i) => i.status === "in_stock");
    const cheapest = instances.length
        ? instances.reduce((a, b) => (Number(a.price) <= Number(b.price) ? a : b))
        : null;

    const presentP = [...new Set(instances.map((i) => i.karat))];
    const purities = [...PURITY_ORDER.filter((p) => presentP.includes(p)), ...presentP.filter((p) => !PURITY_ORDER.includes(p))];
    const activePurity = purities.includes(purity) ? purity : (cheapest?.karat ?? purities[0]);

    const presentC = [...new Set(instances.filter((i) => i.karat === activePurity).map((i) => i.gold_color))];
    const colors = [...COLOR_ORDER.filter((c) => presentC.includes(c)), ...presentC.filter((c) => !COLOR_ORDER.includes(c))];
    const activeColor = colors.includes(color) ? color : (cheapest?.gold_color ?? colors[0]);

    const isRing = instances.some((i) => i.ring_size);
    const availableSizes = RING_SIZES.filter((s) =>
        instances.some((i) => i.karat === activePurity && i.gold_color === activeColor && i.ring_size === s)
    );
    const activeSize = RING_SIZES.includes(size)
        ? size
        : (availableSizes.includes(cheapest?.ring_size) ? cheapest.ring_size : availableSizes[0] ?? "12");

    const activeInstance = instances.find((i) =>
        i.karat === activePurity && i.gold_color === activeColor && (!isRing || i.ring_size === activeSize)
    );

    const price = activeInstance ? Number(activeInstance.price) : Number(product.base_price);

    const selection = {
        karat: activePurity,
        gold_color: activeColor,
        ring_size: isRing ? activeSize : null,
        price,
    };

    const handleAdd = () => {
        addItem(product, selection);
        setAdded(true); setTimeout(() => setAdded(false), 1500);
    };
    const handleBuyNow = () => {
        addItem(product, selection);
        navigate("/checkout");
    };

    return (
        <div>
            {/* Breadcrumb */}
            <div className="max-w-[1440px] mx-auto px-8 lg:px-20 pt-10 pb-8">
                <p className="text-xs uppercase tracking-[0.16em] text-ink/50">
                    <Link to="/" className="hover:text-gold-dark">Home</Link>
                    {" / "}
                    <Link to={`/category/${product.category?.slug ?? ""}`} className="hover:text-gold-dark">
                        {product.category_name ?? "Jewellery"}
                    </Link>
                    {" / "}{product.name}
                </p>
            </div>

            <div className="grid lg:grid-cols-[55fr_45fr]">
                {/* ── Media — full-bleed left, sequenced ── */}
                <div>
                    <div className="hidden lg:grid grid-cols-2 gap-1.5">
                        {desktopMedia.map((m, i) => (
                            <div key={i} className="overflow-hidden bg-cream">
                                {m.kind === "video" ? (
                                    <video src={m.url} className="w-full aspect-square object-cover bg-charcoal" controls muted loop playsInline preload="metadata" />
                                ) : (
                                    <img src={m.url} alt={`${product.name} — media ${i + 1}`} className="w-full aspect-square object-cover transition-transform duration-500 hover:scale-105" />
                                )}
                            </div>
                        ))}
                    </div>
                    {media.length > 6 && (
                        <button
                            onClick={() => setShowAllMedia(!showAllMedia)}
                            className="hidden lg:flex w-full items-center justify-center gap-2 py-4 bg-cream text-ink text-xs uppercase tracking-[0.16em] font-semibold hover:bg-ink hover:text-white transition-colors"
                        >
                            {showAllMedia ? "Show Less" : `Show More (${media.length - 6} more)`}
                        </button>
                    )}

                    {/* Mobile carousel */}
                    <div className="lg:hidden px-8">
                        <div
                            ref={carouselRef}
                            onScroll={(e) => {
                                const i = Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth);
                                if (i >= 0 && i < media.length) carouselRef.current.dataset.idx = i;
                            }}
                            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
                        >
                            {media.map((m, i) => (
                                <div key={i} className="w-full shrink-0 snap-center">
                                    {m.kind === "video" ? (
                                        <video src={m.url} className="w-full h-[380px] md:h-[460px] object-cover rounded-2xl bg-charcoal" controls muted loop playsInline preload="metadata" />
                                    ) : (
                                        <img src={m.url} alt={product.name} className="w-full h-[380px] md:h-[460px] object-cover rounded-2xl" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Details — right ── */}
                <div className="px-8 py-10 lg:py-12 lg:pl-10 xl:pr-20">
                    <p className="eyebrow">{product.diamond_color}·{product.diamond_clarity} Natural Diamond</p>
                    <h1 className="font-serif text-4xl md:text-5xl mt-3">{product.name}</h1>
                    <p className="text-xs uppercase tracking-[0.14em] text-ink/50 mt-2">Design Code: {product.design_code}</p>
                    <p className="text-sm text-ink/60 leading-relaxed mt-4">{product.description}</p>

                    {/* Purity */}
                    {purities.length > 0 && (
                        <div className="mt-8">
                            <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-3">Select Gold Purity:</p>
                            <div className="flex flex-wrap gap-3">
                                {purities.map((p) => (
                                    <button key={p} onClick={() => { setPurity(p); setSize(null); }}
                                        className={`text-xs font-medium px-5 py-2.5 rounded-full transition-colors ${p === activePurity ? "bg-ink text-white" : "bg-cream text-ink hover:bg-ink hover:text-white"}`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color */}
                    {colors.length > 0 && (
                        <div className="mt-6">
                            <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-3">Select Gold Colour:</p>
                            <div className="flex flex-wrap gap-3">
                                {colors.map((c) => (
                                    <button key={c} onClick={() => { setColor(c); setSize(null); }}
                                        className={`flex items-center gap-2.5 text-xs font-medium px-4 py-2.5 rounded-full border transition-colors ${c === activeColor ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink"}`}>
                                        <span className="w-4 h-4 rounded-full border border-black/10" style={{ background: SWATCH[c] ?? "#ccc" }} />
                                        {c} Gold
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ring size — physical availability */}
                    {isRing && (
                        <div className="mt-6">
                            <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-3">Select Ring Size:</p>
                            <div className="flex flex-wrap gap-3">
                                {RING_SIZES.map((s) => {
                                    const has = availableSizes.includes(s);
                                    return (
                                        <button key={s} onClick={() => setSize(s)}
                                            className={`w-24 py-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${s === activeSize ? "border-ink bg-ink text-white"
                                                : has ? "border-line bg-white text-ink hover:border-ink/40"
                                                    : "border-line bg-cream/50 text-ink/60 hover:border-ink/40"}`}>
                                            <span className="text-sm font-semibold">{s}</span>
                                            <span className={`text-[9px] uppercase tracking-[0.08em] font-medium ${s === activeSize ? "text-white/80" : has ? "text-[#3E5C4B]" : "text-gold-dark"}`}>
                                                {has ? "In Stock" : "Made to Order"}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-ink/45 mt-2">Made-to-order pieces ship in 10–12 days.</p>
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex flex-wrap items-baseline gap-3 mt-8">
                        <span className="text-3xl font-semibold text-ink">{inr(price)}</span>
                    </div>
                    <p className="text-xs text-ink/50 mt-2">Inclusive of all taxes. Free insured delivery in India.</p>

                    {/* Specification card */}
                    <div className="mt-4 rounded-xl border border-line bg-white px-5 py-4">
                        <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-3">This Piece</p>
                        {activeInstance ? (
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
                                <div className="flex justify-between gap-3"><dt className="text-ink/60">Item Code</dt><dd className="font-medium text-ink text-right">{activeInstance.item_code}</dd></div>
                                <div className="flex justify-between gap-3"><dt className="text-ink/60">Gold Karat</dt><dd className="font-medium text-ink text-right">{activeInstance.karat} {activeInstance.gold_color}</dd></div>
                                {activeInstance.ring_size && <div className="flex justify-between gap-3"><dt className="text-ink/60">Ring Size</dt><dd className="font-medium text-ink text-right">{activeInstance.ring_size}</dd></div>}
                                <div className="flex justify-between gap-3"><dt className="text-ink/60">Net Gold Weight</dt><dd className="font-medium text-ink text-right">{Number(activeInstance.actual_net_weight).toFixed(3)} g</dd></div>
                                <div className="flex justify-between gap-3"><dt className="text-ink/60">Diamond Weight</dt><dd className="font-medium text-ink text-right">{Number(activeInstance.actual_diamond_weight).toFixed(2)} Ct</dd></div>
                                {Number(activeInstance.actual_color_stone_weight) > 0 && (
                                    <div className="flex justify-between gap-3"><dt className="text-ink/60">Color Stone</dt><dd className="font-medium text-ink text-right">{Number(activeInstance.actual_color_stone_weight).toFixed(2)} Ct</dd></div>
                                )}
                                {activeInstance.report_lab && (
                                    <div className="flex justify-between gap-3"><dt className="text-ink/60">Certificate</dt><dd className="font-medium text-ink text-right">{activeInstance.report_lab} {activeInstance.report_number}</dd></div>
                                )}
                            </dl>
                        ) : (
                            <div className="text-sm text-ink/60 space-y-1.5">
                                <p className="font-medium text-gold-dark uppercase tracking-[0.12em] text-[10px]">Made to Order</p>
                                <p>This combination is crafted on request. Estimated price shown; the final price is confirmed at fabrication from live gold &amp; diamond rates.</p>
                            </div>
                        )}
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button onClick={handleAdd} disabled={!activeInstance} className="btn-solid flex-1 disabled:opacity-40 disabled:cursor-not-allowed">
                            {added ? "Added ✓" : "Add To Shopping Bag"}
                        </button>
                        <button onClick={handleBuyNow} disabled={!activeInstance} className="btn-outline flex-1 disabled:opacity-40 disabled:cursor-not-allowed">
                            Buy Now (Checkout Now)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}