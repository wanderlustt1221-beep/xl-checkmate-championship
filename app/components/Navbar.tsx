"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Rules", href: "/rules" },
    { label: "Participants", href: "/participants" },
    { label: "Matches", href: "/bracket" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mouseX, setMouseX] = useState(50);
    const headerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 32);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => { setOpen(false); }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!headerRef.current) return;
        const rect = headerRef.current.getBoundingClientRect();
        setMouseX(((e.clientX - rect.left) / rect.width) * 100);
    };

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        /* ══════════════════════════════════════════════
           ALL selectors use unique "xlnv-" prefix to
           avoid ANY collision with existing site CSS.
           NO Tailwind layout classes used anywhere.
        ══════════════════════════════════════════════ */

        #xlnv-header {
          position: sticky;
          top: 0; left: 0; right: 0;
          z-index: 9999;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          background: rgba(6,6,6,0.55);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
          transition: background 0.45s cubic-bezier(0.23,1,0.32,1),
                      border-color 0.45s cubic-bezier(0.23,1,0.32,1),
                      box-shadow 0.45s cubic-bezier(0.23,1,0.32,1);
        }
        #xlnv-header.xlnv-scrolled {
          background: rgba(5,5,5,0.94);
          border-bottom-color: rgba(250,204,21,0.1);
          box-shadow: 0 1px 0 rgba(250,204,21,0.06), 0 16px 50px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.02);
        }

        /* Noise grain */
        #xlnv-header::before {
          content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.02;
        }

        /* Aurora glow line */
        #xlnv-aurora {
          position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          pointer-events: none; z-index: 1;
          transition: background 0.1s ease;
        }

        /* Inner row */
        #xlnv-inner {
          position: relative; z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 64px;
          padding: 0 24px;
          box-sizing: border-box;
        }

        /* ── Brand ── */
        #xlnv-brand {
          display: flex; flex-direction: column;
          text-decoration: none; user-select: none; flex-shrink: 0;
        }
        #xlnv-brand-name {
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: 1.1rem; letter-spacing: 0.05em; line-height: 1.1;
          background: linear-gradient(135deg, #facc15 0%, #f59e0b 45%, #facc15 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: xlnv-shimmer 4s ease infinite;
        }
        @keyframes xlnv-shimmer {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        #xlnv-brand-sub {
          font-size: 0.5rem; color: rgba(250,204,21,0.3);
          letter-spacing: 0.28em; text-transform: uppercase; margin-top: 3px; font-weight: 500;
        }

        /* ── Desktop nav ── */
        #xlnv-desktop {
          display: flex; align-items: center; gap: 2px;
        }
        /* Hide on mobile */
        @media (max-width: 767px) { #xlnv-desktop { display: none !important; } }

        /* Desktop link */
        .xlnv-lnk {
          position: relative; padding: 7px 14px;
          font-size: 0.68rem; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.38); text-decoration: none;
          border-radius: 8px; white-space: nowrap; overflow: hidden;
          transition: color 0.28s ease, background 0.28s ease;
        }
        .xlnv-lnk::before {
          content: ''; position: absolute; inset: 0; border-radius: 8px;
          background: rgba(250,204,21,0.05); opacity: 0; transform: scale(0.8);
          transition: opacity 0.28s ease, transform 0.28s ease;
        }
        .xlnv-lnk:hover { color: rgba(255,255,255,0.88); }
        .xlnv-lnk:hover::before { opacity: 1; transform: scale(1); }
        .xlnv-lnk.xlnv-active { color: #facc15; }
        .xlnv-lnk.xlnv-active::before { opacity: 1; transform: scale(1); background: rgba(250,204,21,0.07); }
        .xlnv-pill {
          position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);
          height: 2px; border-radius: 99px;
          background: linear-gradient(90deg, #facc15, #f59e0b);
          box-shadow: 0 0 8px rgba(250,204,21,0.55);
          transition: width 0.38s cubic-bezier(0.34,1.56,0.64,1);
        }

        /* CTA button */
        #xlnv-cta {
          margin-left: 10px; padding: 8px 20px; border-radius: 9px;
          font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          text-decoration: none; position: relative; overflow: hidden;
          white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;
          color: #0a0a0a;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
        }
        #xlnv-cta::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #facc15 0%, #f59e0b 55%, #fbbf24 100%);
          background-size: 200% 100%; transition: background-position 0.4s ease;
        }
        #xlnv-cta::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.28) 50%, transparent 65%);
          transform: translateX(-120%); transition: transform 0.6s ease;
        }
        #xlnv-cta:hover::after { transform: translateX(120%); }
        #xlnv-cta:hover::before { background-position: 100% 0; }
        #xlnv-cta:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 6px 28px rgba(250,204,21,0.5), 0 2px 8px rgba(250,204,21,0.2); }
        #xlnv-cta:active { transform: scale(0.99); }
        #xlnv-cta-txt, #xlnv-cta-ico { position: relative; z-index: 1; }
        #xlnv-cta-ico { font-size: 0.9rem; }

        /* ── Hamburger — mobile ONLY ── */
        #xlnv-ham {
          flex-shrink: 0;
          flex-direction: column; justify-content: center; align-items: center;
          width: 42px; height: 42px; border-radius: 10px; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.03);
          transition: background 0.25s ease, border-color 0.25s ease;
          position: relative; overflow: hidden;
          /* hidden on desktop */
          display: none;
        }
        /* Show only on mobile */
        @media (max-width: 767px) { #xlnv-ham { display: flex; } }

        #xlnv-ham::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at center, rgba(250,204,21,0.09), transparent);
          opacity: 0; transition: opacity 0.25s ease;
        }
        #xlnv-ham:hover::before { opacity: 1; }
        #xlnv-ham:hover { border-color: rgba(250,204,21,0.22); }
        #xlnv-ham.xlnv-open { background: rgba(250,204,21,0.07); border-color: rgba(250,204,21,0.3); }
        .xlnv-bar {
          display: block; border-radius: 99px;
          background: rgba(255,255,255,0.65); height: 1.5px;
          transition: transform 0.4s cubic-bezier(0.23,1,0.32,1),
                      opacity 0.3s ease, background 0.25s ease, width 0.3s ease;
        }
        #xlnv-ham.xlnv-open .xlnv-bar { background: #facc15; }
        .xlnv-bar:nth-child(1) { width: 18px; margin-bottom: 5px; }
        .xlnv-bar:nth-child(2) { width: 12px; margin-bottom: 5px; margin-left: auto; margin-right: 3px; }
        .xlnv-bar:nth-child(3) { width: 18px; }
        #xlnv-ham:hover .xlnv-bar:nth-child(2) { width: 18px; margin-right: 0; }
        #xlnv-ham.xlnv-open .xlnv-bar:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        #xlnv-ham.xlnv-open .xlnv-bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
        #xlnv-ham.xlnv-open .xlnv-bar:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* ══ MOBILE PANEL ══ */
        #xlnv-backdrop {
          position: fixed; inset: 0; z-index: 9998;
          animation: xlnv-bd-in 0.38s ease forwards;
        }
        @keyframes xlnv-bd-in {
          from { background: rgba(0,0,0,0); backdrop-filter: blur(0px); }
          to   { background: rgba(0,0,0,0.62); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        }

        #xlnv-panel {
          position: fixed; top: 0; right: 0; bottom: 0; z-index: 9999;
          width: min(82vw, 310px);
          display: flex; flex-direction: column;
          background: rgba(7,7,7,0.98);
          border-left: 1px solid rgba(250,204,21,0.07);
          overflow-y: auto; overscroll-behavior: contain;
          animation: xlnv-panel-in 0.45s cubic-bezier(0.23,1,0.32,1) forwards;
        }
        @keyframes xlnv-panel-in {
          from { transform: translateX(100%); box-shadow: none; }
          to   { transform: translateX(0); box-shadow: -28px 0 80px rgba(0,0,0,0.85); }
        }

        /* Panel header */
        #xlnv-ph {
          padding: 20px 20px 16px;
          display: flex; align-items: center; justify-content: space-between;
          position: relative;
          background: linear-gradient(180deg, rgba(250,204,21,0.03), transparent);
        }
        #xlnv-ph::after {
          content: ''; position: absolute; bottom: 0; left: 18px; right: 18px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.18), transparent);
        }
        #xlnv-ph-name { font-family: 'Cinzel', serif; font-weight: 700; font-size: 1rem; color: #facc15; }
        #xlnv-ph-tag { font-size: 0.5rem; color: rgba(250,204,21,0.28); letter-spacing: 0.26em; text-transform: uppercase; margin-top: 4px; }
        #xlnv-close {
          width: 36px; height: 36px; border-radius: 9px; cursor: pointer;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.88rem; color: rgba(255,255,255,0.38);
          transition: all 0.28s ease; flex-shrink: 0;
        }
        #xlnv-close:hover { background: rgba(250,204,21,0.08); border-color: rgba(250,204,21,0.28); color: #facc15; transform: rotate(90deg); }

        /* Mobile links */
        #xlnv-mob-nav { flex: 1; padding: 10px 0; }
        .xlnv-mob-lnk {
          display: flex; align-items: center; justify-content: space-between;
          padding: 15px 22px;
          font-family: 'Cinzel', serif; font-size: 0.88rem; font-weight: 400;
          color: rgba(255,255,255,0.4); text-decoration: none;
          border-left: 2px solid transparent;
          position: relative; overflow: hidden;
          transition: color 0.28s cubic-bezier(0.23,1,0.32,1), border-color 0.28s ease, padding-left 0.28s cubic-bezier(0.23,1,0.32,1), background 0.28s ease;
          animation: xlnv-lnk-in 0.5s cubic-bezier(0.23,1,0.32,1) both;
        }
        .xlnv-mob-lnk::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(250,204,21,0.04), transparent 60%);
          opacity: 0; transition: opacity 0.28s ease;
        }
        .xlnv-mob-lnk:hover::before { opacity: 1; }
        .xlnv-mob-lnk:hover { color: rgba(255,255,255,0.85); border-left-color: rgba(250,204,21,0.3); padding-left: 28px; }
        .xlnv-mob-lnk.xlnv-mob-active { color: #facc15; font-weight: 600; border-left-color: #facc15; background: rgba(250,204,21,0.03); }
        .xlnv-mob-lnk.xlnv-mob-active::before { opacity: 1; }
        .xlnv-mob-arr { font-size: 0.6rem; opacity: 0.22; transition: transform 0.28s ease, opacity 0.28s ease; }
        .xlnv-mob-lnk:hover .xlnv-mob-arr { transform: translateX(4px); opacity: 0.5; }
        .xlnv-mob-lnk.xlnv-mob-active .xlnv-mob-arr { color: #facc15; opacity: 0.55; }
        @keyframes xlnv-lnk-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .xlnv-mob-lnk:nth-child(1) { animation-delay: 0.04s; }
        .xlnv-mob-lnk:nth-child(2) { animation-delay: 0.09s; }
        .xlnv-mob-lnk:nth-child(3) { animation-delay: 0.14s; }
        .xlnv-mob-lnk:nth-child(4) { animation-delay: 0.19s; }
        .xlnv-mob-lnk:nth-child(5) { animation-delay: 0.24s; }

        /* Mobile CTA */
        #xlnv-mob-cta-wrap { padding: 4px 18px 8px; animation: xlnv-lnk-in 0.5s cubic-bezier(0.23,1,0.32,1) 0.29s both; }
        #xlnv-mob-cta {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          text-decoration: none; padding: 15px; border-radius: 12px;
          position: relative; overflow: hidden;
          font-weight: 800; font-size: 0.76rem; letter-spacing: 0.14em; text-transform: uppercase;
          color: #0a0a0a;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
        }
        #xlnv-mob-cta::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #facc15 0%, #f59e0b 60%, #fbbf24 100%);
        }
        #xlnv-mob-cta::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.28) 50%, transparent 65%);
          transform: translateX(-120%); transition: transform 0.65s ease;
        }
        #xlnv-mob-cta:hover::after { transform: translateX(120%); }
        #xlnv-mob-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(250,204,21,0.48); }
        #xlnv-mob-cta span { position: relative; z-index: 1; }

        /* Panel footer */
        #xlnv-pf { padding: 16px 18px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.03); margin-top: 14px; animation: xlnv-lnk-in 0.5s cubic-bezier(0.23,1,0.32,1) 0.34s both; }
        #xlnv-pf-txt { font-size: 0.5rem; color: rgba(255,255,255,0.08); letter-spacing: 0.26em; text-transform: uppercase; }
        #xlnv-deco { position: absolute; right: 16px; bottom: 24px; font-size: 5rem; opacity: 0.025; pointer-events: none; transform: rotate(-12deg); user-select: none; }
      `}</style>

            {/* ══ HEADER ══ */}
            <header
                id="xlnv-header"
                ref={headerRef}
                className={scrolled ? "xlnv-scrolled" : ""}
                onMouseMove={handleMouseMove}
            >
                {/* Cursor-following aurora */}
                <div
                    id="xlnv-aurora"
                    style={{
                        background: `linear-gradient(90deg,
              transparent 0%,
              rgba(250,204,21,0) ${mouseX - 22}%,
              rgba(250,204,21,0.65) ${mouseX}%,
              rgba(251,146,60,0.32) ${mouseX + 8}%,
              rgba(250,204,21,0) ${mouseX + 26}%,
              transparent 100%)`
                    }}
                />

                <div id="xlnv-inner">

                    {/* Brand */}
                    <Link href="/" id="xlnv-brand" aria-label="XL Classes home">
                        <span id="xlnv-brand-name">XL Classes</span>
                        <span id="xlnv-brand-sub">Learn Today · Lead Tomorrow</span>
                    </Link>

                    {/* Desktop nav — hidden on mobile via CSS */}
                    <div id="xlnv-desktop" role="navigation" aria-label="Primary navigation">
                        {NAV_LINKS.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`xlnv-lnk${active ? " xlnv-active" : ""}`}
                                >
                                    {link.label}
                                    <span
                                        className="xlnv-pill"
                                        style={{ width: active ? "54%" : "0%" }}
                                        aria-hidden
                                    />
                                </Link>
                            );
                        })}
                        <Link href="/register" id="xlnv-cta">
                            <span id="xlnv-cta-txt">Register</span>
                            <span id="xlnv-cta-ico">♟</span>
                        </Link>
                    </div>

                    {/* Hamburger — shown ONLY on mobile via CSS */}
                    <button
                        id="xlnv-ham"
                        className={open ? "xlnv-open" : ""}
                        onClick={() => setOpen((o) => !o)}
                        aria-label={open ? "Close menu" : "Open menu"}
                        aria-expanded={open}
                        aria-controls="xlnv-panel"
                    >
                        <span className="xlnv-bar" />
                        <span className="xlnv-bar" />
                        <span className="xlnv-bar" />
                    </button>

                </div>
            </header>

            {/* ══ MOBILE UI ══ */}
            {open && (
                <>
                    <div id="xlnv-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />

                    <div id="xlnv-panel" role="dialog" aria-modal="true" aria-label="Site navigation">
                        <div id="xlnv-ph">
                            <div>
                                <p id="xlnv-ph-name">XL Classes</p>
                                <p id="xlnv-ph-tag">Chess Championship</p>
                            </div>
                            <button id="xlnv-close" onClick={() => setOpen(false)} aria-label="Close navigation">✕</button>
                        </div>

                        <nav id="xlnv-mob-nav" aria-label="Mobile navigation">
                            {NAV_LINKS.map((link) => {
                                const active = isActive(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                        className={`xlnv-mob-lnk${active ? " xlnv-mob-active" : ""}`}
                                    >
                                        <span>{link.label}</span>
                                        <span className="xlnv-mob-arr" aria-hidden>→</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div id="xlnv-mob-cta-wrap">
                            <Link href="/register" id="xlnv-mob-cta" onClick={() => setOpen(false)}>
                                <span>Register Now</span>
                                <span>♟</span>
                            </Link>
                        </div>

                        <div id="xlnv-pf">
                            <p id="xlnv-pf-txt">Learn Today · Lead Tomorrow</p>
                        </div>

                        <span id="xlnv-deco" aria-hidden>♛</span>
                    </div>
                </>
            )}
        </>
    );
}