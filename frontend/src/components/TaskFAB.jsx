import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMagic } from 'react-icons/fa';

const TaskFAB = memo(({ 
  onAddTask, 
  onAddMultipleTasks,
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleAddTask = () => {
    onAddTask?.();
  };

  const handleAddMultiple = () => {
    onAddMultipleTasks?.();
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 z-40 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Menu Items */}
      <AnimatePresence>
        {isHovered && (
          <>
            {/* Multiple Tasks Button */}
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
              onClick={handleAddMultiple}
              className="absolute bottom-20 right-0 mb-2 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
              aria-label="Add multiple tasks"
            >
              <FaMagic className="text-lg" />
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Multiple Tasks
              </span>
            </motion.button>

            {/* Single Task Button */}
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 20 }}
              onClick={handleAddTask}
              className="absolute bottom-36 right-0 mb-2 w-14 h-14 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
              aria-label="Add new task"
            >
              <FaPlus className="text-lg" />
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Tasks
              </span>
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        onClick={handleAddTask}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-16 h-16 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        aria-label="Add new task"
      >
        <FaPlus className="text-xl" />
      </motion.button>
    </div>
  );
});

TaskFAB.displayName = 'TaskFAB';

export default TaskFAB;
