import Link from "next/link";
import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: 'Policies & Certifications | YA-RA Jewels',
  description: "Our commitment to transparency, privacy, and lifetime value.",
});


export default function PoliciesPage() {
  const policies = [
    {
      title: "Privacy Policy",
      description: "How we collect, use, and protect your personal information.",
      link: "/privacy",
      icon: "🔒"
    },
    {
      title: "Buyback & Exchange",
      description: "Our lifetime buyback guarantee and exchange program.",
      link: "/buyback",
      icon: "↻"
    },
    {
      title: "Diamond Guide",
      description: "Understand the 4Cs, diamond shapes, and certification.",
      link: "/diamond-guide",
      icon: "◆"
    },
    {
      title: "Ring Size Guide",
      description: "How to measure your perfect ring size at home.",
      link: "/size-guide",
      icon: "◯"
    },
    {
      title: "Jewellery Care Guide",
      description: "Expert tips for cleaning and maintaining your fine jewellery.",
      link: "/jewellery-care",
      icon: "✨"
    },
    {
      title: "Visit Showroom",
      description: "Book a private appointment at our Gurugram flagship.",
      link: "/showroom",
      icon: "📍"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <p className="text-xs text-[#1A2536]/50 mb-6">
        <Link href="/" className="hover:text-[#B86B5A]">Home</Link> / Policies & Guarantees
      </p>

      {/* Header */}
      <div className="mb-10">
        <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">transparency & trust</span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Policies & Guarantees</h1>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {policies.map((policy) => (
          <Link
            key={policy.link}
            href={policy.link}
            className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 hover:border-[#B86B5A] transition-all hover:shadow-lg group"
          >
            <span className="text-4xl mb-4 block">{policy.icon}</span>
            <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536] mb-2 group-hover:text-[#B86B5A] transition-colors">
              {policy.title}
            </h3>
            <p className="text-sm text-[#1A2536]/70">{policy.description}</p>
          </Link>
        ))}
      </div>

      {/* Our Guarantees */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A2536] via-[#223046] to-[#1A2536] p-8 sm:p-12 text-white">
        {/* Ambient decorative elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#D4AF37] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#E5BDB0] rounded-full blur-3xl"></div>
        </div>

        <div className="relative">
          <div className="text-center mb-10">
            <span className="font-cursive text-2xl sm:text-3xl text-[#E5BDB0] block mb-2">our commitment to you</span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-white">Our Guarantees</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Guarantee 1: Natural Diamonds */}
            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 hover:border-[#D4AF37]/40 transition-all duration-500">
              <div className="w-12 h-12 bg-[#D4AF37]/15 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-serif-luxury text-lg font-semibold text-white mb-2">100% Natural Diamonds</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Every diamond is earth-mined and certified by IGI, GIA, or SGL laboratories.
              </p>
            </div>

            {/* Guarantee 2: Lifetime Buyback */}
            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 hover:border-[#E5BDB0]/40 transition-all duration-500">
              <div className="w-12 h-12 bg-[#E5BDB0]/15 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[#E5BDB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="font-serif-luxury text-lg font-semibold text-white mb-2">Lifetime Buyback</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Buyback or exchange your YA-RA pieces anytime. Transparent values, fair process.
              </p>
            </div>

            {/* Guarantee 3: Solid Gold */}
            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 hover:border-[#B86B5A]/40 transition-all duration-500">
              <div className="w-12 h-12 bg-[#B86B5A]/15 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[#B86B5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-serif-luxury text-lg font-semibold text-white mb-2">Solid Gold Only</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                BIS hallmarked 14Kt and 18Kt solid gold. Never plated, never filled.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}