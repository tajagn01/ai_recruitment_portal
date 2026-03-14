"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Tell me what you need. Example: “Find Python developers with 3 years experience in NYC.”",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, candidates]);

  const stats = useMemo(() => {
    const count = candidates.length;
    const topSkills = new Map();
    for (const c of candidates) {
      for (const s of (c.skills || "").split(",").map((x) => x.trim()).filter(Boolean)) {
        topSkills.set(s, (topSkills.get(s) || 0) + 1);
      }
    }
    const skills = [...topSkills.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([s]) => s);
    return { count, skills };
  }, [candidates]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input.trim() };
    setMessages((m) => [...m, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage.content }),
      });
      const data = await res.json();
      if (data.candidates) setCandidates(data.candidates);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply || "Here are the matches I found." },
      ]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: "I hit an issue fetching results." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="mono-label">AI Assistant</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold">Natural language candidate search</h1>
          <p className="mt-1 text-sm text-gray-400">
            Describe intent. We convert it into a database query and return candidate matches.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard"
            className="pill bg-white/10 border border-white/15 text-white hover:border-[var(--accent)] hover:scale-105 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
        <section className="glass-card rounded-2xl p-5 flex flex-col min-h-[70vh]">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div>
              <p className="mono-label">Chat</p>
              <p className="text-sm text-gray-300">Prompt the recruiter assistant.</p>
            </div>
            {loading && <span className="text-xs text-gray-400">Thinking...</span>}
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`rounded-xl p-3 border border-white/10 ${
                  m.role === "assistant" ? "bg-white/5" : "bg-[var(--accent)] text-black"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.08em] mb-1">{m.role}</p>
                <p className="text-sm leading-relaxed">{m.content}</p>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={sendMessage} className="mt-4 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Ask: "Find Python developers with 3 years experience"'
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
              />
              <button
                type="submit"
                className="pill bg-[var(--accent)] text-black font-semibold hover:scale-105 transition whitespace-nowrap disabled:opacity-60"
                disabled={loading}
              >
                Send
              </button>
            </div>
          </form>
        </section>

        <section className="glass-card rounded-2xl p-5 space-y-4 min-h-[70vh]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="mono-label">Candidate Results</p>
              <p className="text-sm text-gray-300">
                {stats.count === 0 ? "No matches yet" : `${stats.count} matches`}
              </p>
            </div>
            <span className="pill bg-white/8 text-white text-xs">AI matched</span>
          </div>

          {stats.skills.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
              <p className="text-xs text-gray-400 mb-2">Top skills in results</p>
              <div className="flex flex-wrap gap-2">
                {stats.skills.map((s) => (
                  <span key={s} className="pill bg-white/8 text-white text-[11px] border border-white/10">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {candidates.length === 0 && (
            <p className="text-gray-400 text-sm">Ask the assistant to search. Results will appear here.</p>
          )}

          {candidates.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/3">
              <table className="w-full text-sm text-left">
                <thead className="uppercase text-[11px] tracking-[0.15em] text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Skills</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3 text-right">Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c, idx) => {
                    const skills = (c.skills || "")
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .slice(0, 3);
                    return (
                      <tr key={c.id || c.email || idx} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">{c.name || "Unnamed"}</div>
                          <div className="text-xs text-gray-400">{c.email || "Email unavailable"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {skills.length === 0 && <span className="text-xs text-gray-400">No skills listed</span>}
                            {skills.map((skill) => (
                              <span key={skill} className="pill bg-white/8 text-white text-[11px] border border-white/10">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-200">{c.experienceYears ?? "-"} yrs</td>
                        <td className="px-4 py-3 text-gray-200">{c.location || "Location unknown"}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/candidate/${c.id}`}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-white/20 text-white hover:border-[var(--accent)] hover:scale-105 transition text-xs bg-white/5"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

