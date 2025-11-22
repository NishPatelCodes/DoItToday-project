import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaTasks,
  FaBullseye,
  FaCalendarAlt,
  FaChartLine,
  FaUserFriends,
  FaUser,
  FaCog,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
  FaHeart,
  FaStickyNote,
  FaTrophy,
  FaHeadphones,
  FaDollarSign,
} from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollLock } from '../hooks/useScrollLock';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lock scroll on mobile when sidebar is open
  useScrollLock(isOpen && isMobile);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && window.innerWidth < 768) {
        const sidebar = document.querySelector('.sidebar-mobile');
        if (sidebar && !sidebar.contains(e.target)) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const navItems = [
    { icon: FaHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FaTasks, label: 'Tasks', path: '/dashboard/tasks' },
    { icon: FaBullseye, label: 'Goals', path: '/dashboard/goals' },
    { icon: FaTrophy, label: 'Challenges', path: '/dashboard/challenges' },
    { icon: FaHeadphones, label: 'Focus Mode', path: '/dashboard/focus' },
    { icon: FaDollarSign, label: 'Finance', path: '/dashboard/finance' },
    { icon: FaCalendarAlt, label: 'Calendar', path: '/dashboard/calendar' },
    { icon: FaStickyNote, label: 'Notes', path: '/dashboard/notes' },
    { icon: FaHeart, label: 'Gratitude', path: '/dashboard/gratitude' },
    { icon: FaChartLine, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: FaUserFriends, label: 'Team', path: '/dashboard/team' },
    { icon: FaUser, label: 'Profile', path: '/dashboard/profile' },
  ];

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-3 md:p-4 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-base md:text-lg font-bold gradient-text leading-tight">DoItToday</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-normal">Task Manager</p>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 rounded-lg"
            aria-label="Close navigation menu"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 md:p-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onMouseEnter={() => {
              // Prefetch route on hover for instant navigation
              const link = document.createElement('link');
              link.rel = 'prefetch';
              link.href = item.path;
              link.as = 'document';
              document.head.appendChild(link);
            }}
            onClick={() => {
              // Close sidebar on mobile when navigating
              if (window.innerWidth < 768) {
                onClose();
              }
            }}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 md:py-1.5 rounded-lg transition-all duration-200 touch-manipulation min-h-[40px] ${
                isActive
                  ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2`
            }
          >
            <item.icon className="text-sm flex-shrink-0 w-4 h-4" />
            <span className="text-xs md:text-sm font-medium leading-normal truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section - Removed, settings moved to Profile */}
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        sidebar-mobile
        w-56 md:w-56 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] h-screen fixed left-0 top-0 flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;

