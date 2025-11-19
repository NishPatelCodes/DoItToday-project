import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';

// Lazy load devtools (only in development, reduces bundle size)
let ReactQueryDevtools;
if (import.meta.env.DEV) {
  ReactQueryDevtools = lazy(() => 
    import('@tanstack/react-query-devtools').then((mod) => ({
      default: mod.ReactQueryDevtools,
    }))
  );
} else {
  ReactQueryDevtools = () => null;
}

// Create a client with optimized defaults for performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // Previously cacheTime
      // Retry failed requests once
      retry: 1,
      // Refetch on window focus only for critical data
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect (reduce network usage)
      refetchOnReconnect: false,
      // Use previous data while fetching new data (smooth transitions)
      placeholderData: (previousData) => previousData,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

export const QueryProvider = ({ children }) => {
  try {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        {/* Only show devtools in development */}
        {import.meta.env.DEV && (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        )}
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('QueryProvider error:', error);
    // Fallback: render children without QueryProvider if there's an error
    return <>{children}</>;
  }
};

