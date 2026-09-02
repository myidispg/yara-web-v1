import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#1A2536] text-white pt-16 pb-12 border-t-2 border-[#D4AF37]/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-[1.5fr_0.85fr_0.85fr_0.8fr] gap-6 md:gap-8">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        {/* Logo and divider wrapped together */}
                        <div className="inline-block">
                            <div className="flex items-center gap-2">
                                <span className="font-serif-luxury text-3xl tracking-widest font-normal text-white">
                                    YA<span className="text-[#B86B5A]">-</span>RA
                                </span>
                                <span className="text-[9px] font-sans border border-white/40 rounded-full w-3.5 h-3.5 flex items-center justify-center text-white -mt-3">®</span>
                            </div>
                            {/* Diamond Divider - now constrained to logo width */}
                            <div className="flex items-center gap-3 mt-1">
                                <span className="h-[1.5px] bg-gradient-to-r from-transparent via-[#E5BDB0] to-[#E5BDB0] flex-1"></span>
                                <div className="relative w-4 h-4 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
                                        <path d="M12 2L3 9L12 22L21 9L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="#E5BDB0" fillOpacity="0.7"/>
                                        <path d="M12 2V22M3 9H21M7.5 5.5L12 9L16.5 5.5" stroke="currentColor" strokeWidth="1.2"/>
                                    </svg>
                                </div>
                                <span className="h-[1.5px] bg-gradient-to-r from-[#E5BDB0] via-[#E5BDB0] to-transparent flex-1"></span>
                            </div>
                        </div>
                        <p className="font-cursive text-2xl text-[#E5BDB0]">fine natural diamond jewellery</p>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            Handcrafted everyday fine jewellery in certified natural diamonds, 14Kt and 18Kt solid gold.
                        </p>
                    </div>

                    {/* Contact Column */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-[#D4AF37]">Contact</h4>
                        <ul className="space-y-2.5 text-sm text-gray-300">
                            <li>
                                <Link className="hover:text-white transition-colors" href="/contact">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link className="hover:text-white transition-colors" href="/showroom">
                                    Our Showroom
                                </Link>
                            </li>
                            <li>
                                <a className="hover:text-white transition-colors" href="mailto:yarajewels@gmail.com">
                                    yarajewels@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Explore Column */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-[#D4AF37]">Explore</h4>
                        <ul className="space-y-2.5 text-sm text-gray-300">
                            <li>
                                <Link className="hover:text-white transition-colors" href="/about">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link className="hover:text-white transition-colors" href="/buyback">
                                    Buyback and Exchange Policy
                                </Link>
                            </li>
                            <li>
                                <Link className="hover:text-white transition-colors" href="/privacy">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Information Column */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-[#D4AF37]">Information</h4>
                        <ul className="space-y-2.5 text-sm text-gray-300">
                            <li>
                                <Link className="hover:text-white transition-colors" href="/certification">
                                    Diamond Certification (SGL/IGI/GIA)
                                </Link>
                            </li>
                            <li>
                                <Link className="hover:text-white transition-colors" href="/size-guide">
                                    Size Guide
                                </Link>
                            </li>
                            <li>
                                <Link className="hover:text-white transition-colors" href="/tips">
                                    Tips and Tricks
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-400 gap-4">
                    <p>© 2026 YA-RA® Fine Jewellery Pvt. Ltd. All Rights Reserved. Prices in INR (₹).</p>
                </div>
            </div>
        </footer>
    );
}