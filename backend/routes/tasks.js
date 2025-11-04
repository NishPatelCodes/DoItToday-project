import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .exec();

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, priority, dueDate, isShared } = req.body;

    const task = new Task({
      userId: req.user._id,
      title,
      description: description || '',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      isShared: isShared || false,
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, isShared } = req.body;

    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (isShared !== undefined) task.isShared = isShared;

    if (status === 'completed' && task.status !== 'completed') {
      task.completedAt = new Date();
      req.user.totalTasksCompleted += 1;
      
      // Award XP based on priority
      const xpAward = task.priority === 'high' ? 20 : task.priority === 'medium' ? 10 : 5;
      req.user.xp += xpAward;
      
      // Level up if XP threshold reached (level * 100 XP per level)
      const xpNeededForNextLevel = req.user.level * 100;
      if (req.user.xp >= xpNeededForNextLevel) {
        req.user.level += 1;
      }
      
      await req.user.save();
    } else if (status === 'pending' && task.status === 'completed') {
      req.user.totalTasksCompleted = Math.max(0, req.user.totalTasksCompleted - 1);
      await req.user.save();
    }

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.status === 'completed') {
      req.user.totalTasksCompleted = Math.max(0, req.user.totalTasksCompleted - 1);
      await req.user.save();
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/tasks/shared
// @desc    Get shared tasks from friends
router.get('/shared', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends');
    const friendIds = user.friends.map((f) => f._id);

    const sharedTasks = await Task.find({
      userId: { $in: friendIds },
      isShared: true,
    })
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .exec();

    res.json(sharedTasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

