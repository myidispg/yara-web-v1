"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import api from "@/api/client";

export default function AuthPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextPath = searchParams.get("next") ?? "/";

    // ── 1. ALL useState HOOKS ──
    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isNewUser, setIsNewUser] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // ── 2. ALL useEffect HOOKS ──
    useEffect(() => {
        document.title = step === 1 ? "Sign In | YA-RA Jewels" : "Verify your identity | YA-RA Jewels";
        setMounted(true);
    }, [step]);

    useEffect(() => {
        if (!loading && user) router.replace(nextPath || "/");
    }, [user, loading, router, nextPath]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // ── 3. useGoogleLogin HOOK (Must be before early return!) ──
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setBusy(true); setError("");
            try {
                const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await res.json();

                const { data } = await api.googleAuth(tokenResponse.access_token);

                if (!data.user.first_name) {
                    setEmail(profile.email);
                    setIsNewUser(true);
                    setStep(3);
                } else {
                    window.location.reload();
                }
            } catch (err) {
                setError(parseErr(err));
            } finally {
                setBusy(false);
            }
        },
        onError: () => setError("Google login failed. Please try again."),
    });

    // ── 4. Helper Functions ──
    const parseErr = (err) => {
        const data = err.response?.data;
        if (!data) return "Something went wrong. Please try again.";
        if (typeof data === 'string') return data;
        if (data.detail) return data.detail;
        return data.error || "Something went wrong.";
    };

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        if (!email) return;
        setBusy(true); setError("");
        try {
            await api.sendOtp(email);
            setStep(2);
            setCountdown(30);
        } catch (err) {
            setError(parseErr(err));
        } finally {
            setBusy(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) return;
        setBusy(true); setError("");
        try {
            const { data } = await api.verifyOtp({ email, code: otp });

            if (data.is_new_user) {
                setIsNewUser(true);
                setStep(3);
            } else {
                window.location.reload();
            }
        } catch (err) {
            const errMsg = parseErr(err);
            if (errMsg.includes("First name is required")) {
                setIsNewUser(true);
                setStep(3);
            } else {
                setError(errMsg);
            }
        } finally {
            setBusy(false);
        }
    };

    const handleCompleteProfile = async (e) => {
        e.preventDefault();
        if (!firstName) return;
        setBusy(true); setError("");
        try {
            await api.verifyOtp({ email, code: otp, first_name: firstName, last_name: lastName });
            window.location.reload();
        } catch (err) {
            setError(parseErr(err));
        } finally {
            setBusy(false);
        }
    };

    // ── 5. EARLY RETURN (Safe to do this AFTER all hooks) ──
    if (!mounted) return null;

    // ── 6. Styling Constants ──
    const inputCls = "w-full bg-white border border-[#E5BDB0] rounded-xl px-4 py-3.5 text-sm text-[#1A2536] placeholder-[#1A2536]/40 focus:outline-none focus:border-[#1A2536] transition-colors";
    const labelCls = "text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-1.5";

    // ── 7. JSX RENDER ──
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
                    <div className="absolute top-20 left-20 w-96 h-96 bg-[#E5BDB0]/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative h-full flex flex-col items-center justify-center text-white p-16 text-center max-w-lg mx-auto">
                        <div className="mb-8">
                            <span className="font-serif-luxury text-4xl tracking-[0.2em] text-white">YA<span className="text-[#B86B5A]">-</span>RA</span>
                        </div>
                        <p className="font-cursive text-3xl text-[#E5BDB0] mb-4">every diamond tells your story</p>
                        <h2 className="font-serif-luxury text-white text-4xl leading-tight mb-6 font-normal">Welcome to YA-RA</h2>
                        <p className="text-sm text-white/70 max-w-xs leading-relaxed">
                            Discover certified natural earth-mined diamonds, handcrafted in 14Kt & 18Kt gold.
                        </p>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="flex items-center justify-center px-6 sm:px-8 lg:px-12 py-12 bg-white">
                    <div className="w-full max-w-md">

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl mb-6 font-semibold text-center">
                                {error}
                            </div>
                        )}

                        {/* STEP 1: EMAIL / GOOGLE */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">welcome back</span>
                                    <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Sign In or Create Account</h1>
                                    <p className="text-sm text-[#1A2536]/60 mt-2">We'll email you a secure 6-digit code.</p>
                                </div>

                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div>
                                        <label className={labelCls}>Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            className={inputCls}
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={busy || !email}
                                        className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {busy ? "Sending Code…" : "Continue with Email"}
                                    </button>
                                </form>

                                <div className="flex items-center gap-4 my-6">
                                    <div className="flex-1 h-px bg-[#E5BDB0]/40"></div>
                                    <span className="text-[10px] uppercase tracking-widest text-[#1A2536]/50 font-bold">Or</span>
                                    <div className="flex-1 h-px bg-[#E5BDB0]/40"></div>
                                </div>

                                <button
                                    onClick={() => handleGoogleLogin()}
                                    disabled={busy}
                                    className="w-full py-3.5 border border-[#E5BDB0] hover:bg-[#1A2536]/[0.03] text-[#1A2536] text-sm font-bold rounded-full transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </button>
                            </div>
                        )}

                        {/* STEP 2: OTP VERIFICATION */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">check your inbox</span>
                                    <h1 className="font-serif-luxury text-3xl font-normal text-[#1A2536]">Enter Verification Code</h1>
                                    <p className="text-sm text-[#1A2536]/60 mt-2">
                                        We sent a 6-digit code to <br />
                                        <span className="font-bold text-[#1A2536]">{email}</span>
                                    </p>
                                </div>

                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div>
                                        <input
                                            required
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            className="w-full bg-white border border-[#E5BDB0] rounded-xl px-4 py-4 text-2xl text-center tracking-[0.5em] font-mono font-bold text-[#1A2536] focus:outline-none focus:border-[#1A2536] transition-colors"
                                            placeholder="• • • • • •"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={busy || otp.length !== 6}
                                        className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {busy ? "Verifying…" : "Verify & Continue"}
                                    </button>
                                </form>

                                <div className="text-center text-sm">
                                    <span className="text-[#1A2536]/60">Didn't get the code? </span>
                                    {countdown > 0 ? (
                                        <span className="text-[#1A2536]/40">Resend in {countdown}s</span>
                                    ) : (
                                        <button onClick={handleSendOtp} className="text-[#B86B5A] font-bold hover:underline">Resend Code</button>
                                    )}
                                </div>

                                <button onClick={() => setStep(1)} className="w-full text-center text-xs text-[#1A2536]/50 hover:text-[#1A2536] font-bold uppercase tracking-wider">
                                    ← Change Email
                                </button>
                            </div>
                        )}

                        {/* STEP 3: NEW USER PROFILE */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">join the family</span>
                                    <h1 className="font-serif-luxury text-3xl font-normal text-[#1A2536]">Welcome to YA-RA!</h1>
                                    <p className="text-sm text-[#1A2536]/60 mt-2">Just need a few details to set up your account.</p>
                                </div>

                                <form onSubmit={handleCompleteProfile} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>First Name</label>
                                            <input required className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Last Name</label>
                                            <input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={busy || !firstName}
                                        className="w-full py-4 mt-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {busy ? "Creating Account…" : "Complete Setup"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}