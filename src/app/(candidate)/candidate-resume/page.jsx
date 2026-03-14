"use client";

import { useMemo, useState } from "react";

const accept = [".pdf", ".docx"];

export default function CandidateResumePage() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const acceptedLabel = useMemo(() => accept.join(", ").toUpperCase(), []);

  const onPick = (f) => {
    setError("");
    setSuccess("");
    if (!f) return;
    const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
    if (!accept.includes(ext)) {
      setError("Only PDF or DOCX is supported.");
      return;
    }
    setFile(f);
  };

  const upload = async () => {
    setError("");
    setSuccess("");
    if (!file) {
      setError("Select a resume file first.");
      return;
    }
    setLoading(true);
    try {
      // Placeholder: wire to /api/upload-resume or candidate-specific endpoint later.
      await new Promise((r) => setTimeout(r, 800));
      setSuccess("Resume uploaded and queued for parsing.");
    } catch (e) {
      setError("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mono-label">Resume</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-semibold">Upload your resume</h1>
        <p className="mt-1 text-sm text-gray-400">
          We parse your resume to auto-fill skills, experience, and profile details.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        <section className="glass-card rounded-2xl p-5">
          <div
            className={`rounded-3xl border border-white/10 bg-white/3 p-6 sm:p-8 transition ${
              dragOver ? "border-[var(--accent)] bg-[var(--accent)]/10" : ""
            }`}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) onPick(f);
            }}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl border border-white/15 bg-white/5 flex items-center justify-center">
                <span className="text-sm">⬆</span>
              </div>
              <div>
                <p className="text-lg font-semibold">Drag & drop your resume</p>
                <p className="text-sm text-gray-400">Supported formats: {acceptedLabel}</p>
              </div>
              <label className="mt-2 inline-flex cursor-pointer pill bg-white/10 border border-white/15 text-white hover:border-[var(--accent)] hover:scale-105 transition">
                Choose file
                <input
                  type="file"
                  className="hidden"
                  accept={accept.join(",")}
                  onChange={(e) => onPick(e.target.files?.[0] || null)}
                />
              </label>
              {file && (
                <div className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                  <p className="text-xs text-gray-400">Selected file</p>
                  <p className="font-semibold text-white">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{Math.round(file.size / 1024)} KB</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={upload}
              disabled={loading}
              className="pill bg-[var(--accent)] text-black font-semibold hover:scale-105 transition disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Upload Resume"}
            </button>
            <button
              onClick={() => {
                setFile(null);
                setError("");
                setSuccess("");
              }}
              className="pill border border-white/10 text-white hover:border-white/30 transition"
            >
              Reset
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          {success && <p className="mt-3 text-sm text-[var(--accent)]">{success}</p>}
        </section>

        <aside className="glass-card rounded-2xl p-5 space-y-4 hover-tilt">
          <div>
            <p className="mono-label">How parsing works</p>
            <p className="text-sm text-gray-300">We extract clean structured fields</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Name", "Email", "Skills", "Experience", "Education", "Location"].map((x) => (
              <div key={x} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-gray-400">Field</p>
                <p className="font-semibold text-white">{x}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            Your resume is stored securely. You can replace it anytime; we keep your profile synced.
          </p>
        </aside>
      </div>
    </div>
  );
}

