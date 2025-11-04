import express from 'express';
import Goal from '../models/Goal.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

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

    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (progress !== undefined) goal.progress = Math.max(0, Math.min(100, progress));
    if (deadline !== undefined) goal.deadline = deadline;
    if (category !== undefined) goal.category = category;
    if (isShared !== undefined) goal.isShared = isShared;

    await goal.save();
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

