import Link from "next/link";

const features = [
  {
    title: "Resume Parsing",
    desc: "Magic UI extraction maps every skill, entity, and experience to structured data in seconds.",
  },
  {
    title: "AI Candidate Search",
    desc: "Semantic search across profiles, resumes, and interview notes. Find intent, not keywords.",
  },
  {
    title: "Candidate Database",
    desc: "A living graph of talent with versioned profiles, enrichment, and smart clustering.",
  },
  {
    title: "Duplicate Detection",
    desc: "Aceternity-grade matching collapses duplicates and merges history automatically.",
  },
  {
    title: "Hiring Pipeline",
    desc: "Adaptive kanban with automations, SLA alerts, and stage-level analytics.",
  },
];

const workflow = [
  "Resume Upload",
  "AI Parsing",
  "Candidate Database",
  "Smart Search",
  "Hiring Pipeline",
];

const pipeline = [
  { stage: "Applied", vibe: "glass-card" },
  { stage: "Shortlisted", vibe: "neon-border" },
  { stage: "Interview", vibe: "glass-card" },
  { stage: "Offer", vibe: "neon-border" },
  { stage: "Hired", vibe: "glass-card" },
];

const testimonials = [
  {
    name: "Maya Chen",
    role: "Head of Talent, Northwind",
    quote: "We replaced three tools and cut time-to-shortlist by 63%. The search feels psychic.",
  },
  {
    name: "Jonas Patel",
    role: "Founder, Alder Labs",
    quote: "Parsing is instant, dedupe is flawless, and the pipeline board looks gorgeous on a big screen.",
  },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0b0b0f] via-[#0f0f12] to-black text-white">
      <div className="magic-grid" aria-hidden />
      <div className="aceternity-spotlight" style={{ top: 120, left: 120 }} aria-hidden />
      <div className="aceternity-spotlight" style={{ bottom: -40, right: 80 }} aria-hidden />

      <header className="relative z-10 max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl neon-border flex items-center justify-center font-black text-lg">V</div>
          <div>
            <p className="mono-label">VectorHire AI</p>
            <p className="text-sm text-gray-300">Precision recruiting, accelerated</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="#features" className="hidden sm:inline text-sm text-gray-300 hover:text-white transition">Product</a>
          <a href="#demo" className="hidden sm:inline text-sm text-gray-300 hover:text-white transition">Demo</a>
          <Link
            href="/login"
            className="hidden sm:inline pill border border-white/15 text-sm text-white hover:border-[var(--accent)] hover:scale-105 transition"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="pill bg-[var(--accent)] text-black hover:scale-105 transition font-semibold"
          >
            Sign Up
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pb-24 space-y-24">
        {/* Hero */}
        <section className="pt-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-3 py-2 neon-border rounded-full text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Aceternity Motion · Magic UI Effects
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
              AI-powered hiring that feels <span className="text-[var(--accent)]">telepathic</span>.
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl">
              Parse resumes, collapse duplicates, search semantically, and move candidates through a live, animated pipeline. No blue gradients. Just a bold, monochrome control surface built for elite teams.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="pill bg-[var(--accent)] text-black hover:scale-105 transition font-semibold shadow-lg">
                Get Started Free
              </Link>
              <a
                href="#features"
                className="pill border border-white/10 text-white hover:border-white/30 hover:scale-105 transition"
              >
                Explore Features
              </a>
              <Link
                href="/login"
                className="pill bg-white/10 border border-white/15 text-white hover:border-[var(--accent)] hover:scale-105 transition"
              >
                Login
              </Link>
            </div>
            <div className="divider-line" />
            <div className="flex flex-wrap gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--accent)]" /> SOC2-ready data rooms</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--accent)]" /> Semantic + vector search</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--accent)]" /> Pipeline automations</div>
            </div>
          </div>

          <div className="relative glass-card rounded-3xl p-6 overflow-hidden glow-outline hover-tilt">
            <div className="absolute inset-0 magic-grid opacity-60" aria-hidden />
            <div className="flex items-center justify-between mb-4">
              <span className="mono-label">Interactive product demo</span>
              <span className="pill bg-white/10 text-white">Live</span>
            </div>
            <div className="space-y-3 text-sm text-gray-200">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-xs text-gray-400">Resume Upload</p>
                  <p className="font-semibold">elena-rojas.pdf</p>
                </div>
                <span className="pill bg-[var(--accent)] text-black">Parsing</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/3 border border-white/10">
                <p className="text-xs text-gray-400 mb-1">AI Summary</p>
                <p className="font-semibold">Staff Data Engineer · Graph search · Vertex AI · Kubernetes · 7 yrs</p>
                <div className="shimmer-line h-px mt-3" />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {["Applied", "Interview", "Offer"].map((label) => (
                  <div key={label} className="rounded-2xl bg-white/5 border border-white/10 py-3">
                    <p className="text-xs text-gray-400">Stage</p>
                    <p className="font-semibold">{label}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-xs text-gray-400">Vector search</p>
                <p className="font-semibold">"Senior ML engineer fintech risk" → 12 matches in 180ms</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="mono-label">Capabilities</p>
              <h2 className="text-3xl font-bold">Everything hiring needs, reimagined.</h2>
            </div>
            <div className="pill bg-white/10 text-white">Built for recruiting ops</div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item) => (
              <article key={item.title} className="glass-card rounded-2xl p-5 hover-tilt">
                <p className="mono-label mb-2">Magic UI</p>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Workflow */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mono-label">Workflow</p>
              <h2 className="text-3xl font-bold">How the hiring flow runs end-to-end.</h2>
            </div>
            <div className="pill border border-white/10 text-white">Automated</div>
          </div>
          <div className="glass-card rounded-3xl p-6">
            <div className="grid sm:grid-cols-5 gap-4">
              {workflow.map((step, idx) => (
                <div key={step} className="relative p-4 rounded-2xl bg-white/3 border border-white/8 text-center">
                  <p className="mono-label mb-2">0{idx + 1}</p>
                  <p className="font-semibold">{step}</p>
                  {idx < workflow.length - 1 && (
                    <span className="absolute right-[-10px] top-1/2 -translate-y-1/2 text-[var(--accent)]">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pipeline showcase */}
        <section className="space-y-6" id="demo">
          <div className="flex items-center justify-between">
            <div>
              <p className="mono-label">Pipeline</p>
              <h2 className="text-3xl font-bold">Visual hiring pipeline with motion cues.</h2>
            </div>
            <div className="pill bg-white/10 text-white">Realtime</div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {pipeline.map((item) => (
              <div key={item.stage} className={`rounded-2xl p-4 text-center hover-tilt ${item.vibe}`}>
                <p className="mono-label mb-2">Stage</p>
                <p className="text-xl font-semibold">{item.stage}</p>
                <p className="text-gray-400 text-sm mt-2">Automations, SLA timers, nudges</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="mono-label">Proof</p>
              <h2 className="text-3xl font-bold">Teams shipping faster with VectorHire.</h2>
            </div>
            <div className="pill border border-white/10 text-white">Customer voices</div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <article key={t.name} className="glass-card rounded-2xl p-6 hover-tilt">
                <p className="text-lg font-semibold mb-2">“{t.quote}”</p>
                <p className="text-sm text-gray-400">{t.name} · {t.role}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Pricing / CTA */}
        <section id="pricing" className="glass-card rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="mono-label">Get started</p>
            <h3 className="text-3xl font-bold">From pilot to full rollout in days.</h3>
            <p className="text-gray-300 mt-2">Unlimited resume parsing in pilot · SOC2-ready · Dedicated onboarding.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="#" className="pill bg-[var(--accent)] text-black font-semibold hover:scale-105 transition">Start Hiring Smarter</a>
            <a href="mailto:hello@vectorhire.ai" className="pill border border-white/10 text-white hover:border-white/30 transition">Talk to us</a>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 mt-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between gap-4 text-sm text-gray-400">
          <div>
            <p className="mono-label">VectorHire AI</p>
            <p>Futuristic recruiting for teams who care about craft.</p>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-white">Product</a>
            <a href="#demo" className="hover:text-white">Documentation</a>
            <a href="mailto:hello@vectorhire.ai" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
