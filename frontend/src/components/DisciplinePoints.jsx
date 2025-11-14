import { motion } from 'framer-motion';
import { FaTrophy, FaStar } from 'react-icons/fa';

const DisciplinePoints = ({ xp = 0, level = 1, streak = 0 }) => {
  // Calculate Discipline Points needed for next level
  // Level formula: level = min(10, floor(xp / 1000) + 1)
  // So DP for level N = (N - 1) * 1000
  // DP needed for next level = level * 1000
  const isMaxLevel = level >= 10;
  const dpForCurrentLevel = (level - 1) * 1000;
  const dpForNextLevel = isMaxLevel ? null : level * 1000;
  const currentLevelDP = xp - dpForCurrentLevel;
  const dpNeededForNextLevel = isMaxLevel ? 0 : (dpForNextLevel - dpForCurrentLevel);
  const progress = isMaxLevel ? 100 : Math.min(100, Math.max(0, (currentLevelDP / dpNeededForNextLevel) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {level}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaTrophy className="text-yellow-500" />
              <span className="text-xl font-bold text-[var(--text-primary)]">
                {level >= 10 ? 'Max Level' : `Level ${level}`}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
              <span className="flex items-center gap-1">
                <FaStar className="text-yellow-500" />
                {xp} Discipline Points
              </span>
              <span className="text-orange-500">{streak} 🔥 streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Discipline Points Progress Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
          <span>{level >= 10 ? 'Max Level Achieved' : `Level ${level} Progress`}</span>
          {!isMaxLevel && (
            <span>{currentLevelDP} / {dpNeededForNextLevel} DP</span>
          )}
        </div>
        <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full shadow-lg"
          />
        </div>
      </div>

      {/* Next Level Info */}
      <div className="text-xs text-[var(--text-tertiary)] text-center mt-2">
        {isMaxLevel ? (
          <span className="text-yellow-500 font-medium">🏆 Maximum Level Reached!</span>
        ) : dpNeededForNextLevel - currentLevelDP > 0 ? (
          <>
            {dpNeededForNextLevel - currentLevelDP} DP until Level {level + 1}
          </>
        ) : (
          <span className="text-green-600 font-medium">🎉 Ready to level up!</span>
        )}
      </div>
      
      {/* Discipline Points Earning Guide */}
      <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
        <p className="text-xs font-medium text-[var(--text-primary)] mb-2">Ways to earn Discipline Points:</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
          <div>✓ Tasks: 5-20 DP</div>
          <div>✓ Habits: 5+ DP</div>
          <div>✓ Goals: 10-50 DP</div>
          <div>✓ Gratitude: 5+ DP</div>
          <div>✓ Focus: 10-20 DP</div>
          <div>✓ Challenges: 15-50 DP</div>
          <div>✓ Daily login: 5 DP</div>
        </div>
        {streak >= 7 && (
          <div className="mt-2 text-xs text-orange-600 font-medium">
            🔥 {streak}-day streak: {streak >= 100 ? '50%' : streak >= 30 ? '30%' : '20%'} DP bonus!
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DisciplinePoints;

