import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

// Suppress Chrome extension errors (harmless errors from browser extensions)
window.addEventListener('error', (event) => {
  const errorMessage = event.message || event.error?.message || '';
  if (errorMessage.includes('message channel closed') || 
      errorMessage.includes('listener indicated an asynchronous response')) {
    // Ignore Chrome extension communication errors - these are harmless
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.message || 
                       (typeof event.reason === 'string' ? event.reason : '') ||
                       (event.reason?.error?.message || '');
  
  if (errorMessage.includes('message channel closed') || 
      errorMessage.includes('listener indicated an asynchronous response') ||
      errorMessage.includes('A listener indicated an asynchronous response')) {
    // Ignore Chrome extension communication errors - these are harmless
    event.preventDefault();
    return false;
  }
});

// Safely render the app
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <ErrorBoundary>
          <App />
          <Toaster
            toastOptions={{
              className: 'toast-custom',
              style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              },
            }}
          />
        </ErrorBoundary>
      </BrowserRouter>
    </React.StrictMode>,
  );
} catch (error) {
  console.error('Failed to render app:', error);
  // Fallback error display
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui; padding: 20px; text-align: center;">
      <div>
        <h1 style="color: #ef4444; margin-bottom: 16px;">Application Error</h1>
        <p style="color: #6b7280; margin-bottom: 8px;">Failed to initialize the application.</p>
        <p style="color: #9ca3af; font-size: 14px;">Please refresh the page or contact support if the issue persists.</p>
        <button onclick="window.location.reload()" style="margin-top: 24px; padding: 8px 16px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    </div>
  `;
}


