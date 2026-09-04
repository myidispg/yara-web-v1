"use client";

import { useState } from "react";
import Image from "next/image";

export default function SafeImage({ src, alt, fallback, className, fill, sizes, priority, ...props }) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return fallback || (
            <div className={`${fill ? "absolute inset-0" : ""} w-full h-full bg-gradient-to-br from-[#FAF9F6] to-[#E5BDB0]/30 flex items-center justify-center ${className || ""}`}>
                <svg className="w-10 h-10 text-[#1A2536]/25" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill={fill}
            sizes={sizes}
            priority={priority}
            className={className}
            onError={() => setFailed(true)}
            {...props}
        />
    );
}