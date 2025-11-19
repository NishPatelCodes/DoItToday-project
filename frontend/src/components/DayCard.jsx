import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { format, isToday } from 'date-fns';
import { FaCheck, FaTrash, FaFlag } from 'react-icons/fa';

/**
 * Day Card Component for Notion-style timeline
 * Shows date, tasks, and goals for a single day
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
    
    // Only swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > deltaY) {
      isSwiping.current = true;
      // Only allow left swipe (negative deltaX)
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

    // If swiped more than 60px, trigger action
    if (currentSwipeOffset.current < -60) {
      if (item.status === 'completed') {
        // Delete if completed
        if (onTaskDelete && item._id) {
          onTaskDelete(item._id);
        }
      } else {
        // Complete if pending
        if (onTaskToggle && item._id) {
          onTaskToggle(item._id);
        }
      }
    }
    
    // Reset swipe state
    setSwipedTaskId(null);
    setSwipeOffset(0);
    currentSwipeOffset.current = 0;
    isSwiping.current = false;
  };

  // Reset swipe on mouse leave (for desktop)
  const handleMouseLeave = () => {
    setSwipedTaskId(null);
    setSwipeOffset(0);
    currentSwipeOffset.current = 0;
  };

  const dayName = format(date, 'EEEE');
  const dayNumber = format(date, 'd');
  const monthDay = format(date, 'MMM d');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative px-4 py-4 border-b border-[var(--border-color)] ${
        isTodayProp ? 'bg-[var(--accent-primary)]/5 dark:bg-[var(--accent-primary)]/10' : ''
      }`}
    >
      {/* Date Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex-shrink-0 w-14 text-center ${
          isTodayProp 
            ? 'text-[var(--accent-primary)] font-bold' 
            : 'text-[var(--text-secondary)]'
        }`}>
          <div className="text-xs uppercase tracking-wide leading-normal font-semibold">{dayName}</div>
          <div className="text-2xl font-bold leading-tight mt-0.5">{dayNumber}</div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-semibold leading-snug ${
            isTodayProp 
              ? 'text-[var(--accent-primary)]' 
              : 'text-[var(--text-primary)]'
          }`}>
            <span className="break-words">{monthDay}</span>
            {isTodayProp && (
              <span className="ml-2 text-xs px-2 py-1 bg-[var(--accent-primary)]/20 dark:bg-[var(--accent-primary)]/30 rounded-full inline-block">
                Today
              </span>
            )}
          </div>
          {totalTasks > 0 && (
            <div className="text-xs text-[var(--text-secondary)] mt-1 leading-normal">
              {completedTasks}/{totalTasks} tasks completed
            </div>
          )}
        </div>
      </div>

      {/* Tasks and Goals List */}
      {allItems.length > 0 ? (
        <div className="space-y-2 ml-14 md:ml-16">
          {allItems.slice(0, 5).map((item) => {
            const isTask = item.title !== undefined;
            const isCompleted = isTask ? item.status === 'completed' : item.progress >= 100;
            const itemId = item._id;

            return (
              <motion.div
                key={itemId}
                className="relative overflow-hidden rounded-xl"
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
                <div className="absolute inset-0 flex items-center justify-end pr-4 bg-[var(--accent-primary)] rounded-xl">
                  <div className="flex items-center gap-4">
                    {isCompleted ? (
                      <FaTrash className="text-white text-lg flex-shrink-0" />
                    ) : (
                      <FaCheck className="text-white text-lg flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* Task/Goal Card */}
                <div className="relative bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-3 min-h-[56px]">
                  {isTask ? (
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onTaskToggle && onTaskToggle(itemId)}
                        className={`flex-shrink-0 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all mt-0.5 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 ${
                          isCompleted
                            ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
                            : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]'
                        }`}
                        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {isCompleted && <FaCheck className="text-white text-xs" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold leading-snug break-words ${
                          isCompleted 
                            ? 'text-[var(--text-tertiary)] line-through' 
                            : 'text-[var(--text-primary)]'
                        }`}>
                          {item.title}
                        </p>
                        {item.priority && (
                          <span className={`inline-block mt-1.5 text-xs px-2 py-1 rounded-lg font-medium flex-shrink-0 ${
                            item.priority === 'high' 
                              ? 'bg-red-500/20 dark:bg-red-900/30 text-red-500 dark:text-red-400 border border-red-500/30 dark:border-red-700/30'
                              : item.priority === 'medium'
                              ? 'bg-yellow-500/20 dark:bg-yellow-900/30 text-yellow-500 dark:text-yellow-400 border border-yellow-500/30 dark:border-yellow-700/30'
                              : 'bg-blue-500/20 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 border border-blue-500/30 dark:border-blue-700/30'
                          }`}>
                            {item.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <FaFlag className="text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0 text-base" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug break-words">
                          {item.name}
                        </p>
                        <div className="mt-2 w-full bg-[var(--bg-tertiary)] rounded-full h-2">
                          <div
                            className="bg-yellow-500 dark:bg-yellow-400 h-2 rounded-full transition-all"
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
          
          {allItems.length > 5 && (
            <button
              onClick={() => onDateClick && onDateClick(date)}
              className="text-xs text-[var(--accent-primary)] hover:underline mt-2 leading-normal touch-manipulation py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 rounded-lg px-2"
            >
              +{allItems.length - 5} more items
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => onDateClick && onDateClick(date)}
          className="ml-14 md:ml-16 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors py-3 leading-normal touch-manipulation min-h-[48px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 rounded-xl px-2"
        >
          No tasks · Tap to add
        </button>
      )}
    </motion.div>
  );
};

export default DayCard;
