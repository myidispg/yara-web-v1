import Link from "next/link";
import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
    title: 'Everyday Natural Diamond Jewellery',
    description: 'Certified natural diamond jewellery in hallmarked solid gold. Shop rings, earrings, necklaces & more.',
});

const IMG = {
    hero: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2200&q=80",
    studs: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
    rings: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80",
    earrings: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=800&q=80",
    necklaces: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    bracelets: "https://images.unsplash.com/photo-1611591475119-232145e143b4?auto=format&fit=crop&w=1000&q=80",
    color1: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=80",
    color2: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=500&q=80",
};

const TILES = [
    { slug: "rings", tag: "Solitaires & Bands", title: "Rings", sub: "Engagement Bands & Daily Stackable Rings", img: IMG.rings, shape: "shape-arch" },
    { slug: "earrings", tag: "Studs, Drops & Hoops", title: "Earrings", sub: "Certified Natural Diamond Earrings", img: IMG.earrings, shape: "shape-asymmetric" },
    { slug: "necklaces", tag: "Pendants & Layers", title: "Necklaces", sub: "Solitaire Drops & Fine Chains", img: IMG.necklaces, shape: "shape-petal" },
    { slug: "bracelets", tag: "Tennis Collection", title: "Bracelets", sub: "Classic silhouettes in 14Kt & 18Kt Gold", img: IMG.bracelets, shape: "shape-arch-inverted" },
];

const FOUR_CS = [
    ["01", "Carat", "Carat Weight", "Measures diamond weight. From subtle daily 0.20 Ct to statement 2.00+ Ct solitaires."],
    ["02", "Cut", "Cut & Brilliance", "Determines light reflection. We craft Excellent & Ideal cuts for maximal sparkle."],
    ["03", "Clarity", "Clarity Grade", "Purity rating. Choose between premium VVS or VS clarity natural earth stones."],
    ["04", "Color", "Colorless Grade", "Ranging from EF (Rare Colorless) to GH (Near Colorless) for optimal value and brilliance."],
];

async function getProducts() {
    try {
        const res = await fetch("http://localhost:8000/api/products/?limit=4", { cache: "no-store" });
        const data = await res.json();
        return data?.results ?? data ?? [];
    } catch {
        return [];
    }
}

export default async function Home() {
    const products = await getProducts();

    return (
        <div className="bg-white">
            {/* HERO SECTION */}
            <section className="relative pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Ambient Background Spheres */}
                <div className="absolute top-10 left-10 w-96 h-96 bg-[#E5BDB0]/40 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#D4AF37]/25 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative rounded-[36px] overflow-hidden h-[72vh] min-h-[580px] max-h-[680px] flex items-center justify-start bg-[#1A2536] border-2 border-[#E5BDB0]/40 shadow-2xl">
                    <img
                        src={IMG.hero}
                        alt="YA-RA Natural Diamond Jewellery Collection"
                        className="absolute inset-0 w-full h-full object-cover object-[75%_center] scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1A2536]/85 via-[#1A2536]/40 to-transparent"></div>

                    {/* Glass Card */}
                    <div className="relative z-10 w-full max-w-lg mx-6 sm:mx-12 lg:mx-16 glass-card-navy p-8 sm:p-12 rounded-[32px] border border-white/20 text-white space-y-6">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5BDB0]/20 border border-[#E5BDB0]/40 text-xs font-bold tracking-widest text-[#E5BDB0]">
                            ✨ 100% NATURAL DIAMONDS • SOLID GOLD
                        </div>
                        <div className="space-y-2">
                            <span className="font-cursive text-3xl sm:text-4xl text-[#E5BDB0] block -mb-2">sparkle softly everyday...</span>
                            <h1 className="font-serif-luxury text-4xl sm:text-6xl font-normal leading-[1.08] tracking-tight text-white">
                                Natural Diamond Luxury.
                            </h1>
                        </div>
                        <p className="text-gray-200 text-xs sm:text-sm font-light leading-relaxed">
                            Handcrafted solid 14KT & 18KT gold studded exclusively with earth-mined VVS diamonds. No lab-grown, no silver.
                        </p>
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <Link
                                href="/category/rings"
                                className="px-8 py-4 bg-gradient-to-r from-[#E5BDB0] to-[#B86B5A] hover:opacity-95 text-[#1A2536] font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-xl flex items-center gap-2 group"
                            >
                                <span>Explore Collection</span>
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST BADGES */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {[
                        { icon: "💎", title: "100% Natural Diamonds", sub: "IGI & SGL Certified", color: "#B86B5A" },
                        { icon: "🛡️", title: "BIS Hallmarked Gold", sub: "14KT & 18KT Pure Gold", color: "#D4AF37" },
                        { icon: "🔄", title: "Lifetime Buyback", sub: "80%-90% Guaranteed Value", color: "#10B981" },
                        { icon: "🚚", title: "Insured Delivery", sub: "100% Transit Protection", color: "#1A2536" },
                    ].map((item, idx) => (
                        <div key={idx} className="glass-card-vibrant p-6 rounded-3xl flex items-center gap-4 border-l-4 hover:shadow-xl transition-all" style={{ borderLeftColor: item.color }}>
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                                {item.icon}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-[#1A2536]">{item.title}</h4>
                                <p className="text-xs font-semibold" style={{ color: item.color }}>{item.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SHOP BY CATEGORY */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5BDB0]/60 pb-4">
                    <div>
                        <span className="font-cursive text-3xl text-[#B86B5A] block -mb-2">curated for you</span>
                        <h2 className="font-serif-luxury text-4xl sm:text-5xl font-normal text-[#1A2536]">
                            Shop by Category
                        </h2>
                    </div>
                    <p className="text-xs font-bold text-[#B86B5A] tracking-widest uppercase">
                        100% NATURAL DIAMONDS • 14KT & 18KT GOLD
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {TILES.map((c) => (
                        <Link key={c.slug} href={`/category/${c.slug}`} className="group cursor-pointer space-y-3">
                            <div className={`relative h-96 ${c.shape} overflow-hidden bg-white border-2 border-[#E5BDB0] shadow-md group-hover:shadow-2xl transition-all duration-500`}>
                                <img
                                    src={c.img}
                                    alt={c.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A2536]/85 via-transparent to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                                    <span className="text-[10px] font-bold text-[#E5BDB0] uppercase tracking-widest block mb-1">{c.tag}</span>
                                    <h3 className="font-serif-luxury text-2xl font-normal">{c.title}</h3>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* BEST SELLERS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-20">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5BDB0]/60 pb-4">
                    <div>
                        <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">bestselling pieces</span>
                        <h2 className="font-serif-luxury text-4xl sm:text-5xl font-normal text-[#1A2536]">
                            Signature Designs
                        </h2>
                    </div>
                    <Link
                        href="/category/rings"
                        className="text-xs font-bold uppercase tracking-widest text-[#1A2536] border-b-2 border-[#B86B5A] pb-1.5 hover:text-[#B86B5A] transition-colors"
                    >
                        View All Products →
                    </Link>
                </div>

                {products.length ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((p) => <ProductCard key={p.id ?? p.slug} product={p} />)}
                    </div>
                ) : (
                    <p className="text-sm text-ink/55">Loading curated pieces…</p>
                )}
            </section>

            {/* COLOR STONE BANNER */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-r from-[#1A2536] via-[#223046] to-[#1A2536] text-white p-8 sm:p-14 border-2 border-[#E5BDB0]/40 shadow-2xl">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-[#E5BDB0]/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        <div className="lg:col-span-7 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5BDB0]/20 text-[#E5BDB0] text-xs font-bold uppercase tracking-wider border border-[#E5BDB0]/40">
                                Precious Color Accents
                            </div>
                            <div className="space-y-2">
                                <span className="font-cursive text-3xl text-[#E5BDB0] block">handpicked gemstones</span>
                                <h2 className="font-serif-luxury text-3xl sm:text-5xl font-normal leading-tight">
                                    Color Stone Fine Jewellery
                                </h2>
                            </div>
                            <p className="text-gray-200 font-light text-sm sm:text-base leading-relaxed max-w-xl">
                                Handpicked precious color stone accents paired with earth-mined natural diamonds. Set in hallmarked 18Kt solid yellow and rose gold settings.
                            </p>
                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <Link
                                    href="/category/color-stone"
                                    className="px-8 py-4 bg-gradient-to-r from-[#E5BDB0] to-[#B86B5A] hover:opacity-95 text-[#1A2536] font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-xl"
                                >
                                    Explore Color Stone Edit
                                </Link>
                            </div>
                        </div>
                        <div className="lg:col-span-5 relative flex justify-center">
                            <div className="w-72 sm:w-80 h-96 shape-asymmetric overflow-hidden border-4 border-[#E5BDB0] shadow-2xl relative">
                                <img
                                    src={IMG.color1}
                                    alt="Color stone jewelry"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4CS EDUCATION */}
            <section className="bg-[#1A2536] text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="font-cursive text-3xl text-[#E5BDB0] block -mb-2">diamond education</span>
                        <h2 className="font-serif-luxury text-4xl md:text-5xl font-normal text-white">
                            Understand Your Diamond (The 4Cs)
                        </h2>
                        <p className="text-base text-gray-300 mt-4 max-w-2xl mx-auto">
                            Every YA-RA® diamond is certified by renowned third party laboratories like SGL & IGI so you purchase with absolute trust.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                        {FOUR_CS.map(([n, t, h, b]) => (
                            <div key={n} className="border-t-2 border-[#E5BDB0] pt-5">
                                <p className="font-serif-luxury italic text-3xl text-[#E5BDB0] mb-2">{n}. {t}</p>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D4AF37] mb-2">{h}</p>
                                <p className="text-sm leading-relaxed text-gray-300">{b}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}