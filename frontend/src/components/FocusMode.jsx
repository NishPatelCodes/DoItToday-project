import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaStop, FaHeadphones } from 'react-icons/fa';
import { focusAPI } from '../services/api';

const FocusMode = ({ taskId, onComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [sessionId, setSessionId] = useState(null);
  const [ambientMode, setAmbientMode] = useState('silent');
  const intervalRef = useRef(null);

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
      const response = await focusAPI.start({ taskId, duration: timeLeft / 60, ambientMode });
      setSessionId(response.data._id);
      setIsActive(true);
      setIsPaused(false);
    } catch (error) {
      // Error handled by alert
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(25 * 60);
    setSessionId(null);
    clearInterval(intervalRef.current);
  };

  const handleComplete = async () => {
    if (sessionId) {
      try {
        await focusAPI.complete(sessionId);
        if (onComplete) onComplete();
      } catch (error) {
        // Error handled silently
      }
    }
    handleStop();
  };

  const ambientModes = [
    { value: 'silent', label: 'Silent', icon: '🔇' },
    { value: 'rain', label: 'Rain', icon: '🌧️' },
    { value: 'ocean', label: 'Ocean', icon: '🌊' },
    { value: 'forest', label: 'Forest', icon: '🌲' },
    { value: 'coffee', label: 'Coffee Shop', icon: '☕' },
  ];

  const progress = (timeLeft / (25 * 60)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <FaHeadphones />
          Focus Mode
        </h2>
        <select
          value={ambientMode}
          onChange={(e) => setAmbientMode(e.target.value)}
          className="input-field w-auto text-sm"
          disabled={isActive}
        >
          {ambientModes.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.icon} {mode.label}
            </option>
          ))}
        </select>
      </div>

      <div className="text-center mb-6">
        <div className="relative w-64 h-64 mx-auto mb-4">
          {/* Progress ring */}
          <svg className="transform -rotate-90 w-full h-full">
            <circle
              cx="128"
              cy="128"
              r="110"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="110"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 110}`}
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 110 * (100 - progress)) / 100 }}
              transition={{ duration: 1 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
              <div className="text-5xl font-bold text-[var(--text-primary)] mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">Pomodoro Timer</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        {!isActive ? (
          <button onClick={handleStart} className="btn-primary flex items-center gap-2">
            <FaPlay />
            Start Focus
          </button>
        ) : (
          <>
            <button onClick={handlePause} className="btn-secondary flex items-center gap-2">
              {isPaused ? <FaPlay /> : <FaPause />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={handleStop} className="btn-secondary flex items-center gap-2">
              <FaStop />
              Stop
            </button>
          </>
        )}
      </div>

      {!isActive && (
        <div className="mt-4 text-center text-sm text-white/60">
          <p>Quick presets:</p>
          <div className="flex gap-2 justify-center mt-2">
            {[15, 25, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => setTimeLeft(mins * 60)}
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-sm transition-all"
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FocusMode;

