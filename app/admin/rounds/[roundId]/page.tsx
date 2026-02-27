"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Round {
    _id: string;
    name: string;
    status: "upcoming" | "ongoing" | "completed";
    createdAt: string;
}

interface PlayerRef {
    _id: string;
    fullName: string;
    class?: string;
    schoolName?: string;
    status?: string;
}

interface Match {
    _id: string;
    matchNumber: number;
    player1Id: PlayerRef;
    player2Id: PlayerRef;
    winnerId: PlayerRef | null;
    status: "pending" | "completed";
    roundId: { _id: string; name: string; status: string };
}

interface Player {
    _id: string;
    fullName: string;
    class: string;
    schoolName?: string;
    status: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROUND_STATUS = {
    ongoing: { label: "Ongoing", cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/25", dot: "bg-yellow-400 animate-pulse" },
    completed: { label: "Completed", cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25", dot: "bg-emerald-400" },
    upcoming: { label: "Upcoming", cls: "text-white/40 bg-white/5 border-white/10", dot: "bg-white/30" },
} as const;

function StatusBadge({ status }: { status: Round["status"] }) {
    const cfg = ROUND_STATUS[status];
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

// ─── FIX A: Determine correct player status to fetch based on round name ──────
// Round 1 → registered players only
// Round 2 and beyond → qualified players only
// Eliminated players never appear because neither status includes them.
function getEligibleStatus(roundName: string): "registered" | "qualified" {
    return roundName.trim() === "Round 1" ? "registered" : "qualified";
}

// ─── Player Slot ──────────────────────────────────────────────────────────────

function PlayerSlot({
    player,
    isWinner,
    isLoser,
    isCompleted,
    // FIX C/D: roundCompleted disables all winner-marking actions
    roundCompleted,
    onMarkWinner,
    marking,
}: {
    player: PlayerRef;
    isWinner: boolean;
    isLoser: boolean;
    isCompleted: boolean;
    roundCompleted: boolean;
    onMarkWinner: () => void;
    marking: boolean;
}) {
    // Action is disabled if the match is done OR the round is not ongoing
    const actionDisabled = isCompleted || roundCompleted;

    return (
        <div
            className={`player-slot flex flex-col gap-2 p-3 rounded-xl transition-all duration-300
        ${isWinner ? "player-winner" : ""}
        ${isLoser ? "player-loser" : ""}
        ${!isWinner && !isLoser && !isCompleted ? "player-pending" : ""}
      `}
        >
            <div className="flex items-center gap-2.5">
                {/* Avatar */}
                <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300
            ${isWinner ? "bg-yellow-400 text-black" : "bg-white/6 text-white/60"}`}
                >
                    {isWinner && <span className="text-base leading-none">♛</span>}
                    {!isWinner && getInitials(player.fullName)}
                </div>

                <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold leading-tight truncate transition-colors duration-300
            ${isWinner ? "text-yellow-400" : isLoser ? "text-white/35" : "text-white/85"}`}
                        style={{ fontFamily: "'Cinzel', serif" }}
                    >
                        {player.fullName}
                    </p>
                    {player.class && (
                        <p className={`text-xs truncate transition-colors duration-300
              ${isWinner ? "text-yellow-400/60" : "text-white/25"}`}
                        >
                            {player.class}{player.schoolName ? ` · ${player.schoolName}` : ""}
                        </p>
                    )}
                </div>

                {isWinner && (
                    <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase shrink-0">
                        Winner
                    </span>
                )}
            </div>

            {/* FIX C/D: Only show mark winner button when action is allowed */}
            {!actionDisabled && (
                <button
                    onClick={onMarkWinner}
                    disabled={marking}
                    className="mark-btn w-full py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                    {marking ? (
                        <>
                            <div className="spinner-sm" />
                            Marking…
                        </>
                    ) : (
                        <>
                            <span>♛</span> Mark Winner
                        </>
                    )}
                </button>
            )}
        </div>
    );
}

// ─── Match Card ───────────────────────────────────────────────────────────────

function MatchCard({
    match,
    roundCompleted, // FIX C/D: passed down from parent
    onWinnerMarked,
}: {
    match: Match;
    roundCompleted: boolean;
    onWinnerMarked: () => void;
}) {
    const [marking, setMarking] = useState<string | null>(null);
    const [localError, setLocalError] = useState("");

    const isCompleted = match.status === "completed";
    const winnerId = match.winnerId?._id ?? null;

    async function markWinner(playerId: string) {
        if (isCompleted || roundCompleted) return;
        setMarking(playerId);
        setLocalError("");

        try {
            const res = await fetch(`/api/matches/${match._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ winnerId: playerId }),
            });
            const data = await res.json();

            if (data.success) {
                onWinnerMarked();
            } else {
                setLocalError(data.message ?? data.errors?.winnerId ?? "Failed to mark winner.");
            }
        } catch {
            setLocalError("Network error. Try again.");
        } finally {
            setMarking(null);
        }
    }

    return (
        <div className={`match-card relative rounded-2xl overflow-hidden transition-all duration-300
      ${isCompleted ? "match-completed" : "match-pending-card"}`}
        >
            {/* Match number header */}
            <div className="match-header flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                    <span className="text-yellow-400/70 text-xs font-black tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>
                        #{String(match.matchNumber).padStart(2, "0")}
                    </span>
                    <span className="text-white/15 text-xs">·</span>
                    <span className="text-white/30 text-xs">Match</span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full
          ${isCompleted
                        ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
                        : "text-yellow-400/70 bg-yellow-400/8 border border-yellow-400/15"}`}
                >
                    {isCompleted ? "Completed" : "Pending"}
                </span>
            </div>

            <div className="relative px-4 pb-4 space-y-2">
                <PlayerSlot
                    player={match.player1Id}
                    isWinner={isCompleted && winnerId === match.player1Id._id}
                    isLoser={isCompleted && winnerId !== null && winnerId !== match.player1Id._id}
                    isCompleted={isCompleted}
                    roundCompleted={roundCompleted}
                    onMarkWinner={() => markWinner(match.player1Id._id)}
                    marking={marking === match.player1Id._id}
                />

                <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-white/15 text-xs font-bold tracking-widest">VS</span>
                    <div className="flex-1 h-px bg-white/5" />
                </div>

                <PlayerSlot
                    player={match.player2Id}
                    isWinner={isCompleted && winnerId === match.player2Id._id}
                    isLoser={isCompleted && winnerId !== null && winnerId !== match.player2Id._id}
                    isCompleted={isCompleted}
                    roundCompleted={roundCompleted}
                    onMarkWinner={() => markWinner(match.player2Id._id)}
                    marking={marking === match.player2Id._id}
                />

                {localError && (
                    <p className="text-red-400 text-xs flex items-center gap-1 pt-1">
                        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {localError}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Create Match Modal ───────────────────────────────────────────────────────

function CreateMatchModal({
    roundId,
    players,
    onClose,
    onCreated,
}: {
    roundId: string;
    players: Player[];
    onClose: () => void;
    onCreated: () => void;
}) {
    const [player1Id, setPlayer1Id] = useState("");
    const [player2Id, setPlayer2Id] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ player1Id?: string; player2Id?: string; general?: string }>({});

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const availableForP2 = players.filter((p) => p._id !== player1Id);
    const availableForP1 = players.filter((p) => p._id !== player2Id);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const errs: typeof errors = {};
        if (!player1Id) errs.player1Id = "Please select Player 1.";
        if (!player2Id) errs.player2Id = "Please select Player 2.";
        if (player1Id && player2Id && player1Id === player2Id)
            errs.player2Id = "Player 1 and Player 2 must be different.";
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setLoading(true);
        setErrors({});

        try {
            const res = await fetch("/api/matches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roundId, player1Id, player2Id }),
            });
            const data = await res.json();

            if (data.success) {
                onCreated();
                onClose();
            } else if (data.errors) {
                setErrors(data.errors);
            } else {
                setErrors({ general: data.message ?? "Something went wrong." });
            }
        } catch {
            setErrors({ general: "Network error. Try again." });
        } finally {
            setLoading(false);
        }
    }

    const SelectField = ({
        label,
        fieldKey,
        value,
        onChange,
        options,
        error,
        placeholder,
    }: {
        label: string;
        fieldKey: "player1Id" | "player2Id";
        value: string;
        onChange: (v: string) => void;
        options: Player[];
        error?: string;
        placeholder: string;
    }) => (
        <div>
            <label className="text-white/55 text-xs font-medium tracking-widest uppercase block mb-1.5">
                {label} <span className="text-yellow-400">*</span>
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setErrors((prev) => ({ ...prev, [fieldKey]: undefined }));
                    }}
                    className={`modal-select w-full px-4 py-3 rounded-xl text-sm text-white outline-none appearance-none transition-all duration-200
            ${error ? "border-red-400/50" : "focus:border-yellow-400/40"}`}
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23facc15'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 12px center",
                        backgroundSize: "14px",
                    }}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((p) => (
                        <option key={p._id} value={p._id}>
                            {p.fullName} · {p.class}
                        </option>
                    ))}
                </select>
            </div>
            {error && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );

    // FIX F: Proper empty state handling inside modal
    const hasEnoughPlayers = players.length >= 2;
    const noPlayersAtAll = players.length === 0;

    return (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
            <div className="modal-card relative w-full max-w-md rounded-2xl p-6 z-10">
                <div className="gold-bar mb-6" />

                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h2 className="text-white font-bold text-base" style={{ fontFamily: "'Cinzel', serif" }}>
                            Create Match
                        </h2>
                        <p className="text-white/30 text-xs mt-1">Select two eligible players.</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* FIX F: No eligible players at all */}
                {noPlayersAtAll ? (
                    <div className="py-8 text-center space-y-2">
                        <div className="text-3xl opacity-20 select-none">⚔</div>
                        <p className="text-white/40 text-sm font-medium" style={{ fontFamily: "'Cinzel', serif" }}>
                            No Eligible Players
                        </p>
                        <p className="text-white/25 text-xs">
                            No players are eligible for this round yet.
                        </p>
                    </div>
                ) : !hasEnoughPlayers ? (
                    /* FIX F: Only 1 eligible player */
                    <div className="py-8 text-center space-y-2">
                        <div className="text-3xl opacity-20 select-none">♟</div>
                        <p className="text-white/40 text-sm font-medium" style={{ fontFamily: "'Cinzel', serif" }}>
                            Not Enough Players
                        </p>
                        <p className="text-white/25 text-xs">
                            At least 2 eligible players are required to create a match.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        <SelectField
                            label="Player 1"
                            fieldKey="player1Id"
                            value={player1Id}
                            onChange={setPlayer1Id}
                            options={availableForP1}
                            error={errors.player1Id}
                            placeholder="Select Player 1"
                        />

                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-white/8" />
                            <span className="text-white/20 text-xs font-bold tracking-widest">VS</span>
                            <div className="flex-1 h-px bg-white/8" />
                        </div>

                        <SelectField
                            label="Player 2"
                            fieldKey="player2Id"
                            value={player2Id}
                            onChange={setPlayer2Id}
                            options={availableForP2}
                            error={errors.player2Id}
                            placeholder="Select Player 2"
                        />

                        {errors.general && (
                            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                                {errors.general}
                            </p>
                        )}

                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white/80 transition-colors"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black create-btn disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? <><div className="spinner-sm" />Creating…</> : "Create Match"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard({ delay = 0 }: { delay?: number }) {
    return (
        <div className="skeleton-card rounded-2xl overflow-hidden" style={{ animationDelay: `${delay}ms` }}>
            <div className="skeleton-header h-10 px-4 flex items-center justify-between">
                <div className="h-3 w-12 rounded bg-white/6" />
                <div className="h-5 w-20 rounded-full bg-white/5" />
            </div>
            <div className="p-4 space-y-3">
                {[0, 1].map((i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/3 space-y-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-white/5" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3 bg-white/6 rounded-full w-3/4" />
                                <div className="h-2 bg-white/4 rounded-full w-1/2" />
                            </div>
                        </div>
                        <div className="h-7 bg-white/4 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RoundDetailPage() {
    const params = useParams();
    const roundId = params?.roundId as string;

    const [round, setRound] = useState<Round | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loadingRound, setLoadingRound] = useState(true);
    const [loadingMatches, setLoadingMatches] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Fetch round details
    const fetchRound = useCallback(async () => {
        try {
            const res = await fetch("/api/rounds", { cache: "no-store" });
            const data = await res.json();
            if (data.success) {
                const found = (data.rounds as Round[]).find((r) => r._id === roundId);
                if (found) setRound(found);
                else setError("Round not found.");
            } else {
                setError("Failed to load round.");
            }
        } catch {
            setError("Network error.");
        } finally {
            setLoadingRound(false);
        }
    }, [roundId]);

    const fetchMatches = useCallback(async () => {
        setLoadingMatches(true);
        try {
            const res = await fetch(`/api/matches?roundId=${roundId}`, { cache: "no-store" });
            const data = await res.json();
            if (data.success) setMatches(data.matches);
        } catch {
            // non-fatal — matches will remain empty
        } finally {
            setLoadingMatches(false);
        }
    }, [roundId]);

    // FIX A + E: Fetch players ONLY after round is loaded, using correct status filter.
    // This runs once when round becomes available, not on every render.
    const fetchPlayers = useCallback(async (roundName: string) => {
        const eligibleStatus = getEligibleStatus(roundName);
        try {
            const res = await fetch(`/api/players?status=${eligibleStatus}`, { cache: "no-store" });
            const data = await res.json();
            if (data.success) setPlayers(data.players);
        } catch {
            // non-fatal — modal will show empty state
        }
    }, []);

    // Load round + matches on mount
    useEffect(() => {
        fetchRound();
        fetchMatches();
    }, [fetchRound, fetchMatches]);

    // FIX E: Only fetch players once round.name is available
    useEffect(() => {
        if (round?.name) {
            fetchPlayers(round.name);
        }
    }, [round?.name, fetchPlayers]);

    // Also refresh round after a winner is marked (round.status may have changed to "completed")
    const handleWinnerMarked = useCallback(async () => {
        await fetchMatches();
        await fetchRound(); // re-check round status after match update
    }, [fetchMatches, fetchRound]);

    const completedCount = matches.filter((m) => m.status === "completed").length;
    const pendingCount = matches.length - completedCount;

    // FIX B: Derive whether creating new matches is allowed
    const roundCompleted = round?.status === "completed";
    const canCreateMatch = !roundCompleted;

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Jost:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }

        .page-enter { animation: pageIn 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .match-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .match-pending-card:hover {
          border-color: rgba(250,204,21,0.2);
          box-shadow: 0 12px 40px rgba(0,0,0,0.35);
        }
        .match-completed {
          opacity: 0.75;
          border-color: rgba(52,211,153,0.15);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .match-header {
          background: rgba(255,255,255,0.025);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .player-pending {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .player-winner {
          background: rgba(250,204,21,0.07);
          border: 1px solid rgba(250,204,21,0.25);
          box-shadow: 0 0 20px rgba(250,204,21,0.08);
        }
        .player-loser {
          background: rgba(255,255,255,0.015);
          border: 1px solid rgba(255,255,255,0.04);
          opacity: 0.6;
        }

        .mark-btn {
          background: rgba(250,204,21,0.06);
          border: 1px solid rgba(250,204,21,0.12);
          color: rgba(250,204,21,0.65);
          font-family: 'Jost', sans-serif;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .mark-btn:hover:not(:disabled) {
          background: rgba(250,204,21,0.14);
          border-color: rgba(250,204,21,0.35);
          color: #facc15;
        }

        .create-btn {
          background: linear-gradient(135deg, #facc15, #f59e0b);
          box-shadow: 0 4px 18px rgba(250,204,21,0.25);
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .create-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(250,204,21,0.4); }
        .create-btn:active { transform: translateY(0); }
        /* FIX B: visual disabled state for create match button */
        .create-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

        .gold-bar {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.6), transparent);
        }

        .modal-overlay { animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .modal-card {
          background: rgba(14,14,14,0.97);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(250,204,21,0.06);
          backdrop-filter: blur(32px);
          animation: modalIn 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.93) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-select {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          font-family: 'Jost', sans-serif;
        }
        .modal-select:focus {
          border-color: rgba(250,204,21,0.4);
          box-shadow: 0 0 0 3px rgba(250,204,21,0.1);
        }
        .modal-select option { background: #111; }

        .skeleton-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); }
        .skeleton-header { background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.04); }
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:.2} }
        .skeleton-card * { animation: shimmer 1.8s ease-in-out infinite; }

        .stat-pill {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
        }

        .spinner-sm {
          width: 12px; height: 12px;
          border: 1.5px solid rgba(0,0,0,0.25);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .back-link {
          color: rgba(255,255,255,0.3);
          transition: color 0.2s;
          font-size: 0.75rem;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }
        .back-link:hover { color: rgba(255,255,255,0.7); }

        .empty-enter { animation: cardIn 0.5s 0.2s cubic-bezier(0.22,1,0.36,1) both; }

        /* FIX B: Round completed notice banner */
        .round-closed-notice {
          background: rgba(52,211,153,0.05);
          border: 1px solid rgba(52,211,153,0.15);
          border-radius: 12px;
          padding: 10px 16px;
          display: flex; align-items: center; gap-8px;
          color: rgba(52,211,153,0.7);
          font-size: 0.75rem;
        }
      `}</style>

            <div className="page-enter space-y-7">

                {/* ── Back navigation ── */}
                <Link href="/admin/rounds" className="back-link">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Rounds
                </Link>

                {/* ── Page Header ── */}
                {loadingRound ? (
                    <div className="space-y-2">
                        <div className="h-4 w-28 rounded-full bg-white/5" style={{ animation: "shimmer 1.8s ease-in-out infinite" }} />
                        <div className="h-8 w-56 rounded-lg bg-white/5" style={{ animation: "shimmer 1.8s ease-in-out infinite" }} />
                    </div>
                ) : round ? (
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <p className="text-yellow-400/60 text-xs tracking-[0.25em] uppercase mb-1">Round Management</p>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                                    {round.name}
                                </h1>
                                <StatusBadge status={round.status} />
                            </div>

                            {!loadingMatches && (
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                    {[
                                        { label: "Total", value: matches.length, color: "text-white/60" },
                                        { label: "Completed", value: completedCount, color: "text-emerald-400" },
                                        { label: "Pending", value: pendingCount, color: "text-yellow-400/70" },
                                    ].map((s) => (
                                        <span key={s.label} className="stat-pill px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                                            <span className={`font-bold ${s.color}`}>{s.value}</span>
                                            <span className="text-white/30">{s.label}</span>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* FIX B: disabled when round is completed */}
                        <button
                            onClick={() => canCreateMatch && setModalOpen(true)}
                            disabled={!canCreateMatch}
                            className="create-btn px-5 py-2.5 rounded-xl text-sm font-bold text-black tracking-wide shrink-0"
                            title={roundCompleted ? "Round is completed. No new matches can be created." : "Create a new match"}
                        >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            {roundCompleted ? "Round Closed" : "Create Match"}
                        </button>
                    </div>
                ) : (
                    error && (
                        <div className="rounded-xl px-5 py-4 text-sm text-red-400"
                            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                            {error}
                        </div>
                    )
                )}

                {/* FIX B: Informational notice when round is closed */}
                {roundCompleted && (
                    <div style={{
                        background: "rgba(52,211,153,0.05)",
                        border: "1px solid rgba(52,211,153,0.15)",
                        borderRadius: "12px",
                        padding: "10px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "rgba(52,211,153,0.7)",
                        fontSize: "0.75rem",
                    }}>
                        <span>✓</span>
                        <span>This round is completed. All matches are locked.</span>
                    </div>
                )}

                {/* ── Match Cards Grid ── */}
                <div>
                    {matches.length > 0 && (
                        <div className="flex items-center gap-3 mb-5">
                            <h2 className="text-white/50 text-xs font-semibold tracking-[0.2em] uppercase">Matches</h2>
                            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)" }} />
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loadingMatches ? (
                            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} delay={i * 70} />)
                        ) : matches.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-5 text-center empty-enter">
                                <div className="text-5xl opacity-15 select-none">⚔</div>
                                <div>
                                    <p className="text-white/40 font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>
                                        No Matches Yet
                                    </p>
                                    <p className="text-white/20 text-sm mt-1">
                                        Create the first match for this round.
                                    </p>
                                </div>
                                {canCreateMatch && (
                                    <button
                                        onClick={() => setModalOpen(true)}
                                        className="create-btn px-6 py-2.5 rounded-xl text-xs font-bold text-black tracking-widest uppercase"
                                    >
                                        + Create First Match
                                    </button>
                                )}
                            </div>
                        ) : (
                            matches.map((match, i) => (
                                <div key={match._id} style={{ animationDelay: `${i * 70}ms` }}>
                                    {/* FIX C/D: pass roundCompleted down so MatchCard locks actions */}
                                    <MatchCard
                                        match={match}
                                        roundCompleted={roundCompleted}
                                        onWinnerMarked={handleWinnerMarked}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── Modal — only mountable when canCreateMatch ── */}
            {modalOpen && canCreateMatch && (
                <CreateMatchModal
                    roundId={roundId}
                    players={players}
                    onClose={() => setModalOpen(false)}
                    onCreated={fetchMatches}
                />
            )}
        </>
    );
}