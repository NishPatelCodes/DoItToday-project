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
      className="relative py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)]"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y, opacity }}
          className="absolute top-1/4 left-1/4 w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bg-primary-500/10 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 1], [-30, 30]), opacity }}
          className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-[var(--text-primary)]">
            Your Day,
            <span className="block mt-2 gradient-text">Beautifully Organized</span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl md:max-w-3xl mx-auto font-light px-4">
            See how DoItToday transforms your productivity with an intuitive, 
            elegant interface designed for clarity and focus.
          </p>
        </motion.div>

        {/* Main Product Showcase - Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-6 mb-12 md:mb-16 items-start"
        >
          {previews.map((preview) => (
            <motion.div
              key={preview.id}
              variants={itemVariants}
              custom={preview.delay}
              whileHover={{ y: -8 }}
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
                    <div className="relative overflow-hidden rounded-lg bg-[var(--bg-primary)] flex-1 min-h-[350px] md:min-h-[400px] lg:min-h-[450px] flex flex-col">
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
                      <div className="relative overflow-hidden rounded-[2.5rem] bg-[var(--bg-primary)] min-h-[500px] md:min-h-[550px] lg:min-h-[600px] flex flex-col">
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
                className="mt-4 md:mt-6 text-center flex-shrink-0"
              >
                <h3 className="text-lg md:text-xl font-semibold mb-1.5 md:mb-2 text-[var(--text-primary)]">
                  {preview.title}
                </h3>
                <p className="text-[var(--text-secondary)] text-xs md:text-sm">
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 bg-[var(--accent-primary)] text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            Explore More
            <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"
              initial={false}
            />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

export default ProductShowcaseSection;

