import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Video,
  Users,
  Clock3,
  Shield,
  Copy,
  MoreVertical,
  Trash2,
  Info,
  Crown,
  X,
  Settings,
  MicOff,
  CameraOff,
  Share2,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    const timeStr = date.toLocaleTimeString("en", {
      hour: "numeric",
      minute: "2-digit",
    });
    
    if (diffDays === 0) return `Today, ${timeStr}`;
    if (diffDays === 1) return `Yesterday, ${timeStr}`;
    if (diffDays < 7) return `${diffDays} days ago, ${timeStr}`;
    
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "—";
  }
};

function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [recent, setRecent] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [remoteCounts, setRemoteCounts] = useState({ hosted: 0, joined: 0 });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    description: "",
    meetingId: "",
    settings: {
      muteOnJoin: false,
      videoOffByDefault: false,
      allowScreenShare: true,
      allowChat: true,
      requireAuth: false,
      maxParticipants: 100,
    },
  });

  const stats = useMemo(() => {
    const hostedFromApi = remoteCounts.hosted;
    const joinedFromApi = remoteCounts.joined;
    const hostedFromRecent = recent.filter(
      (m) => m.hostId && user?._id && `${m.hostId}` === `${user._id}`
    ).length;
    const joinedFromRecent = recent.filter(
      (m) => !(m.hostId && user?._id && `${m.hostId}` === `${user._id}`)
    ).length;
    const hosted =
      hostedFromApi ||
      hostedFromRecent ||
      user?.totalMeetingsHosted ||
      0;
    const joined =
      joinedFromApi ||
      joinedFromRecent ||
      user?.totalMeetingsJoined ||
      0;
    const recentCount = recent.length || user?.recentMeetings?.length || 0;
    return [
      { label: "Hosted", value: hosted, icon: Shield },
      { label: "Joined", value: joined, icon: Users },
      { label: "Recent", value: recentCount, icon: Clock3 },
    ];
  }, [user, recent, remoteCounts]);

  useEffect(() => {
    const fetchRecent = async () => {
      if (!token) return;
      setLoadingRecent(true);
      try {
        const { data } = await api.get("/meetings/recent", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecent(Array.isArray(data?.meetings) ? data.meetings.slice(0, 5) : []);
        setRemoteCounts({
          hosted: Number(data?.hostedCount || 0),
          joined: Number(data?.joinedCount || 0),
        });
      } catch {
        setRecent((user?.recentMeetings || []).slice(0, 5));
        setRemoteCounts({ hosted: 0, joined: 0 });
      } finally {
        setLoadingRecent(false);
      }
    };
    fetchRecent();
  }, [token, user]);

  const handleCreate = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setMeetingForm({
      ...meetingForm,
      meetingId: code,
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setCreatingMeeting(true);
    try {
      const { data } = await api.post(
        "/meetings/create",
        {
          meetingId: meetingForm.meetingId || undefined,
          title: meetingForm.title,
          description: meetingForm.description,
          settings: meetingForm.settings,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowCreateModal(false);
      setMeetingForm({
        title: "",
        description: "",
        meetingId: "",
        settings: {
          muteOnJoin: false,
          videoOffByDefault: false,
          allowScreenShare: true,
          allowChat: true,
          requireAuth: false,
          maxParticipants: 100,
        },
      });
      navigate(`/meeting/${encodeURIComponent(data.meeting.meetingId)}`);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create meeting");
    } finally {
      setCreatingMeeting(false);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const code = meetingCode.trim();
    if (!code) return;
    navigate(`/meeting/${encodeURIComponent(code)}`);
  };

  const handleCopyLink = (id) => {
    const url = `${window.location.origin}/meeting/${id}`;
    navigator.clipboard.writeText(url).catch(() => {});
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!token || !confirm("Are you sure you want to delete this meeting?")) return;
    setDeletingId(meetingId);
    try {
      await api.delete(`/meetings/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecent((prev) => prev.filter((m) => m.meetingId !== meetingId));
      setOpenMenuId(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete meeting");
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetails = (meetingId) => {
    navigate(`/meeting/${encodeURIComponent(meetingId)}/details`);
  };

  return (
    <div className="w-full">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-zuno-blue">Dashboard</p>
            <h1 className="text-3xl font-extrabold text-zuno-charcoal leading-tight">
              Welcome back, {user?.name || "there"}!
            </h1>
            <p className="text-sm text-zuno-charcoal/70">
              Manage your meetings, join quickly, and keep track of activity.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zuno-blue text-white font-semibold shadow-brand hover:bg-zuno-blue-strong transition"
            >
              <Plus size={18} />
              Create Meeting
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-white border border-gray-100 shadow-soft p-4 flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-xl bg-zuno-blue/10 text-zuno-blue flex items-center justify-center">
                <s.icon size={20} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-zuno-charcoal/60">
                  {s.label}
                </div>
                <div className="text-xl font-bold text-zuno-charcoal">
                  {s.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-soft p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-zuno-charcoal">Quick actions</h3>
              <p className="text-sm text-zuno-charcoal/70">
                Start or join a meeting instantly.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-[1.1fr_0.9fr] gap-3">
            <button
              onClick={handleCreate}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-zuno-blue text-white px-4 py-4 shadow-brand hover:bg-zuno-blue-strong transition"
            >
              <div className="flex items-center gap-3">
                <Video size={22} />
                <div className="text-left">
                  <div className="text-sm font-semibold">New Meeting</div>
                  <div className="text-xs text-white/80">Generate a fresh link</div>
                </div>
              </div>
              <Plus size={18} />
            </button>
            <form
              onSubmit={handleJoin}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3"
            >
              <input
                type="text"
                placeholder="Enter code"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-zuno-charcoal"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zuno-charcoal text-white text-sm font-semibold hover:bg-black transition"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-soft p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zuno-charcoal">Profile</h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zuno-blue/10 text-zuno-blue">
              {user?.role || "user"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={
                user?.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || user?.email || "User"
                )}&background=0D8ABC&color=fff`
              }
              alt={user?.name || "User"}
              className="h-12 w-12 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="font-semibold text-zuno-charcoal">
                {user?.name || "User"}
              </div>
              <div className="text-sm text-zuno-charcoal/70">{user?.email}</div>
            </div>
          </div>
          <div className="text-sm text-zuno-charcoal/70 space-y-1">
            <div>Preferred layout: {user?.meetingPreferences?.preferredLayout || "grid"}</div>
            <div>Mic muted by default: {user?.meetingPreferences?.micMuted ? "Yes" : "No"}</div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-soft p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zuno-charcoal">Recent meetings</h3>
            <span className="text-xs text-zuno-charcoal/70">
              {loadingRecent ? "Loading..." : `${recent.length || 0} shown`}
            </span>
          </div>
          {loadingRecent ? (
            <div className="text-sm text-zuno-charcoal/70">Fetching recent meetings…</div>
          ) : recent.length === 0 ? (
            <div className="text-sm text-zuno-charcoal/70">
              No recent meetings yet. Start one to see it here.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recent.map((m) => (
                <div
                  key={m.meetingId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 group hover:bg-gray-50/50 transition rounded-lg px-2 -mx-2"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-zuno-blue/10 text-zuno-blue flex items-center justify-center flex-shrink-0">
                      <Video size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-zuno-charcoal">
                          {m.title || m.meetingId}
                        </span>
                        {m.title && (
                          <span className="text-xs text-zuno-charcoal/50 font-mono">
                            {m.meetingId}
                          </span>
                        )}
                        {m.isHost && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zuno-blue/10 text-zuno-blue text-xs font-semibold">
                            <Crown size={12} />
                            Host
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zuno-charcoal/60 mt-1">
                        {m.isHost ? (
                          <span>You hosted • {fmtDate(m.startedAt || m.joinedAt)}</span>
                        ) : (
                          <span>
                            Joined: {m.participants > 1 ? `${m.participants} people` : "You"} • {fmtDate(m.joinedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/meeting/${encodeURIComponent(m.meetingId)}`)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zuno-charcoal/10 text-sm font-semibold text-zuno-charcoal hover:bg-gray-50 transition"
                    >
                      <Users size={16} />
                      Join again
                    </button>
                    <button
                      onClick={() => handleCopyLink(m.meetingId)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-sm font-semibold text-zuno-charcoal hover:bg-gray-100 transition"
                      title="Copy meeting link"
                    >
                      <Copy size={16} />
                      Copy link
                    </button>
                    <button
                      onClick={() => handleViewDetails(m.meetingId)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zuno-charcoal/10 text-sm font-semibold text-zuno-charcoal hover:bg-gray-50 transition"
                      title="View meeting details"
                    >
                      <Info size={16} />
                      Details
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === m.meetingId ? null : m.meetingId)}
                        className="inline-flex items-center justify-center p-2 rounded-lg border border-zuno-charcoal/10 text-zuno-charcoal hover:bg-gray-50 transition"
                        title="More options"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === m.meetingId && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                            {m.isHost && (
                              <button
                                onClick={() => handleDeleteMeeting(m.meetingId)}
                                disabled={deletingId === m.meetingId}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2 disabled:opacity-50"
                              >
                                <Trash2 size={14} />
                                {deletingId === m.meetingId ? "Deleting..." : "Delete"}
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zuno-blue/10 p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-zuno-charcoal">Create New Meeting</h2>
                <p className="text-sm text-zuno-charcoal/70 mt-1">
                  Configure your meeting settings before starting
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-zuno-charcoal/70 hover:text-zuno-charcoal hover:bg-gray-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zuno-charcoal">
                  Meeting Title <span className="text-zuno-charcoal/50">(optional)</span>
                </label>
                <input
                  type="text"
                  value={meetingForm.title}
                  onChange={(e) =>
                    setMeetingForm({ ...meetingForm, title: e.target.value })
                  }
                  placeholder="e.g., Team Standup, Client Call"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zuno-blue focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zuno-charcoal">
                  Description <span className="text-zuno-charcoal/50">(optional)</span>
                </label>
                <textarea
                  value={meetingForm.description}
                  onChange={(e) =>
                    setMeetingForm({ ...meetingForm, description: e.target.value })
                  }
                  placeholder="Add meeting agenda or notes..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zuno-blue focus:border-transparent resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zuno-charcoal">
                  Meeting ID
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={meetingForm.meetingId}
                    onChange={(e) =>
                      setMeetingForm({
                        ...meetingForm,
                        meetingId: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="Auto-generated"
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zuno-blue focus:border-transparent font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const code = Math.random()
                        .toString(36)
                        .substring(2, 10)
                        .toUpperCase();
                      setMeetingForm({ ...meetingForm, meetingId: code });
                    }}
                    className="px-4 py-3 rounded-xl border border-zuno-charcoal/10 text-zuno-charcoal font-semibold hover:bg-gray-50 transition"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <Settings size={18} className="text-zuno-blue" />
                  <h3 className="text-lg font-bold text-zuno-charcoal">Meeting Settings</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <MicOff size={18} className="text-zuno-charcoal/70" />
                      <div>
                        <div className="font-semibold text-zuno-charcoal text-sm">
                          Mute participants on join
                        </div>
                        <div className="text-xs text-zuno-charcoal/60">
                          Participants will join muted
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={meetingForm.settings.muteOnJoin}
                        onChange={(e) =>
                          setMeetingForm({
                            ...meetingForm,
                            settings: {
                              ...meetingForm.settings,
                              muteOnJoin: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-zuno-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zuno-blue"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <CameraOff size={18} className="text-zuno-charcoal/70" />
                      <div>
                        <div className="font-semibold text-zuno-charcoal text-sm">
                          Turn off video by default
                        </div>
                        <div className="text-xs text-zuno-charcoal/60">
                          Participants join with video off
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={meetingForm.settings.videoOffByDefault}
                        onChange={(e) =>
                          setMeetingForm({
                            ...meetingForm,
                            settings: {
                              ...meetingForm.settings,
                              videoOffByDefault: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-zuno-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zuno-blue"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <Share2 size={18} className="text-zuno-charcoal/70" />
                      <div>
                        <div className="font-semibold text-zuno-charcoal text-sm">
                          Allow screen sharing
                        </div>
                        <div className="text-xs text-zuno-charcoal/60">
                          Participants can share their screen
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={meetingForm.settings.allowScreenShare}
                        onChange={(e) =>
                          setMeetingForm({
                            ...meetingForm,
                            settings: {
                              ...meetingForm.settings,
                              allowScreenShare: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-zuno-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zuno-blue"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <MessageSquare size={18} className="text-zuno-charcoal/70" />
                      <div>
                        <div className="font-semibold text-zuno-charcoal text-sm">
                          Enable chat
                        </div>
                        <div className="text-xs text-zuno-charcoal/60">
                          Allow participants to send messages
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={meetingForm.settings.allowChat}
                        onChange={(e) =>
                          setMeetingForm({
                            ...meetingForm,
                            settings: {
                              ...meetingForm.settings,
                              allowChat: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-zuno-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zuno-blue"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <UserPlus size={18} className="text-zuno-charcoal/70" />
                      <div>
                        <div className="font-semibold text-zuno-charcoal text-sm">
                          Max Participants
                        </div>
                        <div className="text-xs text-zuno-charcoal/60">
                          Maximum number of participants
                        </div>
                      </div>
                    </div>
                    <input
                      type="number"
                      min="2"
                      max="500"
                      value={meetingForm.settings.maxParticipants}
                      onChange={(e) =>
                        setMeetingForm({
                          ...meetingForm,
                          settings: {
                            ...meetingForm.settings,
                            maxParticipants: parseInt(e.target.value) || 100,
                          },
                        })
                      }
                      className="w-20 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zuno-blue focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-zuno-charcoal/10 text-zuno-charcoal font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingMeeting || !meetingForm.meetingId}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zuno-blue text-white font-semibold hover:bg-zuno-blue-strong transition shadow-brand disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingMeeting ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <Video size={18} />
                      Start Meeting
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

