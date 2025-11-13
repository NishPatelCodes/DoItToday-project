import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTasks, FaBullseye, FaFire, FaUserFriends, FaChartLine, FaSearch, FaChevronUp, FaChevronDown, FaEllipsisV, FaLightbulb, FaDollarSign, FaTrophy, FaFlag, FaCheckCircle } from 'react-icons/fa';
import { format, isToday, isYesterday, isThisWeek, startOfWeek, endOfWeek, isSameDay, startOfDay, differenceInDays } from 'date-fns';
import TaskCard from '../components/TaskCard';
import GoalTracker from '../components/GoalTracker';
import GoalAnalytics from '../components/GoalAnalytics';
import HabitCard from '../components/HabitCard';
import SmartPlanner from '../components/SmartPlanner';
import FocusMode from '../components/FocusMode';
import DisciplinePoints from '../components/DisciplinePoints';
import GraphCard from '../components/GraphCard';
import CalendarView from '../components/CalendarView';
import FriendStatus from '../components/FriendStatus';
import DashboardSummary from '../components/DashboardSummary';
import { TaskCardSkeleton, GoalCardSkeleton, Skeleton } from '../components/Skeleton';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

// Dashboard Home View - NEW DESIGN
export const DashboardHome = ({
  user,
  tasks,
  goals,
  habits,
  analytics,
  pendingTasks,
  completedTasks,
  activeGoals,
  activeChallenges = [],
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onUpdateGoalProgress,
  onDeleteGoal,
  onEditGoal,
  onCompleteHabit,
  onDeleteHabit,
  setIsTaskModalOpen,
  setIsGoalModalOpen,
  setEditingTask,
  setEditingGoal,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [todaysPlanExpanded, setTodaysPlanExpanded] = useState(true);

  // Get today's tasks
  const todaysTasks = useMemo(() => {
    return pendingTasks.filter(task => {
      if (!task.dueDate) return false;
      return isToday(new Date(task.dueDate));
    });
  }, [pendingTasks]);

  // Calculate today's plan progress
  const todaysPlanProgress = useMemo(() => {
    if (todaysTasks.length === 0) return 0;
    const completed = todaysTasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / todaysTasks.length) * 100);
  }, [todaysTasks]);

  // Get next task
  const nextTask = useMemo(() => {
    const sorted = [...todaysTasks]
      .filter(t => t.status !== 'completed')
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    return sorted[0];
  }, [todaysTasks]);

  // Calculate consistency percentage
  const consistencyPercentage = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    const weekTasks = tasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate >= weekStart;
    });
    const totalWeekTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= weekStart;
    });
    if (totalWeekTasks.length === 0) return 0;
    return Math.round((weekTasks.length / totalWeekTasks.length) * 100);
  }, [tasks]);

  // Get today's spend (placeholder - would come from finance API)
  const todaysSpend = 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 xl:p-10 bg-[var(--bg-primary)] min-h-screen max-w-[1920px] mx-auto">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 transition-all"
          />
        </div>
      </div>

      {/* Top Section: Today's Plan, Pending, Goals, Challenges - Improved desktop grid */}
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {/* Today's Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 lg:p-6 rounded-2xl flex-shrink-0 w-[280px] md:w-auto shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-[var(--text-primary)]">Today's Plan</h3>
            <button
              onClick={() => setTodaysPlanExpanded(!todaysPlanExpanded)}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {todaysPlanExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            </div>
          <div className="flex items-center gap-4">
            {/* Circular Progress */}
            <div className="relative w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0">
              <svg className="w-16 h-16 lg:w-20 lg:h-20 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${todaysPlanProgress * 1.76} 176`}
                  className="text-[var(--accent-primary)] transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {todaysPlanProgress === 100 ? (
                  <span className="text-white text-xl lg:text-2xl">✓</span>
                ) : (
                  <span className="text-[var(--text-primary)] text-xs lg:text-sm font-semibold">{todaysPlanProgress}%</span>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              {nextTask ? (
                <>
                  <p className="text-sm lg:text-base font-medium text-[var(--text-primary)] truncate">{nextTask.title}</p>
                  {nextTask.dueDate && (
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      {format(new Date(nextTask.dueDate), 'h:mm a')}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-[var(--text-tertiary)]">No tasks for today</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Pending Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5 lg:p-6 rounded-2xl flex-shrink-0 w-[280px] md:w-auto shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-base lg:text-lg font-semibold text-[var(--text-primary)] mb-4">Pending</h3>
            <div>
            <p className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-1">{pendingTasks.length}</p>
            <p className="text-xs text-[var(--text-tertiary)]">{format(new Date(), 'h:mm a')}</p>
          </div>
        </motion.div>

        {/* Goals Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5 lg:p-6 rounded-2xl flex-shrink-0 w-[280px] md:w-auto shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-[var(--text-primary)]">Goals</h3>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">{activeGoals.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FaBullseye className="text-green-600 dark:text-green-400 text-lg lg:text-xl" />
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">{activeGoals.length}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Active</p>
            </div>
          </div>
        </motion.div>

        {/* Challenges Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5 lg:p-6 rounded-2xl flex-shrink-0 w-[280px] md:w-auto shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/dashboard/challenges')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-[var(--text-primary)]">Challenges</h3>
            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">{activeChallenges.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 flex items-center justify-center">
              <FaTrophy className="text-yellow-600 dark:text-yellow-400 text-lg lg:text-xl" />
            </div>
            <div className="flex-1">
              <p className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">{activeChallenges.length}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Active</p>
            </div>
          </div>
          {activeChallenges.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
              <div className="space-y-2">
                {activeChallenges.slice(0, 2).map((challenge) => {
                  const progress = challenge.progress || 0;
                  const isCheckedInToday = challenge.checkIns?.some((checkIn) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const checkInDate = new Date(checkIn.date);
                    checkInDate.setHours(0, 0, 0, 0);
                    return checkInDate.getTime() === today.getTime() && checkIn.completed;
                  });
                  
                  return (
                    <div key={challenge._id} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--text-primary)] truncate">{challenge.name}</p>
                        <div className="w-full h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      {isCheckedInToday && (
                        <FaCheckCircle className="text-green-500 text-sm flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
              {activeChallenges.length > 2 && (
                <p className="text-xs text-[var(--text-tertiary)] mt-2">
                  +{activeChallenges.length - 2} more
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Middle Section */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Today's Plan List Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 card p-5 lg:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Today's Plan</h3>
            </div>
            <button className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
              <FaEllipsisV />
            </button>
          </div>
          {todaysPlanExpanded && (
            <div className="space-y-3">
              {todaysTasks.length > 0 ? (
                todaysTasks.slice(0, 3).map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => onToggleTask(task._id)}
                      className="w-5 h-5 rounded border-[var(--border-color)] text-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/30"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'}`}>
                        {task.title}
                      </p>
                      {task.dueDate && (
                        <p className="text-xs text-[var(--text-tertiary)] mt-1">
                          {format(new Date(task.dueDate), 'h:mm a')}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        task.priority === 'high'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}
                    >
                      {task.priority || 'Low'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--text-tertiary)] text-center py-4">No tasks for today</p>
              )}
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                className="w-full mt-4 py-2 px-4 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-medium transition-colors flex items-center justify-center gap-2"
                  >
                <FaPlus className="text-xs" />
                <span>Smart Task</span>
                  </button>
                </div>
              )}
        </motion.div>

        {/* Right Side: Streak and Consistency */}
        <div className="flex lg:flex-col gap-4 lg:gap-6 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-5 lg:p-6 rounded-2xl flex-shrink-0 w-[200px] lg:w-auto shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3 lg:mb-4">
              <FaFire className="text-orange-500 text-lg lg:text-xl" />
              <h3 className="text-base lg:text-lg font-semibold text-[var(--text-primary)]">Streak</h3>
            </div>
            <p className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">{user?.streak || 0} days</p>
          </motion.div>

          {/* Consistency Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-5 lg:p-6 rounded-2xl flex-shrink-0 w-[200px] lg:w-auto shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-base lg:text-lg font-semibold text-[var(--text-primary)] mb-2 lg:mb-3">Stay consistent!</h3>
            <p className="text-sm lg:text-base text-[var(--text-secondary)] mb-3 lg:mb-4">
              You've done {consistencyPercentage}% of your week's plan
            </p>
            <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2 lg:h-2.5">
              <div
                className="bg-[var(--accent-primary)] h-2 lg:h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${consistencyPercentage}%` }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Lower Middle Section: Focus Mode and Consistency */}
      <div className="flex md:grid md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {/* Focus Mode Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex-shrink-0 w-[300px] md:w-auto shadow-lg hover:shadow-xl transition-shadow"
        >
          <h3 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">Focus mode ready</h3>
          <button
            onClick={() => navigate('/dashboard/focus')}
            className="w-full py-3 lg:py-4 px-4 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium transition-all flex items-center justify-center gap-2 text-base lg:text-lg"
          >
            Start 25 min session
          </button>
        </motion.div>

        {/* Consistency Card with Lightbulb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-6 lg:p-8 rounded-2xl flex-shrink-0 w-[300px] md:w-auto shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3 lg:mb-4">
            <FaLightbulb className="text-yellow-500 text-xl lg:text-2xl" />
            <h3 className="text-lg lg:text-xl font-semibold text-[var(--text-primary)]">Stay consistent</h3>
            </div>
          <p className="text-sm lg:text-base text-[var(--text-secondary)] mb-3 lg:mb-4">
            You've done {consistencyPercentage}% of your week's plan
          </p>
          <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2 lg:h-2.5">
            <div
              className="bg-yellow-500 h-2 lg:h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${consistencyPercentage}%` }}
            />
            </div>
        </motion.div>
          </div>

      {/* Bottom Section: Today's Spend and Quick Note */}
      <div className="flex md:grid md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {/* Today's Spend Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-5 lg:p-6 rounded-2xl flex-shrink-0 w-[280px] md:w-auto shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4 lg:mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg lg:text-xl">$</span>
        </div>
              <h3 className="text-base lg:text-lg font-semibold text-[var(--text-primary)]">Today's Spend</h3>
      </div>
            <button
              onClick={() => navigate('/dashboard/finance')}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <FaPlus />
            </button>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">${todaysSpend.toFixed(2)}</p>
          <p className="text-xs lg:text-sm text-[var(--text-tertiary)] mt-2">Track your expenses</p>
        </motion.div>

        {/* Quick Note Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="card p-5 lg:p-6 rounded-2xl flex-shrink-0 w-[280px] md:w-auto shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-base lg:text-lg font-semibold text-[var(--text-primary)] mb-4 lg:mb-5">Quick Note</h3>
          <input
            type="text"
            placeholder="Add text..."
            className="w-full px-4 py-2 lg:py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 transition-all text-sm lg:text-base"
            onClick={() => navigate('/dashboard/notes')}
          />
        </motion.div>
      </div>

      {/* Analytics Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="card p-6 lg:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-semibold text-[var(--text-primary)]">Analytics</h3>
          <button
            onClick={() => navigate('/dashboard/analytics')}
            className="text-sm lg:text-base font-medium text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors"
          >
            View Full Analytics →
          </button>
        </div>
        <div>
          <h4 className="text-sm lg:text-base font-medium text-[var(--text-secondary)] mb-4 lg:mb-6">Weekly Task Completion</h4>
          {analytics?.weeklyCompletion ? (
            <GraphCard
              title=""
              data={analytics.weeklyCompletion.map((item, index) => ({
                name: item.week || `Week ${index + 1}`,
                completed: item.completed || 0,
                total: item.total || 0,
              }))}
              type="line"
              dataKey="completed"
            />
          ) : (
            <div className="h-64 lg:h-80 flex items-center justify-center">
              <p className="text-[var(--text-tertiary)] text-sm lg:text-base">No analytics data available</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Calendar View
export const DashboardCalendar = ({ tasks, goals, onDateClick, onCreateTask }) => {
  return (
    <div className="p-4 md:p-8 overflow-x-hidden">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Calendar</h1>
        <p className="text-[var(--text-secondary)]">Plan and view your tasks by date</p>
      </div>
      <CalendarView
        tasks={tasks}
        goals={goals}
        onDateClick={onDateClick}
        onCreateTask={onCreateTask}
      />
    </div>
  );
};

// Tasks View
export const DashboardTasks = ({
  tasks,
  pendingTasks,
  completedTasks,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  setIsTaskModalOpen,
  setEditingTask,
}) => {
  // Group completed tasks by date segments
  const groupedCompletedTasks = useMemo(() => {
    if (!completedTasks || completedTasks.length === 0) return {};

    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      lastWeek: [],
      older: [],
    };

    const now = new Date();
    const todayStart = startOfDay(now);
    const yesterdayStart = startOfDay(new Date(now.getTime() - 24 * 60 * 60 * 1000));
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 0 });
    const lastWeekStart = startOfWeek(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 0 });
    const lastWeekEnd = endOfWeek(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 0 });

    completedTasks.forEach((task) => {
      const taskDate = new Date(task.completedAt || task.updatedAt || task.createdAt || 0);
      const taskDateStart = startOfDay(taskDate);

      if (isToday(taskDate)) {
        groups.today.push(task);
      } else if (isYesterday(taskDate)) {
        groups.yesterday.push(task);
      } else if (taskDateStart >= thisWeekStart && taskDateStart < todayStart) {
        // This week (excluding today and yesterday which are already handled)
        groups.thisWeek.push(task);
      } else if (taskDateStart >= lastWeekStart && taskDateStart <= lastWeekEnd) {
        groups.lastWeek.push(task);
      } else {
        groups.older.push(task);
      }
    });

    return groups;
  }, [completedTasks]);

  // Group older tasks by specific dates
  const olderTasksByDate = useMemo(() => {
    if (!groupedCompletedTasks.older || groupedCompletedTasks.older.length === 0) return {};

    const dateGroups = {};
    groupedCompletedTasks.older.forEach((task) => {
      const taskDate = new Date(task.completedAt || task.updatedAt || task.createdAt || 0);
      const dateKey = format(startOfDay(taskDate), 'yyyy-MM-dd');
      const displayDate = format(startOfDay(taskDate), 'MMMM dd, yyyy');

      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = {
          date: displayDate,
          tasks: [],
        };
      }

      dateGroups[dateKey].tasks.push(task);
    });

    // Sort by date (most recent first)
    return Object.keys(dateGroups)
      .sort((a, b) => new Date(b) - new Date(a))
      .reduce((acc, key) => {
        acc[key] = dateGroups[key];
        return acc;
      }, {});
  }, [groupedCompletedTasks.older]);

  const renderDateSection = (title, tasks, icon = null) => {
    if (!tasks || tasks.length === 0) return null;

    return (
      <div key={title} className="mb-6">
        <div className="flex items-center gap-2 mb-3 px-2">
          {icon && <span className="text-[var(--accent-primary)]">{icon}</span>}
          <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
          <span className="text-sm text-[var(--text-tertiary)]">({tasks.length})</span>
        </div>
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 overflow-x-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">Tasks</h1>
          <p className="text-sm md:text-base text-[var(--text-secondary)]">Manage your daily tasks</p>
        </div>
        <button
          onClick={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus />
          <span>New Task</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Pending Tasks */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Pending ({pendingTasks.length})
          </h2>
          <div className="space-y-2">
            {pendingTasks.length > 0 ? (
              pendingTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onEdit={onEditTask}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <FaTasks className="text-5xl text-[var(--text-tertiary)] mx-auto mb-4 opacity-50" />
                <p className="text-[var(--text-secondary)] mb-2 font-medium text-lg">No pending tasks</p>
                <p className="text-sm text-[var(--text-tertiary)] mb-6">Get started by creating your first task</p>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="btn-primary"
                >
                  <FaPlus className="inline mr-2" />
                  Create Task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Completed Tasks - Grouped by Date */}
        {completedTasks.length > 0 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
              Completed ({completedTasks.length})
            </h2>
            <div className="space-y-6">
              {/* Today */}
              {renderDateSection('Today', groupedCompletedTasks.today, '📅')}

              {/* Yesterday */}
              {renderDateSection('Yesterday', groupedCompletedTasks.yesterday, '📆')}

              {/* This Week */}
              {groupedCompletedTasks.thisWeek && groupedCompletedTasks.thisWeek.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <span className="text-[var(--accent-primary)]">📊</span>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">This Week</h3>
                    <span className="text-sm text-[var(--text-tertiary)]">({groupedCompletedTasks.thisWeek.length})</span>
                  </div>
                  <div className="space-y-2">
                    {groupedCompletedTasks.thisWeek.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onToggle={onToggleTask}
                        onDelete={onDeleteTask}
                        onEdit={onEditTask}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Last Week */}
              {groupedCompletedTasks.lastWeek && groupedCompletedTasks.lastWeek.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <span className="text-[var(--accent-primary)]">📋</span>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">Last Week</h3>
                    <span className="text-sm text-[var(--text-tertiary)]">({groupedCompletedTasks.lastWeek.length})</span>
                  </div>
                  <div className="space-y-2">
                    {groupedCompletedTasks.lastWeek.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onToggle={onToggleTask}
                        onDelete={onDeleteTask}
                        onEdit={onEditTask}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Older - Grouped by specific dates */}
              {Object.keys(olderTasksByDate).length > 0 && (
                <div className="space-y-6">
                  {Object.entries(olderTasksByDate).map(([dateKey, dateGroup]) => (
                    <div key={dateKey} className="mb-6">
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <span className="text-[var(--accent-primary)]">🗓️</span>
                        <h3 className="text-base font-semibold text-[var(--text-primary)]">{dateGroup.date}</h3>
                        <span className="text-sm text-[var(--text-tertiary)]">({dateGroup.tasks.length})</span>
                      </div>
                      <div className="space-y-2">
                        {dateGroup.tasks.map((task) => (
                          <TaskCard
                            key={task._id}
                            task={task}
                            onToggle={onToggleTask}
                            onDelete={onDeleteTask}
                            onEdit={onEditTask}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Goals View
export const DashboardGoals = ({
  goals,
  onUpdateGoalProgress,
  onDeleteGoal,
  onEditGoal,
  setIsGoalModalOpen,
  setEditingGoal,
  tasks = [],
}) => {
  const [selectedGoalForAnalytics, setSelectedGoalForAnalytics] = useState(null);

  return (
    <div className="p-4 md:p-8 overflow-x-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">Goals</h1>
          <p className="text-sm md:text-base text-[var(--text-secondary)]">Track your progress and achievements</p>
        </div>
        <button
          onClick={() => {
            setEditingGoal(null);
            setIsGoalModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals List */}
        <div className="lg:col-span-2 space-y-4">
          {goals && goals.length > 0 ? (
            goals.map((goal) => (
          <GoalTracker
            key={goal._id}
            goal={goal}
            onUpdate={onUpdateGoalProgress}
            onDelete={onDeleteGoal}
            onEdit={onEditGoal}
                onViewAnalytics={() => setSelectedGoalForAnalytics(goal)}
              />
            ))
          ) : (
            <div className="card p-12 text-center">
            <FaBullseye className="text-5xl text-[var(--text-tertiary)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--text-secondary)] mb-2 font-medium text-lg">No goals yet</p>
              <p className="text-sm text-[var(--text-tertiary)] mb-6">Create your first goal to get started!</p>
            <button
              onClick={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
              className="btn-primary"
            >
              <FaPlus className="inline mr-2" />
              Create Goal
            </button>
          </div>
        )}
      </div>
      
        {/* Analytics Sidebar */}
        <div className="space-y-6">
          {selectedGoalForAnalytics ? (
            <GoalAnalytics goal={selectedGoalForAnalytics} tasks={tasks} />
          ) : (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Goal Analytics</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Select a goal to view detailed analytics and progress insights.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Analytics View
export const DashboardAnalytics = ({ analytics, tasks, goals, habits }) => {
  return (
    <div className="p-4 md:p-8 overflow-x-hidden">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Analytics</h1>
        <p className="text-[var(--text-secondary)]">Track your productivity and progress</p>
          </div>
          
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analytics?.taskCompletion && (
            <GraphCard
            title="Task Completion Over Time"
            data={analytics.taskCompletion}
              type="line"
            dataKey="completed"
            />
          )}

        {analytics?.weeklyCompletion && (
            <GraphCard
              title="Weekly Task Completion"
            data={analytics.weeklyCompletion.map((item, index) => ({
              name: item.week || `Week ${index + 1}`,
              completed: item.completed || 0,
              total: item.total || 0,
            }))}
              type="bar"
            dataKey="completed"
          />
        )}

        {analytics?.goalProgress && (
          <GraphCard
            title="Goal Progress"
            data={analytics.goalProgress}
            type="area"
            dataKey="progress"
          />
        )}

        {analytics?.habitStreak && (
          <GraphCard
            title="Habit Streak"
            data={analytics.habitStreak}
            type="line"
            dataKey="streak"
          />
        )}
      </div>
    </div>
  );
};

// Team View
export const DashboardTeam = ({ friends, friendRequests, sentFriendRequests, leaderboard }) => {
  return (
    <div className="p-4 md:p-8 overflow-x-hidden">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Team</h1>
        <p className="text-[var(--text-secondary)]">Connect with friends and compete on the leaderboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FriendStatus
          friends={friends}
          friendRequests={friendRequests}
          sentFriendRequests={sentFriendRequests}
        />

        {leaderboard && leaderboard.length > 0 && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Leaderboard</h2>
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{user.name}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{user.xp || 0} XP</p>
                      </div>
                    </div>
                  {index === 0 && <FaTrophy className="text-yellow-500" />}
                  </div>
              ))}
          </div>
        </div>
          )}
        </div>
    </div>
  );
};
