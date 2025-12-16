import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  FaSignOutAlt,
} from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollLock } from '../hooks/useScrollLock';
import { cn } from '../utils/cn';

// Sidebar Context
const SidebarContext = createContext({
  open: false,
  setOpen: (open) => {},
  sidebarWidth: 0,
});

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      open: false,
      setOpen: () => {},
      sidebarWidth: 0,
    };
  }
  return context;
};

// Export useSidebar for use in other components
export { useSidebar };

// MainContentWrapper - Component to wrap main content and adjust margin based on sidebar width
export const MainContentWrapper = ({ children, className, ...props }) => {
  const { sidebarWidth } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <motion.main
      id="main-content"
      initial={false}
      animate={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
      }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 200,
      }}
      className={cn('flex-1 w-full pt-16 md:pt-0', className)}
      style={{ willChange: 'margin-left' }}
      {...props}
    >
      {children}
    </motion.main>
  );
};

// SidebarProvider Component
export const SidebarProvider = ({ children, open: openProp, setOpen: setOpenProp }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isControlled = openProp !== undefined && setOpenProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? setOpenProp : setInternalOpen;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate sidebar width - only open when explicitly opened, no hover
  const sidebarWidth = isMobile 
    ? (open ? 256 : 0)
    : (open ? 256 : 0);

  return (
    <SidebarContext.Provider value={{ open, setOpen, sidebarWidth }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Sidebar Component
export const Sidebar = ({ children, open: openProp, setOpen: setOpenProp, animate = true }) => {
  const { open: contextOpen, setOpen: setContextOpen } = useSidebar();
  const isControlled = openProp !== undefined && setOpenProp !== undefined;
  const open = isControlled ? openProp : contextOpen;
  const setOpen = isControlled ? setOpenProp : setContextOpen;

  return (
    <SidebarProvider open={open} setOpen={setOpen}>
      {children}
    </SidebarProvider>
  );
};

// SidebarBody Component
export const SidebarBody = ({ children, ...props }) => {
  const { theme } = useThemeStore();
  const sidebarBg = theme === 'dark' ? '#1a1a1a' : '#ffffff';
  
  return (
    <div
      {...props}
      className={cn('flex flex-col h-full overflow-hidden', props.className)}
      style={{
        backgroundColor: sidebarBg,
        minWidth: '100%',
      }}
    >
      {children}
    </div>
  );
};

// DesktopSidebar Component
export const DesktopSidebar = ({ children, className, ...props }) => {
  const { open, setOpen, sidebarWidth } = useSidebar();
  const { theme } = useThemeStore();
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);
  const sidebarBg = theme === 'dark' ? '#1a1a1a' : '#ffffff';
  const boxShadow = theme === 'dark' ? '2px 0 8px rgba(0, 0, 0, 0.3)' : '2px 0 8px rgba(0, 0, 0, 0.1)';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <motion.aside
      ref={sidebarRef}
      initial={false}
      animate={{
        width: sidebarWidth,
      }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300,
      }}
      className={cn(
        'hidden md:flex fixed left-0 top-0 h-screen border-r border-[var(--border-color)] z-50 flex-col',
        className
      )}
      style={{
        backgroundColor: sidebarBg,
        willChange: 'width',
        overflow: 'hidden',
        boxShadow: boxShadow,
      }}
      {...props}
    >
      {children}
    </motion.aside>
  );
};

// MobileSidebar Component
export const MobileSidebar = ({ children, className, ...props }) => {
  const { open, setOpen } = useSidebar();
  const { theme } = useThemeStore();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  useScrollLock(open && isMobile);
  const sidebarBg = theme === 'dark' ? '#1a1a1a' : '#ffffff';

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: open ? 0 : -300,
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
        }}
        className={cn(
          'fixed left-0 top-0 h-screen w-64 border-r border-[var(--border-color)] z-50 flex flex-col md:hidden',
          className
        )}
        style={{
          backgroundColor: sidebarBg,
        }}
        {...props}
      >
        {children}
      </motion.aside>
    </>
  );
};

// SidebarLink Component
export const SidebarLink = ({ link, className, ...props }) => {
  const { open, setOpen } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isActive = location.pathname === link.href || location.pathname.startsWith(link.href + '/');

  return (
    <NavLink
      to={link.href}
      onClick={() => {
        if (isMobile) {
          setOpen(false);
        }
      }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group',
        isActive
          ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
        className
      )}
      {...props}
    >
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {typeof link.icon === 'function' ? (
          <link.icon className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">{link.icon}</div>
        )}
      </div>
      <span className="font-medium text-sm whitespace-nowrap">
        {link.label}
      </span>
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--accent-primary)] rounded-r-full"
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 30,
          }}
        />
      )}
    </NavLink>
  );
};

// DesktopSidebarLogo Component
const DesktopSidebarLogo = ({ open, setOpen }) => {
  const { open: contextOpen } = useSidebar();
  const { theme } = useThemeStore();
  const [isMobile, setIsMobile] = useState(false);
  const actualOpen = open !== undefined ? open : contextOpen;
  const sidebarBg = theme === 'dark' ? '#1a1a1a' : '#ffffff';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative border-b border-[var(--border-color)]" style={{ minHeight: '64px', width: '100%', backgroundColor: sidebarBg }}>
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            D
          </div>
          {actualOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <h1 className="text-base font-bold gradient-text leading-tight">DoItToday</h1>
              <p className="text-xs text-[var(--text-secondary)] leading-tight">Task Manager</p>
            </motion.div>
          )}
        </div>
        {actualOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen && setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
            aria-label="Close sidebar"
          >
            <FaTimes className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
};

// DesktopSidebarFooter Component
const DesktopSidebarFooter = ({ open, theme, toggleTheme, logout, user, navigate }) => {
  const { open: contextOpen } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const actualOpen = open !== undefined ? open : contextOpen;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const { theme } = useThemeStore();
  const sidebarBg = theme === 'dark' ? '#1a1a1a' : '#ffffff';

  return (
    <div className="border-t border-[var(--border-color)]" style={{ backgroundColor: sidebarBg, width: '100%' }}>
      {/* User Profile Section */}
      <div className="border-t border-[var(--border-color)]" style={{ backgroundColor: sidebarBg, width: '100%', padding: '12px 0px' }}>
        <button
          onClick={() => navigate && navigate('/dashboard/profile')}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-all duration-200 w-full"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
            {getUserInitials()}
          </div>
          {actualOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col text-left min-w-0 flex-1"
            >
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] truncate">
                {user?.email || ''}
              </p>
            </motion.div>
          )}
        </button>
      </div>

      {/* Settings and Logout */}
      <div className="border-t border-[var(--border-color)] space-y-1" style={{ backgroundColor: sidebarBg, width: '100%', padding: '12px 0px' }}>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200 w-full"
        >
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {theme === 'dark' ? <FaSun className="w-full h-full" /> : <FaMoon className="w-full h-full" />}
          </div>
          {actualOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="font-medium text-sm whitespace-nowrap"
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </motion.span>
          )}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-all duration-200 w-full"
        >
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <FaSignOutAlt className="w-full h-full" />
          </div>
          {actualOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="font-medium text-sm whitespace-nowrap"
            >
              Logout
            </motion.span>
          )}
        </button>
      </div>
    </div>
  );
};

// Main Sidebar Component (Default Export)
const MainSidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { open, setOpen } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { icon: FaHome, label: 'Dashboard', href: '/dashboard' },
    { icon: FaTasks, label: 'Tasks', href: '/dashboard/tasks' },
    { icon: FaBullseye, label: 'Goals', href: '/dashboard/goals' },
    { icon: FaTrophy, label: 'Challenges', href: '/dashboard/challenges' },
    { icon: FaHeadphones, label: 'Focus Mode', href: '/dashboard/focus' },
    { icon: FaDollarSign, label: 'Finance', href: '/dashboard/finance' },
    { icon: FaStickyNote, label: 'Notes', href: '/dashboard/notes' },
    { icon: FaHeart, label: 'Gratitude', href: '/dashboard/gratitude' },
    { icon: FaChartLine, label: 'Analytics', href: '/dashboard/analytics' },
  ];

  return (
    <>
      {/* Hamburger Button - Always visible on desktop when sidebar is closed */}
      {!isMobile && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: open ? 0 : 1, scale: open ? 0.8 : 1, pointerEvents: open ? 'none' : 'auto' }}
          transition={{ duration: 0.2 }}
          onClick={() => setOpen(true)}
          className="fixed left-4 top-4 z-50 p-3 rounded-lg border border-[var(--border-color)] shadow-lg text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors md:flex hidden items-center justify-center"
          style={{ 
            width: '48px', 
            height: '48px',
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
          }}
          aria-label="Open menu"
        >
          <FaBars className="w-5 h-5" />
        </motion.button>
      )}

      {/* Desktop Sidebar */}
      <DesktopSidebar>
        <SidebarBody>
          {/* Logo Section */}
          <DesktopSidebarLogo open={open} setOpen={setOpen} />

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1" style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff' }}>
            {navItems.map((item) => (
              <SidebarLink key={item.href} link={item} />
            ))}
          </nav>

          {/* Bottom Section */}
          <DesktopSidebarFooter open={open} theme={theme} toggleTheme={toggleTheme} logout={logout} user={user} navigate={navigate} />
        </SidebarBody>
      </DesktopSidebar>

      {/* Mobile Sidebar */}
      <MobileSidebar>
        <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff' }}>
          {/* Logo Section */}
          <div className="flex-shrink-0 p-4 border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  D
                </div>
                <div>
                  <h1 className="text-base font-bold gradient-text">DoItToday</h1>
                  <p className="text-xs text-[var(--text-secondary)]">Task Manager</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Close sidebar"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 min-h-0">
            {navItems.map((item) => (
              <SidebarLink key={item.href} link={item} />
            ))}
          </nav>

          {/* Bottom Section - Fixed at bottom */}
          <div className="flex-shrink-0 border-t border-[var(--border-color)]">
            {/* User Profile Section */}
            <div className="p-2 border-t border-[var(--border-color)]">
              <button
                onClick={() => {
                  navigate('/dashboard/profile');
                  setOpen(false);
                }}
                className="flex items-center gap-3 w-full rounded-lg hover:bg-[var(--bg-tertiary)] transition-all duration-200 p-2"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : (user?.email?.[0]?.toUpperCase() || 'U')}
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {user?.email || ''}
                  </p>
                </div>
              </button>
            </div>

            {/* Settings and Logout */}
            <div className="p-2 border-t border-[var(--border-color)] space-y-1">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-2 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200 w-full"
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {theme === 'dark' ? <FaSun className="w-full h-full" /> : <FaMoon className="w-full h-full" />}
                </div>
                <span className="font-medium text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-3 px-2 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all duration-200 w-full"
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <FaSignOutAlt className="w-full h-full" />
                </div>
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </MobileSidebar>

      {/* Mobile Menu Button */}
      {isMobile && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setOpen(true)}
          className="fixed left-4 top-4 z-40 p-3 rounded-lg border border-[var(--border-color)] shadow-lg text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors md:hidden"
          style={{ 
            width: '48px', 
            height: '48px',
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
          }}
          aria-label="Open menu"
        >
          <FaBars className="w-5 h-5" />
        </motion.button>
      )}
    </>
  );
};

export default MainSidebar;
