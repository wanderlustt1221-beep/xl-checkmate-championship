"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
    { label: "Dashboard", href: "/admin", icon: "⬡" },
    { label: "Rounds", href: "/admin/rounds", icon: "◈" },
    { label: "Participants", href: "/admin/participants", icon: "♟" },
    { label: "Matches", href: "/bracket", icon: "⟁", external: true },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
          fixed top-0 left-0 z-30 h-full w-64 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
                style={{
                    background: "rgba(10,10,10,0.97)",
                    borderRight: "1px solid rgba(250,204,21,0.1)",
                    backdropFilter: "blur(24px)",
                }}
            >
                {/* Brand */}
                <div className="px-6 pt-8 pb-6 flex flex-col gap-1">
                    <div className="flex items-center gap-2.5 mt-12">
                        <span className="text-yellow-400 text-xl leading-none select-none">♛</span>
                        <span
                            className="text-white font-bold text-base tracking-tight"
                            style={{ fontFamily: "'Cinzel', serif" }}
                        >
                            XL Classes
                        </span>
                    </div>
                    <span className="text-yellow-400/50 text-[10px] tracking-[0.2em] uppercase ml-7">
                        Admin Panel
                    </span>
                    {/* Gold rule */}
                    <div
                        className="mt-4 h-px w-full"
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(250,204,21,0.5), transparent)",
                        }}
                    />
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive =
                            item.href === "/admin"
                                ? pathname === "/admin"
                                : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                target={item.external ? "_blank" : undefined}
                                rel={item.external ? "noopener noreferrer" : undefined}
                                onClick={() => onClose()}
                                className={`
                  group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 relative overflow-hidden
                  ${isActive
                                        ? "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20"
                                        : "text-white/50 hover:text-white/90 hover:bg-white/5 border border-transparent"
                                    }
                `}
                            >
                                {/* Active left bar */}
                                {isActive && (
                                    <span
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-yellow-400"
                                    />
                                )}
                                <span className="text-base leading-none w-5 text-center">
                                    {item.icon}
                                </span>
                                <span className="tracking-wide">{item.label}</span>
                                {item.external && (
                                    <span className="ml-auto text-white/20 text-xs">↗</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-white/5">
                    <p className="text-white/20 text-[10px] tracking-widest uppercase">
                        Under 19 Chess Championship
                    </p>
                    <p className="text-white/10 text-[10px] mt-0.5">
                        Learn Today · Lead Tomorrow
                    </p>
                </div>
            </aside>
        </>
    );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
    const pathname = usePathname();

    const pageTitle =
        NAV_ITEMS.find((n) =>
            n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)
        )?.label ?? "Admin";

    return (
        <header
            className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5"
            style={{
                background: "rgba(10,10,10,0.85)",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
        >
            <div className="flex items-center gap-3">
                {/* Hamburger – mobile only */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-colors"
                    aria-label="Open menu"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <h1
                    className="text-white/90 font-semibold text-sm tracking-wide"
                    style={{ fontFamily: "'Cinzel', serif" }}
                >
                    {pageTitle}
                </h1>
            </div>

            {/* Badge */}
            <span
                className="text-[10px] font-medium tracking-widest uppercase px-3 py-1 rounded-full"
                style={{
                    background: "rgba(250,204,21,0.08)",
                    border: "1px solid rgba(250,204,21,0.2)",
                    color: "rgba(250,204,21,0.8)",
                }}
            >
                Chess Championship
            </span>
        </header>
    );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change (mobile)
    const pathname = usePathname();
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap');
        html, body { background: #0a0a0a; margin: 0; font-family: 'Jost', sans-serif; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(250,204,21,0.2); border-radius: 99px; }
      `}</style>

            <div className="flex h-screen overflow-hidden" style={{ background: "#0a0a0a" }}>
                {/* Sidebar */}
                <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* Main */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Topbar onMenuClick={() => setSidebarOpen(true)} />
                    <main
                        className="flex-1 overflow-y-auto"
                        style={{
                            background:
                                "radial-gradient(ellipse 80% 40% at 60% -10%, rgba(250,204,21,0.05) 0%, transparent 55%), #0a0a0a",
                        }}
                    >
                        <div className="max-w-6xl mx-auto px-5 py-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}