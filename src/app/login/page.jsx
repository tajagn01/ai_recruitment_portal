"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Placeholder: replace with real auth API.
      if (!email.trim() || !password.trim()) {
        setError("Enter email and password.");
        setLoading(false);
        return;
      }
      // Simulate authentication
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAuthenticated(true);
    } catch (e) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = (role) => {
    const redirectTo = role === "HR" ? "/dashboard" : "/candidate-dashboard";
    router.push(redirectTo);
  };

  const fillDemoCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  const handleDemoLogin = async (demoEmail, demoPassword, role) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
    setLoading(true);
    try {
      // Simulate authentication
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAuthenticated(true);
      // Auto-select role after authentication
      setTimeout(() => {
        handleRoleSelection(role);
      }, 100);
    } catch (e) {
      setError("Demo login failed. Please try again.");
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
              Enter your credentials, then choose whether to login as HR or Candidate.
            </p>

            {!authenticated ? (
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-200">Email</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                      disabled={loading}
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
                      disabled={loading}
                    />
                  </div>
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
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-400 mb-3 text-center">Quick Demo Login</p>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => fillDemoCredentials("hr@demo.com", "demo123")}
                        disabled={loading}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white hover:bg-white/10 transition disabled:opacity-60 flex items-center justify-center gap-2"
                        title="Fill HR demo credentials"
                      >
                        <span>👔</span>
                        <span>Fill HR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fillDemoCredentials("candidate@demo.com", "demo123")}
                        disabled={loading}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white hover:bg-white/10 transition disabled:opacity-60 flex items-center justify-center gap-2"
                        title="Fill Candidate demo credentials"
                      >
                        <span>👤</span>
                        <span>Fill Candidate</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleDemoLogin("hr@demo.com", "demo123", "HR")}
                        disabled={loading}
                        className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-2 text-xs text-white hover:bg-[var(--accent)]/20 transition disabled:opacity-60 flex items-center justify-center gap-2 font-semibold"
                        title="Quick login as HR"
                      >
                        <span>🚀</span>
                        <span>Quick HR Login</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDemoLogin("candidate@demo.com", "demo123", "CANDIDATE")}
                        disabled={loading}
                        className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-2 text-xs text-white hover:bg-[var(--accent)]/20 transition disabled:opacity-60 flex items-center justify-center gap-2 font-semibold"
                        title="Quick login as Candidate"
                      >
                        <span>🚀</span>
                        <span>Quick Candidate Login</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mt-6 space-y-6">
                <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4">
                  <p className="text-sm text-gray-200 mb-1">✓ Successfully authenticated as</p>
                  <p className="text-lg font-semibold text-white">{email}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-200 font-medium">Choose your login role:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleRoleSelection("HR")}
                      className="group rounded-2xl border-2 border-white/20 bg-white/5 p-6 hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center group-hover:bg-[var(--accent)] transition">
                          <span className="text-xl">👔</span>
                        </div>
                        <p className="font-semibold text-white">HR / Recruiter</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Access dashboard, candidates, upload resumes, and AI assistant
                      </p>
                    </button>

                    <button
                      onClick={() => handleRoleSelection("CANDIDATE")}
                      className="group rounded-2xl border-2 border-white/20 bg-white/5 p-6 hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center group-hover:bg-[var(--accent)] transition">
                          <span className="text-xl">👤</span>
                        </div>
                        <p className="font-semibold text-white">Candidate</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        View applications, manage resume, and track your status
                      </p>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setAuthenticated(false);
                    setError("");
                  }}
                  className="w-full text-center pill border border-white/10 text-white hover:border-white/30 transition text-sm"
                >
                  Login as different user
                </button>
              </div>
            )}
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

