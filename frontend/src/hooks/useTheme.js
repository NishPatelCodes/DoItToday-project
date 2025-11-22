import { create } from 'zustand';
import { useEffect } from 'react';

// Detect system preference
const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'light';
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

// Load from localStorage with system preference fallback
const loadThemeFromStorage = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return getSystemTheme();
    }
    const stored = localStorage.getItem('theme-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Support 'auto' mode
      if (parsed.theme === 'auto') {
        return getSystemTheme();
      }
      return parsed.theme || getSystemTheme();
    }
  } catch (e) {
    console.warn('Failed to load theme from storage:', e);
  }
  return getSystemTheme();
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
  themeMode: (() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('theme-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.mode || 'auto'; // 'auto' or 'manual'
        }
      }
    } catch (e) {
      // Ignore
    }
    return 'auto';
  })(),
  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('theme-storage', JSON.stringify({ 
          theme: newTheme,
          mode: 'manual' // Switch to manual mode when toggling
        }));
      }
    } catch (e) {
      console.warn('Failed to save theme to storage:', e);
    }
    set({ theme: newTheme, themeMode: 'manual' });
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
        localStorage.setItem('theme-storage', JSON.stringify({ 
          theme,
          mode: 'manual'
        }));
      }
    } catch (e) {
      console.warn('Failed to save theme to storage:', e);
    }
    set({ theme, themeMode: 'manual' });
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
      }
    } catch (e) {
      console.warn('Failed to set theme attribute:', e);
    }
  },
  setThemeMode: (mode) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('theme-storage');
        const parsed = stored ? JSON.parse(stored) : {};
        localStorage.setItem('theme-storage', JSON.stringify({ 
          ...parsed,
          mode
        }));
      }
    } catch (e) {
      console.warn('Failed to save theme mode to storage:', e);
    }
    set({ themeMode: mode });
    
    // If switching to auto, update theme based on system preference
    if (mode === 'auto') {
      const systemTheme = getSystemTheme();
      set({ theme: systemTheme });
      try {
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', systemTheme);
        }
      } catch (e) {
        console.warn('Failed to set theme attribute:', e);
      }
    }
  },
}));

// Hook to listen for system theme changes
export const useSystemThemeListener = () => {
  const { themeMode, setTheme } = useThemeStore();
  
  useEffect(() => {
    if (themeMode !== 'auto' || typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [themeMode, setTheme]);
};
