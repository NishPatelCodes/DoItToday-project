import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTasks, FaBullseye, FaFire, FaUserFriends, FaChartLine, FaSearch, FaChevronUp, FaChevronDown, FaEllipsisV, FaLightbulb, FaDollarSign, FaTrophy, FaFlag, FaCheckCircle, FaCheck, FaUser, FaStickyNote, FaCopy, FaTimes, FaMagic } from 'react-icons/fa';
import { format, isToday, isYesterday, isThisWeek, startOfWeek, endOfWeek, isSameDay, startOfDay, differenceInDays, subDays } from 'date-fns';
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
import MultipleTasksModal from '../components/MultipleTasksModal';
import { TaskCardSkeleton, GoalCardSkeleton, Skeleton } from '../components/Skeleton';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { notesAPI } from '../services/api';

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
  const [notes, setNotes] = useState([]);
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

  // Load notes for search
  useEffect(() => {
    if (searchQuery.trim()) {
      notesAPI.getAll({ search: searchQuery, archived: 'false' })
        .then(res => setNotes(res.data || []))
        .catch(() => setNotes([]));
    } else {
      setNotes([]);
    }
  }, [searchQuery]);

  // Filter search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { tasks: [], goals: [], notes: [] };
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
      notes: notes.filter(n => 
        n.title?.toLowerCase().includes(query) || 
        n.content?.toLowerCase().includes(query)
      ).slice(0, 5),
    };
  }, [searchQuery, tasks, goals, notes]);

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
    <div className="p-4 md:p-6 lg:p-8 xl:p-10 bg-[var(--bg-primary)] min-h-screen max-w-[1920px] mx-auto overflow-x-hidden">
      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search tasks, goals, notes..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(e.target.value.trim().length > 0);
            }}
            onFocus={() => setShowSearchResults(searchQuery.trim().length > 0)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showSearchResults && (searchResults.tasks.length > 0 || searchResults.goals.length > 0 || searchResults.notes.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto"
            >
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
                          navigate('/dashboard/goals', { state: { highlightGoalId: goal._id } });
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
              {searchResults.notes.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-[var(--text-secondary)]">
                    <FaStickyNote />
                    Notes ({searchResults.notes.length})
                  </div>
                  <div className="space-y-2">
                    {searchResults.notes.map(note => (
                      <div
                        key={note._id}
                        onClick={() => {
                          navigate('/dashboard/notes', { state: { highlightNoteId: note._id } });
                          setSearchQuery('');
                          setShowSearchResults(false);
                        }}
                        className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] cursor-pointer"
                      >
                        <p className="text-sm font-medium text-[var(--text-primary)]">{note.title || 'Untitled Note'}</p>
                        {note.content && (
                          <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-1">{note.content.replace(/<[^>]*>/g, '')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top Section: Today's Progress, Pending, Goals, Challenges - Improved desktop grid */}
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
        {/* Today's Progress Bar Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 lg:p-6 rounded-2xl flex-shrink-0 w-[280px] md:w-auto shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-[var(--text-primary)]">Today's Progress</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--text-secondary)]">Tasks Completed</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {todaysTasks.filter(t => t.status === 'completed').length} / {todaysTasks.length}
                </span>
              </div>
              <div className="w-full h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${todaysPlanProgress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-blue-500 rounded-full"
                />
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">{todaysPlanProgress}% complete</p>
            </div>
            {nextTask && (
              <div className="pt-3 border-t border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)] mb-1">Next Task</p>
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{nextTask.title}</p>
                {nextTask.dueDate && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">
                    {format(new Date(nextTask.dueDate), 'h:mm a')}
                  </p>
                )}
              </div>
            )}
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
          <div className="mb-4">
            <p className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-1">{pendingTasks.length}</p>
            <p className="text-xs text-[var(--text-tertiary)]">{format(new Date(), 'h:mm a')}</p>
          </div>
          {pendingTasks.length > 0 && (
            <div className="pt-4 border-t border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-secondary)] mb-2">Upcoming Tasks</p>
              <div className="space-y-2">
                {pendingTasks.slice(0, 2).map(task => (
                  <div key={task._id} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] flex-shrink-0"></div>
                    <p className="text-xs text-[var(--text-primary)] truncate flex-1">{task.title}</p>
                    {task.dueDate && (
                      <span className="text-[10px] text-[var(--text-tertiary)] flex-shrink-0">
                        {format(new Date(task.dueDate), 'MMM dd')}
                      </span>
                    )}
                  </div>
                ))}
                {pendingTasks.length > 2 && (
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                    +{pendingTasks.length - 2} more tasks
                  </p>
                )}
              </div>
            </div>
          )}
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FaBullseye className="text-green-600 dark:text-green-400 text-lg lg:text-xl" />
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">{activeGoals.length}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Active</p>
            </div>
          </div>
          {activeGoals.length > 0 && (
            <div className="pt-4 border-t border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-secondary)] mb-2">Top Goals</p>
              <div className="space-y-2">
                {activeGoals.slice(0, 2).map(goal => {
                  const progress = goal.progress || 0;
                  return (
                    <div key={goal._id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-[var(--text-primary)] truncate flex-1">{goal.title}</p>
                        <span className="text-[10px] text-[var(--text-tertiary)] ml-2">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {activeGoals.length > 2 && (
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                    +{activeGoals.length - 2} more goals
                  </p>
                )}
              </div>
            </div>
          )}
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
            <div className="relative menu-container">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <FaEllipsisV />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg z-10 min-w-[180px]"
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
                    <button
                      onClick={() => {
                        setTodaysPlanExpanded(!todaysPlanExpanded);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2"
                    >
                      {todaysPlanExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      {todaysPlanExpanded ? 'Collapse' : 'Expand'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {todaysPlanExpanded && (
            <div className="space-y-3">
              {sortedTodaysTasks.filter(t => t.status !== 'completed').length > 0 ? (
                sortedTodaysTasks
                  .filter(t => t.status !== 'completed')
                  .slice(0, 5)
                  .map((task) => (
                    <div
                      key={task._id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => onToggleTask(task._id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                          task.status === 'completed'
                            ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white'
                            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-transparent hover:border-[var(--accent-primary)]/50 hover:bg-[var(--bg-tertiary)]'
                        }`}
                        aria-label={task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {task.status === 'completed' && (
                          <FaCheck className="w-3 h-3 text-white" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
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
                <p className="text-sm text-[var(--text-tertiary)] text-center py-4">No pending tasks for today</p>
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
        <div className="flex lg:flex-col gap-4 lg:gap-6 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
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
      <div className="flex md:grid md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
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
      <div className="flex md:grid md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
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
  onCreateMultipleTasks,
}) => {
  const [isMultipleTasksModalOpen, setIsMultipleTasksModalOpen] = useState(false);
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsMultipleTasksModalOpen(true);
            }}
            className="btn-secondary flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <FaMagic />
            <span>Multiple Tasks</span>
          </button>
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
      </div>

      {/* Multiple Tasks Modal */}
      <MultipleTasksModal
        isOpen={isMultipleTasksModalOpen}
        onClose={() => setIsMultipleTasksModalOpen(false)}
        onGenerateTasks={onCreateMultipleTasks}
      />

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
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">Analytics</h1>
        <p className="text-sm md:text-base text-[var(--text-secondary)]">Track your productivity and progress</p>
          </div>
          
      <div className="grid grid-cols-1 gap-4 md:gap-6">
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
