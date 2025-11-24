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
  FaUserFriends,
  FaPlus,
} from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../hooks/useTheme';
import { authAPI, friendsAPI, analyticsAPI, tasksAPI, goalsAPI } from '../services/api';
import DisciplinePoints from './DisciplinePoints';
import GraphCard from './GraphCard';
import TaskCard from './TaskCard';
import FriendStatus from './FriendStatus';
import { useMemo } from 'react';
import { EmptyTasksIllustration, EmptyGoalsIllustration, EmptyFriendsIllustration } from './Illustrations';

const Profile = ({ 
  currentUser, 
  tasks = [], 
  goals = [], 
  onViewFriendProfile,
  friends = [],
  friendRequests = [],
  sentFriendRequests = [],
  leaderboard = [],
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
  const [teamSubTab, setTeamSubTab] = useState('friends');

  // Get user rank from leaderboard for Team tab
  const teamUserRank = useMemo(() => {
    if (!currentUser || !leaderboard.length) return null;
    const userId = currentUser._id || currentUser.id;
    const rankIndex = leaderboard.findIndex(
      (user) => (user._id || user.id)?.toString() === userId?.toString()
    );
    return rankIndex !== -1 ? rankIndex + 1 : null;
  }, [leaderboard, currentUser]);

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
      <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent-primary)] border-t-transparent mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser && !authUser) {
    return (
      <div className="p-4 md:p-6 lg:p-8 text-center">
        <p className="text-[var(--text-secondary)]">Profile not found</p>
      </div>
    );
  }

  const user = profileUser || authUser;
  const completedTasksCount = profileTasks.filter((t) => t.status === 'completed').length;
  const pendingTasksCount = profileTasks.filter((t) => {
    if (t.status !== 'pending') return false;
    // Exclude tasks that are due (overdue)
    if (t.dueDate) {
      const dueDate = new Date(t.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      // Only count tasks that are not due yet (dueDate is today or in the future)
      return dueDate >= today;
    }
    // Tasks without due date are counted as pending
    return true;
  }).length;
  const activeGoalsCount = profileGoals.filter((g) => (g.progress || 0) < 100).length;

      return (
        <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 md:mb-6 lg:mb-8"
          >
        {!isOwnProfile && (
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="mb-4 flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Profile & Team</span>
          </button>
        )}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-lg">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-1 md:mb-2">
              {isOwnProfile ? 'Profile & Team' : (user?.name || 'User')}
            </h1>
            <p className="text-sm md:text-base text-[var(--text-secondary)] flex items-center gap-2">
              <FaEnvelope className="text-xs" />
              {user?.email || 'No email'}
            </p>
            {userRank && (
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Rank #{userRank} on Leaderboard
              </p>
            )}
          </div>
        </div>
      </motion.div>

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
                onClick={() => {
                  setActiveTab('team');
                  setTeamSubTab('friends');
                }}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'team'
                    ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Team
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
          {/* Discipline Points Card */}
          <DisciplinePoints
            xp={user?.xp || 0}
            level={user?.level || 1}
            streak={user?.streak || 0}
          />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ delay: 0, duration: 0.5 }}
              className="relative overflow-hidden rounded-xl md:rounded-2xl p-3 md:p-6 shadow-md md:shadow-lg backdrop-blur-sm border transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.12) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <div
                    className="p-2 md:p-3 rounded-lg md:rounded-xl backdrop-blur-sm transition-all duration-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <FaCheckCircle className="text-base md:text-xl text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-medium text-[var(--text-secondary)]">Completed Tasks</p>
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                  {completedTasksCount}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="relative overflow-hidden rounded-xl md:rounded-2xl p-3 md:p-6 shadow-md md:shadow-lg backdrop-blur-sm border transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.12) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <div
                    className="p-2 md:p-3 rounded-lg md:rounded-xl backdrop-blur-sm transition-all duration-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <FaTasks className="text-base md:text-xl text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-medium text-[var(--text-secondary)]">Pending Tasks</p>
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                  {pendingTasksCount}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative overflow-hidden rounded-xl md:rounded-2xl p-3 md:p-6 shadow-md md:shadow-lg backdrop-blur-sm border transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.12) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <div
                    className="p-2 md:p-3 rounded-lg md:rounded-xl backdrop-blur-sm transition-all duration-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <FaBullseye className="text-base md:text-xl text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-medium text-[var(--text-secondary)]">Active Goals</p>
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                  {activeGoalsCount}
                </p>
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
            <div className="rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-md md:shadow-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <h2 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-4 md:mb-6">
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
            <div className="rounded-xl md:rounded-2xl p-8 md:p-12 text-center border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-md md:shadow-lg">
              <EmptyTasksIllustration className="w-40 h-40 mx-auto mb-4" />
              <p className="text-[var(--text-secondary)] mb-2 font-medium">No tasks yet</p>
              <p className="text-sm text-[var(--text-tertiary)]">Start by creating your first task</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'goals' && isOwnProfile && (
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-4 md:mb-6">All Goals</h2>
          {profileGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
              {profileGoals.map((goal) => (
                <motion.div
                  key={goal._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]"
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
            <div className="rounded-xl md:rounded-2xl p-8 md:p-12 text-center border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-md md:shadow-lg">
              <EmptyGoalsIllustration className="w-40 h-40 mx-auto mb-4" />
              <p className="text-[var(--text-secondary)] mb-2 font-medium">No goals yet</p>
              <p className="text-sm text-[var(--text-tertiary)]">Set your first goal to track progress</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'team' && isOwnProfile && (
        <div className="space-y-6">
          {/* Team Tabs */}
          <div className="flex gap-2 mb-6 border-b border-[var(--border-color)]">
            <button
              onClick={() => setTeamSubTab('friends')}
              className={`px-4 py-2 font-medium transition-colors ${
                teamSubTab === 'friends'
                  ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Friends ({friends.length})
            </button>
            <button
              onClick={() => setTeamSubTab('requests')}
              className={`px-4 py-2 font-medium transition-colors relative ${
                teamSubTab === 'requests'
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
              onClick={() => setTeamSubTab('leaderboard')}
              className={`px-4 py-2 font-medium transition-colors ${
                teamSubTab === 'leaderboard'
                  ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Leaderboard
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
            {/* Friends List */}
            {teamSubTab === 'friends' && (
              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-md md:shadow-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <div className="flex items-center justify-between mb-4 md:mb-6">
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
                    {friends.map((friend) => {
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
                  <div className="text-center py-8">
                    <EmptyFriendsIllustration className="w-40 h-40 mx-auto mb-4" />
                    <p className="text-[var(--text-secondary)] mb-2 font-medium">No friends yet</p>
                    <p className="text-sm text-[var(--text-tertiary)] mb-4">Connect with friends to compete and stay motivated</p>
                    {onAddFriend && (
                      <button
                        onClick={onAddFriend}
                        className="btn-primary"
                      >
                        Add Your First Friend
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Friend Requests */}
            {teamSubTab === 'requests' && (
              <div className="space-y-6">
                {/* Incoming Requests */}
                {friendRequests.length > 0 && (
                  <div className="rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-md md:shadow-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    <h2 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-4 md:mb-6">Incoming Requests</h2>
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
                  <div className="rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-md md:shadow-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    <h2 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-4 md:mb-6">Sent Requests</h2>
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
                  <div className="rounded-xl md:rounded-2xl p-8 md:p-12 text-center border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-md md:shadow-lg text-[var(--text-tertiary)]">
                    <p>No pending requests</p>
                  </div>
                )}
              </div>
            )}

            {/* Leaderboard */}
            {teamSubTab === 'leaderboard' && (
              <>
                <div className="rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-md md:shadow-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                  <h2 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-4 md:mb-6">Leaderboard</h2>
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

                {/* Your Rank Card */}
                {teamUserRank && (
                  <div className="rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-md md:shadow-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(124, 58, 237, 0.08) 100%)',
                    }}
                  >
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Your Rank</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center font-bold text-2xl">
                        {teamUserRank}
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
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && isOwnProfile && (
        <div className="space-y-3 md:space-y-4 lg:space-y-6 max-w-2xl mx-auto">
          {/* Theme Settings */}
          <div className="rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-md md:shadow-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <h2 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-4 md:mb-6 flex items-center gap-2">
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
          <div className="rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-md md:shadow-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <h2 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-4 md:mb-6 flex items-center gap-2">
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
          <div className="rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-md md:shadow-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <h2 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-4 md:mb-6 flex items-center gap-2">
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
          <div className="rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-md md:shadow-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
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

