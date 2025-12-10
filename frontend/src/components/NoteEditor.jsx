import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaTrash, FaThumbtack, FaArchive, FaTimes } from 'react-icons/fa';
import { useThemeStore } from '../hooks/useTheme';

const NoteEditor = ({ note, onSave, onDelete, onClose, onPin, onArchive }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [color, setColor] = useState('default');
  const contentRef = useRef(null);
  const titleRef = useRef(null);
  const { theme } = useThemeStore();

  // Theme-aware color palettes
  const lightColors = [
    { id: 'default', light: '#f8f9fa', dark: '#1e1e2d' },
    { id: 'orange', light: '#fff4e6', dark: '#2d1f0f' },
    { id: 'green', light: '#e8f5e9', dark: '#1a2e1a' },
    { id: 'blue', light: '#e3f2fd', dark: '#1a2433' },
    { id: 'purple', light: '#f3e5f5', dark: '#2a1f33' },
    { id: 'pink', light: '#fce4ec', dark: '#331f28' },
    { id: 'yellow', light: '#fff9c4', dark: '#332d1f' },
    { id: 'teal', light: '#e0f2f1', dark: '#1a2e2e' },
    { id: 'lime', light: '#f1f8e9', dark: '#252e1a' },
    { id: 'amber', light: '#fff3e0', dark: '#33261f' }
  ];

  const getColorValue = (colorId) => {
    const colorObj = lightColors.find(c => c.id === colorId) || lightColors[0];
    return theme === 'dark' ? colorObj.dark : colorObj.light;
  };

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags || []);
      setIsPinned(note.isPinned || false);
      setIsArchived(note.isArchived || false);
      // If note has old hex color, map to new color system or use default
      if (note.color && !note.color.match(/^(default|orange|green|blue|purple|pink|yellow|teal|lime|amber)$/)) {
        // Try to map old hex to new color system, otherwise use default
        setColor('default');
      } else {
        setColor(note.color || 'default');
      }
    } else {
      setTitle('');
      setContent('');
      setTags([]);
      setIsPinned(false);
      setIsArchived(false);
      setColor('default');
    }
  }, [note]);

  useEffect(() => {
    if (!note && titleRef.current) {
      // Focus on new note creation
      setTimeout(() => {
        titleRef.current?.focus();
      }, 100);
    } else if (note && titleRef.current) {
      // Focus when editing existing note
      setTimeout(() => {
        titleRef.current?.focus();
      }, 100);
    }
  }, [note]);

  const handleSave = useCallback(() => {
    const noteData = {
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      tags,
      color: color, // Save color ID instead of hex
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
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Only trigger save shortcut in textarea/content area
        if ((e.ctrlKey || e.metaKey) && e.key === 's' && e.target.tagName === 'TEXTAREA') {
          e.preventDefault();
          handleSave();
        }
        return;
      }
      
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
      className="w-full h-full flex flex-col note-editor"
      style={{
        backgroundColor: getColorValue(color),
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        borderColor: 'var(--border-color)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-color)]/30 bg-transparent">
        <div className="flex items-center gap-3 flex-1">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="flex-1 bg-transparent border-none outline-none text-2xl font-semibold text-[var(--text-primary)] placeholder-[var(--text-tertiary)]/50 transition-all duration-200"
            style={{
              outline: 'none',
              boxShadow: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
            }}
            onFocus={(e) => {
              e.target.style.outline = 'none';
              e.target.style.boxShadow = 'none';
            }}
            onBlur={(e) => {
              e.target.style.outline = 'none';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePin}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              isPinned
                ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                : 'text-[var(--text-tertiary)]/70 hover:bg-[var(--bg-tertiary)]/50 hover:text-[var(--text-secondary)]'
            }`}
            aria-label={isPinned ? 'Unpin note' : 'Pin note'}
            style={{ outline: 'none' }}
            onFocus={(e) => e.target.style.outline = 'none'}
          >
            <FaThumbtack className="text-sm" />
          </button>
          <button
            onClick={handleArchive}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              isArchived
                ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                : 'text-[var(--text-tertiary)]/70 hover:bg-[var(--bg-tertiary)]/50 hover:text-[var(--text-secondary)]'
            }`}
            aria-label={isArchived ? 'Unarchive note' : 'Archive note'}
            style={{ outline: 'none' }}
            onFocus={(e) => e.target.style.outline = 'none'}
          >
            <FaArchive className="text-sm" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-full text-[var(--text-tertiary)]/70 hover:bg-[var(--bg-tertiary)]/50 hover:text-[var(--text-secondary)] transition-all duration-200"
              aria-label="Close editor"
              style={{ outline: 'none' }}
              onFocus={(e) => e.target.style.outline = 'none'}
            >
              <FaTimes className="text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 py-5 overflow-hidden" style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full flex-1 bg-transparent border-none outline-none resize-none text-[var(--text-primary)] placeholder-[var(--text-tertiary)]/50 leading-relaxed overflow-y-auto transition-all duration-200"
          style={{
            fontFamily: 'inherit',
            fontSize: '16px',
            lineHeight: '1.8',
            minHeight: '300px',
            outline: 'none',
            boxShadow: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            letterSpacing: '0.01em',
          }}
          onFocus={(e) => {
            e.target.style.outline = 'none';
            e.target.style.boxShadow = 'none';
          }}
          onBlur={(e) => {
            e.target.style.outline = 'none';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[var(--border-color)]/30 bg-transparent space-y-4">
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-[var(--bg-tertiary)]/60 text-[var(--text-secondary)] border border-[var(--border-color)]/30 transition-all duration-200 hover:bg-[var(--bg-tertiary)]/80"
            >
              {tag}
              <button
                onClick={() => handleTagRemove(tag)}
                className="hover:text-[var(--text-primary)] transition-colors rounded-full p-0.5 hover:bg-[var(--bg-tertiary)]"
                aria-label={`Remove tag ${tag}`}
                style={{ outline: 'none' }}
                onFocus={(e) => e.target.style.outline = 'none'}
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
            className="px-3 py-1.5 text-xs bg-transparent border border-[var(--border-color)]/30 rounded-full text-[var(--text-secondary)] placeholder-[var(--text-tertiary)]/50 transition-all duration-200 hover:border-[var(--border-color)]/50"
            maxLength={20}
            style={{
              outline: 'none',
              boxShadow: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
            }}
            onFocus={(e) => {
              e.target.style.outline = 'none';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'var(--border-color)';
            }}
            onBlur={(e) => {
              e.target.style.outline = 'none';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Color Picker and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-secondary)]/70 font-medium">Color</span>
            <div className="flex gap-2">
              {lightColors.map((colorObj) => (
                <button
                  key={colorObj.id}
                  onClick={() => setColor(colorObj.id)}
                  className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                    color === colorObj.id
                      ? 'border-[var(--text-primary)]/40 scale-110 ring-2 ring-[var(--border-color)]/30'
                      : 'border-[var(--border-color)]/20 hover:scale-105 hover:border-[var(--border-color)]/40'
                  }`}
                  style={{ 
                    backgroundColor: theme === 'dark' ? colorObj.dark : colorObj.light,
                    outline: 'none',
                    boxShadow: color === colorObj.id ? 'var(--shadow-sm)' : 'none',
                  }}
                  aria-label={`Select color ${colorObj.id}`}
                  onFocus={(e) => e.target.style.outline = 'none'}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {note && onDelete && (
              <button
                onClick={() => onDelete(note._id)}
                className="px-4 py-2 text-sm text-red-500/80 hover:text-red-500 dark:text-red-400/80 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 font-medium"
                style={{ outline: 'none' }}
                onFocus={(e) => e.target.style.outline = 'none'}
              >
                <FaTrash className="inline mr-2" />
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-95 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              style={{ outline: 'none' }}
              onFocus={(e) => e.target.style.outline = 'none'}
            >
              <FaSave className="inline mr-2" />
              Save
            </button>
          </div>
        </div>

        <div className="text-xs text-[var(--text-tertiary)]/50 text-center pt-1">
          Press <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)]/50 rounded text-[10px]">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)]/50 rounded text-[10px]">S</kbd> to save
        </div>
      </div>
    </motion.div>
  );
};

export default NoteEditor;

