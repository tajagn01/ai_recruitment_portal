"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Upload,
  MapPin,
  Briefcase,
  Code,
  Mail,
  TrendingUp,
  X,
  CheckCircle2,
  Trash2
} from "lucide-react";

const initialFilters = { skills: "", experience: "", location: "" };

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function CandidatesPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const deleteCandidate = async (id, name) => {
    if (!confirm(`Delete "${name || "this candidate"}" and their resume? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/candidates?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setCandidates((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete candidate. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

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
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 mb-3">
            <Users className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">Candidates</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">Candidate Database</h1>
          <p className="mt-2 text-base text-gray-400">
            Browse, filter, and manage your talent pool with ease.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/upload-resume"
            className="rounded-full bg-[var(--accent)] text-black font-bold px-6 py-3 inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg hover:shadow-[0_0_30px_rgba(198,243,107,0.3)]"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Resume</span>
          </Link>
          <motion.button
            onClick={fetchAll}
            className="rounded-full border-2 border-white/20 text-white hover:border-[var(--accent)] px-6 py-3 inline-flex items-center justify-center gap-2 font-semibold hover:bg-white/5 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            suppressHydrationWarning
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 items-start">
        {/* Candidates Grid */}
        <motion.section 
          className="glass-card rounded-3xl p-8 min-h-[600px]"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6 gap-3">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--accent)]" />
                All Candidates
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {loading ? "Loading..." : `Showing ${filtered.length} of ${candidates.length} candidates`}
              </p>
            </div>
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-xl border border-white/20 hover:border-[var(--accent)] px-4 py-2.5 inline-flex items-center justify-center gap-2 font-semibold text-sm hover:bg-white/5 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              suppressHydrationWarning
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? "Hide" : "Show"} Filters</span>
            </motion.button>
          </div>

          {/* Inline Filters Section */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="mb-6 p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 border border-[var(--accent)]/30 flex items-center justify-center">
                      <Filter className="w-5 h-5 text-[var(--accent)]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Filters</p>
                      <p className="text-xs text-gray-400">Refine your search results</p>
                    </div>
                  </div>
                  {(query || filters.skills || filters.experience || filters.location) && (
                    <motion.button
                      onClick={() => {
                        setFilters(initialFilters);
                        setQuery("");
                      }}
                      className="text-xs text-[var(--accent)] hover:text-white font-semibold inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--accent)]/30 hover:bg-[var(--accent)]/10 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      suppressHydrationWarning
                    >
                      <X className="w-3 h-3" />
                      Clear All
                    </motion.button>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-semibold flex items-center gap-2 uppercase tracking-wider">
                      <Search className="w-3.5 h-3.5 text-[var(--accent)]" />
                      Search
                    </label>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Name, email, skills..."
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                      suppressHydrationWarning
                    />
                  </div>

                  {/* Skills Filter */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-semibold flex items-center gap-2 uppercase tracking-wider">
                      <Code className="w-3.5 h-3.5 text-[var(--accent)]" />
                      Skills
                    </label>
                    <input
                      value={filters.skills}
                      onChange={(e) => updateFilter("skills", e.target.value)}
                      placeholder="e.g. Python, React"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                      suppressHydrationWarning
                    />
                  </div>

                  {/* Experience Filter */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-semibold flex items-center gap-2 uppercase tracking-wider">
                      <Briefcase className="w-3.5 h-3.5 text-[var(--accent)]" />
                      Experience (years)
                    </label>
                    <input
                      value={filters.experience}
                      onChange={(e) => updateFilter("experience", e.target.value)}
                      placeholder="e.g. 3"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                      suppressHydrationWarning
                    />
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-semibold flex items-center gap-2 uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                      Location
                    </label>
                    <input
                      value={filters.location}
                      onChange={(e) => updateFilter("location", e.target.value)}
                      placeholder="e.g. Remote, NYC"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                      suppressHydrationWarning
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {filtered.length === 0 && !loading && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No candidates found</h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your filters or upload new resumes to get started.
              </p>
              <Link
                href="/upload-resume"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] text-black font-bold px-6 py-3 hover:scale-105 transition-transform"
              >
                <Upload className="w-4 h-4" />
                Upload Resume
              </Link>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin" />
            </div>
          )}

          {/* Candidates Grid */}
          {filtered.length > 0 && !loading && (
            <motion.div 
              className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              <AnimatePresence>
                {filtered.map((c) => {
                  const skills = (c.skills || "")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  const displaySkills = skills.slice(0, 3);
                  const remainingCount = skills.length - 3;
                  
                  return (
                    <motion.article 
                      key={c.id}
                      className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5 hover:border-[var(--accent)]/30 transition-all group"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      whileHover={{ y: -4 }}
                      layout
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-white truncate text-base">{c.name || "Unnamed"}</h3>
                            <CheckCircle2 className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 truncate">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <p className="truncate">{c.email || "No email"}</p>
                          </div>
                        </div>
                        {c.pipelineStatus && (
                          <span className="pill bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] border border-[var(--accent)]/30 font-bold flex-shrink-0 uppercase tracking-wider">
                            {c.pipelineStatus}
                          </span>
                        )}
                      </div>

                      {/* Skills */}
                      <div className="mb-4 min-h-[60px]">
                        <div className="flex flex-wrap gap-2">
                          {displaySkills.length === 0 && (
                            <span className="text-xs text-gray-500">No skills listed</span>
                          )}
                          {displaySkills.map((s) => (
                            <span key={s} className="pill bg-white/10 text-white text-[11px] border border-white/20 font-medium">
                              {s}
                            </span>
                          ))}
                          {remainingCount > 0 && (
                            <span className="pill bg-white/5 text-gray-400 text-[11px] border border-white/10 font-medium">
                              +{remainingCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                          <span className="truncate">{c.location || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Briefcase className="w-3.5 h-3.5 text-[var(--accent)]" />
                          <span>{c.experienceYears ?? "0"} yrs</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          href={`/candidate/${c.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold hover:bg-[var(--accent)] hover:text-black hover:border-[var(--accent)] transition-all group-hover:border-[var(--accent)]/50"
                        >
                          View Profile
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteCandidate(c.id, c.name)}
                          disabled={deletingId === c.id}
                          className="inline-flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all disabled:opacity-40"
                          title="Delete candidate"
                        >
                          {deletingId === c.id
                            ? <RefreshCw className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  );
}

