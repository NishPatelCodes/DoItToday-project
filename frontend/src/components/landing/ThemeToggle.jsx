import { motion } from 'framer-motion';
import { useThemeStore } from '../../hooks/useTheme';
import { FiSun, FiMoon } from 'react-icons/fi';

/**
 * Theme Toggle Component
 * 
 * Light/dark mode toggle button
 * Features smooth animations and icon transitions
 */
function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all duration-200 shadow-lg hover:shadow-xl"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'dark' ? (
          <FiSun className="w-5 h-5" />
        ) : (
          <FiMoon className="w-5 h-5" />
        )}
      </motion.div>
    </motion.button>
  );
}

export default ThemeToggle;

