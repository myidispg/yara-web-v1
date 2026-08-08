import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { inr } from "../utils/format";

export default function CartPage() {
    const { items, setQty, removeItem, subtotal } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div className="py-32 text-center">
                <p className="text-4xl text-gold">◆</p>
                <h1 className="mt-4 font-display text-4xl">Your bag is empty</h1>
                <p className="mt-2 text-sm text-ink/55">The collections are waiting.</p>
                <Link to="/category/rings" className="btn-gold mt-8 inline-flex">Explore rings</Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
            <p className="eyebrow">Your selection</p>
            <h1 className="mt-3 font-display text-5xl tracking-tight">Shopping bag</h1>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                    {items.map((item) => (
                        <div key={item.key} className="flex gap-5 border-b border-ink/10 pb-6">
                            <Link to={`/product/${item.slug}`} className="h-28 w-24 shrink-0 overflow-hidden bg-parchment">
                                {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                            </Link>
                            <div className="flex flex-1 flex-wrap items-start justify-between gap-4">
                                <div>
                                    <Link to={`/product/${item.slug}`} className="font-display text-lg hover:text-gold-deep">{item.name}</Link>
                                    <p className="mt-1 text-xs text-ink/55">{item.variant.label}</p>
                                    <button onClick={() => removeItem(item.key)} className="mt-3 text-[11px] uppercase tracking-[0.2em] text-ink/45 hover:text-rust">Remove</button>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">{inr(item.unit_price * item.qty)}</p>
                                    <div className="mt-2 inline-flex items-center border border-ink/20">
                                        <button onClick={() => setQty(item.key, item.qty - 1)} className="px-3 py-1.5 hover:text-gold-deep">−</button>
                                        <span className="w-7 text-center text-sm">{item.qty}</span>
                                        <button onClick={() => setQty(item.key, item.qty + 1)} className="px-3 py-1.5 hover:text-gold-deep">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <aside className="h-fit border border-ink/10 bg-gold-pale p-7">
                    <h2 className="font-display text-2xl">Summary</h2>
                    <dl className="mt-5 space-y-3 text-sm">
                        <div className="flex justify-between"><dt className="text-ink/60">Subtotal</dt><dd>{inr(subtotal)}</dd></div>
                        <div className="flex justify-between"><dt className="text-ink/60">Shipping</dt><dd className="text-moss">Free · insured</dd></div>
                        <div className="flex justify-between border-t border-ink/15 pt-3 font-display text-lg"><dt>Total</dt><dd>{inr(subtotal)}</dd></div>
                    </dl>
                    <button onClick={() => navigate(user ? "/checkout" : "/login")}
                        className="btn-gold mt-6 w-full">
                        {user ? "Proceed to checkout" : "Sign in to checkout"}
                    </button>
                    <p className="mt-4 text-center text-[10px] uppercase tracking-[0.22em] text-ink/45">
                        UPI · Cards · EMI · Cash on Delivery
                    </p>
                </aside>
            </div>
        </div>
    );
}