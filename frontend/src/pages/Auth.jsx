import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import usePageTitle from "../utils/usePageTitle";

const inputCls =
    "w-full bg-transparent border-b border-charcoal/25 py-3 text-sm focus:outline-none focus:border-gold placeholder-charcoal/40";

export default function AuthPage() {
    const { user, login, register } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isRegister = location.pathname === "/register";

    usePageTitle(isRegister ? "Create Account" : "Welcome Back");

    const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
    const [regForm, setRegForm] = useState({ first_name: "", last_name: "", email: "", phone: "", password: "", confirm: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const from = location.state?.from ?? "/";
    useEffect(() => { if (user) navigate(from, { replace: true }); }, [user, from, navigate]);

    const parseErr = (err) =>
        Object.values(err.response?.data ?? {}).flat().join(" ") || "Something went wrong. Please try again.";

    const doLogin = async (e) => {
        e.preventDefault();
        setBusy(true); setError("");
        try { await login(loginForm.identifier, loginForm.password); navigate(from, { replace: true }); }
        catch (err) { setError(parseErr(err)); setBusy(false); }
    };

    const doRegister = async (e) => {
        e.preventDefault();
        if (regForm.password !== regForm.confirm) { setError("Passwords do not match."); return; }
        setBusy(true); setError("");
        try {
            await register({
                first_name: regForm.first_name,
                last_name: regForm.last_name,
                email: regForm.email,
                phone: regForm.phone,
                phone_number: regForm.phone,
                password: regForm.password,
            });
            navigate(from, { replace: true });
        } catch (err) { setError(parseErr(err)); setBusy(false); }
    };

    return (
        <div className="grid lg:grid-cols-2 min-h-[80vh]">
            {/* Campaign panel */}
            <div className="relative hidden lg:block">
                <img
                    src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop"
                    alt="YA-RA fine jewellery"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-charcoal/40 flex flex-col items-center justify-center text-ivory p-12">
                    <p className="text-3xl font-serif tracking-[0.3em] mb-6">YA-RA</p>
                    <p className="font-serif italic text-3xl text-center leading-snug">
                        Every diamond<br />tells your story.
                    </p>
                </div>
            </div>

            {/* Form panel */}
            <div className="flex items-center justify-center px-6 py-16">
                <div className="w-full max-w-md">
                    <h1 className="text-4xl font-serif mb-10">{isRegister ? "Create Account" : "Welcome Back"}</h1>

                    {error && <p className="text-xs text-red-700 mb-6">{error}</p>}

                    {isRegister ? (
                        <form onSubmit={doRegister} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <input required className={inputCls} placeholder="First Name" value={regForm.first_name} onChange={(e) => setRegForm({ ...regForm, first_name: e.target.value })} />
                                <input required className={inputCls} placeholder="Last Name" value={regForm.last_name} onChange={(e) => setRegForm({ ...regForm, last_name: e.target.value })} />
                            </div>
                            <input required type="email" className={inputCls} placeholder="Email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
                            <input required className={inputCls} placeholder="Phone (+91)" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} />
                            <input required type="password" className={inputCls} placeholder="Password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} />
                            <input required type="password" className={inputCls} placeholder="Confirm Password" value={regForm.confirm} onChange={(e) => setRegForm({ ...regForm, confirm: e.target.value })} />
                            <button type="submit" disabled={busy} className="btn-solid w-full disabled:opacity-50">
                                {busy ? "Creating…" : "Create Account"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={doLogin} className="space-y-6">
                            <input required className={inputCls} placeholder="Email" value={loginForm.identifier} onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })} />
                            <input required type="password" className={inputCls} placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                            <button type="submit" disabled={busy} className="btn-solid w-full disabled:opacity-50">
                                {busy ? "Signing in…" : "Sign In"}
                            </button>
                        </form>
                    )}

                    <div className="hairline border-t border-charcoal/15 mt-10 pt-6 flex items-center justify-between text-sm">
                        <Link to={isRegister ? "/login" : "/register"} className="text-gold underline underline-offset-4">
                            {isRegister ? "Sign in instead" : "Create an account"}
                        </Link>
                        <button onClick={() => navigate("/")} className="text-charcoal/60 hover:text-gold">
                            Continue as Guest
                        </button>
                    </div>

                    <p className="micro-label text-charcoal/50 mt-8 text-center">
                        Track Orders · Wishlist · Faster Checkout · Loyalty Rewards
                    </p>
                </div>
            </div>
        </div>
    );
}