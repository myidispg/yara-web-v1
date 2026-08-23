"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import controlApi from "@/api/controlClient";
import { useState, useRef, useEffect } from "react";

import NotificationBell from "./NotificationBell";

const navItems = [
  { label: "Dashboard", href: "/control", icon: "🏡" },
  { label: "Analytics", href: "/control/analytics", icon: "📊" },
  { label: "Orders", href: "/control/orders", icon: "📦" },
  { label: "Inventory", href: "/control/inventory", icon: "🏪" },
  { label: "Categories", href: "/control/categories", icon: "🏷️" },
  { label: "Rate Card", href: "/control/rate-card", icon: "💰" },
  { label: "Customers", href: "/control/customers", icon: "👥" },
  { label: "Import/Export", href: "/control/import-export", icon: "📥" },
  { label: "Activity", href: "/control/activity", icon: "🕒" },
  { label: "Search Insights", href: "/control/search-analytics", icon: "🔍" },
];

export default function ControlLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const searchRef = useRef(null);
  const clearSearch = () => { setSearchQuery(""); setSearchResults(null); };

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

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Sidebar */}
      <aside className="w-64 bg-ink text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-serif text-2xl tracking-[0.3em]">YA-RA</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold-dark mt-1">Control Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => window.dispatchEvent(new CustomEvent("control-nav", { detail: item.href }))}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-white/10 transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/60 mb-2">{user?.email}</div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/")}
              className="flex-1 text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded transition-colors"
            >
              View Site
            </button>
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="flex-1 text-xs bg-gold-dark hover:bg-gold px-3 py-2 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-30 bg-ivory/95 backdrop-blur-sm border-b border-line px-8 py-3 flex justify-end">
          <div className="relative" ref={searchRef}>
            <input
              type="text"
              placeholder="Search item code, hallmark, cert, design…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-line rounded-lg px-4 py-2 text-sm w-80 bg-white focus:outline-none focus:border-gold-dark"
            />
            {searchResults && (searchResults.designs.length > 0 || searchResults.products.length > 0 || searchResults.orders.length > 0 || searchResults.customers.length > 0) && (
              <div className="absolute top-full mt-2 right-0 w-96 bg-white border border-line rounded-lg shadow-hero z-50 max-h-96 overflow-y-auto">
                {searchResults.products.length > 0 && (
                  <>
                    <p className="px-4 py-2 text-xs uppercase font-semibold bg-cream">Products</p>
                    {searchResults.products.map((p) => (
                      <Link key={`p-${p.id}`} href={`/control/inventory/products/${p.id}`} onClick={clearSearch} className="block px-4 py-2 hover:bg-cream text-sm">
                        <p className="font-medium font-mono">{p.item_code}</p>
                        <p className="text-xs text-ink/50">{p.hallmark_number || p.report_number || "—"} · {p.status}</p>
                      </Link>
                    ))}
                  </>
                )}
                {searchResults.designs.length > 0 && (
                  <>
                    <p className="px-4 py-2 text-xs uppercase font-semibold bg-cream">Designs</p>
                    {searchResults.designs.map((d) => (
                      <Link key={`d-${d.id}`} href={`/control/inventory?design=${d.id}`} onClick={clearSearch} className="block px-4 py-2 hover:bg-cream text-sm">
                        <p className="font-medium">{d.name}</p>
                        <p className="text-xs text-ink/50">{d.design_code} · {d.category_name}</p>
                      </Link>
                    ))}
                  </>
                )}
                {searchResults.orders.length > 0 && (
                  <>
                    <p className="px-4 py-2 text-xs uppercase font-semibold bg-cream">Orders</p>
                    {searchResults.orders.map((o) => (
                      <Link key={`o-${o.id}`} href={`/control/orders/${o.id}`} onClick={clearSearch} className="block px-4 py-2 hover:bg-cream text-sm">
                        <p className="font-medium font-mono">{o.order_number}</p>
                        <p className="text-xs text-ink/50">{o.customer_name} · {o.status}</p>
                      </Link>
                    ))}
                  </>
                )}
                {searchResults.customers.length > 0 && (
                  <>
                    <p className="px-4 py-2 text-xs uppercase font-semibold bg-cream">Customers</p>
                    {searchResults.customers.map((c) => (
                      <Link key={`c-${c.id}`} href={`/control/customers/${c.id}`} onClick={clearSearch} className="block px-4 py-2 hover:bg-cream text-sm">
                        <p className="font-medium">{`${c.first_name} ${c.last_name}`.trim() || c.email}</p>
                        <p className="text-xs text-ink/50">{c.email}{c.phone ? ` · ${c.phone}` : ""}</p>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
      <NotificationBell />
    </div>
  );
}