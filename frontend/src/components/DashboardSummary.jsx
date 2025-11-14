import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFire, FaTrophy, FaHeadphones, FaDollarSign, FaStar, FaFlag } from 'react-icons/fa';
import { challengesAPI, focusAPI, financeAPI, authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

const DashboardSummary = ({ user, streak }) => {
  const [activeChallenges, setActiveChallenges] = useState(0);
  const [focusTime, setFocusTime] = useState(0);
  const [financialGoal, setFinancialGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: authUser } = useAuthStore();

  useEffect(() => {
    loadSummaryData();
  }, []);

  const loadSummaryData = async () => {
    try {
      setLoading(true);
      const [challengesRes, focusRes, financeRes] = await Promise.allSettled([
        challengesAPI.getActive(),
        focusAPI.getStats(),
        financeAPI.getStats(),
      ]);

      if (challengesRes.status === 'fulfilled') {
        setActiveChallenges(challengesRes.value.data?.length || 0);
      }

      if (focusRes.status === 'fulfilled') {
        const focusData = focusRes.value.data || {};
        setFocusTime(focusData.totalMinutes || 0);
      }

      if (financeRes.status === 'fulfilled') {
        const financeData = financeRes.value.data || {};
        const activeGoals = financeData.savingsGoals?.filter(g => g.status === 'active') || [];
        if (activeGoals.length > 0) {
          // Get the first active goal
          const goal = activeGoals[0];
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          setFinancialGoal({
            name: goal.name,
            progress,
            currentAmount: goal.currentAmount,
            targetAmount: goal.targetAmount,
          });
        }
      }
    } catch (error) {
      console.error('Error loading summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFocusTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-[var(--bg-tertiary)] rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-6 md:mb-8">
      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <FaFlag />
        Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Reflection Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 md:p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">Reflection Streak</span>
            <FaFire className="text-orange-500" />
          </div>
          <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
            {streak || 0}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">days</p>
        </motion.div>

        {/* Active Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4 md:p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">Active Challenges</span>
            <FaTrophy className="text-yellow-500" />
          </div>
          <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
            {activeChallenges}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">challenges</p>
        </motion.div>

        {/* Focus Time This Week */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4 md:p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">Focus Time</span>
            <FaHeadphones className="text-purple-500" />
          </div>
          <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
            {formatFocusTime(focusTime)}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">this week</p>
        </motion.div>

        {/* Financial Goal Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4 md:p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">Savings Goal</span>
            <FaDollarSign className="text-green-500" />
          </div>
          {financialGoal ? (
            <>
              <p className="text-lg font-bold text-[var(--text-primary)] truncate">
                {financialGoal.name}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {financialGoal.progress.toFixed(0)}% complete
              </p>
              <div className="mt-2 w-full h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${financialGoal.progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-[var(--text-secondary)]">No active goals</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Set a savings goal</p>
            </>
          )}
        </motion.div>

        {/* Total Discipline Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-4 md:p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">Discipline Points</span>
            <FaStar className="text-yellow-500" />
          </div>
          <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
            {user?.xp || 0}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">{(user?.level || 1) >= 10 ? 'Max Level' : `Level ${user?.level || 1}`}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardSummary;

