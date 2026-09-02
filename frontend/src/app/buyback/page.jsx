import Link from "next/link";

export const metadata = {
  title: "Lifetime Buyback Guarantee | YA-RA Jewels",
  description: "Our commitment to lifetime value for your jewellery.",
};

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
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">Our Promise To You</h2>
          <p>
            Every YA-RA piece comes with our <strong className="text-[#1A2536]">Lifetime Buyback Guarantee</strong>. 
            Whether you want to upgrade, exchange, or simply return your jewellery, we're here 
            to make the process seamless and fair.
          </p>
        </section>

        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">Buyback Terms</h2>
          <div className="space-y-5">
            <div className="border-l-4 border-[#B86B5A] pl-5">
              <h3 className="font-bold text-[#1A2536] mb-2">Within 15 Days of Purchase</h3>
              <p>Full refund at the original purchase price, no questions asked.</p>
            </div>
            
            <div className="border-l-4 border-[#B86B5A] pl-5">
              <h3 className="font-bold text-[#1A2536] mb-2">After 15 Days</h3>
              <p>Buyback at current gold and diamond market rates, minus making charges and GST.</p>
            </div>
            
            <div className="border-l-4 border-[#B86B5A] pl-5">
              <h3 className="font-bold text-[#1A2536] mb-2">Exchange for New Piece</h3>
              <p>Receive 100% of the current market value as credit toward any new YA-RA purchase.</p>
            </div>
          </div>
        </section>

        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">Conditions</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Original YA-RA certificate and invoice must be presented</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Piece must be in good condition with no major damage or alterations</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Normal wear and tear is acceptable</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Buyback value calculated based on current market rates on the date of return</span>
            </li>
          </ul>
        </section>

        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">How to Initiate a Buyback</h2>
          <ol className="space-y-3 list-decimal pl-6">
            <li>Contact us at <a href="mailto:buyback@yarajewels.com" className="text-[#B86B5A] font-bold hover:underline">buyback@yarajewels.com</a> or visit our showroom</li>
            <li>Provide your order number and original certificate</li>
            <li>Receive a preliminary valuation within 24 hours</li>
            <li>Ship the piece to us (insured shipping provided) or bring it to our showroom</li>
            <li>Receive payment or credit within 3 business days of authentication</li>
          </ol>
        </section>

        <div className="text-center pt-4">
          <Link href="/contact" className="inline-block px-8 py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl">
            Start Buyback Process
          </Link>
        </div>
      </div>
    </div>
  );
}