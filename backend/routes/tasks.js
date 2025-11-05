import express from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks for the authenticated user (including shared tasks)
router.get('/', authenticate, async (req, res) => {
  try {
    // Get user's own tasks
    const ownTasks = await Task.find({ userId: req.user._id })
      .populate('sharedWith', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('goalId', 'title progress')
      .sort({ createdAt: -1 })
      .exec();

    // Get tasks shared with this user
    const sharedTasks = await Task.find({
      sharedWith: req.user._id,
      userId: { $ne: req.user._id }, // Exclude own tasks already fetched
    })
      .populate('userId', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('sharedWith', 'name email avatar')
      .populate('goalId', 'title progress')
      .sort({ createdAt: -1 })
      .exec();

    // Combine and return
    const allTasks = [...ownTasks, ...sharedTasks].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(allTasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, priority, dueDate, isShared, sharedWith, goalId } = req.body;

    // Validate sharedWith if provided
    let sharedWithIds = [];
    if (sharedWith && Array.isArray(sharedWith) && sharedWith.length > 0) {
      // Verify all IDs are valid ObjectIds and are friends
      const user = await User.findById(req.user._id).populate('friends');
      const friendIds = user.friends.map(f => f._id.toString());
      
      sharedWithIds = sharedWith
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .filter(id => friendIds.includes(id.toString()));
    }

    // Validate goalId if provided
    let goalIdValue = null;
    if (goalId && mongoose.Types.ObjectId.isValid(goalId)) {
      const Goal = (await import('../models/Goal.js')).default;
      const goal = await Goal.findOne({ _id: goalId, userId: req.user._id });
      if (goal) {
        goalIdValue = goalId;
      }
    }

    const task = new Task({
      userId: req.user._id,
      createdBy: req.user._id,
      title,
      description: description || '',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      isShared: isShared || sharedWithIds.length > 0,
      sharedWith: sharedWithIds,
      goalId: goalIdValue,
    });

    await task.save();
    
    // Populate user info for response
    await task.populate('userId', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    if (task.goalId) {
      await task.populate('goalId', 'title progress');
    }
    if (task.sharedWith.length > 0) {
      await task.populate('sharedWith', 'name email avatar');
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task (can be updated by owner or someone it's shared with)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, isShared, sharedWith, goalId } = req.body;

    // Find task - user must be owner or task must be shared with them
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user._id },
        { sharedWith: req.user._id }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or you do not have permission' });
    }

    // Only owner can edit task details (not status)
    const isOwner = task.userId.toString() === req.user._id.toString();
    const canEdit = isOwner || task.sharedWith.some(id => id.toString() === req.user._id.toString());
    
    // Only owner can modify title, description, priority, dueDate, sharedWith, goalId
    if (isOwner) {
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (isShared !== undefined) task.isShared = isShared;
      
      // Update goalId if provided
      if (goalId !== undefined) {
        if (goalId === null || goalId === '') {
          task.goalId = null;
        } else if (mongoose.Types.ObjectId.isValid(goalId)) {
          const Goal = (await import('../models/Goal.js')).default;
          const goal = await Goal.findOne({ _id: goalId, userId: req.user._id });
          if (goal) {
            task.goalId = goalId;
          } else {
            task.goalId = null;
          }
        }
      }
      
      // Update sharedWith if provided
      if (sharedWith !== undefined && Array.isArray(sharedWith)) {
        const user = await User.findById(req.user._id).populate('friends');
        const friendIds = user.friends.map(f => f._id.toString());
        
        task.sharedWith = sharedWith
          .filter(id => mongoose.Types.ObjectId.isValid(id))
          .filter(id => friendIds.includes(id.toString()))
          .map(id => new mongoose.Types.ObjectId(id));
        
        task.isShared = task.sharedWith.length > 0 || task.isShared;
      }
    }

    // Anyone with access can update status
    if (canEdit && status !== undefined) {
      const wasCompleted = task.status === 'completed';
      task.status = status;
      
      if (status === 'completed' && !wasCompleted) {
        task.completedAt = new Date();
        // Award XP to the person who completed it
        const completingUser = await User.findById(req.user._id);
        completingUser.totalTasksCompleted += 1;
        
        // Award XP based on priority
        const xpAward = task.priority === 'high' ? 20 : task.priority === 'medium' ? 10 : 5;
        completingUser.xp += xpAward;
        
        // Level up if XP threshold reached
        const xpNeededForNextLevel = completingUser.level * 100;
        if (completingUser.xp >= xpNeededForNextLevel) {
          completingUser.level += 1;
        }
        
        await completingUser.save();
      } else if (status === 'pending' && wasCompleted) {
        task.completedAt = null;
        const completingUser = await User.findById(req.user._id);
        completingUser.totalTasksCompleted = Math.max(0, completingUser.totalTasksCompleted - 1);
        await completingUser.save();
      }
    }

    await task.save();
    
    // Populate user info for response
    await task.populate('userId', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    if (task.goalId) {
      await task.populate('goalId', 'title progress');
    }
    if (task.sharedWith && task.sharedWith.length > 0) {
      await task.populate('sharedWith', 'name email avatar');
    }

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

