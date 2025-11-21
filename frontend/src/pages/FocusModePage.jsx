import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { FaExpand, FaCompress, FaTimes, FaChartBar, FaPalette, FaMoon, FaLeaf, FaSun, FaMagic } from 'react-icons/fa';
import { usePomodoro } from '../hooks/usePomodoro';
import { useAmbientSound } from '../hooks/useAmbientSound';
import { useFocusSession } from '../hooks/useFocusSession';
import PomodoroTimer from '../components/focus/PomodoroTimer';
import AmbientPlayer from '../components/focus/AmbientPlayer';
import TaskSelector from '../components/focus/TaskSelector';
import FocusAnalytics from '../components/focus/FocusAnalytics';
import SettingsPanel from '../components/focus/SettingsPanel';
import { useToast } from '../hooks/useToast';

/**
 * Redesigned Focus Mode Page
 * Premium focus experience with Pomodoro timer, ambient sounds, task integration, and analytics
 */
const FocusModePage = () => {
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(location.state?.taskId || null);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      return localStorage.getItem('focus-notifications') === 'true';
    } catch {
      return false;
    }
  });
  const [currentQuote, setCurrentQuote] = useState('');
  const [backgroundMode, setBackgroundMode] = useState(() => {
    try {
    const saved = localStorage.getItem('focus-background-mode');
    return saved || 'minimal-gradient';
    } catch {
      return 'minimal-gradient';
    }
  });
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const containerRef = useRef(null);
  const toast = useToast();

  // Background themes
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

  // Save background mode to localStorage
  useEffect(() => {
    try {
    localStorage.setItem('focus-background-mode', backgroundMode);
    } catch {
      // Ignore localStorage errors
    }
  }, [backgroundMode]);

  // Custom hooks
  const pomodoro = usePomodoro(
    location.state?.duration || 25, 
    5, 
    15
  );
  const ambientSound = useAmbientSound('silent', 0.5);
  const focusSession = useFocusSession();

  // Update work minutes if duration is provided in location state
  useEffect(() => {
    if (location.state?.duration && location.state.duration !== pomodoro.workMinutes) {
      pomodoro.setWorkMinutes(location.state.duration);
    }
  }, [location.state?.duration, pomodoro.workMinutes, pomodoro.setWorkMinutes]);

  // Motivational quotes
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
  ];

  // Set initial quote
  useEffect(() => {
    setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  // Rotate quotes during active sessions (optimized - only when needed)
  useEffect(() => {
    if (pomodoro.isActive && !pomodoro.isPaused) {
      const interval = setInterval(() => {
        setCurrentQuote(prev => {
          let newQuote;
          do {
            newQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
          } while (newQuote === prev && motivationalQuotes.length > 1);
          return newQuote;
        });
      }, 120000); // Every 2 minutes
      return () => clearInterval(interval);
    }
  }, [pomodoro.isActive, pomodoro.isPaused]);

  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (pomodoro.isActive) {
            if (pomodoro.isPaused) {
              pomodoro.resume();
            } else {
              pomodoro.pause();
            }
          } else {
            handleStart();
          }
          break;
        case 'r':
        case 'R':
          if (pomodoro.isActive) {
            pomodoro.reset();
            if (focusSession.currentSession) {
              focusSession.abandonSession(focusSession.currentSession._id);
            }
          }
          break;
        case 's':
        case 'S':
          if (pomodoro.isBreak && pomodoro.isActive) {
            pomodoro.skip();
          }
          break;
        case 'Escape':
          if (showAnalytics) {
            setShowAnalytics(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pomodoro, showAnalytics, focusSession]);

  // Start focus session
  const handleStart = useCallback(async () => {
    try {
      // Start ambient sound if not silent
      if (ambientSound.currentSound !== 'silent') {
        ambientSound.play();
      }

      // Start Pomodoro timer
      pomodoro.start();

      // Create focus session
      const session = await focusSession.startSession({
        taskId: selectedTaskId || null,
        duration: pomodoro.workMinutes,
        ambientMode: ambientSound.currentSound,
      });

      // Show notification if enabled
      if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus Session Started', {
          body: `Focusing for ${pomodoro.workMinutes} minutes. Stay disciplined! 💪`,
          icon: '/favicon.svg',
        });
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }, [ambientSound, pomodoro, focusSession, selectedTaskId, notificationsEnabled]);

  // Auto-start if requested from location state
  useEffect(() => {
    if (location.state?.autoStart && !pomodoro.isActive) {
      // Small delay to ensure everything is initialized
      const timer = setTimeout(() => {
        handleStart();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.state?.autoStart, pomodoro.isActive, handleStart]);

  // Play completion sound
  const playCompletionSound = useCallback(() => {
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
  }, []);

  // Track previous timer state to detect completion
  const prevTimeLeftRef = useRef(pomodoro.timeLeft);
  const prevIsActiveRef = useRef(pomodoro.isActive);
  const currentSessionIdRef = useRef(focusSession.currentSession?._id);
  const completeSessionRef = useRef(focusSession.completeSession);

  useEffect(() => {
    currentSessionIdRef.current = focusSession.currentSession?._id;
    completeSessionRef.current = focusSession.completeSession;
  }, [focusSession.currentSession?._id, focusSession.completeSession]);

  useEffect(() => {
    // Detect when timer completes (was active, now inactive, and timeLeft is 0)
    if (
      prevIsActiveRef.current &&
      !pomodoro.isActive &&
      pomodoro.timeLeft === 0 &&
      currentSessionIdRef.current &&
      !pomodoro.isPaused
    ) {
      const handleComplete = async () => {
        const completedMinutes = pomodoro.isBreak
          ? (pomodoro.sessionCount % 4 === 0 ? pomodoro.longBreakMinutes : pomodoro.breakMinutes)
          : pomodoro.workMinutes;

        try {
          if (completeSessionRef.current && currentSessionIdRef.current) {
            await completeSessionRef.current(
              currentSessionIdRef.current,
              completedMinutes
            );

            // Show notification
            if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(
                pomodoro.isBreak ? 'Break Completed!' : 'Focus Session Completed!',
                {
                  body: pomodoro.isBreak
                    ? 'Time to get back to work!'
                    : `Great job! You focused for ${completedMinutes} minutes. 🎉`,
                  icon: '/favicon.svg',
                }
              );
            }

            // Play completion sound
            playCompletionSound();
          }
        } catch (error) {
          console.error('Error completing session:', error);
        }
      };

      handleComplete();
    }

    // Update refs
    prevTimeLeftRef.current = pomodoro.timeLeft;
    prevIsActiveRef.current = pomodoro.isActive;
  }, [pomodoro.isActive, pomodoro.timeLeft, pomodoro.isBreak, pomodoro.isPaused, pomodoro.sessionCount, pomodoro.longBreakMinutes, pomodoro.breakMinutes, pomodoro.workMinutes, notificationsEnabled, playCompletionSound]);


  // Toggle fullscreen
  const toggleFullscreen = async () => {
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

  // Save notifications preference
  useEffect(() => {
    localStorage.setItem('focus-notifications', notificationsEnabled.toString());
  }, [notificationsEnabled]);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleVolumeChange = useCallback((vol) => {
    ambientSound.setVolume(vol);
  }, [ambientSound.setVolume]);

  // Get analytics data (memoized to prevent recalculation on every render)
  const dailyStats = useMemo(() => focusSession.getDailyStats(), [focusSession.sessionHistory]);
  const weeklyStats = useMemo(() => focusSession.getWeeklyStats(), [focusSession.sessionHistory]);

  const selectedBackground = backgroundModes.find(m => m.id === backgroundMode) || backgroundModes[0];
  const [gradientId] = useState(() => `focusGradient-${Math.random().toString(36).substr(2, 9)}`);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden"
    >
      {/* Dynamic Background with smooth transitions */}
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
            // Animated gradient for motivational motion
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

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 md:p-6 ${isFullscreen ? 'absolute top-0 left-0 right-0 z-20 backdrop-blur-sm bg-black/20' : ''}`}>
          <div className="flex items-center gap-4">
            {!isFullscreen && (
              <h1 className="text-xl md:text-2xl font-bold text-white">Focus Mode</h1>
            )}
            {pomodoro.isActive && (
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium">
                FOCUSING
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Theme selector button - visible in fullscreen */}
            {isFullscreen && (
              <div className="relative">
                <button
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Select theme"
                >
                  <FaPalette className="text-white" />
                </button>
                
                {/* Theme selector dropdown in fullscreen */}
      <AnimatePresence>
                  {showThemeSelector && (
          <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 card p-3 z-30 min-w-[200px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-xs font-medium text-[var(--text-primary)] mb-2">
                        Background Theme
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {backgroundModes.map((mode) => {
                          const IconComponent = mode.icon;
                          return (
                            <motion.button
                              key={mode.id}
                              onClick={() => {
                                setBackgroundMode(mode.id);
                                setShowThemeSelector(false);
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className={`p-2 rounded-lg border-2 transition-all ${
                                backgroundMode === mode.id
                                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/20'
                                  : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'
                              }`}
                              title={mode.name}
                              aria-label={`Select ${mode.name} theme`}
                            >
                              <IconComponent 
                                className={`text-lg mx-auto ${
                                  backgroundMode === mode.id
                                    ? 'text-[var(--accent-primary)]'
                                    : 'text-[var(--text-tertiary)]'
                                }`} 
                              />
                            </motion.button>
                          );
                        })}
                      </div>
          </motion.div>
        )}
      </AnimatePresence>
          </div>
        )}

                  <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Toggle analytics"
            >
              <FaChartBar className="text-white" />
                  </button>

                  <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <FaCompress className="text-white" />
              ) : (
                <FaExpand className="text-white" />
              )}
                  </button>

            <SettingsPanel
              workMinutes={pomodoro.workMinutes}
              breakMinutes={pomodoro.breakMinutes}
              longBreakMinutes={pomodoro.longBreakMinutes}
              autoStart={pomodoro.autoStart}
              notificationsEnabled={notificationsEnabled}
              onWorkMinutesChange={pomodoro.setWorkMinutes}
              onBreakMinutesChange={pomodoro.setBreakMinutes}
              onLongBreakMinutesChange={pomodoro.setLongBreakMinutes}
              onAutoStartChange={pomodoro.setAutoStart}
              onNotificationsChange={setNotificationsEnabled}
            />
          </div>
                </div>
                
        {/* Main content area */}
        <main className={`flex-1 flex flex-col ${isFullscreen ? 'md:flex-row justify-center' : 'md:flex-row'} gap-6 p-4 md:p-6 ${isFullscreen ? 'pt-20' : ''}`} id="main-content">
          {/* Left sidebar - Task selector, ambient sound, and themes */}
          <div className={`${isFullscreen ? 'hidden' : 'w-full md:w-80'} space-y-4 flex-shrink-0`}>
            <TaskSelector
              selectedTaskId={selectedTaskId}
              selectedGoalId={selectedGoalId}
              onTaskSelect={setSelectedTaskId}
              onGoalSelect={setSelectedGoalId}
            />

            <AmbientPlayer
              currentSound={ambientSound.currentSound}
              volume={ambientSound.volume}
              isPlaying={ambientSound.isPlaying}
              onSoundChange={ambientSound.setCurrentSound}
              onVolumeChange={handleVolumeChange}
              onPlay={ambientSound.play}
              onStop={ambientSound.stop}
            />

            {/* Background Theme Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-4"
            >
              <div className="text-sm font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <FaPalette className="text-[var(--accent-primary)]" />
                Background Theme
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {backgroundModes.map((mode) => {
                    const IconComponent = mode.icon;
                    return (
                      <motion.button
                        key={mode.id}
                        onClick={() => setBackgroundMode(mode.id)}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                          backgroundMode === mode.id
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/20 shadow-lg'
                          : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/50 bg-[var(--bg-secondary)]'
                        }`}
                        title={mode.name}
                      aria-label={`Select ${mode.name} theme`}
                      >
                        <IconComponent 
                        className={`text-xl md:text-2xl mx-auto mb-1 ${
                            backgroundMode === mode.id
                            ? 'text-[var(--accent-primary)]'
                            : 'text-[var(--text-tertiary)]'
                          }`} 
                        />
                      <div className={`text-xs font-medium text-center ${
                        backgroundMode === mode.id
                          ? 'text-[var(--accent-primary)]'
                          : 'text-[var(--text-secondary)]'
                      }`}>
                        {mode.name.split(' ')[0]}
                      </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

            {/* Motivational quote */}
            {currentQuote && !isFullscreen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={currentQuote}
                className="card p-4"
              >
                <div className="text-sm text-[var(--text-secondary)] mb-2">💡 Motivation</div>
                <div className="text-base font-medium text-[var(--text-primary)] italic">
                  "{currentQuote}"
                </div>
              </motion.div>
            )}
          </div>

          {/* Center - Timer (centered in fullscreen) */}
          <div className={`flex-1 flex flex-col items-center justify-center ${isFullscreen ? 'min-h-screen -mt-16' : ''}`}>
            <PomodoroTimer
              timeLeft={pomodoro.timeLeft}
              isActive={pomodoro.isActive}
              isPaused={pomodoro.isPaused}
              isBreak={pomodoro.isBreak}
              progress={pomodoro.progress}
              formatTime={pomodoro.formatTime}
              onStart={handleStart}
              onPause={pomodoro.pause}
              onResume={pomodoro.resume}
              onReset={() => {
                pomodoro.reset();
                ambientSound.stop();
                if (focusSession.currentSession) {
                  focusSession.abandonSession(focusSession.currentSession._id);
                }
              }}
              onSkip={pomodoro.skip}
              sessionCount={pomodoro.sessionCount}
            />
          </div>

          {/* Right sidebar - Stats and Theme Selector (when not in fullscreen) */}
          {!isFullscreen && (
            <div className="w-full md:w-80 space-y-4 flex-shrink-0">
              <div className="card p-4">
                <div className="text-sm text-[var(--text-secondary)] mb-2">Today's Stats</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Sessions</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {focusSession.stats.totalSessions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Focus Time</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {Math.floor(focusSession.stats.totalMinutes / 60)}h{' '}
                      {focusSession.stats.totalMinutes % 60}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">DP Earned</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {focusSession.stats.totalDP}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Analytics Panel */}
      <AnimatePresence>
        {showAnalytics && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowAnalytics(false)}
            />

              <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-[var(--bg-primary)] border-l border-[var(--border-color)] shadow-xl z-50 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h2>
                  <button
                    onClick={() => setShowAnalytics(false)}
                    className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                    aria-label="Close analytics"
                  >
                    <FaTimes className="text-[var(--text-primary)]" />
                  </button>
                </div>
                
                <FocusAnalytics
                  stats={focusSession.stats}
                  dailyStats={dailyStats}
                  weeklyStats={weeklyStats}
                />
                      </div>
                    </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FocusModePage;
