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
      title: "Diamond Certification",
      description: "Learn about IGI, GIA, and SGL certification partners.",
      link: "/certification",
      icon: "◆"
    },
    {
      title: "Ring Size Guide",
      description: "How to measure your perfect ring size at home.",
      link: "/size-guide",
      icon: "◯"
    },
    {
      title: "Jewellery Care",
      description: "Tips for cleaning and maintaining your pieces.",
      link: "/tips",
      icon: "✨"
    },
    {
      title: "Visit Showroom",
      description: "Book a private appointment at our Jaipur flagship.",
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
      <div className="bg-[#1A2536] rounded-3xl p-8 md:p-12 text-white">
        <h2 className="font-serif-luxury text-3xl font-semibold mb-8">Our Guarantees</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-[#E5BDB0] font-bold mb-2 text-sm uppercase tracking-wider">100% Natural Diamonds</h3>
            <p className="text-sm text-white/70">Every diamond is earth-mined and certified by renowned laboratories.</p>
          </div>
          <div>
            <h3 className="text-[#E5BDB0] font-bold mb-2 text-sm uppercase tracking-wider">Lifetime Buyback</h3>
            <p className="text-sm text-white/70">Upgrade or exchange your YA-RA pieces anytime, forever.</p>
          </div>
          <div>
            <h3 className="text-[#E5BDB0] font-bold mb-2 text-sm uppercase tracking-wider">15-Day Returns</h3>
            <p className="text-sm text-white/70">Full refund within 15 days, no questions asked.</p>
          </div>
        </div>
      </div>
    </div>
  );
}