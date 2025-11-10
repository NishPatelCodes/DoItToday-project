import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiMonitor } from 'react-icons/fi';
import { DashboardMockup } from './ProductMockup';

/**
 * Desktop Preview Section Component
 * 
 * Large, centered desktop app preview inspired by routine.co
 * Features smooth animations, parallax effects, and premium styling
 * 
 * CUSTOMIZATION:
 * - Replace the DashboardMockup component with your own desktop screenshot component
 * - Adjust animation speeds by modifying transition durations
 * - Change mockup frame style (MacBook vs browser window)
 * - Modify background gradients and effects
 */

function DesktopPreviewSection() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const mockupRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-150px' });
  
  // Parallax scroll effects
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.95]);
  
  // Derived opacity values for background blobs (avoid nested transforms)
  const blobOpacity1 = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.3, 0.3, 0]);
  const blobOpacity2 = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.2, 0.2, 0]);
  
  // Mouse movement parallax for the mockup
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 200 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);

  const handleMouseMove = (e) => {
    // Disable mouse tilt on mobile/tablet (touch devices)
    if (window.innerWidth < 1024) return;
    if (!mockupRef.current) return;
    
    // Use requestAnimationFrame for smooth performance
    requestAnimationFrame(() => {
      if (!mockupRef.current) return;
      const rect = mockupRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (e.clientX - centerX) / rect.width;
      const y = (e.clientY - centerY) / rect.height;
      mouseX.set(x);
      mouseY.set(y);
      setMousePosition({ x, y });
    });
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-20 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background with gradient and blur effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient blobs - Reduced sizes */}
        <motion.div
          style={{ y, opacity: blobOpacity1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] lg:w-[550px] lg:h-[550px] bg-gradient-to-br from-primary-500/8 via-purple-500/8 to-pink-500/8 rounded-full blur-3xl"
        />
        <motion.div
          style={{ 
            y: useTransform(scrollYProgress, [0, 1], [-50, 50]),
            opacity: blobOpacity2
          }}
          className="absolute top-1/4 right-1/4 w-[250px] h-[250px] md:w-[350px] md:h-[350px] lg:w-[400px] lg:h-[400px] bg-gradient-to-br from-cyan-500/8 to-blue-500/8 rounded-full blur-3xl"
        />
        <motion.div
          style={{ 
            y: useTransform(scrollYProgress, [0, 1], [50, -50]),
            opacity: blobOpacity2
          }}
          className="absolute bottom-1/4 left-1/4 w-[200px] h-[200px] md:w-[300px] md:h-[300px] lg:w-[350px] lg:h-[350px] bg-gradient-to-br from-indigo-500/8 to-purple-500/8 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8 md:mb-10"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold mb-3 md:mb-4 text-[var(--text-primary)] leading-tight">
            Experience it on
            <span className="block mt-2 gradient-text">Desktop</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto font-light leading-relaxed px-4">
            Your daily flow — simplified. A beautiful, intuitive interface designed 
            to help you focus on what matters most.
          </p>
        </motion.div>

        {/* Main Desktop Mockup - Optimized size */}
        <motion.div
          ref={mockupRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            scale,
            opacity,
          }}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-4xl w-full px-4 sm:px-6 md:px-8 perspective-1000"
        >
          {/* MacBook-style frame */}
          <div className="relative">
            {/* Top bezel with camera */}
            <div className="relative bg-[var(--bg-secondary)] rounded-t-xl md:rounded-t-2xl pt-2 md:pt-2.5 px-3 md:px-6 pb-2.5 md:pb-3 border-t-2 border-x-2 border-[var(--border-color)] shadow-2xl">
              {/* Camera notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 md:w-28 h-3 md:h-5 bg-[var(--bg-secondary)] rounded-b-lg md:rounded-b-xl border-x-2 border-b-2 border-[var(--border-color)]" />
              {/* Screen bezel */}
              <div className="h-0.5 md:h-0.5 bg-[var(--bg-tertiary)] rounded-full mx-auto w-12 md:w-20" />
            </div>

            {/* Screen area */}
            <div className="relative bg-[var(--bg-secondary)] border-x-2 border-[var(--border-color)] overflow-hidden">
              {/* Browser bar */}
              <div className="bg-[var(--bg-primary)] border-b border-[var(--border-color)] px-2 md:px-4 py-1.5 md:py-2 flex items-center gap-2">
                {/* Traffic lights */}
                <div className="flex gap-1 md:gap-1.5">
                  <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-green-500/80" />
                </div>
                
                {/* URL bar */}
                <div className="flex-1 flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                  <FiMonitor className="w-3 h-3 md:w-3.5 md:h-3.5 text-[var(--text-tertiary)] flex-shrink-0" />
                  <span className="text-xs md:text-sm text-[var(--text-tertiary)] truncate">
                    doittoday.com/dashboard
                  </span>
                  <div className="ml-auto w-1.5 h-1.5 md:w-1.5 md:h-1.5 rounded-full bg-green-500" />
                </div>
              </div>

              {/* App content - Dashboard mockup - Reduced height */}
              <div className="relative bg-[var(--bg-primary)] min-h-[300px] md:min-h-[380px] lg:min-h-[420px] max-h-[300px] md:max-h-[380px] lg:max-h-[420px] overflow-hidden">
                <div className="transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
                  <DashboardMockup />
                </div>
                
                {/* Subtle gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-primary)]/20 pointer-events-none" />
              </div>
            </div>

            {/* Bottom bezel */}
            <div className="relative bg-[var(--bg-secondary)] rounded-b-xl md:rounded-b-2xl pt-2.5 md:pt-3 pb-3 md:pb-4 border-b-2 border-x-2 border-[var(--border-color)] shadow-2xl">
              {/* Trackpad area */}
              <div className="w-20 md:w-28 h-0.5 bg-[var(--bg-tertiary)] rounded-full mx-auto mb-1 md:mb-1.5" />
              <div className="w-32 md:w-40 h-5 md:h-6 bg-[var(--bg-tertiary)] rounded-lg mx-auto" />
            </div>

            {/* Glow effect on hover */}
            <motion.div
              className="absolute -inset-6 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-3xl opacity-0 pointer-events-none"
              animate={{
                opacity: mousePosition.x !== 0 || mousePosition.y !== 0 ? 0.4 : 0,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Floating decorative elements - Smaller */}
          <motion.div
            animate={{
              y: [0, -8, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-primary-500/15 to-purple-500/15 rounded-xl blur-xl hidden lg:block"
          />
          <motion.div
            animate={{
              y: [0, 8, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-xl blur-xl hidden lg:block"
          />
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-8 md:mt-10"
        >
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 md:px-10 py-3.5 md:py-4 bg-[var(--accent-primary)] text-white rounded-xl font-semibold text-base md:text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-2 md:gap-3 mx-auto"
          >
            Get Started Free
            <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"
              initial={false}
            />
          </motion.button>
          <p className="mt-3 md:mt-4 text-xs md:text-sm text-[var(--text-secondary)]">
            No credit card required • Start in seconds
          </p>
        </motion.div>
      </div>

      {/* Custom CSS for 3D perspective */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
}

export default DesktopPreviewSection;

