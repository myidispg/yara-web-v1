import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="relative overflow-hidden bg-pine text-ivory">
            <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-12 lg:px-8">
                <div className="md:col-span-5">
                    <p className="font-display text-2xl tracking-[0.3em]">YA-RA<span className="ml-1 text-gold">◆</span></p>
                    <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/60">
                        Natural, earth-mined diamonds — cut, certified and hand-set in our Jaipur atelier.
                        Every piece ships with its IGI certificate and BIS 916 hallmark.
                    </p>
                    <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-gold-light">Mumbai · Delhi · Bengaluru · Jaipur</p>
                </div>

                <div className="md:col-span-2">
                    <p className="eyebrow !text-gold-light">Collections</p>
                    {["Rings", "Earrings", "Pendants", "Bracelets", "Chains"].map((c) => (
                        <Link key={c} to={`/category/${c.toLowerCase()}`} className="mt-3 block text-sm text-ivory/70 transition hover:text-gold-light">{c}</Link>
                    ))}
                </div>

                <div className="md:col-span-2">
                    <p className="eyebrow !text-gold-light">House</p>
                    {["Our atelier", "Certification", "Ring size guide", "Care & repair", "Bespoke"].map((t) => (
                        <a key={t} href="#" className="mt-3 block text-sm text-ivory/70 transition hover:text-gold-light">{t}</a>
                    ))}
                </div>

                <div className="md:col-span-3">
                    <p className="eyebrow !text-gold-light">Client care</p>
                    <p className="mt-3 text-sm text-ivory/70">care@yara.in<br />+91 98200 00000<br />Mon–Sat · 10:00–19:00 IST</p>
                    <p className="mt-5 text-[11px] uppercase tracking-[0.25em] text-ivory/50">UPI · Cards · EMI · Cash on Delivery</p>
                </div>
            </div>

            <p aria-hidden="true" className="pointer-events-none select-none px-2 text-center font-display text-[19vw] leading-[0.75] tracking-[0.12em] text-ivory/5">YA-RA</p>

            <div className="border-t border-ivory/10 px-5 py-5 text-center text-[11px] uppercase tracking-[0.25em] text-ivory/40">
                © 2026 YA-RA Jewels Pvt Ltd · BIS Hallmarked · IGI Certified · Made in India
            </div>
        </footer>
    );
}