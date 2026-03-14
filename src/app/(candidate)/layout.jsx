"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/candidate-dashboard" },
  { label: "My Applications", href: "/applications" },
  { label: "Upload Resume", href: "/candidate-resume" },
  { label: "Profile", href: "/candidate-profile" },
];

export default function CandidateLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0b0b0f] via-[#0f0f12] to-black text-white">
      <div className="magic-grid" aria-hidden />
      <div className="aceternity-spotlight" style={{ top: 40, left: 40 }} aria-hidden />
      <div className="aceternity-spotlight" style={{ bottom: -80, right: 40 }} aria-hidden />

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 glass-card">
          <div className="flex items-center gap-3 px-5 pt-6 pb-4">
            <div className="w-10 h-10 rounded-2xl neon-border flex items-center justify-center font-black text-lg">
              V
            </div>
            <div>
              <p className="mono-label">Candidate</p>
              <p className="text-xs text-gray-400">Your portal</p>
            </div>
          </div>
          <nav className="mt-4 flex-1 space-y-1 px-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  isActive(item.href)
                    ? "bg-white/10 border border-white/20 text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition" />
                  {item.label}
                </span>
                {isActive(item.href) && (
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]">
                    Active
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="px-3 pb-4 pt-2 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl px-3 py-2.5 transition"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-4 backdrop-blur-md bg-black/30">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="lg:hidden pill border border-white/15 text-xs text-gray-200"
                onClick={() => setMenuOpen((v) => !v)}
              >
                Menu
              </button>
              <Link href="/" className="hidden sm:flex items-center gap-2">
                <span className="mono-label">VectorHire</span>
                <span className="text-xs text-gray-400">Candidate</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition"
              >
                <span className="sr-only">Notifications</span>
                <span className="text-xs">◎</span>
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-semibold hover:border-[var(--accent)] transition"
              >
                C
              </button>
            </div>
          </header>

          {menuOpen && (
            <div className="lg:hidden border-b border-white/10 bg-black/60 backdrop-blur-md px-4 py-3">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="rounded-xl border border-white/10 bg-white/3 px-3 py-2 text-sm text-left hover:bg-white/10 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          <main className="px-4 sm:px-6 py-6 overflow-x-hidden">
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

