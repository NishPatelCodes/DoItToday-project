import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCog, FaTimes, FaBell, FaKeyboard } from 'react-icons/fa';

/**
 * Settings Panel Component
 * Allows customization of Pomodoro settings, notifications, and preferences
 */
const SettingsPanel = ({
  workMinutes,
  breakMinutes,
  longBreakMinutes,
  autoStart,
  notificationsEnabled,
  onWorkMinutesChange,
  onBreakMinutesChange,
  onLongBreakMinutesChange,
  onAutoStartChange,
  onNotificationsChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Settings Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-all ${className}`}
        aria-label="Open settings"
      >
        <FaCog className="text-[var(--text-primary)]" />
      </motion.button>

      {/* Settings Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-96 bg-[var(--bg-primary)] border-l border-[var(--border-color)] shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                    aria-label="Close settings"
                  >
                    <FaTimes className="text-[var(--text-primary)]" />
                  </button>
                </div>

                {/* Pomodoro Settings */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                    Pomodoro Timer
                  </h3>

                  <div className="space-y-4">
                    {/* Work Duration */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Work Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={workMinutes}
                        onChange={(e) => onWorkMinutesChange(parseInt(e.target.value, 10))}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
                      />
                    </div>

                    {/* Break Duration */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Short Break (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={breakMinutes}
                        onChange={(e) => onBreakMinutesChange(parseInt(e.target.value, 10))}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
                      />
                    </div>

                    {/* Long Break Duration */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Long Break (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={longBreakMinutes}
                        onChange={(e) => onLongBreakMinutesChange(parseInt(e.target.value, 10))}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
                      />
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        Long break occurs after every 4 work sessions
                      </p>
                    </div>

                    {/* Auto Start */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">Auto Start</div>
                        <div className="text-sm text-[var(--text-secondary)]">
                          Automatically start breaks and work sessions
                        </div>
                      </div>
                      <button
                        onClick={() => onAutoStartChange(!autoStart)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          autoStart ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-tertiary)]'
                        }`}
                        aria-label="Toggle auto start"
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            autoStart ? 'translate-x-6' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <FaBell />
                    Notifications
                  </h3>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">Browser Notifications</div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        Get notified when sessions start/end
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!notificationsEnabled && 'Notification' in window) {
                          Notification.requestPermission().then(permission => {
                            if (permission === 'granted') {
                              onNotificationsChange(true);
                            }
                          });
                        } else {
                          onNotificationsChange(!notificationsEnabled);
                        }
                      }}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        notificationsEnabled ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-tertiary)]'
                      }`}
                      aria-label="Toggle notifications"
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          notificationsEnabled ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <FaKeyboard />
                    Keyboard Shortcuts
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]">
                      <span className="text-[var(--text-secondary)]">Start/Pause</span>
                      <kbd className="px-2 py-1 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono">
                        Space
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]">
                      <span className="text-[var(--text-secondary)]">Reset</span>
                      <kbd className="px-2 py-1 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono">
                        R
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]">
                      <span className="text-[var(--text-secondary)]">Skip Break</span>
                      <kbd className="px-2 py-1 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono">
                        S
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]">
                      <span className="text-[var(--text-secondary)]">Settings</span>
                      <kbd className="px-2 py-1 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono">
                        Esc
                      </kbd>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SettingsPanel;

