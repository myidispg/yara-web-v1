import Link from "next/link";
import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: "Jewellery Care Guide | YA-RA Jewels",
  description: "Tips for cleaning and maintaining your fine jewellery.",
});

export default function TipsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <p className="text-xs text-[#1A2536]/50 mb-6">
        <Link href="/" className="hover:text-[#B86B5A]">Home</Link> / <Link href="/policies" className="hover:text-[#B86B5A]">Policies</Link> / Jewellery Care
      </p>

      {/* Header */}
      <div className="mb-10">
        <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">care for your treasures</span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Jewellery Care Guide</h1>
      </div>

      <div className="space-y-8 text-[#1A2536]/70 leading-relaxed">
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">Cleaning Your Jewellery</h2>
          <div className="space-y-5">
            <div className="border-l-4 border-[#B86B5A] pl-5">
              <h3 className="font-bold text-[#1A2536] mb-2">Gentle Cleaning Solution</h3>
              <p>Mix a few drops of mild dish soap with warm water. Soak your jewellery for 15-20 minutes, then gently brush with a soft toothbrush. Rinse thoroughly and pat dry with a lint-free cloth.</p>
            </div>

            <div className="border-l-4 border-[#B86B5A] pl-5">
              <h3 className="font-bold text-[#1A2536] mb-2">What to Avoid</h3>
              <p>Never use harsh chemicals, bleach, or abrasive cleaners. Avoid ultrasonic cleaners for pieces with fragile settings or color stones.</p>
            </div>
          </div>
        </section>

        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">When to Remove Your Jewellery</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span><strong className="text-[#1A2536]">Swimming:</strong> Chlorine can damage gold and dull diamonds</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span><strong className="text-[#1A2536]">Exercise:</strong> Sweat and impact can loosen settings</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span><strong className="text-[#1A2536]">Cleaning:</strong> Household chemicals can tarnish metals</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span><strong className="text-[#1A2536]">Sleeping:</strong> Rings can bend or catch on fabrics</span>
            </li>
          </ul>
        </section>

        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">Storage Tips</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Store pieces separately to prevent scratching</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Use soft pouches or lined jewellery boxes</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Keep away from direct sunlight and humidity</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Hang necklaces to prevent tangling</span>
            </li>
          </ul>
        </section>

        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">Professional Maintenance</h2>
          <p className="mb-6">
            We recommend having your jewellery professionally cleaned and inspected every 6-12 months.
            Our showroom offers complimentary cleaning and prong tightening services for all YA-RA pieces.
          </p>
          <Link href="/showroom" className="inline-block px-8 py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl">
            Book a Service Appointment →
          </Link>
        </section>
      </div>
    </div>
  );
}