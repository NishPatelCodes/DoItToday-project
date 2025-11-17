import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExpand, FaCompress, FaTimes, FaChartBar } from 'react-icons/fa';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      return localStorage.getItem('focus-notifications') === 'true';
    } catch {
      return false;
    }
  });
  const [currentQuote, setCurrentQuote] = useState('');
  const containerRef = useRef(null);
  const toast = useToast();

  // Custom hooks
  const pomodoro = usePomodoro(25, 5, 15);
  const ambientSound = useAmbientSound('silent', 0.5);
  const focusSession = useFocusSession();

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

  // Rotate quotes during active sessions
  useEffect(() => {
    if (pomodoro.isActive && !pomodoro.isPaused) {
      const interval = setInterval(() => {
        setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
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
  const handleStart = async () => {
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
  };

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

  // Get analytics data
  const dailyStats = focusSession.getDailyStats();
  const weeklyStats = focusSession.getWeeklyStats();

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#1F1F1F] to-[#1A1A1A] opacity-100" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-indigo-900/10" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-white">Focus Mode</h1>
            {pomodoro.isActive && (
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium">
                FOCUSING
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
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
        <main className="flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-6" id="main-content">
          {/* Left sidebar - Task selector and ambient sound */}
          <div className="w-full md:w-80 space-y-4 flex-shrink-0">
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
              onVolumeChange={ambientSound.setVolume}
              onPlay={ambientSound.play}
              onStop={ambientSound.stop}
            />

            {/* Motivational quote */}
            {currentQuote && (
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

          {/* Center - Timer */}
          <div className="flex-1 flex flex-col items-center justify-center">
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

          {/* Right sidebar - Stats (when not in fullscreen) */}
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
