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
      className={cn('flex flex-col h-full overflow-hidden bg-[var(--bg-secondary)]', props.className)}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        minWidth: '100%',
      }}
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
        type: 'spring',
        damping: 20,
        stiffness: 200,
      }}
      className={cn(
        'hidden md:flex fixed left-0 top-0 h-screen border-r border-[var(--border-color)] z-50 flex-col',
        'bg-[var(--bg-secondary)]',
        className
      )}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        willChange: 'width',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
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
        'flex items-center py-2.5 rounded-lg transition-all duration-200 relative group',
        'justify-start',
        isActive
          ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
        className
      )}
      style={{ paddingLeft: '0px', paddingRight: '0px', minHeight: '40px' }}
      {...props}
    >
      <div className="flex-shrink-0 w-full flex items-center justify-center" style={{ position: 'relative', zIndex: 1, width: '60px', minWidth: '60px' }}>
        <div className="w-5 h-5 flex items-center justify-center">
          {typeof link.icon === 'function' ? (
            <link.icon className="w-full h-full flex-shrink-0" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">{link.icon}</div>
          )}
        </div>
      </div>
      <motion.span
        initial={false}
        animate={{
          opacity: shouldExpand ? 1 : 0,
          width: shouldExpand ? 'auto' : 0,
        }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 200,
        }}
        className="font-medium text-sm whitespace-nowrap overflow-hidden"
        style={{ 
          display: 'inline-block',
          lineHeight: '1.25rem',
          height: '1.25rem',
            position: 'absolute',
            left: '60px',
          }}
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
    <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]" style={{ minHeight: '64px' }}>
      <div className="relative flex items-center" style={{ minHeight: '2rem', width: '100%' }}>
        {/* Logo icon - always visible, fixed size */}
        <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '60px', minWidth: '60px', position: 'relative', zIndex: 1 }}>
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
            D
          </div>
        </div>
        <motion.div
          initial={false}
          animate={{
            opacity: shouldExpand ? 1 : 0,
            width: shouldExpand ? 'auto' : 0,
            pointerEvents: shouldExpand ? 'auto' : 'none',
          }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 200,
          }}
          className="flex flex-col justify-center"
          style={{ 
            minHeight: '2rem',
            display: shouldExpand ? 'flex' : 'none',
            alignItems: 'flex-start',
            position: 'absolute',
            left: '60px',
            maxWidth: 'calc(100% - 100px)',
          }}
        >
          <h1 className="text-base font-bold gradient-text leading-tight whitespace-nowrap">DoItToday</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-tight whitespace-nowrap">Task Manager</p>
        </motion.div>
        {shouldExpand && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen && setOpen(false)}
            className="absolute right-4 p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
            aria-label="Collapse sidebar"
            style={{ zIndex: 2 }}
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
    <div className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]" style={{ backgroundColor: 'var(--bg-secondary)', minWidth: '100%' }}>
      {/* User Profile Section */}
      <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <button
          onClick={() => navigate && navigate('/dashboard/profile')}
          className="relative flex items-center w-full rounded-lg hover:bg-[var(--bg-tertiary)] transition-all duration-200"
          style={{ padding: '8px 0px', minHeight: '48px' }}
        >
          <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '60px', minWidth: '60px', position: 'relative', zIndex: 1 }}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
              {getUserInitials()}
            </div>
          </div>
          <motion.div
            initial={false}
            animate={{
              opacity: shouldExpand ? 1 : 0,
              width: shouldExpand ? 'auto' : 0,
            }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 200,
            }}
            className="overflow-hidden text-left flex flex-col justify-center"
            style={{ 
              minHeight: '2rem',
              display: 'flex',
              alignItems: 'center',
            position: 'absolute',
            left: '60px',
            }}
          >
            <p className="text-sm font-medium text-[var(--text-primary)] truncate leading-tight">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-[var(--text-secondary)] truncate leading-tight mt-0.5">
              {user?.email || ''}
            </p>
          </motion.div>
        </button>
      </div>

      {/* Settings and Logout */}
      <div className="p-3 border-t border-[var(--border-color)] space-y-1">
        <button
          onClick={toggleTheme}
          className="relative flex items-center py-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200 w-full"
          style={{ paddingLeft: '0px', paddingRight: '0px', minHeight: '40px' }}
        >
          <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '60px', minWidth: '60px', position: 'relative', zIndex: 1 }}>
            <div className="w-5 h-5 flex items-center justify-center">
              {theme === 'dark' ? <FaSun className="w-full h-full" /> : <FaMoon className="w-full h-full" />}
            </div>
          </div>
          <motion.span
            initial={false}
            animate={{
              opacity: shouldExpand ? 1 : 0,
              width: shouldExpand ? 'auto' : 0,
            }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 200,
            }}
            className="font-medium text-sm whitespace-nowrap overflow-hidden"
            style={{ 
              display: 'inline-block',
              lineHeight: '1.25rem',
              height: '1.25rem',
              position: 'absolute',
              left: '60px',
            }}
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </motion.span>
        </button>
        <button
          onClick={logout}
          className="relative flex items-center py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-all duration-200 w-full"
          style={{ paddingLeft: '0px', paddingRight: '0px', minHeight: '40px' }}
        >
          <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '60px', minWidth: '60px', position: 'relative', zIndex: 1 }}>
            <div className="w-5 h-5 flex items-center justify-center">
              <FaSignOutAlt className="w-full h-full" />
            </div>
          </div>
          <motion.span
            initial={false}
            animate={{
              opacity: shouldExpand ? 1 : 0,
              width: shouldExpand ? 'auto' : 0,
            }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 200,
            }}
            className="font-medium text-sm whitespace-nowrap overflow-hidden"
            style={{ 
              display: 'inline-block',
              lineHeight: '1.25rem',
              height: '1.25rem',
              position: 'absolute',
              left: '60px',
            }}
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
          <nav className="flex-1 overflow-hidden p-3 space-y-1 bg-[var(--bg-secondary)]" style={{ backgroundColor: 'var(--bg-secondary)', minWidth: '100%' }}>
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

    </>
  );
};

export default MainSidebar;
