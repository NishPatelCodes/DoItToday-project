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
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-neutral-900 border border-white/5 rounded-xl p-5 shadow-inner shadow-black/40 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white/90 mb-1.5 leading-tight break-words">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-sm text-white/60 mb-3 leading-relaxed break-words">
              {goal.description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="capitalize bg-white/5 px-2 py-1 rounded-full text-white/70 border border-white/10">
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
            <span className="leading-normal flex-shrink-0 text-white/40">
              {format(deadline, 'MMM dd, yyyy')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onViewAnalytics && (
            <button
              onClick={() => onViewAnalytics(goal)}
              className="p-2 text-white/60 hover:text-blue-400 transition-colors rounded-lg hover:bg-white/5 min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="View Analytics"
              aria-label="View Analytics"
            >
              <FaChartLine className="text-sm" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="p-2 text-white/60 hover:text-purple-400 transition-colors rounded-lg hover:bg-white/5 min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Edit goal"
            >
              <FaEdit className="text-sm" />
            </button>
          )}
          <button
            onClick={() => onDelete(goal._id)}
            className="p-2 text-white/60 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5 min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Delete goal"
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white/70">Progress</span>
          <span className="text-xs font-semibold text-white/90">{progress}%</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-purple-600/70 via-purple-500/70 to-blue-600/70"
          />
        </div>
      </div>

      {/* Action Buttons */}
      {onUpdate && (
        <div className="space-y-2">
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => onUpdate(goal._id, Math.max(0, progress - 10))}
              className="px-3 py-1 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-full transition-all duration-200 text-white/80 hover:text-white"
            >
              -10%
            </button>
            <button
              onClick={() => onUpdate(goal._id, Math.min(100, progress + 10))}
              className="px-3 py-1 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-full transition-all duration-200 text-white/80 hover:text-white"
            >
              +10%
            </button>
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="px-3 py-1 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-full transition-all duration-200 text-white/80 hover:text-white"
            >
              Custom
            </button>
          </div>
          {showCustomInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-1.5 items-center flex-wrap"
            >
              <input
                type="number"
                min="0"
                max="100"
                value={customProgress}
                onChange={(e) => setCustomProgress(e.target.value)}
                placeholder="Enter % (0-100)"
                className="flex-1 min-w-[100px] px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-full text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomProgress();
                  }
                }}
              />
              <button
                onClick={handleCustomProgress}
                className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-600 hover:to-blue-600 rounded-full transition-all duration-200 text-white"
              >
                Set
              </button>
              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomProgress('');
                }}
                className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-200 text-white/80 hover:text-white"
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

