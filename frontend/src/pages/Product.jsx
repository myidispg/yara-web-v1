import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import { variantLabel } from "../utils/format";
import { priceBreakdown } from "../utils/pricing"
import usePageTitle from "../utils/usePageTitle";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function ProductPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();

    const [product, setProduct] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [purity, setPurity] = useState("18Kt");
    const [variant, setVariant] = useState(null);
    const [imgIdx, setImgIdx] = useState(0);
    const [showBreakdown, setShowBreakdown] = useState(false);

    usePageTitle(product?.name);

    useEffect(() => {
        (async () => {
            for (const path of [`/products/${slug}/`, `/products/?slug=${slug}`]) {
                try {
                    const { data } = await api.get(path);
                    const p = Array.isArray(data?.results ?? data) ? (data.results ?? data)[0] : data;
                    if (p && p.slug) { setProduct(p); return; }
                } catch { /* try next */ }
            }
            setNotFound(true);
        })();
    }, [slug]);

    const images = product?.images?.map((i) => i.url ?? i) ?? (product?.primary_image ? [product.primary_image] : []);
    const purities = useMemo(
        () => [...new Set((product?.variants ?? []).map((v) => v.purity))],
        [product]
    );
    const purityVariants = useMemo(
        () => (product?.variants ?? []).filter((v) => v.purity === purity),
        [product, purity]
    );

    useEffect(() => {
        if (product && purities.length && !purities.includes(purity)) setPurity(purities[0]);
    }, [product, purities, purity]);

    useEffect(() => {
        setVariant(purityVariants[0] ?? product?.variants?.[0] ?? null);
    }, [purityVariants, product]);

    if (notFound)
        return (
            <div className="max-w-3xl mx-auto px-6 py-24 text-center">
                <h1 className="text-3xl font-serif mb-4">Piece not found</h1>
                <Link to="/" className="btn-outline inline-block">Return Home</Link>
            </div>
        );
    if (!product || !variant)
        return <p className="text-center py-24 text-sm text-charcoal/60">Loading piece…</p>;

    const price = variant.price;
    const compare = product.compare_at_price ?? product.compareAtPrice ?? product.mrp ?? null;
    const off = compare ? Math.round(((compare - price) / compare) * 100) : 0;

    // Transparent breakdown (proportional until backend supplies exact values)
    const { gold, diamond, making, gst } = priceBreakdown(price, variant);

    const sizes = [...new Set(purityVariants.map((v) => v.ring_size).filter(Boolean))];

    const addToBag = () => addItem(product, variant, 1);
    const buyNow = () => { addItem(product, variant, 1); navigate("/checkout"); };

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
            {/* Breadcrumb */}
            <p className="micro-label text-charcoal/50 mb-8">
                <Link to="/" className="hover:text-gold">Home</Link> /{" "}
                <Link to={`/category/${product.category?.slug ?? "rings"}`} className="hover:text-gold">
                    {product.category?.name ?? "Rings"}
                </Link>{" "}
                / {product.name}
            </p>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Gallery */}
                <div>
                    <div className="bg-cream aspect-square mb-4">
                        <img src={images[imgIdx] ?? images[0]} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-3">
                            {images.map((src, i) => (
                                <button
                                    key={src}
                                    onClick={() => setImgIdx(i)}
                                    className={`w-20 h-20 bg-cream border ${i === imgIdx ? "border-gold" : "border-transparent"}`}
                                >
                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div>
                    <span className="badge-gold mb-4">IGI Certified Natural Diamond</span>
                    <h1 className="text-4xl font-serif mb-3">{product.name}</h1>
                    <p className="text-sm text-charcoal/60 mb-8 leading-relaxed">
                        {product.description ??
                            "Available in 14Kt and 18Kt Solid Gold with hand-selected certified natural diamonds."}
                    </p>

                    {/* Purity selector */}
                    <p className="micro-label mb-3">Select Gold Purity:</p>
                    <div className="flex gap-3 mb-8">
                        {purities.map((p) => (
                            <button
                                key={p}
                                onClick={() => setPurity(p)}
                                className={`micro-label border px-5 py-3 transition-colors ${purity === p ? "border-gold bg-gold text-ivory" : "border-charcoal/25 hover:border-gold hover:text-gold"
                                    }`}
                            >
                                {p} Solid Gold
                            </button>
                        ))}
                    </div>

                    {/* Size selector */}
                    {sizes.length > 0 && (
                        <>
                            <p className="micro-label mb-3">Select Ring Size:</p>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {sizes.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setVariant(purityVariants.find((v) => v.ring_size === s) ?? variant)}
                                        className={`micro-label border w-10 h-10 ${variant.ring_size === s ? "border-gold bg-gold text-ivory" : "border-charcoal/25 hover:border-gold"
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-1">
                        <span className="text-3xl font-serif">{inr(price)}</span>
                        {compare && <span className="price-strike">{inr(compare)}</span>}
                        {off > 0 && <span className="micro-label text-gold">{off}% OFF</span>}
                    </div>
                    <p className="text-xs text-charcoal/60 mb-6">
                        Inclusive of all taxes. Free insured delivery in India. · {variantLabel(variant)}
                    </p>

                    {/* Breakdown */}
                    <button
                        onClick={() => setShowBreakdown(!showBreakdown)}
                        className="micro-label text-gold underline underline-offset-4 mb-4"
                    >
                        {showBreakdown ? "Hide" : "View"} Transparent Price Breakdown
                    </button>
                    {showBreakdown && (
                        <div className="hairline border-b border-charcoal/15 py-4 mb-6 space-y-2 text-xs">
                            <div className="flex justify-between"><span>Gold ({purity}, est.)</span><span>{inr(gold)}</span></div>
                            <div className="flex justify-between"><span>Natural Diamond</span><span>{inr(diamond)}</span></div>
                            <div className="flex justify-between"><span>Making Charges</span><span>{inr(making)}</span></div>
                            <div className="flex justify-between"><span>GST</span><span>{inr(gst)}</span></div>
                        </div>
                    )}

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <button onClick={addToBag} className="btn-solid flex-1">Add To Shopping Bag</button>
                        <button onClick={buyNow} className="btn-outline flex-1">Buy Now (Express Checkout)</button>
                    </div>
                </div>
            </div>
        </div>
    );
}