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
            const { data } = await controlApi.getCustomers(true);
            setAllUsers(data.results || data);
        } catch (err) {
            console.error("Failed to load customers:", err);
        } finally {
            setLoading(false);
        }
    };

    const staffCount = allUsers.filter((c) => c.is_staff).length;
    const customerCount = allUsers.filter((c) => !c.is_staff).length;
    const displayedUsers = showStaff ? allUsers : allUsers.filter((c) => !c.is_staff);

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <p className="text-sm text-[#1A2536]/50">Loading customers…</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">user management</span>
                    <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Customers</h1>
                </div>
                <div className="flex gap-3">
                    <div className="glass-card-vibrant rounded-full px-5 py-2.5 border border-[#E5BDB0]">
                        <span className="text-sm font-bold text-[#1A2536]">{customerCount}</span>
                        <span className="text-sm text-[#1A2536]/60 ml-1">customer{customerCount !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="glass-card-vibrant rounded-full px-5 py-2.5 border border-[#E5BDB0]">
                        <span className="text-sm font-bold text-[#1A2536]">{staffCount}</span>
                        <span className="text-sm text-[#1A2536]/60 ml-1">staff</span>
                    </div>
                </div>
            </div>

            {/* Staff Toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none glass-card-vibrant rounded-xl border border-[#E5BDB0] px-4 py-3 w-fit">
                <input
                    type="checkbox"
                    checked={showStaff}
                    onChange={(e) => setShowStaff(e.target.checked)}
                    className="w-5 h-5 accent-[#B86B5A]"
                />
                <span className="text-sm font-semibold text-[#1A2536]">Show staff accounts in table</span>
            </label>

            {/* Customers Table */}
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#1A2536]/[0.03] border-b border-[#E5BDB0]/40">
                                <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Name</th>
                                <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Email</th>
                                <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Phone</th>
                                <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Joined</th>
                                <th className="text-left px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Type</th>
                                <th className="text-right px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <p className="font-serif-luxury text-xl text-[#1A2536] mb-2">No users found</p>
                                        <p className="text-sm text-[#1A2536]/50">Try adjusting the staff toggle.</p>
                                    </td>
                                </tr>
                            ) : (
                                displayedUsers.map((customer) => (
                                    <tr key={customer.id} className="border-b border-[#E5BDB0]/20 last:border-0 hover:bg-[#1A2536]/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[#1A2536]">
                                                {[customer.first_name, customer.last_name].filter(Boolean).join(" ") || "—"}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#1A2536]/70">{customer.email}</td>
                                        <td className="px-6 py-4 text-sm text-[#1A2536]/70">{customer.phone || "—"}</td>
                                        <td className="px-6 py-4 text-sm text-[#1A2536]/70">
                                            {new Date(customer.date_joined).toLocaleDateString("en-IN")}
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.is_staff ? (
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1A2536] text-white">
                                                    Staff
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#B86B5A]/10 text-[#B86B5A] border border-[#B86B5A]/30">
                                                    Customer
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/control/customers/${customer.id}`}
                                                className="text-xs text-[#B86B5A] font-bold uppercase tracking-wider hover:underline"
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
        </div>
    );
}