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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
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
      className="py-20 md:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[var(--bg-primary)] relative overflow-hidden"
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold mb-4 md:mb-5 text-[var(--text-primary)] leading-tight">
            Everything You Need to
            <span className="block mt-2 gradient-text">Stay Productive</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto px-4 leading-relaxed">
            Powerful features designed to help you organize, focus, and achieve your goals.
          </p>
        </motion.div>

        {/* Features Grid - Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -6,
                  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                }}
                className="group relative p-5 md:p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] cursor-pointer overflow-hidden"
              >
                {/* Animated gradient background on hover - smoother */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0`}
                  whileHover={{ opacity: 0.08 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Subtle border glow on hover */}
                <motion.div
                  className={`absolute inset-0 rounded-xl border-2 bg-gradient-to-br ${feature.color} opacity-0`}
                  whileHover={{ opacity: 0.2 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{ borderImage: 'linear-gradient(135deg, transparent, transparent) 1' }}
                />

                {/* Icon with smooth scale animation */}
                <div className="relative mb-4">
                  <motion.div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg`}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -5, 5, 0],
                      transition: { duration: 0.4 }
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                </div>

                {/* Content */}
                <h3 className="text-lg md:text-xl font-semibold mb-2 text-[var(--text-primary)] relative z-10">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed relative z-10">
                  {feature.description}
                </p>

                {/* Bottom accent line - smooth reveal */}
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.color} opacity-0`}
                  whileHover={{ 
                    opacity: 1,
                    scaleX: 1,
                  }}
                  initial={{ scaleX: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Shine effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0"
                  whileHover={{
                    opacity: 1,
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 0.6,
                    ease: 'easeInOut',
                  }}
                  style={{ transform: 'skewX(-20deg)' }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturesSection;

