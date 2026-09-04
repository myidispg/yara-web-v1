"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import ImageFallback from "@/components/ImageFallback";

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
const BLUR_DATA = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

const ChevronIcon = ({ open }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? "rotate-180" : ""}`}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const BreakRow = ({ label, value }) =>
    value == null ? null : (
        <div className="flex items-center justify-between text-sm">
            <span className="text-[#1A2536]/60">{label}</span>
            <span className="font-semibold text-[#1A2536]">{inr(value)}</span>
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
    const [failedImages, setFailedImages] = useState(new Set());

    // Pincode checker state
    const [pincode, setPincode] = useState("");
    const [pincodeResult, setPincodeResult] = useState(null);
    const [checkingPincode, setCheckingPincode] = useState(false);

    const handleImageError = (url) => {
        setFailedImages(prev => new Set([...prev, url]));
    };

    useEffect(() => {
        document.title = `${product.name} | YA-RA Jewels`;
    }, [product.name]);

    // Cleanup video elements on unmount to prevent Safari/Webkit "EmptyRanges" error
    useEffect(() => {
        return () => {
            const videos = document.querySelectorAll('video');
            videos.forEach(video => {
                try {
                    video.pause();
                    video.removeAttribute('src');
                    video.load();
                } catch (e) {
                    // Ignore errors during cleanup
                }
            });
        };
    }, []);

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

    // Pincode checker logic — NCR only (Delhi, Gurugram, Faridabad, Noida)
    const checkPincode = () => {
        if (!/^\d{6}$/.test(pincode)) {
            setPincodeResult({ error: "Please enter a valid 6-digit pincode" });
            return;
        }

        setCheckingPincode(true);

        setTimeout(() => {
            const pin = parseInt(pincode);

            const isDelhi = pin >= 110001 && pin <= 110096;
            const isGurugram = pin >= 122001 && pin <= 122022;
            const isFaridabad = pin >= 121001 && pin <= 121014;
            const isNoida = pin >= 201301 && pin <= 201313;

            const isDeliverable = isDelhi || isGurugram || isFaridabad || isNoida;

            let city = "";
            if (isDelhi) city = "Delhi";
            else if (isGurugram) city = "Gurugram";
            else if (isFaridabad) city = "Faridabad";
            else if (isNoida) city = "Noida";

            if (!isDeliverable) {
                setPincodeResult({
                    notAvailable: true,
                    city: "Your Area",
                    message: "We currently deliver only in Delhi, Gurugram, Faridabad & Noida (NCR region)."
                });
                setCheckingPincode(false);
                return;
            }

            const isInStock = stockCount > 0;
            const baseDays = isInStock ? 2 : 12;
            const deliveryDays = baseDays + Math.floor(Math.random() * 2);

            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

            setPincodeResult({
                deliveryDate: deliveryDate.toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "short"
                }),
                deliveryDays,
                codAvailable: true,
                city,
                shippingInfo: "Free insured delivery via premium courier"
            });
            setCheckingPincode(false);
        }, 800);
    };

    return (
        <div className="bg-white">
            {/* Zoom Lightbox */}
            {zoomedImage && (
                <div className="fixed inset-0 z-50 bg-[#1A2536]/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8" onClick={() => { setZoomedImage(null); resetZoom(); }}>
                    <button className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white text-xl hover:bg-white/20 transition-colors z-10" onClick={(e) => { e.stopPropagation(); setZoomedImage(null); resetZoom(); }}>✕</button>
                    <div
                        ref={zoomContainerRef}
                        className="relative w-full h-full flex items-center justify-center cursor-zoom-in"
                        onClick={(e) => e.stopPropagation()}
                        onMouseMove={handleZoomMouseMove}
                        onWheel={handleZoomWheel}
                    >
                        {failedImages.has(zoomedImage.url) ? (
                            <div className="max-w-[80vw] max-h-[80vh] w-[600px] h-[600px] bg-gradient-to-br from-[#FAF9F6] to-[#E5BDB0]/30 border-2 border-[#E5BDB0] rounded-2xl shadow-2xl flex flex-col items-center justify-center">
                                <svg className="w-20 h-20 text-[#1A2536]/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm uppercase tracking-[0.16em] text-[#1A2536]/60 font-bold">Image unavailable</span>
                            </div>
                        ) : (
                            <Image
                                src={zoomedImage.url}
                                alt="Zoomed view"
                                width={1200}
                                height={1200}
                                placeholder="blur"
                                blurDataURL={BLUR_DATA}
                                onError={() => handleImageError(zoomedImage.url)}
                                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl transition-transform duration-200"
                                style={{ transform: `scale(${zoomLevel})`, transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`, cursor: zoomLevel > 1 ? "zoom-out" : "zoom-in" }}
                            />
                        )}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 glass-card-navy rounded-full px-4 py-2">
                            <button onClick={() => setZoomLevel((p) => Math.max(1, p - 0.5))} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors">−</button>
                            <span className="text-white text-sm font-medium min-w-[40px] text-center">{Math.round(zoomLevel * 100)}%</span>
                            <button onClick={() => setZoomLevel((p) => Math.min(4, p + 0.5))} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors">+</button>
                            <button onClick={resetZoom} className="text-[#E5BDB0] text-xs font-bold px-3 py-1 hover:bg-white/20 rounded-full transition-colors">Reset</button>
                        </div>
                        {zoomLevel === 1 && (
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/70 text-xs glass-card-navy px-4 py-2 rounded-full">
                                Scroll to zoom · Move cursor to pan
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="max-w-[1440px] mx-auto px-8 lg:px-20 pt-10 pb-8">
                <p className="text-xs uppercase tracking-[0.16em] text-[#1A2536]/50">
                    <Link href="/" className="hover:text-[#B86B5A]">Home</Link>
                    {" / "}
                    <Link href={`/category/${product.category_slug ?? ""}`} className="hover:text-[#B86B5A]">{product.category_name ?? "Jewellery"}</Link>
                    {" / "}<span className="text-[#1A2536]">{product.name}</span>
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-0 lg:gap-12">
                {/* ── LEFT: Media Gallery ── */}
                <div>
                    {/* Desktop Grid */}
                    <div className="hidden lg:grid grid-cols-2 gap-1.5">
                        {desktopMedia.map((m, i) => (
                            <div key={i} className="relative overflow-hidden bg-cream aspect-square">
                                {m.kind === "video" ? (
                                    <video src={m.url} onError={(e) => (e.currentTarget.style.display = "none")} className="w-full h-full object-cover bg-[#1A2536]" controls muted loop playsInline preload="metadata" />
                                ) : failedImages.has(m.url) ? (
                                    <ImageFallback onClick={() => setZoomedImage(m)} />
                                ) : (
                                    <Image
                                        src={m.url}
                                        alt={`${product.name} — media ${i + 1}`}
                                        fill
                                        placeholder="blur"
                                        blurDataURL={BLUR_DATA}
                                        sizes="(max-width: 1024px) 50vw, 33vw"
                                        onError={() => handleImageError(m.url)}
                                        className="object-cover transition-transform duration-500 hover:scale-[1.02] cursor-zoom-in"
                                        onClick={() => setZoomedImage(m)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    {media.length > 6 && (
                        <button onClick={() => setShowAllMedia(!showAllMedia)} className="hidden lg:flex w-full items-center justify-center gap-2 py-4 mt-2 bg-white text-[#1A2536] text-xs uppercase tracking-[0.16em] font-bold rounded-xl border border-[#E5BDB0] hover:bg-[#1A2536] hover:text-white hover:border-[#1A2536] transition-all">
                            {showAllMedia ? "Show Less" : `Show More (${media.length - 6} more)`}
                        </button>
                    )}

                    {/* Mobile Carousel */}
                    <div className="lg:hidden">
                        <div className="relative">
                            <div ref={carouselRef} className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
                                {media.map((m, i) => (
                                    <div key={i} className="w-full shrink-0 snap-center relative h-[380px] md:h-[460px]">
                                        {m.kind === "video" ? (
                                            <video src={m.url} onError={(e) => (e.currentTarget.style.display = "none")} className="w-full h-full object-cover bg-[#1A2536]" controls muted loop playsInline preload="metadata" />
                                        ) : failedImages.has(m.url) ? (
                                            <ImageFallback onClick={() => setZoomedImage(m)} heightClass="h-[380px] md:h-[460px]" />
                                        ) : (
                                            <Image
                                                src={m.url}
                                                alt={product.name}
                                                fill
                                                placeholder="blur"
                                                blurDataURL={BLUR_DATA}
                                                sizes="100vw"
                                                onError={() => handleImageError(m.url)}
                                                className="object-cover cursor-zoom-in"
                                                onClick={() => setZoomedImage(m)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {media.length > 1 && (
                                <>
                                    <button onClick={() => scrollToSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-[#1A2536] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                                    </button>
                                    <button onClick={() => scrollToSlide(Math.min(media.length - 1, currentSlide + 1))} disabled={currentSlide === media.length - 1} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-[#1A2536] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                                    </button>
                                </>
                            )}

                            {media.length > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    {media.map((_, i) => (
                                        <button key={i} onClick={() => scrollToSlide(i)} aria-label={`Go to slide ${i + 1}`} className={`h-2 rounded-full transition-all ${i === currentSlide ? "bg-[#B86B5A] w-8" : "bg-[#1A2536]/20 hover:bg-[#1A2536]/40 w-2"}`} />
                                    ))}
                                </div>
                            )}
                            {media.length > 1 && (
                                <div className="text-center mt-2 text-xs text-[#1A2536]/50">{currentSlide + 1} of {media.length}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Product Details ── */}
                <div className="px-8 py-10 lg:py-12 lg:pl-10 xl:pr-20 space-y-6">
                    {/* Title Block */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-[#1A2536] text-[#E5BDB0] text-[9px] font-bold uppercase tracking-wider">
                                BIS Hallmarked
                            </span>
                            <span className="px-3 py-1 rounded-full bg-[#1A2536] text-[#E5BDB0] text-[9px] font-bold uppercase tracking-wider">
                                Certified Natural Diamonds
                            </span>
                        </div>
                        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536] leading-tight">
                            {product.name}
                        </h1>
                        <p className="text-xs uppercase tracking-[0.14em] text-[#B86B5A] font-bold mt-2">Design Code: {product.design_code}</p>
                        {product.description && (
                            <p className="text-sm text-[#1A2536]/60 leading-relaxed mt-3">{product.description}</p>
                        )}
                    </div>

                    {/* Price Block */}
                    <div className="glass-card-vibrant rounded-2xl border border-[#E5BDB0] p-5 space-y-3">
                        <div className="flex items-baseline justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-[#1A2536]/50 block uppercase tracking-wider">Final Price ({activePurity} Solid Gold)</span>
                                <span className="text-3xl font-extrabold text-[#1A2536]">{inr(price)}</span>
                            </div>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 whitespace-nowrap">
                                ✦ Incl. 3% GST
                            </span>
                        </div>
                        <p className="text-[11px] text-[#1A2536]/50">Zero shipping charges</p>

                        <button onClick={() => setShowBreakdown(!showBreakdown)} className="w-full pt-3 border-t border-[#E5BDB0]/40 text-xs font-bold text-[#B86B5A] hover:text-[#1A2536] transition-colors flex items-center justify-between">
                            <span>View Price Breakdown</span>
                            <ChevronIcon open={showBreakdown} />
                        </button>
                        {showBreakdown && (
                            <div className="pt-3 border-t border-[#E5BDB0]/40 space-y-2.5">
                                <BreakRow label={`Gold (${activePurity}, ${netWeight}g)`} value={breakdown.gold_value} />
                                <BreakRow label={`Natural Diamond (${diaWeight} Ct, ${activeGrade})`} value={breakdown.diamond_value} />
                                <BreakRow label="Making Charges" value={breakdown.making_charges} />
                                <BreakRow label={`GST (${rc.gst_percentage || 3}%)`} value={breakdown.gst_amount} />
                                <div className="flex items-center justify-between text-sm border-t border-[#E5BDB0]/40 pt-2.5">
                                    <span className="font-bold text-[#1A2536]">Total</span>
                                    <span className="font-bold text-[#1A2536]">{inr(price)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Gold Purity Selector */}
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] mb-2.5">Select Gold Purity</p>
                        <div className="flex flex-wrap gap-2.5">
                            {KARATS.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => { setPurity(p); setSize(null); }}
                                    className={`flex items-center justify-center text-xs font-bold px-5 py-2.5 rounded-full border transition-all ${p === activePurity
                                        ? "border-[#1A2536] bg-[#1A2536] text-white shadow-md"
                                        : "border-[#E5BDB0] bg-white text-[#1A2536] hover:border-[#B86B5A]"
                                        }`}
                                >
                                    {p} Gold
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Gold Colour Selector */}
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] mb-2.5">Select Gold Colour</p>
                        <div className="flex flex-wrap gap-2.5">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => { setColor(c); setSize(null); }}
                                    className={`flex items-center gap-2.5 text-xs font-bold px-4 py-2.5 rounded-full border transition-all ${c === activeColor
                                        ? "border-[#1A2536] bg-[#1A2536] text-white shadow-md"
                                        : "border-[#E5BDB0] bg-white text-[#1A2536] hover:border-[#B86B5A]"
                                        }`}
                                >
                                    <span className="w-4 h-4 rounded-full border border-black/10" style={{ background: SWATCH[c] ?? "#ccc" }} />
                                    {c} Gold
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ring Size Selector */}
                    {isRing ? (
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] mb-2.5">Select Ring Size</p>
                            <div className="flex flex-wrap gap-2.5">
                                {RING_SIZES.map((s) => {
                                    const sizeMatches = allProducts.filter((i) => i.karat === activePurity && i.gold_color === activeColor && i.ring_size === s);
                                    const count = sizeMatches.filter((i) => i.status === "in_stock").length;
                                    const isInStock = count > 0;
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => setSize(s)}
                                            className={`w-20 py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${s === activeSize
                                                ? "border-[#1A2536] bg-[#1A2536] text-white shadow-md"
                                                : "border-[#E5BDB0] bg-white text-[#1A2536] hover:border-[#B86B5A]"
                                                }`}
                                        >
                                            <span className="text-sm font-bold">{s}</span>
                                            <span className={`text-[8px] uppercase tracking-[0.08em] font-bold ${s === activeSize ? "text-[#E5BDB0]" : isInStock ? "text-emerald-600" : "text-[#B86B5A]"
                                                }`}>
                                                {isInStock ? `${count} in stock` : "Made to Order"}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <Link href="/size-guide" className="inline-block text-[10px] font-bold text-[#B86B5A] uppercase tracking-wider mt-2 hover:underline">
                                Not sure? Check Size Guide →
                            </Link>
                        </div>
                    ) : (
                        <div className="glass-card-vibrant rounded-xl border border-[#E5BDB0] px-4 py-3">
                            {stockCount > 0 ? (
                                <p className="text-xs text-emerald-700 font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    {stockCount} pc{stockCount > 1 ? "s" : ""} in stock · Ready to ship
                                </p>
                            ) : (
                                <p className="text-xs text-[#B86B5A] font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#B86B5A]"></span>
                                    Made to Order · Ships in 10-12 days
                                </p>
                            )}
                        </div>
                    )}

                    {/* Pincode Delivery Checker */}
                    <div className="glass-card-vibrant rounded-2xl border border-[#E5BDB0] p-5">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-[#1A2536] flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-[#E5BDB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-[#1A2536] mb-1">Check Delivery Availability</h3>
                                <p className="text-[11px] text-[#1A2536]/60">Enter your pincode for estimated delivery date</p>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-3" suppressHydrationWarning>
                            <input
                                type="text"
                                value={pincode}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                    setPincode(val);
                                    setPincodeResult(null);
                                }}
                                placeholder="Enter 6-digit pincode"
                                maxLength={6}
                                className="flex-1 px-4 py-3 text-sm border border-[#E5BDB0] rounded-xl focus:outline-none focus:border-[#1A2536] transition-colors"
                            />
                            <button
                                onClick={checkPincode}
                                disabled={checkingPincode || pincode.length !== 6}
                                className="px-6 py-3 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {checkingPincode ? "..." : "Check"}
                            </button>
                        </div>

                        {pincodeResult && (
                            <div className="mt-4 pt-4 border-t border-[#E5BDB0]/40 space-y-3">
                                {pincodeResult.error ? (
                                    <p className="text-xs text-red-600 font-semibold">{pincodeResult.error}</p>
                                ) : pincodeResult.notAvailable ? (
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#B86B5A]/10 border border-[#B86B5A]/30">
                                        <div className="w-8 h-8 rounded-full bg-[#B86B5A]/20 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-[#B86B5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-[#B86B5A]">Delivery Not Available</p>
                                            <p className="text-sm text-[#1A2536] mt-0.5">{pincodeResult.message}</p>
                                            <Link href="/contact" className="text-[11px] text-[#B86B5A] font-bold hover:underline mt-1 inline-block">
                                                Contact us for special delivery →
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-[#1A2536]">Delivery to {pincodeResult.city}</p>
                                                <p className="text-sm text-[#1A2536] mt-0.5">
                                                    Estimated by <span className="font-bold text-[#B86B5A]">{pincodeResult.deliveryDate}</span>
                                                </p>
                                                <p className="text-[11px] text-[#1A2536]/60 mt-1">{pincodeResult.shippingInfo}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pl-11">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${pincodeResult.codAvailable ? "bg-emerald-50" : "bg-[#1A2536]/5"}`}>
                                                {pincodeResult.codAvailable ? (
                                                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-3.5 h-3.5 text-[#1A2536]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className={`text-xs font-semibold ${pincodeResult.codAvailable ? "text-emerald-700" : "text-[#1A2536]/50"}`}>
                                                {pincodeResult.codAvailable ? "Partial Cash on Delivery Available" : "COD not available in this area"}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Specifications */}
                    <div className="glass-card-vibrant rounded-2xl border border-[#E5BDB0] overflow-hidden">
                        <div className="px-5 py-3.5 bg-[#1A2536]/[0.03] border-b border-[#E5BDB0]/40">
                            <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">
                                {activeProduct ? "This Piece" : "Estimated Specifications"}
                            </p>
                        </div>
                        <div className="px-5 py-4">
                            {activeProduct ? (
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
                                    <div className="flex justify-between gap-3"><dt className="text-[#1A2536]/50">Item Code</dt><dd className="font-semibold text-[#1A2536] text-right">{activeProduct.item_code}</dd></div>
                                    <div className="flex justify-between gap-3"><dt className="text-[#1A2536]/50">Gold Karat</dt><dd className="font-semibold text-[#1A2536] text-right">{activeProduct.karat} {activeProduct.gold_color}</dd></div>
                                    {isRing && activeProduct.ring_size && <div className="flex justify-between gap-3"><dt className="text-[#1A2536]/50">Ring Size</dt><dd className="font-semibold text-[#1A2536] text-right">{activeProduct.ring_size}</dd></div>}
                                    <div className="flex justify-between gap-3"><dt className="text-[#1A2536]/50">Diamond Grade</dt><dd className="font-semibold text-[#1A2536] text-right">{activeProduct.diamond_grade}</dd></div>
                                    <div className="flex justify-between gap-3"><dt className="text-[#1A2536]/50">Net Gold Weight</dt><dd className="font-semibold text-[#1A2536] text-right">{Number(activeProduct.actual_net_weight).toFixed(3)} g</dd></div>
                                    <div className="flex justify-between gap-3"><dt className="text-[#1A2536]/50">Diamond Weight</dt><dd className="font-semibold text-[#1A2536] text-right">{Number(activeProduct.actual_diamond_weight).toFixed(2)} Ct</dd></div>
                                    {Number(activeProduct.actual_color_stone_weight) > 0 && (
                                        <div className="flex justify-between gap-3"><dt className="text-[#1A2536]/50">Color Stone</dt><dd className="font-semibold text-[#1A2536] text-right">{Number(activeProduct.actual_color_stone_weight).toFixed(2)} Ct</dd></div>
                                    )}
                                    {activeProduct.report_lab && (
                                        <div className="flex justify-between gap-3"><dt className="text-[#1A2536]/50">Diamond Report</dt><dd className="font-semibold text-[#1A2536] text-right">{activeProduct.report_lab} {activeProduct.report_number}</dd></div>
                                    )}
                                </dl>
                            ) : (
                                <>
                                    <p className="text-[10px] text-[#B86B5A] font-bold uppercase tracking-[0.12em] mb-3 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#B86B5A]"></span> Made to Order
                                    </p>
                                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
                                        <div className="flex justify-between gap-3"><dt className="text-[#1A2536]/50">Design Code</dt><dd className="font-semibold text-[#1A2536] text-right">{product.design_code}</dd></div>
                                        <div className="flex justify-between gap-3"><dt className="text-[#1A2536]/50">Gold Karat</dt><dd className="font-semibold text-[#1A2536] text-right">{activePurity} {activeColor}</dd></div>
                                        {isRing && activeSize && <div className="flex justify-between gap-3"><dt className="text-[#1A2536]/50">Ring Size</dt><dd className="font-semibold text-[#1A2536] text-right">{activeSize}</dd></div>}
                                        <div className="flex justify-between gap-3"><dt className="text-[#1A2536]/50">Diamond Grade</dt><dd className="font-semibold text-[#1A2536] text-right">{defaultGrade}</dd></div>
                                        <div className="flex justify-between gap-3"><dt className="text-[#1A2536]/50">Est. Net Gold Weight</dt><dd className="font-semibold text-[#1A2536] text-right">{netWeight} g</dd></div>
                                        <div className="flex justify-between gap-3"><dt className="text-[#1A2536]/50">Est. Diamond Weight</dt><dd className="font-semibold text-[#1A2536] text-right">{diaWeight} Ct</dd></div>
                                        {Number(product.color_stone_weight ?? 0) > 0 && (
                                            <div className="flex justify-between gap-3"><dt className="text-[#1A2536]/50">Est. Color Stone</dt><dd className="font-semibold text-[#1A2536] text-right">{Number(product.color_stone_weight).toFixed(2)} Ct</dd></div>
                                        )}
                                    </dl>
                                    <p className="text-[10px] text-[#1A2536]/50 mt-4 italic border-t border-[#E5BDB0]/40 pt-3">
                                        *Final weights and price are confirmed at fabrication based on live gold and diamond rates.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            onClick={handleAdd}
                            className={`flex-1 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${added
                                ? "bg-emerald-600 text-white"
                                : "bg-[#1A2536] hover:bg-[#111A29] text-white"
                                }`}
                        >
                            {added ? "✓ Added to Bag" : "Add to Shopping Bag"}
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className="flex-1 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white flex items-center justify-center gap-2"
                        >
                            Buy Now
                        </button>
                    </div>

                    {/* Trust Strip */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E5BDB0]/40">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-[#1A2536]">IGI/SGL Certified</p>
                            <p className="text-[9px] text-[#1A2536]/50 mt-0.5">Natural Diamond</p>
                        </div>
                        <div className="text-center border-x border-[#E5BDB0]/40">
                            <p className="text-[10px] font-bold text-[#1A2536]">Lifetime Buyback</p>
                            <p className="text-[9px] text-[#1A2536]/50 mt-0.5">80-90% Value</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-[#1A2536]">Insured Delivery</p>
                            <p className="text-[9px] text-[#1A2536]/50 mt-0.5">Free Pan-India</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}