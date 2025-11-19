import { Suspense } from 'react';
import { Skeleton } from '../Skeleton';

/**
 * Wrapper component for lazy-loaded components with loading fallback
 * Provides consistent loading states and error boundaries
 */
export const LazyWrapper = ({ children, fallback, minHeight = '200px' }) => {
  const defaultFallback = (
    <div style={{ minHeight }} className="flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent-primary)] border-t-transparent"></div>
        <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

