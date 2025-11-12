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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94], // Apple-style easing
      },
    },
  };

  const floatingAnimation = {
    y: [0, -8, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
    },
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16 md:pb-20 overflow-hidden">
      {/* Apple-inspired subtle background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--accent-primary)]/8 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5,
          }}
          className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[var(--accent-secondary)]/6 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Main Headline - Apple-style typography */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl font-bold mb-6 md:mb-8 leading-[1.05] px-4 tracking-tight"
            style={{ letterSpacing: '-0.03em' }}
          >
            <span className="block text-[var(--text-primary)]">
              Organize Your Day.
            </span>
            <span className="block mt-3 md:mt-4 gradient-text">
              Achieve More.
            </span>
          </motion.h1>

          {/* Subheadline - Apple-style spacing */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[var(--text-secondary)] mb-12 md:mb-14 max-w-3xl mx-auto font-light px-4 leading-relaxed"
            style={{ letterSpacing: '-0.015em', fontWeight: 300 }}
          >
            The all-in-one productivity platform that helps you manage tasks, 
            build habits, and stay focused on what matters.
          </motion.p>

          {/* CTA Buttons - Apple-style buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 md:mb-12"
          >
            <motion.button
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="group relative px-10 md:px-12 py-4 md:py-5 bg-[var(--accent-primary)] text-white rounded-2xl font-semibold text-lg md:text-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
              style={{ letterSpacing: '-0.01em' }}
            >
              Get Started
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>

            <motion.button
              onClick={() => navigate('/register')}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="px-10 md:px-12 py-4 md:py-5 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-2xl font-semibold text-lg md:text-xl hover:shadow-lg transition-all duration-300 backdrop-blur-xl"
              style={{ letterSpacing: '-0.01em' }}
            >
              Sign Up Free
            </motion.button>
          </motion.div>

          {/* Quick Benefits - Apple-style subtle */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-base sm:text-lg text-[var(--text-secondary)]"
          >
            <div className="flex items-center gap-3">
              <FiCheckCircle className="text-[var(--accent-primary)] flex-shrink-0 w-5 h-5" />
              <span style={{ letterSpacing: '-0.01em' }}>Free forever</span>
            </div>
            <div className="flex items-center gap-3">
              <FiCheckCircle className="text-[var(--accent-primary)] flex-shrink-0 w-5 h-5" />
              <span style={{ letterSpacing: '-0.01em' }}>No credit card required</span>
            </div>
            <div className="flex items-center gap-3">
              <FiCheckCircle className="text-[var(--accent-primary)] flex-shrink-0 w-5 h-5" />
              <span style={{ letterSpacing: '-0.01em' }}>Start in seconds</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Decorative scroll indicator - Apple-style subtle */}
        <motion.div
          animate={floatingAnimation}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 hidden md:block"
        >
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[var(--accent-primary)]/60 to-transparent rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;

