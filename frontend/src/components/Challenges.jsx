import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaCheckCircle, FaTimes, FaFire, FaRedo, FaPlus, FaFlag } from 'react-icons/fa';
import { challengesAPI } from '../services/api';
import { useToast } from '../hooks/useToast';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPremadeModal, setShowPremadeModal] = useState(false);
  const toast = useToast();

  const premadeChallenges = [
    {
      id: 'no-social-media-7',
      name: 'No Social Media for 7 Days',
      description: 'Stay focused and avoid social media for 7 days. Build discipline and improve productivity.',
      duration: 7,
      icon: '📱',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'morning-workout-30',
      name: 'Morning Workout Challenge',
      description: 'Complete a morning workout every day for 30 days. Build a healthy habit and discipline.',
      duration: 30,
      icon: '💪',
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'gratitude-journal-30',
      name: 'Gratitude Journaling for 30 Days',
      description: 'Write in your gratitude journal every day for 30 days. Cultivate positivity and mindfulness.',
      duration: 30,
      icon: '🙏',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'read-daily-7',
      name: 'Read Daily for 7 Days',
      description: 'Read for at least 20 minutes every day for 7 days. Build a reading habit.',
      duration: 7,
      icon: '📚',
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'meditation-30',
      name: 'Daily Meditation Challenge',
      description: 'Meditate for at least 10 minutes every day for 30 days. Improve focus and mental clarity.',
      duration: 30,
      icon: '🧘',
      color: 'from-indigo-500 to-blue-500',
    },
  ];

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      // Load active challenges first (most important)
      setLoading(true);
      const activeRes = await challengesAPI.getActive();
      setActiveChallenges(activeRes.data || []);
      
      // Load other data in parallel without blocking
      Promise.all([
        challengesAPI.getAll(),
        challengesAPI.getCompleted(),
      ]).then(([allRes, completedRes]) => {
        setChallenges(allRes.data || []);
        setCompletedChallenges(completedRes.data || []);
      }).catch(() => {
        // Silently handle errors for non-critical data
      });
      
      // Set loading to false immediately after active challenges load
      setLoading(false);
    } catch (error) {
      console.error('Error loading challenges:', error);
      setLoading(false);
      // Don't show error toast, just load silently
    }
  };

  const handleStartPremadeChallenge = async (challengeType) => {
    try {
      await challengesAPI.createPremade(challengeType);
      toast.success('Challenge started! Stay disciplined 💪');
      loadChallenges();
      setShowPremadeModal(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to start challenge';
      toast.error(message);
    }
  };

  const handleCheckIn = async (challengeId) => {
    try {
      const response = await challengesAPI.checkIn(challengeId, { notes: '' });
      const challenge = response.data;
      
      toast.success('Check-in recorded! Keep going! 🔥');
      
      // Check if challenge is completed
      if (challenge.status === 'completed') {
        toast.success(`🎉 Challenge completed! You earned ${challenge.dpReward} Discipline Points!`, { duration: 5000 });
        // Trigger celebration animation
        setTimeout(() => {
          // Simple celebration effect
          const celebration = document.createElement('div');
          celebration.className = 'fixed inset-0 pointer-events-none z-50';
          celebration.innerHTML = '🎉';
          celebration.style.fontSize = '4rem';
          celebration.style.textAlign = 'center';
          celebration.style.paddingTop = '20vh';
          celebration.style.opacity = '0';
          document.body.appendChild(celebration);
          
          // Fade in and out
          setTimeout(() => {
            celebration.style.transition = 'opacity 0.5s';
            celebration.style.opacity = '1';
          }, 10);
          
          setTimeout(() => {
            celebration.style.opacity = '0';
            setTimeout(() => celebration.remove(), 500);
          }, 2000);
        }, 100);
      }
      
      loadChallenges();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to check in';
      toast.error(message);
    }
  };

  const handleRestart = async (challengeId) => {
    try {
      await challengesAPI.restart(challengeId);
      toast.success('Challenge restarted! Fresh start 🚀');
      loadChallenges();
    } catch (error) {
      toast.error('Failed to restart challenge');
    }
  };

  const handleAbandon = async (challengeId) => {
    try {
      await challengesAPI.delete(challengeId);
      toast.success('Challenge abandoned');
      loadChallenges();
    } catch (error) {
      toast.error('Failed to abandon challenge');
    }
  };

  const isCheckedInToday = (challenge) => {
    if (!challenge.checkIns || challenge.checkIns.length === 0) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return challenge.checkIns.some((checkIn) => {
      const checkInDate = new Date(checkIn.date);
      checkInDate.setHours(0, 0, 0, 0);
      return checkInDate.getTime() === today.getTime() && checkIn.completed;
    });
  };

  const getDaysRemaining = (challenge) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(challenge.endDate);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--bg-tertiary)] z-50">
          <div className="h-full bg-[var(--accent-primary)] animate-pulse" style={{ width: '60%' }}></div>
        </div>
        <div className="text-center mt-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent-primary)] border-t-transparent mb-4"></div>
          <p className="text-[var(--text-secondary)] text-sm">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Challenges
          </h1>
          <p className="text-[var(--text-secondary)]">
            Build discipline and achieve your goals with structured challenges
          </p>
        </div>
        <motion.button
          onClick={() => setShowPremadeModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus />
          Start Challenge
        </motion.button>
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <FaFire className="text-orange-500" />
            Active Challenges ({activeChallenges.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {activeChallenges.map((challenge) => {
              const checkedInToday = isCheckedInToday(challenge);
              const daysRemaining = getDaysRemaining(challenge);
              const progress = challenge.progress || 0;

              return (
                <motion.div
                  key={challenge._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-5 md:p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                        {challenge.name}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-3">
                        {challenge.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAbandon(challenge._id)}
                      className="p-2 text-[var(--text-tertiary)] hover:text-red-600 transition-colors"
                      aria-label="Abandon challenge"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
                      <span>Progress: {progress}%</span>
                      <span>{daysRemaining} days remaining</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Check-in Button */}
                  <motion.button
                    onClick={() => handleCheckIn(challenge._id)}
                    disabled={checkedInToday}
                    whileHover={!checkedInToday ? { scale: 1.02 } : {}}
                    whileTap={!checkedInToday ? { scale: 0.98 } : {}}
                    className={`w-full py-2.5 rounded-lg font-medium transition-all ${
                      checkedInToday
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-[var(--accent-primary)] text-white hover:shadow-lg'
                    }`}
                  >
                    {checkedInToday ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaCheckCircle />
                        Checked in today
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <FaCheckCircle />
                        Check in
                      </span>
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Completed Challenges ({completedChallenges.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {completedChallenges.map((challenge) => (
              <motion.div
                key={challenge._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-5 md:p-6 opacity-90"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 line-through">
                      {challenge.name}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-3">
                      Completed on {new Date(challenge.completedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <FaTrophy className="text-yellow-500 text-2xl" />
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => handleRestart(challenge._id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-2 px-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg font-medium hover:bg-[var(--bg-tertiary)] transition-colors flex items-center justify-center gap-2"
                  >
                    <FaRedo />
                    Restart
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Challenges Message */}
      {activeChallenges.length === 0 && completedChallenges.length === 0 && (
        <div className="text-center py-12">
          <FaFlag className="text-6xl text-[var(--text-tertiary)] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            No challenges yet
          </h3>
          <p className="text-[var(--text-secondary)] mb-6">
            Start a challenge to build discipline and achieve your goals
          </p>
          <motion.button
            onClick={() => setShowPremadeModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
          >
            Start Your First Challenge
          </motion.button>
        </div>
      )}

      {/* Premade Challenges Modal */}
      <AnimatePresence>
        {showPremadeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPremadeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Start a Challenge</h2>
                <button
                  onClick={() => setShowPremadeModal(false)}
                  className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {premadeChallenges.map((challenge) => (
                  <motion.button
                    key={challenge.id}
                    onClick={() => handleStartPremadeChallenge(challenge.id)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-all text-left group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${challenge.color} flex items-center justify-center text-2xl mb-3`}>
                      {challenge.icon}
                    </div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                      {challenge.name}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">
                      {challenge.description}
                    </p>
                    <span className="text-xs text-[var(--accent-primary)] font-medium">
                      {challenge.duration} days
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Challenges;

