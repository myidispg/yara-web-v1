"use client";

import { useEffect, useState } from "react";
import controlApi from "@/api/controlClient";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await controlApi.getDashboard();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>Failed to load dashboard</div>;

  return (
    <div>
      <h1 className="font-serif text-4xl mb-8">Dashboard</h1>
      
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
      
      <div className="bg-cream rounded-xl p-8">
        <h2 className="font-serif text-2xl mb-4">MTO Fabrication Queue</h2>
        <p className="text-ink/70">{stats.mto_queue} orders in fabrication queue</p>
      </div>
    </div>
  );
}