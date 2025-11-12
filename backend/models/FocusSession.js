import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  completedDuration: {
    type: Number, // in minutes
    default: 0,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'abandoned'],
    default: 'active',
  },
  ambientMode: {
    type: String,
    default: 'silent',
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  dpEarned: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate DP earned based on duration
focusSessionSchema.methods.calculateDP = function () {
  const minutes = this.completedDuration || this.duration;
  if (minutes >= 25) {
    this.dpEarned = 20; // Long session
  } else if (minutes >= 15) {
    this.dpEarned = 15;
  } else {
    this.dpEarned = 10; // Short session
  }
  return this.dpEarned;
};

export default mongoose.model('FocusSession', focusSessionSchema);
