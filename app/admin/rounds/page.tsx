"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Round {
    _id: string;
    name: string;
    status: "upcoming" | "ongoing" | "completed";
    createdAt: string;
}

interface MatchSummary {
    total: number;
    completed: number;
}

type RoundWithMatches = Round & { matches: MatchSummary };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    ongoing: {
        label: "Ongoing",
        className: "text-yellow-400 bg-yellow-400/10 border-yellow-400/25",
        dot: "bg-yellow-400",
        pulse: true,
    },
    completed: {
        label: "Completed",
        className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
        dot: "bg-emerald-400",
        pulse: false,
    },
    upcoming: {
        label: "Upcoming",
        className: "text-white/40 bg-white/5 border-white/10",
        dot: "bg-white/30",
        pulse: false,
    },
} as const;

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Round["status"] }) {
    const cfg = STATUS_CONFIG[status];
    return (
        <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.className}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot} ${cfg.pulse ? "animate-pulse" : ""}`} />
            {cfg.label}
        </span>
    );
}

// ─── Round Card ───────────────────────────────────────────────────────────────

function RoundCard({
    round,
    index,
}: {
    round: RoundWithMatches;
    index: number;
}) {
    const progress =
        round.matches.total > 0
            ? Math.round((round.matches.completed / round.matches.total) * 100)
            : 0;

    return (
        <div
            className="round-card group relative rounded-2xl p-5 flex flex-col gap-4"
            style={{ animationDelay: `${index * 70}ms` }}
        >
            {/* Hover glow */}
            <div className="card-glow" />

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Round number pill */}
                    <div className="round-num shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-yellow-400 font-black text-sm"
                        style={{ fontFamily: "'Cinzel', serif" }}>
                        {index + 1}
                    </div>
                    <div className="min-w-0">
                        <h3
                            className="text-white font-semibold text-sm leading-snug truncate"
                            style={{ fontFamily: "'Cinzel', serif" }}
                        >
                            {round.name}
                        </h3>
                        <p className="text-white/25 text-xs mt-0.5">
                            Created {formatDate(round.createdAt)}
                        </p>
                    </div>
                </div>
                <StatusBadge status={round.status} />
            </div>

            {/* Match stats */}
            <div className="relative z-10 flex items-center gap-4 text-xs text-white/40">
                <span>
                    <span className="text-white/70 font-semibold">{round.matches.total}</span> Matches
                </span>
                <span className="w-px h-3 bg-white/10" />
                <span>
                    <span className="text-emerald-400 font-semibold">{round.matches.completed}</span> Completed
                </span>
                <span className="w-px h-3 bg-white/10" />
                <span>
                    <span className="text-white/50 font-semibold">
                        {round.matches.total - round.matches.completed}
                    </span> Pending
                </span>
            </div>

            {/* Progress bar */}
            {round.matches.total > 0 && (
                <div className="relative z-10">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-white/20 text-xs mt-1">{progress}% complete</p>
                </div>
            )}

            {/* Divider */}
            <div className="relative z-10 h-px w-full bg-white/5" />

            {/* Footer action */}
            <div className="relative z-10">
                <a
                    href={`/admin/rounds/${round._id}`}
                    className="manage-btn w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase"
                >
                    <span>◈</span>
                    Manage Round
                </a>
            </div>
        </div>
    );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard({ delay = 0 }: { delay?: number }) {
    return (
        <div
            className="skeleton-card rounded-2xl p-5 space-y-4"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5" />
                    <div className="space-y-2">
                        <div className="h-3 rounded-full bg-white/6 w-28" />
                        <div className="h-2 rounded-full bg-white/4 w-20" />
                    </div>
                </div>
                <div className="h-6 w-20 rounded-full bg-white/5" />
            </div>
            <div className="flex gap-4">
                <div className="h-2.5 rounded-full bg-white/5 w-16" />
                <div className="h-2.5 rounded-full bg-white/4 w-20" />
            </div>
            <div className="h-1 rounded-full bg-white/4 w-full" />
            <div className="h-9 rounded-xl bg-white/4 w-full" />
        </div>
    );
}

// ─── Create Round Modal ───────────────────────────────────────────────────────

function CreateRoundModal({
    onClose,
    onCreated,
}: {
    onClose: () => void;
    onCreated: (round: Round) => void;
}) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            setError("Round name is required.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/rounds", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim() }),
            });

            const data = await res.json();

            if (data.success) {
                onCreated(data.round);
                onClose();
            } else if (data.errors?.name) {
                setError(data.errors.name);
            } else {
                setError(data.message ?? "Something went wrong.");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="modal-card relative w-full max-w-md rounded-2xl p-6 z-10">
                {/* Gold top bar */}
                <div className="gold-bar mb-6" />

                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h2
                            className="text-white font-bold text-base"
                            style={{ fontFamily: "'Cinzel', serif" }}
                        >
                            Create New Round
                        </h2>
                        <p className="text-white/30 text-xs mt-1">
                            Add a new round to the championship.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4">
                        <div>
                            <label className="text-white/60 text-xs font-medium tracking-widest uppercase block mb-1.5">
                                Round Name <span className="text-yellow-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setError("");
                                }}
                                placeholder="e.g. Round 1, Quarter Finals…"
                                autoFocus
                                className={`modal-input w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all duration-200
                  ${error ? "border-red-400/50 focus:ring-red-400/30" : "focus:ring-yellow-400/30 focus:border-yellow-400/40"}`}
                            />
                            {error && (
                                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white/80 transition-colors"
                                style={{
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black tracking-wide create-btn disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner" />
                                        Creating…
                                    </>
                                ) : (
                                    "Create Round"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div className="text-5xl opacity-15 select-none">◈</div>
            <div>
                <p className="text-white/40 font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>
                    No Rounds Yet
                </p>
                <p className="text-white/20 text-sm mt-1">
                    Create the first round to start the championship.
                </p>
            </div>
            <button onClick={onAdd} className="create-btn px-6 py-2.5 rounded-xl text-xs font-bold text-black tracking-widest uppercase">
                + Create First Round
            </button>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminRoundsPage() {
    const [rounds, setRounds] = useState<RoundWithMatches[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchRounds = useCallback(async () => {
        try {
            const res = await fetch("/api/rounds", { cache: "no-store" });
            const data = await res.json();

            if (!data.success) {
                setError("Failed to load rounds.");
                return;
            }

            // Fetch match counts for all rounds in parallel
            const withMatches: RoundWithMatches[] = await Promise.all(
                (data.rounds as Round[]).map(async (round) => {
                    try {
                        const mRes = await fetch(`/api/matches?roundId=${round._id}`, {
                            cache: "no-store",
                        });
                        const mData = await mRes.json();
                        const matches = mData.success ? (mData.matches as { status: string }[]) : [];
                        return {
                            ...round,
                            matches: {
                                total: matches.length,
                                completed: matches.filter((m) => m.status === "completed").length,
                            },
                        };
                    } catch {
                        return { ...round, matches: { total: 0, completed: 0 } };
                    }
                })
            );

            setRounds(withMatches);
        } catch {
            setError("Network error. Please refresh.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRounds();
    }, [fetchRounds]);

    function handleRoundCreated(newRound: Round) {
        setRounds((prev) => [
            ...prev,
            { ...newRound, matches: { total: 0, completed: 0 } },
        ]);
    }

    const totalMatches = rounds.reduce((s, r) => s + r.matches.total, 0);
    const completedMatches = rounds.reduce((s, r) => s + r.matches.completed, 0);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Jost:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }

        /* ── Entrance ── */
        .page-enter { animation: pageIn 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Round card ── */
        .round-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          opacity: 0;
          animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
        }
        .round-card:hover {
          transform: translateY(-4px);
          border-color: rgba(250,204,21,0.25);
          box-shadow: 0 0 0 1px rgba(250,204,21,0.08), 0 20px 48px rgba(0,0,0,0.4);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Hover glow ── */
        .card-glow {
          position: absolute; inset: 0; border-radius: inherit;
          background: radial-gradient(circle at 50% 0%, rgba(250,204,21,0.05), transparent 65%);
          opacity: 0; transition: opacity 0.3s; pointer-events: none;
        }
        .round-card:hover .card-glow { opacity: 1; }

        /* ── Round number pill ── */
        .round-num {
          background: rgba(250,204,21,0.08);
          border: 1px solid rgba(250,204,21,0.18);
        }

        /* ── Progress bar ── */
        .progress-bar {
          background: rgba(255,255,255,0.05);
          border-radius: 99px; height: 3px; overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #facc15, #f59e0b);
          border-radius: 99px;
          transition: width 1s cubic-bezier(0.22,1,0.36,1);
        }

        /* ── Manage button ── */
        .manage-btn {
          background: rgba(250,204,21,0.07);
          border: 1px solid rgba(250,204,21,0.15);
          color: rgba(250,204,21,0.8);
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          font-family: 'Jost', sans-serif;
        }
        .manage-btn:hover {
          background: rgba(250,204,21,0.14);
          border-color: rgba(250,204,21,0.35);
          color: #facc15;
        }

        /* ── Create button ── */
        .create-btn {
          background: linear-gradient(135deg, #facc15, #f59e0b);
          box-shadow: 0 4px 18px rgba(250,204,21,0.28);
          transition: transform 0.2s, box-shadow 0.2s;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 26px rgba(250,204,21,0.4);
        }
        .create-btn:active { transform: translateY(0); }

        /* ── Skeleton ── */
        .skeleton-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
        }
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:.2} }
        .skeleton-card > * { animation: shimmer 1.8s ease-in-out infinite; }

        /* ── Gold bar ── */
        .gold-bar {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.6), transparent);
        }

        /* ── Modal ── */
        .modal-overlay { animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .modal-card {
          background: rgba(14,14,14,0.96);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(250,204,21,0.06);
          backdrop-filter: blur(32px);
          animation: modalIn 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.93) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* ── Modal input ── */
        .modal-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          font-family: 'Jost', sans-serif;
        }
        .modal-input:focus {
          border-color: rgba(250,204,21,0.4);
          box-shadow: 0 0 0 3px rgba(250,204,21,0.1);
        }

        /* ── Spinner ── */
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(0,0,0,0.25);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Summary stat ── */
        .summary-stat {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
        }
      `}</style>

            <div className="page-enter space-y-7">

                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <p className="text-yellow-400/60 text-xs tracking-[0.25em] uppercase mb-1">
                            Management
                        </p>
                        <h1
                            className="text-2xl sm:text-3xl font-black text-white"
                            style={{ fontFamily: "'Cinzel', serif" }}
                        >
                            Rounds
                        </h1>
                        <p className="text-white/30 text-sm mt-1">
                            Create and manage championship rounds
                        </p>
                    </div>

                    <button
                        onClick={() => setModalOpen(true)}
                        className="create-btn px-5 py-2.5 rounded-xl text-sm font-bold text-black tracking-wide shrink-0"
                    >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Round
                    </button>
                </div>

                {/* ── Summary Bar ── */}
                {!loading && rounds.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Total Rounds", value: rounds.length, icon: "◈" },
                            { label: "Total Matches", value: totalMatches, icon: "⚔" },
                            { label: "Completed", value: completedMatches, icon: "✓" },
                        ].map((s) => (
                            <div key={s.label} className="summary-stat rounded-xl px-4 py-3 flex items-center gap-3">
                                <span className="text-yellow-400/60 text-base">{s.icon}</span>
                                <div>
                                    <p className="text-white font-bold text-lg leading-none" style={{ fontFamily: "'Cinzel', serif" }}>
                                        {s.value}
                                    </p>
                                    <p className="text-white/30 text-xs mt-0.5">{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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

                {/* ── Cards Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <SkeletonCard key={i} delay={i * 70} />
                        ))
                    ) : rounds.length === 0 ? (
                        <EmptyState onAdd={() => setModalOpen(true)} />
                    ) : (
                        rounds.map((round, i) => (
                            <RoundCard key={round._id} round={round} index={i} />
                        ))
                    )}
                </div>
            </div>

            {/* ── Modal ── */}
            {modalOpen && (
                <CreateRoundModal
                    onClose={() => setModalOpen(false)}
                    onCreated={handleRoundCreated}
                />
            )}
        </>
    );
}