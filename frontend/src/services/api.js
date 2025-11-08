import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const isDev = import.meta.env.DEV;

// Detect if we're using Render (production) - Render has slow cold starts
const isProduction = API_URL.includes('render.com') || 
                     API_URL.includes('onrender.com') || 
                     (API_URL.includes('https://') && !API_URL.includes('localhost'));
const defaultTimeout = isProduction ? 30000 : 8000; // 30s for Render, 8s for local

// Debug logging removed to reduce console noise

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: defaultTimeout,
});

// Health check helper - disabled for production to avoid request spam
let isServerReady = false;
let healthCheckPromise = null;
let lastHealthCheckTime = 0;
const HEALTH_CHECK_COOLDOWN = 5000; // Only check once every 5 seconds max

const checkServerHealth = async () => {
  // Skip health check in production - it causes too many requests
  if (isProduction) {
    isServerReady = true;
    return true;
  }
  
  if (isServerReady) return true;
  
  // Rate limit health checks
  const now = Date.now();
  if (now - lastHealthCheckTime < HEALTH_CHECK_COOLDOWN && healthCheckPromise) {
    return healthCheckPromise;
  }
  
  if (healthCheckPromise) return healthCheckPromise;
  
  lastHealthCheckTime = now;
  
  healthCheckPromise = (async () => {
    const maxRetries = 2; // Reduced retries
    const retryDelay = 1000;
    const healthTimeout = 3000; // Shorter timeout
    
    // Get base URL (remove /api if present)
    const baseURL = API_URL.replace('/api', '');
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await axios.get(`${baseURL}/api/health`, {
          timeout: healthTimeout,
        });
        if (response.status === 200) {
          isServerReady = true;
          return true;
        }
      } catch (error) {
        // Only retry if it's a network error
        if (i < maxRetries - 1 && (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK')) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          // Consider server ready anyway (don't block requests)
          isServerReady = true;
          return true;
        }
      }
    }
    // Mark as ready to avoid infinite checks
    isServerReady = true;
    return false;
  })();
  
  return healthCheckPromise;
};

// Retry logic for failed requests (especially for Render cold starts)
const retryRequest = async (config, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Exponential backoff: 1s, 2s, 4s
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i - 1) * 1000));
      }
      // Use the same axios instance with proper timeout
      return await api.request(config);
    } catch (error) {
      // Only retry on timeout or network errors
      const isRetryableError = error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.message?.includes('timeout');
      if (i === retries - 1 || !isRetryableError) {
        throw error;
      }
    }
  }
};

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only log unexpected errors in development
    const status = error.response?.status;
    const isExpectedError = status === 401 || status === 404 || status === 403 || status === 422;
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
    
    // For timeout errors, always retry (especially important for POST/PUT/PATCH/DELETE)
    const isMutationRequest = ['post', 'put', 'patch', 'delete'].includes(error.config?.method?.toLowerCase());
    
    if (isTimeout && error.config && !error.config._retry) {
      error.config._retry = true;
      // More retries for mutation requests (create/update/delete) - these are critical
      const maxRetries = isMutationRequest ? 3 : 2;
      try {
        return await retryRequest(error.config, maxRetries);
      } catch (retryError) {
        // If retry also fails, continue with original error
        error = retryError;
      }
    }
    
    // Don't log timeout errors (they're expected on Render)
    if (!isExpectedError && !isTimeout && isDev) {
      // Only log unexpected errors in dev mode (excluding timeouts)
      console.error('API Error:', {
        message: error.message,
        status,
        url: error.config?.url,
      });
    }
    
    // Return error to be handled by component
    return Promise.reject(error);
  }
);

// Add request interceptor - health check disabled to avoid request spam
api.interceptors.request.use(
  async (config) => {
    // Skip health check for health endpoint itself
    if (config.url?.includes('/health')) {
      return config;
    }
    
    // Health check disabled - causes too many requests on Render
    // Just proceed with the request directly
    
    return config;
  },
  (error) => Promise.reject(error)
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
  accept: (id) => api.post(`/friends/accept/${id}`),
  decline: (id) => api.post(`/friends/decline/${id}`),
  cancel: (id) => api.post(`/friends/cancel/${id}`),
  remove: (id) => api.delete(`/friends/${id}`),
  getLeaderboard: () => api.get('/friends/leaderboard'),
  getActivity: (id) => api.get(`/friends/${id}/activity`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getGoalAnalytics: (goalId) => api.get(`/analytics/goal/${goalId}`),
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

// Gratitude API
export const gratitudeAPI = {
  getAll: (params) => api.get('/gratitude', { params }),
  getToday: () => api.get('/gratitude/today'),
  getByDate: (date) => api.get(`/gratitude/${date}`),
  getStreak: () => api.get('/gratitude/streak'),
  create: (data) => api.post('/gratitude', data),
  update: (id, data) => api.put(`/gratitude/${id}`, data),
  delete: (id) => api.delete(`/gratitude/${id}`),
};

// Health check API
export const healthAPI = {
  check: () => checkServerHealth(),
};

// Admin API
export const adminAPI = {
  recalculateMyLevel: () => api.post('/admin/recalculate-my-level'),
  recalculateAllLevels: () => api.post('/admin/recalculate-levels'),
};

export default api;

