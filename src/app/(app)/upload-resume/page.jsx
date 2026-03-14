"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const accept = [".pdf", ".docx"];

export default function UploadResumePage() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [resultErrors, setResultErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const acceptedLabel = useMemo(() => accept.join(", ").toUpperCase(), []);

  const onPick = (picked) => {
    setError("");
    setSuccessMessage("");
    if (!picked || picked.length === 0) return;
    const nextFiles = [];
    for (const f of picked) {
      const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
      if (!accept.includes(ext)) {
        setError("Only PDF or DOCX is supported.");
        return;
      }
      nextFiles.push(f);
    }
    setFiles(nextFiles);
  };

  const upload = async () => {
    setError("");
    setSuccessMessage("");
    if (files.length === 0) {
      setError("Select one or more resume files first.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      // Your backend endpoint currently exists at /api/upload (not /api/upload-resume).
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");

      const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
      const errors = Array.isArray(data?.errors) ? data.errors : [];
      setResults(candidates);
      setResultErrors(errors);
      if (candidates.length > 0) {
        setSuccessMessage(`Uploaded ${candidates.length} file${candidates.length > 1 ? "s" : ""} successfully.`);
      }
      setFiles([]);
      if (candidates.length === 1 && candidates[0]?.id) {
        router.push(`/candidate/${candidates[0].id}`);
      }
    } catch (e) {
      setError(e?.message || "Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="mono-label">Upload</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold">Upload Candidate Resume</h1>
          <p className="mt-1 text-sm text-gray-400">
            Drag and drop a PDF/DOCX. We parse the resume and create a candidate profile automatically.
          </p>
        </div>
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
              const picked = Array.from(e.dataTransfer.files || []);
              if (picked.length > 0) onPick(picked);
            }}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl border border-white/15 bg-white/5 flex items-center justify-center">
                <span className="text-sm">⬆</span>
              </div>
              <div>
                <p className="text-lg font-semibold">Drag & drop a resume</p>
                <p className="text-sm text-gray-400">Supported formats: {acceptedLabel}</p>
              </div>
              <label className="mt-2 inline-flex cursor-pointer pill bg-white/10 border border-white/15 text-white hover:border-[var(--accent)] hover:scale-105 transition">
                Choose files
                <input
                  type="file"
                  className="hidden"
                  accept={accept.join(",")}
                  multiple
                  onChange={(e) => onPick(Array.from(e.target.files || []))}
                />
              </label>
              {files.length > 0 && (
                <div className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                  <p className="text-xs text-gray-400">Selected files</p>
                  <ul className="mt-2 space-y-1 text-sm text-white">
                    {files.map((f) => (
                      <li key={f.name} className="flex items-center justify-between">
                        <span className="truncate">{f.name}</span>
                        <span className="text-xs text-gray-400">{Math.round(f.size / 1024)} KB</span>
                      </li>
                    ))}
                  </ul>
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
                setFiles([]);
                setError("");
                setResults([]);
                setResultErrors([]);
                setSuccessMessage("");
              }}
              className="pill border border-white/10 text-white hover:border-white/30 transition"
            >
              Reset
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          {successMessage && (
            <p className="mt-3 text-sm text-[var(--accent)]">{successMessage}</p>
          )}
          {resultErrors.length > 0 && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-gray-400">Failed files</p>
              <ul className="mt-2 space-y-1 text-sm text-red-300">
                {resultErrors.map((e, idx) => (
                  <li key={`${e.name}-${idx}`}>{e.name}: {e.error}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <aside className="glass-card rounded-2xl p-5 space-y-4 hover-tilt">
          <div>
            <p className="mono-label">AI parsing</p>
            <p className="text-sm text-gray-300">Extracted candidate fields</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Name", "Email", "Skills", "Experience", "Education", "Location"].map((x) => (
              <div key={x} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-gray-400">Field</p>
                <p className="font-semibold text-white">{x}</p>
              </div>
            ))}
          </div>
          {results.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-gray-400">Parsed candidates</p>
              <ul className="mt-2 space-y-2 text-sm text-white">
                {results.map((c, idx) => (
                  <li key={`${c.id || c.email || "candidate"}-${idx}`} className="flex items-center justify-between">
                    <span className="truncate">{c.name || "Unnamed"}</span>
                    <span className="text-xs text-gray-400">{c.email || "No email"}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-gray-400">
            After parsing, we store the profile in your candidate database and show results below.
          </p>
        </aside>
      </div>
    </div>
  );
}

