import Link from "next/link";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function ProductCard({ product }) {
    const img = product.media?.find((m) => m.kind === "image") ?? product.media?.[0];

    return (
        <Link href={`/product/${product.slug}`} className="group block">
            <div className="glass-card-vibrant rounded-2xl overflow-hidden border border-[#1A2536]/10 hover:border-[#D88C7D] transition-all duration-500 hover:shadow-xl hover:scale-[1.03] flex flex-col">
                {/* Image Container */}
                <div className="relative overflow-hidden aspect-square bg-white">
                    {img ? (
                        <img
                            src={img.url}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#1A2536]/30 text-xs uppercase tracking-[0.2em]">No image</div>
                    )}
                </div>

                {/* Product Details - Optimized Spacing */}
                <div className="pt-4 pb-4 px-4">
                    <h3 className="font-serif-luxury font-bold text-[18px] leading-tight text-[#1A2536] line-clamp-2 mb-1.5">
                        {product.name}
                    </h3>
                    <p className="text-sm font-bold text-[#1A2536]">{inr(product.base_price)}</p>
                </div>
            </div>
        </Link>
    );
}