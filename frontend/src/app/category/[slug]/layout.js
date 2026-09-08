import { generateSEO, generateBreadcrumbSchema } from '@/lib/seo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const TITLES = {
    rings: ["Natural Diamond & Gold Rings", "Explore handcrafted natural diamond rings set in 14Kt and 18Kt Solid Gold."],
    earrings: ["Diamond Earrings", "Studs, huggies & drops in certified natural diamonds."],
    necklaces: ["Necklaces & Pendants", "Solitaire drops & fine chains in 14Kt & 18Kt gold."],
    bracelets: ["Tennis Collection", "Diamond bracelets & bangles in classic silhouettes."],
    solitaires: ["Solitaires", "Engagement rings & solitaire bands, crafted forever."],
    "color-stone": ["Color Stone Fine Jewellery", "Ruby, sapphire & emerald accents with natural diamonds."],
};

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const [title, description] = TITLES[slug] ?? ["Fine Jewellery", "Handcrafted natural diamond jewellery in 14Kt & 18Kt solid gold."];
    return generateSEO({
        title,
        description,
        url: `${SITE_URL}/category/${slug}`,
    });
}

export default async function CategoryLayout({ children, params }) {
    const { slug } = await params;
    const [title] = TITLES[slug] ?? ["Fine Jewellery"];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateBreadcrumbSchema([
                        { name: 'Home', url: SITE_URL },
                        { name: title, url: `${SITE_URL}/category/${slug}` },
                    ])),
                }}
            />
            {children}
        </>
    );
}