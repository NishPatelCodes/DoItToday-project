import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['7-day', '30-day', 'custom'],
    default: '7-day',
  },
  duration: {
    type: Number, // in days
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active',
  },
  progress: {
    type: Number,
    default: 0, // 0-100
  },
  checkIns: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      notes: {
        type: String,
        trim: true,
      },
    },
  ],
  completedDate: {
    type: Date,
  },
  dpReward: {
    type: Number,
    default: 15, // Discipline Points reward
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate progress based on check-ins
challengeSchema.methods.calculateProgress = function () {
  if (!this.checkIns || this.checkIns.length === 0) {
    this.progress = 0;
    return;
  }

  const completedCheckIns = this.checkIns.filter((checkIn) => checkIn.completed).length;
  this.progress = Math.round((completedCheckIns / this.duration) * 100);

  // Mark as completed if progress reaches 100%
  if (this.progress >= 100 && this.status === 'active') {
    this.status = 'completed';
    this.completedDate = Date.now();
  }
};

// Check if challenge is completed today
challengeSchema.methods.isCheckedInToday = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return this.checkIns.some((checkIn) => {
    const checkInDate = new Date(checkIn.date);
    checkInDate.setHours(0, 0, 0, 0);
    return checkInDate.getTime() === today.getTime() && checkIn.completed;
  });
};

export default mongoose.model('Challenge', challengeSchema);

