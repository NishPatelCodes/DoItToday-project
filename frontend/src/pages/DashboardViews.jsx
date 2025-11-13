import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTasks, FaBullseye, FaFire, FaUserFriends, FaChartLine, FaSearch, FaChevronUp, FaChevronDown, FaEllipsisV, FaLightbulb, FaDollarSign, FaTrophy } from 'react-icons/fa';
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
    <div className="p-4 md:p-6 lg:p-8 min-h-screen" style={{ 
      background: 'linear-gradient(to bottom, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
    }}>
      {/* Search Bar - Apple Style */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)] text-sm" />
          <input
            type="text"
            placeholder="Search tasks, goals, and more..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)]/30 transition-all duration-300 shadow-sm hover:shadow-md"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
          />
        </div>
      </div>

      {/* Top Section: Today's Plan, Pending, Goals - Apple Premium Cards */}
      <div className="flex md:grid md:grid-cols-3 gap-5 mb-8 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {/* Today's Plan Card - Premium Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative p-6 rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 w-[300px] md:w-auto group"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.5) inset',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight uppercase" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', letterSpacing: '0.05em' }}>
              Today's Plan
            </h3>
            <button
              onClick={() => setTodaysPlanExpanded(!todaysPlanExpanded)}
              className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200"
            >
              {todaysPlanExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
            </button>
          </div>
          <div className="flex items-center gap-5">
            {/* Circular Progress - Apple Style */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 72 72">
                <defs>
                  <linearGradient id="planGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <circle
                  cx="36"
                  cy="36"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-gray-100 dark:text-white/5"
                />
                <circle
                  cx="36"
                  cy="36"
                  r="32"
                  stroke="url(#planGradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${todaysPlanProgress * 2.01} 201`}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {todaysPlanProgress === 100 ? (
                  <span className="text-[var(--accent-primary)] text-2xl font-medium">✓</span>
                ) : (
                  <span className="text-[var(--text-primary)] text-sm font-semibold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
                    {todaysPlanProgress}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              {nextTask ? (
                <>
                  <p className="text-base font-semibold text-[var(--text-primary)] truncate mb-1" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
                    {nextTask.title}
                  </p>
                  {nextTask.dueDate && (
                    <p className="text-xs text-[var(--text-tertiary)] font-medium">
                      {format(new Date(nextTask.dueDate), 'h:mm a')}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-[var(--text-tertiary)] font-medium">No tasks for today</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Pending Card - Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative p-6 rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 w-[300px] md:w-auto group"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.5) inset',
          }}
        >
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-5 tracking-tight uppercase" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', letterSpacing: '0.05em' }}>
            Pending
          </h3>
          <div>
            <p className="text-4xl font-bold text-[var(--text-primary)] mb-2 tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
              {pendingTasks.length}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] font-medium">{format(new Date(), 'h:mm a')}</p>
          </div>
        </motion.div>

        {/* Goals Card - Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative p-6 rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 w-[300px] md:w-auto group"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.5) inset',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight uppercase" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', letterSpacing: '0.05em' }}>
              Goals
            </h3>
            <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold">
              {activeGoals.length}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
              <FaBullseye className="text-white text-lg" />
            </div>
            <div>
              <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-1" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
                {activeGoals.length}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] font-medium">Active</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Middle Section */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5 mb-8">
        {/* Today's Plan List Card - Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-2 relative p-6 rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.5) inset',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight uppercase" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', letterSpacing: '0.05em' }}>
                Today's Plan
              </h3>
              {!todaysPlanExpanded && (
                <button
                  onClick={() => setTodaysPlanExpanded(true)}
                  className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200"
                >
                  <FaChevronDown className="text-xs" />
                </button>
              )}
              {todaysPlanExpanded && (
                <button
                  onClick={() => setTodaysPlanExpanded(false)}
                  className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200"
                >
                  <FaChevronUp className="text-xs" />
                </button>
              )}
            </div>
            <button className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200">
              <FaEllipsisV className="text-sm" />
            </button>
          </div>
          {todaysPlanExpanded && (
            <div className="space-y-2">
              {todaysTasks.length > 0 ? (
                todaysTasks.slice(0, 3).map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 group"
                  >
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => onToggleTask(task._id)}
                      className="w-5 h-5 rounded-md border-2 border-gray-300 dark:border-gray-600 text-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/30 cursor-pointer transition-all"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${task.status === 'completed' ? 'line-through text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'}`} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
                        {task.title}
                      </p>
                      {task.dueDate && (
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5 font-medium">
                          {format(new Date(task.dueDate), 'h:mm a')}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        task.priority === 'high'
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          : task.priority === 'medium'
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {task.priority || 'Low'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--text-tertiary)] text-center py-6 font-medium">No tasks for today</p>
              )}
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[var(--text-primary)] font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
              >
                <FaPlus className="text-xs" />
                <span>Smart Task</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Right Side: Streak and Consistency */}
        <div className="flex lg:flex-col gap-5 lg:space-y-5 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          {/* Streak Card - Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative p-6 rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 w-[240px] lg:w-auto"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.5) inset',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <FaFire className="text-white text-sm" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight uppercase" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', letterSpacing: '0.05em' }}>
                Streak
              </h3>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
              {user?.streak || 0} <span className="text-lg font-semibold text-[var(--text-tertiary)]">days</span>
            </p>
          </motion.div>

          {/* Consistency Card - Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative p-6 rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 w-[240px] lg:w-auto"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.5) inset',
            }}
          >
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
              Stay consistent!
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4 font-medium">
              You've done {consistencyPercentage}% of your week's plan
            </p>
            <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[var(--accent-primary)] to-purple-500 h-2.5 rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${consistencyPercentage}%` }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Lower Middle Section: Focus Mode and Consistency */}
      <div className="flex md:grid md:grid-cols-2 gap-5 mb-8 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {/* Focus Mode Card - Premium Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative p-7 rounded-3xl bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 text-white flex-shrink-0 w-[320px] md:w-auto overflow-hidden shadow-2xl shadow-purple-500/30"
        >
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-5 tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
              Focus mode ready
            </h3>
            <button
              onClick={() => navigate('/dashboard/focus')}
              className="w-full py-3.5 px-5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
            >
              Start 25 min session
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
        </motion.div>

        {/* Consistency Card with Lightbulb - Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative p-7 rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 w-[320px] md:w-auto"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.5) inset',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <FaLightbulb className="text-white text-lg" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
              Stay consistent
            </h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-4 font-medium">
            You've done {consistencyPercentage}% of your week's plan
          </p>
          <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${consistencyPercentage}%` }}
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom Section: Today's Spend and Quick Note */}
      <div className="flex md:grid md:grid-cols-2 gap-5 mb-8 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {/* Today's Spend Card - Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative p-6 rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 w-[300px] md:w-auto"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.5) inset',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FaDollarSign className="text-white text-lg" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight uppercase" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', letterSpacing: '0.05em' }}>
                Today's Spend
              </h3>
            </div>
            <button
              onClick={() => navigate('/dashboard/finance')}
              className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200"
            >
              <FaPlus className="text-sm" />
            </button>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)] mb-2 tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
            ${todaysSpend.toFixed(2)}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] font-medium">Track your expenses</p>
        </motion.div>

        {/* Quick Note Card - Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative p-6 rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 w-[300px] md:w-auto"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.5) inset',
          }}
        >
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-5 tracking-tight uppercase" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', letterSpacing: '0.05em' }}>
            Quick Note
          </h3>
          <input
            type="text"
            placeholder="Add text..."
            className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/10 border border-white/20 dark:border-white/10 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)]/30 transition-all duration-300 shadow-sm hover:shadow-md"
            onClick={() => navigate('/dashboard/notes')}
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
          />
        </motion.div>
      </div>

      {/* Analytics Card - Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative p-7 rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.5) inset',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
            Analytics
          </h3>
          <button
            onClick={() => navigate('/dashboard/analytics')}
            className="text-sm font-semibold text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--accent-primary)]/10"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
          >
            View Full →
          </button>
        </div>
        <div>
          <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Weekly Task Completion</h4>
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
            <div className="h-64 flex items-center justify-center">
              <p className="text-[var(--text-tertiary)] text-sm">No analytics data available</p>
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
