import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaPlus, FaCalendarAlt, FaCalendarWeek, FaSearch } from 'react-icons/fa';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfDay } from 'date-fns';
import WeeklyView from './WeeklyView';

const CalendarView = ({ tasks, goals, onDateClick, onCreateTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('monthly'); // 'daily', 'weekly', 'monthly', 'yearly'
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Mini calendar
  const miniMonthStart = startOfMonth(miniCalendarDate);
  const miniMonthEnd = endOfMonth(miniCalendarDate);
  const miniCalendarStart = startOfWeek(miniMonthStart);
  const miniCalendarEnd = endOfWeek(miniMonthEnd);
  const miniDays = eachDayOfInterval({ start: miniCalendarStart, end: miniCalendarEnd });

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
  const prevMiniMonth = () => setMiniCalendarDate(subMonths(miniCalendarDate, 1));
  const nextMiniMonth = () => setMiniCalendarDate(addMonths(miniCalendarDate, 1));

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekDaysShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // If weekly view is selected, render WeeklyView component instead
  if (viewMode === 'weekly') {
    return (
      <div className="space-y-4">
        {/* View Toggle - Clean Modern Style */}
        <div className="flex items-center justify-between gap-2 p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('monthly')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all text-sm font-medium"
            >
              <FaCalendarAlt />
              <span>Monthly</span>
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white transition-all shadow-sm text-sm font-medium"
            >
              <FaCalendarWeek />
              <span>Weekly</span>
            </button>
          </div>
          <button
            onClick={onCreateTask}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all"
          >
            <FaPlus />
            <span>New Task</span>
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
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-80 flex-shrink-0 space-y-6"
      >
        {/* Calendar Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Calendar</h1>
          
          {/* Create Schedule Button */}
          <button
            onClick={onCreateTask}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[var(--accent-primary)] text-white font-medium shadow-sm hover:shadow-md hover:bg-[var(--accent-hover)] transition-all"
          >
            <FaPlus />
            <span>Create Schedule</span>
          </button>
        </div>

        {/* Mini Calendar */}
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMiniMonth}
              className="p-1 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <FaChevronLeft className="text-[var(--text-secondary)] text-sm" />
            </button>
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              {format(miniCalendarDate, 'MMMM yyyy')}
            </div>
            <button
              onClick={nextMiniMonth}
              className="p-1 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <FaChevronRight className="text-[var(--text-secondary)] text-sm" />
            </button>
          </div>
          
          {/* Mini Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDaysShort.map((day, idx) => (
              <div
                key={idx}
                className="text-center text-xs font-semibold text-[var(--text-secondary)] py-1"
              >
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {miniDays.map((day) => {
              const isCurrentMonth = isSameMonth(day, miniCalendarDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => {
                    setCurrentDate(day);
                    setMiniCalendarDate(day);
                  }}
                  className={`
                    aspect-square rounded-full text-xs font-medium transition-all
                    ${!isCurrentMonth 
                      ? 'text-[var(--text-tertiary)]' 
                      : isToday
                      ? 'bg-[var(--accent-primary)] text-white shadow-md'
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                    }
                  `}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>

        {/* People Section */}
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] p-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">People</h3>
          <div className="relative mb-3">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)] text-sm" />
            <input
              type="text"
              placeholder="Search for People"
              className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)]"
            />
          </div>
          <div className="space-y-2">
            {/* Placeholder for people list - can be populated later */}
            <div className="text-xs text-[var(--text-tertiary)] text-center py-4">
              No people added yet
            </div>
          </div>
        </div>

        {/* My Schedule Button */}
        <button className="w-full px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--accent-primary)] font-medium hover:bg-[var(--bg-secondary)] transition-colors border border-[var(--border-color)]">
          My Schedule
        </button>
      </motion.div>

      {/* Main Calendar Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] p-6"
      >
        {/* Top Navigation */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          {/* Date Display */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <FaChevronLeft className="text-[var(--text-secondary)]" />
            </button>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              {format(currentDate, 'MMMM d, yyyy')}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <FaChevronRight className="text-[var(--text-secondary)]" />
            </button>
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-2 bg-[var(--bg-secondary)] rounded-lg p-1 border border-[var(--border-color)]">
            {[
              { key: 'daily', label: 'Day' },
              { key: 'weekly', label: 'Week' },
              { key: 'monthly', label: 'Month' },
              { key: 'yearly', label: 'Year' },
            ].map((view) => (
              <button
                key={view.key}
                onClick={() => {
                  if (view.key === 'weekly') {
                    setViewMode('weekly');
                  } else if (view.key === 'monthly') {
                    setViewMode('monthly');
                  }
                  // Daily and Yearly views can be implemented later
                }}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${viewMode === view.key
                    ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }
                `}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid - Monthly View */}
        <div className="grid grid-cols-7 gap-px bg-[var(--border-color)] rounded-lg overflow-hidden">
          {/* Week Day Headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="bg-[var(--bg-secondary)] p-3 text-center text-sm font-bold text-[var(--text-primary)] uppercase"
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
            const allEvents = [...dayTasks, ...dayGoals];

            return (
              <motion.button
                key={day.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => onDateClick && onDateClick(day)}
                className={`
                  bg-[var(--bg-primary)] p-3 min-h-[100px] text-left transition-all relative
                  ${!isCurrentMonth 
                    ? 'text-[var(--text-tertiary)] opacity-50' 
                    : isToday 
                    ? 'bg-[var(--accent-primary)]/5' 
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

                {/* Events as Colored Blocks */}
                <div className="space-y-1">
                  {allEvents.slice(0, 3).map((event, eventIndex) => {
                    const isTask = 'dueDate' in event;
                    const eventTitle = event.title || event.name || 'Event';
                    
                    return (
                      <div
                        key={isTask ? event._id : `goal-${event._id}`}
                        className="px-2 py-1 rounded text-xs font-medium text-white bg-[var(--accent-primary)] truncate"
                        style={{
                          backgroundColor: isTask && event.priority === 'high' 
                            ? 'var(--accent-primary)' 
                            : isTask && event.priority === 'medium'
                            ? 'rgba(99, 102, 241, 0.8)'
                            : 'rgba(99, 102, 241, 0.7)'
                        }}
                        title={eventTitle}
                      >
                        {eventTitle}
                      </div>
                    );
                  })}
                  {allEvents.length > 3 && (
                    <div className="text-xs text-[var(--text-secondary)] font-medium px-2">
                      More
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarView;
