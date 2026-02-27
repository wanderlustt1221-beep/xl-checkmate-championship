"use client";

import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Player {
    _id: string;
    fullName: string;
    age: number;
    gender: string;
    class: string;
    schoolName?: string;
    status: string;
    createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const GENDER_ICON: Record<string, string> = {
    Male: "♟",
    Female: "♛",
    Other: "♞",
};

const STATUS_COLOR: Record<string, string> = {
    registered: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const SkeletonCard = () => (
    <div className="glass-card rounded-2xl p-5 animate-pulse">
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 shrink-0" />
            <div className="flex-1 space-y-2.5">
                <div className="h-3.5 bg-white/8 rounded-full w-3/4" />
                <div className="h-2.5 bg-white/5 rounded-full w-1/2" />
                <div className="h-2.5 bg-white/5 rounded-full w-2/3" />
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
            <div className="h-6 bg-white/5 rounded-lg w-20" />
            <div className="h-6 bg-white/5 rounded-lg w-24" />
        </div>
    </div>
);

const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-5 text-center empty-enter">
        <div className="text-6xl opacity-20 select-none" aria-hidden>♟</div>
        <div>
            <p
                className="text-white/50 text-lg font-semibold"
                style={{ fontFamily: "'Cinzel', serif" }}
            >
                No Players Yet
            </p>
            <p className="text-white/25 text-sm mt-1">
                Be the first to register for the championship.
            </p>
        </div>
        <a
            href="/register"
            className="mt-2 btn-gold px-6 py-2.5 rounded-xl text-xs font-bold text-black tracking-widest uppercase"
        >
            Register Now
        </a>
    </div>
);

const PlayerCard = ({
    player,
    index,
}: {
    player: Player;
    index: number;
}) => (
    <div
        className="glass-card rounded-2xl p-5 card-hover card-enter"
        style={{ animationDelay: `${Math.min(index * 60, 600)}ms` }}
    >
        <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="avatar-ring w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold text-yellow-400 bg-yellow-400/8">
                {getInitials(player.fullName)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h3
                        className="text-white font-semibold text-sm leading-snug truncate"
                        style={{ fontFamily: "'Cinzel', serif" }}
                    >
                        {player.fullName}
                    </h3>
                    <span className="text-lg leading-none shrink-0 opacity-60" title={player.gender}>
                        {GENDER_ICON[player.gender] ?? "♟"}
                    </span>
                </div>

                <p className="text-white/40 text-xs mt-0.5 truncate">
                    {player.schoolName || "—"}
                </p>

                <p className="text-white/30 text-xs mt-0.5">
                    Registered {formatDate(player.createdAt)}
                </p>
            </div>
        </div>

        {/* Footer tags */}
        <div className="mt-4 pt-3.5 border-t border-white/6 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-2 flex-wrap">
                <span className="tag">{player.class}</span>
                <span className="tag">Age {player.age}</span>
            </div>
            <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full border tracking-wide capitalize ${STATUS_COLOR[player.status] ?? "text-white/40 bg-white/5 border-white/10"
                    }`}
            >
                {player.status}
            </span>
        </div>
    </div>
);

const StatBadge = ({
    value,
    label,
    icon,
}: {
    value: number | string;
    label: string;
    icon: string;
}) => (
    <div className="glass-card rounded-2xl px-6 py-4 flex items-center gap-4 stat-enter">
        <div className="text-2xl opacity-70 select-none">{icon}</div>
        <div>
            <p
                className="text-2xl font-black text-yellow-400 leading-none"
                style={{ fontFamily: "'Cinzel', serif" }}
            >
                {value}
            </p>
            <p className="text-white/40 text-xs mt-0.5 tracking-wide uppercase">{label}</p>
        </div>
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ParticipantsPage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function fetchPlayers() {
            try {
                const res = await fetch("/api/players", { cache: "no-store" });
                const data = await res.json();
                if (data.success) {
                    setPlayers(data.players);
                } else {
                    setError(data.message ?? "Failed to load participants.");
                }
            } catch {
                setError("Network error. Please refresh the page.");
            } finally {
                setLoading(false);
            }
        }
        fetchPlayers();
    }, []);

    const filtered = players.filter((p) =>
        `${p.fullName} ${p.schoolName ?? ""} ${p.class}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Jost:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Jost', sans-serif; background: #0a0a0a; margin: 0; }

        /* ── background ── */
        .page-bg {
          min-height: 100vh;
          background-color: #0a0a0a;
          background-image:
            radial-gradient(ellipse 70% 50% at 50% -5%, rgba(250,204,21,0.10) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 95% 100%, rgba(250,204,21,0.05) 0%, transparent 50%),
            repeating-conic-gradient(#111 0% 25%, #0d0d0d 25% 50%);
          background-size: auto, auto, 48px 48px;
        }

        /* ── glass card ── */
        .glass-card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
        }

        /* ── card hover ── */
        .card-hover {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          cursor: default;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(250,204,21,0.2);
          border-color: rgba(250,204,21,0.2);
        }

        /* ── card entrance ── */
        .card-enter {
          opacity: 0;
          animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── page header entrance ── */
        .page-enter { animation: pageIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── stat badge entrance ── */
        .stat-enter { animation: cardIn 0.6s 0.1s cubic-bezier(0.22,1,0.36,1) both; }

        /* ── empty state ── */
        .empty-enter { animation: cardIn 0.6s 0.2s cubic-bezier(0.22,1,0.36,1) both; }

        /* ── avatar ring ── */
        .avatar-ring {
          border: 1px solid rgba(250,204,21,0.2);
          transition: border-color 0.2s, background 0.2s;
        }
        .card-hover:hover .avatar-ring {
          border-color: rgba(250,204,21,0.5);
          background: rgba(250,204,21,0.12);
        }

        /* ── tag ── */
        .tag {
          display: inline-block;
          font-size: 0.68rem;
          color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          padding: 2px 8px;
          letter-spacing: 0.02em;
        }

        /* ── gold bar ── */
        .gold-bar {
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.7), transparent);
          height: 1px;
        }

        /* ── search input ── */
        .search-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 10px 16px 10px 40px;
          color: #fff;
          font-size: 0.875rem;
          font-family: 'Jost', sans-serif;
          outline: none;
          width: 100%;
          max-width: 320px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.2); }
        .search-input:focus {
          border-color: rgba(250,204,21,0.4);
          box-shadow: 0 0 0 3px rgba(250,204,21,0.1);
        }

        /* ── gold button ── */
        .btn-gold {
          background: linear-gradient(135deg,#facc15,#f59e0b);
          position: relative; overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(250,204,21,0.3);
          display: inline-block;
        }
        .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(250,204,21,0.4); }

        /* ── pulse skeleton ── */
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.25} }
        .animate-pulse > * { animation: pulse 1.8s ease-in-out infinite; }
      `}</style>

            <div className="page-bg">
                {/* Ambient orb */}
                <div
                    style={{
                        position: "fixed",
                        top: "-200px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "700px",
                        height: "500px",
                        background: "radial-gradient(ellipse, rgba(250,204,21,0.07) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />

                <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:py-16">

                    {/* ── Page Header ── */}
                    <div className="page-enter flex flex-col items-center text-center mb-10 gap-2">
                        <p className="text-yellow-400/70 text-xs tracking-[0.3em] uppercase font-medium">
                            XL Classes · XL Checkmate Championship
                        </p>
                        <h1
                            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight"
                            style={{ fontFamily: "'Cinzel', serif" }}
                        >
                            Championship{" "}
                            <span className="text-yellow-400">Participants</span>
                        </h1>
                        <p className="text-white/35 text-sm mt-1 tracking-wide">
                            All registered players for the XL Checkmate Championship
                        </p>
                        <div className="gold-bar w-32 mt-4" />
                    </div>

                    {/* ── Stats Row ── */}
                    {!loading && !error && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                            <StatBadge value={players.length} label="Total Registered" icon="♟" />
                            <StatBadge
                                value={players.filter((p) => p.gender === "Male").length}
                                label="Male Players"
                                icon="♞"
                            />
                            <StatBadge
                                value={players.filter((p) => p.gender === "Female").length}
                                label="Female Players"
                                icon="♛"
                            />
                        </div>
                    )}

                    {/* ── Search Bar ── */}
                    {!loading && players.length > 0 && (
                        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                            <p className="text-white/30 text-sm">
                                Showing{" "}
                                <span className="text-yellow-400 font-medium">{filtered.length}</span>{" "}
                                {filtered.length === 1 ? "player" : "players"}
                                {search && (
                                    <span className="text-white/20"> for &ldquo;{search}&rdquo;</span>
                                )}
                            </p>
                            <div className="relative">
                                <svg
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <circle cx="11" cy="11" r="8" />
                                    <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search name, school, class…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Error State ── */}
                    {error && (
                        <div className="glass-card rounded-2xl p-6 text-center border border-red-400/20">
                            <p className="text-red-400 text-sm">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 text-xs text-white/40 hover:text-white/70 underline transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* ── Loading Skeletons ── */}
                    {loading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    )}

                    {/* ── Player Cards Grid ── */}
                    {!loading && !error && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.length === 0 ? (
                                <EmptyState />
                            ) : (
                                filtered.map((player, i) => (
                                    <PlayerCard key={player._id} player={player} index={i} />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}