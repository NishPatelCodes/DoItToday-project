import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import ThemeToggle from '../components/landing/ThemeToggle';
import { getRandomQuote } from '../utils/motivationalQuotes';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiSparkles } from 'react-icons/fi';

/**
 * Login Page Component
 * 
 * Futuristic, professional, and motivating login page
 * Inspired by routine.co with added positivity and personality
 * 
 * Features:
 * - Split layout: motivational content (left) + login form (right)
 * - Rotating motivational quotes with smooth fade animations
 * - Glassmorphism and modern design elements
 * - Smooth transitions and animations
 * - Dark/light mode support
 * - Fully responsive design
 * 
 * CUSTOMIZATION:
 * - Modify quotes in utils/motivationalQuotes.js
 * - Adjust animation durations in transition props
 * - Change gradient colors in className strings
 * - Update tagline text below
 */

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(() => getRandomQuote());
  const [quoteKey, setQuoteKey] = useState(0);
  
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const toast = useToast();

  // Rotate quotes every 5 seconds
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteKey(prev => prev + 1);
      setCurrentQuote(getRandomQuote());
    }, 5000);

    return () => clearInterval(quoteInterval);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
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
      const response = await authAPI.login({ email: email.trim(), password });
      login(response.data.user, response.data.token);
      toast.success('Welcome back!');
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
      else if (err.message === 'Network Error' || err.code === 'ERR_NETWORK' || !err.response) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const errorMsg = `Cannot connect to server at ${apiUrl}. Please check your connection and try again.`;
        setError(errorMsg);
        toast.error(errorMsg);
      }
      // Generic error
      else {
        const errorMsg = err.response?.data?.error || err.message || 'Login failed. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const quoteVariants = {
    enter: {
      opacity: 0,
      y: 20,
    },
    center: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/5 to-blue-500/5 dark:from-cyan-500/10 dark:to-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Theme Toggle - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Main Content Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-6xl mx-auto"
      >
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Motivational Content */}
          <motion.div
            variants={itemVariants}
            className="hidden lg:flex flex-col justify-center space-y-8 px-4"
          >
            {/* Logo and Tagline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-5xl font-bold gradient-text"
              >
                DoItToday
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl text-[var(--text-secondary)] font-light"
              >
                Organize your day. Achieve more.
              </motion.p>
            </div>

            {/* Motivational Quote Section */}
            <div className="relative min-h-[120px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteKey}
                  variants={quoteVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex items-center"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[var(--accent-primary)]">
                      <FiSparkles className="w-5 h-5" />
                      <span className="text-sm font-medium uppercase tracking-wider">Daily Inspiration</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-light text-[var(--text-primary)] leading-relaxed">
                      "{currentQuote}"
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Decorative Elements */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex gap-2 mt-8"
            >
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[var(--accent-primary)]"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            variants={itemVariants}
            className="w-full"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-bold gradient-text mb-2"
              >
                DoItToday
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-base text-[var(--text-secondary)]"
              >
                Organize your day. Achieve more.
              </motion.p>
            </div>

            {/* Mobile Quote */}
            <div className="lg:hidden mb-8 text-center min-h-[80px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteKey}
                  variants={quoteVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute"
                >
                  <p className="text-lg font-light text-[var(--text-primary)] italic">
                    "{currentQuote}"
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Glassmorphism Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative backdrop-blur-xl bg-white/70 dark:bg-[var(--bg-secondary)]/80 border border-white/20 dark:border-[var(--border-color)]/50 rounded-2xl p-8 md:p-10 shadow-2xl"
              style={{
                boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.1)',
              }}
            >
              {/* Glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-50 -z-10" />

              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                    Welcome back
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    Sign in to continue your journey
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label
                      htmlFor="login-email"
                      className="block text-sm font-medium text-[var(--text-primary)]"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiMail className="w-5 h-5 text-[var(--text-tertiary)]" />
                      </div>
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) {
                            setErrors({ ...errors, email: '' });
                          }
                          setError('');
                        }}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 dark:bg-[var(--bg-tertiary)]/50 border ${
                          errors.email
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-[var(--border-color)] dark:border-[var(--border-color)]'
                        } text-[var(--text-primary)] placeholder-[var(--text-tertiary)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)]`}
                        placeholder="your@email.com"
                        required
                        autoComplete="email"
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                    </div>
                    {errors.email && (
                      <p
                        id="email-error"
                        className="text-sm text-red-600 dark:text-red-400"
                        role="alert"
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label
                      htmlFor="login-password"
                      className="block text-sm font-medium text-[var(--text-primary)]"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiLock className="w-5 h-5 text-[var(--text-tertiary)]" />
                      </div>
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) {
                            setErrors({ ...errors, password: '' });
                          }
                          setError('');
                        }}
                        className={`w-full pl-12 pr-12 py-3 rounded-xl bg-white/50 dark:bg-[var(--bg-tertiary)]/50 border ${
                          errors.password
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-[var(--border-color)] dark:border-[var(--border-color)]'
                        } text-[var(--text-primary)] placeholder-[var(--text-tertiary)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)]`}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        aria-invalid={errors.password ? 'true' : 'false'}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <FiEyeOff className="w-5 h-5" />
                        ) : (
                          <FiEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p
                        id="password-error"
                        className="text-sm text-red-600 dark:text-red-400"
                        role="alert"
                      >
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Forgot Password Link */}
                  <div className="flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full relative px-6 py-3.5 bg-[var(--accent-primary)] text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Log In</span>
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"
                      initial={false}
                    />
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border-color)]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/70 dark:bg-[var(--bg-secondary)]/80 text-[var(--text-secondary)]">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* OAuth Buttons */}
                <div className="space-y-3">
                  <motion.button
                    type="button"
                    onClick={() => {
                      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                      window.location.href = `${apiUrl.replace('/api', '')}/auth/google`;
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--border-color)] rounded-xl bg-white/50 dark:bg-[var(--bg-tertiary)]/50 hover:bg-white/70 dark:hover:bg-[var(--bg-tertiary)]/70 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="text-[var(--text-primary)] font-medium">Continue with Google</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => {
                      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                      window.location.href = `${apiUrl.replace('/api', '')}/auth/apple`;
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--border-color)] rounded-xl bg-black dark:bg-[var(--bg-tertiary)]/50 hover:bg-gray-900 dark:hover:bg-[var(--bg-tertiary)]/70 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <span className="text-white dark:text-[var(--text-primary)] font-medium">Continue with Apple</span>
                  </motion.button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center pt-4">
                  <p className="text-[var(--text-secondary)]">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="text-[var(--accent-primary)] hover:text-[var(--accent-hover)] font-medium transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
