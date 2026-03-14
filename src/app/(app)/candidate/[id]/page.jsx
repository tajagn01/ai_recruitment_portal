"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

const stages = ["Applied", "Shortlisted", "Interview", "Offer", "Hired"];

export default function CandidateProfilePage() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingStage, setSavingStage] = useState(false);

  const skills = useMemo(
    () => (candidate?.skills || "").split(",").map((s) => s.trim()).filter(Boolean),
    [candidate?.skills],
  );

  const stageIdx = useMemo(() => {
    const s = candidate?.pipelineStatus || "Applied";
    const idx = stages.indexOf(s);
    return idx === -1 ? 0 : idx;
  }, [candidate?.pipelineStatus]);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/candidates?id=${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Candidate not found");
      setCandidate(data);
    } catch (e) {
      setError(e?.message || "Failed to load candidate");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStage = async (nextStage) => {
    if (!candidate?.id) return;
    setSavingStage(true);
    setError("");
    try {
      const res = await fetch("/api/candidates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: candidate.id, pipelineStatus: nextStage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update stage");
      setCandidate(data);
    } catch (e) {
      setError(e?.message || "Failed to update stage");
    } finally {
      setSavingStage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="mono-label">CANDIDATE</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold">
            Curriculum Vitae (CV)
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Full profile view with pipeline controls and parsed resume fields.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/candidates"
            className="pill bg-white/10 border border-white/15 text-white hover:border-[var(--accent)] hover:scale-105 transition"
          >
            Back to Candidates
          </Link>
          <Link
            href="/ai-assistant"
            className="pill bg-[var(--accent)] text-black font-semibold hover:scale-105 transition"
          >
            AI Assistant
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        <section className="glass-card rounded-2xl p-5 min-h-[400px]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-400">Loading profile...</p>
            </div>
          )}
          {error && !loading && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-red-300 text-sm">{error}</p>
              <button
                onClick={load}
                className="mt-2 text-xs text-red-200 hover:text-red-100 underline"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && candidate && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.15em] text-gray-400 mb-1">DETAILS</p>
                  <p className="mt-1 text-lg font-semibold text-white">{candidate.name || "Unnamed"}</p>
                  <p className="text-sm text-gray-400 mt-1">{candidate.email || "Email unavailable"}</p>
                  {candidate.phone && (
                    <p className="text-xs text-gray-500 mt-1">{candidate.phone}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap sm:justify-end">
                  <span className="pill bg-white/10 text-white text-xs whitespace-nowrap">
                    {candidate.location || "Not specified"}
                  </span>
                  <span className="pill bg-white/10 text-white text-xs whitespace-nowrap">
                    {candidate.experienceYears ?? 0} yrs
                  </span>
                  <span className="pill bg-[var(--accent)] text-black text-xs font-semibold whitespace-nowrap">
                    {candidate.pipelineStatus || "Applied"}
                  </span>
                </div>
              </div>

              {/* Pipeline */}
              <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="mono-label">HIRING PIPELINE</p>
                    <p className="text-sm text-gray-300">Applied → Shortlisted → Interview → Offer → Hired</p>
                  </div>
                  {savingStage && <span className="text-xs text-gray-400">Updating...</span>}
                </div>

                <div className="mt-4 grid grid-cols-5 gap-2">
                  {stages.map((s, idx) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateStage(s)}
                      disabled={savingStage}
                      className={`rounded-xl px-2 py-2 text-[11px] border transition ${
                        idx <= stageIdx
                          ? "bg-[var(--accent)]/90 text-black border-[var(--accent)] font-semibold"
                          : "bg-white/5 border-white/10 text-gray-200 hover:bg-white/10"
                      }`}
                      title={`Move to ${s}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)]"
                    style={{ width: `${((stageIdx + 1) / stages.length) * 100}%` }}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateStage("Shortlisted")}
                    className="pill bg-white/10 border border-white/15 text-white hover:border-[var(--accent)] hover:scale-105 transition text-xs"
                    disabled={savingStage}
                  >
                    Shortlist Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStage("Interview")}
                    className="pill bg-white/10 border border-white/15 text-white hover:border-[var(--accent)] hover:scale-105 transition text-xs"
                    disabled={savingStage}
                  >
                    Move to Interview Stage
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStage("Applied")}
                    className="pill bg-white/3 border border-white/10 text-gray-200 hover:border-white/30 transition text-xs"
                    disabled={savingStage}
                  >
                    Reject Candidate
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mono-label mb-3">SKILLS</p>
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {skills.length === 0 ? (
                      <span className="text-xs text-gray-400">No skills listed</span>
                    ) : (
                      skills.map((s) => (
                        <span key={s} className="pill bg-white/8 text-white text-xs border border-white/10">
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mono-label mb-3">EDUCATION</p>
                  <p className="text-sm text-gray-200 min-h-[20px]">
                    {candidate.education || "Not specified"}
                  </p>
                </div>
              </div>

              {(candidate.summary || candidate.certifications || candidate.languages) && (
                <div className="grid md:grid-cols-2 gap-4">
                  {candidate.summary && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="mono-label mb-3">EXPERIENCE SUMMARY</p>
                      <p className="text-sm text-gray-200 whitespace-pre-wrap">
                        {candidate.summary}
                      </p>
                    </div>
                  )}
                  {(candidate.certifications || candidate.languages) && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="mono-label mb-3">ADDITIONAL INFO</p>
                      <div className="space-y-2">
                        {candidate.certifications && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Certifications</p>
                            <p className="text-sm text-gray-200">{candidate.certifications}</p>
                          </div>
                        )}
                        {candidate.languages && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Languages</p>
                            <p className="text-sm text-gray-200">{candidate.languages}</p>
                          </div>
                        )}
                        {candidate.salaryExpectation && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Salary Expectation</p>
                            <p className="text-sm text-gray-200">${candidate.salaryExpectation.toLocaleString()}</p>
                          </div>
                        )}
                        {candidate.availability && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Availability</p>
                            <p className="text-sm text-gray-200">{candidate.availability}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(candidate.linkedin || candidate.github || candidate.portfolio || candidate.website || candidate.twitter) && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mono-label mb-3">SOCIAL LINKS</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.linkedin && (
                      <a
                        href={candidate.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill bg-white/10 border border-white/15 text-white hover:border-[var(--accent)] transition text-xs"
                      >
                        LinkedIn
                      </a>
                    )}
                    {candidate.github && (
                      <a
                        href={candidate.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill bg-white/10 border border-white/15 text-white hover:border-[var(--accent)] transition text-xs"
                      >
                        GitHub
                      </a>
                    )}
                    {candidate.portfolio && (
                      <a
                        href={candidate.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill bg-white/10 border border-white/15 text-white hover:border-[var(--accent)] transition text-xs"
                      >
                        Portfolio
                      </a>
                    )}
                    {candidate.website && (
                      <a
                        href={candidate.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill bg-white/10 border border-white/15 text-white hover:border-[var(--accent)] transition text-xs"
                      >
                        Website
                      </a>
                    )}
                    {candidate.twitter && (
                      <a
                        href={candidate.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill bg-white/10 border border-white/15 text-white hover:border-[var(--accent)] transition text-xs"
                      >
                        Twitter
                      </a>
                    )}
                  </div>
                </div>
              )}

              {(candidate.candidateScore || candidate.rating) && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mono-label mb-3">SCORES & RATINGS</p>
                  <div className="flex gap-4">
                    {candidate.candidateScore !== undefined && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Candidate Score</p>
                        <p className="text-lg font-semibold text-white">{candidate.candidateScore}/100</p>
                      </div>
                    )}
                    {candidate.rating && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Rating</p>
                        <p className="text-lg font-semibold text-white">
                          {candidate.rating}/5 ⭐
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="glass-card rounded-2xl p-5 space-y-4 hover-tilt min-h-[400px]">
          <div>
            <p className="mono-label">RESUME PREVIEW</p>
            <p className="text-sm text-gray-300">Extracted text snapshot</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4 max-h-[600px] overflow-auto">
            {loading ? (
              <p className="text-xs text-gray-400">Loading resume...</p>
            ) : candidate?.resumeText ? (
              <pre className="whitespace-pre-wrap text-xs text-gray-200 leading-relaxed font-mono">
                {candidate.resumeText}
              </pre>
            ) : (
              <div className="text-center py-8">
                <p className="text-xs text-gray-400 mb-2">No resume text available yet.</p>
                <p className="text-xs text-gray-500">Upload a resume to see the parsed content here.</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400">
            This preview is based on parsed text. In production you can render PDF pages or a stored file viewer.
          </p>
        </aside>
      </div>
    </div>
  );
}

