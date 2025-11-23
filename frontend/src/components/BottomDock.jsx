import { NavLink, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
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

const IconContainer = ({ mouseX, title, icon, href, isActive }) => {
  const ref = useRef(null);
  
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const scale = useTransform(width, [40, 80], [1, 1.5]);
  const y = useTransform(width, [40, 80], [0, -10]);
  const opacity = useTransform(width, [40, 80], [0, 1]);

  return (
    <NavLink 
      to={href} 
      ref={ref} 
      className="relative flex items-center justify-center touch-manipulation min-w-[48px] min-h-[48px]"
    >
      <motion.div
        style={{ width, height: 40 }}
        className="relative flex items-center justify-center rounded-lg"
      >
        <motion.div
          className={cn(
            'relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-lg',
            'transition-colors duration-200',
            isActive
              ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/50'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          )}
          style={{
            scale,
            y,
          }}
        >
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute inset-0 rounded-lg bg-[var(--accent-primary)]"
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
            {icon}
          </span>
        </motion.div>
        <motion.span
          className={cn(
            'absolute -bottom-5 md:-bottom-6 text-[9px] md:text-[10px] font-medium whitespace-nowrap',
            'transition-colors duration-200',
            'hidden md:block', // Hide labels on mobile, show on desktop
            isActive
              ? 'text-[var(--accent-primary)] font-semibold'
              : 'text-[var(--text-secondary)]'
          )}
          style={{
            opacity,
            y: useTransform(width, [40, 80], [0, -4]),
          }}
        >
          {title}
        </motion.span>
      </motion.div>
    </NavLink>
  );
};

const BottomDock = () => {
  const location = useLocation();
  const mouseX = useMotionValue(Infinity);

  const navItems = [
    { icon: <FaHome className="text-lg" />, label: 'Home', path: '/dashboard' },
    { icon: <FaTasks className="text-lg" />, label: 'Tasks', path: '/dashboard/tasks' },
    { icon: <FaStar className="text-lg" />, label: 'Hero', path: '/dashboard/hero' },
    { icon: <FaDollarSign className="text-lg" />, label: 'Finance', path: '/dashboard/finance' },
    { icon: <FaUser className="text-lg" />, label: 'Profile', path: '/dashboard/profile' },
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
      {/* Backdrop blur layer for premium glassmorphism - theme-aware */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 100%)',
          opacity: 0.8,
        }}
      />
      
      {/* Compact glassmorphic box - Optimized for light/dark themes and mobile */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          duration: 0.5,
        }}
        onMouseMove={(e) => {
          mouseX.set(e.clientX);
        }}
        onMouseLeave={() => {
          mouseX.set(Infinity);
        }}
        className={cn(
          'relative flex items-center',
          'pointer-events-auto',
          // Compact padding - optimized for mobile
          'p-2 md:p-2.5',
          // Premium glassmorphic background - theme-aware
          'backdrop-blur-xl backdrop-saturate-150',
          // Rounded corners
          'rounded-2xl',
          // Mobile: narrower width, perfectly centered
          'w-auto max-w-[320px] mx-auto',
          'md:w-auto md:max-w-none md:mx-0',
          // Bottom margin - responsive
          'mb-2 md:mb-4',
          // Gap between icons - responsive
          'gap-1 md:gap-2',
        )}
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          // Light mode: Premium white glassmorphism
          // Dark mode: Dark glassmorphism
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderTop: '1px solid var(--border-color)',
          // Light mode: subtle shadow, Dark mode: stronger shadow
          boxShadow: 'var(--shadow-lg)',
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
              <IconContainer
                mouseX={mouseX}
                title={item.label}
                icon={item.icon}
                href={item.path}
                isActive={active}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </nav>
  );
};

export default BottomDock;
