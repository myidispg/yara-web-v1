import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | YA-RA Jewels",
  description: "YA-RA's privacy policy and data protection practices.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 lg:px-20 py-12">
      <p className="text-xs uppercase tracking-[0.16em] text-ink/50 mb-4">
        <Link href="/" className="hover:text-gold-dark">Home</Link> / Privacy Policy
      </p>
      <h1 className="font-serif text-4xl md:text-5xl mb-6">Privacy Policy</h1>
      <p className="text-sm text-ink/50 mb-8">Last updated: August 15, 2026</p>
      
      <div className="prose prose-sm max-w-none text-ink/70 space-y-6">
        <section>
          <h2 className="font-serif text-2xl text-ink mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Name, email address, phone number, and shipping address</li>
            <li>Payment information (processed securely through our payment partners)</li>
            <li>Order history and preferences</li>
            <li>Communications with our customer service team</li>
          </ul>
        </section>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-3">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Process and fulfill your orders</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Provide customer support and respond to inquiries</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Improve our products and services</li>
          </ul>
        </section>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-3">3. Information Sharing</h2>
          <p>We do not sell your personal information. We share information only with:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Service providers who assist in our operations (shipping, payment processing)</li>
            <li>Professional advisors (lawyers, accountants)</li>
            <li>Law enforcement when required by law</li>
          </ul>
        </section>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-3">4. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure.</p>
        </section>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-3">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-3">6. Contact Us</h2>
          <p>If you have questions about this privacy policy, please contact us at:</p>
          <p className="mt-2"><a href="mailto:privacy@yarajewels.com" className="text-gold-dark hover:text-ink">privacy@yarajewels.com</a></p>
        </section>
      </div>
    </div>
  );
}