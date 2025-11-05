import express from 'express';
import Habit from '../models/Habit.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/habits
// @desc    Get all habits for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true })
      .sort({ createdAt: -1 })
      .exec();

    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/habits
// @desc    Create a new habit
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, icon, color, frequency } = req.body;

    const habit = new Habit({
      userId: req.user._id,
      name,
      description: description || '',
      icon: icon || '⚡',
      color: color || '#667eea',
      frequency: frequency || 'daily',
    });

    await habit.save();
    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/habits/:id
// @desc    Update a habit
router.put('/:id', authenticate, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const { name, description, icon, color, frequency, isActive } = req.body;

    if (name !== undefined) habit.name = name;
    if (description !== undefined) habit.description = description;
    if (icon !== undefined) habit.icon = icon;
    if (color !== undefined) habit.color = color;
    if (frequency !== undefined) habit.frequency = frequency;
    if (isActive !== undefined) habit.isActive = isActive;

    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/habits/:id/complete
// @desc    Mark habit as complete for today
router.post('/:id/complete', authenticate, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already completed today
    const todayEntry = habit.completionDates.find(
      (entry) => new Date(entry.date).setHours(0, 0, 0, 0) === today.getTime()
    );

    if (todayEntry && todayEntry.completed) {
      return res.status(400).json({ message: 'Habit already completed today' });
    }

    // Add today's completion
    if (todayEntry) {
      todayEntry.completed = true;
    } else {
      habit.completionDates.push({ date: today, completed: true });
    }

    // Update streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayEntry = habit.completionDates.find(
      (entry) => new Date(entry.date).setHours(0, 0, 0, 0) === yesterday.getTime()
    );

    if (yesterdayEntry && yesterdayEntry.completed) {
      habit.streak += 1;
    } else {
      habit.streak = 1;
    }

    if (habit.streak > habit.longestStreak) {
      habit.longestStreak = habit.streak;
    }

    habit.totalCompletions += 1;
    await habit.save();

    // Award XP for completing habit (5 XP per habit completion)
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user._id);
    user.xp += 5;
    
    // Level up if XP threshold reached
    const xpNeededForNextLevel = user.level * 100;
    if (user.xp >= xpNeededForNextLevel) {
      user.level += 1;
    }
    
    await user.save();

    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/habits/:id
// @desc    Delete a habit
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    await Habit.findByIdAndDelete(req.params.id);
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;



