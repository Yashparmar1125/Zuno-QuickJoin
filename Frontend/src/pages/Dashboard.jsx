import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Video, Users, Clock3, Shield, Copy, MoreVertical,
  Trash2, Info, Crown, X, Settings, MicOff, CameraOff,
  Share2, MessageSquare, UserPlus, Search, Calendar,
  ArrowUpRight, ChevronRight, Sparkles, Hash,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

/* ── Helpers ─────────────────────────────────────────────────────────── */
const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso), now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    const t = d.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
    if (diff === 0) return `Today, ${t}`;
    if (diff === 1) return `Yesterday, ${t}`;
    if (diff < 7) return `${diff}d ago, ${t}`;
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(d);
  } catch { return "—"; }
};

const avatarUrl = (u) => {
  if (u?.photoURL) return u.photoURL;
  const label = encodeURIComponent(u?.name || u?.email || "U");
  return `https://ui-avatars.com/api/?name=${label}&background=2563EB&color=fff&bold=true`;
};

/* ── Create Meeting Modal ─────────────────────────────────────────────── */
function CreateModal({ onClose, onCreated }) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    title: "", description: "", meetingId: Math.random().toString(36).substring(2, 10).toUpperCase(),
    settings: { muteOnJoin: false, videoOffByDefault: false, allowScreenShare: true, allowChat: true, requireAuth: false, maxParticipants: 100 },
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setSetting = (k, v) => setForm(f => ({ ...f, settings: { ...f.settings, [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await api.post("/meetings/create", {
        meetingId: form.meetingId || undefined,
        title: form.title, description: form.description, settings: form.settings,
      }, { headers: { Authorization: `Bearer ${token}` } });
      onCreated(data.meeting);
    } catch (err) { alert(err?.response?.data?.message || "Failed to create meeting"); }
    finally { setLoading(false); }
  };

  const TOGGLES = [
    { key: "muteOnJoin", icon: MicOff, label: "Mute on join", desc: "Participants join muted" },
    { key: "videoOffByDefault", icon: CameraOff, label: "Video off by default", desc: "Camera off on entry" },
    { key: "allowScreenShare", icon: Share2, label: "Screen sharing", desc: "Allow participants to share" },
    { key: "allowChat", icon: MessageSquare, label: "In-call chat", desc: "Enable messaging" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zuno-charcoal/60 backdrop-blur-sm">
      <div className="w-full max-w-xl card shadow-soft modal-enter max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zuno-gray-100">
          <div>
            <h2 className="text-lg font-bold text-zuno-charcoal">New meeting</h2>
            <p className="text-xs text-zuno-gray-500 mt-0.5">Configure your meeting before starting</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-zuno-gray-700 mb-1.5">Meeting title <span className="text-zuno-gray-400 font-normal">(optional)</span></label>
              <input className="input" type="text" placeholder="e.g. Team standup, Client review…"
                value={form.title} onChange={e => set("title", e.target.value)} />
            </div>

            {/* Meeting ID */}
            <div>
              <label className="block text-xs font-semibold text-zuno-gray-700 mb-1.5">Meeting ID</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zuno-gray-400" />
                  <input className="input pl-8 font-mono uppercase" type="text" placeholder="Auto-generated"
                    value={form.meetingId} onChange={e => set("meetingId", e.target.value.toUpperCase())} />
                </div>
                <button type="button" className="btn-secondary text-xs px-3 flex-shrink-0"
                  onClick={() => set("meetingId", Math.random().toString(36).substring(2, 10).toUpperCase())}>
                  Regenerate
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <Settings size={14} className="text-zuno-gray-500" />
                <span className="text-xs font-bold text-zuno-gray-700 uppercase tracking-wide">Settings</span>
              </div>
              <div className="space-y-2">
                {TOGGLES.map(({ key, icon: Icon, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-zuno-gray-50 border border-zuno-gray-100">
                    <div className="flex items-center gap-3">
                      <Icon size={15} className="text-zuno-gray-500" />
                      <div>
                        <p className="text-xs font-semibold text-zuno-charcoal">{label}</p>
                        <p className="text-2xs text-zuno-gray-400">{desc}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setSetting(key, !form.settings[key])}
                      className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 flex-shrink-0 ${form.settings[key] ? 'bg-zuno-blue' : 'bg-zuno-gray-300'}`}
                      style={{ height: "22px" }}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${form.settings[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-xl bg-zuno-gray-50 border border-zuno-gray-100">
                  <div className="flex items-center gap-3">
                    <UserPlus size={15} className="text-zuno-gray-500" />
                    <div>
                      <p className="text-xs font-semibold text-zuno-charcoal">Max participants</p>
                      <p className="text-2xs text-zuno-gray-400">Limit room capacity</p>
                    </div>
                  </div>
                  <input type="number" min="2" max="500"
                    value={form.settings.maxParticipants}
                    onChange={e => setSetting("maxParticipants", parseInt(e.target.value))}
                    className="w-20 input text-center text-xs py-1.5 px-2" />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-zuno-gray-100 flex gap-3">
            <button type="button" className="btn-secondary flex-1 justify-center" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center gap-2">
              <Video size={15} />
              {loading ? "Creating…" : "Start meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Dashboard ───────────────────────────────────────────────────── */
function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({ hosted: 0, joined: 0 });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.get("/meetings/recent", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        setRecent(Array.isArray(data?.meetings) ? data.meetings.slice(0, 10) : []);
        setCounts({ hosted: data?.hostedCount || 0, joined: data?.joinedCount || 0 });
      })
      .catch(() => setRecent([]))
      .finally(() => setLoading(false));
  }, [token]);

  const stats = useMemo(() => [
    { label: "Meetings hosted", value: counts.hosted || user?.totalMeetingsHosted || 0, icon: Shield, color: "bg-zuno-blue-light text-zuno-blue" },
    { label: "Meetings joined", value: counts.joined || user?.totalMeetingsJoined || 0, icon: Users, color: "bg-zuno-mint-light text-zuno-mint" },
    { label: "Recent activity", value: recent.length, icon: Clock3, color: "bg-zuno-amber-light text-zuno-amber" },
  ], [counts, user, recent]);

  const filtered = useMemo(() =>
    recent.filter(m =>
      !searchQuery ||
      m.meetingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    ), [recent, searchQuery]);

  const handleJoin = (e) => {
    e.preventDefault();
    const code = meetingCode.trim();
    if (code) navigate(`/meeting/${encodeURIComponent(code)}`);
  };

  const handleDelete = async (meetingId) => {
    if (!token || !confirm("Delete this meeting?")) return;
    setDeletingId(meetingId);
    try {
      await api.delete(`/meetings/${meetingId}`, { headers: { Authorization: `Bearer ${token}` } });
      setRecent(prev => prev.filter(m => m.meetingId !== meetingId));
      setOpenMenuId(null);
    } catch (err) { alert(err?.response?.data?.message || "Failed to delete"); }
    finally { setDeletingId(null); }
  };

  const handleCopy = (id) => {
    const url = `${window.location.origin}/meeting/${id}`;
    navigator.clipboard.writeText(url).catch(() => { });
  };

  return (
    <div className="min-h-screen bg-zuno-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <img src={avatarUrl(user)} alt="" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
              <span className="text-sm text-zuno-gray-500">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},</span>
            </div>
            <h1 className="text-2xl font-black text-zuno-charcoal tracking-tight">
              {user?.name?.split(" ")[0] || "there"} 👋
            </h1>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary gap-2 px-5 py-2.5 self-start sm:self-auto">
            <Plus size={16} strokeWidth={2.5} />
            New meeting
          </button>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-card">
              <div className={`stat-icon ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-black text-zuno-charcoal">{value}</p>
                <p className="text-xs text-zuno-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick actions ── */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Start meeting */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zuno-blue flex items-center justify-center">
                <Video size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zuno-charcoal">Start a meeting</h3>
                <p className="text-xs text-zuno-gray-500">Create a new room instantly</p>
              </div>
            </div>
            <button onClick={() => setShowCreate(true)} className="btn-primary w-full justify-center gap-2 py-2.5">
              <Plus size={15} />
              New meeting
            </button>
          </div>

          {/* Join meeting */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zuno-mint-light flex items-center justify-center">
                <ArrowUpRight size={16} className="text-zuno-mint" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zuno-charcoal">Join a meeting</h3>
                <p className="text-xs text-zuno-gray-500">Enter a code or link</p>
              </div>
            </div>
            <form onSubmit={handleJoin} className="flex gap-2">
              <input className="input flex-1 text-sm py-2" type="text" placeholder="Meeting code…"
                value={meetingCode} onChange={e => setMeetingCode(e.target.value)} />
              <button type="submit" className="btn-secondary text-sm px-4 flex-shrink-0">Join</button>
            </form>
          </div>
        </div>

        {/* ── Recent meetings ── */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zuno-gray-100">
            <div className="flex items-center gap-2">
              <Clock3 size={16} className="text-zuno-gray-500" />
              <h3 className="text-sm font-bold text-zuno-charcoal">Recent meetings</h3>
              <span className="badge-gray">{recent.length}</span>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zuno-gray-400" />
              <input
                className="input pl-8 py-1.5 text-xs w-44"
                placeholder="Search meetings…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-zuno-gray-100 flex items-center justify-center mx-auto mb-3">
                <Video size={24} className="text-zuno-gray-400" />
              </div>
              <p className="text-sm font-semibold text-zuno-gray-600">No meetings yet</p>
              <p className="text-xs text-zuno-gray-400 mt-1">Start one to see it here</p>
              <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 text-xs px-4 py-2 gap-1.5">
                <Plus size={13} /> New meeting
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zuno-gray-100">
              {filtered.map((m) => (
                <div key={m.meetingId} className="flex items-center gap-4 px-5 py-4 hover:bg-zuno-gray-50 transition-colors group">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-zuno-blue-light flex items-center justify-center flex-shrink-0">
                    <Video size={16} className="text-zuno-blue" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-zuno-charcoal truncate">
                        {m.title || m.meetingId}
                      </span>
                      {m.title && <span className="text-xs text-zuno-gray-400 font-mono hidden sm:inline">{m.meetingId}</span>}
                      {m.isHost && (
                        <span className="badge-blue gap-1">
                          <Crown size={10} /> Host
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zuno-gray-500 mt-0.5">
                      {fmtDate(m.startedAt || m.joinedAt)} · {m.participants || 1} participant{m.participants !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => navigate(`/meeting/${encodeURIComponent(m.meetingId)}`)}
                      className="btn-secondary text-xs px-3 py-1.5 gap-1.5"
                    >
                      <Video size={12} /> Join
                    </button>
                    <button onClick={() => handleCopy(m.meetingId)} className="btn-icon p-2" title="Copy link">
                      <Copy size={14} />
                    </button>
                    <button onClick={() => navigate(`/meeting/${encodeURIComponent(m.meetingId)}/details`)} className="btn-icon p-2" title="Details">
                      <Info size={14} />
                    </button>
                    <div className="relative">
                      <button className="btn-icon p-2" onClick={() => setOpenMenuId(openMenuId === m.meetingId ? null : m.meetingId)}>
                        <MoreVertical size={14} />
                      </button>
                      {openMenuId === m.meetingId && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-full mt-1 w-36 card shadow-soft py-1 z-20 animate-scale-in">
                            {m.isHost && (
                              <button
                                onClick={() => handleDelete(m.meetingId)}
                                disabled={deletingId === m.meetingId}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zuno-red hover:bg-zuno-red-light transition-colors disabled:opacity-50"
                              >
                                <Trash2 size={13} />
                                {deletingId === m.meetingId ? "Deleting…" : "Delete"}
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

        {/* ── Ecosystem promo ── */}
        <div className="card p-5 bg-gradient-to-br from-zuno-navy to-zuno-navy-800 text-white overflow-hidden relative">
          <div className="absolute right-0 top-0 w-48 h-48 bg-zuno-blue/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zuno-blue flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold">Zuno ecosystem coming soon</p>
                <p className="text-xs text-white/60 mt-0.5">Mail, Docs, Calendar, Chat — all in one place</p>
              </div>
            </div>
            <button className="btn-secondary text-xs bg-white/10 border-white/20 text-white hover:bg-white/20 flex-shrink-0 gap-1.5">
              Learn more <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={(meeting) => { setShowCreate(false); navigate(`/meeting/${encodeURIComponent(meeting.meetingId)}`); }}
        />
      )}
    </div>
  );
}

export default Dashboard;
