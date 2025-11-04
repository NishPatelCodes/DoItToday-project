import { motion } from 'framer-motion';
import { FaTrophy, FaStar } from 'react-icons/fa';

const XPLevel = ({ xp = 0, level = 1, streak = 0 }) => {
  // Calculate XP needed for next level (level * 100)
  const xpNeededForNextLevel = level * 100;
  const currentLevelXP = xp % 100 || xp;
  const progress = (currentLevelXP / xpNeededForNextLevel) * 100;

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
              <span className="text-xl font-bold text-[var(--text-primary)]">Level {level}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
              <span className="flex items-center gap-1">
                <FaStar className="text-yellow-500" />
                {xp} XP
              </span>
              <span className="text-orange-500">{streak} 🔥 streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
          <span>Level {level} Progress</span>
          <span>{currentLevelXP} / {xpNeededForNextLevel} XP</span>
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
        {xpNeededForNextLevel - currentLevelXP} XP until Level {level + 1}
      </div>
    </motion.div>
  );
};

export default XPLevel;

