import express from 'express';
import Challenge from '../models/Challenge.js';
import { authenticate as auth } from '../middleware/auth.js';
import { awardXP } from '../utils/xpSystem.js';
import User from '../models/User.js';

const router = express.Router();

// Get all challenges for user
router.get('/', auth, async (req, res) => {
  try {
    const challenges = await Challenge.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
    
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get active challenges
router.get('/active', auth, async (req, res) => {
  try {
    const challenges = await Challenge.find({
      userId: req.user._id,
      status: 'active',
    })
      .sort({ createdAt: -1 });
    
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching active challenges:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get completed challenges
router.get('/completed', auth, async (req, res) => {
  try {
    const challenges = await Challenge.find({
      userId: req.user._id,
      status: 'completed',
    })
      .sort({ completedDate: -1 });
    
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching completed challenges:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new challenge
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, type, duration } = req.body;

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    const challenge = new Challenge({
      userId: req.user._id,
      name,
      description,
      type: type || 'custom',
      duration,
      startDate,
      endDate,
      status: 'active',
      progress: 0,
      checkIns: [],
      dpReward: duration <= 7 ? 15 : duration <= 30 ? 30 : 50,
    });

    await challenge.save();
    res.status(201).json(challenge);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a premade challenge
router.post('/premade', auth, async (req, res) => {
  try {
    const { challengeType } = req.body;

    const premadeChallenges = {
      'no-social-media-7': {
        name: 'No Social Media for 7 Days',
        description: 'Stay focused and avoid social media for 7 days. Build discipline and improve productivity.',
        type: '7-day',
        duration: 7,
        dpReward: 25,
      },
      'morning-workout-30': {
        name: 'Morning Workout Challenge',
        description: 'Complete a morning workout every day for 30 days. Build a healthy habit and discipline.',
        type: '30-day',
        duration: 30,
        dpReward: 50,
      },
      'gratitude-journal-30': {
        name: 'Gratitude Journaling for 30 Days',
        description: 'Write in your gratitude journal every day for 30 days. Cultivate positivity and mindfulness.',
        type: '30-day',
        duration: 30,
        dpReward: 45,
      },
      'read-daily-7': {
        name: 'Read Daily for 7 Days',
        description: 'Read for at least 20 minutes every day for 7 days. Build a reading habit.',
        type: '7-day',
        duration: 7,
        dpReward: 20,
      },
      'meditation-30': {
        name: 'Daily Meditation Challenge',
        description: 'Meditate for at least 10 minutes every day for 30 days. Improve focus and mental clarity.',
        type: '30-day',
        duration: 30,
        dpReward: 50,
      },
    };

    const challengeData = premadeChallenges[challengeType];
    if (!challengeData) {
      return res.status(400).json({ message: 'Invalid challenge type' });
    }

    // Check if user already has an active challenge of this type
    const existingChallenge = await Challenge.findOne({
      userId: req.user._id,
      name: challengeData.name,
      status: 'active',
    });

    if (existingChallenge) {
      return res.status(400).json({ message: 'You already have an active challenge of this type' });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + challengeData.duration);

    const challenge = new Challenge({
      userId: req.user._id,
      name: challengeData.name,
      description: challengeData.description,
      type: challengeData.type,
      duration: challengeData.duration,
      startDate,
      endDate,
      status: 'active',
      progress: 0,
      checkIns: [],
      dpReward: challengeData.dpReward,
    });

    await challenge.save();
    res.status(201).json(challenge);
  } catch (error) {
    console.error('Error creating premade challenge:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check in for a challenge
router.post('/:id/checkin', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.status !== 'active') {
      return res.status(400).json({ message: 'Challenge is not active' });
    }

    // Check if already checked in today
    if (challenge.isCheckedInToday()) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    // Add check-in
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    challenge.checkIns.push({
      date: today,
      completed: true,
      notes: req.body.notes || '',
    });

    // Calculate progress
    challenge.calculateProgress();
    await challenge.save();

    // If challenge is completed, award DP
    if (challenge.status === 'completed') {
      const user = await User.findById(req.user._id);
      if (user) {
        await awardXP(user, challenge.dpReward, `Challenge completed: ${challenge.name}`);
      }
    }

    res.json(challenge);
  } catch (error) {
    console.error('Error checking in challenge:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update challenge
router.put('/:id', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    Object.assign(challenge, req.body);
    challenge.calculateProgress();
    await challenge.save();

    res.json(challenge);
  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete/abandon challenge
router.delete('/:id', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Mark as abandoned instead of deleting
    challenge.status = 'abandoned';
    await challenge.save();

    res.json({ message: 'Challenge abandoned', challenge });
  } catch (error) {
    console.error('Error abandoning challenge:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Restart challenge
router.post('/:id/restart', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Reset challenge
    challenge.status = 'active';
    challenge.progress = 0;
    challenge.checkIns = [];
    challenge.startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + challenge.duration);
    challenge.endDate = endDate;
    challenge.completedDate = null;

    await challenge.save();
    res.json(challenge);
  } catch (error) {
    console.error('Error restarting challenge:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

