import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Meeting from "../Models/meeting.model.js";
import User from "../Models/user.model.js";
import initFirebaseAdmin from "../config/firebaseAdmin.js";
import { ensureUserForFirebase } from "../middleware/auth.middleware.js";

// Encapsulate Socket.IO setup to keep app.js lean
const setupSocket = (server, allowedOrigins = []) => {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  // Socket auth: verify JWT or Firebase ID token from handshake
  io.use(async (socket, next) => {
    try {
      const headerAuth =
        socket.handshake.headers && socket.handshake.headers.authorization;
      const fromHeader =
        headerAuth && headerAuth.startsWith("Bearer ")
          ? headerAuth.split(" ")[1]
          : null;
      const fromAuth =
        socket.handshake.auth && socket.handshake.auth.token
          ? socket.handshake.auth.token
          : null;
      const token = fromAuth || fromHeader;
      if (!token) {
        return next(new Error("Unauthorized"));
      }

      // 1) Try legacy JWT
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select(
          "_id name email photoURL"
        );
        if (user) {
          socket.authUser = user;
          return next();
        }
      } catch (_) {
        // fall through to Firebase
      }

      // 2) Try Firebase ID token
      const admin = initFirebaseAdmin();
      if (!admin) {
        return next(new Error("Unauthorized"));
      }
      try {
        const decodedFirebase = await admin.auth().verifyIdToken(token);
        const user = await ensureUserForFirebase(decodedFirebase);
        if (!user) {
          return next(new Error("Unauthorized"));
        }
        socket.authUser = user;
        return next();
      } catch (err) {
        return next(new Error("Unauthorized"));
      }
    } catch (err) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-meeting", ({ meetingId }) => {
      socket.join(meetingId);
      socket.meetingId = meetingId;
      socket.userId = socket.authUser?._id?.toString();

      socket.to(meetingId).emit("user-joined", {
        userId: socket.userId,
        userName: socket.authUser?.name || "User",
        socketId: socket.id,
      });

      // Persist meeting and participant
      (async () => {
        try {
          let meeting = await Meeting.findOne({ meetingId });
          if (!meeting) {
            meeting = await Meeting.create({
              meetingId,
              hostId: socket.userId,
              participants: [
                {
                  userId: socket.userId,
                  socketId: socket.id,
                  joinedAt: new Date(),
                },
              ],
              startedAt: new Date(),
              isActive: true,
            });
          } else {
            const exists = meeting.participants.some(
              (p) => p.socketId === socket.id
            );
            if (!exists) {
              meeting.participants.push({
                userId: socket.userId,
                socketId: socket.id,
                joinedAt: new Date(),
              });
            }
            meeting.isActive = true;
            if (!meeting.startedAt) meeting.startedAt = new Date();
            await meeting.save();
          }
        } catch (e) {
          console.error("Meeting persist error (join):", e.message);
        }
      })();
    });

    socket.on("offer", ({ meetingId, offer, from }) => {
      socket.to(meetingId).emit("offer", { offer, from });
    });

    socket.on("answer", ({ meetingId, answer, from }) => {
      socket.to(meetingId).emit("answer", { answer, from });
    });

    socket.on("ice-candidate", ({ meetingId, candidate, from }) => {
      socket.to(meetingId).emit("ice-candidate", { candidate, from });
    });

    socket.on("chat-message", ({ meetingId, message, sender, userId }) => {
      io.to(meetingId).emit("chat-message", {
        message,
        sender,
        userId,
        from: socket.id,
        timestamp: new Date(),
      });
    });

    socket.on("media-state", ({ meetingId, userId, isMuted, isVideoOff }) => {
      socket.to(meetingId).emit("media-state", { userId, isMuted, isVideoOff });
    });

    socket.on("leave-meeting", ({ meetingId, userId }) => {
      socket.to(meetingId).emit("user-left", { userId, socketId: socket.id });
      socket.leave(meetingId);

      // Update DB on leave
      (async () => {
        try {
          const meeting = await Meeting.findOne({ meetingId });
          if (meeting) {
            meeting.participants = meeting.participants.filter(
              (p) => p.socketId !== socket.id
            );
            if (meeting.participants.length === 0) {
              meeting.isActive = false;
              meeting.endedAt = new Date();
            }
            await meeting.save();
          }
        } catch (e) {
          console.error("Meeting persist error (leave):", e.message);
        }
      })();
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      if (socket.meetingId && socket.userId) {
        socket.to(socket.meetingId).emit("user-left", {
          userId: socket.userId,
          socketId: socket.id,
        });
        // Persist disconnect similar to leave
        (async () => {
          try {
            const meeting = await Meeting.findOne({
              meetingId: socket.meetingId,
            });
            if (meeting) {
              meeting.participants = meeting.participants.filter(
                (p) => p.socketId !== socket.id
              );
              if (meeting.participants.length === 0) {
                meeting.isActive = false;
                meeting.endedAt = new Date();
              }
              await meeting.save();
            }
          } catch (e) {
            console.error("Meeting persist error (disconnect):", e.message);
          }
        })();
      }
    });
  });

  return io;
};

export default setupSocket;

