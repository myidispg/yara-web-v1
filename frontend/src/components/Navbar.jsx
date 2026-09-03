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

export default function Navbar() {
    const { count } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const initialPathRef = useRef(null);
    const isControl = pathname.startsWith("/control");

    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!mounted) return;
        if (searchOpen || mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            // removeProperty is the ONLY bulletproof way to fix Safari's scroll lock bug
            document.body.style.removeProperty('overflow');
            document.documentElement.style.removeProperty('overflow');
        }
    }, [searchOpen, mobileOpen, mounted]);

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
                setResults((data?.results ?? data).slice(0, 4)); // Limit to 3 so the button is always visible
            } catch { setResults([]); }
            setSearching(false);
        }, 350);
        return () => clearTimeout(t);
    }, [query]);

    const closeSearch = () => { setSearchOpen(false); setQuery(""); setResults([]); };

    // Helper to safely navigate to search page and fix Safari scroll locking
    const navigateToSearch = () => {
        if (query.trim().length < 2) return;

        // 1. Instantly delete inline overflow styles
        document.body.style.removeProperty('overflow');
        document.documentElement.style.removeProperty('overflow');

        // 2. Close the drawer
        closeSearch();

        // 3. Push the route
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    };

    return (
        <header className="sticky top-0 z-40">
            {/* Announcement Bar */}
            {/* <div className="bg-[#1A2536] text-white text-center py-2.5 px-4 text-[11px] uppercase tracking-wider font-semibold border-b border-[#D4AF37]/30">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-[#E5BDB0]">
                            ✨ 100% Certified Earth-Mined Natural Diamonds
                        </span>
                        <span className="hidden md:inline text-[#D4AF37]/60">•</span>
                        <span className="hidden md:inline text-amber-200">No Lab-Grown • Solid 14KT & 18KT Gold Only</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[#E5BDB0] font-serif-luxury italic text-xs">✨ Free Insured Pan-India Express Delivery</span>
                    </div>
                </div>
            </div> */}

            {/* Main Navigation */}
            <div className="glass-nav-vibrant py-3">
                <div className="flex items-center gap-6 lg:gap-10 px-6 lg:px-12 py-5 max-w-7xl mx-auto">
                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-[#1A2536] text-2xl" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
                        ☰
                    </button>

                    {/* Logo */}
                    <Link href="/" className="shrink-0 flex flex-col items-center justify-center py-2 group">
                        <div className="flex items-center gap-2">
                            <span className="font-serif-luxury text-3xl lg:text-4xl tracking-[0.3em] text-[#1A2536] group-hover:text-[#B86B5A] transition-colors">
                                YA<span className="text-[#B86B5A]">-</span>RA
                            </span>
                            <span className="text-[9px] font-sans border border-[#1A2536]/40 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[#1A2536] -mt-3">®</span>
                        </div>
                        {/* Diamond Divider */}
                        <div className="flex items-center gap-3 w-full my-0.5">
                            <span className="h-[1.5px] bg-gradient-to-r from-transparent via-[#E5BDB0] to-[#E5BDB0] flex-1"></span>
                            <div className="relative w-4 h-4 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#1A2536]">
                                    <path d="M12 2L3 9L12 22L21 9L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="#E5BDB0" fillOpacity="0.7" />
                                    <path d="M12 2V22M3 9H21M7.5 5.5L12 9L16.5 5.5" stroke="currentColor" strokeWidth="1.2" />
                                </svg>
                            </div>
                            <span className="h-[1.5px] bg-gradient-to-r from-[#E5BDB0] via-[#E5BDB0] to-transparent flex-1"></span>
                        </div>
                        <span className="hidden xl:block text-[9px] tracking-[0.25em] uppercase font-bold text-[#B86B5A] mt-1">
                            Diamond & Gold Jewellery
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex flex-1 justify-center gap-6 lg:gap-8 uppercase tracking-widest text-xs font-bold text-[#1A2536]">
                        {categories.map((c) => (
                            <Link
                                key={c.slug}
                                href={`/category/${c.slug}`}
                                className="py-1.5 border-b-2 border-transparent hover:text-[#B86B5A] hover:border-[#B86B5A] transition-all whitespace-nowrap"
                            >
                                {c.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex-1 md:hidden" />

                    {/* Action Icons */}
                    <div className="flex items-center gap-3 sm:gap-5">
                        {!isControl && (
                            <button
                                onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
                                className="p-2.5 text-[#1A2536] hover:text-[#B86B5A] transition-colors rounded-full hover:bg-[#E5BDB0]/20"
                                aria-label="Search"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </button>
                        )}

                        <Link
                            href={user ? "/account" : "/auth"}
                            className="hidden sm:block p-2.5 text-[#1A2536] hover:text-[#B86B5A] transition-colors rounded-full hover:bg-[#E5BDB0]/20"
                            aria-label="Account & Orders"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </Link>

                        <button
                            onClick={() => router.push("/cart")}
                            className="p-2.5 bg-[#1A2536] text-white rounded-full hover:bg-[#111A29] transition-all relative shadow-md"
                            aria-label="Shopping Bag"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#E5BDB0]">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            {mounted && count > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#B86B5A] text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                    {count}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Drawer */}
            {searchOpen && !isControl && (
                <div className="border-t border-[#E5BDB0] bg-white px-6 lg:px-10 py-5">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-4">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#B86B5A]">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") closeSearch();
                                    if (e.key === "Enter") navigateToSearch();
                                }}
                                placeholder="Search rings, earrings, pendants… (Enter for full results)"
                                className="flex-1 bg-transparent border-b-2 border-[#E5BDB0] py-2 text-base focus:outline-none focus:border-[#1A2536] text-[#1A2536]"
                            />
                            <button onClick={closeSearch} className="text-[#1A2536] hover:text-[#B86B5A]" aria-label="Close search">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {searching && <p className="text-[10px] uppercase tracking-[0.2em] text-[#B86B5A] mt-4 font-bold">Searching…</p>}

                        {!searching && results.length > 0 && (
                            <ul className="mt-4 divide-y divide-[#E5BDB0]/30">
                                {results.map((p) => (
                                    <li key={p.id ?? p.slug}>
                                        <Link
                                            href={`/product/${p.slug}`}
                                            onClick={closeSearch}
                                            className="flex items-center gap-4 py-3 px-2 hover:bg-[#E5BDB0]/10 rounded-lg transition-colors"
                                        >
                                            <img src={p.media?.[0]?.url ?? ""} alt={p.name} className="w-12 h-12 object-cover bg-white rounded-md border border-[#E5BDB0]/40" />
                                            <span className="flex-1">
                                                <span className="block font-serif-luxury text-base text-[#1A2536]">{p.name}</span>
                                                <span className="block text-xs text-[#B86B5A] font-semibold">{p.category_name}</span>
                                            </span>
                                            <span className="text-sm font-extrabold text-[#1A2536]">{inr(p.base_price)}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {!searching && query.trim().length >= 2 && results.length === 0 && (
                            <p className="text-sm text-[#1A2536]/60 mt-4">No pieces match "{query}".</p>
                        )}

                        {!searching && query.trim().length >= 2 && (
                            <button
                                onClick={navigateToSearch}
                                className="mt-4 w-full text-center text-xs uppercase tracking-[0.2em] font-bold text-white bg-[#B86B5A] hover:bg-[#1A2536] py-3.5 border-2 border-[#B86B5A] rounded-full transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                View all results for "{query}"
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-[#E5BDB0] px-6 py-6 space-y-4 uppercase tracking-[0.16em] text-[15px] font-medium bg-white">
                    {categories.map((c) => (
                        <Link key={c.slug} href={`/category/${c.slug}`} className="block hover:text-[#B86B5A] text-[#1A2536]" onClick={() => setMobileOpen(false)}>
                            {c.label}
                        </Link>
                    ))}
                    <hr className="border-[#E5BDB0]" />
                    <Link href={user ? "/account" : "/auth"} className="block hover:text-[#B86B5A] text-[#1A2536]" onClick={() => setMobileOpen(false)}>
                        My Account & Orders
                    </Link>
                    <Link href="/policies" className="block hover:text-[#B86B5A] text-[#1A2536]" onClick={() => setMobileOpen(false)}>
                        Policies & Certifications
                    </Link>
                </div>
            )}
        </header>
    );
}