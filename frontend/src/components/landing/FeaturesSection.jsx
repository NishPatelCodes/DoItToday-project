import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  FiCheckSquare,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiZap,
  FiCalendar,
  FiStar,
  FiBarChart2,
} from 'react-icons/fi';

/**
 * Features Section Component
 * 
 * Showcases core features of the app
 * Features smooth scroll animations and hover effects
 */
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94], // Apple-style easing
      },
    },
  };

  const features = [
    {
      icon: FiCheckSquare,
      title: 'Task Management',
      description: 'Organize your daily tasks with priorities, due dates, and smart scheduling.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FiTarget,
      title: 'Goal Tracking',
      description: 'Set long-term goals and track your progress with visual analytics.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: FiZap,
      title: 'Focus Mode',
      description: 'Pomodoro timer with ambient sounds to help you stay focused and productive.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: FiCalendar,
      title: 'Smart Planner',
      description: 'AI-powered suggestions to optimize your schedule and prioritize tasks.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: FiTrendingUp,
      title: 'Habit Tracking',
      description: 'Build consistency with daily habits, streaks, and progress tracking.',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: FiUsers,
      title: 'Social Features',
      description: 'Connect with friends, share progress, and compete on leaderboards.',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: FiStar,
      title: 'Gamification',
      description: 'Earn XP, level up, and unlock badges as you complete tasks and goals.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: FiBarChart2,
      title: 'Analytics & Insights',
      description: 'Visual reports and AI insights to understand your productivity patterns.',
      color: 'from-teal-500 to-cyan-500',
    },
  ];

  return (
    <section
      id="features"
      ref={ref}
      className="py-20 md:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[var(--bg-primary)] relative overflow-hidden"
    >
      {/* Apple-inspired subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[var(--accent-primary)]/4 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--accent-secondary)]/4 rounded-full blur-3xl" />
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
            Everything You Need to
            <span className="block mt-3 md:mt-4 gradient-text">Stay Productive</span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)] max-w-3xl mx-auto px-4 leading-relaxed font-light" style={{ letterSpacing: '-0.015em', fontWeight: 300 }}>
            Powerful features designed to help you organize, focus, and achieve your goals.
          </p>
        </motion.div>

        {/* Features Grid - Apple-inspired cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -4,
                  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                }}
                className="group relative p-6 md:p-7 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] cursor-pointer overflow-hidden backdrop-blur-xl"
              >
                {/* Apple-inspired subtle gradient on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0`}
                  whileHover={{ opacity: 0.05 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                />

                {/* Icon with Apple-style animation */}
                <div className="relative mb-5">
                  <motion.div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-md`}
                    whileHover={{ 
                      scale: 1.08,
                      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                    }}
                  >
                    <Icon className="w-7 h-7" />
                  </motion.div>
                </div>

                {/* Content - Apple-style typography */}
                <h3 className="text-xl md:text-2xl font-semibold mb-3 text-[var(--text-primary)] relative z-10" style={{ letterSpacing: '-0.02em' }}>
                  {feature.title}
                </h3>
                <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed relative z-10 font-light" style={{ letterSpacing: '-0.01em', fontWeight: 300 }}>
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturesSection;

