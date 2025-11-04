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
      const [tasksRes, goalsRes, friendsRes, analyticsRes, leaderboardRes, habitsRes, authRes] =
        await Promise.all([
          tasksAPI.getAll(),
          goalsAPI.getAll(),
          friendsAPI.getAll(),
          analyticsAPI.getDashboard(),
          friendsAPI.getLeaderboard(),
          habitsAPI.getAll(),
          authAPI.getMe(),
        ]);

      setTasks(tasksRes.data);
      setGoals(goalsRes.data);
      setFriends(friendsRes.data);
      setAnalytics(analyticsRes.data);
      setLeaderboard(leaderboardRes.data);
      setHabits(habitsRes.data);

      if (authRes?.data?.user) {
        const { updateUser } = useAuthStore.getState();
        updateUser({
          ...user,
          xp: authRes.data.user.xp || 0,
          level: authRes.data.user.level || 1,
          streak: authRes.data.user.streak || 0,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
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
      await tasksAPI.update(id, { status: newStatus });
      loadData(); // Reload to update analytics
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await tasksAPI.delete(id);
      loadData(); // Reload to update analytics
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = async (taskData) => {
    try {
      if (editingTask) {
        await tasksAPI.update(editingTask._id, taskData);
      } else {
        await tasksAPI.create(taskData);
      }
      loadData();
      setIsTaskModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
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
      await friendsAPI.add(email);
      loadData(); // Reload leaderboard
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent-primary)] border-t-transparent mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading dashboard...</p>
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
                onAddFriend={() => setIsFriendModalOpen(true)}
                onRemoveFriend={handleRemoveFriend}
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
