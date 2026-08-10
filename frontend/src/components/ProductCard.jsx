import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";

const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);

  const image = product.images?.[0]?.url || product.primary_image || product.image || "";
  const variants = product.variants || [];
  const defaultVariant = variants[0] ?? {
    id: product.id ?? product.slug, gold_color: "Yellow", purity: "18Kt", ring_size: null, price: product.price,
  };
  const price = variants.length ? Math.min(...variants.map((v) => v.price)) : product.price;
  const compare = product.compare_at_price ?? product.compareAtPrice ?? product.mrp ?? null;
  const showRibbon = Boolean(product.badge ?? product.tag) || defaultVariant.purity === "14Kt";

  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    addItem(product, defaultVariant, 1);
    setAdded(true); setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="relative group h-full bg-white rounded-xl border border-line shadow-card overflow-hidden flex flex-col">
      {/* Image — clickable */}
      <Link to={`/product/${product.slug}`} className="block relative">
        <div className="aspect-square overflow-hidden bg-cream">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        {showRibbon && (
          <span className="absolute top-3 left-3 bg-ink text-white text-[10px] font-semibold tracking-[0.14em] px-4 py-1.5 rounded-full">
            Best Seller
          </span>
        )}
      </Link>

      {/* Wishlist heart */}
      <button
        onClick={() => setWished(!wished)}
        aria-label="Add to wishlist"
        className={`absolute top-3 right-3 drop-shadow ${wished ? "text-blush" : "text-white/90 hover:text-blush"} transition-colors`}
      >
        <HeartIcon filled={wished} />
      </button>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Name — clickable */}
        <Link to={`/product/${product.slug}`} className="block mb-4 hover:text-gold-dark transition-colors">
          <h3 className="font-serif text-lg text-ink leading-snug">{product.name}</h3>
        </Link>

        {/* Bottom row — pinned; one line at xl+, identical stack below so all cards align */}
        <div className="mt-auto flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between border-t border-line pt-3">
          <span className="font-semibold text-ink whitespace-nowrap xl:min-w-0 xl:truncate">
            {inr(price)}
            {compare && <s className="ml-1.5 text-xs font-normal text-ink/40">{inr(compare)}</s>}
          </span>

          <span className="flex items-center gap-1.5 shrink-0">
            <Link
              to={`/product/${product.slug}`}
              className="border border-ink text-ink uppercase text-[10px] font-medium tracking-[0.12em] px-2.5 py-2 rounded-md hover:border-gold-dark hover:text-gold-dark transition-colors whitespace-nowrap"
            >
              View
            </Link>
            <button
              onClick={handleAdd}
              className="bg-ink text-white uppercase text-[10px] font-medium tracking-[0.12em] px-3 py-2 rounded-md hover:bg-gold-dark transition-colors whitespace-nowrap"
            >
              {added ? "Added ✓" : "+ Add"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}