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
      className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)]/90 backdrop-blur-sm border border-[var(--border-color)] dark:border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] dark:text-[#F5F5F5] hover:border-[var(--accent-primary)] dark:hover:border-[#818CF8] transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
      aria-label="Toggle theme"
      type="button"
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

