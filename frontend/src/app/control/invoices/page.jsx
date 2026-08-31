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

    // Generate years from 2024 to current year
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2023 }, (_, i) => currentYear - i);

    useEffect(() => {
        loadInvoices();
    }, [year, month]);

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

    const [exporting, setExporting] = useState(false);

    const handleExportPdf = async () => {
        // Check if there are invoices to export
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
    const handleSearch = () => {
        loadInvoices();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-serif text-4xl">Invoices</h1>
                <p className="text-sm text-ink/60">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold-dark"
                >
                    <option value="">All Years</option>
                    {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>

                <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold-dark"
                >
                    <option value="">All Months</option>
                    {MONTHS.map((m, idx) => m && (
                        <option key={idx} value={idx}>{m}</option>
                    ))}
                </select>

                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search invoice #, order #, or customer…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="border border-line rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:border-gold-dark"
                    />
                    <button onClick={handleSearch} className="btn-outline text-sm px-4">Search</button>
                </div>

                <button
                    onClick={handleExportPdf}
                    disabled={exporting}
                    className="btn-solid text-sm ml-auto disabled:opacity-50"
                >
                    {exporting ? "Preparing ZIP…" : `Download PDFs ${year || month ? `(Filtered)` : `(All)`}`}
                </button>
            </div>

            {/* Invoice Table */}
            {loading ? (
                <div className="text-center py-12">Loading invoices…</div>
            ) : (
                <div className="bg-white rounded-xl border border-line shadow-card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-cream/50">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Invoice #</th>
                                <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Order #</th>
                                <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Customer</th>
                                <th className="text-right px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Amount</th>
                                <th className="text-right px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">GST</th>
                                <th className="text-left px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">Date</th>
                                <th className="text-center px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold">PDF</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-sm text-ink/50">
                                        No invoices found for the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((inv) => (
                                    <tr key={inv.id} className="border-b border-line last:border-0 hover:bg-cream/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono font-semibold">{inv.invoice_number}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <Link href={`/control/orders/${inv.order}`} className="text-gold-dark hover:text-ink font-mono">
                                                {inv.order_number}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <p className="font-semibold">{inv.customer_name}</p>
                                            <p className="text-xs text-ink/50">{inv.customer_email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-semibold">{inr(inv.total)}</td>
                                        <td className="px-6 py-4 text-sm text-right text-ink/70">{inr(inv.gst_amount)}</td>
                                        <td className="px-6 py-4 text-sm text-ink/70">
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
                                                className="text-gold-dark hover:text-ink text-sm font-semibold"
                                            >
                                                View PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}