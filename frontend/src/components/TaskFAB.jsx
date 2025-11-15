import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMagic, FaTimes } from 'react-icons/fa';

const TaskFAB = memo(({ 
  onAddTask, 
  onAddMultipleTasks,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleAddTask = () => {
    closeMenu();
    onAddTask?.();
  };

  const handleAddMultiple = () => {
    closeMenu();
    onAddMultipleTasks?.();
  };

  return (
    <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
      {/* Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Multiple Tasks Button */}
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ delay: 0.1 }}
              onClick={handleAddMultiple}
              className="absolute bottom-20 right-0 mb-2 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
              aria-label="Add multiple tasks"
            >
              <FaMagic className="text-lg" />
              <span className="absolute right-full mr-3 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Multiple Tasks
              </span>
            </motion.button>

            {/* Single Task Button */}
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              onClick={handleAddTask}
              className="absolute bottom-36 right-0 mb-2 w-14 h-14 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
              aria-label="Add new task"
            >
              <FaPlus className="text-lg" />
              <span className="absolute right-full mr-3 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                New Task
              </span>
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        onClick={toggleMenu}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-16 h-16 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        aria-label={isOpen ? 'Close menu' : 'Open task menu'}
        aria-expanded={isOpen}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaTimes className="text-xl" />
            </motion.div>
          ) : (
            <motion.div
              key="plus"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaPlus className="text-xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </div>
  );
});

TaskFAB.displayName = 'TaskFAB';

export default TaskFAB;
