"use client";

import { useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import api from "@/api/client";

export default function PhoneVerificationModal({ isOpen, onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const recaptchaContainerRef = useRef(null);
    const recaptchaVerifierRef = useRef(null);

    const cleanupRecaptcha = () => {
        if (recaptchaVerifierRef.current) {
            try {
                recaptchaVerifierRef.current.clear();
            } catch (e) {
                // Ignore cleanup errors
            }
            recaptchaVerifierRef.current = null;
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const formattedPhone = `+91${phone}`;

        try {
            // ALWAYS create a fresh RecaptchaVerifier right before sending
            cleanupRecaptcha();

            if (!recaptchaContainerRef.current) {
                throw new Error("reCAPTCHA container not found");
            }

            recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
                size: "invisible",
            });

            const appVerifier = recaptchaVerifierRef.current;
            const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            setConfirmationResult(result);
            setStep(2);
        } catch (err) {
            console.error("OTP send error:", err);
            if (err.code === "auth/too-many-requests") {
                setError("Too many attempts. Please wait a few minutes and try again.");
            } else if (err.code === "auth/invalid-phone-number") {
                setError("Invalid phone number. Please check and try again.");
            } else {
                setError("Failed to send OTP. Please try again.");
            }
            cleanupRecaptcha();
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await confirmationResult.confirm(otp);
            const firebaseUser = result.user;
            const idToken = await firebaseUser.getIdToken();

            // Send ID token to backend to verify and save
            const { data } = await api.post("/auth/verify-phone/", { idToken });

            if (onSuccess) onSuccess(data);
            handleClose();
        } catch (err) {
            console.error("OTP verify error:", err);
            if (err.code === "auth/invalid-verification-code") {
                setError("Invalid OTP. Please check the code and try again.");
            } else {
                setError("Verification failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        cleanupRecaptcha();
        setStep(1);
        setPhone("");
        setOtp("");
        setConfirmationResult(null);
        setError("");
        if (onClose) onClose();
    };

    const handleChangeNumber = () => {
        cleanupRecaptcha();
        setStep(1);
        setOtp("");
        setConfirmationResult(null);
        setError("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#E5BDB0]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif-luxury text-2xl text-[#1A2536]">Verify Phone Number</h2>
                    <button onClick={handleClose} className="text-[#1A2536]/50 hover:text-[#1A2536] text-2xl leading-none">&times;</button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl mb-6 font-semibold text-center">
                        {error}
                    </div>
                )}

                {/* This div MUST always be rendered for RecaptchaVerifier to attach to */}
                <div id="recaptcha-container" ref={recaptchaContainerRef}></div>

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <p className="text-sm text-[#1A2536]/70">To complete your checkout, please verify your mobile number via SMS.</p>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-1.5">Mobile Number</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-4 border border-r-0 border-[#E5BDB0] rounded-l-xl bg-[#1A2536]/[0.03] text-[#1A2536] text-sm font-bold">+91</span>
                                <input
                                    type="tel"
                                    required
                                    maxLength={10}
                                    pattern="[6-9][0-9]{9}"
                                    className="flex-1 border border-[#E5BDB0] rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A2536] transition-colors"
                                    placeholder="10-digit mobile number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || phone.length !== 10}
                            className="w-full py-3.5 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Sending OTP…" : "Send OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <p className="text-sm text-[#1A2536]/70">
                            We sent a 6-digit code to <span className="font-bold text-[#1A2536]">+91 {phone}</span>
                        </p>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1A2536] block mb-1.5">Enter OTP</label>
                            <input
                                type="text"
                                required
                                inputMode="numeric"
                                maxLength={6}
                                className="w-full border border-[#E5BDB0] rounded-xl px-4 py-3 text-2xl text-center tracking-[0.5em] font-mono font-bold text-[#1A2536] focus:outline-none focus:border-[#1A2536] transition-colors"
                                placeholder="• • • • • •"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full py-3.5 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Verifying…" : "Verify & Continue"}
                        </button>
                        <button
                            type="button"
                            onClick={handleChangeNumber}
                            className="w-full text-center text-xs text-[#1A2536]/50 hover:text-[#1A2536] font-bold uppercase tracking-wider"
                        >
                            ← Change Number
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}