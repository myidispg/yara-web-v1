"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
    const { user, login, register } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isRegister = searchParams.get("mode") === "register";
    const nextPath = searchParams.get("next") ?? "/";
    const [mounted, setMounted] = useState(false);

    const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
    const [regForm, setRegForm] = useState({ first_name: "", last_name: "", email: "", phone: "", password: "", confirm: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        document.title = isRegister ? "Create your Account | YA-RA Jewels" : "Sign In | YA-RA Jewels";
        setMounted(true);
    }, [isRegister]);

    useEffect(() => {
        if (mounted && user) router.push(nextPath, { replace: true });
    }, [user, mounted, router, nextPath]);

    if (!mounted) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <p className="text-sm text-[#1A2536]/50">Loading…</p>
        </div>
    );

    const parseErr = (err) => {
        const data = err.response?.data ?? {};
        if (typeof data === 'string') return data;
        return Object.values(data).flat().join(" ") || "Something went wrong. Please try again.";
    };

    const doLogin = async (e) => {
        e.preventDefault();
        setBusy(true); setError("");
        try {
            await login(loginForm.identifier, loginForm.password);
            router.push(nextPath, { replace: true });
        } catch (err) {
            setError(parseErr(err));
            setBusy(false);
        }
    };

    const doRegister = async (e) => {
        e.preventDefault();
        if (regForm.password !== regForm.confirm) {
            setError("Passwords do not match.");
            return;
        }
        if (regForm.phone && !/^[6-9]\d{9}$/.test(regForm.phone)) {
            setError("Please enter a valid 10-digit Indian phone number.");
            return;
        }
        setBusy(true); setError("");
        try {
            await register({
                first_name: regForm.first_name,
                last_name: regForm.last_name,
                email: regForm.email,
                phone: regForm.phone,
                password: regForm.password,
            });
            router.push(nextPath, { replace: true });
        } catch (err) {
            setError(parseErr(err));
            setBusy(false);
        }
    };

    const inputCls = "w-full bg-white border border-[#E5BDB0] rounded-xl px-4 py-3 text-sm text-[#1A2536] placeholder-[#1A2536]/40 focus:outline-none focus:border-[#1A2536] transition-colors";
    const labelCls = "text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-1.5";

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <meta name="robots" content="noindex, nofollow" />
            <div className="flex-1 grid lg:grid-cols-[55fr_45fr]">
                {/* Left Branding Panel */}
                <div className="relative hidden lg:block bg-[#1A2536] overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop"
                        alt="YA-RA fine jewellery"
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1A2536]/90 via-[#1A2536]/70 to-[#111A29]/90"></div>

                    {/* Ambient Glows */}
                    <div className="absolute top-20 left-20 w-96 h-96 bg-[#E5BDB0]/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative h-full flex flex-col items-center justify-center text-white p-16 text-center max-w-lg mx-auto">
                        {/* Logo */}
                        <div className="mb-8">
                            <span className="font-serif-luxury text-4xl tracking-[0.2em] text-white">
                                YA<span className="text-[#B86B5A]">-</span>RA
                            </span>
                            <div className="flex items-center gap-3 w-full mt-2">
                                <span className="h-[1.5px] bg-gradient-to-r from-transparent via-[#E5BDB0] to-[#E5BDB0] flex-1"></span>
                                <div className="relative w-4 h-4 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
                                        <path d="M12 2L3 9L12 22L21 9L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="#E5BDB0" fillOpacity="0.7" />
                                        <path d="M12 2V22M3 9H21M7.5 5.5L12 9L16.5 5.5" stroke="currentColor" strokeWidth="1.2" />
                                    </svg>
                                </div>
                                <span className="h-[1.5px] bg-gradient-to-r from-[#E5BDB0] via-[#E5BDB0] to-transparent flex-1"></span>
                            </div>
                        </div>

                        <p className="font-cursive text-3xl text-[#E5BDB0] mb-4">every diamond tells your story</p>
                        <h2 className="font-serif-luxury text-white text-4xl sm:text-5xl leading-tight mb-6 font-normal">
                            Welcome to YA-RA
                        </h2>
                        <p className="text-sm text-white/70 max-w-xs leading-relaxed mb-10">
                            Discover certified natural earth-mined diamonds, handcrafted in 14Kt & 18Kt gold. Join us to track your orders, save your wishlist, and enjoy faster checkout.
                        </p>

                        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10 w-full">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-white uppercase tracking-wider">SGL/ IGI/ GIA</p>
                                <p className="text-[9px] text-white/50 mt-1">Certified</p>
                            </div>
                            <div className="text-center border-x border-white/10">
                                <p className="text-[10px] font-bold text-white uppercase tracking-wider">BIS</p>
                                <p className="text-[9px] text-white/50 mt-1">Hallmarked</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-white uppercase tracking-wider">Excellent</p>
                                <p className="text-[9px] text-white/50 mt-1">Finish and Designing</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="flex items-center justify-center px-6 sm:px-8 lg:px-12 py-12 bg-white">
                    <div className="w-full max-w-md">
                        <div className="mb-8">
                            <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">
                                {isRegister ? "join the family" : "welcome back"}
                            </span>
                            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">
                                {isRegister ? "Create your Account" : "Sign In"}
                            </h1>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl mb-6 font-semibold">
                                {error}
                            </div>
                        )}

                        {isRegister ? (
                            <form onSubmit={doRegister} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>First Name</label>
                                        <input required className={inputCls} value={regForm.first_name} onChange={(e) => setRegForm({ ...regForm, first_name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Last Name</label>
                                        <input required className={inputCls} value={regForm.last_name} onChange={(e) => setRegForm({ ...regForm, last_name: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Email Address</label>
                                    <input required type="email" className={inputCls} value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelCls}>Phone (+91)</label>
                                    <input
                                        required
                                        type="tel"
                                        className={inputCls}
                                        value={regForm.phone}
                                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Password</label>
                                        <input required type="password" className={inputCls} value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Confirm</label>
                                        <input required type="password" className={inputCls} value={regForm.confirm} onChange={(e) => setRegForm({ ...regForm, confirm: e.target.value })} />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={busy}
                                    className="w-full py-4 mt-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {busy ? "Creating Account…" : "Create Account"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={doLogin} className="space-y-5">
                                <div>
                                    <label className={labelCls}>Email Address</label>
                                    <input required className={inputCls} value={loginForm.identifier} onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })} />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className={labelCls} style={{ marginBottom: 0 }}>Password</label>
                                        <button type="button" className="text-[10px] uppercase tracking-[0.12em] text-[#B86B5A] font-bold hover:underline">
                                            Forgot?
                                        </button>
                                    </div>
                                    <input required type="password" className={inputCls} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                                </div>
                                <button
                                    type="submit"
                                    disabled={busy}
                                    className="w-full py-4 mt-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {busy ? "Signing In…" : "Sign In"}
                                </button>
                            </form>
                        )}

                        <div className="border-t border-[#E5BDB0]/40 mt-10 pt-6 text-center space-y-3">
                            <p className="text-sm text-[#1A2536]/60">
                                {isRegister ? "Already have an account?" : "New to YA-RA?"}
                            </p>
                            <Link
                                href={isRegister ? "/auth" : "/auth?mode=register"}
                                className="inline-block text-sm text-[#1A2536] font-bold underline underline-offset-4 hover:text-[#B86B5A] transition-colors"
                            >
                                {isRegister ? "Sign In" : "Create an Account"}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}