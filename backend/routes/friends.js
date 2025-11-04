import express from 'express';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Goal from '../models/Goal.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/friends
// @desc    Get all friends of the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'name email avatar streak totalTasksCompleted lastActiveDate')
      .exec();

    res.json(user.friends || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/friends/add
// @desc    Add a friend by email
router.post('/add', authenticate, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const friend = await User.findOne({ email });
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (friend._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot add yourself as a friend' });
    }

    const user = await User.findById(req.user._id);

    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: 'User is already a friend' });
    }

    user.friends.push(friend._id);
    await user.save();

    const friendData = await User.findById(friend._id).select(
      'name email avatar streak totalTasksCompleted lastActiveDate'
    );

    res.json(friendData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/friends/:id
// @desc    Remove a friend
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.friends = user.friends.filter(
      (friendId) => friendId.toString() !== req.params.id
    );
    await user.save();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/friends/leaderboard
// @desc    Get friends leaderboard sorted by streak and tasks completed
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends');
    const friendIds = user.friends.map((f) => f._id);

    // Include current user in leaderboard
    const allUsers = [req.user._id, ...friendIds];

    const leaderboard = await User.find({ _id: { $in: allUsers } })
      .select('name email avatar streak totalTasksCompleted')
      .sort({ streak: -1, totalTasksCompleted: -1 })
      .exec();

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/friends/:id/activity
// @desc    Get friend's activity (tasks and goals)
router.get('/:id/activity', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const isFriend = user.friends.some(
      (friendId) => friendId.toString() === req.params.id
    );

    if (!isFriend) {
      return res.status(403).json({ message: 'Not a friend' });
    }

    const [tasks, goals] = await Promise.all([
      Task.find({ userId: req.params.id, isShared: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .exec(),
      Goal.find({ userId: req.params.id, isShared: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .exec(),
    ]);

    res.json({ tasks, goals });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;


