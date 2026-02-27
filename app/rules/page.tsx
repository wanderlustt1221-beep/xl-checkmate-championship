"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";

// ─── Scroll reveal ────────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, className = "" }: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [vis, setVis] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
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
                opacity: vis ? 1 : 0,
                transform: vis ? "translateY(0)" : "translateY(22px)",
                transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

// ─── Rule Card ────────────────────────────────────────────────────────────────

function RuleCard({ icon, title, body, index }: {
    icon: string;
    title: string;
    body: string;
    index: number;
}) {
    return (
        <Reveal delay={index * 60}>
            <div className="rule-card">
                {/* Gold left accent bar */}
                <div className="rule-accent" />

                <div className="flex items-start gap-4 pl-5 pr-5 py-5">
                    {/* Icon */}
                    <div className="rule-icon shrink-0">
                        <span className="text-lg leading-none">{icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="rule-title">{title}</h3>
                        <p className="rule-body">{body}</p>
                    </div>
                </div>
            </div>
        </Reveal>
    );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const RULES = [
    {
        icon: "🎂",
        title: "Age Eligibility — Under 19",
        body: "The championship is open exclusively to students who are 18 years of age or younger at the time of the event. Participants above this age will not be permitted to compete.",
    },
    {
        icon: "⚔",
        title: "Knockout Format",
        body: "The tournament follows a strict single-elimination knockout format. Each match determines advancement — a loss means elimination. Every game counts.",
    },
    {
        icon: "♾",
        title: "No Time Limit",
        body: "Matches are played without a fixed time limit. Players are encouraged to think deeply and play their best chess without the pressure of a clock.",
    },
    {
        icon: "⏰",
        title: "Reporting Time — 9:30 AM",
        body: "All participants must report to the venue by 9:30 AM sharp on the event day. Late arrivals may forfeit their place to the next participant in queue.",
    },
    {
        icon: "🎟",
        title: "Free Entry",
        body: "Participation in the Under 19 Chess Championship is completely free of charge. There are no registration or entry fees of any kind.",
    },
    {
        icon: "🏛",
        title: "Physical Presence Mandatory",
        body: "All participants must be physically present at the designated venue. Remote or online participation is not permitted under any circumstances.",
    },
    {
        icon: "⚖",
        title: "Organizer Decision is Final",
        body: "In all matters of dispute, rule interpretation, or exceptional circumstances, the decision of XL Classes organizers and the appointed arbiter shall be final and binding.",
    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RulesPage() {
    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; font-family: 'Jost', sans-serif; background: #0a0a0a; }

        /* ── Page background ── */
        .rules-bg {
          min-height: 100vh;
          background-color: #0a0a0a;
          background-image:
            radial-gradient(ellipse 65% 45% at 50% 0%, rgba(250,204,21,0.09) 0%, transparent 58%),
            repeating-conic-gradient(#111 0% 25%, #0d0d0d 25% 50%);
          background-size: auto, 48px 48px;
        }

        /* ── Hero ── */
        .hero-enter       { animation: heroIn 0.8s cubic-bezier(0.22,1,0.36,1) forwards; }
        .hero-enter-d1    { animation: heroIn 0.8s 0.12s cubic-bezier(0.22,1,0.36,1) both; }
        .hero-enter-d2    { animation: heroIn 0.8s 0.24s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes heroIn {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ── Rule card ── */
        .rule-card {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
        }
        .rule-card:hover {
          transform: translateY(-4px);
          border-color: rgba(250,204,21,0.22);
          box-shadow: 0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(250,204,21,0.08);
        }

        /* ── Gold left accent ── */
        .rule-accent {
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #facc15, rgba(250,204,21,0.3));
          border-radius: 99px 0 0 99px;
        }

        /* ── Rule icon ── */
        .rule-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: rgba(250,204,21,0.08);
          border: 1px solid rgba(250,204,21,0.18);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* ── Rule typography ── */
        .rule-title {
          font-family: 'Cinzel', serif;
          font-size: 0.9rem;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          margin: 0 0 6px;
          line-height: 1.3;
        }
        .rule-body {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.4);
          line-height: 1.65;
          margin: 0;
        }

        /* ── Fair play box ── */
        .fair-play {
          background: rgba(250,204,21,0.04);
          border: 1px solid rgba(250,204,21,0.18);
          border-radius: 20px;
          box-shadow: 0 0 60px rgba(250,204,21,0.05);
        }

        /* ── Final CTA ── */
        .final-cta {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(250,204,21,0.12);
          border-radius: 20px;
        }

        /* ── Buttons ── */
        .btn-gold {
          background: linear-gradient(135deg, #facc15, #f59e0b);
          color: #0a0a0a; font-weight: 700; font-family: 'Jost', sans-serif;
          border-radius: 12px;
          display: inline-flex; align-items: center; gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(250,204,21,0.3);
          text-decoration: none;
        }
        .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(250,204,21,0.45); }

        /* ── Gold divider ── */
        .gold-rule { height: 1px; background: linear-gradient(90deg, transparent, rgba(250,204,21,0.5), transparent); }

        /* ── Fair play pillar ── */
        .fp-pillar {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 18px;
          text-align: center;
        }
      `}</style>

            <div className="rules-bg">

                {/* ══════════════════════════════════ */}
                {/*  HERO                              */}
                {/* ══════════════════════════════════ */}
                <section
                    className="relative overflow-hidden text-center px-4"
                    style={{ padding: "110px 16px 80px" }}
                >
                    {/* Ambient glow */}
                    <div style={{
                        position: "absolute", inset: 0,
                        background: "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(250,204,21,0.1) 0%, transparent 60%)",
                        pointerEvents: "none",
                    }} />

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <div className="hero-enter">
                            <span
                                className="inline-block text-xs tracking-[0.4em] uppercase mb-5 px-4 py-1.5 rounded-full"
                                style={{
                                    color: "rgba(250,204,21,0.7)",
                                    border: "1px solid rgba(250,204,21,0.2)",
                                    background: "rgba(250,204,21,0.05)",
                                    fontFamily: "'Jost', sans-serif",
                                }}
                            >
                                ♟ XL Classes · XL Checkmate Championship
                            </span>
                        </div>

                        <h1
                            className="hero-enter-d1 text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-5"
                            style={{ fontFamily: "'Cinzel', serif" }}
                        >
                            Tournament{" "}
                            <span className="text-yellow-400">Rules</span>
                            <br />& Guidelines
                        </h1>

                        <p
                            className="hero-enter-d2 text-white/35 text-base sm:text-lg tracking-[0.1em] uppercase"
                            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
                        >
                            Fair Play. Discipline. Excellence.
                        </p>
                    </div>
                </section>

                <div className="gold-rule" />

                {/* ══════════════════════════════════ */}
                {/*  RULES GRID                        */}
                {/* ══════════════════════════════════ */}
                <section className="max-w-5xl mx-auto px-4 py-20">

                    <Reveal>
                        <div className="text-center mb-12">
                            <p className="text-yellow-400/55 text-xs tracking-[0.35em] uppercase mb-3">Official Rules</p>
                            <h2
                                className="text-3xl sm:text-4xl font-black text-white"
                                style={{ fontFamily: "'Cinzel', serif" }}
                            >
                                Championship <span className="text-yellow-400">Regulations</span>
                            </h2>
                            <div className="gold-rule w-24 mx-auto mt-5" />
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {RULES.map((r, i) => (
                            <RuleCard key={r.title} {...r} index={i} />
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════ */}
                {/*  FAIR PLAY                         */}
                {/* ══════════════════════════════════ */}
                <section className="max-w-4xl mx-auto px-4 pb-20">
                    <Reveal>
                        <div className="fair-play p-7 sm:p-10">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                                    style={{ background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.25)" }}
                                >
                                    🤝
                                </div>
                                <div>
                                    <p className="text-yellow-400/60 text-[10px] tracking-widest uppercase">Code of Conduct</p>
                                    <h3
                                        className="text-white font-black text-lg sm:text-xl"
                                        style={{ fontFamily: "'Cinzel', serif" }}
                                    >
                                        Fair Play & Sportsmanship
                                    </h3>
                                </div>
                            </div>

                            {/* Body */}
                            <p className="text-white/50 text-sm leading-relaxed mb-7 max-w-2xl">
                                The Under 19 Chess Championship is not just a competition — it is a character-building experience. Every participant is expected to uphold the highest standards of sportsmanship, mutual respect, and integrity throughout the event.
                            </p>

                            {/* Three pillars */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                                {[
                                    { icon: "🙏", title: "Respect Opponents", desc: "Treat every player with dignity, before, during, and after the match — regardless of outcome." },
                                    { icon: "🏳", title: "Graceful Outcomes", desc: "Accept wins humbly and losses gracefully. Every game is an opportunity to learn and grow." },
                                    { icon: "⚖", title: "Arbiter is Final", desc: "The appointed arbiter's decisions in all match disputes are absolute and non-negotiable." },
                                ].map((p) => (
                                    <div key={p.title} className="fp-pillar">
                                        <div className="text-2xl mb-2 select-none">{p.icon}</div>
                                        <p
                                            className="text-white/80 text-xs font-semibold mb-1.5"
                                            style={{ fontFamily: "'Cinzel', serif" }}
                                        >
                                            {p.title}
                                        </p>
                                        <p className="text-white/35 text-xs leading-relaxed">{p.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Emphasis line */}
                            <div className="flex items-center gap-3 flex-wrap">
  <div
    className="h-px flex-1"
    style={{ background: "linear-gradient(90deg, rgba(250,204,21,0.3), transparent)" }}
  />
  
  <p
    className="text-yellow-400/50 text-xs tracking-widest uppercase text-center px-2"
    style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
  >
    In chess and in life — integrity is the grandmaster
  </p>

  <div
    className="h-px flex-1"
    style={{ background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.3))" }}
  />
</div>
                        </div>
                    </Reveal>
                </section>

                {/* ══════════════════════════════════ */}
                {/*  FINAL CTA                         */}
                {/* ══════════════════════════════════ */}
                <section className="max-w-2xl mx-auto px-4 pb-24">
                    <Reveal>
                        <div className="final-cta px-8 py-14 text-center flex flex-col items-center gap-5">
                            <div className="text-4xl text-yellow-400/40 select-none">♟</div>
                            <div>
                                <p className="text-yellow-400/60 text-xs tracking-[0.35em] uppercase mb-3">
                                    Your Move
                                </p>
                                <h2
                                    className="text-2xl sm:text-3xl font-black text-white"
                                    style={{ fontFamily: "'Cinzel', serif" }}
                                >
                                    Ready to{" "}
                                    <span className="text-yellow-400">Compete?</span>
                                </h2>
                                <p className="text-white/30 text-sm mt-3 leading-relaxed max-w-sm mx-auto">
                                    You've read the rules. Now it's time to step on the board and make your mark.
                                </p>
                            </div>
                            <Link href="/register" className="btn-gold px-9 py-3.5 text-sm font-bold tracking-wide">
                                Register Now
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    </Reveal>
                </section>
            </div>
        </>
    );

}
