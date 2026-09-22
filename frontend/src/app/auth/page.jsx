"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import api from "@/api/client";

export default function AuthPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextPath = searchParams.get("next") ?? "/";

    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        setMounted(true);
        document.title = "Sign In | YA-RA Jewels";
    }, []);

    useEffect(() => {
        if (!authLoading && user) router.replace(nextPath || "/");
    }, [user, authLoading, router, nextPath]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const isValidPhone = (val) => /^[6-9]\d{9}$/.test(val);

    const handlePhoneChange = (val) => {
        const cleaned = val.replace(/\D/g, "").slice(0, 10);
        setPhone(cleaned);
        if (cleaned.length > 0 && cleaned.length !== 10) {
            setPhoneError("Enter a valid 10-digit mobile number");
        } else if (cleaned.length === 10 && !isValidPhone(cleaned)) {
            setPhoneError("Number must start with 6, 7, 8, or 9");
        } else {
            setPhoneError("");
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setBusy(true);
            setError("");
            try {
                const { data } = await api.googleAuth(tokenResponse.access_token);
                if (data.status === 'success') {
                    window.location.href = nextPath;
                }
            } catch (err) {
                setError(parseErr(err));
            } finally {
                setBusy(false);
            }
        },
        onError: () => setError("Google login failed."),
    });

    const parseErr = (err) => {
        const data = err.response?.data;
        if (!data) return "Something went wrong.";
        if (typeof data === 'string') return data;
        if (data.detail) return data.detail;
        return data.error || "Something went wrong.";
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) return;
        setError("");
        setBusy(true);
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
        setError("");
        setBusy(true);
        try {
            const { data } = await api.verifyOtp({ email, code: otp });
            if (data.is_new_user) {
                setStep(3);
            } else {
                window.location.href = nextPath;
            }
        } catch (err) {
            if (err.response?.data?.error?.includes("First name is required")) {
                setStep(3);
            } else {
                setError(parseErr(err));
            }
        } finally {
            setBusy(false);
        }
    };

    const handleCompleteProfile = async (e) => {
        e.preventDefault();
        if (!firstName) return;
        setError("");
        setBusy(true);
        try {
            await api.verifyOtp({
                email,
                code: otp,
                first_name: firstName,
                last_name: lastName,
                phone: isValidPhone(phone) ? phone : undefined
            });
            window.location.href = nextPath;
        } catch (err) {
            setError(parseErr(err));
        } finally {
            setBusy(false);
        }
    };

    if (!mounted) return null;

    const inputCls = "w-full bg-white border border-[#E5BDB0] rounded-xl px-4 py-3.5 text-sm text-[#1A2536] placeholder-[#1A2536]/40 focus:outline-none focus:border-[#1A2536] transition-colors";
    const labelCls = "text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-1.5";

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <meta name="robots" content="noindex, nofollow" />
            <div className="flex-1 grid lg:grid-cols-[55fr_45fr]">
                <div className="relative hidden lg:block bg-[#1A2536] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1A2536]/90 via-[#1A2536]/70 to-[#111A29]/90"></div>
                    <div className="relative h-full flex flex-col items-center justify-center text-white p-16 text-center max-w-lg mx-auto">
                        <span className="font-serif-luxury text-4xl tracking-[0.2em] text-white">
                            YA<span className="text-[#B86B5A]">-</span>RA
                        </span>
                        <p className="font-cursive text-3xl text-[#E5BDB0] mt-4 mb-4">
                            every diamond tells your story
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-center px-6 sm:px-8 lg:px-12 py-12 bg-white">
                    <div className="w-full max-w-md">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl mb-6 font-semibold text-center">
                                {error}
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">welcome back</span>
                                    <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">
                                        Sign In
                                    </h1>
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
                                        className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl disabled:opacity-50"
                                    >
                                        {busy ? "Sending Code…" : "Continue"}
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

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">
                                        check your inbox
                                    </span>
                                    <h1 className="font-serif-luxury text-3xl font-normal text-[#1A2536]">
                                        Enter Verification Code
                                    </h1>
                                    <p className="text-sm text-[#1A2536]/60 mt-2">
                                        We sent a 6-digit code to <br />
                                        <span className="font-bold text-[#1A2536]">{email}</span>
                                    </p>
                                </div>

                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <input
                                        required
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        className="w-full bg-white border border-[#E5BDB0] rounded-xl px-4 py-4 text-2xl text-center tracking-[0.5em] font-mono font-bold text-[#1A2536] focus:outline-none focus:border-[#1A2536]"
                                        placeholder="• • • • • •"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={busy || otp.length !== 6}
                                        className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl disabled:opacity-50"
                                    >
                                        {busy ? "Verifying…" : "Verify & Continue"}
                                    </button>
                                </form>

                                <div className="text-center text-sm">
                                    {countdown > 0 ? (
                                        <span className="text-[#1A2536]/40">Resend in {countdown}s</span>
                                    ) : (
                                        <button onClick={handleSendOtp} className="text-[#B86B5A] font-bold hover:underline">
                                            Resend Code
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setStep(1)}
                                    className="w-full text-center text-xs text-[#1A2536]/50 hover:text-[#1A2536] font-bold uppercase tracking-wider"
                                >
                                    ← Change Email
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">
                                        join the family
                                    </span>
                                    <h1 className="font-serif-luxury text-3xl font-normal text-[#1A2536]">
                                        Welcome to YA-RA!
                                    </h1>
                                    <p className="text-sm text-[#1A2536]/60 mt-2">
                                        Just need a few details to set up your account.
                                    </p>
                                </div>

                                <form onSubmit={handleCompleteProfile} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>First Name *</label>
                                            <input
                                                required
                                                className={inputCls}
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Last Name</label>
                                            <input
                                                className={inputCls}
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelCls}>
                                            Mobile Number <span className="text-[#1A2536]/40 normal-case tracking-normal">(Optional - for order updates)</span>
                                        </label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-4 border border-r-0 border-[#E5BDB0] rounded-l-xl bg-[#1A2536]/[0.03] text-[#1A2536] text-sm font-bold">
                                                +91
                                            </span>
                                            <input
                                                type="tel"
                                                maxLength={10}
                                                className={`flex-1 border rounded-r-xl px-4 py-3.5 text-sm focus:outline-none transition-colors ${
                                                    phoneError
                                                        ? "border-red-500 focus:border-red-500"
                                                        : "border-[#E5BDB0] focus:border-[#1A2536]"
                                                }`}
                                                placeholder="10-digit mobile number"
                                                value={phone}
                                                onChange={(e) => handlePhoneChange(e.target.value)}
                                            />
                                        </div>
                                        {phoneError && (
                                            <p className="text-[10px] text-red-500 font-semibold mt-1.5">{phoneError}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={busy || !firstName || (phone.length > 0 && !isValidPhone(phone))}
                                        className="w-full py-4 mt-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl disabled:opacity-50"
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