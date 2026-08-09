import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const categories = [
    { label: "Rings", slug: "rings" },
    { label: "Earrings", slug: "earrings" },
    { label: "Necklaces", slug: "necklaces" },
    { label: "Bracelets", slug: "bracelets" },
    { label: "Solitaires", slug: "solitaires" },
    { label: "Color Stone Fine", slug: "color-stone" },
];

export default function Navbar() {
    const { count } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-sm">
            {/* Bar 1 — certification */}
            <div className="bg-charcoal text-white text-center py-2 px-4 micro-label">
                ✨ 100% Certified Natural Diamonds &amp; 14Kt/18Kt Solid Gold
            </div>

            {/* Bar 2 — shipping + stores */}
            <div className="relative border-b border-line py-2 px-4 text-center micro-label text-charcoal/70">
                Complimentary Insured Shipping Across India |{" "}
                <Link to="/category/solitaires" className="underline underline-offset-4 hover:text-gold-dark">
                    Explore Solitaires →
                </Link>
                <div className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 gap-3">
                    <span className="hover:text-gold-dark cursor-pointer">Stores</span>
                    <span className="text-line">|</span>
                    <span className="hover:text-gold-dark cursor-pointer">VIP Concierge</span>
                </div>
            </div>

            {/* Main row — centered logo + tagline */}
            <div className="grid grid-cols-3 items-center px-6 lg:px-10 py-5">
                <nav className="hidden md:flex items-center gap-6 micro-label">
                    <Link to={user ? "/account" : "/login"} className="hover:text-gold-dark">
                        My Account <span className="normal-case">&amp; Orders</span>
                    </Link>
                    <Link to="/policies" className="hover:text-gold-dark">
                        Policies <span className="normal-case">&amp; Certifications</span>
                    </Link>
                </nav>
                <button className="md:hidden micro-label" onClick={() => setMobileOpen(!mobileOpen)}>
                    ☰ Menu
                </button>

                <Link to="/" className="text-center block">
                    <span className="font-serif text-3xl tracking-[0.35em]">YA-RA</span>
                    <span className="block micro-label text-charcoal/50 mt-1">
                        Diamond, Gold and Gemstone Fine Jewellery
                    </span>
                </Link>

                <div className="flex justify-end">
                    <button onClick={() => navigate("/cart")} className="micro-label relative hover:text-gold-dark">
                        Bag
                        {count > 0 && (
                            <span className="absolute -top-2 -right-4 bg-gold-dark text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                                {count}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Category nav */}
            <nav className="border-y border-line hidden md:flex justify-center gap-10 py-3 micro-label">
                {categories.map((c) => (
                    <Link key={c.slug} to={`/category/${c.slug}`} className="hover:text-gold-dark">
                        {c.label}
                    </Link>
                ))}
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-line px-6 py-6 space-y-4 micro-label">
                    {categories.map((c) => (
                        <Link key={c.slug} to={`/category/${c.slug}`} className="block hover:text-gold-dark" onClick={() => setMobileOpen(false)}>
                            {c.label}
                        </Link>
                    ))}
                    <hr className="border-line" />
                    <Link to={user ? "/account" : "/login"} className="block" onClick={() => setMobileOpen(false)}>My Account &amp; Orders</Link>
                    <Link to="/policies" className="block" onClick={() => setMobileOpen(false)}>Policies &amp; Certifications</Link>
                </div>
            )}
        </header>
    );
}