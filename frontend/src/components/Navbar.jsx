import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useCategories } from "../context/CategoryContext";

export default function Navbar() {
    const { user } = useAuth();
    const { count } = useCart();
    const { categories } = useCategories();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const navLink = ({ isActive }) =>
        `text-[12px] uppercase tracking-[0.22em] transition hover:text-gold-deep ${isActive ? "text-gold-deep" : "text-ink/80"}`;

    return (
        <header className="sticky top-0 z-50">
            <div className="bg-pine px-4 py-2 text-center text-[10px] uppercase tracking-[0.3em] text-champagne">
                Complimentary insured shipping across India · Lifetime exchange on every piece
            </div>

            <div className="border-b border-ink/10 bg-ivory/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
                    <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
                        <span className="block h-px w-6 bg-ink" /><span className="mt-1.5 block h-px w-6 bg-ink" /><span className="mt-1.5 block h-px w-4 bg-ink" />
                    </button>

                    <Link to="/" className="font-display text-2xl tracking-[0.3em]">
                        VAIRA<span className="ml-1 text-gold">◆</span>
                    </Link>

                    <nav className="hidden items-center gap-8 md:flex">
                        <NavLink to="/" className={navLink} end>Home</NavLink>
                        {categories.map((cat) => (
                            <div key={cat.slug} className="group relative">
                                <NavLink to={`/category/${cat.slug}`} className={navLink}>{cat.name}</NavLink>
                                {cat.subcategories?.length > 0 && (
                                    <div className="invisible absolute left-1/2 top-full z-50 w-60 -translate-x-1/2 translate-y-3 border border-ink/10 bg-ivory p-5 opacity-0 shadow-card transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                                        <Link to={`/category/${cat.slug}`} className="eyebrow block border-b border-ink/10 pb-3">All {cat.name}</Link>
                                        {cat.subcategories.map((s) => (
                                            <Link key={s.slug} to={`/category/${cat.slug}?sub=${s.slug}`}
                                                className="block py-2 text-sm text-ink/75 transition hover:translate-x-1 hover:text-gold-deep">
                                                {s.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    <div className="flex items-center gap-5">
                        <button onClick={() => navigate(user ? "/account" : "/login")}
                            className="text-[12px] uppercase tracking-[0.22em] text-ink/80 transition hover:text-gold-deep">
                            {user ? (user.first_name || "Account") : "Sign in"}
                        </button>
                        <Link to="/cart" className="relative text-[12px] uppercase tracking-[0.22em] text-ink/80 transition hover:text-gold-deep">
                            Bag
                            {count > 0 && (
                                <span className="absolute -right-4 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-semibold text-ink">{count}</span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {open && (
                <div className="border-b border-ink/10 bg-ivory md:hidden">
                    <div className="space-y-1 px-5 py-5">
                        <Link to="/" onClick={() => setOpen(false)} className="block py-2 text-sm uppercase tracking-[0.2em]">Home</Link>
                        {categories.map((cat) => (
                            <details key={cat.slug} className="group">
                                <summary className="cursor-pointer list-none py-2 text-sm uppercase tracking-[0.2em]">
                                    <span className="flex justify-between">{cat.name}<span className="text-gold transition group-open:rotate-45">+</span></span>
                                </summary>
                                <div className="pl-4">
                                    <Link to={`/category/${cat.slug}`} onClick={() => setOpen(false)} className="block py-1.5 text-sm text-ink/60">All {cat.name}</Link>
                                    {cat.subcategories?.map((s) => (
                                        <Link key={s.slug} to={`/category/${cat.slug}?sub=${s.slug}`} onClick={() => setOpen(false)}
                                            className="block py-1.5 text-sm text-ink/60">{s.name}</Link>
                                    ))}
                                </div>
                            </details>
                        ))}
                        <Link to={user ? "/account" : "/login"} onClick={() => setOpen(false)} className="block py-2 text-sm uppercase tracking-[0.2em] text-gold-deep">
                            {user ? "My account" : "Sign in"}
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}