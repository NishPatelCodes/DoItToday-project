import { useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaClock, FaCalendarDay } from 'react-icons/fa';
import { format, isToday, isTomorrow, isPast, addDays, startOfDay } from 'date-fns';
import TaskCard from './TaskCard';

const TaskAlerts = memo(({ 
  tasks, 
  onToggle, 
  onDelete, 
  onEdit,
  className = '' 
}) => {
  const { overdue, dueToday, dueTomorrow } = useMemo(() => {
    const now = startOfDay(new Date());
    const tomorrow = startOfDay(addDays(new Date(), 1));

    const overdue = [];
    const dueToday = [];
    const dueTomorrow = [];

    tasks.forEach(task => {
      if (task.status === 'completed' || !task.dueDate) return;

      const dueDate = startOfDay(new Date(task.dueDate));

      if (dueDate < now) {
        overdue.push(task);
      } else if (isToday(dueDate)) {
        dueToday.push(task);
      } else if (isTomorrow(dueDate)) {
        dueTomorrow.push(task);
      }
    });

    // Sort by priority and due date
    const sortTasks = (taskList) => {
      return [...taskList].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    };

    return {
      overdue: sortTasks(overdue),
      dueToday: sortTasks(dueToday),
      dueTomorrow: sortTasks(dueTomorrow),
    };
  }, [tasks]);

  const totalAlerts = overdue.length + dueToday.length + dueTomorrow.length;

  if (totalAlerts === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overdue Tasks */}
      <AnimatePresence>
        {overdue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card p-4 border-l-4 border-l-red-500 bg-red-50/10 dark:bg-red-900/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <FaExclamationTriangle className="text-red-500" />
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                Overdue Tasks ({overdue.length})
              </h3>
            </div>
            <div className="space-y-2">
              {overdue.slice(0, 3).map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
              {overdue.length > 3 && (
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  +{overdue.length - 3} more overdue task{overdue.length - 3 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Due Today */}
      <AnimatePresence>
        {dueToday.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card p-4 border-l-4 border-l-orange-500 bg-orange-50/10 dark:bg-orange-900/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <FaCalendarDay className="text-orange-500" />
              <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                Due Today ({dueToday.length})
              </h3>
            </div>
            <div className="space-y-2">
              {dueToday.slice(0, 3).map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
              {dueToday.length > 3 && (
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  +{dueToday.length - 3} more task{dueToday.length - 3 !== 1 ? 's' : ''} due today
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Due Tomorrow */}
      <AnimatePresence>
        {dueTomorrow.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card p-4 border-l-4 border-l-blue-500 bg-blue-50/10 dark:bg-blue-900/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <FaClock className="text-blue-500" />
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                Due Tomorrow ({dueTomorrow.length})
              </h3>
            </div>
            <div className="space-y-2">
              {dueTomorrow.slice(0, 3).map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
              {dueTomorrow.length > 3 && (
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  +{dueTomorrow.length - 3} more task{dueTomorrow.length - 3 !== 1 ? 's' : ''} due tomorrow
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

TaskAlerts.displayName = 'TaskAlerts';

export default TaskAlerts;
