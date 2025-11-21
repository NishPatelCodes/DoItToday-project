import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useScrollLock } from '../hooks/useScrollLock';

const GoalModal = ({ isOpen, onClose, onSave, goal = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('general');
  const [isShared, setIsShared] = useState(false);
  
  // Lock body scroll when modal is open
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      if (goal) {
        setTitle(goal.title || '');
        setDescription(goal.description || '');
        setDeadline(goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '');
        setCategory(goal.category || 'general');
        setIsShared(goal.isShared || false);
      } else {
        // Reset form for new goal
        setTitle('');
        setDescription('');
        setDeadline('');
        setCategory('general');
        setIsShared(false);
      }
    }
  }, [goal, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      description,
      deadline,
      category,
      isShared,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="card p-4 md:p-6 w-full max-w-md max-h-[90vh] md:max-h-[85vh] overflow-y-auto rounded-xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-[var(--text-primary)]">
                {goal ? 'Edit Goal' : 'New Goal'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-[var(--text-tertiary)] hover:text-red-600 dark:hover:text-red-400 transition-colors touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                aria-label="Close modal"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2 leading-normal">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  required
                  placeholder="Goal title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2 leading-normal">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field min-h-[100px] resize-y"
                  placeholder="Goal description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2 leading-normal">
                  Deadline *
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="input-field"
                  min={goal ? undefined : new Date().toISOString().split('T')[0]}
                  required
                />
                {/* Quick Date Selection Buttons */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      setDeadline(today.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all duration-200"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setDeadline(tomorrow.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all duration-200"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 7);
                      setDeadline(date.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all duration-200"
                  >
                    In 1 week
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 30);
                      setDeadline(date.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all duration-200"
                  >
                    In 1 month
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 90);
                      setDeadline(date.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all duration-200"
                  >
                    In 3 months
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2 leading-normal">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="general">General</option>
                  <option value="health">Health</option>
                  <option value="career">Career</option>
                  <option value="learning">Learning</option>
                  <option value="personal">Personal</option>
                </select>
              </div>

              <div className="flex items-center gap-3 min-h-[48px]">
                <input
                  type="checkbox"
                  id="isSharedGoal"
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                  className="w-5 h-5 text-[var(--accent-primary)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] cursor-pointer touch-manipulation flex-shrink-0"
                />
                <label htmlFor="isSharedGoal" className="text-sm font-medium text-[var(--text-primary)] leading-normal cursor-pointer">
                  Share with friends
                </label>
              </div>

              <div className="flex gap-3 pt-4 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1"
                >
                  <span>Cancel</span>
                </button>
                <button type="submit" className="btn-primary flex-1">
                  <span>{goal ? 'Update' : 'Create'} Goal</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GoalModal;

