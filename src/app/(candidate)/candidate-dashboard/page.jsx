"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const stages = ["Applied", "Interview Scheduled", "Offer", "Hired"];

export default function CandidateDashboardPage() {
  const [stageIdx, setStageIdx] = useState(0);
  const [applications] = useState([
    { id: "a1", role: "Frontend Engineer", company: "Northwind", stage: "Applied" },
    { id: "a2", role: "Data Engineer", company: "Alder Labs", stage: "Interview Scheduled" },
  ]);

  const stage = useMemo(() => stages[stageIdx] || "Applied", [stageIdx]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="mono-label">Dashboard</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold">Your candidate portal</h1>
          <p className="mt-1 text-sm text-gray-400">
            Track application status, manage your resume, and keep your profile sharp.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/candidate-resume"
            className="pill bg-[var(--accent)] text-black font-semibold hover:scale-105 transition"
          >
            Upload Resume
          </Link>
          <Link
            href="/applications"
            className="pill bg-white/10 border border-white/20 text-white hover:border-[var(--accent)] hover:scale-105 transition"
          >
            View Applications
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <section className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="mono-label">Application status</p>
              <p className="text-sm text-gray-300">Current stage</p>
            </div>
            <span className="pill bg-white/8 text-white text-xs">Live</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
            <p className="text-xs text-gray-400">Stage</p>
            <p className="mt-1 text-2xl font-semibold">{stage}</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {stages.map((s, idx) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStageIdx(idx)}
                  className={`rounded-xl px-2 py-2 text-[11px] border transition ${
                    idx === stageIdx
                      ? "bg-[var(--accent)] text-black border-[var(--accent)] font-semibold"
                      : "bg-white/5 border-white/10 text-gray-200 hover:bg-white/10"
                  }`}
                >
                  {s.split(" ")[0]}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Demo control: in production this updates from your applications.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 hover-tilt">
              <p className="mono-label">Recent applications</p>
              <p className="mt-2 text-2xl font-semibold">{applications.length}</p>
              <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 hover-tilt">
              <p className="mono-label">Profile completeness</p>
              <p className="mt-2 text-2xl font-semibold">86%</p>
              <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[86%] bg-[var(--accent)]" />
              </div>
            </div>
          </div>
        </section>

        <aside className="glass-card rounded-2xl p-5 space-y-4">
          <div>
            <p className="mono-label">Resume preview</p>
            <p className="text-sm text-gray-300">Latest uploaded resume</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">File</p>
                <p className="font-semibold">resume.pdf</p>
              </div>
              <span className="pill bg-white/10 text-white text-xs">Parsed</span>
            </div>
            <div className="divider-line my-4" />
            <p className="text-xs text-gray-400 mb-2">Highlights</p>
            <div className="flex flex-wrap gap-2">
              {["React", "Node", "TypeScript", "APIs"].map((s) => (
                <span key={s} className="pill bg-white/8 text-white text-[11px] border border-white/10">
                  {s}
                </span>
              ))}
            </div>
            <Link
              href="/candidate-resume"
              className="mt-4 inline-flex items-center justify-center w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10 transition"
            >
              Replace resume
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

