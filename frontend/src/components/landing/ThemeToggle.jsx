import { motion } from 'framer-motion';
import { useThemeStore } from '../../hooks/useTheme';
import { FaSun, FaMoon } from 'react-icons/fa';

/**
 * Theme Toggle Component
 * 
 * Premium glassmorphism theme toggle with smooth animations
 * Features moon/sun icon transitions and glass styling
 */
function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="
        w-12 h-12 rounded-xl
        backdrop-blur-2xl
        bg-white/70 dark:bg-white/4
        border border-black/10 dark:border-white/10
        shadow-xl
        flex items-center justify-center
        text-zinc-900 dark:text-zinc-100
        hover:bg-white/90 dark:hover:bg-white/8
        hover:border-black/20 dark:hover:border-white/20
        hover:shadow-2xl
        transition-all duration-300 ease-out
        cursor-pointer
      "
      aria-label="Toggle theme"
      type="button"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {theme === 'dark' ? (
          <FaSun className="w-5 h-5 text-yellow-500" />
        ) : (
          <FaMoon className="w-5 h-5 text-purple-600" />
        )}
      </motion.div>
    </motion.button>
  );
}

export default ThemeToggle;
