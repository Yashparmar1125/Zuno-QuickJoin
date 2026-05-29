import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, LogIn, Zap, Lock, Users, Smartphone, Mic,
  MessageSquare, Shield, Sparkles, ChevronDown, ChevronUp,
  Video, ArrowRight, Check, Star, Globe, Layers,
  BarChart2, Wifi, LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

/* ── Auth Modal ─────────────────────────────────────────────────────── */
function AuthModal({ mode, onClose, onSwitch }) {
  const { login, register, loginGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      onClose(); navigate("/dashboard");
    } catch (err) { setError(err?.message || "Something went wrong"); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    try { await loginGoogle(); onClose(); navigate("/dashboard"); }
    catch (err) { setError(err?.message || "Google sign-in failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zuno-charcoal/60 backdrop-blur-sm">
      <div className="w-full max-w-md card shadow-soft modal-enter overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-zuno-gray-100">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <img src="/logo dark.png" alt="Zuno" className="h-7 w-auto" />
              <span className="text-base font-black text-zuno-charcoal">Zuno</span>
            </div>
            <button className="btn-icon" onClick={onClose} aria-label="Close">
              <ChevronDown size={18} />
            </button>
          </div>
          <h2 className="text-xl font-bold text-zuno-charcoal mt-3">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-sm text-zuno-gray-500 mt-0.5">
            {isLogin ? "Sign in to your Zuno account" : "Join millions using Zuno QuickJoin™"}
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full btn-secondary gap-3 py-2.5 justify-center"
          >
            <span className="w-5 h-5 rounded-full bg-white border border-zuno-gray-200 flex items-center justify-center text-xs font-black text-zuno-charcoal shadow-xs">G</span>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zuno-gray-200" />
            <span className="text-xs text-zuno-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-zuno-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-zuno-gray-700 mb-1.5">Full name</label>
                <input className="input" type="text" required placeholder="Your name"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-zuno-gray-700 mb-1.5">Email</label>
              <input className="input" type="email" required placeholder="you@company.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zuno-gray-700">Password</label>
                {isLogin && <button type="button" className="text-xs text-zuno-blue hover:underline font-medium">Forgot?</button>}
              </div>
              <input className="input" type="password" required placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-zuno-red bg-zuno-red-light border border-red-200 rounded-lg px-3 py-2.5">
                <Shield size={13} /> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 justify-center mt-1">
              {loading ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs text-zuno-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={onSwitch} className="text-zuno-blue font-semibold hover:underline">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Feature cards data ─────────────────────────────────────────────── */
const FEATURES = [
  { icon: Zap, color: "bg-blue-500", title: "FrameBoost™", desc: "Adaptive 1080p with smart compression. Crystal-clear video even on weak connections." },
  { icon: Mic, color: "bg-teal-500", title: "EchoShield™", desc: "On-device AI noise suppression removes background noise in real time." },
  { icon: Lock, color: "bg-slate-700", title: "Zero Trust Edge", desc: "End-to-end encryption and enterprise-grade security on every call." },
  { icon: Users, color: "bg-violet-500", title: "Up to 100 people", desc: "Host large team calls with stable, low-latency peer-to-peer video." },
  { icon: Smartphone, color: "bg-orange-500", title: "Any device", desc: "Browser-native. Works on desktop, mobile, and tablet — no downloads." },
  { icon: MessageSquare, color: "bg-green-500", title: "Built-in chat", desc: "Live in-call messaging with toast notifications so you never miss a message." },
  { icon: Globe, color: "bg-cyan-500", title: "QuickJoin™ links", desc: "Share a link, join instantly. No account required for guests." },
  { icon: BarChart2, color: "bg-pink-500", title: "Meeting analytics", desc: "Post-call insights, feedback scores, and participant history." },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for individuals and small teams.",
    features: ["Up to 3 participants", "40-min meeting limit", "QuickJoin™ links", "In-call chat", "Basic analytics"],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per user / month",
    desc: "For growing teams that need more.",
    features: ["Up to 100 participants", "Unlimited duration", "Meeting recordings", "Custom meeting IDs", "Priority support", "Advanced analytics", "Screen sharing"],
    cta: "Start free trial",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact sales",
    desc: "For large organizations with custom needs.",
    features: ["Unlimited participants", "SSO & SAML", "Dedicated support", "SLA guarantee", "Custom integrations", "Admin dashboard", "Audit logs"],
    cta: "Contact sales",
    highlight: false,
  },
];

const TESTIMONIALS = [
  { name: "Sarah Chen", role: "Head of Engineering, Stripe", avatar: "SC", text: "Zuno replaced our entire video stack. The QuickJoin™ links are a game-changer — no more 'can you hear me?' moments.", rating: 5 },
  { name: "Marcus Webb", role: "CTO, Linear", avatar: "MW", text: "We evaluated every tool on the market. Zuno's reliability and the clean UI won us over immediately.", rating: 5 },
  { name: "Priya Nair", role: "VP Product, Notion", avatar: "PN", text: "The EchoShield™ noise cancellation is genuinely impressive. Our remote standups have never been clearer.", rating: 5 },
];

const FAQS = [
  { q: "Do I need to download anything?", a: "No. Zuno runs entirely in your browser. Just click a link and you're in." },
  { q: "How does QuickJoin™ work?", a: "Generate a meeting code or link, share it, and anyone can join instantly — no account required for guests." },
  { q: "Is my call encrypted?", a: "Yes. All calls use WebRTC's built-in DTLS-SRTP encryption. Your media never touches our servers." },
  { q: "How many people can join a meeting?", a: "Free plan supports up to 3 participants. Pro supports up to 100. Enterprise is unlimited." },
  { q: "What is Zuno EchoShield™?", a: "EchoShield™ is our AI-powered noise suppression that removes keyboard clicks, background noise, and echo in real time." },
  { q: "Is Zuno part of a larger product suite?", a: "Yes. Zuno QuickJoin™ is the first product in the Zuno ecosystem. Zuno Mail, Docs, Calendar, and Chat are coming soon." },
];

/* ── Main Component ─────────────────────────────────────────────────── */
function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [meetingCode, setMeetingCode] = useState("");
  const [authMode, setAuthMode] = useState(null); // "login" | "signup" | null
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const openLogin = () => setAuthMode("login");
    const openSignup = () => setAuthMode("signup");
    window.addEventListener("open-login-modal", openLogin);
    window.addEventListener("open-signup-modal", openSignup);
    return () => {
      window.removeEventListener("open-login-modal", openLogin);
      window.removeEventListener("open-signup-modal", openSignup);
    };
  }, []);

  const handleCreate = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    navigate(`/meeting/${encodeURIComponent(code)}`);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const code = meetingCode.trim();
    if (code) navigate(`/meeting/${encodeURIComponent(code)}`);
  };

  return (
    <div className="w-full">

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-zuno-blue-light via-transparent to-transparent opacity-60 pointer-events-none rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center">

            {/* Left */}
            <div className="space-y-8 animate-fade-in">
              {/* Eyebrow */}
              <div className="flex items-center gap-2">
                <span className="badge-blue gap-1.5 py-1 px-3">
                  <Sparkles size={12} />
                  Now part of the Zuno ecosystem
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl font-black text-zuno-charcoal leading-[1.05] tracking-tight text-balance">
                  Video calls that{" "}
                  <span className="text-gradient">just work.</span>
                </h1>
                <p className="text-lg text-zuno-gray-600 leading-relaxed max-w-lg">
                  Zuno QuickJoin™ delivers instant HD video meetings with zero friction.
                  No downloads, no setup — share a link and you're live.
                </p>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["SC", "MW", "PN", "AK", "JL"].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-zuno-blue to-blue-400 border-2 border-white flex items-center justify-center text-white text-2xs font-bold shadow-sm">
                      {i}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-zuno-gray-600">
                  <span className="font-bold text-zuno-charcoal">10,000+</span> teams trust Zuno
                  <span className="ml-2 text-zuno-amber font-bold">★ 4.9/5</span>
                </div>
              </div>

              {/* CTA group */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleCreate} className="btn-primary px-6 py-3 text-base gap-2.5 shadow-brand">
                  <Plus size={18} strokeWidth={2.5} />
                  Start a meeting
                </button>
                {user ? (
                  <button onClick={() => navigate("/dashboard")} className="btn-secondary px-6 py-3 text-base gap-2">
                    <LayoutDashboard size={16} />
                    Go to dashboard
                  </button>
                ) : (
                  <button onClick={() => setAuthMode("signup")} className="btn-secondary px-6 py-3 text-base gap-2">
                    Get started free
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>

              {/* Join form */}
              <form onSubmit={handleJoin} className="flex gap-2 p-1.5 bg-white rounded-xl border border-zuno-gray-200 shadow-card max-w-sm">
                <input
                  type="text"
                  placeholder="Enter meeting code…"
                  value={meetingCode}
                  onChange={e => setMeetingCode(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-1.5 text-sm text-zuno-charcoal placeholder:text-zuno-gray-400 outline-none"
                  aria-label="Meeting code"
                />
                <button type="submit" className="btn-primary text-sm px-4 py-2 gap-1.5">
                  <LogIn size={14} />
                  Join
                </button>
              </form>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-zuno-gray-500">
                {["No credit card", "Free forever plan", "GDPR compliant", "SOC 2 certified"].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check size={12} className="text-zuno-mint" strokeWidth={2.5} />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — product preview */}
            <div className="relative animate-fade-in">
              <div className="relative rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.14)] ring-1 ring-black/5">
                <img src="/videocall.png" alt="Zuno QuickJoin meeting preview" className="w-full h-auto object-cover bg-zuno-navy" loading="eager" />
                {/* Floating badge */}
                <div className="absolute top-4 left-4 glass rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-zuno-mint animate-pulse-slow" />
                  <span className="text-xs font-semibold text-zuno-charcoal">Live · 4 participants</span>
                </div>
                <div className="absolute bottom-4 right-4 glass rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                  <Wifi size={13} className="text-zuno-blue" />
                  <span className="text-xs font-semibold text-zuno-charcoal">HD · 1080p</span>
                </div>
              </div>
              {/* Decorative blobs */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-zuno-blue-light rounded-full blur-2xl opacity-70 -z-10" />
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-zuno-mint-light rounded-full blur-2xl opacity-70 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ══ LOGO BAR ══════════════════════════════════════════════════════ */}
      <section className="border-y border-zuno-gray-100 bg-zuno-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-semibold text-zuno-gray-400 uppercase tracking-widest mb-5">Trusted by teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {["Shopify", "Coinbase", "Zapier", "Linear", "Notion", "Vercel", "Figma"].map(b => (
              <span key={b} className="text-sm font-bold text-zuno-gray-400 hover:text-zuno-gray-600 transition-colors cursor-default">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="badge-blue mb-3">Features</span>
            <h2 className="text-4xl font-black text-zuno-charcoal mt-2 mb-3 tracking-tight">
              Everything your team needs
            </h2>
            <p className="text-base text-zuno-gray-600">
              Built for reliability, designed for simplicity. Zuno packs enterprise-grade features into a tool anyone can use.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="card-hover p-5 space-y-3 group">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={18} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-zuno-charcoal">{title}</h3>
                <p className="text-xs text-zuno-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-zuno-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="badge-green mb-3">How it works</span>
            <h2 className="text-4xl font-black text-zuno-charcoal mt-2 mb-3 tracking-tight">
              From zero to meeting in 10 seconds
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-zuno-blue-mid via-zuno-blue to-zuno-blue-mid" />

            {[
              { step: "01", icon: Plus, title: "Create", desc: "Click 'Start a meeting'. A unique QuickJoin™ link is generated instantly." },
              { step: "02", icon: Layers, title: "Share", desc: "Copy the link and send it via email, Slack, or any messaging app." },
              { step: "03", icon: Video, title: "Connect", desc: "Participants click the link and join directly in their browser. No downloads." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="card p-6 text-center space-y-4 relative">
                <div className="w-12 h-12 rounded-2xl bg-zuno-blue flex items-center justify-center mx-auto shadow-brand-sm">
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <span className="text-2xs font-black text-zuno-blue tracking-widest uppercase">Step {step}</span>
                  <h3 className="text-lg font-bold text-zuno-charcoal mt-1">{title}</h3>
                  <p className="text-sm text-zuno-gray-500 mt-2 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="badge-amber mb-3">Testimonials</span>
            <h2 className="text-4xl font-black text-zuno-charcoal mt-2 tracking-tight">
              Loved by teams worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, avatar, text, rating }) => (
              <div key={name} className="card p-6 space-y-4 hover:shadow-soft transition-shadow duration-200">
                <div className="flex gap-0.5">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-zuno-amber fill-zuno-amber" />
                  ))}
                </div>
                <p className="text-sm text-zuno-gray-700 leading-relaxed">"{text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-zuno-gray-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zuno-blue to-blue-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zuno-charcoal">{name}</p>
                    <p className="text-xs text-zuno-gray-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-zuno-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="badge-blue mb-3">Pricing</span>
            <h2 className="text-4xl font-black text-zuno-charcoal mt-2 mb-3 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-base text-zuno-gray-600">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {PLANS.map(({ name, price, period, desc, features, cta, highlight, badge }) => (
              <div key={name} className={`card p-6 space-y-5 relative ${highlight ? 'ring-2 ring-zuno-blue shadow-brand' : ''}`}>
                {badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge-blue px-3 py-1 shadow-brand-sm">{badge}</span>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zuno-gray-500">{name}</p>
                  <div className="flex items-end gap-1 mt-2">
                    <span className="text-4xl font-black text-zuno-charcoal">{price}</span>
                    {price !== "Custom" && <span className="text-sm text-zuno-gray-500 mb-1">/{period}</span>}
                  </div>
                  {price === "Custom" && <p className="text-sm text-zuno-gray-500">{period}</p>}
                  <p className="text-sm text-zuno-gray-500 mt-2">{desc}</p>
                </div>
                <ul className="space-y-2.5">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-zuno-gray-700">
                      <Check size={14} className="text-zuno-mint flex-shrink-0" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setAuthMode("signup")}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${highlight
                    ? 'btn-primary justify-center'
                    : 'btn-secondary justify-center'
                    }`}
                >
                  {cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="badge-gray mb-3">FAQ</span>
            <h2 className="text-4xl font-black text-zuno-charcoal mt-2 tracking-tight">Common questions</h2>
          </div>
          <div className="space-y-2">
            {FAQS.map(({ q, a }, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className={`card overflow-hidden transition-shadow duration-200 ${open ? 'shadow-soft' : ''}`}>
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                  >
                    <span className="text-sm font-semibold text-zuno-charcoal">{q}</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${open ? 'bg-zuno-blue text-white' : 'bg-zuno-gray-100 text-zuno-gray-500'}`}>
                      {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </div>
                  </button>
                  {open && (
                    <div className="px-5 pb-4 text-sm text-zuno-gray-600 leading-relaxed animate-slide-down border-t border-zuno-gray-100 pt-3">
                      {a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-zuno-blue flex items-center justify-center mx-auto shadow-brand">
            <Video size={28} className="text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight text-balance">
            Ready to transform how your team meets?
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Join 10,000+ teams already using Zuno. Start for free — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={handleCreate} className="btn-primary px-8 py-3.5 text-base gap-2.5 shadow-brand">
              <Plus size={18} strokeWidth={2.5} />
              Start a meeting now
            </button>
            <button onClick={() => setAuthMode("signup")} className="btn-secondary px-8 py-3.5 text-base bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30">
              Create free account
              <ArrowRight size={16} />
            </button>
          </div>
          <p className="text-xs text-white/40">No downloads · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* Auth modal */}
      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitch={() => setAuthMode(authMode === "login" ? "signup" : "login")}
        />
      )}
    </div>
  );
}

export default LandingPage;
