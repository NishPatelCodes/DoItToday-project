import { motion } from 'framer-motion';
import { FiGithub, FiTwitter, FiMail } from 'react-icons/fi';

/**
 * Footer Component
 * 
 * Simple footer with app name, copyright, and quick links
 * Features clean, minimal design
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Features', path: '#features' },
    { name: 'About', path: '#about' },
    { name: 'Privacy', path: '#privacy' },
    { name: 'Terms', path: '#terms' },
  ];

  const socialLinks = [
    { icon: FiGithub, href: 'https://github.com', label: 'GitHub' },
    { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: FiMail, href: 'mailto:support@doittoday.com', label: 'Email' },
  ];

  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Apple-inspired subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-[var(--accent-primary)]/2 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mb-10 md:mb-12">
          {/* Brand Section - Apple-style typography */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold gradient-text mb-4 md:mb-5" style={{ letterSpacing: '-0.02em' }}>
              DoItToday
            </h3>
            <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed font-light" style={{ letterSpacing: '-0.01em', fontWeight: 300 }}>
              Your all-in-one productivity platform. Organize your day, 
              achieve your goals, and build better habits.
            </p>
          </div>

          {/* Quick Links - Apple-style */}
          <div>
            <h4 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-4 md:mb-5" style={{ letterSpacing: '-0.01em' }}>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.path}
                    className="text-base md:text-lg text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors duration-300 inline-block font-light"
                    style={{ letterSpacing: '-0.01em', fontWeight: 300 }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links - Apple-style */}
          <div>
            <h4 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-4 md:mb-5" style={{ letterSpacing: '-0.01em' }}>
              Connect
            </h4>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all duration-300"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Copyright - Apple-style */}
        <div className="pt-8 md:pt-10 border-t border-[var(--border-color)] text-center">
          <p className="text-sm md:text-base text-[var(--text-secondary)] font-light" style={{ letterSpacing: '-0.01em', fontWeight: 300 }}>
            © {currentYear} DoItToday. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

