import Link from "next/link";
import SafeImage from "@/components/SafeImage";

const COLLECTIONS = [
    { index: "01", name: "Solitaire Jewellery", href: "/shop?tag=solitaire", desc: "Single-stone brilliance for life's milestones", img: "/home/shop-by-collection/solitaire-jewellery.jpg" },
    { index: "02", name: "Tennis Bracelets", href: "/shop?tag=tennis-bracelet", desc: "Continuous lines of certified diamonds", img: "/home/shop-by-collection/tennis-bracelets-1.jpg" },
    { index: "03", name: "Daily Wear Earrings", href: "/shop?tag=daily-wear&category=earrings", desc: "Lightweight studs & huggies for every day", img: "/home/shop-by-collection/daily-wear-earrings.jpg" },
    { index: "04", name: "Cocktail Rings", href: "/shop?tag=cocktail&category=rings", desc: "Bold centre stones that command attention", img: "/home/shop-by-collection/cocktail-rings.jpg" },
];

export default function ShopByCollection() {
    return (
        <section className="bg-[#FBF7F2] py-10 md:py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Section header */}
                <div className="flex flex-row items-end justify-between gap-3 border-b border-[#E5BDB0]/60 pb-4">
                    <div className="min-w-0">
                        <span className="font-cursive text-2xl sm:text-3xl text-[#B86B5A] block -mb-2">curated edits</span>
                        <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1A2536] leading-tight">
                            Shop by Collection
                        </h2>
                    </div>
                    <p className="shrink-0 whitespace-nowrap text-[9px] sm:text-xs font-bold text-[#B86B5A] tracking-widest uppercase">
                        Signature edits
                    </p>
                </div>

                {/* Collection cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {COLLECTIONS.map((c) => (
                        <Link
                            key={c.index}
                            href={c.href}
                            className="group relative block overflow-hidden rounded-2xl border-2 border-[#E5BDB0] bg-[#1A2536] shadow-md hover:shadow-2xl hover:border-[#B86B5A] transition-all duration-500"
                        >
                            <div className="relative h-56 md:h-auto md:aspect-[3/4] overflow-hidden">
                                <SafeImage
                                    src={c.img}
                                    alt={c.name}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}