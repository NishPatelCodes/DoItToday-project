import { useEffect } from 'react';

// Global counter to track how many modals are open
let modalCount = 0;
let scrollPosition = 0;

/**
 * Hook to lock body scroll when a modal is open
 * Handles multiple modals by using a counter
 * Prevents background scrolling when any modal is open
 */
export const useScrollLock = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      
      // Increment modal count
      modalCount++;
      
      // Lock body scroll
      const body = document.body;
      const html = document.documentElement;
      
      // Save original styles
      const originalBodyOverflow = body.style.overflow;
      const originalBodyPosition = body.style.position;
      const originalBodyTop = body.style.top;
      const originalBodyWidth = body.style.width;
      const originalHtmlOverflow = html.style.overflow;
      
      // Apply scroll lock
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollPosition}px`;
      body.style.width = '100%';
      html.style.overflow = 'hidden';
      
      return () => {
        // Decrement modal count
        modalCount--;
        
        // Only restore scroll if no other modals are open
        if (modalCount === 0) {
          // Restore original styles
          body.style.overflow = originalBodyOverflow;
          body.style.position = originalBodyPosition;
          body.style.top = originalBodyTop;
          body.style.width = originalBodyWidth;
          html.style.overflow = originalHtmlOverflow;
          
          // Restore scroll position
          window.scrollTo(0, scrollPosition);
        }
      };
    }
  }, [isOpen]);
};

export default useScrollLock;

