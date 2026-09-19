"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import controlApi from "@/api/controlClient";
import { useState, useRef, useEffect } from "react";
import NotificationBell from "./NotificationBell";

const navItems = [
  { label: "Dashboard", href: "/cpanel", icon: "◆" },
  { label: "Analytics", href: "/cpanel/analytics", icon: "◈" },
  { label: "Orders", href: "/cpanel/orders", icon: "▣" },
  { label: "Invoices", href: "/cpanel/invoices", icon: "▤" },
  { label: "Inventory", href: "/cpanel/inventory", icon: "▥" },
  { label: "Categories", href: "/cpanel/categories", icon: "▦" },
  { label: "Tags", href: "/cpanel/tags", icon: "▧" },
  { label: "Rate Card", href: "/cpanel/rate-card", icon: "◇" },
  { label: "Customers", href: "/cpanel/customers", icon: "◎" },
  { label: "Import/Export", href: "/cpanel/import-export", icon: "⬡" },
  { label: "Activity", href: "/cpanel/activity", icon: "◉" },
  { label: "Search Insights", href: "/cpanel/search-analytics", icon: "◌" },
];

export default function ControlLayout({ children }) {
  const { user } = useStaffAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const searchRef = useRef(null);
  const clearSearch = () => { setSearchQuery(""); setSearchResults(null); setActiveItem(null); };

  // Flatten results for easy keyboard navigation
  const flatResults = searchResults ? [
    ...searchResults.products.map(p => ({ type: 'product', id: p.id, href: `/cpanel/inventory/products/${p.id}` })),
    ...searchResults.designs.map(d => ({ type: 'design', id: d.id, href: `/cpanel/inventory?design=${d.id}` })),
    ...searchResults.orders.map(o => ({ type: 'order', id: o.id, href: `/cpanel/orders/${o.id}` })),
    ...searchResults.customers.map(c => ({ type: 'customer', id: c.id, href: `/cpanel/customers/${c.id}` })),
    ...(searchResults.invoices || []).map(inv => ({ type: 'invoice', id: inv.id, href: `/cpanel/orders/${inv.order}` })),
  ] : [];

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults(null); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await controlApi.globalSearch(searchQuery);
        setSearchResults(data);
      } catch { setSearchResults(null); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const onClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchResults(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close mobile nav on route change
  useEffect(() => { setMobileNavOpen(false); }, [pathname]);

  const isActive = (href) => {
    if (href === "/cpanel") return pathname === "/cpanel";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#1A2536] text-white flex flex-col z-40 transition-transform duration-300 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="font-serif-luxury text-2xl tracking-[0.25em] text-white">
              YA<span className="text-[#B86B5A]">-</span>RA
            </span>
            <span className="text-[8px] font-sans border border-white/40 rounded-full w-3 h-3 flex items-center justify-center text-white -mt-2">®</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="h-[1px] bg-gradient-to-r from-transparent via-[#E5BDB0] to-[#E5BDB0] flex-1"></span>
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white">
              <path d="M12 2L3 9L12 22L21 9L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="#E5BDB0" fillOpacity="0.7" />
            </svg>
            <span className="h-[1px] bg-gradient-to-r from-[#E5BDB0] via-[#E5BDB0] to-transparent flex-1"></span>
          </div>
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#E5BDB0] mt-2 font-bold">cPanel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold px-3 mb-2">Navigation</p>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => window.dispatchEvent(new CustomEvent("control-nav", { detail: item.href }))}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active
                  ? "bg-[#B86B5A] text-white font-bold shadow-lg"
                  : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${active ? "bg-white/20" : "bg-white/5"
                  }`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#B86B5A] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {(user?.first_name?.[0] || user?.email?.[0] || "A").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.first_name || "Admin"}</p>
              <p className="text-[10px] text-white/50 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => router.push("/")}
              className="text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
            >
              View Site
            </button>
            <button
              onClick={async () => {
                try {
                  await controlApi._logout();
                } catch (e) {
                  console.error("Logout failed", e);
                }
                // Force a hard reload to clear the StaffAuthContext state
                window.location.href = "/cpanel/login";
              }}
              className="text-[10px] font-bold uppercase tracking-wider bg-[#B86B5A] hover:bg-[#A05A4A] px-3 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileNavOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Topbar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5BDB0]/40 px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl bg-[#1A2536] text-white flex items-center justify-center"
            aria-label="Menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 flex justify-end">
            <div className="relative w-full max-w-md" ref={searchRef}>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A2536]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search item code, hallmark, cert, design…"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setActiveItem(null); }}
                  onKeyDown={(e) => {
                    if (!flatResults.length) return;
                    const currentIndex = flatResults.findIndex(r => r.type === activeItem?.type && r.id === activeItem?.id);

                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      const nextIndex = currentIndex < flatResults.length - 1 ? currentIndex + 1 : 0;
                      setActiveItem(flatResults[nextIndex]);
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      const prevIndex = currentIndex > 0 ? currentIndex - 1 : flatResults.length - 1;
                      setActiveItem(flatResults[prevIndex]);
                    } else if (e.key === "Enter" && activeItem) {
                      e.preventDefault();
                      const target = flatResults.find(r => r.type === activeItem.type && r.id === activeItem.id);
                      if (target) {
                        router.push(target.href);
                        clearSearch();
                      }
                    } else if (e.key === "Escape") {
                      clearSearch();
                    }
                  }}
                  className="w-full pl-11 pr-4 py-2.5 text-sm border border-[#E5BDB0] rounded-full bg-white focus:outline-none focus:border-[#1A2536] transition-colors"
                />
              </div>
              {searchResults && (searchResults.designs.length > 0 || searchResults.products.length > 0 || searchResults.orders.length > 0 || searchResults.customers.length > 0 || searchResults.invoices.length > 0) && (
                <div className="absolute top-full mt-2 right-0 w-full bg-white border border-[#E5BDB0] rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                  {searchResults.products.length > 0 && (
                    <>
                      <p className="px-4 py-2 text-[9px] uppercase tracking-[0.16em] font-bold text-[#B86B5A] bg-[#1A2536]/[0.03] border-b border-[#E5BDB0]/40">Products</p>
                      {searchResults.products.map((p) => (
                        <Link key={`p-${p.id}`} href={`/cpanel/inventory/products/${p.id}`} onClick={clearSearch} className={`block px-4 py-2.5 text-sm border-b border-[#E5BDB0]/20 last:border-0 ${activeItem?.type === 'product' && activeItem?.id === p.id ? 'bg-[#1A2536]/[0.08]' : 'hover:bg-[#1A2536]/[0.03]'}`}>
                          <p className="font-bold font-mono text-[#1A2536]">{p.item_code}</p>
                          <p className="text-[10px] text-[#1A2536]/50">{p.hallmark_number || p.report_number || "—"} · {p.status}</p>
                        </Link>
                      ))}
                    </>
                  )}
                  {searchResults.designs.length > 0 && (
                    <>
                      <p className="px-4 py-2 text-[9px] uppercase tracking-[0.16em] font-bold text-[#B86B5A] bg-[#1A2536]/[0.03] border-b border-[#E5BDB0]/40">Designs</p>
                      {searchResults.designs.map((d) => (
                        <Link key={`d-${d.id}`} href={`/cpanel/inventory?design=${d.id}`} onClick={clearSearch} className={`block px-4 py-2.5 text-sm border-b border-[#E5BDB0]/20 last:border-0 ${activeItem?.type === 'design' && activeItem?.id === d.id ? 'bg-[#1A2536]/[0.08]' : 'hover:bg-[#1A2536]/[0.03]'}`}>
                          <p className="font-bold text-[#1A2536]">{d.name}</p>
                          <p className="text-[10px] text-[#1A2536]/50">{d.design_code} · {d.category_name}</p>
                        </Link>
                      ))}
                    </>
                  )}
                  {searchResults.orders.length > 0 && (
                    <>
                      <p className="px-4 py-2 text-[9px] uppercase tracking-[0.16em] font-bold text-[#B86B5A] bg-[#1A2536]/[0.03] border-b border-[#E5BDB0]/40">Orders</p>
                      {searchResults.orders.map((o) => (
                        <Link key={`o-${o.id}`} href={`/cpanel/orders/${o.id}`} onClick={clearSearch} className={`block px-4 py-2.5 text-sm border-b border-[#E5BDB0]/20 last:border-0 ${activeItem?.type === 'order' && activeItem?.id === o.id ? 'bg-[#1A2536]/[0.08]' : 'hover:bg-[#1A2536]/[0.03]'}`}>
                          <p className="font-bold font-mono text-[#1A2536]">{o.order_number}</p>
                          <p className="text-[10px] text-[#1A2536]/50">{o.customer_name} · {o.status}</p>
                        </Link>
                      ))}
                    </>
                  )}
                  {searchResults.customers.length > 0 && (
                    <>
                      <p className="px-4 py-2 text-[9px] uppercase tracking-[0.16em] font-bold text-[#B86B5A] bg-[#1A2536]/[0.03] border-b border-[#E5BDB0]/40">Customers</p>
                      {searchResults.customers.map((c) => (
                        <Link key={`c-${c.id}`} href={`/cpanel/customers/${c.id}`} onClick={clearSearch} className={`block px-4 py-2.5 text-sm border-b border-[#E5BDB0]/20 last:border-0 ${activeItem?.type === 'customer' && activeItem?.id === c.id ? 'bg-[#1A2536]/[0.08]' : 'hover:bg-[#1A2536]/[0.03]'}`}>
                          <p className="font-bold text-[#1A2536]">{`${c.first_name} ${c.last_name}`.trim() || c.email}</p>
                          <p className="text-[10px] text-[#1A2536]/50">{c.email}{c.phone ? ` · ${c.phone}` : ""}</p>
                        </Link>
                      ))}
                    </>
                  )}
                  {searchResults.invoices && searchResults.invoices.length > 0 && (
                    <>
                      <p className="px-4 py-2 text-[9px] uppercase tracking-[0.16em] font-bold text-[#B86B5A] bg-[#1A2536]/[0.03] border-b border-[#E5BDB0]/40">Invoices</p>
                      {searchResults.invoices.map((inv) => (
                        <Link key={`inv-${inv.id}`} href={`/cpanel/orders/${inv.order}`} onClick={clearSearch} className={`block px-4 py-2.5 text-sm border-b border-[#E5BDB0]/20 last:border-0 ${activeItem?.type === 'invoice' && activeItem?.id === inv.id ? 'bg-[#1A2536]/[0.08]' : 'hover:bg-[#1A2536]/[0.03]'}`}>
                          <p className="font-bold font-mono text-[#1A2536]">{inv.invoice_number}</p>
                          <p className="text-[10px] text-[#1A2536]/50">{inv.customer_name} · ₹{inv.total}</p>
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
      <NotificationBell />
    </div>
  );
}