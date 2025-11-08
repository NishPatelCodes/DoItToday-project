import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaTrash, FaThumbtack, FaArchive, FaTimes } from 'react-icons/fa';

const NoteEditor = ({ note, onSave, onDelete, onClose, onPin, onArchive }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [color, setColor] = useState('#f8f9fa');
  const contentRef = useRef(null);
  const titleRef = useRef(null);

  const colors = [
    '#f8f9fa', '#fff4e6', '#e8f5e9', '#e3f2fd', '#f3e5f5', 
    '#fce4ec', '#fff9c4', '#e0f2f1', '#f1f8e9', '#fff3e0'
  ];

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags || []);
      setIsPinned(note.isPinned || false);
      setIsArchived(note.isArchived || false);
      setColor(note.color || '#f8f9fa');
    } else {
      setTitle('');
      setContent('');
      setTags([]);
      setIsPinned(false);
      setIsArchived(false);
      setColor('#f8f9fa');
    }
  }, [note]);

  useEffect(() => {
    if (note && titleRef.current) {
      titleRef.current.focus();
    }
  }, [note]);

  const handleSave = useCallback(() => {
    const noteData = {
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      tags,
      color,
      isPinned,
      isArchived,
    };

    if (note) {
      onSave(note._id, noteData);
    } else {
      onSave(null, noteData);
    }
  }, [title, content, tags, color, isPinned, isArchived, note, onSave]);

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag) && tags.length < 10) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handlePin = () => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    if (note && onPin) {
      onPin(note._id, newPinnedState);
    }
  };

  const handleArchive = () => {
    const newArchivedState = !isArchived;
    setIsArchived(newArchivedState);
    if (note && onArchive) {
      onArchive(note._id, newArchivedState);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Save on Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Close on Escape
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="h-full flex flex-col"
      style={{
        backgroundColor: color,
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
        <div className="flex items-center gap-3 flex-1">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="flex-1 bg-transparent border-none outline-none text-lg font-semibold text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePin}
            className={`p-2 rounded-lg transition-colors ${
              isPinned
                ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]'
            }`}
            aria-label={isPinned ? 'Unpin note' : 'Pin note'}
          >
            <FaThumbtack className="text-sm" />
          </button>
          <button
            onClick={handleArchive}
            className={`p-2 rounded-lg transition-colors ${
              isArchived
                ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]'
            }`}
            aria-label={isArchived ? 'Unarchive note' : 'Archive note'}
          >
            <FaArchive className="text-sm" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              aria-label="Close editor"
            >
              <FaTimes className="text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full h-full bg-transparent border-none outline-none resize-none text-[var(--text-primary)] placeholder-[var(--text-tertiary)] leading-relaxed"
          style={{
            fontFamily: 'inherit',
            fontSize: '15px',
            lineHeight: '1.7',
            minHeight: '400px',
          }}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50 space-y-3">
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]"
            >
              {tag}
              <button
                onClick={() => handleTagRemove(tag)}
                className="hover:text-[var(--text-primary)] transition-colors"
                aria-label={`Remove tag ${tag}`}
              >
                <FaTimes className="text-xs" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagAdd}
            placeholder="Add tag..."
            className="px-3 py-1 text-xs bg-transparent border border-[var(--border-color)] rounded-full text-[var(--text-secondary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent-primary)] transition-colors"
            maxLength={20}
          />
        </div>

        {/* Color Picker and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)]">Color:</span>
            <div className="flex gap-1.5">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    color === c
                      ? 'border-[var(--text-primary)] scale-110'
                      : 'border-[var(--border-color)] hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {note && onDelete && (
              <button
                onClick={() => onDelete(note._id)}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <FaTrash className="inline mr-2" />
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <FaSave className="inline mr-2" />
              Save
            </button>
          </div>
        </div>

        <div className="text-xs text-[var(--text-tertiary)] text-center">
          Press Ctrl+S to save, Esc to close
        </div>
      </div>
    </motion.div>
  );
};

export default NoteEditor;

