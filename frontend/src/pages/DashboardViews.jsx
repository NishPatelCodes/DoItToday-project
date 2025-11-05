import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTasks, FaBullseye, FaFire, FaUserFriends, FaChartLine } from 'react-icons/fa';
import TaskCard from '../components/TaskCard';
import GoalTracker from '../components/GoalTracker';
import HabitCard from '../components/HabitCard';
import SmartPlanner from '../components/SmartPlanner';
import FocusMode from '../components/FocusMode';
import XPLevel from '../components/XPLevel';
import GraphCard from '../components/GraphCard';
import CalendarView from '../components/CalendarView';
import FriendStatus from '../components/FriendStatus';
import { useAuthStore } from '../store/authStore';

// Dashboard Home View
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
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-[var(--text-secondary)]">
          Here's your productivity overview for today
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <FaTasks className="text-indigo-600 text-lg" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Pending</p>
              <p className="text-xl font-semibold text-[var(--text-primary)]">{pendingTasks.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <FaBullseye className="text-green-600 text-lg" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Active Goals</p>
              <p className="text-xl font-semibold text-[var(--text-primary)]">{activeGoals.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <FaFire className="text-orange-600 text-lg" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Streak</p>
              <p className="text-xl font-semibold text-[var(--text-primary)]">{user?.streak || 0} days</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <FaTasks className="text-purple-600 text-lg" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Completed</p>
              <p className="text-xl font-semibold text-[var(--text-primary)]">{completedTasks.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Smart Planner */}
          <SmartPlanner />

          {/* Quick Actions */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <FaPlus />
                <span>New Task</span>
              </button>
              <button
                onClick={() => {
                  setEditingGoal(null);
                  setIsGoalModalOpen(true);
                }}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <FaPlus />
                <span>New Goal</span>
              </button>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Tasks</h2>
            </div>
            <div className="space-y-2">
              {pendingTasks.slice(0, 5).map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onEdit={onEditTask}
                />
              ))}
              {pendingTasks.length === 0 && (
                <p className="text-center text-[var(--text-secondary)] py-8 text-sm">
                  No pending tasks. Create one to get started!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* XP Level */}
          <XPLevel xp={user?.xp || 0} level={user?.level || 1} streak={user?.streak || 0} />

          {/* Active Goals */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Goals</h2>
            </div>
            <div className="space-y-3">
              {goals.slice(0, 3).map((goal) => (
                <GoalTracker
                  key={goal._id}
                  goal={goal}
                  onUpdate={onUpdateGoalProgress}
                  onDelete={onDeleteGoal}
                  onEdit={onEditGoal}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Calendar View
export const DashboardCalendar = ({ tasks, goals, onDateClick, onCreateTask }) => {
  return (
    <div className="p-8">
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
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Tasks</h1>
          <p className="text-[var(--text-secondary)]">Manage your daily tasks</p>
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
            {pendingTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-center text-[var(--text-secondary)] py-8 text-sm">
                No pending tasks
              </p>
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Completed ({completedTasks.length})
            </h2>
            <div className="space-y-2">
              {completedTasks.map((task) => (
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
}) => {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Goals</h1>
          <p className="text-[var(--text-secondary)]">Track your long-term objectives</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <GoalTracker
            key={goal._id}
            goal={goal}
            onUpdate={onUpdateGoalProgress}
            onDelete={onDeleteGoal}
            onEdit={onEditGoal}
          />
        ))}
        {goals.length === 0 && (
          <div className="col-span-2 card p-12 text-center">
            <p className="text-[var(--text-secondary)]">No goals yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Analytics View
export const DashboardAnalytics = ({ analytics, user, tasks = [], goals = [] }) => {
  const [timeFilter, setTimeFilter] = useState('7d'); // 7d, 30d, all
  
  // Calculate additional stats from tasks and goals
  const stats = useMemo(() => {
    const allTasks = tasks || [];
    const completedTasks = allTasks.filter(t => t.status === 'completed');
    const pendingTasks = allTasks.filter(t => t.status === 'pending');
    const highPriorityTasks = allTasks.filter(t => t.priority === 'high');
    const overdueTasks = allTasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== 'completed';
    });
    
    const allGoals = goals || [];
    const completedGoals = allGoals.filter(g => g.progress === 100);
    const inProgressGoals = allGoals.filter(g => g.progress > 0 && g.progress < 100);
    const avgGoalProgress = allGoals.length > 0
      ? Math.round(allGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / allGoals.length)
      : 0;
    
    const completionRate = allTasks.length > 0
      ? Math.round((completedTasks.length / allTasks.length) * 100)
      : 0;
    
    return {
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      completionRate,
      highPriorityTasks: highPriorityTasks.length,
      overdueTasks: overdueTasks.length,
      totalGoals: allGoals.length,
      completedGoals: completedGoals.length,
      inProgressGoals: inProgressGoals.length,
      avgGoalProgress,
    };
  }, [tasks, goals]);
  
  // Filter analytics data based on time filter
  const filteredAnalytics = useMemo(() => {
    if (!analytics) return null;
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeFilter) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case 'all':
      default:
        cutoffDate = new Date(0); // Beginning of time
        break;
    }
    
    // Filter daily productivity
    const filteredDaily = analytics.dailyProductivity
      ? analytics.dailyProductivity.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= cutoffDate;
        })
      : [];
    
    return {
      ...analytics,
      dailyProductivity: filteredDaily,
      weeklyCompletion: analytics.weeklyCompletion || [],
    };
  }, [analytics, timeFilter]);
  
  // Calculate trends
  const trends = useMemo(() => {
    if (!filteredAnalytics?.dailyProductivity || filteredAnalytics.dailyProductivity.length < 2) {
      return null;
    }
    
    const recent = filteredAnalytics.dailyProductivity.slice(-3);
    const previous = filteredAnalytics.dailyProductivity.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, item) => sum + (item.productivity || 0), 0) / recent.length;
    const previousAvg = previous.length > 0
      ? previous.reduce((sum, item) => sum + (item.productivity || 0), 0) / previous.length
      : recentAvg;
    
    const productivityTrend = recentAvg - previousAvg;
    const completionTrend = recent.reduce((sum, item) => sum + (item.completed || 0), 0) -
      (previous.reduce((sum, item) => sum + (item.completed || 0), 0) || 0);
    
    return {
      productivityTrend: Math.round(productivityTrend),
      completionTrend,
      isImproving: productivityTrend > 0,
    };
  }, [filteredAnalytics]);
  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Analytics</h1>
            <p className="text-[var(--text-secondary)]">Your productivity insights and trends</p>
          </div>
          
          {/* Time Filter */}
          <div className="flex items-center gap-2 bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
            {['7d', '30d', 'all'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeFilter(period)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  timeFilter === period
                    ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[var(--text-secondary)]">Completion Rate</p>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <FaChartLine className="text-indigo-600 text-lg" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)] mb-1">
            {stats.completionRate}%
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            {stats.completedTasks} of {stats.totalTasks} tasks
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[var(--text-secondary)]">Pending Tasks</p>
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <FaTasks className="text-orange-600 text-lg" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)] mb-1">
            {stats.pendingTasks}
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            {stats.overdueTasks > 0 && `${stats.overdueTasks} overdue`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[var(--text-secondary)]">Goals Progress</p>
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <FaBullseye className="text-green-600 text-lg" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)] mb-1">
            {stats.avgGoalProgress}%
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            {stats.completedGoals} of {stats.totalGoals} completed
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[var(--text-secondary)]">Streak</p>
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <FaFire className="text-red-600 text-lg" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)] mb-1">
            {user?.streak || 0}
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">days in a row</p>
        </motion.div>
      </div>

      {/* Trends Section */}
      {trends && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-lg">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                trends.isImproving ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                <FaChartLine className={`text-lg ${
                  trends.isImproving ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Productivity Trend</p>
                <p className={`text-xl font-bold ${
                  trends.isImproving ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trends.isImproving ? '+' : ''}{trends.productivityTrend}%
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {trends.isImproving ? 'Improving' : 'Declining'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <FaTasks className="text-indigo-600 text-lg" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Completion Trend</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {trends.completionTrend > 0 ? '+' : ''}{trends.completionTrend}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">tasks completed</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Charts */}
      {filteredAnalytics ? (
        <div className="space-y-6">
          {filteredAnalytics.dailyProductivity && filteredAnalytics.dailyProductivity.length > 0 && (
            <GraphCard
              title={`Daily Productivity (${timeFilter === '7d' ? 'Last 7 Days' : timeFilter === '30d' ? 'Last 30 Days' : 'All Time'})`}
              data={filteredAnalytics.dailyProductivity}
              type="line"
            />
          )}
          {filteredAnalytics.weeklyCompletion && filteredAnalytics.weeklyCompletion.length > 0 && (
            <GraphCard
              title="Weekly Task Completion"
              data={filteredAnalytics.weeklyCompletion}
              type="bar"
            />
          )}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <FaChartLine className="text-4xl text-[var(--text-tertiary)] mx-auto mb-4 opacity-50" />
          <p className="text-[var(--text-secondary)] mb-2">No analytics data available</p>
          <p className="text-sm text-[var(--text-tertiary)]">
            Complete some tasks to see your productivity insights
          </p>
        </div>
      )}
    </div>
  );
};

// Team View
export const DashboardTeam = ({ 
  friends, 
  friendRequests = [],
  sentFriendRequests = [],
  leaderboard, 
  tasks,
  onAddFriend, 
  onRemoveFriend,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onCancelFriendRequest,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  setIsTaskModalOpen,
  setEditingTask,
}) => {
  const { user } = useAuthStore();
  
  // Safety check: ensure all required props have defaults
  const safeFriends = friends || [];
  const safeFriendRequests = friendRequests || [];
  const safeSentFriendRequests = sentFriendRequests || [];
  const safeLeaderboard = leaderboard || [];
  const safeTasks = tasks || [];
  
  // Debug logging (commented out for production)
  // console.log('🔍 Filtering shared tasks. Total tasks:', safeTasks.length);
  // console.log('🔍 Current user ID:', user?.id || user?._id);
  
  // Get shared tasks (tasks shared with you or tasks you shared)
  const sharedTasks = safeTasks.filter(task => {
    if (!task) return false;
    
    const taskUserId = task.userId?._id || task.userId || task.userId;
    const currentUserId = user?.id || user?._id;
    const isOwnTask = taskUserId?.toString() === currentUserId?.toString();
    
    // Check if task is shared with me (I'm in sharedWith array)
    const isSharedWithMe = task.sharedWith?.some(f => {
      const friendId = f?._id || f?.id || f;
      return friendId?.toString() === currentUserId?.toString();
    });
    
    // Check if it's my task that I shared with others
    const isMySharedTask = isOwnTask && task.sharedWith && Array.isArray(task.sharedWith) && task.sharedWith.length > 0;
    
    // Also check if it's marked as shared (legacy support)
    const isMarkedShared = task.isShared === true;
    
    const result = isSharedWithMe || isMySharedTask || (isMarkedShared && !isOwnTask);
    
    // Debug logging (always log for now to help debug)
    if (result) {
      console.log('✅ Shared task found:', {
        taskId: task._id,
        title: task.title,
        isOwnTask,
        isSharedWithMe,
        isMySharedTask,
        sharedWith: task.sharedWith,
        sharedWithLength: task.sharedWith?.length || 0,
        userId: taskUserId,
        currentUserId
      });
    }
    
    return result;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Team</h1>
          <p className="text-[var(--text-secondary)]">Connect with friends and track progress together</p>
        </div>
        <button onClick={onAddFriend} className="btn-primary flex items-center gap-2">
          <FaPlus />
          <span>Add Friend</span>
        </button>
      </div>

      {/* Friend Requests Section */}
      {((safeFriendRequests && safeFriendRequests.length > 0) || (safeSentFriendRequests && safeSentFriendRequests.length > 0)) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <FaUserFriends />
            Friend Requests
          </h2>
          
          {/* Incoming Requests */}
          {safeFriendRequests && safeFriendRequests.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Incoming Requests</h3>
              <div className="space-y-2">
                {safeFriendRequests.map((request) => {
                  if (!request) return null;
                  // Handle case where request might be just an ID string
                  if (typeof request === 'string') {
                    return (
                      <div
                        key={request}
                        className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            U
                          </div>
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">
                              Loading...
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              Wants to be friends
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (onAcceptFriendRequest) {
                                onAcceptFriendRequest(request);
                              }
                            }}
                            className="px-3 py-1.5 text-sm font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              if (onDeclineFriendRequest) {
                                onDeclineFriendRequest(request);
                              }
                            }}
                            className="px-3 py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  }
                  const requestId = request._id || request.id || request;
                  const requestName = request?.name || request?.email || 'Unknown';
                  const requestEmail = request?.email || '';
                  return (
                  <div
                    key={requestId}
                    className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {(requestName || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {requestName}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Wants to be friends
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onAcceptFriendRequest) {
                            onAcceptFriendRequest(requestId);
                          } else {
                            console.error('onAcceptFriendRequest handler not provided');
                          }
                        }}
                        className="px-3 py-1.5 text-sm font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          if (onDeclineFriendRequest) {
                            onDeclineFriendRequest(requestId);
                          } else {
                            console.error('onDeclineFriendRequest handler not provided');
                          }
                        }}
                        className="px-3 py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sent Requests */}
          {safeSentFriendRequests && safeSentFriendRequests.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Sent Requests</h3>
              <div className="space-y-2">
                {safeSentFriendRequests.map((request) => {
                  if (!request) return null;
                  // Handle case where request might be just an ID string
                  if (typeof request === 'string') {
                    return (
                      <div
                        key={request}
                        className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            U
                          </div>
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">
                              Loading...
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              Request pending
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (onCancelFriendRequest) {
                              onCancelFriendRequest(request);
                            }
                          }}
                          className="px-3 py-1.5 text-sm font-medium bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    );
                  }
                  const requestId = request._id || request.id || request;
                  const requestName = request?.name || request?.email || 'Unknown';
                  return (
                  <div
                    key={requestId}
                    className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {(requestName || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {requestName}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Request pending
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (onCancelFriendRequest) {
                          onCancelFriendRequest(requestId);
                        } else {
                          console.error('onCancelFriendRequest handler not provided');
                        }
                      }}
                      className="px-3 py-1.5 text-sm font-medium bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Friends List */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Friends ({safeFriends.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {safeFriends.length === 0 ? (
              <p className="text-center text-[var(--text-secondary)] py-8 text-sm">
                No friends yet. Add friends to see their progress!
              </p>
            ) : (
              safeFriends.map((friend, index) => {
                if (!friend) return null;
                return (
                  <FriendStatus
                    key={friend._id || friend.id || index}
                    friend={friend}
                    onRemove={onRemoveFriend}
                    rank={index + 1}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Leaderboard</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {safeLeaderboard.length === 0 ? (
              <p className="text-center text-[var(--text-secondary)] py-4 text-sm">
                No leaderboard data yet
              </p>
            ) : (
              safeLeaderboard.map((leaderboardUser, index) => {
                if (!leaderboardUser) return null;
                const userId = leaderboardUser._id || leaderboardUser.id;
                const isCurrentUser = userId?.toString() === currentUserId?.toString();
                
                return (
                  <div
                    key={userId || index}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      index === 0
                        ? 'bg-indigo-500/5 border border-indigo-500/20'
                        : isCurrentUser
                        ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30'
                        : 'hover:bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      index === 0
                        ? 'bg-indigo-500/10 text-indigo-600'
                        : isCurrentUser
                        ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                        : 'bg-indigo-500/10 text-indigo-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--text-primary)]">
                          {leaderboardUser.name || leaderboardUser.email || 'Unknown'}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs px-2 py-0.5 bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-full font-medium">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {leaderboardUser.streak || 0} streak • {leaderboardUser.totalTasksCompleted || 0} tasks • {leaderboardUser.xp || 0} XP • Level {leaderboardUser.level || 1}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Shared Tasks Section - Always visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mt-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <FaUserFriends />
              Shared Tasks ({(sharedTasks || []).length})
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Tasks you've shared with friends or tasks shared with you
            </p>
          </div>
          <button
            onClick={() => {
              if (setEditingTask) setEditingTask(null);
              if (setIsTaskModalOpen) setIsTaskModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus />
            <span>Create Shared Task</span>
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {!sharedTasks || sharedTasks.length === 0 ? (
            <div className="text-center py-8">
              <FaUserFriends className="text-4xl text-[var(--text-tertiary)] mx-auto mb-4 opacity-50" />
              <p className="text-[var(--text-secondary)] mb-2">
                No shared tasks yet
              </p>
              <p className="text-sm text-[var(--text-tertiary)] mb-4">
                Create a task and share it with your friends to collaborate!
              </p>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="btn-primary"
              >
                Create Your First Shared Task
              </button>
            </div>
          ) : (
            sharedTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};



