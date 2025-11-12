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
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="card p-5 mb-3"
    >
      <div className="flex items-center gap-4">
        <motion.button
          onClick={() => !isCompletedToday && onComplete(habit._id)}
          disabled={isCompletedToday}
          whileHover={!isCompletedToday ? { scale: 1.05 } : {}}
          whileTap={!isCompletedToday ? { scale: 0.95 } : {}}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isCompletedToday
              ? 'bg-[var(--accent-primary)] text-white shadow-md'
              : 'bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] text-[var(--text-tertiary)] hover:text-[var(--accent-primary)]'
          }`}
        >
          <FaCheckCircle className="text-xl" />
        </motion.button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{habit.icon}</span>
            <h3 className="font-semibold text-[var(--text-primary)] text-lg" style={{ letterSpacing: '-0.01em' }}>{habit.name}</h3>
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
            <motion.button
              onClick={() => onEdit(habit)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors rounded-lg hover:bg-[var(--bg-tertiary)]"
            >
              <FaEdit />
            </motion.button>
          )}
          <motion.button
            onClick={() => onDelete(habit._id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-[var(--text-tertiary)] hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <FaTrash />
          </motion.button>
        </div>
      </div>

      {/* Progress bar - Apple-style */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[var(--accent-primary)] rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(100, ((habit.streak || 0) / 30) * 100)}%`,
            }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
        <span className="text-xs text-[var(--text-tertiary)] font-medium">{Math.round((habit.streak || 0) / 30 * 100)}% to 30</span>
      </div>
    </motion.div>
  );
};

export default HabitCard;

