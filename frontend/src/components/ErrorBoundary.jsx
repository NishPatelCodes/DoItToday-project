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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
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
        </div>

        {isDev && error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">Error Details:</p>
            <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto max-h-48">
              {error.toString()}
              {errorInfo?.componentStack}
            </pre>
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

