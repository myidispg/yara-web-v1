import Link from "next/link";
import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";

const IMG = {
    hero: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=900&auto=format&fit=crop",
    studs: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop",
    rings: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop",
    earrings: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=800&auto=format&fit=crop",
    necklaces: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    bracelets: "https://images.unsplash.com/photo-1611591475119-232145e143b4?q=80&w=1000&auto=format&fit=crop",
    color1: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=700&auto=format&fit=crop",
    color2: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=500&auto=format&fit=crop",
};

const TILES = [
    { slug: "rings", tag: "14Kt & 18Kt Gold", title: "Solitaire & Eternity Rings", sub: "Engagement Bands & Daily Stackable Rings", img: IMG.rings },
    { slug: "earrings", tag: "Certified Natural", title: "Diamond Earrings", sub: "Studs, Huggies & Drops", img: IMG.earrings },
    { slug: "necklaces", tag: null, title: "Necklaces & Pendants", sub: "Solitaire Drops & Fine Chains", img: IMG.necklaces },
    { slug: "bracelets", tag: "Tennis Collection", title: "Diamond Bracelets & Bangles", sub: "Classic silhouettes in 14Kt & 18Kt Gold", img: IMG.bracelets },
];

const FOUR_CS = [
    ["01", "Carat", "Carat Weight", "Measures diamond weight. From subtle daily 0.20 Ct to statement 2.00+ Ct solitaires."],
    ["02", "Cut", "Cut & Brilliance", "Determines light reflection. We craft Excellent & Ideal cuts for maximal sparkle."],
    ["03", "Clarity", "Clarity Grade", "Purity rating. Choose between premium VVS or VS clarity natural earth stones."],
    ["04", "Color", "Colorless Grade", "Ranging from EF (Rare Colorless) to GH (Near Colorless) for optimal value and brilliance."],
];

const ArrowIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="12" x2="20" y2="12" /><polyline points="13 5 20 12 13 19" />
    </svg>
);

const GemIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
    </svg>
);

const StampIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4z" />
        <polyline points="9 12 11 14 15 10" />
    </svg>
);

const RefundIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.5 15a9 9 0 1 0 2-9.4L1 10" />
    </svg>
);

const SwapIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 3 21 7 17 11" /><line x1="21" y1="7" x2="7" y2="7" />
        <polyline points="7 21 3 17 7 13" /><line x1="3" y1="17" x2="21" y2="17" />
    </svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" className="text-blush shrink-0" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12.5l2.5 2.5L16 9.5" stroke="#2E3A4C" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const TRUST = [
    [GemIcon, "100% Natural Diamonds", "Earth-mined certified diamonds."],
    [StampIcon, "14Kt & 18Kt Gold", "BIS Hallmarked solid gold."],
    [RefundIcon, "15-Day Money Back", "100% full refund guarantee."],
    [SwapIcon, "Lifetime Buyback", "Exchange or upgrade anytime."],
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
        <div>
            <section className="max-w-[1440px] mx-auto px-8 lg:px-20 pt-7 pb-8">
                <div className="grid lg:grid-cols-[1.05fr_0.95fr_0.62fr] gap-8 items-center">
                    <div className="pr-2">
                        <span className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold text-ink shadow-card">
                            <span className="w-2 h-2 rounded-full bg-blush inline-block" />
                            Fine Diamond Essentials 2026
                        </span>
                        <h1 className="font-serif text-ink text-[40px] md:text-[54px] leading-[1.05] mt-4">
                            Designed For<br />Every Day.<br />Crafted Forever.
                        </h1>
                        <p className="text-ink/60 text-sm leading-relaxed max-w-md mt-4">
                            Handcrafted with certified 100% natural earth-mined diamonds set in 14Kt and 18Kt
                            solid gold. Fashionable, effortless fine jewellery designed to be worn and loved daily.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-6">
                            <Link href="/category/rings" className="btn-solid inline-flex items-center gap-2">
                                Explore Collection <ArrowIcon />
                            </Link>
                            <Link href="/category/rings" className="btn-outline">Solitaire Bands</Link>
                        </div>
                    </div>

                    <div className="relative rounded-3xl overflow-hidden shadow-hero">
                        <img src={IMG.hero} alt="Aura Solitaire Diamond Ring" className="w-full h-[300px] md:h-[360px] object-cover" />
                        <div className="absolute left-4 right-4 bottom-4 rounded-xl bg-white/60 backdrop-blur-md px-5 py-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gold-dark">18Kt Solid Yellow Gold</p>
                            <p className="font-serif text-ink text-lg mt-0.5">Aura Solitaire Diamond Ring</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden shadow-card">
                            <img src={IMG.studs} alt="14Kt White Gold Halo Studs" className="w-full h-40 object-cover" />
                            <p className="absolute left-3 right-3 bottom-3 rounded-md bg-ink/90 text-white text-center font-serif text-sm py-2">
                                14Kt White Gold Halo Studs
                            </p>
                        </div>

                        <div className="bg-ink rounded-2xl p-5 shadow-card">
                            <span className="w-9 h-9 rounded-full bg-white/10 text-blush flex items-center justify-center">
                                <GemIcon />
                            </span>
                            <p className="font-serif font-semibold text-blush text-lg mt-3">IGI & GIA Certified</p>
                            <p className="text-white/70 text-xs leading-relaxed mt-1.5">
                                Every diamond verified for 100% earth-mined origin.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-10">
                    {TRUST.map(([Icon, t, s]) => (
                        <div key={t} className="bg-white rounded-2xl px-5 py-6 shadow-card text-center">
                            <span className="w-9 h-9 mx-auto rounded-full bg-ink text-blush flex items-center justify-center">
                                <Icon />
                            </span>
                            <p className="font-serif text-lg text-ink mt-3 mb-1">{t}</p>
                            <p className="text-xs text-ink/55">{s}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-[1440px] mx-auto px-8 lg:px-20 py-8">
                <h2 className="text-4xl mb-5">Shop By Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                    {TILES.map((c) => (
                        <Link key={c.slug} href={`/category/${c.slug}`} className="group block">
                            <div className="bg-cream aspect-[15/16] mb-3 overflow-hidden rounded-2xl">
                                <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            {c.tag && <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gold-dark mb-1">{c.tag}</p>}
                            <h3 className="font-serif text-base lg:text-lg leading-snug">{c.title}</h3>
                            <p className="text-[11px] lg:text-xs text-ink/55 mt-1">{c.sub}</p>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="max-w-[1440px] mx-auto px-8 lg:px-20 py-8">
                <div className="bg-ink rounded-3xl px-8 lg:px-14 py-12 grid lg:grid-cols-2 gap-10 items-center shadow-card">
                    <div>
                        <span className="inline-block rounded-full bg-blush/20 text-blush uppercase tracking-[0.22em] text-[10px] font-semibold px-5 py-2.5">
                            Precious Color Accents
                        </span>
                        <h2 className="font-serif text-white text-4xl md:text-5xl leading-tight mt-6">
                            Color Stone Fine Jewellery
                        </h2>
                        <p className="text-white/70 text-sm leading-relaxed max-w-md mt-5">
                            Handpicked precious color stone accents paired with earth-mined natural diamonds.
                            Set in hallmarked 18Kt solid yellow and rose gold settings.
                        </p>
                        <ul className="mt-6 space-y-3">
                            <li className="flex items-center gap-3 text-sm text-white/85">
                                <CheckIcon />
                                Ruby-Red & Emerald-Green Color Stone Accents
                            </li>
                            <li className="flex items-center gap-3 text-sm text-white/85">
                                <CheckIcon />
                                Set in 14Kt and 18Kt Solid Gold Settings
                            </li>
                        </ul>
                        <Link
                            href="/category/color-stone"
                            className="inline-flex items-center gap-3 bg-white text-ink uppercase tracking-[0.18em] text-[11px] font-medium px-8 py-4 rounded-md hover:bg-blush transition-colors mt-8"
                        >
                            Explore Color Stone Edit <ArrowIcon />
                        </Link>
                    </div>

                    <div className="grid grid-cols-[1.15fr_0.85fr] gap-5 items-start">
                        <img
                            src={IMG.color1}
                            alt="Color stone pendant on gold chain"
                            className="rounded-2xl w-full h-[360px] object-cover -rotate-1 shadow-hero"
                        />
                        <div className="space-y-5">
                            <div className="bg-white rounded-2xl p-2.5 rotate-1 shadow-hero">
                                <img src={IMG.color2} alt="Pink sapphire halo ring" className="rounded-xl w-full h-40 object-cover" />
                            </div>
                            <div className="bg-white/10 rounded-xl px-5 py-5">
                                <p className="font-serif font-semibold text-blush text-lg">Custom Color Settings</p>
                                <p className="text-white/75 text-sm leading-relaxed mt-1.5">
                                    Choose between Ruby, Sapphire & Emerald Tones
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-[1440px] mx-auto px-8 lg:px-20 py-8">
                <div className="flex items-end justify-between mb-5">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gold-dark mb-2">Our best sellers</p>
                        <h2 className="text-4xl">Most Loved Designs</h2>
                    </div>
                    <Link
                        href="/category/rings"
                        className="text-xs font-medium uppercase tracking-[0.18em] text-ink border-b border-ink/50 pb-1.5 hover:text-gold-dark hover:border-gold-dark transition-colors"
                    >
                        View All Products →
                    </Link>
                </div>
                {products.length ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((p) => <ProductCard key={p.id ?? p.slug} product={p} />)}
                    </div>
                ) : (
                    <p className="text-sm text-ink/55">Loading curated pieces…</p>
                )}
            </section>

            <section className="bg-cream border-t border-line">
                <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-8">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gold-dark mb-2">Natural Diamond Education</p>
                    <h2 className="text-4xl md:text-5xl mb-3">Understand Your Diamond (The 4Cs)</h2>
                    <p className="text-base text-ink/60 mb-8">
                        Every YA-RA® diamond is certified by renowned third party laboratories like SGL & IGI so you purchase with absolute trust.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                        {FOUR_CS.map(([n, t, h, b]) => (
                            <div key={n} className="border-t border-ink pt-5">
                                <p className="font-serif italic text-3xl text-ink mb-2">{n}. {t}</p>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark mb-2">{h}</p>
                                <p className="text-sm leading-relaxed text-ink/65">{b}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}