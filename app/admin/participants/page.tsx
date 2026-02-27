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

const ITEMS_PER_PAGE = 12;

const STATUS_CONFIG: Record<PlayerStatus, { label: string; dot: string; badge: string; icon: string }> = {
    registered: {
        label: "Registered",
        dot: "bg-white/40",
        badge: "text-white/55 bg-white/6 border-white/10",
        icon: "📋",
    },
    qualified: {
        label: "Qualified",
        dot: "bg-yellow-400",
        badge: "text-yellow-400 bg-yellow-400/10 border-yellow-400/22",
        icon: "⚡",
    },
    eliminated: {
        label: "Eliminated",
        dot: "bg-red-400",
        badge: "text-red-400 bg-red-400/10 border-red-400/22",
        icon: "✕",
    },
    champion: {
        label: "Champion",
        dot: "bg-yellow-300 animate-pulse",
        badge: "text-yellow-300 bg-yellow-400/12 border-yellow-300/35",
        icon: "♛",
    },
};

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
    { value: "all", label: "All" },
    { value: "registered", label: "Registered" },
    { value: "qualified", label: "Qualified" },
    { value: "eliminated", label: "Eliminated" },
    { value: "champion", label: "Champion" },
];

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PlayerStatus }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.registered;
    return (
        <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${cfg.badge}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function TableSkeleton() {
    return (
        <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 px-5 py-4 rounded-xl"
                    style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.04)",
                        animation: `shimmer 1.8s ${i * 0.12}s ease-in-out infinite`,
                    }}
                >
                    <div className="w-9 h-9 rounded-lg flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 rounded-full w-1/3" style={{ background: "rgba(255,255,255,0.07)" }} />
                        <div className="h-2.5 rounded-full w-1/4" style={{ background: "rgba(255,255,255,0.04)" }} />
                    </div>
                    <div className="h-6 w-20 rounded-full hidden sm:block" style={{ background: "rgba(255,255,255,0.05)" }} />
                    <div className="h-6 w-16 rounded-full hidden md:block" style={{ background: "rgba(255,255,255,0.04)" }} />
                </div>
            ))}
        </div>
    );
}

// ─── Mobile Card Skeleton ──────────────────────────────────────────────────────

function CardSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "16px",
                        padding: "16px",
                        animation: `shimmer 1.8s ${i * 0.15}s ease-in-out infinite`,
                    }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.06)" }} />
                        <div className="flex-1">
                            <div className="h-3 rounded-full w-2/5 mb-2" style={{ background: "rgba(255,255,255,0.07)" }} />
                            <div className="h-2 rounded-full w-1/4" style={{ background: "rgba(255,255,255,0.04)" }} />
                        </div>
                        <div className="h-6 w-20 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-6 rounded-lg flex-1" style={{ background: "rgba(255,255,255,0.04)" }} />
                        <div className="h-6 rounded-lg flex-1" style={{ background: "rgba(255,255,255,0.03)" }} />
                        <div className="h-6 rounded-lg w-16" style={{ background: "rgba(255,255,255,0.04)" }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Mobile Player Card (Flipkart style) ─────────────────────────────────────

function PlayerCard({
    player,
    onDelete,
    deleting,
}: {
    player: Player;
    onDelete: () => void;
    deleting: boolean;
}) {
    const cfg = STATUS_CONFIG[player.status] ?? STATUS_CONFIG.registered;
    return (
        <div className="player-card">
            {/* Top row */}
            <div className="flex items-center gap-3 mb-3">
                <div className="player-avatar-lg">{getInitials(player.fullName)}</div>
                <div className="flex-1 min-w-0">
                    <p className="card-name truncate">{player.fullName}</p>
                    <p className="card-sub">{player.gender} · {player.age} yrs</p>
                </div>
                <StatusBadge status={player.status as PlayerStatus} />
            </div>

            {/* Info chips row */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="info-chip">
                    <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    Class {player.class}
                </span>
                {player.schoolName && (
                    <span className="info-chip truncate" style={{ maxWidth: 160 }} title={player.schoolName}>
                        <svg className="w-3 h-3 opacity-50 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {player.schoolName}
                    </span>
                )}
            </div>

            {/* Bottom row */}
            <div
                className="flex items-center justify-between pt-2.5"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Jost', sans-serif" }}>
                    Joined {formatDate(player.createdAt)}
                </p>
                <button
                    className="del-btn"
                    onClick={onDelete}
                    disabled={deleting}
                    title={`Remove ${player.fullName}`}
                    aria-label={`Remove ${player.fullName}`}
                >
                    {deleting ? (
                        <span className="spinner-sm" />
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}

// ─── Pagination Component ─────────────────────────────────────────────────────

function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    startIdx,
    endIdx,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    startIdx: number;
    endIdx: number;
}) {
    if (totalPages <= 1) return null;

    // Generate page numbers with ellipsis
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push("...");
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push("...");
        pages.push(totalPages);
    }

    return (
        <div className="pagination-bar">
            <p className="pagination-info">
                Showing <span className="text-yellow-400/70 font-semibold">{startIdx}–{endIdx}</span> of {totalItems}
            </p>

            <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="page-btn page-nav"
                    aria-label="Previous page"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Page numbers */}
                {pages.map((p, idx) =>
                    p === "..." ? (
                        <span key={`ellipsis-${idx}`} className="page-ellipsis">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p as number)}
                            className={`page-btn ${currentPage === p ? "page-active" : "page-inactive"}`}
                        >
                            {p}
                        </button>
                    )
                )}

                {/* Next */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="page-btn page-nav"
                    aria-label="Next page"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ─── Delete confirmation modal ────────────────────────────────────────────────

function DeleteModal({
    player,
    onConfirm,
    onCancel,
    deleting,
}: {
    player: Player;
    onConfirm: () => void;
    onCancel: () => void;
    deleting: boolean;
}) {
    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 60,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "16px",
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
                animation: "fadeIn 0.2s ease",
            }}
        >
            <div
                style={{
                    background: "rgba(14,14,14,0.98)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "20px",
                    padding: "28px",
                    maxWidth: "380px",
                    width: "100%",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
                    animation: "modalIn 0.3s cubic-bezier(0.22,1,0.36,1)",
                }}
            >
                <div className="text-center mb-5">
                    <div
                        className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-xl"
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
                    >
                        🗑
                    </div>
                    <h3
                        className="text-white font-bold text-base mb-2"
                        style={{ fontFamily: "'Cinzel', serif" }}
                    >
                        Remove Participant
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed">
                        Are you sure you want to remove{" "}
                        <span className="text-white/70 font-medium">{player.fullName}</span>? This action cannot be undone.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white/80 transition-colors"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={deleting}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                        style={{
                            background: deleting ? "rgba(239,68,68,0.3)" : "rgba(239,68,68,0.8)",
                            border: "1px solid rgba(239,68,68,0.4)",
                        }}
                    >
                        {deleting ? (
                            <><span className="spinner-sm" />Removing…</>
                        ) : (
                            "Remove"
                        )}
                    </button>
                </div>
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
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [toDelete, setToDelete] = useState<Player | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const fetchPlayers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/players", { cache: "no-store" });
            const data = await res.json();
            if (data.success) setPlayers(data.players);
            else setError("Failed to load participants.");
        } catch {
            setError("Network error. Please refresh.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

    // Auto-dismiss toast
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(t);
    }, [toast]);

    // Reset to page 1 when filter/search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, search]);

    // Filtered + searched list
    const filtered = useMemo(() => {
        let list = players;
        if (filter !== "all") list = list.filter((p) => p.status === filter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (p) =>
                    p.fullName.toLowerCase().includes(q) ||
                    (p.schoolName ?? "").toLowerCase().includes(q) ||
                    p.class.toLowerCase().includes(q)
            );
        }
        return list;
    }, [players, filter, search]);

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, filtered.length);
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Status counts
    const counts = useMemo(
        () => ({
            all: players.length,
            registered: players.filter((p) => p.status === "registered").length,
            qualified: players.filter((p) => p.status === "qualified").length,
            eliminated: players.filter((p) => p.status === "eliminated").length,
            champion: players.filter((p) => p.status === "champion").length,
        }),
        [players]
    );

    async function handleDelete(player: Player) {
        setDeletingId(player._id);
        try {
            const res = await fetch(`/api/players/${player._id}`, { method: "DELETE" });
            if (res.ok || res.status === 200) {
                setPlayers((prev) => prev.filter((p) => p._id !== player._id));
                setToast({ msg: `${player.fullName} removed successfully.`, type: "success" });
                // If page becomes empty after delete, go to previous page
                const newFiltered = filtered.filter((p) => p._id !== player._id);
                const newTotalPages = Math.ceil(newFiltered.length / ITEMS_PER_PAGE);
                if (currentPage > newTotalPages && newTotalPages > 0) {
                    setCurrentPage(newTotalPages);
                }
            } else {
                setToast({ msg: "Delete not available or already removed.", type: "error" });
            }
        } catch {
            setToast({ msg: "Network error. Could not delete.", type: "error" });
        } finally {
            setDeletingId(null);
            setToDelete(null);
        }
    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }

        @keyframes shimmer { 0%,100%{opacity:.55} 50%{opacity:.22} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes pageIn  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.93) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes cardIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        .page-enter { animation: pageIn 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }

        /* ── Stat pill ── */
        .stat-pill {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 12px 16px;
          transition: border-color 0.2s;
        }
        .stat-pill:hover { border-color: rgba(250,204,21,0.2); }

        /* ── Search / filter inputs ── */
        .ctrl-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #fff;
          font-family: 'Jost', sans-serif;
          font-size: 0.82rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ctrl-input::placeholder { color: rgba(255,255,255,0.2); }
        .ctrl-input:focus {
          border-color: rgba(250,204,21,0.38);
          box-shadow: 0 0 0 3px rgba(250,204,21,0.09);
        }
        .ctrl-input option { background: #111; }

        /* ── Filter tabs ── */
        .filter-tab {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 8px; font-size: 0.72rem;
          font-weight: 500; letter-spacing: 0.04em;
          color: rgba(255,255,255,0.4);
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer; white-space: nowrap;
          transition: all 0.2s;
          font-family: 'Jost', sans-serif;
        }
        .filter-tab:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.04); }
        .filter-tab.active {
          color: #facc15;
          background: rgba(250,204,21,0.08);
          border-color: rgba(250,204,21,0.22);
        }

        /* ── Table wrapper ── */
        .table-wrap {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
        }
        .table-scroll { overflow-x: auto; }

        /* ── Table ── */
        table { width: 100%; border-collapse: collapse; min-width: 640px; }
        thead th {
          padding: 12px 16px;
          font-family: 'Jost', sans-serif;
          font-size: 0.65rem; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          text-align: left;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          white-space: nowrap;
        }
        tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.18s;
          cursor: default;
        }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: rgba(255,255,255,0.03); }
        tbody td {
          padding: 13px 16px;
          font-family: 'Jost', sans-serif;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.55);
          vertical-align: middle;
        }

        /* ── Avatar ── */
        .player-avatar {
          width: 34px; height: 34px; border-radius: 9px;
          background: rgba(250,204,21,0.08);
          border: 1px solid rgba(250,204,21,0.18);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 700; color: rgba(250,204,21,0.8);
          flex-shrink: 0; font-family: 'Jost', sans-serif;
        }

        /* ── Delete btn ── */
        .del-btn {
          width: 30px; height: 30px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.2);
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .del-btn:hover {
          color: rgba(239,68,68,0.85);
          background: rgba(239,68,68,0.08);
          border-color: rgba(239,68,68,0.2);
        }
        .del-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── Empty state ── */
        .empty-state { padding: 64px 24px; text-align: center; }

        /* ── Error ── */
        .err-box {
          border-radius: 14px; padding: 16px 20px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
        }

        /* ── Spinner ── */
        .spinner-sm {
          display: inline-block;
          width: 13px; height: 13px;
          border: 1.5px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Toast ── */
        .toast {
          position: fixed; top: 20px; right: 20px; z-index: 70;
          display: flex; align-items: center; gap: 10px;
          padding: 12px 18px; border-radius: 12px;
          font-family: 'Jost', sans-serif; font-size: 0.82rem; font-weight: 500;
          animation: toastIn 0.35s cubic-bezier(0.22,1,0.36,1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .toast-success { background: #facc15; color: #0a0a0a; }
        .toast-error {
          background: rgba(239,68,68,0.9);
          border: 1px solid rgba(239,68,68,0.4);
          color: #fff;
          backdrop-filter: blur(8px);
        }

        /* ─────────────────────────────────────────────
           MOBILE CARD STYLES (Flipkart vibes 🔥)
        ───────────────────────────────────────────── */

        .player-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 14px;
          transition: border-color 0.2s, transform 0.18s, box-shadow 0.2s;
          animation: cardIn 0.35s ease both;
        }
        .player-card:hover {
          border-color: rgba(250,204,21,0.18);
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.3);
        }
        .player-card:active { transform: scale(0.99); }

        .player-avatar-lg {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(250,204,21,0.1);
          border: 1.5px solid rgba(250,204,21,0.22);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 700; color: rgba(250,204,21,0.9);
          flex-shrink: 0; font-family: 'Jost', sans-serif;
          letter-spacing: 0.02em;
        }

        .card-name {
          font-family: 'Cinzel', serif;
          font-size: 0.82rem;
          font-weight: 700;
          color: rgba(255,255,255,0.88);
          line-height: 1.3;
        }
        .card-sub {
          font-family: 'Jost', sans-serif;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.3);
          margin-top: 1px;
        }

        /* Info chip */
        .info-chip {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: 8px;
          font-family: 'Jost', sans-serif;
          font-size: 0.68rem; font-weight: 500;
          color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Card grid */
        .cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        @media (min-width: 480px) and (max-width: 639px) {
          .cards-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        /* ── Pagination ── */
        .pagination-bar {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px;
          padding: 14px 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .pagination-info {
          font-family: 'Jost', sans-serif;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.28);
        }

        .page-btn {
          min-width: 32px; height: 32px;
          border-radius: 8px;
          display: inline-flex; align-items: center; justify-content: center;
          font-family: 'Jost', sans-serif;
          font-size: 0.78rem; font-weight: 500;
          cursor: pointer;
          transition: all 0.18s;
          border: 1px solid transparent;
        }
        .page-btn:disabled { opacity: 0.28; cursor: not-allowed; }

        .page-active {
          background: rgba(250,204,21,0.12);
          border-color: rgba(250,204,21,0.35);
          color: #facc15;
          font-weight: 700;
        }
        .page-inactive {
          color: rgba(255,255,255,0.38);
          background: transparent;
        }
        .page-inactive:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.75);
        }
        .page-nav {
          color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.07);
        }
        .page-nav:not(:disabled):hover {
          color: #facc15;
          border-color: rgba(250,204,21,0.3);
          background: rgba(250,204,21,0.06);
        }
        .page-ellipsis {
          min-width: 28px; height: 32px;
          display: inline-flex; align-items: center; justify-content: center;
          font-family: 'Jost', sans-serif;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.2);
        }

        /* Mobile pagination — compact */
        @media (max-width: 400px) {
          .pagination-bar { padding: 12px 14px; }
          .page-btn { min-width: 28px; height: 28px; font-size: 0.72rem; }
        }
      `}</style>

            <div className="page-enter space-y-6">

                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div>
                        <p className="text-yellow-400/60 text-xs tracking-[0.25em] uppercase mb-1">Management</p>
                        <h1
                            className="text-2xl sm:text-3xl font-black text-white"
                            style={{ fontFamily: "'Cinzel', serif" }}
                        >
                            Participants
                        </h1>
                        <p className="text-white/25 text-sm mt-1">All registered players for the championship</p>
                    </div>
                    <button
                        onClick={fetchPlayers}
                        className="self-start sm:self-auto flex items-center gap-2 text-xs text-white/35 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg"
                        style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}
                    >
                        ↻ Refresh
                    </button>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="err-box text-red-400 text-sm">
                        {error}
                        <button onClick={fetchPlayers} className="ml-3 underline text-white/50 hover:text-white/80 text-xs transition-colors">
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Stat Pills ── */}
                {!loading && players.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "Total", value: counts.all, color: "text-white/80" },
                            { label: "Qualified", value: counts.qualified, color: "text-yellow-400" },
                            { label: "Eliminated", value: counts.eliminated, color: "text-red-400" },
                            { label: "Champion", value: counts.champion, color: "text-yellow-300" },
                        ].map((s) => (
                            <div key={s.label} className="stat-pill flex items-center gap-3">
                                <p className={`text-xl font-black leading-none ${s.color}`} style={{ fontFamily: "'Cinzel', serif" }}>
                                    {s.value}
                                </p>
                                <p className="text-white/30 text-xs">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Controls ── */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                            style={{ color: "rgba(255,255,255,0.22)" }}
                            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name, school, class…"
                            className="ctrl-input w-full pl-9 pr-4 py-2.5"
                        />
                    </div>

                    {/* Filter dropdown — mobile */}
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as FilterOption)}
                        className="ctrl-input sm:hidden px-3 py-2.5"
                    >
                        {FILTER_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label} ({o.value === "all" ? counts.all : counts[o.value]})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filter tabs — desktop */}
                <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
                    {FILTER_OPTIONS.map((o) => (
                        <button
                            key={o.value}
                            onClick={() => setFilter(o.value)}
                            className={`filter-tab ${filter === o.value ? "active" : ""}`}
                        >
                            {o.label}
                            <span className="ml-0.5 text-xs opacity-70 tabular-nums">
                                {o.value === "all" ? counts.all : counts[o.value]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* ── MOBILE: Card View ── */}
                <div className="sm:hidden">
                    {loading ? (
                        <CardSkeleton />
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="text-4xl opacity-10 mb-4 select-none">♟</div>
                            <p className="text-white/30 font-medium text-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                                {search || filter !== "all" ? "No players match your filters" : "No participants yet"}
                            </p>
                            {(search || filter !== "all") && (
                                <button
                                    onClick={() => { setSearch(""); setFilter("all"); }}
                                    className="mt-3 text-xs text-yellow-400/60 hover:text-yellow-400 underline transition-colors"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="cards-grid">
                                {paginated.map((player, idx) => (
                                    <div key={player._id} style={{ animationDelay: `${idx * 0.04}s` }}>
                                        <PlayerCard
                                            player={player}
                                            onDelete={() => setToDelete(player)}
                                            deleting={deletingId === player._id}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Mobile Pagination */}
                            {totalPages > 1 && (
                                <div
                                    className="mt-4"
                                    style={{
                                        background: "rgba(255,255,255,0.025)",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        borderRadius: 14,
                                        overflow: "hidden",
                                    }}
                                >
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        totalItems={filtered.length}
                                        startIdx={startIdx}
                                        endIdx={endIdx}
                                    />
                                </div>
                            )}
                            {totalPages === 1 && (
                                <p
                                    className="text-center mt-3 text-xs"
                                    style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Jost', sans-serif" }}
                                >
                                    {filtered.length} player{filtered.length !== 1 ? "s" : ""}
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* ── DESKTOP: Table View ── */}
                {loading ? (
                    <div className="hidden sm:block"><TableSkeleton /></div>
                ) : (
                    <div className="table-wrap hidden sm:block">
                        <div className="table-scroll">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ paddingLeft: 20 }}>Player</th>
                                        <th>Age</th>
                                        <th>Class</th>
                                        <th>School</th>
                                        <th>Status</th>
                                        <th>Registered</th>
                                        <th style={{ textAlign: "center" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={7}>
                                                <div className="empty-state">
                                                    <div className="text-4xl opacity-10 mb-4 select-none">♟</div>
                                                    <p className="text-white/30 font-medium text-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                                                        {search || filter !== "all" ? "No players match your filters" : "No participants yet"}
                                                    </p>
                                                    {(search || filter !== "all") && (
                                                        <button
                                                            onClick={() => { setSearch(""); setFilter("all"); }}
                                                            className="mt-3 text-xs text-yellow-400/60 hover:text-yellow-400 underline transition-colors"
                                                        >
                                                            Clear filters
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((player) => (
                                            <tr key={player._id}>
                                                {/* Player name */}
                                                <td style={{ paddingLeft: 20, minWidth: 180 }}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="player-avatar">{getInitials(player.fullName)}</div>
                                                        <div className="min-w-0">
                                                            <p
                                                                className="text-white/85 font-semibold text-sm truncate"
                                                                style={{ fontFamily: "'Cinzel', serif", maxWidth: 160 }}
                                                                title={player.fullName}
                                                            >
                                                                {player.fullName}
                                                            </p>
                                                            <p className="text-white/25 text-xs">{player.gender}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className="text-white/60">{player.age}</span></td>
                                                <td>
                                                    <span
                                                        className="text-xs px-2 py-0.5 rounded-md"
                                                        style={{
                                                            background: "rgba(255,255,255,0.05)",
                                                            border: "1px solid rgba(255,255,255,0.08)",
                                                            color: "rgba(255,255,255,0.55)",
                                                        }}
                                                    >
                                                        {player.class}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="truncate block" style={{ maxWidth: 160 }} title={player.schoolName}>
                                                        {player.schoolName || <span className="text-white/20">—</span>}
                                                    </span>
                                                </td>
                                                <td><StatusBadge status={player.status as PlayerStatus} /></td>
                                                <td><span className="text-white/35 text-xs">{formatDate(player.createdAt)}</span></td>
                                                <td style={{ textAlign: "center" }}>
                                                    <button
                                                        className="del-btn"
                                                        onClick={() => setToDelete(player)}
                                                        disabled={deletingId === player._id}
                                                        title={`Remove ${player.fullName}`}
                                                        aria-label={`Remove ${player.fullName}`}
                                                    >
                                                        {deletingId === player._id ? (
                                                            <span className="spinner-sm" />
                                                        ) : (
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Table footer with pagination */}
                        {filtered.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={filtered.length}
                                startIdx={startIdx}
                                endIdx={endIdx}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* ── Delete confirmation modal ── */}
            {toDelete && (
                <DeleteModal
                    player={toDelete}
                    onConfirm={() => handleDelete(toDelete)}
                    onCancel={() => setToDelete(null)}
                    deleting={deletingId === toDelete._id}
                />
            )}

            {/* ── Toast ── */}
            {toast && (
                <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}>
                    {toast.type === "success" ? (
                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    )}
                    {toast.msg}
                </div>
            )}
        </>
    );
}