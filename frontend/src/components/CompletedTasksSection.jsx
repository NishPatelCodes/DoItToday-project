import { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaChevronDown, FaChevronUp, FaChartLine, FaUserFriends, FaFilter } from 'react-icons/fa';
import { format, isToday, isYesterday, isThisWeek, startOfWeek, subDays, startOfDay, differenceInDays } from 'date-fns';
import TaskCard from './TaskCard';
import { useDataStore } from '../store/dataStore';

const CompletedTasksSection = memo(({ 
  tasks, 
  onToggle, 
  onDelete, 
  onEdit,
  className = '' 
}) => {
  const { friends } = useDataStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [timeFilter, setTimeFilter] = useState('7'); // 7, 30, all days

  const { groupedTasks, stats } = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const filterDays = timeFilter === 'all' ? Infinity : parseInt(timeFilter);

    const filtered = tasks.filter(task => {
      if (task.status !== 'completed' || !task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      const daysAgo = differenceInDays(now, completedDate);
      return daysAgo <= filterDays;
    });

    // Group by date
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    filtered.forEach(task => {
      const completedDate = new Date(task.completedAt);
      if (isToday(completedDate)) {
        groups.today.push(task);
      } else if (isYesterday(completedDate)) {
        groups.yesterday.push(task);
      } else if (isThisWeek(completedDate) && !isToday(completedDate) && !isYesterday(completedDate)) {
        groups.thisWeek.push(task);
      } else {
        groups.older.push(task);
      }
    });

    // Sort each group by completion time (most recent first)
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const dateA = new Date(a.completedAt || a.updatedAt || a.createdAt);
        const dateB = new Date(b.completedAt || b.updatedAt || b.createdAt);
        return dateB - dateA;
      });
    });

    // Calculate stats
    const totalCompleted = filtered.length;
    const onTimeCount = filtered.filter(task => {
      if (!task.dueDate || !task.completedAt) return false;
      const dueDate = new Date(task.dueDate);
      const completedDate = new Date(task.completedAt);
      return completedDate <= dueDate;
    }).length;

    const completionRate = totalCompleted > 0 ? (onTimeCount / totalCompleted) * 100 : 0;

    // Calculate friend tasks (tasks shared with friends)
    const friendTasksCount = filtered.filter(task => {
      return task.isShared && task.sharedWith && task.sharedWith.length > 0;
    }).length;

    return {
      groupedTasks: groups,
      stats: {
        total: totalCompleted,
        completionRate: completionRate,
        onTimeCount,
        friendTasksCount,
      },
    };
  }, [tasks, timeFilter]);

  const totalTasks = groupedTasks.today.length + 
                     groupedTasks.yesterday.length + 
                     groupedTasks.thisWeek.length + 
                     groupedTasks.older.length;

  if (totalTasks === 0) {
    return null;
  }

  return (
    <div className={`card p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <FaCheckCircle className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Completed Tasks ({totalTasks})
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {stats.total} completed in the last {timeFilter === 'all' ? 'period' : `${timeFilter} days`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-[var(--text-tertiary)] text-sm" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 text-sm appearance-none cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
              aria-label="Filter by time period"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            aria-expanded={isExpanded}
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>

      {/* Stats */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaChartLine className="text-green-500 text-sm" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">Completion Rate</span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {stats.completionRate.toFixed(1)}%
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {stats.onTimeCount} of {stats.total} on time
            </p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaUserFriends className="text-blue-500 text-sm" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">Shared Tasks</span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {stats.friendTasksCount}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              with friends
            </p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaCheckCircle className="text-purple-500 text-sm" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">Total Completed</span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {stats.total}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              tasks finished
            </p>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-6"
          >
            {/* Today */}
            {groupedTasks.today.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">Today</h3>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                    {groupedTasks.today.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {groupedTasks.today.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onEdit={onEdit}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Yesterday */}
            {groupedTasks.yesterday.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">Yesterday</h3>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                    {groupedTasks.yesterday.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {groupedTasks.yesterday.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onEdit={onEdit}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* This Week */}
            {groupedTasks.thisWeek.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">This Week</h3>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                    {groupedTasks.thisWeek.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {groupedTasks.thisWeek.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onEdit={onEdit}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Older */}
            {groupedTasks.older.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">Older</h3>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                    {groupedTasks.older.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {groupedTasks.older.slice(0, 10).map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onEdit={onEdit}
                    />
                  ))}
                  {groupedTasks.older.length > 10 && (
                    <p className="text-sm text-[var(--text-secondary)] text-center py-2">
                      +{groupedTasks.older.length - 10} more completed tasks
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

CompletedTasksSection.displayName = 'CompletedTasksSection';

export default CompletedTasksSection;
