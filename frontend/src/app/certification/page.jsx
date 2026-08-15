import Link from "next/link";

export const metadata = {
  title: "Diamond Certification | YA-RA Jewels",
  description: "Learn about IGI, GIA, and SGL certification for YA-RA diamonds.",
};

export default function CertificationPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 lg:px-20 py-12">
      <p className="text-xs uppercase tracking-[0.16em] text-ink/50 mb-4">
        <Link href="/" className="hover:text-gold-dark">Home</Link> / Diamond Certification
      </p>
      <h1 className="font-serif text-4xl md:text-5xl mb-6">Diamond Certification</h1>
      
      <div className="space-y-8 text-ink/70">
        <div className="bg-ink rounded-2xl p-8 text-white">
          <h2 className="font-serif text-2xl mb-3">100% Certified Natural Diamonds</h2>
          <p className="leading-relaxed text-white/80">
            Every YA-RA diamond is certified by world-renowned gemological laboratories. 
            We never sell lab-grown, synthetic, or uncertified diamonds. Your certificate 
            guarantees the diamond's natural origin and quality characteristics.
          </p>
        </div>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-4">Our Certification Partners</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-line p-6">
              <h3 className="font-serif text-xl mb-3">IGI</h3>
              <p className="text-sm mb-4">International Gemological Institute</p>
              <p className="text-xs text-ink/60">
                One of the world's largest independent diamond grading laboratories, 
                known for consistent and reliable grading.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl border border-line p-6">
              <h3 className="font-serif text-xl mb-3">GIA</h3>
              <p className="text-sm mb-4">Gemological Institute of America</p>
              <p className="text-xs text-ink/60">
                The world's foremost authority on diamonds, creator of the 4Cs 
                grading system used globally.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl border border-line p-6">
              <h3 className="font-serif text-xl mb-3">SGL</h3>
              <p className="text-sm mb-4">Solitaire Gemmological Laboratory</p>
              <p className="text-xs text-ink/60">
                India's leading diamond certification laboratory, providing 
                accurate and detailed grading reports.
              </p>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-3">What Your Certificate Includes</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-gold-dark mt-1">◆</span>
              <span><strong>4Cs Analysis:</strong> Detailed carat weight, cut grade, color grade, and clarity grade</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold-dark mt-1">◆</span>
              <span><strong>Measurements:</strong> Precise dimensions and proportions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold-dark mt-1">◆</span>
              <span><strong>Fluorescence:</strong> Presence and intensity of fluorescence</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold-dark mt-1">◆</span>
              <span><strong>Inclusion Plot:</strong> Map of internal characteristics (for stones above 0.30 Ct)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold-dark mt-1">◆</span>
              <span><strong>Security Features:</strong> Laser inscription, holograms, and unique certificate number</span>
            </li>
          </ul>
        </section>
        
        <section>
          <h2 className="font-serif text-2xl text-ink mb-3">Verify Your Certificate</h2>
          <p className="mb-4">
            You can verify any YA-RA diamond certificate online using the unique certificate 
            number found on your documentation and laser-inscribed on the diamond's girdle.
          </p>
          <Link href="/contact" className="btn-outline inline-block">
            Request Certificate Verification →
          </Link>
        </section>
      </div>
    </div>
  );
}