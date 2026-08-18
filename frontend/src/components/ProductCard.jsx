import Link from "next/link";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function ProductCard({ product }) {
    const img = product.media?.find((m) => m.kind === "image") ?? product.media?.[0];

    return (
        <Link href={`/product/${product.slug}`} className="group block">
            <div className="relative overflow-hidden rounded-xl bg-cream aspect-square">
                {img ? (
                    <img
                        src={img.url}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink/30 text-xs uppercase tracking-[0.2em]">No image</div>
                )}
                {product.in_stock ? (
                    <span className="absolute top-3 left-3 bg-white/90 text-[9px] uppercase tracking-[0.14em] font-semibold px-2.5 py-1 rounded-full text-[#3E5C4B]">
                        In Stock
                    </span>
                ) : (
                    <span className="absolute top-3 left-3 bg-white/90 text-[9px] uppercase tracking-[0.14em] font-semibold px-2.5 py-1 rounded-full text-gold-dark">
                        Made to Order
                    </span>
                )}
            </div>
            <div className="pt-3 pb-1 px-1">
                <p className="text-[9px] uppercase tracking-[0.16em] text-ink/40 mb-1">{product.category_name}</p>
                <h3 className="font-serif text-base md:text-lg leading-snug group-hover:text-gold-dark transition-colors">
                    {product.name}
                </h3>
                <p className="text-sm font-semibold mt-1">{inr(product.base_price)}</p>
            </div>
        </Link>
    );
}