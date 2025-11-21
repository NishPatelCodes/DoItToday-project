import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaCalendar, FaFire, FaCheckCircle, FaEdit, FaTimes, FaSpinner } from 'react-icons/fa';
import { format, isToday, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { gratitudeAPI, authAPI, friendsAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';
import { useScrollLock } from '../hooks/useScrollLock';

const GratitudeJournal = () => {
  const [todayEntry, setTodayEntry] = useState(null);
  const [entries, setEntries] = useState([]);
  const [streak, setStreak] = useState({ streak: 0, lastEntryDate: null, totalEntries: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showReminder, setShowReminder] = useState(false);
  const [viewMode, setViewMode] = useState('today'); // 'today' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const toast = useToast();
  const { updateUser } = useAuthStore();
  
  // Lock body scroll when modal is open
  useScrollLock(showReminder);

  // Form state
  const [formEntries, setFormEntries] = useState(['', '', '']);

  useEffect(() => {
    loadData();
    checkReminder();
  }, []);

  useEffect(() => {
    // Reload today's entry when date changes
    loadTodayEntry();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [todayRes, streakRes, entriesRes] = await Promise.all([
        gratitudeAPI.getToday(),
        gratitudeAPI.getStreak(),
        gratitudeAPI.getAll(),
      ]);

      const todayData = todayRes.data;
      if (todayData) {
        setTodayEntry(todayData);
        setFormEntries(todayData.entries || ['', '', '']);
      } else {
        setFormEntries(['', '', '']);
      }

      setStreak(streakRes.data || { streak: 0, lastEntryDate: null, totalEntries: 0 });
      setEntries(entriesRes.data || []);
    } catch (error) {
      setError('Failed to load gratitude entries. Please try again.');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayEntry = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await gratitudeAPI.getByDate(dateStr);
      const entry = res.data;
      if (entry) {
        setTodayEntry(entry);
        setFormEntries(entry.entries || ['', '', '']);
      } else {
        setTodayEntry(null);
        setFormEntries(['', '', '']);
      }
    } catch (error) {
      console.error('Error loading entry:', error);
    }
  };

  const checkReminder = async () => {
    try {
      const todayRes = await gratitudeAPI.getToday();
      if (!todayRes.data) {
        // Check if it's been more than 2 hours since midnight
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(0, 0, 0, 0);
        const hoursSinceMidnight = (now - midnight) / (1000 * 60 * 60);
        
        if (hoursSinceMidnight >= 2) {
          setShowReminder(true);
        }
      }
    } catch (error) {
      console.error('Error checking reminder:', error);
    }
  };

  const handleInputChange = (index, value) => {
    const newEntries = [...formEntries];
    newEntries[index] = value;
    setFormEntries(newEntries);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all entries are filled
    const trimmedEntries = formEntries.map(e => e.trim()).filter(e => e.length > 0);
    if (trimmedEntries.length !== 3) {
      setError('Please fill in all 3 gratitude entries.');
      return;
    }

    // Check if date is today or past
    const entryDate = viewMode === 'today' ? new Date() : selectedDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    entryDate.setHours(0, 0, 0, 0);
    
    if (entryDate > today) {
      setError('Cannot create entries for future dates.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const data = {
        entries: trimmedEntries,
        date: format(entryDate, 'yyyy-MM-dd'),
      };

      let result;
      if (todayEntry) {
        result = await gratitudeAPI.update(todayEntry._id, data);
      } else {
        result = await gratitudeAPI.create(data);
      }

      const wasNewEntry = !todayEntry;
      setTodayEntry(result.data);
      setShowReminder(false);
      
      // Reload streak and entries, and refresh XP if new entry
      const [streakRes, entriesRes] = await Promise.all([
        gratitudeAPI.getStreak(),
        gratitudeAPI.getAll(),
      ]);
      setStreak(streakRes.data || { streak: 0, lastEntryDate: null, totalEntries: 0 });
      setEntries(entriesRes.data || []);
      
      // Refresh user XP/level if new entry was created (XP is awarded)
      if (wasNewEntry) {
        try {
          const [userRes, leaderboardRes] = await Promise.all([
            authAPI.getMe(),
            friendsAPI.getLeaderboard()
          ]);
          updateUser({
            ...userRes.data.user,
            xp: userRes.data.user.xp || 0,
            level: userRes.data.user.level || 1,
          });
          toast.success('Gratitude entry saved! ✨ XP earned!');
        } catch (e) {
          // Silently handle reload failure
        }
      } else {
        toast.success('Gratitude entry updated!');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save. Please try again.');
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDateSelect = async (date) => {
    if (date > new Date()) {
      return; // Can't select future dates
    }
    setSelectedDate(date);
    setViewMode('today');
    await loadTodayEntry();
  };

  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return days;
  };

  const getEntryForDate = (date) => {
    return entries.find(entry => {
      const entryDate = new Date(entry.date);
      return isSameDay(entryDate, date);
    });
  };

  const positiveMessages = [
    "Great job! Keep spreading positivity! 🌟",
    "You're building a wonderful habit! ✨",
    "Every day is a new opportunity for gratitude! 💫",
    "Your positive energy is contagious! 🌈",
    "Keep up the amazing work! 🎉",
  ];

  const getRandomMessage = () => {
    return positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-4xl text-[var(--accent-primary)]"
        >
          <FaSpinner />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
              <FaHeart className="text-[var(--accent-primary)]" />
              Gratitude Journal
            </h1>
            <p className="text-[var(--text-secondary)]">
              Reflect on 3 positive things each day
            </p>
          </div>
          
          {/* Streak Display */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/30 rounded-xl p-4 text-center min-w-[120px]"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <FaFire className="text-orange-500 text-xl" />
              <span className="text-2xl font-bold text-orange-500">{streak.streak}</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Day {streak.streak === 1 ? '' : 's'} Streak
            </p>
          </motion.div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('today')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'today'
                ? 'bg-[var(--accent-primary)] text-white shadow-md'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'calendar'
                ? 'bg-[var(--accent-primary)] text-white shadow-md'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            <FaCalendar className="inline mr-2" />
            Calendar
          </button>
        </div>
      </div>

      {/* Reminder Modal */}
      <AnimatePresence>
        {showReminder && !todayEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReminder(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-5xl mb-4"
                >
                  💝
                </motion.div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  Don't forget your gratitude!
                </h3>
                <p className="text-[var(--text-secondary)]">
                  Take a moment to reflect on 3 positive things from today.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReminder(false)}
                  className="btn-secondary flex-1"
                >
                  Later
                </button>
                <button
                  onClick={() => {
                    setShowReminder(false);
                    setViewMode('today');
                  }}
                  className="btn-primary flex-1"
                >
                  Write Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {viewMode === 'today' 
                  ? (isToday(selectedDate) ? "Today's Gratitude" : format(selectedDate, 'MMMM d, yyyy'))
                  : "Today's Gratitude"}
              </h2>
              {viewMode === 'today' && !isToday(selectedDate) && (
                <button
                  onClick={() => {
                    setSelectedDate(new Date());
                    loadTodayEntry();
                  }}
                  className="text-sm text-[var(--accent-primary)] hover:underline"
                >
                  Go to Today
                </button>
              )}
            </div>

            {viewMode === 'today' && !isToday(selectedDate) && selectedDate > new Date() && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <p className="text-yellow-600 text-sm">
                  ⚠️ Cannot create entries for future dates.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {formEntries.map((entry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    {index + 1}. What are you grateful for?
                  </label>
                  <textarea
                    value={entry}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    placeholder={`Gratitude ${index + 1}...`}
                    className="input-field min-h-[100px] resize-none"
                    maxLength={200}
                    disabled={saving || (viewMode === 'today' && !isToday(selectedDate) && selectedDate > new Date())}
                  />
                  <div className="text-xs text-[var(--text-tertiary)] mt-1 text-right">
                    {entry.length}/200
                  </div>
                </motion.div>
              ))}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-600 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {todayEntry && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-600 text-sm flex items-center gap-2"
                >
                  <FaCheckCircle />
                  <span>Saved! {getRandomMessage()}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={saving || (viewMode === 'today' && !isToday(selectedDate) && selectedDate > new Date())}
                className="btn-primary w-full py-3 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {todayEntry ? 'Update Gratitude' : 'Save Gratitude'}
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Calendar Sidebar */}
        <div className="space-y-4">
          {viewMode === 'calendar' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[var(--text-primary)]">
                  {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const prevMonth = new Date(currentMonth);
                      prevMonth.setMonth(prevMonth.getMonth() - 1);
                      setCurrentMonth(prevMonth);
                    }}
                    className="p-1 hover:bg-[var(--bg-tertiary)] rounded"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    className="p-1 hover:bg-[var(--bg-tertiary)] rounded text-sm"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const nextMonth = new Date(currentMonth);
                      nextMonth.setMonth(nextMonth.getMonth() + 1);
                      setCurrentMonth(nextMonth);
                    }}
                    className="p-1 hover:bg-[var(--bg-tertiary)] rounded"
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-[var(--text-secondary)] font-medium p-1">
                    {day}
                  </div>
                ))}
                {getCalendarDays().map((day, index) => {
                  const entry = getEntryForDate(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isPast = day <= new Date();
                  
                  return (
                    <button
                      key={index}
                      onClick={() => isPast && handleDateSelect(day)}
                      disabled={!isPast}
                      className={`
                        aspect-square p-1 rounded text-xs transition-all
                        ${entry 
                          ? 'bg-green-500/20 border border-green-500/50 text-green-600 font-semibold' 
                          : isSelected
                          ? 'bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]'
                          : 'hover:bg-[var(--bg-tertiary)] border border-transparent'
                        }
                        ${!isPast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                        ${isToday(day) ? 'ring-2 ring-[var(--accent-primary)]' : ''}
                      `}
                    >
                      {format(day, 'd')}
                      {entry && <div className="w-1 h-1 bg-green-500 rounded-full mx-auto mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-4"
          >
            <h3 className="font-bold text-[var(--text-primary)] mb-3">Your Progress</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[var(--text-secondary)]">Total Entries</span>
                  <span className="font-bold text-[var(--text-primary)]">{streak.totalEntries}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[var(--text-secondary)]">Current Streak</span>
                  <span className="font-bold text-orange-500 flex items-center gap-1">
                    <FaFire /> {streak.streak} days
                  </span>
                </div>
              </div>
              {streak.streak > 0 && (
                <div className="pt-3 border-t border-[var(--border-color)]">
                  <p className="text-xs text-[var(--text-secondary)]">
                    🎉 Keep it up! You're doing amazing!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GratitudeJournal;

