import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FaFire,
  FaTrophy,
  FaHeadphones,
  FaStar,
  FaChartLine,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaAward,
  FaLightbulb,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  analyticsAPI,
  focusAPI,
  gratitudeAPI,
  challengesAPI,
  financeAPI,
  tasksAPI,
  habitsAPI,
  authAPI,
} from '../services/api';
import { useAuthStore } from '../store/authStore';

// Animated Number Component
const AnimatedNumber = ({ value, duration = 1.5, decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime = null;
    const startValue = 0;
    const endValue = value;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{displayValue.toFixed(decimals)}</>;
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon: Icon, gradient, delay = 0, trend, trendValue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 shadow-lg backdrop-blur-sm border border-white/10 dark:border-white/5"
      style={{
        background: gradient || 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-sm">
              <Icon className="text-xl text-[var(--accent-primary)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
              {trend && (
                <div className="flex items-center gap-1 mt-1">
                  {trend === 'up' ? (
                    <FaArrowUp className="text-green-500 text-xs" />
                  ) : (
                    <FaArrowDown className="text-red-500 text-xs" />
                  )}
                  <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {trendValue}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-3xl font-bold text-[var(--text-primary)]">
            <AnimatedNumber value={value} />
          </p>
          {subtitle && (
            <p className="text-sm text-[var(--text-tertiary)] mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
    </motion.div>
  );
};

// Circular Progress Component
const CircularProgress = ({ value, max = 100, size = 120, strokeWidth = 8, color = '#6366f1', label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / max) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-[var(--bg-tertiary)]"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-[var(--text-primary)]">{Math.round(value)}%</p>
          {label && <p className="text-xs text-[var(--text-tertiary)] mt-1">{label}</p>}
        </div>
      </div>
    </div>
  );
};

// Challenge Timeline Component
const ChallengeTimeline = ({ challenge }) => {
  if (!challenge) return null;
  const days = challenge.duration || 7;
  const completedDays = challenge.checkIns?.filter(c => c && c.completed).length || 0;
  
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {Array.from({ length: Math.min(days, 30) }).map((_, i) => {
        try {
          const isCompleted = challenge.checkIns?.some(
            c => c && c.completed && c.date && new Date(c.date).toDateString() === new Date(Date.now() - (days - i - 1) * 86400000).toDateString()
          );
          return (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                isCompleted
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-sm'
                  : 'bg-[var(--bg-tertiary)]'
              }`}
              title={isCompleted ? 'Completed' : 'Pending'}
            />
          );
        } catch (e) {
          return (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-[var(--bg-tertiary)]"
              title="Pending"
            />
          );
        }
      })}
    </div>
  );
};

const AnalyticsDashboard = ({ analytics: initialAnalytics, user: initialUser, tasks = [], goals = [] }) => {
  const { user: authUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(initialAnalytics || {});
  const [focusStats, setFocusStats] = useState(null);
  const [gratitudeStreak, setGratitudeStreak] = useState(0);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [financeStats, setFinanceStats] = useState(null);
  const [habits, setHabits] = useState([]);
  const [user, setUser] = useState(initialUser || authUser);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        analyticsRes,
        focusRes,
        gratitudeRes,
        challengesRes,
        financeRes,
        habitsRes,
        userRes,
      ] = await Promise.allSettled([
        analyticsAPI.getDashboard(),
        focusAPI.getStats(),
        gratitudeAPI.getStreak(),
        challengesAPI.getActive(),
        financeAPI.getStats(),
        habitsAPI.getAll(),
        authAPI.getMe(),
      ]);

      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value.data || {});
      }
      if (focusRes.status === 'fulfilled') {
        setFocusStats(focusRes.value.data || {});
      }
      if (gratitudeRes.status === 'fulfilled') {
        setGratitudeStreak(gratitudeRes.value.data?.streak || 0);
      }
      if (challengesRes.status === 'fulfilled') {
        setActiveChallenges(challengesRes.value.data || []);
      }
      if (financeRes.status === 'fulfilled') {
        setFinanceStats(financeRes.value.data || {});
      }
      if (habitsRes.status === 'fulfilled') {
        setHabits(habitsRes.value.data || []);
      }
      if (userRes.status === 'fulfilled') {
        setUser(userRes.value.data?.user || user);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const tasksArray = Array.isArray(tasks) ? tasks : [];
    const completedTasks = tasksArray.filter(t => t && t.status === 'completed');
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyTasks = tasksArray.filter(t => t && t.createdAt && new Date(t.createdAt) >= startOfMonth);
    const monthlyCompleted = monthlyTasks.filter(t => t && t.status === 'completed');
    const monthlyCompletionRate = monthlyTasks.length > 0 
      ? Math.round((monthlyCompleted.length / monthlyTasks.length) * 100) 
      : 0;

    const totalFocusHours = focusStats?.weeklyMinutes 
      ? Math.round((focusStats.weeklyMinutes / 60) * 10) / 10 
      : 0;

    const challengeProgress = activeChallenges.length > 0
      ? Math.round(activeChallenges.reduce((sum, c) => sum + (c.progress || 0), 0) / activeChallenges.length)
      : 0;

    return {
      disciplinePoints: user?.xp || 0,
      focusHours: totalFocusHours,
      reflectionStreak: gratitudeStreak,
      challengeProgress,
      monthlyTaskCompletion: monthlyCompletionRate,
    };
  }, [tasks, focusStats, gratitudeStreak, activeChallenges, user]);

  // Prepare chart data
  const focusChartData = useMemo(() => {
    if (!focusStats?.dailyStats) return [];
    return focusStats.dailyStats.map(day => ({
      date: day.label,
      hours: Math.round((day.minutes || 0) / 60 * 10) / 10,
      sessions: day.sessions || 0,
    }));
  }, [focusStats]);

  const taskCategoryData = useMemo(() => {
    const tasksArray = Array.isArray(tasks) ? tasks : [];
    const categories = {};
    tasksArray.forEach(task => {
      if (!task) return;
      const category = task.category || 'Other';
      if (!categories[category]) {
        categories[category] = { name: category, completed: 0, total: 0 };
      }
      categories[category].total++;
      if (task.status === 'completed') {
        categories[category].completed++;
      }
    });
    return Object.values(categories).map(cat => ({
      name: cat.name,
      value: cat.completed,
      total: cat.total,
    }));
  }, [tasks]);

  const weeklyTaskData = useMemo(() => {
    if (!analytics?.dailyProductivity || !Array.isArray(analytics.dailyProductivity)) return [];
    return analytics.dailyProductivity.map(day => {
      if (!day || !day.date) return { date: '', completed: 0, productivity: 0 };
      try {
        return {
          date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
          completed: day.completed || 0,
          productivity: day.productivity || 0,
        };
      } catch (e) {
        return { date: '', completed: 0, productivity: 0 };
      }
    }).filter(day => day.date);
  }, [analytics]);

  // Get discipline level
  const getDisciplineLevel = (xp) => {
    if (xp >= 10000) return { name: 'Elite', color: '#fbbf24', progress: 100 };
    if (xp >= 5000) return { name: 'Gold', color: '#f59e0b', progress: ((xp - 5000) / 5000) * 100 };
    if (xp >= 2000) return { name: 'Silver', color: '#94a3b8', progress: ((xp - 2000) / 3000) * 100 };
    return { name: 'Bronze', color: '#cd7f32', progress: (xp / 2000) * 100 };
  };

  const disciplineLevel = getDisciplineLevel(stats.disciplinePoints);

  // AI Insights (placeholder)
  const insights = useMemo(() => {
    try {
      const insightsList = [];
      if (focusStats?.totalMinutes > 0) {
        const weeklyAvg = focusStats.totalMinutes / 7;
        insightsList.push(`You've focused ${Math.round(weeklyAvg)} minutes per day this week.`);
      }
      if (stats?.monthlyTaskCompletion > 80) {
        insightsList.push('Excellent task completion rate this month! Keep it up!');
      }
      if (gratitudeStreak > 7) {
        insightsList.push(`Amazing ${gratitudeStreak}-day reflection streak!`);
      }
      if (activeChallenges.length > 0 && stats?.challengeProgress > 50) {
        insightsList.push('Your challenge progress is looking great!');
      }
      return insightsList.length > 0 ? insightsList : ['Keep building your habits day by day!'];
    } catch (e) {
      console.error('Error generating insights:', e);
      return ['Keep building your habits day by day!'];
    }
  }, [focusStats, stats, gratitudeStreak, activeChallenges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent-primary)] border-t-transparent mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Safety check - ensure stats is defined
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-[var(--text-secondary)]">Preparing analytics...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-[var(--text-secondary)]">
          Track your productivity, discipline, and progress
        </p>
      </motion.div>

      {/* Top Insight Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        <StatCard
          title="Discipline Points"
          value={stats.disciplinePoints}
          subtitle={`${disciplineLevel.name} Level`}
          icon={FaStar}
          gradient="linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)"
          delay={0}
        />
        <StatCard
          title="Focus Hours"
          value={stats.focusHours}
          subtitle="Total this week"
          icon={FaHeadphones}
          gradient="linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)"
          delay={0.1}
        />
        <StatCard
          title="Reflection Streak"
          value={stats.reflectionStreak}
          subtitle="Days in a row"
          icon={FaFire}
          gradient="linear-gradient(135deg, rgba(251, 113, 133, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)"
          delay={0.2}
        />
        <StatCard
          title="Challenge Progress"
          value={stats.challengeProgress}
          subtitle="% Average"
          icon={FaTrophy}
          gradient="linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)"
          delay={0.3}
        />
        <StatCard
          title="Task Completion"
          value={stats.monthlyTaskCompletion}
          subtitle="% This month"
          icon={FaCheckCircle}
          gradient="linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)"
          delay={0.4}
        />
      </div>

      {/* Focus Mode Analytics */}
      {focusStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-[var(--bg-secondary)] p-6 md:p-8 border border-[var(--border-color)] shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
              <FaHeadphones className="text-xl text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Focus Mode Analytics</h2>
              <p className="text-sm text-[var(--text-secondary)]">Your focus session insights</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Total Hours</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {Math.round((focusStats.totalMinutes || 0) / 60 * 10) / 10}h
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">All time</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              <p className="text-sm text-[var(--text-secondary)] mb-1">This Week</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {Math.round((focusStats.weeklyMinutes || 0) / 60 * 10) / 10}h
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Weekly total</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Sessions</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{focusStats.totalSessions || 0}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Completed</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Avg Session</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {focusStats.averageSessionLength || 0}m
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Length</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              <p className="text-sm text-[var(--text-secondary)] mb-1">DP Earned</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{focusStats.totalDP || 0}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">From focus</p>
            </div>
          </div>

          {focusChartData.length > 0 && (
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={focusChartData}>
                  <defs>
                    <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    stroke="var(--text-secondary)"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="var(--text-secondary)"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#focusGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      )}

      {/* Reflection Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl bg-[var(--bg-secondary)] p-6 md:p-8 border border-[var(--border-color)] shadow-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
            <FaFire className="text-xl text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Reflection Analytics</h2>
            <p className="text-sm text-[var(--text-secondary)]">Gratitude journal insights</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <CircularProgress
              value={Math.min((gratitudeStreak / 30) * 100, 100)}
              size={140}
              color="#f97316"
              label="30-day goal"
            />
            <p className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
              {gratitudeStreak} Day Streak
            </p>
            <p className="text-sm text-[var(--text-secondary)]">Keep it going!</p>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              <p className="text-sm text-[var(--text-secondary)] mb-2">Reflection Completion</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((gratitudeStreak / 7) * 100, 100)}%` }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {Math.round((gratitudeStreak / 7) * 100)}%
                </span>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-2">Weekly goal progress</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Positive Highlights</p>
              <div className="flex flex-wrap gap-2">
                {['Grateful', 'Blessed', 'Thankful', 'Appreciative', 'Joyful'].map((word, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Discipline Points Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="rounded-2xl bg-[var(--bg-secondary)] p-6 md:p-8 border border-[var(--border-color)] shadow-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20">
            <FaStar className="text-xl text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Discipline Points</h2>
            <p className="text-sm text-[var(--text-secondary)]">Your progress to the next level</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-6 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-[var(--text-secondary)]">Current Level</span>
                <span
                  className="px-3 py-1 text-sm font-bold rounded-full text-white"
                  style={{ backgroundColor: disciplineLevel.color }}
                >
                  {disciplineLevel.name}
                </span>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-[var(--text-primary)]">
                    {stats.disciplinePoints.toLocaleString()}
                  </span>
                  <span className="text-sm text-[var(--text-tertiary)]">DP</span>
                </div>
                <div className="w-full h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(disciplineLevel.progress, 100)}%` }}
                    transition={{ duration: 1.5 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${disciplineLevel.color} 0%, ${disciplineLevel.color}dd 100%)`,
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border-color)]">
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">From Tasks</p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">
                    {Math.round(stats.disciplinePoints * 0.4)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">From Focus</p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">
                    {focusStats?.totalDP || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-6 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              <p className="text-sm font-medium text-[var(--text-secondary)] mb-4">Level Progression</p>
              <div className="space-y-3">
                {[
                  { name: 'Bronze', threshold: 0, color: '#cd7f32' },
                  { name: 'Silver', threshold: 2000, color: '#94a3b8' },
                  { name: 'Gold', threshold: 5000, color: '#f59e0b' },
                  { name: 'Elite', threshold: 10000, color: '#fbbf24' },
                ].map((level, i) => {
                  const isUnlocked = stats.disciplinePoints >= level.threshold;
                  const isCurrent = disciplineLevel.name === level.name;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isUnlocked ? 'ring-2 ring-offset-2' : 'opacity-30'
                        }`}
                        style={{
                          backgroundColor: isUnlocked ? level.color : 'var(--bg-tertiary)',
                          ringColor: isCurrent ? level.color : 'transparent',
                        }}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isUnlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                        }`}
                      >
                        {level.name} ({level.threshold.toLocaleString()} DP)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Challenges Analytics */}
      {activeChallenges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl bg-[var(--bg-secondary)] p-6 md:p-8 border border-[var(--border-color)] shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
              <FaTrophy className="text-xl text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Active Challenges</h2>
              <p className="text-sm text-[var(--text-secondary)]">Track your challenge progress</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeChallenges.map((challenge, i) => {
              if (!challenge || !challenge._id) return null;
              return (
                <motion.div
                  key={challenge._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="p-5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--text-primary)] mb-1">{challenge.name || 'Unnamed Challenge'}</h3>
                      <p className="text-xs text-[var(--text-secondary)]">{challenge.description || ''}</p>
                    </div>
                    <span className="text-2xl font-bold text-yellow-500">{challenge.progress || 0}%</span>
                  </div>
                <div className="mb-4">
                  <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${challenge.progress || 0}%` }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] mb-1">Check-in Timeline</p>
                    <ChallengeTimeline challenge={challenge} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--text-secondary)]">Success Rate</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {challenge.checkIns?.filter(c => c.completed).length || 0}/
                      {challenge.duration || 0}
                    </p>
                  </div>
                </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Task & Habit Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="rounded-2xl bg-[var(--bg-secondary)] p-6 md:p-8 border border-[var(--border-color)] shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
              <FaTasks className="text-xl text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Task Analytics</h2>
              <p className="text-sm text-[var(--text-secondary)]">Productivity insights</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)] mb-1">Completed</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {Array.isArray(tasks) ? tasks.filter(t => t && t.status === 'completed').length : 0}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)] mb-1">Completion Rate</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {Array.isArray(tasks) && tasks.length > 0
                    ? Math.round((tasks.filter(t => t && t.status === 'completed').length / tasks.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>

            {weeklyTaskData.length > 0 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyTaskData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      stroke="var(--text-secondary)"
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="var(--text-secondary)"
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="completed" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {taskCategoryData.length > 0 && (
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)] mb-4">By Category</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {taskCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="rounded-2xl bg-[var(--bg-secondary)] p-6 md:p-8 border border-[var(--border-color)] shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
              <FaCheckCircle className="text-xl text-green-500" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Habit Analytics</h2>
              <p className="text-sm text-[var(--text-secondary)]">Track your daily habits</p>
            </div>
          </div>

          <div className="space-y-4">
            {Array.isArray(habits) && habits.length > 0 ? (
              habits.map((habit, i) => {
                if (!habit || !habit._id) return null;
                const completedToday = habit.completions?.some(
                  c => c && c.date && new Date(c.date).toDateString() === new Date().toDateString()
                );
                return (
                  <div
                    key={habit._id}
                    className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[var(--text-primary)]">{habit.name || 'Unnamed Habit'}</span>
                      {completedToday && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
                          Done today
                        </span>
                      )}
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(((habit.completions?.length || 0) / 30) * 100, 100)}%`,
                        }}
                        transition={{ duration: 1.5, delay: 1.0 + i * 0.1 }}
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] mt-2">
                      {habit.completions?.length || 0} completions this month
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                <p>No habits yet. Start building your routine!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Finance Tracker Snapshot */}
      {financeStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="rounded-2xl bg-[var(--bg-secondary)] p-6 md:p-8 border border-[var(--border-color)] shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
              <FaDollarSign className="text-xl text-green-500" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Finance Snapshot</h2>
              <p className="text-sm text-[var(--text-secondary)]">Quick financial overview</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-secondary)] mb-1">Daily Average</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                ${financeStats.dailyAverageSpending?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-secondary)] mb-1">Savings Progress</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                {financeStats.savingsProgress?.toFixed(0) || 0}%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-secondary)] mb-1">Income vs Expenses</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                {financeStats.income && financeStats.expenses
                  ? financeStats.income > financeStats.expenses
                    ? '+'
                    : '-'
                  : '—'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Achievements & Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="rounded-2xl bg-[var(--bg-secondary)] p-6 md:p-8 border border-[var(--border-color)] shadow-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20">
            <FaAward className="text-xl text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Achievements & Milestones</h2>
            <p className="text-sm text-[var(--text-secondary)]">Celebrate your wins</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: FaTrophy, label: 'Challenge Master', unlocked: activeChallenges.some(c => c.status === 'completed') },
            { icon: FaFire, label: '7-Day Streak', unlocked: gratitudeStreak >= 7 },
            { icon: FaHeadphones, label: 'Focus Pro', unlocked: (focusStats?.totalSessions || 0) >= 10 },
            { icon: FaStar, label: 'Elite Level', unlocked: disciplineLevel.name === 'Elite' },
          ].map((achievement, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              className={`p-4 rounded-xl border text-center ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/30'
                  : 'bg-[var(--bg-primary)] border-[var(--border-color)] opacity-50'
              }`}
            >
              <achievement.icon
                className={`text-3xl mb-2 mx-auto ${
                  achievement.unlocked ? 'text-yellow-500' : 'text-[var(--text-tertiary)]'
                }`}
              />
              <p
                className={`text-xs font-medium ${
                  achievement.unlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                }`}
              >
                {achievement.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-pink-500/10 p-6 md:p-8 border border-purple-500/20 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30">
            <FaLightbulb className="text-xl text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">AI Insights</h2>
            <p className="text-sm text-[var(--text-secondary)]">Personalized productivity tips</p>
          </div>
        </div>

        <div className="space-y-3">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 + i * 0.1 }}
              className="p-4 rounded-xl bg-[var(--bg-primary)] border border-purple-500/20 flex items-start gap-3"
            >
              <FaLightbulb className="text-lg text-purple-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[var(--text-primary)]">{insight}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;

