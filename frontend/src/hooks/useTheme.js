import { create } from 'zustand';

// Load from localStorage
const loadThemeFromStorage = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 'light';
    }
    const stored = localStorage.getItem('theme-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.theme || 'light';
    }
  } catch (e) {
    // Ignore localStorage errors
    console.warn('Failed to load theme from storage:', e);
  }
  return 'light';
};

const initialTheme = loadThemeFromStorage();

// Initialize theme attribute on document immediately
if (typeof document !== 'undefined') {
  try {
    document.documentElement.setAttribute('data-theme', initialTheme);
  } catch (e) {
    console.warn('Failed to set initial theme:', e);
  }
}

export const useThemeStore = create((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('theme-storage', JSON.stringify({ theme: newTheme }));
      }
    } catch (e) {
      console.warn('Failed to save theme to storage:', e);
    }
    set({ theme: newTheme });
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    } catch (e) {
      console.warn('Failed to set theme attribute:', e);
    }
  },
  setTheme: (theme) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('theme-storage', JSON.stringify({ theme }));
      }
    } catch (e) {
      console.warn('Failed to save theme to storage:', e);
    }
    set({ theme });
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
      }
    } catch (e) {
      console.warn('Failed to set theme attribute:', e);
    }
  },
}));

