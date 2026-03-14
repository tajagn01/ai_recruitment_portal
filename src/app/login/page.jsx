"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("HR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = useMemo(() => (role === "HR" ? "/dashboard" : "/candidate-dashboard"), [role]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Placeholder: replace with real auth API.
      if (!email.trim() || !password.trim()) {
        setError("Enter email and password.");
        return;
      }
      router.push(redirectTo);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0b0b0f] via-[#0f0f12] to-black text-white">
      <div className="magic-grid" aria-hidden />
      <div className="aceternity-spotlight" style={{ top: 120, left: 120 }} aria-hidden />
      <div className="aceternity-spotlight" style={{ bottom: -60, right: 120 }} aria-hidden />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl neon-border flex items-center justify-center font-black text-lg">V</div>
            <div>
              <p className="mono-label">VectorHire</p>
              <p className="text-xs text-gray-400">Sign in</p>
            </div>
          </Link>
          <Link
            href="/signup"
            className="pill bg-white/10 border border-white/15 text-white hover:border-[var(--accent)] hover:scale-105 transition"
          >
            Create account
          </Link>
        </div>

        <div className="mt-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <section className="glass-card rounded-3xl p-7 transition hover:border-white/20 hover:bg-white/4 sheen-card">
            <p className="mono-label">Welcome back</p>
            <h1 className="mt-2 text-3xl font-semibold">Login to your workspace</h1>
            <p className="mt-2 text-sm text-gray-400">
              One login for both roles. We route you to the correct dashboard based on your account role.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-200">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-200">Password</label>
                  <input
                    value={password}
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-200">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "HR", label: "HR / Recruiter" },
                    { id: "CANDIDATE", label: "Candidate" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`rounded-2xl px-4 py-3 border transition text-sm ${
                        role === r.id
                          ? "border-[var(--accent)] bg-[var(--accent)] text-black font-semibold"
                          : "border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400">Demo switch: choose role to preview the correct dashboard.</p>
              </div>

              {error && <p className="text-sm text-red-300">{error}</p>}

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <button
                  disabled={loading}
                  className="w-full sm:w-auto pill bg-[var(--accent)] text-black font-semibold hover:scale-105 transition disabled:opacity-60"
                  type="submit"
                >
                  {loading ? "Signing in..." : "Login"}
                </button>
                <Link
                  href="/"
                  className="w-full sm:w-auto text-center pill border border-white/10 text-white hover:border-white/30 transition"
                >
                  Back to landing
                </Link>
                <span className="text-xs text-gray-400 sm:ml-auto">
                  Redirect: <span className="text-gray-200">{redirectTo}</span>
                </span>
              </div>
            </form>
          </section>

          <aside className="glass-card rounded-3xl p-7 transition hover:border-white/20 hover:bg-white/4">
            <p className="mono-label">What you get</p>
            <ul className="mt-4 space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
                Resume parsing to structured candidate profiles.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
                AI assistant turns intent into database search.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
                Hiring pipeline stages with action controls.
              </li>
            </ul>
            <div className="divider-line mt-6" />
            <p className="mt-6 text-xs text-gray-400">
              Styled with Magic UI-inspired grid + Aceternity spotlight glow (monochrome with subtle accent).
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

