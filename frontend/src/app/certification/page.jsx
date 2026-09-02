import Link from "next/link";

export const metadata = {
  title: "Diamond Certification | YA-RA Jewels",
  description: "Learn about our certification partners IGI, GIA, and SGL.",
};

export default function CertificationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <p className="text-xs text-[#1A2536]/50 mb-6">
        <Link href="/" className="hover:text-[#B86B5A]">Home</Link> / <Link href="/policies" className="hover:text-[#B86B5A]">Policies</Link> / Diamond Certification
      </p>

      {/* Header */}
      <div className="mb-10">
        <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">guaranteed authenticity</span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Diamond Certification</h1>
      </div>

      <div className="space-y-8 text-[#1A2536]/70 leading-relaxed">
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <p className="text-lg font-serif-luxury text-[#1A2536]">
            Every YA-RA diamond is 100% natural, earth-mined, and certified by the world's most respected gemological laboratories.
          </p>
        </section>

        <section>
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-6">Our Certification Partners</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
              <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">IGI</h3>
              <p className="text-sm font-bold text-[#B86B5A] mb-4">International Gemological Institute</p>
              <p className="text-xs text-[#1A2536]/60">
                One of the world's largest independent diamond grading laboratories, 
                known for consistent and reliable grading.
              </p>
            </div>
            
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
              <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">GIA</h3>
              <p className="text-sm font-bold text-[#B86B5A] mb-4">Gemological Institute of America</p>
              <p className="text-xs text-[#1A2536]/60">
                The world's foremost authority on diamonds, creator of the 4Cs 
                grading system used globally.
              </p>
            </div>
            
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
              <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">SGL</h3>
              <p className="text-sm font-bold text-[#B86B5A] mb-4">Solitaire Gemmological Laboratory</p>
              <p className="text-xs text-[#1A2536]/60">
                India's leading diamond certification laboratory, providing 
                accurate and detailed grading reports.
              </p>
            </div>
          </div>
        </section>

        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">What Your Certificate Includes</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span><strong className="text-[#1A2536]">4Cs Analysis:</strong> Detailed carat weight, cut grade, color grade, and clarity grade</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span><strong className="text-[#1A2536]">Measurements:</strong> Precise dimensions and proportions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span><strong className="text-[#1A2536]">Fluorescence:</strong> Presence and intensity of fluorescence</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span><strong className="text-[#1A2536]">Inclusion Plot:</strong> Map of internal characteristics (for stones above 0.30 Ct)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] mt-1">◆</span>
              <span><strong className="text-[#1A2536]">Security Features:</strong> Laser inscription, holograms, and unique certificate number</span>
            </li>
          </ul>
        </section>
        
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">Verify Your Certificate</h2>
          <p className="mb-4">
            You can verify any YA-RA diamond certificate online using the unique certificate 
            number found on your documentation and laser-inscribed on the diamond's girdle.
          </p>
          <Link href="/contact" className="inline-block px-8 py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl">
            Request Certificate Verification →
          </Link>
        </section>
      </div>
    </div>
  );
}