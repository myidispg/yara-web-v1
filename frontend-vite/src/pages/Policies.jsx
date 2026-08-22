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
        <div className="max-w-5xl mx-auto px-8 lg:px-12 py-16">
            <p className="eyebrow mb-3 text-center">Policies &amp; Certifications</p>
            <h1 className="font-serif text-5xl text-center mb-3">YA-RA® Guarantees &amp; Terms</h1>
            <p className="text-center text-xs uppercase tracking-[0.16em] text-ink/50 mb-16">
                Shipping · Returns · Certification · Warranty
            </p>

            <div className="space-y-0">
                {PROMISES.map((p) => (
                    <div key={p.num} className="border-b border-line py-8 grid md:grid-cols-[100px_220px_1fr] gap-6 items-baseline">
                        <span className="font-serif italic text-3xl text-gold-dark">{p.num}</span>
                        <h2 className="font-serif text-xl text-ink">{p.title}</h2>
                        <p className="text-sm text-ink/60 leading-relaxed">{p.body}</p>
                    </div>
                ))}
            </div>

            <h2 className="font-serif text-3xl mt-20 mb-8">Frequently Asked</h2>
            <div className="space-y-4">
                {FAQS.map(([q, a]) => (
                    <details key={q} className="group bg-white border border-line rounded-xl overflow-hidden shadow-card">
                        <summary className="cursor-pointer list-none px-6 py-5 text-sm font-semibold text-ink flex justify-between items-center">
                            {q}
                            <span className="text-gold-dark text-xl group-open:rotate-45 transition-transform">+</span>
                        </summary>
                        <p className="px-6 pb-6 text-sm text-ink/60 leading-relaxed border-t border-line pt-4">{a}</p>
                    </details>
                ))}
            </div>

            <p className="text-center text-[10px] uppercase tracking-[0.14em] text-ink/50 mt-20">
                Mumbai · Delhi · Bengaluru &nbsp;|&nbsp; care@ya-ra.com &nbsp;|&nbsp; +91 98765 43210
            </p>
        </div>
    );
}