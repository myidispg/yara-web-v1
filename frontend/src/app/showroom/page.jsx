import Link from "next/link";

export const metadata = {
  title: "Visit Our Showroom | YA-RA Jewels",
  description: "Experience our collection in person at our Jaipur flagship store.",
};

export default function ShowroomPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <p className="text-xs text-[#1A2536]/50 mb-6">
        <Link href="/" className="hover:text-[#B86B5A]">Home</Link> / Visit Our Showroom
      </p>

      {/* Header */}
      <div className="mb-10">
        <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">experience in person</span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Visit Our Showroom</h1>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <div className="bg-[#1A2536] rounded-3xl p-8 text-white shadow-2xl">
            <h3 className="font-serif-luxury text-2xl text-white font-semibold mb-6">YA-RA's Store</h3>
            <div className="space-y-5 text-white/80">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#E5BDB0] font-bold mb-2">Address</p>
                <p>UGF-27, AVA Court Market, Near Park Hospital<br />Sector 47, Gurugram, Haryana - 122017</p>
              </div>
              
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#E5BDB0] font-bold mb-2">Hours</p>
                <p>Wednesday - Monday: 11:00 AM - 8:15 PM<br />Tuesday: Closed</p>
              </div>
              
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#E5BDB0] font-bold mb-2">Contact</p>
                <p>Phone: <a href="tel:+919953105105" className="text-[#E5BDB0] hover:text-white font-semibold">+91 9953105105</a>, 
                <a href="tel:+919643105105" className="text-[#E5BDB0] hover:text-white font-semibold">+91 9643105105</a>, 
                <a href="tel:+917838105105" className="text-[#E5BDB0] hover:text-white font-semibold">+91 7838105105</a>
                <br />
                Email: <a href="mailto:yarajewels@gmail.com" className="text-[#E5BDB0] hover:text-white font-semibold">yarajewels@gmail.com</a></p>
              </div>
            </div>
          </div>
          
          <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-8">
            <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">What To Expect</h3>
            <ul className="space-y-3 text-[#1A2536]/70">
              <li className="flex items-start gap-3">
                <span className="text-[#B86B5A] mt-1">◆</span>
                <span>Personal consultation with our jewellery experts</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#B86B5A] mt-1">◆</span>
                <span>Try on our entire collection in a private setting</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#B86B5A] mt-1">◆</span>
                <span>Custom design consultations for bespoke pieces</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border-2 border-[#E5BDB0]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7017.952041973732!2d77.0475486!3d28.419980400000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d2301843b58d3%3A0x882ddbdc69a76cdd!2sYA-RA%20Jewellery!5e0!3m2!1sen!2sin!4v1788347232967!5m2!1sen!2sin"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
              title="YA-RA Showroom Location"
            />
          </div>
          
          <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-8">
            <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">Schedule A Visit</h3>
            <p className="text-[#1A2536]/70 mb-6">
              Book a private appointment for a personalized shopping experience. 
              Our experts will dedicate their time to help you find the perfect piece.
            </p>
            <Link href="/contact" className="inline-block px-8 py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl">
              Book Appointment →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}