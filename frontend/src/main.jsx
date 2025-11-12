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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
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
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);


