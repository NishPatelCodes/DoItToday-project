import { create } from 'zustand';

// Load from localStorage on init
const loadAuthFromStorage = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state || { user: null, token: null };
    }
  } catch (e) {
    // Ignore
  }
  return { user: null, token: null };
};

const { user: initialUser, token: initialToken } = loadAuthFromStorage();

export const useAuthStore = create((set) => ({
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken,
  login: (user, token) => {
    localStorage.setItem('auth-storage', JSON.stringify({ state: { user, token } }));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('auth-storage');
    set({ user: null, token: null, isAuthenticated: false });
  },
  updateUser: (user) => {
    const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    const token = stored.state?.token || null;
    localStorage.setItem('auth-storage', JSON.stringify({ state: { user, token } }));
    set({ user });
  },
}));

