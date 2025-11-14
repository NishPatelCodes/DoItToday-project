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
      className="card p-5 mb-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-[var(--text-primary)] mb-1">{goal.title}</h3>
          {goal.description && (
            <p className="text-sm text-[var(--text-secondary)] mb-2">{goal.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
            <span className="capitalize bg-[var(--bg-tertiary)] px-2 py-1 rounded text-[var(--text-secondary)]">
              {goal.category}
            </span>
            <span
              className={isOverdue ? 'text-red-600 font-medium' : 'text-[var(--text-secondary)]'}
            >
              {isOverdue
                ? 'Overdue'
                : daysRemaining >= 0
                ? `${daysRemaining} days left`
                : 'Deadline passed'}
            </span>
            <span>{format(deadline, 'MMM dd, yyyy')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onViewAnalytics && (
            <button
              onClick={() => onViewAnalytics(goal)}
              className="p-2 text-[var(--text-tertiary)] hover:text-blue-600 transition-colors"
              title="View Analytics"
            >
              <FaChartLine />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors"
            >
              <FaEdit />
            </button>
          )}
          <button
            onClick={() => onDelete(goal._id)}
            className="p-2 text-[var(--text-tertiary)] hover:text-red-600 transition-colors"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-medium text-[var(--text-secondary)]">Progress</span>
          <span className="font-bold text-[var(--text-primary)]">{progress}%</span>
        </div>
        <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full ${progressColor} rounded-full shadow-lg`}
          />
        </div>
      </div>

      {onUpdate && (
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate(goal._id, Math.max(0, progress - 10))}
              className="px-3 py-1 text-sm bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] rounded transition-colors text-[var(--text-primary)]"
            >
              -10%
            </button>
            <button
              onClick={() => onUpdate(goal._id, Math.min(100, progress + 10))}
              className="px-3 py-1 text-sm bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] rounded transition-colors text-[var(--text-primary)]"
            >
              +10%
            </button>
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="px-3 py-1 text-sm bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] rounded transition-colors text-[var(--text-primary)]"
            >
              Custom
            </button>
          </div>
          {showCustomInput && (
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="0"
                max="100"
                value={customProgress}
                onChange={(e) => setCustomProgress(e.target.value)}
                placeholder="Enter % (0-100)"
                className="flex-1 px-3 py-1 text-sm input-field"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomProgress();
                  }
                }}
              />
              <button
                onClick={handleCustomProgress}
                className="px-3 py-1 text-sm btn-primary"
              >
                Set
              </button>
              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomProgress('');
                }}
                className="px-3 py-1 text-sm bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] rounded transition-colors text-[var(--text-primary)]"
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

