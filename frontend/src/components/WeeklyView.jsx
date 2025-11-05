import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay, isWithinInterval } from 'date-fns';

const WeeklyView = ({ tasks, onTaskClick, onCreateTask }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  
  // Time slots from 12 AM to 11 PM (24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  
  const prevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const nextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  
  const getTasksForTimeSlot = (day, hour) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      const taskHour = taskDate.getHours();
      return isSameDay(taskDate, day) && taskHour === hour;
    });
  };
  
  const getTasksForDay = (day) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), day);
    });
  };
  
  const formatTime = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/90 hover:bg-red-600 border-red-600';
      case 'medium':
        return 'bg-yellow-500/90 hover:bg-yellow-600 border-yellow-600';
      case 'low':
        return 'bg-blue-500/90 hover:bg-blue-600 border-blue-600';
      default:
        return 'bg-gray-500/90 hover:bg-gray-600 border-gray-600';
    }
  };
  
  const isToday = (day) => isSameDay(day, new Date());
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 md:p-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={prevWeek}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            title="Previous Week"
          >
            <FaChevronLeft className="text-[var(--text-secondary)]" />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
            </h2>
          </div>
          <button
            onClick={nextWeek}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            title="Next Week"
          >
            <FaChevronRight className="text-[var(--text-secondary)]" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goToToday}
            className="btn-secondary text-sm"
          >
            Today
          </button>
          <button
            onClick={onCreateTask}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <FaPlus />
            <span>New Task</span>
          </button>
        </div>
      </div>
      
      {/* Weekly Timetable */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 gap-1 mb-2 sticky top-0 bg-[var(--bg-primary)] z-10 pb-2">
            <div className="text-xs font-medium text-[var(--text-secondary)] p-2">
              Time
            </div>
            {weekDays.map((day, index) => {
              const dayTaskCount = getTasksForDay(day).length;
              return (
                <div
                  key={index}
                  className={`text-center p-2 rounded-lg ${
                    isToday(day) 
                      ? 'bg-[var(--accent-primary)]/10 border-2 border-[var(--accent-primary)]' 
                      : 'bg-[var(--bg-secondary)]'
                  }`}
                >
                  <div className={`text-xs font-medium ${
                    isToday(day) ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
                  }`}>
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-lg font-semibold ${
                    isToday(day) ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  {dayTaskCount > 0 && (
                    <div className="text-xs text-[var(--text-secondary)] mt-1">
                      {dayTaskCount} task{dayTaskCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Time Slots */}
          <div className="space-y-1">
            {timeSlots.map((hour) => (
              <div key={hour} className="grid grid-cols-8 gap-1">
                {/* Time Label */}
                <div className="text-xs font-medium text-[var(--text-secondary)] p-2 flex items-start">
                  {formatTime(hour)}
                </div>
                
                {/* Day Columns */}
                {weekDays.map((day, dayIndex) => {
                  const tasksInSlot = getTasksForTimeSlot(day, hour);
                  return (
                    <div
                      key={dayIndex}
                      className={`min-h-[60px] p-1 rounded border transition-colors ${
                        isToday(day) && new Date().getHours() === hour
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                          : 'border-[var(--border-color)] bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-tertiary)]/50'
                      }`}
                    >
                      <div className="space-y-1">
                        {tasksInSlot.map((task) => (
                          <motion.button
                            key={task._id}
                            onClick={() => onTaskClick && onTaskClick(task)}
                            className={`w-full text-left p-2 rounded text-white text-xs font-medium shadow-sm border transition-all ${getPriorityColor(task.priority)}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            title={`${task.title}\n${format(new Date(task.dueDate), 'h:mm a')}`}
                          >
                            <div className="truncate font-semibold">{task.title}</div>
                            <div className="text-[10px] opacity-90 mt-0.5">
                              {format(new Date(task.dueDate), 'h:mm a')}
                            </div>
                            {task.status === 'completed' && (
                              <div className="text-[10px] mt-1">✓ Completed</div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500/90 border border-red-600"></div>
          <span>High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500/90 border border-yellow-600"></div>
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500/90 border border-blue-600"></div>
          <span>Low Priority</span>
        </div>
        <div className="ml-auto text-[var(--text-tertiary)]">
          Tasks without times default to 11:59 PM
        </div>
      </div>
    </motion.div>
  );
};

export default WeeklyView;

