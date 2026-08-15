import Link from "next/link";

export const metadata = {
  title: "Contact Us | YA-RA Jewels",
  description: "Get in touch with YA-RA for enquiries, custom orders, or support.",
};

export default function ContactPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-12">
      <p className="text-xs uppercase tracking-[0.16em] text-ink/50 mb-4">
        <Link href="/" className="hover:text-gold-dark">Home</Link> / Contact Us
      </p>
      <h1 className="font-serif text-4xl md:text-5xl mb-6">Get In Touch</h1>
      
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h3 className="font-serif text-2xl mb-4">We'd Love To Hear From You</h3>
            <p className="text-ink/70 leading-relaxed">
              Whether you have a question about our collection, need help with a custom order, 
              or want to schedule a showroom visit, our team is here to assist you.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="w-10 h-10 rounded-full bg-ink flex items-center justify-center text-gold-dark shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </span>
              <div>
                <h4 className="font-semibold text-ink mb-1">Phone</h4>
                <a href="tel:+919876543210" className="text-ink/70 hover:text-gold-dark">+91 98765 43210</a>
                <p className="text-xs text-ink/50 mt-1">Mon-Sat: 10am - 7pm IST</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <span className="w-10 h-10 rounded-full bg-ink flex items-center justify-center text-gold-dark shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <div>
                <h4 className="font-semibold text-ink mb-1">Email</h4>
                <a href="mailto:yarajewels@gmail.com" className="text-ink/70 hover:text-gold-dark">yarajewels@gmail.com</a>
                <p className="text-xs text-ink/50 mt-1">We respond within 24 hours</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <span className="w-10 h-10 rounded-full bg-ink flex items-center justify-center text-gold-dark shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              <div>
                <h4 className="font-semibold text-ink mb-1">Showroom</h4>
                <p className="text-ink/70">
                  C-Scheme, Ashok Marg<br />
                  Jaipur, Rajasthan 302001
                </p>
                <Link href="/showroom" className="text-xs text-gold-dark hover:text-ink mt-2 inline-block">
                  View directions →
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-line shadow-card p-8">
          <h3 className="font-serif text-2xl mb-6">Send Us A Message</h3>
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">First Name</label>
                <input type="text" className="w-full border-b border-line py-2 focus:outline-none focus:border-gold-dark" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Last Name</label>
                <input type="text" className="w-full border-b border-line py-2 focus:outline-none focus:border-gold-dark" />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Email</label>
              <input type="email" className="w-full border-b border-line py-2 focus:outline-none focus:border-gold-dark" />
            </div>
            
            <div>
              <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Subject</label>
              <select className="w-full border-b border-line py-2 focus:outline-none focus:border-gold-dark">
                <option>General Enquiry</option>
                <option>Custom Order</option>
                <option>Order Support</option>
                <option>Showroom Visit</option>
              </select>
            </div>
            
            <div>
              <label className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-2">Message</label>
              <textarea rows="4" className="w-full border-b border-line py-2 focus:outline-none focus:border-gold-dark resize-none"></textarea>
            </div>
            
            <button type="submit" className="btn-solid w-full">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}