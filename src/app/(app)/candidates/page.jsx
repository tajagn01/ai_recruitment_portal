"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const initialFilters = { skills: "", experience: "", location: "" };

export default function CandidatesPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/candidates");
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : data.candidates || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const skills = filters.skills.trim().toLowerCase();
    const location = filters.location.trim().toLowerCase();
    const exp = filters.experience.trim();

    return candidates.filter((c) => {
      const blob = `${c.name || ""} ${c.email || ""} ${c.skills || ""} ${c.location || ""}`.toLowerCase();
      const qOk = !q || blob.includes(q);
      const skillsOk = !skills || (c.skills || "").toLowerCase().includes(skills);
      const locOk = !location || (c.location || "").toLowerCase().includes(location);
      const expOk = !exp || String(c.experienceYears ?? "").includes(exp);
      return qOk && skillsOk && locOk && expOk;
    });
  }, [candidates, filters.experience, filters.location, filters.skills, query]);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="mono-label">Candidates</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold">Candidate database</h1>
          <p className="mt-1 text-sm text-gray-400">Browse, filter, and open candidate profiles.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/upload-resume"
            className="pill bg-[var(--accent)] text-black font-semibold hover:scale-105 transition"
          >
            Upload Resume
          </Link>
          <button
            onClick={fetchAll}
            className="pill bg-white/10 border border-white/15 text-white hover:border-[var(--accent)] hover:scale-105 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        <aside className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="mono-label">Filters</p>
            <button
              className="text-xs text-gray-300 hover:text-white"
              onClick={() => setFilters(initialFilters)}
            >
              Reset
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-200">Search</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, email, skills..."
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-200">Skills</label>
            <input
              value={filters.skills}
              onChange={(e) => updateFilter("skills", e.target.value)}
              placeholder="e.g. Python, React"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-200">Experience</label>
            <input
              value={filters.experience}
              onChange={(e) => updateFilter("experience", e.target.value)}
              placeholder="e.g. 3"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-200">Location</label>
            <input
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              placeholder="e.g. Remote, NYC"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </aside>

        <section className="glass-card rounded-2xl p-5 min-h-[420px]">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div>
              <p className="mono-label">All candidates</p>
              <p className="text-sm text-gray-300">
                Showing {filtered.length} of {candidates.length}
              </p>
            </div>
            {loading && <p className="text-xs text-gray-400">Loading...</p>}
          </div>

          {filtered.length === 0 && !loading && (
            <p className="text-gray-400 text-sm">No matches. Adjust filters or upload a resume.</p>
          )}

          {filtered.length > 0 && (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((c) => {
                const skills = (c.skills || "")
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .slice(0, 4);
                return (
                  <article key={c.id} className="rounded-2xl border border-white/10 bg-white/3 p-4 hover-tilt">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{c.name || "Unnamed"}</p>
                        <p className="text-xs text-gray-400 truncate">{c.email || "Email unavailable"}</p>
                      </div>
                      {c.pipelineStatus && (
                        <span className="pill bg-white/10 text-white text-[11px] border border-white/10">
                          {c.pipelineStatus}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {skills.length === 0 && <span className="text-xs text-gray-400">No skills listed</span>}
                      {skills.map((s) => (
                        <span key={s} className="pill bg-white/8 text-white text-[11px] border border-white/10">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                      <span>{c.location || "Location unknown"}</span>
                      <span>{c.experienceYears ?? "-"} yrs</span>
                    </div>

                    <Link
                      href={`/candidate/${c.id}`}
                      className="mt-4 inline-flex items-center justify-center w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10 hover:border-[var(--accent)] transition"
                    >
                      View Profile
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

