"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2,
  TrendingUp,
  Users,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Render a plain-text markdown string into JSX.
// Handles: **bold**, → arrows, bullet lines (• / -), blank lines, italic _text_
function renderMessage(text) {
  if (!text) return null;
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-2" />;

    // Parse inline: **bold** and _italic_
    const parseInline = (str) => {
      const parts = [];
      const re = /\*\*(.+?)\*\*|_(.+?)_/g;
      let last = 0, m;
      while ((m = re.exec(str)) !== null) {
        if (m.index > last) parts.push(str.slice(last, m.index));
        if (m[1] !== undefined) parts.push(<strong key={m.index} className="text-white font-semibold">{m[1]}</strong>);
        if (m[2] !== undefined) parts.push(<em key={m.index} className="text-gray-300 italic">{m[2]}</em>);
        last = re.lastIndex;
      }
      if (last < str.length) parts.push(str.slice(last));
      return parts;
    };

    // Bullet line
    if (/^[•\-\*]\s/.test(trimmed)) {
      return (
        <div key={i} className="flex gap-2 items-start">
          <span className="text-[var(--accent)] mt-0.5 shrink-0">•</span>
          <span>{parseInline(trimmed.replace(/^[•\-\*]\s/, ""))}</span>
        </div>
      );
    }

    // Arrow line (→ candidate entry)
    if (/^→/.test(trimmed)) {
      return (
        <div key={i} className="flex gap-2 items-start pl-1 py-0.5">
          <span className="text-[var(--accent)] shrink-0">→</span>
          <span>{parseInline(trimmed.replace(/^→\s*/, ""))}</span>
        </div>
      );
    }

    // Indented detail line (starts with spaces/tabs — skills under a candidate)
    if (/^\s{2,}/.test(line)) {
      return (
        <div key={i} className="pl-5 text-gray-400 text-xs">
          {parseInline(trimmed)}
        </div>
      );
    }

    return <div key={i}>{parseInline(trimmed)}</div>;
  });
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI recruiting assistant. Tell me what you're looking for. For example: \"Find Python developers with 3+ years experience in NYC\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const chatScrollRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch all candidates once for the stats panel
  useEffect(() => {
    fetch("/api/candidates")
      .then((r) => r.json())
      .then((data) => setCandidates(Array.isArray(data) ? data : data.candidates || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!chatScrollRef.current) return;
    chatScrollRef.current.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const stats = useMemo(() => {
    const count = candidates.length;
    const topSkills = new Map();
    for (const c of candidates) {
      for (const s of (c.skills || "").split(",").map((x) => x.trim()).filter(Boolean)) {
        topSkills.set(s, (topSkills.get(s) || 0) + 1);
      }
    }
    const skills = [...topSkills.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s]) => s);
    return { count, skills };
  }, [candidates]);

  const sendQuery = async (query) => {
    if (!query.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", content: query.trim(), candidates: [] }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      if (Array.isArray(data.candidates) && data.candidates.length > 0) {
        setCandidates(data.candidates);
      }
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply || "Here are the matching candidates I found for you." },
      ]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: "I encountered an issue while searching. Please try again." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuery(input);
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">AI Assistant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">Natural Language Search</h1>
          <p className="mt-2 text-base text-gray-400">
            Describe what you need in plain English. AI will find matching candidates instantly.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-full border-2 border-white/20 text-white hover:border-white/40 transition-all px-6 py-3 inline-flex items-center justify-center gap-2 font-semibold hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </motion.div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
        {/* Chat Section */}
        <motion.section 
          className="glass-card rounded-3xl p-8 flex flex-col"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ height: "calc(100vh - 280px)", minHeight: "600px" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 border border-[var(--accent)]/30 flex items-center justify-center">
              <Bot className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">AI Chat</h2>
              <p className="text-xs text-gray-400">Ask me anything about candidates</p>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-[var(--accent)]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-semibold">Thinking...</span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 mb-6">
            <AnimatePresence>
              {messages.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    m.role === "assistant" 
                      ? "bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 border border-[var(--accent)]/30" 
                      : "bg-white/10 border border-white/20"
                  }`}>
                    {m.role === "assistant" ? (
                      <Bot className="w-4 h-4 text-[var(--accent)]" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`flex-1 rounded-2xl p-4 ${
                    m.role === "assistant" 
                      ? "bg-gradient-to-br from-white/5 to-transparent border border-white/10" 
                      : "bg-[var(--accent)]/20 border border-[var(--accent)]/30"
                  }`}>
                    <p className={`text-xs uppercase tracking-wider mb-2 font-semibold ${
                      m.role === "assistant" ? "text-gray-400" : "text-[var(--accent)]"
                    }`}>
                      {m.role === "assistant" ? "AI Assistant" : "You"}
                    </p>
                    <div className="text-sm leading-relaxed text-white space-y-1">
                      {renderMessage(m.content)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3" suppressHydrationWarning>
            <div className="flex gap-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Ask: "Find senior React developers in San Francisco"'
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                disabled={loading}
                suppressHydrationWarning
              />
              <motion.button
                type="submit"
                className="rounded-full bg-[var(--accent)] text-black font-bold px-6 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg hover:shadow-[0_0_30px_rgba(198,243,107,0.3)]"
                disabled={loading || !input.trim()}
                whileHover={{ scale: loading || !input.trim() ? 1 : 1.05 }}
                whileTap={{ scale: loading || !input.trim() ? 1 : 0.95 }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            </div>
            <p className="text-xs text-gray-500">
              Try: "Python developers with ML experience" or "Frontend engineers in NYC"
            </p>
          </form>
        </motion.section>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Stats Card */}
          <motion.section 
            className="glass-card rounded-3xl p-6"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 border border-[var(--accent)]/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Search Results</h3>
                <p className="text-xs text-gray-400">
                  {stats.count === 0 ? "No matches yet" : `${stats.count} candidate${stats.count > 1 ? "s" : ""} found`}
                </p>
              </div>
            </div>

            {stats.count > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-[var(--accent)]" />
                    <p className="text-xs text-gray-400">Total Matches</p>
                  </div>
                  <p className="text-2xl font-black text-[var(--accent)]">{stats.count}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
                    <p className="text-xs text-gray-400">Top Skills</p>
                  </div>
                  <p className="text-2xl font-black text-white">{stats.skills.length}</p>
                </div>
              </div>
            )}

            {stats.skills.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4">
                <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">Top Skills in Results</p>
                <div className="flex flex-wrap gap-2">
                  {stats.skills.map((s, idx) => (
                    <motion.span 
                      key={s}
                      className="pill bg-[var(--accent)]/10 text-[var(--accent)] text-xs border border-[var(--accent)]/30 font-semibold"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      {s}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {candidates.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">
                  Ask the AI assistant to search for candidates.
                  <br />
                  Results will appear here.
                </p>
              </div>
            )}
          </motion.section>

          {/* Candidates List */}
          <AnimatePresence>
            {candidates.length > 0 && (
              <motion.section 
                className="glass-card rounded-3xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Matched Candidates</h3>
                <div className="space-y-3">
                  {candidates.map((c, idx) => {
                    const skills = (c.skills || "")
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .slice(0, 3);
                    return (
                      <motion.div
                        key={c.id || c.email || idx}
                        className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4 hover:border-[var(--accent)]/30 transition-all"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-white truncate">{c.name || "Unnamed"}</h4>
                              <CheckCircle2 className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
                            </div>
                            <p className="text-xs text-gray-400 truncate">{c.email || "No email"}</p>
                          </div>
                          <Link
                            href={`/candidate/${c.id}`}
                            className="rounded-full border border-white/20 hover:border-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-white/5 transition-all flex-shrink-0"
                          >
                            View Profile
                          </Link>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {skills.length === 0 && (
                            <span className="text-xs text-gray-500">No skills listed</span>
                          )}
                          {skills.map((skill) => (
                            <span key={skill} className="pill bg-white/10 text-white text-xs border border-white/20">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>{c.experienceYears ?? "-"} years exp</span>
                          <span>·</span>
                          <span>{c.location || "Location unknown"}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
