import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  submitFeedback,
  getMeetingFeedback,
  getUserFeedback,
  getFeedbackStats,
} from "../controllers/feedback.controller.js";

const router = express.Router();

// Submit feedback
router.post("/submit", protect, submitFeedback);

// Get feedback for a specific meeting
router.get("/meeting/:meetingId", protect, getMeetingFeedback);

// Get feedback statistics for a meeting (host only)
router.get("/stats/:meetingId", protect, getFeedbackStats);

// Get user's feedback history
router.get("/user", protect, getUserFeedback);

export default router;

