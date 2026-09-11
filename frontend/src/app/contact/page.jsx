import Link from "next/link";
import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: "Contact Us | YA-RA Jewels",
  description: 'Get in touch with YA-RA Jewels. Visit our showroom, email us, or call for personalized jewellery consultations.',
});

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <p className="text-xs text-[#1A2536]/50 mb-6">
        <Link href="/" className="hover:text-[#B86B5A]">Home</Link> / Contact Us
      </p>

      {/* Header */}
      <div className="mb-10">
        <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">Get in touch</span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">We'd Love To Hear From You</h1>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left: Contact Info */}
        <div className="space-y-6">
          <p className="text-sm text-[#1A2536]/70 leading-relaxed max-w-lg">
            Whether you have a question about our collection, need help with a custom order, 
            or want to schedule a showroom visit, our concierge team is here to assist you.
          </p>
          
          <div className="space-y-4">
            {/* Phone */}
            <div className="glass-card-vibrant rounded-2xl border border-[#E5BDB0] p-5 flex items-start gap-4">
              <span className="w-12 h-12 rounded-full bg-[#1A2536] flex items-center justify-center text-[#E5BDB0] shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </span>
              <div>
                <h4 className="font-bold text-sm text-[#1A2536] mb-1">Phone / WhatsApp</h4>
                <a href="tel:+919876543210" className="text-sm text-[#1A2536]/70 hover:text-[#B86B5A] font-semibold">+91 98765 43210</a>
                <p className="text-[10px] text-[#1A2536]/50 mt-1 font-semibold uppercase tracking-wider">Mon-Sat: 10am - 7pm IST</p>
              </div>
            </div>

            {/* Email */}
            <div className="glass-card-vibrant rounded-2xl border border-[#E5BDB0] p-5 flex items-start gap-4">
              <span className="w-12 h-12 rounded-full bg-[#1A2536] flex items-center justify-center text-[#E5BDB0] shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <div>
                <h4 className="font-bold text-sm text-[#1A2536] mb-1">Email Concierge</h4>
                <a href="mailto:yarajewels@gmail.com" className="text-sm text-[#1A2536]/70 hover:text-[#B86B5A] font-semibold">yarajewels@gmail.com</a>
                <p className="text-[10px] text-[#1A2536]/50 mt-1 font-semibold uppercase tracking-wider">We respond within 24 hours</p>
              </div>
            </div>

            {/* Showroom */}
            <div className="glass-card-vibrant rounded-2xl border border-[#E5BDB0] p-5 flex items-start gap-4">
              <span className="w-12 h-12 rounded-full bg-[#1A2536] flex items-center justify-center text-[#E5BDB0] shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              <div>
                <h4 className="font-bold text-sm text-[#1A2536] mb-1">Flagship Showroom</h4>
                <p className="text-sm text-[#1A2536]/70">
                  C-Scheme, Ashok Marg<br />
                  Jaipur, Rajasthan 302001
                </p>
                <Link href="/showroom" className="text-xs text-[#B86B5A] font-bold hover:underline mt-2 inline-block uppercase tracking-wider">
                  View directions →
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right: Contact Form */}
        <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-6">Send Us A Message</h3>
          <form className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-1.5">First Name</label>
                <input type="text" className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-1.5">Last Name</label>
                <input type="text" className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536]" />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-1.5">Email</label>
              <input type="email" className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536]" />
            </div>
            
            <div>
              <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-1.5">Subject</label>
              <select className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536] bg-white">
                <option>General Enquiry</option>
                <option>Custom Order</option>
                <option>Order Support</option>
                <option>Showroom Visit</option>
              </select>
            </div>
            
            <div>
              <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-1.5">Message</label>
              <textarea rows="4" className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536] resize-none"></textarea>
            </div>
            
            <button type="submit" className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}