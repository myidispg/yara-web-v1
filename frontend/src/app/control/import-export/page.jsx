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
        <div>
            <h1 className="font-serif text-4xl mb-8">Import & Export</h1>

            <div className="bg-white rounded-xl border border-line p-8 shadow-card mb-8">
                <h2 className="font-serif text-2xl mb-2">Import Products</h2>
                <p className="text-sm text-ink/60 mb-6">
                    Bulk-add physical products from a CSV file. All rows must validate before anything is imported —
                    no partial writes, no half-baked data.
                </p>

                <div className="flex items-center gap-3 mb-6">
                    <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="flex-1 text-sm" />
                    <button onClick={handleUpload} disabled={!file || uploading} className="btn-solid disabled:opacity-40">
                        {uploading ? 'Importing…' : 'Import'}
                    </button>
                    <button onClick={downloadTemplate} className="btn-outline">Download Template</button>
                </div>

                {result && (
                    <div className={`rounded-xl p-4 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        {result.success ? (
                            <div>
                                <p className="font-semibold text-green-800 mb-2">✓ Imported {result.imported} products</p>
                                <ul className="text-sm text-green-700 space-y-1 max-h-40 overflow-y-auto">
                                    {result.item_codes.map((c, i) => <li key={i}>• {c}</li>)}
                                </ul>
                            </div>
                        ) : (
                            <div>
                                <p className="font-semibold text-red-800 mb-2">✗ {result.errors.length} row(s) failed validation</p>
                                {result.valid_count > 0 && (
                                    <p className="text-sm text-ink/60 mb-3">
                                        {result.valid_count} row(s) were valid but nothing was imported.
                                    </p>
                                )}
                                <div className="max-h-64 overflow-y-auto">
                                    <table className="w-full text-sm">
                                        <thead className="text-xs uppercase tracking-[0.1em] sticky top-0 bg-red-50">
                                            <tr><th className="text-left py-1 pr-4">Row</th><th className="text-left py-1">Errors</th></tr>
                                        </thead>
                                        <tbody>
                                            {result.errors.map((e, i) => (
                                                <tr key={i} className="border-t border-red-200">
                                                    <td className="py-1 pr-4 font-mono">{e.row}</td>
                                                    <td className="py-1 text-red-700">{e.errors.join(', ')}</td>
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

            <div className="bg-white rounded-xl border border-line p-8 shadow-card">
                <h2 className="font-serif text-2xl mb-2">Export Data</h2>
                <p className="text-sm text-ink/60 mb-6">Download CSV files for your accountant or records.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => exportData('exportProducts', 'products.csv')} className="btn-outline">📦 Export Products</button>
                    <button onClick={() => exportData('exportOrders', 'orders.csv')} className="btn-outline">📋 Export Orders</button>
                    <button onClick={() => exportData('exportCustomers', 'customers.csv')} className="btn-outline">👥 Export Customers</button>
                </div>
            </div>
        </div>
    );
}