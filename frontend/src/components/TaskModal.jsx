import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useDataStore } from '../store/dataStore';
import ConfirmationModal from './ConfirmationModal';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useScrollLock } from '../hooks/useScrollLock';
import { playTaskAddSound } from '../utils/soundEffects';

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
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const initialValuesRef = useRef(null);
  const modalRef = useFocusTrap(isOpen);
  
  // Lock body scroll when modal is open
  useScrollLock(isOpen);

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
      const taskTitle = task.title || '';
      const taskDescription = task.description || '';
      const taskPriority = task.priority || 'medium';
      let taskDueDate = '';
      let taskDueTime = '';
      if (task.dueDate) {
        // Parse the date from backend (ISO string) and convert to local timezone
        const date = new Date(task.dueDate);
        // Get local date components
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        taskDueDate = `${year}-${month}-${day}`;
        // Get local time components
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        taskDueTime = `${hours}:${minutes}`;
      }
      const taskIsShared = task.isShared || false;
      const taskSelectedFriends = task.sharedWith?.map(f => f._id || f.id || f) || [];
      const taskSelectedGoalId = task.goalId?._id || task.goalId || '';
      
      setTitle(taskTitle);
      setDescription(taskDescription);
      setPriority(taskPriority);
      setDueDate(taskDueDate);
      setDueTime(taskDueTime);
      setIsShared(taskIsShared);
      setSelectedFriends(taskSelectedFriends);
      setSelectedGoalId(taskSelectedGoalId);
      
      // Store initial values for comparison
      initialValuesRef.current = {
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        dueDate: taskDueDate,
        dueTime: taskDueTime,
        isShared: taskIsShared,
        selectedFriends: taskSelectedFriends,
        selectedGoalId: taskSelectedGoalId,
      };
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setDueTime('');
      setIsShared(false);
      setSelectedFriends([]);
      setSelectedGoalId('');
      setErrors({});
      initialValuesRef.current = {
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        dueTime: '',
        isShared: false,
        selectedFriends: [],
        selectedGoalId: '',
      };
    }
  }, [task, isOpen]);

  // Check if form has unsaved changes
  const hasUnsavedChanges = () => {
    if (!initialValuesRef.current) return false;
    const current = {
      title,
      description,
      priority,
      dueDate,
      dueTime,
      isShared,
      selectedFriends: selectedFriends.sort(),
      selectedGoalId,
    };
    const initial = {
      ...initialValuesRef.current,
      selectedFriends: initialValuesRef.current.selectedFriends.sort(),
    };
    return JSON.stringify(current) !== JSON.stringify(initial);
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  // Helper function to get today's date in local timezone as YYYY-MM-DD
  const getTodayLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to parse date string (YYYY-MM-DD) in local timezone
  const parseLocalDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Task title must be at least 3 characters';
    } else if (title.trim().length > 200) {
      newErrors.title = 'Task title must be less than 200 characters';
    }
    
    if (description && description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }
    
    if (dueDate) {
      // Parse date in local timezone and compare with today in local timezone
      const selectedDate = parseLocalDate(dueDate);
      const today = parseLocalDate(getTodayLocal());
      
      // Allow today and future dates, but warn about past dates
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Combine date and time into a single Date object in local timezone
    let dueDateTimeValue = null;
    if (dueDate) {
      // Parse date in local timezone (YYYY-MM-DD format)
      const [year, month, day] = dueDate.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      
      if (dueTime) {
        const [hours, minutes] = dueTime.split(':').map(Number);
        dateObj.setHours(hours, minutes, 0, 0);
      } else {
        // Default to 11:59 PM if no time specified
        dateObj.setHours(23, 59, 0, 0);
      }
      // Convert to ISO string for backend (this will include timezone info)
      dueDateTimeValue = dateObj.toISOString();
    }
    
    // Play sound only when adding a new task (not editing)
    if (!task) {
      playTaskAddSound();
    }
    
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDateTimeValue,
      isShared: isShared || selectedFriends.length > 0,
      sharedWith: selectedFriends,
      goalId: selectedGoalId || null,
    });
    setErrors({});
    onClose();
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape' && !showCloseConfirm) {
      handleClose();
    }
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
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-x-hidden"
            onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="p-3 sm:p-5 w-full max-w-2xl h-[95vh] sm:h-[90vh] max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-t-3xl sm:rounded-2xl mx-0 sm:mx-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleEscape}
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
            style={{
              backgroundColor: 'var(--bg-modal)',
              boxShadow: 'var(--shadow-2xl), 0 0 0 1px var(--border-color)',
            }}
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center mb-2 pt-2 flex-shrink-0">
              <div className="w-12 h-1.5 bg-[var(--border-color)] rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0 pb-3 sm:pb-4 border-b border-[var(--border-color)]">
              <h2 id="task-modal-title" className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                {task ? 'Edit Task' : 'New Task'}
              </h2>
                <button
                  onClick={handleClose}
                  className="p-2 text-[var(--text-tertiary)] hover:bg-red-500/10 hover:text-red-500 transition-all touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  aria-label="Close modal"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <ConfirmationModal
                isOpen={showCloseConfirm}
                onClose={() => setShowCloseConfirm(false)}
                onConfirm={() => {
                  setShowCloseConfirm(false);
                  onClose();
                }}
                title="Discard Changes?"
                message="You have unsaved changes. Are you sure you want to close without saving?"
                confirmText="Discard"
                cancelText="Keep Editing"
                type="warning"
              />

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-2.5 sm:space-y-3" style={{ scrollbarWidth: 'thin' }}>
                {/* Title and Description Row */}
                <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                  <div>
                    <label htmlFor="task-title" className="block text-xs font-semibold text-[var(--text-primary)] mb-1 sm:mb-1.5">
                      Title *
                    </label>
                    <input
                      id="task-title"
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title) {
                          setErrors({ ...errors, title: '' });
                        }
                      }}
                      className={`input-field py-2 sm:py-2.5 text-sm ${errors.title ? 'border-red-500' : ''}`}
                      required
                      placeholder="Task title"
                      aria-invalid={errors.title ? 'true' : 'false'}
                      aria-describedby={errors.title ? 'title-error' : undefined}
                    />
                    {errors.title && (
                      <p id="title-error" className="mt-0.5 sm:mt-1 text-xs text-red-600" role="alert">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="task-description" className="block text-xs font-semibold text-[var(--text-primary)] mb-1 sm:mb-1.5">
                      Description
                    </label>
                    <textarea
                      id="task-description"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (errors.description) {
                          setErrors({ ...errors, description: '' });
                        }
                      }}
                      className={`input-field py-2 sm:py-2.5 text-sm min-h-[50px] sm:min-h-[60px] max-h-[60px] sm:max-h-[80px] resize-none ${errors.description ? 'border-red-500' : ''}`}
                      placeholder="Task description (optional)"
                      aria-invalid={errors.description ? 'true' : 'false'}
                      aria-describedby={errors.description ? 'description-error' : undefined}
                    />
                    <div className="flex justify-between items-center mt-0.5 sm:mt-1">
                      {errors.description && (
                        <p id="description-error" className="text-xs text-red-600" role="alert">
                          {errors.description}
                        </p>
                      )}
                      <p className={`text-xs ml-auto ${description.length > 1000 ? 'text-red-600' : 'text-[var(--text-tertiary)]'}`}>
                        {description.length}/1000
                      </p>
                    </div>
                  </div>
                </div>

                {/* Priority and Date/Time Row */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label htmlFor="task-priority" className="block text-xs font-semibold text-[var(--text-primary)] mb-1 sm:mb-1.5">
                      Priority
                    </label>
                    <select
                      id="task-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="input-field py-2 sm:py-2.5 text-sm"
                      aria-label="Task priority"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1 sm:mb-1.5">
                      Due Date
                    </label>
                    <input
                      id="task-due-date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => {
                        setDueDate(e.target.value);
                        if (errors.dueDate) {
                          setErrors({ ...errors, dueDate: '' });
                        }
                      }}
                      className={`input-field py-2 sm:py-2.5 text-sm ${errors.dueDate ? 'border-red-500' : ''}`}
                      aria-invalid={errors.dueDate ? 'true' : 'false'}
                      aria-describedby={errors.dueDate ? 'due-date-error' : undefined}
                    />
                    {errors.dueDate && (
                      <p id="due-date-error" className="mt-0.5 sm:mt-1 text-xs text-red-600" role="alert">
                        {errors.dueDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Time and Quick Date Buttons */}
                {dueDate && (
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1 sm:mb-1.5">
                      Time
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="task-due-time"
                        type="time"
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                        className="input-field py-2 sm:py-2.5 text-sm flex-1"
                        placeholder="Optional"
                        aria-label="Due time (optional)"
                      />
                      {dueTime && (
                        <button
                          type="button"
                          onClick={() => setDueTime('')}
                          className="px-2 sm:px-3 py-2 sm:py-2.5 text-xs font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500 transition-all"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {!dueTime && !errors.dueDate && (
                      <p className="mt-0.5 sm:mt-1 text-xs text-[var(--text-secondary)]">
                        Defaults to 11:59 PM
                      </p>
                    )}
                    {/* Quick Time Selection Buttons */}
                    <div className="mt-1.5 sm:mt-2 flex gap-1 sm:gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
                      {['09:00', '12:00', '15:00', '17:00', '19:00', '21:00'].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setDueTime(time)}
                          className={`px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap flex-shrink-0 ${
                            dueTime === time
                              ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                              : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {time === '09:00' ? '9 AM' : time === '12:00' ? '12 PM' : time === '15:00' ? '3 PM' : time === '17:00' ? '5 PM' : time === '19:00' ? '7 PM' : '9 PM'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Date Selection Buttons */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1 sm:mb-1.5">
                    Quick Dates
                  </label>
                  <div className="flex gap-1 sm:gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
                    {[
                      { label: 'Today', days: 0 },
                      { label: 'Tomorrow', days: 1 },
                      { label: '3 Days', days: 3 },
                      { label: '1 Week', days: 7 },
                      { label: '2 Weeks', days: 14 },
                      { label: '1 Month', days: 30 },
                    ].map(({ label, days }) => {
                      const getDateString = (daysOffset) => {
                        const date = new Date();
                        date.setDate(date.getDate() + daysOffset);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                      };
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setDueDate(getDateString(days))}
                          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap flex-shrink-0 ${
                            dueDate === getDateString(days)
                              ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                              : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Goal and Friends Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1 sm:mb-1.5">
                      Goal (Optional)
                    </label>
                    {activeGoals.length === 0 ? (
                      <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-1.5 sm:p-2 text-center">
                        <p className="text-xs text-[var(--text-secondary)]">
                          {!goals || goals.length === 0 ? 'No goals yet' : 'All goals completed'}
                        </p>
                      </div>
                    ) : (
                      <select
                        value={selectedGoalId}
                        onChange={(e) => setSelectedGoalId(e.target.value)}
                        className="input-field py-2 sm:py-2.5 text-sm w-full"
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
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1 sm:mb-1.5">
                      Share with Friends
                    </label>
                    {!friends || friends.length === 0 ? (
                      <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-1.5 sm:p-2 text-center">
                        <p className="text-xs text-[var(--text-secondary)]">No friends</p>
                      </div>
                    ) : (
                      <div className="max-h-24 sm:max-h-32 overflow-y-auto border border-[var(--border-color)] rounded-lg p-1.5 sm:p-2 bg-[var(--bg-secondary)] space-y-1 sm:space-y-1.5" style={{ scrollbarWidth: 'thin' }}>
                        {friends.map((friend) => {
                          const friendId = friend._id || friend.id;
                          if (!friendId) return null;
                          const isSelected = selectedFriends.includes(friendId);
                          return (
                            <label
                              key={friendId}
                              className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-lg cursor-pointer transition-all ${
                                isSelected 
                                  ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30' 
                                  : 'hover:bg-[var(--bg-tertiary)] border border-transparent'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleFriend(friendId)}
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent-primary)] rounded focus:ring-2 focus:ring-[var(--accent-primary)] cursor-pointer flex-shrink-0"
                              />
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-[10px] sm:text-xs flex-shrink-0">
                                {(friend.name || friend.email || 'F')[0].toUpperCase()}
                              </div>
                              <span className="text-xs font-medium text-[var(--text-primary)] truncate flex-1">
                                {friend.name || friend.email || 'Friend'}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                    {selectedFriends.length > 0 && (
                      <p className="mt-1 sm:mt-1.5 text-xs text-[var(--accent-primary)] text-center">
                        ✓ {selectedFriends.length} selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-[var(--border-color)] flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1 py-2 sm:py-2.5 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 py-2 sm:py-2.5 text-sm sm:text-base">
                  <span>{task ? 'Update' : 'Create'} Task</span>
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

