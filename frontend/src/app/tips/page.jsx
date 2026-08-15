import Link from "next/link";

export const metadata = {
  title: "Jewellery Care Tips | YA-RA Jewels",
  description: "Expert tips for caring for your diamond and gold jewellery.",
};

export default function TipsPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 lg:px-20 py-12">
      <p className="text-xs uppercase tracking-[0.16em] text-ink/50 mb-4">
        <Link href="/" className="hover:text-gold-dark">Home</Link> / Tips & Tricks
      </p>
      <h1 className="font-serif text-4xl md:text-5xl mb-6">Jewellery Care Guide</h1>
      
      <div className="space-y-8 text-ink/70">
        <div className="bg-cream rounded-2xl p-8">
          <h2 className="font-serif text-2xl text-ink mb-3">Daily Care</h2>
          <p className="leading-relaxed">
            Your YA-RA jewellery is designed to be worn every day. With proper care, it will 
            maintain its beauty and brilliance for generations.
          </p>
        </div>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-4">Cleaning Your Jewellery</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-gold-dark pl-4">
              <h3 className="font-semibold text-ink mb-2">Gentle Cleaning Solution</h3>
              <p>Mix a few drops of mild dish soap with warm water. Soak your jewellery for 15-20 minutes, then gently brush with a soft toothbrush. Rinse thoroughly and pat dry with a lint-free cloth.</p>
            </div>
            
            <div className="border-l-4 border-gold-dark pl-4">
              <h3 className="font-semibold text-ink mb-2">What to Avoid</h3>
              <p>Never use harsh chemicals, bleach, or abrasive cleaners. Avoid ultrasonic cleaners for pieces with fragile settings or color stones.</p>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-4">When to Remove Your Jewellery</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-gold-dark mt-1">◆</span>
              <span><strong>Swimming:</strong> Chlorine can damage gold and dull diamonds</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold-dark mt-1">◆</span>
              <span><strong>Exercise:</strong> Sweat and impact can loosen settings</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold-dark mt-1">◆</span>
              <span><strong>Cleaning:</strong> Household chemicals can tarnish metals</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold-dark mt-1">◆</span>
              <span><strong>Sleeping:</strong> Rings can bend or catch on fabrics</span>
            </li>
          </ul>
        </section>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-4">Storage Tips</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-gold-dark mt-1">◆</span>
              <span>Store pieces separately to prevent scratching</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold-dark mt-1">◆</span>
              <span>Use soft pouches or lined jewellery boxes</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold-dark mt-1">◆</span>
              <span>Keep away from direct sunlight and humidity</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold-dark mt-1">◆</span>
              <span>Hang necklaces to prevent tangling</span>
            </li>
          </ul>
        </section>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-4">Professional Maintenance</h2>
          <p className="mb-4">
            We recommend having your jewellery professionally cleaned and inspected every 6-12 months. 
            Our showroom offers complimentary cleaning and prong tightening services for all YA-RA pieces.
          </p>
          <Link href="/showroom" className="btn-outline inline-block">
            Book a Service Appointment →
          </Link>
        </section>
      </div>
    </div>
  );
}