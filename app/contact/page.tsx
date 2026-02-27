"use client";

import { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
    name: string;
    phone: string;
    email: string;
    message: string;
}

interface FormErrors {
    name?: string;
    phone?: string;
    email?: string;
    message?: string;
}

// ─── FAQ Data ────────────────────────────────────────────────────────────────

const FAQS = [
    {
        q: "How can I register for the chess championship?",
        a: "You can register through our website or by contacting us directly via WhatsApp or phone. Registration is free for all Under 19 participants.",
    },
    {
        q: "What is the age eligibility for the tournament?",
        a: "The tournament is open to students under 19 years of age. Participants must provide valid age proof at the time of registration.",
    },
    {
        q: "Where is XL Classes located?",
        a: "XL Classes is located in Rajasthan, India. You can find our exact location on the map below or contact us for directions.",
    },
];

const FEATURES = [
    {
        icon: "♟",
        title: "Strategic Thinking Development",
        desc: "Our programs are crafted to build analytical reasoning, pattern recognition, and long-term planning skills through structured chess training.",
    },
    {
        icon: "♛",
        title: "Championship-Level Coaching",
        desc: "Learn from experienced coaches who have guided students to compete at district, state, and national chess championships.",
    },
    {
        icon: "◈",
        title: "Recognized Certification",
        desc: "Students receive official certificates upon program completion — a valuable addition to their academic and competitive portfolios.",
    },
];

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
    const [open, setOpen] = useState(false);
    const bodyRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (bodyRef.current) setHeight(bodyRef.current.scrollHeight);
    }, []);

    return (
        <div className={`faq-item ${open ? "faq-open" : ""}`} style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
            <button className="faq-btn" onClick={() => setOpen((p) => !p)} aria-expanded={open}>
                <span className="faq-q">{q}</span>
                <span className={`faq-arrow ${open ? "faq-arrow-open" : ""}`}>◆</span>
            </button>
            <div
                className="faq-body"
                style={{ maxHeight: open ? height + "px" : "0px" }}
            >
                <div ref={bodyRef} className="faq-body-inner">
                    <p className="faq-a">{a}</p>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContactPage() {
    const formRef = useRef<HTMLDivElement>(null);
    const [form, setForm] = useState<FormData>({ name: "", phone: "", email: "", message: "" });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [toast, setToast] = useState(false);

    const validate = (): boolean => {
        const e: FormErrors = {};
        if (!form.name.trim()) e.name = "Full name is required";
        if (!form.phone.trim()) e.phone = "Phone number is required";
        else if (!/^\d{10}$/.test(form.phone.trim())) e.phone = "Enter a valid 10-digit phone number";
        if (!form.email.trim()) e.email = "Email address is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email address";
        if (!form.message.trim()) e.message = "Message cannot be empty";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            setToast(true);
            const msg = `Hey XL Classes,\nName: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nMessage: ${form.message}`;
            const url = `https://wa.me/919057261302?text=${encodeURIComponent(msg)}`;
            window.open(url, "_blank");
            setTimeout(() => setToast(false), 4000);
        }, 1400);
    };

    const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((p) => ({ ...p, [field]: e.target.value }));
        if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
    };

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Jost:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --gold: #facc15;
          --gold2: #f59e0b;
          --gold3: #d97706;
          --gold-dim: rgba(250,204,21,0.5);
          --gold-faint: rgba(250,204,21,0.12);
          --gold-glow: rgba(250,204,21,0.15);
          --bg: #080809;
          --bg2: #0d0d0f;
          --surface: rgba(255,255,255,0.032);
          --surface-hover: rgba(255,255,255,0.055);
          --border: rgba(255,255,255,0.07);
          --border-gold: rgba(250,204,21,0.2);
          --border-gold-bright: rgba(250,204,21,0.4);
          --text: rgba(255,255,255,0.9);
          --text-dim: rgba(255,255,255,0.45);
          --text-faint: rgba(255,255,255,0.22);
          --green: #34d399;
          --red: #f87171;
          --font-d: 'Cinzel', serif;
          --font-b: 'Jost', sans-serif;
          --radius: 18px;
          --radius-sm: 12px;
          --ease: cubic-bezier(0.22,1,0.36,1);
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-b);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* ═══════════════════════════════════════
           PAGE
        ═══════════════════════════════════════ */
        .cp {
          position: relative;
          min-height: 100vh;
          background: var(--bg);
          overflow-x: hidden;
        }

        /* Chess board micro-texture */
        .cp-tex {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: repeating-conic-gradient(
            rgba(255,255,255,0.018) 0% 25%, transparent 0% 50%
          );
          background-size: 44px 44px;
        }

        /* Top glow orb */
        .cp-orb {
          position: fixed; z-index: 0; pointer-events: none;
          top: -20vh; left: 50%;
          transform: translateX(-50%);
          width: min(900px, 130vw);
          height: 600px;
          background: radial-gradient(ellipse at 50% 0%,
            rgba(250,204,21,0.09) 0%,
            rgba(250,204,21,0.03) 40%,
            transparent 70%
          );
          border-radius: 50%;
        }

        /* Bottom right soft glow */
        .cp-orb2 {
          position: fixed; z-index: 0; pointer-events: none;
          bottom: 0; right: -10vw;
          width: 600px; height: 600px;
          background: radial-gradient(ellipse at 80% 80%,
            rgba(250,204,21,0.05) 0%, transparent 60%
          );
        }

        .cp-content { position: relative; z-index: 1; }

        /* Enter animation */
        .fade-up {
          opacity: 0;
          animation: fadeUp 0.7s var(--ease) forwards;
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ═══════════════════════════════════════
           HERO
        ═══════════════════════════════════════ */
        .hero {
          text-align: center;
          padding: clamp(64px,10vw,110px) 20px clamp(48px,7vw,80px);
          position: relative;
        }

        .hero-chess-l, .hero-chess-r {
          position: absolute; top: 50%; transform: translateY(-50%);
          font-size: clamp(4rem,8vw,9rem);
          opacity: 0.03; user-select: none; pointer-events: none;
          font-family: var(--font-d);
        }
        .hero-chess-l { left: clamp(8px,4vw,80px); }
        .hero-chess-r { right: clamp(8px,4vw,80px); }

        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 0.6rem; letter-spacing: 0.42em; text-transform: uppercase;
          color: var(--gold-dim); font-weight: 600; margin-bottom: 20px;
          animation-delay: 0.1s;
        }
        .hero-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--gold); opacity: 0.55; }

        .hero-title {
          font-family: var(--font-d);
          font-size: clamp(2.4rem,7vw,5rem);
          font-weight: 900; line-height: 1.06;
          letter-spacing: -0.01em;
          color: #fff; margin-bottom: 18px;
          animation-delay: 0.15s;
        }
        .hero-title-gold {
          background: linear-gradient(135deg, #facc15 0%, #f59e0b 50%, #fde68a 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          max-width: 540px; margin: 0 auto 28px;
          color: var(--text-dim); font-size: clamp(0.88rem,2vw,1rem);
          line-height: 1.7; font-weight: 400;
          animation-delay: 0.22s;
        }

        .hero-rule {
          display: flex; align-items: center; gap: 12px; justify-content: center;
          animation-delay: 0.28s;
        }
        .hero-rule-line {
          height: 1px; width: 80px;
          background: linear-gradient(90deg, transparent, var(--gold-dim));
        }
        .hero-rule-line.r { background: linear-gradient(270deg, transparent, var(--gold-dim)); }
        .hero-rule-piece { color: var(--gold); font-size: 1rem; opacity: 0.5; }

        /* ═══════════════════════════════════════
           SECTION WRAPPER
        ═══════════════════════════════════════ */
        .section {
          max-width: 1140px; margin: 0 auto;
          padding: 0 20px clamp(56px,8vw,100px);
        }

        .section-label {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.58rem; letter-spacing: 0.38em; text-transform: uppercase;
          color: var(--gold-dim); font-weight: 600; margin-bottom: 10px;
        }
        .section-label::before { content: '◆'; font-size: 0.4rem; color: var(--gold); opacity: 0.6; }

        .section-title {
          font-family: var(--font-d);
          font-size: clamp(1.3rem,3vw,2rem);
          font-weight: 800; color: #fff;
          margin-bottom: 36px; line-height: 1.2;
        }
        .section-title span { color: var(--gold); }

        /* ═══════════════════════════════════════
           QUICK CONTACT CARDS
        ═══════════════════════════════════════ */
        .cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          margin-bottom: 0;
        }
        @media (min-width: 600px) { .cards-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 960px) { .cards-grid { grid-template-columns: repeat(4, 1fr); } }

        .qcard {
          position: relative;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 26px 22px 28px;
          overflow: hidden;
          transition: border-color 0.28s, box-shadow 0.28s, transform 0.28s var(--ease), background 0.28s;
          cursor: default;
        }
        .qcard::before {
          content: '';
          position: absolute; inset: 0; border-radius: var(--radius);
          background: linear-gradient(135deg, rgba(250,204,21,0.04) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.28s;
        }
        .qcard:hover {
          border-color: var(--border-gold-bright);
          box-shadow: 0 0 0 1px rgba(250,204,21,0.08), 0 20px 50px rgba(0,0,0,0.45), 0 0 40px rgba(250,204,21,0.06);
          transform: translateY(-4px);
          background: var(--surface-hover);
        }
        .qcard:hover::before { opacity: 1; }

        .qcard-icon {
          width: 46px; height: 46px; border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(250,204,21,0.08);
          border: 1px solid rgba(250,204,21,0.18);
          font-size: 1.2rem; margin-bottom: 16px;
          color: var(--gold);
        }
        .qcard-title {
          font-family: var(--font-d); font-size: 0.78rem;
          font-weight: 700; color: #fff; margin-bottom: 10px;
          letter-spacing: 0.04em;
        }

        .qcard-link {
          display: block; font-size: 0.82rem;
          color: var(--text-dim); text-decoration: none;
          padding: 5px 0; transition: color 0.2s;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-weight: 500;
        }
        .qcard-link:last-of-type { border-bottom: none; }
        .qcard-link:hover { color: var(--gold); }

        .qcard-btn {
          display: inline-flex; align-items: center; gap: 8px;
          margin-top: 8px;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%);
          color: #0a0a0a; border: none; border-radius: 10px;
          padding: 10px 20px; font-size: 0.78rem; font-weight: 700;
          cursor: pointer; text-decoration: none;
          transition: opacity 0.2s, transform 0.2s var(--ease), box-shadow 0.2s;
          font-family: var(--font-b);
          position: relative; overflow: hidden;
          letter-spacing: 0.04em;
        }
        .qcard-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.2s;
        }
        .qcard-btn:hover { opacity: 0.92; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(250,204,21,0.3); }
        .qcard-btn:hover::after { opacity: 1; }

        /* WhatsApp shimmer */
        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .qcard-btn-shimmer {
          position: absolute; top:0; left:0; width:40%; height:100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer-sweep 2.4s ease-in-out infinite;
          pointer-events: none;
        }

        /* ═══════════════════════════════════════
           CONTACT FORM
        ═══════════════════════════════════════ */
        .form-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: clamp(28px,5vw,52px) clamp(22px,5vw,52px);
          position: relative; overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .form-card::before {
          content: '';
          position: absolute; top:0; left:0; right:0; height:1px;
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.4), transparent);
        }

        /* Ambient corner glow */
        .form-card::after {
          content: '';
          position: absolute; bottom:-60px; right:-60px;
          width:240px; height:240px; border-radius:50%;
          background: radial-gradient(circle, rgba(250,204,21,0.04) 0%, transparent 70%);
          pointer-events: none;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        @media (min-width: 640px) { .form-grid { grid-template-columns: 1fr 1fr; } }

        .form-full { grid-column: 1 / -1; }

        .form-field { display: flex; flex-direction: column; gap: 7px; }

        .form-label {
          font-size: 0.68rem; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--text-dim);
        }

        .form-input, .form-textarea {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 16px;
          color: var(--text);
          font-family: var(--font-b); font-size: 0.9rem; font-weight: 400;
          transition: border-color 0.22s, box-shadow 0.22s, background 0.22s;
          outline: none; width: 100%;
          -webkit-appearance: none;
        }
        .form-input::placeholder, .form-textarea::placeholder { color: var(--text-faint); }
        .form-input:focus, .form-textarea:focus {
          border-color: rgba(250,204,21,0.5);
          background: rgba(250,204,21,0.03);
          box-shadow: 0 0 0 3px rgba(250,204,21,0.08), 0 0 20px rgba(250,204,21,0.04);
        }
        .form-input.err, .form-textarea.err {
          border-color: rgba(248,113,113,0.5);
          box-shadow: 0 0 0 3px rgba(248,113,113,0.08);
        }
        .form-textarea { resize: vertical; min-height: 130px; }

        .form-error {
          font-size: 0.65rem; color: var(--red);
          display: flex; align-items: center; gap: 5px; margin-top: 1px;
        }
        .form-error::before { content: '✕'; font-size: 0.6rem; }

        .form-submit {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 16px 28px;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold2) 60%, var(--gold3) 100%);
          border: none; border-radius: 13px;
          color: #0a0a0a; font-family: var(--font-d);
          font-size: 0.82rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.22s var(--ease), box-shadow 0.22s;
          position: relative; overflow: hidden;
          margin-top: 6px;
        }
        .form-submit:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(250,204,21,0.32);
        }
        .form-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .form-submit-shine {
          position: absolute; top:0; left:-60%; width:40%; height:100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
          animation: shimmer-sweep 2s ease-in-out infinite;
          pointer-events: none;
        }

        /* Spinner */
        .spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #0a0a0a;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Success state */
        .form-success {
          display: flex; flex-direction: column; align-items: center;
          gap: 14px; padding: 20px 0 8px; text-align: center;
        }
        .form-success-icon {
          width: 60px; height: 60px; border-radius: 50%;
          background: rgba(52,211,153,0.1);
          border: 2px solid rgba(52,211,153,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; color: var(--green);
          animation: fadeUp 0.5s var(--ease) both;
        }
        .form-success-title {
          font-family: var(--font-d); font-size: 1rem;
          font-weight: 800; color: #fff;
          animation: fadeUp 0.5s 0.1s var(--ease) both; opacity: 0;
        }
        .form-success-sub {
          font-size: 0.82rem; color: var(--text-dim);
          animation: fadeUp 0.5s 0.18s var(--ease) both; opacity: 0;
        }

        /* Secure badge */
        .secure-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.6rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(52,211,153,0.55);
          padding: 5px 12px; border-radius: 99px;
          background: rgba(52,211,153,0.05);
          border: 1px solid rgba(52,211,153,0.12);
          margin-top: 10px;
        }
        .secure-badge::before { content: '🔒'; font-size: 0.7rem; }

        /* Toast */
        .toast {
          position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
          z-index: 9999;
          background: linear-gradient(135deg, #1a1a0e 0%, #111107 100%);
          border: 1px solid rgba(250,204,21,0.3);
          border-radius: 14px;
          padding: 14px 24px;
          display: flex; align-items: center; gap: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(250,204,21,0.06);
          animation: toastIn 0.45s var(--ease) both;
          white-space: nowrap;
        }
        @keyframes toastIn {
          from { opacity:0; transform:translateX(-50%) translateY(16px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
        .toast-icon { font-size: 1.1rem; }
        .toast-text { font-size: 0.82rem; color: rgba(255,255,255,0.8); font-weight: 500; }
        .toast-gold { color: var(--gold); font-weight: 700; }

        /* ═══════════════════════════════════════
           MAP
        ═══════════════════════════════════════ */
        .map-container {
          position: relative;
          border-radius: var(--radius);
          overflow: hidden;
          border: 1px solid var(--border-gold);
          box-shadow: 0 0 0 1px rgba(250,204,21,0.04), 0 32px 80px rgba(0,0,0,0.4);
        }
        .map-container::before {
          content: '';
          position: absolute; inset:0; z-index:1; pointer-events: none;
          border-radius: var(--radius);
          box-shadow: inset 0 0 0 1px rgba(250,204,21,0.12);
        }
        .map-container iframe {
          display: block; width: 100%;
          height: clamp(260px, 45vw, 460px);
          filter: grayscale(0.3) contrast(1.05);
        }

        /* ═══════════════════════════════════════
           FEATURES
        ═══════════════════════════════════════ */
        .feat-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 700px) { .feat-grid { grid-template-columns: repeat(3, 1fr); } }

        .feat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 28px 24px 30px;
          position: relative; overflow: hidden;
          transition: border-color 0.28s, box-shadow 0.28s, transform 0.3s var(--ease), background 0.28s;
        }
        .feat-card::before {
          content: '';
          position: absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.3), transparent);
          opacity: 0; transition: opacity 0.28s;
        }
        .feat-card:hover {
          border-color: var(--border-gold);
          box-shadow: 0 0 0 1px rgba(250,204,21,0.06), 0 20px 50px rgba(0,0,0,0.4), 0 0 30px rgba(250,204,21,0.04);
          transform: translateY(-5px);
          background: var(--surface-hover);
        }
        .feat-card:hover::before { opacity: 1; }

        .feat-icon {
          font-size: 1.8rem; color: var(--gold); margin-bottom: 18px;
          display: block; font-family: var(--font-d);
          filter: drop-shadow(0 0 8px rgba(250,204,21,0.3));
        }
        .feat-title {
          font-family: var(--font-d); font-size: 0.82rem;
          font-weight: 700; color: #fff; margin-bottom: 10px;
          line-height: 1.35;
        }
        .feat-desc { font-size: 0.8rem; color: var(--text-dim); line-height: 1.72; }

        /* ═══════════════════════════════════════
           FAQ
        ═══════════════════════════════════════ */
        .faq-list { display: flex; flex-direction: column; gap: 10px; }

        .faq-item {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          overflow: hidden;
          transition: border-color 0.22s;
          opacity: 0; animation: fadeUp 0.6s var(--ease) forwards;
        }
        .faq-item.faq-open {
          border-color: var(--border-gold);
        }

        .faq-btn {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px;
          width: 100%; padding: 18px 22px;
          background: none; border: none; cursor: pointer;
          text-align: left;
        }
        .faq-q {
          font-family: var(--font-d); font-size: 0.8rem;
          font-weight: 600; color: rgba(255,255,255,0.78);
          line-height: 1.4; flex: 1;
          transition: color 0.2s;
        }
        .faq-open .faq-q { color: var(--gold); }
        .faq-arrow {
          font-size: 0.45rem; color: var(--gold); opacity: 0.4; flex-shrink: 0;
          transition: transform 0.3s var(--ease), opacity 0.2s;
        }
        .faq-arrow-open { transform: rotate(180deg); opacity: 0.8; }

        .faq-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.38s var(--ease);
        }
        .faq-body-inner { padding: 0 22px 18px; }
        .faq-a { font-size: 0.82rem; color: var(--text-dim); line-height: 1.72; }

        /* ═══════════════════════════════════════
           CTA SECTION
        ═══════════════════════════════════════ */
        .cta-section {
          position: relative;
          margin: 0 20px clamp(56px,8vw,100px);
          max-width: 1100px;
          margin-left: auto; margin-right: auto;
          border-radius: 24px;
          overflow: hidden;
          background: linear-gradient(160deg,
            rgba(250,204,21,0.07) 0%,
            rgba(250,204,21,0.02) 50%,
            rgba(10,8,0,0.5) 100%
          );
          border: 1px solid rgba(250,204,21,0.18);
          box-shadow: 0 0 0 1px rgba(250,204,21,0.05), 0 40px 100px rgba(0,0,0,0.5);
          padding: clamp(44px,7vw,80px) clamp(24px,6vw,80px);
          text-align: center;
          margin-bottom: clamp(56px,8vw,100px);
        }
        .cta-section::before {
          content: '♛';
          position: absolute; bottom: -20px; right: 20px;
          font-size: 12rem; line-height: 1;
          color: rgba(250,204,21,0.025);
          pointer-events: none; user-select: none;
          font-family: var(--font-d);
        }

        .cta-eyebrow {
          font-size: 0.58rem; letter-spacing: 0.42em; text-transform: uppercase;
          color: var(--gold-dim); font-weight: 600; margin-bottom: 16px;
          display: block;
        }
        .cta-title {
          font-family: var(--font-d);
          font-size: clamp(1.4rem,4vw,2.4rem);
          font-weight: 900; color: #fff;
          line-height: 1.12; margin-bottom: 14px;
        }
        .cta-title span { color: var(--gold); }
        .cta-sub {
          color: var(--text-dim); font-size: clamp(0.84rem,1.8vw,0.95rem);
          max-width: 440px; margin: 0 auto 32px; line-height: 1.7;
        }
        .cta-btn {
          display: inline-flex; align-items: center; gap: 10px;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%);
          color: #0a0a0a; border: none; border-radius: 13px;
          padding: 16px 36px;
          font-family: var(--font-d); font-size: 0.82rem;
          font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.22s var(--ease), box-shadow 0.22s;
          position: relative; overflow: hidden;
        }
        .cta-btn:hover {
          opacity: 0.92; transform: translateY(-3px);
          box-shadow: 0 16px 44px rgba(250,204,21,0.35);
        }
        .cta-btn::after {
          content: '';
          position: absolute; top:0; left:-60%; width:40%; height:100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer-sweep 2.4s ease-in-out infinite;
        }
      `}</style>

            <div className="cp">
                {/* Ambient layers */}
                <div className="cp-tex" aria-hidden="true" />
                <div className="cp-orb" aria-hidden="true" />
                <div className="cp-orb2" aria-hidden="true" />

                {/* Toast */}
                {toast && (
                    <div className="toast" role="alert">
                        <span className="toast-icon">✅</span>
                        <p className="toast-text">
                            Opening <span className="toast-gold">WhatsApp</span> — your message is ready!
                        </p>
                    </div>
                )}

                <div className="cp-content">

                    {/* ══════════ HERO ══════════ */}
                    <header className="hero">
                        <div className="hero-chess-l" aria-hidden="true">♜</div>
                        <div className="hero-chess-r" aria-hidden="true">♞</div>

                        <p className="hero-eyebrow fade-up" style={{ animationDelay: "0.05s" }}>
                            <span className="hero-dot" />
                            XL Classes · Contact Us
                            <span className="hero-dot" />
                        </p>
                        <h1 className="hero-title fade-up" style={{ animationDelay: "0.12s" }}>
                            Get in <span className="hero-title-gold">Touch</span>
                        </h1>
                        <p className="hero-sub fade-up" style={{ animationDelay: "0.2s" }}>
                            Have questions about our Chess Championship or Coaching Programs?
                            We&apos;re here to help you every step of the way.
                        </p>
                        <div className="hero-rule fade-up" style={{ animationDelay: "0.28s" }}>
                            <span className="hero-rule-line" />
                            <span className="hero-rule-piece">♟</span>
                            <span className="hero-rule-line r" />
                        </div>
                    </header>

                    {/* ══════════ QUICK CONTACT CARDS ══════════ */}
                    <section className="section">
                        <p className="section-label fade-up" style={{ animationDelay: "0.32s" }}>
                            Quick Contact
                        </p>
                        <h2 className="section-title fade-up" style={{ animationDelay: "0.38s" }}>
                            Reach Us <span>Instantly</span>
                        </h2>
                        <div className="cards-grid">
                            {/* Call Us */}
                            <div className="qcard fade-up" style={{ animationDelay: "0.42s" }}>
                                <div className="qcard-icon">📞</div>
                                <p className="qcard-title">Call Us</p>
                                <a href="tel:+916367075149" className="qcard-link">+91 63670 75149</a>
                                <a href="tel:+919057261302" className="qcard-link">+91 90572 61302</a>
                            </div>

                            {/* WhatsApp */}
                            <div className="qcard fade-up" style={{ animationDelay: "0.5s" }}>
                                <div className="qcard-icon">💬</div>
                                <p className="qcard-title">WhatsApp Us</p>
                                <p style={{ fontSize: "0.76rem", color: "var(--text-dim)", marginBottom: 14 }}>
                                    Chat with us directly for instant replies.
                                </p>
                                <a
                                    href="https://wa.me/919057261302?text=Hey%20XL%20Classes%2C%20I%20want%20more%20information%20about%20your%20programs."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="qcard-btn"
                                >
                                    <span className="qcard-btn-shimmer" />
                                    💬 Open WhatsApp
                                </a>
                            </div>

                            {/* Email */}
                            <div className="qcard fade-up" style={{ animationDelay: "0.58s" }}>
                                <div className="qcard-icon">✉️</div>
                                <p className="qcard-title">Email Us</p>
                                <a
                                    href="mailto:xlclasses7@gmail.com?subject=Website%20Inquiry"
                                    className="qcard-link"
                                >
                                    xlclasses7@gmail.com
                                </a>
                                <p style={{ fontSize: "0.7rem", color: "var(--text-faint)", marginTop: 8 }}>
                                    We respond within 24 hours.
                                </p>
                            </div>

                            {/* Website */}
                            <div className="qcard fade-up" style={{ animationDelay: "0.66s" }}>
                                <div className="qcard-icon">🌐</div>
                                <p className="qcard-title">Visit Website</p>
                                <p style={{ fontSize: "0.76rem", color: "var(--text-dim)", marginBottom: 14 }}>
                                    Explore results, updates & more.
                                </p>
                                <a
                                    href="https://xl-classes.github.io/results.nic.in"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="qcard-link"
                                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                                >
                                    Official Website ↗
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* ══════════ CONTACT FORM ══════════ */}
                    <section className="section" ref={formRef}>
                        <p className="section-label fade-up" style={{ animationDelay: "0.7s" }}>Send a Message</p>
                        <h2 className="section-title fade-up" style={{ animationDelay: "0.76s" }}>
                            Write to <span>Us</span>
                        </h2>
                        <div className="form-card fade-up" style={{ animationDelay: "0.82s" }}>
                            {submitted ? (
                                <div className="form-success">
                                    <div className="form-success-icon">✓</div>
                                    <p className="form-success-title">Message Sent Successfully!</p>
                                    <p className="form-success-sub">
                                        WhatsApp has been opened with your message. We&apos;ll respond shortly.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} noValidate>
                                    <div className="form-grid">
                                        {/* Name */}
                                        <div className="form-field">
                                            <label className="form-label" htmlFor="cf-name">Full Name</label>
                                            <input
                                                id="cf-name" type="text" placeholder="Your full name"
                                                value={form.name} onChange={set("name")}
                                                className={`form-input${errors.name ? " err" : ""}`}
                                                autoComplete="name"
                                            />
                                            {errors.name && <span className="form-error">{errors.name}</span>}
                                        </div>

                                        {/* Phone */}
                                        <div className="form-field">
                                            <label className="form-label" htmlFor="cf-phone">Phone Number</label>
                                            <input
                                                id="cf-phone" type="tel" placeholder="10-digit number"
                                                value={form.phone} onChange={set("phone")}
                                                className={`form-input${errors.phone ? " err" : ""}`}
                                                autoComplete="tel"
                                                maxLength={10}
                                            />
                                            {errors.phone && <span className="form-error">{errors.phone}</span>}
                                        </div>

                                        {/* Email */}
                                        <div className="form-field form-full">
                                            <label className="form-label" htmlFor="cf-email">Email Address</label>
                                            <input
                                                id="cf-email" type="email" placeholder="you@example.com"
                                                value={form.email} onChange={set("email")}
                                                className={`form-input${errors.email ? " err" : ""}`}
                                                autoComplete="email"
                                            />
                                            {errors.email && <span className="form-error">{errors.email}</span>}
                                        </div>

                                        {/* Message */}
                                        <div className="form-field form-full">
                                            <label className="form-label" htmlFor="cf-msg">Your Message</label>
                                            <textarea
                                                id="cf-msg" placeholder="Tell us about your query or how we can help..."
                                                value={form.message} onChange={set("message")}
                                                className={`form-textarea${errors.message ? " err" : ""}`}
                                            />
                                            {errors.message && <span className="form-error">{errors.message}</span>}
                                        </div>

                                        {/* Submit */}
                                        <div className="form-full" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                                            <button type="submit" className="form-submit" disabled={loading}>
                                                <span className="form-submit-shine" />
                                                {loading ? (
                                                    <>
                                                        <span className="spinner" />
                                                        Sending via WhatsApp…
                                                    </>
                                                ) : (
                                                    <>Send via WhatsApp ↗</>
                                                )}
                                            </button>
                                            <span className="secure-badge">Secure &amp; Verified Communication</span>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </section>

                    {/* ══════════ MAP ══════════ */}
                    <section className="section">
                        <p className="section-label fade-up" style={{ animationDelay: "0.86s" }}>Location</p>
                        <h2 className="section-title fade-up" style={{ animationDelay: "0.92s" }}>
                            Find <span>Us</span>
                        </h2>
                        <div className="map-container fade-up" style={{ animationDelay: "0.96s" }}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3545.7400758170565!2d75.18600717530843!3d27.290017776424286!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c8f7687f1189d%3A0x1e02b8e6217a647e!2sXl%20classes!5e0!3m2!1sen!2sin!4v1772197347969!5m2!1sen!2sin"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="XL Classes Location"
                            />
                        </div>
                    </section>

                    {/* ══════════ WHY CHOOSE ══════════ */}
                    <section className="section">
                        <p className="section-label fade-up" style={{ animationDelay: "1s" }}>Why Us</p>
                        <h2 className="section-title fade-up" style={{ animationDelay: "1.06s" }}>
                            Why Choose <span>XL Classes</span>
                        </h2>
                        <div className="feat-grid">
                            {FEATURES.map((f, i) => (
                                <div
                                    key={f.title}
                                    className="feat-card fade-up"
                                    style={{ animationDelay: `${1.1 + i * 0.09}s` }}
                                >
                                    <span className="feat-icon">{f.icon}</span>
                                    <p className="feat-title">{f.title}</p>
                                    <p className="feat-desc">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ══════════ FAQ ══════════ */}
                    <section className="section">
                        <p className="section-label fade-up" style={{ animationDelay: "1.3s" }}>FAQ</p>
                        <h2 className="section-title fade-up" style={{ animationDelay: "1.36s" }}>
                            Common <span>Questions</span>
                        </h2>
                        <div className="faq-list">
                            {FAQS.map((faq, i) => (
                                <FaqItem key={faq.q} q={faq.q} a={faq.a} index={i} />
                            ))}
                        </div>
                    </section>

                    {/* ══════════ CTA ══════════ */}
                    <div className="cta-section fade-up" style={{ animationDelay: "1.5s" }}>
                        <span className="cta-eyebrow">◆ XL Classes · Under 19 ◆</span>
                        <h2 className="cta-title">
                            Let&apos;s Build Your<br />
                            <span>Future Together</span>
                        </h2>
                        <p className="cta-sub">
                            Join XL Classes and begin your journey toward excellence in chess,
                            academics, and competitive excellence.
                        </p>
                        <button className="cta-btn" onClick={scrollToForm}>
                            Contact Now ↗
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}