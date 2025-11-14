import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaPlus,
  FaSignOutAlt,
  FaFire,
  FaTasks,
  FaBullseye,
  FaUserFriends,
  FaChartLine,
  FaBars,
} from 'react-icons/fa';
import GratitudeJournal from '../components/GratitudeJournal';
import NotesView from '../components/NotesView';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import {
  tasksAPI,
  goalsAPI,
  friendsAPI,
  analyticsAPI,
  habitsAPI,
  authAPI,
  challengesAPI,
} from '../services/api';
import TaskModal from '../components/TaskModal';
import GoalModal from '../components/GoalModal';
import AddFriendModal from '../components/AddFriendModal';
import Sidebar from '../components/Sidebar';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import {
  DashboardHome,
  DashboardCalendar,
  DashboardTasks,
  DashboardGoals,
  DashboardAnalytics,
  DashboardTeam,
} from './DashboardViews';
import Profile from '../components/Profile';
import Challenges from '../components/Challenges';
import FocusModePage from '../pages/FocusModePage';
import FinanceTracker from '../components/FinanceTracker';
import { useToast } from '../hooks/useToast';
import { TaskCardSkeleton, GoalCardSkeleton, Skeleton } from '../components/Skeleton';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const toast = useToast();
  const {
    tasks,
    goals,
    habits,
    friends,
    friendRequests,
    sentFriendRequests,
    analytics,
    leaderboard,
    setTasks,
    setGoals,
    setHabits,
    setFriends,
    setFriendRequests,
    setSentFriendRequests,
    setAnalytics,
    setLeaderboard,
  } = useDataStore();

  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeChallenges, setActiveChallenges] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load critical data first (tasks)
      setLoadingTasks(true);
      try {
        const tasksRes = await tasksAPI.getAll();
        const tasksData = tasksRes.data || [];
        setTasks(tasksData);
      } catch (error) {
        // Only show error if it's not a network timeout (likely server cold start)
        const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.message?.includes('timeout');
        if (!isTimeout) {
          setError('Failed to load tasks. Please refresh the page.');
        }
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }

      // Load other data in parallel (non-critical)
      // Stagger requests slightly to avoid overwhelming server on cold start
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      const [goalsRes, friendsRes, analyticsRes, leaderboardRes, habitsRes, challengesRes, authRes] =
        await Promise.allSettled([
          goalsAPI.getAll(),
          delay(100).then(() => friendsAPI.getAll()),
          delay(200).then(() => analyticsAPI.getDashboard()),
          delay(300).then(() => friendsAPI.getLeaderboard()),
          delay(400).then(() => habitsAPI.getAll()),
          delay(450).then(() => challengesAPI.getActive()),
          delay(500).then(() => authAPI.getMe()),
        ]);

      // Handle results with error handling (silently handle failures)
      if (goalsRes.status === 'fulfilled') {
        setGoals(goalsRes.value.data || []);
      } else {
        setGoals([]);
      }

      if (friendsRes.status === 'fulfilled') {
        const friendsData = friendsRes.value.data || {};
        // Handle new response format (with friendRequests) or old format (array)
        if (Array.isArray(friendsData)) {
          setFriends(friendsData);
          setFriendRequests([]);
          setSentFriendRequests([]);
        } else {
          setFriends(friendsData.friends || []);
          setFriendRequests(friendsData.friendRequests || []);
          setSentFriendRequests(friendsData.sentFriendRequests || []);
        }
      } else {
        setFriends([]);
        setFriendRequests([]);
        setSentFriendRequests([]);
      }

      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value.data || {});
      } else {
        setAnalytics({});
      }

      if (leaderboardRes.status === 'fulfilled') {
        setLeaderboard(leaderboardRes.value.data || []);
      } else {
        setLeaderboard([]);
      }

      if (habitsRes.status === 'fulfilled') {
        setHabits(habitsRes.value.data || []);
      } else {
        setHabits([]);
      }

      if (challengesRes.status === 'fulfilled') {
        setActiveChallenges(challengesRes.value.data || []);
      } else {
        setActiveChallenges([]);
      }

      if (authRes.status === 'fulfilled' && authRes.value?.data?.user) {
        const { updateUser, user: currentUser } = useAuthStore.getState();
        const userData = authRes.value.data.user;
        const oldLevel = currentUser?.level || 1;
        const newLevel = userData.level || 1;
        
        updateUser({
          ...currentUser,
          xp: userData.xp || 0,
          level: newLevel,
          streak: userData.streak || 0,
          totalTasksCompleted: userData.totalTasksCompleted || 0,
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.message?.includes('timeout');
        if (!isTimeout) {
          setError('Failed to load some data. Please refresh the page.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const task = tasks.find((t) => t._id === id);
      if (!task) return;

      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      
      // Store old user level before update
      const { user: oldUser } = useAuthStore.getState();
      const oldLevel = oldUser?.level || 1;
      
      const response = await tasksAPI.update(id, { status: newStatus });
      
      // Update task in store immediately
      const { updateTask } = useDataStore.getState();
      updateTask(id, response.data);
      
      // Refresh user data to get updated Discipline Points (DP is awarded on task completion)
      try {
        const userRes = await authAPI.getMe();
        const { updateUser } = useAuthStore.getState();
        const updatedUser = userRes.data.user;
        const newLevel = updatedUser.level || 1;
        
        updateUser({
          ...updatedUser,
          xp: updatedUser.xp || 0,
          level: newLevel,
        });
        
        // Check for level up and show appropriate message
        if (newStatus === 'completed' && newLevel > oldLevel) {
          toast.success(`🎉 Level Up! You're now level ${newLevel}!`, { duration: 5000 });
        } else if (newStatus === 'completed') {
          toast.success('Task completed! ✨ Discipline Points earned!');
        } else {
          toast.success('Task marked as pending');
        }
      } catch (e) {
        // Silently handle user reload failure
        toast.success(newStatus === 'completed' ? 'Task completed! 🎉' : 'Task marked as pending');
      }
      
      // Reload only analytics to update stats
      try {
        const analyticsRes = await analyticsAPI.getDashboard();
        setAnalytics(analyticsRes.data || {});
      } catch (e) {
        // Silently handle analytics reload failure
      }
      
      // Reload leaderboard to show updated rankings
      try {
        const leaderboardRes = await friendsAPI.getLeaderboard();
        setLeaderboard(leaderboardRes.data || []);
      } catch (e) {
        // Silently handle leaderboard reload failure
      }
    } catch (error) {
      toast.error('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await tasksAPI.delete(id);
      
      // Remove task from store immediately
      const { deleteTask } = useDataStore.getState();
      deleteTask(id);
      
      // Reload only analytics to update stats
      try {
        const analyticsRes = await analyticsAPI.getDashboard();
        setAnalytics(analyticsRes.data || {});
      } catch (e) {
        // Silently handle analytics reload failure
      }
      
      // Refresh user data and leaderboard
      try {
        const [userRes, leaderboardRes] = await Promise.all([
          authAPI.getMe(),
          friendsAPI.getLeaderboard()
        ]);
        const { updateUser } = useAuthStore.getState();
        updateUser({
          ...userRes.data.user,
          xp: userRes.data.user.xp || 0,
          level: userRes.data.user.level || 1,
        });
        setLeaderboard(leaderboardRes.data || []);
      } catch (e) {
        // Silently handle reload failure
      }
      
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task. Please try again.');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCreateMultipleTasks = async (textInput) => {
    try {
      // Call API to parse text and generate tasks
      const response = await tasksAPI.parseMultiple(textInput);
      const parsedTasks = response.data.tasks || [];

      if (parsedTasks.length === 0) {
        toast.error('No tasks could be extracted from the text. Please try with different content.');
        return;
      }

      // Create each task individually
      const createdTasks = [];
      for (const taskData of parsedTasks) {
        try {
          const response = await tasksAPI.create(taskData);
          createdTasks.push(response.data);
        } catch (error) {
          console.error('Error creating task:', error);
          // Continue with other tasks even if one fails
        }
      }

      // Reload all tasks
      await loadData();

      // Reload analytics
      try {
        const analyticsRes = await analyticsAPI.getDashboard();
        setAnalytics(analyticsRes.data || {});
      } catch (e) {
        // Silently handle analytics reload failure
      }

      // Refresh user data and leaderboard
      try {
        const [userRes, leaderboardRes] = await Promise.all([
          authAPI.getMe(),
          friendsAPI.getLeaderboard()
        ]);
        const { updateUser } = useAuthStore.getState();
        updateUser({
          ...userRes.data.user,
          xp: userRes.data.user.xp || 0,
          level: userRes.data.user.level || 1,
        });
        setLeaderboard(leaderboardRes.data || []);
      } catch (e) {
        // Silently handle reload failure
      }

      toast.success(`Successfully created ${createdTasks.length} task${createdTasks.length !== 1 ? 's' : ''}!`);
    } catch (error) {
      console.error('Error creating multiple tasks:', error);
      toast.error('Failed to create tasks. Please try again.');
      throw error;
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      let newTask;
      if (editingTask) {
        const response = await tasksAPI.update(editingTask._id, taskData);
        newTask = response.data;
        // Update task in store
        const { updateTask } = useDataStore.getState();
        updateTask(editingTask._id, newTask);
      } else {
        const response = await tasksAPI.create(taskData);
        newTask = response.data;
        // Reload all tasks to get properly populated sharedWith
        await loadData();
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
      // Reload only analytics to update stats
      try {
        const analyticsRes = await analyticsAPI.getDashboard();
        setAnalytics(analyticsRes.data || {});
      } catch (e) {
        // Silently handle analytics reload failure
      }
      
      // Always refresh user data and leaderboard to get updated Discipline Points/level
      try {
        const [userRes, leaderboardRes] = await Promise.all([
          authAPI.getMe(),
          friendsAPI.getLeaderboard()
        ]);
        const { updateUser } = useAuthStore.getState();
        updateUser({
          ...userRes.data.user,
          xp: userRes.data.user.xp || 0,
          level: userRes.data.user.level || 1,
        });
        setLeaderboard(leaderboardRes.data || []);
      } catch (e) {
        // Silently handle reload failure
      }
      
      toast.success(editingTask ? 'Task updated successfully!' : 'Task created successfully!');
    } catch (error) {
      // Check if it's a timeout error (will be retried automatically)
      const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.message?.includes('timeout');
      
      // Only show error if it's not a timeout (timeouts are handled by retry logic)
      if (!isTimeout) {
        toast.error('Failed to save task. Please try again.');
      } else {
        // For timeout, show a more helpful message
        toast.error('Server is taking longer than usual to respond. The task may have been saved - please check your tasks list.');
      }
      throw error;
    }
  };

  const handleUpdateGoalProgress = async (id, progress) => {
    try {
      const response = await goalsAPI.update(id, { progress });
      // Get current goals from store
      const currentGoals = useDataStore.getState().goals;
      
      // Ensure we have an array and update the specific goal
      if (Array.isArray(currentGoals)) {
        const updatedGoals = currentGoals.map((g) => {
          const goalId = g._id || g.id;
          const targetId = id._id || id;
          if (goalId === targetId || goalId === id) {
            return { ...g, progress: Math.max(0, Math.min(100, progress)) };
          }
          return g;
        });
        setGoals(updatedGoals);
      } else {
        // If goals is not an array, set it to empty array to prevent errors
        setGoals([]);
      }
      
      // Only reload analytics, not all data
      try {
        const analyticsRes = await analyticsAPI.getDashboard();
        setAnalytics(analyticsRes.data || {});
      } catch (e) {
        // Silently handle analytics reload failure
      }
      
      // Refresh user data and leaderboard to get updated Discipline Points/level (goals award DP)
      try {
        const [userRes, leaderboardRes] = await Promise.all([
          authAPI.getMe(),
          friendsAPI.getLeaderboard()
        ]);
        const { updateUser } = useAuthStore.getState();
        updateUser({
          ...userRes.data.user,
          xp: userRes.data.user.xp || 0,
          level: userRes.data.user.level || 1,
        });
        setLeaderboard(leaderboardRes.data || []);
      } catch (e) {
        // Silently handle reload failure
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
      // Silently handle error
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await goalsAPI.delete(id);
      loadData();
    } catch (error) {
      // Silently handle error
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleCreateGoal = async (goalData) => {
    try {
      if (editingGoal) {
        await goalsAPI.update(editingGoal._id, goalData);
      } else {
        await goalsAPI.create(goalData);
      }
      loadData();
      setIsGoalModalOpen(false);
      setEditingGoal(null);
    } catch (error) {
      // Silently handle error
    }
  };

  const handleAddFriend = async (email) => {
    try {
      const response = await friendsAPI.add(email);
      // Reload friends and leaderboard
      const friendsRes = await friendsAPI.getAll();
      const friendsData = friendsRes.data || {};
      if (Array.isArray(friendsData)) {
        setFriends(friendsData);
        setFriendRequests([]);
        setSentFriendRequests([]);
      } else {
        setFriends(friendsData.friends || []);
        setFriendRequests(friendsData.friendRequests || []);
        setSentFriendRequests(friendsData.sentFriendRequests || []);
      }
      loadData(); // Reload leaderboard
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleAcceptFriendRequest = async (friendId) => {
    try {
      await friendsAPI.accept(friendId);
      loadData(); // Reload friends
      toast.success('Friend request accepted!');
    } catch (error) {
      toast.error('Failed to accept friend request. Please try again.');
    }
  };

  const handleDeclineFriendRequest = async (friendId) => {
    try {
      await friendsAPI.decline(friendId);
      loadData(); // Reload friends
      toast.success('Friend request declined');
    } catch (error) {
      toast.error('Failed to decline friend request. Please try again.');
    }
  };

  const handleCancelFriendRequest = async (friendId) => {
    try {
      await friendsAPI.cancel(friendId);
      loadData(); // Reload friends
      toast.success('Friend request cancelled');
    } catch (error) {
      toast.error('Failed to cancel friend request. Please try again.');
    }
  };

  const handleRemoveFriend = async (id) => {
    try {
      await friendsAPI.remove(id);
      loadData(); // Reload leaderboard
    } catch (error) {
      // Silently handle error
    }
  };

  const handleCompleteHabit = async (id) => {
    try {
      await habitsAPI.complete(id);
      // Refresh user data and leaderboard to get updated Discipline Points (DP is awarded on habit completion)
      try {
        const [userRes, leaderboardRes, habitsRes] = await Promise.all([
          authAPI.getMe(),
          friendsAPI.getLeaderboard(),
          habitsAPI.getAll()
        ]);
        const { updateUser } = useAuthStore.getState();
        updateUser({
          ...userRes.data.user,
          xp: userRes.data.user.xp || 0,
          level: userRes.data.user.level || 1,
        });
        setLeaderboard(leaderboardRes.data || []);
        setHabits(habitsRes.data || []);
      } catch (e) {
        // Silently handle reload failure
      }
    } catch (error) {
      // Silently handle error
    }
  };

  const handleDeleteHabit = async (id) => {
    try {
      await habitsAPI.delete(id);
      loadData();
    } catch (error) {
      // Silently handle error
    }
  };

  const pendingTasks = Array.isArray(tasks) ? tasks.filter((t) => t.status === 'pending') : [];
  const completedTasks = Array.isArray(tasks) 
    ? tasks
        .filter((t) => t.status === 'completed')
        .sort((a, b) => {
          // Sort by completedAt (most recent first), fallback to updatedAt or createdAt
          const dateA = new Date(a.completedAt || a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.completedAt || b.updatedAt || b.createdAt || 0);
          return dateB - dateA; // Descending order (newest first)
        })
    : [];
  const activeGoals = Array.isArray(goals) ? goals.filter((g) => (g.progress || 0) < 100) : [];

  if (loading && tasks.length === 0) {
    return (
      <div className="flex min-h-screen bg-[var(--bg-primary)]">
        <Sidebar isOpen={false} onClose={() => {}} />
        <main id="main-content" className="flex-1 w-full md:ml-64 pt-14 md:pt-0 flex items-center justify-center" tabIndex="-1">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent-primary)] border-t-transparent"></div>
            <p className="text-[var(--text-secondary)]">Loading your dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] shadow-lg"
        aria-label="Open navigation menu"
        aria-expanded={isSidebarOpen}
      >
        <FaBars className="text-lg" />
      </button>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main id="main-content" className="flex-1 w-full md:ml-64 pt-14 md:pt-0" tabIndex="-1">
        {error && (
          <div className="p-4 mx-4 mt-4 rounded-lg border-l-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 text-yellow-800 dark:text-yellow-200">
            <div className="flex items-center justify-between">
              <p className="flex-1">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  loadData();
                }}
                className="ml-4 px-3 py-1 text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded transition-colors"
                aria-label="Retry loading data"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <DashboardHome
                user={user}
                tasks={tasks}
                goals={goals}
                habits={habits}
                friends={friends}
                analytics={analytics}
                leaderboard={leaderboard}
                pendingTasks={pendingTasks}
                completedTasks={completedTasks}
                activeGoals={activeGoals}
                activeChallenges={activeChallenges}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
                onUpdateGoalProgress={handleUpdateGoalProgress}
                onDeleteGoal={handleDeleteGoal}
                onEditGoal={handleEditGoal}
                onCompleteHabit={handleCompleteHabit}
                onDeleteHabit={handleDeleteHabit}
                setIsTaskModalOpen={setIsTaskModalOpen}
                setIsGoalModalOpen={setIsGoalModalOpen}
                setEditingTask={setEditingTask}
                setEditingGoal={setEditingGoal}
              />
            }
          />
          <Route
            path="calendar"
            element={
              <DashboardCalendar
                tasks={tasks}
                goals={goals}
                onDateClick={(date) => {
                  // Date clicked - could add functionality here
                }}
                onCreateTask={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
              />
            }
          />
          <Route
            path="tasks"
            element={
              <DashboardTasks
                tasks={tasks}
                pendingTasks={pendingTasks}
                completedTasks={completedTasks}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
                setIsTaskModalOpen={setIsTaskModalOpen}
                setEditingTask={setEditingTask}
                onCreateMultipleTasks={handleCreateMultipleTasks}
              />
            }
          />
          <Route
            path="goals"
            element={
              <DashboardGoals
                goals={goals}
                tasks={tasks}
                onUpdateGoalProgress={handleUpdateGoalProgress}
                onDeleteGoal={handleDeleteGoal}
                onEditGoal={handleEditGoal}
                setIsGoalModalOpen={setIsGoalModalOpen}
                setEditingGoal={setEditingGoal}
              />
            }
          />
          <Route
            path="analytics"
            element={
              <DashboardAnalytics
                analytics={analytics}
                user={user}
                tasks={tasks}
                goals={goals}
              />
            }
          />
              <Route
                path="team"
                element={
                  <DashboardTeam
                    friends={friends}
                    friendRequests={friendRequests}
                    sentFriendRequests={sentFriendRequests}
                    leaderboard={leaderboard}
                    tasks={tasks}
                    onAddFriend={() => setIsFriendModalOpen(true)}
                    onRemoveFriend={handleRemoveFriend}
                    onAcceptFriendRequest={handleAcceptFriendRequest}
                    onDeclineFriendRequest={handleDeclineFriendRequest}
                    onCancelFriendRequest={handleCancelFriendRequest}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onEditTask={handleEditTask}
                    setIsTaskModalOpen={setIsTaskModalOpen}
                    setEditingTask={setEditingTask}
                    currentUser={user}
                  />
                }
              />
              <Route
                path="gratitude"
                element={<GratitudeJournal />}
              />
              <Route
                path="notes"
                element={<NotesView />}
              />
              <Route
                path="challenges"
                element={<Challenges />}
              />
              <Route
                path="focus"
                element={<FocusModePage />}
              />
              <Route
                path="finance"
                element={<FinanceTracker />}
              />
              <Route
                path="profile"
                element={
                  <Profile
                    currentUser={user}
                    tasks={tasks}
                    goals={goals}
                  />
                }
              />
              <Route
                path="profile/:userId"
                element={
                  <Profile
                    currentUser={user}
                    tasks={tasks}
                    goals={goals}
                  />
                }
              />
        </Routes>

        {/* Modals */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleCreateTask}
          task={editingTask}
        />

        <GoalModal
          isOpen={isGoalModalOpen}
          onClose={() => {
            setIsGoalModalOpen(false);
            setEditingGoal(null);
          }}
          onSave={handleCreateGoal}
          goal={editingGoal}
        />

        <AddFriendModal
          isOpen={isFriendModalOpen}
          onClose={() => setIsFriendModalOpen(false)}
          onAdd={handleAddFriend}
        />
      </main>
    </div>
  );
};

export default Dashboard;
