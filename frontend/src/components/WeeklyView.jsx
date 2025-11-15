import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaPlus, FaClock } from 'react-icons/fa';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay, addMinutes, differenceInMinutes } from 'date-fns';

const WeeklyView = ({ tasks, onTaskClick, onCreateTask }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const timetableRef = useRef(null);
  const hasScrolledRef = useRef(false);
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  
  // Time slots every 30 minutes from 8 AM to 8 PM (work hours focus)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      slots.push({ hour, minute: 0 });
      slots.push({ hour, minute: 30 });
    }
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
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
  
  // Get tasks for a specific day
  const getTasksForDay = (day) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), day);
    });
  };
  
  // Calculate event position and height based on start time and duration
  const getEventPosition = (task, day) => {
    if (!task.dueDate) return null;
    
    const taskDate = new Date(task.dueDate);
    if (!isSameDay(taskDate, day)) return null;
    
    const startHour = taskDate.getHours();
    const startMinute = taskDate.getMinutes();
    
    // Default duration: 1 hour (60 minutes)
    const duration = task.duration || 60;
    const endTime = addMinutes(taskDate, duration);
    
    // Calculate position from 8 AM (start of our time slots)
    const dayStart = new Date(day);
    dayStart.setHours(8, 0, 0, 0);
    
    const minutesFromStart = differenceInMinutes(taskDate, dayStart);
    const topPercent = (minutesFromStart / (12 * 60)) * 100; // 12 hours (8 AM to 8 PM)
    const heightPercent = (duration / (12 * 60)) * 100;
    
    return {
      top: `${topPercent}%`,
      height: `${heightPercent}%`,
      startTime: taskDate,
      endTime: endTime,
    };
  };
  
  const formatTime = (hour, minute = 0) => {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return format(date, 'h:mm a');
  };
  
  const formatTimeRange = (start, end) => {
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };
  
  // Color scheme matching the image style
  const getEventColor = (task, index) => {
    // Use a consistent color based on task properties or index
    const colors = [
      { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600' },
      { bg: 'bg-blue-400', text: 'text-white', border: 'border-blue-500' },
      { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600' },
      { bg: 'bg-indigo-500', text: 'text-white', border: 'border-indigo-600' },
    ];
    
    // Use priority or index to determine color
    if (task.priority === 'high') return colors[0]; // Purple
    if (task.priority === 'medium') return colors[1]; // Light blue
    if (task.priority === 'low') return colors[2]; // Green
    
    return colors[index % colors.length];
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
      const currentHour = new Date().getHours();
      return currentHour >= 8 && currentHour <= 20 ? currentHour : 9;
    }
    
    const maxHour = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[a] > hourCounts[b] ? a : b
    );
    
    return parseInt(maxHour);
  };
  
  // Auto-scroll to most populated hour
  useEffect(() => {
    if (!hasScrolledRef.current && timetableRef.current) {
      const targetHour = findMostPopulatedHour();
      const hourElement = document.getElementById(`time-slot-${targetHour}-0`);
      
      if (hourElement && timetableRef.current) {
        setTimeout(() => {
          const container = timetableRef.current;
          const element = hourElement;
          
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
      className="card p-4 md:p-6 bg-white dark:bg-[var(--bg-primary)]"
    >
      {/* Header - Clean Modern Style */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 pb-4 border-b border-gray-200 dark:border-[var(--border-color)]">
        <div className="flex items-center gap-4">
          <button
            onClick={prevWeek}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--bg-tertiary)] transition-all"
            title="Previous Week"
          >
            <FaChevronLeft className="text-gray-600 dark:text-[var(--text-secondary)]" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[var(--text-primary)]">
              {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-0.5">Weekly Schedule</p>
          </div>
          <button
            onClick={nextWeek}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--bg-tertiary)] transition-all"
            title="Next Week"
          >
            <FaChevronRight className="text-gray-600 dark:text-[var(--text-secondary)]" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-lg hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)] transition-all"
          >
            Today
          </button>
          <button
            onClick={onCreateTask}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
          >
            <FaPlus />
            <span>New Task</span>
          </button>
        </div>
      </div>
      
      {/* Weekly Timetable - Modern Style */}
      <div className="overflow-x-auto overflow-y-auto max-h-[75vh] rounded-lg border border-gray-200 dark:border-[var(--border-color)] bg-gray-50 dark:bg-[var(--bg-secondary)]" ref={timetableRef}>
        <div className="min-w-[1000px]">
          {/* Day Headers Row */}
          <div className="grid grid-cols-8 gap-px mb-px sticky top-0 bg-white dark:bg-[var(--bg-primary)] z-20 border-b-2 border-gray-300 dark:border-[var(--border-color)]">
            {/* Time Column Header */}
            <div className="flex items-center justify-center p-3 bg-gray-100 dark:bg-[var(--bg-tertiary)] border-r border-gray-200 dark:border-[var(--border-color)] sticky left-0 z-30">
              <FaClock className="text-gray-600 dark:text-[var(--text-secondary)] text-sm" />
            </div>
            {/* Day Headers */}
            {weekDays.map((day, index) => {
              const dayTaskCount = getTasksForDay(day).length;
              return (
                <div
                  key={index}
                  className={`text-center p-3 bg-white dark:bg-[var(--bg-primary)] ${
                    isToday(day) 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-500' 
                      : ''
                  }`}
                >
                  <div className={`text-xs font-semibold uppercase tracking-wider ${
                    isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-[var(--text-secondary)]'
                  }`}>
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-lg font-bold mt-1 ${
                    isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-[var(--text-primary)]'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  {dayTaskCount > 0 && (
                    <div className={`text-[10px] font-medium mt-1 px-2 py-0.5 rounded-full inline-block ${
                      isToday(day) 
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
                        : 'bg-gray-200 dark:bg-[var(--bg-secondary)] text-gray-600 dark:text-[var(--text-secondary)]'
                    }`}>
                      {dayTaskCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Time Rows - 30 minute intervals with Event Containers */}
          <div className="relative">
            {/* Time labels column */}
            <div className="absolute left-0 top-0 w-[80px] border-r border-gray-200 dark:border-[var(--border-color)] bg-white dark:bg-[var(--bg-primary)] sticky left-0 z-10" style={{ height: `${12 * 60 * 0.5}px` }}>
              {timeSlots.map((slot, slotIndex) => {
                const isHalfHour = slot.minute === 30;
                const minutesFromStart = (slot.hour - 8) * 60 + slot.minute;
                const topPercent = (minutesFromStart / (12 * 60)) * 100;
                
                if (isHalfHour) {
                  return (
                    <div 
                      key={`time-label-${slot.hour}-${slot.minute}`} 
                      className="absolute left-0 right-0 flex items-center justify-center px-2"
                      style={{ top: `${topPercent}%`, height: '30px' }}
                    >
                      <div className="text-[10px] text-gray-400 dark:text-[var(--text-tertiary)]">
                        {formatTime(slot.hour, slot.minute)}
                      </div>
                    </div>
                  );
                }
                return (
                  <div 
                    key={`time-label-${slot.hour}-${slot.minute}`} 
                    id={`time-slot-${slot.hour}-${slot.minute}`} 
                    className="absolute left-0 right-0 flex items-center justify-center px-3 border-b border-gray-200 dark:border-[var(--border-color)]/50"
                    style={{ top: `${topPercent}%`, height: '60px' }}
                  >
                    <div className="text-xs font-medium text-gray-600 dark:text-[var(--text-secondary)]">
                      {formatTime(slot.hour, slot.minute)}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Day columns with events */}
            <div className="ml-[80px] grid grid-cols-7">
              {weekDays.map((day, dayIndex) => {
                const dayTasks = getTasksForDay(day);
                const dayStart = new Date(day);
                dayStart.setHours(8, 0, 0, 0);
                const dayEnd = new Date(day);
                dayEnd.setHours(20, 0, 0, 0);
                const totalMinutes = 12 * 60; // 12 hours
                
                return (
                  <div
                    key={dayIndex}
                    className="relative border-r border-gray-200 dark:border-[var(--border-color)]/50"
                    style={{ minHeight: `${totalMinutes * 0.5}px`, height: `${totalMinutes * 0.5}px` }}
                  >
                    {/* Time slot grid lines */}
                    {timeSlots.map((slot, slotIndex) => {
                      const isHalfHour = slot.minute === 30;
                      const minutesFromStart = (slot.hour - 8) * 60 + slot.minute;
                      const topPercent = (minutesFromStart / totalMinutes) * 100;
                      
                      return (
                        <div
                          key={`grid-${slot.hour}-${slot.minute}`}
                          className="absolute left-0 right-0 border-b border-gray-200 dark:border-[var(--border-color)]/30"
                          style={{
                            top: `${topPercent}%`,
                            height: isHalfHour ? '30px' : '60px',
                          }}
                        />
                      );
                    })}
                    
                    {/* Events positioned absolutely */}
                    {dayTasks.map((task, taskIndex) => {
                      const position = getEventPosition(task, day);
                      if (!position) return null;
                      
                      const colors = getEventColor(task, taskIndex);
                      
                      return (
                        <motion.button
                          key={task._id}
                          onClick={() => onTaskClick && onTaskClick(task)}
                          className={`absolute left-1 right-1 ${colors.bg} ${colors.text} ${colors.border} border rounded-lg p-2 shadow-sm hover:shadow-md transition-all cursor-pointer z-20`}
                          style={{
                            top: position.top,
                            height: position.height,
                            minHeight: '50px',
                          }}
                          whileHover={{ scale: 1.02, z: 30 }}
                          whileTap={{ scale: 0.98 }}
                          title={`${task.title}\n${formatTimeRange(position.startTime, position.endTime)}`}
                        >
                          <div className="text-xs font-semibold truncate mb-0.5">{task.title}</div>
                          <div className="text-[10px] opacity-90 font-medium">
                            {formatTimeRange(position.startTime, position.endTime)}
                          </div>
                          {task.status === 'completed' && (
                            <div className="text-[9px] mt-1 font-medium opacity-80 line-through">✓ Completed</div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-[var(--text-secondary)] border-t border-gray-200 dark:border-[var(--border-color)] pt-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-color)]">
          <div className="w-3 h-3 rounded bg-purple-500"></div>
          <span className="font-medium">High Priority</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-color)]">
          <div className="w-3 h-3 rounded bg-blue-400"></div>
          <span className="font-medium">Medium Priority</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-color)]">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="font-medium">Low Priority</span>
        </div>
      </div>
    </motion.div>
  );
};

export default WeeklyView;
