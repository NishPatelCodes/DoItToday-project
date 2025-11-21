import React from 'react';
import ErrorBoundary from './ErrorBoundary';

// Simple wrapper component for charts that might fail
const ChartErrorBoundary = ({ children, fallback = null }) => {
  return (
    <ErrorBoundary>
      {fallback ? (
        <React.Suspense fallback={fallback}>
          {children}
        </React.Suspense>
      ) : (
        children
      )}
    </ErrorBoundary>
  );
};

export default ChartErrorBoundary;

