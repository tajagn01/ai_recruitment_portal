"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const stages = ["Applied", "Shortlisted", "Interview", "Offer", "Hired"];

function toAbsoluteUrl(url) {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// Section headers that appear in caps in resumes
const SECTION_HEADERS = /^(EXPERIENCE|EDUCATION|SKILLS|TECHNICAL SKILLS|PROJECTS|SUMMARY|OBJECTIVE|CERTIFICATIONS|LANGUAGES|AWARDS|PUBLICATIONS|REFERENCES|CONTACT|OPEN SOURCE|CONTRIBUTIONS?|ACHIEVEMENTS?|WORK EXPERIENCE|PROFESSIONAL SUMMARY|PROFILE|ABOUT|LINKS|ACTIVITIES|VOLUNTEER|INTERESTS?|COURSES?|TRAINING)/i;

function isUrl(str) {
  return /https?:\/\/\S+|www\.\S+|linkedin\.com\S*|github\.com\S*|codecrafter\S*/.test(str);
}

function isContactLine(str) {
  return /\S+@\S+\.\S+|^\+?\d[\d\s\-().]{6,}|\d{10}/.test(str) || isUrl(str);
}

function linkify(text) {
  const urlRe = /(https?:\/\/[^\s]+|www\.[^\s]+|linkedin\.com\/[^\s]+|github\.com\/[^\s]+)/g;
  const parts = text.split(urlRe);
  return parts.map((part, i) =>
    urlRe.test(part) ? (
      <a
        key={i}
        href={part.startsWith("http") ? part : `https://${part}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-(--accent) underline underline-offset-2 break-all hover:opacity-80 transition"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}

function ResumeDocument({ text }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // First non-empty line is usually the candidate name
  const nameLineIdx = lines.findIndex((l) => l.length > 2 && l.length < 60 && !isContactLine(l));
  const nameLine = nameLineIdx !== -1 ? lines[nameLineIdx] : null;

  const parsed = [];
  let currentSection = null;
  let currentBody = [];

  const flushSection = () => {
    if (currentSection !== null || currentBody.length > 0) {
      parsed.push({ section: currentSection, body: [...currentBody] });
      currentBody = [];
      currentSection = null;
    }
  };

  lines.forEach((line, i) => {
    if (i === nameLineIdx) return; // skip — rendered separately

    if (SECTION_HEADERS.test(line) && line.length < 60) {
      flushSection();
      currentSection = line;
    } else {
      currentBody.push(line);
    }
  });
  flushSection();

  const normalizeSection = (section) => {
    if (!section) return "CONTACT";
    const s = section.toUpperCase();
    if (s.includes("SUMMARY") || s.includes("OBJECTIVE") || s.includes("PROFILE") || s.includes("ABOUT")) {
      return "SUMMARY";
    }
    if (s.includes("EXPERIENCE") || s.includes("WORK")) return "EXPERIENCE";
    if (s.includes("EDUCATION")) return "EDUCATION";
    if (s.includes("SKILL")) return "SKILLS";
    if (s.includes("PROJECT")) return "PROJECTS";
    if (s.includes("CERT")) return "CERTIFICATIONS";
    if (s.includes("LINK") || s.includes("CONTACT") || s.includes("SOCIAL")) return "CONTACT";
    return "OTHER";
  };

  const sectionMap = parsed.reduce((acc, block) => {
    const key = normalizeSection(block.section);
    const body = block.body.map((line) => line.trim()).filter(Boolean);
    if (!acc[key]) acc[key] = [];
    acc[key].push(...body);
    return acc;
  }, {});

  const looksLikeSkillList = (line) => {
    if (!line) return false;
    const items = line.split(",").map((s) => s.trim()).filter(Boolean);
    if (items.length < 3) return false;
    return items.every((item) => item.length <= 24);
  };

  if ((!sectionMap.SKILLS || sectionMap.SKILLS.length === 0) && sectionMap.OTHER?.length) {
    const skillLines = sectionMap.OTHER.filter(looksLikeSkillList);
    if (skillLines.length) {
      sectionMap.SKILLS = [...(sectionMap.SKILLS || []), ...skillLines];
      sectionMap.OTHER = sectionMap.OTHER.filter((line) => !skillLines.includes(line));
    }
  }

  const orderedSections = [
    { key: "SUMMARY", label: "Summary" },
    { key: "EXPERIENCE", label: "Experience" },
    { key: "EDUCATION", label: "Education" },
    { key: "SKILLS", label: "Skills" },
    { key: "PROJECTS", label: "Projects" },
    { key: "CERTIFICATIONS", label: "Certifications" },
    { key: "OTHER", label: "Additional" },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 max-h-170 overflow-auto">
      <div className="sticky top-0 z-10 bg-black border-b border-white/10 px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.45)]">
        <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">Resume Preview</p>
        <p className="text-base font-semibold text-white tracking-wide mt-1">
          {nameLine || "Candidate"}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400">
          {(sectionMap.CONTACT || []).slice(0, 4).map((line, idx) => (
            <span key={idx} className="break-all min-w-0">
              {linkify(line)}
            </span>
          ))}
          {(sectionMap.CONTACT || []).length === 0 && <span>Contact not specified</span>}
        </div>
      </div>

      <div className="px-5 py-4 text-sm space-y-6">
        {orderedSections.map((section) => {
          const body = (sectionMap[section.key] || []).slice(0, 6);
          return (
            <div key={section.key} className="pb-4 border-b border-white/5 last:border-b-0">
              <div className="flex items-center gap-3 mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-(--accent)">
                  {section.label}
                </p>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="space-y-1.5">
                {body.length === 0 ? (
                  <p className="text-xs text-gray-500">Not specified</p>
                ) : (
                  body.map((line, li) => {
                    const isBullet = /^[-•*▪]/.test(line);
                    const cleanLine = isBullet ? line.replace(/^[-•*▪]\s*/, "") : line;
                    return (
                      <div key={li} className={`flex gap-2 ${isBullet ? "items-start" : "items-baseline"}`}>
                        {isBullet && (
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-white/40 shrink-0" />
                        )}
                        <p className={`leading-relaxed wrap-break-word ${isBullet ? "text-gray-300 text-xs" : "text-gray-200 text-xs"}`}>
                          {linkify(cleanLine)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CandidateProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingStage, setSavingStage] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const deleteCandidate = async () => {
    if (!confirm(`Delete "${candidate?.name || "this candidate"}" and their resume? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/candidates?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/candidates");
    } catch {
      setError("Failed to delete candidate. Please try again.");
      setDeleting(false);
    }
  };

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
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold wrap-break-word">
            {candidate?.name || "Candidate Profile"}
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Full profile view with pipeline controls and parsed resume fields.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/candidates"
            className="pill bg-white/10 border border-white/15 text-white hover:border-(--accent) hover:scale-105 transition"
          >
            Back to Candidates
          </Link>
          <Link
            href="/ai-assistant"
            className="pill bg-(--accent) text-black font-semibold hover:scale-105 transition"
          >
            AI Assistant
          </Link>
          <button
            type="button"
            onClick={deleteCandidate}
            disabled={deleting || loading}
            className="pill bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition disabled:opacity-40 inline-flex items-center gap-1.5"
          >
            {deleting ? (
              <><span className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />Deleting…</>
            ) : (
              <>🗑 Delete</>
            )}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        <section className="glass-card rounded-2xl p-5 min-h-100">
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
                  <p className="mt-1 text-lg font-semibold text-white wrap-break-word">{candidate.name || "Unnamed"}</p>
                  <p className="text-sm text-gray-400 mt-1 break-all">{candidate.email || "Email unavailable"}</p>
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
                  <span className="pill bg-(--accent) text-black text-xs font-semibold whitespace-nowrap">
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
                          ? "bg-(--accent)/90 text-black border-(--accent) font-semibold"
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
                    className="h-full bg-(--accent)"
                    style={{ width: `${((stageIdx + 1) / stages.length) * 100}%` }}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateStage("Shortlisted")}
                    className="pill bg-white/10 border border-white/15 text-white hover:border-(--accent) hover:scale-105 transition text-xs"
                    disabled={savingStage}
                  >
                    Shortlist Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStage("Interview")}
                    className="pill bg-white/10 border border-white/15 text-white hover:border-(--accent) hover:scale-105 transition text-xs"
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
                  <div className="flex flex-wrap gap-2 min-h-10">
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
                  <p className="text-sm text-gray-200 min-h-5 wrap-break-word">
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
                        href={toAbsoluteUrl(candidate.linkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill bg-white/10 border border-white/15 text-white hover:border-(--accent) transition text-xs"
                      >
                        LinkedIn
                      </a>
                    )}
                    {candidate.github && (
                      <a
                        href={toAbsoluteUrl(candidate.github)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill bg-white/10 border border-white/15 text-white hover:border-(--accent) transition text-xs"
                      >
                        GitHub
                      </a>
                    )}
                    {candidate.portfolio && (
                      <a
                        href={toAbsoluteUrl(candidate.portfolio)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill bg-white/10 border border-white/15 text-white hover:border-(--accent) transition text-xs"
                      >
                        Portfolio
                      </a>
                    )}
                    {candidate.website && (
                      <a
                        href={toAbsoluteUrl(candidate.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill bg-white/10 border border-white/15 text-white hover:border-(--accent) transition text-xs"
                      >
                        Website
                      </a>
                    )}
                    {candidate.twitter && (
                      <a
                        href={toAbsoluteUrl(candidate.twitter)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill bg-white/10 border border-white/15 text-white hover:border-(--accent) transition text-xs"
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

        <aside className="glass-card rounded-2xl p-5 space-y-4 min-h-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="mono-label">RESUME PREVIEW</p>
              <p className="text-sm text-gray-300">Structured document view</p>
            </div>
            <div className="flex items-center gap-2">
              {candidate?.resumeFileUrl && (
                <a
                  href={candidate.resumeFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill bg-(--accent) text-black text-[11px] font-semibold hover:scale-105 transition"
                >
                  Open PDF ↗
                </a>
              )}
              {candidate?.resumeText && (
                <span className="pill bg-(--accent)/15 text-(--accent) text-[11px] border border-(--accent)/30">
                  Parsed
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/3 p-6 text-center">
              <p className="text-xs text-gray-400">Loading resume...</p>
            </div>
          ) : candidate?.resumeText ? (
            <ResumeDocument text={candidate.resumeText} />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/3 p-8 text-center">
              <div className="w-10 h-10 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center mx-auto mb-3">
                <span className="text-sm">📄</span>
              </div>
              <p className="text-sm text-gray-400 mb-1">No resume uploaded yet</p>
              <p className="text-xs text-gray-500">Upload a resume to see the structured view here.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

