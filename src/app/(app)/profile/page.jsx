"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HrProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "Recruiter",
    email: "recruiter@vectorhire.ai",
    company: "VectorHire",
    password: "",
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
      // Placeholder: wire to account settings endpoint.
      await new Promise((r) => setTimeout(r, 650));
      setSaved(true);
      setForm((p) => ({ ...p, password: "" }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="mono-label">Profile</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold">Account settings</h1>
          <p className="mt-1 text-sm text-gray-400">Manage recruiter account details and security.</p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="pill bg-white/10 border border-white/15 text-white hover:border-[var(--accent)] hover:scale-105 transition"
        >
          Logout
        </button>
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

            <div className="space-y-2">
              <label className="text-sm text-gray-200">Company</label>
              <input
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-200">Change password</label>
              <input
                value={form.password}
                type="password"
                onChange={(e) => update("password", e.target.value)}
                placeholder="New password"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
              />
              <p className="text-xs text-gray-400">
                Demo UI only. Wire this to your authentication provider later.
              </p>
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
            <p className="mono-label">Security</p>
            <p className="text-sm text-gray-300">Best-practice controls</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Sessions</p>
                <p className="font-semibold text-white">1 active</p>
              </div>
              <span className="pill bg-white/10 text-white text-xs">OK</span>
            </div>
            <div className="divider-line" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">2FA</p>
                <p className="font-semibold text-white">Not enabled</p>
              </div>
              <span className="pill bg-white/3 text-gray-200 text-xs">Optional</span>
            </div>
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10 transition"
          >
            Logout
          </button>
        </aside>
      </div>
    </div>
  );
}

