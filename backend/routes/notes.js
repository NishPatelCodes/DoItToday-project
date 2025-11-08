import express from 'express';
import Note from '../models/Note.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/notes
// @desc    Get all notes for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const { archived, search, tag } = req.query;
    
    let query = { userId: req.user._id };
    
    // Filter by archived status
    if (archived === 'true') {
      query.isArchived = true;
    } else {
      query.isArchived = false;
    }
    
    // Search in title and content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    const notes = await Note.find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .exec();

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/notes/:id
// @desc    Get a single note by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/notes
// @desc    Create a new note
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, content, tags, color, isPinned } = req.body;

    const note = new Note({
      userId: req.user._id,
      title: title || 'Untitled Note',
      content: content || '',
      tags: tags || [],
      color: color || '#f8f9fa',
      isPinned: isPinned || false,
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, content, tags, color, isPinned, isArchived } = req.body;

    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (color !== undefined) note.color = color;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (isArchived !== undefined) note.isArchived = isArchived;

    note.updatedAt = Date.now();
    await note.save();

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/notes/tags/all
// @desc    Get all unique tags for the user
router.get('/tags/all', authenticate, async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.user._id,
      isArchived: false,
    }).select('tags');

    const allTags = notes
      .flatMap((note) => note.tags)
      .filter((tag, index, self) => tag && self.indexOf(tag) === index)
      .sort();

    res.json(allTags);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

