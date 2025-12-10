import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, LogIn, Home, Star, MessageSquare, AlertCircle } from "lucide-react";
import { submitFeedback } from "../services/feedback";
import { useAuth } from "../context/AuthContext";

function CallEnded() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const meetingId = location.state?.meetingId || 'Unknown';
  const duration = location.state?.duration || '—';
  const participants = location.state?.participants || 1;

  const [showFeedback, setShowFeedback] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    rating: 0,
    callQuality: "",
    comments: "",
  });

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleRejoin = () => {
    navigate(`/meeting/${meetingId}`);
  };

  const handleSkipFeedback = () => {
    setShowFeedback(false);
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleCallQualityClick = (quality) => {
    setFormData({ ...formData, callQuality: quality });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.rating || !formData.callQuality) {
      setError("Please provide a rating and call quality assessment");
      return;
    }

    if (!user) {
      setError("Please login to submit feedback");
      return;
    }

    setLoading(true);
    try {
      await submitFeedback({
        meetingId,
        rating: formData.rating,
        callQuality: formData.callQuality,
        comments: formData.comments,
      }, token);
      setSubmitted(true);
      setShowFeedback(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to submit feedback. Please try again.");
      console.error('Feedback submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zuno-soft flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
            <CheckCircle2 size={32} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-zuno-charcoal">Call ended</h1>
            <p className="text-sm text-zuno-charcoal/70">
              {submitted ? "Thank you for your feedback!" : "You've successfully left the meeting."}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 bg-zuno-soft border border-gray-200 rounded-2xl p-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-zuno-charcoal/60 font-semibold">Meeting ID</div>
            <div className="text-base font-bold text-zuno-charcoal mt-1">{meetingId}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-zuno-charcoal/60 font-semibold">Duration</div>
            <div className="text-base font-bold text-zuno-charcoal mt-1">{duration}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-zuno-charcoal/60 font-semibold">Participants</div>
            <div className="text-base font-bold text-zuno-charcoal mt-1">
              {participants} {participants === 1 ? "person" : "people"}
            </div>
          </div>
        </div>

        {showFeedback && !submitted && (
          <form onSubmit={handleSubmit} className="space-y-6 border-t border-gray-200 pt-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={20} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Overall Rating */}
            <div className="space-y-3">
              <label className="text-lg font-semibold text-zuno-charcoal flex items-center gap-2">
                <Star size={20} className="text-amber-500" />
                Overall Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingClick(rating)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      formData.rating >= rating
                        ? "bg-amber-500 text-white shadow-lg scale-110"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    <Star size={24} fill={formData.rating >= rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              {formData.rating > 0 && (
                <p className="text-sm text-zuno-charcoal/70">
                  {formData.rating === 5 && "Excellent!"}
                  {formData.rating === 4 && "Good"}
                  {formData.rating === 3 && "Okay"}
                  {formData.rating === 2 && "Needs Improvement"}
                  {formData.rating === 1 && "Poor"}
                </p>
              )}
            </div>

            {/* Call Quality */}
            <div className="space-y-3">
              <label className="text-lg font-semibold text-zuno-charcoal">Call Quality</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Excellent", "Good", "Okay", "Poor"].map((quality) => (
                  <button
                    key={quality}
                    type="button"
                    onClick={() => handleCallQualityClick(quality)}
                    className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      formData.callQuality === quality
                        ? "border-zuno-blue bg-zuno-blue text-white shadow-md"
                        : "border-gray-200 text-zuno-charcoal hover:border-zuno-blue/50 hover:bg-zuno-blue/5"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Star size={18} className={formData.callQuality === quality ? "text-white" : "text-amber-500"} />
                      <span className="font-semibold">{quality}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-3">
              <label className="text-base font-semibold text-zuno-charcoal flex items-center gap-2">
                <MessageSquare size={18} className="text-zuno-charcoal/70" />
                Additional Comments (Optional)
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Share your thoughts or suggestions..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-zuno-charcoal placeholder-zuno-charcoal/50 focus:outline-none focus:ring-2 focus:ring-zuno-blue focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSkipFeedback}
                className="px-4 py-3 rounded-xl border border-gray-200 text-zuno-charcoal font-semibold hover:bg-gray-50 transition"
              >
                Skip Feedback
              </button>
              <button
                type="submit"
                disabled={loading || !formData.rating || !formData.callQuality}
                className="flex-1 px-4 py-3 rounded-xl bg-zuno-blue text-white font-semibold hover:bg-zuno-blue-strong transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        )}

        {submitted && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} />
              <span className="text-sm font-semibold">Thank you! Your feedback has been submitted successfully.</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-200">
          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-zuno-charcoal font-semibold hover:bg-gray-50 transition"
            onClick={handleRejoin}
          >
            <LogIn size={18} />
            Rejoin meeting
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zuno-blue text-white font-semibold hover:bg-zuno-blue-strong transition shadow-md"
            onClick={handleReturnHome}
          >
            <Home size={18} />
            Return home
          </button>
        </div>

        <div className="text-sm text-zuno-charcoal/70 text-center">
          Need help? Visit our <a href="#support" className="text-zuno-blue hover:text-zuno-blue-strong font-semibold">Support Center</a>
        </div>
      </div>
    </div>
  );
}

export default CallEnded;
