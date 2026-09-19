"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import controlApi from "@/api/controlClient";

const inr = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const MONTHS = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [search, setSearch] = useState("");
    const [exporting, setExporting] = useState(false);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2023 }, (_, i) => currentYear - i);

    useEffect(() => { loadInvoices(); }, [year, month]);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const params = {};
            if (year) params.year = year;
            if (month) params.month = month;
            if (search) params.search = search;

            const { data } = await controlApi.getInvoices(params);
            setInvoices(data.results || data);
        } catch (err) {
            console.error("Failed to load invoices:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPdf = async () => {
        if (invoices.length === 0) {
            alert("No invoices found for the selected filters. Nothing to export.");
            return;
        }

        setExporting(true);
        try {
            const params = {};
            if (year) params.year = year;
            if (month) params.month = month;

            const response = await controlApi.exportInvoicePdfs(params);
            const url = URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            const filename = `invoices${year ? `_${year}` : ''}${month ? `_month${month}` : ''}.zip`;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to export PDFs:", err);
            alert("Failed to export invoice PDFs. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    const handleSearch = () => { loadInvoices(); };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">financial records</span>
                    <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Invoices</h1>
                </div>
                <div className="glass-card-vibrant rounded-full px-5 py-2.5 border border-[#E5BDB0]">
                    <span className="text-sm font-bold text-[#1A2536]">{invoices.length}</span>
                    <span className="text-sm text-[#1A2536]/60 ml-1">invoice{invoices.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card-vibrant rounded-2xl border border-[#E5BDB0] p-4 flex flex-wrap gap-3 items-center">
                <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="border border-[#E5BDB0] rounded-full px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#1A2536]"
                >
                    <option value="">All Years</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>

                <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="border border-[#E5BDB0] rounded-full px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#1A2536]"
                >
                    <option value="">All Months</option>
                    {MONTHS.map((m, idx) => m && <option key={idx} value={idx}>{m}</option>)}
                </select>

                <div className="flex gap-2 flex-1 min-w-[240px]">
                    <input
                        type="text"
                        placeholder="Search invoice #, order #, or customer…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-1 border border-[#E5BDB0] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A2536]"
                    />
                    <button onClick={handleSearch} className="px-5 py-2.5 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all whitespace-nowrap">
                        Search
                    </button>
                </div>

                <button
                    onClick={handleExportPdf}
                    disabled={exporting}
                    className="px-6 py-2.5 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow disabled:opacity-50 whitespace-nowrap"
                >
                    {exporting ? "Preparing ZIP…" : `Download PDFs ${year || month ? `(Filtered)` : `(All)`}`}
                </button>
            </div>

            {/* Invoice Table */}
            {loading ? (
                <div className="text-center py-16">
                    <p className="text-sm text-[#1A2536]/50">Loading invoices…</p>
                </div>
            ) : (
                <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#1A2536]/[0.03] border-b border-[#E5BDB0]/40">
                                    <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Invoice #</th>
                                    <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Order #</th>
                                    <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Customer</th>
                                    <th className="text-right px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Amount</th>
                                    <th className="text-right px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">GST</th>
                                    <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Date</th>
                                    <th className="text-center px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">PDF</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <p className="font-serif-luxury text-xl text-[#1A2536] mb-2">No invoices found</p>
                                            <p className="text-sm text-[#1A2536]/50">Try adjusting your filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map((inv) => (
                                        <tr key={inv.id} className="border-b border-[#E5BDB0]/20 last:border-0 hover:bg-[#1A2536]/[0.02] transition-colors">
                                            <td className="px-6 py-4 text-sm font-mono font-bold text-[#1A2536]">{inv.invoice_number}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <Link href={`/control/orders/${inv.order}`} className="font-mono text-[#B86B5A] font-bold hover:text-[#1A2536] hover:underline transition-colors">
                                                    {inv.order_number}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <p className="font-bold text-[#1A2536]">{inv.customer_name}</p>
                                                <p className="text-xs text-[#1A2536]/50 mt-0.5">{inv.customer_email}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-extrabold text-[#1A2536]">{inr(inv.total)}</td>
                                            <td className="px-6 py-4 text-sm text-right text-[#1A2536]/70">{inr(inv.gst_amount)}</td>
                                            <td className="px-6 py-4 text-sm text-[#1A2536]/70">
                                                {new Date(inv.generated_at).toLocaleDateString("en-IN", {
                                                    day: "numeric", month: "short", year: "numeric"
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const response = await controlApi.downloadInvoice(inv.id);
                                                            const url = URL.createObjectURL(response.data);
                                                            window.open(url, '_blank');
                                                        } catch (err) {
                                                            alert("Failed to open PDF.");
                                                        }
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}