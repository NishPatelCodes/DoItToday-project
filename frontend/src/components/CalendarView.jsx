import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaClock, FaTasks } from 'react-icons/fa';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import TaskCard from './TaskCard';
import { useScrollLock } from '../hooks/useScrollLock';

const CalendarView = ({ tasks, goals, onDateClick, onCreateTask, onTaskToggle, onTaskDelete, onTaskEdit }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTasksModal, setShowTasksModal] = useState(false);
  
  // Lock body scroll when modal is open
  useScrollLock(showTasksModal);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

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
    
    if (dayTasks.length > 0 || dayGoals.length > 0) {
      setSelectedDate(day);
      setShowTasksModal(true);
    } else {
      // If no tasks, still allow creating a task for that date
      if (onDateClick) {
        onDateClick(day);
      }
    }
  };

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  const selectedDateGoals = selectedDate ? getGoalsForDate(selectedDate) : [];

  return (
    <>
      {/* Main Calendar Area - Minimalist Style with Mobile Optimization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] p-3 sm:p-4 md:p-6 overflow-x-auto"
      >
        {/* Top Navigation - Mobile Optimized */}
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={prevMonth}
              className="p-2 sm:p-2.5 rounded-lg hover:bg-[var(--bg-tertiary)] active:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] touch-manipulation"
              aria-label="Previous month"
            >
              <FaChevronLeft className="text-sm sm:text-base" />
            </button>
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-[var(--text-primary)] px-2">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 sm:p-2.5 rounded-lg hover:bg-[var(--bg-tertiary)] active:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] touch-manipulation"
              aria-label="Next month"
            >
              <FaChevronRight className="text-sm sm:text-base" />
            </button>
          </div>
        </div>

        {/* Calendar Grid - Monthly View - Mobile Optimized */}
        <div className="grid grid-cols-7 gap-px bg-[var(--border-color)] rounded-lg overflow-hidden min-w-[280px]">
          {/* Week Day Headers - Single Letters - Mobile Optimized */}
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className="bg-[var(--bg-secondary)] p-1.5 sm:p-2 md:p-3 text-center text-xs sm:text-sm font-semibold text-[var(--text-primary)]"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days - Mobile Optimized */}
          {days.map((day, index) => {
            const dayTasks = getTasksForDate(day);
            const dayGoals = getGoalsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const totalTasks = dayTasks.length + dayGoals.length;

            return (
              <motion.button
                key={day.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => handleDateClick(day)}
                className={`
                  bg-[var(--bg-primary)] p-1.5 sm:p-2 md:p-3 min-h-[60px] sm:min-h-[80px] md:min-h-[120px] text-left transition-all relative border border-transparent touch-manipulation
                  ${!isCurrentMonth 
                    ? 'text-[var(--text-tertiary)] opacity-50' 
                    : isToday 
                    ? 'bg-[var(--accent-primary)]/5 border-[var(--accent-primary)]/20' 
                    : 'hover:bg-[var(--bg-secondary)] active:bg-[var(--bg-tertiary)]'
                  }
                `}
              >
                {/* Date Number - Mobile Optimized */}
                <div className={`text-sm sm:text-base md:text-lg font-bold mb-0.5 sm:mb-1 md:mb-2 ${
                  isToday 
                    ? 'text-[var(--accent-primary)]' 
                    : !isCurrentMonth 
                    ? 'text-[var(--text-tertiary)]' 
                    : 'text-[var(--text-primary)]'
                }`}>
                  {format(day, 'd')}
                </div>

                {/* Task Count - Mobile Optimized with Icon */}
                {totalTasks > 0 && (
                  <div className={`flex items-center gap-1 ${
                    !isCurrentMonth
                      ? 'text-[var(--text-tertiary)]'
                      : 'text-[var(--accent-primary)]'
                  }`}>
                    {/* Icon with count for mobile, text for larger screens */}
                    <div className="flex items-center gap-1">
                      <FaTasks className="text-[10px] sm:text-xs md:text-sm" />
                      <span className="text-[10px] sm:text-xs md:text-sm font-semibold">
                        {totalTasks}
                      </span>
                    </div>
                    {/* Show "tasks" text only on larger screens */}
                    <span className="hidden md:inline text-[10px] sm:text-xs md:text-sm font-medium ml-0.5">
                      {totalTasks === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Tasks Modal for Selected Date - Mobile Optimized */}
      <AnimatePresence>
        {showTasksModal && selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4"
            onClick={() => setShowTasksModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--bg-primary)] rounded-t-2xl sm:rounded-xl border border-[var(--border-color)] shadow-xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header - Mobile Optimized */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-color)] sticky top-0 bg-[var(--bg-primary)] z-10">
                <div className="flex-1 min-w-0 pr-2">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--text-primary)] truncate">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                    {selectedDateTasks.length + selectedDateGoals.length} {selectedDateTasks.length + selectedDateGoals.length === 1 ? 'task' : 'tasks'}
                  </p>
                </div>
                <button
                  onClick={() => setShowTasksModal(false)}
                  className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] active:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] touch-manipulation flex-shrink-0"
                  aria-label="Close modal"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              {/* Tasks List - Mobile Optimized */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
                {selectedDateTasks.length === 0 && selectedDateGoals.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <p className="text-[var(--text-secondary)] mb-4 text-sm sm:text-base">No tasks for this day</p>
                    <button
                      onClick={() => {
                        setShowTasksModal(false);
                        if (onCreateTask) onCreateTask();
                      }}
                      className="btn-primary flex items-center gap-2 mx-auto text-sm sm:text-base px-4 py-2"
                    >
                      <FaPlus />
                      <span>Create Task</span>
                    </button>
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
                        className="card p-3 sm:p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[var(--text-primary)] text-sm sm:text-base truncate">{goal.name}</h3>
                            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">Goal</p>
                          </div>
                          {goal.deadline && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)] flex-shrink-0">
                              <FaClock className="text-xs" />
                              <span>{format(new Date(goal.deadline), 'h:mm a')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CalendarView;
