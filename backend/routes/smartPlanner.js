import express from 'express';
import Task from '../models/Task.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/smart-planner/suggest
// @desc    AI Smart Planner - Suggest optimal task schedule
router.get('/suggest', authenticate, async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.user._id,
      status: 'pending',
    }).sort({ priority: -1, dueDate: 1 });

    // Simple AI-like algorithm to suggest optimal schedule
    const now = new Date();
    const suggestions = {
      today: [],
      thisWeek: [],
      later: [],
      recommendedOrder: [],
    };

    // Prioritize by: urgency (due date), importance (priority), and completion time estimate
    tasks.forEach((task) => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      const daysUntilDue = dueDate
        ? Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
        : 999;

      const priorityScore = task.priority === 'high' ? 3 : task.priority === 'medium' ? 2 : 1;
      const urgencyScore = daysUntilDue <= 1 ? 3 : daysUntilDue <= 3 ? 2 : daysUntilDue <= 7 ? 1 : 0;
      const score = priorityScore + urgencyScore;

      const taskWithScore = {
        ...task.toObject(),
        score,
        daysUntilDue,
        recommendedStartTime: calculateStartTime(task, now),
      };

      if (daysUntilDue <= 0) {
        suggestions.today.push(taskWithScore);
      } else if (daysUntilDue <= 7) {
        suggestions.thisWeek.push(taskWithScore);
      } else {
        suggestions.later.push(taskWithScore);
      }
    });

    // Sort by score (highest first)
    suggestions.recommendedOrder = [...suggestions.today, ...suggestions.thisWeek, ...suggestions.later]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Add AI insights
    suggestions.insights = generateInsights(tasks, suggestions);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

function calculateStartTime(task, now) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  if (!dueDate) return null;

  const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);
  
  // Suggest starting 2 hours before deadline for high priority, 1 day for medium, 2 days for low
  const bufferHours = task.priority === 'high' ? 2 : task.priority === 'medium' ? 24 : 48;
  const suggestedStart = new Date(dueDate.getTime() - bufferHours * 60 * 60 * 1000);
  
  return suggestedStart > now ? suggestedStart : now;
}

function generateInsights(tasks, suggestions) {
  const insights = [];

  const highPriorityTasks = tasks.filter((t) => t.priority === 'high');
  if (highPriorityTasks.length > 5) {
    insights.push({
      type: 'warning',
      message: `You have ${highPriorityTasks.length} high-priority tasks. Consider breaking them down into smaller tasks.`,
    });
  }

  const overdueTasks = suggestions.today.filter((t) => t.daysUntilDue < 0);
  if (overdueTasks.length > 0) {
    insights.push({
      type: 'urgent',
      message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Focus on these first!`,
    });
  }

  if (suggestions.recommendedOrder.length > 10) {
    insights.push({
      type: 'info',
      message: `You have ${suggestions.recommendedOrder.length} pending tasks. The planner has prioritized the top 10 for you.`,
    });
  }

  const mediumPriorityCount = tasks.filter((t) => t.priority === 'medium').length;
  if (mediumPriorityCount > 8) {
    insights.push({
      type: 'suggestion',
      message: `Consider elevating some medium-priority tasks to high-priority to better manage your workload.`,
    });
  }

  return insights;
}

export default router;



