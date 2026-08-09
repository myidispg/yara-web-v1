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
                    <h5 className="micro-label text-gold-dark mb-4">Categories</h5>
                    <ul className="space-y-3 text-sm text-charcoal/70">
                        <li><Link className="hover:text-gold-dark" to="/category/rings">Natural Diamond Rings</Link></li>
                        <li><Link className="hover:text-gold-dark" to="/category/earrings">Diamond Stud Earrings</Link></li>
                        <li><Link className="hover:text-gold-dark" to="/category/color-stone">Color Stone Fine Edit</Link></li>
                    </ul>
                </div>

                <div>
                    <h5 className="micro-label text-gold-dark mb-4">Customer Care</h5>
                    <ul className="space-y-3 text-sm text-charcoal/70">
                        <li><Link className="hover:text-gold-dark" to="/policies">15-Day Money Back</Link></li>
                        <li><Link className="hover:text-gold-dark" to="/policies">Lifetime Exchange Policy</Link></li>
                        <li><Link className="hover:text-gold-dark" to="/policies">Diamond Certification (IGI/GIA)</Link></li>
                    </ul>
                </div>

                <div>
                    <h5 className="micro-label text-gold-dark mb-4">Newsletter</h5>
                    <p className="text-xs text-charcoal/60 mb-4">Subscribe for early access to new launches.</p>
                    {done ? (
                        <p className="text-xs text-gold-dark">✓ Thank you for subscribing.</p>
                    ) : (
                        <form
                            className="flex"
                            onSubmit={(e) => { e.preventDefault(); setDone(true); }}
                        >
                            <input
                                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="flex-1 min-w-0 border border-line px-3 py-3 text-xs focus:outline-none focus:border-gold-dark"
                            />
                            <button className="bg-charcoal text-white micro-label px-5 hover:bg-gold-dark transition-colors">
                                Join
                            </button>
                        </form>
                    )}
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