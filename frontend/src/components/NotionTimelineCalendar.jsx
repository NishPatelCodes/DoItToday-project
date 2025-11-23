import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VariableSizeList } from 'react-window';
import { 
  format, 
  isToday, 
  isSameDay, 
  startOfDay, 
  addDays,
  subDays,
  isSameMonth,
  isPast,
  parseISO,
} from 'date-fns';
import { FaPlus, FaChevronUp, FaCalendarAlt } from 'react-icons/fa';
import DayCard from './DayCard';

/**
 * Modern Calendar Component
 * Clean, responsive design optimized for mobile and desktop
 * Shows day-wise tasks in a beautiful timeline layout
 */
const NotionTimelineCalendar = ({ 
  tasks, 
  goals, 
  onDateClick, 
  onCreateTask, 
  onTaskToggle, 
  onTaskDelete, 
  onTaskEdit 
}) => {
  const [todayDate] = useState(() => new Date());
  const [scrollOffset, setScrollOffset] = useState(0);
  const [showFAB, setShowFAB] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [listHeight, setListHeight] = useState(600);
  const listRef = useRef(null);
  const todayIndexRef = useRef(null);
  const containerRef = useRef(null);

  // Calculate list height based on viewport
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const headerHeight = 100;
        setListHeight(window.innerHeight - headerHeight);
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Generate days: 30 days past to 90 days future (120 days total)
  const days = useMemo(() => {
    const daysArray = [];
    const startDate = subDays(todayDate, 30);
    const endDate = addDays(todayDate, 90);
    
    let currentDate = startDate;
    while (currentDate <= endDate) {
      daysArray.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    const todayIndex = daysArray.findIndex(day => isToday(day));
    if (todayIndex !== -1) {
      todayIndexRef.current = todayIndex;
    }
    
    return daysArray;
  }, [todayDate]);

  // Group tasks and goals by date
  const itemsByDate = useMemo(() => {
    const grouped = {};
    
    tasks.forEach(task => {
      if (task.dueDate) {
        try {
          const taskDate = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : new Date(task.dueDate);
          const dateKey = format(startOfDay(taskDate), 'yyyy-MM-dd');
          if (!grouped[dateKey]) {
            grouped[dateKey] = { tasks: [], goals: [] };
          }
          grouped[dateKey].tasks.push(task);
        } catch (e) {
          console.error('Error parsing task date:', e);
        }
      }
    });
    
    goals.forEach(goal => {
      if (goal.deadline) {
        try {
          const goalDate = typeof goal.deadline === 'string' ? parseISO(goal.deadline) : new Date(goal.deadline);
          const dateKey = format(startOfDay(goalDate), 'yyyy-MM-dd');
          if (!grouped[dateKey]) {
            grouped[dateKey] = { tasks: [], goals: [] };
          }
          grouped[dateKey].goals.push(goal);
        } catch (e) {
          console.error('Error parsing goal date:', e);
        }
      }
    });
    
    return grouped;
  }, [tasks, goals]);

  // Calculate item heights for virtualization - precise calculations
  const getItemSize = useCallback((index) => {
    const day = days[index];
    const dateKey = format(startOfDay(day), 'yyyy-MM-dd');
    const items = itemsByDate[dateKey];
    const isMonthStart = index === 0 || !isSameMonth(day, days[index - 1]);
    const isPastDate = isPast(startOfDay(day)) && !isToday(day);
    
    let height = 0;
    
    // Month separator height (if this is a month start)
    if (isMonthStart) {
      height += 60; // py-4 (32px) + border (2px) + spacing (26px)
    }
    
    // Day card base height calculation
    // Header section: day badge container + date info + progress bar + margins
    // Day badge: 56-64px (w-12 h-12 md:w-14 md:h-14)
    // Date info section: ~60px (title + progress bar)
    // Top/bottom padding: 16-24px (p-4 md:p-5)
    // Header margin bottom: 20px (mb-4 md:mb-5)
    let cardHeight = 140; // Base: padding + header + margins
    
    if (items) {
      const taskCount = items.tasks.length;
      const goalCount = items.goals.length;
      const totalItems = taskCount + goalCount;
      
      if (totalItems > 0) {
        // Task card breakdown:
        // - Padding: p-3 md:p-4 = 12-16px top + 12-16px bottom = 24-32px
        // - Content: text (~20px) + optional priority badge (~28px) = ~40-48px
        // - Total per card: ~68-80px, average 74px
        // - Spacing: space-y-2.5 (10px) or space-y-3 (12px), average 11px
        const visibleItems = Math.min(totalItems, 6);
        cardHeight += (visibleItems * 74) + ((visibleItems > 0 ? visibleItems - 1 : 0) * 11);
        
        // "Show more" indicator if needed
        if (totalItems > 6) {
          cardHeight += 40; // py-2.5 (20px) + text (20px)
        }
      }
      // If no items, cardHeight stays at base (no button for past dates)
    } else {
      // Empty day - only show button for today/future dates
      if (!isPastDate) {
        // Empty state button: py-4 md:py-5 = 32-40px + border + text = ~80px
        cardHeight += 80;
      }
    }
    
    // Add consistent bottom padding from parent container (pb-4 md:pb-6)
    height += cardHeight + 24; // 16-24px average
    
    // Ensure minimum height to prevent any overlap
    return Math.max(height, 160);
  }, [days, itemsByDate]);

  // Scroll to today on mount
  useEffect(() => {
    if (listRef.current && todayIndexRef.current !== null) {
      setTimeout(() => {
        listRef.current?.scrollToItem(todayIndexRef.current, 'smart');
      }, 100);
    }
  }, []);

  // Handle scroll to show/hide FAB and scroll to top button
  const handleScroll = useCallback(({ scrollOffset }) => {
    setScrollOffset(scrollOffset);
    setShowFAB(scrollOffset < 100);
    setShowScrollTop(scrollOffset > 500);
  }, []);

  // Render each item in the virtualized list
  const Row = useCallback(({ index, style }) => {
    const day = days[index];
    const dateKey = format(startOfDay(day), 'yyyy-MM-dd');
    const items = itemsByDate[dateKey] || { tasks: [], goals: [] };
    const isTodayDay = isToday(day);
    const isMonthStart = index === 0 || !isSameMonth(day, days[index - 1]);
    
    return (
      <div style={style}>
        {isMonthStart && (
          <div className="sticky top-0 z-20 bg-[var(--bg-primary)] py-4 px-4 md:px-6 border-b-2 border-[var(--border-color)] backdrop-blur-md bg-opacity-95">
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
              {format(day, 'MMMM yyyy')}
            </h2>
          </div>
        )}
        <div className="px-4 md:px-6 pb-4 md:pb-6">
          <DayCard
            date={day}
            tasks={items.tasks}
            goals={items.goals}
            isToday={isTodayDay}
            onDateClick={onDateClick}
          />
        </div>
      </div>
    );
  }, [days, itemsByDate, onDateClick]);

  // Get today's progress
  const todayItems = itemsByDate[format(startOfDay(todayDate), 'yyyy-MM-dd')] || { tasks: [], goals: [] };
  const todayTasks = todayItems.tasks || [];
  const completedCount = todayTasks.filter(t => t.status === 'completed').length;
  const totalCount = todayTasks.length;

  // Scroll to today handler
  const scrollToToday = useCallback(() => {
    if (listRef.current && todayIndexRef.current !== null) {
      listRef.current.scrollToItem(todayIndexRef.current, 'smart');
    }
  }, []);

  // Scroll to top handler
  const scrollToTop = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0, 'start');
    }
  }, []);

  return (
    <div className="relative h-full flex flex-col bg-[var(--bg-primary)]">
      {/* Modern Sticky Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-30 bg-[var(--bg-primary)]/95 backdrop-blur-lg border-b border-[var(--border-color)] px-4 md:px-6 py-4 shadow-sm"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <FaCalendarAlt className="text-[var(--accent-primary)] text-xl md:text-2xl flex-shrink-0" />
              <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] leading-tight">
                {format(todayDate, 'EEEE, MMMM d')}
              </h1>
            </div>
            <p className="text-sm text-[var(--text-secondary)] ml-8 md:ml-11">
              {totalCount > 0 
                ? `${completedCount} of ${totalCount} tasks completed`
                : 'No tasks scheduled for today'
              }
            </p>
          </div>
          <button
            onClick={scrollToToday}
            className="px-4 py-2.5 bg-[var(--accent-primary)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--accent-hover)] transition-all shadow-lg shadow-[var(--accent-primary)]/30 touch-manipulation min-h-[44px] flex-shrink-0"
          >
            <span className="hidden sm:inline">Go to Today</span>
            <span className="sm:hidden">Today</span>
          </button>
        </div>
      </motion.div>

      {/* Virtualized Timeline */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <VariableSizeList
          ref={listRef}
          height={listHeight}
          itemCount={days.length}
          itemSize={getItemSize}
          width="100%"
          onScroll={handleScroll}
          overscanCount={3}
        >
          {Row}
        </VariableSizeList>
      </div>

      {/* Floating Action Buttons */}
      <AnimatePresence>
        {/* Add Task FAB */}
        {showFAB && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (onCreateTask) {
                onCreateTask();
              } else if (onDateClick) {
                onDateClick(todayDate);
              }
            }}
            className="fixed bottom-6 right-4 md:right-6 z-40 w-14 h-14 bg-[var(--accent-primary)] text-white rounded-full shadow-2xl flex items-center justify-center touch-manipulation hover:bg-[var(--accent-hover)] transition-colors"
            aria-label="Add task"
          >
            <FaPlus className="text-xl" />
          </motion.button>
        )}

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-4 md:right-6 z-40 w-12 h-12 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-full shadow-xl border border-[var(--border-color)] flex items-center justify-center touch-manipulation hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="Scroll to top"
            style={{ bottom: showFAB ? '88px' : '24px' }}
          >
            <FaChevronUp className="text-lg" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotionTimelineCalendar;
