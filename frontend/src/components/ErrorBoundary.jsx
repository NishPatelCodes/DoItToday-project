import React from 'react';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Enhanced error logging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Component stack:', errorInfo?.componentStack);
    console.error('Full error info:', errorInfo);
    
    // Log to localStorage for debugging (even in production)
    try {
      const errorLog = {
        message: error?.message || String(error),
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      localStorage.setItem('lastError', JSON.stringify(errorLog));
    } catch (e) {
      // Ignore localStorage errors
    }

    this.setState({
      error,
      errorInfo,
    });

    // Log to error tracking service (e.g., Sentry)
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    // }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} onReset={() => this.setState({ hasError: false, error: null, errorInfo: null })} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, onReset }) => {
  const navigate = useNavigate();
  const isDev = import.meta.env.DEV;
  const [showDetails, setShowDetails] = React.useState(isDev);

  // Try to get error from localStorage if available
  const [storedError, setStoredError] = React.useState(null);
  React.useEffect(() => {
    try {
      const lastError = localStorage.getItem('lastError');
      if (lastError) {
        setStoredError(JSON.parse(lastError));
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
      <div className="card p-8 max-w-2xl w-full text-center">
        <div className="mb-6">
          <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Something went wrong
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            We're sorry, but something unexpected happened. Please try again or return to the dashboard.
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mb-4">
            If this persists, try disabling browser extensions or using incognito mode.
          </p>
        </div>

        {(showDetails || isDev) && (error || storedError) && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">Error Details:</p>
              {!isDev && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  {showDetails ? 'Hide' : 'Show'} Details
                </button>
              )}
            </div>
            <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto max-h-64 whitespace-pre-wrap">
              {error?.message || error?.toString() || storedError?.message || 'Unknown error'}
              {'\n\n'}
              {error?.stack || storedError?.stack || 'No stack trace available'}
              {'\n\n'}
              Component Stack:
              {errorInfo?.componentStack || storedError?.componentStack || 'No component stack available'}
            </pre>
            <button
              onClick={() => {
                try {
                  const errorText = `
Error: ${error?.message || storedError?.message}
Stack: ${error?.stack || storedError?.stack}
Component Stack: ${errorInfo?.componentStack || storedError?.componentStack}
                  `.trim();
                  navigator.clipboard.writeText(errorText);
                  alert('Error details copied to clipboard!');
                } catch (e) {
                  console.error('Failed to copy:', e);
                }
              }}
              className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              Copy Error Details
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onReset}
            className="btn-primary flex items-center justify-center gap-2"
            aria-label="Try again"
          >
            Try Again
          </button>
          <button
            onClick={() => {
              onReset();
              navigate('/dashboard');
            }}
            className="btn-secondary flex items-center justify-center gap-2"
            aria-label="Go to dashboard"
          >
            <FaHome />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;

