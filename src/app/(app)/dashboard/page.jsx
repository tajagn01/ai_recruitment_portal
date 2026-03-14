"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const initialFilters = { skills: "", experience: "", location: "", pipelineStatus: "" };

export default function RecruiterDashboard() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const total = candidates.length;
    const shortlisted = candidates.filter((c) => c.pipelineStatus === "Shortlisted").length;
    const interviewing = candidates.filter((c) => c.pipelineStatus === "Interview").length;
    return { total, shortlisted, interviewing };
  }, [candidates]);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/candidates");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch candidates");
      }
      setCandidates(Array.isArray(data) ? data : data.candidates || []);
    } catch (err) {
      console.error("Fetch failed", err);
      setError(err?.message || "Failed to load candidates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      // If query is empty, fetch all candidates
      fetchAll();
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/search-candidates?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Search failed");
      }
      setCandidates(Array.isArray(data) ? data : data.candidates || []);
    } catch (err) {
      console.error("Search failed", err);
      setError(err?.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleFilter = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/filter-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Filter failed");
      }
      setCandidates(Array.isArray(data) ? data : data.candidates || []);
    } catch (err) {
      console.error("Filter failed", err);
      setError(err?.message || "Filter failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="mono-label">DASHBOARD</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold">Recruiter workspace</h1>
          <p className="mt-1 text-sm text-gray-400">
            Search, filter, and act on your entire candidate universe in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
          <Link
            href="/ai-assistant"
            className="pill bg-white/10 border border-white/20 text-white hover:border-[var(--accent)] hover:scale-105 transition"
          >
            Open AI Assistant
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px,1fr] items-start">
        {/* Filters */}
        <aside className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="mono-label">FILTERS</p>
            <button
              className="text-xs text-gray-300 hover:text-white"
              onClick={() => {
                setFilters(initialFilters);
                fetchAll();
              }}
            >
              Reset
            </button>
          </div>
          <div className="space-y-3">
            <label className="text-sm text-gray-200">Skills</label>
            <input
              value={filters.skills}
              onChange={(e) => updateFilter("skills", e.target.value)}
              placeholder="e.g. Python, React"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm text-gray-200">Years of Experience</label>
            <input
              value={filters.experience}
              onChange={(e) => updateFilter("experience", e.target.value)}
              placeholder="e.g. 3"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm text-gray-200">Location</label>
            <input
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              placeholder="e.g. Remote, NYC"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm text-gray-200">Pipeline Status</label>
            <select
              value={filters.pipelineStatus}
              onChange={(e) => updateFilter("pipelineStatus", e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none text-white"
            >
              <option value="">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Hired">Hired</option>
            </select>
          </div>
          <button
            onClick={handleFilter}
            className="w-full pill bg-[var(--accent)] text-black font-semibold hover:scale-105 transition"
          >
            Apply Filters
          </button>
        </aside>

        {/* Main content */}
        <section className="space-y-6">
          {/* Search + Stats */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="mono-label">SEARCH CANDIDATES</p>
              <span className="pill bg-white/8 text-white text-xs">Live</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search candidates (e.g. Python developer)"
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="pill bg-[var(--accent)] text-black font-semibold hover:scale-105 transition disabled:opacity-60"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <StatCard label="Total Candidates" value={stats.total} subtle="Live" />
            <StatCard label="Shortlisted" value={stats.shortlisted} subtle="Priority" />
            <StatCard label="Interviews" value={stats.interviewing} subtle="This week" />
          </div>

          {/* Results */}
          <div className="glass-card rounded-2xl p-5 min-h-[320px]">
            <div className="flex items-center justify-between mb-4 gap-3">
              <div>
                <p className="mono-label">Candidate Results</p>
                <p className="text-sm text-gray-300">Showing {candidates.length} candidates</p>
              </div>
              {loading && <p className="text-xs text-gray-400">Loading...</p>}
            </div>
            {candidates.length === 0 && !loading && (
              <div className="text-gray-400 text-sm">
                No candidates yet. Upload a resume or run a search.
              </div>
            )}
            {candidates.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/3">
                <table className="w-full text-sm text-left">
                  <thead className="uppercase text-[11px] tracking-[0.15em] text-gray-400 border-b border-white/10">
                    <tr className="align-middle">
                      <th className="px-4 py-3">Candidate</th>
                      <th className="px-4 py-3">Skills</th>
                      <th className="px-4 py-3">Experience</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3 text-right">Profile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c, idx) => {
                      const skills = (c.skills || "")
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .slice(0, 3);
                      return (
                        <tr
                          key={c.id || c.email || idx}
                          className="border-b border-white/5 hover:bg-white/5 transition align-middle"
                        >
                          <td className="px-4 py-4">
                            <div className="font-semibold text-white">{c.name || "Unnamed"}</div>
                            <div className="text-xs text-gray-400">
                              {c.email || "Email unavailable"}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              {skills.length === 0 && (
                                <span className="text-xs text-gray-400">No skills listed</span>
                              )}
                              {skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="pill bg-white/8 text-white text-[11px] border border-white/10"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-200 whitespace-nowrap">
                            {c.experienceYears ?? "-"} yrs
                          </td>
                          <td className="px-4 py-4 text-gray-200 whitespace-nowrap">
                            {c.location || "Location unknown"}
                          </td>
                          <td className="px-4 py-4 text-right align-middle">
                            <Link
                              href={`/candidate/${c.id ?? ""}`}
                              className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-white/20 text-white hover:border-[var(--accent)] hover:scale-105 transition text-xs bg-white/5"
                            >
                              View Profile
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Floating AI Assistant Button */}
      <Link
        href="/ai-assistant"
        className="fixed bottom-6 right-6 pill bg-[var(--accent)] text-black font-semibold shadow-lg shadow-[var(--accent)]/30 hover:shadow-[var(--accent)]/50 hover:scale-105 transition-all flex items-center gap-2"
      >
        <span className="h-2 w-2 rounded-full bg-black" />
        AI Recruiter Assistant
      </Link>
    </div>
  );
}

function StatCard({ label, value, subtle }) {
  return (
    <div className="glass-card rounded-2xl p-4 hover-tilt">
      <p className="mono-label mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold">{value}</span>
        <span className="text-xs text-gray-400">{subtle}</span>
      </div>
    </div>
  );
}

