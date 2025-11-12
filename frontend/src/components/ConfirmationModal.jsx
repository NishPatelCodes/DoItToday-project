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
            className="card p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleEscape}
            ref={modalRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
            aria-describedby="confirmation-message"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={`flex-shrink-0 ${styles.icon}`}>
                <FaExclamationTriangle className="text-2xl" />
              </div>
              <div className="flex-1">
                <h3 id="confirmation-title" className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {title}
                </h3>
                <p id="confirmation-message" className="text-sm text-[var(--text-secondary)]">
                  {message}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Close confirmation dialog"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="btn-secondary px-4 py-2 rounded-lg font-medium"
                aria-label={cancelText}
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`${styles.button} px-4 py-2 rounded-lg font-medium transition-colors`}
                aria-label={confirmText}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;

