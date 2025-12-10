import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Copy,
  MessageSquare,
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Send,
  X,
  EllipsisVertical,
  Clock,
  Volume2,
  Share2,
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
    const list = [
      {
        id: "self",
        name: user?.name || "You",
        isMuted,
        isVideoOff,
        isSelf: true,
      },
    ];
    remotePeers.forEach(({ socketId }) => {
      const entry = peersRef.current.get(socketId) || {};
      list.push({
        id: socketId,
        name: entry.name || "Peer",
        isMuted: entry.isMuted ?? false,
        isVideoOff: entry.isVideoOff ?? false,
        isSelf: false,
      });
    });
    return list;
  }, [user, isMuted, isVideoOff, remotePeers]);

  const getInitials = (name) => {
    const src = (name || "").trim();
    if (!src) return "?";
    const parts = src.split(/\s+/);
    const a = parts[0]?.[0] || "";
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (a + b).toUpperCase();
  };


  const rtcConfig = {
    iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
  };

  const addLocalTracks = (pc) => {
    if (!localStreamRef.current) return;
    localStreamRef.current
      .getTracks()
      .forEach((track) => pc.addTrack(track, localStreamRef.current));
  };

  const getPeerName = (socketId) =>
    (peersRef.current.get(socketId) && peersRef.current.get(socketId).name) ||
    "Peer";

  const updateAudioDeviceName = async () => {
    try {
      if (!navigator.mediaDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const out = devices.find((d) => d.kind === "audiooutput");
      setAudioOutputDeviceId(out?.deviceId || null);
      setAudioOutputName(out?.label || "Default Output");

      if (out?.deviceId) {
        peersRef.current.forEach((entry) => {
          try {
            const el = entry.videoEl;
            if (el && typeof el.setSinkId === "function") {
              el.setSinkId(out.deviceId).catch(() => {});
            }
          } catch {
            // Ignore setSinkId errors
          }
        });
        try {
          if (
            localVideoRef.current &&
            typeof localVideoRef.current.setSinkId === "function"
          ) {
            localVideoRef.current.setSinkId(out.deviceId).catch(() => {});
          }
        } catch {
          // Ignore setSinkId errors
        }
      }
    } catch {
      // Ignore device enumeration errors
    }
  };

  const createPeer = (remoteSocketId) => {
    const pc = new RTCPeerConnection(rtcConfig);
    addLocalTracks(pc);

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("ice-candidate", {
          meetingId,
          candidate: event.candidate,
          from: socketRef.current.id,
        });
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      let entry = peersRef.current.get(remoteSocketId);
      if (!entry) return;
      if (entry.videoEl) {
        entry.videoEl.srcObject = stream;
      }
    };

    const existing = peersRef.current.get(remoteSocketId) || {};
    peersRef.current.set(remoteSocketId, {
      ...existing,
      pc,
      videoEl: existing.videoEl || null,
    });
    setRemotePeers((prev) => {
      const map = new Map(prev.map((p) => [p.socketId, p]));
      if (!map.has(remoteSocketId))
        map.set(remoteSocketId, {
          socketId: remoteSocketId,
          name: existing.name || "Peer",
          isMuted: false,
          isVideoOff: false,
        });
      return Array.from(map.values());
    });
    return pc;
  };

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("en", {
          hour: "numeric",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.title = `Meeting: ${meetingId}`;

    let isMounted = true;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (!isMounted) return;
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        updateAudioDeviceName();
        try {
          navigator.mediaDevices.addEventListener(
            "devicechange",
            updateAudioDeviceName
          );
        } catch {
          // Ignore addEventListener errors (some browsers)
        }

        const socket = createSocket(token);
        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("join-meeting", {
            meetingId,
          });
        });

        socket.io.on("reconnect_attempt", () => addToast("Reconnecting..."));
        socket.io.on("reconnect", () => addToast("Reconnected"));
        socket.io.on("error", () => addToast("Socket error"));
        socket.on("disconnect", () => addToast("Disconnected"));
        socket.on("connect_error", (err) => {
          const msg =
            err?.message === "Unauthorized"
              ? "Authentication required. Redirecting to login…"
              : "Connection error. Please login again.";
          addToast(msg);
          setTimeout(() => navigate("/"), 800);
        });

        socket.on("user-joined", async ({ socketId: remoteId, userName }) => {
          const entry = peersRef.current.get(remoteId) || {};
          peersRef.current.set(remoteId, {
            ...entry,
            name: userName || "Peer",
          });
          setRemotePeers((prev) =>
            prev.map((p) =>
              p.socketId === remoteId ? { ...p, name: userName || "Peer" } : p
            )
          );
          const pc = createPeer(remoteId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { meetingId, offer, from: socket.id });
        });

        socket.on("offer", async ({ offer, from }) => {
          let entry = peersRef.current.get(from);
          if (!entry) {
          createPeer(from);
          entry = peersRef.current.get(from);
        }
        const pc = peersRef.current.get(from).pc;
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { meetingId, answer, from: socket.id });
        });

        socket.on("answer", async ({ answer, from }) => {
          const entry = peersRef.current.get(from);
          if (!entry) return;
          await entry.pc.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        });

        socket.on("ice-candidate", async ({ candidate, from }) => {
          const entry = peersRef.current.get(from);
          if (!entry) return;
          try {
            await entry.pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch {
            // Ignore ICE candidate errors
          }
        });

        socket.on("user-left", ({ socketId }) => {
          const entry = peersRef.current.get(socketId);
          if (entry) {
            entry.pc.close();
            peersRef.current.delete(socketId);
            setRemotePeers((prev) =>
              prev.filter((p) => p.socketId !== socketId)
            );
          }
        });

        socket.on("chat-message", ({ message, sender, timestamp, from }) => {
          setChatMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              sender,
              message,
              timestamp: new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
          if (!showChatRef.current && from !== socketRef.current?.id) {
            addToast(`${sender}: ${message}`);
          }
        });

        socket.on(
          "media-state",
          ({ isMuted, isVideoOff, from, isScreenSharing }) => {
            const id = from;
            const key = id || Array.from(peersRef.current.keys())[0];
            if (!key) return;
            const entry = peersRef.current.get(key) || {};
            peersRef.current.set(key, { ...entry, isMuted, isVideoOff });
            setRemotePeers((prev) =>
              prev.map((p) =>
                p.socketId === key ? { ...p, isMuted, isVideoOff } : p
              )
            );
            if (typeof isScreenSharing === "boolean") {
              if (isScreenSharing) {
                const name = getPeerName(key);
                setRemotePresenterId(key);
                setRemotePresenterName(name);
                setFocusedSocketId((curr) => curr || key);
              } else if (remotePresenterId === key) {
                setRemotePresenterId(null);
                setRemotePresenterName("");
              }
            }
          }
        );
      } catch (err) {
        console.error("Media error", err);
        addToast("Could not access camera/microphone");
      }
    };

    start();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.emit("leave-meeting", {
          meetingId,
          userId: user?._id || "anon",
        });
        socketRef.current.disconnect();
      }
      peersRef.current.forEach(({ pc }) => pc.close());
      peersRef.current.clear();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      try {
        navigator.mediaDevices.removeEventListener(
          "devicechange",
          updateAudioDeviceName
        );
      } catch {
        // Ignore removeEventListener errors
      }
      document.title = "Zuno";
    };
  }, [meetingId, user]);

  const handleLeaveMeeting = () => {
    const durationMs = Date.now() - (meetingStartRef.current || Date.now());
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    const durationLabel = `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
    const participantsCount = 1 + remotePeers.length;
    navigate("/call-ended", {
      state: {
        meetingId,
        duration: durationLabel,
        participants: participantsCount,
      },
    });
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => (t.enabled = !next));
      
      // Update tracks in all peer connections
      peersRef.current.forEach(({ pc }) => {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === "audio");
        if (sender && audioTracks[0]) {
          sender.replaceTrack(audioTracks[0]).catch(() => {});
        }
      });
    }
    if (socketRef.current) {
      socketRef.current.emit("media-state", {
        meetingId,
        userId: user?._id || "anon",
        isMuted: next,
        isVideoOff,
        from: socketRef.current.id,
      });
    }
  };

  const toggleVideo = () => {
    const next = !isVideoOff;
    setIsVideoOff(next);
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((t) => (t.enabled = !next));
      
      // Reattach stream to video element when turning video back on
      if (!next && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      
      // Update tracks in all peer connections
      peersRef.current.forEach(({ pc }) => {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender && videoTracks[0]) {
          sender.replaceTrack(videoTracks[0]).catch(() => {});
        }
      });
    }
    if (socketRef.current) {
      socketRef.current.emit("media-state", {
        meetingId,
        userId: user?._id || "anon",
        isMuted,
        isVideoOff: next,
        from: socketRef.current.id,
      });
    }
  };

  const startScreenShare = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = displayStream.getVideoTracks()[0];
      peersRef.current.forEach(({ pc }) => {
        const sender = pc
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender) sender.replaceTrack(screenTrack);
      });
      if (localVideoRef.current)
        localVideoRef.current.srcObject = displayStream;
      setIsScreenSharing(true);
      if (socketRef.current) {
        socketRef.current.emit("media-state", {
          meetingId,
          userId: user?._id || "anon",
          isMuted,
          isVideoOff,
          isScreenSharing: true,
          from: socketRef.current.id,
        });
      }
      screenTrack.onended = () => {
        stopScreenShare();
      };
      } catch {
        addToast("Screen share cancelled");
      }
  };

  const stopScreenShare = async () => {
    if (!localStreamRef.current) return;
    const camTrack = localStreamRef.current.getVideoTracks()[0];
    peersRef.current.forEach(({ pc }) => {
      const sender = pc
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");
      if (sender && camTrack) sender.replaceTrack(camTrack);
    });
    if (localVideoRef.current)
      localVideoRef.current.srcObject = localStreamRef.current;
    setIsScreenSharing(false);
    if (socketRef.current) {
      socketRef.current.emit("media-state", {
        meetingId,
        userId: user?._id || "anon",
        isMuted,
        isVideoOff,
        isScreenSharing: false,
        from: socketRef.current.id,
      });
    }
  };

  const toggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      const payload = {
        meetingId,
        message: chatMessage,
        sender: user?.name || "You",
        userId: user?._id || "anon",
      };
      if (socketRef.current) {
        socketRef.current.emit("chat-message", payload);
      }
      setChatMessage("");
    }
  };

  const addToast = (msg) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      5000
    );
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/meeting/${meetingId}`;
    const message = `To join the video meeting, click this link: ${url} \n\nOr join manually using Meeting ID: ${meetingId}`;

    try {
      await navigator.clipboard.writeText(message);
      addToast("Invitation message copied");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = message;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      addToast("Invitation message copied");
    }
  };

  useEffect(() => {
    showChatRef.current = showChat;
  }, [showChat]);

  const enterFullscreen = (el) => {
    if (!el) return;
    const anyEl = el;
    if (anyEl.requestFullscreen) anyEl.requestFullscreen();
    else if (anyEl.webkitRequestFullscreen) anyEl.webkitRequestFullscreen();
    else if (anyEl.mozRequestFullScreen) anyEl.mozRequestFullScreen();
    else if (anyEl.msRequestFullscreen) anyEl.msRequestFullscreen();
  };

  const totalParticipants = 1 + remotePeers.length;
  const gridCols =
    totalParticipants <= 2
      ? "grid-cols-1 lg:grid-cols-2"
      : totalParticipants <= 4
      ? "grid-cols-2"
      : "grid-cols-2 lg:grid-cols-3";

  return (
    <div className="flex flex-col h-screen bg-zuno-soft text-zuno-charcoal overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white/98 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo_white.png"
              alt="Zuno"
              className="h-10 w-auto"
            />
            <div>
              <h2 className="text-lg font-bold text-zuno-charcoal leading-tight">
                {meetingId}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-zuno-charcoal/60 mt-0.5">
                <Clock size={12} />
                <span className="font-medium">{currentTime}</span>
                <span className="mx-1">•</span>
                <span>{totalParticipants} {totalParticipants === 1 ? 'participant' : 'participants'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => addToast(`Output: ${audioOutputName}`)}
            title={`Audio output: ${audioOutputName}`}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200/80 text-zuno-charcoal/70 hover:bg-zuno-blue/5 hover:border-zuno-blue/30 transition-all duration-200 text-sm group"
          >
            <Volume2 size={16} className="text-zuno-blue group-hover:scale-110 transition-transform" />
            <span className="max-w-[120px] truncate text-xs font-medium">
              {audioOutputName || "Default Output"}
            </span>
          </button>
          <button
            onClick={handleCopyLink}
            title="Copy meeting link"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zuno-blue text-white font-semibold hover:bg-zuno-blue-strong hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
          >
            <Copy size={16} />
            <span className="hidden sm:inline">Copy Link</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Presenter Banner */}
        {isScreenSharing && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-zuno-blue text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-xl backdrop-blur-sm animate-pulse">
            <div className="flex items-center gap-2">
              <Share2 size={16} />
              <span>You are presenting</span>
            </div>
          </div>
        )}
        {remotePresenterId && !isScreenSharing && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-zuno-blue text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Share2 size={16} />
              <span>{remotePresenterName} is presenting</span>
            </div>
          </div>
        )}

        {/* Video Grid */}
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          {focusedSocketId ? (
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-white border-2 border-gray-200 shadow-2xl group hover:border-zuno-blue/50 transition-all duration-300">
                {focusedSocketId === "self" ? (
                  isVideoOff ? (
                    <div className="w-full h-full flex items-center justify-center bg-zuno-soft">
                      <div className="w-32 h-32 rounded-full bg-zuno-blue flex items-center justify-center shadow-lg">
                        <span className="text-4xl font-bold text-white">
                          {getInitials(user?.name || "You")}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <video
                      ref={(el) => {
                        if (el && localStreamRef.current) {
                          el.srcObject = localStreamRef.current;
                        }
                        localVideoRef.current = el;
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  )
                ) : peersRef.current.get(focusedSocketId) &&
                  peersRef.current.get(focusedSocketId).isVideoOff ? (
                  <div className="w-full h-full flex items-center justify-center bg-zuno-soft">
                    <div className="w-32 h-32 rounded-full bg-zuno-blue flex items-center justify-center shadow-lg">
                      <span className="text-4xl font-bold text-white">
                        {getInitials(getPeerName(focusedSocketId))}
                      </span>
                    </div>
                  </div>
                ) : (
                  <video
                    ref={(el) => {
                      const entry = peersRef.current.get(focusedSocketId);
                      if (entry) {
                        entry.videoEl = el;
                        try {
                          if (
                            el &&
                            audioOutputDeviceId &&
                            typeof el.setSinkId === "function"
                          ) {
                            el.setSinkId(audioOutputDeviceId).catch(() => {});
                          }
                        } catch {
                          // Ignore setSinkId errors
                        }
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/95 backdrop-blur-md border border-gray-200/80 px-4 py-2 rounded-xl shadow-lg">
                  <span className="text-sm font-bold text-zuno-charcoal">
                    {focusedSocketId === "self"
                      ? user?.name || "You"
                      : getPeerName(focusedSocketId)}
                  </span>
                  {focusedSocketId === "self" && isMuted && (
                    <div className="p-1.5 bg-red-500 rounded-full shadow-md">
                      <MicOff size={14} className="text-white" />
                    </div>
                  )}
                  {focusedSocketId === "self" && !isMuted && (
                    <div className="p-1.5 bg-zuno-mint rounded-full shadow-md animate-pulse">
                      <Mic size={14} className="text-white" />
                    </div>
                  )}
                  {focusedSocketId !== "self" && peersRef.current.get(focusedSocketId)?.isMuted && (
                    <div className="p-1.5 bg-red-500 rounded-full shadow-md">
                      <MicOff size={14} className="text-white" />
                    </div>
                  )}
                  {focusedSocketId !== "self" && !peersRef.current.get(focusedSocketId)?.isMuted && (
                    <div className="p-1.5 bg-zuno-mint rounded-full shadow-md animate-pulse">
                      <Mic size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <div className={`grid ${gridCols} gap-4`}>
            <div
              className="relative aspect-video rounded-xl overflow-hidden bg-white border-2 border-gray-200 cursor-pointer hover:border-zuno-blue hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
              onClick={() => {
                setFocusedSocketId("self");
                if (!isVideoOff) enterFullscreen(localVideoRef.current);
              }}
            >
              {isVideoOff ? (
                <div className="w-full h-full flex items-center justify-center bg-zuno-soft">
                  <div className="w-24 h-24 rounded-full bg-zuno-blue flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {getInitials(user?.name || "You")}
                    </span>
                  </div>
                </div>
              ) : (
                <video
                  ref={(el) => {
                    if (el && localStreamRef.current) {
                      el.srcObject = localStreamRef.current;
                    }
                    localVideoRef.current = el;
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-white/95 backdrop-blur-md border border-gray-200/80 px-2.5 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-xs font-bold text-zuno-charcoal">
                  {user?.name || "You"}
                </span>
                {isMuted ? (
                  <div className="p-1 bg-red-500 rounded-full shadow-sm">
                    <MicOff size={12} className="text-white" />
                  </div>
                ) : (
                  <div className="p-1 bg-zuno-mint rounded-full shadow-sm animate-pulse">
                    <Mic size={12} className="text-white" />
                  </div>
                )}
              </div>
            </div>

            {remotePeers.map(({ socketId }) => (
              <div
                key={socketId}
                className="relative aspect-video rounded-xl overflow-hidden bg-white border-2 border-gray-200 cursor-pointer hover:border-zuno-blue hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
                onClick={() => {
                  setFocusedSocketId(socketId);
                  const entry = peersRef.current.get(socketId);
                  if (entry && entry.videoEl && !entry.isVideoOff)
                    enterFullscreen(entry.videoEl);
                }}
              >
                {peersRef.current.get(socketId) &&
                peersRef.current.get(socketId).isVideoOff ? (
                  <div className="w-full h-full flex items-center justify-center bg-zuno-soft">
                    <div className="w-24 h-24 rounded-full bg-zuno-blue flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-white">
                        {getInitials(
                          (peersRef.current.get(socketId) &&
                            peersRef.current.get(socketId).name) ||
                            "Peer"
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <video
                    ref={(el) => {
                      const entry = peersRef.current.get(socketId);
                      if (entry) {
                        entry.videoEl = el;
                        try {
                          if (
                            el &&
                            audioOutputDeviceId &&
                            typeof el.setSinkId === "function"
                          ) {
                            el.setSinkId(audioOutputDeviceId).catch(() => {});
                          }
                        } catch {
                          // Ignore setSinkId errors
                        }
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-white/95 backdrop-blur-md border border-gray-200/80 px-2.5 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-xs font-bold text-zuno-charcoal">
                    {(peersRef.current.get(socketId) &&
                      peersRef.current.get(socketId).name) ||
                      "Peer"}
                  </span>
                  {peersRef.current.get(socketId)?.isMuted ? (
                    <div className="p-1 bg-red-500 rounded-full shadow-sm">
                      <MicOff size={12} className="text-white" />
                    </div>
                  ) : (
                    <div className="p-1 bg-zuno-mint rounded-full shadow-sm animate-pulse">
                      <Mic size={12} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-full sm:w-80 bg-white border-l border-gray-200/80 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-200/80 bg-zuno-soft">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zuno-blue flex items-center justify-center">
                  <MessageSquare size={18} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-zuno-charcoal">Chat</h3>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <X size={20} className="text-zuno-charcoal/70" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
              {chatMessages.length === 0 ? (
                <div className="text-center text-zuno-charcoal/50 mt-12">
                  <div className="w-16 h-16 rounded-full bg-zuno-blue/10 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={32} className="text-zuno-blue/50" />
                  </div>
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs mt-1">Start the conversation!</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isSelf = msg.sender === (user?.name || "You");
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isSelf ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                          isSelf
                            ? "bg-zuno-blue text-white"
                            : "bg-white border border-gray-200 text-zuno-charcoal"
                        }`}
                      >
                        {!isSelf && (
                          <div className="text-xs font-semibold text-zuno-blue mb-1">
                            {msg.sender}
                          </div>
                        )}
                        <p className={`text-sm ${isSelf ? 'text-white' : 'text-zuno-charcoal/90'}`}>
                          {msg.message}
                        </p>
                        <div className={`text-xs mt-1 ${isSelf ? 'text-white/70' : 'text-zuno-charcoal/50'}`}>
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200/80 bg-white flex gap-2"
            >
              <input
                type="text"
                placeholder="Type a message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-zuno-charcoal placeholder-zuno-charcoal/50 focus:outline-none focus:ring-2 focus:ring-zuno-blue focus:border-transparent transition-all duration-200"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-zuno-blue text-white hover:bg-zuno-blue-strong hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}

        {/* Participants Panel */}
        {showParticipants && (
          <div className="w-full sm:w-80 bg-white border-l border-gray-200/80 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-200/80 bg-zuno-soft">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zuno-blue flex items-center justify-center">
                  <Users size={18} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-zuno-charcoal">
                  Participants
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-zuno-blue/10 text-xs font-semibold text-zuno-blue">
                  {participants.length}
                </span>
              </div>
              <button
                onClick={() => setShowParticipants(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <X size={20} className="text-zuno-charcoal/70" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/50">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 border border-transparent hover:border-gray-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-zuno-blue flex items-center justify-center font-bold text-white flex-shrink-0 shadow-md">
                    {getInitials(participant.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zuno-charcoal truncate">
                        {participant.name}
                      </span>
                      {participant.isSelf && (
                        <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-zuno-blue/10 text-zuno-blue">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zuno-charcoal/60 mt-0.5">
                      {participant.isMuted ? "Muted" : "Speaking"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {participant.isMuted ? (
                      <div className="p-2 bg-red-100 rounded-lg shadow-sm">
                        <MicOff size={14} className="text-red-500" />
                      </div>
                    ) : (
                      <div className="p-2 bg-zuno-mint/20 rounded-lg shadow-sm animate-pulse">
                        <Mic size={14} className="text-zuno-mint" />
                      </div>
                    )}
                    {participant.isVideoOff ? (
                      <div className="p-2 bg-gray-100 rounded-lg shadow-sm">
                        <VideoOff size={14} className="text-zuno-charcoal/50" />
                      </div>
                    ) : (
                      <div className="p-2 bg-zuno-blue/10 rounded-lg shadow-sm">
                        <Video size={14} className="text-zuno-blue" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-5 bg-white/98 backdrop-blur-md border-t border-gray-200/80 shadow-lg">
        <div className="hidden sm:flex items-center">
          <span className="px-3 py-1.5 rounded-xl bg-gray-100/80 text-zuno-charcoal/70 text-xs font-mono border border-gray-200/50">
            {meetingId}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center">
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 active:scale-95 ${
              isMuted
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/50"
                : "bg-gray-100 hover:bg-gray-200 text-zuno-charcoal hover:shadow-lg"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <MicOff size={24} />
            ) : (
              <Mic size={24} />
            )}
          </button>
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 active:scale-95 ${
              isVideoOff
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/50"
                : "bg-gray-100 hover:bg-gray-200 text-zuno-charcoal hover:shadow-lg"
            }`}
            title={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? (
              <VideoOff size={24} />
            ) : (
              <Video size={24} />
            )}
          </button>
          <button
            onClick={toggleScreenShare}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 active:scale-95 ${
              isScreenSharing
                ? "bg-zuno-mint text-white shadow-lg"
                : "bg-gray-100 hover:bg-gray-200 text-zuno-charcoal hover:shadow-lg"
            }`}
            title={isScreenSharing ? "Stop sharing" : "Share screen"}
          >
            <Share2 size={24} />
          </button>
          <div className="w-px h-8 bg-gray-300 mx-1" />
          <button
            onClick={handleLeaveMeeting}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
            title="Leave meeting"
          >
            <PhoneOff size={24} />
          </button>
          <div className="relative sm:hidden">
            <button
              onClick={() => setIsOptionOpen(!isOptionOpen)}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-zuno-charcoal transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
            >
              <EllipsisVertical size={24} />
            </button>
            {isOptionOpen && (
              <>
                <div
                  className="fixed inset-0 z-10 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
                  onClick={() => setIsOptionOpen(false)}
                />
                <div className="absolute bottom-full right-0 mb-3 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-xl p-2 space-y-2 z-20 shadow-2xl animate-in slide-in-from-bottom fade-in duration-200">
                  <button
                    onClick={() => {
                      setShowChat(!showChat);
                      setIsOptionOpen(false);
                    }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-110 ${
                      showChat
                        ? "bg-zuno-blue text-white shadow-md"
                        : "bg-gray-100 hover:bg-gray-200 text-zuno-charcoal"
                    }`}
                    title="Chat"
                  >
                    <MessageSquare size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setShowParticipants(!showParticipants);
                      setIsOptionOpen(false);
                    }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-110 ${
                      showParticipants
                        ? "bg-zuno-blue text-white shadow-md"
                        : "bg-gray-100 hover:bg-gray-200 text-zuno-charcoal"
                    }`}
                    title="Participants"
                  >
                    <Users size={20} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 active:scale-95 ${
              showChat 
                ? "bg-zuno-blue text-white shadow-lg hover:bg-zuno-blue-strong" 
                : "bg-gray-100 hover:bg-gray-200 text-zuno-charcoal hover:shadow-lg"
            }`}
            title="Chat"
          >
            <MessageSquare size={20} />
          </button>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 active:scale-95 ${
              showParticipants
                ? "bg-zuno-blue text-white shadow-lg hover:bg-zuno-blue-strong"
                : "bg-gray-100 hover:bg-gray-200 text-zuno-charcoal hover:shadow-lg"
            }`}
            title="Participants"
          >
            <Users size={20} />
          </button>
        </div>
      </div>

      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="bg-white/95 backdrop-blur-md border border-gray-200/80 text-zuno-charcoal px-5 py-3 rounded-xl shadow-2xl max-w-sm animate-in slide-in-from-right fade-in duration-300"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-zuno-blue animate-pulse" />
                <p className="text-sm font-medium">{t.msg}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MeetingRoom;
