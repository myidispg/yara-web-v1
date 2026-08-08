import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import { useCategories } from "../context/CategoryContext";

const MARQUEE = ["Natural & IGI certified", "BIS 916 hallmarked gold", "Free insured shipping",
    "15-day easy returns", "Lifetime exchange", "Handcrafted in Jaipur"];

const FALLBACK_CATS = [
    { name: "Rings", slug: "rings", image_url: "https://picsum.photos/seed/collection-rings/1200/1500", subcategories: [{}] },
    { name: "Earrings", slug: "earrings", image_url: "https://picsum.photos/seed/collection-earrings/900/1100", subcategories: [{}, {}] },
    { name: "Pendants", slug: "pendants", image_url: "https://picsum.photos/seed/collection-pendants/900/1100", subcategories: [{}] },
    { name: "Bracelets", slug: "bracelets", image_url: "https://picsum.photos/seed/collection-bracelets/900/1100", subcategories: [{}] },
    { name: "Chains", slug: "chains", image_url: "https://picsum.photos/seed/collection-chains/900/1100", subcategories: [{}] },
];

const FALLBACK_FEATURED = [
    { slug: "arka-solitaire-ring", name: "Arka Solitaire Ring", category_name: "Rings", base_price: 84500, mrp: 98000, discount_percent: 14, stock_status: "in_stock", colors: ["yellow", "rose", "white"], primary_image: "https://picsum.photos/seed/arka-solitaire/900/1125", second_image: "https://picsum.photos/seed/arka-solitaire-alt/900/1125" },
    { slug: "nakshatra-diamond-studs", name: "Nakshatra Diamond Studs", category_name: "Earrings", base_price: 33500, mrp: 39000, discount_percent: 14, stock_status: "in_stock", colors: ["yellow", "white"], primary_image: "https://picsum.photos/seed/nakshatra-studs/900/1125", second_image: "https://picsum.photos/seed/nakshatra-studs-alt/900/1125" },
    { slug: "jyoti-solitaire-pendant", name: "Jyoti Solitaire Pendant", category_name: "Pendants", base_price: 52600, mrp: 59900, discount_percent: 12, stock_status: "in_stock", colors: ["yellow", "rose", "white"], primary_image: "https://picsum.photos/seed/jyoti-pendant/900/1125", second_image: "https://picsum.photos/seed/jyoti-pendant-alt/900/1125" },
    { slug: "sarita-tennis-bracelet", name: "Sarita Tennis Bracelet", category_name: "Bracelets", base_price: 129000, mrp: 149000, discount_percent: 13, stock_status: "in_stock", colors: ["white", "yellow"], primary_image: "https://picsum.photos/seed/sarita-tennis/900/1125", second_image: "https://picsum.photos/seed/sarita-tennis-alt/900/1125" },
];

const FOUR_CS = [
    ["01", "Cut", "Proportion and symmetry decide a stone's fire. We cut for light return — not carat weight alone."],
    ["02", "Colour", "We work almost exclusively in F–G, near-colourless: white against gold, never icy or dull."],
    ["03", "Clarity", "VS by default. Every inclusion is mapped on the IGI certificate that travels with your piece."],
    ["04", "Carat", "From 0.10 ct accents to 3.00 ct solos. Matched pairs and rare sizes sourced on request."],
];

function Hero() {
    return (
        <section className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-gold/10 blur-3xl" />
            <div className="mx-auto grid max-w-7xl gap-16 px-5 pb-24 pt-14 md:grid-cols-12 md:pt-20 lg:px-8">
                <div className="md:col-span-6">
                    <p className="mask-line eyebrow"><span>Natural diamonds · IGI certified · Handmade in India</span></p>
                    <h1 className="mt-6 font-display text-6xl leading-[0.98] tracking-tight sm:text-7xl">
                        <span className="mask-line"><span>Earth-made fire,</span></span>
                        <span className="mask-line"><span className="italic text-gold-deep" style={{ animationDelay: "130ms" }}>set by hand</span></span>
                        <span className="mask-line"><span style={{ animationDelay: "260ms" }}>in Jaipur.</span></span>
                    </h1>
                    <p className="mt-7 max-w-md text-[15px] leading-relaxed text-ink/70">
                        VAIRA cuts, certifies and sets natural diamonds into 14 & 18 KT gold — solitaires,
                        tennis bracelets and heirloom jhumkas, shipped insured anywhere in India.
                    </p>
                    <div className="mt-9 flex flex-wrap gap-4">
                        <Link to="/category/rings" className="btn-gold">Shop the collections</Link>
                        <a href="#viewing" className="btn-ghost">Book a private viewing</a>
                    </div>
                    <ul className="mt-11 flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.22em] text-ink/60">
                        {["IGI certified", "BIS 916 hallmark", "Insured delivery", "Lifetime exchange"].map((t) => (
                            <li key={t} className="flex items-center gap-2"><span className="h-1 w-1 rotate-45 bg-gold" />{t}</li>
                        ))}
                    </ul>
                </div>

                <div className="relative md:col-span-6">
                    <div className="relative ml-auto max-w-md">
                        <div className="absolute -inset-3 border border-gold/50" aria-hidden="true" />
                        <img src="https://picsum.photos/seed/vaira-solitaire-hero/900/1150" alt="Solitaire ring on silk"
                            className="relative aspect-[3/4] w-full animate-breathe object-cover shadow-luxe" />
                        <div className="absolute -left-12 bottom-10 hidden w-56 border border-gold/40 bg-ivory p-4 shadow-card sm:block">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gold-deep">Certificate</p>
                            <p className="mt-1 font-display text-lg">IGI · 48C-2210194</p>
                            <p className="mt-1 text-xs leading-relaxed text-ink/60">1.02 ct · Round brilliant<br />F colour · VS1 clarity</p>
                        </div>
                        <svg className="absolute -right-8 -top-12 h-28 w-28 animate-spin-slow drop-shadow" viewBox="0 0 120 120" aria-hidden="true">
                            <defs><path id="sealcirc" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
                            <circle cx="60" cy="60" r="58" fill="#173227" />
                            <circle cx="60" cy="60" r="30" fill="none" stroke="#c19a4b" strokeWidth="1" />
                            <text fontSize="9.5" letterSpacing="2.6" fill="#e3cd9b">
                                <textPath href="#sealcirc">VAIRA · NATURAL DIAMONDS · JAIPUR · EST. 2026 ·</textPath>
                            </text>
                            <text x="60" y="67" textAnchor="middle" fontSize="20" fill="#c19a4b">◆</text>
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Marquee() {
    const items = [...MARQUEE, ...MARQUEE];
    return (
        <div className="overflow-hidden border-y border-gold/30 bg-gold py-3">
            <div className="flex w-max animate-marquee gap-10">
                {items.map((t, i) => (
                    <span key={i} className="flex items-center gap-10 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.3em] text-ink">
                        {t}<span className="text-ink/50">◆</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

function CategoryMosaic() {
    const { categories } = useCategories();
    const cats = categories.length ? categories.slice(0, 5) : FALLBACK_CATS;
    return (
        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
            <Reveal>
                <p className="eyebrow">The collections</p>
                <div className="mt-3 flex items-end justify-between gap-6">
                    <h2 className="font-display text-4xl tracking-tight sm:text-5xl">Five ways to wear light</h2>
                    <div className="gold-rule mb-3 hidden flex-1 md:block" />
                </div>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[230px] md:grid-cols-4">
                {cats.map((c, i) => (
                    <Reveal key={c.slug} delay={i * 80} className={i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}>
                        <Link to={`/category/${c.slug}`} className="zoom-hover group relative block h-64 overflow-hidden md:h-full">
                            <img src={c.image_url || `https://picsum.photos/seed/collection-${c.slug}/900/1100`} alt={c.name}
                                loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                                <div>
                                    <h3 className="font-display text-2xl text-ivory">{c.name}</h3>
                                    <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-champagne/80">
                                        {c.subcategories?.length ? `${c.subcategories.length} edits` : "Explore"}
                                    </p>
                                </div>
                                <span className="translate-x-2 text-xl text-gold opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">→</span>
                            </div>
                        </Link>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

function Featured() {
    const [products, setProducts] = useState([]);
    useEffect(() => {
        api.get("/products/", { params: { featured: 1 } })
            .then((r) => setProducts(r.data.results ?? r.data))
            .catch(() => setProducts(FALLBACK_FEATURED));
    }, []);
    const list = products.length ? products.slice(0, 8) : FALLBACK_FEATURED;

    return (
        <section className="bg-gold-pale">
            <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
                <Reveal>
                    <p className="eyebrow">The edit · Monsoon 2026</p>
                    <div className="mt-3 flex items-end justify-between gap-6">
                        <h2 className="font-display text-4xl tracking-tight sm:text-5xl">Most requested this season</h2>
                        <Link to="/category/rings" className="hidden pb-1 text-[11px] uppercase tracking-[0.25em] text-ink/60 transition hover:text-gold-deep md:block">View all →</Link>
                    </div>
                </Reveal>
                <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
                    {list.map((p, i) => (
                        <Reveal key={p.id ?? p.slug} delay={(i % 4) * 90}><ProductCard product={p} /></Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Craft() {
    return (
        <section className="bg-pine text-ivory">
            <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 md:grid-cols-2 lg:px-8">
                <Reveal>
                    <p className="eyebrow !text-gold-light">The atelier</p>
                    <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
                        Cut, set and hallmarked under one roof.
                    </h2>
                    <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/65">
                        Most houses outsource. We don't. Our Jaipur atelier rough-sources, cuts and polishes
                        its own stones, then sets them in BIS-hallmarked gold — so the certificate, the metal
                        and the maker are always the same story.
                    </p>
                    <div className="mt-10 grid grid-cols-3 gap-6">
                        {[["1,800+", "stones IGI certified"], ["42", "master karigars"], ["6–8 wks", "bespoke lead time"]].map(([n, l]) => (
                            <div key={l} className="border-l border-gold pl-4">
                                <p className="font-display text-2xl text-gold-light">{n}</p>
                                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ivory/55">{l}</p>
                            </div>
                        ))}
                    </div>
                </Reveal>
                <Reveal delay={150}>
                    <div className="relative ml-auto max-w-md">
                        <div className="absolute -inset-3 border border-gold/40" aria-hidden="true" />
                        <img src="https://picsum.photos/seed/vaira-atelier-hands/900/1100" alt="Karigar setting a stone"
                            loading="lazy" className="relative aspect-[4/5] w-full object-cover" />
                        <img src="https://picsum.photos/seed/vaira-atelier-tools/500/620" alt="Setting tools" loading="lazy"
                            className="absolute -bottom-10 -left-14 hidden w-44 border-4 border-pine object-cover shadow-luxe md:block" />
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

function FourCs() {
    return (
        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
            <Reveal>
                <p className="eyebrow">Know your stone</p>
                <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">The four Cs, honestly explained</h2>
            </Reveal>
            <div className="mt-12">
                {FOUR_CS.map(([n, name, copy], i) => (
                    <Reveal key={n} delay={i * 60}>
                        <div className="group grid gap-2 border-t border-ink/15 py-8 transition-colors duration-500 hover:bg-pine md:grid-cols-[100px_240px_1fr] md:items-baseline md:px-6">
                            <span className="text-[11px] uppercase tracking-[0.3em] text-gold-deep group-hover:text-gold-light">{n}</span>
                            <h3 className="font-display text-3xl transition-colors group-hover:text-ivory">{name}</h3>
                            <p className="max-w-xl text-sm leading-relaxed text-ink/65 transition-colors group-hover:text-ivory/70">{copy}</p>
                        </div>
                    </Reveal>
                ))}
                <div className="border-t border-ink/15" />
            </div>
        </section>
    );
}

function Testimonials() {
    return (
        <section className="bg-parchment">
            <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 md:grid-cols-2 lg:px-8">
                <Reveal>
                    <span className="font-display text-6xl text-gold">“</span>
                    <p className="mt-2 max-w-md font-display text-2xl italic leading-relaxed text-ink/85">
                        The solitaire arrived with the certificate, the hallmark, and a handwritten note.
                        It felt less like delivery, more like a handover.
                    </p>
                    <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-ink/55">Riya M. · Mumbai</p>
                </Reveal>
                <Reveal delay={150} className="md:mt-16">
                    <span className="font-display text-6xl text-gold">“</span>
                    <p className="mt-2 max-w-md font-display text-2xl italic leading-relaxed text-ink/85">
                        I asked for my grandmother's jhumka, redrawn. They sent wax impressions first.
                        Two generations of our family now wear the same pattern.
                    </p>
                    <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-ink/55">Ananya K. · Bengaluru</p>
                </Reveal>
            </div>
        </section>
    );
}

function Viewing() {
    return (
        <section id="viewing" className="relative overflow-hidden bg-ink text-ivory">
            <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[720px] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
            <div className="mx-auto max-w-3xl px-5 py-24 text-center lg:px-8">
                <Reveal>
                    <p className="eyebrow !text-gold-light">Private viewings</p>
                    <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
                        See it before you say yes.
                    </h2>
                    <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-ivory/60">
                        Book a one-on-one viewing in Mumbai, Delhi, Bengaluru or Jaipur — loose stones under
                        the loupe, coffee on the house, no obligation.
                    </p>
                    <div className="mt-9 flex flex-wrap justify-center gap-4">
                        <a href="tel:+919820000000" className="btn-gold">Call +91 98200 00000</a>
                        <a href="#" className="btn-ghost-light">WhatsApp the concierge</a>
                    </div>
                    <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-ivory/40">Mon–Sat · 10:00–19:00 IST</p>
                </Reveal>
            </div>
        </section>
    );
}

export default function Home() {
    return (
        <>
            <Hero />
            <Marquee />
            <CategoryMosaic />
            <Featured />
            <Craft />
            <FourCs />
            <Testimonials />
            <Viewing />
        </>
    );
}