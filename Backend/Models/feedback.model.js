import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  meetingId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  callQuality: {
    type: String,
    enum: ['Excellent', 'Good', 'Okay', 'Poor'],
    required: true
  },
  comments: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
feedbackSchema.index({ meetingId: 1, userId: 1 });
feedbackSchema.index({ createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;

