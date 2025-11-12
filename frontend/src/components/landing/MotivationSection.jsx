import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { FiMessageSquare } from 'react-icons/fi';

/**
 * Motivation Section Component
 * 
 * Inspirational quote or statistic to motivate users
 * Features elegant typography and subtle animations
 */
function MotivationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section
      ref={ref}
      className="py-20 md:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[var(--bg-primary)] relative overflow-hidden"
    >
      {/* Apple-inspired Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[var(--accent-primary)]/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--accent-secondary)]/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center"
        >
          {/* Quote Icon - Apple-style subtle */}
          <motion.div variants={itemVariants} className="mb-8 md:mb-10">
            <FiMessageSquare className="w-12 h-12 md:w-16 md:h-16 mx-auto text-[var(--accent-primary)] opacity-15" />
          </motion.div>

          {/* Main Quote - Apple-style typography */}
          <motion.blockquote
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-[var(--text-primary)] mb-10 md:mb-12 leading-[1.2] px-4"
            style={{ letterSpacing: '-0.02em', fontWeight: 300 }}
          >
            "Productivity is not about doing more. It's about doing what matters 
            <span className="block mt-4 md:mt-5 gradient-text">
              with clarity and focus."
            </span>
          </motion.blockquote>

          {/* Statistics - Apple-style clean */}
          <motion.div
            variants={itemVariants}
            className="mt-14 md:mt-16 pt-12 md:pt-14 border-t border-[var(--border-color)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
              <div className="pb-4">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold gradient-text mb-3 md:mb-4" style={{ letterSpacing: '-0.03em' }}>
                  10x
                </div>
                <div className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed font-light" style={{ letterSpacing: '-0.01em', fontWeight: 300 }}>
                  More productive users
                </div>
              </div>
              <div className="pb-4">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold gradient-text mb-3 md:mb-4" style={{ letterSpacing: '-0.03em' }}>
                  95%
                </div>
                <div className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed font-light" style={{ letterSpacing: '-0.01em', fontWeight: 300 }}>
                  Goal completion rate
                </div>
              </div>
              <div className="pb-4">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold gradient-text mb-3 md:mb-4" style={{ letterSpacing: '-0.03em' }}>
                  50k+
                </div>
                <div className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed font-light" style={{ letterSpacing: '-0.01em', fontWeight: 300 }}>
                  Active users
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default MotivationSection;

