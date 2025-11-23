import { motion } from 'framer-motion';
import { format, isToday, isPast, startOfDay } from 'date-fns';
import { FaFlag } from 'react-icons/fa';

/**
 * Modern Day Card Component
 * Clean, card-based design optimized for mobile and desktop
 * View-only: displays tasks without interaction options
 */
const DayCard = ({ 
  date, 
  tasks = [], 
  goals = [], 
  isToday: isTodayProp,
  onDateClick,
}) => {
  const allItems = [...tasks, ...goals];
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Check if date is in the past (not today or future)
  const isPastDate = isPast(startOfDay(date)) && !isTodayProp;
  const canAddTask = !isPastDate; // Only allow adding tasks for today and future dates

  const dayName = format(date, 'EEE');
  const dayNumber = format(date, 'd');
  const monthDay = format(date, 'MMM d');
  const fullDate = format(date, 'EEEE, MMMM d, yyyy');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative mb-4 md:mb-6 ${
        isTodayProp 
          ? 'bg-gradient-to-r from-[var(--accent-primary)]/10 via-[var(--accent-primary)]/5 to-transparent rounded-2xl p-4 md:p-6 border-2 border-[var(--accent-primary)]/30' 
          : 'bg-[var(--bg-secondary)] rounded-xl p-4 md:p-5 border border-[var(--border-color)]'
      }`}
    >
      {/* Date Header - Modern Design */}
      <div className="flex items-start justify-between mb-4 md:mb-5">
        <div className="flex items-start gap-3 md:gap-4 flex-1">
          {/* Day Number Circle */}
          <div className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl flex flex-col items-center justify-center ${
            isTodayProp
              ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/30'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
          }`}>
            <span className="text-xs md:text-sm font-semibold uppercase leading-none">{dayName}</span>
            <span className={`text-lg md:text-xl font-bold leading-none mt-0.5 ${
              isTodayProp ? 'text-white' : 'text-[var(--text-primary)]'
            }`}>{dayNumber}</span>
          </div>

          {/* Date Info */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-base md:text-lg font-bold leading-tight ${
                isTodayProp 
                  ? 'text-[var(--accent-primary)]' 
                  : 'text-[var(--text-primary)]'
              }`}>
                {monthDay}
              </h3>
              {isTodayProp && (
                <span className="px-2.5 py-1 bg-[var(--accent-primary)] text-white text-xs font-semibold rounded-full">
                  Today
                </span>
              )}
            </div>
            
            {/* Task Progress */}
            {totalTasks > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      completionPercentage === 100 
                        ? 'bg-green-500' 
                        : isTodayProp 
                        ? 'bg-[var(--accent-primary)]' 
                        : 'bg-[var(--accent-primary)]/60'
                    }`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--text-secondary)] font-medium whitespace-nowrap">
                  {completedTasks}/{totalTasks}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tasks and Goals List - View Only */}
      {allItems.length > 0 ? (
        <div className="space-y-2.5 md:space-y-3">
          {allItems.slice(0, 6).map((item) => {
            const isTask = item.title !== undefined;
            const isCompleted = isTask ? item.status === 'completed' : item.progress >= 100;
            const itemId = item._id;

            return (
              <div
                key={itemId}
                className={`rounded-lg border ${
                  isCompleted
                    ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] opacity-75'
                    : 'bg-[var(--bg-primary)] border-[var(--border-color)]'
                }`}
              >
                {isTask ? (
                  <div className="flex items-center gap-3 p-3 md:p-4">
                    {/* Status Indicator (non-interactive) */}
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                      isCompleted
                        ? 'bg-[var(--accent-primary)]'
                        : 'bg-[var(--text-tertiary)]'
                    }`} />

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm md:text-base font-medium leading-snug break-words ${
                        isCompleted 
                          ? 'text-[var(--text-tertiary)] line-through' 
                          : 'text-[var(--text-primary)]'
                      }`}>
                        {item.title}
                      </p>
                      
                      {/* Priority Badge */}
                      {item.priority && !isCompleted && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                            item.priority === 'high' 
                              ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                              : item.priority === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30'
                              : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 md:p-4">
                    <FaFlag className="text-yellow-500 dark:text-yellow-400 flex-shrink-0 text-base" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base font-medium text-[var(--text-primary)] leading-snug break-words">
                        {item.name}
                      </p>
                      <div className="mt-2 w-full bg-[var(--bg-tertiary)] rounded-full h-2">
                        <div
                          className="bg-yellow-500 dark:text-yellow-400 h-2 rounded-full transition-all"
                          style={{ width: `${item.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Show More Indicator (non-clickable) */}
          {allItems.length > 6 && (
            <div className="w-full py-2.5 text-sm text-[var(--text-secondary)] text-center rounded-lg">
              +{allItems.length - 6} more {allItems.length - 6 === 1 ? 'item' : 'items'}
            </div>
          )}
        </div>
      ) : (
        // Only show "Add task" button for today and future dates
        canAddTask && (
          <button
            onClick={() => onDateClick && onDateClick(date)}
            className="w-full py-4 md:py-5 text-center text-sm md:text-base text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent-primary)]/50"
          >
            No tasks · Tap to add
          </button>
        )
      )}
    </motion.div>
  );
};

export default DayCard;
