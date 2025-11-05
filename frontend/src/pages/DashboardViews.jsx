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
export const DashboardAnalytics = ({ analytics, user }) => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Analytics</h1>
        <p className="text-[var(--text-secondary)]">Your productivity insights and trends</p>
      </div>

      {analytics && (
        <div className="space-y-6">
          {analytics.dailyProductivity && analytics.dailyProductivity.length > 0 && (
            <GraphCard
              title="Daily Productivity (Last 7 Days)"
              data={analytics.dailyProductivity}
              type="line"
            />
          )}
          {analytics.weeklyCompletion && analytics.weeklyCompletion.length > 0 && (
            <GraphCard
              title="Weekly Task Completion (Last 4 Weeks)"
              data={analytics.weeklyCompletion}
              type="bar"
            />
          )}
        </div>
      )}
    </div>
  );
};

// Team View
export const DashboardTeam = ({ 
  friends, 
  leaderboard, 
  tasks,
  onAddFriend, 
  onRemoveFriend,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  setIsTaskModalOpen,
  setEditingTask,
}) => {
  const { user } = useAuthStore();
  
  // Debug logging (commented out for production)
  // console.log('🔍 Filtering shared tasks. Total tasks:', tasks.length);
  // console.log('🔍 Current user ID:', user?.id || user?._id);
  
  // Get shared tasks (tasks shared with you or tasks you shared)
  const sharedTasks = tasks.filter(task => {
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
      {(friendRequests.length > 0 || sentFriendRequests.length > 0) && (
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
          {friendRequests.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Incoming Requests</h3>
              <div className="space-y-2">
                {friendRequests.map((request) => (
                  <div
                    key={request._id || request.id}
                    className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {(request.name || request.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {request.name || request.email}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Wants to be friends
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onAcceptFriendRequest(request._id || request.id)}
                        className="px-3 py-1.5 text-sm font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => onDeclineFriendRequest(request._id || request.id)}
                        className="px-3 py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
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
            <div>
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Sent Requests</h3>
              <div className="space-y-2">
                {sentFriendRequests.map((request) => (
                  <div
                    key={request._id || request.id}
                    className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {(request.name || request.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {request.name || request.email}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Request pending
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onCancelFriendRequest(request._id || request.id)}
                      className="px-3 py-1.5 text-sm font-medium bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Friends List */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Friends ({friends.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {friends.length === 0 ? (
              <p className="text-center text-[var(--text-secondary)] py-8 text-sm">
                No friends yet. Add friends to see their progress!
              </p>
            ) : (
              friends.map((friend, index) => (
                <FriendStatus
                  key={friend._id || friend.id}
                  friend={friend}
                  onRemove={onRemoveFriend}
                  rank={index + 1}
                />
              ))
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Leaderboard</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {leaderboard.length === 0 ? (
              <p className="text-center text-[var(--text-secondary)] py-4 text-sm">
                No leaderboard data yet
              </p>
            ) : (
              leaderboard.map((user, index) => (
                <div
                  key={user._id || user.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    index === 0
                      ? 'bg-indigo-500/5 border border-indigo-500/20'
                      : 'hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--text-primary)]">{user.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {user.streak || 0} streak • {user.totalTasksCompleted || 0} tasks • Level {user.level || 1}
                    </p>
                  </div>
                </div>
              ))
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
              Shared Tasks ({sharedTasks.length})
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Tasks you've shared with friends or tasks shared with you
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus />
            <span>Create Shared Task</span>
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sharedTasks.length === 0 ? (
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



