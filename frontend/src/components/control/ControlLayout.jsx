"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
      <NotificationBell />
    </div>
  );
}