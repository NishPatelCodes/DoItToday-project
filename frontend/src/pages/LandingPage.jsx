import { useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import MotivationSection from '../components/landing/MotivationSection';
import Footer from '../components/landing/Footer';
import ThemeToggle from '../components/landing/ThemeToggle';

/**
 * Landing Page Component
 * 
 * Professional landing page inspired by routine.co
 * Serves as the introduction to the DoItToday productivity app
 */
function LandingPage() {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)]">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <main id="main-content" className="relative">
        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* Motivation Section */}
        <MotivationSection />

        {/* Footer */}
        <Footer />
      </main>

      {/* Subtle background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

export default LandingPage;

