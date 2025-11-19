import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VariableSizeList } from 'react-window';
import { 
  format, 
  isToday, 
  isSameDay, 
  startOfDay, 
  endOfDay,
  addDays,
  subDays,
  startOfMonth,
  isSameMonth,
  differenceInDays,
  parseISO,
} from 'date-fns';
import { FaPlus, FaCheck, FaTrash, FaCircle } from 'react-icons/fa';
import DayCard from './DayCard';
import { useToast } from '../hooks/useToast';

/**
 * Notion-style vertical infinite timeline calendar
 * Premium mobile-first calendar with virtualization
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
  const [listHeight, setListHeight] = useState(600);
  const listRef = useRef(null);
  const todayIndexRef = useRef(null);
  const containerRef = useRef(null);
  const toast = useToast();

  // Calculate list height based on viewport
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const headerHeight = 120; // Today header height
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
    
    // Find today's index
    const todayIndex = daysArray.findIndex(day => isToday(day));
    if (todayIndex !== -1) {
      todayIndexRef.current = todayIndex;
    }
    
    return daysArray;
  }, [todayDate]);

  // Group tasks and goals by date
  const itemsByDate = useMemo(() => {
    const grouped = {};
    
    // Process tasks
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
    
    // Process goals
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

  // Calculate item heights (variable sizing for virtualization)
  const getItemSize = useCallback((index) => {
    const day = days[index];
    const dateKey = format(startOfDay(day), 'yyyy-MM-dd');
    const items = itemsByDate[dateKey];
    
    // Base height for day card
    let height = 120; // Header + padding
    
    if (items) {
      const taskCount = items.tasks.length;
      const goalCount = items.goals.length;
      const totalItems = taskCount + goalCount;
      
      // Each task/goal is ~60px, minimum 1 item shown
      height += Math.max(1, Math.min(totalItems, 5)) * 60;
      
      // If more than 5 items, add "show more" indicator
      if (totalItems > 5) {
        height += 40;
      }
    } else {
      // Empty day - smaller height
      height = 100;
    }
    
    // Add month separator height if needed
    if (index > 0) {
      const prevDay = days[index - 1];
      if (!isSameMonth(day, prevDay)) {
        height += 50; // Month separator
      }
    }
    
    return height;
  }, [days, itemsByDate]);

  // Scroll to today on mount
  useEffect(() => {
    if (listRef.current && todayIndexRef.current !== null) {
      setTimeout(() => {
        listRef.current?.scrollToItem(todayIndexRef.current, 'smart');
      }, 100);
    }
  }, []);

  // Handle scroll to show/hide FAB
  const handleScroll = useCallback(({ scrollOffset }) => {
    setScrollOffset(scrollOffset);
    setShowFAB(scrollOffset < 100); // Hide FAB when scrolled down
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
          <div className="sticky top-0 z-20 bg-[var(--bg-primary)] py-3 px-4 border-b border-[var(--border-color)]">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {format(day, 'MMMM yyyy')}
            </h2>
          </div>
        )}
        <DayCard
          date={day}
          tasks={items.tasks}
          goals={items.goals}
          isToday={isTodayDay}
          onDateClick={onDateClick}
          onTaskToggle={onTaskToggle}
          onTaskDelete={onTaskDelete}
          onTaskEdit={onTaskEdit}
        />
      </div>
    );
  }, [days, itemsByDate, onDateClick, onTaskToggle, onTaskDelete, onTaskEdit]);

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

  return (
    <div className="relative h-full flex flex-col bg-[var(--bg-primary)]">
      {/* Sticky Today Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-30 bg-[var(--bg-primary)] border-b border-[var(--border-color)] px-4 py-3 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {format(todayDate, 'EEEE, MMMM d')}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {totalCount > 0 
                ? `${completedCount}/${totalCount} tasks done`
                : 'No tasks today'
              }
            </p>
          </div>
          <button
            onClick={scrollToToday}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-medium text-sm hover:bg-[var(--accent-hover)] transition-colors touch-manipulation"
          >
            Today
          </button>
        </div>
      </motion.div>

      {/* Virtualized Timeline */}
      <div ref={containerRef} className="flex-1 relative">
        <VariableSizeList
          ref={listRef}
          height={listHeight}
          itemCount={days.length}
          itemSize={getItemSize}
          width="100%"
          onScroll={handleScroll}
          overscanCount={5}
        >
          {Row}
        </VariableSizeList>
      </div>

      {/* Floating Action Button */}
      <AnimatePresence>
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
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[var(--accent-primary)] text-white rounded-full shadow-2xl flex items-center justify-center touch-manipulation"
            aria-label="Add task"
          >
            <FaPlus className="text-xl" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotionTimelineCalendar;
