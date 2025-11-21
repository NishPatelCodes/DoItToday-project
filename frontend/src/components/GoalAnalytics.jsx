import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaChartLine, FaTasks, FaCheckCircle, FaClock, FaFire } from 'react-icons/fa';
import { analyticsAPI } from '../services/api';
import { useScrollLock } from '../hooks/useScrollLock';

const GoalAnalytics = ({ goal, tasks = [], onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Lock body scroll when modal is open (always open when rendered)
  useScrollLock(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!goal?._id) return;
      
      try {
        setLoading(true);
        const response = await analyticsAPI.getGoalAnalytics(goal._id);
        setAnalytics(response.data);
      } catch (error) {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [goal]);

  // Filter tasks for this goal
  const goalTasks = useMemo(() => {
    if (!goal?._id) return [];
    return tasks.filter(t => {
      const taskGoalId = t.goalId?._id || t.goalId;
      return taskGoalId?.toString() === goal._id.toString();
    });
  }, [tasks, goal]);

  const completedTasks = goalTasks.filter(t => t.status === 'completed');
  const pendingTasks = goalTasks.filter(t => t.status === 'pending');

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="card p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent-primary)] border-t-transparent mb-4"></div>
            <p className="text-[var(--text-secondary)]">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{goal?.title}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{goal?.description || 'Goal Analytics'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-tertiary)] hover:text-red-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Overview Stats */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[var(--text-secondary)]">Total Tasks</p>
                <FaTasks className="text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {analytics.overview?.totalTasks || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[var(--text-secondary)]">Completed</p>
                <FaCheckCircle className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {analytics.overview?.completedTasks || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[var(--text-secondary)]">Completion Rate</p>
                <FaChartLine className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {analytics.overview?.completionRate || 0}%
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[var(--text-secondary)]">Avg Tasks/Day</p>
                <FaFire className="text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {analytics.overview?.avgTasksPerDay?.toFixed(1) || '0.0'}
              </p>
            </motion.div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Productivity Chart */}
          {analytics?.dailyProductivity && analytics.dailyProductivity.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Daily Progress (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.dailyProductivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--text-secondary)"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                    }}
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString();
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Completed"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    name="Total"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Weekly Completion Chart */}
          {analytics?.weeklyCompletion && analytics.weeklyCompletion.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Weekly Completion (Last 8 Weeks)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.weeklyCompletion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="week" 
                    stroke="var(--text-secondary)"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="total" fill="#6366f1" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* Associated Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Associated Tasks ({goalTasks.length})
          </h3>
          {goalTasks.length === 0 ? (
            <p className="text-center text-[var(--text-secondary)] py-8">
              No tasks associated with this goal yet. Create tasks and link them to this goal!
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {goalTasks.map((task) => (
                <div
                  key={task._id}
                  className={`p-3 rounded-lg border transition-all ${
                    task.status === 'completed'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`font-medium ${
                        task.status === 'completed'
                          ? 'text-green-800 dark:text-green-200 line-through'
                          : 'text-[var(--text-primary)]'
                      }`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        {task.priority}
                      </span>
                      {task.status === 'completed' && (
                        <FaCheckCircle className="text-green-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GoalAnalytics;

