import Link from "next/link";
import { FaGem, FaShieldAlt, FaRecycle, FaMapMarkerAlt, FaPhone, FaClock, FaStar, FaCertificate, FaTruck } from "react-icons/fa";

export const metadata = {
    title: "About Us | YA-RA Jewellery",
    description: "Learn about YA-RA's commitment to certified natural diamonds, hallmarked solid gold, and everyday luxury jewellery.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section with gradient */}
            <section className="relative bg-gradient-to-br from-[#1A2536] via-[#223046] to-[#1A2536] text-white py-16 md:py-24">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-[#D4AF37] rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#E5BDB0] rounded-full blur-3xl"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="font-cursive text-4xl sm:text-5xl text-[#E5BDB0] block mb-4">our story</span>
                    <h1 className="font-serif-luxury text-5xl sm:text-6xl lg:text-7xl font-normal text-white mb-6">
                        About YA-RA®
                    </h1>
                    <p className="text-lg sm:text-xl text-white max-w-3xl mx-auto leading-relaxed">
                        Where certified natural diamonds meet everyday luxury
                    </p>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-12 md:py-20 bg-gradient-to-b from-[#FBF7F2]/30 to-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="font-cursive text-3xl text-[#B86B5A] block mb-2">the beginning</span>
                        <h2 className="font-serif-luxury text-4xl sm:text-5xl font-normal text-[#1A2536]">
                            Our Story
                        </h2>
                    </div>

                    <div className="space-y-6 text-lg leading-relaxed text-[#1A2536]/80">
                        <p>
                            YA-RA® Fine Jewellery was founded on a simple belief: every woman deserves to wear
                            certified natural diamonds in solid gold, every single day.
                        </p>

                        <p>
                            We reject the notion that fine jewellery should sit in a vault, reserved only for
                            special occasions. Our pieces are designed to be worn, loved, and passed down —
                            crafted with the same care and quality as heirloom pieces, but with modern silhouettes
                            that fit seamlessly into your everyday life.
                        </p>

                        <p>
                            Every YA-RA diamond is 100% earth-mined and certified by renowned laboratories
                            (IGI, GIA, SGL). Every gold setting is BIS hallmarked in 14Kt or 18Kt solid gold.
                            No lab-grown diamonds. No gold plating. No compromises.
                        </p>

                        <p>
                            Experience our collection in person at our flagship showroom in Gurugram, or explore our curated
                            pieces online. Whether you visit us or shop from home, you'll discover jewellery that feels
                            both timeless and utterly modern — pieces you'll reach for daily and treasure forever.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section with colored cards */}
            <section className="py-12 md:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="font-cursive text-3xl text-[#B86B5A] block mb-2">by the numbers</span>
                        <h2 className="font-serif-luxury text-4xl sm:text-5xl font-normal text-[#1A2536]">
                            Our Impact
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {/* Stat 1: Customers */}
                        <div className="group relative bg-gradient-to-br from-[#B86B5A]/10 to-[#B86B5A]/5 rounded-3xl p-8 border-2 border-[#B86B5A]/20 hover:border-[#B86B5A] transition-all duration-500 hover:shadow-2xl">
                            <div className="absolute top-4 right-4 w-12 h-12 bg-[#B86B5A]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FaStar className="w-6 h-6 text-[#B86B5A]" />
                            </div>
                            <div className="text-5xl sm:text-6xl font-serif-luxury text-[#1A2536] mb-3">
                                4,000+
                            </div>
                            <div className="text-sm font-bold uppercase tracking-widest text-[#B86B5A]">
                                Happy Customers
                            </div>
                            <p className="text-xs text-[#1A2536]/60 mt-2">
                                Trusted by customers across India
                            </p>
                        </div>

                        {/* Stat 2: Certified Diamonds */}
                        <div className="group relative bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 rounded-3xl p-8 border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all duration-500 hover:shadow-2xl">
                            <div className="absolute top-4 right-4 w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FaCertificate className="w-6 h-6 text-[#D4AF37]" />
                            </div>
                            <div className="text-5xl sm:text-6xl font-serif-luxury text-[#1A2536] mb-3">
                                100%
                            </div>
                            <div className="text-sm font-bold uppercase tracking-widest text-[#D4AF37]">
                                Certified Natural
                            </div>
                            <p className="text-xs text-[#1A2536]/60 mt-2">
                                IGI, GIA & SGL certified diamonds
                            </p>
                        </div>

                        {/* Stat 3: BIS Hallmarked */}
                        <div className="group relative bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/5 rounded-3xl p-8 border-2 border-[#10B981]/20 hover:border-[#10B981] transition-all duration-500 hover:shadow-2xl">
                            <div className="absolute top-4 right-4 w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FaShieldAlt className="w-6 h-6 text-[#10B981]" />
                            </div>
                            <div className="text-5xl sm:text-6xl font-serif-luxury text-[#1A2536] mb-3">
                                100%
                            </div>
                            <div className="text-sm font-bold uppercase tracking-widest text-[#10B981]">
                                BIS Hallmarked
                            </div>
                            <p className="text-xs text-[#1A2536]/60 mt-2">
                                14Kt & 18Kt solid gold
                            </p>
                        </div>

                        {/* Stat 4: Lifetime Buyback */}
                        <div className="group relative bg-gradient-to-br from-[#1A2536]/10 to-[#1A2536]/5 rounded-3xl p-8 border-2 border-[#1A2536]/20 hover:border-[#1A2536] transition-all duration-500 hover:shadow-2xl">
                            <div className="absolute top-4 right-4 w-12 h-12 bg-[#1A2536]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FaRecycle className="w-6 h-6 text-[#1A2536]" />
                            </div>
                            <div className="text-5xl sm:text-6xl font-serif-luxury text-[#1A2536] mb-3">
                                ∞
                            </div>
                            <div className="text-sm font-bold uppercase tracking-widest text-[#1A2536]">
                                Lifetime Buyback
                            </div>
                            <p className="text-xs text-[#1A2536]/60 mt-2">
                                Upgrade or exchange anytime
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Promise Section */}
            <section className="py-12 md:py-20 bg-gradient-to-b from-[#FBF7F2] to-[#FBF7F2]/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="font-cursive text-3xl text-[#B86B5A] block mb-2">our commitment</span>
                        <h2 className="font-serif-luxury text-4xl sm:text-5xl font-normal text-[#1A2536]">
                            Our Promise
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Promise 1 */}
                        <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow border border-[#E5BDB0]/40">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#B86B5A] to-[#8B4A3A] rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <FaGem className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-2">
                                        100% Natural Diamonds
                                    </h3>
                                    <p className="text-[#1A2536]/70 leading-relaxed">
                                        Every stone is earth-mined and certified for origin and quality by renowned laboratories.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Promise 2 */}
                        <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow border border-[#E5BDB0]/40">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <FaGem className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-2">
                                        Solid Gold Only
                                    </h3>
                                    <p className="text-[#1A2536]/70 leading-relaxed">
                                        14Kt and 18Kt BIS hallmarked gold. Never plated or filled — only pure, solid gold.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Promise 3 */}
                        <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow border border-[#E5BDB0]/40">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <FaRecycle className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-2">
                                        Lifetime Buyback
                                    </h3>
                                    <p className="text-[#1A2536]/70 leading-relaxed">
                                        Upgrade or exchange your YA-RA pieces anytime, forever. Your jewellery grows with you.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Promise 4 */}
                        <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow border border-[#E5BDB0]/40">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#1A2536] to-[#111A29] rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <FaTruck className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-2">
                                        Pan-India Delivery
                                    </h3>
                                    <p className="text-[#1A2536]/70 leading-relaxed">
                                        Free insured shipping across India. Your luxury jewellery, delivered to your doorstep.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visit Our Showroom Section */}
            <section className="py-12 md:py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="font-cursive text-3xl text-[#B86B5A] block mb-2">experience in person</span>
                        <h2 className="font-serif-luxury text-4xl sm:text-5xl font-normal text-[#1A2536]">
                            Visit Our Showroom
                        </h2>
                    </div>

                    <div className="bg-gradient-to-br from-[#1A2536] via-[#223046] to-[#1A2536] rounded-[40px] overflow-hidden shadow-2xl">
                        <div className="grid md:grid-cols-2 gap-0">
                            {/* Store Info */}
                            <div className="p-8 sm:p-12 text-white">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="font-serif-luxury text-3xl sm:text-4xl mb-4">
                                            YA-RA Jewellery
                                        </h3>
                                        <p className="text-gray-300 leading-relaxed">
                                            Experience our collection in person at our flagship showroom in Gurugram.
                                            Our experts are here to help you find the perfect piece.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                <FaMapMarkerAlt className="w-5 h-5 text-[#D4AF37]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm uppercase tracking-wider text-[#D4AF37] mb-1">
                                                    Address
                                                </h4>
                                                <p className="text-gray-200">
                                                    UGF 27, AVA Court Market,<br />
                                                    Near Park Hospital, Sector 47,<br />
                                                    Gurugram, Haryana 122018
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-[#E5BDB0]/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                <FaPhone className="w-5 h-5 text-[#E5BDB0]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm uppercase tracking-wider text-[#E5BDB0] mb-1">
                                                    Phone
                                                </h4>
                                                <a href="tel:+919953105105" className="text-gray-200 hover:text-white transition-colors">
                                                    +91 99531 05105
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-[#10B981]/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                <FaClock className="w-5 h-5 text-[#10B981]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm uppercase tracking-wider text-[#10B981] mb-1">
                                                    Hours
                                                </h4>
                                                <p className="text-gray-200 text-sm leading-relaxed">
                                                    Monday, Wednesday, Thursday, Saturday, Sunday<br />
                                                    11:00 AM – 8:15 PM<br />
                                                    <span className="text-gray-400">Closed Tuesdays & Fridays</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Link
                                            href="/showroom"
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#E5BDB0] to-[#B86B5A] hover:opacity-95 text-[#1A2536] font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-xl"
                                        >
                                            Get Directions
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Map/Visual */}
                            <div className="relative min-h-[400px]">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28071.808167894927!2d77.00943977431636!3d28.419980400000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d2301843b58d3%3A0x882ddbdc69a76cdd!2sYA-RA%20Jewellery%20(Diamond%20Jewellery%20wholesaler%20and%20retailer)!5e0!3m2!1sen!2sin!4v1792117187036!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, position: 'absolute', inset: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    title="YA-RA Jewellery Showroom Location"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* CTA Section */}
            < section className="py-12 md:py-20 bg-gradient-to-br from-[#1A2536] via-[#223046] to-[#1A2536] text-white" >
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="font-cursive text-3xl text-[#E5BDB0] block mb-4">ready to explore?</span>
                    <h2 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-normal text-white mb-6">
                        Discover Your Perfect Piece
                    </h2>
                    <p className="text-lg text-gray-200 mb-10 max-w-2xl mx-auto">
                        Browse our curated collection of certified natural diamond jewellery in hallmarked solid gold.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/shop"
                            className="px-10 py-5 bg-gradient-to-r from-[#E5BDB0] to-[#B86B5A] hover:opacity-95 text-[#1A2536] font-bold text-sm uppercase tracking-widest rounded-full transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                            Shop Collection
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                        <Link
                            href="/contact"
                            className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-widest rounded-full transition-all border-2 border-white/30 flex items-center justify-center gap-2"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section >
        </div >
    );
}