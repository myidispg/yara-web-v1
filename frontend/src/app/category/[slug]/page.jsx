"use client";

import { useParams } from "next/navigation";
import ProductListPage from "@/components/ProductListPage";

const TITLES = {
    rings: ["Diamond Rings", "Explore handcrafted natural diamond rings set in 14Kt and 18Kt Solid Gold."],
    earrings: ["Diamond Earrings", "Studs, huggies & drops in certified natural diamonds."],
    "necklaces-pendants": ["Necklaces & Pendants", "Solitaire drops & fine chains in 14Kt & 18Kt gold."],
    "bracelets-bangles": ["Bracelets & Bangles", "Diamond bracelets & bangles in classic silhouettes."],
};

export default function CategoryPage() {
    const { slug } = useParams();
    const [title, subtitle] = TITLES[slug] ?? ["Fine Jewellery", "Handcrafted natural diamond jewellery in 14Kt & 18Kt solid gold."];
    
    return <ProductListPage mode="category" slug={slug} title={title} subtitle={subtitle} />;
}