import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useDataStore } from '../store/dataStore';

const TaskModal = ({ isOpen, onClose, onSave, task = null }) => {
  const { friends } = useDataStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setIsShared(task.isShared || false);
      setSelectedFriends(task.sharedWith?.map(f => f._id || f.id || f) || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setIsShared(false);
      setSelectedFriends([]);
    }
  }, [task, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      description,
      priority,
      dueDate: dueDate || null,
      isShared: isShared || selectedFriends.length > 0,
      sharedWith: selectedFriends,
    });
    onClose();
  };

  const toggleFriend = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
    if (!selectedFriends.includes(friendId)) {
      setIsShared(true);
    }
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
            className="card p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                {task ? 'Edit Task' : 'New Task'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-[var(--text-tertiary)] hover:text-red-600 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  required
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field min-h-[100px]"
                  placeholder="Task description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input-field"
                />
                {/* Quick Date Selection Buttons */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      setDueDate(today.toISOString().split('T')[0]);
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
                      setDueDate(tomorrow.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all duration-200"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 3);
                      setDueDate(date.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all duration-200"
                  >
                    In 3 days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 5);
                      setDueDate(date.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all duration-200"
                  >
                    In 5 days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 7);
                      setDueDate(date.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all duration-200"
                  >
                    In 1 week
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 10);
                      setDueDate(date.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all duration-200"
                  >
                    In 10 days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 14);
                      setDueDate(date.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all duration-200"
                  >
                    In 2 weeks
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 30);
                      setDueDate(date.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all duration-200"
                  >
                    In 1 month
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Share with Friends
                </label>
                {friends.length === 0 ? (
                  <p className="text-sm text-[var(--text-secondary)] mb-2">
                    No friends added yet. Add friends to share tasks with them.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-[var(--border-color)] rounded-lg p-3">
                    {friends.map((friend) => {
                      const friendId = friend._id || friend.id;
                      const isSelected = selectedFriends.includes(friendId);
                      return (
                        <label
                          key={friendId}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--bg-tertiary)] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFriend(friendId)}
                            className="w-4 h-4 text-[var(--accent-primary)] rounded focus:ring-[var(--accent-primary)]"
                          />
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                              {(friend.name || 'F')[0].toUpperCase()}
                            </div>
                            <span className="text-sm text-[var(--text-primary)]">
                              {friend.name || friend.email}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
                {selectedFriends.length > 0 && (
                  <p className="text-xs text-[var(--text-secondary)] mt-2">
                    {selectedFriends.length} friend{selectedFriends.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {task ? 'Update' : 'Create'} Task
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskModal;

