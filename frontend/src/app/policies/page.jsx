import Link from "next/link";

export const metadata = {
  title: "Policies & Certifications | YA-RA Jewels",
  description: "Overview of YA-RA's policies, certifications, and guarantees.",
};

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
      description: "Learn about IGI, GIA, and SGL certification standards.",
      link: "/certification",
      icon: "💎"
    },
    {
      title: "Ring Size Guide",
      description: "How to measure your ring size accurately.",
      link: "/size-guide",
      icon: "📏"
    },
    {
      title: "Jewellery Care",
      description: "Expert tips for caring for your diamond jewellery.",
      link: "/tips",
      icon: "✨"
    }
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-12">
      <p className="text-xs uppercase tracking-[0.16em] text-ink/50 mb-4">
        <Link href="/" className="hover:text-gold-dark">Home</Link> / Policies & Certifications
      </p>
      <h1 className="font-serif text-4xl md:text-5xl mb-6">Policies & Certifications</h1>
      <p className="text-ink/70 mb-12 max-w-2xl">
        Everything you need to know about shopping with YA-RA, from our guarantees 
        to caring for your jewellery.
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((policy) => (
          <Link 
            key={policy.link}
            href={policy.link}
            className="group bg-white rounded-2xl border border-line p-8 hover:shadow-card transition-shadow"
          >
            <div className="text-4xl mb-4">{policy.icon}</div>
            <h3 className="font-serif text-xl mb-2 group-hover:text-gold-dark transition-colors">
              {policy.title}
            </h3>
            <p className="text-sm text-ink/60">{policy.description}</p>
            <div className="mt-4 text-xs uppercase tracking-[0.16em] font-semibold text-gold-dark group-hover:text-ink transition-colors">
              Learn More →
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-16 bg-ink rounded-2xl p-8 md:p-12 text-white">
        <h2 className="font-serif text-3xl mb-4">Our Guarantees</h2>
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <div>
            <h3 className="text-gold-dark font-semibold mb-2">100% Natural Diamonds</h3>
            <p className="text-sm text-white/70">Every diamond is earth-mined and certified by renowned laboratories.</p>
          </div>
          <div>
            <h3 className="text-gold-dark font-semibold mb-2">Lifetime Buyback</h3>
            <p className="text-sm text-white/70">Upgrade or exchange your YA-RA pieces anytime, forever.</p>
          </div>
          <div>
            <h3 className="text-gold-dark font-semibold mb-2">15-Day Returns</h3>
            <p className="text-sm text-white/70">Full refund within 15 days, no questions asked.</p>
          </div>
        </div>
      </div>
    </div>
  );
}