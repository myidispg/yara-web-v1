import { Link } from "react-router-dom";
import { useState } from "react";

export default function Footer() {
    const [email, setEmail] = useState("");
    const [done, setDone] = useState(false);

    return (
        <footer className="border-t border-line mt-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
                <div>
                    <p className="font-serif text-2xl tracking-[0.3em] mb-3">YA-RA</p>
                    <p className="micro-label text-charcoal/50 mb-4">Natural Diamond Fine Jewellery</p>
                    <p className="text-xs text-charcoal/60 leading-relaxed">
                        Handcrafted everyday fine jewellery in certified natural diamonds, 14Kt and 18Kt solid gold.
                    </p>
                </div>

                <div>
                    <h5 className="micro-label text-gold-dark mb-4">Contact</h5>
                    <ul className="space-y-3 text-sm text-charcoal/70">
                        <li><Link className="hover:text-gold-dark" to="/category/rings">Contact Us</Link></li>
                        <li><Link className="hover:text-gold-dark" to="/category/earrings">Our Showroom</Link></li>
                        <li><Link className="hover:text-gold-dark" to="/category/color-stone">yarajewels@gmail.com</Link></li>
                    </ul>
                </div>

                <div>
                    <h5 className="micro-label text-gold-dark mb-4">Explore</h5>
                    <ul className="space-y-3 text-sm text-charcoal/70">
                        <li><Link className="hover:text-gold-dark" to="/policies">About Us</Link></li>
                        <li><Link className="hover:text-gold-dark" to="/policies">Buyback and Exchange Policy</Link></li>
                        <li><Link className="hover:text-gold-dark" to="/policies">Privacy Policy</Link></li>
                    </ul>
                </div>
                <div>
                    <h5 className="micro-label text-gold-dark mb-4">Information</h5>
                    <ul className="space-y-3 text-sm text-charcoal/70">
                        <li><Link className="hover:text-gold-dark" to="/policies">Diamond Certification (SGL/IGI/GIA)</Link></li>
                        <li><Link className="hover:text-gold-dark" to="/policies">Size Guide</Link></li>
                        <li><Link className="hover:text-gold-dark" to="/policies">Tips and Tricks</Link></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-line">
                <p className="max-w-7xl mx-auto px-6 lg:px-10 py-6 text-[11px] text-charcoal/50">
                    © 2026 YA-RA® Fine Jewellery Pvt. Ltd. All Rights Reserved. Prices in INR (₹).
                </p>
            </div>
        </footer>
    );
}