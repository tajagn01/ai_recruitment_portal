"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload as UploadIcon, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  X,
  Sparkles,
  User,
  Mail,
  Briefcase,
  GraduationCap,
  MapPin,
  Code,
  Loader2
} from "lucide-react";

const accept = [".pdf", ".docx"];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function UploadResumePage() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [resultErrors, setResultErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [dedupeResults, setDedupeResults] = useState([]);

  const acceptedLabel = useMemo(() => accept.join(", ").toUpperCase(), []);

  const onPick = (picked) => {
    setError("");
    setSuccessMessage("");
    if (!picked || picked.length === 0) return;
    const nextFiles = [];
    for (const f of picked) {
      const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
      if (!accept.includes(ext)) {
        setError("Only PDF or DOCX files are supported.");
        return;
      }
      nextFiles.push(f);
    }
    setFiles(nextFiles);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const upload = async () => {
    setError("");
    setSuccessMessage("");
    if (files.length === 0) {
      setError("Please select one or more resume files first.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");

      const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
      const errors = Array.isArray(data?.errors) ? data.errors : [];
      const dedupe = Array.isArray(data?.dedupeResults) ? data.dedupeResults : [];
      setResults(candidates);
      setResultErrors(errors);
      setDedupeResults(dedupe);
      if (candidates.length > 0) {
        setSuccessMessage(`Successfully uploaded ${candidates.length} resume${candidates.length > 1 ? "s" : ""}!`);
      }
      setFiles([]);
      if (candidates.length === 1 && candidates[0]?.id) {
        setTimeout(() => {
          router.push(`/candidate/${candidates[0].id}`);
        }, 1500);
      }
    } catch (e) {
      setError(e?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="flex flex-col gap-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 w-fit">
          <UploadIcon className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">Resume Upload</span>
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-black">Upload Candidate Resume</h1>
          <p className="mt-2 text-base text-gray-400">
            Drag and drop PDF or DOCX files. Our AI will parse and create candidate profiles automatically.
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Main Upload Section */}
        <motion.section 
          className="glass-card rounded-3xl p-8"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Drop Zone */}
          <div
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 p-12 ${
              dragOver 
                ? "border-[var(--accent)] bg-[var(--accent)]/10" 
                : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10"
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
            <div className="flex flex-col items-center text-center gap-4">
              <motion.div 
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 border border-[var(--accent)]/30 flex items-center justify-center"
                animate={{ y: dragOver ? -5 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <UploadIcon className="w-8 h-8 text-[var(--accent)]" />
              </motion.div>
              <div>
                <p className="text-xl font-bold mb-1">Drag & drop resume files here</p>
                <p className="text-sm text-gray-400">or click to browse from your computer</p>
                <p className="text-xs text-gray-500 mt-2">Supported formats: {acceptedLabel}</p>
              </div>
              <label className="mt-2 cursor-pointer rounded-full bg-white/10 border-2 border-white/20 hover:border-[var(--accent)] hover:bg-white/15 px-6 py-3 font-semibold transition-all inline-flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Choose Files</span>
                <input
                  type="file"
                  className="hidden"
                  accept={accept.join(",")}
                  multiple
                  onChange={(e) => onPick(Array.from(e.target.files || []))}
                />
              </label>
            </div>
          </div>

          {/* Selected Files */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div 
                className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-300">Selected Files ({files.length})</p>
                  <button
                    onClick={() => setFiles([])}
                    className="text-xs text-gray-400 hover:text-white transition"
                  >
                    Clear all
                  </button>
                </div>
                <ul className="space-y-2">
                  {files.map((f, idx) => (
                    <motion.li 
                      key={`${f.name}-${idx}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--accent)]/30 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-[var(--accent)] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{f.name}</p>
                          <p className="text-xs text-gray-500">{Math.round(f.size / 1024)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        className="ml-2 p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <motion.button
              onClick={upload}
              disabled={loading || files.length === 0}
              className="flex-1 rounded-full bg-[var(--accent)] text-black font-bold text-base px-8 py-4 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg hover:shadow-[0_0_30px_rgba(198,243,107,0.3)]"
              whileHover={{ scale: loading || files.length === 0 ? 1 : 1.05 }}
              whileTap={{ scale: loading || files.length === 0 ? 1 : 0.95 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <UploadIcon className="w-5 h-5" />
                  <span>Upload & Parse Resume</span>
                </>
              )}
            </motion.button>
            <button
              onClick={() => {
                setFiles([]);
                setError("");
                setResults([]);
                setResultErrors([]);
                setSuccessMessage("");
                setDedupeResults([]);
              }}
              className="rounded-full border-2 border-white/20 text-white hover:border-white/40 transition-all px-6 py-4 font-semibold hover:bg-white/5"
            >
              Reset
            </button>
          </div>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div 
                className="mt-4 rounded-xl bg-white/5 border border-white/20 px-4 py-3 flex items-start gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white">{error}</p>
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                className="mt-4 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 px-4 py-3 flex items-start gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CheckCircle2 className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--accent)] font-semibold">{successMessage}</p>
              </motion.div>
            )}

            {resultErrors.length > 0 && (
              <motion.div 
                className="mt-4 rounded-xl border border-white/20 bg-white/5 p-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Failed Files</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  {resultErrors.map((e, idx) => (
                    <li key={`${e.name}-${idx}`} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{e.name}: {e.error}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Parsing Info */}
          <motion.aside 
            className="glass-card rounded-3xl p-6"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 border border-[var(--accent)]/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold">AI Parsing</h3>
                <p className="text-xs text-gray-400">Extracted fields</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: User, label: "Name" },
                { icon: Mail, label: "Email" },
                { icon: Code, label: "Skills" },
                { icon: Briefcase, label: "Experience" },
                { icon: GraduationCap, label: "Education" },
                { icon: MapPin, label: "Location" }
              ].map((field, idx) => (
                <motion.div 
                  key={field.label}
                  className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + idx * 0.05 }}
                >
                  <field.icon className="w-4 h-4 text-[var(--accent)] mb-2" />
                  <p className="text-xs text-gray-400">Field</p>
                  <p className="font-semibold text-white text-sm">{field.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="divider-line my-6" />

            <p className="text-xs text-gray-400 leading-relaxed">
              Our AI automatically extracts structured data from resumes and creates searchable candidate profiles in your database.
            </p>
          </motion.aside>

          {/* Parsed Results */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.aside 
                className="glass-card rounded-3xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-[var(--accent)]" />
                  <h3 className="text-lg font-bold">Parsed Candidates</h3>
                </div>
                <ul className="space-y-3">
                  {results.map((c, idx) => (
                    <motion.li 
                      key={`${c.id || c.email || "candidate"}-${idx}`}
                      className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4 hover:border-[var(--accent)]/30 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{c.name || "Unnamed"}</p>
                          <p className="text-xs text-gray-400 truncate mt-1">{c.email || "No email"}</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-[var(--accent)] flex-shrink-0" />
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
