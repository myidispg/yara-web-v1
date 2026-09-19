"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStaffAuth } from "@/context/StaffAuthContext";
import controlApi from "@/api/controlClient";

export default function ControlLoginPage() {
    const { user, loading } = useStaffAuth();
    const router = useRouter();
    const [form, setForm] = useState({ identifier: "", password: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!loading && user) router.push("/control");
    }, [user, loading, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
            await controlApi._login({ login: form.identifier, password: form.password });
            window.location.href = "/control";
        } catch (err) {
            setError(err.response?.data?.detail || "Invalid credentials or account deactivated.");
            setBusy(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-[#1A2536]/60">Checking session...</p></div>;

    return (
        <div className="min-h-screen bg-[#1A2536] flex items-center justify-center p-6">
            <div className="w-full max-w-md glass-card-vibrant rounded-3xl border border-[#E5BDB0]/20 p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <span className="font-serif-luxury text-2xl tracking-[0.2em] text-white">YA<span className="text-[#B86B5A]">-</span>RA</span>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#E5BDB0] mt-2 font-bold">Staff Control Panel</p>
                </div>
                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs px-4 py-3 rounded-xl mb-6 text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#E5BDB0] block mb-1.5">Staff Email or Phone</label>
                        <input required className="w-full bg-[#111A29] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#B86B5A] transition-colors" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} autoFocus />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#E5BDB0] block mb-1.5">Password</label>
                        <input required type="password" className="w-full bg-[#111A29] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#B86B5A] transition-colors" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </div>
                    <button type="submit" disabled={busy} className="w-full py-3.5 bg-[#B86B5A] hover:bg-[#A05A4A] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl disabled:opacity-50">
                        {busy ? "Authenticating..." : "Secure Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}