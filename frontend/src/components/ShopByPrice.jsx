import Link from "next/link";
import SafeImage from "@/components/SafeImage";

const BRACKETS = [
    { note: "Everyday sparkle", price: "Under ₹30K", max: 30000, img: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=80" },
    { note: "Signature pieces", price: "Under ₹50K", max: 50000, img: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80" },
    { note: "Statement luxury", price: "Under ₹75K", max: 75000, img: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80" },
    { note: "Heirloom grade", price: "Under ₹1 Lakh", max: 100000, img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80" },
];

export default function ShopByPrice() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-20">
            {/* Section header */}
            <div className="flex flex-row items-end justify-between gap-3 border-b border-[#E5BDB0]/60 pb-4">
                <div className="min-w-0">
                    <span className="font-cursive text-xl sm:text-3xl text-[#B86B5A] block -mb-2">find your budget</span>
                    <h2 className="font-serif-luxury text-2xl sm:text-4xl lg:text-5xl font-normal text-[#1A2536] leading-tight">
                        Shop by Price
                    </h2>
                </div>
                <p className="shrink-0 whitespace-nowrap text-[10px] sm:text-xs font-bold text-[#B86B5A] tracking-widest uppercase">
                    Effortless Luxury
                </p>
            </div>

            {/* Staggered price tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {BRACKETS.map((b, i) => (
                    <Link
                        key={b.max}
                        href={`/shop?priceMax=${b.max}`}
                        className={`group relative block overflow-hidden rounded-2xl border-2 border-[#E5BDB0] bg-[#1A2536] shadow-md hover:shadow-2xl hover:border-[#B86B5A] transition-all duration-500 ${i % 2 === 1 ? "sm:mt-8" : ""
                            }`}
                    >
                        <div className="relative aspect-[15/16] md:aspect-[3/4] overflow-hidden">
                            <SafeImage
                                src={b.img}
                                alt={b.price}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1A2536]/90 via-[#1A2536]/25 to-transparent" />
                        </div>

                        {/* Price label */}
                        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-[#E5BDB0] font-bold mb-1">
                                {b.note}
                            </p>
                            <div className="flex items-end justify-between gap-2">
                                <span className="font-serif-luxury text-xl sm:text-2xl leading-none">{b.price}</span>
                                <span className="text-[#E5BDB0] text-lg group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}