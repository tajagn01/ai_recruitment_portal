"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("HR");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = useMemo(() => (role === "HR" ? "/dashboard" : "/candidate-dashboard"), [role]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError("Fill in all required fields.");
        return;
      }
      if (role === "HR" && !company.trim()) {
        setError("Company name is required for HR accounts.");
        return;
      }
      // Placeholder: replace with real registration API.
      router.push(redirectTo);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0b0b0f] via-[#0f0f12] to-black text-white">
      <div className="magic-grid" aria-hidden />
      <div className="aceternity-spotlight" style={{ top: 100, left: 140 }} aria-hidden />
      <div className="aceternity-spotlight" style={{ bottom: -80, right: 140 }} aria-hidden />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl neon-border flex items-center justify-center font-black text-lg">V</div>
            <div>
              <p className="mono-label">VectorHire</p>
              <p className="text-xs text-gray-400">Create account</p>
            </div>
          </Link>
          <Link
            href="/login"
            className="pill bg-white/10 border border-white/15 text-white hover:border-[var(--accent)] hover:scale-105 transition"
          >
            Login
          </Link>
        </div>

        <div className="mt-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <section className="glass-card rounded-3xl p-7 transition hover:border-white/20 hover:bg-white/4 sheen-card">
            <p className="mono-label">Sign up</p>
            <h1 className="mt-2 text-3xl font-semibold">Start hiring (or applying) smarter</h1>
            <p className="mt-2 text-sm text-gray-400">
              Choose your role during registration. HR accounts unlock resume parsing, candidate search, and pipeline.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-200">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-200">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-200">Password</label>
                  <input
                    value={password}
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-200">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "HR", label: "HR" },
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
                </div>
              </div>

              {role === "HR" && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-200">Company Name</label>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              )}

              {error && <p className="text-sm text-red-300">{error}</p>}

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <button
                  disabled={loading}
                  className="w-full sm:w-auto pill bg-[var(--accent)] text-black font-semibold hover:scale-105 transition disabled:opacity-60"
                  type="submit"
                >
                  {loading ? "Creating..." : "Create account"}
                </button>
                <Link
                  href="/login"
                  className="w-full sm:w-auto text-center pill border border-white/10 text-white hover:border-white/30 transition"
                >
                  I already have an account
                </Link>
                <span className="text-xs text-gray-400 sm:ml-auto">
                  Redirect: <span className="text-gray-200">{redirectTo}</span>
                </span>
              </div>
            </form>
          </section>

          <aside className="glass-card rounded-3xl p-7 transition hover:border-white/20 hover:bg-white/4">
            <p className="mono-label">Role-based experience</p>
            <div className="mt-4 space-y-4 text-sm text-gray-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-gray-400">HR / Recruiter</p>
                <p className="font-semibold text-white mt-1">Dashboard · Candidates · Upload · AI Assistant</p>
                <p className="text-gray-400 mt-2">Search and move candidates through the pipeline.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
                <p className="text-xs text-gray-400">Candidate</p>
                <p className="font-semibold text-white mt-1">Dashboard · Applications · Resume · Profile</p>
                <p className="text-gray-400 mt-2">Track your status and keep your resume updated.</p>
              </div>
            </div>
            <div className="divider-line mt-6" />
            <p className="mt-6 text-xs text-gray-400">
              Minimal black/white theme with subtle grayscale accents; motion cues via hover + glow.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

