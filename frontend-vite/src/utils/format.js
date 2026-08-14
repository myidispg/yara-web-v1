export const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    .format(Math.round(Number(n || 0)));

export const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const COLOR_NAMES = { yellow: "Yellow", rose: "Rose", white: "White" };

export const variantLabel = (v) => {
  let label = `${COLOR_NAMES[v.gold_color] || v.gold_color} gold · ${v.purity_label || v.purity}`;
  if (v.ring_size) label += ` · Size ${v.ring_size}`;
  return label;
};