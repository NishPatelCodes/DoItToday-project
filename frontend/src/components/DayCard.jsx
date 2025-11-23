import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { format, isToday } from 'date-fns';
import { FaCheck, FaTrash, FaFlag, FaPlus, FaCircle } from 'react-icons/fa';

/**
 * Modern Day Card Component
 * Clean, card-based design optimized for mobile and desktop
 */
const DayCard = ({ 
  date, 
  tasks = [], 
  goals = [], 
  isToday: isTodayProp,
  onDateClick,
  onTaskToggle,
  onTaskDelete,
  onTaskEdit,
}) => {
  const [swipedTaskId, setSwipedTaskId] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const currentSwipeOffset = useRef(0);
  const isSwiping = useRef(false);

  const allItems = [...tasks, ...goals];
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Handle touch start
  const handleTouchStart = (e, itemId) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
    setSwipedTaskId(itemId);
  };

  // Handle touch move
  const handleTouchMove = (e, itemId) => {
    if (!swipedTaskId || swipedTaskId !== itemId) return;
    
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
    
    if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > deltaY) {
      isSwiping.current = true;
      if (deltaX < 0) {
        const offset = Math.max(deltaX, -120);
        currentSwipeOffset.current = offset;
        setSwipeOffset(offset);
      }
    }
  };

  // Handle touch end
  const handleTouchEnd = (itemId, item) => {
    if (!isSwiping.current) {
      setSwipedTaskId(null);
      setSwipeOffset(0);
      currentSwipeOffset.current = 0;
      return;
    }

    if (currentSwipeOffset.current < -60) {
      if (item.status === 'completed') {
        if (onTaskDelete && item._id) {
          onTaskDelete(item._id);
        }
      } else {
        if (onTaskToggle && item._id) {
          onTaskToggle(item._id);
        }
      }
    }
    
    setSwipedTaskId(null);
    setSwipeOffset(0);
    currentSwipeOffset.current = 0;
    isSwiping.current = false;
  };

  const handleMouseLeave = () => {
    setSwipedTaskId(null);
    setSwipeOffset(0);
    currentSwipeOffset.current = 0;
  };

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

      {/* Tasks and Goals List */}
      {allItems.length > 0 ? (
        <div className="space-y-2.5 md:space-y-3">
          {allItems.slice(0, 6).map((item) => {
            const isTask = item.title !== undefined;
            const isCompleted = isTask ? item.status === 'completed' : item.progress >= 100;
            const itemId = item._id;

            return (
              <motion.div
                key={itemId}
                className="relative overflow-hidden rounded-lg"
                onTouchStart={(e) => handleTouchStart(e, itemId)}
                onTouchMove={(e) => handleTouchMove(e, itemId)}
                onTouchEnd={() => handleTouchEnd(itemId, item)}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: swipedTaskId === itemId ? `translateX(${swipeOffset}px)` : 'translateX(0)',
                  transition: isSwiping.current ? 'none' : 'transform 0.2s ease-out',
                }}
              >
                {/* Swipe Actions Background */}
                <div className="absolute inset-0 flex items-center justify-end pr-4 bg-[var(--accent-primary)] rounded-lg">
                  <div className="flex items-center gap-4">
                    {isCompleted ? (
                      <FaTrash className="text-white text-lg" />
                    ) : (
                      <FaCheck className="text-white text-lg" />
                    )}
                  </div>
                </div>

                {/* Task/Goal Card */}
                <div className={`relative rounded-lg border transition-all ${
                  isCompleted
                    ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] opacity-75'
                    : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'
                }`}>
                  {isTask ? (
                    <div className="flex items-center gap-3 p-3 md:p-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => onTaskToggle && onTaskToggle(itemId)}
                        className={`flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 flex items-center justify-center transition-all touch-manipulation ${
                          isCompleted
                            ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
                            : 'border-[var(--border-color)] hover:border-[var(--accent-primary)] bg-transparent'
                        }`}
                        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {isCompleted && <FaCheck className="text-white text-xs" />}
                      </button>

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
              </motion.div>
            );
          })}
          
          {/* Show More Button */}
          {allItems.length > 6 && (
            <button
              onClick={() => onDateClick && onDateClick(date)}
              className="w-full py-2.5 text-sm text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition-colors font-medium"
            >
              +{allItems.length - 6} more {allItems.length - 6 === 1 ? 'item' : 'items'}
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => onDateClick && onDateClick(date)}
          className="w-full py-4 md:py-5 text-center text-sm md:text-base text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent-primary)]/50"
        >
          <FaPlus className="inline-block mr-2" />
          Add task for {fullDate}
        </button>
      )}
    </motion.div>
  );
};

export default DayCard;
