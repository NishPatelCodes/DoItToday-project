import { create } from 'zustand';

// Load from localStorage on init
const loadAuthFromStorage = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { user: null, token: null };
    }
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state || { user: null, token: null };
    }
  } catch (e) {
    // Ignore localStorage errors
    console.warn('Failed to load auth from storage:', e);
  }
  return { user: null, token: null };
};

const { user: initialUser, token: initialToken } = loadAuthFromStorage();

export const useAuthStore = create((set) => ({
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken,
  login: (user, token) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('auth-storage', JSON.stringify({ state: { user, token } }));
      }
    } catch (e) {
      console.warn('Failed to save auth to storage:', e);
    }
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('auth-storage');
      }
    } catch (e) {
      console.warn('Failed to remove auth from storage:', e);
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
  updateUser: (user) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
        const token = stored.state?.token || null;
        localStorage.setItem('auth-storage', JSON.stringify({ state: { user, token } }));
      }
    } catch (e) {
      console.warn('Failed to update user in storage:', e);
    }
    set({ user });
  },
}));

