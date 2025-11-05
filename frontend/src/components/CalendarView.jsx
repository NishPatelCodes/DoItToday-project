import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaPlus, FaCalendarAlt, FaCalendarWeek } from 'react-icons/fa';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import WeeklyView from './WeeklyView';

const CalendarView = ({ tasks, goals, onDateClick, onCreateTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'weekly'

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

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // If weekly view is selected, render WeeklyView component instead
  if (viewMode === 'weekly') {
    return (
      <div className="space-y-4">
        {/* View Toggle */}
        <div className="flex items-center justify-end gap-2 p-2">
          <button
            onClick={() => setViewMode('monthly')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
          >
            <FaCalendarAlt />
            <span className="text-sm font-medium">Monthly</span>
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white transition-all"
          >
            <FaCalendarWeek />
            <span className="text-sm font-medium">Weekly</span>
          </button>
        </div>
        <WeeklyView 
          tasks={tasks} 
          onTaskClick={onDateClick}
          onCreateTask={onCreateTask}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <FaChevronLeft className="text-[var(--text-secondary)]" />
          </button>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <FaChevronRight className="text-[var(--text-secondary)]" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <button
            onClick={() => setViewMode('monthly')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white transition-all"
          >
            <FaCalendarAlt />
            <span className="text-sm font-medium hidden md:inline">Monthly</span>
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
          >
            <FaCalendarWeek />
            <span className="text-sm font-medium hidden md:inline">Weekly</span>
          </button>
          <button
            onClick={onCreateTask}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus />
            <span className="hidden md:inline">New Task</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week Day Headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-medium text-[var(--text-secondary)]"
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
          const hasEvents = dayTasks.length > 0 || dayGoals.length > 0;

          return (
            <motion.button
              key={day.toISOString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.01 }}
              onClick={() => onDateClick && onDateClick(day)}
              className={`
                p-2 rounded-lg min-h-[80px] text-left transition-all duration-200
                ${!isCurrentMonth ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'}
                ${isToday ? 'bg-[var(--accent-primary)]/10 border-2 border-[var(--accent-primary)]' : ''}
                ${hasEvents ? 'hover:bg-[var(--bg-tertiary)]' : ''}
                ${!isToday && !hasEvents ? 'hover:bg-[var(--bg-secondary)]' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-medium ${
                    isToday ? 'text-[var(--accent-primary)]' : ''
                  }`}
                >
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, 2).map((task) => {
                  const taskDate = new Date(task.dueDate);
                  const hours = taskDate.getHours();
                  const minutes = taskDate.getMinutes();
                  const hasSpecificTime = hours !== 23 || minutes !== 59;
                  
                  return (
                    <div
                      key={task._id}
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        task.priority === 'high'
                          ? 'bg-red-500/10 text-red-600'
                          : task.priority === 'medium'
                          ? 'bg-yellow-500/10 text-yellow-600'
                          : 'bg-blue-500/10 text-blue-600'
                      }`}
                      title={task.title + (hasSpecificTime ? ` at ${format(taskDate, 'h:mm a')}` : '')}
                    >
                      <div className="truncate font-medium">{task.title}</div>
                      {hasSpecificTime && (
                        <div className="text-[10px] opacity-75">
                          {format(taskDate, 'h:mm a')}
                        </div>
                      )}
                    </div>
                  );
                })}
                {dayTasks.length > 2 && (
                  <div className="text-xs text-[var(--text-secondary)]">
                    +{dayTasks.length - 2} more
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-4 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30"></div>
          <span>High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/30"></div>
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/30"></div>
          <span>Low Priority</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarView;



