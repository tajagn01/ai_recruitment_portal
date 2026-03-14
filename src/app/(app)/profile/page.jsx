"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Building2, 
  CheckCircle2,
  LogOut,
  Save
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function HrProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "Recruiter",
    email: "recruiter@vectorhire.ai",
    company: "VectorHire",
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
      await new Promise((r) => setTimeout(r, 800));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    router.push("/");
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
            <User className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">Profile Settings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">Account Settings</h1>
          <p className="mt-2 text-base text-gray-400">Manage your account details and security preferences</p>
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
        {/* Main Form Section */}
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
            {/* Name and Email */}
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

            {/* Company */}
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <motion.button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[var(--accent)] text-black font-bold text-base px-8 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg hover:shadow-[0_0_30px_rgba(198,243,107,0.3)]"
                whileHover={{ scale: saving ? 1 : 1.05 }}
                whileTap={{ scale: saving ? 1 : 0.95 }}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </motion.button>
              
              {saved && (
                <motion.div 
                  className="flex items-center gap-2 text-[var(--accent)]"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Changes saved!</span>
                </motion.div>
              )}
            </div>
          </form>
        </motion.section>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Info Card */}
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
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
