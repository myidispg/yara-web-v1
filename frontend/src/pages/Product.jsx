import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import usePageTitle from "../utils/usePageTitle";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
        .format(Number(n) || 0);

const PURITY_ORDER = ["14Kt", "18Kt"];
const COLOR_ORDER = ["Yellow", "Rose", "White"];
const SWATCH = {
    Yellow: "linear-gradient(135deg, #F7E27A, #D9A93B)",
    Rose: "linear-gradient(135deg, #F2C0AC, #D98D6F)",
    White: "linear-gradient(135deg, #F5F5F3, #C9CCD3)",
};
const RING_SIZES = ["8", "10", "12", "14", "16", "18", "20"];

const ChevronIcon = ({ open }) => (
    <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

export default function ProductPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();

    const [product, setProduct] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [purity, setPurity] = useState(null);
    const [color, setColor] = useState(null);
    const [size, setSize] = useState(null);
    const [imgIdx, setImgIdx] = useState(0);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [added, setAdded] = useState(false);
    const [showAllMedia, setShowAllMedia] = useState(false);
    const carouselRef = useRef(null);

    usePageTitle(product?.name);

    useEffect(() => {
        setProduct(null); setNotFound(false); setPurity(null); setColor(null); setSize(null);
        setImgIdx(0); setShowBreakdown(false); setAdded(false); setShowAllMedia(false);
        (async () => {
            try {
                const { data } = await api.get(`/products/${slug}/`);
                setProduct(data);
            } catch {
                try {
                    const { data } = await api.get("/products/");
                    const list = data?.results ?? data ?? [];
                    const found = list.find((p) => p.slug === slug);
                    if (found) setProduct(found); else setNotFound(true);
                } catch { setNotFound(true); }
            }
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

    /* ── Media (photos + videos, any mix) ── */
    const images = product.images?.length
        ? product.images
        : [{ url: product.primary_image, kind: "image" }];
    const isVideo = (m) =>
        m.kind === "video" || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(m.url ?? "");
    const desktopMedia = showAllMedia ? images : images.slice(0, 6);

    /* ── Variants / pricing ── */
    const variants = product.variants ?? [];
    const isRing = variants.some(v => v.ring_size);

    // Auto-select the cheapest variant to set initial defaults
    const cheapestVariant = variants.length > 0
        ? variants.reduce((prev, curr) => (Number(curr.price) < Number(prev.price) ? curr : prev))
        : null;

    // Purity
    const presentPurities = [...new Set(variants.map((v) => v.purity))];
    const purities = [
        ...PURITY_ORDER.filter((p) => presentPurities.includes(p)),
        ...presentPurities.filter((p) => !PURITY_ORDER.includes(p)),
    ];
    const activePurity = purities.includes(purity) ? purity : (cheapestVariant?.purity || purities[0]);

    // Color
    const presentColors = [...new Set(variants.map((v) => v.gold_color))];
    const colors = [
        ...COLOR_ORDER.filter((c) => presentColors.includes(c)),
        ...presentColors.filter((c) => !COLOR_ORDER.includes(c)),
    ];
    const activeColor = colors.includes(color) ? color : (cheapestVariant?.gold_color || colors[0]);

    // Size
    const sizeOptions = isRing ? RING_SIZES : [];
    const activeSize = sizeOptions.includes(size) ? size : (cheapestVariant?.ring_size || sizeOptions[0]) ?? null;

    // Find active variant (respects exact purity + color + size combination)
    const variant = variants.find(v =>
        v.purity === activePurity &&
        v.gold_color === activeColor &&
        (!sizeOptions.length || v.ring_size === activeSize)
    ) ?? variants.find(v => v.purity === activePurity && v.gold_color === activeColor) ?? variants[0];

    const isVariantInStock = variant && Number(variant.stock) > 0;

    const price = variant?.price ?? product.price;
    const compare = product.compare_at_price;
    const off = compare && price ? Math.round((1 - Number(price) / Number(compare)) * 100) : null;

    const handleAdd = () => {
        addItem(product, variant, 1);
        setAdded(true); setTimeout(() => setAdded(false), 1500);
    };
    const handleBuyNow = () => { addItem(product, variant, 1); navigate("/checkout"); };

    const BreakRow = ({ label, value }) =>
        value == null ? null : (
            <div className="flex items-center justify-between text-sm">
                <span className="text-ink/60">{label}</span>
                <span className="font-medium text-ink">{inr(value)}</span>
            </div>
        );

    return (
        <div>
            {/* Breadcrumb */}
            <div className="max-w-[1440px] mx-auto px-8 lg:px-20 pt-10 pb-8">
                <p className="text-xs uppercase tracking-[0.16em] text-ink/50">
                    <Link to="/" className="hover:text-gold-dark">Home</Link>
                    {" / "}
                    <Link to={`/category/${product.category?.slug}`} className="hover:text-gold-dark">
                        {product.category?.name ?? "Jewellery"}
                    </Link>
                    {" / "}{product.name}
                </p>
            </div>

            {/* 55% media · 45% info */}
            <div className="grid lg:grid-cols-[55fr_45fr]">
                {/* ── Media — full-bleed left ── */}
                <div>
                    {/* Desktop: 2-col grid, 6 by default, rest behind Show More */}
                    <div className="hidden lg:grid grid-cols-2 gap-1.5">
                        {desktopMedia.map((im, i) => (
                            <div key={i} className="overflow-hidden bg-cream">
                                {isVideo(im) ? (
                                    <video
                                        src={im.url}
                                        className="w-full aspect-square object-cover bg-charcoal"
                                        controls muted loop playsInline preload="metadata"
                                    />
                                ) : (
                                    <img
                                        src={im.url}
                                        alt={`${product.name} — view ${i + 1}`}
                                        className="w-full aspect-square object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    {images.length > 6 && (
                        <button
                            onClick={() => setShowAllMedia(!showAllMedia)}
                            className="hidden lg:flex w-full items-center justify-center gap-2 py-4 bg-cream text-ink text-xs uppercase tracking-[0.16em] font-semibold hover:bg-ink hover:text-white transition-colors"
                        >
                            {showAllMedia ? "Show Less" : `Show More (${images.length - 6} more)`}
                            <ChevronIcon open={showAllMedia} />
                        </button>
                    )}

                    {/* Mobile / tablet: swipe carousel + dots + thumbs */}
                    <div className="lg:hidden px-8">
                        <div
                            ref={carouselRef}
                            onScroll={(e) => {
                                const i = Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth);
                                if (i !== imgIdx && i >= 0 && i < images.length) setImgIdx(i);
                            }}
                            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
                        >
                            {images.map((im, i) => (
                                <div key={i} className="w-full shrink-0 snap-center">
                                    {isVideo(im) ? (
                                        <video
                                            src={im.url}
                                            className="w-full h-[380px] md:h-[460px] object-cover rounded-2xl bg-charcoal"
                                            controls muted loop playsInline preload="metadata"
                                        />
                                    ) : (
                                        <img
                                            src={im.url}
                                            alt={product.name}
                                            className="w-full h-[380px] md:h-[460px] object-cover rounded-2xl"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        {images.length > 1 && (
                            <>
                                <div className="flex justify-center gap-2 mt-4">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() =>
                                                carouselRef.current?.scrollTo({
                                                    left: i * carouselRef.current.clientWidth,
                                                    behavior: "smooth",
                                                })
                                            }
                                            className={`h-2 rounded-full transition-all ${i === imgIdx ? "w-6 bg-ink" : "w-2 bg-line"}`}
                                            aria-label={`Go to image ${i + 1}`}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-3 mt-4 justify-center">
                                    {images.map((im, i) => (
                                        <button
                                            key={i}
                                            onClick={() =>
                                                carouselRef.current?.scrollTo({
                                                    left: i * carouselRef.current.clientWidth,
                                                    behavior: "smooth",
                                                })
                                            }
                                            className={`w-16 h-16 rounded-lg overflow-hidden border-2 bg-white transition-all ${i === imgIdx ? "border-gold-dark" : "border-line opacity-70"}`}
                                            aria-label={`View image ${i + 1}`}
                                        >
                                            {isVideo(im) ? (
                                                <span className="w-full h-full flex items-center justify-center bg-charcoal text-white">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                                </span>
                                            ) : (
                                                <img src={im.url} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Details — right 45% ── */}
                <div className="px-8 py-10 lg:py-12 lg:pl-10 xl:pr-20">
                    <p className="eyebrow">{product.certification ?? "SGL/IGI"} Certified Natural Diamond</p>
                    <h1 className="font-serif text-4xl md:text-5xl mt-3">{product.name}</h1>
                    <p className="text-sm text-ink/60 leading-relaxed mt-4">{product.description}</p>

                    {/* Purity */}
                    {purities.length > 0 && (
                        <div className="mt-8">
                            <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-3">Select Gold Purity:</p>
                            <div className="flex flex-wrap gap-3">
                                {purities.map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPurity(p)}
                                        className={`text-xs font-medium px-5 py-2.5 rounded-full transition-colors ${p === activePurity
                                            ? "bg-ink text-white"
                                            : "bg-cream text-ink hover:bg-ink hover:text-white"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gold Color */}
                    {colors.length > 0 && (
                        <div className="mt-6">
                            <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-3">Select Gold Colour:</p>
                            <div className="flex flex-wrap gap-3">
                                {colors.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        className={`flex items-center gap-2.5 text-xs font-medium px-4 py-2.5 rounded-full border transition-colors ${c === activeColor
                                            ? "border-ink bg-ink text-white"
                                            : "border-line bg-white text-ink hover:border-ink"
                                            }`}
                                    >
                                        <span
                                            className="w-4 h-4 rounded-full border border-black/10"
                                            style={{ background: SWATCH[c] ?? "#ccc" }}
                                        />
                                        {c} Gold
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ring size */}
                    {sizeOptions.length > 0 && (
                        <div className="mt-6">
                            <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-3">Select Ring Size:</p>
                            <div className="flex flex-wrap gap-3">
                                {sizeOptions.map((s) => {
                                    const sizeVariant = variants.find(v => v.purity === activePurity && v.gold_color === activeColor && v.ring_size === s);
                                    const inStock = sizeVariant && Number(sizeVariant.stock) > 0;
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => setSize(s)}
                                            className={`w-24 py-3 rounded-lg border transition-all flex flex-col items-center justify-center gap-1 ${s === activeSize
                                                    ? "border-ink bg-ink text-white"
                                                    : "border-line bg-white text-ink hover:border-ink/40"
                                                }`}
                                        >
                                            <span className="text-sm font-semibold">{s}</span>
                                            <span className={`text-[9px] uppercase tracking-[0.08em] font-medium ${s === activeSize
                                                    ? 'text-white/80'
                                                    : (inStock ? 'text-[#3E5C4B]' : 'text-ink/40')
                                                }`}>
                                                {inStock ? 'In Stock' : 'Made to Order'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex flex-wrap items-baseline gap-3 mt-8">
                        <span className="text-3xl font-semibold text-ink">{inr(price)}</span>
                        {compare && <s className="text-lg text-ink/40">{inr(compare)}</s>}
                        {off > 0 && (
                            <span className="bg-blush text-white text-[10px] font-bold tracking-[0.12em] px-3 py-1 rounded-full">
                                {off}% OFF
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-ink/50 mt-2">Inclusive of all taxes.</p>


                    {/* Product Information */}
                    <div className="mt-4 rounded-xl border border-line bg-white px-5 py-4">
                        <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-3">Product Information</p>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
                            <div className="flex justify-between gap-3">
                                <dt className="text-ink/60">Gold Karat</dt>
                                <dd className="font-medium text-ink text-right">{activePurity ?? "—"} Solid Gold</dd>
                            </div>
                            <div className="flex justify-between gap-3">
                                <dt className="text-ink/60">Gold Net Weight</dt>
                                <dd className="font-medium text-ink text-right">
                                    {variant?.gold_weight_grams ? `${variant.gold_weight_grams} g` : "—"}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-3">
                                <dt className="text-ink/60">Gold Tone</dt>
                                <dd className="font-medium text-ink text-right">{activeColor ?? "—"}</dd>
                            </div>
                            {sizeOptions.length > 0 && (
                                <div className="flex justify-between gap-3">
                                    <dt className="text-ink/60">Ring Size</dt>
                                    <dd className="font-medium text-ink text-right">{activeSize ?? "—"}</dd>
                                </div>
                            )}
                            <div className="flex justify-between gap-3">
                                <dt className="text-ink/60">Diamond Size</dt>
                                <dd className="font-medium text-ink text-right">{product.carat ? `${product.carat} Ct` : "—"}</dd>
                            </div>
                            <div className="flex justify-between gap-3">
                                <dt className="text-ink/60">Diamond Grade</dt>
                                <dd className="font-medium text-ink text-right">
                                    {(product.diamond_quality ?? "—").replace("-", " - ")}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-3">
                                <dt className="text-ink/60">Diamond Cut</dt>
                                <dd className="font-medium text-ink text-right">Excellent / Ideal</dd>
                            </div>
                            <div className="flex justify-between gap-3">
                                <dt className="text-ink/60">Certification</dt>
                                <dd className="font-medium text-ink text-right">{product.certification ?? "IGI"} Certified</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Breakdown */}
                    <div className="mt-6 rounded-xl border border-line bg-white overflow-hidden">
                        <button
                            onClick={() => setShowBreakdown(!showBreakdown)}
                            className="w-full flex items-center justify-between px-5 py-4 text-xs uppercase tracking-[0.16em] font-semibold hover:text-gold-dark transition-colors"
                        >
                            View Price Breakdown
                            <ChevronIcon open={showBreakdown} />
                        </button>
                        {showBreakdown && variant && (
                            <div className="px-5 pb-5 pt-4 border-t border-line space-y-2.5">
                                <BreakRow label={`Gold (${activePurity}, ${variant.gold_weight_grams ?? "–"}g)`} value={variant.gold_value} />
                                <BreakRow label={`Natural Diamond (${product.carat ?? "–"} Ct)`} value={variant.diamond_value} />
                                <BreakRow label="Making Charges" value={variant.making_charges} />
                                <BreakRow label="GST (3%)" value={variant.gst_amount} />
                                <div className="flex items-center justify-between text-sm border-t border-line pt-2.5">
                                    <span className="font-semibold text-ink">Total</span>
                                    <span className="font-semibold text-ink">
                                        {inr(
                                            Number(variant.gold_value ?? 0) +
                                            Number(variant.diamond_value ?? 0) +
                                            Number(variant.making_charges ?? 0) +
                                            Number(variant.gst_amount ?? 0)
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button onClick={handleAdd} className="btn-solid flex-1">
                            {added ? "Added ✓" : "Add To Shopping Bag"}
                        </button>
                        <button onClick={handleBuyNow} className="btn-outline flex-1">
                            Buy Now (Checkout Now)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}