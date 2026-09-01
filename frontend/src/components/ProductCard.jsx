import Link from "next/link";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function ProductCard({ product }) {
    const img = product.media?.find((m) => m.kind === "image") ?? product.media?.[0];

    return (
        <Link href={`/product/${product.slug}`} className="group block">
            <div className="glass-card-vibrant rounded-2xl overflow-hidden border border-[#E5BDB0] hover:border-[#D88C7D] transition-all duration-300 hover:shadow-xl flex flex-col">
                {/* Image Container */}
                <div className="relative overflow-hidden aspect-square bg-white">
                    {img ? (
                        <img
                            src={img.url}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#1A2536]/30 text-xs uppercase tracking-[0.2em]">No image</div>
                    )}
                    {product.in_stock ? (
                        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[10px] uppercase tracking-[0.14em] font-bold px-2.5 py-1 rounded-full text-emerald-700 border border-emerald-200 shadow-sm">
                            ✓ In Stock
                        </span>
                    ) : (
                        <span className="absolute top-3 left-3 bg-[#1A2536]/95 backdrop-blur-sm text-[10px] uppercase tracking-[0.14em] font-bold px-2.5 py-1 rounded-full text-[#E5BDB0] border border-[#E5BDB0]/40 shadow-sm">
                            Made to Order
                        </span>
                    )}
                </div>

                {/* Product Details - Slightly Larger */}
                <div className="pt-4 pb-5 px-4 flex flex-col gap-2">
                    <h3 className="font-serif-luxury font-bold text-base md:text-lg leading-snug text-[#1A2536] line-clamp-2">
                        {product.name}
                    </h3>
                    <p className="text-sm font-bold text-[#1A2536]">{inr(product.base_price)}</p>
                </div>
            </div>
        </Link>
    );
}