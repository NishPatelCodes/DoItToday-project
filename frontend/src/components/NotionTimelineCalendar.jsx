import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  format, 
  isToday, 
  isSameDay, 
  startOfDay, 
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isPast,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaPlus, FaCalendarAlt } from 'react-icons/fa';

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
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

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
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-30 bg-[var(--bg-primary)]/95 backdrop-blur-lg border-b border-[var(--border-color)] px-4 md:px-6 py-4 shadow-sm"
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-[var(--accent-primary)] text-xl md:text-2xl flex-shrink-0" />
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
              {format(currentDate, 'MMMM yyyy')}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition-colors font-medium"
            >
              Today
            </button>
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)]"
              aria-label="Previous month"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)]"
              aria-label="Next month"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
        {totalCount > 0 && (
          <p className="text-sm text-[var(--text-secondary)] ml-8 md:ml-11">
            {completedCount} of {totalCount} tasks completed today
          </p>
        )}
      </motion.div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Week Day Headers */}
          <div className="grid grid-cols-7 gap-px bg-[var(--border-color)] rounded-t-lg overflow-hidden mb-px">
            {weekDays.map((day, idx) => (
              <div
                key={idx}
                className="bg-[var(--bg-secondary)] py-3 px-2 text-center text-xs md:text-sm font-semibold text-[var(--text-primary)]"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-px bg-[var(--border-color)] rounded-b-lg overflow-hidden">
            {days.map((day, index) => {
              const dayTasks = getTasksForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDay = isToday(day);
              const isPastDate = isPast(startOfDay(day)) && !isTodayDay;
              const canAddTask = !isPastDate;

              return (
                <motion.div
                  key={day.toISOString()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className={`
                    bg-[var(--bg-primary)] min-h-[100px] md:min-h-[120px] p-2 text-left transition-all relative
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                    ${isTodayDay ? 'bg-[var(--accent-primary)]/5' : 'hover:bg-[var(--bg-secondary)]'}
                  `}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`
                        text-sm md:text-base font-semibold
                        ${isTodayDay 
                          ? 'w-7 h-7 md:w-8 md:h-8 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center' 
                          : 'text-[var(--text-primary)]'
                        }
                      `}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Tasks/Events */}
                  <div className="space-y-1 mt-1">
                    {dayTasks.slice(0, 3).map((item, idx) => {
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
                        <div
                          key={item._id || idx}
                          className={`
                            ${bgColor} ${textColor} 
                            text-xs px-2 py-1 rounded truncate
                            ${isCompleted ? 'opacity-60 line-through' : ''}
                          `}
                          title={item.title || item.name}
                        >
                          {item.title || item.name}
                        </div>
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-[var(--text-secondary)] px-2">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>

                  {/* Empty State - Only for today and future dates */}
                  {dayTasks.length === 0 && canAddTask && (
                    <button
                      onClick={() => onDateClick && onDateClick(day)}
                      className="w-full mt-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                      <FaPlus className="inline mr-1" />
                      Add
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          if (onCreateTask) {
            onCreateTask();
          } else if (onDateClick) {
            onDateClick(new Date());
          }
        }}
        className="fixed bottom-6 right-4 md:right-6 z-40 w-14 h-14 bg-[var(--accent-primary)] text-white rounded-full shadow-2xl flex items-center justify-center touch-manipulation hover:bg-[var(--accent-hover)] transition-colors"
        aria-label="Add task"
      >
        <FaPlus className="text-xl" />
      </motion.button>
    </div>
  );
};

export default NotionTimelineCalendar;
