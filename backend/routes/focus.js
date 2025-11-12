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
    const { completedDuration } = req.body;
    const session = await FocusSession.findOne({ _id: req.params.id, userId: req.user._id });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.status = 'completed';
    session.endTime = new Date();
    session.completedDuration = completedDuration || session.duration;
    
    // Calculate DP earned
    session.calculateDP();
    await session.save();

    // Award Discipline Points for completing focus session
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user._id);
    
    if (user && session.dpEarned > 0) {
      // Apply streak multiplier
      const dpWithBonus = calculateXPWithBonus(session.dpEarned, user.streak || 0);
      await awardXP(user, dpWithBonus, `Focus session completed (${session.completedDuration} min)`);
    }

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
      .sort({ startTime: -1 })
      .limit(50)
      .populate('taskId', 'title')
      .exec();

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/focus/stats
// @desc    Get focus session statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const sessionsThisWeek = await FocusSession.find({
      userId: req.user._id,
      status: 'completed',
      startTime: { $gte: startOfWeek, $lte: endOfWeek },
    });

    const totalMinutes = sessionsThisWeek.reduce((sum, s) => sum + (s.completedDuration || s.duration), 0);
    const totalSessions = sessionsThisWeek.length;
    const totalDP = sessionsThisWeek.reduce((sum, s) => sum + (s.dpEarned || 0), 0);

    res.json({
      totalMinutes,
      totalSessions,
      totalDP,
      averageSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;



