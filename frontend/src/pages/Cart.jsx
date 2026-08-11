import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import usePageTitle from "../utils/usePageTitle";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function CartPage() {
    const { items, setQty, removeItem, subtotal, count } = useCart();
    const navigate = useNavigate();

    usePageTitle("Shopping Bag");

    if (!items.length)
        return (
            <div className="max-w-3xl mx-auto px-6 py-24 text-center">
                <p className="eyebrow mb-3">Shopping Bag</p>
                <h1 className="text-4xl font-serif mb-4">Your bag is empty</h1>
                <p className="text-sm text-ink/60 mb-8 max-w-sm mx-auto">
                    Discover certified natural diamonds, handcrafted in 14Kt &amp; 18Kt solid gold.
                </p>
                <Link to="/" className="btn-solid inline-block">Explore The Collection</Link>
            </div>
        );

    return (
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-12">
            <h1 className="font-serif text-4xl md:text-5xl mb-10">
                Shopping Bag <span className="text-ink/40 text-2xl md:text-3xl">({count} {count === 1 ? "Item" : "Items"})</span>
            </h1>

            <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
                {/* ── Line Items ── */}
                <div className="space-y-6">
                    {items.map((i) => (
                        <div key={i.key} className="bg-white rounded-xl border border-line shadow-card p-5 grid grid-cols-[90px_1fr] sm:grid-cols-[110px_1fr_auto] gap-5">
                            <Link to={`/product/${i.slug}`} className="bg-cream aspect-square rounded-lg overflow-hidden shrink-0">
                                <img src={i.image ?? ""} alt={i.name} className="w-full h-full object-cover" />
                            </Link>

                            <div className="flex flex-col justify-between min-w-0">
                                <div>
                                    <Link to={`/product/${i.slug}`} className="font-serif text-lg text-ink leading-snug hover:text-gold-dark transition-colors">
                                        {i.name}
                                    </Link>
                                    <p className="text-xs text-charcoal/60 mt-1">
                                        {i.variant?.label ?? `${i.variant?.purity} ${i.variant?.gold_color} Gold`}
                                        {i.variant?.ring_size ? ` | Size ${i.variant.ring_size}` : ""}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        {Number(i.variant?.stock) > 0 ? (
                                            <span className="text-[10px] font-medium text-[#3E5C4B] uppercase tracking-[0.12em] flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#3E5C4B]"></span> In Stock
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-medium text-gold-dark uppercase tracking-[0.12em] flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gold-dark"></span> Made to Order
                                            </span>
                                        )}
                                    </div>
                                    <p className="price-tag mt-3">{inr(i.unit_price)}</p>
                                </div>

                                <div className="flex items-center gap-4 mt-4">
                                    {/* Qty Stepper */}
                                    <div className="flex items-center border border-line rounded-md overflow-hidden">
                                        <button
                                            onClick={() => setQty(i.key, i.qty - 1)}
                                            disabled={i.qty <= 1}
                                            className="w-8 h-8 flex items-center justify-center text-ink hover:bg-cream disabled:opacity-30 transition-colors"
                                        >−</button>
                                        <span className="w-8 h-8 flex items-center justify-center text-xs font-medium border-x border-line">{i.qty}</span>
                                        <button
                                            onClick={() => setQty(i.key, i.qty + 1)}
                                            className="w-8 h-8 flex items-center justify-center text-ink hover:bg-cream transition-colors"
                                        >+</button>
                                    </div>
                                    <button
                                        onClick={() => removeItem(i.key)}
                                        className="text-[10px] uppercase tracking-[0.14em] font-medium text-ink/50 hover:text-blush transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            <div className="text-right flex flex-col justify-between">
                                <p className="font-semibold text-ink">{inr(i.unit_price * i.qty)}</p>
                                {i.qty > 1 && <p className="text-[10px] text-ink/40 mt-1">{inr(i.unit_price)} each</p>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Order Summary ── */}
                <aside className="bg-cream/40 border border-line rounded-xl p-6 lg:sticky lg:top-32">
                    <h2 className="font-serif text-2xl mb-6">Order Summary</h2>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-ink/60">Subtotal</span>
                            <span className="font-medium text-ink">{inr(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-ink/60">Insured Shipping</span>
                            <span className="font-semibold text-gold-dark">FREE</span>
                        </div>
                        <div className="border-t border-line pt-3 flex justify-between text-base">
                            <span className="font-semibold text-ink">Total Payable</span>
                            <span className="font-semibold text-ink">{inr(subtotal)}</span>
                        </div>
                    </div>

                    <p className="text-[12px] text-gold-dark mt-4 leading-relaxed font-medium">
                        *The current price is an estimate. The final price may vary slightly depending on the exact gold and diamond weight of the product.
                    </p>

                    <button onClick={() => navigate("/checkout")} className="btn-solid w-full mt-6">
                        Proceed To Checkout →
                    </button>

                </aside>
            </div>
        </div>
    );
}