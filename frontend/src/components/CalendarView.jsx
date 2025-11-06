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
      className="card p-4 md:p-6 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] overflow-x-hidden"
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-4">
          <button
            onClick={prevMonth}
            className="p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <FaChevronLeft className="text-[var(--text-secondary)] text-lg" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Monthly Calendar</p>
          </div>
          <button
            onClick={nextMonth}
            className="p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <FaChevronRight className="text-[var(--text-secondary)] text-lg" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <button
            onClick={() => setViewMode('monthly')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white transition-all shadow-sm hover:shadow-md font-medium"
          >
            <FaCalendarAlt />
            <span className="text-sm font-medium hidden md:inline">Monthly</span>
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all shadow-sm hover:shadow-md font-medium border border-[var(--border-color)]"
          >
            <FaCalendarWeek />
            <span className="text-sm font-medium hidden md:inline">Weekly</span>
          </button>
          <button
            onClick={onCreateTask}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm hover:shadow-md font-medium"
          >
            <FaPlus />
            <span className="hidden md:inline">New Task</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Week Day Headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)]"
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
                p-3 rounded-xl min-h-[100px] text-left transition-all duration-200 border
                ${!isCurrentMonth 
                  ? 'text-[var(--text-tertiary)] bg-[var(--bg-secondary)]/50 border-[var(--border-color)]/30' 
                  : isToday 
                  ? 'bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-primary)]/10 border-2 border-[var(--accent-primary)] shadow-md' 
                  : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--accent-primary)]/50'
                }
                ${hasEvents ? 'shadow-sm' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-lg font-bold ${
                    isToday 
                      ? 'text-[var(--accent-primary)]' 
                      : !isCurrentMonth 
                      ? 'text-[var(--text-tertiary)]' 
                      : 'text-[var(--text-primary)]'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                {(dayTasks.length > 0 || dayGoals.length > 0) && (
                  <span className="text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">
                    {dayTasks.length + dayGoals.length}
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                {dayTasks.slice(0, 2).map((task) => {
                  const taskDate = new Date(task.dueDate);
                  const hours = taskDate.getHours();
                  const minutes = taskDate.getMinutes();
                  const hasSpecificTime = hours !== 23 || minutes !== 59;
                  
                  return (
                    <div
                      key={task._id}
                      className={`text-xs px-2 py-1.5 rounded-lg font-medium shadow-sm border ${
                        task.priority === 'high'
                          ? 'bg-gradient-to-r from-red-500/15 to-red-500/10 text-red-700 border-red-500/30'
                          : task.priority === 'medium'
                          ? 'bg-gradient-to-r from-yellow-500/15 to-yellow-500/10 text-yellow-700 border-yellow-500/30'
                          : 'bg-gradient-to-r from-blue-500/15 to-blue-500/10 text-blue-700 border-blue-500/30'
                      }`}
                      title={task.title + (hasSpecificTime ? ` at ${format(taskDate, 'h:mm a')}` : '')}
                    >
                      <div className="truncate font-semibold">{task.title}</div>
                      {hasSpecificTime && (
                        <div className="text-[10px] opacity-80 mt-0.5 font-medium">
                          {format(taskDate, 'h:mm a')}
                        </div>
                      )}
                    </div>
                  );
                })}
                {dayTasks.length > 2 && (
                  <div className="text-xs text-[var(--text-secondary)] font-medium px-2 py-1 bg-[var(--bg-tertiary)] rounded-lg">
                    +{dayTasks.length - 2} more
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] border-t-2 border-[var(--border-color)] pt-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <div className="w-3 h-3 rounded-md bg-gradient-to-br from-red-500 to-red-600 border border-red-700 shadow-sm"></div>
          <span className="font-medium">High Priority</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <div className="w-3 h-3 rounded-md bg-gradient-to-br from-yellow-500 to-yellow-600 border border-yellow-700 shadow-sm"></div>
          <span className="font-medium">Medium Priority</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <div className="w-3 h-3 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 border border-blue-700 shadow-sm"></div>
          <span className="font-medium">Low Priority</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarView;



