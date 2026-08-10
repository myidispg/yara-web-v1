import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import usePageTitle from "../utils/usePageTitle";

const PAGE = 18;

const TITLES = {
  rings: ["Natural Diamond & Gold Rings", "Explore handcrafted natural diamond rings set in 14Kt and 18Kt Solid Gold."],
  earrings: ["Diamond Earrings", "Studs, huggies & drops in certified natural diamonds."],
  necklaces: ["Necklaces & Pendants", "Solitaire drops & fine chains in 14Kt & 18Kt gold."],
  bracelets: ["Tennis Collection", "Diamond bracelets & bangles in classic silhouettes."],
  solitaires: ["Solitaires", "Engagement rings & solitaire bands, crafted forever."],
  "color-stone": ["Color Stone Fine Jewellery", "Ruby, sapphire & emerald accents with natural diamonds."],
};

const PURITY_OPTIONS = ["18Kt Yellow Gold", "14Kt Yellow Gold", "18Kt White Gold", "18Kt Rose Gold"];
const PRICE_OPTIONS = ["Under ₹25,000", "₹25,000 - ₹50,000", "₹50,000 - ₹1,00,000", "Above ₹1,00,000"];
const CARAT_OPTIONS = ["0.10 - 0.30 Ct", "0.30 - 0.50 Ct", "0.50 - 1.00 Ct", "1.00+ Ct"];
const QUALITY_OPTIONS = [
  { code: "EF-VVS", label: "EF - VVS (Premium Clarity)" },
  { code: "GH-VS", label: "GH - VS (Fine Quality)" },
];

const SORT_OPTIONS = [
  { value: "best", label: "Bestsellers First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "carat-desc", label: "Carat Weight: High to Low" },
];

const BANNERS = [
  { position: 4, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop", title: "Every piece tells a story.", subtitle: "Handcrafted to be worn, loved, and passed down." },
  { position: 11, image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600&auto=format&fit=crop", title: "Certified forever.", subtitle: "IGI & GIA certified natural diamonds, 100% earth-mined." },
  { position: 17, image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop", title: "Crafted for you.", subtitle: "14Kt & 18Kt solid gold, BIS hallmarked for life." },
  { position: 22, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop", title: "Worn every day.", subtitle: "Effortless fine jewellery for the modern woman." },
];

/* ── Icons ── */
const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);
const SortIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4" />
  </svg>
);
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function CategoryPage() {
  const { slug } = useParams();
  const [sort, setSort] = useState("best");
  const [sel, setSel] = useState({ purity: [], price: [], carat: [], quality: [] });

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);
  const seqRef = useRef(0);

  const [title, subtitle] = TITLES[slug] ?? ["Fine Jewellery", "Handcrafted natural diamond jewellery in 14Kt & 18Kt solid gold."];
  usePageTitle(title);

  const hasMore = items.length < total;
  const activeFilterCount = sel.purity.length + sel.price.length + sel.carat.length + sel.quality.length;
  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || "Sort";

  const buildParams = (offset) => {
    const p = { category: slug, limit: PAGE, offset, sort };
    if (sel.purity.length) p.purity = sel.purity;
    if (sel.price.length) p.price = sel.price;
    if (sel.carat.length) p.carat = sel.carat;
    if (sel.quality.length) p.quality = sel.quality;
    return p;
  };

  const fetchPage = async (offset, append) => {
    const seq = ++seqRef.current;
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const { data } = await api.get("/products/", { params: buildParams(offset) });
      if (seq !== seqRef.current) return;
      const list = data?.results ?? data ?? [];
      setTotal(data?.count ?? list.length);
      setItems((prev) => (append ? [...prev, ...list] : list));
    } catch {
      if (seq === seqRef.current) { setItems([]); setTotal(0); }
    }
    if (seq === seqRef.current) { setLoading(false); setLoadingMore(false); }
  };

  useEffect(() => {
    setItems([]); setTotal(0); fetchPage(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, sel, sort]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || loading || loadingMore || !hasMore) return;
    const obs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      fetchPage(items.length, true);
    }, { rootMargin: "300px 0px" });
    obs.observe(node);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, hasMore, loading, loadingMore]);

  const toggle = (group, value) =>
    setSel((s) => ({ ...s, [group]: s[group].includes(value) ? s[group].filter((v) => v !== value) : [...s[group], value] }));

  const FilterChip = ({ group, value, children }) => (
    <button
      onClick={() => toggle(group, value)}
      className={`text-xs font-medium px-4 py-2 rounded-full transition-colors ${sel[group].includes(value) ? "bg-ink text-white" : "bg-cream text-ink hover:bg-ink hover:text-white"
        }`}
    >
      {children ?? value}
    </button>
  );

  const BannerCard = ({ banner }) => (
    <div className="relative rounded-xl overflow-hidden shadow-card h-full group flex flex-col">
      <div className="relative flex-1 overflow-hidden">
        <img src={banner.image} alt={banner.title} loading="lazy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <p className="font-serif text-2xl md:text-3xl leading-tight mb-2">{banner.title}</p>
        <p className="text-xs md:text-sm text-white/80">{banner.subtitle}</p>
      </div>
    </div>
  );

  const cells = [];
  let p = 0;
  while (p < items.length) {
    const pos = cells.length;
    const banner = BANNERS.find((b) => b.position === pos);
    if (banner) {
      cells.push(<BannerCard key={`banner-${banner.position}`} banner={banner} />);
    } else {
      cells.push(<ProductCard key={items[p].id ?? items[p].slug} product={items[p]} showAddButton={false} />);
      p++;
    }
  }

  return (
    <div className="max-w-[1440px] mx-auto px-8 lg:px-20 pt-12 pb-28 lg:pb-12">
      {/* Breadcrumb + header */}
      <p className="text-xs uppercase tracking-[0.16em] text-ink/50 mb-4">
        <Link to="/" className="hover:text-gold-dark">Home</Link> / Jewellery / {title}
      </p>
      <h1 className="font-serif text-4xl md:text-5xl mb-2">{title}</h1>
      <p className="text-sm text-ink/60 mb-8">{subtitle}</p>

      {/* Desktop Toolbar (lg+ only) */}
      <div className="hidden lg:flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4 mb-6">
        <span className="text-xs text-ink/50">Showing {items.length} of {total} Designs</span>
        <label className="flex items-center gap-3 text-xs">
          <span className="uppercase tracking-[0.16em] font-medium">Sort By:</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-line bg-white px-4 py-2 text-sm rounded-md focus:outline-none focus:border-gold-dark">
            {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Desktop Sidebar Filters — always visible */}
        <aside className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-[0.16em] font-semibold">Filter Products</h2>
            <button onClick={() => setSel({ purity: [], price: [], carat: [], quality: [] })} className="text-xs text-gold-dark underline underline-offset-4 hover:text-ink transition-colors">Clear All</button>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-[0.16em] font-semibold text-gold-dark mb-3">Gold Purity &amp; Tone</h3>
            <div className="flex flex-wrap gap-2">{PURITY_OPTIONS.map((o) => <FilterChip key={o} group="purity" value={o} />)}</div>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-[0.16em] font-semibold text-gold-dark mb-3">Price Range (INR)</h3>
            <div className="flex flex-wrap gap-2">{PRICE_OPTIONS.map((o) => <FilterChip key={o} group="price" value={o} />)}</div>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-[0.16em] font-semibold text-gold-dark mb-3">Diamond Weight</h3>
            <div className="flex flex-wrap gap-2">{CARAT_OPTIONS.map((o) => <FilterChip key={o} group="carat" value={o} />)}</div>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-[0.16em] font-semibold text-gold-dark mb-3">Diamond Quality</h3>
            <div className="flex flex-wrap gap-2">
              {QUALITY_OPTIONS.map((o) => <FilterChip key={o.code} group="quality" value={o.code}>{o.label}</FilterChip>)}
            </div>
          </div>
        </aside>

        {/* Grid + infinite scroll */}
        <div>
          {loading ? (
            <p className="text-sm text-ink/50">Loading designs…</p>
          ) : items.length ? (
            <>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">{cells}</div>
              {hasMore && <div ref={sentinelRef} className="h-10" aria-hidden="true" />}
              {loadingMore && <p className="text-center micro-label text-ink/50 mt-6">Loading more designs…</p>}
              {!hasMore && total > PAGE && <p className="text-center micro-label text-ink/50 mt-8">You've viewed all {total} designs.</p>}
            </>
          ) : (
            <p className="text-sm text-ink/50">No designs match your filters yet.</p>
          )}
        </div>
      </div>

      {/* ── MOBILE BOTTOM ACTION BAR ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-line px-4 py-3.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button onClick={() => setShowMobileFilters(true)} className="flex items-center gap-2.5 text-ink font-medium text-sm">
          <FilterIcon />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="bg-blush text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
        <div className="w-px h-6 bg-line" />
        <button onClick={() => setShowMobileSort(true)} className="flex items-center gap-2.5 text-ink font-medium text-sm">
          <SortIcon />
          <span>Sort: <span className="text-gold-dark">{currentSortLabel}</span></span>
        </button>
      </div>

      {/* ── MOBILE FILTER MODAL ── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowMobileFilters(false)} />
          <div className="relative bg-white w-full max-h-[85vh] rounded-t-2xl flex flex-col shadow-hero animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-line">
              <h3 className="font-serif text-xl">Filter Products</h3>
              <button onClick={() => setShowMobileFilters(false)} className="text-ink/60 hover:text-ink"><CloseIcon /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-[0.16em] font-semibold text-gold-dark mb-3">Gold Purity &amp; Tone</h4>
                <div className="flex flex-wrap gap-2">{PURITY_OPTIONS.map((o) => <FilterChip key={o} group="purity" value={o} />)}</div>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-[0.16em] font-semibold text-gold-dark mb-3">Price Range (INR)</h4>
                <div className="flex flex-wrap gap-2">{PRICE_OPTIONS.map((o) => <FilterChip key={o} group="price" value={o} />)}</div>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-[0.16em] font-semibold text-gold-dark mb-3">Diamond Weight</h4>
                <div className="flex flex-wrap gap-2">{CARAT_OPTIONS.map((o) => <FilterChip key={o} group="carat" value={o} />)}</div>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-[0.16em] font-semibold text-gold-dark mb-3">Diamond Quality</h4>
                <div className="flex flex-wrap gap-2">
                  {QUALITY_OPTIONS.map((o) => <FilterChip key={o.code} group="quality" value={o.code}>{o.label}</FilterChip>)}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-line flex items-center justify-between gap-4 bg-white">
              <button onClick={() => setSel({ purity: [], price: [], carat: [], quality: [] })} className="text-xs uppercase tracking-[0.16em] font-medium text-gold-dark underline underline-offset-4">Clear All</button>
              <button onClick={() => setShowMobileFilters(false)} className="btn-solid flex-1 max-w-xs justify-center">Show {total} Results</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE SORT MODAL ── */}
      {showMobileSort && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowMobileSort(false)} />
          <div className="relative bg-white w-full max-h-[70vh] rounded-t-2xl flex flex-col shadow-hero animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-line">
              <h3 className="font-serif text-xl">Sort By</h3>
              <button onClick={() => setShowMobileSort(false)} className="text-ink/60 hover:text-ink"><CloseIcon /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); setShowMobileSort(false); }}
                  className={`w-full text-left px-4 py-4 text-sm flex items-center justify-between hover:bg-cream rounded-lg transition-colors ${sort === opt.value ? 'text-gold-dark font-semibold' : 'text-ink'
                    }`}
                >
                  {opt.label}
                  {sort === opt.value && <CheckIcon />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}