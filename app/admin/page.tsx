"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
    totalPlayers: number;
    totalRounds: number;
    totalMatches: number;
    completedMatches: number;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    icon,
    sub,
    delay = 0,
}: {
    label: string;
    value: number | string;
    icon: string;
    sub?: string;
    delay?: number;
}) {
    return (
        <div
            className="stat-card group relative rounded-2xl p-5 cursor-default"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Hover glow */}
            <div className="card-glow" />

            <div className="relative z-10 flex items-start justify-between">
                {/* Icon */}
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{
                        background: "rgba(250,204,21,0.08)",
                        border: "1px solid rgba(250,204,21,0.15)",
                    }}
                >
                    {icon}
                </div>

                {/* Value */}
                <span
                    className="text-3xl font-black text-yellow-400 leading-none"
                    style={{ fontFamily: "'Cinzel', serif" }}
                >
                    {value}
                </span>
            </div>

            <div className="relative z-10 mt-4">
                <p className="text-white/80 text-sm font-medium tracking-wide">{label}</p>
                {sub && (
                    <p className="text-white/25 text-xs mt-0.5">{sub}</p>
                )}
            </div>
        </div>
    );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard({ delay = 0 }: { delay?: number }) {
    return (
        <div
            className="rounded-2xl p-5 skeleton-card"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-white/5" />
                <div className="w-12 h-8 rounded-lg bg-white/5" />
            </div>
            <div className="mt-4 space-y-2">
                <div className="h-3 rounded-full bg-white/5 w-2/3" />
                <div className="h-2.5 rounded-full bg-white/4 w-1/2" />
            </div>
        </div>
    );
}

// ─── Quick Action Button ──────────────────────────────────────────────────────

function ActionButton({
    href,
    children,
    external,
}: {
    href: string;
    children: React.ReactNode;
    external?: boolean;
}) {
    return (
        <Link
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="action-btn flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold text-black tracking-wide"
        >
            {children}
        </Link>
    );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <h2
                className="text-white/80 text-xs font-semibold tracking-[0.2em] uppercase"
                style={{ fontFamily: "'Jost', sans-serif" }}
            >
                {children}
            </h2>
            <div
                className="flex-1 h-px"
                style={{
                    background:
                        "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)",
                }}
            />
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch all three endpoints in parallel
                const [playersRes, roundsRes, matchesRes] = await Promise.all([
                    fetch("/api/players", { cache: "no-store" }),
                    fetch("/api/rounds", { cache: "no-store" }),
                    // matches without roundId returns an error — fetch all via rounds
                    // We fetch matches summary by fetching all rounds then all matches per round
                    fetch("/api/rounds", { cache: "no-store" }),
                ]);

                const [playersData, roundsData] = await Promise.all([
                    playersRes.json(),
                    roundsRes.json(),
                ]);

                // Fetch matches for every round in parallel, then aggregate
                let totalMatches = 0;
                let completedMatches = 0;

                if (roundsData.success && roundsData.rounds.length > 0) {
                    const matchResults = await Promise.all(
                        roundsData.rounds.map((r: { _id: string }) =>
                            fetch(`/api/matches?roundId=${r._id}`, {
                                cache: "no-store",
                            }).then((res) => res.json())
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
                    totalPlayers: playersData.success ? playersData.count : 0,
                    totalRounds: roundsData.success ? roundsData.count : 0,
                    totalMatches,
                    completedMatches,
                });
            } catch {
                setError("Failed to load dashboard data. Please refresh.");
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const STAT_CARDS = stats
        ? [
            {
                label: "Total Players",
                value: stats.totalPlayers,
                icon: "♟",
                sub: "Registered participants",
            },
            {
                label: "Total Rounds",
                value: stats.totalRounds,
                icon: "◈",
                sub: "Championship rounds",
            },
            {
                label: "Total Matches",
                value: stats.totalMatches,
                icon: "⚔",
                sub: "Across all rounds",
            },
            {
                label: "Completed Matches",
                value: stats.completedMatches,
                icon: "✓",
                sub: `${stats.totalMatches > 0 ? Math.round((stats.completedMatches / stats.totalMatches) * 100) : 0}% finished`,
            },
        ]
        : [];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Jost:wght@300;400;500;600&display=swap');

        /* ── Page entrance ── */
        .page-enter { animation: pageIn 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Stat card ── */
        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
          opacity: 0;
          animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .stat-card:hover {
          transform: translateY(-4px) scale(1.01);
          border-color: rgba(250,204,21,0.3);
          box-shadow: 0 0 0 1px rgba(250,204,21,0.1), 0 20px 50px rgba(0,0,0,0.4);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Card glow (hidden until hover) ── */
        .card-glow {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(circle at 50% 0%, rgba(250,204,21,0.06), transparent 70%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .stat-card:hover .card-glow { opacity: 1; }

        /* ── Skeleton ── */
        .skeleton-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
        }
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:.25} }
        .skeleton-card > * { animation: shimmer 1.8s ease-in-out infinite; }

        /* ── Action button ── */
        .action-btn {
          background: linear-gradient(135deg, #facc15, #f59e0b);
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(250,204,21,0.25);
          position: relative;
          overflow: hidden;
        }
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(250,204,21,0.4);
        }
        .action-btn:active { transform: translateY(0); }

        /* ── Action secondary button ── */
        .action-btn-outline {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .action-btn-outline:hover {
          border-color: rgba(250,204,21,0.3);
          background: rgba(250,204,21,0.05);
          color: rgba(255,255,255,0.9);
          transform: translateY(-2px);
        }

        /* ── Progress bar ── */
        .progress-bar {
          background: rgba(255,255,255,0.05);
          border-radius: 99px;
          height: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #facc15, #f59e0b);
          border-radius: 99px;
          transition: width 1s cubic-bezier(0.22,1,0.36,1);
        }
      `}</style>

            <div className="page-enter space-y-8">

                {/* ── Page Header ── */}
                <div>
                    <p className="text-yellow-400/60 text-xs tracking-[0.25em] uppercase mb-1">
                        Overview
                    </p>
                    <h1
                        className="text-2xl sm:text-3xl font-black text-white"
                        style={{ fontFamily: "'Cinzel', serif" }}
                    >
                        Dashboard
                    </h1>
                    <p className="text-white/30 text-sm mt-1">
                        Live stats for XL Classes Under 19 Chess Championship
                    </p>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div
                        className="rounded-xl px-5 py-4 text-sm text-red-400"
                        style={{
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.2)",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* ── Stats Grid ── */}
                <div>
                    <SectionHeading>Live Statistics</SectionHeading>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {loading
                            ? Array.from({ length: 4 }).map((_, i) => (
                                <SkeletonCard key={i} delay={i * 60} />
                            ))
                            : STAT_CARDS.map((card, i) => (
                                <StatCard
                                    key={card.label}
                                    label={card.label}
                                    value={card.value}
                                    icon={card.icon}
                                    sub={card.sub}
                                    delay={i * 80}
                                />
                            ))}
                    </div>
                </div>

                {/* ── Match Progress Bar ── */}
                {!loading && stats && stats.totalMatches > 0 && (
                    <div
                        className="rounded-2xl p-5"
                        style={{
                            background: "rgba(255,255,255,0.025)",
                            border: "1px solid rgba(255,255,255,0.06)",
                        }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-white/70 text-sm font-medium">Tournament Progress</p>
                                <p className="text-white/30 text-xs mt-0.5">
                                    {stats.completedMatches} of {stats.totalMatches} matches completed
                                </p>
                            </div>
                            <span
                                className="text-yellow-400 font-black text-lg"
                                style={{ fontFamily: "'Cinzel', serif" }}
                            >
                                {Math.round((stats.completedMatches / stats.totalMatches) * 100)}%
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${(stats.completedMatches / stats.totalMatches) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* ── Quick Actions ── */}
                <div>
                    <SectionHeading>Quick Actions</SectionHeading>
                    <div className="flex flex-wrap gap-3">
                        <ActionButton href="/admin/rounds">
                            <span className="text-base">◈</span>
                            Manage Rounds
                        </ActionButton>

                        <Link
                            href="/bracket"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-btn-outline flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold tracking-wide"
                        >
                            <span className="text-base">⟁</span>
                            View Bracket
                            <span className="text-xs opacity-50">↗</span>
                        </Link>

                        <Link
                            href="/admin/participants"
                            className="action-btn-outline flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold tracking-wide"
                        >
                            <span className="text-base">♟</span>
                            All Participants
                        </Link>

                        <Link
                            href="/register"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-btn-outline flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold tracking-wide"
                        >
                            <span className="text-base">+</span>
                            Register Page
                            <span className="text-xs opacity-50">↗</span>
                        </Link>
                    </div>
                </div>

                {/* ── Footer ── */}
                <p className="text-white/10 text-xs text-center pt-4 tracking-widest uppercase">
                    XL Classes · Under 19 Chess Championship ·{" "}
                    {new Date().getFullYear()}
                </p>
            </div>
        </>
    );
}