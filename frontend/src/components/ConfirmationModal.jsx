import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { useFocusTrap } from '../hooks/useFocusTrap';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger' // 'danger', 'warning', 'info'
}) => {
  const modalRef = useFocusTrap(isOpen);
  
  if (!isOpen) return null;
  
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const typeStyles = {
    danger: {
      icon: 'text-red-500',
      button: 'bg-red-500 hover:bg-red-600 text-white',
    },
    warning: {
      icon: 'text-yellow-500',
      button: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    },
    info: {
      icon: 'text-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
  };

  const styles = typeStyles[type] || typeStyles.danger;

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
            className="card p-4 md:p-6 max-w-md w-full rounded-xl mx-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleEscape}
            ref={modalRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
            aria-describedby="confirmation-message"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className={`flex-shrink-0 ${styles.icon}`}>
                <FaExclamationTriangle className="text-2xl flex-shrink-0" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 id="confirmation-title" className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-2 leading-snug break-words">
                  {title}
                </h3>
                <p id="confirmation-message" className="text-sm text-[var(--text-secondary)] leading-relaxed break-words">
                  {message}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[var(--text-tertiary)] hover:text-red-600 dark:hover:text-red-400 transition-colors touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                aria-label="Close confirmation dialog"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={onClose}
                className="btn-secondary"
                aria-label={cancelText}
              >
                <span>{cancelText}</span>
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`${styles.button} px-4 py-3 rounded-xl font-semibold transition-colors touch-manipulation min-h-[48px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
                aria-label={confirmText}
              >
                <span>{confirmText}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;

