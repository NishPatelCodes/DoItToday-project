import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaClock } from 'react-icons/fa';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import TaskCard from './TaskCard';

const CalendarView = ({ tasks, goals, onDateClick, onCreateTask, onTaskToggle, onTaskDelete, onTaskEdit }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTasksModal, setShowTasksModal] = useState(false);

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
      {/* Main Calendar Area - Minimalist Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] p-6"
      >
        {/* Top Navigation */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)]"
            >
              <FaChevronLeft />
            </button>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)]"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        {/* Calendar Grid - Monthly View */}
        <div className="grid grid-cols-7 gap-px bg-[var(--border-color)] rounded-lg overflow-hidden">
          {/* Week Day Headers - Single Letters */}
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className="bg-[var(--bg-secondary)] p-3 text-center text-sm font-semibold text-[var(--text-primary)]"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
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
                  bg-[var(--bg-primary)] p-3 min-h-[120px] text-left transition-all relative border border-transparent
                  ${!isCurrentMonth 
                    ? 'text-[var(--text-tertiary)] opacity-50' 
                    : isToday 
                    ? 'bg-[var(--accent-primary)]/5 border-[var(--accent-primary)]/20' 
                    : 'hover:bg-[var(--bg-secondary)]'
                  }
                `}
              >
                {/* Date Number */}
                <div className={`text-lg font-bold mb-2 ${
                  isToday 
                    ? 'text-[var(--accent-primary)]' 
                    : !isCurrentMonth 
                    ? 'text-[var(--text-tertiary)]' 
                    : 'text-[var(--text-primary)]'
                }`}>
                  {format(day, 'd')}
                </div>

                {/* Task Count - Matching Image Style */}
                <div className={`text-sm font-medium ${
                  !isCurrentMonth
                    ? 'text-[var(--text-tertiary)]'
                    : totalTasks > 0
                    ? 'text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)]'
                }`}>
                  {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Tasks Modal for Selected Date */}
      <AnimatePresence>
        {showTasksModal && selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTasksModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {selectedDateTasks.length + selectedDateGoals.length} {selectedDateTasks.length + selectedDateGoals.length === 1 ? 'task' : 'tasks'}
                  </p>
                </div>
                <button
                  onClick={() => setShowTasksModal(false)}
                  className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)]"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedDateTasks.length === 0 && selectedDateGoals.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[var(--text-secondary)] mb-4">No tasks for this day</p>
                    <button
                      onClick={() => {
                        setShowTasksModal(false);
                        if (onCreateTask) onCreateTask();
                      }}
                      className="btn-primary flex items-center gap-2 mx-auto"
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
                        className="card p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)]"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">{goal.name}</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">Goal</p>
                          </div>
                          {goal.deadline && (
                            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                              <FaClock />
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
