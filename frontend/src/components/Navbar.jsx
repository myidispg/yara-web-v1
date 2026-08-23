"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/client";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const categories = [
    { slug: "rings", label: "Rings" },
    { slug: "earrings", label: "Earrings" },
    { slug: "necklaces", label: "Necklaces" },
    { slug: "bracelets", label: "Bracelets" },
    { slug: "solitaires", label: "Solitaires" },
    { slug: "color-stone", label: "Color Stone" },
];

const SearchIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const BagIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
);

const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export default function Navbar() {
    const { count } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const initialPathRef = useRef(null);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Lock body scroll when search is open; restore when closed or on unmount
    useEffect(() => {
        if (!mounted) return;
        const originalOverflow = document.body.style.overflow;
        if (searchOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [searchOpen, mounted]);

    // Auto-close search on route change (ignore first render)
    useEffect(() => {
        if (initialPathRef.current === null) {
            initialPathRef.current = pathname;
            return;
        }
        if (pathname !== initialPathRef.current) {
            closeSearch();
            initialPathRef.current = pathname;
        }
    }, [pathname]);

    useEffect(() => {
        if (query.trim().length < 2) { setResults([]); return; }
        setSearching(true);
        const t = setTimeout(async () => {
            try {
                const { data } = await api.get("/products/", { params: { search: query.trim() } });
                setResults((data?.results ?? data).slice(0, 6));
            } catch { setResults([]); }
            setSearching(false);
        }, 350);
        return () => clearTimeout(t);
    }, [query]);

    const closeSearch = () => { setSearchOpen(false); setQuery(""); setResults([]); };

    return (
        <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-sm">
            <div className="bg-charcoal text-white text-center py-2 px-4 text-[10px] uppercase tracking-[0.2em] font-semibold">
                ✨ 100% Certified Natural Diamonds & 14Kt/18Kt Solid Gold
            </div>

            <div className="flex items-center gap-6 lg:gap-10 px-6 lg:px-12 py-5">
                <button className="md:hidden text-charcoal text-2xl" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
                    ☰
                </button>

                <Link href="/" className="shrink-0 block">
                    <span className="font-serif text-2xl lg:text-3xl tracking-[0.3em]">YA-RA</span>
                    <span className="hidden xl:block text-[10px] uppercase tracking-[0.2em] text-ink/50 mt-1">
                        Diamond, Gold and Gemstone Fine Jewellery
                    </span>
                </Link>

                <nav className="hidden md:flex flex-1 justify-center gap-6 lg:gap-10 uppercase tracking-[0.16em] text-[13px] lg:text-[15px] xl:text-[14px] font-medium">
                    {categories.map((c) => (
                        <Link key={c.slug} href={`/category/${c.slug}`} className="hover:text-gold-dark transition-colors whitespace-nowrap">
                            {c.label}
                        </Link>
                    ))}
                </nav>
                <div className="flex-1 md:hidden" />

                <div className="flex items-center gap-5">
                    <button
                        onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
                        className="text-charcoal hover:text-gold-dark transition-colors"
                        aria-label="Search"
                    >
                        <SearchIcon />
                    </button>

                    <Link
                        href={user ? "/account" : "/auth"}
                        className="text-charcoal hover:text-gold-dark transition-colors"
                        aria-label="Account & Orders"
                    >
                        <UserIcon />
                    </Link>

                    <button
                        onClick={() => router.push("/cart")}
                        className="relative text-charcoal hover:text-gold-dark transition-colors"
                        aria-label="Shopping Bag"
                    >
                        <BagIcon />
                        {mounted && count > 0 && (
                            <span className="absolute -top-2 -right-2 bg-blush text-ink text-[11px] font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                                {count}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {searchOpen && (
                <div className="border-t border-line bg-ivory px-6 lg:px-10 py-5">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-4">
                            <SearchIcon size={20} />
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") closeSearch();
                                    if (e.key === "Enter" && query.trim().length >= 2) {
                                        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                                        closeSearch();
                                    }
                                }}
                                placeholder="Search rings, earrings, pendants… (Enter for full results)"
                                className="flex-1 bg-transparent border-b border-charcoal/30 py-2 text-base focus:outline-none focus:border-gold-dark"
                            />
                            <button onClick={closeSearch} className="text-charcoal hover:text-gold-dark" aria-label="Close search">
                                <CloseIcon />
                            </button>
                        </div>

                        {searching && <p className="text-[10px] uppercase tracking-[0.2em] text-ink/50 mt-4">Searching…</p>}

                        {!searching && results.length > 0 && (
                            <ul className="mt-4 divide-y divide-line">
                                {results.map((p) => (
                                    <li key={p.id ?? p.slug}>
                                        <Link
                                            href={`/product/${p.slug}`}
                                            onClick={closeSearch}
                                            className="flex items-center gap-4 py-3 px-2 hover:bg-cream"
                                        >
                                            <img src={p.media?.[0]?.url ?? ""} alt={p.name} className="w-12 h-12 object-cover bg-cream rounded-md" />
                                            <span className="flex-1">
                                                <span className="block font-serif text-base">{p.name}</span>
                                                <span className="block text-xs text-ink/55">{p.category_name}</span>
                                            </span>
                                            <span className="text-sm font-medium">{inr(p.base_price)}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {!searching && query.trim().length >= 2 && results.length === 0 && (
                            <p className="text-sm text-ink/55 mt-4">No pieces match "{query}".</p>
                        )}

                        {!searching && results.length > 0 && (
                            <button
                                onClick={() => {
                                    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                                    closeSearch();
                                }}
                                className="mt-4 w-full text-center text-xs uppercase tracking-[0.2em] font-semibold text-gold-dark hover:text-ink py-2.5 border border-line rounded-lg"
                            >
                                View all results for "{query}" →
                            </button>
                        )}
                    </div>
                </div>
            )}

            {mobileOpen && (
                <div className="md:hidden border-t border-line px-6 py-6 space-y-4 uppercase tracking-[0.16em] text-[15px] font-medium">
                    {categories.map((c) => (
                        <Link key={c.slug} href={`/category/${c.slug}`} className="block hover:text-gold-dark" onClick={() => setMobileOpen(false)}>
                            {c.label}
                        </Link>
                    ))}
                    <hr className="border-line" />
                    <Link href={user ? "/account" : "/auth"} className="block hover:text-gold-dark" onClick={() => setMobileOpen(false)}>
                        My Account & Orders
                    </Link>
                    <Link href="/policies" className="block hover:text-gold-dark" onClick={() => setMobileOpen(false)}>
                        Policies & Certifications
                    </Link>
                </div>
            )}
        </header>
    );
}