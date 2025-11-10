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
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 pb-12 md:pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 md:mb-6 leading-tight px-4"
          >
            <span className="block text-[var(--text-primary)]">
              Organize Your Day.
            </span>
            <span className="block mt-2 gradient-text">
              Achieve More.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[var(--text-secondary)] mb-8 md:mb-12 max-w-2xl md:max-w-3xl mx-auto font-light px-4"
          >
            The all-in-one productivity platform that helps you manage tasks, 
            build habits, and stay focused on what matters.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.button
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 bg-[var(--accent-primary)] text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl font-semibold text-lg hover:border-[var(--accent-primary)] transition-all duration-300"
            >
              Sign Up Free
            </motion.button>
          </motion.div>

          {/* Quick Benefits */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-6 text-sm sm:text-base text-[var(--text-secondary)]"
          >
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-[var(--accent-primary)]" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-[var(--accent-primary)]" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-[var(--accent-primary)]" />
              <span>Start in seconds</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Decorative Illustration/Animation */}
        <motion.div
          animate={floatingAnimation}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 hidden md:block"
        >
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent rounded-full opacity-50" />
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;

