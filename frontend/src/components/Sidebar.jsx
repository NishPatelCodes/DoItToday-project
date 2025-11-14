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
      <div className="p-4 md:p-6 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold gradient-text">DoItToday</h1>
            <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1">Task Manager</p>
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close navigation menu"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              // Close sidebar on mobile when navigating
              if (window.innerWidth < 768) {
                onClose();
              }
              // Optionally close on desktop too - comment out if you want sidebar to stay open
              // onClose();
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            <item.icon className="text-base md:text-base" />
            <span className="text-sm md:text-sm font-medium">{item.label}</span>
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
        w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] h-screen fixed left-0 top-0 flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;

