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
} from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import {
  tasksAPI,
  goalsAPI,
  friendsAPI,
  analyticsAPI,
  habitsAPI,
  authAPI,
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    tasks,
    goals,
    habits,
    friends,
    analytics,
    leaderboard,
    setTasks,
    setGoals,
    setHabits,
    setFriends,
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
        console.log('Tasks loaded:', tasksData.length);
        
        // Debug: Check for shared tasks
        const sharedCount = tasksData.filter(t => {
          const hasSharedWith = t.sharedWith && Array.isArray(t.sharedWith) && t.sharedWith.length > 0;
          const isShared = t.isShared === true;
          return hasSharedWith || isShared;
        }).length;
        console.log('Shared tasks found:', sharedCount);
        if (sharedCount > 0) {
          console.log('Shared tasks details:', tasksData.filter(t => {
            const hasSharedWith = t.sharedWith && Array.isArray(t.sharedWith) && t.sharedWith.length > 0;
            const isShared = t.isShared === true;
            return hasSharedWith || isShared;
          }));
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        setError('Failed to load tasks. Please refresh the page.');
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }

      // Load other data in parallel (non-critical)
      const [goalsRes, friendsRes, analyticsRes, leaderboardRes, habitsRes, authRes] =
        await Promise.allSettled([
          goalsAPI.getAll(),
          friendsAPI.getAll(),
          analyticsAPI.getDashboard(),
          friendsAPI.getLeaderboard(),
          habitsAPI.getAll(),
          authAPI.getMe(),
        ]);

      // Handle results with error handling
      if (goalsRes.status === 'fulfilled') {
        setGoals(goalsRes.value.data || []);
      } else {
        console.error('Error loading goals:', goalsRes.reason);
      }

      if (friendsRes.status === 'fulfilled') {
        const friendsData = friendsRes.value.data || {};
        // Handle new response format (with friendRequests) or old format (array)
        if (Array.isArray(friendsData)) {
          setFriends(friendsData);
        } else {
          setFriends(friendsData.friends || []);
          // Store friend requests if needed in future
          if (friendsData.friendRequests) {
            console.log('Friend requests:', friendsData.friendRequests);
          }
        }
      } else {
        console.error('Error loading friends:', friendsRes.reason);
        setFriends([]);
      }

      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value.data || {});
      } else {
        console.error('Error loading analytics:', analyticsRes.reason);
        setAnalytics({});
      }

      if (leaderboardRes.status === 'fulfilled') {
        setLeaderboard(leaderboardRes.value.data || []);
      } else {
        console.error('Error loading leaderboard:', leaderboardRes.reason);
        setLeaderboard([]);
      }

      if (habitsRes.status === 'fulfilled') {
        setHabits(habitsRes.value.data || []);
      } else {
        console.error('Error loading habits:', habitsRes.reason);
        setHabits([]);
      }

      if (authRes.status === 'fulfilled' && authRes.value?.data?.user) {
        const { updateUser } = useAuthStore.getState();
        updateUser({
          ...user,
          xp: authRes.value.data.user.xp || 0,
          level: authRes.value.data.user.level || 1,
          streak: authRes.value.data.user.streak || 0,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Failed to load some data. Please refresh the page.');
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
      const response = await tasksAPI.update(id, { status: newStatus });
      
      // Update task in store immediately
      const { updateTask } = useDataStore.getState();
      updateTask(id, response.data);
      
      // Reload only analytics to update stats
      try {
        const analyticsRes = await analyticsAPI.getDashboard();
        setAnalytics(analyticsRes.data || {});
      } catch (e) {
        console.error('Error reloading analytics:', e);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      alert('Failed to update task. Please try again.');
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
        console.error('Error reloading analytics:', e);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = async (taskData) => {
    try {
      console.log('Creating task with data:', taskData);
      let newTask;
      if (editingTask) {
        const response = await tasksAPI.update(editingTask._id, taskData);
        newTask = response.data;
        console.log('Task updated:', newTask);
        // Update task in store
        const { updateTask } = useDataStore.getState();
        updateTask(editingTask._id, newTask);
      } else {
        const response = await tasksAPI.create(taskData);
        newTask = response.data;
        console.log('Task created:', newTask);
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
        console.error('Error reloading analytics:', e);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
      throw error;
    }
  };

  const handleUpdateGoalProgress = async (id, progress) => {
    try {
      await goalsAPI.update(id, { progress });
      loadData(); // Reload to update analytics
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await goalsAPI.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting goal:', error);
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
      console.error('Error saving goal:', error);
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
      } else {
        setFriends(friendsData.friends || []);
      }
      loadData(); // Reload leaderboard
      return response;
    } catch (error) {
      console.error('Error adding friend:', error);
      throw error;
    }
  };

  const handleRemoveFriend = async (id) => {
    try {
      await friendsAPI.remove(id);
      loadData(); // Reload leaderboard
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handleCompleteHabit = async (id) => {
    try {
      await habitsAPI.complete(id);
      loadData(); // Reload to update XP
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };

  const handleDeleteHabit = async (id) => {
    try {
      await habitsAPI.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const activeGoals = goals.filter((g) => (g.progress || 0) < 100);

  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent-primary)] border-t-transparent mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading dashboard...</p>
          {loadingTasks && (
            <p className="text-sm text-[var(--text-tertiary)] mt-2">Loading your tasks...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64">
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
                onDateClick={(date) => console.log('Date clicked:', date)}
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
              />
            }
          />
          <Route
            path="goals"
            element={
              <DashboardGoals
                goals={goals}
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
              />
            }
          />
              <Route
                path="team"
                element={
                  <DashboardTeam
                    friends={friends}
                    leaderboard={leaderboard}
                    tasks={tasks}
                    onAddFriend={() => setIsFriendModalOpen(true)}
                    onRemoveFriend={handleRemoveFriend}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onEditTask={handleEditTask}
                    setIsTaskModalOpen={setIsTaskModalOpen}
                    setEditingTask={setEditingTask}
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
