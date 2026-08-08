import { Link } from "react-router-dom";
import { inr } from "../utils/format";

const COLOR_HEX = { yellow: "#d9b64f", rose: "#d99f86", white: "#e9e7e0" };

export default function ProductCard({ product }) {
    return (
        <Link to={`/product/${product.slug}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden bg-parchment">
                {product.primary_image && (
                    <img src={product.primary_image} alt={product.name} loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
                )}
                {product.second_image && (
                    <img src={product.second_image} alt="" loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                )}
                {product.stock_status === "low_stock" && (
                    <span className="absolute left-3 top-3 bg-ink/85 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-champagne">Few left</span>
                )}
                {product.stock_status === "made_to_order" && (
                    <span className="absolute left-3 top-3 bg-pine px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-champagne">Made to order</span>
                )}
                {product.stock_status === "out_of_stock" && (
                    <span className="absolute left-3 top-3 bg-rust px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-ivory">Sold out</span>
                )}
                {product.discount_percent > 0 && (
                    <span className="absolute bottom-3 left-3 bg-champagne px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-gold-deep">−{product.discount_percent}%</span>
                )}
                <span className="absolute inset-x-0 bottom-0 translate-y-full bg-pine py-3 text-center text-[11px] uppercase tracking-[0.3em] text-champagne transition-transform duration-500 group-hover:translate-y-0">
                    View piece
                </span>
            </div>

            <div className="pt-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-ink/50">{product.category_name}</p>
                <div className="mt-1 flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg leading-snug">{product.name}</h3>
                    <div className="shrink-0 text-right">
                        <p className="font-medium">{inr(product.min_price ?? product.base_price)}</p>
                        {product.mrp > product.base_price && (
                            <p className="text-xs text-ink/40 line-through">{inr(product.mrp)}</p>
                        )}
                    </div>
                </div>
                <div className="mt-2 flex gap-1.5">
                    {(product.colors || []).map((c) => (
                        <span key={c} className="h-3 w-3 rounded-full border border-ink/15" style={{ background: COLOR_HEX[c] }} />
                    ))}
                </div>
            </div>
        </Link>
    );
}