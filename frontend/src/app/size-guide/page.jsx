import Link from "next/link";

export const metadata = {
  title: "Ring Size Guide | YA-RA Jewels",
  description: "How to measure your ring size accurately for the perfect fit.",
};

export default function SizeGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-8 lg:px-20 py-12">
      <p className="text-xs uppercase tracking-[0.16em] text-ink/50 mb-4">
        <Link href="/" className="hover:text-gold-dark">Home</Link> / Size Guide
      </p>
      <h1 className="font-serif text-4xl md:text-5xl mb-6">Ring Size Guide</h1>
      
      <div className="space-y-8 text-ink/70">
        <div className="bg-gold/10 border border-gold/30 rounded-2xl p-8">
          <h2 className="font-serif text-2xl text-ink mb-3">Finding Your Perfect Fit</h2>
          <p className="leading-relaxed">
            Getting the right ring size is crucial for comfort and security. Follow our guide 
            to measure your size accurately, or visit our showroom for professional sizing.
          </p>
        </div>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-4">Method 1: Measure an Existing Ring</h2>
          <ol className="space-y-3 list-decimal pl-6">
            <li>Take a ring that fits the intended finger well</li>
            <li>Measure the <strong>internal diameter</strong> in millimeters using a ruler</li>
            <li>Match the measurement to our size chart below</li>
          </ol>
        </section>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-4">Method 2: Measure Your Finger</h2>
          <ol className="space-y-3 list-decimal pl-6">
            <li>Wrap a strip of paper or string around the base of your finger</li>
            <li>Mark where the ends meet</li>
            <li>Measure the length in millimeters</li>
            <li>Match the circumference to our size chart below</li>
          </ol>
          <p className="mt-4 text-sm text-ink/60">
            <strong>Tip:</strong> Measure your finger at the end of the day when it's at its largest. 
            Avoid measuring when your hands are cold.
          </p>
        </section>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-4">Size Chart</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-line">
              <thead>
                <tr className="bg-cream">
                  <th className="border border-line px-4 py-3 text-left text-xs uppercase tracking-wider">Size</th>
                  <th className="border border-line px-4 py-3 text-left text-xs uppercase tracking-wider">Diameter (mm)</th>
                  <th className="border border-line px-4 py-3 text-left text-xs uppercase tracking-wider">Circumference (mm)</th>
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
                  <tr key={size} className="hover:bg-cream/50">
                    <td className="border border-line px-4 py-3 font-semibold">{size}</td>
                    <td className="border border-line px-4 py-3">{diameter}</td>
                    <td className="border border-line px-4 py-3">{circumference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-3">Need Help?</h2>
          <p className="mb-4">
            If you're between sizes, we recommend choosing the larger size. Our rings can be 
            resized within 2 sizes up or down. For professional sizing, visit our showroom or 
            contact our customer service team.
          </p>
          <div className="flex gap-4">
            <Link href="/showroom" className="btn-outline">Visit Showroom</Link>
            <Link href="/contact" className="btn-solid">Contact Us</Link>
          </div>
        </section>
      </div>
    </div>
  );
}