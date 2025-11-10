import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiMonitor, FiSmartphone } from 'react-icons/fi';

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
  // Replace these placeholder URLs with your actual product screenshots
  const previews = [
    {
      id: 1,
      title: 'Dashboard Overview',
      description: 'Your complete productivity hub at a glance',
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=800&fit=crop', // Replace with dashboard screenshot
      type: 'desktop',
      delay: 0,
    },
    {
      id: 2,
      title: 'Task Management',
      description: 'Organize and prioritize your daily tasks',
      image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=800&fit=crop', // Replace with task view screenshot
      type: 'desktop',
      delay: 0.1,
    },
    {
      id: 3,
      title: 'Mobile Experience',
      description: 'Stay productive on the go',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=1200&fit=crop', // Replace with mobile screenshot
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
      className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)]"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y, opacity }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 1], [-30, 30]), opacity }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-[var(--text-primary)]">
            Your Day,
            <span className="block mt-2 gradient-text">Beautifully Organized</span>
          </h2>
          <p className="text-xl sm:text-2xl text-[var(--text-secondary)] max-w-3xl mx-auto font-light">
            See how DoItToday transforms your productivity with an intuitive, 
            elegant interface designed for clarity and focus.
          </p>
        </motion.div>

        {/* Main Product Showcase */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16"
        >
          {previews.map((preview) => (
            <motion.div
              key={preview.id}
              variants={itemVariants}
              custom={preview.delay}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              {/* Mockup Frame */}
              <div className="relative">
                {/* Desktop Mockup */}
                {preview.type === 'desktop' && (
                  <div className="relative bg-[var(--bg-secondary)] rounded-2xl p-4 shadow-2xl border border-[var(--border-color)]">
                    {/* Browser Bar */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      </div>
                      <div className="flex-1 h-6 bg-[var(--bg-primary)] rounded-md border border-[var(--border-color)] flex items-center px-3">
                        <FiMonitor className="w-3 h-3 text-[var(--text-tertiary)] mr-2" />
                        <span className="text-xs text-[var(--text-tertiary)] truncate">
                          doittoday.com
                        </span>
                      </div>
                    </div>
                    
                    {/* Screenshot */}
                    <div className="relative overflow-hidden rounded-lg bg-[var(--bg-primary)]">
                      <motion.img
                        src={preview.image}
                        alt={preview.title}
                        className="w-full h-auto object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                      />
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent-primary)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                )}

                {/* Mobile Mockup */}
                {preview.type === 'mobile' && (
                  <div className="relative mx-auto max-w-[280px]">
                    {/* Phone Frame */}
                    <div className="relative bg-[var(--bg-secondary)] rounded-[3rem] p-3 shadow-2xl border-4 border-[var(--border-color)]">
                      {/* Notch */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[var(--bg-secondary)] rounded-b-2xl border-x-4 border-b-4 border-[var(--border-color)] z-10" />
                      
                      {/* Screen */}
                      <div className="relative overflow-hidden rounded-[2.5rem] bg-[var(--bg-primary)]">
                        {/* Status Bar */}
                        <div className="absolute top-0 left-0 right-0 h-8 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-20 flex items-center justify-between px-6 text-xs text-[var(--text-secondary)]">
                          <span>9:41</span>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-2 border border-[var(--text-secondary)] rounded-sm">
                              <div className="w-3 h-1.5 bg-[var(--text-secondary)] rounded-sm m-0.5" />
                            </div>
                            <FiSmartphone className="w-3 h-3" />
                          </div>
                        </div>
                        
                        {/* Screenshot */}
                        <motion.img
                          src={preview.image}
                          alt={preview.title}
                          className="w-full h-auto object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.4 }}
                        />
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent-primary)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      
                      {/* Home Indicator */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-[var(--text-tertiary)] rounded-full" />
                    </div>
                  </div>
                )}

                {/* Floating glow effect */}
                <motion.div
                  animate={floatingAnimation}
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${
                    preview.id === 1 ? 'from-blue-500/20 to-cyan-500/20' :
                    preview.id === 2 ? 'from-purple-500/20 to-pink-500/20' :
                    'from-orange-500/20 to-red-500/20'
                  } blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
                />
              </div>

              {/* Preview Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: preview.delay + 0.3 }}
                className="mt-6 text-center"
              >
                <h3 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">
                  {preview.title}
                </h3>
                <p className="text-[var(--text-secondary)]">
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

