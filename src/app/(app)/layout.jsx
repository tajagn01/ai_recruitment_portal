"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, clearUser } from "@/lib/auth";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Candidates", href: "/candidates" },
  { label: "Upload Resume", href: "/upload-resume" },
  { label: "AI Assistant", href: "/ai-assistant" },
  { label: "Profile", href: "/profile" },
];

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!user || user.role !== "HR") {
      router.replace("/login");
    }
  }, [router, user, isReady]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    clearUser();
    router.push("/");
  };

  if (!isReady || !user) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#0b0b0f] via-[#0f0f12] to-black text-white" suppressHydrationWarning>
      <div className="magic-grid" aria-hidden />
      <div className="aceternity-spotlight" style={{ top: 40, left: 40 }} aria-hidden />
      <div className="aceternity-spotlight" style={{ bottom: -80, right: 40 }} aria-hidden />

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 glass-card">
          <div className="flex items-center gap-3 px-5 pt-6 pb-4">
            <div className="w-10 h-10 rounded-2xl neon-border flex items-center justify-center font-black text-lg">
              V
            </div>
            <div>
              <p className="mono-label">VectorHire</p>
              <p className="text-xs text-gray-400">AI Recruiting</p>
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
                  <span className="w-1.5 h-1.5 rounded-full bg-(--accent) opacity-0 group-hover:opacity-100 transition" />
                  {item.label}
                </span>
                {isActive(item.href) && (
                  <span className="text-[10px] uppercase tracking-[0.18em] text-(--accent)">
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
              suppressHydrationWarning
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-4 backdrop-blur-md bg-black/30">
            <div className="flex items-center gap-3">
              {/* Mobile menu button - only show on mobile */}
              <button
                type="button"
                className="lg:hidden w-9 h-9 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
                onClick={() => router.push("/dashboard")}
                suppressHydrationWarning
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick actions */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => router.push("/upload-resume")}
                  className="pill bg-white/8 text-xs text-gray-100 border border-white/15 hover:border-[var(--accent)] hover:scale-105 transition"
                  suppressHydrationWarning
                >
                  Upload Resume
                </button>
                <button
                  onClick={() => router.push("/candidates")}
                  className="pill bg-white/3 text-xs text-gray-100 border border-white/10 hover:border-[var(--accent)] hover:scale-105 transition"
                  suppressHydrationWarning
                >
                  View Candidates
                </button>
              </div>

              {/* Avatar */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAvatarOpen((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-semibold hover:border-[var(--accent)] transition"
                  suppressHydrationWarning
                >
                  {(user?.name || "HR").slice(0, 2).toUpperCase()}
                </button>
                {avatarOpen && (
                  <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-white/15 bg-black/85 shadow-2xl backdrop-blur-xl text-sm z-50">
                    <button
                      onClick={() => {
                        setAvatarOpen(false);
                        router.push("/profile");
                      }}
                      className="block w-full text-left px-3 py-2.5 text-gray-100 hover:bg-white/10 transition"
                    >
                      Profile
                    </button>
                    <div className="h-px bg-white/10" />
                    <button
                      onClick={() => {
                        setAvatarOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-3 py-2.5 text-red-300 hover:bg-red-500/15 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-4 sm:px-6 py-6 overflow-x-hidden">
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

