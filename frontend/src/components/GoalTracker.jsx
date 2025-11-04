import { motion } from 'framer-motion';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { format, isPast, differenceInDays } from 'date-fns';

const GoalTracker = ({ goal, onUpdate, onDelete, onEdit }) => {
  const progress = goal.progress || 0;
  const deadline = new Date(goal.deadline);
  const isOverdue = isPast(deadline) && progress < 100;
  const daysRemaining = differenceInDays(deadline, new Date());

  const progressColor =
    progress >= 100
      ? 'bg-green-500'
      : progress >= 75
      ? 'bg-blue-500'
      : progress >= 50
      ? 'bg-yellow-500'
      : 'bg-red-500';

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
        <div className="mt-4 flex gap-2">
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
        </div>
      )}
    </motion.div>
  );
};

export default GoalTracker;

