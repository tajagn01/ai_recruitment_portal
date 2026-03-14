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
          <p className="mono-label">Candidate</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold">
            {candidate?.name || (loading ? "Loading..." : "Candidate profile")}
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
        <section className="glass-card rounded-2xl p-5">
          {loading && <p className="text-gray-400">Loading profile...</p>}
          {error && !loading && <p className="text-red-300 text-sm">{error}</p>}

          {!loading && candidate && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.15em] text-gray-400">Details</p>
                  <p className="mt-1 text-lg font-semibold text-white truncate">{candidate.name || "Unnamed"}</p>
                  <p className="text-sm text-gray-400 truncate">{candidate.email || "Email unavailable"}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="pill bg-white/10 text-white text-xs">{candidate.location || "Location unknown"}</span>
                  <span className="pill bg-white/10 text-white text-xs">{candidate.experienceYears ?? "-"} yrs</span>
                  <span className="pill bg-[var(--accent)] text-black text-xs">
                    {candidate.pipelineStatus || "Applied"}
                  </span>
                </div>
              </div>

              {/* Pipeline */}
              <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="mono-label">Hiring pipeline</p>
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
                  <p className="mono-label mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.length === 0 && <span className="text-xs text-gray-400">No skills listed</span>}
                    {skills.slice(0, 12).map((s) => (
                      <span key={s} className="pill bg-white/8 text-white text-xs border border-white/10">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mono-label mb-2">Education</p>
                  <p className="text-sm text-gray-200">{candidate.education || "Not specified"}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mono-label mb-2">Experience summary</p>
                <p className="text-sm text-gray-200">{candidate.summary || "No summary available."}</p>
              </div>
            </div>
          )}
        </section>

        <aside className="glass-card rounded-2xl p-5 space-y-4 hover-tilt">
          <div>
            <p className="mono-label">Resume preview</p>
            <p className="text-sm text-gray-300">Extracted text snapshot</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4 max-h-[520px] overflow-auto">
            <p className="text-xs text-gray-400 mb-2">Resume text</p>
            <pre className="whitespace-pre-wrap text-xs text-gray-200 leading-relaxed">
              {candidate?.resumeText || "No resume text available yet."}
            </pre>
          </div>
          <p className="text-xs text-gray-400">
            This preview is based on parsed text. In production you can render PDF pages or a stored file viewer.
          </p>
        </aside>
      </div>
    </div>
  );
}

