import { useState, useEffect } from 'react';
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
  const [showArchived, setShowArchived] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [tags, setTags] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadNotes();
    loadTags();
  }, [showArchived, searchQuery, selectedTag]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const params = {
        archived: showArchived,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedTag && { tag: selectedTag }),
      };
      const response = await notesAPI.getAll(params);
      setNotes(response.data || []);
    } catch (error) {
      toast.error('Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = await notesAPI.getAllTags();
      setTags(response.data || []);
    } catch (error) {
      // Silently handle error
    }
  };

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
      if (id) {
        await notesAPI.update(id, noteData);
        toast.success('Note updated successfully');
      } else {
        await notesAPI.create(noteData);
        toast.success('Note created successfully');
        setIsCreating(false);
      }
      await loadNotes();
      await loadTags();
      if (!id) {
        setSelectedNote(null);
      }
    } catch (error) {
      toast.error('Failed to save note. Please try again.');
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await notesAPI.delete(id);
      toast.success('Note deleted successfully');
      if (selectedNote && selectedNote._id === id) {
        setSelectedNote(null);
      }
      await loadNotes();
      await loadTags();
    } catch (error) {
      toast.error('Failed to delete note. Please try again.');
    }
  };

  const handlePinNote = async (id, isPinned) => {
    try {
      await notesAPI.update(id, { isPinned });
      await loadNotes();
      if (selectedNote && selectedNote._id === id) {
        setSelectedNote({ ...selectedNote, isPinned });
      }
    } catch (error) {
      toast.error('Failed to update note. Please try again.');
    }
  };

  const handleArchiveNote = async (id, isArchived) => {
    try {
      await notesAPI.update(id, { isArchived });
      toast.success(isArchived ? 'Note archived' : 'Note unarchived');
      await loadNotes();
      if (selectedNote && selectedNote._id === id) {
        setSelectedNote(null);
      }
    } catch (error) {
      toast.error('Failed to update note. Please try again.');
    }
  };

  const handleCloseEditor = () => {
    setSelectedNote(null);
    setIsCreating(false);
  };

  const pinnedNotes = notes.filter(note => note.isPinned && !note.isArchived);
  const regularNotes = notes.filter(note => !note.isPinned && !note.isArchived);
  const archivedNotes = notes.filter(note => note.isArchived);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
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
        <div className="w-full md:w-80 lg:w-96 flex flex-col md:border-r md:border-[var(--border-color)] md:pr-6 min-h-0">
          {/* Search and Filters */}
          <div className="mb-4 space-y-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)] text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent-primary)] transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowArchived(!showArchived)}
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
          <div className="flex-1 overflow-y-auto">
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

        {/* Editor Area */}
        <div className="flex-1 min-w-0 hidden md:flex min-h-0">
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
                className="h-full flex items-center justify-center text-center text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-2xl bg-[var(--bg-secondary)]"
              >
                <div>
                  <p className="text-lg mb-2">Select a note to edit</p>
                  <p className="text-sm">or create a new one to get started</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Editor Modal */}
      {typeof window !== 'undefined' && (
        <AnimatePresence>
          {(selectedNote || isCreating) && window.innerWidth < 768 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[var(--bg-primary)] z-50 p-4"
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
      )}
    </div>
  );
};

export default NotesView;

