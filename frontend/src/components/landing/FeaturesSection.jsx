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
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-[var(--text-primary)]">
            Everything You Need to
            <span className="block mt-2 gradient-text">Stay Productive</span>
          </h2>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Powerful features designed to help you organize, focus, and achieve your goals.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-all duration-300 cursor-pointer"
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Icon */}
                <div className="relative mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect Indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturesSection;

