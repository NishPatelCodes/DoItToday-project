import { useEffect, useRef } from 'react';

/**
 * Hook to trap focus within a modal or dialog
 * Ensures keyboard users can't tab outside the modal
 */
export const useFocusTrap = (isOpen) => {
  const containerRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    // Store the element that had focus before opening the modal
    previousActiveElement.current = document.activeElement;

    // Get all focusable elements within the modal
    const getFocusableElements = () => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      return Array.from(container.querySelectorAll(focusableSelectors)).filter(
        (el) => {
          return !el.hasAttribute('disabled') && 
                 !el.getAttribute('aria-hidden') === 'true' &&
                 el.offsetParent !== null; // Element is visible
        }
      );
    };

    const focusableElements = getFocusableElements();
    
    if (focusableElements.length === 0) return;

    // Focus the first focusable element
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Set focus to first element after a small delay to ensure modal is rendered
    setTimeout(() => {
      firstElement?.focus();
    }, 100);

    // Handle Tab key to trap focus
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Handle Escape key to close modal (can be handled by parent)
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        // Let the parent component handle the close action
        // This just ensures focus is managed
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleEscape);

    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = originalOverflow;
      
      // Restore focus to the previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  return containerRef;
};

export default useFocusTrap;

