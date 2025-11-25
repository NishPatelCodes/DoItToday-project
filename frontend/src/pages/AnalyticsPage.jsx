import { Suspense, lazy } from 'react';
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import ErrorBoundary from '../components/ErrorBoundary';
import { LazyWrapper } from '../components/lazy/LazyWrapper';

const AnalyticsDashboard = lazy(() => import('../components/AnalyticsDashboard'));

const AnalyticsPage = () => {
  const { analytics, tasks, goals, habits } = useDataStore();
  const { user } = useAuthStore();

  return (
    <ErrorBoundary>
      <LazyWrapper minHeight="80vh">
        <AnalyticsDashboard
          analytics={analytics}
          tasks={tasks || []}
          goals={goals || []}
          habits={habits || []}
          user={user}
        />
      </LazyWrapper>
    </ErrorBoundary>
  );
};

export default AnalyticsPage;

