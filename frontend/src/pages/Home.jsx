import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import usePageTitle from "../utils/usePageTitle";

usePageTitle();

const IMG = {
    hero: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop",
    studs: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=400&auto=format&fit=crop",
    rings: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop",
    earrings: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=800&auto=format&fit=crop",
    necklaces: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    bracelets: "https://images.unsplash.com/photo-1611591475119-232145e143b4?q=80&w=800&auto=format&fit=crop",
    color1: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=700&auto=format&fit=crop",
    color2: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=500&auto=format&fit=crop",
};

const TILES = [
    { slug: "rings", tag: "14Kt & 18Kt Gold", title: "Solitaire & Eternity Rings", sub: "Engagement Bands & Daily Stackable Rings", img: IMG.rings },
    { slug: "earrings", tag: "Certified Natural", title: "Diamond Earrings", sub: "Studs, Huggies & Drops", img: IMG.earrings },
    { slug: "necklaces", tag: "Fine Chains", title: "Necklaces & Pendants", sub: "Solitaire Drops & Fine Chains", img: IMG.necklaces },
    { slug: "bracelets", tag: "Tennis Collection", title: "Diamond Bracelets & Bangles", sub: "Classic silhouettes in 14Kt & 18Kt Gold", img: IMG.bracelets },
];

const TRUST = [
    ["100% Natural Diamonds", "Earth-mined certified diamonds."],
    ["14Kt & 18Kt Gold", "BIS Hallmarked solid gold."],
    ["15-Day Money Back", "100% full refund guarantee."],
    ["Lifetime Buyback", "Exchange or upgrade anytime."],
];

const FOUR_CS = [
    ["01", "Carat", "Carat Weight", "Measures diamond weight. From subtle daily 0.20 Ct to statement 2.00+ Ct solitaires."],
    ["02", "Cut", "Cut & Brilliance", "Determines light reflection. We craft Excellent & Ideal cuts for maximal sparkle."],
    ["03", "Clarity", "Clarity Grade", "Purity rating. Choose between premium VVS or VS clarity natural earth stones."],
    ["04", "Color", "Colorless Grade", "Ranging from EF (Rare Colorless) to GH (Near Colorless) for optimal value and brilliance."],
];

export default function Home() {
    const [products, setProducts] = useState([]);
    useEffect(() => {
        (async () => {
            for (const path of ["/products/", "/catalog/products/"]) {
                try {
                    const { data } = await api.get(path);
                    const list = data?.results ?? data;
                    if (Array.isArray(list) && list.length) { setProducts(list.slice(0, 4)); return; }
                } catch { /* next */ }
            }
        })();
    }, []);

    return (
        <div>
            {/* ── HERO ── */}
            <section className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center px-6 lg:px-10 pt-14 pb-24">
                <div>
                    <p className="eyebrow mb-5">Fine Diamond Essentials 2026</p>
                    <h1 className="text-5xl md:text-6xl leading-[1.05] mb-6">
                        Designed For Every Day. <em className="text-gold-dark">Crafted Forever.</em>
                    </h1>
                    <p className="text-sm text-charcoal/65 max-w-md mb-10">
                        Handcrafted with certified 100% natural earth-mined diamonds set in 14Kt and 18Kt
                        solid gold. Fashionable, effortless fine jewellery designed to be worn and loved daily.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/category/rings" className="btn-solid">Explore Collection</Link>
                        <Link to="/category/solitaires" className="btn-outline">Solitaire Bands</Link>
                    </div>
                </div>

                <div className="relative">
                    <img src={IMG.hero} alt="Aura Solitaire Diamond Ring" className="w-full h-[440px] md:h-[540px] object-cover" />
                    <div className="absolute bottom-20 left-0 bg-white px-5 py-4 shadow-card">
                        <p className="micro-label text-gold-dark">18Kt Solid Yellow Gold</p>
                        <p className="font-serif text-sm mt-1">Aura Solitaire Diamond Ring</p>
                    </div>
                    <div className="absolute -bottom-10 right-6 w-44 bg-white shadow-card">
                        <img src={IMG.studs} alt="14Kt White Gold Halo Studs" className="h-36 w-full object-cover" />
                        <p className="micro-label px-4 py-3 text-charcoal/70">14Kt White Gold Halo Studs</p>
                    </div>
                </div>
            </section>

            {/* ── TRUST STRIP ── */}
            <section className="border-y border-line">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
                    <p className="text-center mb-10">
                        <span className="eyebrow">IGI &amp; GIA Certified</span>
                        <span className="block text-xs text-charcoal/55 mt-2">Every diamond verified for 100% earth-mined origin.</span>
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 md:divide-x md:divide-line text-center">
                        {TRUST.map(([t, s]) => (
                            <div key={t} className="px-4">
                                <p className="font-serif text-lg mb-1">{t}</p>
                                <p className="text-xs text-charcoal/55">{s}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SHOP BY CATEGORY ── */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
                <p className="eyebrow mb-2">Curated Collections</p>
                <h2 className="text-4xl mb-10">Shop By Category</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {TILES.map((c) => (
                        <Link key={c.slug} to={`/category/${c.slug}`} className="group block">
                            <div className="bg-cream aspect-[3/4] mb-4 overflow-hidden">
                                <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <p className="micro-label text-gold-dark mb-1">{c.tag}</p>
                            <h3 className="font-serif text-lg leading-snug">{c.title}</h3>
                            <p className="text-xs text-charcoal/55 mt-1">{c.sub}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── COLOR STONE ── */}
            <section className="border-t border-line">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center px-6 lg:px-10 py-20">
                    <div>
                        <p className="eyebrow mb-3">Precious Color Accents</p>
                        <h2 className="text-4xl mb-5">Color Stone Fine Jewellery</h2>
                        <p className="text-sm text-charcoal/65 max-w-md mb-8">
                            Handpicked precious color stone accents paired with earth-mined natural diamonds.
                            Set in hallmarked 18Kt solid yellow and rose gold settings.
                        </p>
                        <Link to="/category/color-stone" className="micro-label text-gold-dark underline underline-offset-8 hover:text-charcoal">
                            Explore Color Stone Edit →
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <figure>
                            <img src={IMG.color1} alt="Ruby & emerald accents" className="h-64 w-full object-cover" />
                            <figcaption className="text-xs text-charcoal/60 mt-3">
                                <span className="font-serif text-sm text-charcoal block">Ruby-Red &amp; Emerald-Green Accents</span>
                                Set in 14Kt and 18Kt Solid Gold Settings
                            </figcaption>
                        </figure>
                        <figure className="mt-10">
                            <img src={IMG.color2} alt="Custom color settings" className="h-64 w-full object-cover" />
                            <figcaption className="text-xs text-charcoal/60 mt-3">
                                <span className="font-serif text-sm text-charcoal block">Custom Color Settings</span>
                                Choose between Ruby, Sapphire &amp; Emerald Tones
                            </figcaption>
                        </figure>
                    </div>
                </div>
            </section>

            {/* ── MOST LOVED ── */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="eyebrow mb-2">Iconic Essentials</p>
                        <h2 className="text-4xl">Most Loved Designs</h2>
                    </div>
                    <Link to="/category/rings" className="micro-label underline underline-offset-8 hover:text-gold-dark">
                        View All Products →
                    </Link>
                </div>
                {products.length ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((p) => <ProductCard key={p.id ?? p.slug} product={p} />)}
                    </div>
                ) : (
                    <p className="text-sm text-charcoal/55">Loading curated pieces…</p>
                )}
            </section>

            {/* ── 4Cs ── */}
            <section className="bg-cream border-t border-line">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
                    <p className="eyebrow mb-2">Natural Diamond Education</p>
                    <h2 className="text-4xl mb-2">Understand Your Diamond (The 4Cs)</h2>
                    <p className="text-sm text-charcoal/60 mb-12">
                        Every YA-RA® diamond is certified by IGI &amp; GIA so you purchase with absolute trust.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                        {FOUR_CS.map(([n, t, h, b]) => (
                            <div key={n} className="border-t border-charcoal pt-4">
                                <p className="font-serif italic text-2xl mb-1">{n}. {t}</p>
                                <p className="micro-label text-gold-dark mb-2">{h}</p>
                                <p className="text-xs text-charcoal/65">{b}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}