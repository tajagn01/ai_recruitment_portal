"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard,
  Search,
  Filter,
  Upload,
  RefreshCw,
  Users,
  TrendingUp,
  Clock,
  Sparkles,
  Code,
  MapPin,
  Briefcase,
  Mail,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";

const initialFilters = { skills: "", experience: "", location: "", pipelineStatus: "" };

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function RecruiterDashboard() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [aiButtonExpanded, setAiButtonExpanded] = useState(false);

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
      setError(err?.message || "Failed to load candidates. Please check your database connection.");
      setCandidates([]); // Set empty array on error
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

  const handleKeyDown = (e) => {
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
  }, []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

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
            <LayoutDashboard className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">Recruiter Workspace</h1>
          <p className="mt-2 text-base text-gray-400">
            Search, filter, and manage your entire candidate pipeline in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
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

      {/* Stats Cards */}
      <motion.div 
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        <StatCard 
          icon={Users} 
          label="Total Candidates" 
          value={stats.total} 
          subtitle="In database" 
          color="accent"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Shortlisted" 
          value={stats.shortlisted} 
          subtitle="Priority candidates" 
          color="blue"
        />
        <StatCard 
          icon={Clock} 
          label="Interviews" 
          value={stats.interviewing} 
          subtitle="This week" 
          color="purple"
        />
      </motion.div>

      <div className="grid gap-6 items-start">
        {/* Main Content */}
        <motion.section 
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Search Bar */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 border border-[var(--accent)]/30 flex items-center justify-center">
                  <Search className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-sm font-bold">Search Candidates</p>
                  <p className="text-xs text-gray-400">Find candidates by skills, name, or keywords</p>
                </div>
              </div>
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-xl border border-white/20 hover:border-[var(--accent)] px-4 py-2 inline-flex items-center justify-center gap-2 font-semibold text-sm hover:bg-white/5 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                suppressHydrationWarning
              >
                <Filter className="w-4 h-4" />
                <span>{showFilters ? "Hide" : "Show"} Filters</span>
              </motion.button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Search candidates (e.g. "Python developer" or "React NYC")'
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                suppressHydrationWarning
              />
              <motion.button
                onClick={handleSearch}
                disabled={loading}
                className="rounded-full bg-[var(--accent)] text-black font-bold px-8 py-3.5 inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg hover:shadow-[0_0_30px_rgba(198,243,107,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                suppressHydrationWarning
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Inline Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className="mt-6 pt-6 border-t border-white/10"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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

                    {/* Pipeline Status Filter */}
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 font-semibold flex items-center gap-2 uppercase tracking-wider">
                        <TrendingUp className="w-3.5 h-3.5 text-[var(--accent)]" />
                        Pipeline Status
                      </label>
                      <select
                        value={filters.pipelineStatus}
                        onChange={(e) => updateFilter("pipelineStatus", e.target.value)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-white"
                        suppressHydrationWarning
                      >
                        <option value="">All Statuses</option>
                        <option value="Applied">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Hired">Hired</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => {
                        setFilters(initialFilters);
                        fetchAll();
                      }}
                      className="rounded-xl border border-white/20 hover:border-[var(--accent)] px-6 py-2.5 text-sm font-semibold hover:bg-white/5 transition-all inline-flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      suppressHydrationWarning
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </motion.button>
                    <motion.button
                      onClick={handleFilter}
                      className="rounded-xl bg-[var(--accent)] text-black px-6 py-2.5 text-sm font-bold hover:scale-105 transition-transform inline-flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      suppressHydrationWarning
                    >
                      <Filter className="w-4 h-4" />
                      Apply Filters
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <motion.div 
                className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-white font-semibold mb-1">Unable to load candidates</p>
                    <p className="text-xs text-gray-400">{error}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Make sure your database is running and properly configured. Try uploading a resume to create your first candidate.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Results Table */}
          <div className="glass-card rounded-3xl p-8 min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--accent)]" />
                  Candidate Results
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {loading ? "Loading..." : `Showing ${candidates.length} candidate${candidates.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            {/* Empty State */}
            {candidates.length === 0 && !loading && (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">No candidates found</h3>
                <p className="text-gray-400 mb-6">
                  Upload resumes or adjust your search criteria to find candidates.
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

            {/* Table */}
            {candidates.length > 0 && !loading && (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-[280px]">
                        Candidate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-[300px]">
                        Skills
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-[140px]">
                        Experience
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-[220px]">
                        Location
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider w-[140px]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c, idx) => {
                      const skills = (c.skills || "")
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const displaySkills = skills.slice(0, 3);
                      const remainingCount = skills.length - 3;
                      
                      return (
                        <motion.tr
                          key={c.id || c.email || idx}
                          className="border-b border-white/5 hover:bg-white/5 transition"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <td className="px-6 py-4 w-[280px]">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 border border-[var(--accent)]/30 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-[var(--accent)]">
                                  {(c.name || "U")[0].toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-white flex items-center gap-2">
                                  <span className="truncate max-w-[160px]" title={c.name || "Unnamed"}>
                                    {c.name || "Unnamed"}
                                  </span>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" />
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate max-w-[160px]" title={c.email || "No email"}>
                                    {c.email || "No email"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 w-[300px]">
                            <div className="flex flex-wrap gap-1.5">
                              {displaySkills.length === 0 && (
                                <span className="text-xs text-gray-500">No skills</span>
                              )}
                              {displaySkills.map((skill) => (
                                <span
                                  key={skill}
                                  className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/10 text-white text-[11px] border border-white/20 font-medium whitespace-nowrap"
                                  title={skill}
                                >
                                  {skill}
                                </span>
                              ))}
                              {remainingCount > 0 && (
                                <span 
                                  className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/5 text-gray-400 text-[11px] border border-white/10 font-medium whitespace-nowrap"
                                  title={`${remainingCount} more skill${remainingCount > 1 ? 's' : ''}`}
                                >
                                  +{remainingCount}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap w-[140px]">
                            <div className="flex items-center gap-1.5 text-gray-300">
                              <Briefcase className="w-3.5 h-3.5 text-[var(--accent)]" />
                              <span>{c.experienceYears ?? "0"} yrs</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap w-[220px]">
                            <div className="flex items-center gap-1.5 text-gray-300">
                              <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                              <span className="truncate max-w-[160px]" title={c.location || "Unknown"}>
                                {c.location || "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap w-[140px]">
                            <Link
                              href={`/candidate/${c.id ?? ""}`}
                              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold hover:bg-[var(--accent)] hover:text-black hover:border-[var(--accent)] transition-all"
                            >
                              View Profile
                            </Link>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.section>
      </div>

      {/* Floating AI Assistant Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-30"
        onHoverStart={() => setAiButtonExpanded(true)}
        onHoverEnd={() => setAiButtonExpanded(false)}
      >
        <Link
          href="/ai-assistant"
          onClick={() => setAiButtonExpanded(!aiButtonExpanded)}
          className="flex items-center gap-3 rounded-full bg-[var(--accent)] text-black font-bold shadow-2xl hover:shadow-[0_0_40px_rgba(198,243,107,0.4)] transition-all overflow-hidden group"
        >
          <motion.div
            className="flex items-center gap-3 px-5 py-4"
            animate={{ width: aiButtonExpanded ? "auto" : "56px" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Sparkles className="w-5 h-5 flex-shrink-0 group-hover:rotate-12 transition-transform" />
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ 
                opacity: aiButtonExpanded ? 1 : 0,
                width: aiButtonExpanded ? "auto" : 0
              }}
              transition={{ duration: 0.3 }}
              className="whitespace-nowrap"
            >
              AI Recruiter Assistant
            </motion.span>
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtitle, color }) {
  const colorClasses = {
    accent: "from-[var(--accent)]/20 to-[var(--accent)]/5 border-[var(--accent)]/30",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30"
  };

  const iconColorClasses = {
    accent: "text-[var(--accent)]",
    blue: "text-blue-400",
    purple: "text-purple-400"
  };

  return (
    <motion.div 
      className="glass-card rounded-3xl p-6 hover:scale-105 transition-transform"
      variants={fadeIn}
      whileHover={{ y: -4 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} border flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />
        </div>
      </div>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-white">{value}</span>
        <span className="text-xs text-gray-400">{subtitle}</span>
      </div>
    </motion.div>
  );
}

