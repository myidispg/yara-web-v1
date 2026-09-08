"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// ── Slide config: swap these URLs/links with your real campaign images ──
const SLIDES = [
  {
    href: "/shop",
    alt: "Natural diamond rings in solid gold",
    desktop: "/home/hero/Slide 1 Desktop resized.jpeg",
    mobile: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&h=1400&q=80",
    theme: "light",
  },
  {
    href: "/category/earrings",
    alt: "Certified natural diamond earrings",
    desktop: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=2400&q=80",
    mobile: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=1000&h=1400&q=80",
    theme: "dark",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  // Safe jump to any index (wraps around in both directions)
  const goTo = (i) => {
    setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  };

  // Auto-cycle: stays 5s on each slide.
  // Because the effect depends on [index], the 5s countdown RESTARTS
  // after every change — including manual arrow/dot clicks.
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [index]);

  // Controls adapt to the ACTIVE slide's brightness
  const darkImage = SLIDES[index].theme === "dark";

  const arrowCls = `absolute top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-colors duration-500 ${darkImage
      ? "bg-white/15 border border-white/25 text-white hover:bg-white/30"
      : "bg-[#1A2536]/10 border border-[#1A2536]/25 text-[#1A2536] hover:bg-[#1A2536]/20"
    }`;

  return (
    <section className="relative w-full overflow-hidden bg-[#1A2536]" aria-label="Featured YA-RA collections">
      <div className="relative w-full h-[62vh] min-h-[420px] md:h-[78vh] md:min-h-[520px] md:max-h-[760px]">

        {/* Slides — each one is its own clickable Link */}
        {SLIDES.map((slide, i) => {
          const active = i === index;
          return (
            <Link
              key={slide.href}
              href={slide.href}
              aria-label={slide.alt}
              tabIndex={active ? 0 : -1}
              className={`absolute inset-0 block transition-opacity duration-700 ease-in-out ${active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
            >
              {/* Desktop / tablet (wide crop) */}
              <Image
                src={slide.desktop}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="hidden md:block object-cover"
              />
              {/* Mobile (vertical crop) */}
              <Image
                src={slide.mobile}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="md:hidden object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1A2536]/60 to-transparent pointer-events-none" />
            </Link>
          );
        })}

        {/* ── Left arrow (previous) ── */}
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => goTo(index - 1)}
          className={`${arrowCls} left-4 md:left-6`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* ── Right arrow (next) ── */}
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => goTo(index + 1)}
          className={`${arrowCls} right-4 md:right-6`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* ── Clickable dots (jump straight to that index) ── */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.href}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full bg-white mix-blend-difference transition-all duration-500 ${i === index ? "w-8" : "w-2 opacity-60 hover:opacity-100"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// export default function HeroCarousel() {
//   const [index, setIndex] = useState(0);

//   // Auto-cycle every 5 seconds
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setIndex((i) => (i + 1) % SLIDES.length);
//     }, 5000);
//     return () => clearInterval(timer);
//   }, []);

//   return (
//     <section className="relative w-full overflow-hidden bg-[#1A2536]" aria-label="Featured collections">
//       <div className="relative w-full h-[62vh] min-h-[420px] md:h-[78vh] md:min-h-[520px] md:max-h-[760px]">
//         {SLIDES.map((slide, i) => {
//           const active = i === index;
//           return (
//             <Link
//               key={slide.href}
//               href={slide.href}
//               aria-hidden={!active}
//               tabIndex={active ? 0 : -1}
//               className={`absolute inset-0 block transition-opacity duration-700 ease-in-out ${
//                 active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
//               }`}
//             >
//               {/* Desktop / tablet image (wide crop) */}
//               <Image
//                 src={slide.desktop}
//                 alt={slide.alt}
//                 fill
//                 priority={i === 0}
//                 sizes="100vw"
//                 className="hidden md:block object-cover"
//               />
//               {/* Mobile image (vertical crop for portrait screens) */}
//               <Image
//                 src={slide.mobile}
//                 alt={slide.alt}
//                 fill
//                 priority={i === 0}
//                 sizes="100vw"
//                 className="md:hidden object-cover"
//               />
//               {/* Bottom gradient so dots stay visible */}
//               <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1A2536]/60 to-transparent pointer-events-none" />
//             </Link>
//           );
//         })}

//         {/* Slide dots */}
//         <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
//           {SLIDES.map((slide, i) => (
//             <button
//               key={slide.href}
//               type="button"
//               aria-label={`Go to slide ${i + 1}`}
//               onClick={() => setIndex(i)}
//               className={`h-2 rounded-full transition-all duration-300 ${
//                 i === index ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }