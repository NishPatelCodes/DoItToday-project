import express from 'express';
import FocusSession from '../models/FocusSession.js';
import { authenticate } from '../middleware/auth.js';
import { awardXP, XP_REWARDS, calculateXPWithBonus } from '../utils/xpSystem.js';

const router = express.Router();

// @route   POST /api/focus/start
// @desc    Start a focus session
router.post('/start', authenticate, async (req, res) => {
  try {
    const { taskId, duration = 25, ambientMode = 'silent' } = req.body;

    const session = new FocusSession({
      userId: req.user._id,
      taskId: taskId || null,
      duration,
      ambientMode,
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/focus/:id/complete
// @desc    Complete a focus session
router.put('/:id/complete', authenticate, async (req, res) => {
  try {
    const session = await FocusSession.findOne({ _id: req.params.id, userId: req.user._id });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.completed = true;
    session.completedAt = new Date();
    await session.save();

    // Award XP for completing focus session
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user._id);
    
    // Calculate XP based on session duration
    const durationMinutes = session.duration || 0;
    let xpAmount = durationMinutes >= 25 ? XP_REWARDS.FOCUS_SESSION_LONG : XP_REWARDS.FOCUS_SESSION;
    
    // Apply streak multiplier
    const xpWithBonus = calculateXPWithBonus(xpAmount, user.streak || 0);
    await awardXP(user, xpWithBonus, `Focus session completed (${durationMinutes} min)`);

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/focus/history
// @desc    Get focus session history
router.get('/history', authenticate, async (req, res) => {
  try {
    const sessions = await FocusSession.find({ userId: req.user._id })
      .sort({ startedAt: -1 })
      .limit(50)
      .exec();

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;



