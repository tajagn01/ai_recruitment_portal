"use client";

import { useMemo, useState } from "react";

const pipeline = ["Applied", "Interview Scheduled", "Offer", "Hired"];

export default function ApplicationsPage() {
  const [items] = useState([
    { id: "a1", role: "Frontend Engineer", company: "Northwind", stage: "Applied", updatedAt: "Today" },
    { id: "a2", role: "Data Engineer", company: "Alder Labs", stage: "Interview Scheduled", updatedAt: "2d ago" },
    { id: "a3", role: "Full Stack Engineer", company: "Contoso", stage: "Offer", updatedAt: "1w ago" },
  ]);

  const stageIndex = (stage) => pipeline.indexOf(stage);

  const stats = useMemo(() => {
    const byStage = Object.fromEntries(pipeline.map((p) => [p, 0]));
    for (const it of items) byStage[it.stage] = (byStage[it.stage] ?? 0) + 1;
    return byStage;
  }, [items]);

  return (
    <div className="space-y-6">
      <div>
        <p className="mono-label">Applications</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-semibold">My applications</h1>
        <p className="mt-1 text-sm text-gray-400">Track your job pipeline status end-to-end.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {pipeline.map((s) => (
          <div key={s} className="glass-card rounded-2xl p-4 hover-tilt">
            <p className="mono-label">{s}</p>
            <p className="mt-2 text-2xl font-semibold">{stats[s] ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="mono-label">Status</p>
            <p className="text-sm text-gray-300">Latest updates</p>
          </div>
          <span className="pill bg-white/8 text-white text-xs">Pipeline</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/3">
          <table className="w-full text-sm text-left">
            <thead className="uppercase text-[11px] tracking-[0.15em] text-gray-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const idx = stageIndex(it.stage);
                return (
                  <tr key={it.id} className="border-b border-white/5 hover:bg-white/5 transition align-middle">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white">{it.role}</div>
                      <div className="text-xs text-gray-400">Application ID: {it.id}</div>
                    </td>
                    <td className="px-4 py-4 text-gray-200">{it.company}</td>
                    <td className="px-4 py-4">
                      <span className="pill bg-[var(--accent)] text-black text-xs">
                        {pipeline[Math.max(0, idx)]}
                      </span>
                      <div className="mt-2 h-1.5 w-40 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-[var(--accent)]"
                          style={{ width: `${((idx + 1) / pipeline.length) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-200">{it.updatedAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

