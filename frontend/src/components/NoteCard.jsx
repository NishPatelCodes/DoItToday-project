import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { FaTrash, FaEdit, FaThumbtack, FaArchive } from 'react-icons/fa';
import { format } from 'date-fns';
import ConfirmationModal from './ConfirmationModal';
import { useThemeStore } from '../hooks/useTheme';

const NoteCard = memo(({ note, onSelect, onDelete, onPin, onArchive, isSelected }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { theme } = useThemeStore();

  // Theme-aware color palettes (same as NoteEditor)
  const colorPalettes = {
    default: { light: '#f8f9fa', dark: '#1e1e2d' },
    orange: { light: '#fff4e6', dark: '#2d1f0f' },
    green: { light: '#e8f5e9', dark: '#1a2e1a' },
    blue: { light: '#e3f2fd', dark: '#1a2433' },
    purple: { light: '#f3e5f5', dark: '#2a1f33' },
    pink: { light: '#fce4ec', dark: '#331f28' },
    yellow: { light: '#fff9c4', dark: '#332d1f' },
    teal: { light: '#e0f2f1', dark: '#1a2e2e' },
    lime: { light: '#f1f8e9', dark: '#252e1a' },
    amber: { light: '#fff3e0', dark: '#33261f' }
  };

  const getNoteBackgroundColor = () => {
    if (!note.color) {
      return theme === 'dark' ? colorPalettes.default.dark : colorPalettes.default.light;
    }
    
    // If it's a new color ID system
    if (colorPalettes[note.color]) {
      return theme === 'dark' ? colorPalettes[note.color].dark : colorPalettes[note.color].light;
    }
    
    // Legacy hex color - in dark mode, use a darker variant or default
    if (theme === 'dark') {
      // For old hex colors in dark mode, use a darker background
      return 'var(--bg-secondary)';
    }
    
    // In light mode, use the hex color as-is
    return note.color;
  };
  
  const getPreview = (content) => {
    if (!content) return 'No content';
    const text = content.replace(/\n/g, ' ').trim();
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  const handleClick = (e) => {
    // Don't select if clicking on action buttons or links
    if (e.target.closest('button') || e.target.closest('a')) return;
    onSelect(note);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        onClick={handleClick}
        className={`
          cursor-pointer transition-all duration-200
          ${isSelected 
            ? 'ring-2 ring-[var(--accent-primary)] ring-opacity-50' 
            : 'hover:ring-1 hover:ring-[var(--border-color)]'
          }
        `}
        style={{
          backgroundColor: getNoteBackgroundColor(),
          borderRadius: '10px',
          padding: '18px',
          marginBottom: '10px',
          border: '1px solid var(--border-color)',
          borderColor: 'var(--border-color)',
          boxShadow: isSelected 
            ? 'var(--shadow-md)' 
            : 'var(--shadow-sm)',
          transition: 'all 0.2s ease',
        }}
      >
        {note.isPinned && (
          <div className="flex items-center gap-2 mb-2">
            <FaThumbtack className="text-xs text-[var(--accent-primary)]" />
            <span className="text-xs text-[var(--accent-primary)] font-medium">Pinned</span>
          </div>
        )}
        
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-[var(--text-primary)] flex-1 line-clamp-2">
            {note.title || 'Untitled Note'}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            {onPin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPin(note._id, !note.isPinned);
                }}
                className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors"
                aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
              >
                <FaThumbtack className={`text-xs ${note.isPinned ? 'text-[var(--accent-primary)]' : ''}`} />
              </button>
            )}
            {onArchive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(note._id, !note.isArchived);
                }}
                className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors"
                aria-label={note.isArchived ? 'Unarchive note' : 'Archive note'}
              >
                <FaArchive className="text-xs" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="p-1.5 text-[var(--text-tertiary)] hover:text-red-500 dark:hover:text-red-400 transition-colors"
                aria-label="Delete note"
              >
                <FaTrash className="text-xs" />
              </button>
            )}
          </div>
        </div>

        {note.content && (
          <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-3 leading-relaxed">
            {getPreview(note.content)}
          </p>
        )}

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {note.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-[var(--text-tertiary)]">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="text-xs text-[var(--text-tertiary)]">
          {format(new Date(note.updatedAt || note.createdAt), 'MMM d, yyyy')}
        </div>
      </motion.div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDelete(note._id);
          setShowDeleteConfirm(false);
        }}
        title="Delete Note"
        message={`Are you sure you want to delete "${note.title || 'Untitled Note'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
});

NoteCard.displayName = 'NoteCard';

export default NoteCard;

