"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Building2,
  CheckCircle2,
  LogOut,
  Save,
  Key,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  AlertCircle,
  Loader2,
  Play,
  Square,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function StatusBadge({ status }) {
  if (!status) return null;
  const map = {
    success: { color: "text-green-400 bg-green-400/10 border-green-400/30", label: "Last sync succeeded" },
    error:   { color: "text-red-400 bg-red-400/10 border-red-400/30",   label: "Last sync failed"    },
    running: { color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30", label: "Sync running…"  },
  };
  const { color, label } = map[status] ?? {};
  if (!color) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${color}`}>
      {status === "running" && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === "success" && <CheckCircle2 className="w-3 h-3" />}
      {status === "error"   && <AlertCircle className="w-3 h-3" />}
      {label}
    </span>
  );
}

export default function HrProfilePage() {
  const router = useRouter();

  // ── Profile form ──────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: "Recruiter",
    email: "recruiter@vectorhire.ai",
    company: "VectorHire",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (k, v) => { setSaved(false); setForm((p) => ({ ...p, [k]: v })); };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  // ── Gmail integration ──────────────────────────────────────────────────────
  const [gmailForm, setGmailForm] = useState({
    gmailClientId: "",
    gmailClientSecret: "",
    gmailRefreshToken: "",
  });
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailSaving, setGmailSaving] = useState(false);
  const [gmailError, setGmailError] = useState("");
  const [gmailSaved, setGmailSaved] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [lastSyncMessage, setLastSyncMessage] = useState("");

  // ── Background worker ──────────────────────────────────────────────────────
  const [workerRunning, setWorkerRunning] = useState(false);
  const [workerLoading, setWorkerLoading] = useState(false);

  // Load current settings on mount
  useEffect(() => {
    async function load() {
      try {
        const [settingsRes, workerRes] = await Promise.all([
          fetch("/api/email-settings"),
          fetch("/api/email-worker"),
        ]);
        const data = await settingsRes.json();
        if (data.settings) {
          setGmailForm({
            gmailClientId: data.settings.gmailClientId,
            gmailClientSecret: data.settings.gmailClientSecret,
            gmailRefreshToken: data.settings.gmailRefreshToken,
          });
          setGmailConnected(data.connected);
          setSyncStatus(data.settings.lastSyncStatus);
          setLastSyncAt(data.settings.lastSyncAt);
          setLastSyncMessage(data.settings.lastSyncMessage || "");
        }
        const workerData = await workerRes.json();
        setWorkerRunning(workerData.running);
      } catch { /* silent */ }
    }
    load();
  }, []);

  // Poll sync status while running
  useEffect(() => {
    if (syncStatus !== "running") return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch("/api/email-sync");
        const data = await res.json();
        if (data.lastSyncStatus && data.lastSyncStatus !== "running") {
          setSyncStatus(data.lastSyncStatus);
          setLastSyncAt(data.lastSyncAt);
          setLastSyncMessage(data.lastSyncMessage || "");
          setSyncing(false);
          clearInterval(timer);
        }
      } catch { /* silent */ }
    }, 3000);
    return () => clearInterval(timer);
  }, [syncStatus]);

  const updateGmail = (k, v) => {
    setGmailError("");
    setGmailForm((p) => ({ ...p, [k]: v }));
  };

  const onGmailSave = async (e) => {
    e.preventDefault();
    setGmailError("");
    setGmailSaving(true);
    try {
      const res = await fetch("/api/email-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gmailForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");
      setGmailConnected(true);
      setGmailSaved(true);
      setTimeout(() => setGmailSaved(false), 3000);
    } catch (err) {
      setGmailError(err.message);
    } finally {
      setGmailSaving(false);
    }
  };

  const onDisconnect = async () => {
    if (!confirm("Disconnect Gmail integration?")) return;
    await fetch("/api/email-settings", { method: "DELETE" });
    setGmailConnected(false);
    setGmailForm({ gmailClientId: "", gmailClientSecret: "", gmailRefreshToken: "" });
    setSyncStatus(null);
  };

  const onSync = async () => {
    setSyncing(true);
    setSyncStatus("running");
    setGmailError("");
    try {
      const res = await fetch("/api/email-sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setGmailError(data.error);
        setSyncing(false);
        setSyncStatus("error");
      }
    } catch (err) {
      setGmailError(err.message);
      setSyncing(false);
      setSyncStatus("error");
    }
  };

  const onStartWorker = async () => {
    setWorkerLoading(true);
    try {
      const res = await fetch("/api/email-worker", { method: "POST" });
      const data = await res.json();
      if (res.ok) setWorkerRunning(true);
      else setGmailError(data.error || "Failed to start worker");
    } catch (err) {
      setGmailError(err.message);
    } finally {
      setWorkerLoading(false);
    }
  };

  const onStopWorker = async () => {
    setWorkerLoading(true);
    try {
      await fetch("/api/email-worker", { method: "DELETE" });
      setWorkerRunning(false);
    } catch (err) {
      setGmailError(err.message);
    } finally {
      setWorkerLoading(false);
    }
  };

  const handleLogout = () => router.push("/");

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
            <User className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">Profile Settings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">Account Settings</h1>
          <p className="mt-2 text-base text-gray-400">Manage your account details and email integration</p>
        </div>
        <motion.button
          onClick={handleLogout}
          className="rounded-full border-2 border-white/20 text-white hover:border-white/40 transition-all px-6 py-3 inline-flex items-center justify-center gap-2 font-semibold hover:bg-white/5"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </motion.button>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Left column */}
        <div className="space-y-8">
          {/* ── Personal Information ─────────────────────────────────────── */}
          <motion.section
            className="glass-card rounded-3xl p-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 border border-[var(--accent)]/30 flex items-center justify-center">
                <User className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Personal Information</h2>
                <p className="text-sm text-gray-400">Update your account details</p>
              </div>
            </div>

            <form onSubmit={onSave} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <User className="w-4 h-4 text-[var(--accent)]" />
                    Full Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[var(--accent)]" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                    placeholder="your.email@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[var(--accent)]" />
                  Company Name
                </label>
                <input
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  placeholder="Your company"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <motion.button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[var(--accent)] text-black font-bold text-base px-8 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg hover:shadow-[0_0_30px_rgba(198,243,107,0.3)]"
                  whileHover={{ scale: saving ? 1 : 1.05 }}
                  whileTap={{ scale: saving ? 1 : 0.95 }}
                >
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /><span>Saving…</span></>
                  ) : (
                    <><Save className="w-5 h-5" /><span>Save Changes</span></>
                  )}
                </motion.button>
                {saved && (
                  <motion.div
                    className="flex items-center gap-2 text-[var(--accent)]"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Changes saved!</span>
                  </motion.div>
                )}
              </div>
            </form>
          </motion.section>

          {/* ── Gmail Integration ────────────────────────────────────────── */}
          <motion.section
            className="glass-card rounded-3xl p-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    Gmail Integration
                    {gmailConnected
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/30"><Wifi className="w-3 h-3" />Connected</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-400/10 text-gray-400 border border-gray-400/30"><WifiOff className="w-3 h-3" />Not connected</span>
                    }
                  </h2>
                  <p className="text-sm text-gray-400">Connect your Gmail inbox to auto-import resumes</p>
                </div>
              </div>
            </div>

            {/* Help text */}
            <div className="mb-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm text-blue-300 space-y-1">
              <p className="font-semibold text-blue-200">How to get these credentials</p>
              <ol className="list-decimal list-inside space-y-0.5 text-blue-300/80">
                <li>Open <span className="font-mono text-blue-200">Google Cloud Console</span> → APIs &amp; Services → Credentials</li>
                <li>Create an OAuth 2.0 Client ID (Desktop or Web app)</li>
                <li>Enable the <span className="font-mono text-blue-200">Gmail API</span></li>
                <li>Use OAuth Playground to generate a Refresh Token with <span className="font-mono text-blue-200">gmail.readonly</span> scope</li>
              </ol>
            </div>

            <form onSubmit={onGmailSave} className="space-y-5">
              {/* Client ID */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-400" />
                  Gmail Client ID
                </label>
                <input
                  value={gmailForm.gmailClientId}
                  onChange={(e) => updateGmail("gmailClientId", e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm font-mono focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
                  placeholder="1234567890-abc.apps.googleusercontent.com"
                  spellCheck={false}
                />
              </div>

              {/* Client Secret */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-400" />
                  Gmail Client Secret
                </label>
                <input
                  type="password"
                  value={gmailForm.gmailClientSecret}
                  onChange={(e) => updateGmail("gmailClientSecret", e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm font-mono focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
                  placeholder="GOCSPX-…"
                  spellCheck={false}
                  autoComplete="new-password"
                />
              </div>

              {/* Refresh Token */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-400" />
                  Gmail Refresh Token
                </label>
                <input
                  type="password"
                  value={gmailForm.gmailRefreshToken}
                  onChange={(e) => updateGmail("gmailRefreshToken", e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm font-mono focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
                  placeholder="1//0g…"
                  spellCheck={false}
                  autoComplete="new-password"
                />
              </div>

              {/* Error */}
              {gmailError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{gmailError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* Save credentials */}
                <motion.button
                  type="submit"
                  disabled={gmailSaving}
                  className="rounded-full bg-blue-500 text-white font-bold text-sm px-6 py-3 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2 hover:bg-blue-400 transition-colors shadow-lg"
                  whileHover={{ scale: gmailSaving ? 1 : 1.03 }}
                  whileTap={{ scale: gmailSaving ? 1 : 0.97 }}
                >
                  {gmailSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving…</span></>
                  ) : (
                    <><Save className="w-4 h-4" /><span>{gmailConnected ? "Update Credentials" : "Connect Gmail"}</span></>
                  )}
                </motion.button>

                {/* Sync now */}
                {gmailConnected && (
                  <motion.button
                    type="button"
                    onClick={onSync}
                    disabled={syncing || syncStatus === "running"}
                    className="rounded-full border-2 border-blue-500/40 text-blue-300 font-bold text-sm px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 hover:border-blue-400 hover:text-blue-200 transition-colors"
                    whileHover={{ scale: syncing ? 1 : 1.03 }}
                    whileTap={{ scale: syncing ? 1 : 0.97 }}
                  >
                    <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                    <span>{syncing ? "Syncing…" : "Sync Now"}</span>
                  </motion.button>
                )}

                {/* Background worker */}
                {gmailConnected && (
                  workerRunning ? (
                    <motion.button
                      type="button"
                      onClick={onStopWorker}
                      disabled={workerLoading}
                      className="rounded-full border-2 border-red-500/40 text-red-300 font-bold text-sm px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 hover:border-red-400 hover:text-red-200 transition-colors"
                      whileHover={{ scale: workerLoading ? 1 : 1.03 }}
                      whileTap={{ scale: workerLoading ? 1 : 0.97 }}
                    >
                      {workerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4 fill-current" />}
                      <span>{workerLoading ? "Stopping…" : "Stop Worker"}</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={onStartWorker}
                      disabled={workerLoading}
                      className="rounded-full border-2 border-green-500/40 text-green-300 font-bold text-sm px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 hover:border-green-400 hover:text-green-200 transition-colors"
                      whileHover={{ scale: workerLoading ? 1 : 1.03 }}
                      whileTap={{ scale: workerLoading ? 1 : 0.97 }}
                    >
                      {workerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                      <span>{workerLoading ? "Starting…" : "Start Worker"}</span>
                    </motion.button>
                  )
                )}

                {/* Disconnect */}
                {gmailConnected && (
                  <button
                    type="button"
                    onClick={onDisconnect}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors font-semibold underline underline-offset-4"
                  >
                    Disconnect
                  </button>
                )}

                {/* Saved confirmation */}
                {gmailSaved && (
                  <motion.span
                    className="flex items-center gap-1.5 text-sm text-green-400 font-semibold"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Gmail connected!
                  </motion.span>
                )}
              </div>
            </form>

            {/* Sync status footer */}
            {gmailConnected && (syncStatus || lastSyncAt) && (
              <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                <StatusBadge status={syncStatus} />
                {lastSyncAt && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Last sync: {new Date(lastSyncAt).toLocaleString()}
                  </span>
                )}
                {lastSyncMessage && syncStatus === "error" && (
                  <span className="w-full text-xs text-red-400/80 font-mono truncate">{lastSyncMessage}</span>
                )}
              </div>
            )}
          </motion.section>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <motion.aside
            className="glass-card rounded-3xl p-6"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Account Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">Account Type</span>
                <span className="font-semibold text-white">HR / Recruiter</span>
              </div>
              <div className="divider-line" />
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">Member Since</span>
                <span className="font-semibold text-white">Jan 2024</span>
              </div>
              <div className="divider-line" />
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">Plan</span>
                <span className="pill bg-[var(--accent)]/20 text-[var(--accent)] text-xs border border-[var(--accent)]/30 font-semibold">
                  Professional
                </span>
              </div>
              <div className="divider-line" />
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">Gmail</span>
                {gmailConnected
                  ? <span className="font-semibold text-green-400 flex items-center gap-1"><Wifi className="w-3.5 h-3.5" />Connected</span>
                  : <span className="font-semibold text-gray-500 flex items-center gap-1"><WifiOff className="w-3.5 h-3.5" />Not set up</span>
                }
              </div>
              <div className="divider-line" />
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">Worker</span>
                {workerRunning
                  ? <span className="font-semibold text-green-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />Running</span>
                  : <span className="font-semibold text-gray-500">Stopped</span>
                }
              </div>
            </div>
          </motion.aside>

          {/* Quick instructions */}
          <motion.aside
            className="glass-card rounded-3xl p-6"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Email Auto-Import</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <p>Once Gmail is connected, the system automatically:</p>
              <ul className="space-y-2 list-none">
                {[
                  "Scans unread emails with PDF/DOCX attachments",
                  "Extracts candidate info using AI",
                  "Stores candidates in the database",
                  "Marks processed emails as read",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="pt-2 text-xs text-gray-500">
                Use <span className="font-mono text-gray-300">Sync Now</span> for manual import, or run the worker in watch mode for continuous polling.
              </p>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
