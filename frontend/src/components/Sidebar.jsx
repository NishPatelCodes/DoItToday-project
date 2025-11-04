import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaTasks,
  FaBullseye,
  FaCalendarAlt,
  FaChartLine,
  FaUserFriends,
  FaCog,
  FaMoon,
  FaSun,
} from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../hooks/useTheme';
import { useEffect } from 'react';

const Sidebar = () => {
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const navItems = [
    { icon: FaHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FaTasks, label: 'Tasks', path: '/dashboard/tasks' },
    { icon: FaBullseye, label: 'Goals', path: '/dashboard/goals' },
    { icon: FaCalendarAlt, label: 'Calendar', path: '/dashboard/calendar' },
    { icon: FaChartLine, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: FaUserFriends, label: 'Team', path: '/dashboard/team' },
  ];

  return (
    <aside className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] h-screen fixed left-0 top-0 flex flex-col z-30">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border-color)]">
        <h1 className="text-xl font-bold gradient-text">DoItToday</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Task Manager</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            <item.icon className="text-base" />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-[var(--border-color)] space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200"
        >
          {theme === 'light' ? (
            <>
              <FaMoon className="text-base" />
              <span className="text-sm font-medium">Dark Mode</span>
            </>
          ) : (
            <>
              <FaSun className="text-base" />
              <span className="text-sm font-medium">Light Mode</span>
            </>
          )}
        </button>

        {/* Settings */}
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
            }`
          }
        >
          <FaCog className="text-base" />
          <span className="text-sm font-medium">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;

