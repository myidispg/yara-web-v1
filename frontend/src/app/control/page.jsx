"use client";

import { useEffect, useState } from "react";
import controlApi from "@/api/controlClient";
import Link from "next/link";

const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data } = await controlApi.getDashboard();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading dashboard...</div>;
  if (!stats) return <div className="text-center py-12 text-red-600">Failed to load dashboard</div>;

  return (
    <div>
      <h1 className="font-serif text-4xl mb-8">Dashboard</h1>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-line p-6 shadow-card">
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60 mb-2">Today's Revenue</p>
          <p className="text-3xl font-serif">{inr(stats.revenue.today)}</p>
          <p className="text-xs text-ink/50 mt-1">{stats.orders.today} orders</p>
        </div>

        <div className="bg-white rounded-xl border border-line p-6 shadow-card">
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60 mb-2">Month Revenue</p>
          <p className="text-3xl font-serif">{inr(stats.revenue.month)}</p>
          <p className="text-xs text-ink/50 mt-1">{stats.orders.month} orders</p>
        </div>

        <div className="bg-white rounded-xl border border-line p-6 shadow-card">
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60 mb-2">Pending Orders</p>
          <p className="text-3xl font-serif">{stats.orders.pending}</p>
          <p className="text-xs text-ink/50 mt-1">Awaiting processing</p>
        </div>

        <div className="bg-white rounded-xl border border-line p-6 shadow-card">
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink/60 mb-2">Inventory Value</p>
          <p className="text-3xl font-serif">{inr(stats.inventory.value)}</p>
          <p className="text-xs text-ink/50 mt-1">{stats.inventory.low_stock_alerts} low stock alerts</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/control/orders" className="bg-ink text-white rounded-xl p-6 hover:bg-ink/90 transition-colors group">
          <p className="text-2xl mb-2">📦</p>
          <h3 className="font-serif text-xl text-white mb-1 group-hover:text-gold-dark transition-colors">Manage Orders</h3>
          <p className="text-sm text-white/70">View and update order statuses</p>
        </Link>

        <Link href="/control/inventory" className="bg-ink text-white rounded-xl p-6 hover:bg-ink/90 transition-colors group">
          <p className="text-2xl mb-2">🏪</p>
          <h3 className="font-serif text-xl text-white mb-1 group-hover:text-gold-dark transition-colors">Manage Inventory</h3>
          <p className="text-sm text-white/70">Add instances, mark sold offline</p>
        </Link>

        <Link href="/control/rate-card" className="bg-ink text-white rounded-xl p-6 hover:bg-ink/90 transition-colors group">
          <p className="text-2xl mb-2">💰</p>
          <h3 className="font-serif text-xl text-white mb-1 group-hover:text-gold-dark transition-colors">Update Rate Card</h3>
          <p className="text-sm text-white/70">Adjust gold and diamond rates</p>
        </Link>
      </div>

      {/* MTO Queue */}
      <div className="bg-cream rounded-xl p-8">
        <h2 className="font-serif text-2xl mb-4">MTO Fabrication Queue</h2>
        <div className="flex items-center gap-4">
          <div className="text-4xl">🔨</div>
          <div>
            <p className="text-3xl font-serif">{stats.mto_queue}</p>
            <p className="text-sm text-ink/60">Orders currently in fabrication</p>
          </div>
        </div>
      </div>
    </div>
  );
}