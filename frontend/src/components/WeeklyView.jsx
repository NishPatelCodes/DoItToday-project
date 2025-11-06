import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaPlus, FaClock } from 'react-icons/fa';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay, isWithinInterval } from 'date-fns';

const WeeklyView = ({ tasks, onTaskClick, onCreateTask }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const timetableRef = useRef(null);
  const hasScrolledRef = useRef(false);
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  
  // Time slots from 12 AM to 11 PM (24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  
  const prevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    hasScrolledRef.current = false;
  };
  const nextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
    hasScrolledRef.current = false;
  };
  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
    hasScrolledRef.current = false;
  };
  
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
  
  // Find the hour with the most tasks
  const findMostPopulatedHour = () => {
    const hourCounts = {};
    
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const taskDate = new Date(task.dueDate);
      if (weekDays.some(day => isSameDay(taskDate, day))) {
        const hour = taskDate.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    
    if (Object.keys(hourCounts).length === 0) {
      // If no tasks, scroll to current hour or 9 AM
      const currentHour = new Date().getHours();
      return currentHour >= 8 && currentHour <= 20 ? currentHour : 9;
    }
    
    // Find hour with max tasks
    const maxHour = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[a] > hourCounts[b] ? a : b
    );
    
    return parseInt(maxHour);
  };
  
  // Auto-scroll to most populated hour
  useEffect(() => {
    if (!hasScrolledRef.current && timetableRef.current) {
      const targetHour = findMostPopulatedHour();
      const hourElement = document.getElementById(`time-slot-${targetHour}`);
      
      if (hourElement && timetableRef.current) {
        setTimeout(() => {
          // Calculate scroll position relative to the container
          const container = timetableRef.current;
          const element = hourElement;
          
          // Scroll to center the element in the container
          const scrollTop = element.offsetTop - (container.clientHeight / 2) + (element.clientHeight / 2);
          
          container.scrollTo({
            top: Math.max(0, scrollTop),
            behavior: 'smooth'
          });
          
          hasScrolledRef.current = true;
        }, 300);
      } else {
        hasScrolledRef.current = true;
      }
    }
  }, [tasks, currentWeekStart]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 md:p-6 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 pb-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-4">
          <button
            onClick={prevWeek}
            className="p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Previous Week"
          >
            <FaChevronLeft className="text-[var(--text-secondary)] text-lg" />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Weekly Schedule</p>
          </div>
          <button
            onClick={nextWeek}
            className="p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Next Week"
          >
            <FaChevronRight className="text-[var(--text-secondary)] text-lg" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goToToday}
            className="btn-secondary text-sm px-4 py-2 rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
          >
            Today
          </button>
          <button
            onClick={onCreateTask}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
          >
            <FaPlus />
            <span>New Task</span>
          </button>
        </div>
      </div>
      
      {/* Weekly Timetable */}
      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-inner" ref={timetableRef} style={{ maxWidth: '100%' }}>
        <div className="min-w-[800px] max-w-full">
          {/* Day Headers */}
          <div className="grid grid-cols-8 gap-2 mb-2 sticky top-0 bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-secondary)] z-10 p-3 border-b-2 border-[var(--border-color)] shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] p-2">
              <FaClock className="text-[var(--accent-primary)]" />
              <span>Time</span>
            </div>
            {weekDays.map((day, index) => {
              const dayTaskCount = getTasksForDay(day).length;
              return (
                <div
                  key={index}
                  className={`text-center p-3 rounded-xl transition-all ${
                    isToday(day) 
                      ? 'bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-primary)]/10 border-2 border-[var(--accent-primary)] shadow-md' 
                      : 'bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'
                  }`}
                >
                  <div className={`text-xs font-semibold uppercase tracking-wider ${
                    isToday(day) ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
                  }`}>
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-2xl font-bold mt-1 ${
                    isToday(day) ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  {dayTaskCount > 0 && (
                    <div className={`text-xs font-medium mt-1.5 px-2 py-1 rounded-full inline-block ${
                      isToday(day) 
                        ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' 
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                    }`}>
                      {dayTaskCount} task{dayTaskCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Time Slots */}
          <div className="space-y-1.5 p-2">
            {timeSlots.map((hour) => (
              <div key={hour} id={`time-slot-${hour}`} className="grid grid-cols-8 gap-2">
                {/* Time Label */}
                <div className="flex items-center justify-end pr-3">
                  <div className="text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-tertiary)] px-3 py-2 rounded-lg border border-[var(--border-color)] min-w-[70px] text-right">
                    {formatTime(hour)}
                  </div>
                </div>
                
                {/* Day Columns */}
                {weekDays.map((day, dayIndex) => {
                  const tasksInSlot = getTasksForTimeSlot(day, hour);
                  return (
                    <div
                      key={dayIndex}
                      className={`min-h-[70px] p-2 rounded-lg border transition-all ${
                        isToday(day) && new Date().getHours() === hour
                          ? 'border-[var(--accent-primary)]/50 bg-[var(--accent-primary)]/5 shadow-sm'
                          : 'border-[var(--border-color)]/50 bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)]/70 hover:border-[var(--border-color)]'
                      }`}
                    >
                      <div className="space-y-1.5">
                        {tasksInSlot.map((task) => (
                          <motion.button
                            key={task._id}
                            onClick={() => onTaskClick && onTaskClick(task)}
                            className={`w-full text-left p-2.5 rounded-lg text-white text-xs font-semibold shadow-md border transition-all ${getPriorityColor(task.priority)} hover:shadow-lg`}
                            whileHover={{ scale: 1.03, y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            title={`${task.title}\n${format(new Date(task.dueDate), 'h:mm a')}\nPriority: ${task.priority}`}
                          >
                            <div className="truncate font-bold text-sm mb-0.5">{task.title}</div>
                            <div className="text-[10px] opacity-90 font-medium flex items-center gap-1">
                              <FaClock className="text-[10px]" />
                              {format(new Date(task.dueDate), 'h:mm a')}
                            </div>
                            {task.status === 'completed' && (
                              <div className="text-[10px] mt-1.5 font-medium opacity-80">✓ Completed</div>
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
      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)] border-t-2 border-[var(--border-color)] pt-4">
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
        <div className="ml-auto text-[var(--text-tertiary)] text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <span className="font-medium">ℹ️</span> Tasks without times default to 11:59 PM
        </div>
      </div>
    </motion.div>
  );
};

export default WeeklyView;

