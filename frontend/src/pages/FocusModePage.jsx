import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaStop, FaHeadphones } from 'react-icons/fa';
import { focusAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import { useAuthStore } from '../store/authStore';

const FocusModePage = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [sessionId, setSessionId] = useState(null);
  const [ambientMode, setAmbientMode] = useState('silent');
  const [customDuration, setCustomDuration] = useState(25);
  const [currentQuote, setCurrentQuote] = useState('');
  const intervalRef = useRef(null);
  const toast = useToast();

  const motivationalQuotes = [
    "Your focus builds your future.",
    "Small wins matter. Stay disciplined.",
    "The only way to do great work is to love what you do.",
    "Focus is a superpower in the age of distraction.",
    "Deep work produces extraordinary results.",
    "Consistency is the key to success.",
    "Every moment of focus is an investment in your future.",
    "Stay present. Stay focused. Stay disciplined.",
    "Progress, not perfection, is the goal.",
    "Your ability to focus determines your success.",
    "Distraction is the enemy of achievement.",
    "Deep focus leads to breakthrough moments.",
  ];

  useEffect(() => {
    // Set initial quote
    setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    
    // Rotate quotes every 30 seconds when active
    let quoteInterval;
    if (isActive && !isPaused) {
      quoteInterval = setInterval(() => {
        setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
      }, 30000);
    }
    
    return () => {
      if (quoteInterval) clearInterval(quoteInterval);
    };
  }, [isActive, isPaused]);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStart = async () => {
    try {
      const durationMinutes = Math.floor(timeLeft / 60);
      const response = await focusAPI.start({ 
        taskId: null, 
        duration: durationMinutes, 
        ambientMode 
      });
      setSessionId(response.data._id);
      setIsActive(true);
      setIsPaused(false);
      toast.success('Focus session started! Stay disciplined 💪');
    } catch (error) {
      toast.error('Failed to start focus session');
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = async () => {
    if (sessionId && isActive) {
      try {
        // Calculate completed duration based on elapsed time
        const elapsedSeconds = (customDuration * 60) - timeLeft;
        const completedMinutes = Math.max(0, Math.floor(elapsedSeconds / 60));
        if (completedMinutes > 0) {
          await focusAPI.complete(sessionId, { completedDuration: completedMinutes });
          toast.success(`Focus session ended! Earned Discipline Points ✨`);
        }
      } catch (error) {
        console.error('Error completing session:', error);
      }
    }
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(customDuration * 60);
    setSessionId(null);
    clearInterval(intervalRef.current);
  };

  const handleComplete = async () => {
    if (sessionId) {
      try {
        // Session completed fully - use the full duration
        const completedMinutes = customDuration;
        await focusAPI.complete(sessionId, { completedDuration: completedMinutes });
        toast.success(`Focus session completed! Discipline Points earned ✨`);
        
        // Refresh user data to get updated DP
        try {
          const { authAPI } = await import('../services/api');
          const userRes = await authAPI.getMe();
          const { updateUser } = useAuthStore.getState();
          updateUser({
            ...userRes.data.user,
            xp: userRes.data.user.xp || 0,
            level: userRes.data.user.level || 1,
          });
        } catch (e) {
          // Silently handle
        }
      } catch (error) {
        console.error('Error completing session:', error);
      }
    }
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(customDuration * 60);
    setSessionId(null);
    clearInterval(intervalRef.current);
  };

  const handleSetDuration = (minutes) => {
    setCustomDuration(minutes);
    setTimeLeft(minutes * 60);
  };

  const ambientModes = [
    { value: 'silent', label: 'Silent', icon: '🔇', color: 'from-gray-500 to-gray-700' },
    { value: 'rain', label: 'Rain', icon: '🌧️', color: 'from-blue-500 to-cyan-500' },
    { value: 'ocean', label: 'Ocean', icon: '🌊', color: 'from-cyan-500 to-blue-500' },
    { value: 'forest', label: 'Forest', icon: '🌲', color: 'from-green-500 to-emerald-500' },
    { value: 'coffee', label: 'Coffee Shop', icon: '☕', color: 'from-amber-500 to-orange-500' },
  ];

  const progress = customDuration > 0 ? ((customDuration * 60 - timeLeft) / (customDuration * 60)) * 100 : 0;
  const selectedAmbient = ambientModes.find(m => m.value === ambientMode) || ambientModes[0];
  const [gradientId] = useState(() => `focusGradient-${Math.random().toString(36).substr(2, 9)}`);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Calming background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br ${selectedAmbient.color} rounded-full blur-3xl`}
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br ${selectedAmbient.color} rounded-full blur-3xl`}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        {/* Motivational Quote */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 md:mb-12 max-w-2xl"
          >
            <p className="text-xl md:text-2xl lg:text-3xl font-light text-[var(--text-primary)] italic leading-relaxed">
              "{currentQuote}"
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Timer Circle */}
        <div className="relative w-80 h-80 md:w-96 md:h-96 mb-8 md:mb-12">
          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="var(--border-color)"
              strokeWidth="4"
            />
            {/* Progress circle */}
            <motion.circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 90}
              initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
              animate={{ 
                strokeDashoffset: 2 * Math.PI * 90 * (1 - progress / 100)
              }}
              transition={{ duration: 1 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl md:text-7xl lg:text-8xl font-bold text-[var(--text-primary)] mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="text-lg md:text-xl text-[var(--text-secondary)]">
                {isActive ? (isPaused ? 'Paused' : 'Focusing') : 'Ready to focus'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-6 mb-8">
          {/* Ambient Mode Selector */}
          {!isActive && (
            <div className="flex gap-2 flex-wrap justify-center">
              {ambientModes.map((mode) => (
                <motion.button
                  key={mode.value}
                  onClick={() => setAmbientMode(mode.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    ambientMode === mode.value
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                      : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'
                  }`}
                >
                  <span className="text-2xl">{mode.icon}</span>
                  <div className="text-xs mt-1 text-[var(--text-secondary)]">{mode.label}</div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Duration Presets */}
          {!isActive && (
            <div className="flex gap-3">
              {[15, 25, 45, 60, 90].map((mins) => (
                <motion.button
                  key={mins}
                  onClick={() => handleSetDuration(mins)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    customDuration === mins
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)]'
                  }`}
                >
                  {mins}m
                </motion.button>
              ))}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            {!isActive ? (
              <motion.button
                onClick={handleStart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center gap-3 px-8 py-4 text-lg"
              >
                <FaPlay />
                Start Focus
              </motion.button>
            ) : (
              <>
                <motion.button
                  onClick={handlePause}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary flex items-center gap-3 px-6 py-3 text-lg"
                >
                  {isPaused ? <FaPlay /> : <FaPause />}
                  {isPaused ? 'Resume' : 'Pause'}
                </motion.button>
                <motion.button
                  onClick={handleStop}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary flex items-center gap-3 px-6 py-3 text-lg border-red-200 hover:border-red-400 text-red-600 hover:text-red-700"
                >
                  <FaStop />
                  End Session
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Session Stats */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-[var(--text-secondary)]"
          >
            <p>Stay disciplined. Your focus builds your future.</p>
            <p className="mt-1">
              You'll earn Discipline Points when you complete this session.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FocusModePage;

