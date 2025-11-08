import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaEnvelope,
  FaTrophy,
  FaStar,
  FaFire,
  FaTasks,
  FaCheckCircle,
  FaBullseye,
  FaChartLine,
  FaCog,
  FaMoon,
  FaSun,
  FaBell,
  FaEye,
  FaArrowLeft,
} from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../hooks/useTheme';
import { authAPI, friendsAPI, analyticsAPI, tasksAPI, goalsAPI } from '../services/api';
import XPLevel from './XPLevel';
import GraphCard from './GraphCard';
import TaskCard from './TaskCard';
import RankFrame from './RankFrame';

const Profile = ({ currentUser, tasks = [], goals = [], onViewFriendProfile }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileTasks, setProfileTasks] = useState([]);
  const [profileGoals, setProfileGoals] = useState([]);
  const [profileAnalytics, setProfileAnalytics] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        if (userId && userId !== authUser?._id) {
          // Loading friend's profile
          setIsOwnProfile(false);
          // Get friend's activity
          try {
            const activityRes = await friendsAPI.getActivity(userId);
            setProfileUser(activityRes.data?.user || null);
            setProfileTasks(activityRes.data?.tasks || []);
            setProfileGoals(activityRes.data?.goals || []);
          } catch (error) {
            console.error('Failed to load friend profile:', error);
            setProfileUser(null);
          }
          
          // Load leaderboard to determine friend's rank
          try {
            const leaderboardRes = await friendsAPI.getLeaderboard();
            const leaderboard = leaderboardRes.data || [];
            const friendId = userId;
            const rankIndex = leaderboard.findIndex(
              (user) => (user._id || user.id)?.toString() === friendId?.toString()
            );
            if (rankIndex !== -1) {
              setUserRank(rankIndex + 1);
            }
          } catch (error) {
            console.error('Failed to load leaderboard:', error);
          }
        } else {
          // Loading own profile
          setIsOwnProfile(true);
          setProfileUser(authUser);
          setProfileTasks(tasks);
          setProfileGoals(goals);
          
          // Load analytics for own profile
          try {
            const analyticsRes = await analyticsAPI.getDashboard();
            setProfileAnalytics(analyticsRes.data || {});
          } catch (error) {
            console.error('Failed to load analytics:', error);
          }
          
          // Load leaderboard to determine rank
          try {
            const leaderboardRes = await friendsAPI.getLeaderboard();
            const leaderboard = leaderboardRes.data || [];
            const currentUserId = authUser?._id || authUser?.id;
            const rankIndex = leaderboard.findIndex(
              (user) => (user._id || user.id)?.toString() === currentUserId?.toString()
            );
            if (rankIndex !== -1) {
              setUserRank(rankIndex + 1);
            }
          } catch (error) {
            console.error('Failed to load leaderboard:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, authUser, tasks, goals]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent-primary)] border-t-transparent mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser && !authUser) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--text-secondary)]">Profile not found</p>
      </div>
    );
  }

  const user = profileUser || authUser;
  const completedTasksCount = profileTasks.filter((t) => t.status === 'completed').length;
  const pendingTasksCount = profileTasks.filter((t) => t.status === 'pending').length;
  const activeGoalsCount = profileGoals.filter((g) => (g.progress || 0) < 100).length;

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        {!isOwnProfile && (
          <button
            onClick={() => navigate('/dashboard/team')}
            className="mb-4 flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Team</span>
          </button>
        )}
        <div className="flex items-center gap-4">
          <RankFrame rank={userRank} size="default">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </RankFrame>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-1">
              {user?.name || 'User'}
            </h1>
            <p className="text-sm md:text-base text-[var(--text-secondary)] flex items-center gap-2">
              <FaEnvelope className="text-xs" />
              {user?.email || 'No email'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-[var(--border-color)]">
        <div className="flex gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Overview
          </button>
          {isOwnProfile && (
            <>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'tasks'
                    ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'goals'
                    ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Goals
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Settings
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* XP Level Card */}
          <XPLevel
            xp={user?.xp || 0}
            level={user?.level || 1}
            streak={user?.streak || 0}
          />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-4 md:p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <FaCheckCircle className="text-green-500 text-xl" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Completed Tasks</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {completedTasksCount}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-4 md:p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <FaTasks className="text-blue-500 text-xl" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Pending Tasks</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {pendingTasksCount}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-4 md:p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <FaBullseye className="text-purple-500 text-xl" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Active Goals</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {activeGoalsCount}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Analytics Charts (only for own profile) */}
          {isOwnProfile && profileAnalytics && (
            <>
              {profileAnalytics.dailyProductivity && (
                <GraphCard
                  title="Daily Productivity (Last 30 Days)"
                  data={profileAnalytics.dailyProductivity}
                  type="line"
                />
              )}
              {profileAnalytics.weeklyCompletion && (
                <GraphCard
                  title="Weekly Task Completion (Last 8 Weeks)"
                  data={profileAnalytics.weeklyCompletion}
                  type="bar"
                />
              )}
            </>
          )}

          {/* Recent Tasks */}
          {profileTasks.length > 0 && (
            <div className="card p-4 md:p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Recent Tasks
              </h2>
              <div className="space-y-2">
                {profileTasks.slice(0, 5).map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && isOwnProfile && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">All Tasks</h2>
          {profileTasks.length > 0 ? (
            <div className="space-y-2">
              {profileTasks.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-[var(--text-secondary)]">No tasks yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'goals' && isOwnProfile && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">All Goals</h2>
          {profileGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileGoals.map((goal) => (
                <motion.div
                  key={goal._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-4"
                >
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                    {goal.title}
                  </h3>
                  <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${goal.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {goal.progress || 0}% Complete
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-[var(--text-secondary)]">No goals yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && isOwnProfile && (
        <div className="space-y-6 max-w-2xl">
          {/* Theme Settings */}
          <div className="card p-4 md:p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              {theme === 'light' ? <FaMoon /> : <FaSun />}
              Theme
            </h2>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] rounded-lg transition-colors"
            >
              <span className="text-[var(--text-primary)]">
                {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              </span>
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>
          </div>

          {/* Notifications */}
          <div className="card p-4 md:p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <FaBell />
              Notifications
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-primary)] font-medium">Enable Notifications</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Receive updates about your tasks and goals
                </p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-tertiary)]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="card p-4 md:p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <FaUser />
              Account Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-1">Name</p>
                <p className="text-[var(--text-primary)]">{user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-1">Email</p>
                <p className="text-[var(--text-primary)]">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-1">Member Since</p>
                <p className="text-[var(--text-primary)]">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="card p-4 md:p-6">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

