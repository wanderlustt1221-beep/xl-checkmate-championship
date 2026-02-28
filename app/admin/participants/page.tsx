"use client";

import { useEffect, useState, useMemo, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlayerStatus = "registered" | "qualified" | "eliminated" | "champion";

interface Player {
    _id: string;
    fullName: string;
    age: number;
    gender: string;
    class: string;
    schoolName?: string;
    mobile?: string;
    status: PlayerStatus;
    createdAt: string;
}

type FilterOption = "all" | PlayerStatus;

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

const STATUS_CONFIG: Record<PlayerStatus, {
    label: string;
    dotColor: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    glow: string;
}> = {
    registered: {
        label: "Registered",
        dotColor: "#a1a1aa",
        badgeBg: "rgba(113,113,122,0.15)",
        badgeBorder: "rgba(161,161,170,0.25)",
        badgeText: "#d4d4d8",
        glow: "rgba(161,161,170,0.07)",
    },
    qualified: {
        label: "Qualified",
        dotColor: "#facc15",
        badgeBg: "rgba(250,204,21,0.12)",
        badgeBorder: "rgba(250,204,21,0.3)",
        badgeText: "#fde68a",
        glow: "rgba(250,204,21,0.09)",
    },
    eliminated: {
        label: "Eliminated",
        dotColor: "#f87171",
        badgeBg: "rgba(239,68,68,0.12)",
        badgeBorder: "rgba(248,113,113,0.28)",
        badgeText: "#fca5a5",
        glow: "rgba(248,113,113,0.08)",
    },
    champion: {
        label: "Champion",
        dotColor: "#fde68a",
        badgeBg: "rgba(253,224,71,0.14)",
        badgeBorder: "rgba(253,224,71,0.35)",
        badgeText: "#fef08a",
        glow: "rgba(253,224,71,0.13)",
    },
};

const FILTER_OPTIONS: { value: FilterOption; label: string; emoji: string }[] = [
    { value: "all", label: "All", emoji: "⊞" },
    { value: "registered", label: "Registered", emoji: "📋" },
    { value: "qualified", label: "Qualified", emoji: "⚡" },
    { value: "eliminated", label: "Eliminated", emoji: "✕" },
    { value: "champion", label: "Champion", emoji: "♛" },
];

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
    });
}

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PlayerStatus }) {
    const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.registered;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 99,
            background: c.badgeBg,
            border: `1px solid ${c.badgeBorder}`,
            color: c.badgeText,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.73rem", fontWeight: 700,
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
        }}>
            <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: c.dotColor, flexShrink: 0,
                ...(status === "champion" ? { animation: "pulse 1.8s ease-in-out infinite" } : {}),
            }} />
            {c.label}
        </span>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{
                    background: "rgba(255,255,255,0.022)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 20, padding: 20,
                    animation: `skel 1.8s ${i * 0.13}s ease-in-out infinite`,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                        <div style={{ width: 54, height: 54, borderRadius: 16, background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ height: 14, borderRadius: 6, width: "65%", background: "rgba(255,255,255,0.08)", marginBottom: 9 }} />
                            <div style={{ height: 10, borderRadius: 5, width: "38%", background: "rgba(255,255,255,0.04)" }} />
                        </div>
                    </div>
                    <div style={{ height: 28, width: 110, borderRadius: 99, background: "rgba(255,255,255,0.05)", marginBottom: 14 }} />
                    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                        <div style={{ height: 28, width: 95, borderRadius: 9, background: "rgba(255,255,255,0.04)" }} />
                        <div style={{ height: 28, flex: 1, borderRadius: 9, background: "rgba(255,255,255,0.03)" }} />
                    </div>
                    <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 12 }} />
                    <div style={{ height: 10, borderRadius: 5, width: "42%", background: "rgba(255,255,255,0.03)" }} />
                </div>
            ))}
        </div>
    );
}

// ─── Player Card ──────────────────────────────────────────────────────────────

function PlayerCard({ player, index }: { player: Player; index: number }) {
    const c = STATUS_CONFIG[player.status] ?? STATUS_CONFIG.registered;

    return (
        <div
            style={{
                position: "relative",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "18px 18px 15px 18px",
                overflow: "hidden",
                animation: `cardIn 0.42s cubic-bezier(0.22,1,0.36,1) ${index * 0.055}s both`,
            }}
        >
            {/* Ambient glow top-right */}
            <div style={{
                position: "absolute", top: -45, right: -45,
                width: 140, height: 140, borderRadius: "50%",
                background: c.glow, filter: "blur(38px)",
                pointerEvents: "none",
            }} />

            {/* ── Row 1: Avatar + Full Name + Meta ── */}
            <div style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                marginBottom: 14, position: "relative", zIndex: 1,
            }}>
                {/* Avatar */}
                <div style={{
                    width: 54, height: 54, borderRadius: 16, flexShrink: 0,
                    background: "linear-gradient(135deg, rgba(250,204,21,0.15), rgba(250,204,21,0.04))",
                    border: "1.5px solid rgba(250,204,21,0.24)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Cinzel', serif",
                    fontSize: "0.85rem", fontWeight: 700,
                    color: "rgba(250,204,21,0.9)",
                    letterSpacing: "0.04em",
                }}>
                    {getInitials(player.fullName)}
                </div>

                {/* Name block — NO truncation, full wrap */}
                <div style={{ flex: 1, minWidth: 0, paddingTop: 3 }}>
                    <p style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: "0.98rem", fontWeight: 700,
                        color: "rgba(255,255,255,0.93)",
                        lineHeight: 1.35,
                        /* CRITICAL: allow wrapping, never truncate */
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        whiteSpace: "normal",
                        marginBottom: 6,
                    }}>
                        {player.fullName}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                        <span style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "0.73rem", fontWeight: 500,
                            color: "rgba(255,255,255,0.35)",
                        }}>
                            {player.gender}
                        </span>
                        <span style={{
                            width: 3, height: 3, borderRadius: "50%",
                            background: "rgba(255,255,255,0.2)", flexShrink: 0,
                        }} />
                        <span style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "0.73rem", fontWeight: 500,
                            color: "rgba(255,255,255,0.35)",
                        }}>
                            {player.age} yrs
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Row 2: Status Badge ── */}
            <div style={{ marginBottom: 14, position: "relative", zIndex: 1 }}>
                <StatusBadge status={player.status} />
            </div>

            {/* ── Row 3: Info Chips ── */}
            <div style={{
                display: "flex", flexDirection: "column", gap: 8,
                marginBottom: 14, position: "relative", zIndex: 1,
            }}>
                {/* Class chip */}
                <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 13px", borderRadius: 10, alignSelf: "flex-start",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.75rem", fontWeight: 600,
                    color: "rgba(255,255,255,0.6)",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    whiteSpace: "nowrap",
                }}>
                    <svg style={{ width: 12, height: 12, opacity: 0.5, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    Class {player.class}
                </span>

                {/* School chip — full name, wraps naturally */}
                {player.schoolName && (
                    <span style={{
                        display: "inline-flex", alignItems: "flex-start", gap: 6,
                        padding: "6px 13px", borderRadius: 10, alignSelf: "flex-start",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.75rem", fontWeight: 500,
                        color: "rgba(255,255,255,0.52)",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                        lineHeight: 1.45,
                        maxWidth: "100%",
                    }}>
                        <svg style={{ width: 12, height: 12, opacity: 0.4, flexShrink: 0, marginTop: 2 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {player.schoolName}
                    </span>
                )}
            </div>

            {/* ── Divider ── */}
            <div style={{
                height: 1, background: "rgba(255,255,255,0.06)",
                marginBottom: 13, position: "relative", zIndex: 1,
            }} />

            {/* ── Row 4: Footer — date + ID ── */}
            <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: 8,
                position: "relative", zIndex: 1,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg style={{ width: 12, height: 12, color: "rgba(255,255,255,0.22)", flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.7rem", fontWeight: 400,
                        color: "rgba(255,255,255,0.28)",
                    }}>
                        {formatDate(player.createdAt)}
                    </span>
                </div>
                <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.65rem", fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    padding: "2px 9px", borderRadius: 6,
                }}>
                    # {player._id.slice(-6).toUpperCase()}
                </span>
            </div>
        </div>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ currentPage, totalPages, onPageChange, totalItems, startIdx, endIdx }: {
    currentPage: number; totalPages: number;
    onPageChange: (p: number) => void;
    totalItems: number; startIdx: number; endIdx: number;
}) {
    if (totalPages <= 1) return null;

    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push("...");
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
        if (currentPage < totalPages - 2) pages.push("...");
        pages.push(totalPages);
    }

    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 10, padding: "14px 18px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
            <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.72rem", color: "rgba(255,255,255,0.25)",
            }}>
                <span style={{ color: "rgba(250,204,21,0.7)", fontWeight: 700 }}>{startIdx}–{endIdx}</span>
                {" "}/{" "}{totalItems}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
                    style={{
                        width: 34, height: 34, borderRadius: 9,
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        color: "rgba(255,255,255,0.35)",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        opacity: currentPage === 1 ? 0.28 : 1,
                    }}>
                    <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                {pages.map((p, idx) =>
                    p === "..." ? (
                        <span key={`e${idx}`} style={{
                            width: 28, height: 34, display: "inline-flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.18)",
                        }}>…</span>
                    ) : (
                        <button key={p} onClick={() => onPageChange(p as number)} style={{
                            minWidth: 34, height: 34, borderRadius: 9, padding: "0 6px",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", fontWeight: 600,
                            cursor: "pointer",
                            background: currentPage === p ? "rgba(250,204,21,0.12)" : "transparent",
                            border: `1px solid ${currentPage === p ? "rgba(250,204,21,0.32)" : "transparent"}`,
                            color: currentPage === p ? "#facc15" : "rgba(255,255,255,0.38)",
                        }}>
                            {p}
                        </button>
                    )
                )}
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
                    style={{
                        width: 34, height: 34, borderRadius: 9,
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        color: "rgba(255,255,255,0.35)",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                        opacity: currentPage === totalPages ? 0.28 : 1,
                    }}>
                    <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminParticipantsPage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterOption>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const fetchPlayers = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await fetch("/api/players", { cache: "no-store" });
            const data = await res.json();
            if (data.success) setPlayers(data.players);
            else setError("Failed to load participants.");
        } catch { setError("Network error. Please refresh."); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchPlayers(); }, [fetchPlayers]);
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(t);
    }, [toast]);
    useEffect(() => { setCurrentPage(1); }, [filter, search]);

    const filtered = useMemo(() => {
        let list = players;
        if (filter !== "all") list = list.filter((p) => p.status === filter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((p) =>
                p.fullName.toLowerCase().includes(q) ||
                (p.schoolName ?? "").toLowerCase().includes(q) ||
                p.class.toLowerCase().includes(q)
            );
        }
        return list;
    }, [players, filter, search]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, filtered.length);
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const counts = useMemo(() => ({
        all: players.length,
        registered: players.filter((p) => p.status === "registered").length,
        qualified: players.filter((p) => p.status === "qualified").length,
        eliminated: players.filter((p) => p.status === "eliminated").length,
        champion: players.filter((p) => p.status === "champion").length,
    }), [players]);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes skel   { 0%,100%{opacity:.55} 50%{opacity:.18} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cardIn { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes toastIn{ from{opacity:0;transform:translateY(-24px) scale(0.93)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.45;transform:scale(0.82)} }

        /* Filter pills horizontal scroll */
        .filter-row {
          display: flex; gap: 8px; align-items: center;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 2px;
        }
        .filter-row::-webkit-scrollbar { display: none; }

        /* Search input placeholder */
        input::placeholder { color: rgba(255,255,255,0.2); }

        /* Desktop table */
        .tbl-outer {
          background: rgba(255,255,255,0.022);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; overflow: hidden;
        }
        table { width: 100%; border-collapse: collapse; }
        thead th {
          padding: 13px 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.61rem; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(255,255,255,0.24);
          background: rgba(255,255,255,0.018);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          text-align: left; white-space: nowrap;
        }
        tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.035);
          transition: background 0.18s;
        }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: rgba(255,255,255,0.022); }
        tbody td {
          padding: 14px 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.5);
          vertical-align: middle;
        }

        /* Toast */
        .toast {
          position: fixed; top: 18px; right: 16px; left: 16px;
          z-index: 999;
          display: flex; align-items: center; gap: 10px;
          padding: 13px 18px; border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem; font-weight: 600;
          animation: toastIn 0.35s cubic-bezier(0.22,1,0.36,1);
          box-shadow: 0 14px 44px rgba(0,0,0,0.5);
          max-width: 420px; margin: 0 auto;
        }
        @media(min-width:480px){ .toast { left: auto; min-width: 300px; } }
      `}</style>

            <div style={{
                animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both",
                display: "flex", flexDirection: "column", gap: 20,
            }}>

                {/* ─── Header ─── */}
                <div
                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 sm:gap-4"
                >
                    {/* Left Content */}
                    <div className="max-w-full sm:max-w-[70%]">
                        <p
                            className="uppercase tracking-[0.24em] font-bold text-[0.62rem] text-yellow-400/50 mb-1"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                            Management
                        </p>

                        <h1
                            className="text-white font-black leading-tight text-[clamp(1.5rem,6vw,2.1rem)] break-words"
                            style={{ fontFamily: "'Cinzel', serif" }}
                        >
                            Participants
                        </h1>

                        <p
                            className="text-white/30 text-xs mt-2"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                            All registered players for the championship
                        </p>
                    </div>

                    {/* Right Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                            onClick={fetchPlayers}
                            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white transition text-sm"
                        >
                            ↻ Refresh
                        </button>

                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch("/api/players/whatsapp");
                                    const data = await res.json();

                                    if (data.success) {
                                        window.open(data.url, "_blank");
                                    } else {
                                        setToast({ msg: "Failed to send list", type: "error" });
                                    }
                                } catch {
                                    setToast({ msg: "Network error", type: "error" });
                                }
                            }}
                            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition text-sm shadow-lg shadow-yellow-400/20"
                        >
                            📲 Send to Whatsapp →
                        </button>
                    </div>
                </div>

                {/* ─── Error ─── */}
                {error && (
                    <div style={{
                        background: "rgba(239,68,68,0.07)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: 14, padding: "14px 18px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.82rem", color: "rgba(239,68,68,0.85)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                        <span>{error}</span>
                        <button onClick={fetchPlayers} style={{
                            fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem",
                            color: "rgba(255,255,255,0.5)", background: "none",
                            border: "none", cursor: "pointer", textDecoration: "underline",
                        }}>Retry</button>
                    </div>
                )}

                {/* ─── Stat Cards ─── */}
                {!loading && players.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                        {[
                            { label: "Total", value: counts.all, color: "rgba(255,255,255,0.9)" },
                            { label: "Qualified", value: counts.qualified, color: "#facc15" },
                            { label: "Eliminated", value: counts.eliminated, color: "#f87171" },
                            { label: "Champions", value: counts.champion, color: "#fde68a" },
                        ].map((s) => (
                            <div key={s.label} style={{
                                background: "rgba(255,255,255,0.025)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: 16, padding: "14px 16px",
                            }}>
                                <p style={{
                                    fontFamily: "'Cinzel', serif",
                                    fontSize: "1.75rem", fontWeight: 900,
                                    color: s.color, lineHeight: 1, marginBottom: 6,
                                }}>{s.value}</p>
                                <p style={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: "0.65rem", fontWeight: 700,
                                    letterSpacing: "0.1em", textTransform: "uppercase",
                                    color: "rgba(255,255,255,0.25)",
                                }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── Search ─── */}
                <div style={{ position: "relative" }}>
                    <svg style={{
                        position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                        width: 16, height: 16, color: "rgba(255,255,255,0.2)", pointerEvents: "none",
                    }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, school, class…"
                        style={{
                            width: "100%",
                            background: "rgba(255,255,255,0.04)",
                            border: "1.5px solid rgba(255,255,255,0.08)",
                            borderRadius: 14, color: "#fff",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "0.875rem",
                            padding: "13px 42px 13px 44px",
                            outline: "none",
                            transition: "border-color 0.2s, box-shadow 0.2s",
                        }}
                        onFocus={e => {
                            e.target.style.borderColor = "rgba(250,204,21,0.4)";
                            e.target.style.boxShadow = "0 0 0 4px rgba(250,204,21,0.07)";
                        }}
                        onBlur={e => {
                            e.target.style.borderColor = "rgba(255,255,255,0.08)";
                            e.target.style.boxShadow = "none";
                        }}
                    />
                    {search && (
                        <button onClick={() => setSearch("")} style={{
                            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                            color: "rgba(255,255,255,0.25)", background: "none", border: "none",
                            cursor: "pointer", fontSize: "1.1rem", lineHeight: 1, padding: 2,
                        }}>✕</button>
                    )}
                </div>

                {/* ─── Filter Pills ─── */}
                <div className="filter-row">
                    {FILTER_OPTIONS.map((o) => {
                        const isActive = filter === o.value;
                        const count = o.value === "all" ? counts.all : counts[o.value];
                        return (
                            <button key={o.value} onClick={() => setFilter(o.value)} style={{
                                display: "inline-flex", alignItems: "center", gap: 5,
                                padding: "7px 14px", borderRadius: 99,
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "0.75rem", fontWeight: 600,
                                whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer",
                                background: isActive ? "rgba(250,204,21,0.1)" : "rgba(255,255,255,0.03)",
                                border: `1.5px solid ${isActive ? "rgba(250,204,21,0.3)" : "rgba(255,255,255,0.08)"}`,
                                color: isActive ? "#facc15" : "rgba(255,255,255,0.38)",
                                transition: "all 0.2s",
                            }}>
                                <span>{o.emoji}</span>
                                {o.label}
                                <span style={{
                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                    background: isActive ? "rgba(250,204,21,0.18)" : "rgba(255,255,255,0.08)",
                                    borderRadius: 99, fontSize: "0.65rem", fontWeight: 700,
                                    minWidth: 19, height: 19, padding: "0 5px",
                                    color: isActive ? "#facc15" : "rgba(255,255,255,0.45)",
                                }}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* ══════════════════════════════════════
                    MOBILE: Card View  (sm:hidden)
                ══════════════════════════════════════ */}
                <div className="sm:hidden">
                    {loading ? (
                        <CardSkeleton />
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: "72px 24px", textAlign: "center" }}>
                            <div style={{ fontSize: "3rem", opacity: 0.08, marginBottom: 16 }}>♟</div>
                            <p style={{
                                fontFamily: "'Cinzel', serif",
                                fontSize: "0.875rem", fontWeight: 600,
                                color: "rgba(255,255,255,0.28)",
                            }}>
                                {search || filter !== "all" ? "No players match your filters" : "No participants yet"}
                            </p>
                            {(search || filter !== "all") && (
                                <button onClick={() => { setSearch(""); setFilter("all"); }} style={{
                                    marginTop: 14,
                                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem",
                                    color: "rgba(250,204,21,0.55)", background: "none",
                                    border: "none", cursor: "pointer", textDecoration: "underline",
                                }}>Clear filters</button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Full-width single column — no cramped 2-col grid */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {paginated.map((player, idx) => (
                                    <PlayerCard key={player._id} player={player} index={idx} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div style={{
                                    marginTop: 16,
                                    background: "rgba(255,255,255,0.022)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    borderRadius: 16, overflow: "hidden",
                                }}>
                                    <Pagination
                                        currentPage={currentPage} totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        totalItems={filtered.length}
                                        startIdx={startIdx} endIdx={endIdx}
                                    />
                                </div>
                            )}
                            {totalPages === 1 && (
                                <p style={{
                                    textAlign: "center", marginTop: 14,
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: "0.72rem", color: "rgba(255,255,255,0.18)",
                                }}>
                                    {filtered.length} player{filtered.length !== 1 ? "s" : ""}
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* ══════════════════════════════════════
                    DESKTOP: Table View  (hidden sm:block)
                ══════════════════════════════════════ */}
                <div className="hidden sm:block">
                    {loading ? (
                        <div style={{
                            background: "rgba(255,255,255,0.022)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 18, overflow: "hidden", padding: 20,
                        }}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} style={{
                                    display: "flex", alignItems: "center", gap: 16,
                                    padding: "12px 0",
                                    borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.04)" : "none",
                                    animation: `skel 1.8s ${i * 0.1}s ease-in-out infinite`,
                                }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ height: 11, borderRadius: 5, width: "30%", background: "rgba(255,255,255,0.07)", marginBottom: 7 }} />
                                        <div style={{ height: 9, borderRadius: 4, width: "18%", background: "rgba(255,255,255,0.04)" }} />
                                    </div>
                                    <div style={{ height: 24, width: 80, borderRadius: 99, background: "rgba(255,255,255,0.05)" }} />
                                    <div style={{ height: 24, width: 60, borderRadius: 8, background: "rgba(255,255,255,0.04)" }} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="tbl-outer">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ paddingLeft: 22 }}>Player</th>
                                        <th>Age</th>
                                        <th>Class</th>
                                        <th>School</th>
                                        <th>Status</th>
                                        <th>Registered</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr><td colSpan={6}>
                                            <div style={{ padding: "72px 24px", textAlign: "center" }}>
                                                <div style={{ fontSize: "3rem", opacity: 0.08, marginBottom: 16 }}>♟</div>
                                                <p style={{
                                                    fontFamily: "'Cinzel', serif", fontSize: "0.875rem",
                                                    fontWeight: 600, color: "rgba(255,255,255,0.28)",
                                                }}>
                                                    {search || filter !== "all" ? "No players match" : "No participants yet"}
                                                </p>
                                            </div>
                                        </td></tr>
                                    ) : (
                                        paginated.map((player) => (
                                            <tr key={player._id}>
                                                <td style={{ paddingLeft: 22, minWidth: 200 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                        <div style={{
                                                            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                                                            background: "rgba(250,204,21,0.09)",
                                                            border: "1.5px solid rgba(250,204,21,0.2)",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            fontFamily: "'Cinzel', serif",
                                                            fontSize: "0.7rem", fontWeight: 700,
                                                            color: "rgba(250,204,21,0.82)",
                                                        }}>
                                                            {getInitials(player.fullName)}
                                                        </div>
                                                        <div>
                                                            <p style={{
                                                                fontFamily: "'Cinzel', serif",
                                                                fontSize: "0.82rem", fontWeight: 700,
                                                                color: "rgba(255,255,255,0.88)",
                                                            }}>{player.fullName}</p>
                                                            <p style={{
                                                                fontFamily: "'DM Sans', sans-serif",
                                                                fontSize: "0.68rem",
                                                                color: "rgba(255,255,255,0.25)",
                                                                marginTop: 2,
                                                            }}>{player.gender}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{player.age}</td>
                                                <td>
                                                    <span style={{
                                                        fontSize: "0.75rem", padding: "3px 10px", borderRadius: 7,
                                                        background: "rgba(255,255,255,0.05)",
                                                        border: "1px solid rgba(255,255,255,0.08)",
                                                        color: "rgba(255,255,255,0.52)",
                                                    }}>
                                                        {player.class}
                                                    </span>
                                                </td>
                                                <td style={{ maxWidth: 180 }}>
                                                    <span style={{
                                                        display: "block", overflow: "hidden",
                                                        textOverflow: "ellipsis", whiteSpace: "nowrap",
                                                    }} title={player.schoolName}>
                                                        {player.schoolName || <span style={{ color: "rgba(255,255,255,0.18)" }}>—</span>}
                                                    </span>
                                                </td>
                                                <td><StatusBadge status={player.status} /></td>
                                                <td style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>
                                                    {formatDate(player.createdAt)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {filtered.length > 0 && (
                                <Pagination
                                    currentPage={currentPage} totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    totalItems={filtered.length}
                                    startIdx={startIdx} endIdx={endIdx}
                                />
                            )}
                        </div>
                    )}
                </div>

            </div>

            {/* ─── Toast ─── */}
            {toast && (
                <div className="toast" style={{
                    background: toast.type === "success" ? "#facc15" : "rgba(239,68,68,0.92)",
                    border: toast.type === "error" ? "1px solid rgba(239,68,68,0.3)" : "none",
                    color: toast.type === "success" ? "#0d0d0d" : "#fff",
                    backdropFilter: "blur(12px)",
                }}>
                    {toast.type === "success" ? (
                        <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    )}
                    {toast.msg}
                </div>
            )}
        </>
    );
}
