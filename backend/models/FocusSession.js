import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null,
  },
  duration: {
    type: Number,
    required: true,
    default: 25, // Pomodoro default: 25 minutes
  },
  completed: {
    type: Boolean,
    default: false,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  ambientMode: {
    type: String,
    enum: ['silent', 'rain', 'ocean', 'forest', 'coffee'],
    default: 'silent',
  },
});

export default mongoose.model('FocusSession', focusSessionSchema);



