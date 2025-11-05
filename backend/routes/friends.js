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
      .populate('friends', 'name email avatar streak totalTasksCompleted lastActiveDate xp level')
      .populate('friendRequests', 'name email avatar')
      .populate('sentFriendRequests', 'name email avatar')
      .exec();

    res.json({
      friends: user.friends || [],
      friendRequests: user.friendRequests || [],
      sentFriendRequests: user.sentFriendRequests || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/friends/add
// @desc    Send a friend request by email
router.post('/add', authenticate, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const friend = await User.findOne({ email });
    if (!friend) {
      return res.status(404).json({ message: 'User not found with this email address' });
    }

    if (friend._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot add yourself as a friend' });
    }

    const user = await User.findById(req.user._id);

    // Check if already friends
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: 'User is already your friend' });
    }

    // Check if already sent a request
    if (user.sentFriendRequests.includes(friend._id)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Check if they already sent you a request (auto-accept)
    if (friend.sentFriendRequests.includes(user._id)) {
      // Auto-accept: Both add each other as friends
      user.friends.push(friend._id);
      friend.friends.push(user._id);
      
      // Remove from pending requests
      user.sentFriendRequests = user.sentFriendRequests.filter(
        id => id.toString() !== friend._id.toString()
      );
      friend.sentFriendRequests = friend.sentFriendRequests.filter(
        id => id.toString() !== user._id.toString()
      );
      friend.friendRequests = friend.friendRequests.filter(
        id => id.toString() !== user._id.toString()
      );

      await user.save();
      await friend.save();

      const friendData = await User.findById(friend._id).select(
        'name email avatar streak totalTasksCompleted lastActiveDate xp level'
      );

      return res.json({ 
        message: 'Friend request accepted! You are now friends.',
        friend: friendData 
      });
    }

    // Send friend request
    user.sentFriendRequests.push(friend._id);
    friend.friendRequests.push(user._id);

    await user.save();
    await friend.save();

    const friendData = await User.findById(friend._id).select(
      'name email avatar'
    );

    res.json({ 
      message: 'Friend request sent! They will need to accept it.',
      friend: friendData,
      status: 'pending'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/friends/accept/:id
// @desc    Accept a friend request
router.post('/accept/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const friendId = req.params.id;

    // Check if request exists
    if (!user.friendRequests.includes(friendId)) {
      return res.status(400).json({ message: 'No friend request found from this user' });
    }

    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add to friends (mutual)
    if (!user.friends.includes(friendId)) {
      user.friends.push(friendId);
    }
    if (!friend.friends.includes(user._id)) {
      friend.friends.push(user._id);
    }

    // Remove from requests
    user.friendRequests = user.friendRequests.filter(
      id => id.toString() !== friendId.toString()
    );
    friend.sentFriendRequests = friend.sentFriendRequests.filter(
      id => id.toString() !== user._id.toString()
    );

    await user.save();
    await friend.save();

    const friendData = await User.findById(friendId).select(
      'name email avatar streak totalTasksCompleted lastActiveDate xp level'
    );

    res.json({ 
      message: 'Friend request accepted!',
      friend: friendData 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/friends/decline/:id
// @desc    Decline a friend request
router.post('/decline/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const friendId = req.params.id;

    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from requests
    user.friendRequests = user.friendRequests.filter(
      id => id.toString() !== friendId.toString()
    );
    friend.sentFriendRequests = friend.sentFriendRequests.filter(
      id => id.toString() !== user._id.toString()
    );

    await user.save();
    await friend.save();

    res.json({ message: 'Friend request declined' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/friends/cancel/:id
// @desc    Cancel a sent friend request
router.post('/cancel/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const friendId = req.params.id;

    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from sent requests
    user.sentFriendRequests = user.sentFriendRequests.filter(
      id => id.toString() !== friendId.toString()
    );
    friend.friendRequests = friend.friendRequests.filter(
      id => id.toString() !== user._id.toString()
    );

    await user.save();
    await friend.save();

    res.json({ message: 'Friend request cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/friends/:id
// @desc    Remove a friend (unfriend)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const friendId = req.params.id;

    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    // Remove from both friends lists (mutual unfriend)
    user.friends = user.friends.filter(
      (id) => id.toString() !== friendId.toString()
    );
    friend.friends = friend.friends.filter(
      (id) => id.toString() !== user._id.toString()
    );

    await user.save();
    await friend.save();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/friends/leaderboard
// @desc    Get friends leaderboard sorted by XP, level, streak, and tasks completed
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends');
    const friendIds = user.friends.map((f) => f._id);

    // Include current user in leaderboard
    const allUsers = [req.user._id, ...friendIds];

    // Get all users with their stats
    const leaderboard = await User.find({ _id: { $in: allUsers } })
      .select('name email avatar streak totalTasksCompleted xp level')
      .lean()
      .exec();

    // Sort by XP (primary), then level, then streak, then totalTasksCompleted
    leaderboard.sort((a, b) => {
      // Primary sort: XP (highest first)
      if (b.xp !== a.xp) {
        return (b.xp || 0) - (a.xp || 0);
      }
      // Secondary sort: Level (highest first)
      if (b.level !== a.level) {
        return (b.level || 1) - (a.level || 1);
      }
      // Tertiary sort: Streak (highest first)
      if (b.streak !== a.streak) {
        return (b.streak || 0) - (a.streak || 0);
      }
      // Quaternary sort: Total tasks completed (highest first)
      return (b.totalTasksCompleted || 0) - (a.totalTasksCompleted || 0);
    });

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


