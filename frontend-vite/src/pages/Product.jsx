import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import usePageTitle from "../utils/usePageTitle";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const KARATS = ["14Kt", "18Kt"];
const COLORS = ["Yellow", "Rose", "White"];
const SWATCH = {
    Yellow: "linear-gradient(135deg, #F7E27A, #D9A93B)",
    Rose: "linear-gradient(135deg, #F2C0AC, #D98D6F)",
    White: "linear-gradient(135deg, #F5F5F3, #C9CCD3)",
};
const RING_SIZES = ["6", "8", "10", "12", "14", "16", "18", "20"];

const ChevronIcon = ({ open }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? "rotate-180" : ""}`}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const BreakRow = ({ label, value }) =>
    value == null ? null : (
        <div className="flex items-center justify-between text-sm">
            <span className="text-ink/60">{label}</span>
            <span className="font-medium text-ink">{inr(value)}</span>
        </div>
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
    const [showAllMedia, setShowAllMedia] = useState(false);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [added, setAdded] = useState(false);
    const [zoomedImage, setZoomedImage] = useState(null);
    const carouselRef = useRef(null);

    usePageTitle(product?.name);

    useEffect(() => {
        setProduct(null); setNotFound(false);
        setPurity(null); setColor(null); setSize(null);
        setShowAllMedia(false); setAdded(false); setShowBreakdown(false);
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

    /* ── Logic ── */
    const media = product.media ?? [];
    const desktopMedia = showAllMedia ? media : media.slice(0, 6);
    const allInstances = product.instances ?? [];
    const inStockInstances = allInstances.filter(i => i.status === "in_stock");
    const isRing = product.category_name === "Rings" || product.category_name === "Solitaires";

    // Auto-select cheapest IN-STOCK variant. If none in stock, fallback to cheapest overall (MTO).
    const cheapestInStock = inStockInstances.length
        ? inStockInstances.reduce((a, b) => (Number(a.price || a.calculated_price) <= Number(b.price || b.calculated_price) ? a : b))
        : null;
    const cheapestOverall = allInstances.length
        ? allInstances.reduce((a, b) => (Number(a.price || a.calculated_price) <= Number(b.price || b.calculated_price) ? a : b))
        : null;
    const defaultSelection = cheapestInStock ?? cheapestOverall;

    const activePurity = KARATS.includes(purity) ? purity : (defaultSelection?.karat ?? KARATS[0]);
    const activeColor = COLORS.includes(color) ? color : (defaultSelection?.gold_color ?? COLORS[0]);
    const activeSize = isRing ? (RING_SIZES.includes(size) ? size : (defaultSelection?.ring_size ?? "12")) : null;

    // Find matching instances for current selection
    const matchingInstances = allInstances.filter(i =>
        i.karat === activePurity &&
        i.gold_color === activeColor &&
        (!isRing || i.ring_size === activeSize)
    );

    const inStockMatching = matchingInstances.filter(i => i.status === "in_stock");
    const stockCount = inStockMatching.length;
    const activeInstance = inStockMatching[0] ?? matchingInstances[0] ?? null;

    // Price calculation (Live for MTO, snapshot for in-stock)
    let price, breakdown, netWeight, diaWeight;
    if (activeInstance) {
        price = Number(activeInstance.price || activeInstance.calculated_price);
        breakdown = {
            gold_value: Number(activeInstance.gold_value),
            diamond_value: Number(activeInstance.diamond_value),
            making_charges: Number(activeInstance.making_charges),
            gst_amount: Number(activeInstance.gst_amount),
        };
        netWeight = Number(activeInstance.actual_net_weight).toFixed(3);
        diaWeight = Number(activeInstance.actual_diamond_weight).toFixed(2);
    } else {
        // MTO Calculation
        const rc = product.rate_card;
        if (rc) {
            let baseWeight = Number(product.base_net_weight_14kt);
            if (isRing && activeSize) {
                const sizeDiff = Number(activeSize) - 12;
                const steps = Math.floor(sizeDiff / 2);
                baseWeight = baseWeight * Math.pow(1.03, steps);
            }
            if (activePurity === "18Kt") baseWeight *= 1.20;

            const goldRate = activePurity === "18Kt" ? rc.gold_rate_18kt : rc.gold_rate_14kt;
            const goldValue = baseWeight * goldRate;
            const diaValue = Number(product.total_diamond_weight) * rc.diamond_rate_per_carat;
            const making = (goldValue + diaValue) * (rc.making_charges_percentage / 100);
            const gst = (goldValue + diaValue + making) * (rc.gst_percentage / 100);

            price = Math.round(goldValue + diaValue + making + gst);
            breakdown = { gold_value: Math.round(goldValue), diamond_value: Math.round(diaValue), making_charges: Math.round(making), gst_amount: Math.round(gst) };
            netWeight = baseWeight.toFixed(3);
            diaWeight = Number(product.total_diamond_weight).toFixed(2);
        } else {
            price = Number(product.base_price);
            breakdown = {};
            netWeight = Number(product.base_net_weight_14kt).toFixed(3);
            diaWeight = Number(product.total_diamond_weight).toFixed(2);
        }
    }

    const selection = { karat: activePurity, gold_color: activeColor, ring_size: activeSize, price };

    const handleAdd = () => { addItem(product, selection); setAdded(true); setTimeout(() => setAdded(false), 1500); };
    const handleBuyNow = () => { addItem(product, selection); navigate("/checkout"); };

    return (
        <div>
            {/* Image Zoom Modal */}
            {zoomedImage && (
                <div className="fixed inset-0 z-50 bg-ink/95 flex items-center justify-center p-4 md:p-8 cursor-zoom-out" onClick={() => setZoomedImage(null)}>
                    <button className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white text-xl hover:bg-white/20 transition-colors" onClick={() => setZoomedImage(null)} aria-label="Close zoom">✕</button>
                    <img src={zoomedImage.url} alt="Zoomed view" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            {/* Breadcrumb */}
            <div className="max-w-[1440px] mx-auto px-8 lg:px-20 pt-10 pb-8">
                <p className="text-xs uppercase tracking-[0.16em] text-ink/50">
                    <Link to="/" className="hover:text-gold-dark">Home</Link>
                    {" / "}
                    <Link to={`/category/${product.category?.slug ?? ""}`} className="hover:text-gold-dark">{product.category_name ?? "Jewellery"}</Link>
                    {" / "}{product.name}
                </p>
            </div>

            <div className="grid lg:grid-cols-[55fr_45fr]">
                {/* ── Media ── */}
                <div>
                    <div className="hidden lg:grid grid-cols-2 gap-1.5">
                        {desktopMedia.map((m, i) => (
                            <div key={i} className="overflow-hidden bg-cream">
                                {m.kind === "video" ? (
                                    <video src={m.url} className="w-full aspect-square object-cover bg-charcoal" controls muted loop playsInline preload="metadata" />
                                ) : (
                                    <img src={m.url} alt={`${product.name} — media ${i + 1}`} className="w-full aspect-square object-cover transition-transform duration-500 hover:scale-105 cursor-zoom-in" onClick={() => setZoomedImage(m)} />
                                )}
                            </div>
                        ))}
                    </div>
                    {media.length > 6 && (
                        <button onClick={() => setShowAllMedia(!showAllMedia)} className="hidden lg:flex w-full items-center justify-center gap-2 py-4 bg-cream text-ink text-xs uppercase tracking-[0.16em] font-semibold hover:bg-ink hover:text-white transition-colors">
                            {showAllMedia ? "Show Less" : `Show More (${media.length - 6} more)`}
                        </button>
                    )}

                    <div className="lg:hidden px-8">
                        <div ref={carouselRef} className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
                            {media.map((m, i) => (
                                <div key={i} className="w-full shrink-0 snap-center">
                                    {m.kind === "video" ? (
                                        <video src={m.url} className="w-full h-[380px] md:h-[460px] object-cover rounded-2xl bg-charcoal" controls muted loop playsInline preload="metadata" />
                                    ) : (
                                        <img src={m.url} alt={product.name} className="w-full h-[380px] md:h-[460px] object-cover rounded-2xl cursor-zoom-in" onClick={() => setZoomedImage(m)} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Details ── */}
                <div className="px-8 py-10 lg:py-12 lg:pl-10 xl:pr-20">
                    <p className="eyebrow">{product.diamond_color}·{product.diamond_clarity} Natural Diamond</p>
                    <h1 className="font-serif text-4xl md:text-5xl mt-3">{product.name}</h1>
                    <p className="text-xs uppercase tracking-[0.14em] text-ink/50 mt-2">Design Code: {product.design_code}</p>
                    <p className="text-sm text-ink/60 leading-relaxed mt-4">{product.description}</p>

                    {/* Purity */}
                    <div className="mt-8">
                        <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-3">Select Gold Purity:</p>
                        <div className="flex flex-wrap gap-3">
                            {KARATS.map((p) => (
                                <button key={p} onClick={() => { setPurity(p); setSize(null); }} className={`text-xs font-medium px-5 py-2.5 rounded-full transition-colors ${p === activePurity ? "bg-ink text-white" : "bg-cream text-ink hover:bg-ink hover:text-white"}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color */}
                    <div className="mt-6">
                        <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-3">Select Gold Colour:</p>
                        <div className="flex flex-wrap gap-3">
                            {COLORS.map((c) => (
                                <button key={c} onClick={() => { setColor(c); setSize(null); }} className={`flex items-center gap-2.5 text-xs font-medium px-4 py-2.5 rounded-full border transition-colors ${c === activeColor ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink"}`}>
                                    <span className="w-4 h-4 rounded-full border border-black/10" style={{ background: SWATCH[c] ?? "#ccc" }} />
                                    {c} Gold
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ring size OR Stock Indicator */}
                    {isRing ? (
                        <div className="mt-6">
                            <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-3">Select Ring Size:</p>
                            <div className="flex flex-wrap gap-3">
                                {RING_SIZES.map((s) => {
                                    const sizeMatches = allInstances.filter(i => i.karat === activePurity && i.gold_color === activeColor && i.ring_size === s);
                                    const inStockSizeMatches = sizeMatches.filter(i => i.status === "in_stock");
                                    const count = inStockSizeMatches.length;
                                    const isInStock = count > 0;

                                    return (
                                        <button key={s} onClick={() => setSize(s)} className={`w-24 py-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${s === activeSize ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink/40"}`}>
                                            <span className="text-sm font-semibold">{s}</span>
                                            <span className={`text-[9px] uppercase tracking-[0.08em] font-medium ${s === activeSize ? "text-white/80" : isInStock ? "text-[#3E5C4B]" : "text-gold-dark"}`}>
                                                {isInStock ? `${count} pc${count > 1 ? "s" : ""} in stock` : "Made to Order"}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6">
                            {stockCount > 0 ? (
                                <p className="text-xs text-[#3E5C4B] font-semibold flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#3E5C4B]"></span>
                                    {stockCount} pc{stockCount > 1 ? "s" : ""} in stock · Ready to ship
                                </p>
                            ) : (
                                <p className="text-xs text-gold-dark font-semibold flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-gold-dark"></span>
                                    Made to Order · Ships in 10-12 days
                                </p>
                            )}
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex flex-wrap items-baseline gap-3 mt-8">
                        <span className="text-3xl font-semibold text-ink">{inr(price)}</span>
                    </div>
                    <p className="text-xs text-ink/50 mt-2">Inclusive of all taxes. Free insured delivery in India.</p>

                    {/* Breakdown */}
                    <div className="mt-4 rounded-xl border border-line bg-white overflow-hidden">
                        <button onClick={() => setShowBreakdown(!showBreakdown)} className="w-full flex items-center justify-between px-5 py-4 text-xs uppercase tracking-[0.16em] font-semibold hover:text-gold-dark transition-colors">
                            View Price Breakdown
                            <ChevronIcon open={showBreakdown} />
                        </button>
                        {showBreakdown && (
                            <div className="px-5 pb-5 pt-4 border-t border-line space-y-2.5">
                                <BreakRow label={`Gold (${activePurity}, ${netWeight}g)`} value={breakdown.gold_value} />
                                <BreakRow label={`Natural Diamond (${diaWeight} Ct)`} value={breakdown.diamond_value} />
                                <BreakRow label="Making Charges" value={breakdown.making_charges} />
                                <BreakRow label={`GST (${product.rate_card?.gst_percentage || 3}%)`} value={breakdown.gst_amount} />
                                <div className="flex items-center justify-between text-sm border-t border-line pt-2.5">
                                    <span className="font-semibold text-ink">Total</span>
                                    <span className="font-semibold text-ink">{inr(price)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Specification card */}
                    <div className="mt-4 rounded-xl border border-line bg-white px-5 py-4">
                        <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-3">
                            {activeInstance ? "This Piece" : "Estimated Specifications"}
                        </p>
                        {activeInstance ? (
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
                                <div className="flex justify-between gap-3"><dt className="text-ink/60">Item Code</dt><dd className="font-medium text-ink text-right">{activeInstance.item_code}</dd></div>
                                <div className="flex justify-between gap-3"><dt className="text-ink/60">Gold Karat</dt><dd className="font-medium text-ink text-right">{activeInstance.karat} {activeInstance.gold_color}</dd></div>
                                {isRing && activeInstance.ring_size && <div className="flex justify-between gap-3"><dt className="text-ink/60">Ring Size</dt><dd className="font-medium text-ink text-right">{activeInstance.ring_size}</dd></div>}
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
                            <>
                                <p className="text-[10px] text-gold-dark font-medium uppercase tracking-[0.12em] mb-3 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gold-dark"></span>
                                    Made to Order
                                </p>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
                                    <div className="flex justify-between gap-3"><dt className="text-ink/60">Design Code</dt><dd className="font-medium text-ink text-right">{product.design_code}</dd></div>
                                    <div className="flex justify-between gap-3"><dt className="text-ink/60">Gold Karat</dt><dd className="font-medium text-ink text-right">{activePurity} {activeColor}</dd></div>
                                    {isRing && activeSize && <div className="flex justify-between gap-3"><dt className="text-ink/60">Ring Size</dt><dd className="font-medium text-ink text-right">{activeSize}</dd></div>}
                                    <div className="flex justify-between gap-3"><dt className="text-ink/60">Est. Net Gold Weight</dt><dd className="font-medium text-ink text-right">{netWeight} g</dd></div>
                                    <div className="flex justify-between gap-3"><dt className="text-ink/60">Est. Diamond Weight</dt><dd className="font-medium text-ink text-right">{diaWeight} Ct</dd></div>
                                    {Number(product.color_stone_weight) > 0 && (
                                        <div className="flex justify-between gap-3"><dt className="text-ink/60">Est. Color Stone</dt><dd className="font-medium text-ink text-right">{Number(product.color_stone_weight).toFixed(2)} Ct</dd></div>
                                    )}
                                    <div className="flex justify-between gap-3"><dt className="text-ink/60">Diamond Grade</dt><dd className="font-medium text-ink text-right">{product.diamond_color}-{product.diamond_clarity}</dd></div>
                                </dl>
                                <p className="text-[10px] text-ink/50 mt-4 italic border-t border-line pt-3">
                                    *Final weights and price are confirmed at fabrication based on live gold and diamond rates.
                                </p>
                            </>
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