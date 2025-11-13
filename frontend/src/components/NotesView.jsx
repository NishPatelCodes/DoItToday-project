import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaSearch, FaFilter, FaArchive, FaThumbtack } from 'react-icons/fa';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';
import { notesAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import Skeleton from './Skeleton';

const NotesView = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [tags, setTags] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const toast = useToast();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived, debouncedSearchQuery, selectedTag]);

  // Reset selected note when switching views
  useEffect(() => {
    if (showArchived && selectedNote && !selectedNote.isArchived) {
      setSelectedNote(null);
    }
  }, [showArchived, selectedNote]);

  useEffect(() => {
    loadTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        archived: showArchived.toString(),
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
        ...(selectedTag && { tag: selectedTag }),
      };
      const response = await notesAPI.getAll(params);
      const loadedNotes = response.data || [];
      setNotes(loadedNotes);
      
      // If selected note exists, refresh it
      setSelectedNote(prev => {
        if (prev) {
          const updatedNote = loadedNotes.find(n => n._id === prev._id);
          if (updatedNote) {
            return updatedNote;
          } else if (!showArchived) {
            // Note was archived or deleted
            return null;
          }
        }
        return prev;
      });
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [showArchived, debouncedSearchQuery, selectedTag, toast]);

  const loadTags = useCallback(async () => {
    try {
      const response = await notesAPI.getAllTags();
      setTags(response.data || []);
    } catch (error) {
      console.error('Error loading tags:', error);
      // Silently handle error
    }
  }, []);

  const handleCreateNote = () => {
    setIsCreating(true);
    setSelectedNote(null);
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setIsCreating(false);
  };

  const handleSaveNote = async (id, noteData) => {
    try {
      let savedNote;
      if (id) {
        const response = await notesAPI.update(id, noteData);
        savedNote = response.data;
        toast.success('Note updated successfully');
      } else {
        const response = await notesAPI.create(noteData);
        savedNote = response.data;
        toast.success('Note created successfully');
        setIsCreating(false);
      }
      
      // Update local state immediately for better UX
      if (savedNote) {
        setNotes(prevNotes => {
          if (id) {
            // Update existing note
            return prevNotes.map(note => 
              note._id === id ? savedNote : note
            );
          } else {
            // Add new note
            return [savedNote, ...prevNotes];
          }
        });
        setSelectedNote(savedNote);
      }
      
      // Refresh notes list and tags in background
      loadNotes();
      loadTags();
    } catch (error) {
      console.error('Error saving note:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save note. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await notesAPI.delete(id);
      toast.success('Note deleted successfully');
      
      // Update local state immediately
      setNotes(prevNotes => prevNotes.filter(note => note._id !== id));
      
      if (selectedNote && selectedNote._id === id) {
        setSelectedNote(null);
        setIsCreating(false);
      }
      
      // Refresh tags in background
      loadTags();
    } catch (error) {
      console.error('Error deleting note:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete note. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handlePinNote = async (id, isPinned) => {
    try {
      const response = await notesAPI.update(id, { isPinned });
      const updatedNote = response.data;
      
      // Update notes list
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note._id === id ? updatedNote : note
        )
      );
      
      // Update selected note if it's the one being pinned
      if (selectedNote && selectedNote._id === id) {
        setSelectedNote(updatedNote);
      }
    } catch (error) {
      console.error('Error pinning note:', error);
      toast.error('Failed to update note. Please try again.');
    }
  };

  const handleArchiveNote = async (id, isArchived) => {
    try {
      const response = await notesAPI.update(id, { isArchived });
      const updatedNote = response.data;
      
      toast.success(isArchived ? 'Note archived' : 'Note unarchived');
      
      // Refresh notes list
      await loadNotes();
      
      // Close editor if note was archived and we're not viewing archived
      if (isArchived && !showArchived && selectedNote && selectedNote._id === id) {
        setSelectedNote(null);
      } else if (!isArchived && selectedNote && selectedNote._id === id) {
        // If unarchived, update selected note
        setSelectedNote(updatedNote);
      }
    } catch (error) {
      console.error('Error archiving note:', error);
      toast.error('Failed to update note. Please try again.');
    }
  };

  const handleCloseEditor = () => {
    setSelectedNote(null);
    setIsCreating(false);
  };

  // Clear selection when filter changes significantly
  const handleArchiveToggle = () => {
    setShowArchived(!showArchived);
    setSelectedNote(null);
    setIsCreating(false);
  };

  const pinnedNotes = useMemo(() => 
    notes.filter(note => note.isPinned && !note.isArchived),
    [notes]
  );
  const regularNotes = useMemo(() => 
    notes.filter(note => !note.isPinned && !note.isArchived),
    [notes]
  );
  const archivedNotes = useMemo(() => 
    notes.filter(note => note.isArchived),
    [notes]
  );

  return (
    <div className="w-full flex flex-col" style={{ height: '100%', minHeight: 'calc(100vh - 4rem)' }}>
      <div className="p-4 md:p-6 lg:p-8 flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)] mb-1">
            Notes
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Capture your thoughts and ideas
          </p>
        </div>
        <button
          onClick={handleCreateNote}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          <FaPlus />
          New Note
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 overflow-hidden">
        {/* Sidebar - Notes List */}
        <div className={`w-full ${!isMobile ? 'md:w-80 lg:w-96 md:border-r md:border-[var(--border-color)] md:pr-6' : ''} flex flex-col ${isMobile && (selectedNote || isCreating) ? 'hidden' : ''}`} style={{ maxHeight: '100%', minHeight: 0, overflow: 'hidden' }}>
          {/* Search and Filters */}
          <div className="mb-4 space-y-3 flex-shrink-0">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)]/60 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)]/50 transition-all duration-200"
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
                  e.target.style.backgroundColor = 'var(--bg-tertiary)';
                }}
                onBlur={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = 'var(--bg-secondary)';
                }}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleArchiveToggle}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  showArchived
                    ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/20'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <FaArchive className="text-xs" />
                Archived
              </button>

              {tags.length > 0 && (
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] transition-colors"
                >
                  <option value="">All Tags</option>
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ minHeight: 0, scrollbarWidth: 'thin' }}>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} width="100%" height={120} rounded="lg" />
                ))}
              </div>
            ) : showArchived ? (
              archivedNotes.length > 0 ? (
                <div className="space-y-3">
                  {archivedNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onSelect={handleSelectNote}
                      onDelete={handleDeleteNote}
                      onPin={handlePinNote}
                      onArchive={handleArchiveNote}
                      isSelected={selectedNote?._id === note._id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[var(--text-tertiary)]">
                  <FaArchive className="text-4xl mx-auto mb-3 opacity-30" />
                  <p>No archived notes</p>
                </div>
              )
            ) : (
              <>
                {pinnedNotes.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3 text-xs text-[var(--text-secondary)] font-medium">
                      <FaThumbtack />
                      Pinned
                    </div>
                    <div className="space-y-3">
                      {pinnedNotes.map((note) => (
                        <NoteCard
                          key={note._id}
                          note={note}
                          onSelect={handleSelectNote}
                          onDelete={handleDeleteNote}
                          onPin={handlePinNote}
                          onArchive={handleArchiveNote}
                          isSelected={selectedNote?._id === note._id}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {regularNotes.length > 0 && (
                  <div>
                    {pinnedNotes.length > 0 && (
                      <div className="flex items-center gap-2 mb-3 text-xs text-[var(--text-secondary)] font-medium">
                        Others
                      </div>
                    )}
                    <div className="space-y-3">
                      {regularNotes.map((note) => (
                        <NoteCard
                          key={note._id}
                          note={note}
                          onSelect={handleSelectNote}
                          onDelete={handleDeleteNote}
                          onPin={handlePinNote}
                          onArchive={handleArchiveNote}
                          isSelected={selectedNote?._id === note._id}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {notes.length === 0 && !loading && (
                  <div className="text-center py-12 text-[var(--text-tertiary)]">
                    <p className="mb-2">No notes yet</p>
                    <p className="text-sm">Create your first note to get started</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Editor Area - Desktop */}
        {!isMobile && (
          <div className="flex-1 min-w-0 flex" style={{ minHeight: 0, maxHeight: '100%' }}>
            <AnimatePresence mode="wait">
              {(selectedNote || isCreating) ? (
                <NoteEditor
                  key={selectedNote?._id || 'new'}
                  note={selectedNote}
                  onSave={handleSaveNote}
                  onDelete={handleDeleteNote}
                  onClose={handleCloseEditor}
                  onPin={handlePinNote}
                  onArchive={handleArchiveNote}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex items-center justify-center text-center text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-2xl bg-[var(--bg-secondary)]"
                  style={{ minHeight: '400px', height: '100%' }}
                >
                  <div>
                    <p className="text-lg mb-2 font-medium">Select a note to edit</p>
                    <p className="text-sm">or create a new one to get started</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Mobile Editor Modal */}
      <AnimatePresence>
        {isMobile && (selectedNote || isCreating) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--bg-primary)] z-50 p-4 overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <NoteEditor
              note={selectedNote}
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
              onClose={handleCloseEditor}
              onPin={handlePinNote}
              onArchive={handleArchiveNote}
            />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default NotesView;

