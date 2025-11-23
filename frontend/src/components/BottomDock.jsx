import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHome,
  FaTasks,
  FaStar,
  FaDollarSign,
  FaUser,
} from 'react-icons/fa';

// Utility function for class merging
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const BottomDock = () => {
  const location = useLocation();

  const navItems = [
    { icon: FaHome, label: 'Home', path: '/dashboard' },
    { icon: FaTasks, label: 'Tasks', path: '/dashboard/tasks' },
    { icon: FaStar, label: 'Hero', path: '/dashboard/hero' },
    { icon: FaDollarSign, label: 'Finance', path: '/dashboard/finance' },
    { icon: FaUser, label: 'Profile', path: '/dashboard/profile' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return (
        location.pathname === '/dashboard' ||
        location.pathname === '/dashboard/' ||
        location.pathname === '/dashboard/home' ||
        location.pathname === '/dashboard/dashboard'
      );
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 1rem)',
      }}
    >
      {/* Backdrop blur layer for premium glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/80 via-transparent to-transparent pointer-events-none" />
      
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          duration: 0.5,
        }}
        whileHover={{
          y: -4,
          transition: {
            type: 'spring',
            stiffness: 400,
            damping: 17,
          },
        }}
        className={cn(
          'relative mb-4 md:mb-6 flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2.5 md:py-3',
          'pointer-events-auto',
          // Premium glassmorphism
          'bg-[var(--bg-secondary)]/80',
          'backdrop-blur-xl backdrop-saturate-150',
          // Borders and shadows
          'border border-[var(--border-color)]/50',
          'rounded-3xl md:rounded-2xl',
          'shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]',
          'shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset]',
          // Mobile full-width, desktop centered
          'w-[calc(100%-2rem)] max-w-md md:max-w-none md:w-auto',
          // Safe area padding for mobile (using env() for iOS notch support)
          'pb-4 md:pb-0'
        )}
        style={{
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        {navItems.map((item, index) => {
          const active = isActive(item.path);
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.05,
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
            >
              <NavLink
                to={item.path}
                className={cn(
                  'relative flex flex-col items-center justify-center',
                  'p-2.5 md:p-3 rounded-xl',
                  'touch-manipulation',
                  'min-w-[56px] min-h-[56px] md:min-w-[60px] md:min-h-[60px]',
                  'group transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]/50 focus-visible:ring-offset-2'
                )}
              >
                <motion.div
                  whileHover={{
                    scale: 1.2,
                    y: -4,
                    transition: {
                      type: 'spring',
                      stiffness: 400,
                      damping: 17,
                    },
                  }}
                  whileTap={{
                    scale: 0.95,
                    transition: {
                      type: 'spring',
                      stiffness: 600,
                      damping: 20,
                    },
                  }}
                  className={cn(
                    'relative flex items-center justify-center',
                    'w-10 h-10 md:w-11 md:h-11',
                    'rounded-xl transition-all duration-300',
                    active
                      ? cn(
                          'bg-[var(--accent-primary)] text-white',
                          'shadow-lg shadow-[var(--accent-primary)]/50',
                          // Premium glow effect for active state
                          'drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]'
                        )
                      : cn(
                          'text-[var(--text-secondary)]',
                          'hover:text-[var(--text-primary)]',
                          'hover:bg-[var(--bg-tertiary)]/50'
                        )
                  )}
                  style={
                    active
                      ? {
                          filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.7)) drop-shadow(0 0 4px rgba(139, 92, 246, 0.4))',
                        }
                      : {}
                  }
                >
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 rounded-xl bg-[var(--accent-primary)]"
                      initial={false}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                      style={{
                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center">
                    <item.icon className="text-lg md:text-xl" />
                  </span>
                </motion.div>
                <motion.span
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: active ? 1 : 0.7 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'text-[10px] md:text-[11px] font-medium mt-1',
                    'transition-colors duration-200',
                    active
                      ? 'text-[var(--accent-primary)] font-semibold'
                      : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                  )}
                >
                  {item.label}
                </motion.span>
              </NavLink>
            </motion.div>
          );
        })}
      </motion.div>
    </nav>
  );
};

export default BottomDock;
