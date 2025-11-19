import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const AddFriendModal = ({ isOpen, onClose, onAdd }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter an email address');
      return;
    }

    try {
      const response = await onAdd(email);
      // Check if it's a friend request or auto-accepted
      if (response?.data?.message) {
        alert(response.data.message);
      }
      setEmail('');
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add friend';
      setError(errorMessage);
      // Error handled by throwing
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="card p-4 md:p-6 w-full max-w-md rounded-xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] leading-tight break-words">Add Friend</h2>
              <button
                onClick={onClose}
                className="p-2 text-[var(--text-tertiary)] hover:text-red-600 dark:hover:text-red-400 transition-colors touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                aria-label="Close modal"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm leading-normal break-words">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2 leading-normal">
                  Friend's Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                  placeholder="friend@email.com"
                  aria-label="Friend's email address"
                />
              </div>

              <div className="flex gap-3 pt-4 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1"
                >
                  <span>Cancel</span>
                </button>
                <button type="submit" className="btn-primary flex-1">
                  <span>Add Friend</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddFriendModal;

