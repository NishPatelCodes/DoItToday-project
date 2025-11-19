import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './hooks/useTheme';
import { useEffect, useState, lazy, Suspense } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuthCallback from './pages/OAuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import { authAPI } from './services/api';
import { LazyWrapper } from './components/lazy/LazyWrapper';

// Lazy load heavy pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  const { isAuthenticated, token, logout } = useAuthStore();
  const { theme } = useThemeStore();
  const [isValidating, setIsValidating] = useState(!!token);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Validate token on app startup (only once)
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        await authAPI.getMe();
        // Token is valid, keep user authenticated
        setIsValidating(false);
      } catch (error) {
        // Token is invalid or API error, clear it
        // Only logout if it's an auth error (401), not network errors
        if (error.response?.status === 401) {
          logout();
        }
        setIsValidating(false);
      }
    };

    // Add a small delay to ensure stores are initialized
    const timer = setTimeout(() => {
      validateToken().catch((err) => {
        console.error('Token validation error:', err);
        setIsValidating(false);
      });
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Show loading state while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent-primary)] border-t-transparent mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <Routes>
        {/* Landing page - always accessible */}
        <Route 
          path="/landing" 
          element={
            <LazyWrapper>
              <LandingPage />
            </LazyWrapper>
          } 
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LazyWrapper>
                <LandingPage />
              </LazyWrapper>
            )
          }
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <LazyWrapper minHeight="100vh">
                <Dashboard />
              </LazyWrapper>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;

