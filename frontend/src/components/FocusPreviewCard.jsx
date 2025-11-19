import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaStop, FaHeadphones } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { usePomodoro } from '../hooks/usePomodoro';
import { useFocusSession } from '../hooks/useFocusSession';
import { useDataStore } from '../store/dataStore';

/**
 * Compact, beautiful Focus Mode preview card for the Dashboard
 * Shows timer preview, current task, and quick start button
 */
const FocusPreviewCard = () => {
  const navigate = useNavigate();
  const { tasks } = useDataStore();
  const pomodoro = usePomodoro(25, 5, 15);
  const focusSession = useFocusSession();
  const [showOptions, setShowOptions] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Get current focused task from active session or use first pending task
  const currentTask = focusSession.currentSession?.taskId
    ? tasks.find(t => t._id === focusSession.currentSession.taskId)
    : tasks.find(t => t.status === 'pending');

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate progress percentage for circular timer
  const getProgress = () => {
    const totalSeconds = pomodoro.isBreak
      ? (pomodoro.sessionCount % 4 === 0 ? pomodoro.longBreakMinutes : pomodoro.breakMinutes) * 60
      : pomodoro.workMinutes * 60;
    return totalSeconds > 0 ? ((totalSeconds - pomodoro.timeLeft) / totalSeconds) * 100 : 0;
  };

  const progress = getProgress();
  const circumference = 2 * Math.PI * 45; // radius = 45 for compact circle
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Handle quick start with duration
  const handleQuickStart = async (duration = 25) => {
    if (pomodoro.isActive && !pomodoro.isPaused) {
      // If already running, navigate to full focus page
      navigate('/dashboard/focus');
      return;
    }

    // Set work minutes if custom duration
    if (duration !== pomodoro.workMinutes) {
      pomodoro.setWorkMinutes(duration);
    }

    // Navigate to focus page (which will start the session)
    navigate('/dashboard/focus', {
      state: {
        autoStart: true,
        taskId: selectedTaskId || currentTask?._id || null,
        duration,
      },
    });
  };

  // Handle play button click
  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (pomodoro.isActive && !pomodoro.isPaused) {
      navigate('/dashboard/focus');
    } else {
      handleQuickStart(25);
    }
  };

  const isActive = pomodoro.isActive && !pomodoro.isPaused;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="relative card p-4 md:p-6 rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#4C1D95] text-white shadow-lg hover:shadow-xl transition-all overflow-hidden"
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
      onClick={() => isActive && navigate('/dashboard/focus')}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:24px_24px]"></div>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-[200px] md:min-h-[220px]">
        {/* Live indicator when active */}
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 bg-white rounded-full"
            />
            <span className="text-xs font-medium">Focusing…</span>
          </motion.div>
        )}

        {/* Circular Timer Preview */}
        <div className="relative w-32 h-32 md:w-36 md:h-36 mb-4">
          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="focusCardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
              </linearGradient>
            </defs>
            
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="4"
            />
            
            {/* Progress ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#focusCardGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </svg>

          {/* Timer display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl md:text-4xl font-bold tabular-nums mb-1">
              {formatTime(pomodoro.timeLeft)}
            </div>
            {pomodoro.isBreak && (
              <span className="text-xs opacity-75">Break</span>
            )}
          </div>
        </div>

        {/* Current Task Name */}
        <div className="text-center mb-6 min-h-[48px] flex items-center justify-center px-4">
          {currentTask ? (
            <p className="text-sm md:text-base font-semibold leading-snug line-clamp-2 break-words">
              {currentTask.title}
            </p>
          ) : (
            <p className="text-sm text-white/60 italic leading-normal">No task selected</p>
          )}
        </div>

        {/* Big Play Button */}
        <motion.button
          onClick={handlePlayClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all group z-10 mb-6 touch-manipulation focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:ring-offset-2"
          aria-label={isActive ? 'Go to Focus Mode' : 'Start 25 min session'}
        >
          {isActive ? (
            <FaPause className="text-2xl md:text-3xl text-[#6D28D9] flex-shrink-0" />
          ) : (
            <FaPlay className="text-2xl md:text-3xl text-[#6D28D9] ml-1 flex-shrink-0" />
          )}
          
          {/* Ripple effect */}
          {!isActive && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/30"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.button>

        {/* Quick Options (shown on hover/tap) */}
        <AnimatePresence>
          {showOptions && !isActive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="relative flex justify-center gap-2 px-4 mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => handleQuickStart(25)}
                className="px-3 py-2 text-xs bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all font-semibold touch-manipulation min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2"
              >
                25m
              </button>
              <button
                onClick={() => handleQuickStart(5)}
                className="px-3 py-2 text-xs bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all font-semibold touch-manipulation min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2"
              >
                5m break
              </button>
              <button
                onClick={() => navigate('/dashboard/focus')}
                className="px-3 py-2 text-xs bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all font-semibold touch-manipulation min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2"
              >
                Custom
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FocusPreviewCard;
