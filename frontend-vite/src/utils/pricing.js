// Central INR formatting + transparent price breakdown

export function inr(n) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(n) || 0);
}

function num(v) {
    return v !== null && v !== undefined && v !== "" ? Number(v) : null;
}

/**
 * Uses exact backend values when present on the variant
 * (gold_value, diamond_value, making_charges, gst_amount),
 * otherwise falls back to YA-RA standard proportions.
 */
export function priceBreakdown(price, source = {}) {
    const p = Number(price) || 0;
    const gold = num(source.gold_value) ?? Math.round(p * 0.375);
    const diamond = num(source.diamond_value) ?? Math.round(p * 0.485);
    const making = num(source.making_charges) ?? Math.round(p * 0.085);
    const gst = num(source.gst_amount) ?? Math.max(0, p - gold - diamond - making);
    return { gold, diamond, making, gst };
}