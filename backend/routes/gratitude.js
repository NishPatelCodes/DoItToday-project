import express from 'express';
import Gratitude from '../models/Gratitude.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Helper: Get start and end of day in UTC
const getDayBounds = (date) => {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
};

// Helper: Validate date is today or past
const isDateValid = (date) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const inputDate = new Date(date);
  inputDate.setUTCHours(0, 0, 0, 0);
  return inputDate <= today;
};

// @route   GET /api/gratitude/streak
// @desc    Get user's gratitude streak
router.get('/streak', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Get all gratitude entries sorted by date (descending)
    const entries = await Gratitude.find({ userId })
      .sort({ date: -1 })
      .exec();

    if (entries.length === 0) {
      return res.json({ streak: 0, lastEntryDate: null });
    }

    // Calculate streak
    let streak = 0;
    let checkDate = new Date(today);
    
    for (const entry of entries) {
      const entryDate = new Date(entry.date);
      entryDate.setUTCHours(0, 0, 0, 0);
      
      // Check if entry is for the date we're checking
      if (entryDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      } else if (entryDate < checkDate) {
        // Entry is older than what we're checking, streak is broken
        break;
      }
      // If entry is newer, we skip it (shouldn't happen with sorted query)
    }

    const lastEntry = entries[0];
    res.json({
      streak,
      lastEntryDate: lastEntry.date,
      totalEntries: entries.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/gratitude
// @desc    Get all gratitude entries for user (with optional date filter)
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { date, month, year } = req.query;

    let query = { userId };

    // Filter by specific date
    if (date) {
      const { start, end } = getDayBounds(date);
      query.date = { $gte: start, $lte: end };
    }
    // Filter by month/year
    else if (month && year) {
      const startDate = new Date(Date.UTC(year, month - 1, 1));
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
      query.date = { $gte: startDate, $lte: endDate };
    }

    const entries = await Gratitude.find(query)
      .sort({ date: -1 })
      .exec();

    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/gratitude/today
// @desc    Get today's gratitude entry
router.get('/today', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    const { start, end } = getDayBounds(today);

    const entry = await Gratitude.findOne({
      userId,
      date: { $gte: start, $lte: end },
    });

    if (!entry) {
      return res.json(null);
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/gratitude/:date
// @desc    Get gratitude entry for specific date
router.get('/:date', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.params;

    if (!isDateValid(date)) {
      return res.status(400).json({ message: 'Cannot access future dates' });
    }

    const { start, end } = getDayBounds(date);
    const entry = await Gratitude.findOne({
      userId,
      date: { $gte: start, $lte: end },
    });

    if (!entry) {
      return res.json(null);
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/gratitude
// @desc    Create or update today's gratitude entry
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { entries, date } = req.body;

    // Validate entries
    if (!entries || !Array.isArray(entries) || entries.length !== 3) {
      return res.status(400).json({ 
        message: 'Must provide exactly 3 gratitude entries',
      });
    }

    // Validate each entry is non-empty
    const trimmedEntries = entries.map(e => String(e).trim()).filter(e => e.length > 0);
    if (trimmedEntries.length !== 3) {
      return res.status(400).json({ 
        message: 'All 3 entries must be non-empty',
      });
    }

    // Use provided date or default to today
    const entryDate = date ? new Date(date) : new Date();
    
    // Validate date is not in the future
    if (!isDateValid(entryDate)) {
      return res.status(400).json({ 
        message: 'Cannot create entries for future dates',
      });
    }

    // Normalize date to midnight UTC
    entryDate.setUTCHours(0, 0, 0, 0);

    // Find or create entry
    const gratitude = await Gratitude.findOneAndUpdate(
      { userId, date: entryDate },
      {
        entries: trimmedEntries,
        updatedAt: Date.now(),
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true,
      }
    );

    res.status(201).json(gratitude);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Entry already exists for this date',
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/gratitude/:id
// @desc    Update gratitude entry
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { entries } = req.body;

    // Validate entries
    if (!entries || !Array.isArray(entries) || entries.length !== 3) {
      return res.status(400).json({ 
        message: 'Must provide exactly 3 gratitude entries',
      });
    }

    const trimmedEntries = entries.map(e => String(e).trim()).filter(e => e.length > 0);
    if (trimmedEntries.length !== 3) {
      return res.status(400).json({ 
        message: 'All 3 entries must be non-empty',
      });
    }

    const gratitude = await Gratitude.findOne({ _id: id, userId });

    if (!gratitude) {
      return res.status(404).json({ message: 'Gratitude entry not found' });
    }

    // Validate date is not in the future
    if (!isDateValid(gratitude.date)) {
      return res.status(400).json({ 
        message: 'Cannot modify entries for future dates',
      });
    }

    gratitude.entries = trimmedEntries;
    gratitude.updatedAt = Date.now();
    await gratitude.save();

    res.json(gratitude);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/gratitude/:id
// @desc    Delete gratitude entry
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const gratitude = await Gratitude.findOneAndDelete({ _id: id, userId });

    if (!gratitude) {
      return res.status(404).json({ message: 'Gratitude entry not found' });
    }

    res.json({ message: 'Gratitude entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

