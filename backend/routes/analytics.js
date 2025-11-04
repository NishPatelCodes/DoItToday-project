import express from 'express';
import Task from '../models/Task.js';
import Goal from '../models/Goal.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all tasks
    const allTasks = await Task.find({ userId });
    const completedTasks = allTasks.filter((t) => t.status === 'completed');

    // Weekly stats
    const weeklyTasks = allTasks.filter((t) => new Date(t.createdAt) >= startOfWeek);
    const weeklyCompleted = weeklyTasks.filter((t) => t.status === 'completed');

    // Monthly stats
    const monthlyTasks = allTasks.filter((t) => new Date(t.createdAt) >= startOfMonth);
    const monthlyCompleted = monthlyTasks.filter((t) => t.status === 'completed');

    // Daily productivity (last 7 days)
    const dailyProductivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayTasks = allTasks.filter(
        (t) =>
          new Date(t.createdAt) >= date && new Date(t.createdAt) < nextDate
      );
      const dayCompleted = dayTasks.filter((t) => t.status === 'completed');
      const productivity = dayTasks.length > 0 ? (dayCompleted.length / dayTasks.length) * 100 : 0;

      dailyProductivity.push({
        date: date.toISOString().split('T')[0],
        completed: dayCompleted.length,
        total: dayTasks.length,
        productivity: Math.round(productivity),
      });
    }

    // Task completion rate (last 4 weeks)
    const weeklyCompletion = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekTasks = allTasks.filter(
        (t) =>
          new Date(t.createdAt) >= weekStart && new Date(t.createdAt) < weekEnd
      );
      const weekCompleted = weekTasks.filter((t) => t.status === 'completed');
      const completionRate = weekTasks.length > 0 ? (weekCompleted.length / weekTasks.length) * 100 : 0;

      weeklyCompletion.push({
        week: `Week ${4 - i}`,
        completed: weekCompleted.length,
        total: weekTasks.length,
        rate: Math.round(completionRate),
      });
    }

    // Get goals
    const allGoals = await Goal.find({ userId });
    const completedGoals = allGoals.filter((g) => g.progress === 100);
    const avgProgress =
      allGoals.length > 0
        ? allGoals.reduce((sum, g) => sum + g.progress, 0) / allGoals.length
        : 0;

    res.json({
      overview: {
        totalTasks: allTasks.length,
        completedTasks: completedTasks.length,
        totalGoals: allGoals.length,
        completedGoals: completedGoals.length,
        weeklyTaskCompletion: weeklyTasks.length > 0 ? Math.round((weeklyCompleted.length / weeklyTasks.length) * 100) : 0,
        monthlyTaskCompletion: monthlyTasks.length > 0 ? Math.round((monthlyCompleted.length / monthlyTasks.length) * 100) : 0,
        averageGoalProgress: Math.round(avgProgress),
      },
      dailyProductivity,
      weeklyCompletion,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;


