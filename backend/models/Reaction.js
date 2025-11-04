import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetType: {
    type: String,
    enum: ['task', 'goal', 'habit'],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  reactionType: {
    type: String,
    enum: ['like', 'cheer', 'fire'],
    default: 'like',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

reactionSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

export default mongoose.model('Reaction', reactionSchema);



