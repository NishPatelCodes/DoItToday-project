import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { recalculateLevel } from '../utils/xpSystem.js';

const router = express.Router();

// @route   POST /api/admin/recalculate-levels
// @desc    Recalculate levels for all users (admin only - for fixing inconsistencies)
router.post('/recalculate-levels', authenticate, async (req, res) => {
  try {
    // For now, allow any authenticated user to run this (you can add admin check later)
    const users = await User.find({});
    const results = [];
    
    for (const user of users) {
      const result = await recalculateLevel(user);
      results.push({
        userId: user._id,
        email: user.email,
        ...result
      });
    }
    
    res.json({
      message: `Recalculated levels for ${results.length} users`,
      results
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/recalculate-my-level
// @desc    Recalculate level for current user
router.post('/recalculate-my-level', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const result = await recalculateLevel(user);
    
    res.json({
      message: 'Level recalculated successfully',
      ...result,
      user: {
        id: user._id,
        xp: user.xp,
        level: user.level,
        streak: user.streak
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

