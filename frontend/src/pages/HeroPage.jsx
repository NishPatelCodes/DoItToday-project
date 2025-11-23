import { motion } from 'framer-motion';

const HeroPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen flex items-center justify-center space-y-4 md:space-y-6 lg:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 md:mb-6 lg:mb-8 w-full max-w-2xl"
      >
        <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-1 md:mb-2 text-center">
          Hero
        </h1>
        <p className="text-sm md:text-base text-[var(--text-secondary)] text-center mb-6 md:mb-8">
          Coming Soon
        </p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl md:rounded-2xl p-8 md:p-12 text-center border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-md md:shadow-lg"
        >
          <p className="text-[var(--text-secondary)]">
            This section is under development. Stay tuned for exciting new features!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroPage;

