import Link from "next/link";

export const metadata = {
  title: "Ring Size Guide | YA-RA Jewels",
  description: "How to measure your perfect ring size at home.",
};

export default function SizeGuidePage() {
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
      </div>

      <div className="space-y-8 text-[#1A2536]/70 leading-relaxed">
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">Method 1: Measure an Existing Ring</h2>
          <ol className="space-y-3 list-decimal pl-6">
            <li>Take a ring that fits the intended finger well</li>
            <li>Measure the <strong className="text-[#1A2536]">internal diameter</strong> in millimeters using a ruler</li>
            <li>Match the measurement to our size chart below</li>
          </ol>
        </section>

        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">Method 2: Measure Your Finger</h2>
          <ol className="space-y-3 list-decimal pl-6">
            <li>Wrap a strip of paper or string around the base of your finger</li>
            <li>Mark where the ends meet</li>
            <li>Measure the length in millimeters</li>
            <li>Match the circumference to our size chart below</li>
          </ol>
          <p className="mt-4 text-sm text-[#1A2536]/60 bg-[#E5BDB0]/20 p-4 rounded-xl border border-[#E5BDB0]/40">
            <strong className="text-[#1A2536]">Pro Tip:</strong> Measure your finger at the end of the day when it's at its largest. 
            Avoid measuring when your hands are cold.
          </p>
        </section>

        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">Size Chart</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1A2536] text-white">
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-bold">Size</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-bold">Diameter (mm)</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-bold">Circumference (mm)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["6", "16.5", "51.9"],
                  ["8", "18.2", "57.0"],
                  ["10", "19.8", "62.1"],
                  ["12", "21.4", "67.2"],
                  ["14", "23.0", "72.3"],
                  ["16", "24.6", "77.4"],
                  ["18", "26.2", "82.5"],
                  ["20", "27.8", "87.6"],
                ].map(([size, diameter, circumference]) => (
                  <tr key={size} className="border-b border-[#E5BDB0]/40 hover:bg-[#E5BDB0]/10 transition-colors">
                    <td className="px-4 py-3 font-bold text-[#1A2536]">{size}</td>
                    <td className="px-4 py-3 text-[#1A2536]/70">{diameter}</td>
                    <td className="px-4 py-3 text-[#1A2536]/70">{circumference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">Need Help?</h2>
          <p className="mb-6">
            If you're between sizes, we recommend choosing the larger size. Our rings can be 
            resized within 2 sizes up or down. For professional sizing, visit our showroom or 
            contact our customer service team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/showroom" className="px-8 py-4 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all text-center">
              Visit Showroom
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl text-center">
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}