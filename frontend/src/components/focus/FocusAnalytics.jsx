import { motion } from 'framer-motion';
import { FaChartLine, FaClock, FaTrophy, FaFire } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

/**
 * Focus Analytics Component
 * Displays charts and statistics for focus sessions
 */
const FocusAnalytics = ({ stats, dailyStats, weeklyStats, className = '' }) => {
  const chartColors = {
    primary: '#6D28D9',
    secondary: '#8B5CF6',
    background: 'var(--bg-secondary)',
    border: 'var(--border-color)',
    text: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
  };

  // Format daily stats for chart
  const chartData = dailyStats.map(day => ({
    date: day.label,
    minutes: day.minutes,
    sessions: day.sessions,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <FaClock className="text-[var(--accent-primary)]" />
            <span className="text-sm text-[var(--text-secondary)]">Total Time</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <FaChartLine className="text-[var(--accent-primary)]" />
            <span className="text-sm text-[var(--text-secondary)]">Sessions</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.totalSessions}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <FaTrophy className="text-[var(--accent-primary)]" />
            <span className="text-sm text-[var(--text-secondary)]">DP Earned</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.totalDP}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <FaFire className="text-[var(--accent-primary)]" />
            <span className="text-sm text-[var(--text-secondary)]">Streak</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.streak || 0} days
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Focus Time Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Daily Focus Time (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke={chartColors.textSecondary}
                style={{ fontSize: '12px' }}
                tick={{ fill: chartColors.textSecondary }}
              />
              <YAxis
                stroke={chartColors.textSecondary}
                tick={{ fill: chartColors.textSecondary }}
                label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: chartColors.textSecondary }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.background,
                  border: `1px solid ${chartColors.border}`,
                  borderRadius: '8px',
                  color: chartColors.text,
                }}
                formatter={(value) => [`${value} min`, 'Focus Time']}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke={chartColors.primary}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#focusGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sessions Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Daily Sessions (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke={chartColors.textSecondary}
                style={{ fontSize: '12px' }}
                tick={{ fill: chartColors.textSecondary }}
              />
              <YAxis
                stroke={chartColors.textSecondary}
                tick={{ fill: chartColors.textSecondary }}
                label={{ value: 'Sessions', angle: -90, position: 'insideLeft', fill: chartColors.textSecondary }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.background,
                  border: `1px solid ${chartColors.border}`,
                  borderRadius: '8px',
                  color: chartColors.text,
                }}
                formatter={(value) => [`${value}`, 'Sessions']}
              />
              <Bar
                dataKey="sessions"
                fill={chartColors.primary}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Weekly Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          This Week's Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-[var(--text-secondary)] mb-1">Total Focus Time</div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {Math.floor(weeklyStats.totalMinutes / 60)}h {weeklyStats.totalMinutes % 60}m
            </div>
          </div>
          <div>
            <div className="text-sm text-[var(--text-secondary)] mb-1">Sessions Completed</div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {weeklyStats.totalSessions}
            </div>
          </div>
          <div>
            <div className="text-sm text-[var(--text-secondary)] mb-1">Average Session</div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {weeklyStats.averageSessionLength}m
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FocusAnalytics;

