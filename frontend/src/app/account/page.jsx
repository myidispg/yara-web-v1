"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/api/client";

export default function AccountPage() {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState({});

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            const [profileRes, ordersRes] = await Promise.all([
                api.getProfile(),   // Changed from api.get("/api/auth/me/")
                api.getOrders(),    // Changed from api.get("/api/orders/")
            ]);
            setUser(profileRes.data);
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
            const { data } = await api.updateProfile(form); // Changed from api.patch
            setUser(data);
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
            await api.createAddress(addressForm); // Changed from api.post
            setShowAddressForm(false);
            setAddressForm({});
            await load();
            alert("Address saved!");
        } catch (err) {
            alert("Failed: " + JSON.stringify(err.response?.data || err.message));
        }
    };

    const setDefault = async (id) => {
        await api.setDefaultAddress(id); // Changed from api.post
        await load();
    };

    const deleteAddress = async (id) => {
        if (!confirm("Delete this address?")) return;
        await api.deleteAddress(id); // Changed from api.delete
        await load();
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (!user) return <div className="text-center py-12">Please log in.</div>;

    return (
        <div className="max-w-7xl mx-auto px-8 py-12">
            <h1 className="font-serif text-4xl mb-8">My Account</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="bg-white rounded-xl border border-line p-8 shadow-card">
                    <h2 className="font-serif text-2xl mb-6">Profile</h2>
                    {!editing ? (
                        <>
                            <div className="space-y-3 text-sm">
                                <div><span className="text-ink/60">Email:</span> <span className="font-semibold">{user.email}</span></div>
                                <div><span className="text-ink/60">Phone:</span> <span className="font-semibold">{user.phone || "—"}</span></div>
                                <div><span className="text-ink/60">Name:</span> <span className="font-semibold">{user.first_name} {user.last_name}</span></div>
                                <div><span className="text-ink/60">Gender:</span> <span className="font-semibold">{user.gender || "—"}</span></div>
                                <div><span className="text-ink/60">Date of Birth:</span> <span className="font-semibold">{user.date_of_birth || "—"}</span></div>
                            </div>
                            <button onClick={() => setEditing(true)} className="btn-outline w-full mt-6">Edit Profile</button>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-ink/60 block mb-1">First Name</label>
                                <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="w-full border border-line rounded px-3 py-2" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-ink/60 block mb-1">Last Name</label>
                                <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="w-full border border-line rounded px-3 py-2" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-ink/60 block mb-1">Gender</label>
                                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full border border-line rounded px-3 py-2">
                                    <option value="">Select...</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-ink/60 block mb-1">Date of Birth</label>
                                <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="w-full border border-line rounded px-3 py-2" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={saveProfile} disabled={saving} className="btn-solid flex-1">{saving ? "Saving..." : "Save"}</button>
                                <button onClick={() => setEditing(false)} className="btn-outline flex-1">Cancel</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Addresses */}
                <div className="bg-white rounded-xl border border-line p-8 shadow-card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-serif text-2xl">Addresses</h2>
                        <button onClick={() => setShowAddressForm(!showAddressForm)} className="text-sm text-gold-dark font-semibold">+ Add</button>
                    </div>
                    {showAddressForm && (
                        <div className="mb-6 space-y-3 border border-line rounded-lg p-4 bg-cream">
                            <input placeholder="Full Name" value={addressForm.full_name || ""} onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })} className="w-full border border-line rounded px-3 py-2" />
                            <input placeholder="Phone" value={addressForm.phone || ""} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full border border-line rounded px-3 py-2" />
                            <input placeholder="Address Line 1" value={addressForm.line1 || ""} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} className="w-full border border-line rounded px-3 py-2" />
                            <input placeholder="Address Line 2 (optional)" value={addressForm.line2 || ""} onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })} className="w-full border border-line rounded px-3 py-2" />
                            <div className="grid grid-cols-2 gap-2">
                                <input placeholder="City" value={addressForm.city || ""} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full border border-line rounded px-3 py-2" />
                                <input placeholder="State" value={addressForm.state || ""} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="w-full border border-line rounded px-3 py-2" />
                            </div>
                            <input placeholder="PIN Code" value={addressForm.pincode || ""} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} className="w-full border border-line rounded px-3 py-2" />
                            <button onClick={saveAddress} className="btn-solid w-full">Save Address</button>
                        </div>
                    )}
                    <div className="space-y-4">
                        {(user.addresses || []).map((addr) => (
                            <div key={addr.id} className="border border-line rounded-lg p-4 relative">
                                {addr.is_default && <span className="absolute top-2 right-2 text-[9px] bg-gold-dark text-white px-2 py-0.5 rounded-full">DEFAULT</span>}
                                <p className="font-semibold text-sm">{addr.full_name}</p>
                                <p className="text-xs text-ink/70 mt-1">{addr.phone}</p>
                                <p className="text-xs text-ink/70 mt-1">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                                <p className="text-xs text-ink/70">{addr.city}, {addr.state} - {addr.pincode}</p>
                                <div className="flex gap-2 mt-3">
                                    {!addr.is_default && <button onClick={() => setDefault(addr.id)} className="text-xs text-gold-dark font-semibold">Set Default</button>}
                                    <button onClick={() => deleteAddress(addr.id)} className="text-xs text-red-600 font-semibold">Delete</button>
                                </div>
                            </div>
                        ))}
                        {(!user.addresses || user.addresses.length === 0) && <p className="text-sm text-ink/50">No addresses saved yet.</p>}
                    </div>
                </div>

                {/* Order History */}
                <div className="bg-white rounded-xl border border-line p-8 shadow-card">
                    <h2 className="font-serif text-2xl mb-6">Order History</h2>
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link key={order.id} href={`/account/orders/${order.id}`} className="block border border-line rounded-lg p-4 hover:bg-cream transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-mono text-sm font-semibold">{order.order_number}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>{order.status}</span>
                                </div>
                                <p className="text-xs text-ink/60">{new Date(order.created_at).toLocaleDateString("en-IN")}</p>
                                <p className="text-sm font-semibold mt-1">₹{order.total}</p>
                            </Link>
                        ))}
                        {orders.length === 0 && <p className="text-sm text-ink/50">No orders yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}