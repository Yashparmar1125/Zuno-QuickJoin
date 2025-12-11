import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/user.routes.js";
import meetingRoutes from "./routes/meeting.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import healthRoutes from "./routes/health.routes.js";
import morgan from "morgan";

// CORS allowed origins - can be set via environment variable
const getAllowedOrigins = () => {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  }
  // Default origins for development
  if (process.env.NODE_ENV !== 'production') {
    return [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ];
  }
  // In production, require ALLOWED_ORIGINS to be set
  return [];
};

export const allowedOrigins = getAllowedOrigins();

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In production, log but don't expose details
      if (process.env.NODE_ENV === 'production') {
        console.warn(`CORS blocked origin: ${origin}`);
      }
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

// CORS
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // Apache combined log format
} else {
  app.use(morgan('dev'));
}

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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
  // Log error for monitoring
  if (process.env.NODE_ENV === 'production') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });
  } else {
    console.error('Error:', err);
  }

  // Handle known CORS error explicitly
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({ 
      success: false,
      message: "CORS Error: Origin not allowed" 
    });
  }

  // Mongoose validation error
  if (err && err.name === "ValidationError") {
    return res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }

  // Mongoose duplicate key error
  if (err && err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ 
      success: false,
      message: `${field} already exists` 
    });
  }

  // JWT errors
  if (
    err &&
    (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError")
  ) {
    return res.status(401).json({ 
      success: false,
      message: "Invalid or expired token" 
    });
  }

  // Cast errors (invalid ObjectId, etc.)
  if (err && err.name === "CastError") {
    return res.status(400).json({ 
      success: false,
      message: "Invalid resource ID" 
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Only include stack in non-production
  const payload = { 
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : message 
  };
  
  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
    payload.details = err.message;
  }

  res.status(status).json(payload);
});

export default app;
