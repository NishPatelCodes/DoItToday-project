import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useDataStore } from '../store/dataStore';

const TaskModal = ({ isOpen, onClose, onSave, task = null }) => {
  const { friends, goals } = useDataStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState('');

  // Filter active goals (not 100% complete)
  const activeGoals = goals ? goals.filter(g => (g.progress || 0) < 100) : [];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setDueTime('');
      setIsShared(false);
      setSelectedFriends([]);
      setSelectedGoalId('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      if (task.dueDate) {
        const date = new Date(task.dueDate);
        setDueDate(date.toISOString().split('T')[0]);
        // Extract time in HH:MM format
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        setDueTime(`${hours}:${minutes}`);
      } else {
        setDueDate('');
        setDueTime('');
      }
      setIsShared(task.isShared || false);
      setSelectedFriends(task.sharedWith?.map(f => f._id || f.id || f) || []);
      setSelectedGoalId(task.goalId?._id || task.goalId || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setDueTime('');
      setIsShared(false);
      setSelectedFriends([]);
      setSelectedGoalId('');
    }
  }, [task, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Combine date and time into a single Date object
    let dueDateTimeValue = null;
    if (dueDate) {
      const dateObj = new Date(dueDate);
      if (dueTime) {
        const [hours, minutes] = dueTime.split(':');
        dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      } else {
        // Default to 11:59 PM if no time specified
        dateObj.setHours(23, 59, 0, 0);
      }
      dueDateTimeValue = dateObj.toISOString();
    }
    
    onSave({
      title,
      description,
      priority,
      dueDate: dueDateTimeValue,
      isShared: isShared || selectedFriends.length > 0,
      sharedWith: selectedFriends,
      goalId: selectedGoalId || null,
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
            className="card p-4 md:p-6 w-full max-w-md max-h-[90vh] md:max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-[var(--text-primary)]">
                {task ? 'Edit Task' : 'New Task'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-[var(--text-tertiary)] hover:text-red-600 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
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
                  Due Date & Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input-field flex-1"
                  />
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="input-field w-32"
                    placeholder="Optional"
                  />
                </div>
                {dueDate && !dueTime && (
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    No time specified - will default to 11:59 PM
                  </p>
                )}
                {/* Quick Time Selection Buttons */}
                {dueDate && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDueTime('09:00')}
                      className="px-2 py-1 text-xs font-medium rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all"
                    >
                      9 AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setDueTime('12:00')}
                      className="px-2 py-1 text-xs font-medium rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all"
                    >
                      12 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => setDueTime('15:00')}
                      className="px-2 py-1 text-xs font-medium rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all"
                    >
                      3 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => setDueTime('17:00')}
                      className="px-2 py-1 text-xs font-medium rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all"
                    >
                      5 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => setDueTime('19:00')}
                      className="px-2 py-1 text-xs font-medium rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all"
                    >
                      7 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => setDueTime('21:00')}
                      className="px-2 py-1 text-xs font-medium rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all"
                    >
                      9 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => setDueTime('')}
                      className="px-2 py-1 text-xs font-medium rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-red-500 hover:border-red-500 transition-all"
                    >
                      Clear
                    </button>
                  </div>
                )}
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

              <div className="border-t border-[var(--border-color)] pt-4 mt-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Associate with Goal (Optional)
                </label>
                {activeGoals.length === 0 ? (
                  <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-3 text-center">
                    <p className="text-xs text-[var(--text-secondary)]">
                      {!goals || goals.length === 0
                        ? 'No goals yet. Create a goal first to associate tasks with it.'
                        : 'All goals are completed. Create a new goal to associate tasks with it.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <select
                        value={selectedGoalId}
                        onChange={(e) => setSelectedGoalId(e.target.value)}
                        className="input-field w-full pr-10"
                        style={{ 
                          cursor: 'pointer',
                          paddingRight: '2.5rem',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.75rem center',
                          backgroundSize: '12px',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none'
                        }}
                      >
                        <option value="">No goal</option>
                        {activeGoals.map((goal) => {
                          const goalId = goal._id || goal.id;
                          const goalTitle = goal.title || 'Untitled Goal';
                          return (
                            <option key={goalId} value={goalId}>
                              {goalTitle}
                            </option>
                          );
                        })}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {selectedGoalId && (
                      <p className="mt-2 text-xs text-[var(--text-secondary)]">
                        ✓ This task will help you achieve your goal
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="border-t border-[var(--border-color)] pt-4 mt-4">
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Share with Friends
                  </span>
                </label>
                {!friends || friends.length === 0 ? (
                  <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4 text-center">
                    <p className="text-sm text-[var(--text-secondary)] mb-2">
                      No friends added yet
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Add friends from the Team page to share tasks with them
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-[var(--border-color)] rounded-lg p-3 bg-[var(--bg-secondary)]">
                      {friends.map((friend) => {
                        const friendId = friend._id || friend.id;
                        if (!friendId) {
                          return null; // Skip friends without ID
                        }
                        const isSelected = selectedFriends.includes(friendId);
                        return (
                          <label
                            key={friendId}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30' 
                                : 'hover:bg-[var(--bg-tertiary)] border border-transparent'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleFriend(friendId)}
                              className="w-5 h-5 text-[var(--accent-primary)] rounded focus:ring-2 focus:ring-[var(--accent-primary)] cursor-pointer"
                            />
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                {(friend.name || friend.email || 'F')[0].toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-[var(--text-primary)]">
                                {friend.name || friend.email || 'Friend'}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    {selectedFriends.length > 0 && (
                      <div className="mt-3 p-2 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 rounded-lg">
                        <p className="text-xs font-medium text-[var(--accent-primary)] text-center">
                          ✓ {selectedFriends.length} friend{selectedFriends.length > 1 ? 's' : ''} selected
                        </p>
                      </div>
                    )}
                  </>
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

