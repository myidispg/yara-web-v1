import Link from "next/link";
import SafeImage from "@/components/SafeImage";

/**
 * Reusable grid section for Shop by Price / Collection / etc.
 * 
 * @param {Object} props
 * @param {string} props.title - Main heading (e.g., "Shop by Price")
 * @param {string} props.kicker - Cursive subheading (e.g., "find your budget")
 * @param {string} props.tagline - Right-aligned tag (e.g., "Effortless Luxury")
 * @param {Array} props.items - Array of { label, href, img, altText }
 * @param {boolean} props.hasBackground - Use cream background
 * @param {string} props.padding - "compact" or "spacious"
 * @param {string} props.taglineSize - "small" (9px) or "normal" (10px)
 */
export default function ShopByGrid({
    title,
    kicker,
    tagline,
    items,
    hasBackground = false,
    padding = "spacious",
    taglineSize = "normal",
}) {
    const sectionClasses = hasBackground
        ? "bg-[#FBF7F2] py-10 md:py-14"
        : "pb-20";

    const innerSpacing = padding === "compact" ? "space-y-8" : "space-y-10";
    const innerClasses = `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${innerSpacing}`;

    const taglineTextSize = taglineSize === "small" ? "text-[9px] sm:text-xs" : "text-[10px] sm:text-xs";

    return (
        <section className={sectionClasses}>
            <div className={innerClasses}>
                {/* Section header */}
                <div className="flex flex-row items-end justify-between gap-3 border-b border-[#E5BDB0]/60 pb-4">
                    <div className="min-w-0">
                        <span className="font-cursive text-2xl sm:text-3xl text-[#B86B5A] block -mb-2">
                            {kicker}
                        </span>
                        <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1A2536] leading-tight">
                            {title}
                        </h2>
                    </div>
                    <p className={`shrink-0 whitespace-nowrap ${taglineTextSize} font-bold text-[#B86B5A] tracking-widest uppercase`}>
                        {tagline}
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group relative block overflow-hidden rounded-2xl border-2 border-[#E5BDB0] bg-[#1A2536] shadow-md hover:shadow-2xl hover:border-[#B86B5A] transition-all duration-500"
                        >
                            <div className="relative h-56 md:h-auto md:aspect-[3/4] overflow-hidden">
                                <SafeImage
                                    src={item.img}
                                    alt={item.altText}
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