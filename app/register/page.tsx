"use client";

import { useState, useCallback } from "react";
import Input from "../components/ui/Input";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
    fullName: string;
    age: string;
    gender: string;
    dob: string;
    class: string;
    schoolName: string;
    mobile: string;
}

interface FormErrors {
    fullName?: string;
    age?: string;
    gender?: string;
    dob?: string;
    class?: string;
    mobile?: string;
    general?: string;
}

const INITIAL_FORM: FormData = {
    fullName: "",
    age: "",
    gender: "",
    dob: "",
    class: "",
    schoolName: "",
    mobile: "",
};

const CLASSES = [
    "Class 2", "Class 3", "Class 4", "Class 5", "Class 6",
    "Class 7", "Class 8", "Class 9", "Class 10", "Class 11",
    "Class 12", "12 Passout",
];

// ─── Chess piece SVG (king silhouette) ────────────────────────────────────────

const KingIcon = () => (
    <svg viewBox="0 0 60 80" fill="currentColor" className="w-full h-full">
        <rect x="22" y="2" width="16" height="5" rx="2" />
        <rect x="27" y="0" width="6" height="9" rx="2" />
        <path d="M10 22 Q15 14 30 14 Q45 14 50 22 L54 50 H6 Z" />
        <rect x="4" y="50" width="52" height="10" rx="3" />
        <rect x="2" y="60" width="56" height="14" rx="4" />
    </svg>
);

// ─── Success Card ─────────────────────────────────────────────────────────────

const SuccessCard = ({ onReset }: { onReset: () => void }) => (
    <div className="success-card flex flex-col items-center justify-center text-center py-14 px-8 gap-6">
        {/* Animated checkmark */}
        <div className="relative">
            <div className="w-24 h-24 rounded-full border-2 border-yellow-400/40 flex items-center justify-center animate-pulse-gold">
                <div className="w-16 h-16 rounded-full bg-yellow-400/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-yellow-400 checkmark-draw" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
            </div>
            {/* Orbiting chess piece */}
            <div className="absolute inset-0 orbit-ring">
                <div className="orbit-piece text-yellow-400/60 w-5 h-5">
                    <KingIcon />
                </div>
            </div>
        </div>

        <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Cinzel', serif" }}>
                Registration <span className="text-yellow-400">Successful!</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                See you at the{" "}
                <span className="text-yellow-400 font-medium">XL Classes Chess Championship!</span>
                <br />
                Prepare your opening moves. ♟
            </p>
        </div>

        <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

        <button
            onClick={onReset}
            className="btn-gold px-8 py-3 rounded-xl text-sm font-semibold text-black tracking-widest uppercase"
        >
            Register Another
        </button>
    </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────

const Toast = ({ message, type }: { message: string; type: "success" | "error" }) => (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium shadow-2xl toast-in
    ${type === "success"
            ? "bg-yellow-400 text-black"
            : "bg-red-500/90 text-white backdrop-blur-md border border-red-400/30"
        }`}>
        {type === "success" ? (
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
        ) : (
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
        )}
        {message}
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
    const [form, setForm] = useState<FormData>(INITIAL_FORM);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setForm((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        },
        []
    );

    // Client-side validation
    const validate = (): FormErrors => {
        const errs: FormErrors = {};
        if (!form.fullName.trim()) errs.fullName = "Full name is required.";
        if (!form.age) {
            errs.age = "Age is required.";
        } else if (isNaN(Number(form.age)) || Number(form.age) < 1) {
            errs.age = "Enter a valid age.";
        } else if (Number(form.age) >= 19) {
            errs.age = "Age must be less than 19 to participate.";
        }
        if (!form.gender) errs.gender = "Please select your gender.";
        if (!form.dob) errs.dob = "Date of birth is required.";
        if (!form.class) errs.class = "Please select your class.";
        if (!form.mobile.trim()) {
            errs.mobile = "Mobile number is required.";
        } else if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
            errs.mobile = "Enter a valid 10-digit mobile number.";
        }
        return errs;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const clientErrors = validate();
        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (data.success) {
                showToast("Registration Successful!", "success");
                setSuccess(true);
            } else if (data.errors) {
                setErrors(data.errors as FormErrors);
                showToast("Please fix the errors below.", "error");
            } else {
                showToast(data.message ?? "Something went wrong.", "error");
            }
        } catch {
            showToast("Network error. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm(INITIAL_FORM);
        setErrors({});
        setSuccess(false);
    };

    return (
        <>
            {/* Global styles injected inline for single-file portability */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Jost:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        body {
          font-family: 'Jost', sans-serif;
          background: #0a0a0a;
          margin: 0;
        }

        /* ── Chessboard background ── */
        .chess-bg {
          background-color: #0a0a0a;
          background-image:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(250,204,21,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 110%, rgba(250,204,21,0.06) 0%, transparent 55%),
            repeating-conic-gradient(#111111 0% 25%, #0d0d0d 25% 50%);
          background-size: auto, auto, 48px 48px;
        }

        /* ── Animated gradient orb ── */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.08;
          pointer-events: none;
          animation: drift 12s ease-in-out infinite alternate;
        }
        .orb-1 { width: 600px; height: 600px; background: #facc15; top: -200px; left: -200px; animation-delay: 0s; }
        .orb-2 { width: 400px; height: 400px; background: #facc15; bottom: -150px; right: -100px; animation-delay: -6s; }

        @keyframes drift {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(60px, 40px) scale(1.15); }
        }

        /* ── Page entrance ── */
        .page-enter { animation: pageIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Glass card ── */
        .glass-card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow:
            0 0 0 1px rgba(250,204,21,0.06),
            0 32px 80px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.06);
        }

        /* ── Gold gradient header bar ── */
        .gold-bar {
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.6), rgba(250,204,21,0.9), rgba(250,204,21,0.6), transparent);
          height: 1px;
        }

        /* ── Gold button ── */
        .btn-gold {
          background: linear-gradient(135deg, #facc15, #f59e0b);
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(250,204,21,0.3);
        }
        .btn-gold::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #fde68a, #facc15);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(250,204,21,0.45); }
        .btn-gold:hover::before { opacity: 1; }
        .btn-gold:active { transform: translateY(0); }
        .btn-gold span, .btn-gold svg { position: relative; z-index: 1; }

        /* ── select option dark bg ── */
        select option { background: #111; color: #fff; }

        /* ── Focus glow on inputs ── */
        input:focus, select:focus {
          box-shadow: 0 0 0 3px rgba(250,204,21,0.15);
        }

        /* ── Success card ── */
        .success-card { animation: successIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @keyframes successIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* ── Checkmark draw animation ── */
        .checkmark-draw {
          stroke-dasharray: 30;
          stroke-dashoffset: 30;
          animation: drawCheck 0.5s 0.3s ease forwards;
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }

        /* ── Gold pulse ── */
        @keyframes pulseGold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(250,204,21,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(250,204,21,0); }
        }
        .animate-pulse-gold { animation: pulseGold 2s ease infinite; }

        /* ── Orbit ring ── */
        .orbit-ring {
          animation: orbit 4s linear infinite;
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(52px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(52px) rotate(-360deg); }
        }
        .orbit-piece { position: absolute; top: 50%; left: 50%; margin: -10px 0 0 -10px; }

        /* ── Toast ── */
        .toast-in { animation: toastIn 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* ── Stagger form fields ── */
        .field-stagger > * {
          opacity: 0;
          animation: fieldIn 0.5s ease forwards;
        }
        .field-stagger > *:nth-child(1)  { animation-delay: 0.1s; }
        .field-stagger > *:nth-child(2)  { animation-delay: 0.15s; }
        .field-stagger > *:nth-child(3)  { animation-delay: 0.2s; }
        .field-stagger > *:nth-child(4)  { animation-delay: 0.25s; }
        .field-stagger > *:nth-child(5)  { animation-delay: 0.3s; }
        .field-stagger > *:nth-child(6)  { animation-delay: 0.35s; }
        .field-stagger > *:nth-child(7)  { animation-delay: 0.4s; }
        .field-stagger > *:nth-child(8)  { animation-delay: 0.45s; }
        @keyframes fieldIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Divider gradient ── */
        .divider { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); height: 1px; }

        /* ── Spinner ── */
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(0,0,0,0.3);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

            {/* Background */}
            <div className="chess-bg min-h-screen relative overflow-hidden">
                {/* Ambient orbs */}
                <div className="orb orb-1" />
                <div className="orb orb-2" />

                {/* Centered layout */}
                <div className="relative z-10 min-h-screen flex flex-col items-center justify-start py-10 px-4 page-enter">

                    {/* ── Header ─────────────────────────────── */}
                    <div className="flex flex-col items-center mb-8 text-center">
                        {/* King chess piece icon */}
                        <div className="w-10 h-12 text-yellow-400 mb-3 opacity-80">
                            <KingIcon />
                        </div>

                        <p className="text-yellow-400/80 text-xs tracking-[0.3em] uppercase font-medium mb-1">
                            XL Classes Presents
                        </p>
                        <h1
                            className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight"
                            style={{ fontFamily: "'Cinzel', serif" }}
                        >
                            Under 19 -{" "}
                            <span className="text-yellow-400">XL Checkmate</span>
                            <br />
                            Championship
                        </h1>
                        <p className="text-white/40 text-xs tracking-[0.2em] mt-2 uppercase">
                            Learn Today · Lead Tomorrow
                        </p>
                    </div>

                    {/* ── Glass Card ─────────────────────────── */}
                    <div className="glass-card rounded-2xl w-full max-w-2xl overflow-hidden">

                        {/* Gold top bar */}
                        <div className="gold-bar" />

                        {success ? (
                            <SuccessCard onReset={handleReset} />
                        ) : (
                            <div className="p-6 sm:p-8">
                                <div className="mb-6">
                                    <h2
                                        className="text-lg font-bold text-white"
                                        style={{ fontFamily: "'Cinzel', serif" }}
                                    >
                                        Player Registration
                                    </h2>
                                    <p className="text-white/40 text-xs mt-1">
                                        Fill in your details to secure your spot at the championship.
                                    </p>
                                </div>

                                <div className="divider mb-6" />

                                <form onSubmit={handleSubmit} noValidate>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 field-stagger">

                                        {/* Full Name */}
                                        <div className="sm:col-span-2">
                                            <Input
                                                as="input"
                                                label="Full Name"
                                                name="fullName"
                                                type="text"
                                                placeholder="e.g. Arjun Sharma"
                                                value={form.fullName}
                                                onChange={handleChange}
                                                error={errors.fullName}
                                                required
                                            />
                                        </div>

                                        {/* Age */}
                                        <Input
                                            as="input"
                                            label="Age"
                                            name="age"
                                            type="number"
                                            placeholder="e.g. 15"
                                            min={1}
                                            max={18}
                                            value={form.age}
                                            onChange={handleChange}
                                            error={errors.age}
                                            required
                                        />

                                        {/* Gender */}
                                        <Input
                                            as="select"
                                            label="Gender"
                                            name="gender"
                                            value={form.gender}
                                            onChange={handleChange}
                                            error={errors.gender}
                                            required
                                        >
                                            <option value="" disabled>Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </Input>

                                        {/* Date of Birth */}
                                        <Input
                                            as="input"
                                            label="Date of Birth"
                                            name="dob"
                                            type="date"
                                            value={form.dob}
                                            onChange={handleChange}
                                            error={errors.dob}
                                            required
                                            style={{ colorScheme: "dark" }}
                                        />

                                        {/* Class */}
                                        <Input
                                            as="select"
                                            label="Class"
                                            name="class"
                                            value={form.class}
                                            onChange={handleChange}
                                            error={errors.class}
                                            required
                                        >
                                            <option value="" disabled>Select class</option>
                                            {CLASSES.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </Input>

                                        {/* School Name */}
                                        <div className="sm:col-span-2">
                                            <Input
                                                as="input"
                                                label="School Name"
                                                name="schoolName"
                                                type="text"
                                                placeholder="e.g. XYZ School"
                                                value={form.schoolName}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* Mobile */}
                                        <div className="sm:col-span-2">
                                            <Input
                                                as="input"
                                                label="Mobile Number"
                                                name="mobile"
                                                type="tel"
                                                placeholder="10-digit mobile number"
                                                maxLength={10}
                                                value={form.mobile}
                                                onChange={handleChange}
                                                error={errors.mobile}
                                                required
                                            />
                                        </div>

                                        {/* General error */}
                                        {errors.general && (
                                            <div className="sm:col-span-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                                                {errors.general}
                                            </div>
                                        )}

                                        {/* Submit */}
                                        <div className="sm:col-span-2 mt-2">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="btn-gold w-full py-3.5 rounded-xl text-sm font-bold text-black tracking-widest uppercase disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2.5"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="spinner" />
                                                        <span>Registering...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>Register for Championship</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Gold bottom bar */}
                        <div className="gold-bar" />
                    </div>


                </div>
            </div>

            {/* Toast notification */}
            {toast && <Toast message={toast.message} type={toast.type} />}
        </>
    );
}