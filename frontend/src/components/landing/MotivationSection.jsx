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
      className="py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[var(--bg-primary)] relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-primary-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center"
        >
          {/* Quote Icon */}
          <motion.div variants={itemVariants} className="mb-6 md:mb-8">
            <FiMessageSquare className="w-12 h-12 md:w-16 md:h-16 mx-auto text-[var(--accent-primary)] opacity-20" />
          </motion.div>

          {/* Main Quote */}
          <motion.blockquote
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-[var(--text-primary)] mb-6 md:mb-8 leading-relaxed px-4"
          >
            "Productivity is not about doing more. It's about doing what matters 
            <span className="block mt-3 md:mt-4 gradient-text">
              with clarity and focus."
            </span>
          </motion.blockquote>

          {/* Statistic */}
          <motion.div
            variants={itemVariants}
            className="mt-12 md:mt-16 pt-12 md:pt-16 border-t border-[var(--border-color)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-1.5 md:mb-2">
                  10x
                </div>
                <div className="text-sm md:text-base text-[var(--text-secondary)]">
                  More productive users
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-1.5 md:mb-2">
                  95%
                </div>
                <div className="text-sm md:text-base text-[var(--text-secondary)]">
                  Goal completion rate
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-1.5 md:mb-2">
                  50k+
                </div>
                <div className="text-sm md:text-base text-[var(--text-secondary)]">
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

