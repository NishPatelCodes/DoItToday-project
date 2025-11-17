import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaStop, FaRedo } from 'react-icons/fa';

/**
 * Pomodoro Timer Component
 * Displays a circular countdown timer with progress ring
 */
const PomodoroTimer = ({
  timeLeft,
  isActive,
  isPaused,
  isBreak,
  progress,
  formatTime,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
  sessionCount,
  className = '',
}) => {
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto">
        {/* Background circle */}
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6D28D9" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          
          {/* Background ring */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="4"
          />
          
          {/* Progress ring */}
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Timer content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Session indicator */}
          <div className="mb-2">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              isBreak 
                ? 'bg-purple-500/20 text-purple-300' 
                : 'bg-blue-500/20 text-blue-300'
            }`}>
              {isBreak ? 'BREAK' : 'FOCUS'}
            </span>
          </div>

          {/* Time display */}
          <div 
            className="text-6xl md:text-7xl font-bold text-white mb-2 tabular-nums"
            role="timer"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`${isBreak ? 'Break' : 'Focus'} timer: ${formatTime(timeLeft)} remaining`}
          >
            {formatTime(timeLeft)}
          </div>

          {/* Session count */}
          {sessionCount > 0 && (
            <div className="text-sm text-white/60 mb-4">
              Session {sessionCount} {sessionCount % 4 === 0 ? '(Long Break Next)' : ''}
            </div>
          )}

          {/* Control buttons */}
          <div className="flex items-center gap-3 mt-4">
            {!isActive ? (
              <motion.button
                onClick={onStart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                aria-label="Start timer"
              >
                <FaPlay className="text-sm" />
                Start
              </motion.button>
            ) : (
              <>
                <motion.button
                  onClick={isPaused ? onResume : onPause}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm text-white font-medium border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2"
                  aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
                >
                  {isPaused ? <FaPlay className="text-sm" /> : <FaPause className="text-sm" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </motion.button>
                
                <motion.button
                  onClick={onReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-3 rounded-full bg-white/10 backdrop-blur-sm text-white font-medium border border-white/20 hover:bg-white/20 transition-all"
                  aria-label="Reset timer"
                >
                  <FaStop className="text-sm" />
                </motion.button>

                {isBreak && (
                  <motion.button
                    onClick={onSkip}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-3 rounded-full bg-white/10 backdrop-blur-sm text-white font-medium border border-white/20 hover:bg-white/20 transition-all"
                    aria-label="Skip break"
                    title="Skip break"
                  >
                    <FaRedo className="text-sm" />
                  </motion.button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;

