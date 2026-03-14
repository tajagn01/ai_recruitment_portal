"use client";

import { useState } from "react";

export default function CandidateProfilePage() {
  const [form, setForm] = useState({
    name: "Candidate",
    email: "candidate@vectorhire.ai",
    skills: "React, TypeScript, APIs",
    experience: "2",
    resume: "resume.pdf",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (k, v) => {
    setSaved(false);
    setForm((p) => ({ ...p, [k]: v }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Placeholder: wire to profile update endpoint.
      await new Promise((r) => setTimeout(r, 650));
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mono-label">Profile</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-semibold">Candidate profile</h1>
        <p className="mt-1 text-sm text-gray-400">Keep your details and resume aligned for applications.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <section className="glass-card rounded-2xl p-5">
          <form onSubmit={onSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-200">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-200">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-200">Skills</label>
                <input
                  value={form.skills}
                  onChange={(e) => update("skills", e.target.value)}
                  placeholder="Comma-separated"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-200">Years of Experience</label>
                <input
                  value={form.experience}
                  onChange={(e) => update("experience", e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-200">Resume</label>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400">Current</p>
                  <p className="font-semibold text-white">{form.resume}</p>
                </div>
                <a
                  href="/candidate-resume"
                  className="pill bg-white/10 border border-white/15 text-white hover:border-[var(--accent)] hover:scale-105 transition text-xs"
                >
                  Replace
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="pill bg-[var(--accent)] text-black font-semibold hover:scale-105 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              {saved && <span className="text-sm text-[var(--accent)]">Saved</span>}
            </div>
          </form>
        </section>

        <aside className="glass-card rounded-2xl p-5 space-y-4 hover-tilt">
          <div>
            <p className="mono-label">Preview</p>
            <p className="text-sm text-gray-300">How recruiters will see you</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
            <p className="text-xs text-gray-400">Candidate</p>
            <p className="text-xl font-semibold">{form.name || "—"}</p>
            <p className="text-sm text-gray-400 mt-1">{form.email || "—"}</p>
            <div className="divider-line my-4" />
            <p className="text-xs text-gray-400 mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {(form.skills || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(0, 6)
                .map((s) => (
                  <span key={s} className="pill bg-white/8 text-white text-[11px] border border-white/10">
                    {s}
                  </span>
                ))}
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Keep your skills concise and aligned to the roles you’re targeting.
          </p>
        </aside>
      </div>
    </div>
  );
}

