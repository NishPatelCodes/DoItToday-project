import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  deadline: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    default: 'general',
  },
  isShared: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Goal', goalSchema);


