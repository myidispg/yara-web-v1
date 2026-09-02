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
            });
        } catch (err) {
            console.error("Failed to load profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        setSaving(true);
        try {
            const { data } = await api.updateProfile(form);
            setProfile(data);
            setEditing(false);
            alert("Profile updated!");
        } catch (err) {
            alert("Failed: " + JSON.stringify(err.response?.data || err.message));
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
            alert("Address saved!");
        } catch (err) {
            alert("Failed: " + JSON.stringify(err.response?.data || err.message));
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

    return (
        <div className="bg-white min-h-screen pb-20">
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
                                        <span className="font-bold text-[#1A2536]">{profile.gender || "—"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#1A2536]/60">Date of Birth:</span>
                                        <span className="font-bold text-[#1A2536]">{profile.date_of_birth || "—"}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditing(true)}
                                    className="w-full mt-6 py-3.5 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all"
                                >
                                    Edit Profile
                                </button>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/50 block mb-1.5">Email</label>
                                    <input value={profile.email} disabled className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 bg-white/50 text-[#1A2536]/50 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/50 block mb-1.5">Phone</label>
                                    <input value={profile.phone || ""} disabled className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 bg-white/50 text-[#1A2536]/50 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/50 block mb-1.5">First Name</label>
                                    <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A2536]" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/50 block mb-1.5">Last Name</label>
                                    <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A2536]" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/50 block mb-1.5">Gender</label>
                                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A2536]">
                                        <option value="">Select...</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer_not_to_say">Prefer not to say</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536]/50 block mb-1.5">Date of Birth</label>
                                    <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A2536]" />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={saveProfile} disabled={saving} className="flex-1 py-3.5 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all disabled:opacity-50">
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                    <button onClick={() => setEditing(false)} className="flex-1 py-3.5 border-2 border-[#B86B5A] text-[#B86B5A] hover:bg-[#B86B5A] hover:text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all">
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
                                    <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-1.5">Label</label>
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
                                <input placeholder="PIN Code *" value={addressForm.pincode || ""} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A2536]" />
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
                                        <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                                            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
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