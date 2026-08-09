import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function CartPage() {
    const { items, setQty, removeItem, subtotal, count } = useCart();
    const navigate = useNavigate();

    if (!items.length)
        return (
            <div className="max-w-3xl mx-auto px-6 py-24 text-center">
                <p className="eyebrow mb-3">Shopping Bag</p>
                <h1 className="text-4xl font-serif mb-4">Your bag is empty</h1>
                <p className="text-sm text-charcoal/60 mb-8">
                    Discover certified natural diamonds, handcrafted in 14Kt &amp; 18Kt solid gold.
                </p>
                <Link to="/" className="btn-solid inline-block">Explore The Collection</Link>
            </div>
        );

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
            <p className="eyebrow mb-2">Shopping Bag</p>
            <h1 className="text-4xl font-serif mb-10">
                Your Bag <span className="italic text-charcoal/50 text-2xl">({count} Item{count > 1 ? "s" : ""})</span>
            </h1>

            <div className="grid lg:grid-cols-[1fr_380px] gap-12">
                {/* Items */}
                <div className="space-y-8">
                    {items.map((i) => (
                        <div key={i.key} className="hairline border-b border-charcoal/15 pb-8 grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr_auto] gap-6">
                            <div className="bg-cream aspect-square">
                                <img src={i.image ?? ""} alt={i.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <Link to={`/product/${i.slug}`} className="font-serif text-xl hover:text-gold">{i.name}</Link>
                                <p className="text-xs text-charcoal/60 mt-1">
                                    {i.variant?.label ?? `${i.variant?.purity} ${i.variant?.gold_color} Gold`}
                                    {i.variant?.ring_size ? ` | Size ${i.variant.ring_size}` : ""}
                                </p>
                                <p className="price-tag mt-3">{inr(i.unit_price)}</p>

                                <div className="flex items-center gap-4 mt-4">
                                    {/* Qty stepper */}
                                    <div className="flex items-center border border-charcoal/25">
                                        <button onClick={() => setQty(i.key, i.qty - 1)} className="px-3 py-1 text-sm hover:text-gold">−</button>
                                        <span className="px-3 py-1 text-sm">{i.qty}</span>
                                        <button onClick={() => setQty(i.key, i.qty + 1)} className="px-3 py-1 text-sm hover:text-gold">+</button>
                                    </div>
                                    <button onClick={() => removeItem(i.key)} className="micro-label text-charcoal/50 underline underline-offset-4 hover:text-gold">
                                        Remove
                                    </button>
                                </div>
                            </div>
                            <p className="hidden sm:block font-serif text-lg">{inr(i.unit_price * i.qty)}</p>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <aside className="bg-cream border border-gold/40 p-8 h-fit">
                    <h2 className="font-serif text-2xl mb-6">Order Summary</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
                        <div className="flex justify-between"><span>Insured Shipping</span><span className="micro-label text-gold">FREE</span></div>
                        <div className="hairline border-t border-charcoal/15 pt-3 flex justify-between font-serif text-xl">
                            <span>Total Payable</span><span>{inr(subtotal)}</span>
                        </div>
                    </div>
                    <button onClick={() => navigate("/checkout")} className="btn-solid w-full mt-8">
                        Proceed To Checkout →
                    </button>
                    <p className="micro-label text-charcoal/50 text-center mt-4">
                        Secure SSL · Certified Conflict-Free Diamonds
                    </p>
                </aside>
            </div>
        </div>
    );
}