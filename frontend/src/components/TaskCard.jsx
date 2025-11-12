import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaCircle, FaTrash, FaEdit, FaClock, FaUserFriends } from 'react-icons/fa';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import ConfirmationModal from './ConfirmationModal';

const TaskCard = ({ task, onToggle, onDelete, onEdit }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useAuthStore();
  const isCompleted = task.status === 'completed';
  const isOwnTask = task.userId?._id === user?.id || task.userId === user?.id;
  const isSharedTask = task.sharedWith && task.sharedWith.length > 0;
  const sharedWithNames = task.sharedWith?.map(f => f.name || f.email || 'Friend').join(', ') || '';
  
  const priorityColors = {
    low: 'bg-green-100 text-green-700 border border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    high: 'bg-red-100 text-red-700 border border-red-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`card p-3 mb-2 ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task._id)}
          className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-full border-2 transition-all duration-300 flex items-center justify-center group ${
            isCompleted
              ? 'bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 border-green-500 shadow-lg shadow-green-500/40 scale-100'
              : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 hover:scale-105'
          }`}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-4 h-4 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`font-medium text-[var(--text-primary)] ${
                isCompleted ? 'text-[var(--text-secondary)]' : ''
              }`}
            >
              {task.title}
            </h3>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}
            >
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="text-sm text-[var(--text-secondary)] mb-2">{task.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)] flex-wrap">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <FaClock className="text-xs" />
                <span>
                  {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                  {(() => {
                    const date = new Date(task.dueDate);
                    const hours = date.getHours();
                    const minutes = date.getMinutes();
                    // Only show time if it's not the default 11:59 PM
                    if (hours !== 23 || minutes !== 59) {
                      return ` at ${format(date, 'h:mm a')}`;
                    }
                    return '';
                  })()}
                </span>
              </div>
            )}
            {!isOwnTask && task.userId && (
              <div className="flex items-center gap-1 text-[var(--accent-primary)]">
                <FaUserFriends className="text-xs" />
                <span>By {task.userId.name || task.userId.email || 'Friend'}</span>
              </div>
            )}
            {isSharedTask && (
              <div className="flex items-center gap-1 text-[var(--accent-primary)]">
                <FaUserFriends className="text-xs" />
                <span title={sharedWithNames}>Shared with {task.sharedWith.length} friend{task.sharedWith.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCompleted && onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors"
              aria-label={`Edit task: ${task.title}`}
            >
              <FaEdit />
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-[var(--text-tertiary)] hover:text-red-600 transition-colors"
            aria-label={`Delete task: ${task.title}`}
          >
            <FaTrash />
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete(task._id)}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </motion.div>
  );
};

export default TaskCard;

