import Link from "next/link";
import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: "Ring Size Guide | YA-RA Jewels",
  description: "How to measure your ring size at home with confidence.",
});

export default function SizeGuidePage() {
  const sizes = [
    ["6", "16.5", "51.9"],
    ["8", "18.2", "57.0"],
    ["10", "19.8", "62.1"],
    ["12", "21.4", "67.2"],
    ["14", "23.0", "72.3"],
    ["16", "24.6", "77.4"],
    ["18", "26.2", "82.5"],
    ["20", "27.8", "87.6"],
  ];

  const proTips = [
    {
      icon: "⏰",
      title: "Measure at the Right Time",
      description: "Measure your finger at the end of the day when it's at its largest. Fingers can swell throughout the day."
    },
    {
      icon: "🌡️",
      title: "Mind the Temperature",
      description: "Avoid measuring when your hands are cold. Cold fingers are smaller and will give you an inaccurate reading."
    },
    {
      icon: "🔄",
      title: "Between Sizes?",
      description: "If you're between sizes, we recommend choosing the larger size. Our rings can be resized within 2 sizes up or down."
    },
    {
      icon: "💍",
      title: "Knuckle Consideration",
      description: "If your knuckle is significantly larger than your finger base, measure both and choose a size between the two measurements."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <p className="text-xs text-[#1A2536]/50 mb-6">
        <Link href="/" className="hover:text-[#B86B5A]">Home</Link> / <Link href="/policies" className="hover:text-[#B86B5A]">Policies</Link> / Ring Size Guide
      </p>

      {/* Header */}
      <div className="mb-10">
        <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">find your perfect fit</span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Ring Size Guide</h1>
        <p className="text-[#1A2536]/70 mt-4">
          Getting the perfect fit is essential for comfort and security. Follow our simple methods to find your ring size at home.
        </p>
      </div>

      <div className="space-y-8 text-[#1A2536]/70 leading-relaxed">
        {/* Introduction Card */}
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8 bg-gradient-to-br from-[#FBF7F2] to-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif-luxury text-xl font-semibold text-[#1A2536] mb-2">Why Accurate Sizing Matters</h2>
              <p className="text-sm">
                A ring that's too loose can slip off and get lost, while one that's too tight can be uncomfortable and restrict circulation. 
                Taking the time to measure correctly ensures your YA-RA piece fits perfectly from day one.
              </p>
            </div>
          </div>
        </section>

        {/* Method 1: Measure an Existing Ring */}
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-[#B86B5A]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-[#B86B5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Method 1: Measure an Existing Ring</h2>
              <p className="text-sm text-[#1A2536]/60 mt-1">The easiest method if you have a well-fitting ring</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#FBF7F2] rounded-2xl p-5 border border-[#E5BDB0]/40">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 bg-[#B86B5A] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                <div>
                  <h3 className="font-bold text-[#1A2536] mb-2">Select the Right Ring</h3>
                  <p className="text-sm">Take a ring that fits the intended finger well and comfortably.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FBF7F2] rounded-2xl p-5 border border-[#E5BDB0]/40">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 bg-[#B86B5A] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                <div>
                  <h3 className="font-bold text-[#1A2536] mb-2">Measure the Internal Diameter</h3>
                  <p className="text-sm">Place the ring on a ruler and measure the <strong className="text-[#1A2536]">internal diameter</strong> in millimeters. Be precise.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FBF7F2] rounded-2xl p-5 border border-[#E5BDB0]/40">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 bg-[#B86B5A] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                <div>
                  <h3 className="font-bold text-[#1A2536] mb-2">Match to Size Chart</h3>
                  <p className="text-sm">Find your measurement in the size chart below to determine your ring size.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Method 2: Measure Your Finger */}
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Method 2: Measure Your Finger</h2>
              <p className="text-sm text-[#1A2536]/60 mt-1">Perfect if you don't have an existing ring to measure</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#FBF7F2] rounded-2xl p-5 border border-[#E5BDB0]/40">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 bg-[#D4AF37] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                <div>
                  <h3 className="font-bold text-[#1A2536] mb-2">Wrap a Strip Around Your Finger</h3>
                  <p className="text-sm">Cut a thin strip of paper or use a piece of string. Wrap it around the base of your finger where the ring will sit.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FBF7F2] rounded-2xl p-5 border border-[#E5BDB0]/40">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 bg-[#D4AF37] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                <div>
                  <h3 className="font-bold text-[#1A2536] mb-2">Mark the Overlap</h3>
                  <p className="text-sm">Mark where the ends meet with a pen. Make sure the strip is snug but not tight.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FBF7F2] rounded-2xl p-5 border border-[#E5BDB0]/40">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 bg-[#D4AF37] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                <div>
                  <h3 className="font-bold text-[#1A2536] mb-2">Measure the Length</h3>
                  <p className="text-sm">Lay the strip flat and measure the length from the end to your mark in millimeters.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FBF7F2] rounded-2xl p-5 border border-[#E5BDB0]/40">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 bg-[#D4AF37] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                <div>
                  <h3 className="font-bold text-[#1A2536] mb-2">Match to Size Chart</h3>
                  <p className="text-sm">Find your circumference measurement in the size chart below.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Size Chart */}
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-[#1A2536]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-[#1A2536]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Size Chart</h2>
              <p className="text-sm text-[#1A2536]/60 mt-1">Indian ring sizes with measurements</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1A2536] text-white">
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-bold">Ring Size</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-bold">Diameter (mm)</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-bold">Circumference (mm)</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map(([size, diameter, circumference], index) => (
                  <tr 
                    key={size} 
                    className={`border-b border-[#E5BDB0]/40 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#FBF7F2]/50'
                    } hover:bg-[#E5BDB0]/20`}
                  >
                    <td className="px-4 py-3 font-bold text-[#1A2536]">{size}</td>
                    <td className="px-4 py-3 text-[#1A2536]/70">{diameter}</td>
                    <td className="px-4 py-3 text-[#1A2536]/70">{circumference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pro Tips */}
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-[#B86B5A]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-[#B86B5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Pro Tips for Perfect Sizing</h2>
              <p className="text-sm text-[#1A2536]/60 mt-1">Expert advice to get it right the first time</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {proTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-[#FBF7F2] rounded-xl border border-[#E5BDB0]/30">
                <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                <div>
                  <h3 className="font-bold text-[#1A2536] text-sm mb-1">{tip.title}</h3>
                  <p className="text-xs text-[#1A2536]/60">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}