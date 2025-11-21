import { useState, useEffect, useCallback } from 'react';
import { focusAPI } from '../services/api';
import { useToast } from './useToast';

/**
 * Custom hook for managing focus sessions
 * Handles API calls, session tracking, and statistics
 */
export const useFocusSession = () => {
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    totalDP: 0,
    averageSessionLength: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Load stats on mount
  useEffect(() => {
    loadStats();
    loadHistory();
  }, []);

  const loadStats = async () => {
    try {
      const response = await focusAPI.getStats();
      setStats(response.data || {
        totalSessions: 0,
        totalMinutes: 0,
        totalDP: 0,
        averageSessionLength: 0,
        streak: 0,
      });
    } catch (error) {
      console.error('Error loading focus stats:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await focusAPI.getHistory();
      setSessionHistory(response.data || []);
    } catch (error) {
      console.error('Error loading focus history:', error);
    }
  };

  const startSession = async (data) => {
    try {
      setLoading(true);
      const response = await focusAPI.start(data);
      setCurrentSession(response.data);
      toast.success('Focus session started! Stay disciplined 💪');
      return response.data;
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start focus session');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeSession = async (sessionId, completedDuration) => {
    try {
      setLoading(true);
      const response = await focusAPI.complete(sessionId, { completedDuration });
      setCurrentSession(null);
      
      // Refresh stats and history
      await Promise.all([loadStats(), loadHistory()]);
      
      toast.success(`🎉 Session completed! Earned ${response.data?.dpEarned || 0} DP ✨`);
      return response.data;
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const abandonSession = async (sessionId) => {
    try {
      setLoading(true);
      // Note: Backend might need an abandon endpoint
      setCurrentSession(null);
      await loadStats();
      toast.info('Session abandoned');
    } catch (error) {
      console.error('Error abandoning session:', error);
      toast.error('Failed to abandon session');
    } finally {
      setLoading(false);
    }
  };

  // Calculate weekly stats
  const getWeeklyStats = useCallback(() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekSessions = sessionHistory.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startOfWeek && session.status === 'completed';
    });

    const totalMinutes = weekSessions.reduce((sum, s) => sum + (s.completedDuration || s.duration || 0), 0);
    const totalSessions = weekSessions.length;
    const totalDP = weekSessions.reduce((sum, s) => sum + (s.dpEarned || 0), 0);

    return {
      totalMinutes,
      totalSessions,
      totalDP,
      averageSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
    };
  }, [sessionHistory]);

  // Get daily stats for the last 7 days
  const getDailyStats = useCallback(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const daySessions = sessionHistory.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= date && sessionDate <= dayEnd && session.status === 'completed';
      });

      const totalMinutes = daySessions.reduce((sum, s) => sum + (s.completedDuration || s.duration || 0), 0);
      
      days.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: totalMinutes,
        sessions: daySessions.length,
      });
    }
    
    return days;
  }, [sessionHistory]);

  return {
    currentSession,
    sessionHistory,
    stats,
    loading,
    startSession,
    completeSession,
    abandonSession,
    loadStats,
    loadHistory,
    getWeeklyStats,
    getDailyStats,
  };
};

