import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaTimes, FaCircle, FaClock } from 'react-icons/fa';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  addDays,
} from 'date-fns';
import TaskCard from './TaskCard';

/**
 * Mobile-first calendar component
 * Vertical scrollable list of months with colored dots for tasks
 * Slide-up panel for day's tasks on tap
 */
const MobileCalendar = ({ tasks, goals, onDateClick, onCreateTask, onTaskToggle, onTaskDelete, onTaskEdit }) => {
  const [currentMonths, setCurrentMonths] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayPanel, setShowDayPanel] = useState(false);
  const [scrollToToday, setScrollToToday] = useState(false);
  const todayRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize with current month + 3 upcoming months
  useEffect(() => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < 4; i++) {
      months.push(addMonths(today, i));
    }
    setCurrentMonths(months);
  }, []);

  // Scroll to today button when needed
  useEffect(() => {
    if (scrollToToday && todayRef.current && containerRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setScrollToToday(false);
    }
  }, [scrollToToday]);

  const getTasksForDate = (date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });
  };

  const getGoalsForDate = (date) => {
    return goals.filter((goal) => {
      if (!goal.deadline) return false;
      return isSameDay(new Date(goal.deadline), date);
    });
  };

  const handleDateClick = (day) => {
    const dayTasks = getTasksForDate(day);
    const dayGoals = getGoalsForDate(day);
    
    setSelectedDate(day);
    setShowDayPanel(true);
    
    if (dayTasks.length === 0 && dayGoals.length === 0 && onDateClick) {
      onDateClick(day);
    }
  };

  const handleTodayClick = () => {
    setScrollToToday(true);
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  const selectedDateGoals = selectedDate ? getGoalsForDate(selectedDate) : [];

  // Generate month view
  const renderMonth = (monthDate, index) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const today = new Date();
    const isCurrentMonth = isSameMonth(monthDate, today);

    return (
      <motion.div
        key={monthDate.toISOString()}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="mb-6"
        ref={isCurrentMonth ? todayRef : null}
      >
        {/* Month Header */}
        <div className="sticky top-0 z-10 bg-[var(--bg-primary)] pb-2 mb-3 border-b border-[var(--border-color)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {format(monthDate, 'MMMM yyyy')}
          </h2>
        </div>

        {/* Week Day Headers - Compact */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className="text-center text-xs font-semibold text-[var(--text-tertiary)] py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid - Compact */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayTasks = getTasksForDate(day);
            const dayGoals = getGoalsForDate(day);
            const isCurrentMonthDay = isSameMonth(day, monthDate);
            const isTodayDay = isToday(day);
            const totalItems = dayTasks.length + dayGoals.length;
            const hasCompletedTasks = dayTasks.some(t => t.status === 'completed');
            const hasPendingTasks = dayTasks.some(t => t.status === 'pending');

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`
                  relative aspect-square rounded-lg transition-all touch-manipulation
                  ${!isCurrentMonthDay 
                    ? 'text-[var(--text-tertiary)] opacity-40' 
                    : isTodayDay
                    ? 'bg-[var(--accent-primary)]/20 border-2 border-[var(--accent-primary)] text-[var(--accent-primary)] font-bold'
                    : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                  }
                  ${totalItems > 0 ? 'ring-1 ring-[var(--border-color)]' : ''}
                `}
              >
                {/* Date Number */}
                <div className="text-sm font-semibold mb-1">
                  {format(day, 'd')}
                </div>

                {/* Task Indicators - Colored Dots */}
                {totalItems > 0 && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5 justify-center">
                    {hasPendingTasks && (
                      <FaCircle className="text-[8px] text-[var(--accent-primary)]" />
                    )}
                    {hasCompletedTasks && (
                      <FaCircle className="text-[8px] text-green-500" />
                    )}
                    {dayGoals.length > 0 && (
                      <FaCircle className="text-[8px] text-yellow-500" />
                    )}
                  </div>
                )}

                {/* Task Count Badge */}
                {totalItems > 3 && (
                  <div className="absolute -top-1 -right-1 bg-[var(--accent-primary)] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {totalItems > 9 ? '9+' : totalItems}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <div className="relative">
        {/* Today Quick Jump Button - Sticky/Floating */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTodayClick}
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 bg-[var(--accent-primary)] text-white px-4 py-2 rounded-full shadow-lg font-semibold text-sm flex items-center gap-2 touch-manipulation"
        >
          <span>Today</span>
        </motion.button>

        {/* Scrollable Months Container */}
        <div 
          ref={containerRef}
          className="overflow-y-auto pb-24"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          {currentMonths.map((month, index) => renderMonth(month, index))}
        </div>
      </div>

      {/* Slide-up Panel for Day's Tasks */}
      <AnimatePresence>
        {showDayPanel && selectedDate && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDayPanel(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[var(--bg-primary)] rounded-t-3xl border-t border-[var(--border-color)] shadow-2xl z-50 max-h-[80vh] flex flex-col"
            >
              {/* Panel Header */}
              <div className="sticky top-0 bg-[var(--bg-primary)] border-b border-[var(--border-color)] p-4 rounded-t-3xl z-10">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">
                      {format(selectedDate, 'EEEE, MMMM d')}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {selectedDateTasks.length + selectedDateGoals.length} {selectedDateTasks.length + selectedDateGoals.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDayPanel(false)}
                    className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] touch-manipulation"
                    aria-label="Close panel"
                  >
                    <FaTimes className="text-lg" />
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-3">
                  {onCreateTask && (
                    <button
                      onClick={() => {
                        setShowDayPanel(false);
                        onDateClick?.(selectedDate);
                      }}
                      className="flex-1 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-medium text-sm touch-manipulation"
                    >
                      Add Task
                    </button>
                  )}
                </div>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedDateTasks.length === 0 && selectedDateGoals.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[var(--text-secondary)] mb-4">No tasks for this day</p>
                    {onCreateTask && (
                      <button
                        onClick={() => {
                          setShowDayPanel(false);
                          onDateClick?.(selectedDate);
                        }}
                        className="px-6 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-medium touch-manipulation"
                      >
                        Create Task
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {selectedDateTasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onToggle={() => onTaskToggle && onTaskToggle(task._id)}
                        onDelete={() => onTaskDelete && onTaskDelete(task._id)}
                        onEdit={() => onTaskEdit && onTaskEdit(task)}
                      />
                    ))}
                    {selectedDateGoals.map((goal) => (
                      <div
                        key={goal._id}
                        className="card p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <FaCircle className="text-xs text-yellow-500" />
                              <h3 className="font-semibold text-[var(--text-primary)] truncate">
                                {goal.name}
                              </h3>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)]">Goal</p>
                            {goal.deadline && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-[var(--text-secondary)]">
                                <FaClock className="text-xs" />
                                <span>{format(new Date(goal.deadline), 'h:mm a')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileCalendar;
