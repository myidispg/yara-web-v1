import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function ProductCard({ product, cta = "add" }) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);

    const image = product.images?.[0]?.url || product.primary_image || product.image || "";
    const variants = product.variants || [];
    const defaultVariant = variants[0] ?? {
        id: product.id ?? product.slug, gold_color: "Yellow", purity: "18Kt", ring_size: null, price: product.price,
    };
    const price = variants.length ? Math.min(...variants.map((v) => v.price)) : product.price;
    const compare = product.compare_at_price ?? product.compareAtPrice ?? product.mrp ?? null;
    const carat = product.carat ?? product.carat_weight ?? product.diamond_weight ?? null;
    const quality = product.quality ?? product.diamond_quality ?? "";
    const badge = product.badge ?? product.tag ?? null;
    const metalTag = defaultVariant.purity ? `${defaultVariant.purity} Gold`.toUpperCase() : "18KT GOLD";

    const handleAdd = (e) => {
        e.preventDefault(); e.stopPropagation();
        addItem(product, defaultVariant, 1);
        setAdded(true); setTimeout(() => setAdded(false), 1500);
    };

    return (
        <div className="group card-hover">
            <Link to={`/product/${product.slug}`} className="block">
                <div className="relative bg-cream aspect-square mb-4 overflow-hidden">
                    <img src={image} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {badge && <span className="badge-gold absolute top-3 left-3">{badge}</span>}
                    <span className="absolute top-3 right-3 bg-white/90 micro-label px-2 py-1">{metalTag}</span>
                </div>
                <p className="micro-label text-gold-dark mb-1">{metalTag}</p>
                <h3 className="font-serif text-lg leading-snug">{product.name}</h3>
                {(carat || quality) && (
                    <p className="text-xs text-charcoal/55 mt-1">
                        {carat ? `${carat} Ct Natural Diamond` : ""}{carat && quality ? " " : ""}{quality ? `(${quality})` : ""}
                    </p>
                )}
                <div className="flex items-baseline gap-2 mt-2">
                    <span className="price-tag">{inr(price)}</span>
                    {compare && <span className="price-strike">{inr(compare)}</span>}
                </div>
            </Link>

            {cta === "add" ? (
                <button onClick={handleAdd} className="btn-outline w-full mt-4">
                    {added ? "Added ✓" : "+ Add"}
                </button>
            ) : (
                <Link to={`/product/${product.slug}`} className="micro-label inline-block mt-3 underline underline-offset-8 hover:text-gold-dark">
                    View →
                </Link>
            )}
        </div>
    );
}