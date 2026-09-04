import Link from "next/link";
import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: "About Us | YA-RA Jewels",
  description: "Learn about YA-RA's commitment to certified natural diamonds and handcrafted excellence.",
});

export default function AboutPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-12">
      <p className="text-xs uppercase tracking-[0.16em] text-ink/50 mb-4">
        <Link href="/" className="hover:text-gold-dark">Home</Link> / About Us
      </p>
      <h1 className="font-serif text-4xl md:text-5xl mb-6">Our Story</h1>
      
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6 text-ink/70 leading-relaxed">
          <p className="text-lg">
            YA-RA® Fine Jewellery was founded on a simple belief: every woman deserves to wear 
            certified natural diamonds in solid gold, every single day.
          </p>
          <p>
            We reject the notion that fine jewellery should sit in a vault, reserved only for 
            special occasions. Our pieces are designed to be worn, loved, and passed down — 
            crafted with the same care and quality as heirloom pieces, but with modern silhouettes 
            that fit seamlessly into your everyday life.
          </p>
          <p>
            Every YA-RA diamond is 100% earth-mined and certified by renowned laboratories 
            (IGI, GIA, SGL). Every gold setting is BIS hallmarked in 14Kt or 18Kt solid gold. 
            No lab-grown diamonds. No gold plating. No compromises.
          </p>
          <p>
            Our artisans handcraft each piece in our Jaipur atelier, combining centuries-old 
            techniques with contemporary design. The result is jewellery that feels both timeless 
            and utterly modern — pieces you'll reach for daily and treasure forever.
          </p>
          
          <div className="pt-6 border-t border-line">
            <h3 className="font-serif text-2xl mb-4">Our Promise</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-gold-dark mt-1">◆</span>
                <span><strong>100% Natural Diamonds:</strong> Every stone is earth-mined and certified for origin and quality.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold-dark mt-1">◆</span>
                <span><strong>Solid Gold Only:</strong> 14Kt and 18Kt BIS hallmarked gold. Never plated or filled.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold-dark mt-1">◆</span>
                <span><strong>Lifetime Buyback:</strong> Upgrade or exchange your YA-RA pieces anytime, forever.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold-dark mt-1">◆</span>
                <span><strong>15-Day Returns:</strong> Not in love? Full refund, no questions asked.</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-ink rounded-2xl p-8 text-white">
            <h3 className="font-serif text-2xl mb-4">By The Numbers</h3>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-serif text-gold-dark">10,000+</p>
                <p className="text-sm text-white/70">Happy customers across India</p>
              </div>
              <div>
                <p className="text-3xl font-serif text-gold-dark">100%</p>
                <p className="text-sm text-white/70">Certified natural diamonds</p>
              </div>
              <div>
                <p className="text-3xl font-serif text-gold-dark">50+</p>
                <p className="text-sm text-white/70">Master artisans in our atelier</p>
              </div>
              <div>
                <p className="text-3xl font-serif text-gold-dark">15</p>
                <p className="text-sm text-white/70">Years of craftsmanship excellence</p>
              </div>
            </div>
          </div>
          
          <div className="bg-cream rounded-2xl p-8">
            <h3 className="font-serif text-2xl mb-4">Visit Our Showroom</h3>
            <p className="text-sm text-ink/70 mb-4">
              Experience our collection in person at our flagship showroom in Jaipur.
            </p>
            <Link href="/showroom" className="btn-outline inline-block">
              Showroom Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}