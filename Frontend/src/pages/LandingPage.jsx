import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  LogIn,
  Zap,
  Lock,
  Users,
  Smartphone,
  Mic,
  MessageSquare,
  Shield,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [meetingCode, setMeetingCode] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const { login, register, loginGoogle } = useAuth();

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqItems = [
    {
      q: "Is Zuno compatible with my setup?",
      a: "Yes. Zuno runs in the browser with no downloads required and works across desktop and mobile.",
    },
    {
      q: "How does Zuno EchoShield™ work?",
      a: "EchoShield™ uses on-device AI noise suppression to remove background noise while keeping voices clear.",
    },
    {
      q: "Is my call secure?",
      a: "All calls are secured with end-to-end encryption and protected by our Zero Trust edge.",
    },
    {
      q: "Do I need an account to join?",
      a: "Guests can join instantly via QuickJoin™ links—no signup required.",
    },
  ];

  const handleCreateMeeting = () => {
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    navigate(`/meeting/${encodeURIComponent(randomCode)}`);
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    const code = meetingCode.trim();
    if (!code) {
      // lightweight UX: you can replace with a toast or inline error state
      // e.g. setError("Please enter a meeting code") and render it in the UI
      return;
    }
    navigate(`/meeting/${encodeURIComponent(code)}`);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      await login(authForm.email, authForm.password);
      setShowLogin(false);
      navigate("/dashboard");
    } catch (err) {
      setAuthError(err?.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      await loginGoogle();
      setShowLogin(false);
      setShowSignup(false);
      navigate("/dashboard");
    } catch (err) {
      setAuthError(err?.message || "Google sign-in failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      await register(authForm.name, authForm.email, authForm.password);
      setShowSignup(false);
      navigate("/dashboard");
    } catch (err) {
      setAuthError(err?.message || "Signup failed");
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    const openLogin = () => setShowLogin(true);
    const openSignup = () => setShowSignup(true);
    window.addEventListener("open-login-modal", openLogin);
    window.addEventListener("open-signup-modal", openSignup);
    return () => {
      window.removeEventListener("open-login-modal", openLogin);
      window.removeEventListener("open-signup-modal", openSignup);
    };
  }, []);

  return (
    <div className="w-full">
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12 lg:pt-24 lg:pb-18 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(45,129,201,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(45,129,201,0.12) 1px, transparent 1px)",
              backgroundSize: "120px 120px",
            }}
          ></div>
        </div>
        <div className="space-y-7 relative">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zuno-blue/10 text-sm font-semibold text-zuno-blue w-fit">
              <Sparkles size={16} />
              Fast. Clear. Secure.
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-zuno-charcoal leading-tight">
              Video calls that stay sharp and never lag.
            </h1>

            <p className="text-lg text-zuno-charcoal/80 leading-relaxed max-w-2xl">
              Zuno delivers instant joins, crisp HD video, and noise-free audio —
              built for teams that need calls to just work.
            </p>

            <div className="flex items-center gap-2 text-sm text-zuno-charcoal/80">
              <div className="inline-flex items-center gap-1 text-amber-500 font-semibold">★ 4.9/5</div>
              <span>Loved for reliability</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zuno-blue text-white font-semibold shadow-brand hover:bg-zuno-blue-strong transition"
                onClick={handleCreateMeeting}
              >
                <Plus size={20} strokeWidth={3} />
                QuickJoin™
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zuno-charcoal/10 text-zuno-charcoal font-semibold hover:bg-gray-50 transition"
                onClick={() => {
                  // route to features / docs
                  navigate("/features");
                }}
              >
                Learn More
              </button>
            </div>

            <form
              className="flex flex-col sm:flex-row gap-3 p-3 bg-white rounded-2xl shadow-soft border border-gray-100"
              onSubmit={handleJoinMeeting}
            >
              <input
                aria-label="Enter meeting code"
                type="text"
                placeholder="Enter meeting code"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-zuno-blue focus:border-transparent bg-white"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zuno-charcoal text-white font-semibold hover:bg-black transition shadow-soft"
              >
                <LogIn size={18} />
                Join
              </button>
            </form>
          </div>

          <div className="flex items-center gap-4 text-sm text-zuno-charcoal/70 flex-wrap pt-2">
            <span className="font-semibold">Trusted by teams at</span>
            <div className="flex items-center gap-3 opacity-80">
              <span className="px-2 py-1 rounded bg-white shadow-sm text-xs font-semibold text-zuno-charcoal/70">Shopify</span>
              <span className="px-2 py-1 rounded bg-white shadow-sm text-xs font-semibold text-zuno-charcoal/70">Coinbase</span>
              <span className="px-2 py-1 rounded bg-white shadow-sm text-xs font-semibold text-zuno-charcoal/70">Zapier</span>
              <span className="px-2 py-1 rounded bg-white shadow-sm text-xs font-semibold text-zuno-charcoal/70">Linear</span>
            </div>
          </div>
        </div>

        <div className="relative w-full flex justify-end min-w-0">
          <div className="w-full max-w-2xl aspect-[5/4] rounded-[28px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.12)] overflow-hidden ring-4 ring-white relative">
            <img src="/videocall.png" alt="Video call preview" loading="lazy" className="w-full h-full object-contain bg-white" />
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center justify-between gap-4 bg-white/70 backdrop-blur rounded-2xl border border-gray-100 shadow-soft p-6">
          <div className="text-sm text-zuno-charcoal/70 font-semibold flex items-center gap-2">
            <Shield size={16} className="text-zuno-blue" />
            Trusted by modern teams
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center text-sm text-zuno-charcoal/60 font-semibold">
            <span className="px-3 py-1 rounded bg-white shadow-sm">Shopify</span>
            <span className="px-3 py-1 rounded bg-white shadow-sm">Coinbase</span>
            <span className="px-3 py-1 rounded bg-white shadow-sm">Zapier</span>
            <span className="px-3 py-1 rounded bg-white shadow-sm">Linear</span>
            <span className="px-3 py-1 rounded bg-white shadow-sm">Notion</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-zuno-charcoal">Why Teams Move to Zuno</h2>
            <p className="text-base text-zuno-charcoal/70">Speed, clarity, and reliability built into every call.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
                <Zap className="text-zuno-blue mb-3" size={40} strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-zuno-charcoal mb-2">Zuno FrameBoost™</h3>
                <p className="text-sm leading-relaxed text-zuno-charcoal/75">Crystal-clear 1080p with smart compression and adaptive quality.</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
                <Mic className="text-zuno-mint mb-3" size={40} strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-zuno-charcoal mb-2">Zuno EchoShield™</h3>
                <p className="text-sm leading-relaxed text-zuno-charcoal/75">AI-powered noise suppression that keeps voices crisp in any environment.</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
                <Lock className="text-zuno-charcoal mb-3" size={40} strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-zuno-charcoal mb-2">End-to-End Encryption</h3>
                <p className="text-sm leading-relaxed text-zuno-charcoal/75">Military-grade encryption and Zero Trust edge protect every session.</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
                <Users className="text-zuno-charcoal mb-3" size={40} strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-zuno-charcoal mb-2">Scale with Ease</h3>
                <p className="text-sm leading-relaxed text-zuno-charcoal/75">Host up to 100 participants with stable, low-latency video.</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
                <Smartphone className="text-zuno-charcoal mb-3" size={40} strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-zuno-charcoal mb-2">Cross-Platform</h3>
                <p className="text-sm leading-relaxed text-zuno-charcoal/75">Browser-native; works across desktop, mobile, and tablet—no downloads.</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
                <MessageSquare className="text-zuno-charcoal mb-3" size={40} strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-zuno-charcoal mb-2">Collaboration Built-In</h3>
                <p className="text-sm leading-relaxed text-zuno-charcoal/75">Live chat, quick reactions, and easy invites keep everyone in sync.</p>
              </div>
            </div>

            <div className="relative">
              <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <img src="/bannerimage.png" alt="Teams collaborating on a Zuno call" loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -left-6 -top-6 w-20 h-20 rounded-full bg-zuno-blue/10 blur-2xl" />
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-zuno-mint/10 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10 relative overflow-hidden">
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-zuno-blue/10 rounded-full blur-3xl" />
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-zuno-mint/10 rounded-full blur-3xl" />
          <div className="flex flex-col md:flex-row items-start gap-6 relative">
            <div className="w-16 h-16 rounded-full bg-zuno-blue text-white flex items-center justify-center text-2xl font-extrabold">“</div>
            <div className="space-y-4">
              <p className="text-xl font-semibold text-zuno-charcoal">“Zuno keeps our globally distributed team in sync with crystal-clear calls and zero friction. It just works.”</p>
              <div className="flex items-center gap-3 text-sm text-zuno-charcoal/80">
                <img src="/logo_dark.png" alt="Client logo" className="h-8 w-auto object-contain" />
                <div>
                  <div className="font-semibold text-zuno-charcoal">Alex Morgan</div>
                  <div className="text-zuno-charcoal/70">Head of Collaboration, Acme Corp</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-extrabold text-zuno-charcoal">FAQs</h3>
            <p className="text-sm text-zuno-charcoal/70">Answers to common questions about Zuno.</p>
          </div>

          <div className="divide-y divide-gray-200 border border-gray-100 rounded-2xl bg-white shadow-soft">
            {faqItems.map((item, idx) => {
              const open = openFaq === idx;
              return (
                <div key={idx}>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`faq-${idx}`}
                    className="w-full flex items-center justify-between px-4 sm:px-6 py-4 text-left hover:bg-gray-50 transition"
                    onClick={() => toggleFaq(idx)}
                  >
                    <span className="font-semibold text-zuno-charcoal">{item.q}</span>
                    {open ? <ChevronUp size={18} className="text-zuno-charcoal" /> : <ChevronDown size={18} className="text-zuno-charcoal" />}
                  </button>
                  {open && (
                    <div id={`faq-${idx}`} className="px-4 sm:px-6 pb-4 text-sm text-zuno-charcoal/75">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14" style={{ background: "linear-gradient(135deg, rgba(45,129,201,0.9) 0%, rgba(78,242,201,0.85) 100%)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white space-y-4">
          <h2 className="text-3xl font-extrabold">Ready to Get Started?</h2>
          <p className="text-lg text-white/90">Create your first meeting in seconds. No download or signup required.</p>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-zuno-blue font-semibold hover:bg-zuno-soft transition shadow-brand"
            onClick={handleCreateMeeting}
          >
            <Plus size={22} strokeWidth={3} />
            Get Started with Zuno QuickJoin™
          </button>
        </div>
      </section>

      {/* Auth Modals */}
      {(showLogin || showSignup) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zuno-blue/10 p-6 sm:p-8 space-y-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(45,129,201,0.06),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(45,129,201,0.05),transparent_35%)]" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo_white.png" alt="Zuno logo" className="h-8 w-auto" />
                <div>
                  <div className="text-2xl font-extrabold text-zuno-charcoal">
                    {showLogin ? "Sign in to Zuno" : "Create your Zuno account"}
                  </div>
                  <p className="text-sm text-zuno-charcoal/70">
                    Fast, secure calls with QuickJoin™.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-zuno-charcoal/70 hover:text-zuno-charcoal hover:bg-gray-200 transition"
                onClick={() => {
                  setShowLogin(false);
                  setShowSignup(false);
                  setAuthError("");
                  setAuthLoading(false);
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={showLogin ? handleLoginSubmit : handleSignupSubmit} className="relative space-y-4">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-zuno-charcoal font-semibold hover:bg-gray-50 transition shadow-soft"
                onClick={handleGoogleLogin}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-200 text-sm font-bold text-zuno-charcoal">
                  G
                </span>
                Continue with Google
              </button>
              <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-zuno-charcoal/50">
                <span className="flex-1 h-px bg-gray-200" />
                <span>or</span>
                <span className="flex-1 h-px bg-gray-200" />
              </div>
              {!showLogin && (
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zuno-charcoal">Name</label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zuno-blue focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-zuno-charcoal">Email</label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zuno-blue focus:border-transparent"
                  placeholder="you@email.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-zuno-charcoal">Password</label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zuno-blue focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              {showLogin && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-zuno-blue hover:text-zuno-blue-strong font-semibold"
                    onClick={() => {
                      // placeholder for forgot-password flow
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              {authError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {authError}
                </div>
              )}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-zuno-blue text-white font-semibold hover:bg-zuno-blue-strong transition shadow-brand disabled:opacity-70"
              >
                {authLoading ? "Please wait..." : showLogin ? "Sign in" : "Create account"}
              </button>
            </form>
            <div className="relative text-center text-sm text-zuno-charcoal/80">
              {showLogin ? (
                <span>
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    className="text-zuno-blue font-semibold hover:text-zuno-blue-strong"
                    onClick={() => {
                      setShowLogin(false);
                      setShowSignup(true);
                      setAuthError("");
                    }}
                  >
                    Sign up
                  </button>
                </span>
              ) : (
                <span>
                  Already with Zuno?{" "}
                  <button
                    type="button"
                    className="text-zuno-blue font-semibold hover:text-zuno-blue-strong"
                    onClick={() => {
                      setShowLogin(true);
                      setShowSignup(false);
                      setAuthError("");
                    }}
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
