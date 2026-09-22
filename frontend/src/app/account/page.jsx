"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/api/client";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
    const router = useRouter();
    const { user, loading: authLoading, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState({});

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/auth");
            return;
        }
        load();
    }, [user, authLoading]);

    const handleLogout = () => {
        if (confirm("Log out of your account?")) {
            logout();
            router.push("/");
        }
    };

    const load = async () => {
        try {
            const [profileRes, ordersRes] = await Promise.all([
                api.getProfile(),
                api.getOrders(),
            ]);
            setProfile(profileRes.data);
            setOrders(ordersRes.data.results || ordersRes.data);
            setForm({
                first_name: profileRes.data.first_name || "",
                last_name: profileRes.data.last_name || "",
                gender: profileRes.data.gender || "",
                date_of_birth: profileRes.data.date_of_birth || "",
                phone: profileRes.data.phone || "",
            });
        } catch (err) {
            console.error("Failed to load profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.first_name || !form.first_name.trim()) {
            newErrors.first_name = "First name is required";
        }

        if (form.phone && form.phone.length > 0) {
            if (!/^[6-9]\d{9}$/.test(form.phone)) {
                newErrors.phone = "Enter a valid 10-digit Indian mobile number.";
            }
        }

        // Only validate date if user actually entered something
        if (form.date_of_birth && form.date_of_birth.length > 0) {
            // Parse date manually to avoid UTC timezone issues
            const [year, month, day] = form.date_of_birth.split("-").map(Number);
            const selectedDate = new Date(year, month - 1, day);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Compare at midnight

            if (isNaN(selectedDate.getTime())) {
                newErrors.date_of_birth = "Please enter a valid date";
            } else if (selectedDate > today) {
                newErrors.date_of_birth = "Date of birth cannot be in the future";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const saveProfile = async () => {
        if (!validateForm()) return;

        setSaving(true);
        setErrors({});

        try {
            const payload = {
                first_name: form.first_name,
                last_name: form.last_name || "",
                gender: form.gender || "",
            };

            // Only include phone if it's a valid 10-digit number
            if (form.phone && /^[6-9]\d{9}$/.test(form.phone)) {
                payload.phone = form.phone;
            }

            // Only include date if user actually entered one
            if (form.date_of_birth && form.date_of_birth.length === 10) {
                payload.date_of_birth = form.date_of_birth;
            } else {
                payload.date_of_birth = null;
            }

            const { data } = await api.updateProfile(payload);
            setProfile(data);
            setEditing(false);
        } catch (err) {
            const serverErrors = err.response?.data;
            if (serverErrors && typeof serverErrors === 'object') {
                const formattedErrors = {};
                Object.entries(serverErrors).forEach(([key, value]) => {
                    formattedErrors[key] = Array.isArray(value) ? value[0] : value;
                });
                setErrors(formattedErrors);
            } else {
                setErrors({ general: "Failed to save profile. Please try again." });
            }
        } finally {
            setSaving(false);
        }
    };

    const saveAddress = async () => {
        try {
            await api.createAddress(addressForm);
            setShowAddressForm(false);
            setAddressForm({});
            await load();
        } catch (err) {
            console.error("Failed to save address:", err);
        }
    };

    const setDefault = async (id) => {
        await api.setDefaultAddress(id);
        await load();
    };

    const deleteAddress = async (id) => {
        if (!confirm("Delete this address?")) return;
        await api.deleteAddress(id);
        await load();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
    };

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <p className="text-sm text-[#1A2536]/50">Loading your account…</p>
        </div>
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <p className="text-sm text-[#1A2536]/50">Loading your profile…</p>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <p className="text-sm text-[#1A2536]/50">Unable to load profile.</p>
        </div>
    );

    const inputCls = (field) => `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${errors[field]
        ? "border-red-500 focus:border-red-500 bg-red-50/50"
        : "border-[#E5BDB0] focus:border-[#1A2536]"
        }`;

    const labelCls = "text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/50 block mb-1.5";

    return (
        <div className="bg-white min-h-screen pb-20">
            <meta name="robots" content="noindex, nofollow" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">your luxury profile</span>
                        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">My Account</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all"
                    >
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Profile Card */}
                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
                        <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-6">Profile</h2>
                        {!editing ? (
                            <>
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[#1A2536]/60">Email:</span>
                                        <span className="font-bold text-[#1A2536]">{profile.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#1A2536]/60">Phone:</span>
                                        <span className="font-bold text-[#1A2536]">{profile.phone || "—"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#1A2536]/60">Name:</span>
                                        <span className="font-bold text-[#1A2536]">{profile.first_name} {profile.last_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#1A2536]/60">Gender:</span>
                                        <span className="font-bold text-[#1A2536] capitalize">
                                            {profile.gender ? profile.gender.replace(/_/g, ' ') : "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#1A2536]/60">Date of Birth:</span>
                                        <span className="font-bold text-[#1A2536]">{formatDate(profile.date_of_birth)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setEditing(true); setErrors({}); }}
                                    className="w-full mt-6 py-3.5 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all"
                                >
                                    Edit Profile
                                </button>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>Email</label>
                                    <input value={profile.email} disabled className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 bg-white/50 text-[#1A2536]/50 cursor-not-allowed" />
                                </div>

                                <div>
                                    <label className={labelCls}>Phone</label>
                                    <input
                                        value={form.phone || ""}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                                        maxLength={10}
                                        className={inputCls("phone")}
                                        placeholder="10-digit mobile number"
                                    />
                                    {errors.phone && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className={labelCls}>First Name *</label>
                                    <input
                                        value={form.first_name || ""}
                                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                        className={inputCls("first_name")}
                                    />
                                    {errors.first_name && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.first_name}</p>}
                                </div>

                                <div>
                                    <label className={labelCls}>Last Name</label>
                                    <input
                                        value={form.last_name || ""}
                                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                        className={inputCls("last_name")}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>Gender</label>
                                    <select
                                        value={form.gender || ""}
                                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                        className={inputCls("gender")}
                                    >
                                        <option value="">Select...</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer_not_to_say">Prefer not to say</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelCls}>
                                        Date of Birth <span className="text-[#1A2536]/40 normal-case">(Optional)</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={form.date_of_birth || ""}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setForm({ ...form, date_of_birth: val });
                                            // Clear error when user changes the date
                                            if (errors.date_of_birth) {
                                                setErrors({ ...errors, date_of_birth: "" });
                                            }
                                        }}
                                        className={inputCls("date_of_birth")}
                                    />
                                    {errors.date_of_birth && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.date_of_birth}</p>}
                                </div>

                                {/* General error message */}
                                {errors.general && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl font-semibold text-center">
                                        {errors.general}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={saveProfile}
                                        disabled={saving}
                                        className="flex-1 py-3.5 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                        onClick={() => { setEditing(false); setErrors({}); }}
                                        className="flex-1 py-3.5 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Addresses */}
                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Addresses</h2>
                            <button
                                onClick={() => setShowAddressForm(!showAddressForm)}
                                className="text-xs text-[#B86B5A] font-bold hover:underline"
                            >
                                + Add New
                            </button>
                        </div>

                        {showAddressForm && (
                            <div className="mb-6 space-y-3 border-2 border-[#E5BDB0] rounded-2xl p-5 bg-white/60">
                                <div>
                                    <label className={labelCls}>Label</label>
                                    <select value={addressForm.label || "home"} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A2536]">
                                        <option value="home">Home</option>
                                        <option value="office">Office</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <input placeholder="Address Line 1 *" value={addressForm.line1 || ""} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A2536]" required />
                                <input placeholder="Address Line 2 (optional)" value={addressForm.line2 || ""} onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })} className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A2536]" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input placeholder="City *" value={addressForm.city || ""} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A2536]" />
                                    <input placeholder="State *" value={addressForm.state || ""} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A2536]" />
                                </div>
                                <input placeholder="PIN Code *" value={addressForm.pincode || ""} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A2536]" />
                                <button onClick={saveAddress} className="w-full py-3.5 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all">
                                    Save Address
                                </button>
                            </div>
                        )}

                        <div className="space-y-3">
                            {(profile.addresses || []).map((addr) => (
                                <div key={addr.id} className="border-2 border-[#E5BDB0] rounded-2xl p-4 relative bg-white">
                                    {addr.is_default && (
                                        <span className="absolute top-2 right-2 text-[9px] bg-[#D4AF37] text-white px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                                            Default
                                        </span>
                                    )}
                                    <p className="font-bold text-sm capitalize mb-2 text-[#1A2536]">{addr.label || "Home"}</p>
                                    <p className="text-xs text-[#1A2536]/70">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                                    <p className="text-xs text-[#1A2536]/70">{addr.city}, {addr.state} - {addr.pincode}</p>
                                    <div className="flex gap-3 mt-3 pt-3 border-t border-[#E5BDB0]/40">
                                        {!addr.is_default && (
                                            <button onClick={() => setDefault(addr.id)} className="text-xs text-[#B86B5A] font-bold hover:underline">
                                                Set Default
                                            </button>
                                        )}
                                        <button onClick={() => deleteAddress(addr.id)} className="text-xs text-red-500 font-bold hover:underline">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(!profile.addresses || profile.addresses.length === 0) && (
                                <p className="text-sm text-[#1A2536]/50 text-center py-8">No addresses saved yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
                        <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-6">Order History</h2>
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/account/orders/${order.id}`}
                                    className="block border-2 border-[#E5BDB0] rounded-2xl p-4 hover:border-[#B86B5A] transition-all bg-white hover:shadow-md"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-mono text-xs font-bold text-[#1A2536]">{order.order_number}</span>
                                        <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                            order.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                                                order.status === 'shipped' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                                    'bg-amber-50 text-amber-700 border border-amber-200'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-[#1A2536]/50 mb-1">
                                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                    <p className="text-sm font-extrabold text-[#1A2536]">₹{order.total}</p>
                                </Link>
                            ))}
                            {orders.length === 0 && (
                                <p className="text-sm text-[#1A2536]/50 text-center py-8">No orders yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}