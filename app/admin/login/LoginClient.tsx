"use client";
export const dynamic = "force-dynamic";

// app/admin/login/page.tsx

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("from") ?? "/admin";

    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!password.trim() || loading) return;

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (data.success) {
                // Small delay so the success state is visible before redirect
                await new Promise((r) => setTimeout(r, 180));
                router.replace(redirectTo);
            } else {
                setError(data.message ?? "Incorrect password.");
                setShake(true);
                setPassword("");
                setTimeout(() => setShake(false), 600);
                inputRef.current?.focus();
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .al-root {
          min-height: 100vh;
          background: #080808;
          background-image:
            radial-gradient(ellipse 65% 45% at 50% -5%, rgba(250,204,21,0.08) 0%, transparent 65%),
            repeating-conic-gradient(#0f0f0f 0% 25%, #0a0a0a 25% 50%);
          background-size: auto, 44px 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'DM Sans', sans-serif;
        }

        /* Ambient orb */
        .al-orb {
          position: fixed;
          top: -180px; left: 50%;
          transform: translateX(-50%);
          width: 700px; height: 420px;
          background: radial-gradient(ellipse, rgba(250,204,21,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Card */
        .al-card {
          position: relative;
          width: 100%;
          max-width: 400px;
          background: rgba(12,12,12,0.92);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 40px 36px 36px;
          box-shadow:
            0 32px 80px rgba(0,0,0,0.6),
            0 0 0 1px rgba(250,204,21,0.04),
            inset 0 1px 0 rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          animation: cardIn 0.55s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Top gold line */
        .al-gold-line {
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          border-radius: 99px;
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.55), transparent);
        }

        /* Icon */
        .al-icon {
          width: 52px; height: 52px;
          background: rgba(250,204,21,0.07);
          border: 1.5px solid rgba(250,204,21,0.2);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem;
          margin: 0 auto 20px;
          color: #facc15;
          box-shadow: 0 0 24px rgba(250,204,21,0.12);
          animation: iconPulse 3s ease-in-out infinite;
        }
        @keyframes iconPulse {
          0%,100% { box-shadow: 0 0 16px rgba(250,204,21,0.1); }
          50%     { box-shadow: 0 0 32px rgba(250,204,21,0.22); }
        }

        /* Heading */
        .al-heading {
          font-family: 'Cinzel', serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          text-align: center;
          letter-spacing: 0.03em;
          line-height: 1.2;
          margin-bottom: 4px;
        }
        .al-sub {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.25);
          text-align: center;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 28px;
        }

        /* Gold divider */
        .al-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.25), transparent);
          margin-bottom: 28px;
        }

        /* Label */
        .al-label {
          display: block;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 8px;
        }

        /* Input wrapper */
        .al-input-wrap {
          position: relative;
          margin-bottom: 20px;
        }
        .al-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          font-size: 0.9rem;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          letter-spacing: 0.05em;
        }
        .al-input::placeholder { color: rgba(255,255,255,0.18); letter-spacing: 0; }
        .al-input:focus {
          border-color: rgba(250,204,21,0.4);
          background: rgba(255,255,255,0.05);
          box-shadow: 0 0 0 3px rgba(250,204,21,0.09);
        }
        .al-input.al-input-error {
          border-color: rgba(239,68,68,0.5);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.08);
        }

        /* Shake animation */
        .al-shake {
          animation: shake 0.55s cubic-bezier(0.36,0.07,0.19,0.97);
        }
        @keyframes shake {
          10%,90%  { transform: translateX(-2px); }
          20%,80%  { transform: translateX(3px); }
          30%,50%,70% { transform: translateX(-4px); }
          40%,60%  { transform: translateX(4px); }
        }

        /* Error */
        .al-error {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(239,68,68,0.07);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 9px;
          padding: 9px 12px;
          font-size: 0.75rem;
          color: rgba(239,68,68,0.85);
          margin-bottom: 18px;
          animation: errIn 0.25s ease;
        }
        @keyframes errIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Submit button */
        .al-btn {
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #0a0a0a;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          border: none;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
        }
        .al-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #facc15 0%, #f59e0b 55%, #fbbf24 100%);
          background-size: 200% 100%;
          transition: background-position 0.4s ease;
        }
        /* Shine sweep */
        .al-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%);
          transform: translateX(-110%);
          transition: transform 0.55s ease;
        }
        .al-btn:not(:disabled):hover::after { transform: translateX(110%); }
        .al-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(250,204,21,0.4);
        }
        .al-btn:active { transform: translateY(0); }
        .al-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .al-btn-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        /* Spinner */
        .al-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Footer note */
        .al-footer {
          margin-top: 22px;
          text-align: center;
          font-size: 0.62rem;
          color: rgba(255,255,255,0.12);
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
      `}</style>

            <div className="al-root">
                <div className="al-orb" />

                <div className="al-card">
                    <div className="al-gold-line" />

                    {/* Icon */}
                    <div className="al-icon">♟</div>

                    {/* Heading */}
                    <h1 className="al-heading">Admin Access</h1>
                    <p className="al-sub">XL Classes · Chess Championship</p>

                    <div className="al-divider" />

                    <form onSubmit={handleSubmit} noValidate>
                        {/* Password field */}
                        <label className="al-label" htmlFor="al-pw">
                            Admin Password
                        </label>

                        <div className={`al-input-wrap ${shake ? "al-shake" : ""}`}>
                            <input
                                ref={inputRef}
                                id="al-pw"
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError("");
                                }}
                                placeholder="Enter password"
                                autoComplete="current-password"
                                className={`al-input${error ? " al-input-error" : ""}`}
                            />
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="al-error" role="alert">
                                <svg width="13" height="13" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !password.trim()}
                            className="al-btn"
                        >
                            <span className="al-btn-inner">
                                {loading ? (
                                    <>
                                        <div className="al-spinner" />
                                        Verifying…
                                    </>
                                ) : (
                                    "Enter Dashboard"
                                )}
                            </span>
                        </button>
                    </form>

                    <p className="al-footer">Session expires after 2 hours</p>
                </div>
            </div>
        </>
    );
}
