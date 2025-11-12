import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import ThemeToggle from '../components/landing/ThemeToggle';
import {
  FiMail,
  FiLock,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiStar,
} from 'react-icons/fi';

/**
 * Login Page Component
 * 
 * Professional, futuristic, and elegant login page
 * Features refined glassmorphism, premium typography, and smooth animations
 * 
 * CUSTOMIZATION GUIDE:
 * - Quotes: Modify the quotes array below (lines 52-74)
 * - Colors: Update gradient colors in className strings
 * - Fonts: Already using Inter/Poppins from index.css
 * - Card size: Adjust max-w-lg, max-w-md classes for different breakpoints
 * - Animations: Modify transition durations in motion components
 */

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null); // 'google' or 'apple'
  const [currentQuote, setCurrentQuote] = useState('');
  const [quoteKey, setQuoteKey] = useState(0);
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login } = useAuthStore();
  const toast = useToast();

  // Motivational quotes - memoized for performance
  const quotes = useMemo(() => [
    "Small steps every day lead to big changes.",
    "You're one login away from a productive day.",
    "Clarity begins with action.",
    "Your future is created by what you do today.",
    "Progress, not perfection, is the goal.",
    "Every accomplishment starts with the decision to try.",
    "Focus on progress, not perfection.",
    "The best time to start was yesterday. The second best time is now.",
    "Success is the sum of small efforts repeated day in and day out.",
    "You don't have to be great to start, but you have to start to be great.",
    "What you get by achieving your goals is not as important as what you become.",
    "The way to get started is to quit talking and begin doing.",
    "Productivity is never an accident. It's always the result of commitment to excellence.",
    "Do something today that your future self will thank you for.",
    "The secret of getting ahead is getting started.",
    "Your limitation—it's only your imagination.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Push yourself, because no one else is going to do it for you.",
    "Wake up with determination. Go to bed with satisfaction.",
  ], []);

  // Initialize and rotate quotes
  useEffect(() => {
    const getRandomQuote = () => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      return quotes[randomIndex];
    };

    setCurrentQuote(getRandomQuote());
    
    const quoteInterval = setInterval(() => {
      setQuoteKey(prev => prev + 1);
      setCurrentQuote(getRandomQuote());
    }, 5000);

    return () => clearInterval(quoteInterval);
  }, [quotes]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map((e) => e.msg || e.message).join(', ');
        setError(errorMessages);
        toast.error(errorMessages);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
        toast.error(err.response.data.message);
      } else if (err.message === 'Network Error' || err.code === 'ERR_NETWORK' || !err.response) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const errorMsg = `Cannot connect to server at ${apiUrl}. Please check your connection and try again.`;
        setError(errorMsg);
        toast.error(errorMsg);
      } else {
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
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const quoteVariants = {
    enter: {
      opacity: 0,
      y: 15,
      scale: 0.95,
    },
    center: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -15,
      scale: 0.95,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-[var(--bg-primary)] dark:bg-gradient-to-br dark:from-[#0F0F1A] dark:via-[#1A1A2E] dark:to-[#0F0F1A] relative overflow-hidden transition-colors duration-300">
      {/* Enhanced animated background - More vibrant in dark mode */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs - Enhanced for dark mode */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15],
            x: [0, 40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-primary-500/8 dark:from-primary-500/15 via-purple-500/8 dark:via-purple-500/15 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.25, 0.1],
            x: [0, -40, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5,
          }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-purple-500/8 dark:from-purple-500/12 via-pink-500/8 dark:via-pink-500/12 to-transparent rounded-full blur-3xl"
        />
        {/* Additional dark mode accent orb */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.08, 0.18, 0.08],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[500px] md:h-[500px] bg-gradient-to-br from-cyan-500/5 dark:from-cyan-500/10 via-blue-500/5 dark:via-blue-500/10 to-transparent rounded-full blur-3xl hidden dark:block"
        />
        {/* Enhanced grid pattern overlay - More visible in dark mode */}
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.08] transition-opacity duration-300"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Dark mode gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-primary)]/50 dark:to-[#0F0F1A]/80 pointer-events-none" />
      </div>

      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-7xl mx-auto"
      >
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* Left Side - Motivational Content (Desktop) */}
          <motion.div
            variants={itemVariants}
            className="hidden lg:flex flex-col justify-center w-full max-w-md space-y-6 px-4"
          >
            {/* Logo and Tagline - Enhanced for dark mode */}
            <div className="space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl lg:text-5xl font-bold gradient-text tracking-tight"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                DoItToday
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg text-[var(--text-secondary)] dark:text-[#D1D5DB] font-normal leading-relaxed"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.01em' }}
              >
                Organize your day. Achieve more.
              </motion.p>
            </div>

            {/* Motivational Quote Section - Enhanced for dark mode */}
            <div className="relative min-h-[140px] flex items-center mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteKey}
                  variants={quoteVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex items-center"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 text-[var(--accent-primary)] dark:text-[#A5B4FC]">
                      <FiStar className="w-4 h-4 flex-shrink-0 drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]" />
                      <span 
                        className="text-xs font-semibold uppercase tracking-widest"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.1em' }}
                      >
                        Daily Inspiration
                      </span>
                    </div>
                    <p 
                      className="text-xl lg:text-2xl font-light text-[var(--text-primary)] dark:text-[#F5F5F5] leading-relaxed"
                      style={{ 
                        fontFamily: 'Inter, system-ui, sans-serif',
                        letterSpacing: '-0.02em',
                        lineHeight: '1.6'
                      }}
                    >
                      "{currentQuote}"
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-md lg:max-w-sm"
          >
            {/* Mobile Logo & Quote - Enhanced for dark mode */}
            <div className="lg:hidden text-center mb-8 space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold gradient-text tracking-tight"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                DoItToday
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-base text-[var(--text-secondary)] dark:text-[#D1D5DB] font-normal"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Organize your day. Achieve more.
              </motion.p>
              
              {/* Mobile Quote - Enhanced for dark mode */}
              <div className="relative min-h-[100px] flex items-center justify-center mt-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={quoteKey}
                    variants={quoteVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute"
                  >
                    <div className="space-y-2 text-center">
                      <div className="flex items-center justify-center gap-2 text-[var(--accent-primary)] dark:text-[#A5B4FC]">
                        <FiStar className="w-3.5 h-3.5 drop-shadow-[0_0_6px_rgba(129,140,248,0.4)]" />
                        <span 
                          className="text-xs font-semibold uppercase tracking-widest"
                          style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.1em' }}
                        >
                          Daily Inspiration
                        </span>
                      </div>
                      <p 
                        className="text-base font-light text-[var(--text-primary)] dark:text-[#F5F5F5] italic leading-relaxed px-4"
                        style={{ 
                          fontFamily: 'Inter, system-ui, sans-serif',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        "{currentQuote}"
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-md lg:max-w-sm"
          >
            {/* Mobile Logo & Quote - Enhanced for dark mode */}
            <div className="lg:hidden text-center mb-8 space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold gradient-text tracking-tight"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                DoItToday
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-base text-[var(--text-secondary)] dark:text-[#D1D5DB] font-normal"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Organize your day. Achieve more.
              </motion.p>
              
              {/* Mobile Quote - Enhanced for dark mode */}
              <div className="relative min-h-[100px] flex items-center justify-center mt-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={quoteKey}
                    variants={quoteVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute"
                  >
                    <div className="space-y-2 text-center">
                      <div className="flex items-center justify-center gap-2 text-[var(--accent-primary)] dark:text-[#A5B4FC]">
                        <FiStar className="w-3.5 h-3.5 drop-shadow-[0_0_6px_rgba(129,140,248,0.4)]" />
                        <span 
                          className="text-xs font-semibold uppercase tracking-widest"
                          style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.1em' }}
                        >
                          Daily Inspiration
                        </span>
                      </div>
                      <p 
                        className="text-base font-light text-[var(--text-primary)] dark:text-[#F5F5F5] italic leading-relaxed px-4"
                        style={{ 
                          fontFamily: 'Inter, system-ui, sans-serif',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        "{currentQuote}"
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
        </div>

            {/* Refined Login Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Enhanced Glassmorphism Card - Futuristic dark mode styling */}
              <div 
                className="relative backdrop-blur-2xl bg-white/90 dark:bg-[var(--bg-secondary)]/85 dark:backdrop-blur-3xl border border-white/50 dark:border-[var(--border-color)]/70 dark:border-[rgba(129,140,248,0.15)] rounded-2xl p-5 sm:p-6 lg:p-6 transition-all duration-300 login-card"
              >
                {/* Enhanced glow effect - More prominent in dark mode with animated pulse */}
                <motion.div 
                  className="absolute -inset-1 bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-pink-500/10 dark:from-primary-500/30 dark:via-purple-500/30 dark:to-pink-500/30 rounded-2xl blur-2xl -z-10"
                  animate={{
                    opacity: [0.4, 0.6, 0.4],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                {/* Additional inner glow for dark mode */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-primary-500/5 dark:to-primary-500/8 opacity-0 dark:opacity-100 pointer-events-none" />
                {/* Subtle border glow in dark mode */}
                <div className="absolute inset-0 rounded-2xl border border-primary-500/0 dark:border-primary-500/15 pointer-events-none" />

                <div className="space-y-6 relative z-10">
                  {/* Header - Enhanced contrast for dark mode */}
                  <div className="space-y-1.5">
                    <h2 
                      className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] dark:text-[#F5F5F5] tracking-tight"
                      style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.02em' }}
                    >
                      Welcome back
                    </h2>
                    <p 
                      className="text-sm sm:text-base text-[var(--text-secondary)] dark:text-[#D1D5DB] font-normal"
                      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                      Sign in to continue your journey
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Error Message - Small, clean, professional */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className="text-red-600 dark:text-red-400 text-sm px-2 py-1"
                          role="alert"
                          aria-live="polite"
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Email Input */}
                    <div className="space-y-2">
                      <label
                        htmlFor="login-email"
                        className="block text-sm font-semibold text-[var(--text-primary)] dark:text-[#E5E7EB]"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                      >
                        Email address
            </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiMail className="w-4 h-4 text-[var(--text-tertiary)] dark:text-[#9CA3AF] group-focus-within:text-[var(--accent-primary)] dark:group-focus-within:text-[#A5B4FC] transition-colors duration-200" />
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
                          className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/70 dark:bg-[var(--bg-tertiary)]/60 border-2 text-[var(--text-primary)] dark:text-[#F5F5F5] placeholder-[var(--text-tertiary)] dark:placeholder-[#6B7280] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 dark:focus:ring-[#818CF8]/40 focus:border-[var(--accent-primary)] dark:focus:border-[#818CF8] dark:focus:shadow-[0_0_0_3px_rgba(129,140,248,0.1)] ${
                            errors.email
                              ? 'border-red-400 dark:border-red-400 bg-red-50/50 dark:bg-red-900/30 dark:border-red-500/60'
                              : 'border-[var(--border-color)] dark:border-[#3D4A5C] hover:border-[var(--accent-primary)]/50 dark:hover:border-[#818CF8]/50'
                          }`}
                          placeholder="name@example.com"
              required
              autoComplete="email"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
                          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            />
                      </div>
                      {errors.email && (
                        <p
                          id="email-error"
                          className="text-sm text-red-600 dark:text-red-300 font-medium"
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
                        className="block text-sm font-semibold text-[var(--text-primary)] dark:text-[#E5E7EB]"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                      >
                        Password
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiLock className="w-4 h-4 text-[var(--text-tertiary)] dark:text-[#9CA3AF] group-focus-within:text-[var(--accent-primary)] dark:group-focus-within:text-[#A5B4FC] transition-colors duration-200" />
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
                          className={`w-full pl-11 pr-12 py-3 rounded-xl bg-white/70 dark:bg-[var(--bg-tertiary)]/60 border-2 text-[var(--text-primary)] dark:text-[#F5F5F5] placeholder-[var(--text-tertiary)] dark:placeholder-[#6B7280] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 dark:focus:ring-[#818CF8]/40 focus:border-[var(--accent-primary)] dark:focus:border-[#818CF8] dark:focus:shadow-[0_0_0_3px_rgba(129,140,248,0.1)] ${
                            errors.password
                              ? 'border-red-400 dark:border-red-400 bg-red-50/50 dark:bg-red-900/30 dark:border-red-500/60'
                              : 'border-[var(--border-color)] dark:border-[#3D4A5C] hover:border-[var(--accent-primary)]/50 dark:hover:border-[#818CF8]/50'
                          }`}
                          placeholder="••••••••"
                          required
                          autoComplete="current-password"
                          aria-invalid={errors.password ? 'true' : 'false'}
                          aria-describedby={errors.password ? 'password-error' : undefined}
                          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-tertiary)] dark:text-[#9CA3AF] hover:text-[var(--text-primary)] dark:hover:text-[#F5F5F5] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 dark:focus:ring-[#818CF8]/40 rounded-r-xl"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          tabIndex={0}
                        >
                          {showPassword ? (
                            <FiEyeOff className="w-4 h-4" />
                          ) : (
                            <FiEye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p
                          id="password-error"
                          className="text-sm text-red-600 dark:text-red-300 font-medium"
                          role="alert"
                        >
                          {errors.password}
                        </p>
                      )}
          </div>

                    {/* Forgot Password Link - Enhanced for dark mode */}
                    <div className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-[var(--accent-primary)] dark:text-[#A5B4FC] hover:text-[var(--accent-hover)] dark:hover:text-[#818CF8] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 dark:focus:ring-[#818CF8]/40 rounded-md px-1"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                      >
                        Forgot password?
                      </Link>
                    </div>

                    {/* Submit Button - Enhanced glow effect for dark mode */}
                    <motion.button
            type="submit"
            disabled={loading}
                      whileHover={loading ? {} : { scale: 1.02, y: -1 }}
                      whileTap={loading ? {} : { scale: 0.98 }}
                      className="w-full relative px-6 py-3.5 bg-[var(--accent-primary)] dark:bg-[#818CF8] text-white rounded-xl font-semibold text-base shadow-lg dark:shadow-[0_4px_14px_0_rgba(129,140,248,0.4)] hover:shadow-xl dark:hover:shadow-[0_6px_20px_0_rgba(129,140,248,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#818CF8] focus:ring-offset-2 dark:focus:ring-offset-[#1A1A2E]"
                      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                      aria-label={loading ? 'Signing in...' : 'Log in'}
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
                          <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                        </>
                      )}
                      {/* Enhanced glow effect - More prominent in dark mode */}
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 opacity-0 group-hover:opacity-100 dark:group-hover:opacity-80 transition-opacity duration-300 -z-10 blur-xl dark:blur-2xl"
                        initial={false}
                      />
                      {/* Subtle inner glow for dark mode */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/0 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </motion.button>
        </form>

                  {/* Divider - Enhanced for dark mode */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[var(--border-color)]/60 dark:border-[var(--border-color)]/50"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span 
                        className="px-4 bg-white/90 dark:bg-[var(--bg-secondary)]/85 text-[var(--text-secondary)] dark:text-[#D1D5DB] font-medium"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                      >
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* OAuth Buttons - Enhanced for dark mode */}
        <div className="space-y-3">
                    <motion.button
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
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-[var(--border-color)] dark:border-[#3D4A5C] rounded-xl bg-white/60 dark:bg-[var(--bg-tertiary)]/50 hover:bg-white/80 dark:hover:bg-[var(--bg-tertiary)]/70 transition-all duration-200 shadow-sm dark:shadow-[0_2px_8px_0_rgba(0,0,0,0.3)] hover:shadow-md dark:hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.4)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 dark:focus:ring-[#818CF8]/40"
                      aria-label="Continue with Google"
          >
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
                      <span 
                        className="text-[var(--text-primary)] dark:text-[#F5F5F5] font-semibold text-sm"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                      >
                        {oauthLoading === 'google' ? 'Redirecting...' : 'Continue with Google'}
                      </span>
                    </motion.button>

                    <motion.button
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
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-900 dark:border-[#4B5563] rounded-xl bg-gray-900 dark:bg-[#374151] hover:bg-black dark:hover:bg-[#4B5563] transition-all duration-200 shadow-sm dark:shadow-[0_2px_8px_0_rgba(0,0,0,0.4)] hover:shadow-md dark:hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.5)] focus:outline-none focus:ring-2 focus:ring-gray-400/30 dark:focus:ring-[#818CF8]/40"
                      aria-label="Continue with Apple"
          >
                      <svg className="w-5 h-5 flex-shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
                      <span 
                        className="text-white font-semibold text-sm"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                      >
                        {oauthLoading === 'apple' ? 'Redirecting...' : 'Continue with Apple'}
                      </span>
                    </motion.button>
        </div>

                  {/* Sign Up Link - Enhanced for dark mode */}
                  <div className="text-center pt-2">
                    <p 
                      className="text-sm text-[var(--text-secondary)] dark:text-[#D1D5DB]"
                      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
            Don't have an account?{' '}
                      <Link
                        to="/register"
                        className="font-semibold text-[var(--accent-primary)] dark:text-[#A5B4FC] hover:text-[var(--accent-hover)] dark:hover:text-[#818CF8] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 dark:focus:ring-[#818CF8]/40 rounded-md px-1"
                      >
              Sign up
            </Link>
          </p>
                  </div>
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
