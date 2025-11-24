import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  format, 
  isToday, 
  isSameDay, 
  startOfDay, 
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isPast,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';
import { EmptyCalendarIllustration } from './Illustrations';

/**
 * Monthly Grid Calendar Component
 * Clean, modern grid layout optimized for mobile and desktop
 * Shows tasks as colored blocks within day cells
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
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  // Only show dates from current month (1-30/31)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

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

  const getTasksForDate = (date) => {
    const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
    const items = itemsByDate[dateKey] || { tasks: [], goals: [] };
    return [...items.tasks, ...items.goals];
  };

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get today's tasks count
  const todayKey = format(startOfDay(new Date()), 'yyyy-MM-dd');
  const todayItems = itemsByDate[todayKey] || { tasks: [], goals: [] };
  const todayTasks = todayItems.tasks || [];
  const completedCount = todayTasks.filter(t => t.status === 'completed').length;
  const totalCount = todayTasks.length;

  return (
    <div className="relative h-full flex flex-col bg-[var(--bg-primary)]">
      {/* Header - Centered */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-30 bg-[var(--bg-primary)]/95 backdrop-blur-lg border-b border-[var(--border-color)] px-4 md:px-6 py-4 shadow-sm"
      >
        <div className="flex items-center justify-center gap-4 mb-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-all hover:scale-110 active:scale-95 text-[var(--text-secondary)]"
            aria-label="Previous month"
          >
            <FaChevronLeft />
          </button>
          
          <motion.h1 
            key={format(currentDate, 'yyyy-MM')}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] min-w-[200px] text-center"
          >
            {format(currentDate, 'MMMM yyyy')}
          </motion.h1>
          
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-all hover:scale-110 active:scale-95 text-[var(--text-secondary)]"
            aria-label="Next month"
          >
            <FaChevronRight />
          </button>
        </div>
        <div className="flex justify-center">
          <button
            onClick={goToToday}
            className="px-4 py-1.5 text-sm text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition-all font-medium hover:scale-105"
          >
            Today
          </button>
        </div>
      </motion.div>

      {/* Calendar Timeline */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Week Day Headers */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-7 gap-px bg-[var(--border-color)] rounded-t-lg overflow-hidden mb-2"
          >
            {weekDays.map((day, idx) => (
              <motion.div
                key={idx}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[var(--bg-secondary)] py-3 px-2 text-center text-xs md:text-sm font-semibold text-[var(--text-primary)]"
              >
                {day}
              </motion.div>
            ))}
          </motion.div>

          {/* Calendar Days - Vertical Timeline */}
          <div className="space-y-2">
            {/* Calendar Days - Start directly from date 1 */}
            {days.map((day, index) => {
              const dayTasks = getTasksForDate(day);
              const isTodayDay = isToday(day);
              const isPastDate = isPast(startOfDay(day)) && !isTodayDay;
              const canAddTask = !isPastDate;

              const dayOfWeek = format(day, 'EEE');

              return (
                <motion.div
                  key={day.toISOString()}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className={`
                    bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] p-4 transition-all relative cursor-pointer
                    ${isTodayDay 
                      ? 'bg-gradient-to-r from-[var(--accent-primary)]/10 to-transparent border-[var(--accent-primary)]/30 ring-2 ring-[var(--accent-primary)]/20' 
                      : 'hover:bg-[var(--bg-tertiary)] hover:shadow-md hover:border-[var(--accent-primary)]/20'
                    }
                  `}
                  onClick={() => {
                    if (canAddTask && dayTasks.length === 0) {
                      if (onDateClick) {
                        onDateClick(day);
                      } else if (onCreateTask) {
                        onCreateTask();
                      }
                    }
                  }}
                >
                  {/* Day Header */}
                  <div className="flex items-center gap-4 mb-3">
                    {/* Day Number - Large */}
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className={`
                        text-2xl md:text-3xl font-bold transition-all
                        ${isTodayDay 
                          ? 'w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-lg' 
                          : 'text-[var(--text-primary)]'
                        }
                      `}
                    >
                      {format(day, 'd')}
                    </motion.span>
                    
                    {/* Day of Week */}
                    <span className="text-sm md:text-base font-semibold text-[var(--text-secondary)]">
                      {dayOfWeek}
                    </span>
                  </div>

                  {/* Tasks/Events */}
                  <div className="space-y-2">
                    {dayTasks.length > 0 ? (
                      <>
                        {dayTasks.map((item, idx) => {
                          const isTask = item.title !== undefined;
                          const isCompleted = isTask ? item.status === 'completed' : false;
                          
                          // Color based on priority or type
                          let bgColor = 'bg-purple-200 dark:bg-purple-900/30';
                          let textColor = 'text-purple-800 dark:text-purple-200';
                          
                          if (isTask && item.priority === 'high') {
                            bgColor = 'bg-red-200 dark:bg-red-900/30';
                            textColor = 'text-red-800 dark:text-red-200';
                          } else if (isTask && item.priority === 'medium') {
                            bgColor = 'bg-yellow-200 dark:bg-yellow-900/30';
                            textColor = 'text-yellow-800 dark:text-yellow-200';
                          } else if (!isTask) {
                            bgColor = 'bg-blue-200 dark:bg-blue-900/30';
                            textColor = 'text-blue-800 dark:text-blue-200';
                          }

                          return (
                            <motion.div
                              key={item._id || idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              whileHover={{ scale: 1.02, x: 4 }}
                              className={`
                                ${bgColor} ${textColor} 
                                text-sm px-3 py-2 rounded-lg cursor-pointer transition-all font-medium
                                ${isCompleted ? 'opacity-60' : ''}
                              `}
                              title={item.title || item.name}
                            >
                              {item.title || item.name}
                            </motion.div>
                          );
                        })}
                      </>
                    ) : (
                      canAddTask && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDateClick) {
                              onDateClick(day);
                            } else if (onCreateTask) {
                              onCreateTask();
                            }
                          }}
                          className="w-full text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent-primary)]/50"
                        >
                          <FaPlus className="text-xs" />
                          Add task
                        </motion.button>
                      )
                    )}
                  </div>

                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotionTimelineCalendar;
