import Meeting from "../Models/meeting.model.js";

// Fetch recent meetings for current user (joined/hosted)
export const getRecentMeetings = async (req, res) => {
  try {
    const userId = req.user._id;
    const meetings = await Meeting.find({
      $or: [{ hostId: userId }, { "participants.userId": userId }],
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("meetingId title description updatedAt startedAt endedAt participants hostId settings");

    const shaped = meetings.map((m) => {
      const userParticipant = m.participants.find((p) => `${p.userId}` === `${userId}`);
      const isHost = `${m.hostId}` === `${userId}`;
      return {
        meetingId: m.meetingId,
        title: m.title,
        description: m.description,
        startedAt: m.startedAt,
        endedAt: m.endedAt,
        updatedAt: m.updatedAt,
        participants: m.participants?.length || 0,
        hostId: m.hostId,
        isHost,
        joinedAt: userParticipant?.joinedAt || m.startedAt,
        settings: m.settings,
      };
    });

    const hostedCount = meetings.filter(
      (m) => `${m.hostId}` === `${userId}`
    ).length;
    const joinedCount = meetings.length - hostedCount;

    res.status(200).json({
      meetings: shaped,
      hostedCount,
      joinedCount,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Create a meeting for the authenticated user
export const createMeeting = async (req, res) => {
  try {
    const {
      meetingId,
      title,
      description,
      settings,
      scheduledFor,
    } = req.body;

    const meeting = await Meeting.create({
      meetingId:
        meetingId ||
        Math.random().toString(36).substring(2, 10).toUpperCase(),
      title: title || "",
      description: description || "",
      hostId: req.user._id,
      settings: {
        muteOnJoin: settings?.muteOnJoin ?? false,
        videoOffByDefault: settings?.videoOffByDefault ?? false,
        allowScreenShare: settings?.allowScreenShare ?? true,
        allowChat: settings?.allowChat ?? true,
        requireAuth: settings?.requireAuth ?? false,
        maxParticipants: settings?.maxParticipants ?? 100,
      },
      scheduledFor: scheduledFor || null,
    });
    res.status(201).json({ meeting });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Fetch meeting details by meetingId
export const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      meetingId: req.params.meetingId,
    }).populate("participants.userId", "name email photoURL");
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    res.json({ meeting });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete/Archive a meeting (only host can delete)
export const deleteMeeting = async (req, res) => {
  try {
    const userId = req.user._id;
    const meeting = await Meeting.findOne({
      meetingId: req.params.meetingId,
    });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    if (`${meeting.hostId}` !== `${userId}`) {
      return res.status(403).json({ message: "Only the host can delete this meeting" });
    }
    await Meeting.deleteOne({ meetingId: req.params.meetingId });
    res.status(200).json({ message: "Meeting deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


