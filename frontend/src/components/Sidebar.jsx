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
} from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
      document.body.style.overflow = 'hidden'; // Prevent body scroll when sidebar is open
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const navItems = [
    { icon: FaHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FaTasks, label: 'Tasks', path: '/dashboard/tasks' },
    { icon: FaBullseye, label: 'Goals', path: '/dashboard/goals' },
    { icon: FaCalendarAlt, label: 'Calendar', path: '/dashboard/calendar' },
    { icon: FaStickyNote, label: 'Notes', path: '/dashboard/notes' },
    { icon: FaHeart, label: 'Gratitude', path: '/dashboard/gratitude' },
    { icon: FaChartLine, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: FaUserFriends, label: 'Team', path: '/dashboard/team' },
    { icon: FaUser, label: 'Profile', path: '/dashboard/profile' },
  ];

  const sidebarContent = (
    <>
      {/* Logo - Apple-style */}
      <div className="p-5 md:p-7 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold gradient-text" style={{ letterSpacing: '-0.02em' }}>DoItToday</h1>
            <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1.5 font-light" style={{ letterSpacing: '-0.01em', fontWeight: 300 }}>Task Manager</p>
          </div>
          {/* Close button for mobile */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-lg"
            aria-label="Close navigation menu"
          >
            <FaTimes className="text-lg" />
          </motion.button>
        </div>
      </div>

      {/* Navigation - Apple-style */}
      <nav className="flex-1 overflow-y-auto p-3 md:p-5 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              // Close sidebar on mobile when navigating
              if (window.innerWidth < 768) {
                onClose();
              }
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            <item.icon className="text-lg" />
            <span className="text-sm md:text-base font-medium" style={{ letterSpacing: '-0.01em' }}>{item.label}</span>
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

      {/* Sidebar - Apple-style */}
      <aside className={`
        sidebar-mobile
        w-64 bg-[var(--bg-secondary)]/95 backdrop-blur-xl border-r border-[var(--border-color)] h-screen fixed left-0 top-0 flex flex-col z-50
        transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;

