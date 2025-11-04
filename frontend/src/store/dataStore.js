import { create } from 'zustand';

export const useDataStore = create((set) => ({
  tasks: [],
  goals: [],
  habits: [],
  friends: [],
  analytics: null,
  leaderboard: [],
  setTasks: (tasks) => set({ tasks }),
  setGoals: (goals) => set({ goals }),
  setHabits: (habits) => set({ habits }),
  setFriends: (friends) => set({ friends }),
  setAnalytics: (analytics) => set({ analytics }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === id ? updatedTask : t)),
    })),
  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id) })),
  addGoal: (goal) => set((state) => ({ goals: [goal, ...state.goals] })),
  updateGoal: (id, updatedGoal) =>
    set((state) => ({
      goals: state.goals.map((g) => (g._id === id ? updatedGoal : g)),
    })),
  deleteGoal: (id) =>
    set((state) => ({ goals: state.goals.filter((g) => g._id !== id) })),
  addHabit: (habit) => set((state) => ({ habits: [habit, ...state.habits] })),
  updateHabit: (id, updatedHabit) =>
    set((state) => ({
      habits: state.habits.map((h) => (h._id === id ? updatedHabit : h)),
    })),
  deleteHabit: (id) =>
    set((state) => ({ habits: state.habits.filter((h) => h._id !== id) })),
}));

