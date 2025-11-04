import { motion } from 'framer-motion';
import { FaCheckCircle, FaFire, FaTrash, FaEdit } from 'react-icons/fa';

const HabitCard = ({ habit, onComplete, onDelete, onEdit }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isCompletedToday = habit.completionDates?.some(
    (entry) => new Date(entry.date).setHours(0, 0, 0, 0) === today.getTime() && entry.completed
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card p-4 mb-3"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => !isCompletedToday && onComplete(habit._id)}
          disabled={isCompletedToday}
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
            isCompletedToday
              ? 'bg-indigo-500 text-white shadow-md'
              : 'bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:border-indigo-500 text-[var(--text-tertiary)] hover:text-indigo-600'
          }`}
        >
          <FaCheckCircle className="text-xl" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{habit.icon}</span>
            <h3 className="font-semibold text-[var(--text-primary)] text-lg">{habit.name}</h3>
          </div>

          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
            <div className="flex items-center gap-1">
              <FaFire className="text-orange-500" />
              <span className="font-medium text-[var(--text-primary)]">{habit.streak || 0} day streak</span>
            </div>
            {habit.longestStreak > 0 && (
              <span className="text-[var(--text-tertiary)]">Best: {habit.longestStreak} days</span>
            )}
            <span className="text-[var(--text-tertiary)]">{habit.totalCompletions || 0} total</span>
          </div>

          {habit.description && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">{habit.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(habit)}
              className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors"
            >
              <FaEdit />
            </button>
          )}
          <button
            onClick={() => onDelete(habit._id)}
            className="p-2 text-[var(--text-tertiary)] hover:text-red-600 transition-colors"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, ((habit.streak || 0) / 30) * 100)}%`,
            }}
          />
        </div>
        <span className="text-xs text-[var(--text-tertiary)]">{Math.round((habit.streak || 0) / 30 * 100)}% to 30</span>
      </div>
    </motion.div>
  );
};

export default HabitCard;

