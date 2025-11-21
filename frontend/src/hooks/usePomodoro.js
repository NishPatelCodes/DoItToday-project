import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for Pomodoro timer functionality
 * Manages work/break cycles, long breaks, and session tracking
 */
export const usePomodoro = (initialWorkMinutes = 25, initialBreakMinutes = 5, initialLongBreakMinutes = 15) => {
  const [workMinutes, setWorkMinutes] = useState(() => {
    const saved = localStorage.getItem('pomodoro-work-minutes');
    return saved ? parseInt(saved, 10) : initialWorkMinutes;
  });
  const [breakMinutes, setBreakMinutes] = useState(() => {
    const saved = localStorage.getItem('pomodoro-break-minutes');
    return saved ? parseInt(saved, 10) : initialBreakMinutes;
  });
  const [longBreakMinutes, setLongBreakMinutes] = useState(() => {
    const saved = localStorage.getItem('pomodoro-long-break-minutes');
    return saved ? parseInt(saved, 10) : initialLongBreakMinutes;
  });
  
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [autoStart, setAutoStart] = useState(() => {
    const saved = localStorage.getItem('pomodoro-auto-start');
    return saved === 'true';
  });
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-work-minutes', workMinutes.toString());
  }, [workMinutes]);

  useEffect(() => {
    localStorage.setItem('pomodoro-break-minutes', breakMinutes.toString());
  }, [breakMinutes]);

  useEffect(() => {
    localStorage.setItem('pomodoro-long-break-minutes', longBreakMinutes.toString());
  }, [longBreakMinutes]);

  useEffect(() => {
    localStorage.setItem('pomodoro-auto-start', autoStart.toString());
  }, [autoStart]);

  const handleComplete = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isBreak) {
      // Work session completed
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);
      
      // Determine if it's time for a long break (every 4 sessions)
      const isLongBreak = newSessionCount % 4 === 0;
      const breakDuration = isLongBreak ? longBreakMinutes : breakMinutes;
      
      setIsBreak(true);
      setTimeLeft(breakDuration * 60);
      startTimeRef.current = null;
      pausedTimeRef.current = 0;
      
      if (autoStart) {
        setIsActive(true);
        setIsPaused(false);
      } else {
        setIsActive(false);
        setIsPaused(false);
      }
    } else {
      // Break completed, start work session
      setIsBreak(false);
      setTimeLeft(workMinutes * 60);
      startTimeRef.current = null;
      pausedTimeRef.current = 0;
      
      if (autoStart) {
        setIsActive(true);
        setIsPaused(false);
      } else {
        setIsActive(false);
        setIsPaused(false);
      }
    }
  }, [isBreak, sessionCount, breakMinutes, longBreakMinutes, workMinutes, autoStart]);

  // Timer countdown logic
  useEffect(() => {
    if (isActive && !isPaused) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now() - pausedTimeRef.current;
      }

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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (isPaused && startTimeRef.current) {
        pausedTimeRef.current = Date.now() - startTimeRef.current;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, handleComplete]);

  const start = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    startTimeRef.current = Date.now() - pausedTimeRef.current;
    pausedTimeRef.current = 0;
  }, []);
  
  // Reset timeLeft when work/break minutes change
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(isBreak ? breakMinutes * 60 : workMinutes * 60);
    }
  }, [workMinutes, breakMinutes, isBreak, isActive]);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
    startTimeRef.current = Date.now() - pausedTimeRef.current;
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setIsBreak(false);
    setTimeLeft(workMinutes * 60);
    setSessionCount(0);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [workMinutes]);

  const skip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  const calculateProgress = useCallback(() => {
    const totalSeconds = (isBreak ? (sessionCount % 4 === 0 ? longBreakMinutes : breakMinutes) : workMinutes) * 60;
    return totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  }, [timeLeft, isBreak, workMinutes, breakMinutes, longBreakMinutes, sessionCount]);

  const progress = calculateProgress();

  return {
    // State
    timeLeft,
    isActive,
    isPaused,
    isBreak,
    sessionCount,
    workMinutes,
    breakMinutes,
    longBreakMinutes,
    autoStart,
    
    // Actions
    start,
    pause,
    resume,
    reset,
    skip,
    
    // Settings
    setWorkMinutes,
    setBreakMinutes,
    setLongBreakMinutes,
    setAutoStart,
    
    // Utils
    formatTime,
    progress,
  };
};

