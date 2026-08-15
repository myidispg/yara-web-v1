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
        document.title = isRegister ? "Create Account | YA-RA Jewels" : "Sign In | YA-RA Jewels";
        setMounted(true);
    }, [isRegister]);

    useEffect(() => {
        if (mounted && user) router.push(nextPath, { replace: true });
    }, [user, mounted, router, nextPath]);

    if (!mounted) return (
        <div className="grid lg:grid-cols-2 min-h-[calc(100vh-100px)]">
            <div className="hidden lg:block bg-ink"></div>
            <div className="flex items-center justify-center px-8 py-16 bg-cream/20">
                <div className="w-full max-w-md">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gold-dark mb-2">Loading…</p>
                </div>
            </div>
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
            router.push("/", { replace: true });
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
            router.push("/", { replace: true });
        } catch (err) {
            setError(parseErr(err));
            setBusy(false);
        }
    };

    const inputCls = "w-full bg-transparent border-b border-line py-3 text-sm text-ink placeholder-ink/40 focus:outline-none focus:border-ink transition-colors";
    const labelCls = "text-[10px] uppercase tracking-[0.16em] font-semibold text-ink/60 block mb-1.5";

    return (
        <div className="grid lg:grid-cols-[55fr_45fr] min-h-[calc(100vh-100px)]">
            <div className="relative hidden lg:block bg-ink">
                <img
                    src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop"
                    alt="YA-RA fine jewellery"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="relative h-full flex flex-col items-center justify-center text-white p-16 text-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold-dark mb-6 font-semibold">YA-RA® Fine Jewellery</p>
                    <p className="font-serif text-5xl leading-tight mb-6">
                        Every diamond<br />tells your story.
                    </p>
                    <p className="text-sm text-white/70 max-w-xs leading-relaxed">
                        Discover certified natural diamonds, handcrafted in 14Kt & 18Kt solid gold. Join us to track your orders, save your wishlist, and enjoy faster checkout.
                    </p>
                    <div className="mt-12 flex items-center gap-6 text-[10px] uppercase tracking-[0.16em] text-white/50">
                        <span>IGI Certified</span>
                        <span className="w-1 h-1 rounded-full bg-gold-dark"></span>
                        <span>BIS Hallmarked</span>
                        <span className="w-1 h-1 rounded-full bg-gold-dark"></span>
                        <span>Insured Delivery</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center px-8 py-16 bg-cream/20">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gold-dark mb-2">{isRegister ? "Join YA-RA" : "Welcome Back"}</p>
                        <h1 className="font-serif text-4xl md:text-5xl text-ink">
                            {isRegister ? "Create Account" : "Sign In"}
                        </h1>
                    </div>

                    {error && (
                        <div className="bg-blush/10 border border-blush/30 text-blush text-xs px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {isRegister ? (
                        <form onSubmit={doRegister} className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
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
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className={labelCls}>Password</label>
                                    <input required type="password" className={inputCls} value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelCls}>Confirm</label>
                                    <input required type="password" className={inputCls} value={regForm.confirm} onChange={(e) => setRegForm({ ...regForm, confirm: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" disabled={busy} className="btn-solid w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                                {busy ? "Creating Account…" : "Create Account"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={doLogin} className="space-y-6">
                            <div>
                                <label className={labelCls}>Email Address</label>
                                <input required className={inputCls} value={loginForm.identifier} onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })} />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className={labelCls} style={{ marginBottom: 0 }}>Password</label>
                                    <button type="button" className="text-[10px] uppercase tracking-[0.12em] text-gold-dark hover:text-ink transition-colors">
                                        Forgot?
                                    </button>
                                </div>
                                <input required type="password" className={inputCls} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                            </div>
                            <button type="submit" disabled={busy} className="btn-solid w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                                {busy ? "Signing In…" : "Sign In"}
                            </button>
                        </form>
                    )}

                    <div className="border-t border-line mt-10 pt-6 text-center">
                        <p className="text-sm text-ink/60 mb-4">
                            {isRegister ? "Already have an account?" : "New to YA-RA?"}{" "}
                            <Link href={isRegister ? "/auth" : "/auth?mode=register"} className="text-ink font-semibold underline underline-offset-4 hover:text-gold-dark transition-colors">
                                {isRegister ? "Sign In" : "Create an Account"}
                            </Link>
                        </p>
                        <button onClick={() => router.push("/")} className="text-xs uppercase tracking-[0.14em] text-ink/50 hover:text-ink transition-colors">
                            Continue as Guest
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}