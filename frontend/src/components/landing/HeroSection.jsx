import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';

/**
 * Hero Section Component
 * 
 * Main headline section with CTA button
 * Features smooth animations and modern design
 */
function HeroSection() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
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

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 pb-12 md:pb-16 overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl -translate-y-1/4"
        />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-bold mb-5 md:mb-6 leading-tight px-4"
          >
            <span className="block text-[var(--text-primary)]">
              Organize Your Day.
            </span>
            <span className="block mt-2 md:mt-3 gradient-text">
              Achieve More.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-[var(--text-secondary)] mb-8 md:mb-10 max-w-2xl md:max-w-3xl mx-auto font-light px-4 leading-relaxed"
          >
            The all-in-one productivity platform that helps you manage tasks, 
            build habits, and stay focused on what matters.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 md:mb-10"
          >
            <motion.button
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 md:px-10 py-3.5 md:py-4 bg-[var(--accent-primary)] text-white rounded-xl font-semibold text-base md:text-lg shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
            >
              Get Started
              <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"
                initial={false}
              />
            </motion.button>

            <motion.button
              onClick={() => navigate('/register')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 md:px-10 py-3.5 md:py-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl font-semibold text-base md:text-lg hover:border-[var(--accent-primary)] hover:shadow-lg transition-all duration-300"
            >
              Sign Up Free
            </motion.button>
          </motion.div>

          {/* Quick Benefits */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm sm:text-base text-[var(--text-secondary)]"
          >
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-[var(--accent-primary)] flex-shrink-0" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-[var(--accent-primary)] flex-shrink-0" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-[var(--accent-primary)] flex-shrink-0" />
              <span>Start in seconds</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Decorative scroll indicator */}
        <motion.div
          animate={floatingAnimation}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
        >
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent rounded-full opacity-50" />
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;

