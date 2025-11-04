import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'first_task',
      'streak_3',
      'streak_7',
      'streak_30',
      'streak_100',
      'tasks_10',
      'tasks_50',
      'tasks_100',
      'goal_complete',
      'habits_7',
      'habits_30',
      'level_5',
      'level_10',
      'level_25',
      'focus_master',
      'social_butterfly',
    ],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '🏆',
  },
  earnedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Badge', badgeSchema);



