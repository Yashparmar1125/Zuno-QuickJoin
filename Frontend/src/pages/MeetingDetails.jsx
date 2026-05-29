import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Users, Clock, Calendar, Copy, Video,
  Crown, Settings, Shield, MessageSquare, Share2,
  MicOff, CameraOff, Hash, CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
  } catch { return "—"; }
};

const fmtDuration = (start, end) => {
  if (!start || !end) return "—";
  try {
    const mins = Math.floor((new Date(end) - new Date(start)) / 60000);
    const h = Math.floor(mins / 60);
    return h > 0 ? `${h}h ${mins % 60}m` : `${mins}m`;
  } catch { return "—"; }
};

const avatarUrl = (u) => {
  if (u?.photoURL) return u.photoURL;
  const label = encodeURIComponent(u?.name || u?.email || "U");
  return `https://ui-avatars.com/api/?name=${label}&background=2563EB&color=fff&bold=true`;
};

function MeetingDetails() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.get(`/meetings/${meetingId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setMeeting(data.meeting))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [meetingId, token]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/meeting/${meetingId}`).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-zuno-soft flex items-center justify-center">
      <div className="space-y-3 w-full max-w-2xl px-4">
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
      </div>
    </div>
  );

  if (!meeting) return (
    <div className="min-h-screen bg-zuno-soft flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-zuno-gray-100 flex items-center justify-center mx-auto">
          <Video size={28} className="text-zuno-gray-400" />
        </div>
        <p className="text-sm font-semibold text-zuno-gray-600">Meeting not found</p>
        <button onClick={() => navigate("/dashboard")} className="btn-primary gap-2">
          <ArrowLeft size={15} /> Back to dashboard
        </button>
      </div>
    </div>
  );

  const isHost = user?._id && `${meeting.hostId}` === `${user._id}`;
  const participants = meeting.participants || [];
  const s = meeting.settings || {};

  const SETTING_ITEMS = [
    { icon: MicOff, label: "Mute on join", value: s.muteOnJoin },
    { icon: CameraOff, label: "Video off by default", value: s.videoOffByDefault },
    { icon: Share2, label: "Screen sharing", value: s.allowScreenShare },
    { icon: MessageSquare, label: "In-call chat", value: s.allowChat },
    { icon: Shield, label: "Require auth", value: s.requireAuth },
  ];

  return (
    <div className="min-h-screen bg-zuno-soft">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5 animate-fade-in">

        {/* Back */}
        <button onClick={() => navigate("/dashboard")} className="btn-ghost gap-2 -ml-1">
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        {/* ── Header card ── */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-zuno-charcoal">
                  {meeting.title || `Meeting ${meeting.meetingId}`}
                </h1>
                {isHost && <span className="badge-blue gap-1"><Crown size={10} /> Host</span>}
                {meeting.isActive
                  ? <span className="badge-green gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zuno-mint animate-pulse-slow" /> Live</span>
                  : <span className="badge-gray">Ended</span>
                }
              </div>
              {meeting.description && (
                <p className="text-sm text-zuno-gray-600">{meeting.description}</p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-zuno-gray-400 font-mono">
                <Hash size={11} /> {meeting.meetingId}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={handleCopy} className={`btn-secondary text-xs gap-1.5 ${copied ? 'text-zuno-mint border-zuno-mint' : ''}`}>
                {copied ? <><CheckCircle2 size={13} /> Copied!</> : <><Copy size={13} /> Copy link</>}
              </button>
              <button onClick={() => navigate(`/meeting/${encodeURIComponent(meetingId)}`)} className="btn-primary text-xs gap-1.5">
                <Video size={13} /> Join
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Calendar, label: "Started", value: fmtDate(meeting.startedAt) },
            { icon: Clock, label: "Duration", value: fmtDuration(meeting.startedAt, meeting.endedAt) },
            { icon: Users, label: "Participants", value: participants.length || "—" },
            { icon: Shield, label: "Host", value: isHost ? "You" : "Other" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card p-4 text-center">
              <Icon size={16} className="text-zuno-gray-400 mx-auto mb-2" />
              <p className="text-2xs text-zuno-gray-500 uppercase tracking-wide font-semibold">{label}</p>
              <p className="text-sm font-bold text-zuno-charcoal mt-1 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Participants ── */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-zuno-gray-100">
            <Users size={15} className="text-zuno-gray-500" />
            <h3 className="text-sm font-bold text-zuno-charcoal">Participants</h3>
            <span className="badge-gray">{participants.length}</span>
          </div>
          {participants.length === 0 ? (
            <div className="py-10 text-center text-sm text-zuno-gray-500">No participants recorded</div>
          ) : (
            <div className="divide-y divide-zuno-gray-100">
              {participants.map((p, i) => {
                const pu = p.userId;
                const isParticipantHost = `${meeting.hostId}` === `${pu?._id || p.userId}`;
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-zuno-gray-50 transition-colors">
                    <img
                      src={avatarUrl(pu)}
                      alt={pu?.name || "Participant"}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zuno-charcoal truncate">
                          {pu?.name || pu?.email || "Unknown"}
                        </span>
                        {isParticipantHost && <span className="badge-blue gap-1 text-2xs"><Crown size={9} /> Host</span>}
                      </div>
                      {p.joinedAt && <p className="text-xs text-zuno-gray-400 mt-0.5">Joined {fmtDate(p.joinedAt)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Settings ── */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-zuno-gray-100">
            <Settings size={15} className="text-zuno-gray-500" />
            <h3 className="text-sm font-bold text-zuno-charcoal">Meeting settings</h3>
          </div>
          <div className="divide-y divide-zuno-gray-100">
            {SETTING_ITEMS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <Icon size={14} className="text-zuno-gray-400" />
                  <span className="text-sm text-zuno-gray-700">{label}</span>
                </div>
                <span className={`badge ${value ? 'badge-green' : 'badge-gray'}`}>
                  {value ? "Enabled" : "Disabled"}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <Users size={14} className="text-zuno-gray-400" />
                <span className="text-sm text-zuno-gray-700">Max participants</span>
              </div>
              <span className="badge-gray">{s.maxParticipants || 100}</span>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3">
          <button onClick={() => navigate(`/meeting/${encodeURIComponent(meetingId)}`)} className="btn-primary flex-1 justify-center gap-2 py-3">
            <Video size={16} /> Join meeting
          </button>
          <button onClick={handleCopy} className="btn-secondary px-5 py-3 gap-2">
            <Copy size={15} /> {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MeetingDetails;
