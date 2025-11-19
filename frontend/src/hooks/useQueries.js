import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  tasksAPI,
  goalsAPI,
  habitsAPI,
  friendsAPI,
  analyticsAPI,
  authAPI,
  challengesAPI,
  focusAPI,
  gratitudeAPI,
  financeAPI,
} from '../services/api';

// Query keys for consistent cache management
export const queryKeys = {
  tasks: ['tasks'],
  goals: ['goals'],
  habits: ['habits'],
  friends: ['friends'],
  analytics: ['analytics'],
  leaderboard: ['leaderboard'],
  user: ['user'],
  challenges: ['challenges'],
  focusStats: ['focusStats'],
  gratitudeStreak: ['gratitudeStreak'],
  financeStats: ['financeStats'],
};

// Tasks queries
export const useTasks = () => {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => tasksAPI.getAll().then(res => res.data || []),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskData) => tasksAPI.create(taskData).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => tasksAPI.update(id, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tasksAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
};

// Goals queries
export const useGoals = () => {
  return useQuery({
    queryKey: queryKeys.goals,
    queryFn: () => goalsAPI.getAll().then(res => res.data || []),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalData) => goalsAPI.create(goalData).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => goalsAPI.update(id, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => goalsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
};

// Habits queries
export const useHabits = () => {
  return useQuery({
    queryKey: queryKeys.habits,
    queryFn: () => habitsAPI.getAll().then(res => res.data || []),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCompleteHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => habitsAPI.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits });
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard });
    },
  });
};

// Friends queries
export const useFriends = () => {
  return useQuery({
    queryKey: queryKeys.friends,
    queryFn: () => friendsAPI.getAll().then(res => res.data || {}),
    staleTime: 5 * 60 * 1000,
  });
};

export const useLeaderboard = () => {
  return useQuery({
    queryKey: queryKeys.leaderboard,
    queryFn: () => friendsAPI.getLeaderboard().then(res => res.data || []),
    staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic)
  });
};

// Analytics queries
export const useAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: () => analyticsAPI.getDashboard().then(res => res.data || {}),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// User query
export const useUser = () => {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => authAPI.getMe().then(res => res.data?.user),
    staleTime: 5 * 60 * 1000,
  });
};

// Challenges query
export const useChallenges = () => {
  return useQuery({
    queryKey: queryKeys.challenges,
    queryFn: () => challengesAPI.getActive().then(res => res.data || []),
    staleTime: 5 * 60 * 1000,
  });
};

