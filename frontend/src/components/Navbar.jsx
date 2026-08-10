import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const categories = [
    { label: "Rings", slug: "rings" },
    { label: "Earrings", slug: "earrings" },
    { label: "Necklaces & Pendants", slug: "necklaces" },
    { label: "Bracelets", slug: "bracelets" },
];

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
        .format(Number(n) || 0);

/* ── Icons ────────────────────────────────────────────── */
const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
);
const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" />
    </svg>
);
const BagIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
);
const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
    </svg>
);

export default function Navbar() {
    const { count } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    /* Live search (debounced) against /api/products/?search= */
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
            {/* Announcement bar */}
            <div className="bg-charcoal text-white text-center py-2 px-4 micro-label">
                ✨ 100% Certified Natural Diamonds &amp; 14Kt/18Kt Solid Gold
            </div>

            {/* Main row: Logo | Categories | Search · Account · Bag */}
            <div className="flex items-center gap-6 px-6 lg:px-10 py-5">
                {/* Mobile hamburger */}
                <button className="md:hidden text-charcoal" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
                    ☰
                </button>

                {/* Logo — left */}
                <Link to="/" className="shrink-0 block">
                    <span className="font-serif text-2xl lg:text-3xl tracking-[0.3em]">YA-RA</span>
                    <span className="hidden lg:block micro-label text-charcoal/50 mt-1">
                        Diamond, Gold and Gemstone Fine Jewellery
                    </span>
                </Link>

                {/* Categories — centre */}
                <nav className="hidden md:flex flex-1 justify-center gap-8 lg:gap-10 micro-label">
                    {categories.map((c) => (
                        <Link key={c.slug} to={`/category/${c.slug}`} className="hover:text-gold-dark">
                            {c.label}
                        </Link>
                    ))}
                </nav>
                <div className="flex-1 md:hidden" />

                {/* Icons — right */}
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
                        className="text-charcoal hover:text-gold-dark transition-colors"
                        aria-label="Search"
                    >
                        <SearchIcon />
                    </button>

                    <Link
                        to={user ? "/account" : "/login"}
                        className="text-charcoal hover:text-gold-dark transition-colors"
                        aria-label="Account & Orders"
                    >
                        <UserIcon />
                    </Link>

                    <button
                        onClick={() => navigate("/cart")}
                        className="relative text-charcoal hover:text-gold-dark transition-colors"
                        aria-label="Shopping Bag"
                    >
                        <BagIcon />
                        {count > 0 && (
                            <span className="absolute -top-2 -right-2 bg-gold-dark text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                                {count}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Search tray */}
            {searchOpen && (
                <div className="border-t border-line bg-ivory px-6 lg:px-10 py-5">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-4">
                            <SearchIcon />
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Escape" && closeSearch()}
                                placeholder="Search rings, earrings, pendants…"
                                className="flex-1 bg-transparent border-b border-charcoal/30 py-2 text-sm focus:outline-none focus:border-gold-dark"
                            />
                            <button onClick={closeSearch} className="text-charcoal hover:text-gold-dark" aria-label="Close search">
                                <CloseIcon />
                            </button>
                        </div>

                        {searching && <p className="micro-label text-charcoal/50 mt-4">Searching…</p>}

                        {!searching && results.length > 0 && (
                            <ul className="mt-4 divide-y divide-line">
                                {results.map((p) => (
                                    <li key={p.id ?? p.slug}>
                                        <Link
                                            to={`/product/${p.slug}`}
                                            onClick={closeSearch}
                                            className="flex items-center gap-4 py-3 px-2 hover:bg-cream"
                                        >
                                            <img src={p.primary_image ?? ""} alt={p.name} className="w-12 h-12 object-cover bg-cream" />
                                            <span className="flex-1">
                                                <span className="block font-serif text-sm">{p.name}</span>
                                                <span className="block text-xs text-charcoal/55">{p.category?.name}</span>
                                            </span>
                                            <span className="text-sm">{inr(p.min_price ?? p.price)}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {!searching && query.trim().length >= 2 && results.length === 0 && (
                            <p className="text-xs text-charcoal/55 mt-4">No pieces match “{query}”.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-line px-6 py-6 space-y-4 micro-label">
                    {categories.map((c) => (
                        <Link key={c.slug} to={`/category/${c.slug}`} className="block hover:text-gold-dark" onClick={() => setMobileOpen(false)}>
                            {c.label}
                        </Link>
                    ))}
                    <hr className="border-line" />
                    <Link to={user ? "/account" : "/login"} className="block hover:text-gold-dark" onClick={() => setMobileOpen(false)}>
                        My Account &amp; Orders
                    </Link>
                    <Link to="/policies" className="block hover:text-gold-dark" onClick={() => setMobileOpen(false)}>
                        Policies &amp; Certifications
                    </Link>
                </div>
            )}
        </header>
    );
}