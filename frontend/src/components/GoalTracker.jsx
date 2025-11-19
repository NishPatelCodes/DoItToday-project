import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrash, FaEdit, FaChartLine } from 'react-icons/fa';
import { format, isPast, differenceInDays } from 'date-fns';

const GoalTracker = ({ goal, onUpdate, onDelete, onEdit, onViewAnalytics }) => {
  const progress = goal.progress || 0;
  const deadline = new Date(goal.deadline);
  const isOverdue = isPast(deadline) && progress < 100;
  const daysRemaining = differenceInDays(deadline, new Date());
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customProgress, setCustomProgress] = useState('');

  const progressColor = 'bg-sky-500';

  const handleCustomProgress = () => {
    const value = parseInt(customProgress);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      onUpdate(goal._id, value);
      setCustomProgress('');
      setShowCustomInput(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card p-4 md:p-6 mb-4 rounded-xl"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--text-primary)] mb-2 leading-snug break-words">{goal.title}</h3>
          {goal.description && (
            <p className="text-sm text-[var(--text-secondary)] mb-3 leading-relaxed break-words">{goal.description}</p>
          )}
          <div className="flex items-center gap-3 flex-wrap text-xs text-[var(--text-tertiary)]">
            <span className="capitalize bg-[var(--bg-tertiary)] px-2 py-1 rounded-lg text-[var(--text-secondary)] leading-normal flex-shrink-0">
              {goal.category}
            </span>
            <span
              className={`leading-normal flex-shrink-0 ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-[var(--text-secondary)]'}`
            >
              {isOverdue
                ? 'Overdue'
                : daysRemaining >= 0
                ? `${daysRemaining} days left`
                : 'Deadline passed'}
            </span>
            <span className="leading-normal flex-shrink-0">{format(deadline, 'MMM dd, yyyy')}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {onViewAnalytics && (
            <button
              onClick={() => onViewAnalytics(goal)}
              className="p-2 text-[var(--text-tertiary)] hover:text-blue-600 dark:hover:text-blue-400 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              title="View Analytics"
              aria-label="View Analytics"
            >
              <FaChartLine className="text-base" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2"
              aria-label="Edit goal"
            >
              <FaEdit className="text-base" />
            </button>
          )}
          <button
            onClick={() => onDelete(goal._id)}
            className="p-2 text-[var(--text-tertiary)] hover:text-red-600 dark:hover:text-red-400 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            aria-label="Delete goal"
          >
            <FaTrash className="text-base" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold text-[var(--text-secondary)] leading-normal">Progress</span>
          <span className="font-bold text-[var(--text-primary)] leading-normal">{progress}%</span>
        </div>
        <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full ${progressColor} rounded-full shadow-lg`}
          />
        </div>
      </div>

      {onUpdate && (
        <div className="mt-6 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onUpdate(goal._id, Math.max(0, progress - 10))}
              className="px-3 py-2 text-sm font-medium bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] rounded-xl transition-colors text-[var(--text-primary)] touch-manipulation min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2"
            >
              -10%
            </button>
            <button
              onClick={() => onUpdate(goal._id, Math.min(100, progress + 10))}
              className="px-3 py-2 text-sm font-medium bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] rounded-xl transition-colors text-[var(--text-primary)] touch-manipulation min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2"
            >
              +10%
            </button>
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="px-3 py-2 text-sm font-medium bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] rounded-xl transition-colors text-[var(--text-primary)] touch-manipulation min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2"
            >
              Custom
            </button>
          </div>
          {showCustomInput && (
            <div className="flex gap-2 items-center flex-wrap">
              <input
                type="number"
                min="0"
                max="100"
                value={customProgress}
                onChange={(e) => setCustomProgress(e.target.value)}
                placeholder="Enter % (0-100)"
                className="flex-1 min-w-[120px] px-3 py-2 text-sm input-field"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomProgress();
                  }
                }}
              />
              <button
                onClick={handleCustomProgress}
                className="px-3 py-2 text-sm btn-primary"
              >
                <span>Set</span>
              </button>
              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomProgress('');
                }}
                className="px-3 py-2 text-sm font-medium bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] rounded-xl transition-colors text-[var(--text-primary)] touch-manipulation min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default GoalTracker;

