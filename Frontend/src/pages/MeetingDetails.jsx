import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Clock, Calendar, Copy, Video, Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

function MeetingDetails() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const { data } = await api.get(`/meetings/${meetingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeeting(data.meeting);
      } catch (err) {
        console.error("Failed to fetch meeting:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeeting();
  }, [meetingId, token]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/meeting/${meetingId}`;
    navigator.clipboard.writeText(url).catch(() => {});
  };

  const fmtDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Intl.DateTimeFormat("en", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch {
      return "—";
    }
  };

  const fmtDuration = (start, end) => {
    if (!start || !end) return "—";
    try {
      const diffMs = new Date(end) - new Date(start);
      const minutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(minutes / 60);
      if (hours > 0) return `${hours}h ${minutes % 60}m`;
      return `${minutes}m`;
    } catch {
      return "—";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zuno-charcoal/70">Loading meeting details...</div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-zuno-charcoal/70">Meeting not found</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zuno-blue text-white font-semibold hover:bg-zuno-blue-strong transition"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isHost = user?._id && `${meeting.hostId}` === `${user._id}`;
  const participants = meeting.participants || [];

  return (
    <div className="min-h-screen bg-zuno-soft">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-zuno-charcoal/70 hover:text-zuno-charcoal mb-6 transition"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-extrabold text-zuno-charcoal">
                  {meeting.title || `Meeting: ${meeting.meetingId}`}
                </h1>
                {isHost && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zuno-blue/10 text-zuno-blue text-xs font-semibold">
                    <Crown size={12} />
                    You are the host
                  </span>
                )}
              </div>
              {meeting.description && (
                <p className="text-sm text-zuno-charcoal/70 mb-2">
                  {meeting.description}
                </p>
              )}
              <p className="text-xs text-zuno-charcoal/60 font-mono">
                ID: {meeting.meetingId}
              </p>
            </div>
            <button
              onClick={() => navigate(`/meeting/${encodeURIComponent(meetingId)}`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zuno-blue text-white font-semibold hover:bg-zuno-blue-strong transition"
            >
              <Video size={18} />
              Join Meeting
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 text-zuno-charcoal/70 mb-2">
                <Calendar size={16} />
                <span className="text-sm font-semibold">Started</span>
              </div>
              <p className="text-zuno-charcoal font-semibold">
                {fmtDate(meeting.startedAt)}
              </p>
            </div>
            {meeting.endedAt && (
              <div className="rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 text-zuno-charcoal/70 mb-2">
                  <Clock size={16} />
                  <span className="text-sm font-semibold">Duration</span>
                </div>
                <p className="text-zuno-charcoal font-semibold">
                  {fmtDuration(meeting.startedAt, meeting.endedAt)}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-zuno-charcoal/70">
                <Users size={18} />
                <span className="font-semibold">
                  Participants ({participants.length})
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-zuno-charcoal hover:bg-gray-50 transition"
              >
                <Copy size={14} />
                Copy Link
              </button>
            </div>
            {participants.length === 0 ? (
              <p className="text-sm text-zuno-charcoal/70">No participants recorded</p>
            ) : (
              <div className="space-y-2">
                {participants.map((p, idx) => {
                  const participantUser = p.userId;
                  const isParticipantHost = `${meeting.hostId}` === `${participantUser?._id || p.userId}`;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        {participantUser?.photoURL ? (
                          <img
                            src={participantUser.photoURL}
                            alt={participantUser.name || "Participant"}
                            className="h-8 w-8 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-zuno-blue/10 text-zuno-blue flex items-center justify-center text-xs font-bold">
                            {(participantUser?.name || participantUser?.email || "U")[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zuno-charcoal">
                              {participantUser?.name || participantUser?.email || "Unknown"}
                            </span>
                            {isParticipantHost && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-zuno-blue/10 text-zuno-blue font-semibold">
                                Host
                              </span>
                            )}
                          </div>
                          {p.joinedAt && (
                            <p className="text-xs text-zuno-charcoal/60">
                              Joined: {fmtDate(p.joinedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => navigate(`/meeting/${encodeURIComponent(meetingId)}`)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-zuno-blue text-white font-semibold hover:bg-zuno-blue-strong transition"
            >
              <Video size={18} />
              Join Meeting Again
            </button>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-zuno-charcoal/10 text-zuno-charcoal font-semibold hover:bg-gray-50 transition"
            >
              <Copy size={18} />
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MeetingDetails;

