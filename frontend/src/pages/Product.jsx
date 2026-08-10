import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import usePageTitle from "../utils/usePageTitle";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
        .format(Number(n) || 0);

const PURITY_ORDER = ["18Kt", "14Kt"];

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
    const [size, setSize] = useState(null);
    const [imgIdx, setImgIdx] = useState(0);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [added, setAdded] = useState(false);

    usePageTitle(product?.name);

    useEffect(() => {
        setProduct(null); setNotFound(false); setPurity(null); setSize(null);
        setImgIdx(0); setShowBreakdown(false); setAdded(false);
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

    const images = product.images?.length ? product.images : [{ url: product.primary_image }];
    const variants = product.variants ?? [];
    const present = [...new Set(variants.map((v) => v.purity))];
    const purities = [
        ...PURITY_ORDER.filter((p) => present.includes(p)),
        ...present.filter((p) => !PURITY_ORDER.includes(p)),
    ];
    const activePurity = purities.includes(purity) ? purity : purities[0];
    const sizeOptions = [
        ...new Set(variants.filter((v) => v.purity === activePurity && v.ring_size).map((v) => v.ring_size)),
    ];
    const activeSize = sizeOptions.includes(size) ? size : sizeOptions[0] ?? null;
    const variant =
        variants.find((v) => v.purity === activePurity && (!sizeOptions.length || v.ring_size === activeSize)) ??
        variants[0];

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
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-12">
            {/* Breadcrumb */}
            <p className="text-xs uppercase tracking-[0.16em] text-ink/50 mb-8">
                <Link to="/" className="hover:text-gold-dark">Home</Link>
                {" / "}
                <Link to={`/category/${product.category?.slug}`} className="hover:text-gold-dark">
                    {product.category?.name ?? "Jewellery"}
                </Link>
                {" / "}{product.name}
            </p>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* ── Gallery ─ */}
                <div>
                    <div className="rounded-2xl overflow-hidden shadow-card bg-cream">
                        <img
                            src={images[imgIdx]?.url}
                            alt={product.name}
                            className="w-full h-[420px] md:h-[560px] object-cover"
                        />
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-3 mt-4">
                            {images.map((im, i) => (
                                <button
                                    key={i}
                                    onClick={() => setImgIdx(i)}
                                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === imgIdx ? "border-gold-dark" : "border-transparent opacity-60 hover:opacity-100"
                                        }`}
                                    aria-label={`View image ${i + 1}`}
                                >
                                    <img src={im.url} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Details ── */}
                <div>
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

                    {/* Ring size */}
                    {sizeOptions.length > 0 && (
                        <div className="mt-6">
                            <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-3">Select Ring Size:</p>
                            <div className="flex flex-wrap gap-2">
                                {sizeOptions.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSize(s)}
                                        className={`w-11 h-11 rounded-full text-xs font-medium border transition-colors ${s === activeSize
                                            ? "border-ink bg-ink text-white"
                                            : "border-line bg-white text-ink hover:border-ink"
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
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
                                <dd className="font-medium text-ink text-right">{variant?.gold_color ?? "—"}</dd>
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