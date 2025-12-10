import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import meetingRoutes from "./routes/meeting.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import healthRoutes from "./routes/health.routes.js";
import morgan from "morgan";


export const allowedOrigins = [
  "http://localhost:5173",
  "https://video-conferencing-app-one-coral.vercel.app",
  "http://10.61.152.167:5173",
  "https://c20034db902e.ngrok-free.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

const app = express();

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use("/api/health", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/feedback", feedbackRoutes);

app.get("/", (req, res) => {
  res.send("Root route working");
});

// Handle CORS errors gracefully
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS Error: Origin not allowed" });
  }
  next(err);
});

// 404 handler (for unmatched routes)
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  // Handle known CORS error explicitly
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS Error: Origin not allowed" });
  }

  // Mongoose validation error
  if (err && err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  // JWT errors
  if (
    err &&
    (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError")
  ) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Only include stack in non-production
  const payload = { message };
  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
});

export default app;
