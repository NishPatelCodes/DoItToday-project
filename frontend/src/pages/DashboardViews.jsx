import React, { useState, useMemo, useEffect, useCallback, useRef, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus,
  FaTasks,
  FaBullseye,
  FaFire,
  FaUserFriends,
  FaChartLine,
  FaSearch,
  FaEllipsisV,
  FaLightbulb,
  FaDollarSign,
  FaTrophy,
  FaFlag,
  FaCheckCircle,
  FaCheck,
  FaUser,
  FaStickyNote,
  FaCopy,
  FaTimes,
  FaMagic,
  FaCheckSquare,
  FaSquare,
  FaColumns,
  FaList,
  FaClock,
  FaArrowRight,
} from 'react-icons/fa';
import { EmptyTasksIllustration, EmptyGoalsIllustration, NoSearchResultsIllustration, WelcomeIllustration, EmptyFriendsIllustration, EmptyChallengesIllustration, CatWorkingIllustration, SquirrelChecklistIllustration, FoxReadingIllustration } from '../components/Illustrations';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { financeAPI } from '../services/api';
import { formatCurrency } from '../utils/currencyFormatter';
import { format, isToday, isYesterday, startOfWeek, endOfWeek, isSameDay, startOfDay, differenceInDays, subDays, getDay, addDays } from 'date-fns';
import TaskCard from '../components/TaskCard';
import GoalTracker from '../components/GoalTracker';
import HabitCard from '../components/HabitCard';
import DisciplinePoints from '../components/DisciplinePoints';
import FriendStatus from '../components/FriendStatus';
import DashboardSummary from '../components/DashboardSummary';
import MultipleTasksModal from '../components/MultipleTasksModal';
import ConfirmationModal from '../components/ConfirmationModal';
import TaskSearchFilter from '../components/TaskSearchFilter';
import TaskFAB from '../components/TaskFAB';
import TaskAlerts from '../components/TaskAlerts';
import CompletedTasksSection from '../components/CompletedTasksSection';
import { TaskCardSkeleton, GoalCardSkeleton, Skeleton } from '../components/Skeleton';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LazyWrapper } from '../components/lazy/LazyWrapper';
import { Suspense } from 'react';

// Lazy load heavy components
const GoalAnalytics = lazy(() => import('../components/GoalAnalytics'));
const SmartPlanner = lazy(() => import('../components/SmartPlanner'));
const TaskKanbanBoard = lazy(() => import('../components/TaskKanbanBoard'));
const AnalyticsDashboard = lazy(() => import('../components/AnalyticsDashboard'));
import ErrorBoundary from '../components/ErrorBoundary';
import GoalMilestoneGuide from '../components/GoalMilestoneGuide';
import NotionTimelineCalendar from '../components/NotionTimelineCalendar';

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
  const [showMenu, setShowMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Close menu and search on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.menu-container')) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);


  // Filter search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { tasks: [], goals: [] };
    const query = searchQuery.toLowerCase();
    return {
      tasks: tasks.filter(t => 
        t.title?.toLowerCase().includes(query) || 
        t.description?.toLowerCase().includes(query)
      ).slice(0, 5),
      goals: goals.filter(g => 
        g.title?.toLowerCase().includes(query) || 
        g.description?.toLowerCase().includes(query)
      ).slice(0, 5),
    };
  }, [searchQuery, tasks, goals]);

  // Get yesterday's tasks for "Same as yesterday" feature
  const yesterdaysTasks = useMemo(() => {
    const yesterday = subDays(new Date(), 1);
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, yesterday) && task.status === 'completed';
    });
  }, [tasks]);

  // Get today's tasks (ALL tasks for today, both pending and completed)
  const todaysTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return isToday(new Date(task.dueDate));
    });
  }, [tasks]);

  // Calculate today's plan progress
  const todaysPlanProgress = useMemo(() => {
    if (todaysTasks.length === 0) return 0;
    const completed = todaysTasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / todaysTasks.length) * 100);
  }, [todaysTasks]);

  // Get sorted today's tasks (pending first, completed last)
  const sortedTodaysTasks = useMemo(() => {
    const pending = todaysTasks
      .filter(t => t.status !== 'completed')
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    const completed = todaysTasks
      .filter(t => t.status === 'completed')
      .sort((a, b) => {
        // Most recently completed first
        const dateA = new Date(a.completedAt || a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.completedAt || b.updatedAt || b.createdAt || 0);
        return dateB - dateA;
      });
    return [...pending, ...completed];
  }, [todaysTasks]);

  // Get next task
  const nextTask = useMemo(() => {
    return sortedTodaysTasks.find(t => t.status !== 'completed') || null;
  }, [sortedTodaysTasks]);

  // Calculate consistency percentage with guardrails
  const consistencyPercentage = useMemo(() => {
    if (!Array.isArray(tasks) || tasks.length === 0) return 0;
    const today = new Date();
    const weekStartDate = startOfWeek(today, { weekStartsOn: 0 });
    const weekEndDate = endOfWeek(today, { weekStartsOn: 0 });
    const scheduledThisWeek = tasks.filter((task) => {
      if (!task?.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= weekStartDate && dueDate <= weekEndDate;
    });
    if (scheduledThisWeek.length === 0) return 0;
    const completedThisWeek = scheduledThisWeek.filter((task) => task.status === 'completed');
    const percentage = Math.round((completedThisWeek.length / scheduledThisWeek.length) * 100);
    return Math.min(100, Math.max(0, percentage));
  }, [tasks]);

  // Get today's spend (placeholder - would come from finance API)
  const todaysSpend = 0;

  // Get tomorrow's tasks
  const tomorrowsTasks = useMemo(() => {
    const tomorrow = addDays(new Date(), 1);
    return tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, tomorrow);
    }).slice(0, 3);
  }, [tasks]);

  // Get categories/tags overview
  const categoriesOverview = useMemo(() => {
    const categoryCounts = {};
    const defaultCategories = ['Work', 'Health', 'Personal', 'Study'];
    
    // Count tasks by category
    tasks.forEach(task => {
      // Try to get category from task, or infer from title/description
      let category = task.category;
      
      if (!category) {
        // Simple keyword-based category detection
        const titleLower = (task.title || '').toLowerCase();
        const descLower = (task.description || '').toLowerCase();
        const combined = `${titleLower} ${descLower}`;
        
        if (combined.includes('work') || combined.includes('meeting') || combined.includes('project') || combined.includes('office')) {
          category = 'Work';
        } else if (combined.includes('gym') || combined.includes('workout') || combined.includes('exercise') || combined.includes('health') || combined.includes('fitness')) {
          category = 'Health';
        } else if (combined.includes('study') || combined.includes('assignment') || combined.includes('homework') || combined.includes('exam') || combined.includes('learn')) {
          category = 'Study';
        } else {
          category = 'Personal';
        }
      }
      
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    // Show categories with tasks, prioritizing default categories
    const result = [];
    defaultCategories.forEach(cat => {
      if (categoryCounts[cat] > 0) {
        result.push({ name: cat, count: categoryCounts[cat] });
      }
    });
    
    // Add any other categories that have tasks
    Object.entries(categoryCounts).forEach(([name, count]) => {
      if (!defaultCategories.includes(name) && count > 0) {
        result.push({ name, count });
      }
    });

    return result.sort((a, b) => b.count - a.count);
  }, [tasks]);

  // Productivity and expense data
  const [productivityData, setProductivityData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [expenseLoading, setExpenseLoading] = useState(false);

  useEffect(() => {
    // Build productivity trend from analytics
    if (analytics?.dailyProductivity && analytics.dailyProductivity.length > 0) {
      const trend = analytics.dailyProductivity.slice(-7).map((entry) => ({
        date: format(new Date(entry.date), 'MMM d'),
        productivity: entry.productivity ?? 0,
        completed: entry.completed ?? 0,
      }));
      setProductivityData(trend);
    }

    // Load expense data
    const loadExpenseData = async () => {
      try {
        setExpenseLoading(true);
        const response = await financeAPI.getAll();
        const transactions = response.data?.transactions || [];
        const currency = response.data?.accountInfo?.currency || 'USD';
        
        // Get last 7 days of expenses
        const now = new Date();
        const expenseTrend = Array.from({ length: 7 }).map((_, index) => {
          const date = subDays(now, 6 - index);
          const dayExpenses = transactions
            .filter(txn => 
              txn.type === 'expense' &&
              txn.date &&
              isSameDay(new Date(txn.date), date)
            )
            .reduce((sum, txn) => sum + (txn.amount || 0), 0);
          
          return {
            date: format(date, 'MMM d'),
            amount: Number(dayExpenses.toFixed(2)),
          };
        });
        
        setExpenseData(expenseTrend);
      } catch (error) {
        console.error('Error loading expense data:', error);
        setExpenseData([]);
      } finally {
        setExpenseLoading(false);
      }
    };

    loadExpenseData();
  }, [analytics]);

  // Motivation tips array
  const motivationTips = [
    "Small steps lead to big achievements. Keep going! 💪",
    "Progress, not perfection. Every task completed is a win! 🎯",
    "Your consistency is building something amazing. Stay focused! ✨",
    "Today's effort is tomorrow's success. You've got this! 🚀",
    "Remember: Done is better than perfect. Keep moving forward! ⚡"
  ];
  const dailyTip = motivationTips[new Date().getDate() % motivationTips.length];

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen max-w-[1920px] mx-auto overflow-x-hidden">
      {/* Sticky Top Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-lg border-b border-[var(--border-color)] px-4 md:px-6 py-3 shadow-sm"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Date */}
          <div className="text-sm md:text-base font-medium text-[var(--text-primary)]">
            {format(new Date(), 'EEEE, MMMM d')}
          </div>
          
      {/* Search Bar */}
          <div className="flex-1 max-w-md relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)] text-sm" />
          <input
            type="text"
              placeholder="Search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(e.target.value.trim().length > 0);
            }}
            onFocus={() => setShowSearchResults(searchQuery.trim().length > 0)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
                <FaTimes className="text-xs" />
            </button>
          )}
        </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary)]/90 transition-all flex items-center gap-1.5"
            >
              <FaPlus className="text-xs" />
              <span className="hidden sm:inline">Task</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
              aria-label="Add Goal"
            >
              <FaBullseye className="text-sm" />
            </motion.button>
          </div>
        </div>
      </motion.div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
        {showSearchResults && searchQuery.trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            className="fixed top-[73px] left-1/2 transform -translate-x-1/2 w-full max-w-md mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto"
            >
              {searchResults.tasks.length > 0 || searchResults.goals.length > 0 ? (
                <>
              {searchResults.tasks.length > 0 && (
                <div className="p-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-[var(--text-secondary)]">
                    <FaTasks />
                    Tasks ({searchResults.tasks.length})
                  </div>
                  <div className="space-y-2">
                    {searchResults.tasks.map(task => (
                      <div
                        key={task._id}
                        onClick={() => {
                          navigate('/dashboard/tasks', { state: { highlightTaskId: task._id } });
                          setSearchQuery('');
                          setShowSearchResults(false);
                        }}
                        className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] cursor-pointer"
                      >
                        <p className="text-sm font-medium text-[var(--text-primary)]">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-1">{task.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {searchResults.goals.length > 0 && (
                <div className="p-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-[var(--text-secondary)]">
                    <FaBullseye />
                    Goals ({searchResults.goals.length})
                  </div>
                  <div className="space-y-2">
                    {searchResults.goals.map(goal => (
                      <div
                        key={goal._id}
                        onClick={() => {
                          navigate('/dashboard/tasks', { state: { highlightGoalId: goal._id } });
                          setSearchQuery('');
                          setShowSearchResults(false);
                        }}
                        className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] cursor-pointer"
                      >
                        <p className="text-sm font-medium text-[var(--text-primary)]">{goal.title}</p>
                        {goal.description && (
                          <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-1">{goal.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
                </>
              ) : (
                <div className="p-8 text-center">
                  <NoSearchResultsIllustration className="w-32 h-32 mx-auto mb-4" />
                  <p className="text-[var(--text-secondary)] font-medium mb-2">No results found</p>
                  <p className="text-sm text-[var(--text-tertiary)]">Try searching with different keywords</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      {/* Main Dashboard Content */}
      <div className="p-4 md:p-6 space-y-4">
        {/* Top Row: Today's Progress, Pending, Goals, Challenges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Today's Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ 
              delay: 0, 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              mass: 0.5
            }}
            className="relative overflow-hidden rounded-2xl p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] backdrop-blur-sm transition-all duration-200 ease-out hover:shadow-lg"
          style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
            }}
          >
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Today's Progress</h3>
            <div className="mb-3">
              <div className="flex items-baseline gap-2 mb-2">
                <FaClock className="text-purple-500 text-base" />
                <span className="text-3xl font-bold text-[var(--text-primary)]">{todaysPlanProgress}%</span>
          </div>
              </div>
            {nextTask ? (
              <div className="pt-3 border-t border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)] mb-1">Next task</p>
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{nextTask.title}</p>
                  {nextTask.dueDate && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">{format(new Date(nextTask.dueDate), 'h:mm a')}</p>
                  )}
              </div>
            ) : (
              <div className="pt-2">
                <CatWorkingIllustration className="w-16 h-16 mx-auto opacity-40" />
          </div>
            )}
        </motion.div>

        {/* Pending Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ 
              delay: 0.1, 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              mass: 0.5
            }}
            className="relative overflow-hidden rounded-2xl p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] backdrop-blur-sm transition-all duration-200 ease-out hover:shadow-lg"
          style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
            }}
          >
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Pending</h3>
            <div className="mb-3">
              <p className="text-4xl font-bold text-[var(--text-primary)] mb-1">{pendingTasks.length}</p>
              <p className="text-xs text-[var(--text-tertiary)]">{format(new Date(), 'h:mm a')}</p>
          </div>
            {pendingTasks.length > 0 ? (
              <div className="pt-3 border-t border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)] mb-2">Upcoming Tasks</p>
                <div className="space-y-1.5">
                {pendingTasks.slice(0, 2).map(task => (
                  <div key={task._id} className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></div>
                      <p className="text-xs text-[var(--text-primary)] truncate flex-1">{task.title}</p>
                    {task.dueDate && (
                        <span className="text-[10px] text-[var(--text-tertiary)] flex-shrink-0 whitespace-nowrap">
                          {format(new Date(task.dueDate), 'h:mm a')}
                      </span>
                    )}
                  </div>
                ))}
                {pendingTasks.length > 2 && (
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1">+{pendingTasks.length - 2} more</p>
                )}
              </div>
            </div>
            ) : (
              <SquirrelChecklistIllustration className="w-16 h-16 mx-auto opacity-40" />
          )}
        </motion.div>

        {/* Goals Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ 
              delay: 0.2, 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              mass: 0.5
            }}
            className="relative overflow-hidden rounded-2xl p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] backdrop-blur-sm transition-all duration-200 ease-out hover:shadow-lg"
          style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Goals</h3>
              <FaBullseye className="text-green-500 text-sm" />
          </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <FaBullseye className="text-green-500 text-base" />
            </div>
              <div>
                <p className="text-3xl font-bold text-[var(--text-primary)]">{activeGoals.length}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Active</p>
            </div>
          </div>
            {activeGoals.length > 0 ? (
              <div className="pt-3 border-t border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)] mb-2">Active</p>
                {activeGoals.slice(0, 1).map(goal => {
                  const progress = goal.progress || 0;
                  return (
                    <div key={goal._id} className="space-y-1.5">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{goal.title}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                        </div>
                        <span className="text-xs text-[var(--text-primary)] font-medium">{progress}</span>
                      </div>
                    </div>
                  );
                })}
                {activeGoals.length > 1 && (
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-2">+{activeGoals.length - 1} more</p>
                )}
              </div>
            ) : (
              <div className="pt-2">
                <EmptyGoalsIllustration className="w-16 h-16 mx-auto opacity-40" />
            </div>
          )}
        </motion.div>

        {/* Challenges Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ 
              delay: 0.3, 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              mass: 0.5
            }}
            className="relative overflow-hidden rounded-2xl p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] backdrop-blur-sm transition-all duration-200 ease-out hover:shadow-lg cursor-pointer"
          onClick={() => navigate('/dashboard/tasks?tab=challenges')}
          style={{
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Challenges</h3>
              <FaEllipsisV className="text-[var(--text-tertiary)] text-xs" />
          </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <FaTrophy className="text-yellow-500 text-base" />
            </div>
              <div>
                <p className="text-3xl font-bold text-[var(--text-primary)]">{activeChallenges.length}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Active</p>
            </div>
          </div>
            {activeChallenges.length === 0 && (
              <div className="pt-2">
                <EmptyChallengesIllustration className="w-16 h-16 mx-auto opacity-40" />
                        </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/dashboard/tasks?tab=challenges');
              }}
              className="w-full mt-3 py-2 px-3 text-xs font-medium rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-colors flex items-center justify-center gap-1.5"
            >
              <FaPlus className="text-xs" />
              <span>Smart Task</span>
            </button>
        </motion.div>
      </div>

        {/* Middle Section: Today's Plan, Streak, Motivation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
          {/* Today's Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            transition={{ 
              delay: 0.4, 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              mass: 0.5
            }}
            className="lg:col-span-2 rounded-2xl p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] backdrop-blur-sm transition-all duration-200 ease-out hover:shadow-lg overflow-visible"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Today's Plan</h3>
            <div className="relative menu-container z-10">
                <button
                onClick={() => setShowMenu(!showMenu)}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1"
                >
                  <FaEllipsisV className="text-xs" />
                </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 25,
                      mass: 0.5
                    }}
                    className="absolute right-0 top-full mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg z-50 min-w-[180px]"
                    style={{ transformOrigin: 'top right' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        if (yesterdaysTasks.length > 0) {
                          // Create first task from yesterday as template
                          const firstTask = yesterdaysTasks[0];
                          const newTask = {
                            title: firstTask.title,
                            description: firstTask.description,
                            priority: firstTask.priority || 'medium',
                            dueDate: new Date().toISOString(),
                            status: 'pending',
                          };
                          setEditingTask(newTask);
                          setIsTaskModalOpen(true);
                          // Note: User can repeat this for other tasks
                        }
                        setShowMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                        yesterdaysTasks.length > 0
                          ? 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                          : 'text-[var(--text-tertiary)] cursor-not-allowed opacity-50'
                      }`}
                      disabled={yesterdaysTasks.length === 0}
                      title={yesterdaysTasks.length > 0 ? `Copy ${yesterdaysTasks.length} task(s) from yesterday` : 'No completed tasks from yesterday'}
                    >
                      <FaCopy />
                      Same as Yesterday
                      {yesterdaysTasks.length > 0 && (
                        <span className="ml-auto text-xs text-[var(--text-tertiary)]">({yesterdaysTasks.length})</span>
                      )}
                    </button>
                <button
                      onClick={() => {
                        navigate('/dashboard/tasks');
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2"
                    >
                      <FaTasks />
                      View All Tasks
                </button>
                  </motion.div>
              )}
              </AnimatePresence>
            </div>
          </div>
          {todaysPlanExpanded && (
              <div className="space-y-2">
              {sortedTodaysTasks.filter(t => t.status !== 'completed').length > 0 ? (
                sortedTodaysTasks
                  .filter(t => t.status !== 'completed')
                    .slice(0, 3)
                  .map((task) => (
                    <motion.div
                    key={task._id}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer group"
                      onClick={() => onEditTask && onEditTask(task)}
                  >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTask(task._id);
                        }}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                          task.status === 'completed'
                            ? 'bg-purple-500 border-purple-500 text-white'
                            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-transparent hover:border-purple-500/50 hover:bg-[var(--bg-tertiary)]'
                        }`}
                        aria-label={task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {task.status === 'completed' && (
                          <FaCheck className="w-3 h-3 text-white" />
                        )}
                      </button>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{task.title}</p>
                      {task.dueDate && (
                          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{format(new Date(task.dueDate), 'h:mm a')}</p>
                      )}
                    </div>
                      <FaArrowRight className="text-[var(--text-tertiary)] text-xs" />
                    </motion.div>
                ))
              ) : (
                  <div className="text-center py-4">
                    <EmptyTasksIllustration className="w-24 h-24 mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-[var(--text-tertiary)]">No pending tasks for today</p>
                  </div>
                )}
            </div>
          )}
            
            {/* Stay Consistent Section */}
            <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Stay consistent!</p>
              <p className="text-xs text-[var(--text-secondary)] mb-2">You've done {consistencyPercentage}% of your week's plan</p>
            </div>
          </motion.div>

          {/* Right Side: Streak */}
          <div className="flex flex-col gap-3 md:gap-4">
            {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ 
                delay: 0.5, 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                mass: 0.5
              }}
              className="rounded-2xl p-5 md:p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] backdrop-blur-sm transition-all duration-200 ease-out hover:shadow-lg"
            style={{
                background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)',
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <FaFire className="text-orange-500 text-base" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Streak</h3>
            </div>
              <p className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">{user?.streak || 0} days</p>
            </motion.div>

            {/* Today's Spend Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ 
                delay: 0.6, 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                mass: 0.5
              }}
              className="rounded-2xl p-5 md:p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] backdrop-blur-sm transition-all duration-200 ease-out hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.12) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-base">$</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Today's Spend</h3>
                </div>
                <button
                  onClick={() => navigate('/dashboard/finance')}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <FaPlus className="text-xs" />
                </button>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">${todaysSpend.toFixed(2)}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-2">Track your expenses</p>
            </motion.div>
          </div>
        </div>

      {/* Tomorrow's Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 md:gap-4">
        {/* Tomorrow's Tasks */}
        {tomorrowsTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.3 }}
            className="rounded-2xl p-4 md:p-6 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-indigo-500/10 border border-[var(--border-color)] backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-[var(--text-primary)]">Tomorrow's Tasks</h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1">
                  {tomorrowsTasks.length} task{tomorrowsTasks.length !== 1 ? 's' : ''} scheduled
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <FaClock className="text-purple-500 text-lg" />
              </div>
            </div>
            <div className="space-y-3">
              {tomorrowsTasks.map((task, index) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + index * 0.1, duration: 0.3 }}
                  onClick={() => onEditTask && onEditTask(task)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-500"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1 truncate">{task.description}</p>
                    )}
                  </div>
                  <FaArrowRight className="text-[var(--text-tertiary)] text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Productivity and Expense Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.3 }}
        className="rounded-2xl p-4 md:p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] backdrop-blur-sm"
      >
        <h3 className="text-base md:text-lg font-semibold text-[var(--text-primary)] mb-4">Productivity & Expenses</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Productivity Chart */}
          <div>
            <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Productivity Trend (7 days)</h4>
            {productivityData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.4} />
                    <XAxis
                      dataKey="date"
                      stroke="var(--text-tertiary)"
                      tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="var(--text-tertiary)"
                      domain={[0, 100]}
                      tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        color: 'var(--text-primary)',
                      }}
                      formatter={(value) => [`${value}%`, 'Productivity']}
                    />
                    <Line
                      type="monotone"
                      dataKey="productivity"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, stroke: '#8b5cf6', fill: '#8b5cf6' }}
                      activeDot={{ r: 6, stroke: '#8b5cf6', fill: '#8b5cf6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-[var(--text-tertiary)] text-sm">
                <p>No productivity data available</p>
              </div>
            )}
          </div>

          {/* Expense Chart */}
          <div>
            <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Daily Expenses (7 days)</h4>
            {expenseLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent-primary)] border-t-transparent"></div>
              </div>
            ) : expenseData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.4} />
                    <XAxis
                      dataKey="date"
                      stroke="var(--text-tertiary)"
                      tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="var(--text-tertiary)"
                      tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        color: 'var(--text-primary)',
                      }}
                      formatter={(value) => [formatCurrency(value || 0, 'USD', { maximumFractionDigits: 2 }), 'Expense']}
                    />
                    <Bar dataKey="amount" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-[var(--text-tertiary)] text-sm">
                <p>No expense data available</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

// Calendar View - Notion-style Timeline
export const DashboardCalendar = ({ tasks, goals, onDateClick, onCreateTask, onToggleTask, onDeleteTask, onEditTask, hideHeader = false }) => {
  return (
    <div className={hideHeader ? "h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] overflow-hidden" : "h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] overflow-hidden"}>
      <NotionTimelineCalendar
        tasks={tasks}
        goals={goals}
        onDateClick={onDateClick}
        onCreateTask={onCreateTask}
        onTaskToggle={onToggleTask}
        onTaskDelete={onDeleteTask}
        onTaskEdit={onEditTask}
      />
    </div>
  );
};

// Tasks View - REDESIGNED with Tabs
export const DashboardTasks = ({
  tasks,
  pendingTasks,
  completedTasks,
  goals = [],
  activeChallenges = [],
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onUpdateGoalProgress,
  onDeleteGoal,
  onEditGoal,
  setIsTaskModalOpen,
  setIsGoalModalOpen,
  setEditingTask,
  setEditingGoal,
  onCreateMultipleTasks,
  onBulkCompleteTasks,
  onBulkDeleteTasks,
  onCreateTask,
  user,
}) => {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'goals', 'challenges', 'calendar'
  const [isMultipleTasksModalOpen, setIsMultipleTasksModalOpen] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [showCompleted, setShowCompleted] = useState(false);
  const [dateFilter, setDateFilter] = useState('today'); // 'today', 'past3', 'past5', 'past7', 'all'

  // Apply date filter to tasks
  const dateFilteredTasks = useMemo(() => {
    if (dateFilter === 'all') {
      return tasks;
    }
    
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today
    
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    // Determine start date based on filter (all periods include today)
    if (dateFilter === 'today') {
      // Today only
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else if (dateFilter === 'past3') {
      // Past 3 days (including today = today + 2 days ago)
      startDate.setDate(startDate.getDate() - 2);
    } else if (dateFilter === 'past5') {
      // Past 5 days (including today = today + 4 days ago)
      startDate.setDate(startDate.getDate() - 4);
    } else if (dateFilter === 'past7') {
      // Past 7 days / week (including today = today + 6 days ago)
      startDate.setDate(startDate.getDate() - 6);
    }
    
    return tasks.filter(task => {
      if (task.status === 'completed') {
        const completedDate = new Date(task.completedAt || task.updatedAt || task.createdAt);
        completedDate.setHours(0, 0, 0, 0);
        return completedDate >= startDate && completedDate <= now;
      } else {
        // For pending tasks, check due date
        if (!task.dueDate) {
          // Tasks without due date are shown only if viewing "all"
          return dateFilter === 'all';
        }
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= startDate && dueDate <= now;
      }
    });
  }, [tasks, dateFilter]);
  
  // Update filtered tasks when date filter changes (search filter will further refine)
  useEffect(() => {
    setFilteredTasks(dateFilteredTasks);
  }, [dateFilteredTasks]);

  // Handle task move (for drag-and-drop reordering)
  const handleTaskMove = useCallback((taskId, targetId) => {
    // This would typically update task order or status
    // For now, we'll just log it - you can extend this to update the backend
    console.log('Task moved:', taskId, 'to', targetId);
  }, []);

  // Group completed tasks by date segments (keeping old logic for backward compatibility)
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

  // Get pending tasks from filtered results
  const pendingFilteredTasks = useMemo(() => {
    return filteredTasks.filter(t => t.status !== 'completed');
  }, [filteredTasks]);

  return (
    <div className="p-4 md:p-6 lg:p-8 overflow-x-hidden relative min-h-screen pb-24 space-y-4 md:space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 md:mb-6 lg:mb-8"
      >
        <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-1 md:mb-2">
          {activeTab === 'tasks' ? 'Tasks' : 'Calendar'}
        </h1>
        <p className="text-sm md:text-base text-[var(--text-secondary)]">
          {activeTab === 'tasks' ? 'Manage your daily tasks with ease' : 'View your schedule and timeline'}
        </p>
      </motion.div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="flex-1 min-w-0">
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'tasks' && (
            /* View Mode Toggle */
            <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                aria-label="Kanban view"
                aria-pressed={viewMode === 'kanban'}
              >
                <FaColumns />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'list'
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
              >
                <FaList />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-[var(--border-color)]">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'calendar' && (
        <DashboardCalendar
          tasks={tasks}
          goals={goals}
          onDateClick={() => {}}
          onCreateTask={onCreateTask || (() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          })}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
          onEditTask={onEditTask}
          hideHeader={true}
        />
      )}

      {activeTab === 'tasks' && (
        <>

      {/* Search and Filter Bar */}
      <TaskSearchFilter
        tasks={dateFilteredTasks}
        onFilterChange={setFilteredTasks}
        className="mb-6"
      />


      {/* Task Alerts (Overdue, Due Today, Due Tomorrow) */}
      <TaskAlerts
        tasks={filteredTasks}
        onToggle={onToggleTask}
        onDelete={onDeleteTask}
        onEdit={onEditTask}
        className="mb-6"
      />

      {/* Main Task Board/List */}
      <div className="rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-md md:shadow-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-6">
          <div className="flex items-center gap-3 md:gap-4">
            <h2 className="text-base md:text-lg font-semibold text-[var(--text-primary)]">
              {viewMode === 'kanban' ? 'Productivity Board' : 'Task List'}
            </h2>
            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 text-sm"
                aria-label="Filter by date"
              >
                <option value="today">Today</option>
                <option value="past3">Past 3 Days</option>
                <option value="past5">Past 5 Days</option>
                <option value="past7">Past Week</option>
                <option value="all">All Tasks</option>
              </select>
            </div>
          </div>
          {pendingFilteredTasks.length > 0 && (
            <div className="flex items-center gap-3">
              {isSelectMode && (
                <div className="flex items-center gap-2">
                  {selectedTasks.size > 0 && (
                    <>
                      <span className="text-sm text-[var(--text-secondary)]">
                        {selectedTasks.size} selected
                      </span>
                      <button
                        onClick={async () => {
                          if (onBulkCompleteTasks) {
                            await onBulkCompleteTasks(Array.from(selectedTasks));
                          }
                          setSelectedTasks(new Set());
                          setIsSelectMode(false);
                        }}
                        className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <FaCheckCircle />
                        Complete ({selectedTasks.size})
        </button>
                      <button
                        onClick={() => setShowBulkDeleteConfirm(true)}
                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <FaTimes />
                        Delete ({selectedTasks.size})
                      </button>
                    </>
                  )}
                  {selectedTasks.size === 0 && (
                    <button
                      onClick={() => {
                        const allTaskIds = new Set(pendingFilteredTasks.map(task => task._id));
                        setSelectedTasks(allTaskIds);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-sm font-medium transition-colors"
                    >
                      Select All
                    </button>
                  )}
                  {selectedTasks.size === pendingFilteredTasks.length && selectedTasks.size > 0 && (
                    <button
                      onClick={() => {
                        setSelectedTasks(new Set());
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-sm font-medium transition-colors"
                    >
                      Deselect All
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={() => {
                  setIsSelectMode(!isSelectMode);
                  if (isSelectMode) {
                    setSelectedTasks(new Set());
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSelectMode
                    ? 'bg-[var(--accent-primary)] text-white hover:opacity-90'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-color)]'
                }`}
              >
                {isSelectMode ? 'Cancel' : 'Select'}
              </button>
            </div>
          )}
      </div>

        {/* Task Board/List */}
        {pendingFilteredTasks.length > 0 || filteredTasks.filter(t => t.status === 'completed').length > 0 ? (
          <TaskKanbanBoard
            tasks={filteredTasks}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onEdit={onEditTask}
            onTaskMove={handleTaskMove}
            isSelectMode={isSelectMode}
            selectedTasks={selectedTasks}
            onSelect={(taskId) => {
              const newSelected = new Set(selectedTasks);
              if (newSelected.has(taskId)) {
                newSelected.delete(taskId);
              } else {
                newSelected.add(taskId);
              }
              setSelectedTasks(newSelected);
            }}
            viewMode={viewMode}
          />
            ) : (
              <div className="text-center py-12">
                <EmptyTasksIllustration />
            <p className="text-[var(--text-secondary)] mb-2 font-medium text-lg">No tasks found</p>
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

      {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
        <CompletedTasksSection
          tasks={completedTasks}
                        onToggle={onToggleTask}
                        onDelete={onDeleteTask}
                        onEdit={onEditTask}
          className="mb-6"
        />
      )}

      {/* FAB Button */}
      <TaskFAB
        onAddTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onAddMultipleTasks={() => setIsMultipleTasksModalOpen(true)}
      />

      {/* Multiple Tasks Modal */}
      <MultipleTasksModal
        isOpen={isMultipleTasksModalOpen}
        onClose={() => setIsMultipleTasksModalOpen(false)}
        onGenerateTasks={onCreateMultipleTasks}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={async () => {
          if (onBulkDeleteTasks) {
            await onBulkDeleteTasks(Array.from(selectedTasks));
          }
          setSelectedTasks(new Set());
          setIsSelectMode(false);
          setShowBulkDeleteConfirm(false);
        }}
        title="Delete Multiple Tasks"
        message={`Are you sure you want to delete ${selectedTasks.size} task${selectedTasks.size !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
        </>
      )}
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
  hideHeader = false,
}) => {
  const [selectedGoalForAnalytics, setSelectedGoalForAnalytics] = useState(null);

  return (
    <div className={hideHeader ? "overflow-x-hidden" : "p-4 md:p-6 lg:p-8 overflow-x-hidden space-y-4 md:space-y-6 lg:space-y-8"}>
      {!hideHeader && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 md:mb-6 lg:mb-8"
      >
        <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-1 md:mb-2">Goals</h1>
        <p className="text-sm md:text-base text-[var(--text-secondary)]">Track your progress and achievements</p>
      </motion.div>
      )}
      {!hideHeader && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 md:mb-6">
          <div>
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
        </div>
      )}
      {hideHeader && (
        <div className="flex justify-end mb-4">
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
        {/* Goals List */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
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
            <div className="rounded-xl md:rounded-2xl p-8 md:p-12 text-center border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-md md:shadow-lg">
              <EmptyGoalsIllustration />
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

        {/* Strategy Sidebar */}
        <div className="space-y-3 md:space-y-4 lg:space-y-6">
          <ErrorBoundary>
            <GoalMilestoneGuide goals={Array.isArray(goals) ? goals : []} tasks={Array.isArray(tasks) ? tasks : []} />
          </ErrorBoundary>
        </div>
      </div>
      {selectedGoalForAnalytics && (
        <GoalAnalytics
          goal={selectedGoalForAnalytics}
          tasks={tasks}
          onClose={() => setSelectedGoalForAnalytics(null)}
        />
      )}
    </div>
  );
};

// Analytics View
export const DashboardAnalytics = ({ analytics, tasks, goals, habits, user }) => {
  try {
  return (
      <ErrorBoundary>
        <LazyWrapper minHeight="80vh">
          <AnalyticsDashboard
            analytics={analytics}
            tasks={tasks || []}
            goals={goals || []}
            habits={habits || []}
            user={user}
          />
        </LazyWrapper>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Error rendering AnalyticsDashboard:', error);
    return (
      <div className="p-4 md:p-8">
        <div className="card p-6 text-center">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Error Loading Analytics</h2>
          <p className="text-[var(--text-secondary)]">Please refresh the page or try again later.</p>
      </div>
    </div>
  );
  }
};

// Team View
export const DashboardTeam = ({ 
  friends = [], 
  friendRequests = [], 
  sentFriendRequests = [], 
  leaderboard = [],
  onAddFriend,
  onRemoveFriend,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onCancelFriendRequest,
  currentUser
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends');

  // Get user rank from leaderboard
  const userRank = useMemo(() => {
    if (!currentUser || !leaderboard.length) return null;
    const userId = currentUser._id || currentUser.id;
    const rankIndex = leaderboard.findIndex(
      (user) => (user._id || user.id)?.toString() === userId?.toString()
    );
    return rankIndex !== -1 ? rankIndex + 1 : null;
  }, [leaderboard, currentUser]);

  return (
    <div className="p-4 md:p-8 overflow-x-hidden">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">Team</h1>
        <p className="text-sm md:text-base text-[var(--text-secondary)]">Connect with friends and compete on the leaderboard</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--border-color)]">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'friends'
              ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Friends ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'requests'
              ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Requests
          {(friendRequests.length > 0 || sentFriendRequests.length > 0) && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'leaderboard'
              ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Leaderboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Friends List */}
        {activeTab === 'friends' && (
          <div className="card p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-[var(--text-primary)]">My Friends</h2>
              {onAddFriend && (
                <button
                  onClick={onAddFriend}
                  className="btn-primary flex items-center gap-2 px-3 py-1.5 text-sm"
                >
                  <FaPlus />
                  Add Friend
                </button>
              )}
            </div>
            {friends.length > 0 ? (
              <div className="space-y-3">
                {friends.map((friend, index) => {
                  const friendRank = leaderboard.findIndex(
                    (u) => (u._id || u.id)?.toString() === (friend._id || friend.id)?.toString()
                  ) + 1;
                  return (
        <FriendStatus
                      key={friend._id || friend.id}
                      friend={friend}
                      onRemove={onRemoveFriend}
                      rank={friendRank || null}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--text-tertiary)]">
                <FaUserFriends className="text-4xl mx-auto mb-3 opacity-50" />
                <p>No friends yet</p>
                {onAddFriend && (
                  <button
                    onClick={onAddFriend}
                    className="btn-primary mt-4"
                  >
                    Add Your First Friend
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Friend Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Incoming Requests */}
            {friendRequests.length > 0 && (
              <div className="card p-4 md:p-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Incoming Requests</h2>
            <div className="space-y-3">
                  {friendRequests.map((request) => (
                <div
                      key={request._id || request.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]"
                >
                  <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {request.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                          <p className="font-medium text-[var(--text-primary)]">{request.name || request.email}</p>
                          <p className="text-xs text-[var(--text-secondary)]">Wants to be friends</p>
                    </div>
                  </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onAcceptFriendRequest && onAcceptFriendRequest(request._id || request.id)}
                          className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => onDeclineFriendRequest && onDeclineFriendRequest(request._id || request.id)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                </div>
              ))}
            </div>
          </div>
        )}

            {/* Sent Requests */}
            {sentFriendRequests.length > 0 && (
              <div className="card p-4 md:p-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Sent Requests</h2>
                <div className="space-y-3">
                  {sentFriendRequests.map((request) => (
                    <div
                      key={request._id || request.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {request.name?.charAt(0).toUpperCase() || 'U'}
      </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{request.name || request.email}</p>
                          <p className="text-xs text-[var(--text-secondary)]">Pending</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onCancelFriendRequest && onCancelFriendRequest(request._id || request.id)}
                        className="px-3 py-1.5 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {friendRequests.length === 0 && sentFriendRequests.length === 0 && (
              <div className="card p-8 text-center text-[var(--text-tertiary)]">
                <p>No pending requests</p>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="card p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-4">Leaderboard</h2>
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((user, index) => {
                  const isCurrentUser = currentUser && (
                    (user._id || user.id)?.toString() === (currentUser._id || currentUser.id)?.toString()
                  );
                  return (
                    <div
                      key={user._id || user.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isCurrentUser 
                          ? 'bg-[var(--accent-primary)]/10 border-2 border-[var(--accent-primary)]' 
                          : 'bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                          index === 0 
                            ? 'bg-yellow-500 text-white' 
                            : index === 1
                            ? 'bg-gray-400 text-white'
                            : index === 2
                            ? 'bg-orange-500 text-white'
                            : 'bg-[var(--accent-primary)] text-white'
                        }`}>
                          {index === 0 ? <FaTrophy /> : index + 1}
                        </div>
                        <div>
                          <p className={`font-medium ${isCurrentUser ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
                            {user.name} {isCurrentUser && '(You)'}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {user.xp || 0} XP • {(user.level || 1) >= 10 ? 'Max Level' : `Level ${user.level || 1}`}
                          </p>
                        </div>
                      </div>
                      {index === 0 && <FaTrophy className="text-yellow-500 text-xl" />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--text-tertiary)]">
                <FaTrophy className="text-4xl mx-auto mb-3 opacity-50" />
                <p>No leaderboard data yet</p>
              </div>
            )}
          </div>
        )}

        {/* Your Rank Card */}
        {userRank && activeTab === 'leaderboard' && (
          <div className="card p-4 md:p-6 bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-primary)]/5">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Your Rank</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center font-bold text-2xl">
                {userRank}
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {currentUser?.xp || 0} XP
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {(currentUser?.level || 1) >= 10 ? 'Max Level' : `Level ${currentUser?.level || 1}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
