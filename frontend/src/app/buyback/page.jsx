import Link from "next/link";
import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: "Lifetime Buyback & Exchange Guarantee | YA-RA Jewels",
  description: "Our commitment to lifetime value for your jewellery investment.",
});

export default function BuybackPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <p className="text-xs text-[#1A2536]/50 mb-6">
        <Link href="/" className="hover:text-[#B86B5A]">Home</Link> / <Link href="/policies" className="hover:text-[#B86B5A]">Policies</Link> / Buyback & Exchange
      </p>

      {/* Header */}
      <div className="mb-10">
        <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">lifetime value promise</span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Buyback & Exchange</h1>
      </div>

      <div className="space-y-8 text-[#1A2536]/70 leading-relaxed">
        {/* Important Notice */}
        <section className="glass-card-vibrant rounded-3xl border-2 border-[#B86B5A]/30 bg-gradient-to-br from-[#B86B5A]/5 to-transparent p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">Our Commitment</h2>
          <p className="mb-4">
            Every YA-RA piece is crafted to be treasured for a lifetime. While we do not offer exchanges or refunds after purchase, 
            we stand behind the enduring value of your investment with our <strong className="text-[#1A2536]">Lifetime Buyback & Exchange Guarantee</strong>.
          </p>
          <p>
            Should you ever wish to upgrade or part with your YA-RA jewellery, we're honored to offer you transparent, 
            market-based values. Whether you choose to exchange for a new piece or receive cash back, we make the process 
            seamless and fair.
          </p>
        </section>

        {/* Buyback & Exchange Values */}
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">Value Calculations</h2>
          <p className="mb-6">
            Our values are calculated transparently based on the original invoice and current market conditions:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Buyback Column */}
            <div className="border-2 border-[#E5BDB0] rounded-2xl p-5">
              <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536] mb-4 text-center">Buyback (Cash)</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-[#1A2536] mb-1">Diamonds</p>
                  <p className="text-2xl font-serif-luxury text-[#D4AF37] mb-1">70%</p>
                  <p className="text-xs text-[#1A2536]/60">of original invoice value*</p>
                </div>
                <div>
                  <p className="font-bold text-[#1A2536] mb-1">Gold</p>
                  <p className="text-2xl font-serif-luxury text-[#D4AF37] mb-1">90%</p>
                  <p className="text-xs text-[#1A2536]/60">of current market value</p>
                </div>
                <div className="pt-3 border-t border-[#E5BDB0]/60">
                  <p className="text-xs text-[#1A2536]/60">Making charges, taxes, and color stones valued at material worth</p>
                </div>
              </div>
            </div>

            {/* Exchange Column */}
            <div className="border-2 border-[#E5BDB0] rounded-2xl p-5">
              <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536] mb-4 text-center">Exchange (Credit)</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-[#1A2536] mb-1">Diamonds</p>
                  <p className="text-2xl font-serif-luxury text-[#D4AF37] mb-1">70%</p>
                  <p className="text-xs text-[#1A2536]/60">of original invoice value*</p>
                </div>
                <div>
                  <p className="font-bold text-[#1A2536] mb-1">Gold</p>
                  <p className="text-2xl font-serif-luxury text-[#D4AF37] mb-1">100%</p>
                  <p className="text-xs text-[#1A2536]/60">of current market value</p>
                </div>
                <div className="pt-3 border-t border-[#E5BDB0]/60">
                  <p className="text-xs text-[#1A2536]/60">Making charges, taxes, and color stones valued at material worth</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#1A2536]/50 mt-4 italic">
            *Diamond valuation applies as long as diamonds retain market value at time of return
          </p>
        </section>

        {/* Conditions */}
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">Requirements</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A]">◆</span>
              <span>Original YA-RA certificate and purchase invoice must be presented</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A]">◆</span>
              <span>Piece must be in good condition with no major damage or alterations</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A]">◆</span>
              <span>Normal wear and tear is completely acceptable and expected</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A]">◆</span>
              <span>All diamonds must retain market value at the time of return</span>
            </li>
          </ul>
        </section>

        {/* How to Initiate */}
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">How to Initiate</h2>
          <ol className="space-y-3 list-decimal pl-6">
            <li>Visit our showroom to begin the process</li>
            <li>Present your original certificate and purchase invoice</li>
            <li>Receive an immediate valuation based on our transparent policy</li>
            <li>Choose buyback (cash payment) or exchange (credit toward new purchase)</li>
            <li>Complete the transaction and receive payment or credit within 3 business days</li>
          </ol>
          
          <div className="mt-6 p-4 bg-[#FBF7F2] rounded-2xl border border-[#E5BDB0]/60">
            <p className="text-sm">
              <strong className="text-[#1A2536]">Showroom Visit Required:</strong> To ensure the security and authenticity of your piece, 
              all buyback and exchange transactions must be initiated in person at our Gurugram showroom. Our experts will personally 
              assess your jewellery and guide you through the entire process.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link href="/showroom" className="inline-block px-8 py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl">
            Visit Our Showroom
          </Link>
        </div>
      </div>
    </div>
  );
}