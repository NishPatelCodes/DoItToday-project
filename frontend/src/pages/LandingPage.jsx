import { useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ProductShowcaseSection from '../components/landing/ProductShowcaseSection';
import DesktopPreviewSection from '../components/landing/DesktopPreviewSection';
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
    <div className="min-h-screen bg-[var(--bg-primary)]">
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

        {/* Product Showcase Section */}
        <ProductShowcaseSection />

        {/* Desktop Preview Section */}
        <DesktopPreviewSection />

        {/* Motivation Section */}
        <MotivationSection />

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}

export default LandingPage;

