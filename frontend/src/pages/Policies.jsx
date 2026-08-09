import usePageTitle from "../utils/usePageTitle";

const PROMISES = [
    { num: "01", title: "Certification", body: "All diamond jewellery items at YA-RA® are certified by IGI or GIA. Gold jewellery is 100% BIS Hallmarked in 14Kt or 18Kt solid gold." },
    { num: "02", title: "Lifetime Exchange & Buyback", body: "We provide 100% gold prevailing value + 90% prevailing diamond value on lifetime exchanges across India." },
    { num: "03", title: "Shipping", body: "3–7 business days across India. Every shipment is fully insured and serves Tier-2 & Tier-3 cities." },
    { num: "04", title: "15-Day Money Back", body: "100% full refund guarantee. Free pickup, full refund or store credit, no restocking fee." },
    { num: "05", title: "Payment Security", body: "PCI-DSS compliant gateway, 256-bit SSL encryption, tokenized card storage. UPI, cards & no-cost EMI supported." },
    { num: "06", title: "Privacy", body: "Your data is used only for order fulfilment and consented communication. Never sold to third parties." },
];

const FAQS = [
    ["How do I verify my diamond's authenticity?", "Every piece ships with its IGI/GIA certificate referencing the exact stone set in your jewellery."],
    ["Can I exchange for a different carat weight?", "Yes — lifetime exchange at 100% prevailing gold value and 90% prevailing diamond value."],
    ["Is resizing included in warranty?", "One complimentary resize within the first year on all rings."],
    ["What happens if my package is lost?", "All shipments are fully insured; we replace the piece or refund you in full."],
];

export default function PoliciesPage() {

    usePageTitle("Guarantees & Certifications");

    return (
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-16">
            <p className="eyebrow mb-2 text-center">Policies &amp; Certifications</p>
            <h1 className="text-5xl font-serif text-center mb-2">YA-RA® Guarantees &amp; Terms</h1>
            <p className="text-center micro-label text-charcoal/50 mb-14">
                Shipping · Returns · Certification · Warranty
            </p>

            <div className="space-y-0">
                {PROMISES.map((p) => (
                    <div key={p.num} className="hairline border-b border-charcoal/15 py-6 grid md:grid-cols-[120px_240px_1fr] gap-4 items-baseline">
                        <span className="font-serif italic text-2xl text-gold">{p.num}</span>
                        <h2 className="font-serif text-xl">{p.title}</h2>
                        <p className="text-sm text-charcoal/70 leading-relaxed">{p.body}</p>
                    </div>
                ))}
            </div>

            <h2 className="font-serif text-3xl mt-16 mb-6">Frequently Asked</h2>
            <div className="space-y-3">
                {FAQS.map(([q, a]) => (
                    <details key={q} className="group border border-charcoal/15 bg-cream">
                        <summary className="cursor-pointer list-none px-6 py-4 text-sm font-medium flex justify-between items-center">
                            {q}
                            <span className="text-gold group-open:rotate-45 transition-transform">+</span>
                        </summary>
                        <p className="px-6 pb-5 text-sm text-charcoal/70 leading-relaxed">{a}</p>
                    </details>
                ))}
            </div>

            <p className="text-center micro-label text-charcoal/50 mt-14">
                Mumbai · Delhi · Bengaluru &nbsp;|&nbsp; care@ya-ra.com &nbsp;|&nbsp; +91 98765 43210
            </p>
        </div>
    );
}