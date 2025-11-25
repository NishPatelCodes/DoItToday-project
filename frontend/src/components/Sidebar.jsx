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
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from 'framer-motion';
import { useScrollLock } from '../hooks/useScrollLock';
import { cn } from '../utils/cn';

// Sidebar Context
const SidebarContext = createContext({
  open: false,
  setOpen: (open) => {},
  isHovered: false,
  setIsHovered: (hovered) => {},
  sidebarWidth: 60,
});

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    // Return default values if not in provider (for components outside sidebar)
    return {
      open: false,
      setOpen: () => {},
      isHovered: false,
      setIsHovered: () => {},
      sidebarWidth: 60,
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
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn('flex-1 w-full pt-16 md:pt-0', className)}
      {...props}
    >
      {children}
    </motion.main>
  );
};

// SidebarProvider Component
export const SidebarProvider = ({ children, open: openProp, setOpen: setOpenProp }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isControlled = openProp !== undefined && setOpenProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? setOpenProp : setInternalOpen;

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate sidebar width synchronously based on current state (reactive)
  const sidebarWidth = isMobile 
    ? (open ? 256 : 0)
    : (open || isHovered ? 240 : 60);

  return (
    <SidebarContext.Provider value={{ open, setOpen, isHovered, setIsHovered, sidebarWidth }}>
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
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Expand on hover for desktop
  const shouldExpand = isMobile ? open : (open || isHovered);

  return (
    <SidebarProvider open={open} setOpen={setOpen}>
      <div
        ref={sidebarRef}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        className="relative"
      >
        {children}
      </div>
    </SidebarProvider>
  );
};

// SidebarBody Component
export const SidebarBody = ({ children, ...props }) => {
  return (
    <motion.div
      {...props}
      className={cn('flex flex-col h-full overflow-hidden', props.className)}
    >
      {children}
    </motion.div>
  );
};

// DesktopSidebar Component
export const DesktopSidebar = ({ children, className, ...props }) => {
  const { open, setOpen, isHovered, setIsHovered, sidebarWidth } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);

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
            onMouseEnter={() => {
        if (!isMobile) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (!isMobile && !open) {
          // Only collapse on mouse leave if not manually opened
          setIsHovered(false);
        }
      }}
      initial={false}
      animate={{
        width: sidebarWidth,
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn(
        'hidden md:flex fixed left-0 top-0 h-screen border-r border-[var(--border-color)] z-50 flex-col overflow-hidden',
        'bg-[var(--bg-secondary)]',
        className
      )}
      style={{
        backgroundColor: 'var(--bg-secondary)',
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
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  useScrollLock(open && isMobile);

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
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
          stiffness: 200,
        }}
      className={cn(
        'fixed left-0 top-0 h-screen w-64 border-r border-[var(--border-color)] z-50 flex flex-col md:hidden',
        'bg-[var(--bg-secondary)]',
        className
      )}
      style={{
        backgroundColor: 'var(--bg-secondary)',
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
  const { open, setOpen, isHovered } = useSidebar();
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

  const shouldExpand = isMobile ? open : (open || isHovered);
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
        'flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200 relative group',
        'justify-start',
        isActive
          ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
        className
      )}
      style={{ paddingLeft: '12px', paddingRight: '12px' }}
      {...props}
    >
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center min-w-[20px]">
        {typeof link.icon === 'function' ? (
          <link.icon className="w-full h-full flex-shrink-0" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">{link.icon}</div>
        )}
      </div>
      <motion.span
        initial={false}
        animate={{
          opacity: shouldExpand ? 1 : 0,
          width: shouldExpand ? 'auto' : 0,
        }}
        transition={{
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="font-medium text-sm whitespace-nowrap overflow-hidden"
      >
        {link.label}
      </motion.span>
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
  const { open: contextOpen, isHovered } = useSidebar();
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

  const shouldExpand = isMobile ? actualOpen : (actualOpen || isHovered);

  return (
    <div className="p-4 border-b border-[var(--border-color)]">
      <motion.div
        initial={false}
        animate={{
          justifyContent: shouldExpand ? 'space-between' : 'center',
        }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        {/* Logo icon - always visible */}
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center" style={{ paddingLeft: '12px', paddingRight: '12px' }}>
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
            D
          </div>
        </div>
        <motion.div
          initial={false}
          animate={{
            opacity: shouldExpand ? 1 : 0,
            width: shouldExpand ? 'auto' : 0,
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <h1 className="text-base font-bold gradient-text whitespace-nowrap">DoItToday</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Task Manager</p>
        </motion.div>
        {shouldExpand && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen && setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
            aria-label="Collapse sidebar"
          >
            <FaTimes className="w-4 h-4" />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

// DesktopSidebarFooter Component
const DesktopSidebarFooter = ({ open, theme, toggleTheme, logout, user, navigate }) => {
  const { open: contextOpen, isHovered } = useSidebar();
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

  const shouldExpand = isMobile ? actualOpen : (actualOpen || isHovered);

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

  return (
    <div className="border-t border-[var(--border-color)]">
      {/* Team and Profile Section */}
      <div className="p-3 space-y-1">
        <button
          onClick={() => navigate && navigate('/dashboard/team')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200 w-full"
        >
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <FaUserFriends className="w-full h-full" />
          </div>
          <motion.span
            initial={false}
            animate={{
              opacity: shouldExpand ? 1 : 0,
              width: shouldExpand ? 'auto' : 0,
            }}
            transition={{ duration: 0.2 }}
            className="font-medium text-sm whitespace-nowrap overflow-hidden"
          >
            Team
          </motion.span>
        </button>
        <button
          onClick={() => navigate && navigate('/dashboard/profile')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200 w-full"
        >
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <FaUser className="w-full h-full" />
          </div>
          <motion.span
            initial={false}
            animate={{
              opacity: shouldExpand ? 1 : 0,
              width: shouldExpand ? 'auto' : 0,
            }}
            transition={{ duration: 0.2 }}
            className="font-medium text-sm whitespace-nowrap overflow-hidden"
          >
            Profile
          </motion.span>
        </button>
      </div>

      {/* User Profile Section */}
      <div className="p-3 border-t border-[var(--border-color)]">
        <button
          onClick={() => navigate && navigate('/dashboard/profile')}
          className="flex items-center gap-3 w-full rounded-lg hover:bg-[var(--bg-tertiary)] transition-all duration-200 p-2"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
            {getUserInitials()}
          </div>
          <motion.div
            initial={false}
            animate={{
              opacity: shouldExpand ? 1 : 0,
              width: shouldExpand ? 'auto' : 0,
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden text-left"
          >
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              {user?.email || ''}
            </p>
          </motion.div>
        </button>
      </div>

      {/* Settings and Logout */}
      <div className="p-3 border-t border-[var(--border-color)] space-y-1">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200 w-full"
        >
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {theme === 'dark' ? <FaSun className="w-full h-full" /> : <FaMoon className="w-full h-full" />}
          </div>
          <motion.span
            initial={false}
            animate={{
              opacity: shouldExpand ? 1 : 0,
              width: shouldExpand ? 'auto' : 0,
            }}
            transition={{ duration: 0.2 }}
            className="font-medium text-sm whitespace-nowrap overflow-hidden"
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </motion.span>
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-all duration-200 w-full"
        >
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <FaSignOutAlt className="w-full h-full" />
          </div>
          <motion.span
            initial={false}
            animate={{
              opacity: shouldExpand ? 1 : 0,
              width: shouldExpand ? 'auto' : 0,
            }}
            transition={{ duration: 0.2 }}
            className="font-medium text-sm whitespace-nowrap overflow-hidden"
          >
            Logout
          </motion.span>
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
      {/* Desktop Sidebar */}
      <DesktopSidebar>
        <SidebarBody>
          {/* Logo Section */}
          <DesktopSidebarLogo open={open} setOpen={setOpen} />

          {/* Navigation */}
          <nav className="flex-1 overflow-hidden p-3 space-y-1">
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
        <SidebarBody>
          {/* Logo Section */}
          <div className="p-4 border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-bold gradient-text">DoItToday</h1>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Task Manager</p>
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

          {/* Navigation */}
          <nav className="flex-1 overflow-hidden p-3 space-y-1">
            {navItems.map((item) => (
              <SidebarLink key={item.href} link={item} />
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-[var(--border-color)]">
            {/* Team and Profile Section */}
            <div className="p-3 space-y-1">
              <button
                onClick={() => navigate('/dashboard/team')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200 w-full"
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <FaUserFriends className="w-full h-full" />
                </div>
                <span className="font-medium text-sm">Team</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/profile')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200 w-full"
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <FaUser className="w-full h-full" />
                </div>
                <span className="font-medium text-sm">Profile</span>
              </button>
            </div>

            {/* User Profile Section */}
            <div className="p-3 border-t border-[var(--border-color)]">
              <button
                onClick={() => navigate('/dashboard/profile')}
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
            <div className="p-3 border-t border-[var(--border-color)] space-y-1">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200 w-full"
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {theme === 'dark' ? <FaSun className="w-full h-full" /> : <FaMoon className="w-full h-full" />}
                </div>
                <span className="font-medium text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-all duration-200 w-full"
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <FaSignOutAlt className="w-full h-full" />
                </div>
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          </div>
        </SidebarBody>
      </MobileSidebar>

      {/* Mobile Menu Button */}
      {isMobile && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setOpen(true)}
          className="fixed left-4 top-4 z-40 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-lg text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors md:hidden"
          aria-label="Open menu"
        >
          <FaBars className="w-5 h-5" />
        </motion.button>
      )}

      {/* Expand Button (when collapsed on desktop) */}
      {!open && !isMobile && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setOpen(true)}
          className="fixed left-2 top-4 z-40 p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-lg text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors hidden md:block"
          aria-label="Expand sidebar"
        >
          <FaBars className="w-4 h-4" />
        </motion.button>
      )}
    </>
  );
};

export default MainSidebar;
