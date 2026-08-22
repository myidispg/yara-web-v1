import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import usePageTitle from "../utils/usePageTitle";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function CartPage() {
    const { items, setQty, removeItem, subtotal, count } = useCart();
    const navigate = useNavigate();
    usePageTitle("Shopping Bag");

    if (!items.length)
        return (
            <div className="max-w-3xl mx-auto px-6 py-24 text-center">
                <p className="eyebrow mb-3">Shopping Bag</p>
                <h1 className="text-4xl font-serif mb-4">Your bag is empty</h1>
                <p className="text-sm text-ink/60 mb-8">Discover certified natural diamonds, handcrafted in 14Kt &amp; 18Kt solid gold.</p>
                <Link to="/" className="btn-solid inline-block">Explore The Collection</Link>
            </div>
        );

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
            <h1 className="text-4xl font-serif mb-10">
                Shopping Bag <span className="italic text-ink/50 text-2xl">({count} {count === 1 ? "Piece" : "Pieces"})</span>
            </h1>

            <div className="grid lg:grid-cols-[1fr_380px] gap-12">
                <div className="space-y-6">
                    {items.map((i) => (
                        <div key={i.key} className="bg-white rounded-xl border border-line shadow-card p-5 grid grid-cols-[100px_1fr_auto] gap-5">
                            <Link to={`/product/${i.slug}`} className="bg-cream aspect-square rounded-lg overflow-hidden">
                                <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                            </Link>
                            <div>
                                <Link to={`/product/${i.slug}`} className="font-serif text-lg text-ink hover:text-gold-dark">{i.name}</Link>
                                <p className="text-xs text-ink/60 mt-1">{i.label}</p>
                                <p className="text-[10px] uppercase tracking-[0.12em] text-ink/40 mt-1">Design {i.design_code}</p>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                                <p className="font-semibold text-ink">{inr(i.unit_price * i.qty)}</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border border-line rounded-md overflow-hidden">
                                        <button onClick={() => setQty(i.key, i.qty - 1)} disabled={i.qty <= 1}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-cream disabled:opacity-30">−</button>
                                        <span className="w-8 h-8 flex items-center justify-center text-xs font-medium border-x border-line">{i.qty}</span>
                                        <button onClick={() => setQty(i.key, i.qty + 1)}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-cream">+</button>
                                    </div>
                                    <button onClick={() => removeItem(i.key)} className="text-[10px] uppercase tracking-[0.14em] text-ink/50 underline underline-offset-4 hover:text-blush">Remove</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <p className="text-[11px] text-ink/50">In-stock pieces ship in 3–7 days; made-to-order combinations ship in 10–12 days.</p>
                </div>

                <aside className="bg-cream border border-gold/40 p-8 h-fit">
                    <h2 className="font-serif text-2xl mb-6">Order Summary</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
                        <div className="flex justify-between"><span>Insured Shipping</span><span className="micro-label text-gold">FREE</span></div>
                        <div className="hairline border-t border-charcoal/15 pt-3 flex justify-between font-serif text-xl">
                            <span>Total Payable</span><span>{inr(subtotal)}</span>
                        </div>
                    </div>
                    <button onClick={() => navigate("/checkout")} className="btn-solid w-full mt-8">Proceed To Checkout →</button>
                    <p className="micro-label text-charcoal/50 text-center mt-4">Secure SSL · Certified Conflict-Free Diamonds</p>
                </aside>
            </div>
        </div>
    );
}