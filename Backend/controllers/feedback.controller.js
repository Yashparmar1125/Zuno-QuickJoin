import Feedback from '../Models/feedback.model.js';
import Meeting from '../Models/meeting.model.js';

// Submit feedback
export const submitFeedback = async (req, res) => {
  try {
    const { meetingId, rating, callQuality, comments } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!meetingId || !rating || !callQuality) {
      return res.status(400).json({
        success: false,
        message: 'Meeting ID, rating, and call quality are required'
      });
    }

    // Check if user already submitted feedback for this meeting
    const existingFeedback = await Feedback.findOne({ meetingId, userId });
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this meeting'
      });
    }

    // Verify meeting exists
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      meetingId,
      userId,
      rating,
      callQuality,
      comments: comments || ''
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
};

// Get feedback for a meeting
export const getMeetingFeedback = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user._id;

    // Check if user has access to this meeting (host or participant)
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Only host can view all feedback
    const isHost = meeting.hostId.toString() === userId.toString();
    
    if (isHost) {
      const feedbacks = await Feedback.find({ meetingId })
        .populate('userId', 'name email photoURL')
        .sort({ createdAt: -1 });
      
      return res.json({
        success: true,
        data: feedbacks
      });
    } else {
      // Regular users can only see their own feedback
      const feedback = await Feedback.findOne({ meetingId, userId })
        .populate('userId', 'name email photoURL');
      
      return res.json({
        success: true,
        data: feedback ? [feedback] : []
      });
    }
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
};

// Get user's feedback history
export const getUserFeedback = async (req, res) => {
  try {
    const userId = req.user._id;

    const feedbacks = await Feedback.find({ userId })
      .populate('userId', 'name email photoURL')
      .sort({ createdAt: -1 })
      .limit(50);

    // Get meeting details for each feedback
    const feedbacksWithMeetings = await Promise.all(
      feedbacks.map(async (feedback) => {
        const meeting = await Meeting.findOne({ meetingId: feedback.meetingId })
          .select('meetingId title');
        return {
          ...feedback.toObject(),
          meeting: meeting || { meetingId: feedback.meetingId, title: '' }
        };
      })
    );

    res.json({
      success: true,
      data: feedbacksWithMeetings
    });
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback history',
      error: error.message
    });
  }
};

// Get feedback statistics for a meeting (host only)
export const getFeedbackStats = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user._id;

    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Only host can view stats
    if (meeting.hostId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only meeting host can view feedback statistics'
      });
    }

    const feedbacks = await Feedback.find({ meetingId });
    
    const stats = {
      total: feedbacks.length,
      averageRating: feedbacks.length > 0
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(2)
        : 0,
      callQualityDistribution: {
        Excellent: feedbacks.filter(f => f.callQuality === 'Excellent').length,
        Good: feedbacks.filter(f => f.callQuality === 'Good').length,
        Okay: feedbacks.filter(f => f.callQuality === 'Okay').length,
        Poor: feedbacks.filter(f => f.callQuality === 'Poor').length
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback statistics',
      error: error.message
    });
  }
};

