"use client";

import { useEffect, useState, useRef } from "react";

// ─── Section fade-in on scroll ────────────────────────────────────────────────

function Reveal({ children, delay = 0, className = "" }: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.08 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function GoldDivider({ width = "w-16" }: { width?: string }) {
    return (
        <div
            className={`${width} h-px mt-4`}
            style={{ background: "linear-gradient(90deg, rgba(250,204,21,0.7), transparent)" }}
        />
    );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeading({ eyebrow, title, accent = "" }: {
    eyebrow: string; title: string; accent?: string;
}) {
    return (
        <div className="mb-10">
            <p className="text-yellow-400/60 text-xs tracking-[0.35em] uppercase mb-2">{eyebrow}</p>
            <h2
                className="text-2xl sm:text-3xl font-black text-white"
                style={{ fontFamily: "'Cinzel', serif" }}
            >
                {title}{accent && <> <span className="text-yellow-400">{accent}</span></>}
            </h2>
            <GoldDivider />
        </div>
    );
}

// ─── Value Card ───────────────────────────────────────────────────────────────

function ValueCard({ icon, title, body }: { icon: string; title: string; body: string }) {
    return (
        <div className="about-card rounded-2xl p-6 flex flex-col gap-3 h-full">
            <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.2)" }}
            >
                {icon}
            </div>
            <h4 className="text-white font-semibold text-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                {title}
            </h4>
            <p className="text-white/40 text-sm leading-relaxed">{body}</p>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
    const XL_URL = "https://xl-classes.github.io/results.nic.in";

    const XL_VALUES = [
        {
            icon: "🎯",
            title: "Vision",
            body: "To build a generation of learners who are intellectually sharp, emotionally resilient, and ready to lead — in the classroom and beyond.",
        },
        {
            icon: "📚",
            title: "Mission",
            body: "XL Classes strives to provide every student with high-quality, accessible education that empowers them to achieve their fullest academic and personal potential.",
        },
        {
            icon: "💡",
            title: "Educational Philosophy",
            body: "We believe real learning happens when curiosity meets challenge. Our approach blends structured academics with co-curricular experiences that sharpen the whole mind.",
        },
        {
            icon: "♛",
            title: "Leadership Development",
            body: "Every event, competition, and program at XL Classes is designed to cultivate leadership — the ability to think clearly, act decisively, and inspire others.",
        },
    ];

    const CHESS_GOALS = [
        {
            icon: "♟",
            title: "Why Chess?",
            body: "Chess is one of the oldest and most powerful tools for developing analytical thinking. Every game is a lesson in strategy, patience, and consequence — life skills disguised as sport.",
        },
        {
            icon: "🧠",
            title: "Skill Building",
            body: "The championship is designed to push participants to sharpen their focus, improve their decision-making speed, and develop the habit of thinking multiple steps ahead.",
        },
        {
            icon: "🌱",
            title: "Student Empowerment",
            body: "By competing at a formal level, young players gain confidence, learn to handle pressure gracefully, and discover their capacity to rise in high-stakes moments.",
        },
    ];

    const COMMITMENTS = [
        { icon: "⚖", label: "Discipline", desc: "Every champion begins with discipline." },
        { icon: "📈", label: "Growth", desc: "We grow through challenge, not comfort." },
        { icon: "🏆", label: "Excellence", desc: "Our standard is always the highest." },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,400;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; font-family: 'Jost', sans-serif; background: #0a0a0a; }

        /* ── Page bg ── */
        .about-bg {
          min-height: 100vh;
          background-color: #0a0a0a;
          background-image:
            radial-gradient(ellipse 60% 40% at 50% 0%, rgba(250,204,21,0.08) 0%, transparent 55%),
            repeating-conic-gradient(#111 0% 25%, #0d0d0d 25% 50%);
          background-size: auto, 48px 48px;
        }

        /* ── Glass card ── */
        .about-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          transition: transform 0.22s ease, border-color 0.22s ease;
        }
        .about-card:hover {
          transform: translateY(-3px);
          border-color: rgba(250,204,21,0.2);
        }

        /* ── Hero page header ── */
        .page-hero {
          padding: 100px 16px 72px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .page-hero-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 55% at 50% 0%, rgba(250,204,21,0.09) 0%, transparent 60%);
          pointer-events: none;
        }
        .page-enter { animation: pageIn 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .page-enter-d1 { animation: pageIn 0.7s 0.12s cubic-bezier(0.22,1,0.36,1) both; }
        .page-enter-d2 { animation: pageIn 0.7s 0.24s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Blockquote ── */
        .quote-block {
          border-left: 3px solid rgba(250,204,21,0.5);
          background: rgba(250,204,21,0.03);
        }

        /* ── Website reference card ── */
        .site-card {
          background: rgba(250,204,21,0.035);
          border: 1px solid rgba(250,204,21,0.18);
          box-shadow: 0 0 60px rgba(250,204,21,0.05);
        }

        /* ── Gold divider full ── */
        .gold-rule {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.4), transparent);
        }

        /* ── Commitment pillars ── */
        .pillar {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          transition: border-color 0.2s, transform 0.2s;
        }
        .pillar:hover {
          border-color: rgba(250,204,21,0.25);
          transform: translateY(-2px);
        }

        /* ── CTA button ── */
        .btn-gold {
          background: linear-gradient(135deg, #facc15, #f59e0b);
          color: #0a0a0a; font-weight: 700; font-family: 'Jost', sans-serif;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(250,204,21,0.3);
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(250,204,21,0.45); }
      `}</style>

            <div className="about-bg">

                {/* ── Page Hero Header ── */}
                <div className="page-hero">
                    <div className="page-hero-glow" />
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <div className="page-enter">
                            <span className="inline-block text-yellow-400/60 text-xs tracking-[0.4em] uppercase mb-5 border border-yellow-400/20 px-4 py-1.5 rounded-full bg-yellow-400/5">
                                ♟ Our Story
                            </span>
                        </div>
                        <h1
                            className="page-enter-d1 text-4xl sm:text-5xl font-black text-white leading-tight mb-4"
                            style={{ fontFamily: "'Cinzel', serif" }}
                        >
                            About{" "}
                            <span className="text-yellow-400">XL Classes</span>
                        </h1>
                        <p className="page-enter-d2 text-white/35 text-base max-w-xl mx-auto leading-relaxed">
                            Building the next generation of thinkers, leaders, and champions — one move at a time.
                        </p>
                    </div>
                </div>

                <div className="gold-rule" />

                {/* ═══════════════════════════════════════════════════════ */}
                {/*  1 · About XL Classes                                  */}
                {/* ═══════════════════════════════════════════════════════ */}
                <section className="max-w-6xl mx-auto px-4 py-20">
                    <Reveal>
                        <SectionHeading eyebrow="Who We Are" title="About" accent="XL Classes" />
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {XL_VALUES.map((v, i) => (
                            <Reveal key={v.title} delay={i * 70}>
                                <ValueCard {...v} />
                            </Reveal>
                        ))}
                    </div>
                </section>

                <div className="gold-rule opacity-50" />

                {/* ═══════════════════════════════════════════════════════ */}
                {/*  2 · About the Championship                            */}
                {/* ═══════════════════════════════════════════════════════ */}
                <section className="max-w-6xl mx-auto px-4 py-20">
                    <Reveal>
                        <SectionHeading eyebrow="The Event" title="XL Checkmate" accent="Championship" />
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {CHESS_GOALS.map((g, i) => (
                            <Reveal key={g.title} delay={i * 80}>
                                <ValueCard {...g} />
                            </Reveal>
                        ))}
                    </div>

                    {/* Inline highlight */}
                    <Reveal delay={200}>
                        <div
                            className="mt-10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5"
                            style={{ background: "rgba(250,204,21,0.03)", border: "1px solid rgba(250,204,21,0.1)" }}
                        >
                            <div className="text-4xl text-yellow-400/50 select-none shrink-0">⚔</div>
                            <div>
                                <h4 className="text-white font-bold text-base mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
                                    Under 19 — Why This Age Group?
                                </h4>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    The under-19 window is when minds are most malleable, ambitions most electric, and habits most formable. By creating a competitive platform at this stage, XL Classes gives young players the experience of high-stakes competition at the exact moment it matters most — before the pressures of adulthood arrive.
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </section>

                <div className="gold-rule opacity-50" />

                {/* ═══════════════════════════════════════════════════════ */}
                {/*  3 · Our Commitment                                    */}
                {/* ═══════════════════════════════════════════════════════ */}
                <section className="max-w-4xl mx-auto px-4 py-20">
                    <Reveal>
                        <SectionHeading eyebrow="Our Promise" title="Our" accent="Commitment" />
                    </Reveal>

                    <Reveal delay={100}>
                        <p className="text-white/45 text-base leading-relaxed mb-10 max-w-2xl">
                            At XL Classes, we believe that true development happens at the intersection of discipline, sustained growth, and an uncompromising pursuit of excellence. Every program we create — including this championship — is a reflection of that belief.
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {COMMITMENTS.map((c, i) => (
                            <Reveal key={c.label} delay={i * 80}>
                                <div className="pillar rounded-2xl p-6 text-center flex flex-col items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                                        style={{ background: "rgba(250,204,21,0.07)", border: "1px solid rgba(250,204,21,0.15)" }}
                                    >
                                        {c.icon}
                                    </div>
                                    <p className="text-white font-bold text-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                                        {c.label}
                                    </p>
                                    <p className="text-white/30 text-xs italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                        {c.desc}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                <div className="gold-rule opacity-50" />

                {/* ═══════════════════════════════════════════════════════ */}
                {/*  4 · Website Reference                                 */}
                {/* ═══════════════════════════════════════════════════════ */}
                <section className="max-w-2xl mx-auto px-4 py-20">
                    <Reveal>
                        <div className="site-card rounded-2xl p-8 sm:p-10 text-center flex flex-col items-center gap-5">
                            <div className="text-yellow-400 text-4xl select-none">♛</div>
                            <div>
                                <p className="text-yellow-400/60 text-xs tracking-[0.3em] uppercase mb-2">Official Portal</p>
                                <h3
                                    className="text-white font-black text-xl mb-3"
                                    style={{ fontFamily: "'Cinzel', serif" }}
                                >
                                    Explore Our Academic Results Portal
                                </h3>
                                <p className="text-white/35 text-sm leading-relaxed max-w-sm mx-auto">
                                    Access student results, academic updates, and institutional information on the official XL Classes platform.
                                </p>
                            </div>
                            <div
                                className="w-full h-px"
                                style={{ background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.3), transparent)" }}
                            />
                            <a
                                href={XL_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-gold px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide"
                            >
                                Visit Official Website
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                            <p className="text-white/15 text-[10px] tracking-widest">
                                {XL_URL}
                            </p>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════════════ */}
                {/*  5 · Closing Quote                                     */}
                {/* ═══════════════════════════════════════════════════════ */}
                <section className="max-w-3xl mx-auto px-4 pb-24">
                    <Reveal>
                        <div className="quote-block rounded-r-2xl pl-8 pr-6 py-8">
                            <blockquote>
                                <p
                                    className="text-white/80 text-2xl sm:text-3xl font-light leading-snug"
                                    style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
                                >
                                    "Today's moves shape tomorrow's leaders."
                                </p>
                                <footer className="mt-5 flex items-center gap-3">
                                    <div
                                        className="h-px w-8 shrink-0"
                                        style={{ background: "rgba(250,204,21,0.5)" }}
                                    />
                                    <cite className="text-yellow-400/60 text-xs tracking-widest uppercase not-italic">
                                        XL Classes · Learn Today Lead Tomorrow
                                    </cite>
                                </footer>
                            </blockquote>
                        </div>
                    </Reveal>
                </section>
            </div>
        </>
    );
}