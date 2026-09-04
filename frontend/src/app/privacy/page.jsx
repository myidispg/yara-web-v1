import Link from "next/link";
import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: "Privacy Policy | YA-RA Jewels",
  description: "How we collect, use, and protect your personal information.",
});

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <p className="text-xs text-[#1A2536]/50 mb-6">
        <Link href="/" className="hover:text-[#B86B5A]">Home</Link> / <Link href="/policies" className="hover:text-[#B86B5A]">Policies</Link> / Privacy Policy
      </p>

      {/* Header */}
      <div className="mb-10">
        <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">your data, protected</span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Privacy Policy</h1>
      </div>

      <div className="space-y-8 text-[#1A2536]/70 leading-relaxed">
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">1. Information We Collect</h2>
          <p className="mb-4">We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Name, email address, phone number, and shipping address</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Payment information (processed securely through our payment partners)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Order history and preferences</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Communications with our customer service team</span>
            </li>
          </ul>
        </section>

        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">2. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Process and fulfill your orders</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Send order confirmations and shipping updates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Provide customer support and respond to inquiries</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Send marketing communications (with your consent)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Improve our products and services</span>
            </li>
          </ul>
        </section>

        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">3. Information Sharing</h2>
          <p className="mb-4">We do not sell your personal information. We share information only with:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Service providers who assist in our operations (shipping, payment processing)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Professional advisors (lawyers, accountants)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Law enforcement when required by law</span>
            </li>
          </ul>
        </section>

        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">4. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure.</p>
        </section>

        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">5. Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Access your personal information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Correct inaccurate data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Request deletion of your data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span>Opt-out of marketing communications</span>
            </li>
          </ul>
        </section>

        <div className="text-center pt-4">
          <Link href="/contact" className="inline-block px-8 py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl">
            Contact Us About Privacy
          </Link>
        </div>
      </div>
    </div>
  );
}