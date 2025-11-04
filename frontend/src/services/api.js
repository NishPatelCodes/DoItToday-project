import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
    });
    
    // Return error to be handled by component
    return Promise.reject(error);
  }
);

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage');
  if (token) {
    try {
      const authData = JSON.parse(token);
      if (authData.state?.token) {
        config.headers.Authorization = `Bearer ${authData.state.token}`;
      }
    } catch (e) {
      // Invalid token format
    }
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Tasks API
export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getShared: () => api.get('/tasks/shared'),
};

// Goals API
export const goalsAPI = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  getShared: () => api.get('/goals/shared'),
};

// Friends API
export const friendsAPI = {
  getAll: () => api.get('/friends'),
  add: (email) => api.post('/friends/add', { email }),
  remove: (id) => api.delete(`/friends/${id}`),
  getLeaderboard: () => api.get('/friends/leaderboard'),
  getActivity: (id) => api.get(`/friends/${id}/activity`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

// Habits API
export const habitsAPI = {
  getAll: () => api.get('/habits'),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  complete: (id) => api.post(`/habits/${id}/complete`),
  delete: (id) => api.delete(`/habits/${id}`),
};

// Focus API
export const focusAPI = {
  start: (data) => api.post('/focus/start', data),
  complete: (id) => api.put(`/focus/${id}/complete`),
  getHistory: () => api.get('/focus/history'),
};

// Reactions API
export const reactionsAPI = {
  add: (data) => api.post('/reactions', data),
  remove: (targetType, targetId) => api.delete(`/reactions/${targetType}/${targetId}`),
  get: (targetType, targetId) => api.get(`/reactions/${targetType}/${targetId}`),
};

// Smart Planner API
export const smartPlannerAPI = {
  suggest: () => api.get('/smart-planner/suggest'),
};

export default api;

