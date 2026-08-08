import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const isRegister = location.pathname === "/register";
    const from = location.state?.from || "/account";

    const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        if (isRegister && !/^[6-9]\d{9}$/.test(form.phone)) {
            setError("Phone must be a valid 10-digit Indian mobile number.");
            return;
        }
        setBusy(true);
        try {
            if (isRegister) {
                const [first_name, ...rest] = form.name.trim().split(" ");
                await register({ first_name, last_name: rest.join(" "), email: form.email, phone: form.phone, password: form.password });
            } else {
                await login(form.email, form.password); // email field doubles as email OR phone
            }
            navigate(from, { replace: true });
        } catch (err) {
            const detail = err.response?.data?.detail || err.response?.data;
            setError(typeof detail === "string" ? detail : "Something went wrong. Please check your details.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="grid min-h-[80vh] lg:grid-cols-2">
            <div className="hidden flex-col justify-between bg-pine p-12 text-ivory lg:flex">
                <p className="font-display text-2xl tracking-[0.3em]">VAIRA<span className="ml-1 text-gold">◆</span></p>
                <div>
                    <p className="max-w-sm font-display text-4xl italic leading-snug text-champagne">
                        “A diamond is the slowest kind of lightning — we just give it a setting.”
                    </p>
                    <ul className="mt-10 space-y-3 text-[11px] uppercase tracking-[0.25em] text-ivory/60">
                        {["IGI certificate with every stone", "BIS 916 hallmarked gold", "Free insured shipping across India", "Lifetime exchange promise"].map((t) => (
                            <li key={t} className="flex items-center gap-3"><span className="h-1 w-1 rotate-45 bg-gold" />{t}</li>
                        ))}
                    </ul>
                </div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/40">Est. 2026 · Jaipur</p>
            </div>

            <div className="flex items-center justify-center px-5 py-16">
                <div className="w-full max-w-md">
                    <p className="eyebrow">{isRegister ? "Create account" : "Welcome back"}</p>
                    <h1 className="mt-3 font-display text-4xl tracking-tight">
                        {isRegister ? "Join the house" : "Sign in"}
                    </h1>
                    <p className="mt-2 text-sm text-ink/60">
                        {isRegister
                            ? "Phone is mandatory — we use it for order updates and delivery OTPs."
                            : "Use your email or your registered phone number."}
                    </p>

                    {error && <p className="mt-5 border border-rust/30 bg-rust/10 px-4 py-3 text-sm text-rust">{error}</p>}

                    <form onSubmit={submit} className="mt-7 space-y-4">
                        {isRegister && (
                            <input className="input" placeholder="Full name" value={form.name} onChange={set("name")} required />
                        )}
                        <input className="input" type={isRegister ? "email" : "text"}
                            placeholder={isRegister ? "Email address" : "Email or phone number"}
                            value={form.email} onChange={set("email")} required />
                        {isRegister && (
                            <div className="flex">
                                <span className="flex items-center border border-r-0 border-ink/20 bg-parchment px-4 text-sm text-ink/60">+91</span>
                                <input className="input" inputMode="numeric" maxLength={10} placeholder="10-digit mobile number *"
                                    value={form.phone} onChange={set("phone")} required />
                            </div>
                        )}
                        <input className="input" type="password" placeholder="Password" minLength={8}
                            value={form.password} onChange={set("password")} required />

                        <button disabled={busy} className="btn-gold w-full disabled:opacity-50">
                            {busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
                        </button>
                    </form>

                    <p className="mt-6 text-sm text-ink/60">
                        {isRegister ? (
                            <>Already have an account? <Link to="/login" state={{ from }} className="text-gold-deep underline-offset-4 hover:underline">Sign in</Link></>
                        ) : (
                            <>New to VAIRA? <Link to="/register" state={{ from }} className="text-gold-deep underline-offset-4 hover:underline">Create an account</Link></>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}