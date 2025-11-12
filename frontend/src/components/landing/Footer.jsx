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
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] py-12 md:py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary-500/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-8 md:mb-10">
          {/* Brand Section */}
          <div>
            <h3 className="text-xl md:text-2xl font-bold gradient-text mb-3 md:mb-4">
              DoItToday
            </h3>
            <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
              Your all-in-one productivity platform. Organize your day, 
              achieve your goals, and build better habits.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base md:text-lg font-semibold text-[var(--text-primary)] mb-3 md:mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.path}
                    className="text-sm md:text-base text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors duration-200 inline-block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-base md:text-lg font-semibold text-[var(--text-primary)] mb-3 md:mb-4">
              Connect
            </h4>
            <div className="flex gap-3 md:gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all duration-200"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 md:pt-8 border-t border-[var(--border-color)] text-center">
          <p className="text-xs md:text-sm text-[var(--text-secondary)]">
            © {currentYear} DoItToday. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

