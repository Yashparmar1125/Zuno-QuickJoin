import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle2, LogIn, Home, Star, MessageSquare,
  AlertCircle, Clock, Users, Hash, ArrowRight,
} from "lucide-react";
import { submitFeedback } from "../services/feedback";
import { useAuth } from "../context/AuthContext";

const QUALITY_OPTIONS = [
  { value: "Excellent", emoji: "🚀", color: "border-zuno-mint bg-zuno-mint-light text-zuno-mint" },
  { value: "Good", emoji: "👍", color: "border-zuno-blue bg-zuno-blue-light text-zuno-blue" },
  { value: "Okay", emoji: "😐", color: "border-zuno-amber bg-zuno-amber-light text-zuno-amber" },
  { value: "Poor", emoji: "😞", color: "border-zuno-red bg-zuno-red-light text-zuno-red" },
];

const RATING_LABELS = ["", "Poor", "Needs work", "Okay", "Good", "Excellent"];

function CallEnded() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  const meetingId = location.state?.meetingId || "Unknown";
  const duration = location.state?.duration || "—";
  const participants = location.state?.participants || 1;

  const [step, setStep] = useState("feedback"); // "feedback" | "done"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ rating: 0, callQuality: "", comments: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.rating || !form.callQuality) { setError("Please select a rating and call quality."); return; }
    if (!user) { setError("Please sign in to submit feedback."); return; }
    setLoading(true);
    try {
      await submitFeedback({ meetingId, rating: form.rating, callQuality: form.callQuality, comments: form.comments }, token);
      setStep("done");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to submit. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zuno-soft flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-4 animate-fade-in">

        {/* ── Summary card ── */}
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-zuno-mint-light flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={24} className="text-zuno-mint" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zuno-charcoal">Call ended</h1>
              <p className="text-sm text-zuno-gray-500">
                {step === "done" ? "Thanks for your feedback!" : "You've left the meeting."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Hash, label: "Meeting ID", value: meetingId },
              { icon: Clock, label: "Duration", value: duration },
              { icon: Users, label: "Participants", value: `${participants} ${participants === 1 ? "person" : "people"}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-zuno-gray-50 rounded-xl p-3 text-center">
                <Icon size={14} className="text-zuno-gray-400 mx-auto mb-1" />
                <p className="text-2xs text-zuno-gray-500 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-xs font-bold text-zuno-charcoal mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Feedback card ── */}
        {step === "feedback" && (
          <div className="card p-6 animate-slide-up">
            <h2 className="text-base font-bold text-zuno-charcoal mb-1">How was your call?</h2>
            <p className="text-xs text-zuno-gray-500 mb-5">Your feedback helps us improve Zuno for everyone.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star rating */}
              <div>
                <label className="block text-xs font-semibold text-zuno-gray-700 mb-2">Overall rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button key={r} type="button" onClick={() => setForm(f => ({ ...f, rating: r }))}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 ${form.rating >= r
                          ? "bg-zuno-amber text-white scale-110 shadow-sm"
                          : "bg-zuno-gray-100 text-zuno-gray-400 hover:bg-zuno-amber-light hover:text-zuno-amber"
                        }`}
                    >
                      <Star size={18} fill={form.rating >= r ? "currentColor" : "none"} />
                    </button>
                  ))}
                  {form.rating > 0 && (
                    <span className="text-xs font-semibold text-zuno-gray-600 ml-1">{RATING_LABELS[form.rating]}</span>
                  )}
                </div>
              </div>

              {/* Call quality */}
              <div>
                <label className="block text-xs font-semibold text-zuno-gray-700 mb-2">Call quality</label>
                <div className="grid grid-cols-2 gap-2">
                  {QUALITY_OPTIONS.map(({ value, emoji, color }) => (
                    <button key={value} type="button" onClick={() => setForm(f => ({ ...f, callQuality: value }))}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-150 ${form.callQuality === value ? color : "border-zuno-gray-200 text-zuno-gray-600 hover:border-zuno-gray-300 hover:bg-zuno-gray-50"
                        }`}
                    >
                      <span>{emoji}</span> {value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-xs font-semibold text-zuno-gray-700 mb-2">
                  <MessageSquare size={12} className="inline mr-1" />
                  Comments <span className="text-zuno-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.comments}
                  onChange={e => setForm(f => ({ ...f, comments: e.target.value }))}
                  placeholder="Share any thoughts or suggestions…"
                  rows={3}
                  className="input resize-none text-sm"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-zuno-red bg-zuno-red-light border border-red-200 rounded-lg px-3 py-2.5">
                  <AlertCircle size={13} /> {error}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setStep("done")} className="btn-secondary text-sm px-4 py-2.5">
                  Skip
                </button>
                <button type="submit" disabled={loading || !form.rating || !form.callQuality}
                  className="btn-primary flex-1 justify-center text-sm py-2.5">
                  {loading ? "Submitting…" : "Submit feedback"}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === "done" && (
          <div className="card p-5 flex items-center gap-3 bg-zuno-mint-light border-zuno-mint/30 animate-scale-in">
            <CheckCircle2 size={20} className="text-zuno-mint flex-shrink-0" />
            <p className="text-sm font-semibold text-zuno-charcoal">Feedback submitted — thank you!</p>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex gap-3">
          <button onClick={() => navigate(`/meeting/${meetingId}`)} className="btn-secondary flex-1 justify-center gap-2 py-2.5">
            <LogIn size={15} /> Rejoin
          </button>
          <button onClick={() => navigate("/")} className="btn-primary flex-1 justify-center gap-2 py-2.5">
            <Home size={15} /> Home
          </button>
          <button onClick={() => navigate("/dashboard")} className="btn-secondary flex-1 justify-center gap-2 py-2.5">
            Dashboard <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CallEnded;
