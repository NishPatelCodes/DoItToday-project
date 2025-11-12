import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiMonitor, FiSmartphone } from 'react-icons/fi';
import { DashboardMockup, TaskManagementMockup, MobileDashboardMockup } from './ProductMockup';

/**
 * Product Showcase Section Component
 * 
 * Visually showcases the product with beautiful mockup frames
 * Inspired by routine.co's premium product preview style
 * 
 * CUSTOMIZATION:
 * - Replace placeholder images by updating the `previews` array below
 * - Adjust animation speeds by modifying transition durations
 * - Change mockup styles by updating the frame classes
 * - Add/remove preview cards by modifying the `previews` array
 */

function ProductShowcaseSection() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  
  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  // Product previews configuration
  // Using CSS-based mockups that match the actual app design
  const previews = [
    {
      id: 1,
      title: 'Dashboard Overview',
      description: 'Your complete productivity hub at a glance',
      component: DashboardMockup,
      type: 'desktop',
      delay: 0,
    },
    {
      id: 2,
      title: 'Task Management',
      description: 'Organize and prioritize your daily tasks',
      component: TaskManagementMockup,
      type: 'desktop',
      delay: 0.1,
    },
    {
      id: 3,
      title: 'Mobile Experience',
      description: 'Stay productive on the go',
      component: MobileDashboardMockup,
      type: 'mobile',
      delay: 0.2,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Floating animation for decorative elements
  const floatingAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[var(--bg-secondary)]"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y, opacity }}
          className="absolute top-1/4 left-1/4 w-[250px] h-[250px] md:w-[350px] md:h-[350px] lg:w-[400px] lg:h-[400px] bg-primary-500/8 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 1], [-30, 30]), opacity }}
          className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] md:w-[350px] md:h-[350px] lg:w-[400px] lg:h-[400px] bg-purple-500/8 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header - Apple-style typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-5 md:mb-6 text-[var(--text-primary)] leading-[1.05] tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            Your Day,
            <span className="block mt-3 md:mt-4 gradient-text">Beautifully Organized</span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)] max-w-3xl mx-auto font-light px-4 leading-relaxed" style={{ letterSpacing: '-0.015em', fontWeight: 300 }}>
            See how DoItToday transforms your productivity with an intuitive, 
            elegant interface designed for clarity and focus.
          </p>
        </motion.div>

        {/* Main Product Showcase - Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-5 mb-12 md:mb-14 items-start"
        >
          {previews.map((preview) => (
            <motion.div
              key={preview.id}
              variants={itemVariants}
              custom={preview.delay}
              whileHover={{ 
                y: -6,
                transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
              }}
              className="group relative flex flex-col h-full"
            >
              {/* Mockup Frame */}
              <div className="relative flex-1 flex flex-col">
                {/* Desktop Mockup */}
                {preview.type === 'desktop' && (
                  <div className="relative bg-[var(--bg-secondary)] rounded-2xl p-4 shadow-2xl border border-[var(--border-color)] flex flex-col h-full">
                    {/* Browser Bar */}
                    <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      </div>
                      <div className="flex-1 h-6 bg-[var(--bg-primary)] rounded-md border border-[var(--border-color)] flex items-center px-3">
                        <FiMonitor className="w-3 h-3 text-[var(--text-tertiary)] mr-2 flex-shrink-0" />
                        <span className="text-xs text-[var(--text-tertiary)] truncate">
                          doittoday.com
                        </span>
                      </div>
                    </div>
                    
                    {/* Screenshot - Using CSS mockup component */}
                    <div className="relative overflow-hidden rounded-lg bg-[var(--bg-primary)] flex-1 min-h-[320px] md:min-h-[360px] lg:min-h-[380px] flex flex-col">
                      {preview.component && (
                        <div className="w-full h-full flex flex-col">
                          <preview.component />
                        </div>
                      )}
                      {/* Subtle border glow on hover - no white overlay */}
                      <div className="absolute inset-0 rounded-lg border-2 border-[var(--accent-primary)] opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Mobile Mockup */}
                {preview.type === 'mobile' && (
                  <div className="relative mx-auto max-w-[240px] sm:max-w-[260px] md:max-w-[280px] w-full">
                    {/* Phone Frame */}
                    <div className="relative bg-[var(--bg-secondary)] rounded-[3rem] p-3 shadow-2xl border-4 border-[var(--border-color)]">
                      {/* Notch */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[var(--bg-secondary)] rounded-b-2xl border-x-4 border-b-4 border-[var(--border-color)] z-10" />
                      
                      {/* Screen */}
                      <div className="relative overflow-hidden rounded-[2.5rem] bg-[var(--bg-primary)] min-h-[450px] md:min-h-[500px] lg:min-h-[520px] flex flex-col">
                        {/* Status Bar */}
                        <div className="absolute top-0 left-0 right-0 h-8 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-20 flex items-center justify-between px-6 text-xs text-[var(--text-secondary)] flex-shrink-0">
                          <span>9:41</span>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-2 border border-[var(--text-secondary)] rounded-sm">
                              <div className="w-3 h-1.5 bg-[var(--text-secondary)] rounded-sm m-0.5" />
                            </div>
                            <FiSmartphone className="w-3 h-3" />
                          </div>
                        </div>
                        
                        {/* Screenshot - Using CSS mockup component */}
                        <div className="w-full flex-1 flex flex-col pt-8">
                          {preview.component && (
                            <div className="w-full h-full flex flex-col">
                              <preview.component />
                            </div>
                          )}
                        </div>
                        {/* Subtle border glow on hover - no white overlay */}
                        <div className="absolute inset-0 rounded-[2.5rem] border-2 border-[var(--accent-primary)] opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none" />
                      </div>
                      
                      {/* Home Indicator */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-[var(--text-tertiary)] rounded-full z-10" />
                    </div>
                  </div>
                )}

                {/* Floating glow effect - subtle background glow */}
                <motion.div
                  animate={floatingAnimation}
                  className={`absolute -inset-4 rounded-3xl bg-gradient-to-br ${
                    preview.id === 1 ? 'from-blue-500/5 to-cyan-500/5' :
                    preview.id === 2 ? 'from-purple-500/5 to-pink-500/5' :
                    'from-orange-500/5 to-red-500/5'
                  } blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
                />
              </div>

              {/* Preview Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: preview.delay + 0.3 }}
                className="mt-4 md:mt-5 text-center flex-shrink-0"
              >
                <h3 className="text-base md:text-lg font-semibold mb-1.5 text-[var(--text-primary)]">
                  {preview.title}
                </h3>
                <p className="text-[var(--text-secondary)] text-xs md:text-sm leading-relaxed">
                  {preview.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center"
        >
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="group relative px-10 md:px-12 py-4 md:py-4.5 bg-[var(--accent-primary)] text-white rounded-2xl font-semibold text-lg md:text-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto"
            style={{ letterSpacing: '-0.01em' }}
          >
            Explore More
            <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

export default ProductShowcaseSection;

