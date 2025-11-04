import express from 'express';
import Reaction from '../models/Reaction.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/reactions
// @desc    Add a reaction (like/cheer/fire)
router.post('/', authenticate, async (req, res) => {
  try {
    const { targetType, targetId, reactionType = 'like' } = req.body;

    // Check if reaction already exists
    let reaction = await Reaction.findOne({
      userId: req.user._id,
      targetType,
      targetId,
    });

    if (reaction) {
      // Update existing reaction
      reaction.reactionType = reactionType;
      await reaction.save();
    } else {
      // Create new reaction
      reaction = new Reaction({
        userId: req.user._id,
        targetType,
        targetId,
        reactionType,
      });
      await reaction.save();
    }

    res.json(reaction);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Reaction already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/reactions/:targetType/:targetId
// @desc    Remove a reaction
router.delete('/:targetType/:targetId', authenticate, async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const reaction = await Reaction.findOneAndDelete({
      userId: req.user._id,
      targetType,
      targetId,
    });

    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }

    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reactions/:targetType/:targetId
// @desc    Get reactions for a target
router.get('/:targetType/:targetId', authenticate, async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const reactions = await Reaction.find({ targetType, targetId })
      .populate('userId', 'name avatar')
      .exec();

    const userReaction = await Reaction.findOne({
      userId: req.user._id,
      targetType,
      targetId,
    });

    res.json({
      reactions,
      userReaction,
      counts: {
        like: reactions.filter((r) => r.reactionType === 'like').length,
        cheer: reactions.filter((r) => r.reactionType === 'cheer').length,
        fire: reactions.filter((r) => r.reactionType === 'fire').length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;



