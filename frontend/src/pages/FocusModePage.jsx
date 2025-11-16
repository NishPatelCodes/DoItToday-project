import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaStop, FaExpand, FaCompress, FaTimes, FaPalette, FaMoon, FaLeaf, FaSun, FaMagic, FaBell, FaShare, FaEllipsisV } from 'react-icons/fa';
import { focusAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import { useAuthStore } from '../store/authStore';

const FocusModePage = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [sessionId, setSessionId] = useState(null);
  const [backgroundMode, setBackgroundMode] = useState(() => {
    // Load from localStorage
    const saved = localStorage.getItem('focus-background-mode');
    return saved || 'minimal-gradient';
  });
  const [customDuration, setCustomDuration] = useState(25);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [currentQuote, setCurrentQuote] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusStats, setFocusStats] = useState({ totalSessions: 0, totalMinutes: 0, totalDP: 0 });
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);
  const hoursScrollRef = useRef(null);
  const minutesScrollRef = useRef(null);
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
    "The best time to focus was yesterday. The second best time is now.",
    "Excellence is not a skill, it's an attitude.",
    "Focus on progress, not perfection.",
  ];

  // Background modes with professional gradients
  const backgroundModes = [
    {
      id: 'minimal-gradient',
      name: 'Minimal Gradient',
      description: 'Calm blue/purple blend',
      icon: FaPalette,
      colors: {
        primary: 'from-blue-500 via-purple-500 to-indigo-600',
        secondary: 'from-indigo-600 via-purple-500 to-blue-500',
        accent: 'from-cyan-400 to-blue-500',
      },
    },
    {
      id: 'deep-focus',
      name: 'Deep Focus',
      description: 'Dark abstract gradient',
      icon: FaMoon,
      colors: {
        primary: 'from-gray-900 via-slate-800 to-gray-900',
        secondary: 'from-slate-900 via-gray-800 to-slate-900',
        accent: 'from-purple-900 to-indigo-900',
      },
    },
    {
      id: 'nature-calm',
      name: 'Nature Calm',
      description: 'Soft green/brown tones',
      icon: FaLeaf,
      colors: {
        primary: 'from-emerald-500 via-teal-500 to-green-600',
        secondary: 'from-amber-600 via-orange-500 to-amber-500',
        accent: 'from-green-400 to-emerald-500',
      },
    },
    {
      id: 'sunset-glow',
      name: 'Sunset Glow',
      description: 'Orange/pink tones',
      icon: FaSun,
      colors: {
        primary: 'from-orange-500 via-pink-500 to-rose-500',
        secondary: 'from-rose-500 via-pink-500 to-orange-500',
        accent: 'from-yellow-400 to-orange-500',
      },
    },
    {
      id: 'motivational-motion',
      name: 'Motivational Motion',
      description: 'Animated gradient',
      icon: FaMagic,
      colors: {
        primary: 'from-purple-600 via-pink-500 to-indigo-600',
        secondary: 'from-blue-600 via-cyan-500 to-teal-500',
        accent: 'from-violet-500 to-purple-500',
      },
    },
  ];

  // Load focus stats on mount
  useEffect(() => {
    loadFocusStats();
  }, []);

  // Save background mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('focus-background-mode', backgroundMode);
  }, [backgroundMode]);

  // Set initial quote and rotate quotes
  useEffect(() => {
    setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    
    let quoteInterval;
    if (isActive && !isPaused) {
      // Rotate quotes every 2 minutes when active
      quoteInterval = setInterval(() => {
        setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
      }, 120000); // 2 minutes
    }
    
    return () => {
      if (quoteInterval) clearInterval(quoteInterval);
    };
  }, [isActive, isPaused]);

  // Timer countdown
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

  // Fullscreen API handlers
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const loadFocusStats = async () => {
    try {
      const stats = await focusAPI.getStats();
      setFocusStats(stats.data || { totalSessions: 0, totalMinutes: 0, totalDP: 0 });
    } catch (error) {
      console.error('Error loading focus stats:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && containerRef.current) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
      toast.error('Fullscreen not supported in this browser');
    }
  };

  const handleStart = async () => {
    try {
      const durationMinutes = Math.floor(timeLeft / 60);
      const response = await focusAPI.start({ 
        taskId: null, 
        duration: durationMinutes, 
        ambientMode: backgroundMode 
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
        const elapsedSeconds = (customDuration * 60) - timeLeft;
        const completedMinutes = Math.max(0, Math.floor(elapsedSeconds / 60));
        if (completedMinutes > 0) {
          await focusAPI.complete(sessionId, { completedDuration: completedMinutes });
          toast.success(`Focus session ended! Earned Discipline Points ✨`);
          loadFocusStats();
        }
      } catch (error) {
        console.error('Error completing session:', error);
      }
    }
    // Exit fullscreen when timer stops
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
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
        const completedMinutes = customDuration;
        await focusAPI.complete(sessionId, { completedDuration: completedMinutes });
        
        // Show completion animation
        setShowCompletionAnimation(true);
        playCompletionSound();
        
        // Show success message with random quote
        const completionQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        toast.success(`🎉 Session completed! ${completionQuote}`, { duration: 5000 });
        
        // Refresh user data and stats
        try {
          const { authAPI } = await import('../services/api');
          const userRes = await authAPI.getMe();
          const { updateUser } = useAuthStore.getState();
          updateUser({
            ...userRes.data.user,
            xp: userRes.data.user.xp || 0,
            level: userRes.data.user.level || 1,
          });
          loadFocusStats();
        } catch (e) {
          // Silently handle
        }
      } catch (error) {
        console.error('Error completing session:', error);
      }
    }
    
    setTimeout(async () => {
      // Exit fullscreen when timer completes
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
          setIsFullscreen(false);
        } catch (error) {
          console.error('Error exiting fullscreen:', error);
        }
      }
      setIsActive(false);
      setIsPaused(false);
      setTimeLeft(customDuration * 60);
      setSessionId(null);
      setShowCompletionAnimation(false);
      clearInterval(intervalRef.current);
    }, 3000);
  };

  const playCompletionSound = () => {
    // Create a soft notification sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      // Silently fail if audio context is not available
    }
  };

  const handleSetDuration = (minutes) => {
    setCustomDuration(minutes);
    setTimeLeft(minutes * 60);
    setShowCustomInput(false);
  };

  const handleCustomDurationSubmit = (e) => {
    e.preventDefault();
    const totalMinutes = customHours * 60 + customMinutes;
    if (totalMinutes > 0 && totalMinutes <= 240) {
      handleSetDuration(totalMinutes);
      setShowCustomInput(false);
    } else {
      toast.error('Please set a duration between 1 and 240 minutes (4 hours)');
    }
  };

  const handleTimePickerConfirm = () => {
    const totalMinutes = customHours * 60 + customMinutes;
    if (totalMinutes > 0 && totalMinutes <= 240) {
      handleSetDuration(totalMinutes);
      setShowCustomInput(false);
    } else {
      toast.error('Please set a duration between 1 and 240 minutes (4 hours)');
    }
  };

  // Scroll to selected value when picker opens or value changes
  useEffect(() => {
    if (showCustomInput && hoursScrollRef.current) {
      const hourButton = hoursScrollRef.current.querySelector(`[data-hour="${customHours}"]`);
      if (hourButton) {
        hourButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [showCustomInput, customHours]);

  useEffect(() => {
    if (showCustomInput && minutesScrollRef.current) {
      const minuteButton = minutesScrollRef.current.querySelector(`[data-minute="${customMinutes}"]`);
      if (minuteButton) {
        minuteButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [showCustomInput, customMinutes]);

  const progress = customDuration > 0 ? ((customDuration * 60 - timeLeft) / (customDuration * 60)) * 100 : 0;
  const selectedBackground = backgroundModes.find(m => m.id === backgroundMode) || backgroundModes[0];
  const [gradientId] = useState(() => `focusGradient-${Math.random().toString(36).substr(2, 9)}`);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden transition-all duration-500"
    >
      {/* Professional Background with smooth transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={backgroundMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          {backgroundMode === 'motivational-motion' ? (
            // Animated gradient for motivational motion - subtle animation without position changes
            <>
              <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${selectedBackground.colors.primary} opacity-10`} />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.15, 0.25, 0.15],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br ${selectedBackground.colors.primary} rounded-full blur-3xl`}
              />
              <motion.div
                animate={{
                  scale: [1.1, 1, 1.1],
                  opacity: [0.15, 0.25, 0.15],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 2,
                }}
                className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br ${selectedBackground.colors.secondary} rounded-full blur-3xl`}
              />
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 4,
                }}
                className={`absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br ${selectedBackground.colors.accent} rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2`}
              />
            </>
          ) : (
            // Static gradients for other modes
            <>
              <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${selectedBackground.colors.primary} opacity-10`} />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.15, 0.1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br ${selectedBackground.colors.accent} rounded-full blur-3xl opacity-30`}
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
                className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br ${selectedBackground.colors.secondary} rounded-full blur-3xl opacity-30`}
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Completion Animation */}
      <AnimatePresence>
        {showCompletionAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="text-9xl">🎉</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Bar */}
        {isActive && (
          <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-6">
            <div className="flex items-center gap-2">
              <FaBell className="text-[var(--text-secondary)] text-lg" />
              <FaShare className="text-[var(--text-secondary)] text-lg" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base font-medium text-[var(--text-primary)]">FOCUSING</span>
              <FaEllipsisV className="text-[var(--text-secondary)] text-lg" />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-8 md:py-12">
          {/* Timer Circle - New Style (shown when active) */}
          {isActive ? (
            <div className="relative w-80 h-80 md:w-96 md:h-96 mb-8 md:mb-12">
              <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
                {/* Thin background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="2"
                />
                {/* Progress circle - thin */}
                <motion.circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke={`url(#${gradientId})`}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 90}
                  initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 90 * (1 - progress / 100)
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
                {/* Progress indicator dot */}
                <motion.circle
                  cx="100"
                  cy="10"
                  r="4"
                  fill="#667eea"
                  initial={{ rotate: 0 }}
                  animate={{ 
                    rotate: 360 * (1 - progress / 100)
                  }}
                  transition={{ duration: 1, ease: 'linear' }}
                  style={{ transformOrigin: '100px 100px' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/* FOCUS / BREAK Mode Toggle */}
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setIsBreakMode(false)}
                    className={`text-sm md:text-base font-medium transition-colors ${
                      !isBreakMode
                        ? 'text-white'
                        : 'text-white/40'
                    }`}
                  >
                    FOCUS
                  </button>
                  <span className="text-white/40">/</span>
                  <button
                    onClick={() => setIsBreakMode(true)}
                    className={`text-sm md:text-base font-medium transition-colors ${
                      isBreakMode
                        ? 'text-white'
                        : 'text-white/40'
                    }`}
                  >
                    BREAK
                  </button>
                </div>
                
                {/* Time Display - Minutes format */}
                <div className="text-7xl md:text-8xl lg:text-9xl font-bold text-white mb-2">
                  {Math.floor(timeLeft / 60)}m
                </div>
                
                {/* Current Activity */}
                <div className="text-lg md:text-xl text-white/80 mb-6">
                  {isPaused ? 'Paused' : (isBreakMode ? 'Break' : 'Focus')}
                </div>
                
                {/* Pause/Resume Button */}
                <motion.button
                  onClick={handlePause}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white font-medium text-sm md:text-base hover:bg-white/20 transition-all"
                >
                  {isPaused ? 'RESUME' : 'PAUSE'}
                </motion.button>
              </div>
            </div>
          ) : (
            /* Setup View: Timer with Themes and Duration */
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 mb-8 md:mb-12 w-full max-w-7xl">
              {/* Themes on Left */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-2 w-full md:w-auto items-center md:items-start"
              >
                <label className="block text-sm font-medium text-white/80 mb-2 md:mb-3 text-center md:text-left whitespace-nowrap">
                  Theme
                </label>
                <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide justify-center md:justify-start">
                  {backgroundModes.map((mode) => {
                    const IconComponent = mode.icon;
                    return (
                      <motion.button
                        key={mode.id}
                        onClick={() => setBackgroundMode(mode.id)}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-shrink-0 p-3 md:p-4 rounded-xl border-2 transition-all ${
                          backgroundMode === mode.id
                            ? 'border-[#667eea] bg-[#667eea]/20 shadow-lg'
                            : 'border-white/20 hover:border-[#667eea]/50 bg-white/5'
                        }`}
                        title={mode.name}
                      >
                        <IconComponent 
                          className={`text-xl md:text-2xl ${
                            backgroundMode === mode.id
                              ? 'text-[#667eea]'
                              : 'text-white/60'
                          }`} 
                        />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Timer Preview */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0">
                <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="2"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                    {Math.floor(timeLeft / 60)}m
                  </div>
                  <div className="text-base md:text-lg text-white/60">
                    Ready to focus
                  </div>
                </div>
              </div>

              {/* Duration on Right */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-2 w-full md:w-auto items-center md:items-end"
              >
                <label className="block text-sm font-medium text-white/80 mb-2 md:mb-3 text-center md:text-right">
                  Duration
                </label>
                <div className="flex flex-row md:flex-col gap-3 justify-center md:justify-end">
                  {[25, 45, 60].map((mins) => (
                    <motion.button
                      key={mins}
                      onClick={() => handleSetDuration(mins)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-6 py-3 rounded-lg font-medium transition-all shadow-md w-full md:w-auto ${
                        customDuration === mins
                          ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg'
                          : 'bg-white/10 text-white border border-white/20 hover:border-[#667eea] hover:shadow-lg'
                      }`}
                    >
                      {mins}m
                    </motion.button>
                  ))}
                  <motion.button
                    onClick={() => {
                      if (!showCustomInput) {
                        const hours = Math.floor(customDuration / 60);
                        const minutes = customDuration % 60;
                        setCustomHours(hours);
                        setCustomMinutes(minutes);
                      }
                      setShowCustomInput(!showCustomInput);
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-lg font-medium transition-all shadow-md w-full md:w-auto ${
                      showCustomInput
                        ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg'
                        : 'bg-white/10 text-white border border-white/20 hover:border-[#667eea] hover:shadow-lg'
                    }`}
                  >
                    Custom
                  </motion.button>
                </div>
                
                {/* Custom Time Picker */}
                <AnimatePresence>
                  {showCustomInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 w-full max-w-md mx-auto"
                    >
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1">Set Custom Duration</h3>
                    <p className="text-sm text-white/60">Select hours and minutes</p>
                  </div>
                  
                  {/* Time Picker Columns */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                    {/* Hours Column */}
                    <div className="flex flex-col items-center">
                      <label className="text-xs font-medium text-white/60 mb-2">Hours</label>
                      <div className="relative w-20 h-48 overflow-hidden rounded-lg bg-white/5 border border-white/20">
                        {/* Selection indicator - fixed position */}
                        <div className="absolute top-1/2 left-0 right-0 h-12 -translate-y-1/2 border-t-2 border-b-2 border-[#667eea]/40 pointer-events-none z-10 rounded" />
                        {/* Gradient fade at top and bottom */}
                        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/10 to-transparent pointer-events-none z-10" />
                        <div 
                          ref={hoursScrollRef}
                          className="h-full overflow-y-auto scrollbar-hide"
                          style={{ scrollBehavior: 'smooth' }}
                        >
                          <div className="py-20">
                            {[0, 1, 2, 3, 4].map((hour) => (
                              <button
                                key={hour}
                                data-hour={hour}
                                type="button"
                                onClick={() => {
                                  setCustomHours(hour);
                                  const button = hoursScrollRef.current?.querySelector(`[data-hour="${hour}"]`);
                                  if (button) {
                                    button.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }}
                                className={`w-full h-12 flex items-center justify-center text-lg font-medium transition-colors ${
                                  customHours === hour
                                    ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                }`}
                              >
                                {hour}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="text-2xl font-bold text-white mt-8">:</div>

                    {/* Minutes Column */}
                    <div className="flex flex-col items-center">
                      <label className="text-xs font-medium text-white/60 mb-2">Minutes</label>
                      <div className="relative w-20 h-48 overflow-hidden rounded-lg bg-white/5 border border-white/20">
                        {/* Selection indicator - fixed position */}
                        <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 border-t-2 border-b-2 border-[#667eea]/40 pointer-events-none z-10 rounded" />
                        {/* Gradient fade at top and bottom */}
                        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/10 to-transparent pointer-events-none z-10" />
                        <div 
                          ref={minutesScrollRef}
                          className="h-full overflow-y-auto scrollbar-hide"
                          style={{ scrollBehavior: 'smooth' }}
                        >
                          <div className="py-20">
                            {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                              <button
                                key={minute}
                                data-minute={minute}
                                type="button"
                                onClick={() => {
                                  setCustomMinutes(minute);
                                  const button = minutesScrollRef.current?.querySelector(`[data-minute="${minute}"]`);
                                  if (button) {
                                    button.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }}
                                className={`w-full h-10 flex items-center justify-center text-base font-medium transition-colors ${
                                  customMinutes === minute
                                    ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                }`}
                              >
                                {String(minute).padStart(2, '0')}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selected Time Display */}
                  <div className="text-center mb-4">
                    <p className="text-sm text-white/60">Selected Duration</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                      {customHours > 0 ? `${customHours}h ` : ''}{customMinutes}m
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      ({customHours * 60 + customMinutes} minutes total)
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-center">
                    <motion.button
                      type="button"
                      onClick={handleTimePickerConfirm}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 flex-1 rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-medium"
                    >
                      Set Duration
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomHours(0);
                        setCustomMinutes(25);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20"
                    >
                      <FaTimes />
                    </motion.button>
                  </div>
                </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </div>

          {/* Start Button - Only shown when not active */}
          {!isActive && (
            <motion.button
              onClick={handleStart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-medium text-base md:text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Start Focus
            </motion.button>
          )}

          {/* Stop Button - Only shown when active */}
          {isActive && (
            <motion.button
              onClick={handleStop}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-full border-2 border-red-400/50 bg-red-500/10 backdrop-blur-sm text-red-400 font-medium text-sm md:text-base hover:bg-red-500/20 transition-all"
            >
              End Session
            </motion.button>
          )}
        </div>

        {/* Motivational Quote at Bottom */}
        <AnimatePresence mode="wait">
          {currentQuote && (
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="text-center px-4 pb-6 md:pb-8"
            >
              <p className="text-sm md:text-base text-white/60 italic">
                {currentQuote}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default FocusModePage;
