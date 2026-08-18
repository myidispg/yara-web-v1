"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";

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

const FALLBACK_IMG = "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop";
const handleImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMG;
};

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

export default function ProductClient({ product }) {
    const router = useRouter();
    const { addItem } = useCart();

    const [purity, setPurity] = useState(null);
    const [color, setColor] = useState(null);
    const [size, setSize] = useState(null);
    const [showAllMedia, setShowAllMedia] = useState(false);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [added, setAdded] = useState(false);
    const [zoomedImage, setZoomedImage] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
    const carouselRef = useRef(null);
    const zoomContainerRef = useRef(null);

    useEffect(() => {
        document.title = `${product.name} | YA-RA Jewels`;
    }, [product.name]);

    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;
        const handleScroll = () => {
            const slideWidth = carousel.clientWidth;
            setCurrentSlide(Math.round(carousel.scrollLeft / slideWidth));
        };
        carousel.addEventListener("scroll", handleScroll);
        return () => carousel.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSlide = (index) => {
        const carousel = carouselRef.current;
        if (!carousel) return;
        carousel.scrollTo({ left: carousel.clientWidth * index, behavior: "smooth" });
        setCurrentSlide(index);
    };

    const media = product.media ?? [];
    const desktopMedia = showAllMedia ? media : media.slice(0, 6);
    const allProducts = product.products ?? [];
    const inStockProducts = allProducts.filter((i) => i.status === "in_stock");
    const isRing =
        allProducts.some((i) => i.ring_size) ||
        ["rings", "solitaires"].includes(product.category_slug) ||
        /\b(rings?|solitaires?)\b/i.test(product.category_name || "");

    const cheapestInStock = inStockProducts.length
        ? inStockProducts.reduce((a, b) => (Number(a.price) <= Number(b.price) ? a : b))
        : null;
    const cheapestOverall = allProducts.length
        ? allProducts.reduce((a, b) => (Number(a.price) <= Number(b.price) ? a : b))
        : null;
    const defaultSelection = cheapestInStock ?? cheapestOverall;

    const activePurity = KARATS.includes(purity) ? purity : (defaultSelection?.karat ?? KARATS[0]);
    const activeColor = COLORS.includes(color) ? color : (defaultSelection?.gold_color ?? COLORS[0]);
    const activeSize = isRing ? (RING_SIZES.includes(size) ? size : (defaultSelection?.ring_size ?? "12")) : null;

    const matching = allProducts.filter((i) =>
        i.karat === activePurity && i.gold_color === activeColor && (!isRing || i.ring_size === activeSize)
    );
    const inStockMatching = matching.filter((i) => i.status === "in_stock");
    const stockCount = inStockMatching.length;
    const activeProduct = inStockMatching[0] ?? matching[0] ?? null;

    const rc = product.rate_card ?? {};
    const defaultGrade = rc.default_grade ?? "IJ/SI";
    const activeGrade = activeProduct?.diamond_grade ?? defaultGrade;

    let price, breakdown, netWeight, diaWeight;
    if (activeProduct) {
        price = Number(activeProduct.price);
        breakdown = {
            gold_value: Number(activeProduct.gold_value ?? 0),
            diamond_value: Number(activeProduct.diamond_value ?? 0),
            making_charges: Number(activeProduct.making_charges ?? 0),
            gst_amount: Number(activeProduct.gst_amount ?? 0),
        };
        netWeight = Number(activeProduct.actual_net_weight).toFixed(3);
        diaWeight = Number(activeProduct.actual_diamond_weight).toFixed(2);
    } else {
        // Reference weight for the selected size (from the design's learned refs)
        const refs = product.size_weight_refs ?? {};
        let baseWeight;
        if (isRing && activeSize && refs[activeSize] != null) {
            baseWeight = Number(refs[activeSize]);
        } else {
            baseWeight = Number(product.base_net_weight_14kt);
            if (isRing && activeSize) {
                baseWeight = baseWeight * Math.pow(1.03, Math.floor((Number(activeSize) - 12) / 2));
            }
        }
        if (activePurity === "18Kt") baseWeight *= 1.20;

        const goldRate = activePurity === "18Kt" ? rc.gold_rate_18kt : rc.gold_rate_14kt;
        const diaRate = rc.diamond_rates?.[defaultGrade] ?? 0;
        const goldValue = baseWeight * Number(goldRate ?? 0);
        const diaValue = Number(product.total_diamond_weight) * Number(diaRate);
        const making = (goldValue + diaValue) * (Number(rc.making_charges_percentage ?? 0) / 100);
        const gst = (goldValue + diaValue + making) * (Number(rc.gst_percentage ?? 0) / 100);
        price = Math.round(goldValue + diaValue + making + gst);
        breakdown = { gold_value: Math.round(goldValue), diamond_value: Math.round(diaValue), making_charges: Math.round(making), gst_amount: Math.round(gst) };
        netWeight = baseWeight.toFixed(3);
        diaWeight = Number(product.total_diamond_weight).toFixed(2);
    }

    const selection = { karat: activePurity, gold_color: activeColor, ring_size: activeSize, price };
    const handleAdd = () => { addItem(product, selection); setAdded(true); setTimeout(() => setAdded(false), 1500); };
    const handleBuyNow = () => { addItem(product, selection); router.push("/checkout"); };

    const handleZoomMouseMove = (e) => {
        if (!zoomContainerRef.current || zoomLevel === 1) return;
        const rect = zoomContainerRef.current.getBoundingClientRect();
        setZoomPosition({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        });
    };

    const handleZoomWheel = (e) => {
        e.preventDefault();
        setZoomLevel((prev) => Math.max(1, Math.min(4, prev + (e.deltaY > 0 ? -0.2 : 0.2))));
    };

    const resetZoom = () => { setZoomLevel(1); setZoomPosition({ x: 50, y: 50 }); };

    return (
        <div>
            {zoomedImage && (
                <div className="fixed inset-0 z-50 bg-ink/95 flex items-center justify-center p-4 md:p-8" onClick={() => { setZoomedImage(null); resetZoom(); }}>
                    <button className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white text-xl hover:bg-white/20 transition-colors z-10" onClick={(e) => { e.stopPropagation(); setZoomedImage(null); resetZoom(); }}>✕</button>
                    <div
                        ref={zoomContainerRef}
                        className="relative w-full h-full flex items-center justify-center cursor-zoom-in"
                        onClick={(e) => e.stopPropagation()}
                        onMouseMove={handleZoomMouseMove}
                        onWheel={handleZoomWheel}
                    >
                        <img
                            src={zoomedImage.url}
                            alt="Zoomed view"
                            onError={handleImgError}
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl transition-transform duration-200"
                            style={{ transform: `scale(${zoomLevel})`, transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`, cursor: zoomLevel > 1 ? "zoom-out" : "zoom-in" }}
                        />
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
                            <button onClick={() => setZoomLevel((p) => Math.max(1, p - 0.5))} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors">−</button>
                            <span className="text-white text-sm font-medium min-w-[40px] text-center">{Math.round(zoomLevel * 100)}%</span>
                            <button onClick={() => setZoomLevel((p) => Math.min(4, p + 0.5))} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors">+</button>
                            <button onClick={resetZoom} className="text-white text-xs font-medium px-3 py-1 hover:bg-white/20 rounded-full transition-colors">Reset</button>
                        </div>
                        {zoomLevel === 1 && (
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/70 text-xs bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                                Scroll to zoom · Move cursor to pan
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="max-w-[1440px] mx-auto px-8 lg:px-20 pt-10 pb-8">
                <p className="text-xs uppercase tracking-[0.16em] text-ink/50">
                    <Link href="/" className="hover:text-gold-dark">Home</Link>
                    {" / "}
                    <Link href={`/category/${product.category_slug ?? ""}`} className="hover:text-gold-dark">{product.category_name ?? "Jewellery"}</Link>
                    {" / "}{product.name}
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                <div>
                    <div className="hidden lg:grid grid-cols-2 gap-1.5">
                        {desktopMedia.map((m, i) => (
                            <div key={i} className="overflow-hidden bg-cream">
                                {m.kind === "video" ? (
                                    <video src={m.url} onError={(e) => (e.currentTarget.style.display = "none")} className="w-full aspect-square object-cover bg-charcoal" controls muted loop playsInline preload="metadata" />
                                ) : (
                                    <img src={m.url} alt={`${product.name} — media ${i + 1}`} onError={handleImgError} className="w-full aspect-square object-cover transition-transform duration-500 hover:scale-105 cursor-zoom-in" onClick={() => setZoomedImage(m)} />
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
                        <div className="relative">
                            <div ref={carouselRef} className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
                                {media.map((m, i) => (
                                    <div key={i} className="w-full shrink-0 snap-center">
                                        {m.kind === "video" ? (
                                            <video src={m.url} onError={(e) => (e.currentTarget.style.display = "none")} className="w-full h-[380px] md:h-[460px] object-cover rounded-2xl bg-charcoal" controls muted loop playsInline preload="metadata" />
                                        ) : (
                                            <img src={m.url} alt={product.name} onError={handleImgError} className="w-full h-[380px] md:h-[460px] object-cover rounded-2xl cursor-zoom-in" onClick={() => setZoomedImage(m)} />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {media.length > 1 && (
                                <>
                                    <button onClick={() => scrollToSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-ink hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                                    </button>
                                    <button onClick={() => scrollToSlide(Math.min(media.length - 1, currentSlide + 1))} disabled={currentSlide === media.length - 1} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-ink hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                                    </button>
                                </>
                            )}

                            {media.length > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    {media.map((_, i) => (
                                        <button key={i} onClick={() => scrollToSlide(i)} aria-label={`Go to slide ${i + 1}`} className={`h-2 rounded-full transition-all ${i === currentSlide ? "bg-ink w-8" : "bg-ink/30 hover:bg-ink/50 w-2"}`} />
                                    ))}
                                </div>
                            )}
                            {media.length > 1 && (
                                <div className="text-center mt-2 text-xs text-ink/50">{currentSlide + 1} of {media.length}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-8 py-10 lg:py-12 lg:pl-10 xl:pr-20">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gold-dark">{activeGrade} Natural Diamond</p>
                    <h1 className="font-serif text-4xl md:text-5xl mt-3">{product.name}</h1>
                    <p className="text-xs uppercase tracking-[0.14em] text-ink/50 mt-2">Design Code: {product.design_code}</p>
                    <p className="text-sm text-ink/60 leading-relaxed mt-4">{product.description}</p>

                    <div className="mt-8">
                        <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-3">Select Gold Purity:</p>
                        <div className="flex flex-wrap gap-3">
                            {KARATS.map((p) => (
                                <button key={p} onClick={() => { setPurity(p); setSize(null); }} className={`flex items-center justify-center text-xs font-medium px-5 py-2.5 rounded-full border transition-colors ${p === activePurity ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink"}`}>{p}</button>
                            ))}
                        </div>
                    </div>

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

                    {isRing ? (
                        <div className="mt-6">
                            <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-3">Select Ring Size:</p>
                            <div className="flex flex-wrap gap-3">
                                {RING_SIZES.map((s) => {
                                    const sizeMatches = allProducts.filter((i) => i.karat === activePurity && i.gold_color === activeColor && i.ring_size === s);
                                    const count = sizeMatches.filter((i) => i.status === "in_stock").length;
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

                    <div className="flex flex-wrap items-baseline gap-3 mt-8">
                        <span className="text-3xl font-semibold text-ink">{inr(price)}</span>
                    </div>
                    <p className="text-xs text-ink/50 mt-2">Inclusive of all taxes. Free insured delivery in India.</p>

                    <div className="mt-4 rounded-xl border border-line bg-white overflow-hidden">
                        <button onClick={() => setShowBreakdown(!showBreakdown)} className="w-full flex items-center justify-between px-5 py-4 text-xs uppercase tracking-[0.16em] font-semibold hover:text-gold-dark transition-colors">
                            View Price Breakdown <ChevronIcon open={showBreakdown} />
                        </button>
                        {showBreakdown && (
                            <div className="px-5 pb-5 pt-4 border-t border-line space-y-2.5">
                                <BreakRow label={`Gold (${activePurity}, ${netWeight}g)`} value={breakdown.gold_value} />
                                <BreakRow label={`Natural Diamond (${diaWeight} Ct, ${activeGrade})`} value={breakdown.diamond_value} />
                                <BreakRow label="Making Charges" value={breakdown.making_charges} />
                                <BreakRow label={`GST (${rc.gst_percentage || 3}%)`} value={breakdown.gst_amount} />
                                <div className="flex items-center justify-between text-sm border-t border-line pt-2.5">
                                    <span className="font-semibold text-ink">Total</span>
                                    <span className="font-semibold text-ink">{inr(price)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 rounded-xl border border-line bg-white px-5 py-4">
                        <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-3">
                            {activeProduct ? "This Piece" : "Estimated Specifications"}
                        </p>
                        {activeProduct ? (
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
                                <div className="flex justify-between gap-3"><dt className="text-ink/60">Item Code</dt><dd className="font-medium text-ink text-right">{activeProduct.item_code}</dd></div>
                                <div className="flex justify-between gap-3"><dt className="text-ink/60">Gold Karat</dt><dd className="font-medium text-ink text-right">{activeProduct.karat} {activeProduct.gold_color}</dd></div>
                                {isRing && activeProduct.ring_size && <div className="flex justify-between gap-3"><dt className="text-ink/60">Ring Size</dt><dd className="font-medium text-ink text-right">{activeProduct.ring_size}</dd></div>}
                                <div className="flex justify-between gap-3"><dt className="text-ink/60">Diamond Grade</dt><dd className="font-medium text-ink text-right">{activeProduct.diamond_grade}</dd></div>
                                <div className="flex justify-between gap-3"><dt className="text-ink/60">Net Gold Weight</dt><dd className="font-medium text-ink text-right">{Number(activeProduct.actual_net_weight).toFixed(3)} g</dd></div>
                                <div className="flex justify-between gap-3"><dt className="text-ink/60">Diamond Weight</dt><dd className="font-medium text-ink text-right">{Number(activeProduct.actual_diamond_weight).toFixed(2)} Ct</dd></div>
                                {Number(activeProduct.actual_color_stone_weight) > 0 && (
                                    <div className="flex justify-between gap-3"><dt className="text-ink/60">Color Stone</dt><dd className="font-medium text-ink text-right">{Number(activeProduct.actual_color_stone_weight).toFixed(2)} Ct</dd></div>
                                )}
                                {activeProduct.report_lab && (
                                    <div className="flex justify-between gap-3"><dt className="text-ink/60">Certificate</dt><dd className="font-medium text-ink text-right">{activeProduct.report_lab} {activeProduct.report_number}</dd></div>
                                )}
                            </dl>
                        ) : (
                            <>
                                <p className="text-[10px] text-gold-dark font-medium uppercase tracking-[0.12em] mb-3 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gold-dark"></span> Made to Order
                                </p>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
                                    <div className="flex justify-between gap-3"><dt className="text-ink/60">Design Code</dt><dd className="font-medium text-ink text-right">{product.design_code}</dd></div>
                                    <div className="flex justify-between gap-3"><dt className="text-ink/60">Gold Karat</dt><dd className="font-medium text-ink text-right">{activePurity} {activeColor}</dd></div>
                                    {isRing && activeSize && <div className="flex justify-between gap-3"><dt className="text-ink/60">Ring Size</dt><dd className="font-medium text-ink text-right">{activeSize}</dd></div>}
                                    <div className="flex justify-between gap-3"><dt className="text-ink/60">Diamond Grade</dt><dd className="font-medium text-ink text-right">{defaultGrade}</dd></div>
                                    <div className="flex justify-between gap-3"><dt className="text-ink/60">Est. Net Gold Weight</dt><dd className="font-medium text-ink text-right">{netWeight} g</dd></div>
                                    <div className="flex justify-between gap-3"><dt className="text-ink/60">Est. Diamond Weight</dt><dd className="font-medium text-ink text-right">{diaWeight} Ct</dd></div>
                                    {Number(product.color_stone_weight ?? 0) > 0 && (
                                        <div className="flex justify-between gap-3"><dt className="text-ink/60">Est. Color Stone</dt><dd className="font-medium text-ink text-right">{Number(product.color_stone_weight).toFixed(2)} Ct</dd></div>
                                    )}
                                </dl>
                                <p className="text-[10px] text-ink/50 mt-4 italic border-t border-line pt-3">
                                    *Final weights and price are confirmed at fabrication based on live gold and diamond rates.
                                </p>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button onClick={handleAdd} className="btn-solid flex-1">{added ? "Added ✓" : "Add To Shopping Bag"}</button>
                        <button onClick={handleBuyNow} className="btn-outline flex-1">Buy Now (Checkout Now)</button>
                    </div>
                </div>
            </div>
        </div>
    );
}