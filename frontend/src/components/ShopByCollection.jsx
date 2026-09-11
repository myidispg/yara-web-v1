import Link from "next/link";
import SafeImage from "@/components/SafeImage";

const COLLECTIONS = [
    { index: "01", name: "Solitaire Jewellery", href: "/shop?tag=solitaire", desc: "Single-stone brilliance for life's milestones", img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80" },
    { index: "02", name: "Tennis Bracelets", href: "/shop?tag=tennis-bracelet", desc: "Continuous lines of certified diamonds", img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80" },
    { index: "03", name: "Daily Wear Earrings", href: "/shop?tag=daily-wear&category=earrings", desc: "Lightweight studs & huggies for every day", img: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=800&q=80" },
    { index: "04", name: "Cocktail Rings", href: "/shop?tag=cocktail&category=rings", desc: "Bold centre stones that command attention", img: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80" },
];

export default function ShopByCollection() {
    return (
        <section className="bg-[#FBF7F2] py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                {/* Section header */}
                <div className="flex flex-row items-end justify-between gap-3 border-b border-[#E5BDB0]/60 pb-4">
                    <div className="min-w-0">
                        <span className="font-cursive text-xl sm:text-3xl text-[#B86B5A] block -mb-2">curated edits</span>
                        <h2 className="font-serif-luxury text-2xl sm:text-4xl lg:text-5xl font-normal text-[#1A2536] leading-tight">
                            Shop by Collection
                        </h2>
                    </div>
                    <p className="shrink-0 whitespace-nowrap text-[10px] sm:text-xs font-bold text-[#B86B5A] tracking-widest uppercase">
                        Four signature edits
                    </p>
                </div>

                {/* Collection cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {COLLECTIONS.map((c) => (
                        <Link
                            key={c.index}
                            href={c.href}
                            className="group block overflow-hidden rounded-3xl border border-[#E5BDB0] bg-white shadow-sm hover:shadow-xl transition-all duration-500"
                        >
                            {/* Image */}
                            <div className="relative aspect-square md:aspect-[4/5] overflow-hidden">
                                <SafeImage
                                    src={c.img}
                                    alt={c.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A2536]/40 via-transparent to-transparent" />
                                <span className="absolute top-4 left-4 font-serif-luxury italic text-2xl text-white/90">
                                    {c.index}
                                </span>
                            </div>

                            {/* Body */}
                            <div className="p-5">
                                <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536] leading-tight">
                                    {c.name}
                                </h3>
                                <p className="text-xs text-[#1A2536]/60 leading-relaxed mt-2">{c.desc}</p>
                                <span className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] font-bold text-[#B86B5A] group-hover:gap-3 transition-all">
                                    Explore Collection
                                    <span aria-hidden>→</span>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}