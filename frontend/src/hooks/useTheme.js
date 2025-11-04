import { create } from 'zustand';

// Load from localStorage
const loadThemeFromStorage = () => {
  try {
    const stored = localStorage.getItem('theme-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.theme || 'light';
    }
  } catch (e) {
    // Ignore
  }
  return 'light';
};

const initialTheme = loadThemeFromStorage();

export const useThemeStore = create((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme-storage', JSON.stringify({ theme: newTheme }));
    set({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
  },
  setTheme: (theme) => {
    localStorage.setItem('theme-storage', JSON.stringify({ theme }));
    set({ theme });
    document.documentElement.setAttribute('data-theme', theme);
  },
}));

