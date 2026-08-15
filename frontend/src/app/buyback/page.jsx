import Link from "next/link";

export const metadata = {
  title: "Buyback & Exchange Policy | YA-RA Jewels",
  description: "Learn about YA-RA's lifetime buyback and exchange program.",
};

export default function BuybackPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 lg:px-20 py-12">
      <p className="text-xs uppercase tracking-[0.16em] text-ink/50 mb-4">
        <Link href="/" className="hover:text-gold-dark">Home</Link> / Buyback & Exchange Policy
      </p>
      <h1 className="font-serif text-4xl md:text-5xl mb-6">Lifetime Buyback & Exchange</h1>
      
      <div className="space-y-8 text-ink/70">
        <div className="bg-gold/10 border border-gold/30 rounded-2xl p-8">
          <h2 className="font-serif text-2xl text-ink mb-3">Our Promise To You</h2>
          <p className="leading-relaxed">
            Every YA-RA piece comes with our <strong>Lifetime Buyback Guarantee</strong>. 
            Whether you want to upgrade, exchange, or simply return your jewellery, we're here 
            to make the process seamless and fair.
          </p>
        </div>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-3">Buyback Terms</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-gold-dark pl-4">
              <h3 className="font-semibold text-ink mb-2">Within 15 Days of Purchase</h3>
              <p>Full refund at the original purchase price, no questions asked.</p>
            </div>
            
            <div className="border-l-4 border-gold-dark pl-4">
              <h3 className="font-semibold text-ink mb-2">After 15 Days</h3>
              <p>Buyback at current gold and diamond market rates, minus making charges and GST.</p>
            </div>
            
            <div className="border-l-4 border-gold-dark pl-4">
              <h3 className="font-semibold text-ink mb-2">Exchange for New Piece</h3>
              <p>Receive 100% of the current market value as credit toward any new YA-RA purchase.</p>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-3">Conditions</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-gold-dark mt-1">◆</span>
              <span>Original YA-RA certificate and invoice must be presented</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold-dark mt-1">◆</span>
              <span>Piece must be in good condition with no major damage or alterations</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold-dark mt-1">◆</span>
              <span>Normal wear and tear is acceptable</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold-dark mt-1">◆</span>
              <span>Buyback value calculated based on current market rates on the date of return</span>
            </li>
          </ul>
        </section>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-3">How to Initiate a Buyback</h2>
          <ol className="space-y-3 list-decimal pl-6">
            <li>Contact us at <a href="mailto:buyback@yarajewels.com" className="text-gold-dark hover:text-ink">buyback@yarajewels.com</a> or visit our showroom</li>
            <li>Provide your order number and original certificate</li>
            <li>Receive a preliminary valuation within 24 hours</li>
            <li>Ship the piece to us (insured shipping provided) or bring it to our showroom</li>
            <li>Receive payment or credit within 3 business days of authentication</li>
          </ol>
        </section>
        
        <div className="bg-cream rounded-2xl p-8 text-center">
          <h3 className="font-serif text-2xl mb-4">Ready to Upgrade?</h3>
          <p className="mb-6">Our team is here to help you through every step of the process.</p>
          <Link href="/contact" className="btn-solid inline-block">Contact Us →</Link>
        </div>
      </div>
    </div>
  );
}