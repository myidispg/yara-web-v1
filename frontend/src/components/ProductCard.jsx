import Link from "next/link";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function ProductCard({ product }) {
    const img = product.media?.[0]?.url;
    return (
        <Link href={`/product/${product.slug}`} className="group block bg-white rounded-xl overflow-hidden border border-line shadow-card hover:shadow-hero transition-shadow">
            <div className="relative bg-cream aspect-square overflow-hidden">
                {img ? (
                    <img src={img} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink/30 text-xs uppercase tracking-[0.2em]">No media</div>
                )}
                <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.14em] font-semibold bg-white/90 text-ink px-2 py-1 rounded">
                    {product.design_code}
                </span>
                {!product.in_stock && (
                    <span className="absolute bottom-3 left-3 text-[9px] uppercase tracking-[0.12em] font-semibold bg-ink/80 text-white px-2 py-1 rounded">
                        Made to Order
                    </span>
                )}
            </div>
            <div className="p-4">
                <p className="font-serif text-ink leading-snug">{product.name}</p>
                <p className="text-xs text-ink/55 mt-1">
                    {product.category_name}
                    {product.total_diamond_weight ? ` · ${product.total_diamond_weight} Ct` : ""}
                </p>
                <p className="text-sm font-semibold text-ink mt-2">{inr(product.base_price)}</p>
            </div>
        </Link>
    );
}