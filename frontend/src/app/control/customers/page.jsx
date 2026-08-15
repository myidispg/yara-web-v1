"use client";

import { useEffect, useState } from "react";
import controlApi from "@/api/controlClient";

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const { data } = await controlApi.getCustomers();
            setCustomers(data.results || data);
        } catch (err) {
            console.error("Failed to load customers:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-12">Loading customers...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-serif text-4xl">Customers</h1>
                <p className="text-sm text-ink/60">{customers.length} registered customers</p>
            </div>

            <div className="bg-white rounded-xl border border-line shadow-card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-cream border-b border-line">
                        <tr>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.16em] font-semibold">Name</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.16em] font-semibold">Email</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.16em] font-semibold">Phone</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.16em] font-semibold">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.id} className="border-b border-line hover:bg-cream/50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-semibold">
                                        {[customer.first_name, customer.last_name].filter(Boolean).join(" ") || "—"}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-sm text-ink/70">{customer.email}</td>
                                <td className="px-6 py-4 text-sm text-ink/70">{customer.phone || "—"}</td>
                                <td className="px-6 py-4 text-sm text-ink/70">
                                    {new Date(customer.date_joined).toLocaleDateString("en-IN")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}