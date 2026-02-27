"use client";

import { useEffect, useState, useCallback, useRef } from "react";

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
}

interface Match {
  _id: string;
  matchNumber: number;
  player1Id: PlayerRef;
  player2Id: PlayerRef;
  winnerId: PlayerRef | null;
  status: "pending" | "completed";
}

interface RoundWithMatches extends Round {
  matches: Match[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sortChronological<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

function getChampion(rounds: RoundWithMatches[]): PlayerRef | null {
  if (rounds.length === 0) return null;
  const sorted = sortChronological(rounds);
  const finalRound = sorted[sorted.length - 1];
  if (!finalRound || finalRound.status !== "completed") return null;
  const matches = finalRound.matches ?? [];
  if (matches.length !== 1) return null;
  const finalMatch = matches[0];
  if (finalMatch.status !== "completed" || !finalMatch.winnerId) return null;
  return finalMatch.winnerId;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

// ─── Champion Banner ──────────────────────────────────────────────────────────

function ChampionBanner({ champion }: { champion: PlayerRef }) {
  return (
    <div className="champ-outer">
      <div className="champ-particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="champ-particle" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
      <div className="champ-card">
        <div className="champ-board-corner tl" />
        <div className="champ-board-corner tr" />
        <div className="champ-board-corner bl" />
        <div className="champ-board-corner br" />
        <div className="champ-inner">
          <div className="champ-crown-ring">
            <span className="champ-crown-icon">♛</span>
            <div className="champ-crown-rays" />
          </div>
          <p className="champ-eyebrow">🏆 Chess Champion 2026</p>
          <h2 className="champ-name">{champion.fullName}</h2>
          {champion.class && (
            <p className="champ-sub">
              {champion.class}{champion.schoolName ? ` · ${champion.schoolName}` : ""}
            </p>
          )}
          <div className="champ-rule">
            <span className="champ-rule-line" />
            <span className="champ-rule-diamond">◆</span>
            <span className="champ-rule-txt">XL CLASSES · UNDER 19</span>
            <span className="champ-rule-diamond">◆</span>
            <span className="champ-rule-line" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Match Card ───────────────────────────────────────────────────────────────

function MatchCard({ match, delay = 0 }: { match: Match; delay?: number }) {
  const isCompleted = match.status === "completed";
  const winnerId = match.winnerId?._id;

  const renderPlayer = (player: PlayerRef) => {
    const isWinner = isCompleted && winnerId === player._id;
    const isLoser = isCompleted && !!winnerId && winnerId !== player._id;
    return (
      <div className={`mc-player ${isWinner ? "mc-win" : isLoser ? "mc-lose" : "mc-idle"}`}>
        <div className={`mc-av ${isWinner ? "mc-av-win" : "mc-av-idle"}`}>
          {isWinner ? <span className="mc-av-crown">♛</span> : getInitials(player.fullName)}
        </div>
        <div className="mc-info">
          <p className={`mc-pname ${isWinner ? "mc-pname-w" : isLoser ? "mc-pname-l" : "mc-pname-n"}`}>
            {player.fullName}
          </p>
          {player.class && (
            <p className={`mc-pclass ${isWinner ? "mc-pclass-w" : "mc-pclass-n"}`}>
              {player.class}
            </p>
          )}
        </div>
        {isWinner && <span className="mc-chip-win">♛ Winner</span>}
        {isLoser && <span className="mc-chip-lose">Eliminated</span>}
      </div>
    );
  };

  return (
    <article
      className={`mc-card ${isCompleted ? "mc-card-done" : "mc-card-live"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mc-bar">
        <span className="mc-num">Match #{String(match.matchNumber).padStart(2, "0")}</span>
        <span className={`mc-badge ${isCompleted ? "mc-badge-done" : "mc-badge-live"}`}>
          <span className={`mc-dot ${isCompleted ? "mc-dot-done" : "mc-dot-live"}`} />
          {isCompleted ? "Done" : "Pending"}
        </span>
      </div>
      <div className="mc-body">
        {renderPlayer(match.player1Id)}
        <div className="mc-vs">
          <div className="mc-vs-line" />
          <span className="mc-vs-txt">VS</span>
          <div className="mc-vs-line" />
        </div>
        {renderPlayer(match.player2Id)}
      </div>
    </article>
  );
}

// ─── Round Tabs ───────────────────────────────────────────────────────────────

function RoundTabs({
  rounds, activeId, onSelect,
}: {
  rounds: RoundWithMatches[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const activeEl = scrollRef.current.querySelector(".tab-active") as HTMLElement;
    if (activeEl) activeEl.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeId]);

  return (
    <div className="tabs-wrapper">
      <div className="tabs-shell" ref={scrollRef}>
        {rounds.map((r, i) => {
          const isActive = r._id === activeId;
          const done = (r.matches ?? []).filter((m) => m.status === "completed").length;
          const total = r.matches?.length ?? 0;
          const isFinal = i === rounds.length - 1;
          return (
            <button
              key={r._id}
              onClick={() => onSelect(r._id)}
              className={`tab-btn ${isActive ? "tab-active" : "tab-idle"}`}
            >
              {isFinal && <span className="tab-final-label">FINAL</span>}
              <span className="tab-rname">{r.name}</span>
              <span className={`tab-score ${isActive ? "tab-score-a" : "tab-score-i"}`}>
                {total === 0 ? "—" : `${done} / ${total}`}
              </span>
              {r.status === "ongoing" && <span className="tab-pulse" />}
              {isActive && <span className="tab-underline" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Round Panel ─────────────────────────────────────────────────────────────

function RoundPanel({ round }: { round: RoundWithMatches }) {
  const matches = round.matches ?? [];
  const done = matches.filter((m) => m.status === "completed").length;
  const pct = matches.length > 0 ? Math.round((done / matches.length) * 100) : 0;

  const STATUS = {
    ongoing: { label: "Live", cls: "rpst-live" },
    completed: { label: "Done", cls: "rpst-done" },
    upcoming: { label: "Upcoming", cls: "rpst-soon" },
  };
  const st = STATUS[round.status];

  return (
    <section className="rp-root">
      <div className="rp-toprow">
        <div className="rp-left">
          <h2 className="rp-title">{round.name}</h2>
          <div className="rp-meta-row">
            <span className={`rp-status ${st.cls}`}>
              <span className={`rp-status-dot rpd-${round.status}`} />
              {st.label}
            </span>
            <span className="rp-chip">{matches.length} Matches</span>
            <span className="rp-chip rp-chip-green">{done} Completed</span>
            {matches.length - done > 0 && (
              <span className="rp-chip rp-chip-gold">{matches.length - done} Pending</span>
            )}
          </div>
        </div>
        <div className="rp-pct-ring">
          <svg viewBox="0 0 56 56" className="rp-ring-svg">
            <circle cx="28" cy="28" r="24" className="rp-ring-track" />
            <circle
              cx="28" cy="28" r="24"
              className="rp-ring-fill"
              strokeDasharray={`${(pct / 100) * 150.8} 150.8`}
            />
          </svg>
          <span className="rp-pct-txt">{pct}%</span>
        </div>
      </div>

      {matches.length > 0 && (
        <div className="rp-prog-wrap">
          <div className="rp-prog-track">
            <div className="rp-prog-fill" style={{ width: `${pct}%` }} />
            <div className="rp-prog-glow" style={{ left: `${pct}%` }} />
          </div>
        </div>
      )}

      {matches.length === 0 ? (
        <div className="rp-empty">
          <span className="rp-empty-piece">♟</span>
          <p className="rp-empty-h">No matches yet</p>
          <p className="rp-empty-s">Check back when the admin schedules this round</p>
        </div>
      ) : (
        <div className="mc-grid">
          {matches.map((m, i) => (
            <MatchCard key={m._id} match={m} delay={i * 45} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="sk-root">
      <div className="tabs-wrapper">
        <div className="tabs-shell">
          {[90, 110, 80].map((w, i) => (
            <div key={i} className="sk-tab" style={{ width: w, animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
      </div>
      <div className="mc-grid sk-gap" style={{ maxWidth: 1100, margin: "24px auto 0", padding: "0 16px" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="sk-card" style={{ animationDelay: `${i * 0.06}s` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BracketPage() {
  const [rounds, setRounds] = useState<RoundWithMatches[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBracket = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rounds", { cache: "no-store" });
      const data = await res.json();
      if (!data.success) { setError("Failed to load bracket."); setRounds([]); return; }

      const sorted = sortChronological<Round>(
        (data.rounds ?? []) as Round[]
      );

      const matchResults = await Promise.allSettled(
        sorted.map((r) =>
          fetch(`/api/matches?roundId=${r._id}`, { cache: "no-store" })
            .then((res) => res.json())
        )
      );

      const enriched: RoundWithMatches[] = sorted.map((r, i) => {
        const res = matchResults[i];
        const matches =
          res.status === "fulfilled" && res.value?.success
            ? (res.value.matches as Match[])
              .filter(Boolean)
              .sort((a, b) => a.matchNumber - b.matchNumber)
            : [];

        return { ...r, matches };
      });

      setRounds(enriched);
      if (enriched.length > 0) setActiveId(enriched[0]._id);
    } catch {
      setError("Network error. Please refresh.");
      setRounds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBracket(); }, [fetchBracket]);

  const champion = getChampion(rounds);
  const activeRound = rounds.find((r) => r._id === activeId) ?? null;
  const totalMatches = rounds.reduce((s, r) => s + (r.matches?.length ?? 0), 0);
  const doneMatches = rounds.reduce((s, r) => s + (r.matches ?? []).filter((m) => m.status === "completed").length, 0);
  const overallPct = totalMatches > 0 ? Math.round((doneMatches / totalMatches) * 100) : 0;

  const finalRound = rounds.length > 0 ? sortChronological(rounds)[rounds.length - 1] : null;
  const showFinalOngoing = !loading && !champion && finalRound?.status === "ongoing";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Outfit:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --gold: #facc15;
          --gold2: #f59e0b;
          --gold-dim: rgba(250,204,21,0.55);
          --gold-glow: rgba(250,204,21,0.18);
          --bg: #060608;
          --surface: #0e0f11;
          --surface2: #13141a;
          --border: rgba(255,255,255,0.07);
          --border-gold: rgba(250,204,21,0.22);
          --text: rgba(255,255,255,0.88);
          --text-dim: rgba(255,255,255,0.45);
          --text-faint: rgba(255,255,255,0.2);
          --green: #34d399;
          --red: rgba(239,68,68,0.85);
          --font-display: 'Cinzel', serif;
          --font-body: 'Outfit', sans-serif;
        }

        /* ══════════════════════════════════════════════════════
           PAGE WRAPPER — isolates this component completely
        ══════════════════════════════════════════════════════ */
        .bkt-page {
          width: 100%;
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          -webkit-font-smoothing: antialiased;
          position: relative;
          overflow-x: hidden;
        }

        /* Chess board pattern — scoped inside .bkt-page only */
        .bkt-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image: repeating-conic-gradient(
            rgba(255,255,255,0.022) 0% 25%,
            transparent 0% 50%
          );
          background-size: 40px 40px;
        }
        .bkt-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 45% at 50% -5%, rgba(250,204,21,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 50% 30% at 80% 110%, rgba(250,204,21,0.04) 0%, transparent 55%);
        }

        .bkt-content {
          position: relative;
          z-index: 1;
        }

        /* ── Page enter animation ─────────────────────────── */
        .bkt-enter { animation: bktFadeUp 0.65s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes bktFadeUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ══════════════════════════════════════════════════════
           HERO HEADER
        ══════════════════════════════════════════════════════ */
        .bkt-hero {
          text-align: center;
          padding: clamp(48px, 8vw, 80px) 20px clamp(36px, 5vw, 52px);
          position: relative;
        }
        .bkt-hero-piece {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          font-size: clamp(3rem, 6vw, 7rem);
          opacity: 0.04;
          user-select: none;
          pointer-events: none;
          font-family: var(--font-display);
        }
        .bkt-hero-piece-l { left: clamp(8px, 3vw, 60px); }
        .bkt-hero-piece-r { right: clamp(8px, 3vw, 60px); }

        .bkt-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.62rem; letter-spacing: 0.38em; text-transform: uppercase;
          color: var(--gold-dim); font-weight: 600; margin-bottom: 16px;
        }
        .bkt-eyebrow-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--gold); opacity: 0.6; }

        .bkt-title {
          font-family: var(--font-display);
          font-size: clamp(2rem, 5.5vw, 3.6rem);
          font-weight: 900; color: #fff; line-height: 1.07;
          letter-spacing: -0.01em; margin-bottom: 10px;
        }
        .bkt-title-gold { color: var(--gold); }

        .bkt-subtitle {
          color: var(--text-dim); font-size: 0.88rem;
          font-weight: 400; margin-bottom: 24px;
        }
        .bkt-rule {
          display: flex; align-items: center; gap: 10px; justify-content: center;
        }
        .bkt-rule-line {
          width: 60px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold-dim));
        }
        .bkt-rule-line.flip { background: linear-gradient(90deg, var(--gold-dim), transparent); }
        .bkt-rule-piece { color: var(--gold); opacity: 0.55; font-size: 0.9rem; }

        /* ══════════════════════════════════════════════════════
           STATS BAR
        ══════════════════════════════════════════════════════ */
        .stats-bar {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          justify-content: center;
          padding: 0 20px 28px;
          max-width: 900px; margin: 0 auto;
        }
        .stat-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.035);
          border: 1px solid var(--border);
          border-radius: 99px; padding: 6px 14px;
          font-size: 0.72rem; font-weight: 500;
        }
        .stat-chip b { color: var(--gold); font-weight: 700; }
        .stat-chip span { color: var(--text-dim); }
        .prog-wrap {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 99px; padding: 6px 16px;
          min-width: 180px; flex: 1; max-width: 280px;
        }
        .prog-track {
          flex: 1; height: 3px; border-radius: 99px;
          background: rgba(255,255,255,0.07); overflow: hidden;
        }
        .prog-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, var(--gold), var(--gold2), var(--gold));
          background-size: 200%; animation: goldSlide 2s linear infinite;
          transition: width 1.4s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes goldSlide { 0%{background-position:0%} 100%{background-position:200%} }
        .prog-pct {
          font-family: var(--font-display); font-size: 0.75rem;
          font-weight: 800; color: var(--gold); white-space: nowrap;
        }

        /* ══════════════════════════════════════════════════════
           CHAMPION BANNER
        ══════════════════════════════════════════════════════ */
        .champ-outer {
          position: relative;
          max-width: 720px;
          margin: 0 auto 36px;
          padding: 0 16px;
          animation: champRise 0.9s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes champRise {
          from { opacity:0; transform:scale(0.95) translateY(20px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        .champ-particles { position:absolute; inset:0; pointer-events:none; overflow:hidden; border-radius:22px; }
        .champ-particle {
          position: absolute;
          width: 3px; height: 3px; border-radius: 50%;
          background: var(--gold); opacity: 0;
          animation: particleFloat 4s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.33s);
          left: calc((var(--i) * 8.3%) + 2%);
          bottom: 0;
        }
        @keyframes particleFloat {
          0%   { opacity:0; transform:translateY(0) scale(1); }
          20%  { opacity:0.7; }
          80%  { opacity:0.2; }
          100% { opacity:0; transform:translateY(-120px) scale(0.4); }
        }
        .champ-card {
          position: relative;
          background: linear-gradient(160deg, rgba(250,204,21,0.09) 0%, rgba(250,204,21,0.03) 60%, rgba(15,12,0,0.5) 100%);
          border: 1px solid var(--border-gold);
          border-radius: 22px;
          box-shadow:
            0 0 0 1px rgba(250,204,21,0.06),
            0 40px 90px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(250,204,21,0.12);
          overflow: hidden;
        }
        .champ-board-corner {
          position: absolute; width: 40px; height: 40px;
          background: rgba(250,204,21,0.04);
        }
        .champ-board-corner.tl { top:0; left:0; border-bottom-right-radius:10px; }
        .champ-board-corner.tr { top:0; right:0; border-bottom-left-radius:10px; }
        .champ-board-corner.bl { bottom:0; left:0; border-top-right-radius:10px; }
        .champ-board-corner.br { bottom:0; right:0; border-top-left-radius:10px; }
        .champ-inner {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center;
          gap: 12px; padding: clamp(28px,6vw,50px) 24px;
          text-align: center;
        }
        .champ-crown-ring {
          position: relative;
          width: 80px; height: 80px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(250,204,21,0.1);
          border: 2px solid rgba(250,204,21,0.35);
          animation: crownGlow 2.8s ease-in-out infinite;
        }
        @keyframes crownGlow {
          0%,100% { box-shadow:0 0 24px rgba(250,204,21,0.2); }
          50%     { box-shadow:0 0 50px rgba(250,204,21,0.45); }
        }
        .champ-crown-icon { font-size: 2.2rem; color: var(--gold); }
        .champ-crown-rays {
          position: absolute; inset: -4px; border-radius: 50%;
          background: conic-gradient(
            rgba(250,204,21,0.12) 0deg, transparent 30deg, rgba(250,204,21,0.08) 60deg,
            transparent 90deg, rgba(250,204,21,0.12) 120deg, transparent 150deg,
            rgba(250,204,21,0.08) 180deg, transparent 210deg, rgba(250,204,21,0.12) 240deg,
            transparent 270deg, rgba(250,204,21,0.08) 300deg, transparent 330deg,
            rgba(250,204,21,0.12) 360deg
          );
          animation: raysRotate 8s linear infinite;
        }
        @keyframes raysRotate { to { transform: rotate(360deg); } }
        .champ-eyebrow {
          font-size: 0.65rem; letter-spacing: 0.38em; text-transform: uppercase;
          color: rgba(250,204,21,0.6); font-weight: 600; margin: 0;
        }
        .champ-name {
          font-family: var(--font-display);
          font-size: clamp(1.5rem,5vw,2.8rem);
          font-weight: 900; color: #fff; margin: 0; line-height: 1.12;
        }
        .champ-sub { color: rgba(250,204,21,0.5); font-size: 0.88rem; margin: 0; }
        .champ-rule {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: center;
        }
        .champ-rule-line { display:block; width:40px; height:1px; background:rgba(250,204,21,0.3); }
        .champ-rule-diamond { color: rgba(250,204,21,0.4); font-size: 0.45rem; }
        .champ-rule-txt {
          font-size: 0.58rem; letter-spacing: 0.28em; text-transform: uppercase;
          color: rgba(250,204,21,0.32); white-space: nowrap;
        }

        /* ══════════════════════════════════════════════════════
           FINAL ONGOING BADGE
        ══════════════════════════════════════════════════════ */
        .final-ongoing {
          max-width: 720px; margin: 0 auto 28px;
          padding: 18px 24px; border-radius: 16px;
          background: rgba(250,204,21,0.04);
          border: 1px solid rgba(250,204,21,0.18);
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
          animation: bktFadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
          /* horizontal padding to avoid edge clip */
          margin-left: auto; margin-right: auto;
          width: calc(100% - 32px);
        }
        .final-ongoing-crown {
          width:46px; height:46px; border-radius:12px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          font-size:1.4rem;
          background:rgba(250,204,21,0.08);
          border:1px solid rgba(250,204,21,0.22);
          color:var(--gold);
        }
        .final-ongoing-text h3 {
          font-family:var(--font-display); font-size:0.9rem;
          font-weight:700; color:var(--gold); margin:0 0 3px;
        }
        .final-ongoing-text p { font-size:0.75rem; color:var(--text-dim); margin:0; }
        .final-ongoing-pulse {
          margin-left:auto;
          display:flex; align-items:center; gap:6px;
          font-size:0.65rem; font-weight:600;
          letter-spacing:0.12em; text-transform:uppercase;
          color:rgba(250,204,21,0.55);
        }
        .final-ongoing-dot {
          width:7px; height:7px; border-radius:50%; background:var(--gold);
          animation:liveBlip 1.4s ease-in-out infinite;
        }
        @keyframes liveBlip { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.7)} }

        /* ══════════════════════════════════════════════════════
           ROUND TABS — centered with fade edges on scroll
        ══════════════════════════════════════════════════════ */
        .tabs-wrapper {
          display: flex;
          justify-content: center;
          padding: 0 0 4px;
          /* fade left and right for scroll hint */
          position: relative;
        }
        .tabs-shell {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 4px 24px 8px;
          /* center items when there's space, scroll when not */
          max-width: 100%;
        }
        .tabs-shell::-webkit-scrollbar { display: none; }

        /* Fade edges */
        .tabs-wrapper::before,
        .tabs-wrapper::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 32px; z-index: 2;
          pointer-events: none;
        }
        .tabs-wrapper::before {
          left: 0;
          background: linear-gradient(90deg, var(--bg), transparent);
        }
        .tabs-wrapper::after {
          right: 0;
          background: linear-gradient(-90deg, var(--bg), transparent);
        }

        .tab-btn {
          position: relative;
          display: flex; flex-direction: column; gap: 3px;
          padding: 12px 20px 14px; border-radius: 14px;
          border: 1px solid transparent; cursor: pointer;
          min-width: 120px; text-align: left; flex-shrink: 0;
          transition: background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
          font-family: var(--font-body);
          background: none;
        }
        .tab-idle {
          background: rgba(255,255,255,0.03);
          border-color: var(--border);
          color: var(--text-dim);
        }
        .tab-idle:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.12);
          color: var(--text);
        }
        .tab-active {
          background: rgba(250,204,21,0.08);
          border-color: rgba(250,204,21,0.28);
          box-shadow: 0 6px 22px rgba(250,204,21,0.1);
          color: var(--gold);
        }
        .tab-final-label {
          font-size: 0.48rem; font-weight: 800;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--gold); opacity: 0.7; margin-bottom: 1px;
          display: block;
        }
        .tab-rname {
          font-family: var(--font-display); font-size: 0.78rem;
          font-weight: 700; line-height: 1.2;
          white-space: nowrap; color: inherit;
        }
        .tab-score { font-size: 0.6rem; font-weight: 500; }
        .tab-score-i { color: var(--text-faint); }
        .tab-score-a { color: rgba(250,204,21,0.55); }
        .tab-pulse {
          position: absolute; top: 10px; right: 10px;
          width: 6px; height: 6px; border-radius: 50%; background: var(--gold);
          animation: liveBlip 1.4s ease-in-out infinite;
        }
        .tab-underline {
          position: absolute; bottom: 0; left: 15%; right: 15%; height: 2px;
          border-radius: 99px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }

        /* Separator below tabs */
        .tabs-separator {
          height: 1px; margin: 0 0 0;
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.25) 20%, rgba(250,204,21,0.25) 80%, transparent);
        }

        /* ══════════════════════════════════════════════════════
           ROUND PANEL
        ══════════════════════════════════════════════════════ */
        .rp-root {
          padding: 24px 24px 56px;
          max-width: 1100px; margin: 0 auto;
          animation: rp-enter 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes rp-enter {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .rp-toprow {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 16px; margin-bottom: 14px; flex-wrap: wrap;
        }
        .rp-left { display: flex; flex-direction: column; gap: 10px; }
        .rp-title {
          font-family: var(--font-display);
          font-size: clamp(1rem,3vw,1.4rem); font-weight: 800;
          color: #fff; margin: 0; line-height: 1.2;
        }
        .rp-meta-row { display: flex; gap: 7px; flex-wrap: wrap; align-items: center; }
        .rp-status {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.62rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 4px 11px; border-radius: 99px; border: 1px solid;
        }
        .rpst-live { color:var(--gold); background:rgba(250,204,21,0.08); border-color:rgba(250,204,21,0.22); }
        .rpst-done { color:var(--green); background:rgba(52,211,153,0.08); border-color:rgba(52,211,153,0.2); }
        .rpst-soon { color:var(--text-dim); background:rgba(255,255,255,0.04); border-color:var(--border); }
        .rp-status-dot { width:5px; height:5px; border-radius:50%; display:inline-block; }
        .rpd-ongoing  { background:var(--gold); animation:liveBlip 1.4s ease-in-out infinite; }
        .rpd-completed{ background:var(--green); }
        .rpd-upcoming { background:var(--text-dim); }
        .rp-chip {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.63rem; font-weight: 500;
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          border-radius: 99px; padding: 3px 10px; color: var(--text-dim);
        }
        .rp-chip-green { color:var(--green); border-color:rgba(52,211,153,0.15); background:rgba(52,211,153,0.05); }
        .rp-chip-gold  { color:var(--gold);  border-color:rgba(250,204,21,0.15); background:rgba(250,204,21,0.05); }

        .rp-pct-ring { position:relative; width:56px; height:56px; flex-shrink:0; }
        .rp-ring-svg { width:56px; height:56px; transform:rotate(-90deg); }
        .rp-ring-track { fill:none; stroke:rgba(255,255,255,0.07); stroke-width:5; }
        .rp-ring-fill {
          fill:none; stroke:var(--gold); stroke-width:5;
          stroke-linecap:round;
          stroke-dasharray:0 150.8;
          transition:stroke-dasharray 1.3s cubic-bezier(0.22,1,0.36,1);
        }
        .rp-pct-txt {
          position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
          font-family:var(--font-display); font-size:0.65rem; font-weight:800; color:var(--gold);
        }

        .rp-prog-wrap { margin-bottom: 24px; }
        .rp-prog-track {
          position: relative; height: 3px; border-radius: 99px;
          background: rgba(255,255,255,0.06); overflow: visible;
        }
        .rp-prog-fill {
          position: absolute; top:0; left:0;
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, var(--gold), var(--gold2));
          transition: width 1.3s cubic-bezier(0.22,1,0.36,1);
        }
        .rp-prog-glow {
          position: absolute; top:50%; transform:translate(-50%,-50%);
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 10px 4px rgba(250,204,21,0.4);
          transition: left 1.3s cubic-bezier(0.22,1,0.36,1);
        }
        .rp-empty {
          display:flex; flex-direction:column; align-items:center;
          gap:12px; padding:64px 16px; text-align:center;
        }
        .rp-empty-piece { font-size:3rem; opacity:0.08; font-family:var(--font-display); }
        .rp-empty-h { font-family:var(--font-display); font-size:0.92rem; font-weight:700; color:rgba(255,255,255,0.3); margin:0; }
        .rp-empty-s { font-size:0.78rem; color:var(--text-faint); margin:0; }

        /* ══════════════════════════════════════════════════════
           MATCH GRID
        ══════════════════════════════════════════════════════ */
        .mc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 12px;
          margin-top: 4px;
        }
        @media (max-width: 380px) { .mc-grid { grid-template-columns: 1fr; } }
        @media (min-width: 1024px) {
          .mc-grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        }

        /* ══════════════════════════════════════════════════════
           MATCH CARD
        ══════════════════════════════════════════════════════ */
        .mc-card {
          border-radius: 16px; overflow: hidden;
          opacity: 0; animation: mcIn 0.42s cubic-bezier(0.22,1,0.36,1) both;
          transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease;
        }
        @keyframes mcIn {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .mc-card-live {
          background: var(--surface);
          border: 1px solid rgba(255,255,255,0.09);
          box-shadow: 0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .mc-card-live:hover {
          transform: translateY(-5px);
          box-shadow:
            0 16px 44px rgba(0,0,0,0.5),
            0 0 0 1px rgba(250,204,21,0.2),
            inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .mc-card-done {
          background: #0d0f0e;
          border: 1px solid rgba(52,211,153,0.12);
          box-shadow: 0 4px 16px rgba(0,0,0,0.28);
          opacity: 0;
        }
        .mc-card-done:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }

        .mc-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 9px 14px 8px;
          background: rgba(255,255,255,0.025);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .mc-num {
          font-family: var(--font-display);
          font-size: 0.62rem; font-weight: 700;
          color: rgba(250,204,21,0.6); letter-spacing: 0.06em;
        }
        .mc-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.58rem; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 2px 9px; border-radius: 99px;
        }
        .mc-badge-done { color:var(--green); background:rgba(52,211,153,0.09); }
        .mc-badge-live { color:rgba(250,204,21,0.75); background:rgba(250,204,21,0.08); }
        .mc-dot { width:5px; height:5px; border-radius:50%; display:inline-block; }
        .mc-dot-done { background:var(--green); }
        .mc-dot-live { background:var(--gold); animation:liveBlip 1.4s ease-in-out infinite; }

        .mc-body { padding: 10px; display:flex; flex-direction:column; gap:4px; }
        .mc-player {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px; transition: all 0.2s;
        }
        .mc-idle { background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.07); }
        .mc-win  { background:rgba(250,204,21,0.08); border:1px solid rgba(250,204,21,0.22); box-shadow:0 0 18px rgba(250,204,21,0.07); }
        .mc-lose { background:rgba(255,255,255,0.012); border:1px solid rgba(255,255,255,0.04); opacity:0.52; }
        .mc-av {
          width:34px; height:34px; border-radius:9px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          font-size:0.62rem; font-weight:800;
          font-family: var(--font-body);
        }
        .mc-av-win  { background:var(--gold); color:#0a0a0a; }
        .mc-av-idle { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.09); color:var(--text-dim); }
        .mc-av-crown { font-size:1rem; }
        .mc-info { flex:1; min-width:0; }
        .mc-pname {
          font-family: var(--font-display);
          font-size: 0.77rem; font-weight: 700;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.25;
        }
        .mc-pname-w { color:var(--gold); }
        .mc-pname-n { color:rgba(255,255,255,0.88); }
        .mc-pname-l { color:rgba(255,255,255,0.26); }
        .mc-pclass {
          font-size: 0.6rem; margin-top:2px;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .mc-pclass-w { color:rgba(250,204,21,0.45); }
        .mc-pclass-n { color:var(--text-faint); }
        .mc-chip-win {
          flex-shrink:0; font-size:0.52rem; font-weight:800;
          letter-spacing:0.06em; text-transform:uppercase;
          color:#0a0a0a; background:var(--gold);
          padding:2px 8px; border-radius:99px;
          font-family:var(--font-body); white-space:nowrap;
        }
        .mc-chip-lose {
          flex-shrink:0; font-size:0.5rem; font-weight:600;
          letter-spacing:0.05em; text-transform:uppercase;
          color:rgba(255,255,255,0.22);
          padding:2px 8px; border-radius:99px;
          border:1px solid rgba(255,255,255,0.08);
          font-family:var(--font-body); white-space:nowrap;
        }
        .mc-vs { display:flex; align-items:center; gap:8px; padding:0 4px; }
        .mc-vs-line { flex:1; height:1px; background:rgba(255,255,255,0.05); }
        .mc-vs-txt {
          font-size:0.55rem; font-weight:800; letter-spacing:0.18em;
          color:rgba(255,255,255,0.14); font-family:var(--font-body);
        }

        /* ══════════════════════════════════════════════════════
           ERROR
        ══════════════════════════════════════════════════════ */
        .err-box {
          max-width: 600px; margin: 0 auto 20px;
          padding: 14px 18px; border-radius: 14px; text-align: center;
          background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2);
          color: rgba(239,68,68,0.85); font-size: 0.82rem;
        }
        .err-retry {
          margin-left:8px; text-decoration:underline;
          color:rgba(255,255,255,0.45); font-size:0.74rem;
          background:none; border:none; cursor:pointer;
        }

        /* ══════════════════════════════════════════════════════
           NO ROUNDS EMPTY STATE
        ══════════════════════════════════════════════════════ */
        .no-rounds {
          display:flex; flex-direction:column; align-items:center;
          gap:14px; padding:80px 24px; text-align:center;
        }
        .no-rounds-board {
          display:grid; grid-template-columns:repeat(4,24px); gap:2px;
          opacity:0.12; margin-bottom:8px;
        }
        .no-rounds-sq { width:24px; height:24px; border-radius:3px; }
        .no-rounds-sq.dark  { background:rgba(255,255,255,0.15); }
        .no-rounds-sq.light { background:rgba(255,255,255,0.04); }
        .no-rounds-h { font-family:var(--font-display); font-size:1rem; font-weight:700; color:rgba(255,255,255,0.32); margin:0; }
        .no-rounds-s { font-size:0.8rem; color:var(--text-faint); margin:0; }

        /* ══════════════════════════════════════════════════════
           SKELETON
        ══════════════════════════════════════════════════════ */
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:.18} }
        .sk-root { width:100%; }
        .sk-tab {
          height:62px; border-radius:14px; flex-shrink:0;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.05);
          animation:shimmer 1.8s ease-in-out infinite;
        }
        .sk-gap { margin-top:24px; }
        .sk-card {
          height:148px; border-radius:16px;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.05);
          animation:shimmer 1.8s ease-in-out infinite;
        }

        /* ══════════════════════════════════════════════════════
           DIVIDER between sections
        ══════════════════════════════════════════════════════ */
        .section-divider {
          height: 1px;
          max-width: 1100px; margin: 0 auto;
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.2) 30%, rgba(250,204,21,0.2) 70%, transparent);
        }

        /* ══════════════════════════════════════════════════════
           RESPONSIVE
        ══════════════════════════════════════════════════════ */
        @media (max-width: 640px) {
          .bkt-hero { padding: 36px 16px 28px; }
          .stats-bar { gap: 6px; padding: 0 12px 24px; }
          .rp-root { padding: 16px 12px 44px; }
          .mc-grid { gap: 10px; }
          .tabs-shell { padding: 4px 12px 8px; }
        }
        @media (min-width: 1024px) {
          .bkt-hero { padding: 80px 24px 60px; }
          .rp-root { padding: 28px 32px 72px; }
        }
      `}</style>

      <div className="bkt-page">
        {/* Background texture — scoped, won't affect navbar/footer */}
        <div className="bkt-bg" aria-hidden="true" />

        <div className="bkt-content bkt-enter">

          {/* ── Hero ─────────────────────────────────────────────── */}
          <header className="bkt-hero">
            <div className="bkt-hero-piece bkt-hero-piece-l">♜</div>
            <div className="bkt-hero-piece bkt-hero-piece-r">♞</div>
            <p className="bkt-eyebrow">
              <span className="bkt-eyebrow-dot" />
              XL Classes · Checkmate Championship
              <span className="bkt-eyebrow-dot" />
            </p>
            <h1 className="bkt-title">
              Tournament <span className="bkt-title-gold">Matches</span>
            </h1>
            <p className="bkt-subtitle">Live match standings &amp; results · 2026</p>
            <div className="bkt-rule">
              <span className="bkt-rule-line" />
              <span className="bkt-rule-piece">♟</span>
              <span className="bkt-rule-line flip" />
            </div>
          </header>

          {/* ── Error ──────────────────────────────────────────────── */}
          {error && (
            <div className="err-box">
              {error}
              <button className="err-retry" onClick={fetchBracket}>Retry</button>
            </div>
          )}

          {/* ── Champion ──────────────────────────────────────────── */}
          {!loading && champion && <ChampionBanner champion={champion} />}

          {/* ── Final Ongoing Badge ───────────────────────────────── */}
          {showFinalOngoing && finalRound && (
            <div className="final-ongoing">
              <div className="final-ongoing-crown">♛</div>
              <div className="final-ongoing-text">
                <h3>Grand Final · In Progress</h3>
                <p>{finalRound.name} is underway — champion will be declared soon</p>
              </div>
              <div className="final-ongoing-pulse">
                <div className="final-ongoing-dot" />
                Live
              </div>
            </div>
          )}

          {/* ── Stats bar ─────────────────────────────────────────── */}
          {!loading && rounds.length > 0 && totalMatches > 0 && (
            <div className="stats-bar">
              <span className="stat-chip"><b>{rounds.length}</b><span>Rounds</span></span>
              <span className="stat-chip"><b>{totalMatches}</b><span>Matches</span></span>
              <span className="stat-chip"><b>{doneMatches}</b><span>Completed</span></span>
              <div className="prog-wrap">
                <div className="prog-track">
                  <div className="prog-fill" style={{ width: `${overallPct}%` }} />
                </div>
                <span className="prog-pct">{overallPct}%</span>
              </div>
            </div>
          )}

          {/* ── Loading skeleton ──────────────────────────────────── */}
          {loading && <Skeleton />}

          {/* ── No rounds ─────────────────────────────────────────── */}
          {!loading && rounds.length === 0 && !error && (
            <div className="no-rounds">
              <div className="no-rounds-board">
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className={`no-rounds-sq ${(Math.floor(i / 4) + i) % 2 === 0 ? "dark" : "light"}`}
                  />
                ))}
              </div>
              <p className="no-rounds-h">Matches Coming Soon</p>
              <p className="no-rounds-s">Rounds will appear once the tournament begins</p>
            </div>
          )}

          {/* ── Round tabs + panel ────────────────────────────────── */}
          {!loading && rounds.length > 0 && (
            <>
              <RoundTabs rounds={rounds} activeId={activeId} onSelect={setActiveId} />
              <div className="tabs-separator" />
              {activeRound && <RoundPanel key={activeRound._id} round={activeRound} />}
            </>
          )}

        </div>
      </div>
    </>
  );
}

