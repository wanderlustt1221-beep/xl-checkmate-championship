"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LiveStats {
  players: number;
  rounds: number;
  totalMatches: number;
  completedMatches: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (target === 0 || started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return count;
}

// ─── Section Wrapper (fade-in on scroll) ─────────────────────────────────────

function Section({ children, className = "", delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
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
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Stat Card with count-up ──────────────────────────────────────────────────

function StatCard({ label, value, icon, loading }: {
  label: string;
  value: number;
  icon: string;
  loading: boolean;
}) {
  const count = useCountUp(loading ? 0 : value);
  return (
    <div className="glass-card stat-hover rounded-2xl px-6 py-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-2xl opacity-60 select-none">{icon}</span>
        {loading ? (
          <div className="h-9 w-14 rounded-lg skeleton-block" />
        ) : (
          <span
            className="text-3xl font-black text-yellow-400 leading-none tabular-nums"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {count}
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-3 w-24 rounded-full skeleton-block" />
      ) : (
        <p className="text-white/50 text-xs tracking-wide uppercase font-medium">{label}</p>
      )}
    </div>
  );
}

// ─── Section Heading ──────────────────────────────────────────────────────────

function SectionHeading({ eyebrow, title, accent }: {
  eyebrow: string;
  title: string;
  accent: string;
}) {
  return (
    <div className="text-center mb-12">
      <p className="text-yellow-400/60 text-xs tracking-[0.35em] uppercase mb-3">{eyebrow}</p>
      <h2
        className="text-3xl sm:text-4xl font-black text-white leading-tight"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        {title}{" "}
        <span className="text-yellow-400">{accent}</span>
      </h2>
      <div className="gold-divider w-24 mx-auto mt-5" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [playersRes, roundsRes] = await Promise.all([
          fetch("/api/players", { cache: "no-store" }),
          fetch("/api/rounds", { cache: "no-store" }),
        ]);
        const [playersData, roundsData] = await Promise.all([
          playersRes.json(),
          roundsRes.json(),
        ]);

        let totalMatches = 0;
        let completedMatches = 0;

        if (roundsData.success && roundsData.rounds.length > 0) {
          const matchResults = await Promise.all(
            roundsData.rounds.map((r: { _id: string }) =>
              fetch(`/api/matches?roundId=${r._id}`, { cache: "no-store" }).then((res) => res.json())
            )
          );
          for (const result of matchResults) {
            if (result.success) {
              totalMatches += result.count;
              completedMatches += (result.matches as { status: string }[]).filter(
                (m) => m.status === "completed"
              ).length;
            }
          }
        }

        setStats({
          players: playersData.success ? playersData.count : 0,
          rounds: roundsData.success ? roundsData.count : 0,
          totalMatches,
          completedMatches,
        });
      } catch {
        setStats({ players: 0, rounds: 0, totalMatches: 0, completedMatches: 0 });
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  const EVENT_DETAILS = [
    { icon: "📅", label: "Date", value: "March 1 & 2" },
    { icon: "⏰", label: "Reporting Time", value: "9:30 AM" },
    { icon: "🎟", label: "Entry", value: "Free" },
    { icon: "⚔", label: "Format", value: "Knockout" },
    { icon: "♾", label: "Time Limit", value: "No Limit" },
  ];

  const WHY_CARDS = [
    {
      icon: "♟",
      title: "Strategic Thinking",
      desc: "Chess sharpens your ability to plan ahead, anticipate challenges, and make decisions under pressure — skills that extend far beyond the board.",
    },
    {
      icon: "🏆",
      title: "Competitive Spirit",
      desc: "Compete in a structured championship environment that builds resilience, teaches graceful winning, and turns every loss into a lesson.",
    },
    {
      icon: "♛",
      title: "Leadership Development",
      desc: "Every move is a decision. Develop the mindset of a leader — focused, composed, and always thinking two steps ahead.",
    },
  ];

  const TIMELINE = [
    { phase: "Registration Phase", desc: "Open registration for all eligible students", active: true },
    { phase: "Round 1-N", desc: "First knockout matches commence", active: false },
    { phase: "Quarterfinal", desc: "Top 8 players battle for the semis", active: false },
    { phase: "Semifinal", desc: "Final four compete for championship berths", active: false },
    { phase: "Grand Final", desc: "The champion is crowned", active: false },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; font-family: 'Jost', sans-serif; background: #0a0a0a; }

        /* ── Chessboard bg texture ── */
        .page-bg {
          background-color: #0a0a0a;
          background-image:
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(250,204,21,0.1) 0%, transparent 60%),
            repeating-conic-gradient(#111 0% 25%, #0d0d0d 25% 50%);
          background-size: auto, 48px 48px;
        }

        /* ── Gold divider ── */
        .gold-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(250,204,21,0.6), transparent); }

        /* ── Glass card ── */
        .glass-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
        }

        /* ── Glass hover ── */
        .stat-hover { transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease; }
        .stat-hover:hover {
          transform: translateY(-4px);
          border-color: rgba(250,204,21,0.25);
          box-shadow: 0 0 0 1px rgba(250,204,21,0.1), 0 20px 50px rgba(0,0,0,0.4);
        }
        .detail-card { transition: transform 0.22s ease, border-color 0.22s ease; }
        .detail-card:hover { transform: translateY(-3px); border-color: rgba(250,204,21,0.3); }

        /* ── Hero ── */
        .hero-bg {
          position: relative;
          overflow: hidden;
          padding: 140px 16px 100px;
          text-align: center;
        }
        .hero-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 10%, rgba(250,204,21,0.12) 0%, transparent 65%);
          pointer-events: none;
        }
        .hero-orb {
          position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; opacity: 0.07;
          animation: orbDrift 10s ease-in-out infinite alternate;
        }
        @keyframes orbDrift {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(40px,30px) scale(1.1); }
        }

        /* ── Hero text entrance ── */
        .hero-enter { animation: heroIn 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
        .hero-enter-d1 { animation: heroIn 0.9s 0.15s cubic-bezier(0.22,1,0.36,1) both; }
        .hero-enter-d2 { animation: heroIn 0.9s 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        .hero-enter-d3 { animation: heroIn 0.9s 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── CTA Buttons ── */
        .btn-gold {
          background: linear-gradient(135deg, #facc15, #f59e0b);
          color: #0a0a0a; font-weight: 700; font-family: 'Jost', sans-serif;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(250,204,21,0.35);
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 36px rgba(250,204,21,0.5); }
        .btn-ghost {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.8); font-family: 'Jost', sans-serif;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-ghost:hover {
          background: rgba(250,204,21,0.06);
          border-color: rgba(250,204,21,0.3);
          transform: translateY(-2px); color: #fff;
        }

        /* ── Why cards ── */
        .why-card {
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .why-card:hover {
          transform: translateY(-5px);
          border-color: rgba(250,204,21,0.25);
          box-shadow: 0 20px 56px rgba(0,0,0,0.45);
        }

        /* ── Timeline ── */
        .timeline-line {
          position: absolute; left: 19px; top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(180deg, rgba(250,204,21,0.5), rgba(250,204,21,0.05));
        }
        .timeline-dot {
          width: 12px; height: 12px; border-radius: 50%;
          border: 2px solid rgba(250,204,21,0.5);
          background: #0a0a0a;
          flex-shrink: 0; margin-top: 3px;
          transition: background 0.2s, border-color 0.2s;
        }
        .timeline-dot.active {
          background: #facc15;
          border-color: #facc15;
          box-shadow: 0 0 14px rgba(250,204,21,0.6);
        }

        /* ── Skeleton ── */
        .skeleton-block {
          background: rgba(255,255,255,0.06);
          animation: shimmer 1.8s ease-in-out infinite;
        }
        @keyframes shimmer { 0%,100%{opacity:.6} 50%{opacity:.25} }

        /* ── Final CTA section ── */
        .final-cta {
          background: rgba(250,204,21,0.04);
          border: 1px solid rgba(250,204,21,0.15);
          box-shadow: 0 0 80px rgba(250,204,21,0.06);
        }

        /* ── Trust badge ── */
        .trust-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(250,204,21,0.12);
        }
      `}</style>

      <main className="page-bg">

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  1 · HERO                                              */}
        {/* ═══════════════════════════════════════════════════════ */}
        <section className="hero-bg">
          <div className="hero-glow" />
          <div className="hero-orb" style={{ width: 600, height: 600, background: "#facc15", top: -200, left: "50%", transform: "translateX(-50%)" }} />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="hero-enter">
              <span className="inline-block text-yellow-400/70 text-xs tracking-[0.4em] uppercase mb-5 border border-yellow-400/20 px-4 py-1.5 rounded-full bg-yellow-400/5">
                ♟ XL Classes Presents
              </span>
            </div>

            <h1
              className="hero-enter-d1 text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.06] tracking-tight mb-6"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Under 19<br />
              <span className="text-yellow-400">XL Checkmate</span>{" "}
              Championship
              <br />
              <span className="text-white/40 text-3xl sm:text-4xl lg:text-5xl font-semibold">2026</span>
            </h1>

            <p
              className="hero-enter-d2 text-white/40 text-lg sm:text-xl tracking-[0.15em] uppercase mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Make Your Move.
            </p>
            <p className="hero-enter-d2 text-white/30 text-sm mb-10">
              Hosted by <span className="text-yellow-400/80">XL Classes</span> — Learn Today Lead Tomorrow
            </p>

            <div className="hero-enter-d3 flex flex-wrap gap-4 justify-center">
              <Link href="/register" className="btn-gold px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide">
                <span>Register Now</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/bracket" className="btn-ghost px-8 py-3.5 rounded-xl text-sm font-semibold tracking-wide">
                <span>View Matches</span>
                <span className="text-yellow-400/60">⟁</span>
              </Link>
            </div>
          </div>

          {/* Decorative chess pieces */}
          <div className="absolute bottom-8 left-8 text-white/5 text-7xl select-none hidden sm:block" aria-hidden>♜</div>
          <div className="absolute bottom-8 right-8 text-white/5 text-7xl select-none hidden sm:block" aria-hidden>♝</div>
        </section>

        {/* Gold rule */}
        <div className="gold-divider" />

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  2 · EVENT DETAILS                                     */}
        {/* ═══════════════════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-4 py-20">
          <Section>
            <SectionHeading eyebrow="Event Information" title="Championship" accent="Details" />
          </Section>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {EVENT_DETAILS.map((d, i) => (
              <Section key={d.label} delay={i * 60}>
                <div className="glass-card detail-card rounded-2xl p-5 text-center flex flex-col items-center gap-3 h-full">
                  <span className="text-2xl select-none">{d.icon}</span>
                  <div>
                    <p className="text-white/30 text-[10px] tracking-widest uppercase mb-1">{d.label}</p>
                    <p className="text-white font-bold text-sm" style={{ fontFamily: "'Cinzel', serif" }}>{d.value}</p>
                  </div>
                </div>
              </Section>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  3 · WHY PARTICIPATE                                   */}
        {/* ═══════════════════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-4 py-4 pb-20">
          <Section>
            <SectionHeading eyebrow="Why Join Us" title="What You" accent="Gain" />
          </Section>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {WHY_CARDS.map((c, i) => (
              <Section key={c.title} delay={i * 80}>
                <div className="glass-card why-card rounded-2xl p-6 h-full flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-yellow-400"
                    style={{ background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.18)" }}>
                    {c.icon}
                  </div>
                  <h3 className="text-white font-bold text-base" style={{ fontFamily: "'Cinzel', serif" }}>
                    {c.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed">{c.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  4 · LIVE STATS                                        */}
        {/* ═══════════════════════════════════════════════════════ */}
        <section className="py-20 px-4" style={{ background: "rgba(250,204,21,0.02)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="max-w-5xl mx-auto">
            <Section>
              <SectionHeading eyebrow="Live Data" title="Tournament" accent="Stats" />
            </Section>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Registered Players", value: stats?.players ?? 0, icon: "♟" },
                { label: "Rounds Created", value: stats?.rounds ?? 0, icon: "◈" },
                { label: "Total Matches", value: stats?.totalMatches ?? 0, icon: "⚔" },
                { label: "Completed Matches", value: stats?.completedMatches ?? 0, icon: "✓" },
              ].map((s, i) => (
                <Section key={s.label} delay={i * 70}>
                  <StatCard label={s.label} value={s.value} icon={s.icon} loading={loadingStats} />
                </Section>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  5 · TIMELINE                                          */}
        {/* ═══════════════════════════════════════════════════════ */}
        <section className="max-w-2xl mx-auto px-4 py-20">
          <Section>
            <SectionHeading eyebrow="Event Schedule" title="Tournament" accent="Timeline" />
          </Section>

          <Section delay={100}>
            <div className="relative pl-10">
              {/* Vertical line */}
              <div className="timeline-line" />

              <div className="space-y-8">
                {TIMELINE.map((t, i) => (
                  <div key={t.phase} className="flex items-start gap-4"
                    style={{ opacity: 0, animation: `heroIn 0.6s ${i * 100 + 200}ms cubic-bezier(0.22,1,0.36,1) both` }}>
                    <div className={`timeline-dot ${t.active ? "active" : ""}`}
                      style={{ position: "absolute", left: 13 }} />
                    <div className="glass-card rounded-xl px-5 py-4 flex-1">
                      <p className="text-white font-semibold text-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                        {t.phase}
                      </p>
                      <p className="text-white/35 text-xs mt-1">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  6 · TRUST / BRAND                                     */}
        {/* ═══════════════════════════════════════════════════════ */}
        <section className="max-w-3xl mx-auto px-4 py-8 pb-20">
          <Section>
            <div className="trust-card rounded-2xl p-8 text-center flex flex-col items-center gap-5">
              <div className="text-yellow-400 text-3xl select-none">♛</div>
              <div>
                <h3 className="text-white font-black text-xl mb-3" style={{ fontFamily: "'Cinzel', serif" }}>
                  About XL Classes
                </h3>
                <p className="text-white/40 text-sm leading-relaxed max-w-lg mx-auto">
                  XL Classes is dedicated to nurturing young talent through competitive academics and co-curricular excellence. The Under 19 XL Checkmate Championship is our commitment to building the next generation of thinkers and leaders — one move at a time.
                </p>
              </div>
              <a
                href="https://xl-classes.github.io/results.nic.in"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold px-7 py-3 rounded-xl text-sm font-bold tracking-wide"
              >
                Visit Official Website ↗
              </a>
            </div>
          </Section>
        </section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  7 · FINAL CTA                                         */}
        {/* ═══════════════════════════════════════════════════════ */}
        <section className="px-4 pb-24">
          <Section>
            <div className="final-cta max-w-3xl mx-auto rounded-2xl px-8 py-16 text-center flex flex-col items-center gap-6">
              <p className="text-yellow-400/60 text-xs tracking-[0.35em] uppercase">
                The Board Is Set
              </p>
              <h2
                className="text-3xl sm:text-4xl font-black text-white leading-tight"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Are You Ready To{" "}
                <span className="text-yellow-400">Make Your Move?</span>
              </h2>
              <p className="text-white/30 text-sm">
                Seats are limited. Register today and secure your place in history.
              </p>
              <Link href="/register" className="btn-gold px-10 py-4 rounded-xl text-base font-bold tracking-wide">
                Register Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </Section>
        </section>
      </main>
    </>
  );
}
