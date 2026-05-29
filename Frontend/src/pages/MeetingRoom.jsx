import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Copy, MessageSquare, Users, Mic, MicOff, Video, VideoOff,
  PhoneOff, Send, X, EllipsisVertical, Clock, Volume2, Share2, Hash,
} from "lucide-react";
import { createSocket } from "../lib/socket";
import { useAuth } from "../context/AuthContext";

function MeetingRoom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const peersRef = useRef(new Map());
  const [remotePeers, setRemotePeers] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [remotePresenterId, setRemotePresenterId] = useState(null);
  const [remotePresenterName, setRemotePresenterName] = useState("");
  const [focusedSocketId, setFocusedSocketId] = useState(null);
  const meetingStartRef = useRef(Date.now());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [audioOutputName, setAudioOutputName] = useState("Default Output");
  const [audioOutputDeviceId, setAudioOutputDeviceId] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const showChatRef = useRef(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const participants = useMemo(() => {
    const list = [{ id: "self", name: user?.name || "You", isMuted, isVideoOff, isSelf: true }];
    remotePeers.forEach(({ socketId }) => {
      const entry = peersRef.current.get(socketId) || {};
      list.push({ id: socketId, name: entry.name || "Peer", isMuted: entry.isMuted ?? false, isVideoOff: entry.isVideoOff ?? false, isSelf: false });
    });
    return list;
  }, [user, isMuted, isVideoOff, remotePeers]);

  const getInitials = (name) => {
    const src = (name || "").trim();
    if (!src) return "?";
    const parts = src.split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts.length > 1 ? parts[parts.length - 1]?.[0] : "")).toUpperCase();
  };

  const rtcConfig = { iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] };

  const addLocalTracks = (pc) => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));
  };

  const getPeerName = (socketId) => (peersRef.current.get(socketId)?.name) || "Peer";

  const updateAudioDeviceName = async () => {
    try {
      if (!navigator.mediaDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const out = devices.find((d) => d.kind === "audiooutput");
      setAudioOutputDeviceId(out?.deviceId || null);
      setAudioOutputName(out?.label || "Default Output");
      if (out?.deviceId) {
        peersRef.current.forEach((entry) => {
          try { if (entry.videoEl && typeof entry.videoEl.setSinkId === "function") entry.videoEl.setSinkId(out.deviceId).catch(() => { }); } catch { }
        });
        try { if (localVideoRef.current && typeof localVideoRef.current.setSinkId === "function") localVideoRef.current.setSinkId(out.deviceId).catch(() => { }); } catch { }
      }
    } catch { }
  };

  const createPeer = (remoteSocketId) => {
    const pc = new RTCPeerConnection(rtcConfig);
    addLocalTracks(pc);
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current)
        socketRef.current.emit("ice-candidate", { meetingId, candidate: event.candidate, from: socketRef.current.id });
    };
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      const entry = peersRef.current.get(remoteSocketId);
      if (entry?.videoEl) entry.videoEl.srcObject = stream;
    };
    const existing = peersRef.current.get(remoteSocketId) || {};
    peersRef.current.set(remoteSocketId, { ...existing, pc, videoEl: existing.videoEl || null });
    setRemotePeers((prev) => {
      const map = new Map(prev.map((p) => [p.socketId, p]));
      if (!map.has(remoteSocketId)) map.set(remoteSocketId, { socketId: remoteSocketId, name: existing.name || "Peer", isMuted: false, isVideoOff: false });
      return Array.from(map.values());
    });
    return pc;
  };

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date().toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.title = `Meeting: ${meetingId}`;
    let isMounted = true;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!isMounted) return;
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        updateAudioDeviceName();
        try { navigator.mediaDevices.addEventListener("devicechange", updateAudioDeviceName); } catch { }
        const socket = createSocket(token);
        socketRef.current = socket;
        socket.on("connect", () => socket.emit("join-meeting", { meetingId }));
        socket.io.on("reconnect_attempt", () => addToast("Reconnecting..."));
        socket.io.on("reconnect", () => addToast("Reconnected"));
        socket.io.on("error", () => addToast("Socket error"));
        socket.on("disconnect", () => addToast("Disconnected"));
        socket.on("connect_error", (err) => {
          addToast(err?.message === "Unauthorized" ? "Authentication required. Redirecting…" : "Connection error.");
          setTimeout(() => navigate("/"), 800);
        });
        socket.on("user-joined", async ({ socketId: remoteId, userName }) => {
          const entry = peersRef.current.get(remoteId) || {};
          peersRef.current.set(remoteId, { ...entry, name: userName || "Peer" });
          setRemotePeers((prev) => prev.map((p) => p.socketId === remoteId ? { ...p, name: userName || "Peer" } : p));
          const pc = createPeer(remoteId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { meetingId, offer, from: socket.id });
        });
        socket.on("offer", async ({ offer, from }) => {
          if (!peersRef.current.get(from)) createPeer(from);
          const pc = peersRef.current.get(from).pc;
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { meetingId, answer, from: socket.id });
        });
        socket.on("answer", async ({ answer, from }) => {
          const entry = peersRef.current.get(from);
          if (entry) await entry.pc.setRemoteDescription(new RTCSessionDescription(answer));
        });
        socket.on("ice-candidate", async ({ candidate, from }) => {
          const entry = peersRef.current.get(from);
          if (entry) try { await entry.pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch { }
        });
        socket.on("user-left", ({ socketId }) => {
          const entry = peersRef.current.get(socketId);
          if (entry) { entry.pc.close(); peersRef.current.delete(socketId); setRemotePeers((prev) => prev.filter((p) => p.socketId !== socketId)); }
        });
        socket.on("chat-message", ({ message, sender, timestamp, from }) => {
          setChatMessages((prev) => [...prev, { id: Date.now(), sender, message, timestamp: new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
          if (!showChatRef.current && from !== socketRef.current?.id) addToast(`${sender}: ${message}`);
        });
        socket.on("media-state", ({ isMuted, isVideoOff, from, isScreenSharing }) => {
          const key = from || Array.from(peersRef.current.keys())[0];
          if (!key) return;
          const entry = peersRef.current.get(key) || {};
          peersRef.current.set(key, { ...entry, isMuted, isVideoOff });
          setRemotePeers((prev) => prev.map((p) => p.socketId === key ? { ...p, isMuted, isVideoOff } : p));
          if (typeof isScreenSharing === "boolean") {
            if (isScreenSharing) { setRemotePresenterId(key); setRemotePresenterName(getPeerName(key)); setFocusedSocketId((curr) => curr || key); }
            else if (remotePresenterId === key) { setRemotePresenterId(null); setRemotePresenterName(""); }
          }
        });
      } catch (err) { console.error("Media error", err); addToast("Could not access camera/microphone"); }
    };
    start();
    return () => {
      isMounted = false;
      if (socketRef.current) { socketRef.current.emit("leave-meeting", { meetingId, userId: user?._id || "anon" }); socketRef.current.disconnect(); }
      peersRef.current.forEach(({ pc }) => pc.close());
      peersRef.current.clear();
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
      try { navigator.mediaDevices.removeEventListener("devicechange", updateAudioDeviceName); } catch { }
      document.title = "Zuno";
    };
  }, [meetingId, user]);

  const handleLeaveMeeting = () => {
    const durationMs = Date.now() - (meetingStartRef.current || Date.now());
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    navigate("/call-ended", { state: { meetingId, duration: `${minutes}m ${seconds.toString().padStart(2, "0")}s`, participants: 1 + remotePeers.length } });
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => (t.enabled = !next));
      peersRef.current.forEach(({ pc }) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
        if (sender && audioTracks[0]) sender.replaceTrack(audioTracks[0]).catch(() => { });
      });
    }
    if (socketRef.current) socketRef.current.emit("media-state", { meetingId, userId: user?._id || "anon", isMuted: next, isVideoOff, from: socketRef.current.id });
  };

  const toggleVideo = () => {
    const next = !isVideoOff;
    setIsVideoOff(next);
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((t) => (t.enabled = !next));
      if (!next && localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      peersRef.current.forEach(({ pc }) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender && videoTracks[0]) sender.replaceTrack(videoTracks[0]).catch(() => { });
      });
    }
    if (socketRef.current) socketRef.current.emit("media-state", { meetingId, userId: user?._id || "anon", isMuted, isVideoOff: next, from: socketRef.current.id });
  };

  const startScreenShare = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = displayStream.getVideoTracks()[0];
      peersRef.current.forEach(({ pc }) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(screenTrack);
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = displayStream;
      setIsScreenSharing(true);
      if (socketRef.current) socketRef.current.emit("media-state", { meetingId, userId: user?._id || "anon", isMuted, isVideoOff, isScreenSharing: true, from: socketRef.current.id });
      screenTrack.onended = () => stopScreenShare();
    } catch { addToast("Screen share cancelled"); }
  };

  const stopScreenShare = async () => {
    if (!localStreamRef.current) return;
    const camTrack = localStreamRef.current.getVideoTracks()[0];
    peersRef.current.forEach(({ pc }) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender && camTrack) sender.replaceTrack(camTrack);
    });
    if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
    setIsScreenSharing(false);
    if (socketRef.current) socketRef.current.emit("media-state", { meetingId, userId: user?._id || "anon", isMuted, isVideoOff, isScreenSharing: false, from: socketRef.current.id });
  };

  const toggleScreenShare = () => isScreenSharing ? stopScreenShare() : startScreenShare();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim() && socketRef.current) {
      socketRef.current.emit("chat-message", { meetingId, message: chatMessage, sender: user?.name || "You", userId: user?._id || "anon" });
      setChatMessage("");
    }
  };

  const addToast = (msg) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/meeting/${meetingId}`;
    const message = `Join the meeting: ${url}\n\nMeeting ID: ${meetingId}`;
    try { await navigator.clipboard.writeText(message); } catch {
      const ta = document.createElement("textarea"); ta.value = message;
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    }
    addToast("Invite link copied");
  };

  useEffect(() => { showChatRef.current = showChat; }, [showChat]);

  const enterFullscreen = (el) => {
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
  };

  const totalParticipants = 1 + remotePeers.length;
  const gridCols =
    totalParticipants <= 1 ? "grid-cols-1" :
      totalParticipants <= 2 ? "grid-cols-1 lg:grid-cols-2" :
        totalParticipants <= 4 ? "grid-cols-2" :
          "grid-cols-2 lg:grid-cols-3";

  return (
    <div className="flex flex-col h-screen bg-zuno-navy overflow-hidden text-white">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 glass-dark border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo_white.png" alt="Zuno" className="h-7 w-auto" />
          <div className="w-px h-5 bg-white/20" />
          <div className="flex items-center gap-1.5">
            <Hash size={13} className="text-white/40" />
            <span className="text-sm font-bold text-white/90 font-mono">{meetingId}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/50">
            <Clock size={11} />
            <span>{currentTime}</span>
            <span className="mx-1 text-white/20">·</span>
            <span>{totalParticipants} {totalParticipants === 1 ? "participant" : "participants"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {audioOutputName && (
            <button onClick={() => addToast(`Output: ${audioOutputName}`)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white/70 transition-colors">
              <Volume2 size={13} />
              <span className="max-w-[100px] truncate">{audioOutputName}</span>
            </button>
          )}
          <button onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zuno-blue hover:bg-zuno-blue-hover text-xs font-semibold text-white transition-colors">
            <Copy size={13} />
            <span className="hidden sm:inline">Invite</span>
          </button>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Presenter banner */}
        {(isScreenSharing || remotePresenterId) && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-zuno-blue/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-semibold shadow-brand-sm">
            <Share2 size={13} />
            {isScreenSharing ? "You are presenting" : `${remotePresenterName} is presenting`}
          </div>
        )}

        {/* Video grid */}
        <div className="flex-1 p-3 sm:p-4 overflow-auto">

          {/* Spotlight / focused view */}
          {focusedSocketId && (
            <div className="mb-3 animate-fade-in">
              <div className="video-tile w-full ring-2 ring-zuno-blue/60 cursor-pointer relative"
                style={{ aspectRatio: "16/9", maxHeight: "55vh" }}
                onDoubleClick={() => setFocusedSocketId(null)}>
                {focusedSocketId === "self" ? (
                  isVideoOff ? (
                    <div className="video-tile-avatar">
                      <div className="w-20 h-20 rounded-full bg-zuno-blue flex items-center justify-center">
                        <span className="text-2xl font-black">{getInitials(user?.name || "You")}</span>
                      </div>
                    </div>
                  ) : (
                    <video ref={el => { if (el && localStreamRef.current) el.srcObject = localStreamRef.current; localVideoRef.current = el; }}
                      autoPlay playsInline muted className="w-full h-full object-cover" />
                  )
                ) : (
                  peersRef.current.get(focusedSocketId)?.isVideoOff ? (
                    <div className="video-tile-avatar">
                      <div className="w-20 h-20 rounded-full bg-zuno-blue flex items-center justify-center">
                        <span className="text-2xl font-black">{getInitials(getPeerName(focusedSocketId))}</span>
                      </div>
                    </div>
                  ) : (
                    <video ref={el => { const e = peersRef.current.get(focusedSocketId); if (e) { e.videoEl = el; if (el && audioOutputDeviceId && typeof el.setSinkId === "function") el.setSinkId(audioOutputDeviceId).catch(() => { }); } }}
                      autoPlay playsInline className="w-full h-full object-cover" />
                  )
                )}
                <div className="video-tile-label">
                  <span>{focusedSocketId === "self" ? (user?.name || "You") : getPeerName(focusedSocketId)}</span>
                  {(focusedSocketId === "self" ? isMuted : peersRef.current.get(focusedSocketId)?.isMuted)
                    ? <MicOff size={11} className="text-red-400" />
                    : <Mic size={11} className="text-zuno-mint" />}
                </div>
                <button onClick={() => setFocusedSocketId(null)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors">
                  <X size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Tile grid */}
          <div className={`grid ${gridCols} gap-3`}>
            {/* Self tile */}
            <div className="video-tile cursor-pointer group hover:ring-2 hover:ring-zuno-blue/50 transition-all duration-200"
              onClick={() => { setFocusedSocketId("self"); if (!isVideoOff) enterFullscreen(localVideoRef.current); }}>
              {isVideoOff ? (
                <div className="video-tile-avatar">
                  <div className="w-16 h-16 rounded-full bg-zuno-blue flex items-center justify-center">
                    <span className="text-xl font-black">{getInitials(user?.name || "You")}</span>
                  </div>
                </div>
              ) : (
                <video ref={el => { if (el && localStreamRef.current) el.srcObject = localStreamRef.current; localVideoRef.current = el; }}
                  autoPlay playsInline muted className="w-full h-full object-cover" />
              )}
              <div className="video-tile-label opacity-0 group-hover:opacity-100 transition-opacity">
                <span>{user?.name || "You"}</span>
                {isMuted ? <MicOff size={11} className="text-red-400" /> : <Mic size={11} className="text-zuno-mint" />}
              </div>
              {isScreenSharing && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-zuno-blue/80 text-white text-2xs font-bold px-2 py-1 rounded-full">
                  <Share2 size={10} /> Presenting
                </div>
              )}
            </div>

            {/* Remote tiles */}
            {remotePeers.map(({ socketId }) => (
              <div key={socketId}
                className="video-tile cursor-pointer group hover:ring-2 hover:ring-zuno-blue/50 transition-all duration-200"
                onClick={() => { setFocusedSocketId(socketId); const e = peersRef.current.get(socketId); if (e?.videoEl && !e.isVideoOff) enterFullscreen(e.videoEl); }}>
                {peersRef.current.get(socketId)?.isVideoOff ? (
                  <div className="video-tile-avatar">
                    <div className="w-16 h-16 rounded-full bg-zuno-blue flex items-center justify-center">
                      <span className="text-xl font-black">{getInitials(getPeerName(socketId))}</span>
                    </div>
                  </div>
                ) : (
                  <video ref={el => { const e = peersRef.current.get(socketId); if (e) { e.videoEl = el; if (el && audioOutputDeviceId && typeof el.setSinkId === "function") el.setSinkId(audioOutputDeviceId).catch(() => { }); } }}
                    autoPlay playsInline className="w-full h-full object-cover" />
                )}
                <div className="video-tile-label opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>{getPeerName(socketId)}</span>
                  {peersRef.current.get(socketId)?.isMuted ? <MicOff size={11} className="text-red-400" /> : <Mic size={11} className="text-zuno-mint" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Chat panel ── */}
        {showChat && (
          <div className="w-72 sm:w-80 flex flex-col glass-dark border-l border-white/10 panel-enter flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MessageSquare size={15} className="text-zuno-blue" />
                <span className="text-sm font-bold">Chat</span>
              </div>
              <button onClick={() => setShowChat(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <MessageSquare size={28} className="text-white/20 mb-2" />
                  <p className="text-xs text-white/40 font-medium">No messages yet</p>
                  <p className="text-2xs text-white/30 mt-1">Start the conversation</p>
                </div>
              ) : chatMessages.map((msg) => {
                const isSelf = msg.sender === (user?.name || "You");
                return (
                  <div key={msg.id} className={`flex ${isSelf ? "justify-end" : "justify-start"} animate-fade-in`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${isSelf ? "bg-zuno-blue" : "bg-white/10"}`}>
                      {!isSelf && <p className="text-2xs font-bold text-zuno-blue mb-1">{msg.sender}</p>}
                      <p className="text-xs leading-relaxed">{msg.message}</p>
                      <p className="text-2xs mt-1 opacity-50">{msg.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2 p-3 border-t border-white/10">
              <input type="text" placeholder="Message…" value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/40 outline-none focus:border-zuno-blue/60 transition-colors" />
              <button type="submit"
                className="w-8 h-8 rounded-lg bg-zuno-blue hover:bg-zuno-blue-hover flex items-center justify-center flex-shrink-0 transition-colors">
                <Send size={13} />
              </button>
            </form>
          </div>
        )}

        {/* ── Participants panel ── */}
        {showParticipants && (
          <div className="w-72 sm:w-80 flex flex-col glass-dark border-l border-white/10 panel-enter flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-zuno-blue" />
                <span className="text-sm font-bold">Participants</span>
                <span className="text-2xs bg-white/10 text-white/60 px-1.5 py-0.5 rounded-full font-bold">{participants.length}</span>
              </div>
              <button onClick={() => setShowParticipants(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-zuno-blue flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {getInitials(p.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold truncate">{p.name}</span>
                      {p.isSelf && <span className="text-2xs bg-zuno-blue/30 text-zuno-blue px-1.5 py-0.5 rounded-full font-bold">You</span>}
                    </div>
                    <p className="text-2xs text-white/40 mt-0.5">{p.isMuted ? "Muted" : "Speaking"}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {p.isMuted
                      ? <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center"><MicOff size={11} className="text-red-400" /></div>
                      : <div className="w-6 h-6 rounded-lg bg-zuno-mint/20 flex items-center justify-center"><Mic size={11} className="text-zuno-mint" /></div>}
                    {p.isVideoOff
                      ? <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center"><VideoOff size={11} className="text-white/40" /></div>
                      : <div className="w-6 h-6 rounded-lg bg-zuno-blue/20 flex items-center justify-center"><Video size={11} className="text-zuno-blue" /></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Controls bar ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 glass-dark border-t border-white/10 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/40 font-mono">
          <Hash size={11} />{meetingId}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-none justify-center">
          {/* Mute */}
          <button onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 ${isMuted ? "bg-red-500 hover:bg-red-600" : "bg-white/10 hover:bg-white/20"}`}>
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          {/* Video */}
          <button onClick={toggleVideo} title={isVideoOff ? "Turn on camera" : "Turn off camera"}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 ${isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-white/10 hover:bg-white/20"}`}>
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>
          {/* Screen share */}
          <button onClick={toggleScreenShare} title={isScreenSharing ? "Stop sharing" : "Share screen"}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 ${isScreenSharing ? "bg-zuno-mint hover:bg-emerald-500" : "bg-white/10 hover:bg-white/20"}`}>
            <Share2 size={20} />
          </button>
          <div className="w-px h-8 bg-white/15 mx-1" />
          {/* End call */}
          <button onClick={handleLeaveMeeting} title="Leave meeting"
            className="w-14 h-12 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 transition-all duration-150 active:scale-95">
            <PhoneOff size={20} />
          </button>
          {/* Mobile overflow */}
          <div className="relative sm:hidden">
            <button onClick={() => setIsOptionOpen(!isOptionOpen)}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
              <EllipsisVertical size={20} />
            </button>
            {isOptionOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOptionOpen(false)} />
                <div className="absolute bottom-full right-0 mb-2 glass-dark border border-white/10 rounded-2xl p-2 space-y-1 z-20 animate-scale-in">
                  <button onClick={() => { setShowChat(!showChat); setIsOptionOpen(false); }}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${showChat ? "bg-zuno-blue" : "bg-white/10 hover:bg-white/20"}`}>
                    <MessageSquare size={18} />
                  </button>
                  <button onClick={() => { setShowParticipants(!showParticipants); setIsOptionOpen(false); }}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${showParticipants ? "bg-zuno-blue" : "bg-white/10 hover:bg-white/20"}`}>
                    <Users size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button onClick={() => setShowChat(!showChat)} title="Chat"
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 ${showChat ? "bg-zuno-blue hover:bg-zuno-blue-hover" : "bg-white/10 hover:bg-white/20"}`}>
            <MessageSquare size={18} />
          </button>
          <button onClick={() => setShowParticipants(!showParticipants)} title="Participants"
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 ${showParticipants ? "bg-zuno-blue hover:bg-zuno-blue-hover" : "bg-white/10 hover:bg-white/20"}`}>
            <Users size={18} />
          </button>
        </div>
      </div>

      {/* ── Toasts ── */}
      {toasts.length > 0 && (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
          {toasts.map((t) => (
            <div key={t.id} className="toast pointer-events-auto">
              <div className="w-1.5 h-1.5 rounded-full bg-zuno-blue flex-shrink-0" />
              {t.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MeetingRoom;
