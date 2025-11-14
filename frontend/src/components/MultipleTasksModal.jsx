import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMagic, FaSpinner, FaTrash, FaEdit, FaPlus, FaCheck } from 'react-icons/fa';
import { useFocusTrap } from '../hooks/useFocusTrap';
import toast from 'react-hot-toast';
import { tasksAPI } from '../services/api';

const MultipleTasksModal = ({ isOpen, onClose, onGenerateTasks }) => {
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedTasks, setParsedTasks] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const modalRef = useFocusTrap(isOpen);

  const handleClose = () => {
    if (!isProcessing) {
      setTextInput('');
      setParsedTasks([]);
      setShowPreview(false);
      setEditingIndex(null);
      setEditTitle('');
      onClose();
    }
  };

  const handleGenerate = async () => {
    if (!textInput.trim()) {
      toast.error('Please paste some text to generate tasks');
      return;
    }

    if (textInput.trim().split('\n').length < 3) {
      toast.error('Please paste at least 3-4 lines of text for better task extraction');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await tasksAPI.parseMultiple(textInput.trim());
      const tasks = response.data.tasks || [];

      if (tasks.length === 0) {
        toast.error('No tasks could be extracted from the text. Please try with different content.');
        setIsProcessing(false);
        return;
      }

      setParsedTasks(tasks);
      setShowPreview(true);
      toast.success(`Successfully extracted ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Failed to parse tasks. Please try again.');
      console.error('Error parsing tasks:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditTask = (index) => {
    setEditingIndex(index);
    setEditTitle(parsedTasks[index].title || '');
  };

  const handleSaveEdit = (index) => {
    if (!editTitle.trim()) {
      toast.error('Task title cannot be empty');
      return;
    }
    const updatedTasks = [...parsedTasks];
    updatedTasks[index] = { ...updatedTasks[index], title: editTitle.trim() };
    setParsedTasks(updatedTasks);
    setEditingIndex(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditTitle('');
  };

  const handleRemoveTask = (index) => {
    const updatedTasks = parsedTasks.filter((_, i) => i !== index);
    setParsedTasks(updatedTasks);
    if (updatedTasks.length === 0) {
      setShowPreview(false);
    }
  };

  const handleAddTasks = async () => {
    if (parsedTasks.length === 0) {
      toast.error('No tasks to add');
      return;
    }

    setIsProcessing(true);
    try {
      await onGenerateTasks(parsedTasks);
      setTextInput('');
      setParsedTasks([]);
      setShowPreview(false);
      handleClose();
    } catch (error) {
      toast.error('Failed to create tasks. Please try again.');
      console.error('Error creating tasks:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToInput = () => {
    setShowPreview(false);
    setParsedTasks([]);
    setEditingIndex(null);
    setEditTitle('');
  };

  const lineCount = textInput.split('\n').length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            ref={modalRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[var(--border-color)]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <FaMagic className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">Multiple Tasks</h2>
                    <p className="text-sm text-[var(--text-secondary)]">Paste text and AI will extract tasks</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                  aria-label="Close modal"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {!showPreview ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Paste your text here (10-15 lines recommended)
                      </label>
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Example:&#10;- Review project proposal&#10;- Send email to client&#10;- Update documentation&#10;- Schedule team meeting&#10;- Prepare presentation slides&#10;&#10;Or paste any text with tasks, bullet points, or action items..."
                        className="w-full h-64 p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 resize-none"
                        disabled={isProcessing}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {lineCount} line{lineCount !== 1 ? 's' : ''} • AI will detect tasks automatically
                        </p>
                        {textInput.trim() && (
                          <button
                            onClick={() => setTextInput('')}
                            disabled={isProcessing}
                            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-color)]">
                      <p className="text-sm font-medium text-[var(--text-primary)] mb-2">💡 Tips for best results:</p>
                      <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                        <li>Paste bullet points, numbered lists, or action sentences</li>
                        <li>Each line or bullet point can become a task</li>
                        <li>AI will clean and structure each task automatically</li>
                        <li>Multi-step instructions will be broken into separate tasks</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        Review Tasks ({parsedTasks.length})
                      </h3>
                      <button
                        onClick={handleBackToInput}
                        className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        Back to Input
                      </button>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {parsedTasks.map((task, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-color)]"
                        >
                          {editingIndex === index ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEdit(index);
                                  } else if (e.key === 'Escape') {
                                    handleCancelEdit();
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleSaveEdit(index)}
                                className="p-2 text-green-500 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                                title="Save"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-2 text-[var(--text-tertiary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[var(--text-primary)]">
                                  {index + 1}. {task.title}
                                </p>
                                {task.description && (
                                  <p className="text-xs text-[var(--text-secondary)] mt-1">{task.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                  {task.priority && (
                                    <span className="text-xs px-2 py-1 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                                      {task.priority}
                                    </span>
                                  )}
                                  {task.dueDate && (
                                    <span className="text-xs text-[var(--text-tertiary)]">
                                      Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditTask(index)}
                                  className="p-2 text-[var(--text-tertiary)] hover:text-blue-500 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleRemoveTask(index)}
                                  className="p-2 text-[var(--text-tertiary)] hover:text-red-500 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                                  title="Remove"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-color)]">
                <button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                {!showPreview ? (
                  <button
                    onClick={handleGenerate}
                    disabled={isProcessing || !textInput.trim()}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FaMagic />
                        <span>Generate Tasks</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleAddTasks}
                    disabled={isProcessing || parsedTasks.length === 0}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Adding Tasks...</span>
                      </>
                    ) : (
                      <>
                        <FaPlus />
                        <span>Add Tasks ({parsedTasks.length})</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MultipleTasksModal;

