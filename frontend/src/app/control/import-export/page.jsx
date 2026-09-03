"use client";

import { useState } from "react";
import controlApi from "@/api/controlClient";

export default function ImportExportPage() {
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [file, setFile] = useState(null);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setResult(null);
        try {
            const { data } = await controlApi.importProducts(file);
            setResult({ success: true, ...data });
            setFile(null);
        } catch (err) {
            const d = err.response?.data;
            if (d?.status === 'validation_failed') {
                setResult({ success: false, ...d });
            } else {
                setResult({ success: false, errors: [{ row: '-', errors: [d?.error || err.message] }] });
            }
        } finally {
            setUploading(false);
        }
    };

    const triggerDownload = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadTemplate = async () => {
        try {
            const { data } = await controlApi.downloadTemplate();
            triggerDownload(data, 'import-template.csv');
        } catch { alert('Failed to download template'); }
    };

    const exportData = async (method, filename) => {
        try {
            const { data } = await controlApi[method]();
            triggerDownload(data, filename);
        } catch { alert(`Failed to export`); }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">bulk operations</span>
                <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Import & Export</h1>
            </div>

            {/* Import Card */}
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
                <div className="mb-5">
                    <span className="font-cursive text-2xl text-[#B86B5A] block -mb-1">bring data in</span>
                    <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Import Products</h2>
                </div>
                <p className="text-sm text-[#1A2536]/70 mb-6 leading-relaxed">
                    Bulk-add physical products from a CSV file. All rows must validate before anything is imported —
                    no partial writes, no half-baked data.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                    <label className="flex-1 flex items-center gap-3 px-4 py-3 border-2 border-dashed border-[#E5BDB0] rounded-xl cursor-pointer hover:border-[#B86B5A] transition-colors">
                        <svg className="w-5 h-5 text-[#B86B5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-[#1A2536] flex-1 truncate">
                            {file ? file.name : "Choose a CSV file"}
                        </span>
                        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                    </label>
                    <button onClick={handleUpload} disabled={!file || uploading} className="px-6 py-3 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow disabled:opacity-40 whitespace-nowrap">
                        {uploading ? 'Importing…' : 'Import'}
                    </button>
                    <button onClick={downloadTemplate} className="px-6 py-3 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all whitespace-nowrap">
                        Download Template
                    </button>
                </div>

                {result && (
                    <div className={`rounded-2xl p-5 border-2 ${result.success ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'}`}>
                        {result.success ? (
                            <div>
                                <p className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Imported {result.imported} products
                                </p>
                                <ul className="text-sm text-emerald-700 space-y-1 max-h-40 overflow-y-auto">
                                    {result.item_codes.map((c, i) => <li key={i} className="font-mono">• {c}</li>)}
                                </ul>
                            </div>
                        ) : (
                            <div>
                                <p className="font-bold text-red-800 mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    {result.errors.length} row(s) failed validation
                                </p>
                                {result.valid_count > 0 && (
                                    <p className="text-sm text-[#1A2536]/60 mb-3">
                                        {result.valid_count} row(s) were valid but nothing was imported.
                                    </p>
                                )}
                                <div className="max-h-64 overflow-y-auto rounded-xl border border-red-200">
                                    <table className="w-full text-sm">
                                        <thead className="text-[10px] uppercase tracking-[0.1em] sticky top-0 bg-red-50">
                                            <tr>
                                                <th className="text-left py-2 px-3 font-bold">Row</th>
                                                <th className="text-left py-2 px-3 font-bold">Errors</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.errors.map((e, i) => (
                                                <tr key={i} className="border-t border-red-200 bg-white">
                                                    <td className="py-2 px-3 font-mono font-bold">{e.row}</td>
                                                    <td className="py-2 px-3 text-red-700">{e.errors.join(', ')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Export Card */}
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
                <div className="mb-5">
                    <span className="font-cursive text-2xl text-[#B86B5A] block -mb-1">take data out</span>
                    <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Export Data</h2>
                </div>
                <p className="text-sm text-[#1A2536]/70 mb-6 leading-relaxed">Download CSV files for your accountant or records.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => exportData('exportProducts', 'products.csv')} className="px-5 py-4 border-2 border-[#E5BDB0] hover:border-[#B86B5A] text-[#1A2536] hover:text-[#B86B5A] text-xs font-bold uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2">
                        <span>📦</span> Export Products
                    </button>
                    <button onClick={() => exportData('exportOrders', 'orders.csv')} className="px-5 py-4 border-2 border-[#E5BDB0] hover:border-[#B86B5A] text-[#1A2536] hover:text-[#B86B5A] text-xs font-bold uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2">
                        <span>📋</span> Export Orders
                    </button>
                    <button onClick={() => exportData('exportCustomers', 'customers.csv')} className="px-5 py-4 border-2 border-[#E5BDB0] hover:border-[#B86B5A] text-[#1A2536] hover:text-[#B86B5A] text-xs font-bold uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2">
                        <span>👥</span> Export Customers
                    </button>
                </div>
            </div>
        </div>
    );
}