"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ImageFallback from "@/components/ImageFallback";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const BLUR_DATA = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

export default function ProductCard({ product }) {
    const img = product.media?.find((m) => m.kind === "image") ?? product.media?.[0];
    const [failed, setFailed] = useState(false);

    return (
        <Link href={`/product/${product.slug}`} className="group block">
            <div className="glass-card-vibrant rounded-2xl overflow-hidden border border-[#1A2536]/10 hover:border-[#B86B5A] transition-all duration-500 hover:shadow-xl hover:scale-[1.03] flex flex-col">
                <div className="relative overflow-hidden aspect-square bg-white">
                    {!img || failed ? (
                        <ImageFallback />
                    ) : (
                        <Image
                            src={img.url}
                            alt={product.name}
                            fill
                            loading="lazy"
                            placeholder="blur"
                            blurDataURL={BLUR_DATA}
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
                            className="object-cover"
                            onError={() => setFailed(true)}
                        />
                    )}
                </div>

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