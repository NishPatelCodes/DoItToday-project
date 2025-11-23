import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHome,
  FaTasks,
  FaStar,
  FaDollarSign,
  FaUser,
} from 'react-icons/fa';

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
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/' || location.pathname === '/dashboard/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center pb-safe">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-4 md:mb-6 flex items-center gap-2 px-4 py-3 bg-[var(--bg-secondary)]/95 backdrop-blur-lg border border-[var(--border-color)] rounded-2xl shadow-2xl"
      >
        {navItems.map((item, index) => {
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 touch-manipulation min-w-[60px] min-h-[60px] group"
            >
              <motion.div
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/50'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <item.icon className="text-lg" />
              </motion.div>
              <span
                className={`text-[10px] font-medium mt-1 transition-colors ${
                  active
                    ? 'text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </motion.div>
    </nav>
  );
};

export default BottomDock;

