import Link from "next/link";

export const metadata = {
  title: "Our Showroom | YA-RA Jewels",
  description: "Visit our flagship showroom in Jaipur to experience YA-RA jewellery in person.",
};

export default function ShowroomPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-8 lg:px-20 py-12">
      <p className="text-xs uppercase tracking-[0.16em] text-ink/50 mb-4">
        <Link href="/" className="hover:text-gold-dark">Home</Link> / Our Showroom
      </p>
      <h1 className="font-serif text-4xl md:text-5xl mb-6">Visit Our Showroom</h1>
      
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <div className="bg-ink rounded-2xl p-8 text-white">
            <h3 className="font-serif text-2xl mb-4">YA-RA Flagship Store</h3>
            <div className="space-y-4 text-white/80">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold mb-2">Address</p>
                <p>C-Scheme, Ashok Marg<br />Jaipur, Rajasthan 302001</p>
              </div>
              
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold mb-2">Hours</p>
                <p>Monday - Saturday: 10:00 AM - 7:00 PM<br />Sunday: Closed</p>
              </div>
              
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-gold-dark font-semibold mb-2">Contact</p>
                <p>Phone: <a href="tel:+919876543210" className="text-gold hover:text-white">+91 98765 43210</a><br />
                Email: <a href="mailto:showroom@yarajewels.com" className="text-gold hover:text-white">showroom@yarajewels.com</a></p>
              </div>
            </div>
          </div>
          
          <div className="bg-cream rounded-2xl p-8">
            <h3 className="font-serif text-2xl mb-4">What To Expect</h3>
            <ul className="space-y-3 text-ink/70">
              <li className="flex items-start gap-3">
                <span className="text-gold-dark mt-1">◆</span>
                <span>Personal consultation with our jewellery experts</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold-dark mt-1">◆</span>
                <span>Try on our entire collection in a private setting</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold-dark mt-1">◆</span>
                <span>Custom design consultations for bespoke pieces</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold-dark mt-1">◆</span>
                <span>Complimentary jewellery cleaning and inspection</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="aspect-video rounded-2xl overflow-hidden shadow-hero">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.123456789!2d75.789!3d26.912!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDU0JzQzLjIiTiA3NcKwNDcnMjAuNCJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
              title="YA-RA Showroom Location"
            />
          </div>
          
          <div className="bg-white rounded-2xl border border-line p-8">
            <h3 className="font-serif text-2xl mb-4">Schedule A Visit</h3>
            <p className="text-ink/70 mb-6">
              Book a private appointment for a personalized shopping experience. 
              Our experts will dedicate their time to help you find the perfect piece.
            </p>
            <Link href="/contact" className="btn-solid inline-block">
              Book Appointment →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}