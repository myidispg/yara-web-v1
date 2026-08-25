"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import controlApi from "@/api/controlClient";

export default function CustomersPage() {
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showStaff, setShowStaff] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            // Always fetch all users (staff + non-staff) so we can show both counts
            const { data } = await controlApi.getCustomers(true);
            setAllUsers(data.results || data);
        } catch (err) {
            console.error("Failed to load customers:", err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate counts (always available)
    const staffCount = allUsers.filter((c) => c.is_staff).length;
    const customerCount = allUsers.filter((c) => !c.is_staff).length;

    // Filter for display based on toggle
    const displayedUsers = showStaff ? allUsers : allUsers.filter((c) => !c.is_staff);

    if (loading) return <div className="text-center py-12">Loading customers...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-serif text-4xl">Customers</h1>
                <p className="text-sm text-ink/60">
                    {customerCount} registered customer{customerCount !== 1 ? 's' : ''} · {staffCount} staff account{staffCount !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Staff Toggle */}
            <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={showStaff}
                        onChange={(e) => setShowStaff(e.target.checked)}
                        className="w-4 h-4 accent-[#B08D3E]"
                    />
                    <span className="text-sm text-ink/70">Show staff accounts in table</span>
                </label>
            </div>

            <div className="bg-white rounded-xl border border-line shadow-card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-cream border-b border-line">
                        <tr>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.16em] font-semibold">Name</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.16em] font-semibold">Email</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.16em] font-semibold">Phone</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.16em] font-semibold">Joined</th>
                            <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.16em] font-semibold">Type</th>
                            <th className="text-right px-6 py-4 text-xs uppercase tracking-[0.16em] font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-ink/60">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            displayedUsers.map((customer) => (
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
                                    <td className="px-6 py-4">
                                        {customer.is_staff ? (
                                            <span className="px-2 py-1 bg-ink text-white text-[10px] font-semibold rounded-full uppercase tracking-wider">
                                                Staff
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-gold/10 text-gold-dark text-[10px] font-semibold rounded-full uppercase tracking-wider">
                                                Customer
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/control/customers/${customer.id}`}
                                            className="text-sm text-gold hover:text-gold-dark font-semibold"
                                        >
                                            View Profile →
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}