import Link from "next/link";
import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: "Jewellery Care Guide | YA-RA Jewels",
  description: "Expert tips for cleaning, storing, and maintaining your fine diamond jewellery.",
});

export default function TipsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <p className="text-xs text-[#1A2536]/50 mb-6">
        <Link href="/" className="hover:text-[#B86B5A]">Home</Link> / <Link href="/policies" className="hover:text-[#B86B5A]">Policies</Link> / Jewellery Care Guide
      </p>

      {/* Header */}
      <div className="mb-10">
        <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">care for your treasures</span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Jewellery Care Guide</h1>
      </div>

      <div className="space-y-8 text-[#1A2536]/70 leading-relaxed">
        {/* Introduction */}
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8 bg-gradient-to-br from-[#FBF7F2] to-white">
          <p className="text-lg font-serif-luxury text-[#1A2536] mb-3">
            Your YA-RA jewellery is crafted to last generations.
          </p>
          <p className="text-[#1A2536]/70">
            With proper care, your pieces will maintain their brilliance and beauty for a lifetime.
            Follow these simple guidelines to keep your diamonds sparkling and your gold gleaming.
          </p>
        </section>

        {/* Cleaning Your Jewellery */}
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Cleaning Your Jewellery</h2>
              <p className="text-sm text-[#1A2536]/60 mt-1">Simple steps to restore brilliance</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#FBF7F2] rounded-2xl p-5 border border-[#E5BDB0]/40">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 bg-[#B86B5A] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                <div>
                  <h3 className="font-bold text-[#1A2536] mb-2">Gentle Cleaning Solution</h3>
                  <p className="text-sm">Mix a few drops of mild dish soap with warm water. Soak your jewellery for 15-20 minutes, then gently brush with a soft toothbrush. Rinse thoroughly and pat dry with a lint-free cloth.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FBF7F2] rounded-2xl p-5 border border-[#E5BDB0]/40">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 bg-[#B86B5A] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                <div>
                  <h3 className="font-bold text-[#1A2536] mb-2">What to Avoid</h3>
                  <p className="text-sm">Never use harsh chemicals, bleach, or abrasive cleaners. Avoid ultrasonic cleaners for pieces with fragile settings or color stones.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* When to Remove */}
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-[#E5BDB0]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-[#1A2536]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">When to Remove Your Jewellery</h2>
              <p className="text-sm text-[#1A2536]/60 mt-1">Protect your pieces from damage</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-[#FBF7F2] rounded-xl border border-[#E5BDB0]/30">
              <span className="text-[#B86B5A] text-xl flex-shrink-0">◆</span>
              <div>
                <h3 className="font-bold text-[#1A2536] text-sm mb-1">Swimming</h3>
                <p className="text-xs text-[#1A2536]/60">Chlorine can damage gold and dull diamonds</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#FBF7F2] rounded-xl border border-[#E5BDB0]/30">
              <span className="text-[#B86B5A] text-xl flex-shrink-0">◆</span>
              <div>
                <h3 className="font-bold text-[#1A2536] text-sm mb-1">Exercise</h3>
                <p className="text-xs text-[#1A2536]/60">Sweat and impact can loosen settings</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#FBF7F2] rounded-xl border border-[#E5BDB0]/30">
              <span className="text-[#B86B5A] text-xl flex-shrink-0">◆</span>
              <div>
                <h3 className="font-bold text-[#1A2536] text-sm mb-1">Cleaning</h3>
                <p className="text-xs text-[#1A2536]/60">Household chemicals can tarnish metals</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#FBF7F2] rounded-xl border border-[#E5BDB0]/30">
              <span className="text-[#B86B5A] text-xl flex-shrink-0">◆</span>
              <div>
                <h3 className="font-bold text-[#1A2536] text-sm mb-1">Sleeping</h3>
                <p className="text-xs text-[#1A2536]/60">Rings can bend or catch on fabrics</p>
              </div>
            </div>
          </div>
        </section>

        {/* Storage Tips */}
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Storage Tips</h2>
              <p className="text-sm text-[#1A2536]/60 mt-1">Preserve beauty between wears</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 hover:bg-[#FBF7F2]/50 rounded-xl transition-colors">
              <span className="text-[#B86B5A] mt-0.5">◆</span>
              <span className="text-[#1A2536]/80">Store pieces separately to prevent scratching</span>
            </div>
            <div className="flex items-start gap-3 p-4 hover:bg-[#FBF7F2]/50 rounded-xl transition-colors">
              <span className="text-[#B86B5A] mt-0.5">◆</span>
              <span className="text-[#1A2536]/80">Use soft pouches or lined jewellery boxes</span>
            </div>
            <div className="flex items-start gap-3 p-4 hover:bg-[#FBF7F2]/50 rounded-xl transition-colors">
              <span className="text-[#B86B5A] mt-0.5">◆</span>
              <span className="text-[#1A2536]/80">Keep away from direct sunlight and humidity</span>
            </div>
            <div className="flex items-start gap-3 p-4 hover:bg-[#FBF7F2]/50 rounded-xl transition-colors">
              <span className="text-[#B86B5A] mt-0.5">◆</span>
              <span className="text-[#1A2536]/80">Hang necklaces to prevent tangling</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}