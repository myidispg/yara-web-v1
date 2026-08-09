import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import usePageTitle from "../utils/usePageTitle";

const TITLES = {
  rings: ["Natural Diamond & Gold Rings", "Explore handcrafted natural diamond rings set in 14Kt and 18Kt Solid Gold."],
  earrings: ["Diamond Earrings", "Studs, huggies & drops in certified natural diamonds."],
  necklaces: ["Necklaces & Pendants", "Solitaire drops & fine chains in 14Kt & 18Kt gold."],
  bracelets: ["Tennis Collection", "Diamond bracelets & bangles in classic silhouettes."],
  solitaires: ["Solitaires", "Engagement rings & solitaire bands, crafted forever."],
  "color-stone": ["Color Stone Fine Jewellery", "Ruby, sapphire & emerald accents with natural diamonds."],
};

const PURITY_OPTIONS = ["18Kt Yellow Gold", "14Kt Yellow Gold", "18Kt White Gold", "18Kt Rose Gold"];
const PRICE_BUCKETS = [
  { label: "Under ₹25,000", test: (p) => p < 25000 },
  { label: "₹25,000 - ₹50,000", test: (p) => p >= 25000 && p < 50000 },
  { label: "₹50,000 - ₹1,00,000", test: (p) => p >= 50000 && p < 100000 },
  { label: "Above ₹1,00,000", test: (p) => p >= 100000 },
];
const CARAT_BUCKETS = [
  { label: "0.10 - 0.30 Ct", test: (c) => c >= 0.1 && c < 0.3 },
  { label: "0.30 - 0.50 Ct", test: (c) => c >= 0.3 && c < 0.5 },
  { label: "0.50 - 1.00 Ct", test: (c) => c >= 0.5 && c < 1 },
  { label: "1.00+ Ct", test: (c) => c >= 1 },
];
const QUALITY_OPTIONS = ["EF - VVS (Premium Clarity)", "GH - VS (Fine Quality)"];

const minPrice = (p) =>
  p.variants?.length ? Math.min(...p.variants.map((v) => v.price)) : p.price ?? 0;
const caratOf = (p) => parseFloat(p.carat ?? p.carat_weight ?? p.diamond_weight ?? 0) || 0;
const purityTags = (p) =>
  (p.variants ?? []).map((v) => `${v.purity} ${v.gold_color} Gold`.toLowerCase());
const qualityOf = (p) =>
  String(p.diamond_quality ?? p.quality ?? p.description ?? "").toLowerCase().replace(/[\s-]/g, "");

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [showFilters, setShowFilters] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024
  );
  const [sort, setSort] = useState("best");
  const [sel, setSel] = useState({ purity: [], price: [], carat: [], quality: [] });

  const [title, subtitle] =
    TITLES[slug] ?? ["Fine Jewellery", "Handcrafted natural diamond jewellery in 14Kt & 18Kt solid gold."];
  usePageTitle(title);

  useEffect(() => {
    setSel({ purity: [], price: [], carat: [], quality: [] });
    (async () => {
      for (const path of [
        `/products/?category=${slug}`,
        `/products/?category_slug=${slug}`,
        "/products/",
      ]) {
        try {
          const { data } = await api.get(path);
          const list = data?.results ?? data;
          if (Array.isArray(list)) { setProducts(list); return; }
        } catch { /* try next */ }
      }
    })();
  }, [slug]);

  const toggle = (group, value) =>
    setSel((s) => ({
      ...s,
      [group]: s[group].includes(value) ? s[group].filter((v) => v !== value) : [...s[group], value],
    }));

  const filtered = useMemo(() => {
    let list = [...products];
    if (sel.purity.length)
      list = list.filter((p) => sel.purity.some((o) => purityTags(p).includes(o.toLowerCase())));
    if (sel.price.length)
      list = list.filter((p) =>
        sel.price.some((l) => PRICE_BUCKETS.find((b) => b.label === l)?.test(minPrice(p)))
      );
    if (sel.carat.length)
      list = list.filter((p) =>
        sel.carat.some((l) => CARAT_BUCKETS.find((b) => b.label === l)?.test(caratOf(p)))
      );
    if (sel.quality.length)
      list = list.filter((p) => {
        const q = qualityOf(p);
        if (!q) return true;
        return sel.quality.some((o) =>
          o.startsWith("EF") ? q.includes("ef") || q.includes("vvs") : q.includes("gh") || q.includes("vs")
        );
      });
    switch (sort) {
      case "price-asc": list.sort((a, b) => minPrice(a) - minPrice(b)); break;
      case "price-desc": list.sort((a, b) => minPrice(b) - minPrice(a)); break;
      case "carat-desc": list.sort((a, b) => caratOf(b) - caratOf(a)); break;
      case "newest": list.sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))); break;
      default: list.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
    }
    return list;
  }, [products, sel, sort]);

  const FilterChip = ({ group, value }) => (
    <button
      onClick={() => toggle(group, value)}
      className={`micro-label border px-3 py-2 transition-colors ${
        sel[group].includes(value)
          ? "border-gold-dark bg-gold-dark text-white"
          : "border-charcoal/25 text-charcoal hover:border-gold-dark hover:text-gold-dark"
      }`}
    >
      {value}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
      {/* Breadcrumb + header */}
      <p className="micro-label text-charcoal/50 mb-4">
        <Link to="/" className="hover:text-gold-dark">Home</Link> / Jewellery / {title}
      </p>
      <h1 className="text-4xl md:text-5xl mb-2">{title}</h1>
      <p className="text-sm text-charcoal/60 mb-10">{subtitle}</p>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4 mb-8">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="micro-label hover:text-gold-dark"
          >
            {showFilters ? "Hide Filters" : "Filter Products"}
          </button>
          <span className="text-xs text-charcoal/60">Showing {filtered.length} Designs</span>
        </div>
        <label className="flex items-center gap-3 text-xs">
          <span className="micro-label">Sort By:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-charcoal/25 bg-white px-3 py-2 text-xs focus:outline-none focus:border-gold-dark"
          >
            <option value="best">Bestsellers First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
            <option value="carat-desc">Carat Weight: High to Low</option>
          </select>
        </label>
      </div>

      <div className={`grid gap-10 ${showFilters ? "lg:grid-cols-[260px_1fr]" : "grid-cols-1"}`}>
        {/* Filters */}
        {showFilters && (
          <aside className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="micro-label">Filter Products</h2>
              <button
                onClick={() => setSel({ purity: [], price: [], carat: [], quality: [] })}
                className="micro-label text-gold-dark underline underline-offset-4"
              >
                Clear All
              </button>
            </div>

            <div>
              <h3 className="micro-label text-gold-dark mb-3">Gold Purity &amp; Tone</h3>
              <div className="flex flex-wrap gap-2">
                {PURITY_OPTIONS.map((o) => <FilterChip key={o} group="purity" value={o} />)}
              </div>
            </div>

            <div>
              <h3 className="micro-label text-gold-dark mb-3">Price Range (INR)</h3>
              <div className="flex flex-wrap gap-2">
                {PRICE_BUCKETS.map((b) => <FilterChip key={b.label} group="price" value={b.label} />)}
              </div>
            </div>

            <div>
              <h3 className="micro-label text-gold-dark mb-3">Diamond Weight</h3>
              <div className="flex flex-wrap gap-2">
                {CARAT_BUCKETS.map((b) => <FilterChip key={b.label} group="carat" value={b.label} />)}
              </div>
            </div>

            <div>
              <h3 className="micro-label text-gold-dark mb-3">Diamond Quality</h3>
              <div className="flex flex-wrap gap-2">
                {QUALITY_OPTIONS.map((o) => <FilterChip key={o} group="quality" value={o} />)}
              </div>
            </div>
          </aside>
        )}

        {/* Grid */}
        <div>
          {filtered.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filtered.map((p) => (
                <ProductCard key={p.id ?? p.slug} product={p} cta="view" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-charcoal/60">No designs match your filters yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}