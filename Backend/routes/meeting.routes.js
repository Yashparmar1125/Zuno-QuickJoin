import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createMeeting,
  getMeetingById,
  getRecentMeetings,
  deleteMeeting,
} from "../controllers/meeting.controller.js";

const router = express.Router();

router.post("/create", protect, createMeeting);
// define specific routes before param routes
router.get("/recent", protect, getRecentMeetings);
router.delete("/:meetingId", protect, deleteMeeting);
router.get("/:meetingId", getMeetingById);

export default router;