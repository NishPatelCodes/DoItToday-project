import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import { useToast } from '../hooks/useToast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const toast = useToast();

  const passwordStrength = useMemo(() => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength <= 2) return { strength, label: 'Weak', color: 'text-red-600' };
    if (strength <= 3) return { strength, label: 'Fair', color: 'text-yellow-600' };
    if (strength <= 4) return { strength, label: 'Good', color: 'text-blue-600' };
    return { strength, label: 'Strong', color: 'text-green-600' };
  }, [password]);

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }
    
    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (password.length > 100) {
      newErrors.password = 'Password must be less than 100 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await authAPI.register({ 
        name: name.trim(), 
        email: email.trim(), 
        password 
      });
      login(response.data.user, response.data.token);
      toast.success('Account created successfully! Welcome!');
      navigate('/dashboard');
    } catch (err) {
      // Handle validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map((e) => e.msg || e.message).join(', ');
        setError(errorMessages);
        toast.error(errorMessages);
      } 
      // Handle single message errors
      else if (err.response?.data?.message) {
        setError(err.response.data.message);
        toast.error(err.response.data.message);
      }
      // Handle network errors
      else if (err.message === 'Network Error' || !err.response) {
        const errorMsg = 'Cannot connect to server. Make sure the backend is running on port 5000.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
      // Generic error
      else {
        const errorMsg = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Apple-inspired background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--accent-primary)]/8 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative glass-card p-8 md:p-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-3" style={{ letterSpacing: '-0.02em' }}>DoItToday</h1>
          <p className="text-base md:text-lg text-[var(--text-secondary)] font-light" style={{ letterSpacing: '-0.01em', fontWeight: 300 }}>Create your account to get started</p>
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
            <label htmlFor="register-name" className="block text-sm font-semibold text-[var(--text-primary)] mb-2" style={{ letterSpacing: '-0.01em' }}>
              Name
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors({ ...errors, name: '' });
                }
                setError('');
              }}
              className={`input-field ${errors.name ? 'border-red-400 bg-red-50/50' : ''}`}
              placeholder="Your name"
              required
              autoComplete="name"
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors({ ...errors, email: '' });
                }
                setError('');
              }}
              className={`input-field ${errors.email ? 'border-red-500' : ''}`}
              placeholder="your@email.com"
              required
              autoComplete="email"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors({ ...errors, password: '' });
                }
                setError('');
              }}
              className={`input-field ${errors.password ? 'border-red-500' : ''}`}
              placeholder="••••••••"
              minLength={6}
              required
              autoComplete="new-password"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : password ? 'password-strength' : undefined}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.password}
              </p>
            )}
            {password && !errors.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-[var(--text-tertiary)]">Password strength:</p>
                  <p className={`text-xs font-medium ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </p>
                </div>
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      passwordStrength.strength <= 2 ? 'bg-red-500' :
                      passwordStrength.strength <= 3 ? 'bg-yellow-500' :
                      passwordStrength.strength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    role="progressbar"
                    aria-valuenow={passwordStrength.strength}
                    aria-valuemin="0"
                    aria-valuemax="5"
                    aria-label={`Password strength: ${passwordStrength.label}`}
                  />
                </div>
                <p id="password-strength" className="mt-1 text-xs text-[var(--text-tertiary)]">
                  Must be at least 6 characters. Use uppercase, lowercase, numbers, and symbols for better security.
                </p>
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={loading ? {} : { scale: 1.02, y: -1 }}
            whileTap={loading ? {} : { scale: 0.98 }}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </motion.button>
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
            onClick={() => {
              const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
              window.location.href = `${apiUrl.replace('/api', '')}/auth/google`;
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--border-color)] rounded-lg bg-white dark:bg-[var(--bg-tertiary)] hover:bg-gray-50 dark:hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-[var(--text-primary)] font-medium">Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
              window.location.href = `${apiUrl.replace('/api', '')}/auth/apple`;
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--border-color)] rounded-lg bg-black hover:bg-gray-900 dark:bg-[var(--bg-tertiary)] dark:hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span className="text-white dark:text-[var(--text-primary)] font-medium">Continue with Apple</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--accent-primary)] hover:text-[var(--accent-hover)] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

