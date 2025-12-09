import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrash, FaEdit, FaChartLine } from 'react-icons/fa';
import { format, isPast, differenceInDays } from 'date-fns';

const GoalCard = ({ goal, onUpdate, onDelete, onEdit, onViewAnalytics }) => {
  const progress = goal.progress || 0;
  const deadline = new Date(goal.deadline);
  const isOverdue = isPast(deadline) && progress < 100;
  const daysRemaining = differenceInDays(deadline, new Date());
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customProgress, setCustomProgress] = useState('');

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
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-neutral-900 border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl md:text-3xl font-bold text-white/90 mb-2 leading-tight break-words">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-sm md:text-base text-white/60 mb-4 leading-relaxed break-words">
              {goal.description}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap text-xs md:text-sm">
            <span className="capitalize bg-white/5 px-3 py-1.5 rounded-full text-white/70 border border-white/10">
              {goal.category}
            </span>
            <span
              className={`leading-normal flex-shrink-0 ${
                isOverdue ? 'text-red-400 font-medium' : 'text-white/60'
              }`}
            >
              {isOverdue
                ? 'Overdue'
                : daysRemaining >= 0
                ? `${daysRemaining} days left`
                : 'Deadline passed'}
            </span>
            <span className="leading-normal flex-shrink-0 text-white/60">
              {format(deadline, 'MMM dd, yyyy')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onViewAnalytics && (
            <button
              onClick={() => onViewAnalytics(goal)}
              className="p-2.5 text-white/60 hover:text-blue-400 transition-colors rounded-xl hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="View Analytics"
              aria-label="View Analytics"
            >
              <FaChartLine className="text-base" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="p-2.5 text-white/60 hover:text-purple-400 transition-colors rounded-xl hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Edit goal"
            >
              <FaEdit className="text-base" />
            </button>
          )}
          <button
            onClick={() => onDelete(goal._id)}
            className="p-2.5 text-white/60 hover:text-red-400 transition-colors rounded-xl hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Delete goal"
          >
            <FaTrash className="text-base" />
          </button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/70">Progress</span>
          <span className="text-sm font-semibold text-white/90">{progress}%</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-purple-600 to-blue-500 shadow-lg"
          />
        </div>
      </div>

      {/* Action Buttons */}
      {onUpdate && (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onUpdate(goal._id, Math.max(0, progress - 10))}
              className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-full transition-all duration-200 text-white/80 hover:text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              -10%
            </button>
            <button
              onClick={() => onUpdate(goal._id, Math.min(100, progress + 10))}
              className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-full transition-all duration-200 text-white/80 hover:text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              +10%
            </button>
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-full transition-all duration-200 text-white/80 hover:text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              Custom
            </button>
          </div>
          {showCustomInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 items-center flex-wrap"
            >
              <input
                type="number"
                min="0"
                max="100"
                value={customProgress}
                onChange={(e) => setCustomProgress(e.target.value)}
                placeholder="Enter % (0-100)"
                className="flex-1 min-w-[120px] px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-full text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomProgress();
                  }
                }}
              />
              <button
                onClick={handleCustomProgress}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full transition-all duration-200 text-white shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
              >
                Set
              </button>
              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomProgress('');
                }}
                className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-200 text-white/80 hover:text-white"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default GoalCard;

