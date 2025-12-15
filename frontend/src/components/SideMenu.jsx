import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome,
  FaTasks,
  FaBullseye,
  FaTrophy,
  FaChartLine,
  FaDollarSign,
  FaHeart,
  FaBrain,
  FaUserFriends,
  FaUser,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

const SideMenu = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: FaHome, label: 'Dashboard', path: '/dashboard/dashboard' },
    { icon: FaTasks, label: 'Tasks', path: '/dashboard/tasks' },
    { icon: FaBullseye, label: 'Goals', path: '/dashboard/goals' },
    { icon: FaTrophy, label: 'Challenges', path: '/dashboard/challenges' },
    { icon: FaChartLine, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: FaDollarSign, label: 'Finance', path: '/dashboard/finance' },
    { icon: FaHeart, label: 'Gratitude', path: '/dashboard/gratitude' },
    { icon: FaBrain, label: 'Focus Mode', path: '/dashboard/focus' },
    { icon: FaUserFriends, label: 'Team', path: '/dashboard/team' },
    { icon: FaUser, label: 'Profile', path: '/dashboard/profile' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard/dashboard') {
      return (
        location.pathname === '/dashboard' ||
        location.pathname === '/dashboard/' ||
        location.pathname === '/dashboard/dashboard'
      );
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const MenuContent = () => (
    <>
      {/* Logo/Header */}
      <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">DoItToday</h1>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          aria-label="Close menu"
        >
          <FaTimes />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive: navActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  navActive || active
                    ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Icon className="text-lg flex-shrink-0" />
              </motion.div>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-lg text-[var(--text-primary)]"
        aria-label="Open menu"
      >
        <FaBars />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 border-r border-[var(--border-color)] z-40 flex-col" style={{ backgroundColor: '#0a0a0a' }}>
        <MenuContent />
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-64 border-r border-[var(--border-color)] z-50 flex flex-col md:hidden"
              style={{ backgroundColor: '#0a0a0a' }}
            >
              <MenuContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SideMenu;

