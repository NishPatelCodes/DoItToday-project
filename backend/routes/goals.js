import express from 'express';
import Goal from '../models/Goal.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { awardXP, XP_REWARDS, calculateXPWithBonus } from '../utils/xpSystem.js';

const router = express.Router();

// @route   GET /api/goals
// @desc    Get all goals for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .exec();

    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/goals
// @desc    Create a new goal
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, deadline, category, isShared } = req.body;

    const goal = new Goal({
      userId: req.user._id,
      title,
      description: description || '',
      deadline,
      category: category || 'general',
      isShared: isShared || false,
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/goals/:id
// @desc    Update a goal
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, description, progress, deadline, category, isShared } = req.body;

    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const oldProgress = goal.progress || 0;
    const wasCompleted = oldProgress >= 100;
    
    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (progress !== undefined) goal.progress = Math.max(0, Math.min(100, progress));
    if (deadline !== undefined) goal.deadline = deadline;
    if (category !== undefined) goal.category = category;
    if (isShared !== undefined) goal.isShared = isShared;

    await goal.save();
    
    // Award XP for goal progress milestones and completion (only on increase)
    if (progress !== undefined && progress > oldProgress) {
      const user = await User.findById(req.user._id);
      const newProgress = goal.progress;
      const newCompleted = newProgress >= 100;
      
      // Only award completion XP once (when crossing 100%)
      if (newCompleted && !wasCompleted) {
        const xpWithBonus = calculateXPWithBonus(XP_REWARDS.GOAL_COMPLETION, user.streak || 0);
        await awardXP(user, xpWithBonus, `Goal completed: ${goal.title}`);
      } 
      // Award milestone XP only when crossing milestone thresholds (25%, 50%, 75%)
      else if (!newCompleted) {
        const oldMilestone = Math.floor(oldProgress / 25);
        const newMilestone = Math.floor(newProgress / 25);
        
        // Only award if we crossed a milestone threshold
        if (newMilestone > oldMilestone && newMilestone < 4) {
          const xpWithBonus = calculateXPWithBonus(XP_REWARDS.GOAL_MILESTONE, user.streak || 0);
          await awardXP(user, xpWithBonus, `Goal milestone: ${newMilestone * 25}%`);
        }
      }
    }
    
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/goals/:id
// @desc    Delete a goal
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/goals/shared
// @desc    Get shared goals from friends
router.get('/shared', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends');
    const friendIds = user.friends.map((f) => f._id);

    const sharedGoals = await Goal.find({
      userId: { $in: friendIds },
      isShared: true,
    })
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .exec();

    res.json(sharedGoals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

