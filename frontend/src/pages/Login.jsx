import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null); // 'google' or 'apple'
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login } = useAuthStore();

  // Check for error query parameter (from OAuth redirects)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      // Clear the error from URL
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      // Handle validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map((e) => e.msg || e.message).join(', ');
        setError(errorMessages);
      } 
      // Handle single message errors
      else if (err.response?.data?.message) {
        setError(err.response.data.message);
      }
      // Handle network errors
      else if (err.message === 'Network Error' || err.code === 'ERR_NETWORK' || !err.response) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        setError(`Cannot connect to server at ${apiUrl}. Please check your connection and try again.`);
      }
      // Generic error
      else {
        setError(err.response?.data?.error || err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">DoItToday</h1>
          <p className="text-[var(--text-primary)]">Welcome back! Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-color)]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)]">Or continue with</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            disabled={oauthLoading !== null}
            onClick={() => {
              try {
                setOauthLoading('google');
                setError('');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                // Remove /api suffix if present, and any trailing slashes
                const baseUrl = apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
                const oauthUrl = `${baseUrl}/auth/google`;
                console.log('Redirecting to Google OAuth:', oauthUrl);
                // Small delay to show loading state
                setTimeout(() => {
                  window.location.href = oauthUrl;
                }, 100);
              } catch (error) {
                console.error('Error initiating Google OAuth:', error);
                setError('Failed to initiate Google sign-in. Please try again.');
                setOauthLoading(null);
              }
            }}
            className="oauth-button"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-[var(--text-primary)] font-medium">
              {oauthLoading === 'google' ? 'Redirecting...' : 'Continue with Google'}
            </span>
          </button>

          <button
            type="button"
            disabled={oauthLoading !== null}
            onClick={() => {
              try {
                setOauthLoading('apple');
                setError('');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                // Remove /api suffix if present, and any trailing slashes
                const baseUrl = apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
                const oauthUrl = `${baseUrl}/auth/apple`;
                console.log('Redirecting to Apple OAuth:', oauthUrl);
                // Small delay to show loading state
                setTimeout(() => {
                  window.location.href = oauthUrl;
                }, 100);
              } catch (error) {
                console.error('Error initiating Apple OAuth:', error);
                setError('Failed to initiate Apple sign-in. Please try again.');
                setOauthLoading(null);
              }
            }}
            className="oauth-button-apple"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span className="font-medium">
              {oauthLoading === 'apple' ? 'Redirecting...' : 'Continue with Apple'}
            </span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[var(--text-secondary)]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--accent-primary)] hover:text-[var(--accent-hover)] font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

