import Link from "next/link";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Rules", href: "/rules" },
  { label: "Register", href: "/register" },
  { label: "Matches", href: "/bracket" },
  { label: "Contact", href: "/contact" },
];

const EVENT_INFO = [
  { icon: "📅", label: "Date", value: "February 1 & 2, 2026" },
  { icon: "⏰", label: "Reporting Time", value: "9:30 AM" },
  { icon: "🎟", label: "Entry", value: "Free" },
  { icon: "⚔", label: "Format", value: "Knockout" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap');

        /* ── Scoped to .xlfooter only — no global leakage ── */
        .xlfooter {
          position: relative;
          /* Solid background so bracket's chess pattern NEVER bleeds through */
          background: #060606;
          font-family: 'Jost', sans-serif;
          overflow: hidden;
          /* Ensure footer stacks normally in document flow */
          z-index: 10;
        }

        /* Gold gradient top border */
        .xlfooter::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(250,204,21,0.45) 25%,
            rgba(250,204,21,0.85) 50%,
            rgba(250,204,21,0.45) 75%,
            transparent
          );
          /* z-index scoped inside footer, no effect outside */
          z-index: 1;
        }

        /* Chess watermark — inside footer only */
        .xlfooter::after {
          content: '♛';
          position: absolute;
          bottom: 16px; right: 20px;
          font-size: 7rem; line-height: 1;
          color: rgba(255,255,255,0.015);
          pointer-events: none; user-select: none;
          z-index: 0;
        }

        .xlfooter-inner {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          margin: 0 auto;
          padding: 56px 24px 32px;
        }

        /* ── Brand ── */
        .xlfooter-brand {
          font-family: 'Cinzel', serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #facc15;
          letter-spacing: 0.04em;
          margin: 0;
        }
        .xlfooter-tagline {
          font-size: 0.6rem;
          color: rgba(250,204,21,0.38);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          margin-top: 4px;
        }
        .xlfooter-desc {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.3);
          line-height: 1.72;
          max-width: 260px;
          margin-top: 14px;
        }
        .xlfooter-ext {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(250,204,21,0.5);
          text-decoration: none;
          margin-top: 16px;
          transition: color 0.2s;
        }
        .xlfooter-ext:hover { color: #facc15; }

        /* ── Column grid ── */
        .xlfooter-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          margin-bottom: 48px;
        }
        @media (min-width: 640px) {
          .xlfooter-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (min-width: 1024px) {
          .xlfooter-grid { grid-template-columns: 1.2fr 0.9fr 1.1fr; gap: 48px; }
        }

        /* ── Col heading ── */
        .xlfooter-col-title {
          font-family: 'Cinzel', serif;
          font-size: 0.68rem;
          font-weight: 600;
          color: rgba(255,255,255,0.38);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin: 0 0 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .xlfooter-col-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
          max-width: 40px;
        }

        /* ── Quick links ── */
        .xlfooter-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .xlfooter-link {
          display: flex;
          align-items: center;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          padding: 7px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: color 0.2s, padding-left 0.22s;
          gap: 8px;
        }
        .xlfooter-link:last-child { border-bottom: none; }
        .xlfooter-link-arrow {
          font-size: 0.6rem;
          color: rgba(250,204,21,0);
          transition: color 0.2s;
          flex-shrink: 0;
        }
        .xlfooter-link:hover {
          color: rgba(255,255,255,0.85);
          padding-left: 5px;
        }
        .xlfooter-link:hover .xlfooter-link-arrow {
          color: rgba(250,204,21,0.7);
        }

        /* ── Event badge ── */
        .xlfooter-badge {
          display: inline-block;
          padding: 5px 12px;
          margin-bottom: 14px;
          border-radius: 8px;
          background: rgba(250,204,21,0.06);
          border: 1px solid rgba(250,204,21,0.18);
          font-family: 'Cinzel', serif;
          font-size: 0.7rem;
          font-weight: 600;
          color: rgba(250,204,21,0.8);
          letter-spacing: 0.04em;
        }

        /* ── Event info rows ── */
        .xlfooter-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 9px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .xlfooter-row:last-child { border-bottom: none; }
        .xlfooter-row-icon {
          font-size: 0.9rem;
          opacity: 0.6;
          flex-shrink: 0;
          padding-top: 2px;
        }
        .xlfooter-row-label {
          font-size: 0.6rem;
          color: rgba(255,255,255,0.22);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          line-height: 1;
          margin-bottom: 3px;
        }
        .xlfooter-row-value {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.6);
          font-weight: 500;
        }

        /* ── Bottom bar ── */
        .xlfooter-bottom {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          justify-content: space-between;
        }
        .xlfooter-copy {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.18);
          letter-spacing: 0.04em;
          margin: 0;
        }
        .xlfooter-note {
          font-size: 0.6rem;
          color: rgba(250,204,21,0.25);
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
      `}</style>

      <footer className="xlfooter">
        <div className="xlfooter-inner">

          {/* 3-column grid */}
          <div className="xlfooter-grid">

            {/* LEFT — Brand */}
            <div>
              <p className="xlfooter-brand">XL Classes</p>
              <p className="xlfooter-tagline">Learn Today · Lead Tomorrow</p>
              <p className="xlfooter-desc">
                Dedicated to nurturing young talent through academic excellence, competitive programs,
                and co-curricular experiences that build the leaders of tomorrow.
              </p>
              <a
                href="https://xl-classes.github.io/results.nic.in"
                target="_blank"
                rel="noopener noreferrer"
                className="xlfooter-ext"
              >
                Official Website <span style={{ fontSize: "0.68rem" }}>↗</span>
              </a>
            </div>

            {/* CENTER — Quick Links */}
            <div>
              <h3 className="xlfooter-col-title">Quick Links</h3>
              <nav className="xlfooter-nav" aria-label="Footer navigation">
                {QUICK_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} className="xlfooter-link">
                    <span className="xlfooter-link-arrow">→</span>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* RIGHT — Event Info */}
            <div>
              <h3 className="xlfooter-col-title">Event Info</h3>
              <span className="xlfooter-badge">Under 19 - XL Checkmate Championship</span>
              {EVENT_INFO.map((item) => (
                <div key={item.label} className="xlfooter-row">
                  <span className="xlfooter-row-icon">{item.icon}</span>
                  <div>
                    <p className="xlfooter-row-label">{item.label}</p>
                    <p className="xlfooter-row-value">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="xlfooter-bottom">
            <p className="xlfooter-copy">© {year} XL Classes. All rights reserved.</p>
            <p className="xlfooter-note">Learn Today · Lead Tomorrow</p>
          </div>

        </div>
      </footer>
    </>
  );
}