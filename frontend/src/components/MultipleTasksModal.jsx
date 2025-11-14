import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMagic, FaSpinner } from 'react-icons/fa';
import { useFocusTrap } from '../hooks/useFocusTrap';
import toast from 'react-hot-toast';

const MultipleTasksModal = ({ isOpen, onClose, onGenerateTasks }) => {
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const modalRef = useFocusTrap(isOpen);

  const handleClose = () => {
    if (!isProcessing) {
      setTextInput('');
      onClose();
    }
  };

  const handleGenerate = async () => {
    if (!textInput.trim()) {
      toast.error('Please paste some text to generate tasks');
      return;
    }

    if (textInput.trim().split('\n').length < 3) {
      toast.error('Please paste at least 3-4 lines of text for better task extraction');
      return;
    }

    setIsProcessing(true);
    try {
      await onGenerateTasks(textInput.trim());
      setTextInput('');
      handleClose();
    } catch (error) {
      toast.error('Failed to generate tasks. Please try again.');
      console.error('Error generating tasks:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const lineCount = textInput.split('\n').length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            ref={modalRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[var(--border-color)]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <FaMagic className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">Multiple Tasks</h2>
                    <p className="text-sm text-[var(--text-secondary)]">Paste text and AI will extract tasks</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                  aria-label="Close modal"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Paste your text here (10-15 lines recommended)
                    </label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Example:&#10;- Review project proposal&#10;- Send email to client&#10;- Update documentation&#10;- Schedule team meeting&#10;- Prepare presentation slides&#10;&#10;Or paste any text with tasks, bullet points, or action items..."
                      className="w-full h-64 p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 resize-none"
                      disabled={isProcessing}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {lineCount} line{lineCount !== 1 ? 's' : ''} • AI will detect tasks automatically
                      </p>
                      {textInput.trim() && (
                        <button
                          onClick={() => setTextInput('')}
                          disabled={isProcessing}
                          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-color)]">
                    <p className="text-sm font-medium text-[var(--text-primary)] mb-2">💡 Tips for best results:</p>
                    <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                      <li>Paste bullet points, numbered lists, or action sentences</li>
                      <li>Each line or bullet point can become a task</li>
                      <li>AI will clean and structure each task automatically</li>
                      <li>Multi-step instructions will be broken into separate tasks</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-color)]">
                <button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isProcessing || !textInput.trim()}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <FaMagic />
                      <span>Generate Tasks</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MultipleTasksModal;

