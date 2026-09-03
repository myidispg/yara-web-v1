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

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-sm text-[#1A2536]/50">Loading dashboard…</p>
    </div>
  );
  if (!stats) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-sm text-red-600 font-semibold">Failed to load dashboard</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">at a glance</span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Dashboard</h1>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/60 mb-2">Today's Revenue</p>
          <p className="text-3xl font-serif-luxury text-[#1A2536] font-semibold">{inr(stats.revenue.today)}</p>
          <p className="text-xs text-[#1A2536]/50 mt-1">{stats.orders.today} orders</p>
        </div>

        <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/60 mb-2">Month Revenue</p>
          <p className="text-3xl font-serif-luxury text-[#1A2536] font-semibold">{inr(stats.revenue.month)}</p>
          <p className="text-xs text-[#1A2536]/50 mt-1">{stats.orders.month} orders</p>
        </div>

        <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/60 mb-2">Pending Orders</p>
          <p className="text-3xl font-serif-luxury text-[#B86B5A] font-semibold">{stats.orders.pending}</p>
          <p className="text-xs text-[#1A2536]/50 mt-1">Awaiting processing</p>
        </div>

        <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/60 mb-2">Inventory Value</p>
          <p className="text-3xl font-serif-luxury text-[#1A2536] font-semibold">{inr(stats.inventory.value)}</p>
          <p className="text-xs text-[#1A2536]/50 mt-1">{stats.inventory.low_stock_alerts} low stock alerts</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/control/orders" className="bg-[#1A2536] rounded-3xl p-6 hover:bg-[#111A29] transition-all group shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-[#B86B5A]/20 flex items-center justify-center text-2xl mb-3">
              <svg className="w-6 h-6 text-[#E5BDB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-serif-luxury text-xl text-white mb-1 group-hover:text-[#E5BDB0] transition-colors">Manage Orders</h3>
            <p className="text-sm text-white/70">View and update order statuses</p>
          </Link>

          <Link href="/control/inventory" className="bg-[#1A2536] rounded-3xl p-6 hover:bg-[#111A29] transition-all group shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-[#B86B5A]/20 flex items-center justify-center text-2xl mb-3">
              <svg className="w-6 h-6 text-[#E5BDB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="font-serif-luxury text-xl text-white mb-1 group-hover:text-[#E5BDB0] transition-colors">Manage Inventory</h3>
            <p className="text-sm text-white/70">Add instances, mark sold offline</p>
          </Link>

          <Link href="/control/rate-card" className="bg-[#1A2536] rounded-3xl p-6 hover:bg-[#111A29] transition-all group shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-[#B86B5A]/20 flex items-center justify-center text-2xl mb-3">
              <svg className="w-6 h-6 text-[#E5BDB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-serif-luxury text-xl text-white mb-1 group-hover:text-[#E5BDB0] transition-colors">Update Rate Card</h3>
            <p className="text-sm text-white/70">Adjust gold and diamond rates</p>
          </Link>
        </div>
      </div>

      {/* MTO Queue & Offline Sales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-8">
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">MTO Fabrication Queue</h2>
            <div className="w-10 h-10 rounded-2xl bg-[#B86B5A]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#B86B5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-5xl font-serif-luxury text-[#1A2536] font-semibold">{stats.mto_queue}</p>
          </div>
          <p className="text-sm text-[#1A2536]/60 mt-2">Open orders containing made-to-order pieces</p>
        </div>

        <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-8">
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Offline / Showroom Sales</h2>
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-5xl font-serif-luxury text-[#1A2536] font-semibold">{stats.offline_sales ?? 0}</p>
          </div>
          <p className="text-sm text-[#1A2536]/60 mt-2">Pieces sold offline (marked in Inventory)</p>
        </div>
      </div>
    </div>
  );
}